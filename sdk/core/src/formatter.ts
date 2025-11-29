/**
 * @vey/core - Address formatter
 */

import type {
  CountryAddressFormat,
  AddressInput,
} from './types';
import { getFieldOrder } from './validator';

export interface FormatOptions {
  context?: 'domestic' | 'international' | 'postal';
  separator?: string;
  includeCountry?: boolean;
  uppercase?: boolean;
}

/**
 * Formats an address according to country format
 */
export function formatAddress(
  address: AddressInput,
  format: CountryAddressFormat,
  options: FormatOptions = {}
): string {
  const {
    context = 'international',
    separator = ', ',
    includeCountry = true,
    uppercase = false,
  } = options;

  const order = getFieldOrder(format, context);
  const parts: string[] = [];

  for (const field of order) {
    if (field === 'country' && !includeCountry) {
      continue;
    }

    const value = address[field as keyof AddressInput];
    if (value) {
      parts.push(value);
    }
  }

  let formatted = parts.join(separator);

  if (uppercase) {
    formatted = formatted.toUpperCase();
  }

  return formatted;
}

/**
 * Formats an address for shipping label
 */
export function formatShippingLabel(
  address: AddressInput,
  format: CountryAddressFormat
): string {
  const lines: string[] = [];

  // Recipient always first
  if (address.recipient) {
    lines.push(address.recipient);
  }

  // Building/floor/room if present
  const buildingParts: string[] = [];
  if (address.building) buildingParts.push(address.building);
  if (address.floor) buildingParts.push(address.floor);
  if (address.room) buildingParts.push(`Room ${address.room}`);
  if (buildingParts.length > 0) {
    lines.push(buildingParts.join(', '));
  }

  // Street address
  if (address.street_address) {
    lines.push(address.street_address);
  }

  // District/ward
  if (address.district) {
    lines.push(address.district);
  }
  if (address.ward) {
    lines.push(address.ward);
  }

  // City, Province, Postal code
  const cityLine: string[] = [];
  if (address.city) cityLine.push(address.city);
  if (address.province) cityLine.push(address.province);
  if (address.postal_code) cityLine.push(address.postal_code);
  if (cityLine.length > 0) {
    lines.push(cityLine.join(', '));
  }

  // Country
  if (address.country) {
    lines.push(address.country.toUpperCase());
  }

  return lines.join('\n');
}

/**
 * Generates postal code example for a country
 */
export function getPostalCodeExample(format: CountryAddressFormat): string | undefined {
  return format.address_format.postal_code?.example;
}

/**
 * Gets postal code regex pattern for a country
 */
export function getPostalCodeRegex(format: CountryAddressFormat): string | undefined {
  return format.address_format.postal_code?.regex;
}
