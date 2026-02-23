/**
 * Hook to resolve the correct tax engine based on user's country of residence.
 */

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getCountryTaxConfig,
  usesNigeriaEngine,
  hasCountryTaxConfig,
} from "@/lib/tax/countries";
import { CountryTaxConfig } from "@/lib/tax/countryTypes";

export type TaxEngineType = "nigeria" | "country" | "unsupported";

interface UseCountryTaxEngineResult {
  /** Which engine type applies */
  engineType: TaxEngineType;
  /** Country name from profile */
  country: string | null;
  /** Country tax config (null for Nigeria or unsupported) */
  config: CountryTaxConfig | null;
  /** Whether this country has any tax support */
  isSupported: boolean;
  /** Whether we're still loading profile data */
  isLoading: boolean;
}

export function useCountryTaxEngine(): UseCountryTaxEngineResult {
  const { profile, loading } = useAuth();

  return useMemo(() => {
    const country = profile?.country_of_residence ?? null;

    if (!country) {
      return {
        engineType: "nigeria" as const,
        country: null,
        config: null,
        isSupported: true,
        isLoading: loading,
      };
    }

    if (usesNigeriaEngine(country)) {
      return {
        engineType: "nigeria" as const,
        country,
        config: null,
        isSupported: true,
        isLoading: loading,
      };
    }

    const config = getCountryTaxConfig(country);
    if (config) {
      return {
        engineType: "country" as const,
        country,
        config,
        isSupported: true,
        isLoading: loading,
      };
    }

    return {
      engineType: "unsupported" as const,
      country,
      config: null,
      isSupported: false,
      isLoading: loading,
    };
  }, [profile?.country_of_residence, loading]);
}
