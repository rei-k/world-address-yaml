/**
 * @vey/core - Tests for friends module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateFriendQR,
  generateAddressQR,
  scanFriendQR,
  scanAddressQR,
  verifyFriendPID,
  createFriendFromQR,
  generateId,
  type FriendQRPayload,
  type AddressQRPayload,
  type FriendEntry,
} from '../src/friends';

describe('Friends Module', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with timestamp and random components', () => {
      const id = generateId();
      expect(id).toContain('-');
      
      const parts = id.split('-');
      expect(parts.length).toBe(2);
      expect(parseInt(parts[0])).toBeGreaterThan(0);
    });
  });

  describe('generateFriendQR', () => {
    it('should generate a valid friend QR code', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      expect(qrData).toBeDefined();
      expect(typeof qrData).toBe('string');
      
      const payload: FriendQRPayload = JSON.parse(qrData);
      expect(payload.version).toBe('1.0');
      expect(payload.did).toBe('did:key:z6Mk123');
      expect(payload.pid).toBe('JP-13-113-01');
      expect(payload.timestamp).toBeDefined();
      expect(payload.expires_at).toBeDefined();
      expect(payload.signature).toBeDefined();
    });

    it('should use default expiration of 365 days', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key'
      );

      const payload: FriendQRPayload = JSON.parse(qrData);
      const timestamp = new Date(payload.timestamp);
      const expiresAt = new Date(payload.expires_at!);
      
      const daysDiff = (expiresAt.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(daysDiff)).toBe(365);
    });

    it('should use custom expiration days', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        7
      );

      const payload: FriendQRPayload = JSON.parse(qrData);
      const timestamp = new Date(payload.timestamp);
      const expiresAt = new Date(payload.expires_at!);
      
      const daysDiff = (expiresAt.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(daysDiff)).toBe(7);
    });

    it('should include signature in payload', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      const payload: FriendQRPayload = JSON.parse(qrData);
      expect(payload.signature).toBeDefined();
      expect(typeof payload.signature).toBe('string');
      expect(payload.signature.length).toBeGreaterThan(0);
    });
  });

  describe('generateAddressQR', () => {
    it('should generate a valid address QR code', async () => {
      const qrData = await generateAddressQR(
        'JP-13-113-01',
        'encrypted-address-data',
        'signature-data',
        'auth-tag',
        30
      );

      expect(qrData).toBeDefined();
      expect(typeof qrData).toBe('string');
      
      const payload: AddressQRPayload = JSON.parse(qrData);
      expect(payload.version).toBe('1.0');
      expect(payload.pid).toBe('JP-13-113-01');
      expect(payload.encrypted_address).toBe('encrypted-address-data');
      expect(payload.signature).toBe('signature-data');
      expect(payload.auth_tag).toBe('auth-tag');
      expect(payload.timestamp).toBeDefined();
      expect(payload.expires_at).toBeDefined();
    });

    it('should use default expiration of 30 days', async () => {
      const qrData = await generateAddressQR(
        'JP-13-113-01',
        'encrypted-address-data',
        'signature-data'
      );

      const payload: AddressQRPayload = JSON.parse(qrData);
      const timestamp = new Date(payload.timestamp);
      const expiresAt = new Date(payload.expires_at!);
      
      const daysDiff = (expiresAt.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(daysDiff)).toBe(30);
    });

    it('should handle optional auth tag', async () => {
      const qrData = await generateAddressQR(
        'JP-13-113-01',
        'encrypted-address-data',
        'signature-data'
      );

      const payload: AddressQRPayload = JSON.parse(qrData);
      expect(payload.encrypted_address).toBe('encrypted-address-data');
      expect(payload.signature).toBe('signature-data');
    });
  });

  describe('scanFriendQR', () => {
    it('should scan and parse a valid friend QR code', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      const payload = await scanFriendQR(qrData);
      
      expect(payload.version).toBe('1.0');
      expect(payload.did).toBe('did:key:z6Mk123');
      expect(payload.pid).toBe('JP-13-113-01');
      expect(payload.timestamp).toBeDefined();
      expect(payload.expires_at).toBeDefined();
      expect(payload.signature).toBeDefined();
    });

    it('should reject unsupported version', async () => {
      const invalidQR = JSON.stringify({
        version: '2.0',
        did: 'did:key:z6Mk123',
        pid: 'JP-13-113-01',
        timestamp: new Date().toISOString(),
      });

      await expect(scanFriendQR(invalidQR)).rejects.toThrow('Unsupported QR code version');
    });

    it('should reject expired QR code', async () => {
      const expiredQR = JSON.stringify({
        version: '1.0',
        did: 'did:key:z6Mk123',
        pid: 'JP-13-113-01',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await expect(scanFriendQR(expiredQR)).rejects.toThrow('QR code has expired');
    });

    it('should reject QR code with missing DID', async () => {
      const invalidQR = JSON.stringify({
        version: '1.0',
        pid: 'JP-13-113-01',
        timestamp: new Date().toISOString(),
      });

      await expect(scanFriendQR(invalidQR)).rejects.toThrow('missing required fields');
    });

    it('should reject QR code with missing PID', async () => {
      const invalidQR = JSON.stringify({
        version: '1.0',
        did: 'did:key:z6Mk123',
        timestamp: new Date().toISOString(),
      });

      await expect(scanFriendQR(invalidQR)).rejects.toThrow('missing required fields');
    });

    it('should reject invalid JSON', async () => {
      const invalidQR = 'not-valid-json';

      await expect(scanFriendQR(invalidQR)).rejects.toThrow('Failed to parse friend QR');
    });

    it('should accept non-expired QR code', async () => {
      const validQR = JSON.stringify({
        version: '1.0',
        did: 'did:key:z6Mk123',
        pid: 'JP-13-113-01',
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const payload = await scanFriendQR(validQR);
      expect(payload.did).toBe('did:key:z6Mk123');
    });
  });

  describe('scanAddressQR', () => {
    it('should scan and parse a valid address QR code', async () => {
      const qrData = await generateAddressQR(
        'JP-13-113-01',
        'encrypted-address-data',
        'signature-data',
        'auth-tag',
        30
      );

      const payload = await scanAddressQR(qrData);
      
      expect(payload.version).toBe('1.0');
      expect(payload.pid).toBe('JP-13-113-01');
      expect(payload.encrypted_address).toBe('encrypted-address-data');
      expect(payload.signature).toBe('signature-data');
      expect(payload.auth_tag).toBe('auth-tag');
      expect(payload.timestamp).toBeDefined();
      expect(payload.expires_at).toBeDefined();
    });

    it('should reject unsupported version', async () => {
      const invalidQR = JSON.stringify({
        version: '2.0',
        pid: 'JP-13-113-01',
        encrypted_address: 'data',
        signature: 'sig',
        timestamp: new Date().toISOString(),
      });

      await expect(scanAddressQR(invalidQR)).rejects.toThrow('Unsupported QR code version');
    });

    it('should reject expired QR code', async () => {
      const expiredQR = JSON.stringify({
        version: '1.0',
        pid: 'JP-13-113-01',
        encrypted_address: 'data',
        signature: 'sig',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await expect(scanAddressQR(expiredQR)).rejects.toThrow('QR code has expired');
    });

    it('should reject QR code with missing PID', async () => {
      const invalidQR = JSON.stringify({
        version: '1.0',
        encrypted_address: 'data',
        signature: 'sig',
        timestamp: new Date().toISOString(),
      });

      await expect(scanAddressQR(invalidQR)).rejects.toThrow('missing required fields');
    });

    it('should reject QR code with missing encrypted address', async () => {
      const invalidQR = JSON.stringify({
        version: '1.0',
        pid: 'JP-13-113-01',
        signature: 'sig',
        timestamp: new Date().toISOString(),
      });

      await expect(scanAddressQR(invalidQR)).rejects.toThrow('missing required fields');
    });

    it('should reject QR code with missing signature', async () => {
      const invalidQR = JSON.stringify({
        version: '1.0',
        pid: 'JP-13-113-01',
        encrypted_address: 'data',
        timestamp: new Date().toISOString(),
      });

      await expect(scanAddressQR(invalidQR)).rejects.toThrow('missing required fields');
    });

    it('should reject invalid JSON', async () => {
      const invalidQR = 'not-valid-json';

      await expect(scanAddressQR(invalidQR)).rejects.toThrow('Failed to parse address QR');
    });
  });

  describe('verifyFriendPID', () => {
    it('should verify valid PID format', async () => {
      const isValid = await verifyFriendPID('JP-13-113-01');
      expect(isValid).toBe(true);
    });

    it('should verify PIDs with multiple parts', async () => {
      expect(await verifyFriendPID('US-CA-SF')).toBe(true);
      expect(await verifyFriendPID('GB-ENG-LON-12')).toBe(true);
    });

    it('should reject lowercase country codes', async () => {
      const isValid = await verifyFriendPID('jp-13-113-01');
      expect(isValid).toBe(false);
    });

    it('should reject PIDs without country code', async () => {
      const isValid = await verifyFriendPID('123-456');
      expect(isValid).toBe(false);
    });

    it('should reject empty PIDs', async () => {
      const isValid = await verifyFriendPID('');
      expect(isValid).toBe(false);
    });

    it('should reject PIDs with invalid characters', async () => {
      expect(await verifyFriendPID('JP@13-113')).toBe(false);
      expect(await verifyFriendPID('JP-13_113')).toBe(false);
      expect(await verifyFriendPID('JP 13 113')).toBe(false);
    });

    it('should accept PIDs with only country code', async () => {
      const isValid = await verifyFriendPID('JP');
      expect(isValid).toBe(true);
    });
  });

  describe('createFriendFromQR', () => {
    it('should create a friend entry from valid QR data', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      const friendEntry = await createFriendFromQR(
        qrData,
        'did:key:owner123',
        'My Friend'
      );

      expect(friendEntry.owner_did).toBe('did:key:owner123');
      expect(friendEntry.friend_did).toBe('did:key:z6Mk123');
      expect(friendEntry.friend_pid).toBe('JP-13-113-01');
      expect(friendEntry.label).toBe('My Friend');
      expect(friendEntry.verified).toBe(true);
      expect(friendEntry.is_revoked).toBe(false);
      expect(friendEntry.can_use_for_shipping).toBe(true);
      expect(friendEntry.added_at).toBeDefined();
      expect(friendEntry.friend_label_qr_hash).toBeDefined();
      expect(typeof friendEntry.friend_label_qr_hash).toBe('string');
    });

    it('should reject QR with invalid PID', async () => {
      const invalidQR = JSON.stringify({
        version: '1.0',
        did: 'did:key:z6Mk123',
        pid: 'invalid-pid',
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await expect(
        createFriendFromQR(invalidQR, 'did:key:owner123', 'Friend')
      ).rejects.toThrow('Invalid friend PID');
    });

    it('should generate QR hash for verification', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      const friendEntry1 = await createFriendFromQR(
        qrData,
        'did:key:owner123',
        'Friend 1'
      );

      const friendEntry2 = await createFriendFromQR(
        qrData,
        'did:key:owner456',
        'Friend 2'
      );

      // Same QR data should produce same hash
      expect(friendEntry1.friend_label_qr_hash).toBe(friendEntry2.friend_label_qr_hash);
    });

    it('should set correct timestamps', async () => {
      const before = new Date();
      
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      const friendEntry = await createFriendFromQR(
        qrData,
        'did:key:owner123',
        'Friend'
      );

      const after = new Date();
      const addedAt = new Date(friendEntry.added_at);

      expect(addedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(addedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle different labels', async () => {
      const qrData = await generateFriendQR(
        'did:key:z6Mk123',
        'JP-13-113-01',
        'test-private-key',
        30
      );

      const friendEntry1 = await createFriendFromQR(qrData, 'did:key:owner1', 'John Doe');
      const friendEntry2 = await createFriendFromQR(qrData, 'did:key:owner2', '山田太郎');
      const friendEntry3 = await createFriendFromQR(qrData, 'did:key:owner3', 'Friend 🎉');

      expect(friendEntry1.label).toBe('John Doe');
      expect(friendEntry2.label).toBe('山田太郎');
      expect(friendEntry3.label).toBe('Friend 🎉');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full friend QR workflow', async () => {
      // 1. Generate QR
      const qrData = await generateFriendQR(
        'did:key:z6MkUserA',
        'JP-13-113-01',
        'user-a-private-key',
        7
      );

      expect(qrData).toBeDefined();

      // 2. Scan QR
      const scannedPayload = await scanFriendQR(qrData);
      expect(scannedPayload.did).toBe('did:key:z6MkUserA');
      expect(scannedPayload.pid).toBe('JP-13-113-01');

      // 3. Verify PID
      const isValid = await verifyFriendPID(scannedPayload.pid);
      expect(isValid).toBe(true);

      // 4. Create friend entry
      const friendEntry = await createFriendFromQR(
        qrData,
        'did:key:z6MkUserB',
        'User A'
      );

      expect(friendEntry.friend_did).toBe('did:key:z6MkUserA');
      expect(friendEntry.owner_did).toBe('did:key:z6MkUserB');
      expect(friendEntry.verified).toBe(true);
    });

    it('should complete full address QR workflow', async () => {
      // 1. Generate address QR
      const qrData = await generateAddressQR(
        'JP-13-113-01',
        'encrypted-data-123',
        'signature-456',
        'auth-tag-789',
        7
      );

      expect(qrData).toBeDefined();

      // 2. Scan address QR
      const scannedPayload = await scanAddressQR(qrData);
      expect(scannedPayload.pid).toBe('JP-13-113-01');
      expect(scannedPayload.encrypted_address).toBe('encrypted-data-123');
      expect(scannedPayload.signature).toBe('signature-456');
      expect(scannedPayload.auth_tag).toBe('auth-tag-789');
    });

    it('should handle multiple sequential operations', async () => {
      const operations = [
        { did: 'did:key:user1', pid: 'JP-13-113-01' },
        { did: 'did:key:user2', pid: 'US-CA-SF-12' },
        { did: 'did:key:user3', pid: 'GB-ENG-LON' },
      ];

      for (const op of operations) {
        const qrData = await generateFriendQR(op.did, op.pid, 'key', 30);
        const scanned = await scanFriendQR(qrData);
        
        expect(scanned.did).toBe(op.did);
        expect(scanned.pid).toBe(op.pid);
        
        const isValid = await verifyFriendPID(op.pid);
        expect(isValid).toBe(true);
      }
    });
  });
});
