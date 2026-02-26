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
import { chinaConfig } from "./china";
import { japanConfig } from "./japan";
import { italyConfig } from "./italy";
import { brazilConfig } from "./brazil";
import { russiaConfig } from "./russia";
import { southKoreaConfig } from "./southKorea";
import { australiaConfig } from "./australia";
import { spainConfig } from "./spain";
import { mexicoConfig } from "./mexico";
import { indonesiaConfig } from "./indonesia";
import { netherlandsConfig } from "./netherlands";
import { turkeyConfig } from "./turkey";
import { switzerlandConfig } from "./switzerland";
import { polandConfig } from "./poland";
import { taiwanConfig } from "./taiwan";
import { belgiumConfig } from "./belgium";
import { swedenConfig } from "./sweden";
import { argentinaConfig } from "./argentina";
import { irelandConfig } from "./ireland";
import { thailandConfig } from "./thailand";
import { israelConfig } from "./israel";
import { philippinesConfig } from "./philippines";
import { malaysiaConfig } from "./malaysia";
import { vietnamConfig } from "./vietnam";
import { colombiaConfig } from "./colombia";
import { chileConfig } from "./chile";
import { bangladeshConfig } from "./bangladesh";
import { norwayConfig } from "./norway";
import { austriaConfig } from "./austria";
import { egyptConfig } from "./egypt";
import { denmarkConfig } from "./denmark";
import { greeceConfig } from "./greece";
import { finlandConfig } from "./finland";
import { romaniaConfig } from "./romania";
import { portugalConfig } from "./portugal";
import { czechRepublicConfig } from "./czechRepublic";
import { peruConfig } from "./peru";
import { kazakhstanConfig } from "./kazakhstan";

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
  "China": chinaConfig,
  "Japan": japanConfig,
  "Italy": italyConfig,
  "Brazil": brazilConfig,
  "Russia": russiaConfig,
  "South Korea": southKoreaConfig,
  "Australia": australiaConfig,
  "Spain": spainConfig,
  "Mexico": mexicoConfig,
  "Indonesia": indonesiaConfig,
  "Netherlands": netherlandsConfig,
  "Turkey": turkeyConfig,
  "Switzerland": switzerlandConfig,
  "Poland": polandConfig,
  "Taiwan": taiwanConfig,
  "Belgium": belgiumConfig,
  "Sweden": swedenConfig,
  "Argentina": argentinaConfig,
  "Ireland": irelandConfig,
  "Thailand": thailandConfig,
  "Israel": israelConfig,
  "Philippines": philippinesConfig,
  "Malaysia": malaysiaConfig,
  "Vietnam": vietnamConfig,
  "Colombia": colombiaConfig,
  "Chile": chileConfig,
  "Bangladesh": bangladeshConfig,
  "Norway": norwayConfig,
  "Austria": austriaConfig,
  "Egypt": egyptConfig,
  "Denmark": denmarkConfig,
  "Greece": greeceConfig,
  "Finland": finlandConfig,
  "Romania": romaniaConfig,
  "Portugal": portugalConfig,
  "Czech Republic": czechRepublicConfig,
  "Peru": peruConfig,
  "Kazakhstan": kazakhstanConfig,
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
