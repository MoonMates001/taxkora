/**
 * Nigeria Tax Act 2025/2026 - Unified Tax Engine
 * Exports all tax computation functions and types
 */

// Types
export * from "./types";

// Constants
export * from "./constants";

// Capital Allowance
export * from "./capitalAllowance";

// PIT for Sole Proprietors & Partnerships
export * from "./pitBusiness";

// CIT for Incorporated Companies
export * from "./cit";

// Re-export the original PIT engine for personal use
export { computeTax2026, calculatePIT2026 } from "../taxEngine2026";

import { BusinessTaxInput, BusinessTaxResult } from "./types";
import { computePITBusiness } from "./pitBusiness";
import { computeCIT } from "./cit";

/**
 * Main entry point for business tax computation
 * Automatically routes to PIT or CIT based on entity type
 */
export function computeBusinessTax(input: BusinessTaxInput): BusinessTaxResult {
  if (input.entityType === "limited_company") {
    return computeCIT(input);
  }
  return computePITBusiness(input);
}

/**
 * Determine which tax authority handles this entity
 */
export function getTaxAuthority(entityType: BusinessTaxInput["entityType"]): "SIRS" | "FIRS" {
  return entityType === "limited_company" ? "FIRS" : "SIRS";
}

/**
 * Get human-readable entity type label
 */
export function getEntityTypeLabel(entityType: BusinessTaxInput["entityType"]): string {
  switch (entityType) {
    case "sole_proprietorship":
      return "Sole Proprietorship";
    case "partnership":
      return "Partnership";
    case "limited_company":
      return "Limited Company (Ltd)";
    default:
      return "Unknown";
  }
}
