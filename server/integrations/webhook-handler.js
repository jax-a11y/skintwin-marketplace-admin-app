/**
 * Webhook Handler for SkinTwin Integration Events
 * Processes incoming webhooks from the skintwin-integrations gateway
 */

import crypto from 'crypto';
import db from '../../models/index.js';

/**
 * Webhook event types from skintwin-integrations
 */
export const WEBHOOK_EVENTS = {
  // Sync events
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',

  // Product events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',

  // Appointment events
  APPOINTMENT_CREATED: 'appointment.created',
  APPOINTMENT_UPDATED: 'appointment.updated',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',

  // Client events
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_MERGED: 'client.merged',

  // B2B events
  B2B_COMPANY_CREATED: 'b2b.company.created',
  B2B_COMPANY_UPDATED: 'b2b.company.updated',
  B2B_ORDER_CREATED: 'b2b.order.created',
};

/**
 * Verify webhook signature from skintwin-integrations
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Webhook-Signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
export function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Process incoming webhook event
 * @param {Object} event - Webhook event object
 * @param {string} event.type - Event type
 * @param {Object} event.payload - Event payload
 * @param {string} event.source - Source platform
 * @param {Date} event.timestamp - Event timestamp
 * @returns {Promise<Object>} Processing result
 */
export async function processWebhookEvent(event) {
  const { type, payload, source, timestamp } = event;

  console.log(`[SkinTwin Webhook] Processing ${type} from ${source}`);

  try {
    switch (type) {
      case WEBHOOK_EVENTS.SYNC_STARTED:
        return handleSyncStarted(payload);

      case WEBHOOK_EVENTS.SYNC_COMPLETED:
        return handleSyncCompleted(payload);

      case WEBHOOK_EVENTS.SYNC_FAILED:
        return handleSyncFailed(payload);

      case WEBHOOK_EVENTS.PRODUCT_CREATED:
      case WEBHOOK_EVENTS.PRODUCT_UPDATED:
        return handleProductUpdate(payload);

      case WEBHOOK_EVENTS.PRODUCT_DELETED:
        return handleProductDeleted(payload);

      case WEBHOOK_EVENTS.APPOINTMENT_CREATED:
      case WEBHOOK_EVENTS.APPOINTMENT_UPDATED:
        return handleAppointmentUpdate(payload);

      case WEBHOOK_EVENTS.APPOINTMENT_CANCELLED:
        return handleAppointmentCancelled(payload);

      case WEBHOOK_EVENTS.CLIENT_CREATED:
      case WEBHOOK_EVENTS.CLIENT_UPDATED:
        return handleClientUpdate(payload);

      case WEBHOOK_EVENTS.CLIENT_MERGED:
        return handleClientMerged(payload);

      case WEBHOOK_EVENTS.B2B_COMPANY_CREATED:
      case WEBHOOK_EVENTS.B2B_COMPANY_UPDATED:
        return handleB2BCompanyUpdate(payload);

      case WEBHOOK_EVENTS.B2B_ORDER_CREATED:
        return handleB2BOrderCreated(payload);

      default:
        console.warn(`[SkinTwin Webhook] Unknown event type: ${type}`);
        return { success: true, action: 'ignored', reason: 'unknown_event_type' };
    }
  } catch (error) {
    console.error(`[SkinTwin Webhook] Error processing ${type}:`, error);
    throw error;
  }
}

// ============================================
// Sync Event Handlers
// ============================================

async function handleSyncStarted(payload) {
  const { shopDomain, platforms } = payload;

  await updateShopSyncStatus(shopDomain, {
    skintwinSyncStatus: 'syncing',
    lastSyncAttempt: new Date(),
  });

  console.log(`[SkinTwin Webhook] Sync started for ${shopDomain}`);
  return { success: true, action: 'sync_started' };
}

async function handleSyncCompleted(payload) {
  const { shopDomain, results, syncedAt } = payload;

  await updateShopSyncStatus(shopDomain, {
    skintwinSyncStatus: 'idle',
    lastSyncTimestamp: new Date(syncedAt),
    lastSyncResults: JSON.stringify(results),
  });

  console.log(`[SkinTwin Webhook] Sync completed for ${shopDomain}`);
  return { success: true, action: 'sync_completed', results };
}

