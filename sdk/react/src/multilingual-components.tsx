/**
 * @vey/react - Multilingual Address Form Component
 * Supports multiple languages per country with language tabs
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type {
  AddressInput,
  ValidationResult,
  CountryAddressFormat,
  Language,
  TranslationServiceConfig,
} from '@vey/core';
import {
  useVeyClient,
  useAddressForm,
  useAddressValidation,
  useCountryFormat,
  useRequiredFields,
} from './hooks';
import { translate } from '@vey/core';

// Default field labels in English
const defaultFieldLabels: Record<string, string> = {
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

// Styles for components
const defaultStyles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  languageTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px',
  },
  languageTab: {
    padding: '8px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#666',
    transition: 'all 0.2s',
    borderBottom: '2px solid transparent',
    marginBottom: '-10px',
  },
  languageTabActive: {
    color: '#007bff',
    borderBottom: '2px solid #007bff',
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
  translationNote: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '4px',
  },
};

export interface MultilingualAddressFormProps {
  countryCode: string;
  initialValue?: AddressInput;
  onSubmit?: (address: AddressInput, validation: ValidationResult) => void;
  onChange?: (address: AddressInput) => void;
  styles?: Partial<typeof defaultStyles>;
  submitLabel?: string;
  showValidation?: boolean;
  translationConfig?: TranslationServiceConfig;
  enableTranslation?: boolean;
  defaultLanguage?: string;
}

/**
 * Multilingual address form component with language tabs
 */
export function MultilingualAddressForm({
  countryCode,
  initialValue = {},
  onSubmit,
  onChange,
  styles = {},
  submitLabel = 'Submit',
  showValidation = true,
  translationConfig = {
    service: 'libretranslate',
    endpoint: 'https://libretranslate.com',
    timeout: 10000,
  },
  enableTranslation = true,
  defaultLanguage,
}: MultilingualAddressFormProps): JSX.Element {
  const { address, updateField } = useAddressForm(initialValue);
  const { validate, result, isValidating, errors } = useAddressValidation(countryCode);
  const { fields: requiredFields } = useRequiredFields(countryCode);
  const { format } = useCountryFormat(countryCode);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>(defaultFieldLabels);
  const [countryData, setCountryData] = useState<CountryAddressFormat | null>(null);
  const [translating, setTranslating] = useState(false);

  const mergedStyles = { ...defaultStyles, ...styles };

  // Load country data and set default language
  useEffect(() => {
    const loadCountryData = async () => {
      if (!format) return;
      setCountryData(format);

      // Determine default language
      if (format.languages && format.languages.length > 0) {
        const defaultLang = defaultLanguage || 
          format.languages.find((l) => l.role === 'official')?.code ||
          format.languages.find((l) => l.required_for_shipping)?.code ||
          'en';
        setSelectedLanguage(defaultLang);
      }
    };

    loadCountryData();
  }, [format, defaultLanguage]);

  // Update field labels when language changes
  useEffect(() => {
    const updateLabels = async () => {
      if (!countryData || !enableTranslation) return;

      const currentLang = countryData.languages.find(
        (l) => l.code === selectedLanguage
      );

      if (currentLang?.field_labels) {
        // Use pre-defined field labels if available
        setFieldLabels({ ...defaultFieldLabels, ...currentLang.field_labels });
      } else if (selectedLanguage !== 'en' && translationConfig) {
        // Translate field labels dynamically
        setTranslating(true);
        try {
          const translatedLabels: Record<string, string> = {};
          
          for (const [field, label] of Object.entries(defaultFieldLabels)) {
            try {
              const result = await translate(
                {
                  text: label,
                  sourceLang: 'en',
                  targetLang: selectedLanguage,
                  field,
                  countryCode,
                },
                translationConfig
              );
              translatedLabels[field] = result.translatedText;
            } catch (error) {
              console.error(`Failed to translate ${field}:`, error);
              translatedLabels[field] = label; // Fallback to English
            }
          }

          setFieldLabels(translatedLabels);
        } catch (error) {
          console.error('Translation error:', error);
          setFieldLabels(defaultFieldLabels);
        } finally {
          setTranslating(false);
        }
      } else {
        // Use English labels
        setFieldLabels(defaultFieldLabels);
      }
    };

    updateLabels();
  }, [selectedLanguage, countryData, enableTranslation, translationConfig, countryCode]);

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

  // Get available languages for this country
  const availableLanguages = countryData?.languages || [];

  // Filter languages to show in tabs
  const languagesToShow = availableLanguages.filter(
    (lang) => 
      lang.role === 'official' || 
      lang.role === 'co-official' ||
      lang.required_for_shipping
  );

  // Always include English if not already present
  if (!languagesToShow.some((l) => l.code === 'en')) {
    languagesToShow.push({
      name: 'English',
      code: 'en',
      script: 'Latin',
      direction: 'ltr',
      role: 'auxiliary',
      required_for_shipping: true,
    });
  }

  return (
    <form style={mergedStyles.form} onSubmit={handleSubmit}>
      {/* Language Tabs */}
      {languagesToShow.length > 1 && (
        <div style={mergedStyles.languageTabs}>
          {languagesToShow.map((lang) => (
            <button
              key={lang.code || lang.name}
              type="button"
              onClick={() => setSelectedLanguage(lang.code || 'en')}
              style={{
                ...mergedStyles.languageTab,
                ...(selectedLanguage === (lang.code || 'en')
                  ? mergedStyles.languageTabActive
                  : {}),
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {translating && (
        <div style={mergedStyles.translationNote}>
          Translating labels to {selectedLanguage}...
        </div>
      )}

      {/* Address Fields */}
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
              dir={
                availableLanguages.find((l) => l.code === selectedLanguage)
                  ?.direction || 'ltr'
              }
            />
            {showValidation && fieldError && (
              <span style={mergedStyles.error}>{fieldError.message}</span>
            )}
          </div>
        );
      })}

      <button type="submit" style={mergedStyles.button} disabled={isValidating || translating}>
        {isValidating ? 'Validating...' : translating ? 'Translating...' : submitLabel}
      </button>
    </form>
  );
}
