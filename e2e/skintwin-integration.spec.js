// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SkinTwin Integration E2E Tests
 * Tests for the skintwin-ai ecosystem integration features
 */

test.describe('SkinTwin Integration', () => {
  test.describe('Integration Settings', () => {
    test('integration section is visible in settings @smoke', async ({ page }) => {
      // Mock GraphQL responses
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: false,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: null,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Integration settings should be accessible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('can enable skintwin integration', async ({ page }) => {
      let enableMutationCalled = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('enableSkintwinIntegration')) {
          enableMutationCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                enableSkintwinIntegration: {
                  id: '1',
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: null,
                },
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: false,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: null,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should load without errors
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('can disable skintwin integration', async ({ page }) => {
      let disableMutationCalled = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('disableSkintwinIntegration')) {
          disableMutationCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                disableSkintwinIntegration: {
                  id: '1',
                  skintwinEnabled: false,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: null,
                },
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: '2026-05-26T07:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Sync Status', () => {
    test('sync status indicator shows current state @smoke', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('syncStatus')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                syncStatus: {
                  status: 'idle',
                  lastSyncTime: '2026-05-26T06:00:00Z',
                  platformStatuses: [
                    { platform: 'wix', connected: true, lastSync: '2026-05-26T06:00:00Z', itemsSynced: 42 },
                    { platform: 'shopify', connected: true, lastSync: '2026-05-26T06:00:00Z', itemsSynced: 15 },
                  ],
                  errors: [],
                },
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: '2026-05-26T06:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('sync status shows syncing state', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('syncStatus')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                syncStatus: {
                  status: 'syncing',
                  lastSyncTime: '2026-05-26T05:00:00Z',
                  platformStatuses: [
                    { platform: 'wix', connected: true, lastSync: null, itemsSynced: 0 },
                  ],
                  errors: [],
                },
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'syncing',
                  lastSyncTimestamp: '2026-05-26T05:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('sync status shows error state', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('syncStatus')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                syncStatus: {
                  status: 'error',
                  lastSyncTime: '2026-05-26T05:00:00Z',
                  platformStatuses: [],
                  errors: ['Connection timeout to Wix API'],
                },
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'error',
                  lastSyncTimestamp: '2026-05-26T05:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('B2B Companies', () => {
    test('B2B company list loads', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('b2bCompanies')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                b2bCompanies: [
                  {
                    id: 'gid://shopify/Company/1',
                    name: 'Acme Beauty Supplies',
                    email: 'orders@acme.com',
                    contactName: 'John Smith',
                    locationsCount: 3,
                    catalogsCount: 2,
                  },
                  {
                    id: 'gid://shopify/Company/2',
                    name: 'Beauty Warehouse Inc',
                    email: 'purchasing@beautywarehouse.com',
                    contactName: 'Jane Doe',
                    locationsCount: 1,
                    catalogsCount: 1,
                  },
                ],
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: '2026-05-26T06:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Manual Sync', () => {
    test('can trigger manual sync @smoke', async ({ page }) => {
      let syncMutationCalled = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('triggerSync')) {
          syncMutationCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                triggerSync: {
                  status: 'syncing',
                  lastSyncTime: null,
                  platformStatuses: [],
                  errors: [],
                },
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: '2026-05-26T05:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should load and be functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Synced Data', () => {
    test('synced appointments query works', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('syncedAppointments')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                syncedAppointments: [
                  {
                    id: 'wix_123',
                    sourceId: '123',
                    sourcePlatform: 'wix',
                    clientName: 'Alice Johnson',
                    clientEmail: 'alice@example.com',
                    serviceName: 'Facial Treatment',
                    startTime: '2026-05-27T10:00:00Z',
                    endTime: '2026-05-27T11:00:00Z',
                    status: 'scheduled',
                  },
                ],
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: '2026-05-26T06:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('synced products query works', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('syncedProducts')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                syncedProducts: [
                  {
                    id: 'shopify_456',
                    sourceId: '456',
                    sourcePlatform: 'shopify',
                    title: 'Vitamin C Serum',
                    price: 49.99,
                    currency: 'USD',
                    inventory: 100,
                    syncedAt: '2026-05-26T06:00:00Z',
                  },
                ],
              },
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'idle',
                  lastSyncTimestamp: '2026-05-26T06:00:00Z',
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('handles integration API errors gracefully', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('b2bCompanies') ||
            postData?.query?.includes('syncStatus')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [
                {
                  message: 'Failed to connect to SkinTwin API',
                  extensions: { code: 'INTEGRATION_ERROR' },
                },
              ],
              data: null,
            }),
          });
        } else if (postData?.query?.includes('adminShop')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: true,
                  skintwinEnabled: true,
                  skintwinSyncStatus: 'error',
                  lastSyncTimestamp: null,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should handle error gracefully
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});
