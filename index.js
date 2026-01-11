#!/usr/bin/env node

import { findTargetBirds, displayResults } from "./analyzer.js";

// Get eBird username from command line args (optional)
const ebirdUsername = process.argv[2] || process.env.EBIRD_USERNAME || null;

if (!ebirdUsername) {
  console.log(
    "💡 Tip: Provide your eBird username to filter out birds you've already seen:"
  );
  console.log("   node index.js YOUR_USERNAME\n");
  console.log("   Or add EBIRD_USERNAME to your .env file\n");
}

// Run the analysis
findTargetBirds(ebirdUsername)
  .then((targetBirds) => {
    displayResults(targetBirds);
  })
  .catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });
