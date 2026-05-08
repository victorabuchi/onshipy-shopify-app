require('dotenv').config();
const fastify = require('fastify')({
  logger: true,
  bodyLimit: 10485760
});

fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
  req.rawBody = body;
  try { done(null, JSON.parse(body)); }
  catch (err) { err.statusCode = 400; done(err, undefined); }
});

fastify.register(require('@fastify/cors'), {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token'],
  credentials: true
});
fastify.register(require('@fastify/helmet'), { contentSecurityPolicy: false });
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'onshipy_shopify_secret'
});

// Routes
fastify.register(require('./routes/shopify'),  { prefix: '/api/shopify' });
fastify.register(require('./routes/products'), { prefix: '/api/products' });
fastify.register(require('./routes/orders'),   { prefix: '/api/orders' });
fastify.register(require('./routes/auth'),     { prefix: '/api/auth' });

fastify.get('/health', async () => ({
  status: 'ok',
  app: 'Onshipy Shopify App',
  version: '1.0.0',
  port: process.env.PORT || 4000
}));

fastify.setErrorHandler((error, req, reply) => {
  console.error('Error:', error.message);
  reply.status(error.statusCode || 500).send({ error: error.message });
});

const start = async () => {
  try {
    await fastify.listen({ 
      port: parseInt(process.env.PORT) || 4000, 
      host: '0.0.0.0' 
    });
    console.log(`Onshipy Shopify App backend running on port ${process.env.PORT || 4000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();