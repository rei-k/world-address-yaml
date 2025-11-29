/**
 * @vey/vue - Vue composables for address management
 */

import { ref, computed, watch, inject, provide, type Ref, type InjectionKey } from 'vue';
import {
  VeyClient,
  createVeyClient,
  VeyConfig,
  AddressInput,
  ValidationResult,
  CountryAddressFormat,
  RegionHierarchy,
} from '@vey/core';

// Injection key for Vey client
export const VeyClientKey: InjectionKey<VeyClient> = Symbol('VeyClient');

/**
 * Create and provide Vey client
 */
export function provideVeyClient(config?: VeyConfig): VeyClient {
  const client = createVeyClient(config);
  provide(VeyClientKey, client);
  return client;
}

/**
 * Inject Vey client
 */
export function useVeyClient(): VeyClient {
  const client = inject(VeyClientKey);
  if (!client) {
    throw new Error('Vey client not provided. Use provideVeyClient() in a parent component.');
  }
  return client;
}

/**
 * Composable for address validation
 */
export function useAddressValidation(countryCode: Ref<string> | string) {
  const client = useVeyClient();
  const isValidating = ref(false);
  const result = ref<ValidationResult | null>(null);

  const countryCodeRef = typeof countryCode === 'string' ? ref(countryCode) : countryCode;

  async function validate(address: AddressInput): Promise<ValidationResult> {
    isValidating.value = true;
    try {
      const validationResult = await client.validate(address, countryCodeRef.value);
      result.value = validationResult;
      return validationResult;
    } finally {
      isValidating.value = false;
    }
  }

  function reset() {
    result.value = null;
  }

  const isValid = computed(() => result.value?.valid ?? null);
  const errors = computed(() => result.value?.errors ?? []);
  const warnings = computed(() => result.value?.warnings ?? []);

  return {
    validate,
    reset,
    isValidating,
    result,
    isValid,
    errors,
    warnings,
  };
}

/**
 * Composable for country address format
 */
export function useCountryFormat(countryCode: Ref<string> | string) {
  const client = useVeyClient();
  const format = ref<CountryAddressFormat | null>(null);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  const countryCodeRef = typeof countryCode === 'string' ? ref(countryCode) : countryCode;

  async function loadFormat() {
    isLoading.value = true;
    error.value = null;
    try {
      format.value = await client.getCountryFormat(countryCodeRef.value);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load format');
    } finally {
      isLoading.value = false;
    }
  }

  // Watch for country code changes
  watch(
    countryCodeRef,
    () => {
      loadFormat();
    },
    { immediate: true }
  );

  return { format, isLoading, error, reload: loadFormat };
}

/**
 * Composable for address form state
 */
export function useAddressForm(initialValue: AddressInput = {}) {
  const address = ref<AddressInput>({ ...initialValue });

  function updateField(field: keyof AddressInput, value: string) {
    address.value = { ...address.value, [field]: value };
  }

  function reset() {
    address.value = { ...initialValue };
  }

  function setAll(newAddress: AddressInput) {
    address.value = { ...newAddress };
  }

  return {
    address,
    updateField,
    reset,
    setAll,
  };
}

/**
 * Composable for region hierarchy (hierarchical picker)
 */
export function useRegionHierarchy() {
  const client = useVeyClient();
  const hierarchy = ref<RegionHierarchy[]>([]);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  async function loadHierarchy() {
    isLoading.value = true;
    error.value = null;
    try {
      hierarchy.value = await client.getRegionHierarchy();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load hierarchy');
    } finally {
      isLoading.value = false;
    }
  }

  // Load on mount
  loadHierarchy();

  return { hierarchy, isLoading, error, reload: loadHierarchy };
}

/**
 * Composable for required fields
 */
export function useRequiredFields(countryCode: Ref<string> | string) {
  const client = useVeyClient();
  const fields = ref<string[]>([]);
  const isLoading = ref(true);

  const countryCodeRef = typeof countryCode === 'string' ? ref(countryCode) : countryCode;

  async function loadFields() {
    isLoading.value = true;
    try {
      fields.value = await client.getRequiredFields(countryCodeRef.value);
    } finally {
      isLoading.value = false;
    }
  }

  watch(
    countryCodeRef,
    () => {
      loadFields();
    },
    { immediate: true }
  );

  return { fields, isLoading, reload: loadFields };
}
