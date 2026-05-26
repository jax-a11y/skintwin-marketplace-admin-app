import {gql} from 'apollo-server-express';

export const typeDefs = `
type AdminShop {
  id: ID!
  domain: String!
  publicationId: String!
  appHandle: String!
  availableProductCount: Int!
  onboardingInfoCompleted: Boolean!
  termsAccepted: Boolean!
  onboardingCompleted: Boolean!
  skintwinEnabled: Boolean
  skintwinSyncStatus: String
  lastSyncTimestamp: String
}
type Shop {
  id: ID!
  country: String!
  domain: String!
  name: String!
  storefrontAccessToken: String!
  skintwinEnabled: Boolean
  skintwinSyncStatus: String
  skintwinPlatforms: [String]
}

# SkinTwin Integration Types
type B2BCompany {
  id: ID!
  name: String!
  email: String
  contactName: String
  locationsCount: Int
  catalogsCount: Int
}

type SyncStatus {
  status: String!
  lastSyncTime: String
  platformStatuses: [PlatformStatus]
  errors: [String]
}

type PlatformStatus {
  platform: String!
  connected: Boolean!
  lastSync: String
  itemsSynced: Int
}

type SyncedAppointment {
  id: ID!
  sourceId: String!
  sourcePlatform: String!
  clientName: String!
  clientEmail: String
  serviceName: String!
  startTime: String!
  endTime: String!
  status: String!
}

type SyncedProduct {
  id: ID!
  sourceId: String!
  sourcePlatform: String!
  title: String!
  price: Float!
  currency: String!
  inventory: Int
  syncedAt: String
}

type Query {
  adminShop: AdminShop!
  shop(id: Int!): Shop
  shops(country: String, nameIsLike: String, reverse: Boolean, domains: [String]): [Shop]
  shopCountries: [String]
  
  # SkinTwin Integration Queries
  b2bCompanies(limit: Int, cursor: String): [B2BCompany]
  b2bCompany(id: ID!): B2BCompany
  syncStatus: SyncStatus
  syncedAppointments(since: String, platform: String): [SyncedAppointment]
  syncedProducts(platform: String): [SyncedProduct]
}

type Mutation {
  completeOnboardingInfo: AdminShop
  acceptTerms: AdminShop
  completeOnboarding: AdminShop
  
  # SkinTwin Integration Mutations
  enableSkintwinIntegration(platforms: [String]!): AdminShop
  disableSkintwinIntegration: AdminShop
  triggerSync(platforms: [String]): SyncStatus
}
`;

export const schema = gql(typeDefs);
