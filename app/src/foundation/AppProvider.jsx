import React from 'react';
import {ExtendedAppProvider} from '@shopify/channels-ui';
import {Outlet} from 'react-router';
import polarisTranslations from '@shopify/polaris/locales/en.json';
import translations from '@shopify/channels-ui/locales/en.json';
import GraphQLProvider from './GraphQL';
import Link from './Link';

import '@shopify/polaris/build/esm/styles.css';
import '@shopify/channels-ui/build/esm/styles.css';
import RoutePropagator from './RoutePropagator';

const AppProvider = () => {
  const isLocalhost = window.location.hostname === 'localhost';
  const host =
    new URL(location).searchParams.get('host') ||
    (isLocalhost ? window.btoa('test-shop.myshopify.com/admin') : undefined);

  return (
    <ExtendedAppProvider
      polaris={{i18n: polarisTranslations, linkComponent: Link}}
      i18n={translations}
      config={{
        host,
        apiKey: API_KEY || 'test-api-key',
        forceRedirect: !isLocalhost,
      }}
    >
      <GraphQLProvider>
        <Outlet />
        <RoutePropagator />
      </GraphQLProvider>
    </ExtendedAppProvider>
  );
};

export default AppProvider;
