# Pricing Calculator / 配送料金計算アルゴリズム

Comprehensive pricing algorithm for delivery services that calculates shipping costs based on multiple factors.

## Features / 機能

- ✅ **Weight-based pricing** - Progressive pricing tiers based on package weight
- ✅ **Distance-based pricing** - Charges based on delivery distance
- ✅ **Service type multipliers** - Economy, Standard, and Express options
- ✅ **Dimensional weight** - Accounts for bulky but light packages
- ✅ **Fuel surcharge** - Configurable fuel surcharge percentage
- ✅ **Insurance calculation** - Optional insurance based on declared value
- ✅ **Regional adjustments** - Surcharges for remote or difficult areas
- ✅ **Tax calculation** - Country-specific tax rates
- ✅ **Multi-currency support** - USD, JPY, CNY, EUR, GBP, and more
- ✅ **Delivery time estimation** - Estimated days based on service and distance

## Installation / インストール

```bash
npm install @vey/carriers
```

## Quick Start / クイックスタート

### Basic Usage

```typescript
import { createDefaultPricingCalculator } from '@vey/carriers';

// Create calculator with default USD configuration
const calculator = createDefaultPricingCalculator('USD');

// Define shipment
const shipment = {
  sender: {
    name: 'John Doe',
    phone: '555-1234',
    address: {
      country: 'US',
      province: 'CA',
      city: 'Los Angeles',
      street: '123 Main St',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    }
  },
  recipient: {
    name: 'Jane Smith',
    phone: '555-5678',
    address: {
      country: 'US',
      province: 'CA',
      city: 'San Francisco',
      street: '456 Market St',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    }
  },
  items: [
    {
      name: 'Electronics',
      quantity: 1,
      weight: 2.5,
      value: 500,
      currency: 'USD'
    }
  ],
  paymentMethod: 'SENDER_PAY'
};

// Calculate price
const quote = calculator.calculate(shipment);

console.log(`Total: $${quote.amount}`);
console.log(`Estimated delivery: ${quote.estimatedDays} days`);
console.log(`Valid until: ${quote.validUntil}`);
```

### With Different Service Types

```typescript
// Economy shipping
shipment.deliveryRequirement = 'ECONOMY';
const economyQuote = calculator.calculate(shipment);
console.log(`Economy: $${economyQuote.amount} (${economyQuote.estimatedDays} days)`);

// Standard shipping (default)
shipment.deliveryRequirement = 'STANDARD';
const standardQuote = calculator.calculate(shipment);
console.log(`Standard: $${standardQuote.amount} (${standardQuote.estimatedDays} days)`);

// Express shipping
shipment.deliveryRequirement = 'EXPRESS';
const expressQuote = calculator.calculate(shipment);
console.log(`Express: $${expressQuote.amount} (${expressQuote.estimatedDays} days)`);
```

### International Shipment with Insurance

```typescript
const internationalShipment = {
  sender: {
    name: 'US Company',
    phone: '+1-555-1234',
    address: {
      country: 'US',
      province: 'NY',
      city: 'New York',
      street: '789 Broadway'
    }
  },
  recipient: {
    name: '田中太郎',
    phone: '+81-90-1234-5678',
    address: {
      country: 'JP',
      province: '東京都',
      city: '渋谷区',
      street: '渋谷1-1-1'
    }
  },
  items: [
    {
      name: 'Precision Equipment',
      quantity: 1,
      weight: 5.0,
      value: 5000,
      currency: 'USD'
    }
  ],
  insurance: {
    value: 5000,
    currency: 'USD'
  },
  deliveryRequirement: 'EXPRESS',
  paymentMethod: 'SENDER_PAY'
};

const quote = calculator.calculate(internationalShipment);

console.log('Breakdown:');
console.log(`  Base: $${quote.breakdown.basePrice}`);
console.log(`  Weight: $${quote.breakdown.weightCharge}`);
console.log(`  Distance: $${quote.breakdown.distanceCharge}`);
console.log(`  Insurance: $${quote.breakdown.insuranceCharge}`);
console.log(`  Fuel: $${quote.breakdown.fuelSurcharge}`);
console.log(`  Tax: $${quote.breakdown.taxAmount}`);
console.log(`  Total: $${quote.amount}`);
```

## Configuration / 設定

### Default Configuration

The default calculator comes pre-configured with standard rates for USD, JPY, and CNY:

```typescript
import { createDefaultPricingCalculator } from '@vey/carriers';

// USD (default)
const usdCalculator = createDefaultPricingCalculator('USD');

// Japanese Yen
const jpyCalculator = createDefaultPricingCalculator('JPY');

// Chinese Yuan
const cnyCalculator = createDefaultPricingCalculator('CNY');
```

### Custom Configuration

