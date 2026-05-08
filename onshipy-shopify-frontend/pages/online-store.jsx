import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Page, Card, BlockStack, InlineStack, Text, Button,
  Banner, TextField, Badge, Box, Divider,
} from '@shopify/polaris';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function OnlineStore() {
  const router = useRouter();
  const shop = router.query.shop || '';
  const [shopify, setShopify] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [shopInput, setShopInput] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const onPageShow = (e) => { if (e.persisted) setConnecting(false); };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setConnecting(false);

    const { shopify: sh, error: err } = router.query;

    if (sh === 'connected') {
      setSuccessMsg('Shopify connected successfully!');
      router.replace('/online-store', undefined, { shallow: true });
    } else if (err) {
      const msgs = {
        missing_params:        'Connection failed — missing parameters.',
        invalid_state:         'Connection failed — security check failed. Please try again.',
        invalid_hmac:          'Connection failed — invalid Shopify signature.',
        token_exchange_failed: 'Connection failed — could not get access token.',
        server_error:          'Server error. Please try again.',
      };
      setError(msgs[err] || 'Connection failed. Please try again.');
      router.replace('/online-store', undefined, { shallow: true });
    }

    fetchStatus();
  }, [router.isReady, router.query]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/shopify/status?shop=${shop}`);
      const data = await res.json();
      setShopify(data.connected ? data : false);
    } catch {
      setShopify(false);
    }
  };

  const handleConnect = async () => {
    if (!shopInput.trim()) { setError('Enter your Shopify store name.'); return; }
    setError('');
    setConnecting(true);
    try {
      const storeName = shopInput.trim().replace(/\.myshopify\.com$/, '');
      const res = await fetch(`${API_BASE}/api/shopify/install?shop=${encodeURIComponent(storeName)}`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start connection. Please try again.');
        setConnecting(false);
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Shopify store?')) return;
    setDisconnecting(true);
    try {
      await fetch(`${API_BASE}/api/shopify/disconnect?shop=${shop}`, { method: 'DELETE' });
      setShopify(false);
      setSuccessMsg('');
    } catch {
      setError('Failed to disconnect. Please try again.');
    }
    setDisconnecting(false);
  };

  return (
    <Layout title="Online Store">
      <Page
        title="Sales channels"
        subtitle="Connect your stores to automatically push products and fulfill orders."
      >
        <BlockStack gap="400">

          {successMsg && (
            <Banner tone="success" onDismiss={() => setSuccessMsg('')}>
              {successMsg}
            </Banner>
          )}

          {error && (
            <Banner tone="critical" onDismiss={() => setError('')}>
              {error}
            </Banner>
          )}

          {/* ── Shopify ── */}
          <Card>
            <InlineStack align="space-between" blockAlign="center" gap="400">
              <InlineStack gap="400" blockAlign="center">
                <img
                  src="/shopify-logo.png"
                  alt="Shopify"
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
                />
                <BlockStack gap="0">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Shopify</Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {shopify ? shopify.shop_name || shopify.shop : 'Push products and sync orders automatically'}
                  </Text>
                </BlockStack>
              </InlineStack>

              {shopify === null && (
                <Text as="p" variant="bodySm" tone="subdued">Checking…</Text>
              )}

              {shopify && (
                <InlineStack gap="300" blockAlign="center">
                  <Badge tone="success">Connected</Badge>
                  <Button
                    tone="critical"
                    onClick={handleDisconnect}
                    loading={disconnecting}
                  >
                    Disconnect
                  </Button>
                </InlineStack>
              )}

              {shopify === false && !showInput && (
                <Button
                  variant="primary"
                  onClick={() => setShowInput(true)}
                >
                  Connect Shopify
                </Button>
              )}

              {shopify === false && showInput && (
                <InlineStack gap="200" blockAlign="center">
                  <div style={{ display: 'flex', border: '1px solid #e3e3e3', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                    <input
                      autoFocus
                      type="text"
                      value={shopInput}
                      onChange={e => setShopInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleConnect();
                        if (e.key === 'Escape') { setShowInput(false); setShopInput(''); setError(''); }
                      }}
                      placeholder="yourstore"
                      style={{ width: 130, padding: '7px 10px', border: 'none', outline: 'none', fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif', color: '#303030', background: 'transparent' }}
                    />
                    <span style={{ padding: '7px 10px', background: '#f1f1f1', color: '#616161', fontSize: '0.8125rem', borderLeft: '1px solid #e3e3e3', whiteSpace: 'nowrap' }}>
                      .myshopify.com
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleConnect}
                    loading={connecting}
                    disabled={!shopInput.trim()}
                  >
                    Connect
                  </Button>
                  <Button onClick={() => { setShowInput(false); setShopInput(''); setError(''); }}>
                    Cancel
                  </Button>
                </InlineStack>
              )}
            </InlineStack>
          </Card>

          {/* ── WooCommerce (coming soon) ── */}
          <Card>
            <InlineStack align="space-between" blockAlign="center" gap="400">
              <InlineStack gap="400" blockAlign="center">
                <img
                  src="/woocommerce-logo.png"
                  alt="WooCommerce"
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
                />
                <BlockStack gap="0">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">WooCommerce</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Connect your WordPress + WooCommerce store</Text>
                </BlockStack>
              </InlineStack>
              <Badge>Coming soon</Badge>
            </InlineStack>
          </Card>

          {/* ── Etsy (coming soon) ── */}
          <Card>
            <InlineStack align="space-between" blockAlign="center" gap="400">
              <InlineStack gap="400" blockAlign="center">
                <img
                  src="/etsy-logo.png"
                  alt="Etsy"
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
                />
                <BlockStack gap="0">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Etsy</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Sell handmade and vintage products</Text>
                </BlockStack>
              </InlineStack>
              <Badge>Coming soon</Badge>
            </InlineStack>
          </Card>

          {/* ── Amazon (coming soon) ── */}
          <Card>
            <InlineStack align="space-between" blockAlign="center" gap="400">
              <InlineStack gap="400" blockAlign="center">
                <img
                  src="/amazon-logo.png"
                  alt="Amazon"
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
                />
                <BlockStack gap="0">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Amazon</Text>
                  <Text as="p" variant="bodySm" tone="subdued">List products on Amazon marketplace</Text>
                </BlockStack>
              </InlineStack>
              <Badge>Coming soon</Badge>
            </InlineStack>
          </Card>

          {/* ── Webhook ── */}
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="0">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Custom Webhook</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Connect any store or platform via webhook</Text>
                </BlockStack>
                <Button onClick={() => router.push('/settings')}>Configure</Button>
              </InlineStack>
            </BlockStack>
          </Card>

        </BlockStack>
      </Page>
    </Layout>
  );
}