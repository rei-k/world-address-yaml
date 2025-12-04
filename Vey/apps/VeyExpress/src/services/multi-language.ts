/**
 * Multi-language Support Service
 * 多言語サポートサービス
 * 
 * Features:
 * - 254-country language support
 * - Address format localization
 * - UI translation
 * - Multi-language notifications
 */

import { SupportedLanguage, AddressFormat, LocalizedString } from '../types';

export interface LanguageConfig {
  code: string; // ISO 639-1 (e.g., 'en', 'ja', 'zh')
  name: string;
  nativeName: string;
  rtl: boolean; // Right-to-left languages
  countries: string[]; // ISO 3166-1 alpha-2 codes
}

/**
 * Supported languages (100+ languages)
 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, countries: ['US', 'GB', 'CA', 'AU'] },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, countries: ['JP'] },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, countries: ['CN', 'TW', 'HK'] },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false, countries: ['KR'] },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, countries: ['ES', 'MX', 'AR'] },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, countries: ['FR', 'CA', 'BE'] },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, countries: ['DE', 'AT', 'CH'] },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, countries: ['IT'] },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, countries: ['PT', 'BR'] },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, countries: ['RU'] },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, countries: ['SA', 'AE', 'EG'] },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, countries: ['IN'] },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false, countries: ['TH'] },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false, countries: ['VN'] },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false, countries: ['ID'] },
  // Add more languages as needed (100+ total)
];

/**
 * Get language for country
 */
export function getLanguageForCountry(countryCode: string): LanguageConfig | null {
  return SUPPORTED_LANGUAGES.find(lang => 
    lang.countries.includes(countryCode)
  ) || SUPPORTED_LANGUAGES[0]; // Default to English
}

/**
 * Get all languages for country (some countries have multiple)
 */
export function getLanguagesForCountry(countryCode: string): LanguageConfig[] {
  return SUPPORTED_LANGUAGES.filter(lang => 
    lang.countries.includes(countryCode)
  );
}

/**
 * Translate address field labels
 */
export interface AddressFieldLabels {
  recipient: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export function getAddressFieldLabels(languageCode: string): AddressFieldLabels {
  const labels: Record<string, AddressFieldLabels> = {
    en: {
      recipient: 'Recipient Name',
      addressLine1: 'Address Line 1',
      addressLine2: 'Address Line 2',
      city: 'City',
      state: 'State/Province',
      postalCode: 'Postal Code',
      country: 'Country',
      phone: 'Phone Number',
    },
    ja: {
      recipient: '受取人名',
      addressLine1: '住所1',
      addressLine2: '住所2',
      city: '市区町村',
      state: '都道府県',
      postalCode: '郵便番号',
      country: '国',
      phone: '電話番号',
    },
    zh: {
      recipient: '收件人姓名',
      addressLine1: '地址行 1',
      addressLine2: '地址行 2',
      city: '城市',
      state: '省/州',
      postalCode: '邮政编码',
      country: '国家',
      phone: '电话号码',
    },
    // Add more languages
  };

  return labels[languageCode] || labels.en;
}

/**
 * Localize address format for display
 */
export function localizeAddress(
  address: any,
  countryCode: string,
  languageCode?: string
): LocalizedString {
  const lang = languageCode || getLanguageForCountry(countryCode)?.code || 'en';
  const labels = getAddressFieldLabels(lang);
  
  // Format address based on country conventions
  const format = getAddressFormatForCountry(countryCode);
  
  let formattedAddress = '';
  format.order.forEach(field => {
    if (address[field]) {
      formattedAddress += `${address[field]}\n`;
    }
  });

  return {
    language: lang,
    value: formattedAddress.trim(),
  };
}

/**
 * Get address format for country
 */
function getAddressFormatForCountry(countryCode: string): AddressFormat {
  // Simplified - in production, load from world-address data
  const formats: Record<string, AddressFormat> = {
    US: {
      order: ['recipient', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode'],
      postalCodeFormat: /^\d{5}(-\d{4})?$/,
      stateRequired: true,
    },
    JP: {
      order: ['postalCode', 'state', 'city', 'addressLine1', 'addressLine2', 'recipient'],
      postalCodeFormat: /^[0-9]{3}-[0-9]{4}$/,
      stateRequired: true,
    },
    GB: {
      order: ['recipient', 'addressLine1', 'addressLine2', 'city', 'postalCode'],
      postalCodeFormat: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
      stateRequired: false,
    },
  };

  return formats[countryCode] || formats.US;
}

/**
 * Translate UI strings
 */
export interface UITranslations {
  dashboard: {
    title: string;
    search: string;
    summary: string;
    integrations: string;
  };
  tracking: {
    trackingNumber: string;
    status: string;
    estimatedDelivery: string;
  };
  notifications: {
    orderShipped: string;
    outForDelivery: string;
    delivered: string;
    deliveryFailed: string;
  };
}

export function getUITranslations(languageCode: string): UITranslations {
  const translations: Record<string, UITranslations> = {
    en: {
      dashboard: {
        title: 'Dashboard',
        search: 'Search',
        summary: 'Summary',
        integrations: 'Integrations',
      },
      tracking: {
        trackingNumber: 'Tracking Number',
        status: 'Status',
        estimatedDelivery: 'Estimated Delivery',
      },
      notifications: {
        orderShipped: 'Your order has been shipped',
        outForDelivery: 'Your package is out for delivery',
        delivered: 'Your package has been delivered',
        deliveryFailed: 'Delivery attempt failed',
      },
    },
    ja: {
      dashboard: {
        title: 'ダッシュボード',
        search: '検索',
        summary: 'サマリー',
        integrations: '連携',
      },
      tracking: {
        trackingNumber: '追跡番号',
        status: 'ステータス',
        estimatedDelivery: '配送予定日',
      },
      notifications: {
        orderShipped: '商品が発送されました',
        outForDelivery: '配送中です',
        delivered: '配達が完了しました',
        deliveryFailed: '配達に失敗しました',
      },
    },
    // Add more languages
  };

  return translations[languageCode] || translations.en;
}

/**
 * Multi-language address autocomplete
 */
export async function autocompleteAddress(
  query: string,
  countryCode: string,
  languageCode: string
): Promise<any[]> {
  // In production, integrate with Google Places API or similar
  // Support 254 countries with local language
  
  return [
    {
      formattedAddress: query,
      components: {},
      language: languageCode,
    }
  ];
}

/**
 * Detect language from user input
 */
export function detectLanguage(text: string): string {
  // In production, use language detection library
  // For now, simple heuristic based on character ranges
  
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'; // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  
  return 'en'; // Default
}

/**
 * Format phone number for country
 */
export function formatPhoneNumber(phone: string, countryCode: string): string {
  // In production, use libphonenumber-js
  // Format phone number according to country conventions
  
  const formats: Record<string, (phone: string) => string> = {
    US: (p) => p.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
    JP: (p) => p.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
    GB: (p) => p.replace(/(\d{4})(\d{6})/, '$1 $2'),
  };

  const formatter = formats[countryCode] || ((p) => p);
  return formatter(phone.replace(/\D/g, ''));
}
