/**
 * Delivery Pricing Calculator
 * 配送料金計算アルゴリズム
 * 
 * Comprehensive pricing algorithm for delivery services based on:
 * - Weight and dimensions
 * - Distance and routing
 * - Service type (Standard/Express/Economy)
 * - Carrier-specific rates
 * - Regional adjustments
 * - Additional services (insurance, COD, etc.)
 */

import { Shipment, CargoItem } from '../types';
import { 
  PricingConfig, 
  PricingResult, 
  PricingBreakdown,
  ServiceType,
  RouteType,
  DistanceInfo
} from './types';
import { calculateDistance, getRouteType, getDimensionalWeight } from './utils';
import { EXCHANGE_RATES, TAX_RATES, DEFAULT_PRICING } from './constants';

/**
 * Main pricing calculator class
 */
export class PricingCalculator {
  private config: PricingConfig;

  constructor(config: PricingConfig) {
    this.config = config;
  }

  /**
   * Calculate total shipping cost for a shipment
   */
  calculate(shipment: Shipment): PricingResult {
    const breakdown: PricingBreakdown = {
      basePrice: 0,
      weightCharge: 0,
      distanceCharge: 0,
      serviceMultiplier: 1.0,
      fuelSurcharge: 0,
      insuranceCharge: 0,
      dimensionalWeightCharge: 0,
      regionalAdjustment: 0,
      taxAmount: 0,
      subtotal: 0,
      total: 0
    };

    // Calculate base price
    breakdown.basePrice = this.calculateBasePrice(shipment);

    // Calculate weight-based charge
    breakdown.weightCharge = this.calculateWeightCharge(shipment.items);

    // Calculate distance-based charge
    const distanceInfo = this.getDistanceInfo(shipment);
    breakdown.distanceCharge = this.calculateDistanceCharge(distanceInfo);

    // Apply service type multiplier
    const serviceType = this.getServiceType(shipment.deliveryRequirement);
    breakdown.serviceMultiplier = this.getServiceMultiplier(serviceType);

    // Calculate fuel surcharge
    breakdown.fuelSurcharge = this.calculateFuelSurcharge(
      breakdown.basePrice + breakdown.weightCharge + breakdown.distanceCharge
    );

    // Calculate insurance if requested
    if (shipment.insurance) {
      breakdown.insuranceCharge = this.calculateInsurance(
        shipment.insurance.value,
        shipment.insurance.currency
      );
    }

    // Calculate dimensional weight charge if applicable
    breakdown.dimensionalWeightCharge = this.calculateDimensionalWeightCharge(shipment.items);

    // Apply regional adjustment
    breakdown.regionalAdjustment = this.calculateRegionalAdjustment(
      shipment.sender.address.country,
      shipment.recipient.address.country
    );

    // Calculate subtotal
    breakdown.subtotal = 
      breakdown.basePrice +
      breakdown.weightCharge +
      breakdown.distanceCharge +
      breakdown.fuelSurcharge +
      breakdown.insuranceCharge +
      breakdown.dimensionalWeightCharge +
      breakdown.regionalAdjustment;

    // Apply service multiplier
    breakdown.subtotal *= breakdown.serviceMultiplier;

    // Calculate tax
    breakdown.taxAmount = this.calculateTax(
      breakdown.subtotal,
      shipment.recipient.address.country
    );

    // Calculate final total
    breakdown.total = breakdown.subtotal + breakdown.taxAmount;

    return {
      amount: Math.round(breakdown.total * 100) / 100, // Round to 2 decimal places
      currency: this.config.currency,
      breakdown,
      estimatedDays: this.estimateDeliveryDays(shipment, serviceType),
      serviceType,
      validUntil: new Date(Date.now() + this.config.quoteValidityHours * 60 * 60 * 1000)
    };
  }

  /**
   * Calculate base price based on carrier and route type
   */
  private calculateBasePrice(shipment: Shipment): number {
    const routeType = getRouteType(
      shipment.sender.address.country,
      shipment.recipient.address.country
    );

    if (routeType === 'international') {
      return this.config.internationalBase;
    }

    return this.config.domesticBase;
  }

