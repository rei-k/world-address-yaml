# @vey/next

Next.js SDK for World Address YAML - Address validation and formatting optimized for Next.js applications.

## Installation

```bash
npm install @vey/next @vey/core @vey/react
```

## Usage

### Server Components

```tsx
import { validateAddressAction } from '@vey/next';

export default async function Page() {
  const validation = await validateAddressAction(
    {
      street: '1-1 Chiyoda',
      city: 'Tokyo',
      postalCode: '100-0001'
    },
    'JP'
  );

  return (
    <div>
      {validation.valid ? 'Valid' : 'Invalid'}
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { VeyProvider, AddressForm } from '@vey/next';

export default function AddressPage() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <AddressForm
        countryCode="JP"
        onSubmit={(address, validation) => {
          console.log('Address:', address);
        }}
      />
    </VeyProvider>
  );
}
```

### API Routes (App Router)

```typescript
// app/api/vey/validate/route.ts
import { POST } from '@vey/next/server';

export { POST };
```

### Server Actions

```tsx
'use client';

import { validateAddressAction } from '@vey/next';

export default function Form() {
  async function handleSubmit(formData: FormData) {
    const address = {
      street: formData.get('street'),
      city: formData.get('city'),
      postalCode: formData.get('postalCode')
    };
    
    const result = await validateAddressAction(address, 'JP');
    console.log(result);
  }

  return (
    <form action={handleSubmit}>
      <input name="street" />
      <input name="city" />
      <input name="postalCode" />
      <button type="submit">Validate</button>
    </form>
  );
}
```

### Middleware

```typescript
// middleware.ts
import { withAddressValidation } from '@vey/next';

export default withAddressValidation();
```

## Features

- ✅ Server Components support
- ✅ Client Components support
- ✅ Server Actions
- ✅ API Routes (App Router)
- ✅ Middleware integration
- ✅ TypeScript support

## License

MIT
