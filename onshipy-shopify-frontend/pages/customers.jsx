import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Page, Card, BlockStack, InlineStack, Text, Button,
  TextField, Badge, Spinner, Box, Divider, Tabs,
  DataTable, EmptyState, Avatar,
} from '@shopify/polaris';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const SEGMENTS = [
  { id: 'all', content: 'All customers', filter: () => true },
  { id: 'repeat', content: 'Returning customers', filter: (c) => c.orders.length > 1 },
  { id: 'once', content: 'Purchased at least once', filter: (c) => c.orders.length >= 1 },
  { id: 'highval', content: 'High value (>$100)', filter: (c) => c.total_spent > 100 },
];

const avatarColor = (name) => {
  const colors = ['#008060', '#1d4ed8', '#7c3aed', '#b45309', '#dc2626', '#0284c7'];
  let h = 0;
  for (const c of (name || '')) h = ((h << 5) - h) + c.charCodeAt(0);
  return colors[Math.abs(h) % colors.length];
};

const initials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const getStatusBadge = (status) => {
  const tones = {
    pending: 'attention',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'critical',
    failed: 'critical',
  };
  return <Badge tone={tones[status] || 'default'}>{status}</Badge>;
};

export default function Customers() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortBy, setSortBy] = useState('spent');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetch(`${API_BASE}/api/orders?shop=${shop}`)
      .then(r => r.json())
      .then(data => { if (data.orders) setOrders(data.orders); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allCustomers = Object.values(
    orders.reduce((acc, o) => {
      const key = o.customer_email || o.id;
      if (!acc[key]) acc[key] = {
        email: o.customer_email || '—',
        name: o.customer_name || 'Unknown',
        orders: [],
        total_spent: 0,
        last_order: null,
        location: o.shipping_address || null,
      };
      acc[key].push = acc[key];
      acc[key].orders.push(o);
      acc[key].total_spent += parseFloat(o.amount_paid || 0);
      const d = new Date(o.created_at);
      if (!acc[key].last_order || d > new Date(acc[key].last_order)) {
        acc[key].last_order = o.created_at;
      }
      return acc;
    }, {})
  );

  const segDef = SEGMENTS[selectedTab];
  let filtered = allCustomers.filter(segDef.filter);

  if (search) {
    filtered = filtered.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'spent') return sortDir === 'asc' ? a.total_spent - b.total_spent : b.total_spent - a.total_spent;
    if (sortBy === 'orders') return sortDir === 'asc' ? a.orders.length - b.orders.length : b.orders.length - a.orders.length;
    if (sortBy === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    return sortDir === 'asc'
      ? new Date(a.last_order) - new Date(b.last_order)
      : new Date(b.last_order) - new Date(a.last_order);
  });

  const tabs = SEGMENTS.map(s => ({
    id: s.id,
    content: `${s.content} (${allCustomers.filter(s.filter).length})`,
  }));

  const rows = filtered.map(c => [
    <InlineStack gap="200" blockAlign="center" key={c.email}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: avatarColor(c.name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
      }}>
        {initials(c.name)}
      </div>
      <Button variant="plain" onClick={() => setSelected(selected?.email === c.email ? null : c)}>
        {c.name}
      </Button>
    </InlineStack>,
    c.email,
    String(c.orders.length),
    <Text as="span" tone="success" fontWeight="semibold" key={`${c.email}-spent`}>
      ${c.total_spent.toFixed(2)}
    </Text>,
    c.last_order
      ? new Date(c.last_order).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
  ]);

  const emptyStateMarkup = (
    <EmptyState
      heading="Everything customers-related in one place"
      action={{ content: 'Add customer', onAction: () => {} }}
      secondaryAction={{ content: 'Import customers', onAction: () => {} }}
      image="/empty-state-customers.svg"
    >
      <p>Manage customer details, see order history, and track spending.</p>
    </EmptyState>
  );

  return (
    <Layout title="Customers">
      <Page
        title="Customers"
        primaryAction={{ content: 'Add customer', onAction: () => {} }}
        secondaryActions={[{ content: 'Import customers' }]}
      >
        <BlockStack gap="400">
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
                placeholder="Search customers..."
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

            {!loading && allCustomers.length === 0 && emptyStateMarkup}

            {!loading && allCustomers.length > 0 && filtered.length === 0 && (
              <Box padding="800">
                <BlockStack gap="200" inlineAlign="center">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">No customers found</Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Try changing your search or segment filter
                  </Text>
                </BlockStack>
              </Box>
            )}

            {!loading && filtered.length > 0 && (
              <DataTable
                columnContentTypes={['text', 'text', 'numeric', 'numeric', 'text']}
                headings={['Customer', 'Email', 'Orders', 'Total spent', 'Last order']}
                rows={rows}
                hoverable
                sortable={[false, false, true, true, true]}
                defaultSortDirection="descending"
                initialSortColumnIndex={3}
                onSort={(index, direction) => {
                  const cols = [null, null, 'orders', 'spent', 'last'];
                  setSortBy(cols[index] || 'spent');
                  setSortDir(direction === 'ascending' ? 'asc' : 'desc');
                }}
              />
            )}
          </Card>

          {selected && (
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Customer</Text>
                  <Button variant="plain" onClick={() => setSelected(null)}>Close</Button>
                </InlineStack>
                <Divider />

                <BlockStack gap="200" inlineAlign="center">
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: avatarColor(selected.name),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                  }}>
                    {initials(selected.name)}
                  </div>
                  <Text as="p" variant="headingMd" fontWeight="bold">{selected.name}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{selected.email}</Text>
                </BlockStack>

                <InlineGrid columns={2} gap="300">
                  {[
                    { label: 'Orders', value: String(selected.orders.length) },
                    { label: 'Total spent', value: `$${selected.total_spent.toFixed(2)}`, tone: 'success' },
                    { label: 'Avg order', value: `$${(selected.total_spent / selected.orders.length).toFixed(2)}` },
                    { label: 'Status', value: selected.orders.length > 1 ? 'Returning' : 'New' },
                  ].map((s, i) => (
                    <Card key={i} background="bg-surface-secondary">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodySm" tone="subdued">{s.label}</Text>
                        <Text as="p" variant="headingMd" fontWeight="bold" tone={s.tone}>
                          {s.value}
                        </Text>
                      </BlockStack>
                    </Card>
                  ))}
                </InlineGrid>

                <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">ORDER HISTORY</Text>
                <BlockStack gap="0">
                  {selected.orders
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((o, i) => (
                      <Box
                        key={o.id}
                        paddingBlock="300"
                        borderBlockEndWidth={i < selected.orders.length - 1 ? '025' : '0'}
                        borderColor="border"
                      >
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="0">
                            <Button variant="plain">
                              #{o.storefront_order_id || o.id?.slice(0, 8)}
                            </Button>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {new Date(o.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </Text>
                          </BlockStack>
                          <BlockStack gap="100" inlineAlign="end">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              ${o.amount_paid}
                            </Text>
                            {getStatusBadge(o.status)}
                          </BlockStack>
                        </InlineStack>
                      </Box>
                    ))}
                </BlockStack>
              </BlockStack>
            </Card>
          )}

          <Box paddingBlock="200">
            <InlineStack align="center">
              <Button variant="plain">Learn more about customers</Button>
            </InlineStack>
          </Box>
        </BlockStack>
      </Page>
    </Layout>
  );
}