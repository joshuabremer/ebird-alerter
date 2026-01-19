#!/usr/bin/env node

import {
  loginToEBird,
  getLifeList,
  getNeedsBirds,
  findMissingBirds,
  closeBrowser,
} from "./ebird-scraper.js";
import { validateConfig } from "./config.js";

async function main() {
  try {
    validateConfig();

    console.log("🦅 eBird Target Birds Finder\n");

    // Login and get data
    const page = await loginToEBird();
    const lifeList = await getLifeList(page);
    const observations = await getNeedsBirds(page);

    // Rank by likelihood
    const rankedBirds = findMissingBirds(lifeList, observations);

    // Display results
    console.log("═".repeat(80));
    if (rankedBirds.length === 0) {
      console.log("✅ You've seen all the birds in your needs list!");
    } else {
      console.log(
        `🎯 Found ${rankedBirds.length} birds on your needs list (ranked by likelihood):\n`,
      );
      rankedBirds.forEach((bird, index) => {
        const status = bird.confirmed ? "✓" : "✗";
        console.log(
          `${index + 1}. ${bird.species.padEnd(30)} [${bird.score}] ${status}`,
        );
        console.log(
          `   └─ ${bird.totalObservations} observation(s) | ${bird.uniqueDays} day(s) | ${bird.uniqueLocations} location(s) | ${bird.uniqueObservers} observer(s) | ${bird.observationsWithPictures} picture(s)`,
        );
        console.log(`   └─ Last seen: ${bird.recentDate}`);
        console.log();
      });
    }
    console.log("═".repeat(80));

    await closeBrowser();
  } catch (error) {
    console.error("Fatal error:", (error as Error).message);
    await closeBrowser();
    process.exit(1);
  }
}

main();
