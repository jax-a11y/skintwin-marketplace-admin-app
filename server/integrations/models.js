/**
 * Unified Data Models for SkinTwin Integration
 * Cross-platform data structures matching skintwin-integrations/common/models.py
 */

/**
 * Unified Appointment model
 * @typedef {Object} UnifiedAppointment
 * @property {string} id - Unique identifier
 * @property {string} sourceId - ID in the source platform
 * @property {string} sourcePlatform - Origin platform (wix, opencart, shopify)
 * @property {string} clientId - Associated client ID
 * @property {string} clientName - Client name
 * @property {string} clientEmail - Client email
 * @property {string} serviceName - Service/product name
 * @property {Date} startTime - Appointment start time
 * @property {Date} endTime - Appointment end time
 * @property {string} status - Appointment status (scheduled, completed, cancelled)
 * @property {string} notes - Additional notes
 * @property {Object} metadata - Platform-specific metadata
 */

/**
 * Unified Client model
 * @typedef {Object} UnifiedClient
 * @property {string} id - Unique identifier
 * @property {string} sourceId - ID in the source platform
 * @property {string} sourcePlatform - Origin platform
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {Object} address - Address details
 * @property {string[]} tags - Client tags
 * @property {Object} metadata - Platform-specific metadata
 */

/**
 * Unified Product model
 * @typedef {Object} UnifiedProduct
 * @property {string} id - Unique identifier
 * @property {string} sourceId - ID in the source platform
 * @property {string} sourcePlatform - Origin platform
 * @property {string} title - Product title
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {string} currency - Price currency
 * @property {string} sku - Stock keeping unit
 * @property {number} inventory - Available inventory
 * @property {string[]} images - Image URLs
 * @property {Object} variants - Product variants
 * @property {Object} metadata - Platform-specific metadata
 */

/**
 * Sync Status model
 * @typedef {Object} SyncStatus
 * @property {string} shopDomain - Shop domain
 * @property {string} status - Sync status (idle, syncing, error)
 * @property {Date} lastSyncTime - Last successful sync timestamp
 * @property {Object} platformStatus - Status per platform
 * @property {string[]} errors - Any sync errors
 */

/**
 * B2B Company model
 * @typedef {Object} B2BCompany
 * @property {string} id - Shopify company GID
 * @property {string} name - Company name
 * @property {string} email - Primary contact email
 * @property {Object} mainContact - Main contact person
 * @property {Object[]} locations - Company locations
 * @property {string[]} catalogs - Associated catalog IDs
 * @property {Object} metadata - Additional metadata
 */

/**
 * Webhook Event model
 * @typedef {Object} WebhookEvent
 * @property {string} id - Event ID
 * @property {string} type - Event type
 * @property {string} source - Source platform
 * @property {Date} timestamp - Event timestamp
 * @property {Object} payload - Event payload data
 */

/**
 * Convert platform-specific appointment to unified format
 * @param {Object} appointment - Platform appointment data
 * @param {string} platform - Source platform name
 * @returns {UnifiedAppointment} Unified appointment
 */
export function normalizeAppointment(appointment, platform) {
  const base = {
    id: `${platform}_${appointment.id || appointment.sourceId}`,
    sourceId: String(appointment.id || appointment.sourceId),
    sourcePlatform: platform,
    metadata: {},
  };

  switch (platform) {
    case 'wix':
      return {
        ...base,
        clientId: appointment.contactId,
        clientName: appointment.contactDetails?.name || '',
        clientEmail: appointment.contactDetails?.email || '',
        serviceName: appointment.service?.serviceName || '',
        startTime: new Date(appointment.start),
        endTime: new Date(appointment.end),
        status: mapWixStatus(appointment.status),
        notes: appointment.notes || '',
        metadata: {wixBookingId: appointment.bookingId},
      };

    case 'opencart':
      return {
        ...base,
        clientId: appointment.customer_id,
        clientName: `${appointment.firstname} ${appointment.lastname}`,
        clientEmail: appointment.email,
        serviceName: appointment.product_name || '',
        startTime: new Date(appointment.date_added),
        endTime: new Date(appointment.date_added),
        status: appointment.order_status || 'scheduled',
        notes: appointment.comment || '',
        metadata: {orderId: appointment.order_id},
      };

    case 'shopify':
      return {
        ...base,
        clientId: appointment.customer?.id,
        clientName: appointment.customer?.displayName || '',
        clientEmail: appointment.customer?.email || '',
        serviceName: appointment.title || '',
        startTime: new Date(appointment.scheduledAt || appointment.createdAt),
        endTime: new Date(appointment.scheduledAt || appointment.createdAt),
        status: appointment.fulfillmentStatus || 'scheduled',
        notes: appointment.note || '',
        metadata: {draftOrderId: appointment.id},
      };

    default:
      return {
        ...base,
        clientId: appointment.clientId || '',
        clientName: appointment.clientName || '',
        clientEmail: appointment.clientEmail || '',
        serviceName: appointment.serviceName || '',
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        status: appointment.status || 'scheduled',
        notes: appointment.notes || '',
      };
  }
}

