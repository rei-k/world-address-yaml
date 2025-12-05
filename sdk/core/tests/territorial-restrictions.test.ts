/**
 * Territorial Restrictions Tests
 * Tests for Japanese territorial validation
 */

import { describe, it, expect } from 'vitest';
import {
  isBlockedTerritorialName,
  isBlockedLanguageForJapan,
  validateJapaneseTerritorialInput,
  getTerritorialRestrictionInfo,
} from '../src/territorial-restrictions';

describe('Territorial Restrictions', () => {
  describe('Northern Territories', () => {
    it('should block Russian names', () => {
      expect(isBlockedTerritorialName('Курильские острова')).toBe(true);
      expect(isBlockedTerritorialName('Итуруп')).toBe(true);
      expect(isBlockedTerritorialName('Кунашир')).toBe(true);
      expect(isBlockedTerritorialName('Kuril')).toBe(true);
      expect(isBlockedTerritorialName('Iturup')).toBe(true);
    });

    it('should allow Japanese names', () => {
      expect(isBlockedTerritorialName('北方領土')).toBe(false);
      expect(isBlockedTerritorialName('択捉島')).toBe(false);
      expect(isBlockedTerritorialName('国後島')).toBe(false);
    });

    it('should block Russian language code', () => {
      expect(isBlockedLanguageForJapan('ru')).toBe(true);
      expect(isBlockedLanguageForJapan('ru-RU')).toBe(true);
    });

    it('should validate Northern Territories input', () => {
      const result1 = validateJapaneseTerritorialInput('Итуруп');
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain('Northern Territories');
      expect(result1.suggestion).toBe('北方領土');

      const result2 = validateJapaneseTerritorialInput('北方領土');
      expect(result2.valid).toBe(true);
    });
  });

  describe('Takeshima', () => {
    it('should block Korean names', () => {
      expect(isBlockedTerritorialName('독도')).toBe(true);
      expect(isBlockedTerritorialName('Dokdo')).toBe(true);
    });

    it('should allow Japanese names', () => {
      expect(isBlockedTerritorialName('竹島')).toBe(false);
      expect(isBlockedTerritorialName('タケシマ')).toBe(false);
    });

    it('should block Korean language code', () => {
      expect(isBlockedLanguageForJapan('ko')).toBe(true);
      expect(isBlockedLanguageForJapan('ko-KR')).toBe(true);
    });

    it('should validate Takeshima input', () => {
      const result1 = validateJapaneseTerritorialInput('Dokdo');
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain('Takeshima');
      expect(result1.suggestion).toBe('竹島');

      const result2 = validateJapaneseTerritorialInput('竹島');
      expect(result2.valid).toBe(true);
    });
  });

  describe('Senkaku Islands', () => {
    it('should block Chinese names', () => {
      expect(isBlockedTerritorialName('钓鱼岛')).toBe(true);
      expect(isBlockedTerritorialName('釣魚島')).toBe(true);
      expect(isBlockedTerritorialName('Diaoyu')).toBe(true);
    });

    it('should allow Japanese names', () => {
      expect(isBlockedTerritorialName('尖閣諸島')).toBe(false);
      expect(isBlockedTerritorialName('魚釣島')).toBe(false);
    });

    it('should block Chinese language codes', () => {
      expect(isBlockedLanguageForJapan('zh')).toBe(true);
      expect(isBlockedLanguageForJapan('zh-CN')).toBe(true);
      expect(isBlockedLanguageForJapan('zh-TW')).toBe(true);
    });

    it('should validate Senkaku Islands input', () => {
      const result1 = validateJapaneseTerritorialInput('钓鱼岛');
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain('Senkaku Islands');
      expect(result1.suggestion).toBe('尖閣諸島');

      const result2 = validateJapaneseTerritorialInput('尖閣諸島');
      expect(result2.valid).toBe(true);
    });
  });

  describe('Karafuto (Sakhalin)', () => {
    it('should block Russian names', () => {
      expect(isBlockedTerritorialName('Сахалин')).toBe(true);
      expect(isBlockedTerritorialName('Sakhalin')).toBe(true);
      expect(isBlockedTerritorialName('Южный Сахалин')).toBe(true);
    });

    it('should allow Japanese names', () => {
      expect(isBlockedTerritorialName('樺太')).toBe(false);
      expect(isBlockedTerritorialName('カラフト')).toBe(false);
      expect(isBlockedTerritorialName('南樺太')).toBe(false);
    });

    it('should validate Karafuto input', () => {
      const result1 = validateJapaneseTerritorialInput('Sakhalin');
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain('Karafuto');
      expect(result1.suggestion).toBe('樺太');

      const result2 = validateJapaneseTerritorialInput('樺太');
      expect(result2.valid).toBe(true);
    });
  });

  describe('getTerritorialRestrictionInfo', () => {
    it('should return restriction info for blocked names', () => {
      const info1 = getTerritorialRestrictionInfo('Kuril');
      expect(info1).not.toBeNull();
      expect(info1?.id).toBe('northern_territories');

      const info2 = getTerritorialRestrictionInfo('Dokdo');
      expect(info2).not.toBeNull();
      expect(info2?.id).toBe('takeshima');

      const info3 = getTerritorialRestrictionInfo('Diaoyu');
      expect(info3).not.toBeNull();
      expect(info3?.id).toBe('senkaku');

      const info4 = getTerritorialRestrictionInfo('Sakhalin');
      expect(info4).not.toBeNull();
      expect(info4?.id).toBe('karafuto');
    });

    it('should return null for allowed names', () => {
      const info = getTerritorialRestrictionInfo('東京都');
      expect(info).toBeNull();
    });
  });

  describe('Case insensitivity', () => {
    it('should handle different cases', () => {
      expect(isBlockedTerritorialName('KURIL')).toBe(true);
      expect(isBlockedTerritorialName('kuril')).toBe(true);
      expect(isBlockedTerritorialName('Kuril')).toBe(true);
      expect(isBlockedTerritorialName('DOKDO')).toBe(true);
      expect(isBlockedTerritorialName('dokdo')).toBe(true);
    });
  });

  describe('Partial matches', () => {
    it('should detect blocked names in longer strings', () => {
      expect(isBlockedTerritorialName('Near Kuril Islands')).toBe(true);
      expect(isBlockedTerritorialName('Dokdo Island')).toBe(true);
      expect(isBlockedTerritorialName('Visit Sakhalin')).toBe(true);
    });
  });
});
