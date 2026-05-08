require('dotenv').config();
const db = require('../db/knex');
const crypto = require('crypto');
const https = require('https');
const { verifyShopifyHmac } = require('../middleware/shopifyAuth');

module.exports = async function shopifyRoutes(fastify) {

  const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
  const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4001';
  const SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders,read_inventory,read_customers';

  // ── Helper: HTTPS request to Shopify ──
  const shopifyRequest = (hostname, path, method = 'GET', token = null, body = null) => {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['X-Shopify-Access-Token'] = token;
      const bodyStr = body ? JSON.stringify(body) : null;
      if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

      const req = https.request({ hostname, path, method, headers }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  };

  // ── GET /api/shopify/install?shop=xxx.myshopify.com ──
  // Entry point — merchant clicks "Install" on App Store
  fastify.get('/install', async (req, reply) => {
    const { shop } = req.query;
    if (!shop) return reply.status(400).send({ error: 'shop parameter required' });

    let shopDomain = shop.trim().toLowerCase()
      .replace('https://', '').replace('http://', '').replace(/\/$/, '');
    if (!shopDomain.includes('.myshopify.com')) {
      shopDomain = shopDomain + '.myshopify.com';
    }

    // Generate nonce for CSRF protection
    const nonce = crypto.randomBytes(16).toString('hex');

    // Store nonce temporarily
    await db('shopify_oauth_nonces').insert({
      nonce,
      shop: shopDomain,
      created_at: new Date()
    }).onConflict('shop').merge();

    const redirectUri = `${BACKEND_URL}/api/shopify/callback`;
    const authUrl = `https://${shopDomain}/admin/oauth/authorize` +
      `?client_id=${SHOPIFY_CLIENT_ID}` +
      `&scope=${SCOPES}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${nonce}`;

    return reply.redirect(authUrl);
  });

  // ── GET /api/shopify/callback ──
  // Shopify redirects here after merchant approves
  fastify.get('/callback', async (req, reply) => {
    const { code, shop, state, hmac } = req.query;

    if (!code || !shop || !state) {
      return reply.redirect(`${FRONTEND_URL}?error=missing_params`);
    }

    try {
      // Verify HMAC
      if (!verifyShopifyHmac(req.query)) {
        return reply.redirect(`${FRONTEND_URL}?error=invalid_hmac`);
      }

      // Verify nonce
      const nonceRecord = await db('shopify_oauth_nonces')
        .where({ nonce: state, shop })
        .first();
      if (!nonceRecord) {
        return reply.redirect(`${FRONTEND_URL}?error=invalid_state`);
      }

      // Exchange code for access token
      const tokenRes = await shopifyRequest(shop, '/admin/oauth/access_token', 'POST', null, {
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code
      });

      if (!tokenRes.body.access_token) {
        return reply.redirect(`${FRONTEND_URL}?error=token_exchange_failed`);
      }

      const accessToken = tokenRes.body.access_token;

      // Get shop info
      const shopRes = await shopifyRequest(
        shop,
        '/admin/api/2024-01/shop.json',
        'GET',
        accessToken
      );
      const shopData = shopRes.body?.shop;

      // Save or update shop in DB
      const existing = await db('shopify_sessions').where({ shop }).first();

      if (existing) {
        await db('shopify_sessions').where({ shop }).update({
          access_token: accessToken,
          shop_name: shopData?.name || shop,
          email: shopData?.email || null,
          updated_at: new Date()
        });
      } else {
        await db('shopify_sessions').insert({
          shop,
          access_token: accessToken,
          shop_name: shopData?.name || shop,
          email: shopData?.email || null,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // Clean up nonce
      await db('shopify_oauth_nonces').where({ nonce: state }).delete();

      // Redirect into embedded app
      const embeddedUrl = `https://${shop}/admin/apps/${SHOPIFY_CLIENT_ID}`;
      return reply.redirect(embeddedUrl);

    } catch (err) {
      console.error('Shopify callback error:', err.message);
      return reply.redirect(`${FRONTEND_URL}?error=server_error`);
    }
  });

  // ── GET /api/shopify/session?shop=xxx ──
  // Frontend calls this to get shop session
  fastify.get('/session', async (req, reply) => {
    const { shop } = req.query;
    if (!shop) return reply.status(400).send({ error: 'shop required' });

    try {
      const session = await db('shopify_sessions').where({ shop }).first();
      if (!session) return reply.status(404).send({ error: 'Shop not installed' });

      return reply.send({
        shop: session.shop,
        shop_name: session.shop_name,
        email: session.email,
        installed_at: session.created_at
      });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // ── GET /api/shopify/status?shop=xxx ──
  fastify.get('/status', async (req, reply) => {
    const { shop } = req.query;
    if (!shop) return reply.status(400).send({ connected: false });

    try {
      const session = await db('shopify_sessions').where({ shop }).first();
      return reply.send({ connected: !!session, shop_name: session?.shop_name });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

};