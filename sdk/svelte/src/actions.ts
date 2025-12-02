import { validateAddress } from '@vey/core';

export function addressValidator(node: HTMLInputElement, countryCode: string) {
  let timeout: NodeJS.Timeout;

  function validate() {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        const result = await validateAddress({ value: node.value }, countryCode);
        if (result.valid) {
          node.setCustomValidity('');
        } else {
          node.setCustomValidity(result.errors?.[0] || 'Invalid address');
        }
      } catch (error) {
        node.setCustomValidity('Validation failed');
      }
    }, 300);
  }

  node.addEventListener('input', validate);

  return {
    update(newCountryCode: string) {
      countryCode = newCountryCode;
      validate();
    },
    destroy() {
      clearTimeout(timeout);
      node.removeEventListener('input', validate);
    }
  };
}
