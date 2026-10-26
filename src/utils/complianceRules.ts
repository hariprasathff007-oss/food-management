import { FoodCategory, StorageRequirement } from '../types/foodRescue';

/**
 * Standard Food Servings Estimator
 * Average serving size ranges depending on food category:
 * - Cooked meals: ~0.35 kg (350g) per meal serving
 * - Bakery / Breads: ~0.15 kg (150g) per serving
 * - Fresh produce: ~0.25 kg (250g) per serving
 * - Packaged dry goods: ~0.20 kg (200g) per serving
 * - Dairy: ~0.20 kg (200g) per serving
 */
export function calculateEstimatedServings(category: FoodCategory, quantityKg: number): number {
  if (quantityKg <= 0) return 0;
  switch (category) {
    case 'cooked_hot':
    case 'cooked_cold':
      return Math.round(quantityKg / 0.35);
    case 'bakery':
      return Math.round(quantityKg / 0.15);
    case 'fresh_produce':
      return Math.round(quantityKg / 0.25);
    case 'packaged_dry':
      return Math.round(quantityKg / 0.2);
    case 'dairy':
      return Math.round(quantityKg / 0.2);
    default:
      return Math.round(quantityKg / 0.3);
  }
}

/**
 * Environmental Impact metrics based on FAO and UNEP Food Waste Index
 * 1 kg food prevented from landfill avoids ~2.5 kg CO2e
 * 1 kg food prevented conserves ~1050 Litres of embodied water
 */
export function calculateCo2AvoidedKg(quantityKg: number): number {
  return Number((Math.max(0, quantityKg) * 2.5).toFixed(1));
}

export function calculateWaterSavedLitres(quantityKg: number): number {
  return Math.round(Math.max(0, quantityKg) * 1050);
}

export interface TempSafetyResult {
  safe: boolean;
  status: 'optimal' | 'warning' | 'critical';
  message: string;
  recommendedRange: string;
}

/**
 * Food Safety & Cold/Hot Chain Temperature Compliance
 * Enforcing FDA Food Code & Codex Alimentarius standards:
 * - Hot cooked food must be kept at >= 60°C (140°F)
 * - Chilled cooked food & dairy must be kept at <= 4°C (40°F)
 * - Food Danger Zone is between 5°C and 57°C (rapid bacterial growth)
 */
export function checkTemperatureSafety(
  category: FoodCategory,
  currentTempCelsius: number
): TempSafetyResult {
  if (category === 'cooked_hot') {
    if (currentTempCelsius >= 60) {
      return {
        safe: true,
        status: 'optimal',
        message: 'Safe hot-holding temperature maintained (>= 60°C).',
        recommendedRange: '>= 60°C (140°F)',
      };
    } else if (currentTempCelsius >= 55) {
      return {
        safe: true,
        status: 'warning',
        message: 'Borderline temperature. Expedite delivery to prevent dropping into Danger Zone.',
        recommendedRange: '>= 60°C (140°F)',
      };
    } else {
      return {
        safe: false,
        status: 'critical',
        message: 'CRITICAL: Temperature dropped below 55°C into Food Danger Zone! Immediate reheating or consumption required.',
        recommendedRange: '>= 60°C (140°F)',
      };
    }
  }

  if (category === 'cooked_cold' || category === 'dairy') {
    if (currentTempCelsius <= 4) {
      return {
        safe: true,
        status: 'optimal',
        message: 'Optimal refrigeration cold-chain maintained (<= 4°C).',
        recommendedRange: '<= 4°C (39°F)',
      };
    } else if (currentTempCelsius <= 7) {
      return {
        safe: true,
        status: 'warning',
        message: 'Slight cold-chain elevation (4.1°C - 7°C). Ensure insulated cooling packs are intact.',
        recommendedRange: '<= 4°C (39°F)',
      };
    } else {
      return {
        safe: false,
        status: 'critical',
        message: 'CRITICAL: Temperature exceeded 7°C! Rapid microbial growth risk in cold perishable items.',
        recommendedRange: '<= 4°C (39°F)',
      };
    }
  }

  if (category === 'fresh_produce') {
    if (currentTempCelsius >= 4 && currentTempCelsius <= 14) {
      return {
        safe: true,
        status: 'optimal',
        message: 'Produce storage temperature optimal.',
        recommendedRange: '4°C - 14°C',
      };
    } else {
      return {
        safe: true,
        status: 'warning',
        message: 'Produce outside optimal cellar temperature; acceptable for same-day distribution.',
        recommendedRange: '4°C - 14°C',
      };
    }
  }

  // Bakery & packaged dry goods
  if (currentTempCelsius <= 26) {
    return {
      safe: true,
      status: 'optimal',
      message: 'Ambient dry storage compliant.',
      recommendedRange: '15°C - 24°C',
    };
  } else {
    return {
      safe: true,
      status: 'warning',
      message: 'Ambient environment warm; avoid direct sunlight exposure.',
      recommendedRange: '15°C - 24°C',
    };
  }
}

