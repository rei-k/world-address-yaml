import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';

export function useVey() {
  const { $vey } = useNuxtApp();

  return {
    validateAddress: $vey.validateAddress,
    normalizeAddress: $vey.normalizeAddress,
    config: $vey.config
  };
}
