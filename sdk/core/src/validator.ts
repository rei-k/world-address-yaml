/**
 * @vey/core - Address validator
 */

import type {
  CountryAddressFormat,
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AddressField,
} from './types';

/**
 * Validates an address against a country's format rules
 */
export function validateAddress(
  address: AddressInput,
  format: CountryAddressFormat
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const normalized: AddressInput = { ...address };

  const addressFormat = format.address_format;
  const fields = [
    'recipient',
    'building',
    'floor',
    'room',
    'unit',
    'street_address',
    'district',
    'ward',
    'city',
    'province',
    'postal_code',
    'country',
  ] as const;

  for (const field of fields) {
    const fieldDef = addressFormat[field] as AddressField | undefined;
    const value = address[field];

    if (fieldDef?.required && !value) {
      errors.push({
        field,
        code: 'REQUIRED_FIELD_MISSING',
        message: `${field} is required`,
      });
    }

    if (field === 'postal_code' && value && fieldDef?.regex) {
      const regex = new RegExp(fieldDef.regex);
      if (!regex.test(value)) {
        errors.push({
          field: 'postal_code',
          code: 'INVALID_POSTAL_CODE',
          message: `Postal code does not match expected format: ${fieldDef.regex}`,
        });
      }
    }

    // Normalize value by trimming whitespace
    if (value && typeof value === 'string') {
      normalized[field] = value.trim();
    }
  }

  // Check transliteration
  if (format.validation?.allow_latin_transliteration) {
    // Add warning if non-Latin characters detected but transliteration allowed
    for (const field of fields) {
      const value = address[field];
      if (value && /[^\x00-\x7F]/.test(value)) {
        warnings.push({
          field,
          code: 'NON_LATIN_CHARACTERS',
          message: `${field} contains non-Latin characters. Transliteration is recommended for international shipping.`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized,
  };
}

/**
 * Gets required fields for a country's address format
 */
export function getRequiredFields(format: CountryAddressFormat): string[] {
  const required: string[] = [];
  const addressFormat = format.address_format;
  const fields = [
    'recipient',
    'building',
    'floor',
    'room',
    'unit',
    'street_address',
    'district',
    'ward',
    'city',
    'province',
    'postal_code',
    'country',
  ] as const;

  for (const field of fields) {
    const fieldDef = addressFormat[field] as AddressField | undefined;
    if (fieldDef?.required) {
      required.push(field);
    }
  }

  return required;
}

/**
 * Gets the field order for a specific context
 */
export function getFieldOrder(
  format: CountryAddressFormat,
  context: 'domestic' | 'international' | 'postal' = 'international'
): string[] {
  const addressFormat = format.address_format;

  if (addressFormat.order) {
    return addressFormat.order;
  }

  if (addressFormat.order_variants) {
    const variant = addressFormat.order_variants.find(
      (v) => v.context === context
    );
    if (variant) {
      return variant.order;
    }
    // Fallback to first variant
    return addressFormat.order_variants[0]?.order ?? [];
  }

  return [
    'recipient',
    'street_address',
    'city',
    'province',
    'postal_code',
    'country',
  ];
}
