/**
 * @vey/core - Tests for PID (Place ID) module
 */

import { describe, it, expect } from 'vitest';
import {
  encodePID,
  decodePID,
  validatePID,
  createPID,
  parsePID,
  generatePIDFromAddress,
  addCollisionCounter,
  removeCollisionCounter,
  extractPIDPath,
  comparePIDHierarchy,
  isPIDParent,
  getPIDDepth,
  createWaybillPayload,
} from '../src/pid';
import type { PIDComponents, NormalizedAddress } from '../src/types';

describe('encodePID', () => {
  it('should encode full PID components', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
      admin2: '113',
      locality: '01',
      sublocality: 'T07',
      block: 'B12',
      building: 'BN02',
      unit: 'R342',
    };

    const pid = encodePID(components);
    expect(pid).toBe('JP-13-113-01-T07-B12-BN02-R342');
  });

  it('should encode partial PID components', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
      admin2: '113',
    };

    const pid = encodePID(components);
    expect(pid).toBe('JP-13-113');
  });

  it('should encode country-only PID', () => {
    const components: PIDComponents = {
      country: 'JP',
    };

    const pid = encodePID(components);
    expect(pid).toBe('JP');
  });

  it('should convert to uppercase', () => {
    const components: PIDComponents = {
      country: 'jp',
      admin1: '13',
    };

    const pid = encodePID(components);
    expect(pid).toBe('JP-13');
  });

  it('should throw error if country is missing', () => {
    const components: PIDComponents = {
      country: '',
    };

    expect(() => encodePID(components)).toThrow('Country code is required');
  });

  it('should add collision counter when specified', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
    };

    const pid = encodePID(components, { collisionCounter: 1 });
    expect(pid).toBe('JP-13-C01');
  });

  it('should format collision counter with leading zero', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
    };

    const pid = encodePID(components, { collisionCounter: 5 });
    expect(pid).toBe('JP-13-C05');
  });

  it('should throw error for invalid collision counter', () => {
    const components: PIDComponents = {
      country: 'JP',
    };

    expect(() => encodePID(components, { collisionCounter: 0 })).toThrow();
    expect(() => encodePID(components, { collisionCounter: 100 })).toThrow();
  });

  it('should include collision from components', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
      collision: 'C01',
    };

    const pid = encodePID(components);
    expect(pid).toBe('JP-13-C01');
  });
});

describe('decodePID', () => {
  it('should decode full PID', () => {
    const components = decodePID('JP-13-113-01-T07-B12-BN02-R342');

    expect(components.country).toBe('JP');
    expect(components.admin1).toBe('13');
    expect(components.admin2).toBe('113');
    expect(components.locality).toBe('01');
    expect(components.sublocality).toBe('T07');
    expect(components.block).toBe('B12');
    expect(components.building).toBe('BN02');
    expect(components.unit).toBe('R342');
  });

  it('should decode partial PID', () => {
    const components = decodePID('JP-13-113');

    expect(components.country).toBe('JP');
    expect(components.admin1).toBe('13');
    expect(components.admin2).toBe('113');
    expect(components.locality).toBeUndefined();
  });

  it('should decode country-only PID', () => {
    const components = decodePID('JP');

    expect(components.country).toBe('JP');
    expect(components.admin1).toBeUndefined();
  });

  it('should handle collision suffix', () => {
    const components = decodePID('JP-13-113-C01');

    expect(components.country).toBe('JP');
    expect(components.admin1).toBe('13');
    expect(components.admin2).toBe('113');
    expect(components.collision).toBe('C01');
  });

  it('should convert to uppercase', () => {
    const components = decodePID('jp-13-113');

    expect(components.country).toBe('JP');
    expect(components.admin1).toBe('13');
    expect(components.admin2).toBe('113');
  });

  it('should throw error for empty string', () => {
    expect(() => decodePID('')).toThrow();
  });

  it('should throw error for null/undefined', () => {
    expect(() => decodePID(null as unknown as string)).toThrow();
    expect(() => decodePID(undefined as unknown as string)).toThrow();
  });
});

describe('validatePID', () => {
  it('should validate correct PID', () => {
    const result = validatePID('JP-13-113-01-T07-B12-BN02-R342');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.components).toBeDefined();
    expect(result.components?.country).toBe('JP');
  });

  it('should validate country-only PID', () => {
    const result = validatePID('JP');

    expect(result.valid).toBe(true);
    expect(result.components?.country).toBe('JP');
  });

  it('should validate PID with collision suffix', () => {
    const result = validatePID('JP-13-113-C01');

    expect(result.valid).toBe(true);
    expect(result.components?.collision).toBe('C01');
  });

  it('should reject empty string', () => {
    const result = validatePID('');

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'EMPTY_PID')).toBe(true);
  });

  it('should reject invalid country code', () => {
    const result = validatePID('JPN-13-113');

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_COUNTRY_CODE')).toBe(true);
  });

  it('should reject single letter country code', () => {
    const result = validatePID('J-13-113');

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_COUNTRY_CODE')).toBe(true);
  });

  it('should reject invalid characters', () => {
    const result = validatePID('JP-13@-113');

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_CHARACTERS')).toBe(true);
  });

  it('should accept lowercase and convert to uppercase', () => {
    const result = validatePID('jp-13-113');

    expect(result.valid).toBe(true);
    expect(result.components?.country).toBe('JP');
  });

  it('should accept US format PID', () => {
    const result = validatePID('US-CA-90210-MAIN-B001-APT5');

    expect(result.valid).toBe(true);
    expect(result.components?.country).toBe('US');
  });
});

