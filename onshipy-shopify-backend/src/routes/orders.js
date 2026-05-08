const db = require('../db/knex');
const { verifySessionToken } = require('../middleware/shopifyAuth');

module.exports = async function ordersRoutes(fastify) {

  // ── Helper: get seller by shop domain ──
  const getSellerByShop = async (shop) => {
    const seller = await db('sellers').where({ shopify_store_url: shop }).first();
    return seller;
  };

  // GET /api/orders
  fastify.get('/', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    try {
      const orders = await db('customer_orders')
        .where({ seller_id: seller.id })
        .orderBy('created_at', 'desc');
      return reply.send({ orders });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/orders/:id
  fastify.get('/:id', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    try {
      const order = await db('customer_orders')
        .where({ id, seller_id: seller.id }).first();
      if (!order) return reply.status(404).send({ error: 'Not found' });
      return reply.send({ order });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/orders/:id/status
  fastify.get('/:id/status', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    try {
      const order = await db('customer_orders')
        .where({ id, seller_id: seller.id }).first();
      if (!order) return reply.status(404).send({ error: 'Not found' });

      const job = await db('auto_buy_jobs')
        .where({ customer_order_id: id })
        .orderBy('created_at', 'desc')
        .first();

      const shipment = job ? await db('shipments')
        .where({ auto_buy_job_id: job.id }).first() : null;

      return reply.send({ order, job, shipment });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // PATCH /api/orders/:id/status
  fastify.patch('/:id/status', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const { status } = req.body;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return reply.status(400).send({ error: 'Invalid status' });
    }

    try {
      const [updated] = await db('customer_orders')
        .where({ id, seller_id: seller.id })
        .update({ status })
        .returning('*');
      if (!updated) return reply.status(404).send({ error: 'Order not found' });
      return reply.send({ order: updated });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};