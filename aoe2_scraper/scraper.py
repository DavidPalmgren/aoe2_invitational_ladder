import json
from datetime import datetime

from playwright.sync_api import sync_playwright

PLAYERS = [
    {
        "name": "Grubby",
        "game": "Warcraft 3",
        "url": "https://www.aoe2insights.com/user/1819870/",
        "twitch": "https://www.twitch.tv/grubby"
    },
    {
        "name": "Day9tv",
        "game": "StarCraft",
        "url": "https://www.aoe2insights.com/user/2065858/",
        "twitch": "https://www.twitch.tv/day9tv"
    },
    {
        "name": "Sing",
        "game": "Dota 2",
        "url": "https://www.aoe2insights.com/user/255573/",
        "twitch": "https://www.twitch.tv/singsing"
    },
    {
        "name": "DeathNote",
        "game": "Warcraft 3",
        "url": "https://www.aoe2insights.com/user/13667542/",  # id doesnt match cross sites?
        "twitch": "https://www.twitch.tv/followdeathnote"
        # https://www.ageofempires.com/stats/?profileId=6481045&game=age2&matchType=3
    },
    {
        "name": "Knoff",
        "game": "Warcraft 3",
        "url": "https://www.aoe2insights.com/user/228122/",
        "twitch": "https://www.twitch.tv/knoff"
    },
    {
        "name": "blud",
        "game": "CS:GO",
        "url": "https://www.ageofempires.com/stats/?profileId=705858&game=age2&matchType=3",
        "twitch": "https://www.twitch.tv/coopertv"
    },
    {
        "name": "LowkoTv"
        "game": "StarCraft",
        "url": "abc",
        "twitch": "https://www.twitch.tv/lowkotv"
    }
]

# Twitch channels
# https://www.twitch.tv/singsing
# https://www.twitch.tv/knoff
# https://www.twitch.tv/grubby
# https://www.twitch.tv/followdeathnote
# https://www.twitch.tv/day9tv
# GUNNAR UNKOWN AS OFF NOW
# https://www.twitch.tv/captainlance9 https://www.twitch.tv/captainlance9 https://www.twitch.tv/captainlance9 https://www.twitch.tv/captainlance9 <- this guy might be in it?


results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    for player in PLAYERS:
        print(f"Scraping {player['name']}...")

        try:
            page.goto(player["url"], timeout=60000)
            page.wait_for_selector(".rating-big", timeout=15000)
            
            rating_text = page.locator(".rating-big").first.inner_text()
            rating = int(rating_text.replace(",", ""))

            player_data = {
                "name": player["name"],
                "game": player["game"],
                "url": player["url"],
                "twitch": player["twitch"],
                "rating": rating,
                "last_updated": datetime.utcnow().isoformat()
            }

            results.append(player_data)

            print(f"✓ {player['name']} = {rating}")

        except Exception as e:
            print(f"✗ Failed for {player['name']}: {e}")

    browser.close()



results.sort(key=lambda x: x["rating"], reverse=True)

with open("player_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=4)

print("\nSaved player_data.json")