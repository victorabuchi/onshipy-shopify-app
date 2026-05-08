import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Frame,
  Navigation,
  TopBar,
  Text,
} from '@shopify/polaris';
import {
  HomeIcon,
  OrderIcon,
  ProductIcon,
  PersonIcon,
  ChartVerticalIcon,
  SearchIcon,
  StoreOnlineIcon,
  SettingsIcon,
  ListBulletedIcon,
} from '@shopify/polaris-icons';

export default function Layout({ children, title }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [
            {
              content: 'Your profile',
              onAction: () => router.push('/settings'),
            },
            {
              content: 'Store settings',
              onAction: () => router.push('/settings'),
            },
          ],
        },
        {
          items: [
            {
              content: 'Log out',
              onAction: () => {},
            },
          ],
        },
      ]}
      name="Onshipy"
      detail="Merchant"
      initials="ON"
      open={userMenuOpen}
      onToggle={() => setUserMenuOpen(!userMenuOpen)}
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={() => setMobileNavOpen(!mobileNavOpen)}
    />
  );

  const navigationMarkup = (
    <Navigation location={router.pathname}>
      <Navigation.Section
        items={[
          {
            label: 'Home',
            icon: HomeIcon,
            url: '/dashboard',
            selected: router.pathname === '/dashboard',
          },
          {
            label: 'Orders',
            icon: OrderIcon,
            url: '/orders',
            selected: router.pathname === '/orders',
          },
          {
            label: 'Products',
            icon: ProductIcon,
            url: '/products',
            selected: router.pathname === '/products',
          },
          {
            label: 'Customers',
            icon: PersonIcon,
            url: '/customers',
            selected: router.pathname === '/customers',
          },
          {
            label: 'Listings',
            icon: ListBulletedIcon,
            url: '/listings',
            selected: router.pathname === '/listings',
          },
          {
            label: 'Analytics',
            icon: ChartVerticalIcon,
            url: '/analytics',
            selected: router.pathname === '/analytics',
          },
          {
            label: 'Browse',
            icon: SearchIcon,
            url: '/browse',
            selected: router.pathname === '/browse',
          },
        ]}
      />
      <Navigation.Section
        title="Sales channels"
        items={[
          {
            label: 'Online Store',
            icon: StoreOnlineIcon,
            url: '/online-store',
            selected: router.pathname === '/online-store',
          },
        ]}
      />
      <Navigation.Section
        title="Settings"
        items={[
          {
            label: 'Settings',
            icon: SettingsIcon,
            url: '/settings',
            selected: router.pathname === '/settings',
          },
        ]}
      />
    </Navigation>
  );

  return (
    <>
      <Head>
        <title>{title ? `${title} — Onshipy` : 'Onshipy'}</title>
      </Head>
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavOpen}
        onNavigationDismiss={() => setMobileNavOpen(false)}
      >
        {children}
      </Frame>
    </>
  );
}