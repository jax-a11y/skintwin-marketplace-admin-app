/**
 * SkinTwin Integration Module
 * Exports all integration components for use in the main application
 */

import SkinTwinApiClient, {
  createSkinTwinClient,
  SkinTwinApiError,
} from './skintwin-api-client.js';

import {
  normalizeAppointment,
  normalizeClient,
  normalizeProduct,
} from './models.js';

import {
  WEBHOOK_EVENTS,
  verifyWebhookSignature,
  processWebhookEvent,
  skintwinWebhookHandler,
} from './webhook-handler.js';

// Re-export all components
export {
  // API Client
  SkinTwinApiClient,
  createSkinTwinClient,
  SkinTwinApiError,

  // Data Models
  normalizeAppointment,
  normalizeClient,
  normalizeProduct,

  // Webhook Handler
  WEBHOOK_EVENTS,
  verifyWebhookSignature,
  processWebhookEvent,
  skintwinWebhookHandler,
};

/**
 * Initialize the SkinTwin integration module
 * @param {Object} app - Express application instance
 * @param {Object} options - Initialization options
 */
export function initializeSkinTwinIntegration(app, options = {}) {
  const {webhookPath = '/webhooks/skintwin', enableWebhooks = true} = options;

  // Register webhook endpoint if enabled
  if (enableWebhooks) {
    app.post(webhookPath, skintwinWebhookHandler);
    console.log(`[SkinTwin] Webhook endpoint registered at ${webhookPath}`);
  }

  // Create and return a client instance
  const client = createSkinTwinClient();

  console.log('[SkinTwin] Integration module initialized');

  return client;
}

export default {
  SkinTwinApiClient,
  createSkinTwinClient,
  SkinTwinApiError,
  normalizeAppointment,
  normalizeClient,
  normalizeProduct,
  WEBHOOK_EVENTS,
  verifyWebhookSignature,
  processWebhookEvent,
  skintwinWebhookHandler,
  initializeSkinTwinIntegration,
};
