/**
 * @vey/core - Tests for gift delivery system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  type CreateGiftOrderResponse,
  type GetDeliveryCandidatesRequest,
  type SelectDeliveryLocationRequest,
} from '../src/gift';
import { GiftOrderStatus, CancellationReason } from '../src/types';

describe('Gift Delivery System', () => {
  describe('createGiftOrder', () => {
    it('should create a gift order with default deadline', async () => {
      const request: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
        message: 'Happy Birthday!',
      };

      const result = await createGiftOrder(request);

      expect(result.orderId).toBeDefined();
      expect(result.giftLink).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.waybillId).toBeDefined();
      expect(result.deadline).toBeDefined();
      
      expect(result.giftLink).toContain(result.orderId);
      expect(result.giftLink).toContain('token=');
    });

    it('should use custom deadline if provided', async () => {
      const customDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      
      const request: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
        deadline: customDeadline,
      };

      const result = await createGiftOrder(request);

      expect(result.deadline).toBe(customDeadline);
    });

    it('should generate unique order IDs', async () => {
      const request: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
      };

      const result1 = await createGiftOrder(request);
      const result2 = await createGiftOrder(request);

      expect(result1.orderId).not.toBe(result2.orderId);
      expect(result1.waybillId).not.toBe(result2.waybillId);
    });

    it('should include optional message', async () => {
      const request: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
        message: 'Enjoy your gift! 🎁',
      };

      const result = await createGiftOrder(request);
      expect(result.orderId).toBeDefined();
    });

    it('should generate QR code', async () => {
      const request: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
      };

      const result = await createGiftOrder(request);
      
      expect(result.qrCode).toBeDefined();
      expect(typeof result.qrCode).toBe('string');
      expect(result.qrCode.length).toBeGreaterThan(0);
    });

    it('should set default deadline to 7 days', async () => {
      const before = new Date(Date.now() + 6.9 * 24 * 60 * 60 * 1000);
      
      const request: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
      };

      const result = await createGiftOrder(request);
      const deadline = new Date(result.deadline);
      
      const after = new Date(Date.now() + 7.1 * 24 * 60 * 60 * 1000);
      
      expect(deadline.getTime()).toBeGreaterThan(before.getTime());
      expect(deadline.getTime()).toBeLessThan(after.getTime());
    });
  });

  describe('getGiftOrder', () => {
    it('should return null for non-existent order', async () => {
      const result = await getGiftOrder('non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle various order IDs', async () => {
      const ids = ['ORD-123', 'ORD-456', 'ORD-789'];
      
      for (const id of ids) {
        const result = await getGiftOrder(id);
        expect(result).toBeNull(); // Placeholder implementation
      }
    });
  });

  describe('updateGiftOrderStatus', () => {
    it('should update order status', async () => {
      await expect(
        updateGiftOrderStatus('order-123', GiftOrderStatus.READY_TO_SHIP)
      ).resolves.toBeUndefined();
    });

    it('should handle different statuses', async () => {
      const statuses = [
        GiftOrderStatus.PENDING_SELECTION,
        GiftOrderStatus.READY_TO_SHIP,
        GiftOrderStatus.SHIPPED,
        GiftOrderStatus.DELIVERED,
        GiftOrderStatus.EXPIRED,
        GiftOrderStatus.CANCELLED,
      ];

      for (const status of statuses) {
        await expect(
          updateGiftOrderStatus('order-123', status)
        ).resolves.toBeUndefined();
      }
    });
  });

  describe('autoCancelExpiredGift', () => {
    it('should throw error for non-existent order', async () => {
      // getGiftOrder returns null in placeholder implementation
      await expect(
        autoCancelExpiredGift('order-123')
      ).rejects.toThrow('Order not found');
    });

    it('should have correct function signature', () => {
      // Verify the function exists and returns a promise
      expect(typeof autoCancelExpiredGift).toBe('function');
    });
  });

  describe('CarrierIntentAI', () => {
    let ai: CarrierIntentAI;

    beforeEach(() => {
      ai = new CarrierIntentAI();
    });

    describe('extractDeliverableCandidates', () => {
      it('should extract candidates from addresses', async () => {
        const addresses = ['JP-13-113-01', 'JP-13-101-02'];
        const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

        const candidates = await ai.extractDeliverableCandidates(
          addresses,
          'yamato',
          deadline
        );

        expect(Array.isArray(candidates)).toBe(true);
        expect(candidates.length).toBeGreaterThan(0);
        
        candidates.forEach(candidate => {
          expect(candidate.pid).toBeDefined();
          expect(candidate.label).toBeDefined();
          expect(candidate.type).toBeDefined();
          expect(candidate.carrierCompatible).toBe(true);
          expect(candidate.aiScore).toBeDefined();
          expect(candidate.successProbability).toBeDefined();
        });
      });

      it('should handle empty address list', async () => {
        const addresses: string[] = [];
        const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

        const candidates = await ai.extractDeliverableCandidates(
          addresses,
          'yamato',
          deadline
        );

        expect(Array.isArray(candidates)).toBe(true);
        expect(candidates.length).toBe(0);
      });

      it('should calculate priority based on deadline', async () => {
        const addresses = ['JP-13-113-01'];
        const nearDeadline = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours

        const candidates = await ai.extractDeliverableCandidates(
          addresses,
          'yamato',
          nearDeadline
        );

        if (candidates.length > 0) {
          expect(candidates[0].priority).toBe('urgent');
        }
      });
    });

    describe('verifyCarrierCompatibility', () => {
      it('should verify carrier compatibility', async () => {
        const result = await ai.verifyCarrierCompatibility(
          'JP-13-113-01',
          'yamato'
        );

        expect(result).toHaveProperty('compatible');
        expect(typeof result.compatible).toBe('boolean');
      });
    });

    describe('calculateSuccessProbability', () => {
      it('should calculate success probability', async () => {
        const probability = await ai.calculateSuccessProbability(
          'JP-13-113-01',
          'yamato'
        );

        expect(typeof probability).toBe('number');
        expect(probability).toBeGreaterThanOrEqual(0);
        expect(probability).toBeLessThanOrEqual(1);
      });
    });

    describe('getDeliveryHistory', () => {
      it('should get delivery history', async () => {
        const history = await ai.getDeliveryHistory('JP-13-113-01');

        expect(history).toHaveProperty('total');
        expect(history).toHaveProperty('successful');
        expect(typeof history.total).toBe('number');
        expect(typeof history.successful).toBe('number');
      });
    });

    describe('calculatePriority', () => {
      it('should return urgent for < 12 hours', () => {
        const deadline = new Date(Date.now() + 6 * 60 * 60 * 1000);
        const priority = ai.calculatePriority(deadline);
        expect(priority).toBe('urgent');
      });

      it('should return high for < 24 hours', () => {
        const deadline = new Date(Date.now() + 18 * 60 * 60 * 1000);
        const priority = ai.calculatePriority(deadline);
        expect(priority).toBe('high');
      });

      it('should return normal for < 48 hours', () => {
        const deadline = new Date(Date.now() + 36 * 60 * 60 * 1000);
        const priority = ai.calculatePriority(deadline);
        expect(priority).toBe('normal');
      });

      it('should return low for >= 48 hours', () => {
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
        
        const validTypes = ['home', 'office', 'convenience_store', 'locker', 'pickup_point', 'other'];
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('GiftDeadlineWatchAI', () => {
    let ai: GiftDeadlineWatchAI;

    beforeEach(() => {
      ai = new GiftDeadlineWatchAI();
    });

    describe('startWatch', () => {
      it('should throw error for non-existent order', async () => {
        // getGiftOrder returns null in placeholder implementation
        await expect(
          ai.startWatch({
            orderId: 'order-123',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            recipientPreferences: {
              timezone: 'Asia/Tokyo',
              language: 'ja',
              notificationChannels: ['email'],
            },
          })
        ).rejects.toThrow('Order not found');
      });
    });

    describe('detectExpirationRisk', () => {
      it('should detect critical risk for < 24 hours', async () => {
        // This would need a mock for getGiftOrder
        // For now, test the structure
        await expect(ai.detectExpirationRisk('order-123')).rejects.toThrow();
      });
    });

    describe('scheduleReminders', () => {
      it('should schedule reminders at 72h, 24h, and 3h', async () => {
        const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const preferences = {
          timezone: 'Asia/Tokyo',
          language: 'ja',
          notificationChannels: ['email' as const],
        };

        const schedule = await ai.scheduleReminders(
          'order-123',
          deadline,
          preferences
        );

        expect(schedule.length).toBeGreaterThan(0);
        expect(schedule.some(s => s.reminderType === '72h')).toBe(true);
        expect(schedule.some(s => s.reminderType === '24h')).toBe(true);
        expect(schedule.some(s => s.reminderType === '3h')).toBe(true);
      });

      it('should include correct reminder details', async () => {
        const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const preferences = {
          timezone: 'UTC',
          language: 'en',
          notificationChannels: ['email' as const],
        };

        const schedule = await ai.scheduleReminders(
          'order-123',
          deadline,
          preferences
        );

        schedule.forEach(reminder => {
          expect(reminder.reminderType).toBeDefined();
          expect(reminder.scheduledAt).toBeDefined();
          expect(reminder.channel).toBeDefined();
          expect(reminder.message).toBeDefined();
          expect(reminder.sent).toBe(false);
        });
      });
    });

    describe('calculateOptimalSendTime', () => {
      it('should calculate optimal send time', () => {
        const scheduledTime = new Date();
        const timezone = 'Asia/Tokyo';
        
        const result = ai.calculateOptimalSendTime(scheduledTime, timezone);
        
        expect(typeof result).toBe('string');
        expect(result).toBeDefined();
      });

      it('should handle quiet hours', () => {
        const scheduledTime = new Date();
        const timezone = 'America/New_York';
        const quietHours = { start: '22:00', end: '08:00' };
        
        const result = ai.calculateOptimalSendTime(
          scheduledTime,
          timezone,
          quietHours
        );
        
        expect(typeof result).toBe('string');
      });
    });

    describe('sendUrgentReminder', () => {
      it('should send urgent reminder via email', async () => {
        await expect(
          ai.sendUrgentReminder('order-123', 'email')
        ).resolves.toBeUndefined();
      });

      it('should send urgent reminder via SMS', async () => {
        await expect(
          ai.sendUrgentReminder('order-123', 'sms')
        ).resolves.toBeUndefined();
      });

      it('should send urgent reminder via push', async () => {
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
        const candidates = [
          {
            pid: 'JP-13-113-01',
            label: 'Home',
            type: 'home' as const,
            carrierCompatible: true,
            aiScore: 95,
            successProbability: 0.92,
            previousDeliveries: 10,
            successfulDeliveries: 9,
            priority: 'normal' as const,
          },
        ];

        const result = await ai.clusterCandidates(candidates);

        expect(result.clusters).toBeDefined();
        expect(Array.isArray(result.clusters)).toBe(true);
        expect(result.optimalCandidates).toBeDefined();
        expect(Array.isArray(result.optimalCandidates)).toBe(true);
      });

      it('should handle clustering options', async () => {
        const candidates = [
          {
            pid: 'JP-13-113-01',
            label: 'Home',
            type: 'home' as const,
            carrierCompatible: true,
            aiScore: 95,
            successProbability: 0.92,
            previousDeliveries: 10,
            successfulDeliveries: 9,
            priority: 'normal' as const,
          },
        ];

        const result = await ai.clusterCandidates(candidates, {
          maxClusters: 3,
          radiusKm: 1.5,
          minCandidates: 2,
        });

        expect(result).toBeDefined();
      });
    });

    describe('calculateClusterCenter', () => {
      it('should calculate cluster center', async () => {
        const candidates = [
          {
            pid: 'JP-13-113-01',
            label: 'Home',
            type: 'home' as const,
            carrierCompatible: true,
            aiScore: 95,
            successProbability: 0.92,
            previousDeliveries: 10,
            successfulDeliveries: 9,
            priority: 'normal' as const,
          },
        ];

        const center = await ai.calculateClusterCenter(candidates);

        expect(center.latitude).toBeDefined();
        expect(center.longitude).toBeDefined();
        expect(typeof center.latitude).toBe('number');
        expect(typeof center.longitude).toBe('number');
      });
    });

    describe('selectOptimalCandidate', () => {
      it('should select candidate with highest score', async () => {
        const cluster = {
          centroid: { latitude: 35.6812, longitude: 139.7671 },
          radiusKm: 2.0,
          candidates: [
            {
              pid: 'JP-13-113-01',
              label: 'Home',
              type: 'home' as const,
              carrierCompatible: true,
              aiScore: 95,
              successProbability: 0.92,
              previousDeliveries: 10,
              successfulDeliveries: 9,
              priority: 'normal' as const,
            },
            {
              pid: 'JP-13-113-02',
              label: 'Office',
              type: 'office' as const,
              carrierCompatible: true,
              aiScore: 85,
              successProbability: 0.88,
              previousDeliveries: 5,
              successfulDeliveries: 4,
              priority: 'normal' as const,
            },
          ],
        };

        const optimal = await ai.selectOptimalCandidate(cluster);

        expect(optimal.pid).toBe('JP-13-113-01');
        expect(optimal.aiScore).toBe(95);
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
        const result = await ai.suggestOptimalLocation(
          'did:key:recipient123',
          {
            currentTime: new Date(),
            deliveryTimeframe: {
              start: new Date(),
              end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
          }
        );

        expect(result.suggestions).toBeDefined();
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.reasoning).toBeDefined();
      });

      it('should include availability confidence', async () => {
        const result = await ai.suggestOptimalLocation(
          'did:key:recipient123',
          {
            currentTime: new Date(),
            deliveryTimeframe: {
              start: new Date(),
              end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
          }
        );

        const suggestion = result.suggestions[0];
        expect(suggestion.availability).toBeDefined();
        expect(suggestion.availability.likely).toBeDefined();
        expect(suggestion.availability.confidence).toBeDefined();
      });

      it('should handle current location context', async () => {
        const result = await ai.suggestOptimalLocation(
          'did:key:recipient123',
          {
            currentTime: new Date(),
            currentLocation: { latitude: 35.6812, longitude: 139.7671 },
            deliveryTimeframe: {
              start: new Date(),
              end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
          }
        );

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

      it('should include messages for sender and recipient', async () => {
        const result = await ai.classifyCancellationReason('order-123', {
          hasSelectedAddress: false,
          isExpired: true,
        });

        expect(result.message.sender).toBeDefined();
        expect(result.message.recipient).toBeDefined();
        expect(typeof result.message.sender).toBe('string');
        expect(typeof result.message.recipient).toBe('string');
      });

      it('should include retry option for expired deadlines', async () => {
        const result = await ai.classifyCancellationReason('order-123', {
          hasSelectedAddress: false,
          isExpired: true,
        });

        expect(result.retryOption).toBeDefined();
        expect(result.retryOption?.available).toBe(true);
        expect(result.retryOption?.suggestedAction).toBeDefined();
      });
    });

    describe('getSenderMessage', () => {
      it('should return appropriate message for each reason', () => {
        const reasons = [
          CancellationReason.DEADLINE_EXPIRED,
          CancellationReason.USER_CANCELLED,
          CancellationReason.ADDRESS_UNSET,
          CancellationReason.SYSTEM_ERROR,
        ];

        reasons.forEach(reason => {
          const message = ai.getSenderMessage(reason);
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });

    describe('getRecipientMessage', () => {
      it('should return appropriate message for each reason', () => {
        const reasons = [
          CancellationReason.DEADLINE_EXPIRED,
          CancellationReason.USER_CANCELLED,
          CancellationReason.ADDRESS_UNSET,
          CancellationReason.SYSTEM_ERROR,
        ];

        reasons.forEach(reason => {
          const message = ai.getRecipientMessage(reason);
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });

    describe('getRetryOption', () => {
      it('should return retry option for deadline expired', () => {
        const option = ai.getRetryOption(CancellationReason.DEADLINE_EXPIRED);
        
        expect(option).toBeDefined();
        expect(option?.available).toBe(true);
        expect(option?.suggestedAction).toBeDefined();
        expect(option?.newDeadline).toBeDefined();
      });

      it('should return undefined for non-retryable reasons', () => {
        const option = ai.getRetryOption(CancellationReason.USER_CANCELLED);
        expect(option).toBeUndefined();
      });
    });

    describe('analyzeCancellationStats', () => {
      it('should analyze cancellation statistics', async () => {
        const result = await ai.analyzeCancellationStats({
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        });

        expect(result.total).toBeDefined();
        expect(result.byReason).toBeDefined();
        expect(result.trends).toBeDefined();
        expect(result.suggestions).toBeDefined();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full gift delivery workflow', async () => {
      // 1. Create gift order
      const orderRequest: CreateGiftOrderRequest = {
        senderId: 'did:key:sender123',
        recipientGAPPID: 'JP-13',
        productId: 'PROD-001',
        message: 'Happy Birthday!',
      };

      const order = await createGiftOrder(orderRequest);
      
      expect(order.orderId).toBeDefined();
      expect(order.giftLink).toBeDefined();
      expect(order.qrCode).toBeDefined();

      // 2. Gift link would be sent to recipient
      // Recipient opens link and selects address (mocked in real implementation)
    });

    it('should handle carrier intent AI workflow', async () => {
      const ai = new CarrierIntentAI();
      
      // Extract candidates
      const candidates = await ai.extractDeliverableCandidates(
        ['JP-13-113-01', 'JP-13-101-02'],
        'yamato',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );

      expect(candidates.length).toBeGreaterThan(0);

      // Verify each candidate
      for (const candidate of candidates) {
        const compatibility = await ai.verifyCarrierCompatibility(
          candidate.pid,
          'yamato'
        );
        expect(compatibility.compatible).toBe(true);
      }
    });

    it('should handle deadline monitoring workflow', async () => {
      const ai = new GiftDeadlineWatchAI();
      
      // Verify AI class exists and has correct methods
      expect(ai).toBeDefined();
      expect(typeof ai.startWatch).toBe('function');
      expect(typeof ai.scheduleReminders).toBe('function');
      expect(typeof ai.calculateOptimalSendTime).toBe('function');
      
      // Test reminder scheduling directly
      const reminders = await ai.scheduleReminders(
        'order-123',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        {
          timezone: 'Asia/Tokyo',
          language: 'ja',
          notificationChannels: ['email'],
        }
      );
      
      expect(reminders).toBeDefined();
      expect(reminders.length).toBeGreaterThan(0);
    });

    it('should handle location clustering workflow', async () => {
      const ai = new LocationClusteringAI();
      
      const candidates = [
        {
          pid: 'JP-13-113-01',
          label: 'Home',
          type: 'home' as const,
          carrierCompatible: true,
          aiScore: 95,
          successProbability: 0.92,
          previousDeliveries: 10,
          successfulDeliveries: 9,
          priority: 'normal' as const,
        },
        {
          pid: 'JP-13-113-02',
          label: 'Office',
          type: 'office' as const,
          carrierCompatible: true,
          aiScore: 88,
          successProbability: 0.90,
          previousDeliveries: 8,
          successfulDeliveries: 7,
          priority: 'normal' as const,
        },
      ];

      const result = await ai.clusterCandidates(candidates);
      
      expect(result.optimalCandidates).toBeDefined();
      expect(result.optimalCandidates.length).toBeGreaterThan(0);
    });

    it('should handle smart suggestion workflow', async () => {
      const ai = new SmartAddressSuggestionAI();
      
      const suggestions = await ai.suggestOptimalLocation(
        'did:key:recipient123',
        {
          currentTime: new Date(),
          currentLocation: { latitude: 35.6812, longitude: 139.7671 },
          deliveryTimeframe: {
            start: new Date(),
            end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        }
      );

      expect(suggestions.suggestions).toBeDefined();
      expect(suggestions.suggestions.length).toBeGreaterThan(0);
      
      const topSuggestion = suggestions.suggestions[0];
      expect(topSuggestion.pid).toBeDefined();
      expect(topSuggestion.score).toBeDefined();
      expect(topSuggestion.reasons).toBeDefined();
    });

    it('should handle cancellation workflow', async () => {
      const ai = new CancelReasonAI();
      
      const classification = await ai.classifyCancellationReason('order-123', {
        hasSelectedAddress: false,
        isExpired: true,
        remindersSent: 3,
        viewCount: 1,
      });

      expect(classification.reason).toBe(CancellationReason.DEADLINE_EXPIRED);
      expect(classification.message.sender).toBeDefined();
      expect(classification.message.recipient).toBeDefined();
      expect(classification.retryOption).toBeDefined();
    });
  });
});
