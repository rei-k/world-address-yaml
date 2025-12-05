# Veyform Integration Guides

## E-Commerce Platform Integration

### Shopify

#### Installation

1. **Install Veyform App from Shopify App Store**
   - Search for "Veyform Address Form"
   - Click "Add app"

2. **Or Manual Integration**

Add to your theme's checkout template:

```liquid
<!-- themes/your-theme/templates/checkout.liquid -->

<div id="veyform-checkout"></div>

<script src="https://unpkg.com/@vey/core@latest"></script>
<script>
  Vey.createVeyform({
    apiKey: '{{ shop.metafields.veyform.api_key }}',
    domainAutoDetect: true,
    defaultLanguage: '{{ shop.locale | slice: 0, 2 }}',
    defaultCountry: '{{ shop.country_code }}',
    allowedCountries: {{ shop.metafields.veyform.countries | json }},
    enableAnalytics: true,
    theme: '{% if settings.theme_style == "dark" %}dark{% else %}light{% endif %}'
  }).mount('#veyform-checkout');
</script>

<style>
  .veyform-address-form {
    margin: 20px 0;
  }
</style>
```

#### Configuration

Store settings in metafields:

```json
{
  "namespace": "veyform",
  "key": "api_key",
  "value": "vey_prod_xxxxxxxxxx",
  "type": "string"
}
```

```json
{
  "namespace": "veyform",
  "key": "countries",
  "value": ["JP", "US", "KR", "CN", "TW"],
  "type": "json_string"
}
```

#### Sync with Shopify Customer

```javascript
veyform.on('submit', async (addressData) => {
  // Update Shopify customer address
  const response = await fetch('/admin/api/2024-01/customers.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': 'YOUR_ACCESS_TOKEN'
    },
    body: JSON.stringify({
      customer: {
        addresses: [{
          address1: addressData.street_address,
          city: addressData.city,
          province: addressData.province,
          zip: addressData.postal_code,
          country_code: addressData.country
        }]
      }
    })
  });
});
```

---

### WooCommerce

#### Installation

1. **Install Veyform WordPress Plugin**
   - Download from WordPress.org
   - Upload to `/wp-content/plugins/veyform/`
   - Activate

2. **Or Manual Integration**

Add to `functions.php`:

```php
<?php
// Add Veyform to checkout page
function veyform_add_to_checkout() {
  if (is_checkout()) {
    ?>
    <div id="veyform-checkout"></div>
    
    <script src="https://unpkg.com/@vey/core@latest"></script>
    <script>
      Vey.createVeyform({
        apiKey: '<?php echo get_option('veyform_api_key'); ?>',
        domainAutoDetect: true,
        defaultLanguage: '<?php echo substr(get_locale(), 0, 2); ?>',
        defaultCountry: '<?php echo WC()->countries->get_base_country(); ?>',
        allowedCountries: <?php echo json_encode(get_option('veyform_countries', ['JP', 'US'])); ?>,
        enableAnalytics: true
      }).mount('#veyform-checkout');
    </script>
    <?php
  }
}
add_action('woocommerce_checkout_before_customer_details', 'veyform_add_to_checkout');

// Save address from Veyform
add_action('woocommerce_checkout_process', 'veyform_save_address');
function veyform_save_address() {
  if (isset($_POST['veyform_address'])) {
    $address = json_decode(stripslashes($_POST['veyform_address']), true);
    
    // Update billing address
    $_POST['billing_address_1'] = $address['street_address'];
    $_POST['billing_city'] = $address['city'];
    $_POST['billing_state'] = $address['province'];
    $_POST['billing_postcode'] = $address['postal_code'];
    $_POST['billing_country'] = $address['country'];
  }
}
```

#### Settings Page

```php
<?php
// Add settings page
add_action('admin_menu', 'veyform_add_admin_menu');
function veyform_add_admin_menu() {
  add_options_page(
    'Veyform Settings',
    'Veyform',
    'manage_options',
    'veyform-settings',
    'veyform_settings_page'
  );
}

function veyform_settings_page() {
  ?>
  <div class="wrap">
    <h1>Veyform Settings</h1>
    <form method="post" action="options.php">
      <?php
      settings_fields('veyform-settings');
      do_settings_sections('veyform-settings');
      submit_button();
      ?>
    </form>
  </div>
  <?php
}

// Register settings
add_action('admin_init', 'veyform_register_settings');
function veyform_register_settings() {
  register_setting('veyform-settings', 'veyform_api_key');
  register_setting('veyform-settings', 'veyform_countries');
  register_setting('veyform-settings', 'veyform_default_language');
  
  add_settings_section(
    'veyform_main',
    'Main Settings',
    null,
    'veyform-settings'
  );
  
  add_settings_field(
    'veyform_api_key',
    'API Key',
    'veyform_api_key_callback',
    'veyform-settings',
    'veyform_main'
  );
}

function veyform_api_key_callback() {
  $value = get_option('veyform_api_key');
  echo '<input type="text" name="veyform_api_key" value="' . esc_attr($value) . '" class="regular-text">';
}
```

