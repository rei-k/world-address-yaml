/**
 * @vey/core - Address data loader
 */

import type { CountryAddressFormat, RegionHierarchy } from './types';

// In-memory cache for loaded data
const cache = new Map<string, CountryAddressFormat>();

/**
 * Data loader configuration
 */
export interface DataLoaderConfig {
  basePath?: string;
  fetch?: typeof fetch;
}

/**
 * Creates a data loader with custom configuration
 */
export function createDataLoader(config: DataLoaderConfig = {}) {
  const basePath = config.basePath ?? '';

  return {
    /**
     * Load country address format by ISO alpha-2 code
     */
    async loadCountry(countryCode: string): Promise<CountryAddressFormat | null> {
      const code = countryCode.toUpperCase();

      // Check cache first
      if (cache.has(code)) {
        return cache.get(code)!;
      }

      // Map country codes to their file paths
      const countryPaths: Record<string, string> = {
        // East Asia
        JP: 'asia/east_asia/JP.json',
        CN: 'asia/east_asia/CN.json',
        KR: 'asia/east_asia/KR.json',
        KP: 'asia/east_asia/KP.json',
        TW: 'asia/east_asia/TW.json',
        HK: 'asia/east_asia/HK.json',
        MO: 'asia/east_asia/MO.json',
        MN: 'asia/east_asia/MN.json',
        // Add more mappings as needed
      };

      const path = countryPaths[code];
      if (!path) {
        return null;
      }

      try {
        const fullPath = basePath ? `${basePath}/${path}` : path;
        const response = await (config.fetch ?? fetch)(fullPath);
        if (!response.ok) {
          return null;
        }
        const data = await response.json() as CountryAddressFormat;
        cache.set(code, data);
        return data;
      } catch {
        return null;
      }
    },

    /**
     * Load all countries for a region
     */
    async loadRegion(region: string): Promise<CountryAddressFormat[]> {
      // This would be implemented to load all countries in a region
      // For now, return empty array
      return [];
    },

    /**
     * Get hierarchical region data for picker UI
     */
    async getRegionHierarchy(): Promise<RegionHierarchy[]> {
      // Return basic hierarchy structure
      return [
        {
          continent: 'Asia',
          countries: [
            { code: 'JP', name: 'Japan' },
            { code: 'CN', name: 'China' },
            { code: 'KR', name: 'South Korea' },
          ],
        },
        {
          continent: 'Europe',
          countries: [
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'GB', name: 'United Kingdom' },
          ],
        },
        {
          continent: 'Americas',
          countries: [
            { code: 'US', name: 'United States' },
            { code: 'CA', name: 'Canada' },
            { code: 'MX', name: 'Mexico' },
          ],
        },
      ];
    },

    /**
     * Clear the cache
     */
    clearCache() {
      cache.clear();
    },
  };
}

// Default loader instance
export const dataLoader = createDataLoader();
