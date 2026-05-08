const crypto = require('crypto');

const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

// Verify HMAC signature from Shopify
const verifyShopifyHmac = (query) => {
  const { hmac, signature, ...params } = query;
  const message = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  const digest = crypto
    .createHmac('sha256', SHOPIFY_CLIENT_SECRET)
    .update(message)
    .digest('hex');
  return digest === hmac;
};

// Verify Shopify session token (App Bridge)
const verifySessionToken = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing session token' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Decode JWT (Shopify signs with client secret)
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64 || !signature) {
      return reply.status(401).send({ error: 'Invalid token format' });
    }

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', SHOPIFY_CLIENT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (expectedSig !== signature) {
      return reply.status(401).send({ error: 'Invalid token signature' });
    }

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return reply.status(401).send({ error: 'Token expired' });
    }

    // Attach shop info to request
    req.shopDomain = payload.dest?.replace('https://', '');
    req.shopifyPayload = payload;

  } catch (err) {
    return reply.status(401).send({ error: 'Token verification failed' });
  }
};

module.exports = { verifyShopifyHmac, verifySessionToken };