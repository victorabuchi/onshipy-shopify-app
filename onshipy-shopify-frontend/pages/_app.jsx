import '@shopify/polaris/build/esm/styles.css';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { useRouter } from 'next/router';

function getShopifyConfig() {
  const urlParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  return {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID,
    host: urlParams.get('host') || '',
    forceRedirect: true,
  };
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { host, shop } = router.query;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || '',
    host: host || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('host') : '') || '',
    forceRedirect: true,
  };

  return (
    <AppProvider i18n={enTranslations}>
      {config.host ? (
        <AppBridgeProvider config={config}>
          <Component {...pageProps} />
        </AppBridgeProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </AppProvider>
  );
}