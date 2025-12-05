/**
 * @vey/core - Tests for gift module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGiftOrder,
  getGiftOrder,
  updateGiftOrderStatus,
  getGiftDeliveryCandidates,
  selectDeliveryLocation,
  autoCancelExpiredGift,
  CarrierIntentAI,
  GiftDeadlineWatchAI,
  LocationClusteringAI,
  SmartAddressSuggestionAI,
  CancelReasonAI,
  type CreateGiftOrderRequest,
  type GetDeliveryCandidatesRequest,
  type SelectDeliveryLocationRequest,
} from '../src/gift';
import type { CarrierCode } from '../src/logistics';
import type { GiftDeliveryCandidate, CandidateCluster } from '../src/types';
import { GiftOrderStatus, CancellationReason } from '../src/types';

describe('createGiftOrder', () => {
  it('should create gift order with required fields', async () => {
    const request: CreateGiftOrderRequest = {
      senderId: 'did:key:sender123',
      recipientGAPPID: 'JP-13-113',
      productId: 'product-456',
    };

    const result = await createGiftOrder(request);

    expect(result).toBeDefined();
    expect(result.orderId).toBeDefined();
    expect(result.giftLink).toBeDefined();
    expect(result.qrCode).toBeDefined();
    expect(result.waybillId).toBeDefined();
    expect(result.deadline).toBeDefined();
  });

  it('should create gift order with custom deadline', async () => {
    const customDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const request: CreateGiftOrderRequest = {
      senderId: 'did:key:sender',
      recipientGAPPID: 'US-CA-123',
      productId: 'product-789',
      deadline: customDeadline,
    };

    const result = await createGiftOrder(request);
    expect(result.deadline).toBe(customDeadline);
  });

  it('should create gift order with message', async () => {
    const request: CreateGiftOrderRequest = {
      senderId: 'did:key:sender',
      recipientGAPPID: 'GB-LON-001',
      productId: 'product-001',
      message: 'Happy Birthday!',
    };

    const result = await createGiftOrder(request);
    expect(result).toBeDefined();
  });

  it('should use default 7-day deadline', async () => {
    const request: CreateGiftOrderRequest = {
      senderId: 'did:key:sender',
      recipientGAPPID: 'FR-75-001',
      productId: 'product-002',
    };

    const result = await createGiftOrder(request);
    const deadline = new Date(result.deadline);
    const now = new Date();
    const diffDays = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBeGreaterThanOrEqual(6);
    expect(diffDays).toBeLessThanOrEqual(8);
  });

  it('should generate unique order IDs', async () => {
    const request: CreateGiftOrderRequest = {
      senderId: 'did:key:sender',
      recipientGAPPID: 'DE-BE-001',
      productId: 'product-003',
    };

    const result1 = await createGiftOrder(request);
    const result2 = await createGiftOrder(request);
    
    expect(result1.orderId).not.toBe(result2.orderId);
    expect(result1.waybillId).not.toBe(result2.waybillId);
  });
});

describe('getGiftOrder', () => {
  it('should return null for non-existent order', async () => {
    const result = await getGiftOrder('non-existent-id');
    expect(result).toBeNull();
  });
});

describe('updateGiftOrderStatus', () => {
  it('should update order status', async () => {
    await expect(
      updateGiftOrderStatus('order-123', GiftOrderStatus.READY_TO_SHIP)
    ).resolves.toBeUndefined();
  });
});

describe('autoCancelExpiredGift', () => {
  it('should throw error for non-existent order', async () => {
    await expect(autoCancelExpiredGift('non-existent-order')).rejects.toThrow('Order not found');
  });
});

describe('CarrierIntentAI', () => {
  let ai: CarrierIntentAI;

  beforeEach(() => {
    ai = new CarrierIntentAI();
  });

  describe('extractDeliverableCandidates', () => {
    it('should extract deliverable candidates', async () => {
      const addresses = ['JP-13-113-01', 'JP-13-101-02'];
      const carrierCode: CarrierCode = 'DHL';
      const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      const candidates = await ai.extractDeliverableCandidates(
        addresses,
        carrierCode,
        deadline
      );

      expect(Array.isArray(candidates)).toBe(true);
    });

    it('should handle empty address list', async () => {
      const candidates = await ai.extractDeliverableCandidates(
        [],
        'DHL' as CarrierCode,
        new Date()
      );

      expect(Array.isArray(candidates)).toBe(true);
      expect(candidates.length).toBe(0);
    });
  });

  describe('verifyCarrierCompatibility', () => {
    it('should verify carrier compatibility', async () => {
      const result = await ai.verifyCarrierCompatibility(
        'JP-13-113-01',
        'DHL' as CarrierCode
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('compatible');
      expect(typeof result.compatible).toBe('boolean');
    });
  });

  describe('calculateSuccessProbability', () => {
    it('should calculate success probability', async () => {
      const probability = await ai.calculateSuccessProbability(
        'JP-13-113-01',
        'DHL' as CarrierCode
      );

      expect(typeof probability).toBe('number');
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });
  });

  describe('getDeliveryHistory', () => {
    it('should get delivery history', async () => {
      const history = await ai.getDeliveryHistory('JP-13-113-01');

      expect(history).toBeDefined();
      expect(history).toHaveProperty('total');
      expect(history).toHaveProperty('successful');
      expect(typeof history.total).toBe('number');
      expect(typeof history.successful).toBe('number');
    });
  });

  describe('calculatePriority', () => {
    it('should calculate urgent priority for <12 hours', () => {
      const deadline = new Date(Date.now() + 6 * 60 * 60 * 1000);
      const priority = ai.calculatePriority(deadline);
      expect(priority).toBe('urgent');
    });

    it('should calculate high priority for <24 hours', () => {
      const deadline = new Date(Date.now() + 18 * 60 * 60 * 1000);
      const priority = ai.calculatePriority(deadline);
      expect(priority).toBe('high');
    });

    it('should calculate normal priority for <48 hours', () => {
      const deadline = new Date(Date.now() + 36 * 60 * 60 * 1000);
      const priority = ai.calculatePriority(deadline);
      expect(priority).toBe('normal');
    });

    it('should calculate low priority for >=48 hours', () => {
      const deadline = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const priority = ai.calculatePriority(deadline);
      expect(priority).toBe('low');
    });
  });

  describe('getAddressLabel', () => {
    it('should get address label', async () => {
      const label = await ai.getAddressLabel('JP-13-113-01');
      expect(typeof label).toBe('string');
    });
  });

  describe('getLocationType', () => {
    it('should get location type', async () => {
      const type = await ai.getLocationType('JP-13-113-01');
      expect(['home', 'office', 'convenience_store', 'locker', 'pickup_point', 'other']).toContain(type);
    });
  });
});

describe('GiftDeadlineWatchAI', () => {
  let ai: GiftDeadlineWatchAI;

  beforeEach(() => {
    ai = new GiftDeadlineWatchAI();
  });

  describe('detectExpirationRisk', () => {
    it('should throw error for non-existent order', async () => {
      await expect(ai.detectExpirationRisk('non-existent-order')).rejects.toThrow('Order not found');
    });
  });

  describe('scheduleReminders', () => {
    it('should schedule reminders', async () => {
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const preferences = {
        timezone: 'Asia/Tokyo',
        quietHours: { start: '22:00', end: '08:00' },
      };

      const schedule = await ai.scheduleReminders('order-123', deadline, preferences);

      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBeGreaterThan(0);
    });

    it('should create 72h, 24h, and 3h reminders', async () => {
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const preferences = {
        timezone: 'UTC',
      };

      const schedule = await ai.scheduleReminders('order-123', deadline, preferences);

      const types = schedule.map(s => s.reminderType);
      expect(types).toContain('72h');
      expect(types).toContain('24h');
      expect(types).toContain('3h');
    });
  });

  describe('calculateOptimalSendTime', () => {
    it('should calculate optimal send time', () => {
      const scheduledTime = new Date();
      const result = ai.calculateOptimalSendTime(scheduledTime, 'UTC');

      expect(typeof result).toBe('string');
    });

    it('should handle quiet hours', () => {
      const scheduledTime = new Date();
      const result = ai.calculateOptimalSendTime(
        scheduledTime,
        'UTC',
        { start: '22:00', end: '08:00' }
      );

      expect(typeof result).toBe('string');
    });
  });

  describe('sendUrgentReminder', () => {
    it('should send email reminder', async () => {
      await expect(
        ai.sendUrgentReminder('order-123', 'email')
      ).resolves.toBeUndefined();
    });

    it('should send SMS reminder', async () => {
      await expect(
        ai.sendUrgentReminder('order-123', 'sms')
      ).resolves.toBeUndefined();
    });

    it('should send push reminder', async () => {
      await expect(
        ai.sendUrgentReminder('order-123', 'push')
      ).resolves.toBeUndefined();
    });
  });

  describe('adjustSearchPriority', () => {
    it('should adjust search priority', async () => {
      await expect(
        ai.adjustSearchPriority('order-123', 24)
      ).resolves.toBeUndefined();
    });
  });
});

describe('LocationClusteringAI', () => {
  let ai: LocationClusteringAI;

  beforeEach(() => {
    ai = new LocationClusteringAI();
  });

  describe('clusterCandidates', () => {
    it('should cluster candidates', async () => {
      const candidates: GiftDeliveryCandidate[] = [
        {
          pid: 'JP-13-113-01',
          label: 'Home',
          type: 'home',
          carrierCompatible: true,
          aiScore: 95,
          successProbability: 0.92,
          previousDeliveries: 10,
          successfulDeliveries: 9,
          priority: 'normal',
        },
      ];

      const result = await ai.clusterCandidates(candidates);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('clusters');
      expect(result).toHaveProperty('optimalCandidates');
      expect(Array.isArray(result.clusters)).toBe(true);
      expect(Array.isArray(result.optimalCandidates)).toBe(true);
    });

    it('should handle empty candidates', async () => {
      const result = await ai.clusterCandidates([]);

      expect(result.clusters).toBeDefined();
      expect(result.optimalCandidates).toBeDefined();
    });

    it('should accept custom options', async () => {
      const result = await ai.clusterCandidates([], {
        maxClusters: 5,
        radiusKm: 3.0,
        minCandidates: 2,
      });

      expect(result).toBeDefined();
    });
  });

  describe('calculateClusterCenter', () => {
    it('should calculate cluster center', async () => {
      const candidates: GiftDeliveryCandidate[] = [];
      const center = await ai.calculateClusterCenter(candidates);

      expect(center).toBeDefined();
      expect(center).toHaveProperty('latitude');
      expect(center).toHaveProperty('longitude');
      expect(typeof center.latitude).toBe('number');
      expect(typeof center.longitude).toBe('number');
    });
  });

  describe('selectOptimalCandidate', () => {
    it('should select optimal candidate from cluster', async () => {
      const cluster: CandidateCluster = {
        center: { latitude: 35.6812, longitude: 139.7671 },
        radius: 1000,
        candidates: [
          {
            pid: 'JP-13-113-01',
            label: 'Home',
            type: 'home',
            carrierCompatible: true,
            aiScore: 95,
            successProbability: 0.92,
            previousDeliveries: 10,
            successfulDeliveries: 9,
            priority: 'normal',
          },
          {
            pid: 'JP-13-101-02',
            label: 'Office',
            type: 'office',
            carrierCompatible: true,
            aiScore: 85,
            successProbability: 0.88,
            previousDeliveries: 5,
            successfulDeliveries: 4,
            priority: 'normal',
          },
        ],
      };

      const result = await ai.selectOptimalCandidate(cluster);
      expect(result).toBeDefined();
      expect(result.aiScore).toBeGreaterThanOrEqual(85);
    });
  });
});

describe('SmartAddressSuggestionAI', () => {
  let ai: SmartAddressSuggestionAI;

  beforeEach(() => {
    ai = new SmartAddressSuggestionAI();
  });

  describe('suggestOptimalLocation', () => {
    it('should suggest optimal location', async () => {
      const context = {
        currentTime: new Date(),
        deliveryTimeframe: {
          start: new Date(),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      };

      const result = await ai.suggestOptimalLocation('did:key:recipient', context);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('reasoning');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.reasoning).toBe('string');
    });

    it('should include current location in context', async () => {
      const context = {
        currentTime: new Date(),
        currentLocation: { latitude: 35.6812, longitude: 139.7671 },
        deliveryTimeframe: {
          start: new Date(),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      };

      const result = await ai.suggestOptimalLocation('did:key:recipient', context);
      expect(result.suggestions).toBeDefined();
    });
  });
});

describe('CancelReasonAI', () => {
  let ai: CancelReasonAI;

  beforeEach(() => {
    ai = new CancelReasonAI();
  });

  describe('classifyCancellationReason', () => {
    it('should classify deadline expired', async () => {
      const result = await ai.classifyCancellationReason('order-123', {
        hasSelectedAddress: false,
        isExpired: true,
      });

      expect(result.reason).toBe(CancellationReason.DEADLINE_EXPIRED);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should classify user cancelled', async () => {
      const result = await ai.classifyCancellationReason('order-123', {
        hasSelectedAddress: false,
        isExpired: false,
        userAction: 'cancel',
      });

      expect(result.reason).toBe(CancellationReason.USER_CANCELLED);
      expect(result.confidence).toBe(1.0);
    });

    it('should classify address unset', async () => {
      const result = await ai.classifyCancellationReason('order-123', {
        hasSelectedAddress: false,
        isExpired: false,
      });

      expect(result.reason).toBe(CancellationReason.ADDRESS_UNSET);
    });

    it('should provide sender and recipient messages', async () => {
      const result = await ai.classifyCancellationReason('order-123', {
        hasSelectedAddress: false,
        isExpired: true,
      });

      expect(result.message).toBeDefined();
      expect(result.message.sender).toBeDefined();
      expect(result.message.recipient).toBeDefined();
      expect(typeof result.message.sender).toBe('string');
      expect(typeof result.message.recipient).toBe('string');
    });

    it('should provide retry option for expired gifts', async () => {
      const result = await ai.classifyCancellationReason('order-123', {
        hasSelectedAddress: false,
        isExpired: true,
      });

      expect(result.retryOption).toBeDefined();
      expect(result.retryOption!.available).toBe(true);
      expect(result.retryOption!.suggestedAction).toBeDefined();
    });
  });

  describe('getSenderMessage', () => {
    it('should get message for each cancellation reason', () => {
      const reasons = [
        CancellationReason.DEADLINE_EXPIRED,
        CancellationReason.USER_CANCELLED,
        CancellationReason.ADDRESS_UNSET,
        CancellationReason.SYSTEM_ERROR,
      ];

      for (const reason of reasons) {
        const message = ai.getSenderMessage(reason);
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getRecipientMessage', () => {
    it('should get message for each cancellation reason', () => {
      const reasons = [
        CancellationReason.DEADLINE_EXPIRED,
        CancellationReason.USER_CANCELLED,
        CancellationReason.ADDRESS_UNSET,
        CancellationReason.SYSTEM_ERROR,
      ];

      for (const reason of reasons) {
        const message = ai.getRecipientMessage(reason);
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getRetryOption', () => {
    it('should provide retry option for deadline expired', () => {
      const option = ai.getRetryOption(CancellationReason.DEADLINE_EXPIRED);
      expect(option).toBeDefined();
      expect(option!.available).toBe(true);
      expect(option!.newDeadline).toBeDefined();
    });

    it('should not provide retry option for other reasons', () => {
      const option = ai.getRetryOption(CancellationReason.USER_CANCELLED);
      expect(option).toBeUndefined();
    });
  });

  describe('analyzeCancellationStats', () => {
    it('should analyze cancellation statistics', async () => {
      const period = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      const stats = await ai.analyzeCancellationStats(period);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byReason');
      expect(stats).toHaveProperty('trends');
      expect(stats).toHaveProperty('suggestions');
      expect(typeof stats.total).toBe('number');
    });
  });
});
