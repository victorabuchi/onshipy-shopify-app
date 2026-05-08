import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Frame, Navigation, TopBar, Page, Card, BlockStack,
  InlineStack, Text, Button, TextField, Badge, Divider,
  Box, InlineGrid, Select, Banner,
} from '@shopify/polaris';
import {
  HomeIcon, OrderIcon, ProductIcon, PersonIcon,
  ChartVerticalIcon, SearchIcon, StoreOnlineIcon,
  SettingsIcon, ListBulletedIcon,
  StoreIcon, ReceiptDollarIcon, CreditCardIcon,
  CartIcon, PersonAddIcon, DeliveryIcon, TaxIcon,
  LocationIcon, NotificationIcon, GlobeIcon,
  LanguageIcon, NoteIcon, LockIcon,
} from '@shopify/polaris-icons';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const SETTINGS_NAV = [
  { id: 'general',           label: 'General',              icon: StoreIcon },
  { id: 'plan',              label: 'Plan',                  icon: ChartVerticalIcon },
  { id: 'billing',           label: 'Billing',               icon: ReceiptDollarIcon },
  { id: 'users',             label: 'Users',                 icon: PersonIcon },
  { id: 'payments',          label: 'Payments',              icon: CreditCardIcon },
  { id: 'checkout',          label: 'Checkout',              icon: CartIcon },
  { id: 'customer-accounts', label: 'Customer accounts',     icon: PersonAddIcon },
  { id: 'shipping',          label: 'Shipping and delivery', icon: DeliveryIcon },
  { id: 'taxes',             label: 'Taxes and duties',      icon: TaxIcon },
  { id: 'locations',         label: 'Locations',             icon: LocationIcon },
  { id: 'notifications',     label: 'Notifications',         icon: NotificationIcon },
  { id: 'domains',           label: 'Domains',               icon: GlobeIcon },
  { id: 'languages',         label: 'Languages',             icon: LanguageIcon },
  { id: 'policies',          label: 'Policies',              icon: NoteIcon },
  { id: 'security',          label: 'Security',              icon: LockIcon },
];

