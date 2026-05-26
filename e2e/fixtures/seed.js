/**
 * Test database seeding utilities for E2E tests
 * Handles database setup and teardown for isolated test environments
 */

import db from '../../models/index.js';
import { mockShopInitial, mockShopOnboardingComplete } from './graphql-mocks.js';

/**
 * Seed the test database with initial shop data
 * @param {Object} options - Seeding options
 * @param {boolean} options.withOnboardingComplete - Include a shop with completed onboarding
 */
export async function seedTestDatabase(options = {}) {
  const { withOnboardingComplete = false } = options;

  try {
    // Clear existing data
    await db.Shop.destroy({ where: {}, truncate: true });
    await db.Session.destroy({ where: {}, truncate: true });

    // Seed shops based on options
    const shopsToCreate = [
      {
        domain: mockShopInitial.domain,
        name: mockShopInitial.name,
        country: mockShopInitial.country,
        storefrontAccessToken: mockShopInitial.storefrontAccessToken,
        onboardingInfoCompleted: mockShopInitial.onboardingInfoCompleted,
        termsAccepted: mockShopInitial.termsAccepted,
        onboardingCompleted: mockShopInitial.onboardingCompleted,
      },
    ];

    if (withOnboardingComplete) {
      shopsToCreate.push({
        domain: 'completed-shop.myshopify.com',
        name: 'Completed Shop',
        country: 'Canada',
        storefrontAccessToken: 'completed-storefront-token',
        onboardingInfoCompleted: true,
        termsAccepted: true,
        onboardingCompleted: true,
      });
    }

    await db.Shop.bulkCreate(shopsToCreate);

    console.log(`[E2E Seed] Created ${shopsToCreate.length} test shops`);
    return shopsToCreate;
  } catch (error) {
    console.error('[E2E Seed] Error seeding database:', error);
    throw error;
  }
}

/**
 * Reset the test database to initial state
 */
export async function resetTestDatabase() {
  try {
    await db.Shop.destroy({ where: {}, truncate: true });
    await db.Session.destroy({ where: {}, truncate: true });
    console.log('[E2E Seed] Database reset complete');
  } catch (error) {
    console.error('[E2E Seed] Error resetting database:', error);
    throw error;
  }
}

/**
 * Create a test shop with specific onboarding state
 * @param {Object} shopData - Shop data to create
 * @returns {Promise<Object>} Created shop
 */
export async function createTestShop(shopData) {
  try {
    const shop = await db.Shop.create({
      domain: shopData.domain || `test-${Date.now()}.myshopify.com`,
      name: shopData.name || 'Test Shop',
      country: shopData.country || 'United States',
      storefrontAccessToken: shopData.storefrontAccessToken || 'test-token',
      onboardingInfoCompleted: shopData.onboardingInfoCompleted || false,
      termsAccepted: shopData.termsAccepted || false,
      onboardingCompleted: shopData.onboardingCompleted || false,
    });
    return shop.toJSON();
  } catch (error) {
    console.error('[E2E Seed] Error creating test shop:', error);
    throw error;
  }
}

/**
 * Update a test shop's onboarding state
 * @param {string} domain - Shop domain
 * @param {Object} updates - Fields to update
 */
export async function updateTestShop(domain, updates) {
  try {
    await db.Shop.update(updates, { where: { domain } });
    const shop = await db.Shop.findOne({ where: { domain } });
    return shop ? shop.toJSON() : null;
  } catch (error) {
    console.error('[E2E Seed] Error updating test shop:', error);
    throw error;
  }
}
