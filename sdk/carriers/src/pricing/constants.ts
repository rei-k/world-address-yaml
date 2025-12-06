/**
 * Pricing Constants
 * Centralized constants for pricing calculations
 */

/**
 * Exchange rates (simplified - in production, use real-time API)
 * Base currency: USD
 * Last updated: 2024-12-06
 */
export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  'USD': { 
    'CNY': 7.2, 
    'JPY': 150, 
    'EUR': 0.92, 
    'GBP': 0.79 
  },
  'CNY': { 
    'USD': 0.14, 
    'JPY': 20.8, 
    'EUR': 0.13, 
    'GBP': 0.11 
  },
  'JPY': { 
    'USD': 0.0067, 
    'CNY': 0.048, 
    'EUR': 0.0061, 
    'GBP': 0.0053 
  },
  'EUR': { 
    'USD': 1.09, 
    'CNY': 7.82, 
    'JPY': 164, 
    'GBP': 0.86 
  },
  'GBP': { 
    'USD': 1.27, 
    'CNY': 9.1, 
    'JPY': 190, 
    'EUR': 1.16 
  }
};

/**
 * Tax rates by country code
 * VAT/GST/Consumption tax rates
 */
export const TAX_RATES: Record<string, number> = {
  'JP': 0.10, // Japan 10% consumption tax
  'CN': 0.13, // China 13% VAT
  'US': 0.0,  // No federal sales tax (varies by state)
  'GB': 0.20, // UK 20% VAT
  'DE': 0.19, // Germany 19% VAT
  'FR': 0.20, // France 20% VAT
  'IT': 0.22, // Italy 22% VAT
  'ES': 0.21, // Spain 21% VAT
  'NL': 0.21, // Netherlands 21% VAT
  'BE': 0.21, // Belgium 21% VAT
  'AU': 0.10, // Australia 10% GST
  'CA': 0.05, // Canada 5% GST (federal only)
  'NZ': 0.15, // New Zealand 15% GST
  'SG': 0.08, // Singapore 8% GST
  'KR': 0.10, // South Korea 10% VAT
  'TH': 0.07, // Thailand 7% VAT
  'VN': 0.10, // Vietnam 10% VAT
  'MY': 0.06, // Malaysia 6% SST
  'ID': 0.11, // Indonesia 11% VAT
  'PH': 0.12, // Philippines 12% VAT
  'IN': 0.18, // India 18% GST (standard rate)
  'BR': 0.17, // Brazil 17% (varies by state)
  'MX': 0.16, // Mexico 16% IVA
  'AR': 0.21, // Argentina 21% IVA
  'CL': 0.19, // Chile 19% IVA
  'CO': 0.19, // Colombia 19% IVA
  'ZA': 0.15, // South Africa 15% VAT
  'NG': 0.075,// Nigeria 7.5% VAT
  'EG': 0.14, // Egypt 14% VAT
  'KE': 0.16, // Kenya 16% VAT
  'MA': 0.20, // Morocco 20% VAT
  'TR': 0.18, // Turkey 18% VAT
  'SA': 0.15, // Saudi Arabia 15% VAT
  'AE': 0.05, // UAE 5% VAT
  'IL': 0.17, // Israel 17% VAT
  'RU': 0.20, // Russia 20% VAT
  'UA': 0.20, // Ukraine 20% VAT
  'PL': 0.23, // Poland 23% VAT
  'CZ': 0.21, // Czech Republic 21% VAT
  'HU': 0.27, // Hungary 27% VAT
  'RO': 0.19, // Romania 19% VAT
  'PT': 0.23, // Portugal 23% VAT
  'GR': 0.24, // Greece 24% VAT
  'AT': 0.20, // Austria 20% VAT
  'CH': 0.077,// Switzerland 7.7% VAT
  'SE': 0.25, // Sweden 25% VAT
  'NO': 0.25, // Norway 25% VAT
  'DK': 0.25, // Denmark 25% VAT
  'FI': 0.24, // Finland 24% VAT
  'IE': 0.23, // Ireland 23% VAT
};

/**
 * Default pricing configuration values
 */
export const DEFAULT_PRICING = {
  // Fuel surcharge
  FUEL_SURCHARGE_RATE: 0.15, // 15%
  
  // Insurance
  INSURANCE_RATE: 0.01, // 1% of declared value
  
  // Dimensional weight factor (cm³ to kg)
  DIMENSIONAL_FACTOR: 5000,
  
  // Quote validity
  QUOTE_VALIDITY_HOURS: 24,
  
  // Service multipliers
  SERVICE_MULTIPLIERS: {
    'ECONOMY': 0.8,
    'STANDARD': 1.0,
    'EXPRESS': 1.5
  },
  
  // Regional adjustments (surcharges for remote areas)
  REGIONAL_SURCHARGES: {
    'AQ': 100, // Antarctica
    'GL': 50,  // Greenland
    'FK': 30,  // Falkland Islands
    'AK': 25,  // Alaska (US state)
    'HI': 20,  // Hawaii (US state)
  }
};

/**
 * Distance estimation defaults (in km)
 */
export const DISTANCE_ESTIMATES = {
  DOMESTIC_AVERAGE: 500,
  INTRA_CONTINENTAL: 2000,
  INTER_CONTINENTAL: 8000
};

/**
 * Continental groupings for distance estimation
 */
export const CONTINENTAL_GROUPS: Record<string, string[]> = {
  'ASIA': ['CN', 'JP', 'KR', 'TH', 'VN', 'SG', 'MY', 'ID', 'PH', 'IN', 'PK', 'BD', 'LK', 'MM', 'KH', 'LA'],
  'EUROPE': ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'PL', 'CZ', 'HU', 'RO', 'PT', 'GR', 'SE', 'NO', 'DK', 'FI', 'IE'],
  'NORTH_AMERICA': ['US', 'CA', 'MX'],
  'SOUTH_AMERICA': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY'],
  'OCEANIA': ['AU', 'NZ', 'FJ', 'PG'],
  'AFRICA': ['ZA', 'NG', 'EG', 'KE', 'MA', 'TZ', 'UG', 'GH', 'AO', 'MZ']
};
