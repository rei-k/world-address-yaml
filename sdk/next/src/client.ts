'use client';

export { VeyProvider, AddressForm, useVey } from '@vey/react';

/**
 * Client-side hook for address validation with Next.js
 */
export function useAddressValidation() {
  async function validate(address: any, countryCode: string) {
    const response = await fetch('/api/vey/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, countryCode }),
    });

    return response.json();
  }

  return { validate };
}