  /**
   * Calculate weight-based charge
   */
  private calculateWeightCharge(items: CargoItem[]): number {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    
    // Progressive pricing based on weight brackets
    let charge = 0;
    const { weightBrackets } = this.config;

    for (const bracket of weightBrackets) {
      if (totalWeight > bracket.upTo) {
        if (bracket.upTo === Infinity) {
          charge += (totalWeight - bracket.from) * bracket.pricePerKg;
        } else {
          charge += (bracket.upTo - bracket.from) * bracket.pricePerKg;
        }
      } else {
        charge += Math.max(0, totalWeight - bracket.from) * bracket.pricePerKg;
        break;
      }
    }

    return charge;
  }

  /**
   * Calculate distance-based charge
   */
  private calculateDistanceCharge(distanceInfo: DistanceInfo): number {
    const { distance } = distanceInfo;
    const { distanceBrackets } = this.config;

    for (const bracket of distanceBrackets) {
      if (distance <= bracket.upTo) {
        return bracket.price;
      }
    }

    // If distance exceeds all brackets, use the last bracket's price plus extra
    const lastBracket = distanceBrackets[distanceBrackets.length - 1];
    const extraDistance = distance - lastBracket.upTo;
    return lastBracket.price + (extraDistance * this.config.pricePerExtraKm);
  }

  /**
   * Calculate fuel surcharge
   */
  private calculateFuelSurcharge(baseAmount: number): number {
    return baseAmount * this.config.fuelSurchargeRate;
  }

  /**
   * Calculate insurance charge
   */
  private calculateInsurance(value: number, currency: string): number {
    // Convert to base currency if needed
    const valueInBaseCurrency = this.convertCurrency(value, currency, this.config.currency);
    
    // Insurance is typically a percentage of declared value
    return valueInBaseCurrency * this.config.insuranceRate;
  }

  /**
   * Calculate dimensional weight charge
   */
  private calculateDimensionalWeightCharge(items: CargoItem[]): number {
    let charge = 0;

    for (const item of items) {
      if (item.volume) {
        const dimensionalWeight = getDimensionalWeight(item.volume, this.config.dimensionalFactor);
        const actualWeight = item.weight * item.quantity;
        
        // Only charge if dimensional weight exceeds actual weight
        if (dimensionalWeight > actualWeight) {
          const excessWeight = dimensionalWeight - actualWeight;
          charge += excessWeight * this.config.dimensionalWeightRate;
        }
      }
    }

    return charge;
  }

  /**
   * Calculate regional adjustment
   */
  private calculateRegionalAdjustment(originCountry: string, destCountry: string): number {
    const originAdjustment = this.config.regionalAdjustments[originCountry] || 0;
    const destAdjustment = this.config.regionalAdjustments[destCountry] || 0;
    
    return originAdjustment + destAdjustment;
  }

  /**
   * Calculate tax based on destination country
   */
  private calculateTax(amount: number, country: string): number {
    const taxRate = this.config.taxRates[country] || 0;
    return amount * taxRate;
  }

  /**
   * Get service type from delivery requirement
   */
  private getServiceType(requirement?: string): ServiceType {
    switch (requirement?.toUpperCase()) {
      case 'EXPRESS':
        return 'EXPRESS';
      case 'ECONOMY':
        return 'ECONOMY';
      default:
        return 'STANDARD';
    }
  }

  /**
   * Get service multiplier
   */
  private getServiceMultiplier(serviceType: ServiceType): number {
    return this.config.serviceMultipliers[serviceType] || 1.0;
  }

  /**
   * Estimate delivery days based on service type and distance
   */
  private estimateDeliveryDays(shipment: Shipment, serviceType: ServiceType): number {
    const distanceInfo = this.getDistanceInfo(shipment);
    const routeType = getRouteType(
      shipment.sender.address.country,
      shipment.recipient.address.country
    );

    let baseDays = 3; // Standard domestic delivery

    if (routeType === 'international') {
      baseDays = 7; // Standard international delivery
    }

    // Adjust based on distance
    if (distanceInfo.distance > 3000) {
      baseDays += 2;
    } else if (distanceInfo.distance > 1000) {
      baseDays += 1;
    }

    // Adjust based on service type
    switch (serviceType) {
      case 'EXPRESS':
        baseDays = Math.max(1, Math.floor(baseDays * 0.5));
        break;
      case 'ECONOMY':
        baseDays = Math.ceil(baseDays * 1.5);
        break;
    }

    return baseDays;
  }

