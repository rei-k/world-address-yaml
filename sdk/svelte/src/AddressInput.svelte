<script lang="ts">
  export let value: string = '';
  export let countryCode: string = '';
  export let placeholder: string = '';
  export let label: string = '';

  function handleInput(event: Event) {
    value = (event.target as HTMLInputElement).value;
  }
</script>

<div class="address-input">
  {#if label}
    <label for="address-input">{label}</label>
  {/if}
  <input
    id="address-input"
    type="text"
    {value}
    {placeholder}
    on:input={handleInput}
    on:blur
    on:focus
  />
</div>

<style>
  .address-input {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>