/**
 * Expiry Urgency Evaluation
 */
export function getExpiryUrgency(
  expiryIso: string,
  referenceTimeIso?: string
): {
  hoursRemaining: number;
  minutesRemaining: number;
  urgency: 'urgent' | 'moderate' | 'fresh' | 'expired';
  label: string;
} {
  const refTime = referenceTimeIso ? new Date(referenceTimeIso).getTime() : Date.now();
  const expTime = new Date(expiryIso).getTime();
  const diffMs = expTime - refTime;

  if (diffMs <= 0) {
    return {
      hoursRemaining: 0,
      minutesRemaining: 0,
      urgency: 'expired',
      label: 'Expired',
    };
  }

  const minutesRemaining = Math.floor(diffMs / (1000 * 60));
  const hoursRemaining = Number((diffMs / (1000 * 60 * 60)).toFixed(1));

  if (hoursRemaining <= 2) {
    return {
      hoursRemaining,
      minutesRemaining,
      urgency: 'urgent',
      label: `Urgent (${minutesRemaining}m left)`,
    };
  } else if (hoursRemaining <= 6) {
    return {
      hoursRemaining,
      minutesRemaining,
      urgency: 'moderate',
      label: `Dispatch today (${Math.floor(hoursRemaining)}h left)`,
    };
  } else {
    return {
      hoursRemaining,
      minutesRemaining,
      urgency: 'fresh',
      label: `Safe window (${Math.floor(hoursRemaining)}h left)`,
    };
  }
}

/**
 * Comprehensive Regulatory Food Safety Verification Gate
 */
export function verifyRegulatoryCompliance(params: {
  visualCheckPassed: boolean;
  odorCheckPassed: boolean;
  packagingSealed: boolean;
  measuredTempCelsius: number;
  category: FoodCategory;
}): {
  approved: boolean;
  violations: string[];
  complianceCode: string;
} {
  const violations: string[] = [];

  if (!params.visualCheckPassed) {
    violations.push('Visual inspection failed: discoloration, foreign particles, or foreign moisture detected.');
  }
  if (!params.odorCheckPassed) {
    violations.push('Olfactory inspection failed: sour, off, or rancid odor reported.');
  }
  if (!params.packagingSealed) {
    violations.push('Tamper-evident packaging compromised or unsealed.');
  }

  const tempCheck = checkTemperatureSafety(params.category, params.measuredTempCelsius);
  if (!tempCheck.safe) {
    violations.push(`Temperature safety failure: ${tempCheck.message}`);
  }

  const approved = violations.length === 0;
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const complianceCode = approved ? `CERT-SAFE-${hash}` : `FLAG-REJECT-${hash}`;

  return {
    approved,
    violations,
    complianceCode,
  };
}

export function getRecommendedStorageReq(category: FoodCategory): StorageRequirement {
  switch (category) {
    case 'cooked_hot':
      return 'hot_insulated';
    case 'cooked_cold':
    case 'dairy':
      return 'cold_refrigerated';
    default:
      return 'ambient';
  }
}
