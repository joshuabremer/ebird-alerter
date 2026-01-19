import puppeteer, { Browser, Page } from "puppeteer";
import { config } from "./config.js";

export interface BirdObservation {
  species: string;
  date: string;
  location: string;
  observer: string;
  isConfirmed: boolean;
  count: number;
  hasPicture: boolean;
  locationCode: string;
}

export interface RankedBird {
  species: string;
  score: number;
  confirmed: boolean;
  uniqueDays: number;
  uniqueLocations: number;
  uniqueObservers: number;
  totalObservations: number;
  observationsWithPictures: number;
  recentDate: string;
  locationCodes: string[];
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Login to eBird
 */
export async function loginToEBird(): Promise<Page> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  console.log("🔓 Logging in to eBird...");

  // Navigate to login page
  await page.goto("https://ebird.org/home?forceLogin=true&logout=true", {
    waitUntil: "networkidle2",
  });

  // Fill in credentials
  await page.type('input[name="username"]', config.ebirdUsername);
  await page.type('input[name="password"]', config.ebirdPassword);

  // Submit login form
  await page.click('input[type="submit"]');

  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("✅ Logged in successfully\n");

  return page;
}

/**
 * Get user's life list
 */
export async function getLifeList(page: Page): Promise<Set<string>> {
  console.log("📚 Fetching life list...");

  await page.goto("https://ebird.org/lifelist", {
    waitUntil: "networkidle2",
  });

  // Extract all species from the life list
  // Birds are in: li.Observation > div.Observation-species > h5.Heading > a > span.Heading-main
  const species = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("span.Heading-main"));
    return headings
      .map((el) => el.textContent?.trim() || "")
      .filter((s) => s && s.length > 0);
  });

  const lifeListSet = new Set(species);
  console.log(`Found ${lifeListSet.size} species on life list\n`);

  return lifeListSet;
}

/**
 * Get "Needs" birds with detailed observation data from a single location
 */
export async function getNeedsBirdsForLocation(
  page: Page,
  locationCode: string,
): Promise<BirdObservation[]> {
  console.log(`🎯 Fetching needs list for ${locationCode}...`);

  const needsUrl = `https://ebird.org/alert/needs/${locationCode}`;

  await page.goto(needsUrl, {
    waitUntil: "networkidle2",
  });

  // Wait for content to fully render
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Extract detailed observation data
  const observations = await page.evaluate((locationCode) => {
    const obs: BirdObservation[] = [];
    const observationDivs = document.querySelectorAll("div.Observation");

    observationDivs.forEach((div) => {
      // Extract species name
      const speciesHeading = div.querySelector("span.Heading-main");
      if (!speciesHeading) return;
      const species = speciesHeading.textContent?.trim() || "";

      // Extract confirmation status
      const tagsDiv = div.querySelector("div.Observation-tags");
      const isConfirmed = !tagsDiv?.textContent?.includes("UNCONFIRMED");

      // Extract date
      const dateLink = div.querySelector(
        "div.Observation-meta a[href*='/checklist/']",
      );
      const date = dateLink?.textContent?.trim() || "Unknown";

      // Extract location - look for any external link in the Observation-meta
      let location = "Unknown";
      const observationMetaDiv = div.querySelector("div.Observation-meta");
      if (observationMetaDiv) {
        const links = Array.from(observationMetaDiv.querySelectorAll("a"));
        for (const link of links) {
          const href = link.getAttribute("href") || "";
          // Look for a link that's either a maps link or has target="_blank"
          if (
            href.includes("maps") ||
            link.getAttribute("target") === "_blank"
          ) {
            location = link.textContent?.trim() || "Unknown";
            break;
          }
        }
      }

      // Extract observer - it's in a span after "Observer:" text
      // Get all spans within the Observation-meta divs
      let observer = "Unknown";
      const observationMeta = Array.from(
        div.querySelectorAll("div.Observation-meta"),
      );
      for (const metaDiv of observationMeta) {
        const spans = Array.from(metaDiv.querySelectorAll("span"));
        for (let i = 0; i < spans.length; i++) {
          if (spans[i].textContent?.includes("Observer:")) {
            // The next sibling span should be the observer name
            const nextSpan = spans[i + 1];
            if (nextSpan && !nextSpan.classList.contains("is-visuallyHidden")) {
              observer = nextSpan.textContent?.trim() || "Unknown";
              break;
            }
          }
        }
        if (observer !== "Unknown") break;
      }

      // Extract count (number observed)
      const countDiv = div.querySelector("div.Observation-numberObserved");
      const countText = countDiv?.textContent?.trim() || "1";
      const count = parseInt(countText, 10) || 1;

      // Check if observation has pictures
      // Look for images in the observation, media icons, or photo indicators
      let hasPicture = false;
      const hasImages = div.querySelector(
        "img[alt*='photo'], img[alt*='image']",
      );
      const hasPhotoIcon =
        div.textContent?.includes("photo") ||
        div.textContent?.includes("Photo");
      const hasMediaContainer = div.querySelector(
        "[class*='media'], [class*='photo'], [class*='image']",
      );
      hasPicture = !!(hasImages || hasPhotoIcon || hasMediaContainer);

      obs.push({
        species,
        date,
        location,
        observer,
        isConfirmed,
        count,
        hasPicture,
        locationCode,
      });
    });

    return obs;
  }, locationCode);

  console.log(
    `Found ${observations.length} total observations for ${locationCode}\n`,
  );
  return observations;
}

