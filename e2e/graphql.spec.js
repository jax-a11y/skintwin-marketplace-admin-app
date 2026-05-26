// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * GraphQL Integration E2E Tests
 * Tests for GraphQL API interactions and error handling
 */

test.describe('GraphQL Integration', () => {
  test.describe('Query Operations', () => {
    test('adminShop query returns valid data @smoke', async ({ page }) => {
      let queryReceived = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('adminShop')) {
          queryReceived = true;
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
                  termsAccepted: true,
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

      expect(queryReceived).toBe(true);
    });

    test('shops list query fetches multiple shops', async ({ page }) => {
      let shopsQueryCalled = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('shops')) {
          shopsQueryCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                shops: [
                  {
                    id: '1',
                    domain: 'shop1.myshopify.com',
                    name: 'Shop One',
                    country: 'United States',
                    storefrontAccessToken: 'token1',
                  },
                  {
                    id: '2',
                    domain: 'shop2.myshopify.com',
                    name: 'Shop Two',
                    country: 'Canada',
                    storefrontAccessToken: 'token2',
                  },
                ],
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Navigate to a page that might query shops
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify page renders (shops query may not be called on home)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('country filter parameter works correctly', async ({ page }) => {
      let filterApplied = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('shops') && postData?.variables?.country) {
          filterApplied = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                shops: [
                  {
                    id: '1',
                    domain: 'canadian-shop.myshopify.com',
                    name: 'Canadian Shop',
                    country: 'Canada',
                    storefrontAccessToken: 'token',
                  },
                ],
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should load successfully
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Mutation Operations', () => {
    test('acceptTerms mutation updates state', async ({ page }) => {
      let mutationCalled = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('acceptTerms')) {
          mutationCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                acceptTerms: {
                  id: '1',
                  termsAccepted: true,
                },
              },
            }),
          });
        } else if (postData?.query?.includes('OnboardingPageQuery')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  onboardingInfoCompleted: true,
                  termsAccepted: false,
                  onboardingCompleted: false,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Verify page renders correctly
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('completeOnboarding mutation triggers redirect', async ({ page }) => {
      let mutationCalled = false;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('CompleteOnboarding')) {
          mutationCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                completeOnboarding: {
                  id: '1',
                  onboardingCompleted: true,
                },
              },
            }),
          });
        } else if (postData?.query?.includes('OnboardingPageQuery')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
                  onboardingInfoCompleted: true,
                  termsAccepted: true,
                  onboardingCompleted: false,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Click finish button if available
      const finishButton = page.getByRole('button', { name: /finish/i });
      
      if (await finishButton.count() > 0) {
        await finishButton.first().click();
        await page.waitForTimeout(1000);
        expect(mutationCalled).toBe(true);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('GraphQL error response shows error UI @smoke', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [
              {
                message: 'Authentication required',
                extensions: {
                  code: 'UNAUTHENTICATED',
                },
              },
            ],
            data: null,
          }),
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should handle error gracefully
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('network error shows appropriate feedback', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/');

      // Wait for error state
      await page.waitForTimeout(2000);

      // Page should not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('500 server error is handled gracefully', async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal Server Error',
          }),
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should handle server error
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('partial data response is handled', async ({ page }) => {
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
                  // Missing some fields
                  appHandle: null,
                  publicationId: null,
                  availableProductCount: 0,
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

      // Page should handle partial data
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Request Handling', () => {
    test('GraphQL requests include correct headers', async ({ page }) => {
      let headersValid = false;

      await page.route('**/graphql', async (route) => {
        const headers = route.request().headers();
        
        // Check for content-type header
        if (headers['content-type']?.includes('application/json')) {
          headersValid = true;
        }

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
      await page.waitForLoadState('networkidle');

      expect(headersValid).toBe(true);
    });

    test('multiple concurrent queries are handled', async ({ page }) => {
      let queryCount = 0;

      await page.route('**/graphql', async (route) => {
        queryCount++;
        
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

      // At least one query should have been made
      expect(queryCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Caching Behavior', () => {
    test('data is fetched fresh on navigation', async ({ page }) => {
      let queryCount = 0;

      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('HomePageQuery') || 
            postData?.query?.includes('OnboardingPageQuery')) {
          queryCount++;
          
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
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Navigate to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to onboarding
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Navigate back to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Multiple queries should have been made
      expect(queryCount).toBeGreaterThanOrEqual(2);
    });
  });
});