---

### Magento

#### Installation

```bash
composer require vey/magento2-veyform
php bin/magento module:enable Vey_Veyform
php bin/magento setup:upgrade
php bin/magento cache:flush
```

#### Configuration

1. Go to **Stores > Configuration > Sales > Veyform**
2. Enter API Key
3. Select allowed countries
4. Set default language

#### Template Integration

```xml
<!-- view/frontend/layout/checkout_index_index.xml -->
<referenceContainer name="checkout.root">
  <block class="Vey\Veyform\Block\Checkout\AddressForm"
         name="veyform.address.form"
         template="Vey_Veyform::checkout/address-form.phtml" />
</referenceContainer>
```

```php
<!-- view/frontend/templates/checkout/address-form.phtml -->
<div id="veyform-checkout"></div>

<script type="text/x-magento-init">
{
  "#veyform-checkout": {
    "Vey_Veyform/js/veyform": {
      "apiKey": "<?= $block->getApiKey() ?>",
      "domainAutoDetect": true,
      "defaultCountry": "<?= $block->getDefaultCountry() ?>",
      "allowedCountries": <?= $block->getAllowedCountries() ?>,
      "enableAnalytics": true
    }
  }
}
</script>
```

---

### Next.js

#### Installation

```bash
npm install @vey/core @vey/react
```

#### App Router (Next.js 13+)

```tsx
// app/checkout/page.tsx
'use client';

import { VeyformAddressForm } from '@vey/react';
import { useState } from 'react';

export default function CheckoutPage() {
  const [address, setAddress] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <VeyformAddressForm
        config={{
          apiKey: process.env.NEXT_PUBLIC_VEYFORM_API_KEY!,
          domainAutoDetect: true,
          defaultCountry: 'JP',
          allowedCountries: ['JP', 'US', 'KR', 'CN', 'TW'],
          defaultLanguage: 'en',
          useContinentFilter: true,
          enableAnalytics: true,
        }}
        onSubmit={async (data) => {
          setAddress(data);
          
          // Send to API
          const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: data }),
          });
          
          if (response.ok) {
            // Redirect to confirmation
            window.location.href = '/checkout/confirm';
          }
        }}
        onChange={(state) => {
          console.log('Completion:', state.completionRate);
        }}
      />
    </div>
  );
}
```

#### Pages Router (Next.js 12 and below)

```tsx
// pages/checkout.tsx
import { VeyformAddressForm } from '@vey/react';
import type { NextPage } from 'next';

const CheckoutPage: NextPage = () => {
  return (
    <div className="container">
      <VeyformAddressForm
        config={{
          apiKey: process.env.NEXT_PUBLIC_VEYFORM_API_KEY!,
          domainAutoDetect: true,
          defaultLanguage: 'en',
          enableAnalytics: true,
        }}
        onSubmit={async (data) => {
          await fetch('/api/checkout', {
            method: 'POST',
            body: JSON.stringify(data),
          });
        }}
      />
    </div>
  );
};

export default CheckoutPage;
```

#### API Route

```typescript
// app/api/checkout/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { address } = await request.json();
  
  // Validate address with Veyform API
  const validation = await fetch('https://api.vey.dev/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VEYFORM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  });
  
  if (!validation.ok) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }
  
  // Save to database
  // ...
  
  return NextResponse.json({ success: true });
}
```

---

### Nuxt.js

#### Installation

```bash
npm install @vey/core @vey/vue
```

#### Plugin Setup

```typescript
// plugins/veyform.client.ts
import { VeyformAddressForm } from '@vey/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VeyformAddressForm', VeyformAddressForm);
});
```

#### Usage

```vue
<!-- pages/checkout.vue -->
<template>
  <div class="container">
    <h1>Checkout</h1>
    
    <VeyformAddressForm
      :config="veyformConfig"
      @submit="handleSubmit"
      show-continent-filter
    />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

const veyformConfig = {
  apiKey: config.public.veyformApiKey,
  domainAutoDetect: true,
  defaultCountry: 'JP',
  allowedCountries: ['JP', 'US', 'KR', 'CN'],
  defaultLanguage: 'en',
  enableAnalytics: true,
};

async function handleSubmit(address: any) {
  const { data, error } = await useFetch('/api/checkout', {
    method: 'POST',
    body: { address },
  });
  
  if (!error.value) {
    navigateTo('/checkout/confirm');
  }
}
</script>
```

