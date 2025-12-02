import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { validateAddress, normalizeAddress } from '@vey/core';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  return {
    provide: {
      vey: {
        validateAddress,
        normalizeAddress,
        config: config.public.vey
      }
    }
  };
});
