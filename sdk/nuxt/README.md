# @vey/nuxt

Nuxt.js module for World Address YAML - Address validation and formatting optimized for Nuxt 3 applications.

## Installation

```bash
npm install @vey/nuxt @vey/core @vey/vue
```

## Setup

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@vey/nuxt'],
  vey: {
    apiKey: 'your-api-key',
    apiEndpoint: 'https://api.vey.example'
  }
});
```

## Usage

### Using Auto-imported Components

```vue
<template>
  <VeyAddressForm
    country-code="JP"
    @submit="handleSubmit"
  />
</template>

<script setup>
function handleSubmit({ address, validation }) {
  console.log('Address:', address);
  console.log('Valid:', validation.valid);
}
</script>
```

### Using Composables

```vue
<script setup>
const { validate, isValidating, errors } = useAddressValidation();

async function validateMyAddress() {
  const result = await validate(
    {
      street: '1-1 Chiyoda',
      city: 'Tokyo',
      postalCode: '100-0001'
    },
    'JP'
  );

  if (result.valid) {
    console.log('Address is valid!');
  }
}
</script>
```

### Using Plugin

```vue
<script setup>
const { $vey } = useNuxtApp();

async function checkAddress() {
  const validation = await $vey.validateAddress(address, 'JP');
}
</script>
```

### Server Routes

```typescript
// server/api/validate.post.ts
import { validateAddress } from '@vey/core';

export default defineEventHandler(async (event) => {
  const { address, countryCode } = await readBody(event);
  
  return await validateAddress(address, countryCode);
});
```

## Features

- ✅ Auto-imported components
- ✅ Auto-imported composables
- ✅ Server-side validation
- ✅ TypeScript support
- ✅ Nuxt 3 compatible

## License

MIT