describe('createPID', () => {
  it('should create AddressPID object', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
      admin2: '113',
    };

    const addressPid = createPID(components);

    expect(addressPid.pid).toBe('JP-13-113');
    expect(addressPid.components).toEqual(components);
    expect(addressPid.validated).toBe(true);
  });

  it('should create AddressPID with collision counter', () => {
    const components: PIDComponents = {
      country: 'JP',
      admin1: '13',
    };

    const addressPid = createPID(components, { collisionCounter: 3 });

    expect(addressPid.pid).toBe('JP-13-C03');
  });
});

describe('parsePID', () => {
  it('should parse valid PID string', () => {
    const addressPid = parsePID('JP-13-113-01');

    expect(addressPid.pid).toBe('JP-13-113-01');
    expect(addressPid.components.country).toBe('JP');
    expect(addressPid.validated).toBe(true);
  });

  it('should throw for invalid PID', () => {
    expect(() => parsePID('')).toThrow();
    expect(() => parsePID('INVALID')).toThrow('Invalid PID');
  });
});

describe('generatePIDFromAddress', () => {
  it('should generate PID from normalized address', () => {
    const address: NormalizedAddress = {
      countryCode: 'JP',
      admin1: '13',
      admin2: '113',
      locality: '01',
      sublocality: 'T07',
      block: 'B12',
      building: 'BN02',
      unit: 'R342',
    };

    const pid = generatePIDFromAddress(address);
    expect(pid).toBe('JP-13-113-01-T07-B12-BN02-R342');
  });

  it('should generate partial PID', () => {
    const address: NormalizedAddress = {
      countryCode: 'US',
      admin1: 'CA',
      admin2: '90210',
    };

    const pid = generatePIDFromAddress(address);
    expect(pid).toBe('US-CA-90210');
  });

  it('should generate PID with collision counter', () => {
    const address: NormalizedAddress = {
      countryCode: 'JP',
      admin1: '13',
    };

    const pid = generatePIDFromAddress(address, { collisionCounter: 1 });
    expect(pid).toBe('JP-13-C01');
  });
});

describe('addCollisionCounter', () => {
  it('should add collision counter to PID', () => {
    const result = addCollisionCounter('JP-13-113', 1);
    expect(result).toBe('JP-13-113-C01');
  });

  it('should add counter with leading zero', () => {
    const result = addCollisionCounter('JP-13-113', 5);
    expect(result).toBe('JP-13-113-C05');
  });

  it('should handle double-digit counter', () => {
    const result = addCollisionCounter('JP-13-113', 42);
    expect(result).toBe('JP-13-113-C42');
  });

  it('should replace existing collision counter', () => {
    const result = addCollisionCounter('JP-13-113-C01', 2);
    expect(result).toBe('JP-13-113-C02');
  });

  it('should throw for invalid counter', () => {
    expect(() => addCollisionCounter('JP-13', 0)).toThrow();
    expect(() => addCollisionCounter('JP-13', 100)).toThrow();
  });
});

describe('removeCollisionCounter', () => {
  it('should remove collision counter from PID', () => {
    const result = removeCollisionCounter('JP-13-113-C01');
    expect(result).toBe('JP-13-113');
  });

  it('should return same PID if no collision counter', () => {
    const result = removeCollisionCounter('JP-13-113');
    expect(result).toBe('JP-13-113');
  });
});

describe('extractPIDPath', () => {
  it('should extract full path without collision', () => {
    const result = extractPIDPath('JP-13-113-01-T07-B12-BN02-R342-C01');
    expect(result).toBe('JP-13-113-01-T07-B12-BN02-R342');
  });

  it('should extract path to specified depth', () => {
    const result = extractPIDPath('JP-13-113-01-T07-B12-BN02-R342', 3);
    expect(result).toBe('JP-13-113');
  });

  it('should extract country only', () => {
    const result = extractPIDPath('JP-13-113-01', 1);
    expect(result).toBe('JP');
  });

  it('should return full path if depth exceeds levels', () => {
    const result = extractPIDPath('JP-13-113', 10);
    expect(result).toBe('JP-13-113');
  });
});