  /**
   * Get distance information between sender and recipient
   */
  private getDistanceInfo(shipment: Shipment): DistanceInfo {
    const senderCoords = shipment.sender.address.coordinates;
    const recipientCoords = shipment.recipient.address.coordinates;

    let distance = 0;
    let method: 'coordinates' | 'estimated' = 'estimated';

    if (senderCoords && recipientCoords) {
      distance = calculateDistance(
        senderCoords.latitude,
        senderCoords.longitude,
        recipientCoords.latitude,
        recipientCoords.longitude
      );
      method = 'coordinates';
    } else {
      // Estimate based on country codes and route type
      const routeType = getRouteType(
        shipment.sender.address.country,
        shipment.recipient.address.country
      );
      distance = routeType === 'international' ? 2000 : 500; // Default estimates
    }

    return { distance, method };
  }

  /**
   * Convert currency (simplified - in production, use real exchange rates)
   */
  private convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency] || 1;
    return amount * rate;
  }

  /**
   * Update pricing configuration
   */
  updateConfig(config: Partial<PricingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<PricingConfig> {
    return { ...this.config };
  }
}

/**
 * Create a default pricing calculator with standard configuration
 */
export function createDefaultPricingCalculator(currency: string = 'USD'): PricingCalculator {
  const defaultConfig: PricingConfig = {
    currency,
    domesticBase: currency === 'JPY' ? 1000 : (currency === 'CNY' ? 12 : 10),
    internationalBase: currency === 'JPY' ? 5000 : (currency === 'CNY' ? 50 : 40),
    weightBrackets: [
      { from: 0, upTo: 1, pricePerKg: currency === 'JPY' ? 500 : (currency === 'CNY' ? 5 : 4) },
      { from: 1, upTo: 5, pricePerKg: currency === 'JPY' ? 400 : (currency === 'CNY' ? 4 : 3.5) },
      { from: 5, upTo: 10, pricePerKg: currency === 'JPY' ? 350 : (currency === 'CNY' ? 3.5 : 3) },
      { from: 10, upTo: 30, pricePerKg: currency === 'JPY' ? 300 : (currency === 'CNY' ? 3 : 2.5) },
      { from: 30, upTo: Infinity, pricePerKg: currency === 'JPY' ? 250 : (currency === 'CNY' ? 2.5 : 2) }
    ],
    distanceBrackets: [
      { upTo: 100, price: currency === 'JPY' ? 500 : (currency === 'CNY' ? 5 : 4) },
      { upTo: 500, price: currency === 'JPY' ? 1000 : (currency === 'CNY' ? 10 : 8) },
      { upTo: 1000, price: currency === 'JPY' ? 2000 : (currency === 'CNY' ? 20 : 15) },
      { upTo: 3000, price: currency === 'JPY' ? 4000 : (currency === 'CNY' ? 40 : 30) },
      { upTo: Infinity, price: currency === 'JPY' ? 8000 : (currency === 'CNY' ? 80 : 60) }
    ],
    pricePerExtraKm: currency === 'JPY' ? 2 : (currency === 'CNY' ? 0.02 : 0.015),
    fuelSurchargeRate: DEFAULT_PRICING.FUEL_SURCHARGE_RATE,
    insuranceRate: DEFAULT_PRICING.INSURANCE_RATE,
    dimensionalFactor: DEFAULT_PRICING.DIMENSIONAL_FACTOR,
    dimensionalWeightRate: currency === 'JPY' ? 300 : (currency === 'CNY' ? 3 : 2.5),
    serviceMultipliers: DEFAULT_PRICING.SERVICE_MULTIPLIERS,
    regionalAdjustments: DEFAULT_PRICING.REGIONAL_SURCHARGES,
    taxRates: TAX_RATES,
    quoteValidityHours: DEFAULT_PRICING.QUOTE_VALIDITY_HOURS
  };

  return new PricingCalculator(defaultConfig);
}
