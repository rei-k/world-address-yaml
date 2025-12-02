<script lang="ts">
  import { validateAddress, normalizeAddress } from '@vey/core';
  import { createEventDispatcher } from 'svelte';

  export let countryCode: string = '';
  export let submitLabel: string = 'Submit';

  const dispatch = createEventDispatcher();

  let address = {
    street: '',
    city: '',
    province: '',
    postalCode: ''
  };

  let errors: string[] = [];
  let isValidating = false;

  const countries = [
    { code: 'JP', name: 'Japan' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' }
  ];

  async function handleSubmit() {
    if (!countryCode) {
      errors = ['Please select a country'];
      return;
    }

    isValidating = true;
    errors = [];

    try {
      const validation = await validateAddress(address, countryCode);
      
      if (validation.valid) {
        const normalized = await normalizeAddress(address, countryCode);
        dispatch('submit', { address: normalized, validation });
      } else {
        errors = validation.errors || ['Invalid address'];
      }
    } catch (error) {
      errors = ['Validation failed: ' + error.message];
    } finally {
      isValidating = false;
    }
  }
</script>

<div class="vey-address-form">
  <div class="form-group">
    <label for="country">Country</label>
    <select id="country" bind:value={countryCode} on:change={() => errors = []}>
      <option value="">Select a country</option>
      {#each countries as country}
        <option value={country.code}>{country.name}</option>
      {/each}
    </select>
  </div>

  {#if countryCode}
    <div class="form-group">
      <label for="street">Street Address</label>
      <input id="street" type="text" bind:value={address.street} />
    </div>

    <div class="form-group">
      <label for="city">City</label>
      <input id="city" type="text" bind:value={address.city} />
    </div>

    <div class="form-group">
      <label for="province">Province/State</label>
      <input id="province" type="text" bind:value={address.province} />
    </div>

    <div class="form-group">
      <label for="postalCode">Postal Code</label>
      <input id="postalCode" type="text" bind:value={address.postalCode} />
    </div>

    <button on:click={handleSubmit} disabled={isValidating}>
      {isValidating ? 'Validating...' : submitLabel}
    </button>
  {/if}

  {#if errors.length > 0}
    <div class="validation-errors">
      <ul>
        {#each errors as error}
          <li>{error}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .vey-address-form {
    max-width: 500px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  input, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .validation-errors {
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    color: #721c24;
  }

  .validation-errors ul {
    margin: 0;
    padding-left: 1.25rem;
  }
</style>
