/**
 * @vey/core - Address PID (Place ID) module
 * 
 * PID is a hierarchical ID format for addresses:
 * <Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
 * 
 * PID serves as:
 * 1. Unique identifier for world addresses
 * 2. Lossless key to address hierarchy DAG  
 * 3. ZK proof input for address validity verification
 * 4. Shipping routing code compatible with WMS/TMS/Carrier
 */

import type {
  PIDComponents,
  AddressPID,
  PIDValidationResult,
  PIDValidationError,
  PIDEncodingOptions,
  NormalizedAddress,
  WaybillPayload,
} from './types';

/** PID component separator */
const PID_SEPARATOR = '-';

/** Maximum collision counter value */
const MAX_COLLISION_COUNTER = 99;

/** Component order in PID string */
const COMPONENT_ORDER: (keyof PIDComponents)[] = [
  'country',
  'admin1',
  'admin2',
  'locality',
  'sublocality',
  'block',
  'building',
  'unit',
];

/** Country code regex (ISO 3166-1 alpha-2) */
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

/** Component code regex (alphanumeric) */
const COMPONENT_CODE_REGEX = /^[A-Z0-9]+$/i;

/** Collision suffix regex (e.g., C01, C99) */
const COLLISION_REGEX = /^C[0-9]{2}$/;

/**
 * Encodes address components into a PID string
 * 
 * @param components - PID components to encode
 * @param options - Encoding options
 * @returns Encoded PID string
 * 
 * @example
 * ```ts
 * const pid = encodePID({
 *   country: 'JP',
 *   admin1: '13',
 *   admin2: '113',
 *   locality: '01',
 *   sublocality: 'T07',
 *   block: 'B12',
 *   building: 'BN02',
 *   unit: 'R342'
 * });
 * // Returns: 'JP-13-113-01-T07-B12-BN02-R342'
 * ```
 */
export function encodePID(
  components: PIDComponents,
  options: PIDEncodingOptions = {}
): string {
  const parts: string[] = [];

  // Country is required
  if (!components.country) {
    throw new Error('Country code is required for PID encoding');
  }

  parts.push(components.country.toUpperCase());

  // Add optional components in order, stopping at first empty component
  for (const key of COMPONENT_ORDER.slice(1)) {
    const value = components[key];
    if (value) {
      parts.push(value.toUpperCase());
    } else {
      // Stop at first empty component since PID is positional
      break;
    }
  }

  let pid = parts.join(PID_SEPARATOR);

  // Add collision counter if specified
  if (options.collisionCounter !== undefined) {
    if (options.collisionCounter < 1 || options.collisionCounter > MAX_COLLISION_COUNTER) {
      throw new Error(`Collision counter must be between 1 and ${MAX_COLLISION_COUNTER}`);
    }
    const counter = options.collisionCounter.toString().padStart(2, '0');
    pid += `${PID_SEPARATOR}C${counter}`;
  } else if (components.collision) {
    pid += `${PID_SEPARATOR}${components.collision}`;
  }

  return pid;
}

/**
 * Decodes a PID string into its components
 * 
 * @param pid - PID string to decode
 * @returns Parsed PID components
 * @throws Error if PID format is invalid
 * 
 * @example
 * ```ts
 * const components = decodePID('JP-13-113-01-T07-B12-BN02-R342');
 * // Returns: {
 * //   country: 'JP',
 * //   admin1: '13',
 * //   admin2: '113',
 * //   locality: '01',
 * //   sublocality: 'T07',
 * //   block: 'B12',
 * //   building: 'BN02',
 * //   unit: 'R342'
 * // }
 * ```
 */
export function decodePID(pid: string): PIDComponents {
  if (!pid || typeof pid !== 'string') {
    throw new Error('PID must be a non-empty string');
  }

  const parts = pid.split(PID_SEPARATOR);
  
  if (parts.length < 1) {
    throw new Error('Invalid PID format: at least country code is required');
  }

  const components: PIDComponents = {
    country: parts[0].toUpperCase(),
  };

  // Check for collision suffix at the end
  let endIndex = parts.length;
  const lastPart = parts[parts.length - 1];
  if (lastPart && COLLISION_REGEX.test(lastPart)) {
    components.collision = lastPart;
    endIndex = parts.length - 1;
  }

  // Map remaining parts to components
  const componentKeys: (keyof PIDComponents)[] = ['admin1', 'admin2', 'locality', 'sublocality', 'block', 'building', 'unit'];
  
  for (let i = 1; i < endIndex && i <= componentKeys.length; i++) {
    const key = componentKeys[i - 1];
    if (parts[i]) {
      components[key] = parts[i].toUpperCase();
    }
  }

  return components;
}