/**
 * Get "Needs" birds from multiple locations and aggregate the results
 */
export async function getNeedsBirds(
  page: Page,
  locationCodes: string[],
): Promise<BirdObservation[]> {
  const allObservations: BirdObservation[] = [];

  for (const locationCode of locationCodes) {
    const observations = await getNeedsBirdsForLocation(page, locationCode);
    allObservations.push(...observations);
  }

  console.log(`📊 Total aggregated observations: ${allObservations.length}\n`);
  return allObservations;
}

/**
 * Compare life list with needs birds and rank by likelihood of seeing them
 */
export function findMissingBirds(
  lifeList: Set<string>,
  observations: BirdObservation[],
): RankedBird[] {
  // Filter to only birds not on life list
  const missingObs = observations.filter((obs) => !lifeList.has(obs.species));

  // Group observations by species
  const speciesMap = new Map<string, BirdObservation[]>();
  missingObs.forEach((obs) => {
    if (!speciesMap.has(obs.species)) {
      speciesMap.set(obs.species, []);
    }
    speciesMap.get(obs.species)!.push(obs);
  });

  // Calculate scores for each species
  const rankedBirds: RankedBird[] = Array.from(speciesMap.entries()).map(
    ([species, obs]) => {
      // Metrics
      const uniqueDays = new Set(obs.map((o) => o.date)).size;
      const uniqueLocations = new Set(obs.map((o) => o.location)).size;
      const uniqueObservers = new Set(obs.map((o) => o.observer)).size;
      const confirmed = obs.some((o) => o.isConfirmed);
      const observationsWithPictures = obs.filter((o) => o.hasPicture).length;
      const recentDate = obs[0]?.date || "Unknown";
      const locationCodes = Array.from(new Set(obs.map((o) => o.locationCode)));

      // Scoring system - unbounded, weighted by observations and reliability
      let score = 0;

      // Number of observations (major factor)
      // Each observation adds 10 points
      score += obs.length * 10;

      // Confirmation status (multiplier)
      // Confirmed observations are more reliable
      const confirmationMultiplier = confirmed ? 1.5 : 0.5;
      score *= confirmationMultiplier;

      // Number of unique observers (adds credibility)
      // Each additional observer adds 8 points
      score += uniqueObservers * 8;

      // Multiple days observed (indicates bird is still in area)
      // Each day adds 5 points
      score += (uniqueDays - 1) * 5;

      // Location predictability
      // Single location is great (bird stays in same place)
      if (uniqueLocations === 1) {
        score += 20;
      }
      // Multiple locations is less predictable
      // But still worth points if the bird is being seen
      else {
        score += uniqueLocations * 2;
      }

      // Observations with pictures (very important for identification)
      // Each photo adds 15 points
      score += observationsWithPictures * 15;

      return {
        species,
        score: Math.round(score),
        confirmed,
        uniqueDays,
        uniqueLocations,
        uniqueObservers,
        totalObservations: obs.length,
        observationsWithPictures,
        recentDate,
        locationCodes,
      };
    },
  );

  // Sort by score (descending)
  rankedBirds.sort((a, b) => b.score - a.score);

  return rankedBirds;
}
