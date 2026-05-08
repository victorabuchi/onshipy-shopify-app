import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Page, Card, BlockStack, InlineStack, Text, Button,
  TextField, Badge, Spinner, Box, Divider, Tabs,
  DataTable, Banner, InlineGrid, EmptyState,
} from '@shopify/polaris';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const sym = (currency) =>
  ({ GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' }[currency] || '$');

const getImages = (images) => {
  try {
    if (!images) return [];
    return typeof images === 'string' ? JSON.parse(images) : Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
};

const getVariants = (variants) => {
  try {
    if (!variants) return [];
    return typeof variants === 'string' ? JSON.parse(variants) : Array.isArray(variants) ? variants : [];
  } catch {
    return [];
  }
};

const SubEmptyState = ({ title, desc, image, primaryAction, secondaryAction }) => (
  <EmptyState
    heading={title}
    action={primaryAction ? { content: primaryAction.content, onAction: primaryAction.onAction } : undefined}
    secondaryAction={secondaryAction ? { content: secondaryAction.content, onAction: secondaryAction.onAction } : undefined}
    image={image}
  >
    <p>{desc}</p>
  </EmptyState>
);

const TABS = [
  { id: 'products', content: 'All' },
  { id: 'inventory', content: 'Inventory' },
  { id: 'purchase_orders', content: 'Purchase orders' },
  { id: 'transfers', content: 'Transfers' },
  { id: 'gift_cards', content: 'Gift cards' },
];

export default function Products() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const section = router.query.section || 'products';
  const selectedTabIndex = TABS.findIndex((t) => t.id === (section || 'products'));

  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [listing, setListing] = useState(false);
  const [listMessage, setListMessage] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, l] = await Promise.all([
        fetch(`${API_BASE}/api/products?shop=${shop}`).then((r) => r.json()),
        fetch(`${API_BASE}/api/products/listings/all?shop=${shop}`).then((r) => r.json()),
      ]);
      if (p.products) setProducts(p.products);
      if (l.listings) setListings(l.listings);
    } catch {}
    setLoading(false);
  };

  const openProduct = (p) => {
    setSelected(p);
    setActiveImage(0);
    setEditData({ title: p.title, description: p.description || '', images: getImages(p.images) });
    setSellingPrice('');
    setProfitMargin('');
    setListMessage(null);
    setSelectedVariants({});
    setEditing(false);
  };

  const closePanel = () => {
    setSelected(null);
    setEditing(false);
    setActiveImage(0);
  };

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${selected.id}?shop=${shop}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((p) => p.filter((x) => x.id !== selected.id));
        closePanel();
        showToast('Product deleted');
      } else {
        const d = await res.json();
        showToast(d.error || 'Delete failed', true);
      }
    } catch (err) {
      showToast('Error: ' + err.message, true);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${selected.id}?shop=${shop}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          images: JSON.stringify(editData.images),
        }),
      });
      if (res.ok) {
        const updated = {
          ...selected,
          title: editData.title,
          description: editData.description,
          images: JSON.stringify(editData.images),
        };
        setProducts((p) => p.map((x) => (x.id === selected.id ? updated : x)));
        setSelected(updated);
        setEditing(false);
        showToast('Saved successfully');
      } else {
        const d = await res.json();
        showToast(d.error || 'Save failed', true);
      }
    } catch (err) {
      showToast('Error: ' + err.message, true);
    }
    setSaving(false);
  };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && selected?.source_price) {
      setProfitMargin((((val - selected.source_price) / val) * 100).toFixed(1));
    }
  };

  const handleMarginChange = (val) => {
    setProfitMargin(val);
    if (val && selected?.source_price) {
      setSellingPrice((selected.source_price / (1 - val / 100)).toFixed(2));
    }
  };

  const handleSetPrice = async () => {
    if (!sellingPrice || !selected) return;
    setListing(true);
    setListMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/products/${selected.id}/list?shop=${shop}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selling_price: parseFloat(sellingPrice),
          custom_title: editData.title || selected.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setListMessage({ error: data.error || 'Failed' });
        return;
      }
      setListMessage({
        success: `Listed at ${sym(selected.currency)}${parseFloat(sellingPrice).toFixed(2)} · Profit: ${sym(selected.currency)}${data.profit_per_sale} (${data.margin_percent}%)`,
      });
      fetchAll();
    } catch {
      setListMessage({ error: 'Connection error' });
    }
    setListing(false);
  };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditData((prev) => ({ ...prev, images: [...(prev.images || []), ev.target.result] }));
        if (!editing) setEditing(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const isListed = (p) => listings.some((l) => l.imported_product_id === p.id);

  const filtered = search
    ? products.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (p.source_domain || '').toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const images = editing ? (editData.images || []) : selected ? getImages(selected.images) : [];
  const variants = selected ? getVariants(selected.variants) : [];
  const groupedVariants = variants.reduce((acc, v) => {
    if (v.option && v.value) {
      if (!acc[v.option]) acc[v.option] = [];
      if (!acc[v.option].includes(v.value)) acc[v.option].push(v.value);
    }
    return acc;
  }, {});

  const rows = filtered.map((p) => {
    const imgs = getImages(p.images);
    const pvars = getVariants(p.variants);
    const listed = isListed(p);

    return [
      <InlineStack gap="200" blockAlign="center" key={`product-${p.id}`}>
        {imgs[0] ? (
          <img
            src={imgs[0]}
            alt=""
            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, border: '1px solid #e3e3e3' }}
            onError={(e) => (e.target.style.display = 'none')}
          />
        ) : (
          <div style={{ width: 32, height: 32, background: '#f1f1f1', borderRadius: 6, border: '1px solid #e3e3e3' }} />
        )}
        <Button variant="plain" onClick={() => openProduct(p)}>
          <Text as="span" variant="bodyMd" fontWeight="semibold">{p.title}</Text>
        </Button>
      </InlineStack>,
      <Badge tone={p.scrape_status === 'completed' ? 'success' : 'attention'}>
        {p.scrape_status === 'completed' ? 'Active' : p.scrape_status}
      </Badge>,
      '—',
      `${sym(p.currency)}${parseFloat(p.source_price).toFixed(2)}`,
      listed ? (
        <Badge tone="success">Listed</Badge>
      ) : (
        <Text as="span" variant="bodySm" tone="subdued">Not listed</Text>
      ),
      pvars.length > 0 ? (
        <Badge tone="info">{String(pvars.length)}</Badge>
      ) : (
        <Text as="span" tone="subdued">—</Text>
      ),
    ];
  });

  return (
    <Layout title="Products">
      {lightboxOpen && images.length > 0 && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer',
            }}
          >
            ×
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i - 1);
              }}
              style={{
                position: 'absolute',
                left: 24,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ‹
            </button>
          )}

          <img
            src={images[lightboxIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 6 }}
            onError={(e) => (e.target.style.display = 'none')}
          />

          {lightboxIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i + 1);
              }}
              style={{
                position: 'absolute',
                right: 24,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ›
            </button>
          )}
        </div>
      )}

      <Page
        title="Products"
        primaryAction={{ content: 'Add product', onAction: () => router.push('/dashboard') }}
        secondaryActions={[
          { content: 'Import', onAction: () => router.push('/browse') },
          { content: 'More actions' },
        ]}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <BlockStack gap="400">
              {toast && (
                <Banner tone={toast.err ? 'critical' : 'success'} onDismiss={() => setToast(null)}>
                  {toast.msg}
                </Banner>
              )}

              <Card padding="0">
                <Tabs
                  tabs={TABS}
                  selected={selectedTabIndex >= 0 ? selectedTabIndex : 0}
                  onSelect={(i) => {
                    const tab = TABS[i];
                    router.push(tab.id === 'products' ? '/products' : `/products?section=${tab.id}`);
                    setSelected(null);
                  }}
                />
                <Divider />

                {section === 'products' && (
                  <>
                    <Box padding="300" borderBlockEndWidth="025" borderColor="border">
                      <InlineStack gap="200">
                        <div style={{ flex: 1 }}>
                          <TextField
                            value={search}
                            onChange={setSearch}
                            placeholder="Search products..."
                            autoComplete="off"
                            clearButton
                            onClearButtonClick={() => setSearch('')}
                          />
                        </div>
                        <Button>Filter</Button>
                        <Button>Sort</Button>
                      </InlineStack>
                    </Box>

                    {loading && (
                      <Box padding="800">
                        <InlineStack align="center"><Spinner size="small" /></InlineStack>
                      </Box>
                    )}

                    {!loading && products.length === 0 && (
                      <EmptyState
                        heading="Add your products"
                        action={{ content: 'Add product', onAction: () => router.push('/dashboard') }}
                        secondaryAction={{ content: 'Browse brands', onAction: () => router.push('/browse') }}
                        image="/empty-state-products.svg"
                      >
                        <p>Import from Nike, ASOS, Amazon, Zara and thousands of brands worldwide</p>
                      </EmptyState>
                    )}

                    {!loading && filtered.length === 0 && products.length > 0 && (
                      <Box padding="800">
                        <BlockStack gap="200" inlineAlign="center">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">No products match your search</Text>
                          <Text as="p" variant="bodySm" tone="subdued">Try a different search term</Text>
                        </BlockStack>
                      </Box>
                    )}

                    {!loading && filtered.length > 0 && (
                      <DataTable
                        columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text']}
                        headings={['Product', 'Status', 'Inventory', 'Source price', 'Listed', 'Variants']}
                        rows={rows}
                        hoverable
                      />
                    )}
                  </>
                )}

                {section === 'inventory' && (
                  <SubEmptyState
                    title="Keep track of your inventory"
                    desc="When you enable inventory tracking on your products, you can view and adjust their inventory counts here."
                    image="/empty-state-inventory.svg"
                    primaryAction={{ content: 'Go to products', onAction: () => router.push('/products') }}
                  />
                )}

                {section === 'purchase_orders' && (
                  <SubEmptyState
                    title="Manage your purchase orders"
                    desc="Track and receive inventory ordered from suppliers."
                    image="/empty-state-purchase orders.svg"
                    primaryAction={{ content: 'Create purchase order', onAction: () => {} }}
                  />
                )}

                {section === 'transfers' && (
                  <SubEmptyState
                    title="Move inventory between locations"
                    desc="Move and track inventory between your business locations."
                    image="/empty-state-transfers.svg"
                    primaryAction={{ content: 'Create transfer', onAction: () => {} }}
                  />
                )}

                {section === 'gift_cards' && (
                  <SubEmptyState
                    title="Start selling gift cards"
                    desc="Add gift card products to sell or create gift cards and send them directly to your customers."
                    image="/empty-state-giftcards.svg"
                    primaryAction={{ content: 'Add gift card product', onAction: () => {} }}
                    secondaryAction={{ content: 'Create gift card', onAction: () => {} }}
                  />
                )}
              </Card>

              <Box paddingBlock="200">
                <InlineStack align="center">
                  <Button variant="plain">Learn more about products</Button>
                </InlineStack>
              </Box>
            </BlockStack>
          </div>

          {selected && section === 'products' && (
            <div style={{ width: 400, flexShrink: 0 }}>
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">Product details</Text>
                    <InlineStack gap="200">
                      <Button tone="critical" onClick={handleDelete}>Delete</Button>
                      <Button variant="plain" onClick={closePanel}>Close</Button>
                    </InlineStack>
                  </InlineStack>
                  <Divider />

                  {images.length > 0 ? (
                    <BlockStack gap="200">
                      <div style={{ position: 'relative' }}>
                        <img
                          src={images[activeImage]}
                          alt=""
                          onClick={() => {
                            setLightboxIndex(activeImage);
                            setLightboxOpen(true);
                          }}
                          style={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid #e3e3e3',
                            cursor: 'zoom-in',
                            display: 'block',
                          }}
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: 20,
                            fontSize: '0.6875rem',
                          }}
                        >
                          {activeImage + 1}/{images.length}
                        </div>

                        {activeImage > 0 && (
                          <button
                            onClick={() => setActiveImage(activeImage - 1)}
                            style={{
                              position: 'absolute',
                              left: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.45)',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              cursor: 'pointer',
                              fontSize: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ‹
                          </button>
                        )}

                        {activeImage < images.length - 1 && (
                          <button
                            onClick={() => setActiveImage(activeImage + 1)}
                            style={{
                              position: 'absolute',
                              right: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.45)',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              cursor: 'pointer',
                              fontSize: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ›
                          </button>
                        )}
                      </div>

                      <InlineStack gap="200" wrap>
                        {images.slice(0, 6).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            onClick={() => setActiveImage(i)}
                            style={{
                              width: 44,
                              height: 44,
                              objectFit: 'cover',
                              borderRadius: 6,
                              cursor: 'pointer',
                              border: activeImage === i ? '2px solid #303030' : '1px solid #e3e3e3',
                              opacity: activeImage === i ? 1 : 0.6,
                            }}
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                        ))}

                        <div
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            width: 44,
                            height: 44,
                            border: '1px dashed #e3e3e3',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#616161',
                            fontSize: 18,
                          }}
                        >
                          +
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                      </InlineStack>
                    </BlockStack>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        height: 140,
                        border: '1px dashed #e3e3e3',
                        borderRadius: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#616161',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>+</div>
                      <Text as="p" variant="bodySm" tone="subdued">Upload images</Text>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    </div>
                  )}

                  <Card background="bg-surface-secondary">
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="0">
                        <Text as="p" variant="bodySm" tone="subdued">Source</Text>
                        <Button variant="plain" url={selected.source_url} external>
                          {selected.source_domain} ↗
                        </Button>
                      </BlockStack>
                      <BlockStack gap="0" inlineAlign="end">
                        <Text as="p" variant="bodySm" tone="subdued">Source price</Text>
                        <Text as="p" variant="headingMd" fontWeight="bold">
                          {sym(selected.currency)}{parseFloat(selected.source_price).toFixed(2)}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                  </Card>

                  <BlockStack gap="100">
                    <InlineStack align="space-between">
                      <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">TITLE</Text>
                      {!editing && <Button variant="plain" onClick={() => setEditing(true)}>Edit</Button>}
                    </InlineStack>
                    {editing ? (
                      <TextField value={editData.title} onChange={(v) => setEditData({ ...editData, title: v })} autoComplete="off" />
                    ) : (
                      <Text as="p" variant="bodyMd" fontWeight="semibold">{selected.title}</Text>
                    )}
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">DESCRIPTION</Text>
                    {editing ? (
                      <TextField
                        value={editData.description}
                        onChange={(v) => setEditData({ ...editData, description: v })}
                        multiline={4}
                        autoComplete="off"
                      />
                    ) : (
                      <Text as="p" variant="bodySm" tone="subdued">
                        {selected.description || 'No description. Click Edit to add one.'}
                      </Text>
                    )}
                  </BlockStack>

                  {editing && (
                    <InlineStack gap="200">
                      <Button
                        onClick={() => {
                          setEditing(false);
                          setEditData({
                            title: selected.title,
                            description: selected.description || '',
                            images: getImages(selected.images),
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleSave} loading={saving}>Save changes</Button>
                    </InlineStack>
                  )}

                  {Object.keys(groupedVariants).length > 0 && (
                    <>
                      <Divider />
                      <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">VARIANTS</Text>
                      {Object.entries(groupedVariants).map(([opt, vals]) => (
                        <BlockStack key={opt} gap="200">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">{opt}</Text>
                          <InlineStack gap="200" wrap>
                            {vals.map((val) => {
                              const isSel = selectedVariants[opt] === val;
                              const isColor = opt.toLowerCase().includes('color') || opt.toLowerCase().includes('colour');

                              return (
                                <button
                                  key={val}
                                  onClick={() => setSelectedVariants((p) => ({ ...p, [opt]: isSel ? null : val }))}
                                  style={{
                                    padding: isColor ? 0 : '4px 10px',
                                    width: isColor ? 24 : 'auto',
                                    height: isColor ? 24 : 'auto',
                                    borderRadius: isColor ? '50%' : 6,
                                    border: isSel ? '2px solid #303030' : '1px solid #e3e3e3',
                                    background: isColor ? val.toLowerCase() : isSel ? '#303030' : '#fff',
                                    color: isSel && !isColor ? '#fff' : '#303030',
                                    fontSize: '0.8125rem',
                                    cursor: 'pointer',
                                  }}
                                  title={val}
                                >
                                  {isColor ? '' : val}
                                </button>
                              );
                            })}
                          </InlineStack>
                        </BlockStack>
                      ))}
                    </>
                  )}

                  <Divider />
                  <Text as="h3" variant="headingMd">Set selling price</Text>

                  <TextField
                    label={`Selling price (${selected.currency})`}
                    type="number"
                    value={sellingPrice}
                    onChange={handlePriceChange}
                    placeholder={`Min ${sym(selected.currency)}${(parseFloat(selected.source_price) + 1).toFixed(2)}`}
                    autoComplete="off"
                  />

                  <TextField
                    label="Or profit margin (%)"
                    type="number"
                    value={profitMargin}
                    onChange={handleMarginChange}
                    placeholder="e.g. 30"
                    autoComplete="off"
                  />

                  {sellingPrice && parseFloat(sellingPrice) > parseFloat(selected.source_price) && (
                    <Card background="bg-surface-secondary">
                      <InlineGrid columns={3} gap="300">
                        {[
                          { label: 'You pay', val: `${sym(selected.currency)}${parseFloat(selected.source_price).toFixed(2)}` },
                          { label: 'Customer pays', val: `${sym(selected.currency)}${parseFloat(sellingPrice).toFixed(2)}` },
                          {
                            label: 'Profit',
                            val: `${sym(selected.currency)}${(sellingPrice - selected.source_price).toFixed(2)}`,
                            tone: 'success',
                          },
                        ].map((s, i) => (
                          <BlockStack key={i} gap="100" inlineAlign="center">
                            <Text as="p" variant="bodySm" tone="subdued">{s.label}</Text>
                            <Text as="p" variant="bodyMd" fontWeight="bold" tone={s.tone}>{s.val}</Text>
                          </BlockStack>
                        ))}
                      </InlineGrid>
                    </Card>
                  )}

                  {listMessage?.success && (
                    <Banner tone="success" onDismiss={() => setListMessage(null)}>{listMessage.success}</Banner>
                  )}
                  {listMessage?.error && (
                    <Banner tone="critical" onDismiss={() => setListMessage(null)}>{listMessage.error}</Banner>
                  )}

                  <Button
                    variant="primary"
                    tone="success"
                    onClick={handleSetPrice}
                    loading={listing}
                    disabled={!sellingPrice || parseFloat(sellingPrice) <= parseFloat(selected.source_price)}
                    fullWidth
                  >
                    {isListed(selected) ? 'Update listing' : 'Save listing'}
                  </Button>
                </BlockStack>
              </Card>
            </div>
          )}
        </div>
      </Page>
    </Layout>
  );
}