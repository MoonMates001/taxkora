/**
 * Country Tax Configuration Registry
 * Maps country names to their tax configurations
 */

import { CountryTaxConfig } from "../countryTypes";
import { unitedStatesConfig } from "./unitedStates";
import { unitedKingdomConfig } from "./unitedKingdom";
import { indiaConfig } from "./india";
import { germanyConfig } from "./germany";
import { canadaConfig } from "./canada";
import { franceConfig } from "./france";
import { southAfricaConfig } from "./southAfrica";
import { uaeConfig } from "./uae";
import { saudiArabiaConfig } from "./saudiArabia";
import { singaporeConfig } from "./singapore";

/**
 * Registry of all supported country tax configurations.
 * Nigeria is excluded here — it uses the specialized engine in src/lib/tax/.
 */
export const COUNTRY_TAX_CONFIGS: Record<string, CountryTaxConfig> = {
  "United States": unitedStatesConfig,
  "United Kingdom": unitedKingdomConfig,
  "India": indiaConfig,
  "Germany": germanyConfig,
  "Canada": canadaConfig,
  "France": franceConfig,
  "South Africa": southAfricaConfig,
  "United Arab Emirates": uaeConfig,
  "Saudi Arabia": saudiArabiaConfig,
  "Singapore": singaporeConfig,
};

/** Countries with specialized engines (not using generic engine) */
export const SPECIALIZED_ENGINE_COUNTRIES = ["Nigeria"] as const;

/** Check if a country has a dedicated tax config */
export function hasCountryTaxConfig(countryName: string): boolean {
  return countryName in COUNTRY_TAX_CONFIGS || SPECIALIZED_ENGINE_COUNTRIES.includes(countryName as any);
}

/** Get a country's tax config, or null if not supported */
export function getCountryTaxConfig(countryName: string): CountryTaxConfig | null {
  return COUNTRY_TAX_CONFIGS[countryName] ?? null;
}

/** Get list of all supported countries */
export function getSupportedCountries(): string[] {
  return [...Object.keys(COUNTRY_TAX_CONFIGS), ...SPECIALIZED_ENGINE_COUNTRIES].sort();
}

/** Check if a country uses the specialized Nigeria engine */
export function usesNigeriaEngine(countryName: string): boolean {
  return countryName === "Nigeria";
}
