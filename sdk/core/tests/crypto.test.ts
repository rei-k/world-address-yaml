/**
 * @vey/core - Tests for crypto module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  encryptAddress,
  decryptAddress,
  signData,
  verifySignature,
  generateKey,
  hashData,
  type EncryptionResult,
} from '../src/crypto';

describe('encryptAddress', () => {
  it('should encrypt plaintext', async () => {
    const plaintext = 'Test address data';
    const key = generateKey();

    const result = await encryptAddress(plaintext, key);

    expect(result).toBeDefined();
    expect(result.ciphertext).toBeDefined();
    expect(result.iv).toBeDefined();
    expect(result.algorithm).toBe('AES-256-GCM');
    expect(typeof result.ciphertext).toBe('string');
    expect(typeof result.iv).toBe('string');
  });

  it('should encrypt different data differently', async () => {
    const key = generateKey();
    const plaintext1 = 'Address 1';
    const plaintext2 = 'Address 2';

    const result1 = await encryptAddress(plaintext1, key);
    const result2 = await encryptAddress(plaintext2, key);

    expect(result1.ciphertext).not.toBe(result2.ciphertext);
  });

  it('should produce different IV for each encryption', async () => {
    const key = generateKey();
    const plaintext = 'Same address data';

    const result1 = await encryptAddress(plaintext, key);
    const result2 = await encryptAddress(plaintext, key);

    expect(result1.iv).not.toBe(result2.iv);
    expect(result1.ciphertext).not.toBe(result2.ciphertext);
  });

  it('should encrypt JSON data', async () => {
    const addressData = {
      street: '123 Main St',
      city: 'Tokyo',
      country: 'JP',
      postalCode: '100-0001',
    };
    const key = generateKey();

    const result = await encryptAddress(JSON.stringify(addressData), key);

    expect(result).toBeDefined();
    expect(result.ciphertext).toBeDefined();
  });

  it('should handle empty string', async () => {
    const key = generateKey();
    const result = await encryptAddress('', key);

    expect(result).toBeDefined();
    expect(result.ciphertext).toBeDefined();
  });

  it('should handle long text', async () => {
    const longText = 'A'.repeat(10000);
    const key = generateKey();

    const result = await encryptAddress(longText, key);

    expect(result).toBeDefined();
    expect(result.ciphertext).toBeDefined();
  });

  it('should handle special characters', async () => {
    const specialText = '日本語 🇯🇵 émojis & symbols $#@!';
    const key = generateKey();

    const result = await encryptAddress(specialText, key);

    expect(result).toBeDefined();
    expect(result.ciphertext).toBeDefined();
  });
});

describe('decryptAddress', () => {
  it('should decrypt encrypted data', async () => {
    const plaintext = 'Test address data';
    const key = generateKey();

    const encrypted = await encryptAddress(plaintext, key);
    const decrypted = await decryptAddress(
      encrypted.ciphertext,
      encrypted.iv,
      key,
      encrypted.authTag
    );

    expect(decrypted).toBe(plaintext);
  });

  it('should decrypt JSON data', async () => {
    const addressData = {
      street: '456 Oak Ave',
      city: 'New York',
      country: 'US',
      postalCode: '10001',
    };
    const key = generateKey();

    const encrypted = await encryptAddress(JSON.stringify(addressData), key);
    const decrypted = await decryptAddress(
      encrypted.ciphertext,
      encrypted.iv,
      key,
      encrypted.authTag
    );

    expect(JSON.parse(decrypted)).toEqual(addressData);
  });

  it('should decrypt empty string', async () => {
    const key = generateKey();
    const encrypted = await encryptAddress('', key);
    const decrypted = await decryptAddress(
      encrypted.ciphertext,
      encrypted.iv,
      key,
      encrypted.authTag
    );

    expect(decrypted).toBe('');
  });

  it('should decrypt long text', async () => {
    const longText = 'B'.repeat(5000);
    const key = generateKey();

    const encrypted = await encryptAddress(longText, key);
    const decrypted = await decryptAddress(
      encrypted.ciphertext,
      encrypted.iv,
      key,
      encrypted.authTag
    );

    expect(decrypted).toBe(longText);
  });

  it('should decrypt special characters', async () => {
    const specialText = '中文 한국어 العربية 🌍🚀';
    const key = generateKey();

    const encrypted = await encryptAddress(specialText, key);
    const decrypted = await decryptAddress(
      encrypted.ciphertext,
      encrypted.iv,
      key,
      encrypted.authTag
    );

    expect(decrypted).toBe(specialText);
  });

  it('should fail with wrong key', async () => {
    const plaintext = 'Secret data';
    const key1 = generateKey();
    const key2 = generateKey();

    const encrypted = await encryptAddress(plaintext, key1);

    await expect(
      decryptAddress(encrypted.ciphertext, encrypted.iv, key2, encrypted.authTag)
    ).rejects.toThrow();
  });

  it('should fail with tampered ciphertext', async () => {
    const plaintext = 'Secret data';
    const key = generateKey();

    const encrypted = await encryptAddress(plaintext, key);
    const tamperedCiphertext = encrypted.ciphertext.slice(0, -4) + 'XXXX';

    await expect(
      decryptAddress(tamperedCiphertext, encrypted.iv, key, encrypted.authTag)
    ).rejects.toThrow();
  });
});

describe('signData', () => {
  it('should sign data', async () => {
    const data = 'Data to sign';
    const privateKey = 'test-private-key';

    const signature = await signData(data, privateKey);

    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(0);
  });

  it('should produce consistent signatures for same data and key', async () => {
    const data = 'Same data';
    const privateKey = 'same-key';

    const signature1 = await signData(data, privateKey);
    const signature2 = await signData(data, privateKey);

    expect(signature1).toBe(signature2);
  });

  it('should produce different signatures for different data', async () => {
    const privateKey = 'test-key';

    const signature1 = await signData('Data 1', privateKey);
    const signature2 = await signData('Data 2', privateKey);

    expect(signature1).not.toBe(signature2);
  });

  it('should produce different signatures for different keys', async () => {
    const data = 'Same data';

    const signature1 = await signData(data, 'key1');
    const signature2 = await signData(data, 'key2');

    expect(signature1).not.toBe(signature2);
  });

  it('should sign empty string', async () => {
    const signature = await signData('', 'key');
    expect(signature).toBeDefined();
  });

  it('should sign long data', async () => {
    const longData = 'X'.repeat(10000);
    const signature = await signData(longData, 'key');
    expect(signature).toBeDefined();
  });

  it('should sign special characters', async () => {
    const specialData = '日本語 🎌 émojis';
    const signature = await signData(specialData, 'key');
    expect(signature).toBeDefined();
  });

  it('should sign JSON data', async () => {
    const jsonData = JSON.stringify({ test: 'data', nested: { value: 123 } });
    const signature = await signData(jsonData, 'key');
    expect(signature).toBeDefined();
  });
});

describe('verifySignature', () => {
  it('should verify valid signature', async () => {
    const data = 'Test data';
    const key = 'test-key';

    const signature = await signData(data, key);
    const isValid = await verifySignature(data, signature, key);

    expect(isValid).toBe(true);
  });

  it('should reject invalid signature', async () => {
    const data = 'Test data';
    const key = 'test-key';

    const signature = await signData(data, key);
    const tamperedSignature = signature.slice(0, -4) + 'XXXX';

    const isValid = await verifySignature(data, tamperedSignature, key);

    expect(isValid).toBe(false);
  });

  it('should reject signature with wrong data', async () => {
    const key = 'test-key';

    const signature = await signData('Original data', key);
    const isValid = await verifySignature('Different data', signature, key);

    expect(isValid).toBe(false);
  });

  it('should reject signature with wrong key', async () => {
    const data = 'Test data';

    const signature = await signData(data, 'key1');
    const isValid = await verifySignature(data, signature, 'key2');

    expect(isValid).toBe(false);
  });

  it('should handle verification errors gracefully', async () => {
    const isValid = await verifySignature('data', 'invalid-sig', 'key');
    expect(typeof isValid).toBe('boolean');
  });
});

describe('generateKey', () => {
  it('should generate key with default length', () => {
    const key = generateKey();

    expect(key).toBeDefined();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('should generate key with custom length', () => {
    const key16 = generateKey(16);
    const key32 = generateKey(32);
    const key64 = generateKey(64);

    expect(key16).toBeDefined();
    expect(key32).toBeDefined();
    expect(key64).toBeDefined();
    // Base64 encoded length is roughly 4/3 of byte length
    expect(key64.length).toBeGreaterThan(key32.length);
  });

  it('should generate unique keys', () => {
    const key1 = generateKey();
    const key2 = generateKey();
    const key3 = generateKey();

    expect(key1).not.toBe(key2);
    expect(key2).not.toBe(key3);
    expect(key1).not.toBe(key3);
  });

  it('should generate keys of consistent length for same input', () => {
    const key1 = generateKey(32);
    const key2 = generateKey(32);

    expect(key1.length).toBe(key2.length);
  });

  it('should generate valid base64', () => {
    const key = generateKey();
    // Base64 should only contain these characters
    expect(key).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe('hashData', () => {
  it('should hash data', async () => {
    const data = 'Data to hash';

    const hash = await hashData(data);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce consistent hashes', async () => {
    const data = 'Same data';

    const hash1 = await hashData(data);
    const hash2 = await hashData(data);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different data', async () => {
    const hash1 = await hashData('Data 1');
    const hash2 = await hashData('Data 2');

    expect(hash1).not.toBe(hash2);
  });

  it('should hash empty string', async () => {
    const hash = await hashData('');
    expect(hash).toBeDefined();
  });

  it('should hash long data', async () => {
    const longData = 'Y'.repeat(50000);
    const hash = await hashData(longData);
    expect(hash).toBeDefined();
  });

  it('should hash special characters', async () => {
    const specialData = '日本語 🌸 émojis & symbols';
    const hash = await hashData(specialData);
    expect(hash).toBeDefined();
  });

  it('should hash JSON data', async () => {
    const jsonData = JSON.stringify({ test: 'value', number: 42 });
    const hash = await hashData(jsonData);
    expect(hash).toBeDefined();
  });

  it('should produce different hashes for similar data', async () => {
    const hash1 = await hashData('test');
    const hash2 = await hashData('Test');
    const hash3 = await hashData('test ');

    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash2).not.toBe(hash3);
  });

  it('should produce valid base64 hash', async () => {
    const hash = await hashData('test data');
    expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe('end-to-end encryption', () => {
  it('should encrypt and decrypt complex address data', async () => {
    const addressData = {
      recipient: '山田太郎',
      street: '千代田区丸の内1-1-1',
      city: '東京',
      prefecture: '東京都',
      postalCode: '100-0001',
      country: 'JP',
      phone: '+81-3-1234-5678',
      email: 'test@example.com',
    };

    const key = generateKey();
    const plaintext = JSON.stringify(addressData);

    const encrypted = await encryptAddress(plaintext, key);
    const decrypted = await decryptAddress(
      encrypted.ciphertext,
      encrypted.iv,
      key,
      encrypted.authTag
    );

    expect(JSON.parse(decrypted)).toEqual(addressData);
  });

  it('should handle multiple encrypt/decrypt cycles', async () => {
    const data = 'Test data';
    const key = generateKey();

    let encrypted = await encryptAddress(data, key);
    let decrypted = await decryptAddress(encrypted.ciphertext, encrypted.iv, key, encrypted.authTag);
    expect(decrypted).toBe(data);

    // Second cycle
    encrypted = await encryptAddress(decrypted, key);
    decrypted = await decryptAddress(encrypted.ciphertext, encrypted.iv, key, encrypted.authTag);
    expect(decrypted).toBe(data);

    // Third cycle
    encrypted = await encryptAddress(decrypted, key);
    decrypted = await decryptAddress(encrypted.ciphertext, encrypted.iv, key, encrypted.authTag);
    expect(decrypted).toBe(data);
  });
});

describe('EncryptionResult type', () => {
  it('should have correct structure', async () => {
    const key = generateKey();
    const result = await encryptAddress('test', key);

    const encryptionResult: EncryptionResult = result;
    expect(encryptionResult.ciphertext).toBeDefined();
    expect(encryptionResult.iv).toBeDefined();
    expect(encryptionResult.algorithm).toBeDefined();
    expect(typeof encryptionResult.ciphertext).toBe('string');
    expect(typeof encryptionResult.iv).toBe('string');
    expect(typeof encryptionResult.algorithm).toBe('string');
  });
});
