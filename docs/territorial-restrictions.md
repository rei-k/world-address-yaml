# Territorial Restrictions Documentation

## Overview

This document describes the territorial restrictions system implemented to ensure Japanese territories can only be entered using Japanese language names in international address forms.

## Background

According to Japanese government policy, certain territorial locations must be referred to using their official Japanese names in all systems, particularly in international contexts. This system enforces those requirements at the form validation level.

## Covered Territories

### 1. Northern Territories (北方領土)
**Blocked Languages:** Russian  
**Allowed Names:**
- 北方領土 (Hoppō Ryōdo)
- 択捉島 (Etorofu-tō)
- 国後島 (Kunashiri-tō)
- 色丹島 (Shikotan-tō)
- 歯舞群島 (Habomai-guntō)

**Blocked Names:**
- Russian: Курильские острова, Итуруп, Кунашир, etc.
- English transliterations: Kuril, Iturup, Kunashir, etc.

### 2. Takeshima (竹島)
**Blocked Languages:** Korean  
**Allowed Names:**
- 竹島 (Takeshima)
- タケシマ

**Blocked Names:**
- Korean: 독도, 獨島
- English transliteration: Dokdo

### 3. Senkaku Islands (尖閣諸島)
**Blocked Languages:** Chinese (Simplified and Traditional)  
**Allowed Names:**
- 尖閣諸島 (Senkaku-shotō)
- 魚釣島 (Uotsuri-jima)
- 北小島, 南小島, 久場島, 大正島

**Blocked Names:**
- Chinese: 钓鱼岛, 釣魚島, 钓鱼台, 釣魚台
- English transliterations: Diaoyu, Diaoyutai

### 4. Karafuto (樺太)
**Blocked Languages:** Russian  
**Allowed Names:**
- 樺太 (Karafuto)
- カラフト
- 南樺太

**Blocked Names:**
- Russian: Сахалин, Южный Сахалин
- English transliteration: Sakhalin

## Implementation

### Core Functions

#### `isBlockedTerritorialName(locationName: string): boolean`
Checks if a location name contains any blocked foreign names.

```typescript
import { isBlockedTerritorialName } from '@vey/core';

console.log(isBlockedTerritorialName('Kuril')); // true
console.log(isBlockedTerritorialName('北方領土')); // false
```

#### `isBlockedLanguageForJapan(languageCode: string): boolean`
Checks if a language code is blocked for Japanese territories.

```typescript
import { isBlockedLanguageForJapan } from '@vey/core';

console.log(isBlockedLanguageForJapan('ru')); // true
console.log(isBlockedLanguageForJapan('ko')); // true
console.log(isBlockedLanguageForJapan('ja')); // false
```

#### `validateJapaneseTerritorialInput(locationName: string, languageCode?: string)`
Validates territorial input and provides suggestions.

```typescript
import { validateJapaneseTerritorialInput } from '@vey/core';

const result = validateJapaneseTerritorialInput('Dokdo');
console.log(result);
// {
//   valid: false,
//   reason: 'Takeshima - Must use Japanese names only',
//   suggestion: '竹島'
// }
```

### Integration with Address Validation

The territorial restrictions are automatically enforced when validating Japanese addresses:

```typescript
import { validateAddress } from '@vey/core';

const address = {
  country: 'JP',
  province: '北海道',
  city: 'Kuril',  // Blocked!
  postal_code: '087-0001',
};

const result = validateAddress(address, japanFormat, { languageCode: 'ru' });
console.log(result.errors);
// [
//   {
//     field: 'city',
//     code: 'TERRITORIAL_RESTRICTION',
//     message: 'Location name violates territorial restrictions'
//   }
// ]
```

## Usage in Forms

### Mini-Programs

```typescript
import { validateAddressLocation } from '@/utils/validation';

const locationValidation = validateAddressLocation(
  cityInput,
  'JP',
  currentLanguage
);

if (!locationValidation.valid) {
  showError(locationValidation.reason);
}
```

### Veyform

The Veyform address input automatically validates territorial restrictions for Japanese addresses.

## Testing

Comprehensive tests are available in `sdk/core/tests/territorial-restrictions.test.ts`:

```bash
cd sdk/core
npm test -- territorial-restrictions.test.ts
```

All 19 tests cover:
- Blocking of foreign language names
- Allowing Japanese names
- Language code validation
- Case insensitivity
- Partial string matching
- Proper suggestions

## Error Messages

When a territorial restriction is violated, users receive:
1. **Error**: Clear message indicating the restriction
2. **Suggestion**: The correct Japanese name to use
3. **Validation failure**: Form submission is blocked

## Compliance

This implementation ensures compliance with Japanese government requirements for territorial naming in international systems and forms.
