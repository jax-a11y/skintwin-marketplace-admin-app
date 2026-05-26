/**
 * GraphQL mock data for E2E tests
 * Provides consistent test fixtures for Shopify shop and onboarding states
 */

/**
 * Mock shop in initial state (before onboarding)
 */
export const mockShopInitial = {
  id: '1',
  domain: 'test-shop.myshopify.com',
  name: 'Test Shop',
  country: 'United States',
  appHandle: 'skintwin-marketplace',
  publicationId: 'gid://shopify/Publication/123456789',
  storefrontAccessToken: 'test-storefront-token',
  availableProductCount: 42,
  onboardingInfoCompleted: false,
  termsAccepted: false,
  onboardingCompleted: false,
};

/**
 * Mock shop with info step completed
 */
export const mockShopInfoCompleted = {
  ...mockShopInitial,
  onboardingInfoCompleted: true,
};

/**
 * Mock shop with terms accepted
 */
export const mockShopTermsAccepted = {
  ...mockShopInfoCompleted,
  termsAccepted: true,
};

/**
 * Mock shop with full onboarding completed
 */
export const mockShopOnboardingComplete = {
  ...mockShopTermsAccepted,
  onboardingCompleted: true,
};

/**
 * Mock GraphQL responses for adminShop query
 */
export const mockAdminShopResponse = (shop = mockShopInitial) => ({
  data: {
    adminShop: {
      id: shop.id,
      domain: shop.domain,
      appHandle: shop.appHandle,
      publicationId: shop.publicationId,
      availableProductCount: shop.availableProductCount,
      onboardingInfoCompleted: shop.onboardingInfoCompleted,
      termsAccepted: shop.termsAccepted,
      onboardingCompleted: shop.onboardingCompleted,
    },
  },
});

/**
 * Mock GraphQL responses for shops query
 */
export const mockShopsResponse = (shops = [mockShopOnboardingComplete]) => ({
  data: {
    shops: shops.map((shop) => ({
      id: shop.id,
      domain: shop.domain,
      name: shop.name,
      country: shop.country,
      storefrontAccessToken: shop.storefrontAccessToken,
    })),
  },
});

/**
 * Mock mutation responses
 */
export const mockAcceptTermsResponse = {
  data: {
    acceptTerms: {
      id: '1',
      termsAccepted: true,
    },
  },
};

export const mockCompleteOnboardingInfoResponse = {
  data: {
    completeOnboardingInfo: {
      id: '1',
      onboardingInfoCompleted: true,
    },
  },
};

export const mockCompleteOnboardingResponse = {
  data: {
    completeOnboarding: {
      id: '1',
      onboardingCompleted: true,
    },
  },
};

/**
 * Mock error responses
 */
export const mockGraphQLError = {
  errors: [
    {
      message: 'An error occurred',
      locations: [{ line: 1, column: 1 }],
      path: ['adminShop'],
    },
  ],
  data: null,
};

export const mockNetworkError = {
  message: 'Network error',
  name: 'NetworkError',
};
