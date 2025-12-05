/**
 * @vey/core - Tests for address-client module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AddressClient,
  createAddressClient,
  type AddressClientConfig,
  type AuthCredentials,
} from '../src/address-client';

describe('AddressClient', () => {
  let client: AddressClient;

  beforeEach(() => {
    client = new AddressClient({
      apiEndpoint: 'https://api.test.vey.example',
      apiKey: 'test-api-key',
    });
  });

  describe('Constructor', () => {
    it('should create client with default config', () => {
      const defaultClient = new AddressClient();
      expect(defaultClient).toBeDefined();
      expect(defaultClient.isAuthenticated()).toBe(false);
    });

    it('should create client with custom config', () => {
      const customClient = new AddressClient({
        apiEndpoint: 'https://custom.api.example',
        apiKey: 'custom-key',
        environment: 'production',
      });
      
      expect(customClient).toBeDefined();
      expect(customClient.isAuthenticated()).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should authenticate user with credentials', async () => {
      const credentials: AuthCredentials = {
        did: 'did:key:z6Mk123',
        privateKey: 'test-private-key',
      };

      await client.authenticate(credentials);
      
      expect(client.isAuthenticated()).toBe(true);
      expect(client.getUserDid()).toBe('did:key:z6Mk123');
    });

    it('should update authentication state', async () => {
      expect(client.isAuthenticated()).toBe(false);
      
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'key',
      });
      
      expect(client.isAuthenticated()).toBe(true);
    });

    it('should allow re-authentication with different credentials', async () => {
      await client.authenticate({
        did: 'did:key:z6MkFirst',
        privateKey: 'key1',
      });
      
      expect(client.getUserDid()).toBe('did:key:z6MkFirst');
      
      await client.authenticate({
        did: 'did:key:z6MkSecond',
        privateKey: 'key2',
      });
      
      expect(client.getUserDid()).toBe('did:key:z6MkSecond');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false before authentication', () => {
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return true after authentication', async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'key',
      });
      
      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('getUserDid', () => {
    it('should return undefined before authentication', () => {
      expect(client.getUserDid()).toBeUndefined();
    });

    it('should return DID after authentication', async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'key',
      });
      
      expect(client.getUserDid()).toBe('did:key:z6Mk123');
    });
  });

  describe('Addresses API', () => {
    beforeEach(async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'test-key',
      });
    });

    describe('create', () => {
      it('should create address entry', async () => {
        const addressEntry = {
          country: 'JP',
          province: 'Tokyo',
          city: 'Shibuya',
          streetAddress: '1-1 Dogenzaka',
          postalCode: '150-0043',
        };

        const result = await client.addresses.create(addressEntry);
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.country).toBe('JP');
        expect(result.province).toBe('Tokyo');
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.addresses.create({ country: 'JP' })
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('list', () => {
      it('should list addresses', async () => {
        const result = await client.addresses.list();
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should list addresses with filter', async () => {
        const result = await client.addresses.list({ country: 'JP' });
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.addresses.list()
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('get', () => {
      it('should get address by ID', async () => {
        const result = await client.addresses.get('address-123');
        
        expect(result).toBeDefined();
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.addresses.get('address-123')
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('getByPid', () => {
      it('should get address by PID', async () => {
        const result = await client.addresses.getByPid('JP-13-113-01');
        
        expect(result).toBeDefined();
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.addresses.getByPid('JP-13-113-01')
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('update', () => {
      it('should update address', async () => {
        const updates = {
          streetAddress: '2-2 Dogenzaka',
        };

        const result = await client.addresses.update('address-123', updates);
        
        expect(result).toBeDefined();
        expect(result.id).toBe('address-123');
        expect(result.streetAddress).toBe('2-2 Dogenzaka');
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.addresses.update('address-123', {})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('delete', () => {
      it('should delete address', async () => {
        const result = await client.addresses.delete('address-123');
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.addresses.delete('address-123')
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('Friends API', () => {
    beforeEach(async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'test-key',
      });
    });

    describe('create', () => {
      it('should create friend entry', async () => {
        const friendEntry = {
          friend_did: 'did:key:z6MkFriend',
          friend_pid: 'JP-13-113-01',
          label: 'My Friend',
        };

        const result = await client.friends.create(friendEntry);
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.friend_did).toBe('did:key:z6MkFriend');
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.friends.create({ label: 'Friend' })
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('list', () => {
      it('should list friends', async () => {
        const result = await client.friends.list();
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should list friends with filter', async () => {
        const result = await client.friends.list({ verified: true });
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.friends.list()
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('get', () => {
      it('should get friend by ID', async () => {
        const result = await client.friends.get('friend-123');
        
        expect(result).toBeDefined();
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.friends.get('friend-123')
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('update', () => {
      it('should update friend', async () => {
        const updates = {
          label: 'Updated Label',
        };

        const result = await client.friends.update('friend-123', updates);
        
        expect(result).toBeDefined();
        expect(result.id).toBe('friend-123');
        expect(result.label).toBe('Updated Label');
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.friends.update('friend-123', {})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('delete', () => {
      it('should delete friend', async () => {
        const result = await client.friends.delete('friend-123');
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.friends.delete('friend-123')
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('Shipping API', () => {
    beforeEach(async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'test-key',
      });
    });

    describe('validate', () => {
      it('should validate shipping request', async () => {
        const request = {
          sender: 'did:key:sender',
          recipient: 'did:key:recipient',
        };
        const circuit = {};

        const result = await client.shipping.validate(request, circuit);
        
        expect(result).toBeDefined();
        expect(result.valid).toBe(true);
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.shipping.validate({}, {})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('createWaybill', () => {
      it('should create waybill', async () => {
        const waybill = {
          sender: 'did:key:sender',
          recipient_pid: 'JP-13-113-01',
        };

        const result = await client.shipping.createWaybill(waybill);
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.recipient_pid).toBe('JP-13-113-01');
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.shipping.createWaybill({})
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('Carrier API', () => {
    beforeEach(async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'test-key',
      });
    });

    describe('resolvePID', () => {
      it('should attempt to resolve PID', async () => {
        const request = {
          pid: 'JP-13-113-01',
          carrier: 'yamato',
        };
        const policy = {};

        const result = await client.carrier.resolvePID(request, policy);
        
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.address).toBeNull();
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.carrier.resolvePID({}, {})
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('Audit API', () => {
    beforeEach(async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'test-key',
      });
    });

    describe('log', () => {
      it('should create audit log entry', async () => {
        const logEntry = {
          action: 'address.create',
          timestamp: new Date().toISOString(),
          details: { country: 'JP' },
        };

        const result = await client.audit.log(logEntry);
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.action).toBe('address.create');
      });

      it('should throw error if not authenticated', async () => {
        const unauthClient = new AddressClient();
        
        await expect(
          unauthClient.audit.log({})
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('createAddressClient', () => {
    it('should create AddressClient instance', () => {
      const client = createAddressClient();
      
      expect(client).toBeInstanceOf(AddressClient);
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create AddressClient with config', () => {
      const client = createAddressClient({
        apiKey: 'test-key',
        apiEndpoint: 'https://api.example.com',
      });
      
      expect(client).toBeInstanceOf(AddressClient);
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create functional client', async () => {
      const client = createAddressClient({
        apiKey: 'test-key',
      });

      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'key',
      });

      expect(client.isAuthenticated()).toBe(true);
      
      const addresses = await client.addresses.list();
      expect(Array.isArray(addresses)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full workflow', async () => {
      const client = createAddressClient({
        apiEndpoint: 'https://api.test.example',
        apiKey: 'test-key',
      });

      // Authenticate
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'private-key',
      });

      expect(client.isAuthenticated()).toBe(true);

      // Create address
      const address = await client.addresses.create({
        country: 'JP',
        province: 'Tokyo',
        city: 'Shibuya',
      });
      expect(address.id).toBeDefined();

      // List addresses
      const addresses = await client.addresses.list();
      expect(Array.isArray(addresses)).toBe(true);

      // Create friend
      const friend = await client.friends.create({
        friend_did: 'did:key:friend',
        friend_pid: 'JP-13-113-01',
        label: 'Test Friend',
      });
      expect(friend.id).toBeDefined();

      // Create waybill
      const waybill = await client.shipping.createWaybill({
        recipient_pid: 'JP-13-113-01',
      });
      expect(waybill.id).toBeDefined();
    });

    it('should handle multiple operations sequentially', async () => {
      await client.authenticate({
        did: 'did:key:z6Mk123',
        privateKey: 'key',
      });

      const operations = [
        () => client.addresses.create({ country: 'JP' }),
        () => client.addresses.list(),
        () => client.friends.create({ label: 'Friend' }),
        () => client.friends.list(),
      ];

      for (const op of operations) {
        const result = await op();
        expect(result).toBeDefined();
      }
    });
  });
});
