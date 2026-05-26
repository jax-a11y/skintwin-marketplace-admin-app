import {AuthenticationError} from 'apollo-server-express';
import {Op, QueryTypes} from 'sequelize';
import db, {sequelize} from '../../models';
import {
  getAppHandle,
  getProductListingsCount,
  getPublicationId,
} from '../handlers';
import {createSkinTwinClient} from '../integrations/index.js';

// Create SkinTwin API client instance
const skintwinClient = createSkinTwinClient();

export const resolvers = {
  Query: {
    adminShop: async (_, _args, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      const dbShop = await db.Shop.findOne({where: {domain: shop.domain}});
      return {
        ...shop,
        ...dbShop.toJSON(),
      };
    },
    shop: async (_, {id}) => {
      if (id) {
        const shop = db.Shop.findOne({
          where: {
            id,
          },
        });
        return shop;
      }
      return null;
    },
    shops: async (_, args) => {
      const query = {
        where: {},
        order: [['name', args.reverse ? 'DESC' : 'ASC']],
      };

      if (args.nameIsLike) {
        query.where.name = {[Op.like]: '%' + args.nameIsLike + '%'};
      }

      if (args.country) {
        query.where.country = args.country;
      }

      if (args.domains) {
        query.where.domain = {[Op.in]: args.domains};
      }

      const shops = await db.Shop.findAll(query);

      return shops;
    },
    shopCountries: async () => {
      const countries = await sequelize.query(
        'SELECT DISTINCT(`country`) FROM `Shops`',
        {type: QueryTypes.SELECT},
      );

      return countries.map((object) => object.country);
    },

    // SkinTwin Integration Queries
    b2bCompanies: async (_, {limit, cursor}, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        const result = await skintwinClient.getB2BCompanies({limit, cursor});
        return result.companies || [];
      } catch (error) {
        console.error('Failed to fetch B2B companies:', error);
        return [];
      }
    },

    b2bCompany: async (_, {id}, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        return await skintwinClient.getB2BCompany(id);
      } catch (error) {
        console.error('Failed to fetch B2B company:', error);
        return null;
      }
    },

    syncStatus: async (_, _args, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        const result = await skintwinClient.getSyncStatus(shop.domain);
        return {
          status: result.status || 'idle',
          lastSyncTime: result.lastSyncTime,
          platformStatuses: result.platformStatuses || [],
          errors: result.errors || [],
        };
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
        return {
          status: 'error',
          lastSyncTime: null,
          platformStatuses: [],
          errors: [error.message],
        };
      }
    },

    syncedAppointments: async (_, {since, platform}, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        const result = await skintwinClient.syncAppointments({
          since: since ? new Date(since) : undefined,
          platforms: platform ? [platform] : undefined,
        });
        return result.appointments || [];
      } catch (error) {
        console.error('Failed to fetch synced appointments:', error);
        return [];
      }
    },

    syncedProducts: async (_, {platform}, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        const result = await skintwinClient.syncProducts({
          targetPlatforms: platform ? [platform] : undefined,
        });
        return result.products || [];
      } catch (error) {
        console.error('Failed to fetch synced products:', error);
        return [];
      }
    },
  },
  AdminShop: {
    appHandle: async ({domain, accessToken}) => {
      const appHandle = await getAppHandle(domain, accessToken);
      return appHandle;
    },
    publicationId: async ({domain, accessToken}) => {
      const publicationId = await getPublicationId(domain, accessToken);
      return publicationId;
    },
    availableProductCount: async ({domain, accessToken}) => {
      const productListingCount = await getProductListingsCount(
        domain,
        accessToken,
      );
      return productListingCount;
    },
    skintwinEnabled: async ({domain}) => {
      const dbShop = await db.Shop.findOne({where: {domain}});
      return dbShop?.skintwinEnabled || false;
    },
    skintwinSyncStatus: async ({domain}) => {
      const dbShop = await db.Shop.findOne({where: {domain}});
      return dbShop?.skintwinSyncStatus || 'idle';
    },
    lastSyncTimestamp: async ({domain}) => {
      const dbShop = await db.Shop.findOne({where: {domain}});
      return dbShop?.lastSyncTimestamp?.toISOString() || null;
    },
  },
  Shop: {
    skintwinEnabled: (shop) => shop.skintwinEnabled || false,
    skintwinSyncStatus: (shop) => shop.skintwinSyncStatus || 'idle',
    skintwinPlatforms: (shop) => {
      if (!shop.skintwinPlatforms) return [];
      try {
        return JSON.parse(shop.skintwinPlatforms);
      } catch {
        return [];
      }
    },
  },
  Mutation: {
    completeOnboardingInfo: async (_, _args, {shop}) => {
      try {
        const {domain} = shop;
        await db.Shop.update(
          {onboardingInfoCompleted: true},
          {where: {domain}},
        );
        const dbShop = await db.Shop.findOne({where: {domain}});
        return {
          ...shop,
          ...dbShop.toJSON(),
        };
      } catch (err) {
        console.error('Failed to update shop in db', err);
      }
    },
    acceptTerms: async (_, _args, {shop}) => {
      try {
        const {domain} = shop;
        await db.Shop.update({termsAccepted: true}, {where: {domain}});
        const dbShop = await db.Shop.findOne({where: {domain}});
        return {
          ...shop,
          ...dbShop.toJSON(),
        };
      } catch (err) {
        console.error('Failed to update shop in db', err);
      }
    },
    completeOnboarding: async (_, _args, {shop}) => {
      try {
        await db.Shop.update(
          {onboardingCompleted: true},
          {where: {domain: shop.domain}},
        );
        const dbShop = await db.Shop.findOne({where: {domain: shop.domain}});
        return {
          ...shop,
          ...dbShop.toJSON(),
        };
      } catch (err) {
        console.error('Failed to update shop in db', err);
      }
    },

    // SkinTwin Integration Mutations
    enableSkintwinIntegration: async (_, {platforms}, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        const {domain} = shop;
        await db.Shop.update(
          {
            skintwinEnabled: true,
            skintwinPlatforms: JSON.stringify(platforms),
          },
          {where: {domain}},
        );
        const dbShop = await db.Shop.findOne({where: {domain}});
        return {
          ...shop,
          ...dbShop.toJSON(),
        };
      } catch (err) {
        console.error('Failed to enable SkinTwin integration:', err);
        throw err;
      }
    },

    disableSkintwinIntegration: async (_, _args, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        const {domain} = shop;
        await db.Shop.update(
          {
            skintwinEnabled: false,
            skintwinPlatforms: null,
          },
          {where: {domain}},
        );
        const dbShop = await db.Shop.findOne({where: {domain}});
        return {
          ...shop,
          ...dbShop.toJSON(),
        };
      } catch (err) {
        console.error('Failed to disable SkinTwin integration:', err);
        throw err;
      }
    },

    triggerSync: async (_, {platforms}, {shop}) => {
      if (!shop) {
        throw new AuthenticationError('Invalid bearer token');
      }
      try {
        // Update sync status to syncing
        await db.Shop.update(
          {
            skintwinSyncStatus: 'syncing',
            lastSyncAttempt: new Date(),
          },
          {where: {domain: shop.domain}},
        );

        // Trigger sync via SkinTwin API
        const syncPromises = [];

        if (!platforms || platforms.includes('appointments')) {
          syncPromises.push(skintwinClient.syncAppointments({platforms}));
        }
        if (!platforms || platforms.includes('products')) {
          syncPromises.push(
            skintwinClient.syncProducts({targetPlatforms: platforms}),
          );
        }
        if (!platforms || platforms.includes('clients')) {
          syncPromises.push(skintwinClient.syncClients({}));
        }

        await Promise.all(syncPromises);

        // Update sync status to idle
        await db.Shop.update(
          {
            skintwinSyncStatus: 'idle',
            lastSyncTimestamp: new Date(),
          },
          {where: {domain: shop.domain}},
        );

        return {
          status: 'idle',
          lastSyncTime: new Date().toISOString(),
          platformStatuses: [],
          errors: [],
        };
      } catch (err) {
        console.error('Failed to trigger sync:', err);

        await db.Shop.update(
          {
            skintwinSyncStatus: 'error',
            lastSyncError: err.message,
          },
          {where: {domain: shop.domain}},
        );

        return {
          status: 'error',
          lastSyncTime: null,
          platformStatuses: [],
          errors: [err.message],
        };
      }
    },
  },
};