#### Environment Variables

```env
# .env
NUXT_PUBLIC_VEYFORM_API_KEY=vey_prod_xxxxxxxxxx
```

---

### React (SPA)

```tsx
// App.tsx
import { VeyformAddressForm } from '@vey/react';

function App() {
  return (
    <div className="App">
      <VeyformAddressForm
        config={{
          apiKey: import.meta.env.VITE_VEYFORM_API_KEY,
          domainAutoDetect: true,
          defaultLanguage: 'en',
          enableAnalytics: true,
        }}
        onSubmit={(data) => {
          console.log('Address:', data);
        }}
        theme="light"
      />
    </div>
  );
}

export default App;
```

---

### Vue (SPA)

```vue
<template>
  <div id="app">
    <VeyformAddressForm
      :config="config"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { VeyformAddressForm } from '@vey/vue';

const config = {
  apiKey: import.meta.env.VITE_VEYFORM_API_KEY,
  domainAutoDetect: true,
  defaultLanguage: 'en',
  enableAnalytics: true,
};

function handleSubmit(data) {
  console.log('Address:', data);
}
</script>
```

---

### Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import { createVeyform } from '@vey/core';
  
  let veyformElement;
  
  onMount(() => {
    const veyform = createVeyform({
      apiKey: import.meta.env.VITE_VEYFORM_API_KEY,
      domainAutoDetect: true,
      defaultLanguage: 'en',
      enableAnalytics: true,
    });
    
    veyform.mount(veyformElement);
  });
</script>

<div bind:this={veyformElement}></div>
```

---

### Angular

```typescript
// app.component.ts
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { createVeyform, Veyform } from '@vey/core';

@Component({
  selector: 'app-root',
  template: '<div #veyform></div>',
})
export class AppComponent implements OnInit {
  @ViewChild('veyform') veyformElement!: ElementRef;
  private veyform?: Veyform;
  
  ngOnInit() {
    this.veyform = createVeyform({
      apiKey: environment.veyformApiKey,
      domainAutoDetect: true,
      defaultLanguage: 'en',
      enableAnalytics: true,
    });
    
    this.veyform.mount(this.veyformElement.nativeElement);
  }
}
```

---

## Custom Styling

### Shopify Liquid CSS

```liquid
<style>
  .veyform-address-form {
    font-family: {{ settings.type_body_font.family }};
  }
  
  .veyform-submit-btn {
    background: {{ settings.color_primary }};
    color: {{ settings.color_primary_text }};
  }
  
  .veyform-submit-btn:hover {
    background: {{ settings.color_primary | color_darken: 10 }};
  }
</style>
```

### Tailwind CSS

```tsx
<VeyformAddressForm
  config={config}
  className="max-w-2xl mx-auto"
  onSubmit={handleSubmit}
/>

<style global jsx>{`
  .veyform-field-input {
    @apply border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500;
  }
  
  .veyform-submit-btn {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg;
  }
`}</style>
```

---

## Testing

### Test Mode

```javascript
const veyform = createVeyform({
  apiKey: 'vey_test_xxxxxxxxxx',  // Use test key
  environment: 'sandbox',
  enableAnalytics: false,  // Disable in testing
});
```

### Cypress Test

```javascript
describe('Checkout with Veyform', () => {
  it('should submit address successfully', () => {
    cy.visit('/checkout');
    
    // Select country
    cy.get('.veyform-country-select').select('JP');
    
    // Fill in fields
    cy.get('input[name="postal_code"]').type('100-0001');
    cy.get('input[name="province"]').type('Tokyo');
    cy.get('input[name="city"]').type('Chiyoda');
    
    // Submit
    cy.get('.veyform-submit-btn').click();
    
    // Verify
    cy.url().should('include', '/confirm');
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue: Country dropdown is empty**

```javascript
// Check if CountryRegistry is initialized
import { CountryRegistry } from '@vey/core';
CountryRegistry.init();
```

**Issue: Analytics not working**

```javascript
// Verify endpoint and API key
const veyform = createVeyform({
  apiKey: 'vey_prod_xxxxxxxxxx',  // Must be production key
  enableAnalytics: true,
  analyticsEndpoint: 'https://api.vey.dev/api/analytics/events'
});
```

**Issue: Validation too strict**

```javascript
// Lower validation level
const veyform = createVeyform({
  validationLevel: 'medium'  // or 'loose'
});
```

---

## Support

- Documentation: https://vey.dev/docs
- Integration Help: integration@vey.dev
- Community: https://community.vey.dev
