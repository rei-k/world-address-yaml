/**
 * @vey/react - React components for address forms
 */

import React, { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { AddressInput, ValidationResult } from '@vey/core';
import {
  useVeyClient,
  useAddressForm,
  useAddressValidation,
  useCountryFormat,
  useRequiredFields,
} from './hooks';

// Styles for components
const defaultStyles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  error: {
    color: '#dc3545',
    fontSize: '12px',
  },
  warning: {
    color: '#ffc107',
    fontSize: '12px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

// Field labels
const fieldLabels: Record<string, string> = {
  recipient: 'Recipient',
  building: 'Building',
  floor: 'Floor',
  room: 'Room',
  unit: 'Unit',
  street_address: 'Street Address',
  district: 'District',
  ward: 'Ward',
  city: 'City',
  province: 'State/Province',
  postal_code: 'Postal Code',
  country: 'Country',
};

export interface AddressFormProps {
  countryCode: string;
  initialValue?: AddressInput;
  onSubmit?: (address: AddressInput, validation: ValidationResult) => void;
  onChange?: (address: AddressInput) => void;
  styles?: Partial<typeof defaultStyles>;
  submitLabel?: string;
  showValidation?: boolean;
}

/**
 * Complete address form component
 */
export function AddressForm({
  countryCode,
  initialValue = {},
  onSubmit,
  onChange,
  styles = {},
  submitLabel = 'Submit',
  showValidation = true,
}: AddressFormProps): JSX.Element {
  const { address, updateField } = useAddressForm(initialValue);
  const { validate, result, isValidating, errors } = useAddressValidation(countryCode);
  const { fields: requiredFields } = useRequiredFields(countryCode);
  const { format } = useCountryFormat(countryCode);

  const mergedStyles = { ...defaultStyles, ...styles };

  const handleChange = useCallback(
    (field: keyof AddressInput, value: string) => {
      updateField(field, value);
      onChange?.({ ...address, [field]: value });
    },
    [updateField, onChange, address]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationResult = await validate(address);
      onSubmit?.(address, validationResult);
    },
    [validate, address, onSubmit]
  );

  const getFieldError = (field: string) => {
    return errors.find((err) => err.field === field);
  };

  const fields: (keyof AddressInput)[] = [
    'recipient',
    'building',
    'floor',
    'room',
    'street_address',
    'district',
    'ward',
    'city',
    'province',
    'postal_code',
    'country',
  ];

  return (
    <form style={mergedStyles.form} onSubmit={handleSubmit}>
      {fields.map((field) => {
        const isRequired = requiredFields.includes(field);
        const fieldError = getFieldError(field);

        return (
          <div key={field} style={mergedStyles.fieldGroup}>
            <label style={mergedStyles.label}>
              {fieldLabels[field]}
              {isRequired && ' *'}
            </label>
            <input
              type="text"
              value={address[field] ?? ''}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{
                ...mergedStyles.input,
                ...(fieldError ? mergedStyles.inputError : {}),
              }}
              required={isRequired}
            />
            {showValidation && fieldError && (
              <span style={mergedStyles.error}>{fieldError.message}</span>
            )}
          </div>
        );
      })}
      <button type="submit" style={mergedStyles.button} disabled={isValidating}>
        {isValidating ? 'Validating...' : submitLabel}
      </button>
    </form>
  );
}

export interface AddressFieldProps {
  field: keyof AddressInput;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  style?: CSSProperties;
}

/**
 * Single address field component
 */
export function AddressField({
  field,
  value,
  onChange,
  label,
  required = false,
  error,
  placeholder,
  style,
}: AddressFieldProps): JSX.Element {
  return (
    <div style={defaultStyles.fieldGroup}>
      <label style={defaultStyles.label}>
        {label ?? fieldLabels[field]}
        {required && ' *'}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          ...defaultStyles.input,
          ...(error ? defaultStyles.inputError : {}),
          ...style,
        }}
      />
      {error && <span style={defaultStyles.error}>{error}</span>}
    </div>
  );
}

export interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  label?: string;
  style?: CSSProperties;
}

/**
 * Country selection dropdown
 */
export function CountrySelect({
  value,
  onChange,
  label = 'Country',
  style,
}: CountrySelectProps): JSX.Element {
  // Common countries - would be loaded from data
  const countries = [
    { code: 'JP', name: 'Japan' },
    { code: 'US', name: 'United States' },
    { code: 'CN', name: 'China' },
    { code: 'KR', name: 'South Korea' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
  ];

  return (
    <div style={defaultStyles.fieldGroup}>
      <label style={defaultStyles.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...defaultStyles.input, ...style }}
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
