import puppeteer from "@cloudflare/puppeteer";

type Player = {
  name: string;
  game: string;
  url: string;
  twitch: string;
};

type PlayerResult = Player & {
  rating: number | null;
  error?: string;
  last_updated: string;
};

const PLAYERS: Player[] = [
  {
    name: "Grubby",
    game: "Warcraft 3",
    url: "https://www.aoe2insights.com/user/1819870/",
    twitch: "https://www.twitch.tv/grubby",
  },
  {
    name: "Day9tv",
    game: "StarCraft",
    url: "https://www.aoe2insights.com/user/2065858/",
    twitch: "https://www.twitch.tv/day9tv",
  },
  {
    name: "Sing",
    game: "Dota 2",
    url: "https://www.aoe2insights.com/user/255573/",
    twitch: "https://www.twitch.tv/singsing",
  },
];

const CACHE_KEY = "leaderboard";
const CACHE_DURATION_MS = 1000 * 60 * 30;

async function scrapePlayer(browser: any, player: Player): Promise<PlayerResult> {
  const page = await browser.newPage();

  try {
    console.log("➡️ Visiting:", player.name);

    await page.goto(player.url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(5000);

    const result = await page.evaluate(() => {
      const el =
        document.querySelector(".rating-big") ||
        document.querySelector("[class*='rating']");

      return el?.textContent?.trim() || null;
    });

    const rating = result
      ? parseInt(result.replace(/,/g, ""), 10)
      : null;

    console.log("✅ Scraped:", player.name, rating);

    await page.close();

    return {
      ...player,
      rating,
      last_updated: new Date().toISOString(),
    };
  } catch (err: any) {
    console.log("❌ Scrape failed:", player.name, err?.message);

    try {
      await page.close();
    } catch {}

    return {
      ...player,
      rating: null,
      error: err?.message || "scrape failed",
      last_updated: new Date().toISOString(),
    };
  }
}

async function scrapeAllPlayers(context: any): Promise<PlayerResult[]> {
  console.log("🚀 scrapeAllPlayers START");

  if (!context.env.BROWSER) {
    throw new Error("Browser binding missing");
  }

  console.log("🧠 BROWSER binding OK");

  const browser = await puppeteer.launch(context.env.BROWSER);

  console.log("🌐 Browser launched");

  const results: PlayerResult[] = [];

  try {
    for (const player of PLAYERS) {
      const result = await scrapePlayer(browser, player);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  const valid = results.filter(r => r.rating !== null);

  console.log("📊 Valid results:", valid.length, "/", results.length);

  results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return results;
}

export async function onRequestGet(context: any) {
  try {
    console.log("📥 API HIT");

    const cached = await context.env.aoe2_data.get(CACHE_KEY);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const updatedAt = new Date(parsed.updated_at).getTime();
        const cacheAge = Date.now() - updatedAt;

        const valid =
          parsed.updated_at &&
          !isNaN(updatedAt) &&
          cacheAge < CACHE_DURATION_MS;

        if (valid) {
          console.log("⚡ Returning cache");
          return new Response(JSON.stringify(parsed, null, 2), {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, s-maxage=300",
            },
          });
        }
      } catch {
        console.log("⚠️ Broken cache ignored");
      }
    }

    console.log("🔄 Cache expired → scraping");

    const results = await scrapeAllPlayers(context);

    const validPlayers = results.filter(p => p.rating !== null);

    console.log("💾 Writing KV...");

    if (validPlayers.length === 0) {
      console.log("❌ No valid data → skipping KV write");

      return new Response(
        JSON.stringify({
          updated_at: new Date().toISOString(),
          players: results,
          warning: "No valid scraped data",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = {
      updated_at: new Date().toISOString(),
      players: results,
    };

    await context.env.aoe2_data.put(
      CACHE_KEY,
      JSON.stringify(payload)
    );

    console.log("✅ KV WRITE DONE");

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300",
      },
    });

  } catch (err: any) {
    console.log("🔥 API ERROR:", err?.message);

    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500 }
    );
  }
}