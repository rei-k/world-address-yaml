/**
 * Pricing Utilities
 * Utility functions for pricing calculations
 */

import { RouteType } from './types';
import { TAX_RATES, DISTANCE_ESTIMATES, CONTINENTAL_GROUPS } from './constants';

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Determine route type (domestic or international)
 */
export function getRouteType(originCountry: string, destCountry: string): RouteType {
  const normalizedOrigin = originCountry.toUpperCase();
  const normalizedDest = destCountry.toUpperCase();
  
  return normalizedOrigin === normalizedDest ? 'domestic' : 'international';
}

/**
 * Calculate dimensional weight from volume
 * 
 * @param volume - Volume in cubic meters (m³)
 * @param dimensionalFactor - Dimensional factor (default 5000 for cm³/kg)
 * @returns Dimensional weight in kg
 */
export function getDimensionalWeight(volume: number, dimensionalFactor: number = 5000): number {
  // Convert m³ to cm³
  const volumeInCm3 = volume * 1000000;
  
  // Calculate dimensional weight
  return volumeInCm3 / dimensionalFactor;
}

/**
 * Format price for display
 * 
 * @param amount - Price amount
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Round to specific decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage of a value
 */
export function calculatePercentage(value: number, percentage: number): number {
  return value * percentage;
}

/**
 * Apply discount to amount
 * 
 * @param amount - Original amount
 * @param discountPercentage - Discount percentage (0-1)
 * @returns Amount after discount
 */
export function applyDiscount(amount: number, discountPercentage: number): number {
  return amount * (1 - discountPercentage);
}

/**
 * Calculate total weight from items
 */
export function calculateTotalWeight(items: Array<{ weight: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
}

/**
 * Calculate total value from items
 */
export function calculateTotalValue(items: Array<{ value?: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + ((item.value || 0) * item.quantity), 0);
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Estimate distance between countries (simplified)
 * This is a fallback when coordinates are not available
 */
export function estimateDistanceBetweenCountries(
  country1: string,
  country2: string
): number {
  // Same country
  if (country1.toUpperCase() === country2.toUpperCase()) {
    return DISTANCE_ESTIMATES.DOMESTIC_AVERAGE;
  }

  const getContinent = (country: string): string | null => {
    for (const [continent, countries] of Object.entries(CONTINENTAL_GROUPS)) {
      if (countries.includes(country.toUpperCase())) {
        return continent;
      }
    }
    return null;
  };

  const continent1 = getContinent(country1);
  const continent2 = getContinent(country2);

  // Same continent
  if (continent1 && continent2 && continent1 === continent2) {
    return DISTANCE_ESTIMATES.INTRA_CONTINENTAL;
  }

  // Different continents
  return DISTANCE_ESTIMATES.INTER_CONTINENTAL;
}

/**
 * Get tax rate for a country
 * Uses centralized tax rate constants
 */
export function getTaxRateForCountry(countryCode: string): number {
  return TAX_RATES[countryCode.toUpperCase()] || 0;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if time is within peak hours
 */
export function isPeakHour(date: Date, peakStart: number, peakEnd: number): boolean {
  const hour = date.getHours();
  
  if (peakStart < peakEnd) {
    return hour >= peakStart && hour < peakEnd;
  } else {
    // Peak hours cross midnight
    return hour >= peakStart || hour < peakEnd;
  }
}

/**
 * Calculate business days between two dates
 */
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

/**
 * Add business days to a date
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}
