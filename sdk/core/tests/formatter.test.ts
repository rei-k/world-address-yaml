/**
 * @vey/core - Tests for formatter module
 */

import { describe, it, expect } from 'vitest';
import {
  formatAddress,
  formatShippingLabel,
  getPostalCodeExample,
  getPostalCodeRegex,
} from '../src/formatter';
import type { CountryAddressFormat, AddressInput } from '../src/types';

// Mock Japan format
const japanFormat: CountryAddressFormat = {
  name: {
    en: 'Japan',
  },
  iso_codes: {
    alpha2: 'JP',
    alpha3: 'JPN',
    numeric: '392',
  },
  languages: [
    {
      name: 'Japanese',
      script: 'Kanji',
      direction: 'ltr',
      role: 'official',
    },
  ],
  address_format: {
    order_variants: [
      {
        context: 'international',
        order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      },
    ],
    recipient: { required: true },
    street_address: { required: true },
    city: { required: true },
    province: { required: true, label_en: 'Prefecture' },
    postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$', example: '100-0001' },
    country: { required: true },
  },
};

describe('formatAddress', () => {
  it('should format address with comma separator', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatAddress(address, japanFormat);

    expect(result).toBe('John Doe, 1-1 Chiyoda, Chiyoda-ku, Tokyo, 100-0001, Japan');
  });

  it('should format address with custom separator', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatAddress(address, japanFormat, { separator: ' | ' });

    expect(result).toBe('John Doe | 1-1 Chiyoda | Chiyoda-ku | Tokyo | 100-0001 | Japan');
  });

  it('should exclude country when includeCountry is false', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatAddress(address, japanFormat, { includeCountry: false });

    expect(result).not.toContain('Japan');
    expect(result).toBe('John Doe, 1-1 Chiyoda, Chiyoda-ku, Tokyo, 100-0001');
  });

  it('should uppercase when option is set', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatAddress(address, japanFormat, { uppercase: true });

    expect(result).toBe('JOHN DOE, 1-1 CHIYODA, CHIYODA-KU, TOKYO, 100-0001, JAPAN');
  });

  it('should skip empty fields', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatAddress(address, japanFormat);

    // Should not have empty commas
    expect(result).not.toContain(',,');
    expect(result).toBe('John Doe, 1-1 Chiyoda, Chiyoda-ku, 100-0001, Japan');
  });
});

describe('formatShippingLabel', () => {
  it('should format address as multi-line shipping label', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      building: 'Vey Tower',
      floor: '12F',
      room: '1205',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatShippingLabel(address, japanFormat);

    expect(result).toContain('John Doe');
    expect(result).toContain('Vey Tower, 12F, Room 1205');
    expect(result).toContain('1-1 Chiyoda');
    expect(result).toContain('Chiyoda-ku, Tokyo, 100-0001');
    expect(result).toContain('JAPAN');
  });

  it('should handle address without building info', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = formatShippingLabel(address, japanFormat);
    const lines = result.split('\n');

    expect(lines[0]).toBe('John Doe');
    expect(lines[1]).toBe('1-1 Chiyoda');
    expect(lines).not.toContain('');
  });
});

describe('getPostalCodeExample', () => {
  it('should return postal code example', () => {
    const example = getPostalCodeExample(japanFormat);

    expect(example).toBe('100-0001');
  });

  it('should return undefined if no example', () => {
    const formatWithoutExample: CountryAddressFormat = {
      ...japanFormat,
      address_format: {
        ...japanFormat.address_format,
        postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$' },
      },
    };

    const example = getPostalCodeExample(formatWithoutExample);

    expect(example).toBeUndefined();
  });
});

describe('getPostalCodeRegex', () => {
  it('should return postal code regex', () => {
    const regex = getPostalCodeRegex(japanFormat);

    expect(regex).toBe('^[0-9]{3}-[0-9]{4}$');
  });

  it('should return undefined if no regex', () => {
    const formatWithoutRegex: CountryAddressFormat = {
      ...japanFormat,
      address_format: {
        ...japanFormat.address_format,
        postal_code: { required: true },
      },
    };

    const regex = getPostalCodeRegex(formatWithoutRegex);

    expect(regex).toBeUndefined();
  });
});