describe('comparePIDHierarchy', () => {
  it('should return full match count for identical PIDs', () => {
    const result = comparePIDHierarchy('JP-13-113', 'JP-13-113');
    expect(result).toBe(3);
  });

  it('should return partial match count', () => {
    const result = comparePIDHierarchy('JP-13-113-01', 'JP-13-114-02');
    expect(result).toBe(2); // JP and 13 match
  });

  it('should return 1 for same country only', () => {
    const result = comparePIDHierarchy('JP-13-113', 'JP-14-200');
    expect(result).toBe(1);
  });

  it('should return 0 for different countries', () => {
    const result = comparePIDHierarchy('JP-13-113', 'US-CA-90210');
    expect(result).toBe(0);
  });

  it('should ignore collision suffixes', () => {
    const result = comparePIDHierarchy('JP-13-113-C01', 'JP-13-113-C02');
    expect(result).toBe(3);
  });

  it('should be case insensitive', () => {
    const result = comparePIDHierarchy('jp-13-113', 'JP-13-113');
    expect(result).toBe(3);
  });
});

describe('isPIDParent', () => {
  it('should return true for parent-child relationship', () => {
    expect(isPIDParent('JP', 'JP-13-113')).toBe(true);
    expect(isPIDParent('JP-13', 'JP-13-113')).toBe(true);
    expect(isPIDParent('JP-13-113', 'JP-13-113-01')).toBe(true);
  });

  it('should return true for same PID', () => {
    expect(isPIDParent('JP-13-113', 'JP-13-113')).toBe(true);
  });

  it('should return false for non-parent', () => {
    expect(isPIDParent('JP-14', 'JP-13-113')).toBe(false);
    expect(isPIDParent('US', 'JP-13')).toBe(false);
  });

  it('should return false for child-parent', () => {
    expect(isPIDParent('JP-13-113', 'JP-13')).toBe(false);
  });
});

describe('getPIDDepth', () => {
  it('should return correct depth for various PIDs', () => {
    expect(getPIDDepth('JP')).toBe(1);
    expect(getPIDDepth('JP-13')).toBe(2);
    expect(getPIDDepth('JP-13-113')).toBe(3);
    expect(getPIDDepth('JP-13-113-01-T07-B12-BN02-R342')).toBe(8);
  });

  it('should not count collision suffix as level', () => {
    expect(getPIDDepth('JP-13-113-C01')).toBe(3);
    expect(getPIDDepth('JP-13-113-01-C99')).toBe(4);
  });

  it('should throw for invalid PID', () => {
    expect(() => getPIDDepth('')).toThrow();
  });
});

describe('createWaybillPayload', () => {
  it('should create basic waybill payload', () => {
    const payload = createWaybillPayload('WB890123456', 'JP-13-113-01-T07-B12-BN02-R342');

    expect(payload.waybill_id).toBe('WB890123456');
    expect(payload.addr_pid).toBe('JP-13-113-01-T07-B12-BN02-R342');
  });

  it('should create waybill with additional options', () => {
    const payload = createWaybillPayload('WB890123456', 'JP-13-113', {
      parcel_weight: 2.4,
      parcel_size: '60',
      carrier_zone: 'ZONE_KANTO',
    });

    expect(payload.waybill_id).toBe('WB890123456');
    expect(payload.addr_pid).toBe('JP-13-113');
    expect(payload.parcel_weight).toBe(2.4);
    expect(payload.parcel_size).toBe('60');
    expect(payload.carrier_zone).toBe('ZONE_KANTO');
  });

  it('should uppercase PID', () => {
    const payload = createWaybillPayload('WB123', 'jp-13');

    expect(payload.addr_pid).toBe('JP-13');
  });

  it('should throw for invalid PID', () => {
    expect(() => createWaybillPayload('WB123', '')).toThrow('Invalid PID');
    expect(() => createWaybillPayload('WB123', 'INVALID')).toThrow();
  });

  it('should accept full waybill payload format', () => {
    const payload = createWaybillPayload('WB890123456', 'JP-13-113-01-T07-B12-BN02-R342', {
      parcel_weight: 2.4,
      parcel_size: '60',
      carrier_zone: 'ZONE_KANTO',
      zkp: '<proof_blob>',
      sig: '<bls_signature>',
    });

    expect(payload.zkp).toBe('<proof_blob>');
    expect(payload.sig).toBe('<bls_signature>');
  });
});

describe('PID Format Examples', () => {
  it('should validate Japan format', () => {
    // JP-<pref>-<ward>-<town>-<block>-RNNN
    const result = validatePID('JP-13-113-01-T07-B12-BN02-R342');
    expect(result.valid).toBe(true);
  });

  it('should validate US format', () => {
    // US-<state>-<zip_prefix>-<street_block>-<building>-Apt
    const result = validatePID('US-CA-90210-MAIN-B001-APT5');
    expect(result.valid).toBe(true);
  });

  it('should validate EU format', () => {
    // <country>-<postal_prefix>-<city_block>-<building>-Unit
    const result = validatePID('DE-10115-MITTE-B42-U301');
    expect(result.valid).toBe(true);
  });

  it('should validate Middle East format', () => {
    // Country-City-Block-Building-Unit
    const result = validatePID('AE-DXB-BLK5-TWR2-1205');
    expect(result.valid).toBe(true);
  });
});