/**
 * Convert platform-specific client to unified format
 * @param {Object} client - Platform client data
 * @param {string} platform - Source platform name
 * @returns {UnifiedClient} Unified client
 */
export function normalizeClient(client, platform) {
  const base = {
    id: `${platform}_${client.id || client.sourceId}`,
    sourceId: String(client.id || client.sourceId),
    sourcePlatform: platform,
    tags: [],
    metadata: {},
  };

  switch (platform) {
    case 'wix':
      return {
        ...base,
        firstName: client.info?.name?.first || '',
        lastName: client.info?.name?.last || '',
        email: client.info?.emails?.[0]?.email || '',
        phone: client.info?.phones?.[0]?.phone || '',
        address: client.info?.addresses?.[0] || {},
        tags: client.info?.labelKeys || [],
        metadata: {wixContactId: client.id},
      };

    case 'opencart':
      return {
        ...base,
        firstName: client.firstname || '',
        lastName: client.lastname || '',
        email: client.email || '',
        phone: client.telephone || '',
        address: {
          address1: client.address_1,
          address2: client.address_2,
          city: client.city,
          postcode: client.postcode,
          country: client.country,
        },
        tags: [],
        metadata: {customerId: client.customer_id},
      };

    case 'shopify':
      return {
        ...base,
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.defaultAddress || {},
        tags: client.tags || [],
        metadata: {shopifyCustomerId: client.id},
      };

    default:
      return {
        ...base,
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || {},
        tags: client.tags || [],
      };
  }
}

/**
 * Convert platform-specific product to unified format
 * @param {Object} product - Platform product data
 * @param {string} platform - Source platform name
 * @returns {UnifiedProduct} Unified product
 */
export function normalizeProduct(product, platform) {
  const base = {
    id: `${platform}_${product.id || product.sourceId}`,
    sourceId: String(product.id || product.sourceId),
    sourcePlatform: platform,
    images: [],
    variants: {},
    metadata: {},
  };

  switch (platform) {
    case 'wix':
      return {
        ...base,
        title: product.name || '',
        description: product.description || '',
        price: product.priceData?.price || 0,
        currency: product.priceData?.currency || 'USD',
        sku: product.sku || '',
        inventory: product.stock?.quantity || 0,
        images: product.media?.items?.map((m) => m.image?.url) || [],
        variants: product.variants || {},
        metadata: {wixProductId: product.id},
      };

    case 'opencart':
      return {
        ...base,
        title: product.name || '',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        currency: 'USD',
        sku: product.sku || product.model || '',
        inventory: parseInt(product.quantity) || 0,
        images: product.images || [],
        variants: product.options || {},
        metadata: {productId: product.product_id},
      };

    case 'shopify':
      return {
        ...base,
        title: product.title || '',
        description: product.descriptionHtml || product.description || '',
        price: parseFloat(product.variants?.edges?.[0]?.node?.price) || 0,
        currency: 'USD',
        sku: product.variants?.edges?.[0]?.node?.sku || '',
        inventory: product.totalInventory || 0,
        images: product.images?.edges?.map((e) => e.node.url) || [],
        variants: product.variants || {},
        metadata: {shopifyProductId: product.id},
      };

    default:
      return {
        ...base,
        title: product.title || '',
        description: product.description || '',
        price: product.price || 0,
        currency: product.currency || 'USD',
        sku: product.sku || '',
        inventory: product.inventory || 0,
        images: product.images || [],
        variants: product.variants || {},
      };
  }
}

/**
 * Map Wix appointment status to unified status
 * @param {string} wixStatus - Wix status string
 * @returns {string} Unified status
 */
function mapWixStatus(wixStatus) {
  const statusMap = {
    CONFIRMED: 'scheduled',
    PENDING: 'scheduled',
    CANCELED: 'cancelled',
    DECLINED: 'cancelled',
    COMPLETED: 'completed',
  };
  return statusMap[wixStatus] || 'scheduled';
}

export default {
  normalizeAppointment,
  normalizeClient,
  normalizeProduct,
};
