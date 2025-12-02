import { writable, derived } from 'svelte/store';
import { validateAddress, encodePID } from '@vey/core';

export const address = writable({
  street: '',
  city: '',
  province: '',
  postalCode: '',
  country: ''
});

export const countryCode = writable('');

export const validation = derived(
  [address, countryCode],
  ([$address, $countryCode], set) => {
    if (!$countryCode) {
      set({ valid: false, errors: [] });
      return;
    }

    validateAddress($address, $countryCode).then(result => {
      set(result);
    });
  }
);

export const pid = derived(
  [address, countryCode],
  ([$address, $countryCode]) => {
    if (!$countryCode) return null;
    try {
      return encodePID({ ...$address, country: $countryCode });
    } catch (error) {
      return null;
    }
  }
);
