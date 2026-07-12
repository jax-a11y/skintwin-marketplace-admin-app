# Ecosystem Position: skintwin-marketplace-admin-app

> This repository is part of the [SkinTwin-AI ecosystem](https://github.com/jax-a11y/skintwin-ecosystem-design). Its machine-readable manifest lives at [`.skintwin/manifest.json`](.skintwin/manifest.json); the ecosystem-wide source of truth is the registry at `registry/ecosystem.json` in the hub repo.

**Layer:** commerce-runtime · **Role:** marketplace-admin

This app is the merchant-facing admin surface of the SkinTwin marketplace channel: a Node/Express app with an Apollo GraphQL BFF and a React frontend built with Shopify's Channels UI, adapted from Shopify Marketplace Kit. Merchants use it inside the Shopify admin to onboard their shops to the marketplace and manage products and orders, with data persisted via Sequelize. In the ecosystem it sits in the commerce-runtime layer alongside the other Shopify app surfaces, and its GraphQL API is what the buyer-facing marketplace frontend queries.

## Provides

- `marketplace-admin-graphql` — Apollo GraphQL BFF for the marketplace channel (shops, products, orders), served at `/graphql` and consumed by [skintwin-marketplaces-buyer-app](https://github.com/jax-a11y/skintwin-marketplaces-buyer-app).

## Consumes

Nothing — as a channel admin app it talks directly to Shopify's Admin and Storefront APIs rather than to other ecosystem services.

## CI

CI runs in this repo's own `ci.yml` workflow: ESLint, Jest with Codecov coverage upload, and a webpack production build (it does not call the reusable templates). Ecosystem-standard reusable workflows are documented in the hub repo under [`ci/README.md`](https://github.com/jax-a11y/skintwin-ecosystem-design/blob/main/ci/README.md).
