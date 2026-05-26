'use strict';

/**
 * Migration: Add SkinTwin sync metadata to Shops table
 * Adds fields for tracking integration sync status with skintwin-ai ecosystem
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add skintwinSyncStatus column
    await queryInterface.addColumn('Shops', 'skintwinSyncStatus', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'idle',
      comment: 'Sync status: idle, syncing, error',
    });

    // Add lastSyncTimestamp column
    await queryInterface.addColumn('Shops', 'lastSyncTimestamp', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last successful sync with skintwin-integrations',
    });

    // Add lastSyncAttempt column
    await queryInterface.addColumn('Shops', 'lastSyncAttempt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last sync attempt',
    });

    // Add lastSyncResults column (JSON string)
    await queryInterface.addColumn('Shops', 'lastSyncResults', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON string containing last sync results',
    });

    // Add lastSyncError column
    await queryInterface.addColumn('Shops', 'lastSyncError', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Last sync error message if any',
    });

    // Add skintwinEnabled column
    await queryInterface.addColumn('Shops', 'skintwinEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Whether skintwin integration is enabled for this shop',
    });

    // Add skintwinPlatforms column (JSON array string)
    await queryInterface.addColumn('Shops', 'skintwinPlatforms', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON array of enabled platforms: wix, opencart, shopify_b2b',
    });
  },

  async down(queryInterface) {
    // Remove all added columns
    await queryInterface.removeColumn('Shops', 'skintwinSyncStatus');
    await queryInterface.removeColumn('Shops', 'lastSyncTimestamp');
    await queryInterface.removeColumn('Shops', 'lastSyncAttempt');
    await queryInterface.removeColumn('Shops', 'lastSyncResults');
    await queryInterface.removeColumn('Shops', 'lastSyncError');
    await queryInterface.removeColumn('Shops', 'skintwinEnabled');
    await queryInterface.removeColumn('Shops', 'skintwinPlatforms');
  },
};
