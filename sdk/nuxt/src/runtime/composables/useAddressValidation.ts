import { ref } from 'vue';
import { useVey } from './useVey';

export function useAddressValidation() {
  const { validateAddress, normalizeAddress } = useVey();
  const isValidating = ref(false);
  const errors = ref<string[]>([]);

  async function validate(address: any, countryCode: string) {
    isValidating.value = true;
    errors.value = [];

    try {
      const result = await validateAddress(address, countryCode);
      
      if (!result.valid) {
        errors.value = result.errors || [];
      }
      
      return result;
    } catch (error) {
      errors.value = [error.message];
      return { valid: false, errors: errors.value };
    } finally {
      isValidating.value = false;
    }
  }

  async function normalize(address: any, countryCode: string) {
    try {
      return await normalizeAddress(address, countryCode);
    } catch (error) {
      errors.value = [error.message];
      return null;
    }
  }

  return {
    validate,
    normalize,
    isValidating,
    errors
  };
}
