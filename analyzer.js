import { getRecentObservations, getUserLifeList } from "./ebird-api.js";
import { config, validateConfig } from "./config.js";

/**
 * Group observations by species and analyze patterns
 */
function analyzeObservations(observations) {
  const speciesMap = new Map();

  for (const obs of observations) {
    const speciesCode = obs.speciesCode;
    const comName = obs.comName;
    const sciName = obs.sciName;
    const obsDate = obs.obsDt; // Format: YYYY-MM-DD HH:MM
    const observerId = obs.userDisplayName;
    const locationName = obs.locName;

    if (!speciesMap.has(speciesCode)) {
      speciesMap.set(speciesCode, {
        code: speciesCode,
        commonName: comName,
        scientificName: sciName,
        observations: [],
      });
    }

    speciesMap.get(speciesCode).observations.push({
      date: obsDate.split(" ")[0], // Extract just the date
      observer: observerId,
      location: locationName,
      howMany: obs.howMany || 1,
    });
  }

  return speciesMap;
}

/**
 * Check if a species meets the consecutive days criteria
 */
function meetsConsecutiveDaysCriteria(observations, minDays) {
  // Get unique dates and sort them
  const dates = [...new Set(observations.map((o) => o.date))].sort();

  if (dates.length < minDays) return false;

  // Check for consecutive days
  let consecutiveCount = 1;
  let maxConsecutive = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      consecutiveCount++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
    } else {
      consecutiveCount = 1;
    }
  }

  return maxConsecutive >= minDays;
}

/**
 * Count unique observers for a species
 */
function countUniqueObservers(observations) {
  return new Set(observations.map((o) => o.observer)).size;
}

/**
 * Filter species based on criteria
 */
function filterTargetBirds(
  speciesMap,
  minConsecutiveDays,
  minObservers,
  lifeList = []
) {
  const targetBirds = [];
  const lifeListCodes = new Set(lifeList.map((sp) => sp.speciesCode));

  for (const [code, species] of speciesMap) {
    // Skip if already on life list
    if (lifeListCodes.has(code)) {
      continue;
    }

    const uniqueObservers = countUniqueObservers(species.observations);
    const meetsConsecutiveDays = meetsConsecutiveDaysCriteria(
      species.observations,
      minConsecutiveDays
    );

    if (uniqueObservers >= minObservers && meetsConsecutiveDays) {
      targetBirds.push({
        ...species,
        uniqueObservers,
        totalSightings: species.observations.length,
        dates: [...new Set(species.observations.map((o) => o.date))].sort(),
        locations: [...new Set(species.observations.map((o) => o.location))],
      });
    }
  }

  // Sort by number of observers (descending)
  return targetBirds.sort((a, b) => b.uniqueObservers - a.uniqueObservers);
}

/**
 * Main function
 */
export async function findTargetBirds(ebirdUsername = null) {
  try {
    validateConfig();

    console.log("🔍 Searching for target birds...");
    console.log(
      `📍 Location: ${config.latitude}, ${config.longitude} (${config.radiusKm}km radius)`
    );
    console.log(
      `⚙️  Criteria: ${config.minConsecutiveDays}+ consecutive days, ${config.minObservers}+ observers\n`
    );

    // Fetch recent observations
    console.log("Fetching recent observations...");
    const observations = await getRecentObservations(config.daysBack);
    console.log(`Found ${observations.length} total observations\n`);

    // Fetch user's life list if username provided
    let lifeList = [];
    if (ebirdUsername) {
      console.log(`Fetching life list for ${ebirdUsername}...`);
      try {
        lifeList = await getUserLifeList(ebirdUsername);
        console.log(`Life list contains ${lifeList.length} species\n`);
      } catch (error) {
        console.warn(`Could not fetch life list: ${error.message}\n`);
      }
    }

    // Analyze and filter
    const speciesMap = analyzeObservations(observations);
    const targetBirds = filterTargetBirds(
      speciesMap,
      config.minConsecutiveDays,
      config.minObservers,
      lifeList
    );

    return targetBirds;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

/**
 * Display results
 */
export function displayResults(targetBirds) {
  if (targetBirds.length === 0) {
    console.log("❌ No target birds found matching your criteria.");
    return;
  }

  console.log(`✅ Found ${targetBirds.length} target bird(s):\n`);
  console.log("═".repeat(80));

  targetBirds.forEach((bird, index) => {
    console.log(`\n${index + 1}. ${bird.commonName} (${bird.scientificName})`);
    console.log(`   Species Code: ${bird.code}`);
    console.log(`   👥 Observers: ${bird.uniqueObservers}`);
    console.log(`   📊 Total Sightings: ${bird.totalSightings}`);
    console.log(`   📅 Dates Seen: ${bird.dates.join(", ")}`);
    console.log(`   📍 Locations (sample):`);
    bird.locations.slice(0, 3).forEach((loc) => {
      console.log(`      • ${loc}`);
    });
    if (bird.locations.length > 3) {
      console.log(
        `      ... and ${bird.locations.length - 3} more location(s)`
      );
    }
  });

  console.log("\n" + "═".repeat(80));
}
