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
