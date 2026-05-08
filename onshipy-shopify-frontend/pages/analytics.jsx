import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const P = {
  bg: '#f6f6f7',
  surface: '#ffffff',
  border: '#e1e3e5',
  text: '#303030',
  textSubdued: '#616161',
  green: '#008060',
  blue: '#2fb3eb',
  font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  fontSize: '0.8125rem',
  fontWeight: 450,
  letterSpacing: '-0.00833em',
  radius: 12,
};

function money(value) {
  return `€${Number(value || 0).toFixed(2)}`;
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function dayKey(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '';
  return x.toISOString().slice(0, 10);
}

function shortDate(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '—';
  return x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function lastNDays(n) {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

function buildSeries(items, dateField, valueField) {
  const days = lastNDays(14);
  const map = Object.fromEntries(days.map((d) => [d, 0]));

  items.forEach((item) => {
    const key = dayKey(item?.[dateField]);
    if (key && key in map) {
      map[key] += num(item?.[valueField]);
    }
  });

  return days.map((day) => ({ day, value: map[day] }));
}

function buildOrderSeries(orders) {
  const days = lastNDays(14);
  const map = Object.fromEntries(days.map((d) => [d, 0]));

  orders.forEach((o) => {
    const key = dayKey(o.created_at || o.createdAt || o.order_date);
    if (key && key in map) {
      map[key] += num(o.amount_paid || o.total_price || o.total || o.total_amount);
    }
  });

  return days.map((day) => ({ day, value: map[day] }));
}

function Sparkline({ color = P.blue }) {
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" aria-hidden="true">
      <line
        x1="0"
        y1="20"
        x2="80"
        y2="20"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity="0.55"
      />
      <circle cx="40" cy="20" r="2" fill={color} />
    </svg>
  );
}

function MetricCard({ label, value, sub = '—' }) {
  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: P.radius,
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          fontSize: P.fontSize,
          color: P.textSubdued,
          marginBottom: 6,
          fontWeight: P.fontWeight,
          letterSpacing: P.letterSpacing,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '1.25rem',
          lineHeight: 1.2,
          fontWeight: 650,
          color: P.text,
          letterSpacing: '-0.02em',
          marginBottom: 2,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: P.fontSize,
          color: P.textSubdued,
          letterSpacing: P.letterSpacing,
          marginBottom: 10,
        }}
      >
        {sub}
      </div>

      <Sparkline />
    </div>
  );
}

