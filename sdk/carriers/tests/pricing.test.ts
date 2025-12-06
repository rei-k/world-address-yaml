/**
 * Pricing Calculator Tests
 * 配送料金計算アルゴリズムのテスト
 */

import {
  PricingCalculator,
  createDefaultPricingCalculator,
  calculateDistance,
  getRouteType,
  getDimensionalWeight,
  formatPrice,
  calculateTotalWeight,
  isValidCoordinates,
  estimateDistanceBetweenCountries
} from '../src/pricing';
import { Shipment } from '../src/types';

describe('Pricing Calculator', () => {
  describe('Utility Functions', () => {
    test('calculateDistance - Tokyo to Osaka', () => {
      // Tokyo: 35.6762° N, 139.6503° E
      // Osaka: 34.6937° N, 135.5023° E
      const distance = calculateDistance(35.6762, 139.6503, 34.6937, 135.5023);
      
      // Approximate distance should be around 400km
      expect(distance).toBeGreaterThan(350);
      expect(distance).toBeLessThan(450);
    });

    test('calculateDistance - New York to Los Angeles', () => {
      // NY: 40.7128° N, 74.0060° W
      // LA: 34.0522° N, 118.2437° W
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      
      // Approximate distance should be around 3900km
      expect(distance).toBeGreaterThan(3800);
      expect(distance).toBeLessThan(4000);
    });

    test('getRouteType - domestic', () => {
      expect(getRouteType('US', 'US')).toBe('domestic');
      expect(getRouteType('jp', 'JP')).toBe('domestic');
    });

    test('getRouteType - international', () => {
      expect(getRouteType('US', 'JP')).toBe('international');
      expect(getRouteType('CN', 'GB')).toBe('international');
    });

    test('getDimensionalWeight', () => {
      // 0.1 m³ = 100,000 cm³
      // With factor 5000: 100,000 / 5000 = 20 kg
      const weight = getDimensionalWeight(0.1, 5000);
      expect(weight).toBe(20);
    });

    test('formatPrice - USD', () => {
      const formatted = formatPrice(42.50, 'USD');
      expect(formatted).toContain('42.50');
      expect(formatted).toContain('$');
    });

    test('calculateTotalWeight', () => {
      const items = [
        { weight: 2.5, quantity: 2 },
        { weight: 1.0, quantity: 3 }
      ];
      expect(calculateTotalWeight(items)).toBe(8.0); // (2.5 * 2) + (1.0 * 3)
    });

    test('isValidCoordinates', () => {
      expect(isValidCoordinates(35.6762, 139.6503)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
    });

    test('estimateDistanceBetweenCountries - same country', () => {
      expect(estimateDistanceBetweenCountries('US', 'US')).toBe(500);
    });

    test('estimateDistanceBetweenCountries - same continent', () => {
      const distance = estimateDistanceBetweenCountries('US', 'CA');
      expect(distance).toBe(2000);
    });

    test('estimateDistanceBetweenCountries - different continents', () => {
      const distance = estimateDistanceBetweenCountries('US', 'JP');
      expect(distance).toBe(8000);
    });
  });

  describe('PricingCalculator - Domestic Shipments', () => {
    let calculator: PricingCalculator;
    let domesticShipment: Shipment;

    beforeEach(() => {
      calculator = createDefaultPricingCalculator('USD');
      
      domesticShipment = {
        sender: {
          name: 'John Doe',
          phone: '1234567890',
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
          phone: '0987654321',
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
            name: 'Package',
            quantity: 1,
            weight: 2.5,
            value: 100,
            currency: 'USD'
          }
        ],
        paymentMethod: 'SENDER_PAY'
      };
    });

    test('calculate - basic domestic shipment', () => {
      const result = calculator.calculate(domesticShipment);
      
      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('USD');
      expect(result.serviceType).toBe('STANDARD');
      expect(result.breakdown.basePrice).toBe(10); // Domestic base
      expect(result.breakdown.weightCharge).toBeGreaterThan(0);
      expect(result.breakdown.distanceCharge).toBeGreaterThan(0);
      expect(result.breakdown.fuelSurcharge).toBeGreaterThan(0);
      expect(result.breakdown.total).toBeGreaterThan(0);
    });

    test('calculate - with EXPRESS service', () => {
      domesticShipment.deliveryRequirement = 'EXPRESS';
      const result = calculator.calculate(domesticShipment);
      
      expect(result.serviceType).toBe('EXPRESS');
      expect(result.breakdown.serviceMultiplier).toBe(1.5);
      expect(result.estimatedDays).toBeLessThan(3);
    });

    test('calculate - with ECONOMY service', () => {
      domesticShipment.deliveryRequirement = 'ECONOMY';
      const result = calculator.calculate(domesticShipment);
      
      expect(result.serviceType).toBe('ECONOMY');
      expect(result.breakdown.serviceMultiplier).toBe(0.8);
    });

    test('calculate - with insurance', () => {
      domesticShipment.insurance = {
        value: 1000,
        currency: 'USD'
      };
      
      const result = calculator.calculate(domesticShipment);
      
      expect(result.breakdown.insuranceCharge).toBeGreaterThan(0);
      expect(result.breakdown.insuranceCharge).toBe(1000 * 0.01); // 1% insurance rate
    });

    test('calculate - heavy package', () => {
      domesticShipment.items = [
        {
          name: 'Heavy Package',
          quantity: 1,
          weight: 50,
          value: 500,
          currency: 'USD'
        }
      ];
      
      const result = calculator.calculate(domesticShipment);
      
      expect(result.breakdown.weightCharge).toBeGreaterThan(50);
    });

    test('calculate - with dimensional weight', () => {
      domesticShipment.items = [
        {
          name: 'Large Package',
          quantity: 1,
          weight: 1,
          volume: 0.5, // 0.5 m³ = 500,000 cm³ / 5000 = 100 kg dimensional weight
          value: 100,
          currency: 'USD'
        }
      ];
      
      const result = calculator.calculate(domesticShipment);
      
      expect(result.breakdown.dimensionalWeightCharge).toBeGreaterThan(0);
    });
  });

  describe('PricingCalculator - International Shipments', () => {
    let calculator: PricingCalculator;
    let internationalShipment: Shipment;

    beforeEach(() => {
      calculator = createDefaultPricingCalculator('USD');
      
      internationalShipment = {
        sender: {
          name: 'John Doe',
          phone: '1234567890',
          address: {
            country: 'US',
            province: 'CA',
            city: 'Los Angeles',
            street: '123 Main St',
            postalCode: '90001'
          }
        },
        recipient: {
          name: 'Tanaka Taro',
          phone: '09012345678',
          address: {
            country: 'JP',
            province: 'Tokyo',
            city: 'Shibuya',
            street: '1-1-1 Shibuya',
            postalCode: '150-0001'
          }
        },
        items: [
          {
            name: 'Electronics',
            quantity: 1,
            weight: 3.0,
            value: 500,
            currency: 'USD'
          }
        ],
        paymentMethod: 'SENDER_PAY'
      };
    });

    test('calculate - basic international shipment', () => {
      const result = calculator.calculate(internationalShipment);
      
      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('USD');
      expect(result.breakdown.basePrice).toBe(40); // International base
      expect(result.estimatedDays).toBeGreaterThan(5); // International takes longer
    });

    test('calculate - with tax (Japan)', () => {
      const result = calculator.calculate(internationalShipment);
      
      // Japan has 10% consumption tax
      expect(result.breakdown.taxAmount).toBeGreaterThan(0);
      expect(result.breakdown.taxAmount).toBe(result.breakdown.subtotal * 0.10);
    });

    test('calculate - multiple items', () => {
      internationalShipment.items = [
        {
          name: 'Item 1',
          quantity: 2,
          weight: 1.5,
          value: 100,
          currency: 'USD'
        },
        {
          name: 'Item 2',
          quantity: 1,
          weight: 2.0,
          value: 200,
          currency: 'USD'
        }
      ];
      
      const result = calculator.calculate(internationalShipment);
      
      // Total weight: (1.5 * 2) + (2.0 * 1) = 5 kg
      expect(result.breakdown.weightCharge).toBeGreaterThan(0);
    });
  });

  describe('PricingCalculator - Edge Cases', () => {
    let calculator: PricingCalculator;

    beforeEach(() => {
      calculator = createDefaultPricingCalculator('USD');
    });

    test('calculate - zero weight (should still have base price)', () => {
      const shipment: Shipment = {
        sender: {
          name: 'Sender',
          phone: '1234567890',
          address: {
            country: 'US',
            province: 'CA',
            city: 'Los Angeles',
            street: '123 Main St'
          }
        },
        recipient: {
          name: 'Recipient',
          phone: '0987654321',
          address: {
            country: 'US',
            province: 'NY',
            city: 'New York',
            street: '456 Broadway'
          }
        },
        items: [
          {
            name: 'Document',
            quantity: 1,
            weight: 0.1,
            value: 0,
            currency: 'USD'
          }
        ],
        paymentMethod: 'SENDER_PAY'
      };
      
      const result = calculator.calculate(shipment);
      
      expect(result.amount).toBeGreaterThan(0);
      expect(result.breakdown.basePrice).toBe(10);
    });

    test('updateConfig - change base prices', () => {
      calculator.updateConfig({
        domesticBase: 20,
        internationalBase: 80
      });
      
      const config = calculator.getConfig();
      expect(config.domesticBase).toBe(20);
      expect(config.internationalBase).toBe(80);
    });
  });

  describe('PricingCalculator - Currency Variants', () => {
    test('createDefaultPricingCalculator - JPY', () => {
      const calculator = createDefaultPricingCalculator('JPY');
      const config = calculator.getConfig();
      
      expect(config.currency).toBe('JPY');
      expect(config.domesticBase).toBe(1000);
      expect(config.internationalBase).toBe(5000);
    });

    test('createDefaultPricingCalculator - CNY', () => {
      const calculator = createDefaultPricingCalculator('CNY');
      const config = calculator.getConfig();
      
      expect(config.currency).toBe('CNY');
      expect(config.domesticBase).toBe(12);
      expect(config.internationalBase).toBe(50);
    });

    test('calculate with different currencies', () => {
      const shipment: Shipment = {
        sender: {
          name: 'Sender',
          phone: '1234567890',
          address: {
            country: 'JP',
            province: 'Tokyo',
            city: 'Shibuya',
            street: '1-1 Shibuya'
          }
        },
        recipient: {
          name: 'Recipient',
          phone: '0987654321',
          address: {
            country: 'JP',
            province: 'Osaka',
            city: 'Osaka',
            street: '1-1 Umeda'
          }
        },
        items: [
          {
            name: 'Package',
            quantity: 1,
            weight: 2.0,
            value: 10000,
            currency: 'JPY'
          }
        ],
        paymentMethod: 'SENDER_PAY'
      };

      const jpyCalculator = createDefaultPricingCalculator('JPY');
      const jpyResult = jpyCalculator.calculate(shipment);
      
      expect(jpyResult.currency).toBe('JPY');
      expect(jpyResult.amount).toBeGreaterThan(1000);
      
      const usdCalculator = createDefaultPricingCalculator('USD');
      const usdResult = usdCalculator.calculate(shipment);
      
      expect(usdResult.currency).toBe('USD');
      expect(usdResult.amount).toBeGreaterThan(10);
    });
  });

  describe('PricingCalculator - Regional Adjustments', () => {
    test('calculate - remote area surcharge', () => {
      const calculator = createDefaultPricingCalculator('USD');
      
      const shipment: Shipment = {
        sender: {
          name: 'Sender',
          phone: '1234567890',
          address: {
            country: 'US',
            province: 'CA',
            city: 'Los Angeles',
            street: '123 Main St'
          }
        },
        recipient: {
          name: 'Recipient',
          phone: '0987654321',
          address: {
            country: 'GL', // Greenland - has regional adjustment
            province: 'Nuuk',
            city: 'Nuuk',
            street: '1 Arctic St'
          }
        },
        items: [
          {
            name: 'Package',
            quantity: 1,
            weight: 2.0,
            value: 100,
            currency: 'USD'
          }
        ],
        paymentMethod: 'SENDER_PAY'
      };
      
      const result = calculator.calculate(shipment);
      
      expect(result.breakdown.regionalAdjustment).toBe(50); // Greenland surcharge
    });
  });
});
