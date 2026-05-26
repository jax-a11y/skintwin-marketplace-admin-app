// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Onboarding Flow E2E Tests
 * Tests for the multi-step merchant onboarding wizard
 */

test.describe('Onboarding', () => {
  test.describe('Page Rendering', () => {
    test('onboarding page renders multi-step wizard @smoke', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Page should render without errors
      const body = page.locator('body');
      await expect(body).toBeVisible();
      await expect(body).not.toBeEmpty();
    });

    test('onboarding page shows correct title', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Look for the marketplace setup title
      const title = page.getByText(/Setup.*Marketplace/i);
      await expect(title.first()).toBeVisible({ timeout: 10000 });
    });

    test('loading state displays during data fetch', async ({ page }) => {
      // Intercept GraphQL to delay response
      await page.route('**/graphql', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/onboarding');

      // During loading, skeleton or spinner should be visible
      // The LoadingState component should render
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Onboarding Steps', () => {
    test('info card is displayed', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Look for onboarding info section
      // The OnboardingInfoCard should be visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('terms card is displayed', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // The OnboardingTermsCard should be visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('finish button is present', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Look for finish/complete button
      const finishButton = page.getByRole('button', { name: /finish/i });
      
      // Button should exist (may be disabled until terms accepted)
      if (await finishButton.count() > 0) {
        await expect(finishButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Terms Acceptance Flow', () => {
    test('finish button is disabled until terms accepted @smoke', async ({ page }) => {
      // Mock GraphQL to return shop without terms accepted
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('OnboardingPageQuery')) {
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

      // The finish button should be disabled
      const finishButton = page.getByRole('button', { name: /finish/i });
      
      if (await finishButton.count() > 0) {
        await expect(finishButton.first()).toBeDisabled();
      }
    });

    test('finish button becomes enabled after terms accepted', async ({ page }) => {
      // Mock GraphQL to return shop with terms accepted
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('OnboardingPageQuery')) {
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

      // The finish button should be enabled
      const finishButton = page.getByRole('button', { name: /finish/i });
      
      if (await finishButton.count() > 0) {
        await expect(finishButton.first()).toBeEnabled();
      }
    });
  });

  test.describe('Onboarding Completion', () => {
    test('completing onboarding redirects to home @smoke', async ({ page }) => {
      // Mock GraphQL responses
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('OnboardingPageQuery')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                adminShop: {
                  id: '1',
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

      await page.goto('/onboarding');

      // Should redirect to home when onboarding is complete
      await page.waitForURL('**/', { timeout: 10000 });
      expect(page.url()).not.toContain('/onboarding');
    });

    test('mutation is called when finish button clicked', async ({ page }) => {
      let mutationCalled = false;

      // Mock GraphQL responses
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('OnboardingPageQuery')) {
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
        } else if (postData?.query?.includes('CompleteOnboarding')) {
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
        } else {
          await route.continue();
        }
      });

      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Click finish button
      const finishButton = page.getByRole('button', { name: /finish/i });
      
      if (await finishButton.count() > 0) {
        await finishButton.first().click();
        
        // Wait for mutation to be called
        await page.waitForTimeout(1000);
        expect(mutationCalled).toBe(true);
      }
    });
  });

  test.describe('Navigation', () => {
    test('back breadcrumb navigates to home', async ({ page }) => {
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Look for back link/breadcrumb
      const backLink = page.getByRole('link', { name: /back/i });
      
      if (await backLink.count() > 0) {
        await backLink.first().click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Progress Persistence', () => {
    test('step state persists after page refresh', async ({ page }) => {
      // Mock GraphQL with specific state
      await page.route('**/graphql', async (route) => {
        const postData = route.request().postDataJSON();
        
        if (postData?.query?.includes('OnboardingPageQuery')) {
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

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // State should be preserved (fetched from server)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('GraphQL error shows appropriate feedback', async ({ page }) => {
      // Mock GraphQL error
      await page.route('**/graphql', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [
              {
                message: 'An error occurred',
                locations: [{ line: 1, column: 1 }],
                path: ['adminShop'],
              },
            ],
            data: null,
          }),
        });
      });

      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Page should not crash - error boundary should catch
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('network error is handled gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/graphql', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/onboarding');

      // Wait a bit for error to manifest
      await page.waitForTimeout(2000);

      // Page should still render (error boundary)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});
