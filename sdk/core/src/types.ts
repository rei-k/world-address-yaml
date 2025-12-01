/**
 * @vey/core - Core types and interfaces for World Address SDK
 */

/** Language information for address representation */
export interface Language {
  name: string;
  script: string;
  direction: 'ltr' | 'rtl';
  role: 'official' | 'auxiliary' | 'shipping_required';
  required_for_shipping?: boolean;
  country_name?: string;
}

/** Local name variant */
export interface LocalName {
  lang: string;
  value: string;
  script: string;
  direction: 'ltr' | 'rtl';
}

/** ISO country codes */
export interface IsoCodes {
  alpha2: string;
  alpha3?: string;
  numeric?: string;
}

/** Address field definition */
export interface AddressField {
  required: boolean;
  example?: string;
  label_local?: string;
  label_en?: string;
  regex?: string;
  length?: number;
  description?: string;
  type?: string;
  count?: number;
  since?: number;
  value?: string;
}

/** Address format order variant */
export interface OrderVariant {
  context: 'domestic' | 'international' | 'postal';
  order: string[];
}

/** Address format definition */
export interface AddressFormat {
  order?: string[];
  order_variants?: OrderVariant[];
  recipient?: AddressField;
  building?: AddressField;
  floor?: AddressField;
  room?: AddressField;
  unit?: AddressField;
  street_address?: AddressField;
  district?: AddressField;
  ward?: AddressField;
  city?: AddressField;
  province?: AddressField;
  postal_code?: AddressField;
  country?: AddressField;
}

/** Administrative division level */
export interface AdministrativeDivision {
  type: string;
  label_local?: string;
  label_en?: string;
  count?: number;
  required?: boolean;
  source?: string;
}

/** Administrative divisions structure */
export interface AdministrativeDivisions {
  level1?: AdministrativeDivision;
  level2?: AdministrativeDivision;
  level3?: AdministrativeDivision;
}

/** Validation rules */
export interface Validation {
  allow_latin_transliteration?: boolean;
  postal_code_rules?: {
    general?: string;
    exceptions?: string;
  };
  fallback?: string;
  rules?: string[];
}

/** Address examples */
export interface AddressExamples {
  domestic_raw?: string;
  domestic_normalized?: string;
  international?: string;
}

/** Country status */
export interface CountryStatus {
  un_member?: boolean;
  recognized?: boolean;
  disputed?: boolean;
}

/** Complete country address format */
export interface CountryAddressFormat {
  name: {
    en: string;
    local?: LocalName[];
  };
  iso_codes: IsoCodes;
  continent?: string;
  subregion?: string;
  languages: Language[];
  administrative_divisions?: AdministrativeDivisions;
  address_format: AddressFormat;
  validation?: Validation;
  examples?: AddressExamples;
  status?: CountryStatus;
}

/** Address input for validation */
export interface AddressInput {
  recipient?: string;
  building?: string;
  floor?: string;
  room?: string;
  unit?: string;
  street_address?: string;
  district?: string;
  ward?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  normalized?: AddressInput;
}

/** Validation error */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

/** Validation warning */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

/** SDK Configuration */
export interface VeyConfig {
  apiKey?: string;
  environment?: 'sandbox' | 'production';
  language?: string;
  dataPath?: string;
}

/** Webhook event types */
export type WebhookEventType = 
  | 'address.created'
  | 'address.updated'
  | 'address.deleted'
  | 'address.verified'
  | 'delivery.started'
  | 'delivery.completed'
  | 'delivery.failed';

/** Webhook payload */
export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}

/** Region hierarchy for hierarchical picker */
export interface RegionHierarchy {
  continent: string;
  countries: {
    code: string;
    name: string;
    provinces?: {
      code: string;
      name: string;
      cities?: {
        code?: string;
        name: string;
        districts?: {
          code?: string;
          name: string;
        }[];
      }[];
    }[];
  }[];
}

/**
 * Address PID (Place ID) Components
 * 
 * Hierarchical ID structure: <Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
 * Example: JP-13-113-01-T07-B12-BN02-R342
 */
export interface PIDComponents {
  /** ISO 3166-1 alpha-2 country code (e.g., 'JP') */
  country: string;
  /** First administrative level code (e.g., '13' for Tokyo) */
  admin1?: string;
  /** Second administrative level code (e.g., '113' for Shibuya) */
  admin2?: string;
  /** Locality code (e.g., '01') */
  locality?: string;
  /** Sublocality code (e.g., 'T07' for 7-chome) */
  sublocality?: string;
  /** Block code (e.g., 'B12' for block 12) */
  block?: string;
  /** Building code (e.g., 'BN02' for building 02) */
  building?: string;
  /** Unit/room code (e.g., 'R342' for room 342) */
  unit?: string;
  /** Collision counter suffix (e.g., 'C01' for first collision) */
  collision?: string;
}

/**
 * Address PID representation
 * 
 * PID serves as:
 * 1. Unique identifier for world addresses
 * 2. Lossless key to address hierarchy DAG
 * 3. ZK proof input for address validity verification
 * 4. Shipping routing code compatible with WMS/TMS/Carrier
 */
export interface AddressPID {
  /** Full PID string (e.g., 'JP-13-113-01-T07-B12-BN02-R342') */
  pid: string;
  /** Parsed PID components */
  components: PIDComponents;
  /** Whether this PID has been validated */
  validated?: boolean;
}

/** PID validation result */
export interface PIDValidationResult {
  /** Whether the PID is valid */
  valid: boolean;
  /** Validation errors */
  errors: PIDValidationError[];
  /** Parsed components if valid */
  components?: PIDComponents;
}

/** PID validation error */
export interface PIDValidationError {
  /** Component that caused the error */
  component: keyof PIDComponents | 'format';
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
}

/** PID encoding options */
export interface PIDEncodingOptions {
  /** Collision counter to append (1-99) */
  collisionCounter?: number;
}

/** Normalized address input for PID generation */
export interface NormalizedAddress {
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** First administrative division (e.g., prefecture, state) */
  admin1?: string;
  /** Second administrative division (e.g., city, ward) */
  admin2?: string;
  /** Locality/neighborhood */
  locality?: string;
  /** Sublocality (e.g., town, chome) */
  sublocality?: string;
  /** Block/street number */
  block?: string;
  /** Building name/number */
  building?: string;
  /** Unit/room number */
  unit?: string;
}

/**
 * Waybill with PID (shipping label payload)
 * 
 * Example QR payload structure for shipping labels
 */
export interface WaybillPayload {
  /** Waybill ID */
  waybill_id: string;
  /** Address PID */
  addr_pid: string;
  /** Parcel weight in kg */
  parcel_weight?: number;
  /** Parcel size code */
  parcel_size?: string;
  /** Carrier zone */
  carrier_zone?: string;
  /** ZK proof blob */
  zkp?: string;
  /** BLS signature */
  sig?: string;
}
