import fetch from "node-fetch";
import { config } from "./config.js";

const EBIRD_API_BASE = "https://api.ebird.org/v2";

/**
 * Fetch recent observations within a radius
 */
export async function getRecentObservations(daysBack = 14) {
  const url = `${EBIRD_API_BASE}/data/obs/geo/recent?lat=${config.latitude}&lng=${config.longitude}&dist=${config.radiusKm}&back=${daysBack}`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": config.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `eBird API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Fetch recent notable observations (rare birds)
 */
export async function getNotableObservations(daysBack = 14) {
  const url = `${EBIRD_API_BASE}/data/obs/geo/recent/notable?lat=${config.latitude}&lng=${config.longitude}&dist=${config.radiusKm}&back=${daysBack}`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": config.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `eBird API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Fetch user's life list
 * Note: This requires the user's eBird username
 */
export async function getUserLifeList(username) {
  const url = `${EBIRD_API_BASE}/product/lists/${username}?r=world`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": config.apiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      console.warn(
        "User not found or life list not public. Proceeding without life list filter."
      );
      return [];
    }
    throw new Error(
      `eBird API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}
