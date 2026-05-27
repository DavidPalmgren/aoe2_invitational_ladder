import puppeteer from "@cloudflare/puppeteer";

type Player = {
  name: string;
  game: string;
  url: string;
  twitch: string;
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

async function scrapePlayer(browser: any, player: Player) {
  const page = await browser.newPage();

  try {
    await page.goto(player.url, {
      waitUntil: "networkidle0",
    });

    // give JS time to render stats
    await page.waitForTimeout(3000);

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

export async function onRequestGet(context: any) {
  const browser = await puppeteer.launch(context.env.BROWSER);

  const results = [];

  // IMPORTANT: sequential scraping avoids bot detection + overload
  for (const player of PLAYERS) {
    const result = await scrapePlayer(browser, player);
    results.push(result);
  }

  await browser.close();

  results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return new Response(JSON.stringify(results, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300",
    },
  });
}