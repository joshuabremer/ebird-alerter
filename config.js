import dotenv from "dotenv";
dotenv.config();

export const config = {
  apiKey: process.env.EBIRD_API_KEY,
  latitude: parseFloat(process.env.LATITUDE),
  longitude: parseFloat(process.env.LONGITUDE),
  radiusKm: parseInt(process.env.RADIUS_KM) || 25,
  minConsecutiveDays: parseInt(process.env.MIN_CONSECUTIVE_DAYS) || 2,
  minObservers: parseInt(process.env.MIN_OBSERVERS) || 5,
  daysBack: parseInt(process.env.DAYS_BACK) || 14,
};

export function validateConfig() {
  const errors = [];

  if (!config.apiKey) errors.push("EBIRD_API_KEY is required");
  if (isNaN(config.latitude)) errors.push("LATITUDE must be a valid number");
  if (isNaN(config.longitude)) errors.push("LONGITUDE must be a valid number");
  if (config.radiusKm > 50) errors.push("RADIUS_KM cannot exceed 50");

  if (errors.length > 0) {
    throw new Error("Configuration errors:\n" + errors.join("\n"));
  }

  return true;
}
