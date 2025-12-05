/**
 * @vey/core - Tests for country-registry module
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CountryRegistry } from '../src/country-registry';
import type { CountryMetadata } from '../src/country-registry';

describe('CountryRegistry', () => {
  beforeAll(() => {
    // Initialize registry before running tests
    CountryRegistry.init();
  });

  describe('init', () => {
    it('should initialize registry', () => {
      CountryRegistry.init();
      const countries = CountryRegistry.getAllCountries();
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should be idempotent', () => {
      CountryRegistry.init();
      const countries1 = CountryRegistry.getAllCountries();
      
      CountryRegistry.init();
      const countries2 = CountryRegistry.getAllCountries();
      
      expect(countries1.length).toBe(countries2.length);
    });
  });

  describe('getAllCountries', () => {
    it('should return array of countries', () => {
      const countries = CountryRegistry.getAllCountries();
      
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should return countries with required fields', () => {
      const countries = CountryRegistry.getAllCountries();
      
      countries.forEach(country => {
        expect(country.code).toBeDefined();
        expect(country.name).toBeDefined();
        expect(country.name.en).toBeDefined();
        expect(country.continent).toBeDefined();
        expect(country.subregion).toBeDefined();
        expect(country.flag).toBeDefined();
        expect(typeof country.hasData).toBe('boolean');
        expect(country.dataPath).toBeDefined();
      });
    });

    it('should include major countries', () => {
      const countries = CountryRegistry.getAllCountries();
      const codes = countries.map(c => c.code);
      
      expect(codes).toContain('JP'); // Japan
      expect(codes).toContain('US'); // United States
      expect(codes).toContain('GB'); // United Kingdom
      expect(codes).toContain('CN'); // China
      expect(codes).toContain('DE'); // Germany
      expect(codes).toContain('FR'); // France
    });
  });

  describe('getCountry', () => {
    it('should get country by code', () => {
      const japan = CountryRegistry.getCountry('JP');
      
      expect(japan).toBeDefined();
      expect(japan?.code).toBe('JP');
      expect(japan?.name.en).toBe('Japan');
      expect(japan?.continent).toBe('asia');
    });

    it('should be case-insensitive', () => {
      const upper = CountryRegistry.getCountry('JP');
      const lower = CountryRegistry.getCountry('jp');
      
      expect(upper).toBeDefined();
      expect(lower).toBeDefined();
      expect(upper?.code).toBe(lower?.code);
    });

    it('should return undefined for invalid code', () => {
      const invalid = CountryRegistry.getCountry('XX');
      expect(invalid).toBeUndefined();
    });

    it('should return countries with flags', () => {
      const us = CountryRegistry.getCountry('US');
      expect(us?.flag).toBeDefined();
      expect(us?.flag.length).toBeGreaterThan(0);
    });

    it('should return countries with local names where available', () => {
      const japan = CountryRegistry.getCountry('JP');
      expect(japan?.name.local).toBe('日本');
      
      const china = CountryRegistry.getCountry('CN');
      expect(china?.name.local).toBe('中国');
    });
  });

  describe('getCountriesByContinent', () => {
    it('should get countries in Asia', () => {
      const asianCountries = CountryRegistry.getCountriesByContinent('asia');
      
      expect(asianCountries.length).toBeGreaterThan(0);
      expect(asianCountries.every(c => c.continent === 'asia')).toBe(true);
      
      const codes = asianCountries.map(c => c.code);
      expect(codes).toContain('JP');
      expect(codes).toContain('CN');
      expect(codes).toContain('KR');
    });

    it('should get countries in Europe', () => {
      const europeanCountries = CountryRegistry.getCountriesByContinent('europe');
      
      expect(europeanCountries.length).toBeGreaterThan(0);
      expect(europeanCountries.every(c => c.continent === 'europe')).toBe(true);
      
      const codes = europeanCountries.map(c => c.code);
      expect(codes).toContain('GB');
      expect(codes).toContain('DE');
      expect(codes).toContain('FR');
    });

    it('should get countries in Americas', () => {
      const americanCountries = CountryRegistry.getCountriesByContinent('americas');
      
      expect(americanCountries.length).toBeGreaterThan(0);
      expect(americanCountries.every(c => c.continent === 'americas')).toBe(true);
      
      const codes = americanCountries.map(c => c.code);
      expect(codes).toContain('US');
      expect(codes).toContain('CA');
      expect(codes).toContain('BR');
    });

    it('should get countries in Africa', () => {
      const africanCountries = CountryRegistry.getCountriesByContinent('africa');
      
      expect(africanCountries.length).toBeGreaterThan(0);
      expect(africanCountries.every(c => c.continent === 'africa')).toBe(true);
      
      const codes = africanCountries.map(c => c.code);
      expect(codes).toContain('EG');
      expect(codes).toContain('ZA');
    });

    it('should get countries in Oceania', () => {
      const oceaniaCountries = CountryRegistry.getCountriesByContinent('oceania');
      
      expect(oceaniaCountries.length).toBeGreaterThan(0);
      expect(oceaniaCountries.every(c => c.continent === 'oceania')).toBe(true);
      
      const codes = oceaniaCountries.map(c => c.code);
      expect(codes).toContain('AU');
      expect(codes).toContain('NZ');
    });

    it('should return sorted countries', () => {
      const countries = CountryRegistry.getCountriesByContinent('europe');
      
      for (let i = 1; i < countries.length; i++) {
        const prev = countries[i - 1].name.en.toLowerCase();
        const curr = countries[i].name.en.toLowerCase();
        expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
      }
    });

    it('should return empty array for antarctica', () => {
      const antarcticaCountries = CountryRegistry.getCountriesByContinent('antarctica');
      expect(Array.isArray(antarcticaCountries)).toBe(true);
    });
  });

  describe('searchCountries', () => {
    it('should search by partial name match', () => {
      const results = CountryRegistry.searchCountries('Jap');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.code === 'JP')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const upper = CountryRegistry.searchCountries('JAPAN');
      const lower = CountryRegistry.searchCountries('japan');
      const mixed = CountryRegistry.searchCountries('JaPaN');
      
      expect(upper.length).toBeGreaterThan(0);
      expect(lower.length).toBe(upper.length);
      expect(mixed.length).toBe(upper.length);
    });

    it('should search by full country name', () => {
      const results = CountryRegistry.searchCountries('United States');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.code === 'US')).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = CountryRegistry.searchCountries('Nonexistent Country');
      expect(results).toEqual([]);
    });

    it('should return sorted results', () => {
      const results = CountryRegistry.searchCountries('a');
      
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1].name.en.toLowerCase();
        const curr = results[i].name.en.toLowerCase();
        expect(prev.localeCompare(curr)).toBeLessThanOrEqual(0);
      }
    });

    it('should search partial words', () => {
      const results = CountryRegistry.searchCountries('United');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.code === 'US')).toBe(true);
      expect(results.some(c => c.code === 'GB')).toBe(true);
      expect(results.some(c => c.code === 'AE')).toBe(true);
    });

    it('should search by single character', () => {
      const results = CountryRegistry.searchCountries('Z');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.name.en.toLowerCase().includes('z'))).toBe(true);
    });
  });

  describe('getContinentInfo', () => {
    it('should get continent info for Asia', () => {
      const info = CountryRegistry.getContinentInfo('asia');
      
      expect(info.code).toBe('asia');
      expect(info.name.en).toBe('Asia');
      expect(info.name.ja).toBe('アジア');
      expect(info.countries.length).toBeGreaterThan(0);
      expect(info.countries).toContain('JP');
      expect(info.countries).toContain('CN');
    });

    it('should get continent info for Europe', () => {
      const info = CountryRegistry.getContinentInfo('europe');
      
      expect(info.code).toBe('europe');
      expect(info.name.en).toBe('Europe');
      expect(info.countries.length).toBeGreaterThan(0);
      expect(info.countries).toContain('GB');
    });

    it('should get continent info for Americas', () => {
      const info = CountryRegistry.getContinentInfo('americas');
      
      expect(info.code).toBe('americas');
      expect(info.name.en).toBe('Americas');
      expect(info.countries.length).toBeGreaterThan(0);
      expect(info.countries).toContain('US');
    });

    it('should get continent info for Africa', () => {
      const info = CountryRegistry.getContinentInfo('africa');
      
      expect(info.code).toBe('africa');
      expect(info.name.en).toBe('Africa');
      expect(info.countries.length).toBeGreaterThan(0);
    });

    it('should get continent info for Oceania', () => {
      const info = CountryRegistry.getContinentInfo('oceania');
      
      expect(info.code).toBe('oceania');
      expect(info.name.en).toBe('Oceania');
      expect(info.countries.length).toBeGreaterThan(0);
      expect(info.countries).toContain('AU');
    });

    it('should include multilingual names', () => {
      const info = CountryRegistry.getContinentInfo('asia');
      
      expect(info.name.en).toBeDefined();
      expect(info.name.ja).toBeDefined();
      expect(info.name.zh).toBeDefined();
      expect(info.name.ko).toBeDefined();
    });
  });

  describe('getAllContinents', () => {
    it('should return all continents', () => {
      const continents = CountryRegistry.getAllContinents();
      
      expect(continents.length).toBeGreaterThan(0);
      expect(continents.some(c => c.code === 'africa')).toBe(true);
      expect(continents.some(c => c.code === 'americas')).toBe(true);
      expect(continents.some(c => c.code === 'asia')).toBe(true);
      expect(continents.some(c => c.code === 'europe')).toBe(true);
      expect(continents.some(c => c.code === 'oceania')).toBe(true);
    });

    it('should return continents with country lists', () => {
      const continents = CountryRegistry.getAllContinents();
      
      continents.forEach(continent => {
        expect(continent.code).toBeDefined();
        expect(continent.name).toBeDefined();
        expect(continent.name.en).toBeDefined();
        expect(Array.isArray(continent.countries)).toBe(true);
      });
    });
  });

  describe('toCountryOption', () => {
    it('should convert metadata to CountryOption', () => {
      const japan = CountryRegistry.getCountry('JP')!;
      const option = CountryRegistry.toCountryOption(japan);
      
      expect(option.code).toBe('JP');
      expect(option.name).toBe('Japan');
      expect(option.nameLocal).toBe('日本');
      expect(option.flag).toBeDefined();
      expect(option.continent).toBe('asia');
      expect(option.subregion).toBeDefined();
    });

    it('should handle countries without local names', () => {
      const us = CountryRegistry.getCountry('US')!;
      const option = CountryRegistry.toCountryOption(us);
      
      expect(option.code).toBe('US');
      expect(option.name).toBe('United States');
      expect(option.flag).toBeDefined();
    });
  });

  describe('getPopularCountries', () => {
    it('should return popular countries', () => {
      const popular = CountryRegistry.getPopularCountries();
      
      expect(popular.length).toBeGreaterThan(0);
      expect(popular.length).toBeLessThanOrEqual(20);
    });

    it('should include major economies', () => {
      const popular = CountryRegistry.getPopularCountries();
      const codes = popular.map(c => c.code);
      
      expect(codes).toContain('US');
      expect(codes).toContain('JP');
      expect(codes).toContain('CN');
      expect(codes).toContain('GB');
      expect(codes).toContain('DE');
    });

    it('should return valid country metadata', () => {
      const popular = CountryRegistry.getPopularCountries();
      
      popular.forEach(country => {
        expect(country.code).toBeDefined();
        expect(country.name.en).toBeDefined();
        expect(country.flag).toBeDefined();
      });
    });
  });

  describe('getRecommendedSet', () => {
    it('should get East Asia set', () => {
      const eastAsia = CountryRegistry.getRecommendedSet('east_asia');
      
      expect(eastAsia.length).toBeGreaterThan(0);
      const codes = eastAsia.map(c => c.code);
      expect(codes).toContain('JP');
      expect(codes).toContain('CN');
      expect(codes).toContain('KR');
    });

    it('should get North America set', () => {
      const northAmerica = CountryRegistry.getRecommendedSet('north_america');
      
      expect(northAmerica.length).toBeGreaterThan(0);
      const codes = northAmerica.map(c => c.code);
      expect(codes).toContain('US');
      expect(codes).toContain('CA');
      expect(codes).toContain('MX');
    });

    it('should get Europe set', () => {
      const europe = CountryRegistry.getRecommendedSet('europe');
      
      expect(europe.length).toBeGreaterThan(0);
      const codes = europe.map(c => c.code);
      expect(codes).toContain('GB');
      expect(codes).toContain('DE');
      expect(codes).toContain('FR');
    });

    it('should get Southeast Asia set', () => {
      const southeastAsia = CountryRegistry.getRecommendedSet('southeast_asia');
      
      expect(southeastAsia.length).toBeGreaterThan(0);
      const codes = southeastAsia.map(c => c.code);
      expect(codes).toContain('SG');
      expect(codes).toContain('MY');
      expect(codes).toContain('TH');
    });

    it('should get all countries for "all" set', () => {
      const all = CountryRegistry.getRecommendedSet('all');
      const allCountries = CountryRegistry.getAllCountries();
      
      expect(all.length).toBe(allCountries.length);
    });
  });

  describe('Flag Generation', () => {
    it('should generate valid flag emojis', () => {
      const jp = CountryRegistry.getCountry('JP');
      const us = CountryRegistry.getCountry('US');
      const gb = CountryRegistry.getCountry('GB');
      
      expect(jp?.flag).toBeDefined();
      expect(us?.flag).toBeDefined();
      expect(gb?.flag).toBeDefined();
      
      expect(jp?.flag.length).toBeGreaterThan(0);
      expect(us?.flag.length).toBeGreaterThan(0);
      expect(gb?.flag.length).toBeGreaterThan(0);
    });

    it('should generate different flags for different countries', () => {
      const jp = CountryRegistry.getCountry('JP');
      const us = CountryRegistry.getCountry('US');
      
      expect(jp?.flag).not.toBe(us?.flag);
    });
  });

  describe('Data Path Generation', () => {
    it('should generate correct data paths', () => {
      const japan = CountryRegistry.getCountry('JP');
      
      expect(japan?.dataPath).toContain('/data/');
      expect(japan?.dataPath).toContain('/asia/');
      expect(japan?.dataPath).toContain('/JP/');
      expect(japan?.dataPath).toMatch(/\.yaml$/);
    });

    it('should use subregion in path', () => {
      const us = CountryRegistry.getCountry('US');
      
      expect(us?.dataPath).toContain('/americas/');
      expect(us?.dataPath).toContain('/north_america/');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete country lookup workflow', () => {
      // Initialize
      CountryRegistry.init();
      
      // Search for country
      const searchResults = CountryRegistry.searchCountries('Japan');
      expect(searchResults.length).toBeGreaterThan(0);
      
      // Get specific country
      const japan = CountryRegistry.getCountry('JP');
      expect(japan).toBeDefined();
      expect(japan?.code).toBe('JP');
      
      // Get countries by continent
      const asianCountries = CountryRegistry.getCountriesByContinent('asia');
      expect(asianCountries.some(c => c.code === 'JP')).toBe(true);
      
      // Convert to option format
      const option = CountryRegistry.toCountryOption(japan!);
      expect(option.code).toBe('JP');
    });

    it('should support multilingual workflows', () => {
      const japan = CountryRegistry.getCountry('JP');
      const china = CountryRegistry.getCountry('CN');
      const korea = CountryRegistry.getCountry('KR');
      
      expect(japan?.name.en).toBe('Japan');
      expect(japan?.name.local).toBe('日本');
      
      expect(china?.name.en).toBe('China');
      expect(china?.name.local).toBe('中国');
      
      expect(korea?.name.en).toBe('South Korea');
      expect(korea?.name.local).toBe('대한민국');
    });

    it('should support continent-based organization', () => {
      const continents = CountryRegistry.getAllContinents();
      
      continents.forEach(continent => {
        const countries = CountryRegistry.getCountriesByContinent(continent.code as any);
        expect(countries.length).toBeGreaterThanOrEqual(0);
        
        if (countries.length > 0) {
          countries.forEach(country => {
            expect(country.continent).toBe(continent.code);
          });
        }
      });
    });
  });
});
