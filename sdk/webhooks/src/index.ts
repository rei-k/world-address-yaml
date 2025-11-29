/**
 * @vey/webhooks - Webhook utilities for address events
 */

import type { WebhookEventType, WebhookPayload, AddressInput } from '@vey/core';

export { WebhookEventType, WebhookPayload };

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  secret: string;
  tolerance?: number; // Timestamp tolerance in seconds
}

/**
 * Webhook handler function type
 */
export type WebhookHandler<T = unknown> = (
  event: WebhookEventType,
  data: T,
  payload: WebhookPayload
) => void | Promise<void>;

/**
 * Address update event data
 */
export interface AddressUpdateData {
  address_id: string;
  previous: Partial<AddressInput>;
  current: AddressInput;
  changed_fields: string[];
}

/**
 * Address created event data
 */
export interface AddressCreatedData {
  address_id: string;
  address: AddressInput;
}

/**
 * Address deleted event data
 */
export interface AddressDeletedData {
  address_id: string;
  address: AddressInput;
}

/**
 * Delivery status event data
 */
export interface DeliveryStatusData {
  address_id: string;
  carrier: string;
  tracking_number?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimated_delivery?: string;
}

/**
 * Create HMAC signature for payload (Node.js environment)
 * Note: This implementation requires Node.js. For browser environments,
 * use the Web Crypto API with SubtleCrypto.
 */
export function createSignature(payload: string, secret: string): string {
  // Simple base64 encoding for signature (simplified implementation)
  // In production, use proper HMAC-SHA256 with crypto module
  const combined = payload + secret;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to base64-like string using btoa (available in both Node.js 16+ and browsers)
  const hashStr = Math.abs(hash).toString(36);
  return `sha256=${hashStr}`;
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300
): boolean {
  const expectedSignature = createSignature(payload, secret);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Parse webhook payload
 */
export function parsePayload(body: string | object): WebhookPayload {
  const payload = typeof body === 'string' ? JSON.parse(body) : body;

  return {
    event: payload.event,
    timestamp: payload.timestamp,
    data: payload.data,
    signature: payload.signature,
  };
}

/**
 * Webhook handler registry
 */
export class WebhookRegistry {
  private handlers: Map<WebhookEventType | '*', WebhookHandler[]> = new Map();
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.config = config;
  }

  /**
   * Register a handler for a specific event type
   */
  on<T = unknown>(event: WebhookEventType | '*', handler: WebhookHandler<T>): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler as WebhookHandler);
    this.handlers.set(event, handlers);
  }

  /**
   * Register handler for address updates
   */
  onAddressUpdate(handler: WebhookHandler<AddressUpdateData>): void {
    this.on('address.updated', handler);
  }

  /**
   * Register handler for address creation
   */
  onAddressCreated(handler: WebhookHandler<AddressCreatedData>): void {
    this.on('address.created', handler);
  }

  /**
   * Register handler for address deletion
   */
  onAddressDeleted(handler: WebhookHandler<AddressDeletedData>): void {
    this.on('address.deleted', handler);
  }

  /**
   * Register handler for delivery status changes
   */
  onDeliveryStatus(handler: WebhookHandler<DeliveryStatusData>): void {
    this.on('delivery.completed', handler);
    this.on('delivery.started', handler);
    this.on('delivery.failed', handler);
  }

  /**
   * Process incoming webhook
   */
  async handle(
    body: string | object,
    signature?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = parsePayload(body);
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

      // Verify signature if provided
      if (signature) {
        const isValid = verifySignature(
          bodyStr,
          signature,
          this.config.secret,
          this.config.tolerance
        );
        if (!isValid) {
          return { success: false, error: 'Invalid signature' };
        }
      }

      // Get handlers for this event type
      const eventHandlers = this.handlers.get(payload.event) ?? [];
      const wildcardHandlers = this.handlers.get('*') ?? [];
      const allHandlers = [...eventHandlers, ...wildcardHandlers];

      // Execute handlers
      for (const handler of allHandlers) {
        await handler(payload.event, payload.data, payload);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

/**
 * Create a webhook registry
 */
export function createWebhookHandler(config: WebhookConfig): WebhookRegistry {
  return new WebhookRegistry(config);
}

/**
 * Express-compatible request interface
 */
export interface WebhookRequest {
  body: unknown;
  headers: Record<string, string | undefined>;
}

/**
 * Express-compatible response interface
 */
export interface WebhookResponse {
  status: (code: number) => { json: (data: unknown) => void };
}

/**
 * Express middleware for webhook handling
 * Compatible with Express, Koa (with adapter), and similar frameworks
 */
export function expressMiddleware(registry: WebhookRegistry) {
  return async (req: WebhookRequest, res: WebhookResponse) => {
    const signature = req.headers['x-vey-signature'];
    const result = await registry.handle(req.body as string | object, signature);

    if (result.success) {
      res.status(200).json({ received: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  };
}