```typescript
import { PricingCalculator } from '@vey/carriers';

const customCalculator = new PricingCalculator({
  currency: 'USD',
  domesticBase: 15,
  internationalBase: 50,
  
  // Weight brackets (progressive pricing)
  weightBrackets: [
    { from: 0, upTo: 1, pricePerKg: 5 },
    { from: 1, upTo: 5, pricePerKg: 4 },
    { from: 5, upTo: 10, pricePerKg: 3.5 },
    { from: 10, upTo: Infinity, pricePerKg: 3 }
  ],
  
  // Distance brackets
  distanceBrackets: [
    { upTo: 100, price: 5 },
    { upTo: 500, price: 10 },
    { upTo: 1000, price: 20 },
    { upTo: Infinity, price: 40 }
  ],
  
  pricePerExtraKm: 0.02,
  fuelSurchargeRate: 0.15, // 15%
  insuranceRate: 0.01,     // 1%
  dimensionalFactor: 5000,
  dimensionalWeightRate: 2.5,
  
  // Service multipliers
  serviceMultipliers: {
    'ECONOMY': 0.8,
    'STANDARD': 1.0,
    'EXPRESS': 1.5
  },
  
  // Regional surcharges
  regionalAdjustments: {
    'AK': 25, // Alaska
    'HI': 20, // Hawaii
    'GL': 50  // Greenland
  },
  
  // Tax rates by country
  taxRates: {
    'JP': 0.10,
    'CN': 0.13,
    'US': 0.0,
    'GB': 0.20
  },
  
  quoteValidityHours: 24
});
```

## Pricing Components / 料金構成

### 1. Base Price (基本料金)
- Domestic base for same-country shipments
- International base for cross-border shipments

### 2. Weight Charge (重量料金)
- Progressive pricing based on total weight
- Different rates for different weight brackets

### 3. Distance Charge (距離料金)
- Calculated using Haversine formula if coordinates provided
- Estimated based on countries if coordinates not available
- Bracket-based pricing

### 4. Service Multiplier (サービス種別)
- **Economy**: 0.8x (slower, cheaper)
- **Standard**: 1.0x (normal speed and price)
- **Express**: 1.5x (faster, premium)

### 5. Fuel Surcharge (燃料サーチャージ)
- Percentage of base + weight + distance charges
- Default: 15%

### 6. Insurance (保険)
- Optional, based on declared value
- Default: 1% of declared value
- Currency conversion handled automatically

### 7. Dimensional Weight (容積重量)
- Applies when package volume exceeds actual weight
- Standard factor: 5000 cm³/kg
- Only charges for excess dimensional weight

### 8. Regional Adjustment (地域調整)
- Surcharges for remote or difficult delivery areas
- Configured per country code

### 9. Tax (税金)
- Applied to subtotal
- Country-specific rates
- Examples: Japan 10%, China 13%, UK 20%

## Formula / 計算式

```
Subtotal = (Base + Weight + Distance + Fuel + Insurance + DimWeight + Regional) × ServiceMultiplier
Total = Subtotal + (Subtotal × TaxRate)
```

## Distance Calculation / 距離計算

### With Coordinates (座標あり)

Uses Haversine formula for accurate distance:

```typescript
import { calculateDistance } from '@vey/carriers';

// Tokyo to Osaka
const distance = calculateDistance(
  35.6762, 139.6503,  // Tokyo
  34.6937, 135.5023   // Osaka
);
// Returns ~400km
```

### Without Coordinates (座標なし)

Falls back to country-based estimation:
- Same country: 500 km (domestic average)
- Same continent: 2000 km
- Different continents: 8000 km

## Dimensional Weight / 容積重量

For bulky but light packages:

```typescript
const shipment = {
  // ... sender and recipient
  items: [
    {
      name: 'Large Box',
      quantity: 1,
      weight: 5,      // Actual weight: 5 kg
      volume: 0.2,    // Volume: 0.2 m³ = 200,000 cm³
      value: 100,
      currency: 'USD'
    }
  ],
  paymentMethod: 'SENDER_PAY'
};

// Dimensional weight = 200,000 cm³ / 5000 = 40 kg
// Since 40 kg > 5 kg, charges for excess 35 kg
```

## Utilities / ユーティリティ

### Format Price

```typescript
import { formatPrice } from '@vey/carriers';

formatPrice(42.50, 'USD');  // "$42.50"
formatPrice(4250, 'JPY');   // "¥4,250"
formatPrice(425, 'CNY');    // "CN¥425.00"
```

### Calculate Total Weight

```typescript
import { calculateTotalWeight } from '@vey/carriers';

const items = [
  { weight: 2.5, quantity: 2 },
  { weight: 1.0, quantity: 3 }
];

const total = calculateTotalWeight(items); // 8.0 kg
```

## Examples / 実例

See [examples/pricing-examples.ts](../examples/pricing-examples.ts) for comprehensive examples including:

1. Simple domestic shipment
2. International shipment with insurance
3. Japan domestic (Yamato Transport pricing)
4. China domestic (SF Express pricing)
5. Heavy/bulky package with dimensional weight
6. Custom configuration
7. Service type comparison

## API Reference

### `PricingCalculator`

#### Constructor

```typescript
new PricingCalculator(config: PricingConfig)
```

#### Methods

##### `calculate(shipment: Shipment): PricingResult`

Calculate pricing for a shipment.

##### `updateConfig(config: Partial<PricingConfig>): void`

Update calculator configuration.

##### `getConfig(): Readonly<PricingConfig>`

Get current configuration.

### `createDefaultPricingCalculator(currency: string): PricingCalculator`

Create a calculator with default configuration for specified currency.

Supported currencies: `'USD'`, `'JPY'`, `'CNY'`, `'EUR'`, `'GBP'`

## Testing / テスト

```bash
npm test -- pricing.test.ts
```

Tests cover:
- Distance calculations
- Domestic and international pricing
- Service type multipliers
- Insurance calculations
- Dimensional weight
- Regional adjustments
- Tax calculations
- Multi-currency support

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

## Support

For issues and questions:
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: https://github.com/rei-k/world-address-yaml/tree/main/docs
