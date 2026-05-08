import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Page, Card, BlockStack, InlineStack, Text, Button,
  TextField, Banner, Spinner, Badge, Thumbnail,
  ProgressBar, Divider, Box, InlineGrid,
} from '@shopify/polaris';
import {
  SearchIcon, StoreOnlineIcon, ChartVerticalIcon, ListBulletedIcon,
} from '@shopify/polaris-icons';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const sym = (currency) =>
  ({ GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' }[currency] || '$');

const getImages = (images) => {
  try {
    if (!images) return [];
    return typeof images === 'string' ? JSON.parse(images) : Array.isArray(images) ? images : [];
  } catch { return []; }
};

export default function Dashboard() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const [p, l, o] = await Promise.all([
        fetch(`${API_BASE}/api/products?shop=${shop}`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/products/listings/all?shop=${shop}`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/orders?shop=${shop}`, { headers }).then(r => r.json()),
      ]);
      if (p.products) setProducts(p.products);
      if (l.listings) setListings(l.listings);
      if (o.orders) setOrders(o.orders);
    } catch {}
    setLoading(false);
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), shop }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportStatus({ error: data.error || 'Import failed' });
      } else {
        setImportStatus({ success: true });
        setUrl('');
        fetchAll();
      }
    } catch (err) {
      setImportStatus({ error: err.message });
    }
    setImporting(false);
  };

  const isListed = (p) => listings.some(l => l.imported_product_id === p.id);
  const revenue = orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0).toFixed(0);

  const steps = [
    { num: 1, title: 'Import a product', desc: 'Paste any product URL to import instantly', done: products.length > 0, action: () => {} },
    { num: 2, title: 'Set your price', desc: 'Set a selling price and profit margin', done: listings.length > 0, action: () => router.push('/products') },
    { num: 3, title: 'Connect your store', desc: 'Link your Shopify store', done: false, action: () => router.push('/online-store') },
    { num: 4, title: 'Push products', desc: 'Publish your listings to your store', done: false, action: () => router.push('/online-store') },
  ];
  const completedSteps = steps.filter(s => s.done).length;

  return (
    <Layout title="Home">
      <Page title="Let's get started">
        <BlockStack gap="400">

          {/* ── Stat cards ── */}
          <InlineGrid columns={4} gap="400">
            {[
              { label: 'Sessions', value: '—' },
              { label: 'Total sales', value: `$${revenue}` },
              { label: 'Orders', value: String(orders.length) },
              { label: 'Conversion rate', value: '0%' },
            ].map((stat, i) => (
              <Card key={i}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">{stat.label}</Text>
                  <Text as="p" variant="headingLg" fontWeight="bold">{stat.value}</Text>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>

          {/* ── Getting started ── */}
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">Getting started</Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {completedSteps} of {steps.length} tasks complete
                  </Text>
                </BlockStack>
                <Text as="p" variant="bodySm" tone="success" fontWeight="semibold">
                  {Math.round((completedSteps / steps.length) * 100)}%
                </Text>
              </InlineStack>
              <ProgressBar
                progress={(completedSteps / steps.length) * 100}
                size="small"
                tone="success"
              />
              <Divider />
              <BlockStack gap="0">
                {steps.map((step, i) => (
                  <Box
                    key={i}
                    paddingBlock="300"
                    borderBlockEndWidth={i < steps.length - 1 ? '025' : '0'}
                    borderColor="border"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: step.done ? '#008060' : '#f1f1f1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {step.done
                            ? <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            : <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#616161' }}>{step.num}</span>
                          }
                        </div>
                        <BlockStack gap="0">
                          <Text
                            as="p"
                            variant="bodyMd"
                            fontWeight={step.done ? 'regular' : 'semibold'}
                            tone={step.done ? 'subdued' : undefined}
                          >
                            {step.title}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">{step.desc}</Text>
                        </BlockStack>
                      </InlineStack>
                      {step.done
                        ? <Badge tone="success">Done</Badge>
                        : <Button variant="plain" onClick={step.action}>Start</Button>
                      }
                    </InlineStack>
                  </Box>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>

          {/* ── Import ── */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Import a product</Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Paste any product URL from Nike, ASOS, Amazon, Zara and thousands of other websites
              </Text>
              <InlineStack gap="200" blockAlign="start">
                <div style={{ flex: 1 }}>
                  <TextField
                    value={url}
                    onChange={setUrl}
                    placeholder="https://www.nike.com/product/..."
                    autoComplete="off"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleImport}
                  loading={importing}
                  disabled={!url.trim()}
                >
                  Import
                </Button>
              </InlineStack>
              {importing && (
                <BlockStack gap="200">
                  {['Importing product details', 'Fetching images', 'Detecting price & currency'].map((label, i) => (
                    <InlineStack key={i} gap="200" blockAlign="center">
                      <Spinner size="small" />
                      <Text as="p" variant="bodySm" tone="subdued">{label}</Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              )}
              {importStatus?.success && (
                <Banner tone="success" onDismiss={() => setImportStatus(null)}>
                  Product imported successfully!
                </Banner>
              )}
              {importStatus?.error && (
                <Banner tone="critical" onDismiss={() => setImportStatus(null)}>
                  {importStatus.error}
                </Banner>
              )}
            </BlockStack>
          </Card>

          {/* ── My Products ── */}
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h2" variant="headingMd">My Products</Text>
                  <Badge>{String(products.length)}</Badge>
                </InlineStack>
                <Button onClick={() => router.push('/products')}>View all</Button>
              </InlineStack>

              {loading && (
                <InlineStack align="center"><Spinner size="small" /></InlineStack>
              )}

              {!loading && products.length === 0 && (
                <Box paddingBlock="600">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">No products yet</Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Import your first product using the bar above
                    </Text>
                  </BlockStack>
                </Box>
              )}

              {!loading && products.length > 0 && (
                <BlockStack gap="0">
                  {products.slice(0, 5).map((p, i) => {
                    const imgs = getImages(p.images);
                    const listed = isListed(p);
                    return (
                      <Box
                        key={p.id}
                        paddingBlock="300"
                        borderBlockEndWidth={i < Math.min(products.length, 5) - 1 ? '025' : '0'}
                        borderColor="border"
                      >
                        <InlineStack align="space-between" blockAlign="center" gap="300">
                          <InlineStack gap="300" blockAlign="center">
                            <Thumbnail
                              source={imgs[0] || ''}
                              alt={p.title}
                              size="small"
                            />
                            <BlockStack gap="0">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">{p.title}</Text>
                              <InlineStack gap="200">
                                <Text as="p" variant="bodySm" tone="subdued">{p.source_domain}</Text>
                                <Text as="p" variant="bodySm" fontWeight="semibold">
                                  {sym(p.currency)}{parseFloat(p.source_price).toFixed(2)}
                                </Text>
                                <Badge tone={listed ? 'success' : undefined}>
                                  {listed ? 'Listed' : 'Not listed'}
                                </Badge>
                              </InlineStack>
                            </BlockStack>
                          </InlineStack>
                          <InlineStack gap="200">
                            <Button size="slim" onClick={() => router.push('/products')}>
                              {listed ? 'Update price' : 'Set price'}
                            </Button>
                            <Button size="slim" variant="primary" onClick={() => router.push('/online-store')}>
                              Push
                            </Button>
                          </InlineStack>
                        </InlineStack>
                      </Box>
                    );
                  })}
                  {products.length > 5 && (
                    <Box paddingBlock="300">
                      <Button variant="plain" onClick={() => router.push('/products')}>
                        View all {products.length} products
                      </Button>
                    </Box>
                  )}
                </BlockStack>
              )}
            </BlockStack>
          </Card>

          {/* ── Quick actions ── */}
          <InlineGrid columns={4} gap="400">
            {[
              { title: 'Browse brands', desc: 'Find products from top brands', href: '/browse', icon: SearchIcon },
              { title: 'My listings', desc: 'Manage priced products', href: '/listings', icon: ListBulletedIcon },
              { title: 'Connect store', desc: 'Link Shopify & more', href: '/online-store', icon: StoreOnlineIcon },
              { title: 'Analytics', desc: 'Track revenue & profit', href: '/analytics', icon: ChartVerticalIcon },
            ].map((item, i) => (
              <Card key={i}>
                <BlockStack gap="200">
                  <item.icon width={20} height={20} />
                  <Text as="p" variant="bodyMd" fontWeight="semibold">{item.title}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{item.desc}</Text>
                  <Button variant="plain" onClick={() => router.push(item.href)}>Open</Button>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>

          {/* ── Recent orders ── */}
          {orders.length > 0 && (
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Recent orders</Text>
                  <Button onClick={() => router.push('/orders')}>View all</Button>
                </InlineStack>
                <BlockStack gap="0">
                  {orders.slice(0, 3).map((o, i) => (
                    <Box
                      key={o.id}
                      paddingBlock="300"
                      borderBlockEndWidth={i < 2 ? '025' : '0'}
                      borderColor="border"
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="0">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            #{o.storefront_order_id || o.id?.slice(0, 8)}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {o.customer_name} · {new Date(o.created_at).toLocaleDateString()}
                          </Text>
                        </BlockStack>
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            ${o.amount_paid}
                          </Text>
                          <Badge tone={
                            o.status === 'delivered' ? 'success'
                            : o.status === 'shipped' ? 'info'
                            : 'attention'
                          }>
                            {o.status}
                          </Badge>
                        </InlineStack>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          )}

        </BlockStack>
      </Page>
    </Layout>
  );
}