import dotenv from "dotenv";
dotenv.config();

export interface Config {
  ebirdUsername: string;
  ebirdPassword: string;
}

export const config: Config = {
  ebirdUsername: process.env.EBIRD_USERNAME || "",
  ebirdPassword: process.env.EBIRD_PASSWORD || "",
};

export function validateConfig(): boolean {
  const errors: string[] = [];

  if (!config.ebirdUsername) errors.push("EBIRD_USERNAME is required");
  if (!config.ebirdPassword) errors.push("EBIRD_PASSWORD is required");

  if (errors.length > 0) {
    throw new Error("Configuration errors:\n" + errors.join("\n"));
  }

  return true;
}
