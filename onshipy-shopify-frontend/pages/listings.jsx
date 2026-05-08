import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Page, Card, BlockStack, InlineStack, Text, Button,
  TextField, Badge, Spinner, Box, Divider, Tabs,
  DataTable, EmptyState, InlineGrid, Banner,
} from '@shopify/polaris';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const sym = (currency) =>
  ({ GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' }[currency] || '$');

const getImages = (images) => {
  try {
    if (!images) return [];
    if (typeof images === 'string') return JSON.parse(images);
    if (Array.isArray(images)) return images;
  } catch {}
  return [];
};

const FILTERS = [
  { id: 'all',      content: 'All',        filter: () => true },
  { id: 'active',   content: 'Active',     filter: l => l.status === 'active' },
  { id: 'pushed',   content: 'On Shopify', filter: l => !!l.shopify_product_id },
  { id: 'unpushed', content: 'Not pushed', filter: l => !l.shopify_product_id },
];

export default function Listings() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('profit');
  const [sortDir, setSortDir] = useState('desc');
  const [pushing, setPushing] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchListings(); }, []);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/listings/all?shop=${shop}`);
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch {}
    setLoading(false);
  };

  const profit = (l) => parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing);
  const margin = (l) => ((profit(l) / parseFloat(l.selling_price)) * 100).toFixed(1);

  const handleUnlist = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/listings/${id}?shop=${shop}`, { method: 'DELETE' });
      if (res.ok) {
        setListings(p => p.filter(l => l.id !== id));
        if (selected?.id === id) setSelected(null);
        showToast('Listing removed');
      } else { const d = await res.json(); showToast(d.error || 'Failed', true); }
    } catch (err) { showToast('Error: ' + err.message, true); }
  };

  const handlePush = async (listingId) => {
    setPushing(p => ({ ...p, [listingId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push?shop=${shop}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Push failed', true); }
      else { showToast('Pushed to Shopify!'); fetchListings(); }
    } catch (err) { showToast('Error: ' + err.message, true); }
    setPushing(p => ({ ...p, [listingId]: false }));
  };

  const filterDef = FILTERS[selectedTab];
  let visible = listings.filter(filterDef.filter);
  if (search) {
    visible = visible.filter(l =>
      (l.custom_title || l.original_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.source_domain || '').toLowerCase().includes(search.toLowerCase())
    );
  }
  visible = [...visible].sort((a, b) => {
    let av, bv;
    if (sortBy === 'profit')   { av = profit(a); bv = profit(b); }
    else if (sortBy === 'selling') { av = parseFloat(a.selling_price); bv = parseFloat(b.selling_price); }
    else if (sortBy === 'margin')  { av = parseFloat(margin(a)); bv = parseFloat(margin(b)); }
    else if (sortBy === 'source')  { av = parseFloat(a.source_price_at_listing); bv = parseFloat(b.source_price_at_listing); }
    else return 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const totalRevenue = listings.reduce((s, l) => s + parseFloat(l.selling_price || 0), 0);
  const totalProfit  = listings.reduce((s, l) => s + profit(l), 0);
  const avgMargin    = listings.length > 0
    ? (listings.reduce((s, l) => s + parseFloat(margin(l)), 0) / listings.length).toFixed(1)
    : '0';
  const pushedCount  = listings.filter(l => l.shopify_product_id).length;

  const tabs = FILTERS.map(f => ({
    id: f.id,
    content: `${f.content} (${listings.filter(f.filter).length})`,
  }));

  const rows = visible.map(l => {
    const imgs = getImages(l.images);
    const p = profit(l).toFixed(2);
    const m = margin(l);
    const isPushing = pushing[l.id];
    const isPushed = !!l.shopify_product_id;

    return [
      <InlineStack gap="200" blockAlign="center">
        {imgs[0]
          ? <img src={imgs[0]} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, border: '1px solid #e3e3e3' }} onError={e => e.target.style.display = 'none'} />
          : <div style={{ width: 32, height: 32, background: '#f1f1f1', borderRadius: 6, border: '1px solid #e3e3e3' }} />
        }
        <Button variant="plain" onClick={() => setSelected(selected?.id === l.id ? null : l)}>
          {l.custom_title || l.original_title}
        </Button>
      </InlineStack>,
      `${sym(l.currency)}${parseFloat(l.source_price_at_listing).toFixed(2)}`,
      `${sym(l.currency)}${parseFloat(l.selling_price).toFixed(2)}`,
      <Text as="span" tone={parseFloat(p) > 0 ? 'success' : 'critical'} fontWeight="bold">
        {parseFloat(p) > 0 ? '+' : ''}{sym(l.currency)}{p}
      </Text>,
      <InlineStack gap="200" blockAlign="center">
        <div style={{ height: 4, width: 48, background: '#f1f1f1', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(parseFloat(m), 100)}%`, background: parseFloat(m) > 30 ? '#008060' : parseFloat(m) > 10 ? '#f59e0b' : '#d82c0d', borderRadius: 2 }} />
        </div>
        <Text as="span" variant="bodySm" tone="subdued">{m}%</Text>
      </InlineStack>,
      isPushed
        ? <Badge tone="success">Pushed</Badge>
        : <Button size="slim" onClick={() => handlePush(l.id)} loading={isPushing}>Push</Button>,
      <Button size="slim" tone="critical" onClick={() => handleUnlist(l.id)}>Remove</Button>,
    ];
  });

  return (
    <Layout title="Listings">
      <Page
        title="Listings"
        primaryAction={{ content: 'Add listing', onAction: () => router.push('/products') }}
        secondaryActions={[{ content: 'Push all to Shopify', onAction: () => router.push('/online-store') }]}
      >
        <BlockStack gap="400">

          {/* Toast */}
          {toast && (
            <Banner tone={toast.err ? 'critical' : 'success'} onDismiss={() => setToast(null)}>
              {toast.msg}
            </Banner>
          )}

          {/* ── KPI cards ── */}
          {listings.length > 0 && (
            <InlineGrid columns={4} gap="400">
              {[
                { label: 'Active listings', value: String(listings.filter(l => l.status === 'active').length) },
                { label: 'Revenue potential', value: `$${totalRevenue.toFixed(2)}` },
                { label: 'Profit potential', value: `$${totalProfit.toFixed(2)}` },
                { label: 'Avg margin', value: `${avgMargin}%` },
              ].map((s, i) => (
                <Card key={i}>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">{s.label}</Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">{s.value}</Text>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          )}

          {/* ── Shopify push progress bar ── */}
          {listings.length > 0 && (
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="300" blockAlign="center">
                  <Text as="p" variant="bodySm" tone="subdued">
                    <Text as="span" fontWeight="bold" tone="success">{pushedCount}</Text>
                    {' '}of{' '}
                    <Text as="span" fontWeight="bold">{listings.length}</Text>
                    {' '}listings pushed to Shopify
                  </Text>
                  <div style={{ height: 6, width: 120, background: '#f1f1f1', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(pushedCount / listings.length) * 100}%`, background: '#008060', borderRadius: 3, transition: 'width .4s ease' }} />
                  </div>
                </InlineStack>
                {pushedCount < listings.length && (
                  <Button variant="primary" tone="success" onClick={() => router.push('/online-store')}>
                    Push {listings.length - pushedCount} remaining
                  </Button>
                )}
              </InlineStack>
            </Card>
          )}

          {/* ── Empty state ── */}
          {!loading && listings.length === 0 && (
            <Card padding="0">
              <EmptyState
                heading="No listings yet"
                action={{ content: 'Go to Products', onAction: () => router.push('/products') }}
                image="/empty-state-listings.svg"
              >
                <p>Import a product and set a selling price to create your first listing.</p>
              </EmptyState>
            </Card>
          )}

          {/* ── Main table card ── */}
          {(loading || listings.length > 0) && (
            <Card padding="0">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={(i) => { setSelectedTab(i); setSelected(null); }}
              />
              <Divider />

              <Box padding="300" borderBlockEndWidth="025" borderColor="border">
                <TextField
                  value={search}
                  onChange={setSearch}
                  placeholder="Search listings..."
                  autoComplete="off"
                  clearButton
                  onClearButtonClick={() => setSearch('')}
                />
              </Box>

              {loading && (
                <Box padding="800">
                  <InlineStack align="center"><Spinner size="small" /></InlineStack>
                </Box>
              )}

              {!loading && visible.length === 0 && listings.length > 0 && (
                <Box padding="800">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">No listings match your filter</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Try a different filter or search term</Text>
                  </BlockStack>
                </Box>
              )}

              {!loading && visible.length > 0 && (
                <DataTable
                  columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'text', 'text', 'text']}
                  headings={['Product', 'Source price', 'Selling price', 'Profit', 'Margin', 'Shopify', '']}
                  rows={rows}
                  hoverable
                  sortable={[false, true, true, true, true, false, false]}
                  defaultSortDirection="descending"
                  initialSortColumnIndex={3}
                  onSort={(index, direction) => {
                    const cols = [null, 'source', 'selling', 'profit', 'margin'];
                    setSortBy(cols[index] || 'profit');
                    setSortDir(direction === 'ascending' ? 'asc' : 'desc');
                  }}
                />
              )}
            </Card>
          )}

          {/* ── Detail panel ── */}
          {selected && (
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Listing details</Text>
                  <Button variant="plain" onClick={() => setSelected(null)}>Close</Button>
                </InlineStack>
                <Divider />

                {getImages(selected.images)[0] && (
                  <img
                    src={getImages(selected.images)[0]} alt=""
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid #e3e3e3' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}

                <BlockStack gap="100">
                  <Text as="p" variant="headingMd" fontWeight="bold">
                    {selected.custom_title || selected.original_title}
                  </Text>
                  <InlineStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">{selected.source_domain}</Text>
                    <Button variant="plain" url={selected.source_url} external>View source ↗</Button>
                  </InlineStack>
                </BlockStack>

                {/* Pricing breakdown */}
                <Card background="bg-surface-secondary">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">PRICING</Text>
                    {[
                      { label: 'You pay (source)', value: `${sym(selected.currency)}${parseFloat(selected.source_price_at_listing).toFixed(2)}` },
                      { label: 'Customer pays', value: `${sym(selected.currency)}${parseFloat(selected.selling_price).toFixed(2)}`, bold: true },
                      { label: 'Profit per sale', value: `+${sym(selected.currency)}${profit(selected).toFixed(2)}`, tone: 'success', bold: true },
                      { label: 'Margin', value: `${margin(selected)}%` },
                    ].map((r, i) => (
                      <InlineStack key={i} align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">{r.label}</Text>
                        <Text as="p" variant="bodySm" fontWeight={r.bold ? 'bold' : 'regular'} tone={r.tone}>
                          {r.value}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Card>

                {/* Margin bar */}
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodySm" tone="subdued">Profit margin</Text>
                    <Text as="p" variant="bodySm" fontWeight="semibold"
                      tone={parseFloat(margin(selected)) > 20 ? 'success' : 'caution'}>
                      {margin(selected)}%
                    </Text>
                  </InlineStack>
                  <div style={{ height: 6, background: '#f1f1f1', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(parseFloat(margin(selected)), 100)}%`,
                      background: parseFloat(margin(selected)) > 30 ? '#008060' : parseFloat(margin(selected)) > 10 ? '#f59e0b' : '#d82c0d',
                      borderRadius: 3, transition: 'width .4s',
                    }} />
                  </div>
                </BlockStack>

                {/* Shopify status */}
                <Card background="bg-surface-secondary">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="0">
                      <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">SHOPIFY</Text>
                      <Text as="p" variant="bodyMd" tone={selected.shopify_product_id ? 'success' : 'subdued'}>
                        {selected.shopify_product_id ? '✓ Pushed to store' : 'Not pushed yet'}
                      </Text>
                    </BlockStack>
                    {!selected.shopify_product_id && (
                      <Button
                        variant="primary"
                        tone="success"
                        onClick={() => handlePush(selected.id)}
                        loading={pushing[selected.id]}
                      >
                        Push now
                      </Button>
                    )}
                  </InlineStack>
                </Card>

                <InlineStack gap="200">
                  <Button onClick={() => router.push('/products')}>Edit product</Button>
                  <Button tone="critical" onClick={() => handleUnlist(selected.id)}>Remove listing</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          )}

          <Box paddingBlock="200">
            <InlineStack align="center">
              <Button variant="plain">Learn more about listings</Button>
            </InlineStack>
          </Box>

        </BlockStack>
      </Page>
    </Layout>
  );
}