/**
 * Example: Multilingual Address Form Demo
 * 
 * This example demonstrates how to use the MultilingualAddressForm component
 * with different countries that have multiple official languages.
 */

import React, { useState } from 'react';
import { VeyProvider, MultilingualAddressForm } from '@vey/react';
import type { AddressInput, ValidationResult } from '@vey/core';

// Example 1: Switzerland (4 official languages: German, French, Italian, Romansh)
export function SwitzerlandAddressForm() {
  const [submittedAddress, setSubmittedAddress] = useState<AddressInput | null>(null);

  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Switzerland Address Form</h1>
        <p>Select a language tab to enter the address in that language.</p>
        
        <MultilingualAddressForm
          countryCode="CH"
          enableTranslation={true}
          translationConfig={{
            service: 'libretranslate',
            endpoint: 'https://libretranslate.com',
            timeout: 10000,
          }}
          onSubmit={(address: AddressInput, validation: ValidationResult) => {
            if (validation.valid) {
              console.log('Valid address submitted:', address);
              setSubmittedAddress(address);
            } else {
              console.error('Invalid address:', validation.errors);
            }
          }}
          submitLabel="Submit Address"
        />

        {submittedAddress && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0' }}>
            <h3>Submitted Address:</h3>
            <pre>{JSON.stringify(submittedAddress, null, 2)}</pre>
          </div>
        )}
      </div>
    </VeyProvider>
  );
}

// Example 2: South Africa (11 official languages)
export function SouthAfricaAddressForm() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>South Africa Address Form</h1>
        <p>
          South Africa has 11 official languages. This form shows English, Afrikaans, 
          and Zulu with pre-defined labels, and others can be added as needed.
        </p>
        
        <MultilingualAddressForm
          countryCode="ZA"
          defaultLanguage="en"
          enableTranslation={true}
          translationConfig={{
            service: 'libretranslate',
            endpoint: 'https://libretranslate.com',
          }}
          onSubmit={(address: AddressInput, validation: ValidationResult) => {
            if (validation.valid) {
              console.log('Valid South African address:', address);
            }
          }}
        />
      </div>
    </VeyProvider>
  );
}

// Example 3: India (Hindi and English)
export function IndiaAddressForm() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>India Address Form</h1>
        <p>Switch between Hindi (देवनागरी) and English.</p>
        
        <MultilingualAddressForm
          countryCode="IN"
          defaultLanguage="hi"
          enableTranslation={true}
          translationConfig={{
            service: 'libretranslate',
            endpoint: 'https://libretranslate.com',
          }}
          onSubmit={(address: AddressInput, validation: ValidationResult) => {
            if (validation.valid) {
              console.log('Valid Indian address:', address);
            }
          }}
        />
      </div>
    </VeyProvider>
  );
}

// Example 4: Japan (Japanese and English)
export function JapanAddressForm() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Japan Address Form</h1>
        <p>Switch between Japanese (日本語) and English.</p>
        
        <MultilingualAddressForm
          countryCode="JP"
          defaultLanguage="ja"
          enableTranslation={true}
          translationConfig={{
            service: 'libretranslate',
            endpoint: 'https://libretranslate.com',
          }}
          onSubmit={(address: AddressInput, validation: ValidationResult) => {
            if (validation.valid) {
              console.log('Valid Japanese address:', address);
            }
          }}
        />
      </div>
    </VeyProvider>
  );
}

// Example 5: Antarctica (English only)
export function AntarcticaAddressForm() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Antarctica Address Form</h1>
        <p>
          Antarctica has no official language. English is used as the working language 
          for international coordination.
        </p>
        
        <MultilingualAddressForm
          countryCode="AQ"
          enableTranslation={false} // No translation needed, English only
          onSubmit={(address: AddressInput, validation: ValidationResult) => {
            if (validation.valid) {
              console.log('Valid Antarctica research station address:', address);
            }
          }}
        />
      </div>
    </VeyProvider>
  );
}

// Example 6: Argentine Antarctica (Spanish and English)
export function ArgentineAntarcticaForm() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Argentine Antarctica Address Form</h1>
        <p>
          For Argentine Antarctic territories, Spanish (the claiming country's language) 
          and English are available.
        </p>
        
        <MultilingualAddressForm
          countryCode="AR_CLAIM"
          defaultLanguage="es"
          enableTranslation={true}
          translationConfig={{
            service: 'libretranslate',
            endpoint: 'https://libretranslate.com',
          }}
          onSubmit={(address: AddressInput, validation: ValidationResult) => {
            if (validation.valid) {
              console.log('Valid Argentine Antarctic address:', address);
            }
          }}
        />
      </div>
    </VeyProvider>
  );
}

// Main demo component showing all examples
export default function MultilingualFormDemo() {
  const [selectedExample, setSelectedExample] = useState<string>('switzerland');

  const examples: Record<string, { component: React.ComponentType; label: string }> = {
    switzerland: { component: SwitzerlandAddressForm, label: 'Switzerland (4 languages)' },
    southafrica: { component: SouthAfricaAddressForm, label: 'South Africa (11 languages)' },
    india: { component: IndiaAddressForm, label: 'India (Hindi + English)' },
    japan: { component: JapanAddressForm, label: 'Japan (Japanese + English)' },
    antarctica: { component: AntarcticaAddressForm, label: 'Antarctica (English only)' },
    argentina_antarctic: { component: ArgentineAntarcticaForm, label: 'Argentine Antarctica (Spanish + English)' },
  };

  const SelectedComponent = examples[selectedExample].component;

  return (
    <div>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        marginBottom: '20px',
        textAlign: 'center' 
      }}>
        <h2>Multilingual Address Form Examples</h2>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(examples).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setSelectedExample(key)}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedExample === key ? '#007bff' : '#fff',
                color: selectedExample === key ? '#fff' : '#000',
                border: '1px solid #007bff',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SelectedComponent />
    </div>
  );
}
