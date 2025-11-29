/**
 * @vey/core - Main SDK client
 */

import type {
  VeyConfig,
  CountryAddressFormat,
  AddressInput,
  ValidationResult,
  RegionHierarchy,
} from './types';
import { validateAddress, getRequiredFields, getFieldOrder } from './validator';
import { formatAddress, formatShippingLabel, FormatOptions } from './formatter';
import { createDataLoader, DataLoaderConfig } from './loader';

/**
 * Main Vey SDK client
 */
export class VeyClient {
  private config: VeyConfig;
  private loader: ReturnType<typeof createDataLoader>;
  private formatCache = new Map<string, CountryAddressFormat>();

  constructor(config: VeyConfig = {}) {
    this.config = {
      environment: 'sandbox',
      ...config,
    };

    const loaderConfig: DataLoaderConfig = {
      basePath: config.dataPath,
    };

    this.loader = createDataLoader(loaderConfig);
  }

  /**
   * Get environment (sandbox or production)
   */
  get environment(): 'sandbox' | 'production' {
    return this.config.environment ?? 'sandbox';
  }

  /**
   * Get API key
   */
  get apiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Load address format for a country
   */
  async getCountryFormat(countryCode: string): Promise<CountryAddressFormat | null> {
    // Check local cache first
    if (this.formatCache.has(countryCode)) {
      return this.formatCache.get(countryCode)!;
    }

    const format = await this.loader.loadCountry(countryCode);
    if (format) {
      this.formatCache.set(countryCode, format);
    }
    return format;
  }

  /**
   * Validate an address
   */
  async validate(
    address: AddressInput,
    countryCode: string
  ): Promise<ValidationResult> {
    const format = await this.getCountryFormat(countryCode);
    if (!format) {
      return {
        valid: false,
        errors: [
          {
            field: 'country',
            code: 'UNKNOWN_COUNTRY',
            message: `Country code ${countryCode} is not supported`,
          },
        ],
        warnings: [],
      };
    }

    return validateAddress(address, format);
  }

  /**
   * Format an address
   */
  async format(
    address: AddressInput,
    countryCode: string,
    options?: FormatOptions
  ): Promise<string> {
    const format = await this.getCountryFormat(countryCode);
    if (!format) {
      throw new Error(`Country code ${countryCode} is not supported`);
    }

    return formatAddress(address, format, options);
  }

  /**
   * Format address for shipping label
   */
  async formatLabel(address: AddressInput, countryCode: string): Promise<string> {
    const format = await this.getCountryFormat(countryCode);
    if (!format) {
      throw new Error(`Country code ${countryCode} is not supported`);
    }

    return formatShippingLabel(address, format);
  }

  /**
   * Get required fields for a country
   */
  async getRequiredFields(countryCode: string): Promise<string[]> {
    const format = await this.getCountryFormat(countryCode);
    if (!format) {
      return [];
    }

    return getRequiredFields(format);
  }

  /**
   * Get field order for a country
   */
  async getFieldOrder(
    countryCode: string,
    context: 'domestic' | 'international' | 'postal' = 'international'
  ): Promise<string[]> {
    const format = await this.getCountryFormat(countryCode);
    if (!format) {
      return [];
    }

    return getFieldOrder(format, context);
  }

  /**
   * Get region hierarchy for picker UI
   */
  async getRegionHierarchy(): Promise<RegionHierarchy[]> {
    return this.loader.getRegionHierarchy();
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  /**
   * Switch environment
   */
  setEnvironment(env: 'sandbox' | 'production'): void {
    this.config.environment = env;
  }
}

/**
 * Create a new Vey client instance
 */
export function createVeyClient(config?: VeyConfig): VeyClient {
  return new VeyClient(config);
}
