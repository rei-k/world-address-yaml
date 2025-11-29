/**
 * @vey/vue - Vue SDK for World Address
 */

// Re-export core types
export type {
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CountryAddressFormat,
  VeyConfig,
  RegionHierarchy,
} from '@vey/core';

// Composables
export {
  VeyClientKey,
  provideVeyClient,
  useVeyClient,
  useAddressValidation,
  useCountryFormat,
  useAddressForm,
  useRegionHierarchy,
  useRequiredFields,
} from './composables';