async function handleSyncFailed(payload) {
  const { shopDomain, error } = payload;

  await updateShopSyncStatus(shopDomain, {
    skintwinSyncStatus: 'error',
    lastSyncError: error,
  });

  console.error(`[SkinTwin Webhook] Sync failed for ${shopDomain}:`, error);
  return { success: true, action: 'sync_failed', error };
}

// ============================================
// Product Event Handlers
// ============================================

async function handleProductUpdate(payload) {
  const { product, shopDomain, source } = payload;

  console.log(`[SkinTwin Webhook] Product ${product.id} updated from ${source}`);
  
  // Update local product sync metadata
  // Implementation depends on how products are tracked locally

  return { success: true, action: 'product_updated', productId: product.id };
}

async function handleProductDeleted(payload) {
  const { productId, shopDomain, source } = payload;

  console.log(`[SkinTwin Webhook] Product ${productId} deleted from ${source}`);

  return { success: true, action: 'product_deleted', productId };
}

// ============================================
// Appointment Event Handlers
// ============================================

async function handleAppointmentUpdate(payload) {
  const { appointment, shopDomain, source } = payload;

  console.log(`[SkinTwin Webhook] Appointment ${appointment.id} updated from ${source}`);

  return { success: true, action: 'appointment_updated', appointmentId: appointment.id };
}

async function handleAppointmentCancelled(payload) {
  const { appointmentId, shopDomain, source, reason } = payload;

  console.log(`[SkinTwin Webhook] Appointment ${appointmentId} cancelled from ${source}`);

  return { success: true, action: 'appointment_cancelled', appointmentId, reason };
}

// ============================================
// Client Event Handlers
// ============================================

async function handleClientUpdate(payload) {
  const { client, shopDomain, source } = payload;

  console.log(`[SkinTwin Webhook] Client ${client.id} updated from ${source}`);

  return { success: true, action: 'client_updated', clientId: client.id };
}

async function handleClientMerged(payload) {
  const { sourceClientIds, targetClientId, shopDomain } = payload;

  console.log(`[SkinTwin Webhook] Clients ${sourceClientIds.join(', ')} merged into ${targetClientId}`);

  return {
    success: true,
    action: 'client_merged',
    sourceClientIds,
    targetClientId,
  };
}

// ============================================
// B2B Event Handlers
// ============================================

async function handleB2BCompanyUpdate(payload) {
  const { company, shopDomain } = payload;

  console.log(`[SkinTwin Webhook] B2B Company ${company.id} updated`);

  return { success: true, action: 'b2b_company_updated', companyId: company.id };
}

async function handleB2BOrderCreated(payload) {
  const { order, company, shopDomain } = payload;

  console.log(`[SkinTwin Webhook] B2B Order ${order.id} created for company ${company.id}`);

  return {
    success: true,
    action: 'b2b_order_created',
    orderId: order.id,
    companyId: company.id,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Update shop's sync status in the database
 * @param {string} shopDomain - Shop domain
 * @param {Object} updates - Fields to update
 */
async function updateShopSyncStatus(shopDomain, updates) {
  try {
    await db.Shop.update(updates, {
      where: { domain: shopDomain },
    });
  } catch (error) {
    console.error(`[SkinTwin Webhook] Failed to update shop sync status:`, error);
  }
}

/**
 * Express middleware for handling skintwin webhook requests
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function skintwinWebhookHandler(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = process.env.SKINTWIN_WEBHOOK_SECRET;

  // Verify signature if secret is configured
  if (webhookSecret) {
    const rawBody = JSON.stringify(req.body);
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn('[SkinTwin Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    const result = await processWebhookEvent(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('[SkinTwin Webhook] Processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default {
  WEBHOOK_EVENTS,
  verifyWebhookSignature,
  processWebhookEvent,
  skintwinWebhookHandler,
};