/**
 * Validates a PID string and returns validation result
 * 
 * @param pid - PID string to validate
 * @returns Validation result with errors if invalid
 * 
 * @example
 * ```ts
 * const result = validatePID('JP-13-113-01-T07-B12-BN02-R342');
 * if (result.valid) {
 *   console.log('Valid PID:', result.components);
 * } else {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 */
export function validatePID(pid: string): PIDValidationResult {
  const errors: PIDValidationError[] = [];

  // Check for empty or invalid input
  if (!pid || typeof pid !== 'string') {
    errors.push({
      component: 'format',
      code: 'EMPTY_PID',
      message: 'PID must be a non-empty string',
    });
    return { valid: false, errors };
  }

  // Check for invalid characters
  if (!/^[A-Z0-9-]+$/i.test(pid)) {
    errors.push({
      component: 'format',
      code: 'INVALID_CHARACTERS',
      message: 'PID can only contain alphanumeric characters and hyphens',
    });
    return { valid: false, errors };
  }

  const parts = pid.split(PID_SEPARATOR);
  
  // Validate country code
  if (!parts[0] || !COUNTRY_CODE_REGEX.test(parts[0].toUpperCase())) {
    errors.push({
      component: 'country',
      code: 'INVALID_COUNTRY_CODE',
      message: 'Country code must be a valid ISO 3166-1 alpha-2 code (2 uppercase letters)',
    });
  }

  // Validate each component
  let endIndex = parts.length;
  const lastPart = parts[parts.length - 1];
  
  // Check for collision suffix
  if (lastPart && COLLISION_REGEX.test(lastPart.toUpperCase())) {
    endIndex = parts.length - 1;
  }

  // Validate component codes
  for (let i = 1; i < endIndex; i++) {
    const part = parts[i];
    if (part && !COMPONENT_CODE_REGEX.test(part)) {
      const componentName = COMPONENT_ORDER[i] || `component_${i}`;
      errors.push({
        component: componentName as keyof PIDComponents,
        code: 'INVALID_COMPONENT_CODE',
        message: `${componentName} code must be alphanumeric: ${part}`,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Parse components
  try {
    const components = decodePID(pid);
    return { valid: true, errors: [], components };
  } catch {
    errors.push({
      component: 'format',
      code: 'PARSE_ERROR',
      message: 'Failed to parse PID components',
    });
    return { valid: false, errors };
  }
}

/**
 * Creates an AddressPID from components
 * 
 * @param components - PID components
 * @param options - Encoding options
 * @returns AddressPID object
 */
export function createPID(
  components: PIDComponents,
  options: PIDEncodingOptions = {}
): AddressPID {
  const pid = encodePID(components, options);
  return {
    pid,
    components,
    validated: true,
  };
}

/**
 * Parses a PID string into an AddressPID object
 * 
 * @param pid - PID string to parse
 * @returns AddressPID object
 */
export function parsePID(pid: string): AddressPID {
  const validation = validatePID(pid);
  if (!validation.valid || !validation.components) {
    throw new Error(`Invalid PID: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  return {
    pid: pid.toUpperCase(),
    components: validation.components,
    validated: true,
  };
}

/**
 * Generates a PID from a normalized address
 * 
 * @param address - Normalized address input
 * @param options - Encoding options
 * @returns Generated PID string
 * 
 * @example
 * ```ts
 * const pid = generatePIDFromAddress({
 *   countryCode: 'JP',
 *   admin1: '13',
 *   admin2: '113',
 *   locality: '01',
 *   sublocality: 'T07',
 *   block: 'B12',
 *   building: 'BN02',
 *   unit: 'R342'
 * });
 * // Returns: 'JP-13-113-01-T07-B12-BN02-R342'
 * ```
 */
export function generatePIDFromAddress(
  address: NormalizedAddress,
  options: PIDEncodingOptions = {}
): string {
  const components: PIDComponents = {
    country: address.countryCode,
    admin1: address.admin1,
    admin2: address.admin2,
    locality: address.locality,
    sublocality: address.sublocality,
    block: address.block,
    building: address.building,
    unit: address.unit,
  };

  return encodePID(components, options);
}

/**
 * Adds collision counter to an existing PID
 * 
 * @param pid - Original PID string
 * @param counter - Collision counter (1-99)
 * @returns PID with collision suffix
 * 
 * @example
 * ```ts
 * const pidWithCollision = addCollisionCounter('JP-13-113', 1);
 * // Returns: 'JP-13-113-C01'
 * ```
 */
export function addCollisionCounter(pid: string, counter: number): string {
  if (counter < 1 || counter > MAX_COLLISION_COUNTER) {
    throw new Error(`Collision counter must be between 1 and ${MAX_COLLISION_COUNTER}`);
  }
  
  // Remove existing collision suffix if present
  const validation = validatePID(pid);
  if (validation.valid && validation.components?.collision) {
    const basePid = pid.substring(0, pid.lastIndexOf(PID_SEPARATOR));
    return `${basePid}${PID_SEPARATOR}C${counter.toString().padStart(2, '0')}`;
  }
  
  return `${pid}${PID_SEPARATOR}C${counter.toString().padStart(2, '0')}`;
}

/**
 * Removes collision counter from a PID
 * 
 * @param pid - PID string with collision suffix
 * @returns PID without collision suffix
 */
export function removeCollisionCounter(pid: string): string {
  const validation = validatePID(pid);
  if (!validation.valid || !validation.components) {
    throw new Error('Invalid PID');
  }
  
  if (validation.components.collision) {
    return pid.substring(0, pid.lastIndexOf(PID_SEPARATOR));
  }
  
  return pid;
}

/**
 * Extracts the hierarchical path from a PID (for routing purposes)
 * 
 * @param pid - PID string
 * @param depth - Number of hierarchy levels to include (default: all)
 * @returns Truncated PID path
 * 
 * @example
 * ```ts
 * const path = extractPIDPath('JP-13-113-01-T07-B12-BN02-R342', 3);
 * // Returns: 'JP-13-113'
 * ```
 */
export function extractPIDPath(pid: string, depth?: number): string {
  const validation = validatePID(pid);
  if (!validation.valid || !validation.components) {
    throw new Error('Invalid PID');
  }
  
  const parts = pid.split(PID_SEPARATOR);
  
  // Remove collision suffix from consideration
  let endIndex = parts.length;
  if (validation.components.collision) {
    endIndex = parts.length - 1;
  }
  
  if (depth === undefined || depth >= endIndex) {
    // Return without collision suffix
    return parts.slice(0, endIndex).join(PID_SEPARATOR);
  }
  
  return parts.slice(0, depth).join(PID_SEPARATOR);
}

/**
 * Compares two PIDs for hierarchy matching
 * 
 * @param pid1 - First PID
 * @param pid2 - Second PID
 * @returns Number of matching hierarchy levels
 * 
 * @example
 * ```ts
 * const matchDepth = comparePIDHierarchy('JP-13-113-01', 'JP-13-114-02');
 * // Returns: 2 (country and admin1 match)
 * ```
 */
export function comparePIDHierarchy(pid1: string, pid2: string): number {
  const parts1 = pid1.toUpperCase().split(PID_SEPARATOR);
  const parts2 = pid2.toUpperCase().split(PID_SEPARATOR);
  
  // Remove collision suffixes
  const clean1 = parts1.filter(p => !COLLISION_REGEX.test(p));
  const clean2 = parts2.filter(p => !COLLISION_REGEX.test(p));
  
  let matchCount = 0;
  const minLength = Math.min(clean1.length, clean2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (clean1[i] === clean2[i]) {
      matchCount++;
    } else {
      break;
    }
  }
  
  return matchCount;
}

/**
 * Checks if a PID is a parent of another PID
 * 
 * @param parent - Potential parent PID
 * @param child - Potential child PID
 * @returns True if parent is an ancestor of child
 * 
 * @example
 * ```ts
 * isPIDParent('JP-13', 'JP-13-113-01');
 * // Returns: true
 * ```
 */
export function isPIDParent(parent: string, child: string): boolean {
  const parentPath = extractPIDPath(parent);
  const childPath = extractPIDPath(child);
  
  return childPath.startsWith(parentPath + PID_SEPARATOR) || childPath === parentPath;
}

/**
 * Gets the depth (number of levels) of a PID
 * 
 * @param pid - PID string
 * @returns Number of hierarchy levels
 */
export function getPIDDepth(pid: string): number {
  const validation = validatePID(pid);
  if (!validation.valid || !validation.components) {
    throw new Error('Invalid PID');
  }
  
  const parts = pid.split(PID_SEPARATOR);
  
  // Don't count collision suffix as a level
  if (validation.components.collision) {
    return parts.length - 1;
  }
  
  return parts.length;
}

/**
 * Creates a waybill payload with PID
 * 
 * @param waybillId - Waybill identifier
 * @param pid - Address PID
 * @param options - Additional waybill options
 * @returns WaybillPayload object
 */
export function createWaybillPayload(
  waybillId: string,
  pid: string,
  options: Partial<Omit<WaybillPayload, 'waybill_id' | 'addr_pid'>> = {}
): WaybillPayload {
  // Validate PID
  const validation = validatePID(pid);
  if (!validation.valid) {
    throw new Error(`Invalid PID: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  return {
    waybill_id: waybillId,
    addr_pid: pid.toUpperCase(),
    ...options,
  };
}
