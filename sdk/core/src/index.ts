/**
 * @vey/core - World Address SDK Core
 *
 * Universal address format handling, validation, and formatting
 */

// Types
export type {
  Language,
  LocalName,
  IsoCodes,
  AddressField,
  OrderVariant,
  AddressFormat,
  AdministrativeDivision,
  AdministrativeDivisions,
  Validation,
  AddressExamples,
  CountryStatus,
  CountryAddressFormat,
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  VeyConfig,
  WebhookEventType,
  WebhookPayload,
  RegionHierarchy,
  // PID types
  PIDComponents,
  AddressPID,
  PIDValidationResult,
  PIDValidationError,
  PIDEncodingOptions,
  NormalizedAddress,
  WaybillPayload,
} from './types';

// Client
export { VeyClient, createVeyClient } from './client';

// Validator
export {
  validateAddress,
  getRequiredFields,
  getFieldOrder,
} from './validator';

// Formatter
export {
  formatAddress,
  formatShippingLabel,
  getPostalCodeExample,
  getPostalCodeRegex,
} from './formatter';
export type { FormatOptions } from './formatter';

// Loader
export { createDataLoader, dataLoader } from './loader';
export type { DataLoaderConfig } from './loader';

// PID (Place ID) module
export {
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
} from './pid';
