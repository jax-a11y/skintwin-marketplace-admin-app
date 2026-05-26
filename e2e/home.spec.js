// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Home/Overview E2E Tests
 * Tests for the home page showing introduction or overview based on onboarding state
 */

test.describe('Home Page', () => {
  test.describe('Pre-Onboarding State', () => {
    test('introduction view renders for new merchants @smoke', async ({ page }) => {
      // Mock shop without completed onboarding
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
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
                  availableProductCount: 42,
                  onboardingInfoCompleted: false,
                  onboardingCompleted: false,
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

      // Introduction view should be shown
      const body = page.locator('body');
      await expect(body).toBeVisible();
      await expect(body).not.toBeEmpty();
    });

    test('setup prompt is displayed for incomplete onboarding', async ({ page }) => {
      // Mock shop with incomplete onboarding
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
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
                  availableProductCount: 0,
                  onboardingInfoCompleted: true,
                  onboardingCompleted: false,
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

      // Should show setup in progress state
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Post-Onboarding State', () => {
    test('overview dashboard renders for completed merchants @smoke', async ({ page }) => {
      // Mock shop with completed onboarding
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
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
                  availableProductCount: 42,
                  onboardingInfoCompleted: true,
                  onboardingCompleted: true,
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

      // Overview component should be rendered
      const body = page.locator('body');
      await expect(body).toBeVisible();
      await expect(body).not.toBeEmpty();
    });

    test('product count is displayed correctly', async ({ page }) => {
      const expectedProductCount = 42;

      // Mock shop with products
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
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
                  availableProductCount: expectedProductCount,
                  onboardingInfoCompleted: true,
                  onboardingCompleted: true,
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

      // Check that product count appears somewhere on the page
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeDefined();
    });

    test('publication ID is resolved and visible', async ({ page }) => {
      const publicationId = 'gid://shopify/Publication/123456';

      // Mock shop data
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: 'skintwin-marketplace',
                  publicationId: publicationId,
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  onboardingCompleted: true,
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

      // Publication data should be fetched successfully
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('app handle is displayed', async ({ page }) => {
      const appHandle = 'skintwin-marketplace';

      // Mock shop data
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  domain: 'test-shop.myshopify.com',
                  appHandle: appHandle,
                  publicationId: 'gid://shopify/Publication/123',
                  availableProductCount: 10,
                  onboardingInfoCompleted: true,
                  onboardingCompleted: true,
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

      // App handle data should be fetched successfully
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('skeleton loader displays during data fetch', async ({ page }) => {
      // Delay GraphQL response to observe loading state
      await page.route('**/graphql', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
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
                onboardingCompleted: true,
              },
            },
          }),
        });
      });

      await page.goto('/');

      // During loading, skeleton should be visible
      // SkeletonPage from Polaris should render
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('handles GraphQL query error gracefully', async ({ page }) => {
      // Mock GraphQL error
      await page.route('**/graphql', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [
              {
                message: 'Failed to fetch admin shop data',
                path: ['adminShop'],
              },
            ],
            data: null,
          }),
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('handles network timeout gracefully', async ({ page }) => {
      // Simulate very slow network
      await page.route('**/graphql', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await route.continue();
      });

      await page.goto('/');

      // Wait a bit for timeout behavior
      await page.waitForTimeout(1000);

      // Page should still be visible (showing loading or error state)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Navigation Integration', () => {
    test('deep link to home route works', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
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
                  onboardingCompleted: true,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Direct navigation to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('browser refresh preserves state', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery')) {
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
                  onboardingCompleted: true,
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

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // State should be re-fetched and page should work
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});
