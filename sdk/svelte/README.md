# @vey/svelte

Svelte SDK for World Address YAML - Address validation and formatting for Svelte applications.

## Installation

```bash
npm install @vey/svelte @vey/core
```

## Usage

### Using Components

```svelte
<script>
  import { AddressForm } from '@vey/svelte';

  function handleSubmit(event) {
    console.log('Address:', event.detail.address);
    console.log('Validation:', event.detail.validation);
  }
</script>

<AddressForm
  countryCode="JP"
  submitLabel="Submit"
  on:submit={handleSubmit}
/>
```

### Using Stores

```svelte
<script>
  import { address, countryCode, validation } from '@vey/svelte';

  $address = {
    street: '1-1 Chiyoda',
    city: 'Tokyo',
    postalCode: '100-0001'
  };
  $countryCode = 'JP';
</script>

{#if $validation.valid}
  <p>Address is valid!</p>
{:else}
  <p>Errors: {$validation.errors.join(', ')}</p>
{/if}
```

### Using Actions

```svelte
<script>
  import { addressValidator } from '@vey/svelte';
</script>

<input
  type="text"
  use:addressValidator={'JP'}
/>
```

## Components

- `AddressForm` - Complete address form with validation
- `AddressInput` - Single address input field

## Stores

- `address` - Writable store for address data
- `countryCode` - Writable store for country code
- `validation` - Derived store for validation results
- `pid` - Derived store for PID encoding

## Actions

- `addressValidator` - Input validation action

## License

MIT