function MetricChart({
  label,
  value = '€0.00',
  sub = '—',
  height = 140,
  color = P.blue,
  series = [],
}) {
  const safe = Array.isArray(series) && series.length ? series : [{ day: dayKey(new Date()), value: 0 }];
  const hasRealData = safe.some((d) => num(d.value) > 0);
  const max = Math.max(...safe.map((d) => num(d.value)), 1);
  const width = 400;
  const innerHeight = Math.max(height - 24, 60);

  const points = safe
    .map((d, i) => {
      const x = (i / Math.max(safe.length - 1, 1)) * width;
      let y = innerHeight - (num(d.value) / max) * (innerHeight - 16) - 8;
      if (!hasRealData) y = innerHeight - 20;
      return `${x},${y}`;
    })
    .join(' ');

  const latest = safe[safe.length - 1]?.day;
  const prev = safe[safe.length - 2]?.day;

  return (
    <div
      style={{
        background: P.surface,
        borderRadius: P.radius,
        border: `1px solid ${P.border}`,
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          fontSize: P.fontSize,
          color: P.textSubdued,
          marginBottom: 4,
          fontWeight: P.fontWeight,
          letterSpacing: P.letterSpacing,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '1.5rem',
          lineHeight: 1.2,
          fontWeight: 650,
          color: P.text,
          marginBottom: 2,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: P.fontSize,
          color: P.textSubdued,
          marginBottom: 16,
          letterSpacing: P.letterSpacing,
        }}
      >
        {sub}
      </div>

      <div
        style={{
          height,
          background: '#fafbfb',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '12px 0',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height={innerHeight} viewBox={`0 0 ${width} ${innerHeight}`} preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={hasRealData ? '0' : '5 5'}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
            points={points}
          />
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: P.textSubdued }}>
          <div style={{ width: 8, height: 2, background: color, borderRadius: 1 }} />
          {latest ? shortDate(latest) : '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: P.textSubdued }}>
          <div style={{ width: 8, height: 2, background: color, borderRadius: 1, opacity: 0.4 }} />
          {prev ? shortDate(prev) : '—'}
        </div>
      </div>
    </div>
  );
}

function EmptyStateCard({ title, heading, body, image, actionLabel, onAction }) {
  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: P.radius,
        minHeight: 430,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '20px 16px 0', fontSize: '1.05rem', fontWeight: 650, color: P.text }}>
        {title}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <img
          src={image}
          alt=""
          width="180"
          height="180"
          style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: 20 }}
        />

        <div style={{ fontSize: '1.05rem', fontWeight: 650, color: P.text, marginBottom: 8 }}>
          {heading}
        </div>

        <div
          style={{
            fontSize: P.fontSize,
            color: P.textSubdued,
            maxWidth: 330,
            lineHeight: 1.45,
            marginBottom: actionLabel ? 18 : 0,
          }}
        >
          {body}
        </div>

        {actionLabel ? (
          <button
            onClick={onAction}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #111',
              background: '#303030',
              color: '#fff',
              fontSize: P.fontSize,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: P.font,
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: P.radius,
        padding: '20px 16px 16px',
      }}
    >
      <div style={{ fontSize: '1.05rem', fontWeight: 650, color: P.text, marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('onshipy_token') : '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.allSettled([
      fetch(`${API_BASE}/api/products`, { headers }).then((r) => (r.ok ? r.json() : {})),
      fetch(`${API_BASE}/api/products/listings/all`, { headers }).then((r) => (r.ok ? r.json() : {})),
      fetch(`${API_BASE}/api/orders`, { headers }).then((r) => (r.ok ? r.json() : {})),
    ])
      .then(([p, l, o]) => {
        const pData = p.status === 'fulfilled' ? p.value : {};
        const lData = l.status === 'fulfilled' ? l.value : {};
        const oData = o.status === 'fulfilled' ? o.value : {};

        setProducts(Array.isArray(pData.products) ? pData.products : []);
        setListings(Array.isArray(lData.listings) ? lData.listings : []);
        setOrders(Array.isArray(oData.orders) ? oData.orders : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + num(o.amount_paid || o.total_price || o.total || o.total_amount),
    0
  );

  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const ordersFulfilled = orders.filter((o) => String(o.status || '').toLowerCase() === 'delivered').length;
  const returningRate = 0;
  const convRate = products.length > 0 ? (listings.length / products.length) * 100 : 0;

  const topListings = [...listings]
    .sort(
      (a, b) =>
        num(b.selling_price) -
        num(b.source_price_at_listing) -
        (num(a.selling_price) - num(a.source_price_at_listing))
    )
    .slice(0, 5);

  const sources = Object.entries(
    products.reduce((acc, p) => {
      const key = p.source_domain || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const productSeries = buildSeries(products, 'created_at', 'source_price');
  const listingSeries = buildSeries(listings, 'created_at', 'selling_price');
  const orderSeries = buildOrderSeries(orders);

  const mainSeries = orderSeries.some((d) => d.value > 0)
    ? orderSeries
    : listingSeries.some((d) => d.value > 0)
    ? listingSeries
    : productSeries;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <Layout title="Analytics">
        <div style={{ padding: 24, fontFamily: P.font, color: P.text }}>Loading analytics…</div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics">
      <div
        style={{
          fontFamily: P.font,
          fontSize: P.fontSize,
          fontWeight: P.fontWeight,
          letterSpacing: P.letterSpacing,
          color: P.text,
          background: P.bg,
          minHeight: '100vh',
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            padding: '20px 24px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="rgba(97,97,97,1)">
              <path d="M4.5 12.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75ZM10 8.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0V9.25A.75.75 0 0 1 10 8.5ZM15.5 4.5a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .75-.75Z" />
            </svg>

            <h1
              style={{
                fontSize: '1.875rem',
                lineHeight: 1.2,
                fontWeight: 650,
                color: P.text,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Analytics
            </h1>

            <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>
              Last refreshed: {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Today', dateStr, 'EUR €'].map((label, i) => (
              <button
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: P.surface,
                  border: `1px solid ${P.border}`,
                  borderRadius: 8,
                  fontSize: P.fontSize,
                  color: P.text,
                  cursor: 'pointer',
                  fontFamily: P.font,
                  fontWeight: P.fontWeight,
                }}
              >
                {label}
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.72 8.47a.75.75 0 0 1 1.06 0L10 11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 9.53a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            ))}

            <button
              style={{
                padding: '6px 12px',
                background: P.green,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: P.fontSize,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: P.font,
              }}
            >
              New exploration
            </button>
          </div>
        </div>

        <div style={{ padding: '0 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <MetricCard label="Gross sales" value={money(totalRevenue)} />
            <MetricCard label="Returning customer rate" value={`${returningRate} %`} />
            <MetricCard label="Orders fulfilled" value={ordersFulfilled} />
            <MetricCard label="Orders" value={orders.length} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 320px',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <MetricChart
              label="Total sales over time"
              value={money(totalRevenue)}
              sub="—"
              height={140}
              series={mainSeries}
            />

            <SectionCard title="Total sales breakdown">
              {[
                { label: 'Gross sales', value: money(totalRevenue) },
                { label: 'Discounts', value: money(0) },
                { label: 'Returns', value: money(0) },
                { label: 'Net sales', value: money(totalRevenue) },
                { label: 'Shipping charges', value: money(0) },
                { label: 'Return fees', value: money(0) },
                { label: 'Taxes', value: money(0) },
                { label: 'Total sales', value: money(totalRevenue) },
              ].map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < 7 ? `1px solid ${P.border}` : 'none',
                  }}
                >
                  <span style={{ fontSize: P.fontSize, color: '#2b6cb0', fontWeight: 500 }}>
                    {row.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: P.fontSize, color: P.text, fontWeight: 600 }}>{row.value}</span>
                    <span style={{ color: P.textSubdued, fontSize: '0.75rem' }}>—</span>
                  </div>
                </div>
              ))}
            </SectionCard>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <MetricChart label="Total sales by sales channel" value={money(0)} sub="—" height={100} series={orderSeries} />
            <MetricChart label="Average order value over time" value={money(avgOrder)} sub="—" height={100} series={orderSeries} />
            <MetricChart label="Total sales by product" value={money(0)} sub="—" height={100} series={productSeries} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <MetricChart label="Sessions over time" value="0" sub="—" height={100} series={productSeries} />
            <MetricChart label="Conversion rate over time" value={`${convRate.toFixed(1)} %`} sub="—" height={100} series={listingSeries} />

            <SectionCard title="Conversion rate breakdown">
              <div style={{ fontSize: '1.25rem', fontWeight: 650, color: P.text, marginBottom: 2 }}>0 %</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 16 }}>—</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { label: 'Sessions', val: '100 %', sub: '2→0%' },
                  { label: 'Added to cart', val: '0 %', sub: '0→0%' },
                  { label: 'Reached checkout', val: '0 %', sub: '0→0%' },
                  { label: 'Completed...', val: '0 %', sub: '0→0%' },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: '0.6875rem', color: P.textSubdued, marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text }}>{s.val}</div>
                    <div style={{ fontSize: '0.6875rem', color: P.textSubdued }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  height: 60,
                  background: '#e8f0ff',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: 40, height: 40, background: '#4361ee', borderRadius: 4 }} />
              </div>
            </SectionCard>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            {orders.length > 0 ? (
              <SectionCard title="Orders">
                <MetricChart
                  label="Orders revenue"
                  value={money(totalRevenue)}
                  sub={`${orders.length} orders`}
                  height={120}
                  series={orderSeries}
                />
              </SectionCard>
            ) : (
              <EmptyStateCard
                title="Orders"
                heading="No orders yet"
                body="When a customer places an order, this section will show revenue, counts, and trend lines automatically."
                image="/empty-state-orders.svg"
              />
            )}

            {products.length > 0 ? (
              <SectionCard title="Products">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <MetricCard label="Products imported" value={products.length} />
                  <MetricCard
                    label="Inventory value"
                    value={money(products.reduce((sum, p) => sum + num(p.source_price), 0))}
                  />
                </div>
              </SectionCard>
            ) : (
              <EmptyStateCard
                title="Products"
                heading="No products yet"
                body="Imported products will appear here once you start saving them."
                image="/empty-state-products.svg"
                actionLabel="Go to products"
                onAction={() => {
                  window.location.href = '/products';
                }}
              />
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            {listings.length > 0 ? (
              <SectionCard title="Listings">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
                  <MetricCard label="Active listings" value={listings.filter((l) => l.status === 'active').length} />
                  <MetricCard label="Pushed to Shopify" value={listings.filter((l) => !!l.shopify_product_id).length} />
                  <MetricCard label="Unpushed listings" value={listings.filter((l) => !l.shopify_product_id).length} />
                </div>

                {topListings.length === 0 ? (
                  <div style={{ color: P.textSubdued, fontSize: P.fontSize, padding: '24px 0', textAlign: 'center' }}>
                    No listings yet.
                  </div>
                ) : (
                  topListings.map((l, i) => {
                    const profit = num(l.selling_price) - num(l.source_price_at_listing);
                    return (
                      <div
                        key={l.id || i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderTop: i === 0 ? 'none' : `1px solid ${P.border}`,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: P.fontSize,
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {l.custom_title || l.original_title || 'Untitled listing'}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: P.textSubdued }}>
                            {l.source_domain || 'Unknown source'}
                          </div>
                        </div>
                        <span style={{ fontSize: P.fontSize, fontWeight: 650, color: P.green, marginLeft: 12 }}>
                          +{money(profit)}
                        </span>
                      </div>
                    );
                  })
                )}
              </SectionCard>
            ) : (
              <EmptyStateCard
                title="Listings"
                heading="No listings yet"
                body="Listings will appear here after you publish products for sale."
                image="/empty-state-listings.svg"
                actionLabel="Go to listings"
                onAction={() => {
                  window.location.href = '/listings';
                }}
              />
            )}

            {orders.length > 0 ? (
              <SectionCard title="Customers">
                <MetricCard label="Customers" value="—" />
              </SectionCard>
            ) : (
              <EmptyStateCard
                title="Customers"
                heading="No customer data yet"
                body="This section will populate automatically after orders exist and customer fields are available."
                image="/empty-state-customers.svg"
              />
            )}
          </div>

          <SectionCard title="Products by source">
            {sources.length === 0 ? (
              <div style={{ color: P.textSubdued, fontSize: P.fontSize, textAlign: 'center', padding: '24px 0' }}>
                No data for this date range
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 8,
                }}
              >
                {sources.map(([domain, count]) => (
                  <div
                    key={domain}
                    style={{
                      background: P.bg,
                      borderRadius: 8,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: `1px solid ${P.border}`,
                    }}
                  >
                    <span style={{ fontSize: P.fontSize, fontWeight: 500 }}>{domain}</span>
                    <span style={{ fontSize: P.fontSize, fontWeight: 650, color: P.green }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: P.fontSize,
              color: P.textSubdued,
            }}
          >
            Learn more about <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>analytics</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}