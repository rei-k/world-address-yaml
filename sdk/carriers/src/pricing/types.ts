/**
 * Pricing Types
 * Type definitions for the pricing calculator
 */

/**
 * Service types for delivery
 */
export type ServiceType = 'ECONOMY' | 'STANDARD' | 'EXPRESS';

/**
 * Route types
 */
export type RouteType = 'domestic' | 'international';

/**
 * Weight bracket for progressive pricing
 */
export interface WeightBracket {
  from: number;  // kg
  upTo: number;  // kg (can be Infinity for the last bracket)
  pricePerKg: number;
}

/**
 * Distance bracket for pricing
 */
export interface DistanceBracket {
  upTo: number;  // km (can be Infinity for the last bracket)
  price: number;
}

/**
 * Pricing configuration
 */
export interface PricingConfig {
  currency: string;
  domesticBase: number;
  internationalBase: number;
  weightBrackets: WeightBracket[];
  distanceBrackets: DistanceBracket[];
  pricePerExtraKm: number;
  fuelSurchargeRate: number;
  insuranceRate: number;
  dimensionalFactor: number;
  dimensionalWeightRate: number;
  serviceMultipliers: Record<ServiceType, number>;
  regionalAdjustments: Record<string, number>;
  taxRates: Record<string, number>;
  quoteValidityHours: number;
}

/**
 * Pricing breakdown
 */
export interface PricingBreakdown {
  basePrice: number;
  weightCharge: number;
  distanceCharge: number;
  serviceMultiplier: number;
  fuelSurcharge: number;
  insuranceCharge: number;
  dimensionalWeightCharge: number;
  regionalAdjustment: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

/**
 * Pricing result
 */
export interface PricingResult {
  amount: number;
  currency: string;
  breakdown: PricingBreakdown;
  estimatedDays: number;
  serviceType: ServiceType;
  validUntil: Date;
}

/**
 * Distance information
 */
export interface DistanceInfo {
  distance: number; // km
  method: 'coordinates' | 'estimated';
}

/**
 * Zone-based pricing configuration
 */
export interface ZonePricingConfig {
  zones: {
    id: string;
    name: string;
    countries: string[];
  }[];
  zoneMatrix: Record<string, Record<string, number>>; // from zone -> to zone -> base price
}

/**
 * Time-based pricing multiplier
 */
export interface TimeBasedPricing {
  peakHours?: {
    start: number; // hour (0-23)
    end: number;   // hour (0-23)
    multiplier: number;
  };
  weekendMultiplier?: number;
  holidayMultiplier?: number;
}

/**
 * Promotional discount
 */
export interface PromotionalDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  applicableServices?: ServiceType[];
}

/**
 * Volume discount tier
 */
export interface VolumeDiscountTier {
  minShipments: number;
  discountPercentage: number;
}
