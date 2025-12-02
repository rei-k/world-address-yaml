/**
 * @vey/core - Translation service integration
 * Supports LibreTranslate, Apertium, and Argos Translate
 */

import type {
  TranslationService,
  TranslationServiceConfig,
  TranslationRequest,
  TranslationResult,
} from './types';

// In-memory translation cache
const translationCache = new Map<string, TranslationResult>();

/**
 * Generate cache key for translation
 */
function getCacheKey(req: TranslationRequest): string {
  return `${req.sourceLang}:${req.targetLang}:${req.text}`;
}

/**
 * LibreTranslate service implementation
 */
async function translateWithLibreTranslate(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  const endpoint = config.endpoint || 'https://libretranslate.com';
  const url = `${endpoint}/translate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: req.text,
      source: req.sourceLang,
      target: req.targetLang,
      format: 'text',
      api_key: config.apiKey,
    }),
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    translatedText: data.translatedText,
    sourceLang: req.sourceLang,
    targetLang: req.targetLang,
    service: 'libretranslate',
    cached: false,
  };
}

/**
 * Apertium service implementation
 */
async function translateWithApertium(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  const endpoint = config.endpoint || 'https://www.apertium.org/apy';
  const langPair = `${req.sourceLang}|${req.targetLang}`;
  const url = `${endpoint}/translate?langpair=${langPair}&q=${encodeURIComponent(req.text)}`;

  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Apertium API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(`Apertium translation failed: ${data.responseDetails}`);
  }

  return {
    translatedText: data.responseData.translatedText,
    sourceLang: req.sourceLang,
    targetLang: req.targetLang,
    service: 'apertium',
    cached: false,
  };
}

/**
 * Argos Translate service implementation
 * Note: Argos Translate is typically run locally, so this assumes a local server
 */
async function translateWithArgosTranslate(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  const endpoint = config.endpoint || 'http://localhost:5000';
  const url = `${endpoint}/translate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: req.text,
      source: req.sourceLang,
      target: req.targetLang,
    }),
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Argos Translate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    translatedText: data.translatedText,
    sourceLang: req.sourceLang,
    targetLang: req.targetLang,
    service: 'argostranslate',
    cached: false,
  };
}

/**
 * Main translation function with service selection and caching
 */
export async function translate(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  // Check cache first
  const cacheKey = getCacheKey(req);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  // If source and target are the same, return as-is
  if (req.sourceLang === req.targetLang) {
    return {
      translatedText: req.text,
      sourceLang: req.sourceLang,
      targetLang: req.targetLang,
      service: config.service,
      cached: false,
    };
  }

  let result: TranslationResult;

  try {
    switch (config.service) {
      case 'libretranslate':
        result = await translateWithLibreTranslate(req, config);
        break;
      case 'apertium':
        result = await translateWithApertium(req, config);
        break;
      case 'argostranslate':
        result = await translateWithArgosTranslate(req, config);
        break;
      default:
        throw new Error(`Unsupported translation service: ${config.service}`);
    }

    // Cache the result
    translationCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error(`Translation failed with ${config.service}:`, error);
    throw error;
  }
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(
  requests: TranslationRequest[],
  config: TranslationServiceConfig
): Promise<TranslationResult[]> {
  return Promise.all(requests.map((req) => translate(req, config)));
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics
 */
export function getTranslationCacheStats() {
  return {
    size: translationCache.size,
    entries: Array.from(translationCache.keys()),
  };
}
