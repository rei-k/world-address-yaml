/**
 * Pricing Calculator Usage Examples
 * 配送料金計算の使用例
 * 
 * This file demonstrates how to use the pricing calculator
 * for various shipping scenarios.
 */

import {
  PricingCalculator,
  createDefaultPricingCalculator,
  formatPrice,
  calculateDistance
} from '../src/pricing';
import { Shipment } from '../src/types';

// ========================================
// Example 1: Simple Domestic Shipment
// ========================================

console.log('\n========== Example 1: Simple Domestic Shipment ==========');

const domesticShipment: Shipment = {
  sender: {
    name: 'John Doe',
    phone: '555-1234',
    address: {
      country: 'US',
      province: 'CA',
      city: 'Los Angeles',
      street: '123 Main St',
      postalCode: '90001',
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
      postalCode: '94102',
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

const calculator = createDefaultPricingCalculator('USD');
const domesticQuote = calculator.calculate(domesticShipment);

console.log('Domestic Shipment Quote:');
console.log(`  Total: ${formatPrice(domesticQuote.amount, domesticQuote.currency)}`);
console.log(`  Service Type: ${domesticQuote.serviceType}`);
console.log(`  Estimated Delivery: ${domesticQuote.estimatedDays} days`);
console.log('\nBreakdown:');
console.log(`  Base Price: $${domesticQuote.breakdown.basePrice.toFixed(2)}`);
console.log(`  Weight Charge: $${domesticQuote.breakdown.weightCharge.toFixed(2)}`);
console.log(`  Distance Charge: $${domesticQuote.breakdown.distanceCharge.toFixed(2)}`);
console.log(`  Fuel Surcharge: $${domesticQuote.breakdown.fuelSurcharge.toFixed(2)}`);
console.log(`  Subtotal: $${domesticQuote.breakdown.subtotal.toFixed(2)}`);
console.log(`  Tax: $${domesticQuote.breakdown.taxAmount.toFixed(2)}`);

// ========================================
// Example 2: International Shipment with Insurance
// ========================================

console.log('\n\n========== Example 2: International Shipment with Insurance ==========');

const internationalShipment: Shipment = {
  sender: {
    name: 'Alice Johnson',
    phone: '+1-555-1234',
    address: {
      country: 'US',
      province: 'NY',
      city: 'New York',
      street: '789 Broadway',
      postalCode: '10001'
    }
  },
  recipient: {
    name: '田中太郎',
    phone: '+81-90-1234-5678',
    address: {
      country: 'JP',
      province: '東京都',
      city: '渋谷区',
      street: '渋谷1-1-1',
      postalCode: '150-0001'
    }
  },
  items: [
    {
      name: 'Precision Instruments',
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

const internationalQuote = calculator.calculate(internationalShipment);

console.log('International Express Shipment Quote:');
console.log(`  Total: ${formatPrice(internationalQuote.amount, internationalQuote.currency)}`);
console.log(`  Service Type: ${internationalQuote.serviceType}`);
console.log(`  Estimated Delivery: ${internationalQuote.estimatedDays} days`);
console.log(`  Valid Until: ${internationalQuote.validUntil.toISOString()}`);
console.log('\nBreakdown:');
console.log(`  Base Price: $${internationalQuote.breakdown.basePrice.toFixed(2)}`);
console.log(`  Weight Charge: $${internationalQuote.breakdown.weightCharge.toFixed(2)}`);
console.log(`  Distance Charge: $${internationalQuote.breakdown.distanceCharge.toFixed(2)}`);
console.log(`  Insurance: $${internationalQuote.breakdown.insuranceCharge.toFixed(2)}`);
console.log(`  Service Multiplier: ${internationalQuote.breakdown.serviceMultiplier}x`);
console.log(`  Subtotal: $${internationalQuote.breakdown.subtotal.toFixed(2)}`);
console.log(`  Tax (Japan 10%): $${internationalQuote.breakdown.taxAmount.toFixed(2)}`);

// ========================================
// Example 3: Japan Domestic with Yamato Transport Pricing
// ========================================

console.log('\n\n========== Example 3: Japan Domestic Shipment ==========');

const japanShipment: Shipment = {
  sender: {
    name: '山田太郎',
    phone: '03-1234-5678',
    address: {
      country: 'JP',
      province: '東京都',
      city: '千代田区',
      street: '千代田1-1',
      postalCode: '100-0001',
      coordinates: {
        latitude: 35.6762,
        longitude: 139.6503
      }
    }
  },
  recipient: {
    name: '佐藤花子',
    phone: '06-8765-4321',
    address: {
      country: 'JP',
      province: '大阪府',
      city: '大阪市',
      street: '北区梅田1-1',
      postalCode: '530-0001',
      coordinates: {
        latitude: 34.6937,
        longitude: 135.5023
      }
    }
  },
  items: [
    {
      name: 'お土産',
      quantity: 2,
      weight: 1.5,
      value: 3000,
      currency: 'JPY'
    }
  ],
  paymentMethod: 'SENDER_PAY'
};

const jpyCalculator = createDefaultPricingCalculator('JPY');
const japanQuote = jpyCalculator.calculate(japanShipment);

// Calculate actual distance
const distance = calculateDistance(35.6762, 139.6503, 34.6937, 135.5023);

console.log('Japan Domestic Shipment Quote:');
console.log(`  Distance: ${distance.toFixed(1)} km`);
console.log(`  Total: ${formatPrice(japanQuote.amount, japanQuote.currency)}`);
console.log(`  Service Type: ${japanQuote.serviceType}`);
console.log(`  Estimated Delivery: ${japanQuote.estimatedDays} days`);
console.log('\nBreakdown:');
console.log(`  Base Price: ¥${japanQuote.breakdown.basePrice.toFixed(0)}`);
console.log(`  Weight Charge: ¥${japanQuote.breakdown.weightCharge.toFixed(0)}`);
console.log(`  Distance Charge: ¥${japanQuote.breakdown.distanceCharge.toFixed(0)}`);
console.log(`  Fuel Surcharge: ¥${japanQuote.breakdown.fuelSurcharge.toFixed(0)}`);
console.log(`  Subtotal: ¥${japanQuote.breakdown.subtotal.toFixed(0)}`);
console.log(`  Tax (10%): ¥${japanQuote.breakdown.taxAmount.toFixed(0)}`);

// ========================================
// Example 4: China Domestic with SF Express Pricing
// ========================================

console.log('\n\n========== Example 4: China Domestic Shipment ==========');

const chinaShipment: Shipment = {
  sender: {
    name: '李明',
    phone: '010-12345678',
    address: {
      country: 'CN',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '建国路1号',
      postalCode: '100000'
    }
  },
  recipient: {
    name: '王芳',
    phone: '021-87654321',
    address: {
      country: 'CN',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      street: '世纪大道1号',
      postalCode: '200120'
    }
  },
  items: [
    {
      name: '电子产品',
      quantity: 1,
      weight: 3.0,
      value: 2000,
      currency: 'CNY'
    }
  ],
  deliveryRequirement: 'STANDARD',
  paymentMethod: 'SENDER_PAY'
};

const cnyCalculator = createDefaultPricingCalculator('CNY');
const chinaQuote = cnyCalculator.calculate(chinaShipment);

console.log('China Domestic Shipment Quote:');
console.log(`  Total: ${formatPrice(chinaQuote.amount, chinaQuote.currency)}`);
console.log(`  Service Type: ${chinaQuote.serviceType}`);
console.log(`  Estimated Delivery: ${chinaQuote.estimatedDays} days`);
console.log('\nBreakdown:');
console.log(`  Base Price: ¥${chinaQuote.breakdown.basePrice.toFixed(2)}`);
console.log(`  Weight Charge: ¥${chinaQuote.breakdown.weightCharge.toFixed(2)}`);
console.log(`  Distance Charge: ¥${chinaQuote.breakdown.distanceCharge.toFixed(2)}`);
console.log(`  Fuel Surcharge: ¥${chinaQuote.breakdown.fuelSurcharge.toFixed(2)}`);
console.log(`  Subtotal: ¥${chinaQuote.breakdown.subtotal.toFixed(2)}`);
console.log(`  Tax (13%): ¥${chinaQuote.breakdown.taxAmount.toFixed(2)}`);

// ========================================
// Example 5: Heavy/Bulky Package with Dimensional Weight
// ========================================

console.log('\n\n========== Example 5: Heavy/Bulky Package ==========');

const bulkyShipment: Shipment = {
  sender: {
    name: 'Company A',
    phone: '555-0001',
    address: {
      country: 'US',
      province: 'CA',
      city: 'San Diego',
      street: '100 Industrial Blvd',
      postalCode: '92101'
    }
  },
  recipient: {
    name: 'Company B',
    phone: '555-0002',
    address: {
      country: 'US',
      province: 'WA',
      city: 'Seattle',
      street: '200 Business Park',
      postalCode: '98101'
    }
  },
  items: [
    {
      name: 'Large Equipment',
      quantity: 1,
      weight: 10,
      volume: 0.5, // 0.5 m³ - very bulky
      value: 2000,
      currency: 'USD'
    }
  ],
  deliveryRequirement: 'ECONOMY',
  paymentMethod: 'SENDER_PAY'
};

const bulkyQuote = calculator.calculate(bulkyShipment);

console.log('Bulky Package Quote:');
console.log(`  Total: ${formatPrice(bulkyQuote.amount, bulkyQuote.currency)}`);
console.log(`  Service Type: ${bulkyQuote.serviceType}`);
console.log(`  Estimated Delivery: ${bulkyQuote.estimatedDays} days`);
console.log('\nBreakdown:');
console.log(`  Base Price: $${bulkyQuote.breakdown.basePrice.toFixed(2)}`);
console.log(`  Weight Charge: $${bulkyQuote.breakdown.weightCharge.toFixed(2)}`);
console.log(`  Dimensional Weight Charge: $${bulkyQuote.breakdown.dimensionalWeightCharge.toFixed(2)}`);
console.log(`  Distance Charge: $${bulkyQuote.breakdown.distanceCharge.toFixed(2)}`);
console.log(`  Service Multiplier (Economy): ${bulkyQuote.breakdown.serviceMultiplier}x`);
console.log(`  Subtotal: $${bulkyQuote.breakdown.subtotal.toFixed(2)}`);

// ========================================
// Example 6: Custom Configuration
// ========================================

console.log('\n\n========== Example 6: Custom Pricing Configuration ==========');

const customCalculator = new PricingCalculator({
  currency: 'USD',
  domesticBase: 15,
  internationalBase: 50,
  weightBrackets: [
    { from: 0, upTo: 2, pricePerKg: 5 },
    { from: 2, upTo: 10, pricePerKg: 4 },
    { from: 10, upTo: Infinity, pricePerKg: 3 }
  ],
  distanceBrackets: [
    { upTo: 200, price: 5 },
    { upTo: 1000, price: 15 },
    { upTo: Infinity, price: 30 }
  ],
  pricePerExtraKm: 0.02,
  fuelSurchargeRate: 0.20, // 20% fuel surcharge
  insuranceRate: 0.015,    // 1.5% insurance
  dimensionalFactor: 5000,
  dimensionalWeightRate: 3,
  serviceMultipliers: {
    'ECONOMY': 0.75,
    'STANDARD': 1.0,
    'EXPRESS': 2.0 // Premium express
  },
  regionalAdjustments: {
    'AK': 25, // Alaska surcharge
    'HI': 20  // Hawaii surcharge
  },
  taxRates: {
    'US': 0.0
  },
  quoteValidityHours: 48
});

const customQuote = customCalculator.calculate(domesticShipment);

console.log('Custom Configuration Quote:');
console.log(`  Total: ${formatPrice(customQuote.amount, customQuote.currency)}`);
console.log(`  Configuration:`);
console.log(`    - Higher base price: $15`);
console.log(`    - Higher fuel surcharge: 20%`);
console.log(`    - Quote valid for: 48 hours`);
console.log(`  Subtotal: $${customQuote.breakdown.subtotal.toFixed(2)}`);

// ========================================
// Example 7: Compare Service Types
// ========================================

console.log('\n\n========== Example 7: Compare Service Types ==========');

const comparisonShipment: Shipment = {
  sender: {
    name: 'Sender',
    phone: '555-1111',
    address: {
      country: 'US',
      province: 'TX',
      city: 'Dallas',
      street: '1 Main St',
      postalCode: '75201'
    }
  },
  recipient: {
    name: 'Recipient',
    phone: '555-2222',
    address: {
      country: 'US',
      province: 'FL',
      city: 'Miami',
      street: '2 Ocean Dr',
      postalCode: '33139'
    }
  },
  items: [
    {
      name: 'Documents',
      quantity: 1,
      weight: 0.5,
      value: 50,
      currency: 'USD'
    }
  ],
  paymentMethod: 'SENDER_PAY'
};

const services: Array<'ECONOMY' | 'STANDARD' | 'EXPRESS'> = ['ECONOMY', 'STANDARD', 'EXPRESS'];

console.log('Service Type Comparison:');
services.forEach(service => {
  comparisonShipment.deliveryRequirement = service;
  const quote = calculator.calculate(comparisonShipment);
  
  console.log(`\n  ${service}:`);
  console.log(`    Price: ${formatPrice(quote.amount, quote.currency)}`);
  console.log(`    Delivery: ${quote.estimatedDays} days`);
  console.log(`    Multiplier: ${quote.breakdown.serviceMultiplier}x`);
});

console.log('\n\n========== Examples Complete ==========\n');
