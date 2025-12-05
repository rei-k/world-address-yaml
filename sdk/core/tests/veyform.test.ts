/**
 * Veyform Language Settings Tests
 * 
 * Comprehensive test suite covering all language-related features:
 * - Language storage and persistence
 * - Language change callbacks
 * - Language validation
 * - Storage configuration options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Veyform, type VeyformConfig, type LanguageStorageConfig } from '../src/veyform';

// Mock window.localStorage and window.sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

describe('Veyform Language Settings', () => {
  let localStorageMock: ReturnType<typeof createStorageMock>;
  let sessionStorageMock: ReturnType<typeof createStorageMock>;

  beforeEach(() => {
    // Reset storage mocks before each test
    localStorageMock = createStorageMock();
    sessionStorageMock = createStorageMock();

    // Mock window object if not available
    if (typeof window === 'undefined') {
      (global as any).window = {
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
        navigator: {
          userAgent: 'Mozilla/5.0 (Test Browser)'
        }
      };
    } else {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });
      Object.defineProperty(window, 'navigator', { 
        value: { userAgent: 'Mozilla/5.0 (Test Browser)' }, 
        writable: true 
      });
    }
  });

  afterEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  describe('Basic Language Operations', () => {
    it('should initialize with default language', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en'
      });

      expect(veyform.getLanguage()).toBe('en');
    });

    it('should initialize with custom default language', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'ja'
      });

      expect(veyform.getLanguage()).toBe('ja');
    });

    it('should change language using setLanguage', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en'
      });

      veyform.setLanguage('ja');
      expect(veyform.getLanguage()).toBe('ja');
    });

    it('should get available languages when configured', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        allowedLanguages: ['en', 'ja', 'zh', 'ko']
      });

      const languages = veyform.getAvailableLanguages();
      expect(languages).toEqual(['en', 'ja', 'zh', 'ko']);
    });

    it('should return empty array when no allowed languages configured', () => {
      const veyform = new Veyform({
        apiKey: 'test-key'
      });

      const languages = veyform.getAvailableLanguages();
      expect(languages).toEqual([]);
    });
  });

  describe('Language Validation', () => {
    it('should validate language against allowedLanguages', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        allowedLanguages: ['en', 'ja', 'zh']
      });

      expect(() => veyform.setLanguage('en')).not.toThrow();
      expect(() => veyform.setLanguage('ja')).not.toThrow();
    });

    it('should throw error for disallowed language', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        allowedLanguages: ['en', 'ja']
      });

      expect(() => veyform.setLanguage('fr')).toThrow();
      expect(() => veyform.setLanguage('de')).toThrow();
    });

    it('should include language list in error message', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        allowedLanguages: ['en', 'ja', 'zh']
      });

      expect(() => veyform.setLanguage('fr')).toThrow(/en, ja, zh/);
    });

    it('should allow any language when allowedLanguages not configured', () => {
      const veyform = new Veyform({
        apiKey: 'test-key'
      });

      expect(() => veyform.setLanguage('en')).not.toThrow();
      expect(() => veyform.setLanguage('ja')).not.toThrow();
      expect(() => veyform.setLanguage('fr')).not.toThrow();
      expect(() => veyform.setLanguage('xyz')).not.toThrow();
    });
  });

  describe('Language Change Callbacks', () => {
    it('should trigger callback on language change', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        onLanguageChange: callback
      });

      veyform.setLanguage('ja');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('ja', 'en');
    });

    it('should pass correct old and new language values', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        onLanguageChange: callback
      });

      veyform.setLanguage('ja');
      expect(callback).toHaveBeenCalledWith('ja', 'en');

      veyform.setLanguage('zh');
      expect(callback).toHaveBeenCalledWith('zh', 'ja');
    });

    it('should not trigger callback when language does not change', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        onLanguageChange: callback
      });

      veyform.setLanguage('en');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple language changes with callback', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        onLanguageChange: callback
      });

      veyform.setLanguage('ja');
      veyform.setLanguage('zh');
      veyform.setLanguage('ko');

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should work without callback configured', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en'
      });

      expect(() => veyform.setLanguage('ja')).not.toThrow();
      expect(veyform.getLanguage()).toBe('ja');
    });
  });

  describe('Language Storage - localStorage', () => {
    it('should save language to localStorage', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage' }
      });

      veyform.setLanguage('ja');

      const stored = localStorageMock.getItem('veyform_language');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.language).toBe('ja');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should load language from localStorage on initialization', () => {
      // Pre-populate localStorage
      localStorageMock.setItem('veyform_language', JSON.stringify({
        language: 'ja',
        timestamp: Date.now()
      }));

      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage' }
      });

      expect(veyform.getLanguage()).toBe('ja');
    });

    it('should use custom storage key', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage', key: 'custom_lang_key' }
      });

      veyform.setLanguage('ja');

      const stored = localStorageMock.getItem('custom_lang_key');
      expect(stored).not.toBeNull();
    });

    it('should clear language preference from localStorage', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage' }
      });

      veyform.setLanguage('ja');
      expect(localStorageMock.getItem('veyform_language')).not.toBeNull();

      veyform.clearLanguagePreference();
      expect(localStorageMock.getItem('veyform_language')).toBeNull();
    });
  });

  describe('Language Storage - sessionStorage', () => {
    it('should save language to sessionStorage', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'sessionStorage' }
      });

      veyform.setLanguage('ja');

      const stored = sessionStorageMock.getItem('veyform_language');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.language).toBe('ja');
    });

    it('should load language from sessionStorage on initialization', () => {
      // Pre-populate sessionStorage
      sessionStorageMock.setItem('veyform_language', JSON.stringify({
        language: 'zh',
        timestamp: Date.now()
      }));

      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'sessionStorage' }
      });

      expect(veyform.getLanguage()).toBe('zh');
    });

    it('should clear language preference from sessionStorage', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'sessionStorage' }
      });

      veyform.setLanguage('ja');
      expect(sessionStorageMock.getItem('veyform_language')).not.toBeNull();

      veyform.clearLanguagePreference();
      expect(sessionStorageMock.getItem('veyform_language')).toBeNull();
    });
  });

  describe('Language Storage - none', () => {
    it('should not persist language when storage type is none', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'none' }
      });

      veyform.setLanguage('ja');

      expect(localStorageMock.getItem('veyform_language')).toBeNull();
      expect(sessionStorageMock.getItem('veyform_language')).toBeNull();
    });

    it('should not load language from storage when type is none', () => {
      localStorageMock.setItem('veyform_language', JSON.stringify({
        language: 'ja',
        timestamp: Date.now()
      }));

      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'none' }
      });

      expect(veyform.getLanguage()).toBe('en');
    });

    it('should handle clearLanguagePreference gracefully when storage is none', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'none' }
      });

      expect(() => veyform.clearLanguagePreference()).not.toThrow();
    });
  });

  describe('Storage Validation', () => {
    it('should validate loaded language against allowedLanguages', () => {
      // Pre-populate with invalid language
      localStorageMock.setItem('veyform_language', JSON.stringify({
        language: 'fr',
        timestamp: Date.now()
      }));

      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        allowedLanguages: ['en', 'ja', 'zh'],
        languageStorage: { type: 'localStorage' }
      });

      // Should fall back to default language
      expect(veyform.getLanguage()).toBe('en');
      
      // Invalid storage should be cleared
      expect(localStorageMock.getItem('veyform_language')).toBeNull();
    });

    it('should accept valid language from storage', () => {
      localStorageMock.setItem('veyform_language', JSON.stringify({
        language: 'ja',
        timestamp: Date.now()
      }));

      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        allowedLanguages: ['en', 'ja', 'zh'],
        languageStorage: { type: 'localStorage' }
      });

      expect(veyform.getLanguage()).toBe('ja');
    });

    it('should handle corrupted storage data gracefully', () => {
      localStorageMock.setItem('veyform_language', 'invalid-json');

      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage' }
      });

      // Should fall back to default
      expect(veyform.getLanguage()).toBe('en');
    });
  });

  describe('Integration Tests', () => {
    it('should combine storage and callback', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage' },
        onLanguageChange: callback
      });

      veyform.setLanguage('ja');

      // Both callback and storage should work
      expect(callback).toHaveBeenCalledWith('ja', 'en');
      expect(localStorageMock.getItem('veyform_language')).not.toBeNull();
    });

    it('should combine storage, validation, and callback', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        allowedLanguages: ['en', 'ja', 'zh'],
        languageStorage: { type: 'localStorage' },
        onLanguageChange: callback
      });

      // Valid language change
      veyform.setLanguage('ja');
      expect(callback).toHaveBeenCalledWith('ja', 'en');
      expect(localStorageMock.getItem('veyform_language')).not.toBeNull();

      // Invalid language change
      expect(() => veyform.setLanguage('fr')).toThrow();
      expect(callback).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should restore language from storage and not trigger callback on init', () => {
      localStorageMock.setItem('veyform_language', JSON.stringify({
        language: 'ja',
        timestamp: Date.now()
      }));

      const callback = vi.fn();
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en',
        languageStorage: { type: 'localStorage' },
        onLanguageChange: callback
      });

      expect(veyform.getLanguage()).toBe('ja');
      expect(callback).not.toHaveBeenCalled(); // Callback should not fire on init
    });

    it('should handle default storage config', () => {
      const veyform = new Veyform({
        apiKey: 'test-key',
        defaultLanguage: 'en'
      });

      veyform.setLanguage('ja');

      // Should use default localStorage
      const stored = localStorageMock.getItem('veyform_language');
      expect(stored).not.toBeNull();
    });
  });
});
