import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Page, Card, BlockStack, InlineStack, Text, Button,
  TextField, Badge, Spinner, Box, Divider, Tabs,
  DataTable, EmptyState, InlineGrid,
} from '@shopify/polaris';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getStatusBadge = (status) => {
  const tones = {
    pending: 'attention',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'critical',
    failed: 'critical',
    draft: 'warning',
    abandoned: 'critical',
  };
  return <Badge tone={tones[status] || 'default'}>{status}</Badge>;
};

const sym = (v) => `$${parseFloat(v || 0).toFixed(2)}`;

export default function Orders() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    if (!router.isReady) return;

    fetch(`${API_BASE}/api/orders?shop=${shop}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router.isReady, shop]);

  const tabs = [
    { id: 'all', content: 'All' },
    { id: 'unfulfilled', content: 'Unfulfilled' },
    { id: 'drafts', content: 'Drafts' },
    { id: 'abandoned', content: 'Abandoned checkouts' },
  ];

  const tabId = tabs[selectedTab]?.id || 'all';

  const tabFiltered = orders.filter((o) => {
    if (tabId === 'unfulfilled') return ['pending', 'processing'].includes(o.status);
    if (tabId === 'drafts') return o.status === 'draft';
    if (tabId === 'abandoned') return o.status === 'abandoned';
    return true;
  });

  const searched = search
    ? tabFiltered.filter((o) =>
        (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.customer_email || '').toLowerCase().includes(search.toLowerCase()) ||
        String(o.storefront_order_id || o.id || '').toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered;

  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'date') {
      const av = new Date(a.created_at);
      const bv = new Date(b.created_at);
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    if (sortBy === 'amount') {
      const av = parseFloat(a.amount_paid || 0);
      const bv = parseFloat(b.amount_paid || 0);
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    return 0;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
  const fulfilled = orders.filter((o) => o.status === 'delivered').length;
  const returned = orders.filter((o) => o.status === 'cancelled').length;

  const kpis = [
    { label: 'Orders', value: String(orders.length), sub: `${todayOrders.length} today` },
    { label: 'Items ordered', value: String(orders.reduce((s, o) => s + (o.quantity || 1), 0)) },
    { label: 'Returns', value: `$${returned > 0 ? (returned * 50).toFixed(0) : '0'}` },
    { label: 'Orders fulfilled', value: String(fulfilled) },
  ];

  const emptyStateMarkup = (
    <EmptyState
      heading="Your orders will show here"
      action={{ content: 'Create order', onAction: () => router.push('/products') }}
      image="/empty-state-orders.svg"
    >
      <p>This is where you'll fulfill orders, collect payments, and track order progress.</p>
    </EmptyState>
  );

  const draftsEmptyMarkup = (
    <EmptyState
      heading="Manually create orders and invoices"
      action={{ content: 'Create draft order', onAction: () => {} }}
      image="/empty-state-orders.svg"
    >
      <p>Use draft orders to take orders over the phone, email invoices to customers, and collect payments.</p>
    </EmptyState>
  );

  const abandonedEmptyMarkup = (
    <EmptyState
      heading="Abandoned checkouts will show here"
      image="/empty-state-orders.svg"
    >
      <p>See when customers put an item in their cart but don't check out.</p>
    </EmptyState>
  );

  const rows = sorted.map((o) => [
    <Button
      key={`order-${o.id}`}
      variant="plain"
      onClick={() => setSelected(selected?.id === o.id ? null : o)}
    >
      #{o.storefront_order_id || o.id?.slice(0, 8).toUpperCase()}
    </Button>,
    new Date(o.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    o.customer_name || '—',
    o.source_channel || 'Online Store',
    sym(o.amount_paid),
    <Badge tone="success">Paid</Badge>,
    getStatusBadge(o.status),
    String(o.quantity || 1),
  ]);

  const showOrdersTable = !loading && sorted.length > 0;
  const showSearchArea = !loading && tabFiltered.length > 0;
  const showNoSearchResults = !loading && tabFiltered.length > 0 && sorted.length === 0;

  return (
    <Layout title="Orders">
      <Page
        title="Orders"
        primaryAction={{ content: 'Create order', onAction: () => router.push('/products') }}
        secondaryActions={[{ content: 'More actions' }]}
      >
        <BlockStack gap="400">
          <Card>
            <InlineGrid columns={4} gap="400">
              {kpis.map((kpi, i) => (
                <BlockStack key={i} gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">{kpi.label}</Text>
                  <Text as="p" variant="headingMd" fontWeight="bold">{kpi.value}</Text>
                  {kpi.sub && <Text as="p" variant="bodySm" tone="subdued">{kpi.sub}</Text>}
                </BlockStack>
              ))}
            </InlineGrid>
          </Card>

          <Card padding="0">
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={(i) => {
                setSelectedTab(i);
                setSelected(null);
                setSearch('');
              }}
            />
            <Divider />

            {loading && (
              <Box padding="800">
                <InlineStack align="center">
                  <Spinner size="small" />
                </InlineStack>
              </Box>
            )}

            {!loading && tabId === 'all' && tabFiltered.length === 0 && emptyStateMarkup}
            {!loading && tabId === 'unfulfilled' && tabFiltered.length === 0 && emptyStateMarkup}
            {!loading && tabId === 'drafts' && tabFiltered.length === 0 && draftsEmptyMarkup}
            {!loading && tabId === 'abandoned' && tabFiltered.length === 0 && abandonedEmptyMarkup}

            {showSearchArea && (
              <BlockStack gap="0">
                <Box padding="300" borderBlockEndWidth="025" borderColor="border">
                  <TextField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search orders..."
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => setSearch('')}
                  />
                </Box>

                {showNoSearchResults ? (
                  <Box padding="800">
                    <BlockStack gap="200" inlineAlign="center">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        No orders match your search
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Try a different search term
                      </Text>
                    </BlockStack>
                  </Box>
                ) : null}

                {showOrdersTable && (
                  <DataTable
                    columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'text', 'text', 'numeric']}
                    headings={['Order', 'Date', 'Customer', 'Channel', 'Total', 'Payment', 'Fulfillment', 'Items']}
                    rows={rows}
                    hoverable
                  />
                )}
              </BlockStack>
            )}
          </Card>

          {selected && (
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Order #{selected.storefront_order_id || selected.id?.slice(0, 8).toUpperCase()}
                  </Text>
                  <Button variant="plain" onClick={() => setSelected(null)}>Close</Button>
                </InlineStack>

                <Divider />

                <InlineStack gap="200">
                  {getStatusBadge(selected.status)}
                  <Badge tone="success">Paid</Badge>
                </InlineStack>

                <Card background="bg-surface-secondary">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">
                      CUSTOMER
                    </Text>

                    <InlineStack gap="300" blockAlign="center">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#008060',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {selected.customer_name?.[0]?.toUpperCase() || '?'}
                      </div>

                      <BlockStack gap="0">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {selected.customer_name || '—'}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {selected.customer_email || ''}
                        </Text>
                      </BlockStack>
                    </InlineStack>

                    {selected.shipping_address && (
                      <Text as="p" variant="bodySm" tone="subdued">
                        {selected.shipping_address}
                      </Text>
                    )}
                  </BlockStack>
                </Card>

                <Card background="bg-surface-secondary">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">
                      ORDER SUMMARY
                    </Text>

                    {[
                      {
                        label: 'Order date',
                        value: new Date(selected.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }),
                      },
                      { label: 'Items', value: String(selected.quantity || 1) },
                      { label: 'Subtotal', value: sym(selected.amount_paid) },
                      { label: 'Shipping', value: '$0.00' },
                      { label: 'Total', value: sym(selected.amount_paid), bold: true },
                    ].map((row, i) => (
                      <InlineStack key={i} align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">{row.label}</Text>
                        <Text
                          as="p"
                          variant="bodySm"
                          fontWeight={row.bold ? 'bold' : 'regular'}
                          tone={row.bold ? 'success' : undefined}
                        >
                          {row.value}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Card>

                <InlineStack gap="200">
                  {selected.status === 'pending' && (
                    <Button variant="primary" tone="success">Fulfill order</Button>
                  )}
                  <Button>View full order</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          )}

          <Box paddingBlock="200">
            <InlineStack align="center">
              <Button variant="plain">Learn more about orders</Button>
            </InlineStack>
          </Box>
        </BlockStack>
      </Page>
    </Layout>
  );
}