export default function Settings() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const active = router.query.section || 'general';

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', store_name: '', store_url: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState('');
  const [toast, setToast] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({
    new_order: true, order_shipped: true, price_change: true,
    out_of_stock: true, auto_buy_failed: true, weekly_summary: false, marketing: false,
  });
  const [currency, setCurrency] = useState('USD — US Dollar');

  useEffect(() => {
    if (!router.isReady) return;
    fetchSeller();
  }, [router.isReady]);

  const fetchSeller = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sellers/profile?shop=${shop}`);
      const data = await res.json();
      if (data.seller) {
        setSeller(data.seller);
        setForm({
          full_name: data.seller.full_name || '',
          email: data.seller.email || '',
          store_name: data.seller.store_name || '',
          store_url: data.seller.store_url || '',
        });
      }
    } catch {}
  };

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/profile?shop=${shop}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Save failed', true); return; }
      setSeller(prev => ({ ...prev, ...data.seller }));
      showToast('Changes saved');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const handlePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) { showToast('Passwords do not match', true); return; }
    if (pwForm.new_password.length < 8) { showToast('Min 8 characters', true); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/password?shop=${shop}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed', true); return; }
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      showToast('Password updated');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const handleUpgrade = async (planId) => {
    setUpgrading(planId);
    try {
      const res = await fetch(`${API_BASE}/api/billing/checkout?shop=${shop}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else showToast(data.error || 'Something went wrong', true);
    } catch { showToast('Connection error', true); }
    setUpgrading('');
  };

  const goSection = (id) =>
    router.push(`/settings?section=${id}${shop ? `&shop=${shop}` : ''}`, undefined, { shallow: true });

  const initials = seller?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ON';

  // ── Polaris TopBar ──────────────────────────────────────────────────────
  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [
            { content: 'Dashboard', onAction: () => router.push(`/dashboard${shop ? `?shop=${shop}` : ''}`) },
            { content: 'Your profile', onAction: () => goSection('users') },
          ],
        },
        {
          items: [{ content: 'Log out', onAction: () => {} }],
        },
      ]}
      name="Onshipy"
      detail="Merchant"
      initials={initials}
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

  // ── Settings-specific left nav ──────────────────────────────────────────
  const navigationMarkup = (
    <Navigation location={`/settings?section=${active}`}>
      {/* Back to main app */}
      <Navigation.Section
        items={[
          {
            label: 'Back to app',
            icon: HomeIcon,
            onClick: () => router.push(`/dashboard${shop ? `?shop=${shop}` : ''}`),
          },
        ]}
      />
      <Navigation.Section
        separator
        title="Settings"
        items={SETTINGS_NAV.map(item => ({
          label: item.label,
          icon: item.icon,
          selected: active === item.id,
          onClick: () => goSection(item.id),
        }))}
      />
    </Navigation>
  );

  // ── Section content ─────────────────────────────────────────────────────
  const renderSection = () => {
    if (active === 'general') return (
      <Page title="General">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Store contact details</Text>
              <Text as="p" variant="bodySm" tone="subdued">Used for customer communications</Text>
              <InlineGrid columns={2} gap="400">
                <TextField
                  label="Store name"
                  value={form.store_name}
                  onChange={v => setForm({ ...form, store_name: v })}
                  placeholder="My Store"
                  autoComplete="off"
                />
                <TextField
                  label="Contact email"
                  type="email"
                  value={form.email}
                  onChange={v => setForm({ ...form, email: v })}
                  autoComplete="email"
                />
              </InlineGrid>
              <TextField
                label="Store URL"
                value={form.store_url}
                onChange={v => setForm({ ...form, store_url: v })}
                prefix="onshipy.com/store/"
                placeholder="my-store"
                autoComplete="off"
              />
              <InlineStack align="end">
                <Button variant="primary" onClick={() => handleSave(form)} loading={saving}>Save</Button>
              </InlineStack>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Store defaults</Text>
              <div style={{ maxWidth: 280 }}>
                <Select
                  label="Default currency"
                  options={['USD — US Dollar', 'EUR — Euro', 'GBP — British Pound', 'NGN — Nigerian Naira']}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>
              <InlineStack align="end">
                <Button variant="primary" onClick={() => showToast('Saved')} loading={saving}>Save</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>
    );

    if (active === 'plan') return (
      <Page title="Plan">
        <BlockStack gap="400">
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Onshipy {seller?.plan ? seller.plan.charAt(0).toUpperCase() + seller.plan.slice(1) : 'Free'}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">Your current plan</Text>
              </BlockStack>
              <Badge tone="success">{seller?.plan || 'free'}</Badge>
            </InlineStack>
          </Card>
          <InlineGrid columns={3} gap="400">
            {[
              { id: 'free',       name: 'Free',       price: '$0',  period: 'forever',   tone: 'subdued',  features: ['5 product imports', '1 connected store', 'Basic scraper', 'Email support'] },
              { id: 'pro',        name: 'Pro',         price: '$29', period: 'per month', popular: true,    features: ['Unlimited imports', '3 stores', 'Auto-buy engine', 'Analytics', 'Priority support'] },
              { id: 'enterprise', name: 'Enterprise',  price: '$99', period: 'per month', enterprise: true, features: ['Everything in Pro', '10 stores', 'API access', 'White label', 'Dedicated manager'] },
            ].map(plan => {
              const isCurrent = (seller?.plan || 'free') === plan.id;
              const borderColor = plan.enterprise ? '#7c3aed' : plan.popular ? '#008060' : '#e3e3e3';
              return (
                <div key={plan.id} style={{ background: '#fff', borderRadius: 12, border: isCurrent ? `2px solid ${borderColor}` : '1px solid #e3e3e3', padding: 20, position: 'relative' }}>
                  {isCurrent && <div style={{ position: 'absolute', top: -10, left: 14, background: borderColor, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700 }}>CURRENT</div>}
                  {plan.popular && !isCurrent && <div style={{ position: 'absolute', top: -10, right: 14, background: '#008060', color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700 }}>POPULAR</div>}
                  <Text as="p" variant="bodyMd" fontWeight="bold">{plan.name}</Text>
                  <div style={{ margin: '8px 0 14px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: borderColor, letterSpacing: '-0.03em' }}>{plan.price}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#616161', marginLeft: 4 }}>{plan.period}</span>
                  </div>
                  <BlockStack gap="100">
                    {plan.features.map((f, i) => (
                      <InlineStack key={i} gap="200" blockAlign="center">
                        <Text as="span" tone="success">✓</Text>
                        <Text as="span" variant="bodySm" tone="subdued">{f}</Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                  <div style={{ marginTop: 14 }}>
                    {!isCurrent
                      ? <Button variant="primary" fullWidth onClick={() => handleUpgrade(plan.id)} loading={upgrading === plan.id}>
                          Upgrade to {plan.name}
                        </Button>
                      : <Button fullWidth disabled>Current plan</Button>
                    }
                  </div>
                </div>
              );
            })}
          </InlineGrid>
        </BlockStack>
      </Page>
    );

    if (active === 'billing') return (
      <Page title="Billing">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold" tone="subdued" style={{ textTransform: 'capitalize' }}>
                    {seller?.plan || 'free'} Plan
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {seller?.plan === 'free' ? 'Upgrade to unlock more features' : 'Active subscription'}
                  </Text>
                </BlockStack>
                <Badge tone="success">{seller?.plan || 'free'}</Badge>
              </InlineStack>
              <Button onClick={() => goSection('plan')}>View plans</Button>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Billing history</Text>
              <Text as="p" variant="bodySm" tone="subdued">No billing history yet</Text>
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>
    );

    if (active === 'users') return (
      <Page title="Users">
        <Card>
          <BlockStack gap="400">
            <InlineStack gap="400" blockAlign="center">
              <div style={{ width: 50, height: 50, background: '#008060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.125rem', fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd" fontWeight="semibold">{seller?.full_name || 'Merchant'}</Text>
                <Text as="p" variant="bodySm" tone="subdued">{seller?.email || shop}</Text>
                <Badge tone="success">{seller?.plan || 'free'} plan</Badge>
              </BlockStack>
            </InlineStack>
            <Divider />
            <InlineGrid columns={2} gap="400">
              <TextField label="Full name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} autoComplete="name" />
              <TextField label="Email address" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} autoComplete="email" />
            </InlineGrid>
            <InlineStack align="end">
              <Button variant="primary" onClick={() => handleSave({ full_name: form.full_name, email: form.email })} loading={saving}>
                Save changes
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </Page>
    );

    if (active === 'payments') return (
      <Page title="Payments">
        <Card padding="0">
          {[
            { name: 'Stripe',   desc: 'Credit cards, Apple Pay, Google Pay worldwide' },
            { name: 'PayPal',   desc: 'PayPal and Venmo payments' },
            { name: 'Paystack', desc: 'Cards, bank transfer, USSD across Africa' },
          ].map((p, i, arr) => (
            <Box key={i} padding="400" borderBlockEndWidth={i < arr.length - 1 ? '025' : '0'} borderColor="border">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">{p.name}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{p.desc}</Text>
                </BlockStack>
                <Button>Connect</Button>
              </InlineStack>
            </Box>
          ))}
        </Card>
      </Page>
    );

    if (active === 'notifications') return (
      <Page title="Notifications">
        <Card padding="0">
          {[
            { key: 'new_order',       label: 'New order received',   desc: 'When a customer places an order' },
            { key: 'order_shipped',   label: 'Order shipped',         desc: 'When tracking is added' },
            { key: 'price_change',    label: 'Price change alert',    desc: 'When source price changes' },
            { key: 'out_of_stock',    label: 'Out of stock alert',    desc: 'When a source product goes out of stock' },
            { key: 'auto_buy_failed', label: 'Auto-buy failed',       desc: 'When automatic purchase fails' },
            { key: 'weekly_summary',  label: 'Weekly summary',        desc: 'Weekly performance report' },
            { key: 'marketing',       label: 'Marketing emails',      desc: 'Tips, updates and new features' },
          ].map((n, i, arr) => (
            <Box key={n.key} padding="400" borderBlockEndWidth={i < arr.length - 1 ? '025' : '0'} borderColor="border">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">{n.label}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{n.desc}</Text>
                </BlockStack>
                <div
                  onClick={() => setNotifPrefs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  style={{ width: 36, height: 20, background: notifPrefs[n.key] ? '#008060' : '#e3e3e3', borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 2, left: notifPrefs[n.key] ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </InlineStack>
            </Box>
          ))}
        </Card>
      </Page>
    );

    if (active === 'security') return (
      <Page title="Security">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Change password</Text>
              <Text as="p" variant="bodySm" tone="subdued">Use a strong password of at least 8 characters</Text>
              <div style={{ maxWidth: 400 }}>
                <BlockStack gap="300">
                  <TextField label="Current password" type="password" value={pwForm.current_password} onChange={v => setPwForm({ ...pwForm, current_password: v })} placeholder="••••••••" autoComplete="current-password" />
                  <TextField label="New password" type="password" value={pwForm.new_password} onChange={v => setPwForm({ ...pwForm, new_password: v })} placeholder="••••••••" autoComplete="new-password" />
                  <TextField label="Confirm new password" type="password" value={pwForm.confirm_password} onChange={v => setPwForm({ ...pwForm, confirm_password: v })} placeholder="••••••••" autoComplete="new-password" />
                </BlockStack>
              </div>
              <InlineStack align="start">
                <Button variant="primary" onClick={handlePassword} loading={saving}>Update password</Button>
              </InlineStack>
            </BlockStack>
          </Card>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd" fontWeight="semibold">Two-factor authentication</Text>
                <Text as="p" variant="bodySm" tone="subdued">Use Google Authenticator or Authy</Text>
              </BlockStack>
              <Button>Set up</Button>
            </InlineStack>
          </Card>
        </BlockStack>
      </Page>
    );

    if (active === 'domains') return (
      <Page title="Domains">
        <Card padding="0">
          {[
            { domain: shop || 'onshipy-dev.myshopify.com', type: 'Connected Shopify store' },
            { domain: 'onshipy.com', type: 'Primary domain' },
          ].map((d, i, arr) => (
            <Box key={i} padding="400" borderBlockEndWidth={i < arr.length - 1 ? '025' : '0'} borderColor="border">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">{d.domain}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{d.type}</Text>
                </BlockStack>
                <Badge tone="success">Active</Badge>
              </InlineStack>
            </Box>
          ))}
          <Box padding="400">
            <Button>Connect existing domain</Button>
          </Box>
        </Card>
      </Page>
    );

    if (active === 'policies') return (
      <Page title="Policies">
        <Card padding="0">
          {['Refund policy', 'Privacy policy', 'Terms of service', 'Shipping policy', 'Contact information'].map((policy, i, arr) => (
            <Box key={i} padding="400" borderBlockEndWidth={i < arr.length - 1 ? '025' : '0'} borderColor="border">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodyMd" fontWeight="semibold">{policy}</Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text as="span" variant="bodySm" tone="subdued">Not created</Text>
                  <Button variant="plain">Create</Button>
                </InlineStack>
              </InlineStack>
            </Box>
          ))}
        </Card>
      </Page>
    );

    // Coming soon sections
    const sectionLabel = SETTINGS_NAV.find(n => n.id === active)?.label || 'Settings';
    return (
      <Page title={sectionLabel}>
        <Card>
          <Box padding="1600">
            <BlockStack gap="300" inlineAlign="center">
              <Text as="p" variant="headingMd">{sectionLabel} settings</Text>
              <Text as="p" variant="bodySm" tone="subdued">This section is coming soon.</Text>
            </BlockStack>
          </Box>
        </Card>
      </Page>
    );
  };

  return (
    <>
      <Head>
        <title>Settings — Onshipy</title>
      </Head>
      {toast && (
        <div style={{
          position: 'fixed', top: 68, right: 16, zIndex: 99999,
          background: toast.err ? '#d82c0d' : '#303030',
          color: '#fff', padding: '10px 16px', borderRadius: 8,
          fontSize: '0.8125rem', fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.err ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavOpen}
        onNavigationDismiss={() => setMobileNavOpen(false)}
      >
        {renderSection()}
      </Frame>
    </>
  );
}