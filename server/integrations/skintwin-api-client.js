/**
 * SkinTwin API Client
 * SDK for interacting with the skintwin-integrations unified API gateway
 * 
 * This client provides methods for:
 * - B2B company management
 * - Cross-platform product sync
 * - Appointment synchronization
 * - Client data management
 * - Webhook event handling
 */

import fetch from 'node-fetch';

/**
 * Configuration for the SkinTwin API Client
 * @typedef {Object} SkinTwinConfig
 * @property {string} baseUrl - Base URL of the skintwin-integrations gateway
 * @property {string} apiKey - API key for authentication
 * @property {number} timeout - Request timeout in milliseconds
 */

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  baseUrl: process.env.SKINTWIN_API_URL || 'http://localhost:5000',
  apiKey: process.env.SKINTWIN_API_KEY || '',
  timeout: 30000,
};

/**
 * SkinTwin API Client for cross-platform integrations
 */
class SkinTwinApiClient {
  /**
   * Create a new SkinTwin API Client instance
   * @param {Partial<SkinTwinConfig>} config - Configuration options
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseUrl = this.config.baseUrl.replace(/\/$/, '');
  }

  /**
   * Make an HTTP request to the SkinTwin API
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: this.config.timeout,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new SkinTwinApiError(
          error.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SkinTwinApiError) {
        throw error;
      }
      throw new SkinTwinApiError(
        `Network error: ${error.message}`,
        0,
        { originalError: error.message }
      );
    }
  }

  // ============================================
  // Health & Connection Methods
  // ============================================

  /**
   * Check health of the SkinTwin gateway
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    return this.request('/api/integrations/health');
  }

  /**
   * Test connections to all enabled platforms
   * @returns {Promise<Object>} Connection test results
   */
  async testConnections() {
    return this.request('/api/integrations/test-connections');
  }

  // ============================================
  // B2B Company Methods
  // ============================================

  /**
   * Get list of B2B companies from Shopify
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum number of companies to return
   * @param {string} params.cursor - Pagination cursor
   * @returns {Promise<Object>} List of B2B companies
   */
  async getB2BCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/integrations/b2b/companies${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get a specific B2B company by ID
   * @param {string} companyId - Shopify company GID
   * @returns {Promise<Object>} Company details
   */
  async getB2BCompany(companyId) {
    return this.request(`/api/integrations/b2b/companies/${encodeURIComponent(companyId)}`);
  }

  // ============================================
  // Synchronization Methods
  // ============================================

  /**
   * Synchronize appointments from all platforms
   * @param {Object} options - Sync options
   * @param {Date} options.since - Only sync appointments after this date
   * @param {string[]} options.platforms - Specific platforms to sync (wix, opencart, shopify)
   * @returns {Promise<Object>} Sync results
   */
  async syncAppointments(options = {}) {
    return this.request('/api/integrations/appointments/sync', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Synchronize clients from all platforms
   * @param {Object} options - Sync options
   * @param {boolean} options.deduplication - Enable client deduplication
   * @returns {Promise<Object>} Sync results
   */
  async syncClients(options = {}) {
    return this.request('/api/integrations/clients/sync', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Synchronize products across platforms
   * @param {Object} options - Sync options
   * @param {string[]} options.productIds - Specific product IDs to sync
   * @param {string[]} options.targetPlatforms - Target platforms for sync
   * @returns {Promise<Object>} Sync results
   */
  async syncProducts(options = {}) {
    return this.request('/api/integrations/products/sync', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Get sync status for a shop
   * @param {string} shopDomain - Shopify shop domain
   * @returns {Promise<Object>} Sync status
   */
  async getSyncStatus(shopDomain) {
    return this.request(`/api/integrations/sync/status/${encodeURIComponent(shopDomain)}`);
  }

  // ============================================
  // Product Cross-Publishing Methods
  // ============================================

  /**
   * Publish products to external platforms
   * @param {Object} params - Publish parameters
   * @param {string[]} params.productIds - Product IDs to publish
   * @param {string[]} params.platforms - Target platforms (wix, opencart)
   * @returns {Promise<Object>} Publish results
   */
  async publishProducts(params) {
    return this.request('/api/integrations/products/publish', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get cross-platform product listing status
   * @param {string} productId - Shopify product GID
   * @returns {Promise<Object>} Listing status across platforms
   */
  async getProductListingStatus(productId) {
    return this.request(`/api/integrations/products/${encodeURIComponent(productId)}/status`);
  }

  // ============================================
  // Webhook Methods
  // ============================================

  /**
   * Register a webhook subscription
   * @param {Object} webhook - Webhook configuration
   * @param {string} webhook.event - Event type to subscribe to
   * @param {string} webhook.url - Callback URL
   * @returns {Promise<Object>} Webhook registration result
   */
  async registerWebhook(webhook) {
    return this.request('/api/integrations/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  /**
   * Get registered webhooks
   * @returns {Promise<Object>} List of webhooks
   */
  async getWebhooks() {
    return this.request('/api/integrations/webhooks');
  }

  /**
   * Delete a webhook subscription
   * @param {string} webhookId - Webhook ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteWebhook(webhookId) {
    return this.request(`/api/integrations/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Custom error class for SkinTwin API errors
 */
class SkinTwinApiError extends Error {
  /**
   * Create a SkinTwin API Error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   */
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = 'SkinTwinApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Create a new SkinTwin API client instance
 * @param {Partial<SkinTwinConfig>} config - Configuration options
 * @returns {SkinTwinApiClient} Configured client instance
 */
export function createSkinTwinClient(config = {}) {
  return new SkinTwinApiClient(config);
}

export { SkinTwinApiClient, SkinTwinApiError };
export default SkinTwinApiClient;
