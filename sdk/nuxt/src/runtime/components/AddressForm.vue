<template>
  <div class="vey-address-form">
    <div class="form-group">
      <label for="country">Country</label>
      <select id="country" v-model="countryCode" @change="errors = []">
        <option value="">Select a country</option>
        <option v-for="country in countries" :key="country.code" :value="country.code">
          {{ country.name }}
        </option>
      </select>
    </div>

    <div v-if="countryCode" class="form-group">
      <label for="street">Street Address</label>
      <input id="street" v-model="address.street" type="text" />
    </div>

    <div v-if="countryCode" class="form-group">
      <label for="city">City</label>
      <input id="city" v-model="address.city" type="text" />
    </div>

    <div v-if="countryCode" class="form-group">
      <label for="postalCode">Postal Code</label>
      <input id="postalCode" v-model="address.postalCode" type="text" />
    </div>

    <button @click="handleSubmit" :disabled="!countryCode || isValidating">
      {{ isValidating ? 'Validating...' : submitLabel }}
    </button>

    <div v-if="errors.length > 0" class="validation-errors">
      <ul>
        <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAddressValidation } from '../composables/useAddressValidation';

const props = defineProps<{
  countryCode?: string;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [{ address: any; validation: any }];
}>();

const { validate, isValidating, errors } = useAddressValidation();

const countryCode = ref(props.countryCode || '');
const address = ref({
  street: '',
  city: '',
  postalCode: ''
});

const countries = [
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' }
];

async function handleSubmit() {
  const validation = await validate(address.value, countryCode.value);
  
  if (validation.valid) {
    emit('submit', { address: address.value, validation });
  }
}
</script>

<style scoped>
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
  background-color: #00dc82;
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
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}
</style>
