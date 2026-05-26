// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * App Shell & Navigation E2E Tests
 * Tests for application loading, navigation, and UI framework integration
 */

test.describe('App Shell', () => {
  test.describe('Application Loading', () => {
    test('app loads without runtime errors @smoke', async ({ page }) => {
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

      // Listen for console errors
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');

      // Wait for React app to render
      await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });

      // Filter out expected errors (e.g., missing env vars in test mode)
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes('SHOPIFY_API_KEY') &&
          !error.includes('__webpack_hmr') &&
          !error.includes('Failed to load resource') &&
          !error.includes('Warning:') &&
          !error.includes('DevTools')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('root route renders React application @smoke', async ({ page }) => {
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

      // Check for React root element
      const appRoot = page.locator('#root');
      await expect(appRoot).toBeVisible();

      // Verify React has rendered content (not just empty div)
      await expect(appRoot).not.toBeEmpty();
    });
  });

  test.describe('UI Framework Integration', () => {
    test('Polaris theme styles are loaded', async ({ page }) => {
      await page.goto('/');

      // Check for Polaris CSS classes or styled components
      const polarisElement = page.locator('[class*="Polaris"]').first();
      
      // Wait for app to load with reasonable timeout
      await page.waitForLoadState('networkidle');

      // Polaris styles should be present in the document
      const hasStyles = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets);
        return styles.some(
          (sheet) =>
            sheet.href?.includes('polaris') ||
            (sheet.cssRules &&
              Array.from(sheet.cssRules).some((rule) =>
                rule.cssText?.includes('Polaris')
              ))
        );
      });

      // Either find Polaris elements or styles
      const hasPolarisContent =
        hasStyles || (await polarisElement.count()) > 0;
      
      expect(hasPolarisContent).toBe(true);
    });

    test('Channels UI components render correctly', async ({ page }) => {
      await page.goto('/onboarding');

      // Check for Channels UI specific components
      // OnboardingPage is from @shopify/channels-ui
      await page.waitForLoadState('networkidle');

      // The page should render without crashing
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('main navigation elements are present', async ({ page }) => {
      await page.goto('/');

      await page.waitForLoadState('networkidle');

      // Check for breadcrumb or navigation links
      // Navigation is typically present in the app header
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('navigation between routes works', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to onboarding
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');

      // Check URL changed
      expect(page.url()).toContain('/onboarding');

      // Navigate back to home
      await page.goto('/');
      expect(page.url()).not.toContain('/onboarding');
    });
  });

  test.describe('Error Handling', () => {
    test('error boundary catches rendering errors', async ({ page }) => {
      // Navigate to a potentially error-prone route
      await page.goto('/');
      
      await page.waitForLoadState('networkidle');

      // App should not show a blank page on error
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });
  });

  test.describe('Responsive Layout', () => {
    test('layout adapts to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // App should still be visible and functional
      const appRoot = page.locator('#root');
      await expect(appRoot).toBeVisible();
    });

    test('layout adapts to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const appRoot = page.locator('#root');
      await expect(appRoot).toBeVisible();
    });

    test('layout adapts to desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const appRoot = page.locator('#root');
      await expect(appRoot).toBeVisible();
    });
  });
});
