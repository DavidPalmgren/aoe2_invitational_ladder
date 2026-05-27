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
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes

async function scrapePlayer(browser: any, player: Player): Promise<PlayerResult> {
  const page = await browser.newPage();

  try {
    await page.goto(player.url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await page.waitForSelector(".rating-big", {
      timeout: 10000,
    });

    const ratingText = await page.evaluate(() => {
      const el = document.querySelector(".rating-big");
      return el?.textContent?.trim() || null;
    });

    const rating = ratingText
      ? parseInt(ratingText.replace(/,/g, ""), 10)
      : null;

    await page.close();

    return {
      ...player,
      rating,
      last_updated: new Date().toISOString(),
    };
  } catch (err: any) {
    await page.close();

    return {
      ...player,
      rating: null,
      error: err?.message || "scrape failed",
      last_updated: new Date().toISOString(),
    };
  }
}

async function scrapeAllPlayers(context: any): Promise<PlayerResult[]> {
  if (!context.env.BROWSER) {
    throw new Error("Browser binding missing");
  }

  const browser = await puppeteer.launch(context.env.BROWSER);

  const results: PlayerResult[] = [];

  try {
    for (const player of PLAYERS) {
      const result = await scrapePlayer(browser, player);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return results;
}

export async function onRequestGet(context: any) {
  try {
    // 1. Try KV cache first
    const cached = await context.env.aoe2_data.get(CACHE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);

      const cacheAge =
        Date.now() - new Date(parsed.updated_at).getTime();

      // return cached data if still fresh
      if (cacheAge < CACHE_DURATION_MS) {
        return new Response(
          JSON.stringify(parsed, null, 2),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control":
                "public, s-maxage=300",
            },
          }
        );
      }
    }

    // 2. Cache missing/stale → scrape fresh data
    const results = await scrapeAllPlayers(context);

    const payload = {
      updated_at: new Date().toISOString(),
      players: results,
    };

    // 3. Save fresh data to KV
    await context.env.aoe2_data.put(
      CACHE_KEY,
      JSON.stringify(payload)
    );

    // 4. Return fresh data
    return new Response(
      JSON.stringify(payload, null, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "public, s-maxage=300",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify(
        {
          error:
            err?.message || "Internal server error",
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}