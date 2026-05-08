const db = require('../db/knex');
const { scrapeProduct } = require('../services/scraperService');
const { verifySessionToken } = require('../middleware/shopifyAuth');

module.exports = async function productsRoutes(fastify) {

  // ── Helper: get seller by shop domain ──
  const getSellerByShop = async (shop) => {
    const session = await db('shopify_sessions').where({ shop }).first();
    if (!session) return null;
    const seller = await db('sellers').where({ shopify_store_url: shop }).first();
    return seller;
  };

  // POST /api/products/import
  fastify.post('/import', { preHandler: verifySessionToken }, async (req, reply) => {
    const { url } = req.body;
    const shop = req.shopDomain;

    if (!url) return reply.status(400).send({ error: 'URL is required' });

    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    const seller_id = seller.id;

    const existing = await db('imported_products')
      .where({ seller_id, source_url: url }).first();
    if (existing) {
      return reply.status(409).send({ error: 'Already imported', product: existing });
    }

    const result = await scrapeProduct(url);
    if (!result.success) {
      return reply.status(422).send({ error: result.error || 'Could not scrape product' });
    }

    const [saved] = await db('imported_products').insert({
      seller_id,
      source_url: result.product.source_url,
      source_domain: result.product.source_domain,
      title: result.product.title,
      description: result.product.description,
      source_price: result.product.source_price,
      currency: result.product.currency,
      images: JSON.stringify(result.product.images),
      variants: JSON.stringify(result.product.variants),
      scrape_status: 'completed'
    }).returning('*');

    return reply.status(201).send({ success: true, product: saved });
  });

  // GET /api/products
  fastify.get('/', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    const products = await db('imported_products')
      .where({ seller_id: seller.id })
      .orderBy('created_at', 'desc');
    return reply.send({ products });
  });

  // GET /api/products/listings/all
  fastify.get('/listings/all', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    const listings = await db('product_listings')
      .join('imported_products', 'product_listings.imported_product_id', 'imported_products.id')
      .where('product_listings.seller_id', seller.id)
      .select(
        'product_listings.*',
        'imported_products.source_url',
        'imported_products.source_domain',
        'imported_products.images',
        'imported_products.currency',
        'imported_products.title as original_title'
      )
      .orderBy('product_listings.created_at', 'desc');
    return reply.send({ listings });
  });

  // GET /api/products/:id
  fastify.get('/:id', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    const product = await db('imported_products')
      .where({ id, seller_id: seller.id }).first();
    if (!product) return reply.status(404).send({ error: 'Not found' });
    return reply.send({ product });
  });

  // PATCH /api/products/:id
  fastify.patch('/:id', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const { title, description, images } = req.body;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    try {
      const updateData = { updated_at: new Date() };
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (images !== undefined) updateData.images = typeof images === 'string' ? images : JSON.stringify(images);

      const [updated] = await db('imported_products')
        .where({ id, seller_id: seller.id })
        .update(updateData)
        .returning('*');

      if (!updated) return reply.status(404).send({ error: 'Product not found' });
      return reply.send({ product: updated });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // DELETE /api/products/:id
  fastify.delete('/:id', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    try {
      await db('product_listings')
        .where({ imported_product_id: id, seller_id: seller.id })
        .delete();

      const deleted = await db('imported_products')
        .where({ id, seller_id: seller.id })
        .delete();

      if (!deleted) return reply.status(404).send({ error: 'Product not found' });
      return reply.send({ success: true, message: 'Product deleted' });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/products/:id/list
  fastify.post('/:id/list', { preHandler: verifySessionToken }, async (req, reply) => {
    const shop = req.shopDomain;
    const { id } = req.params;
    const { selling_price, custom_title } = req.body;
    const seller = await getSellerByShop(shop);
    if (!seller) return reply.status(404).send({ error: 'Shop not found' });

    if (!selling_price) return reply.status(400).send({ error: 'Selling price required' });

    const product = await db('imported_products')
      .where({ id, seller_id: seller.id }).first();
    if (!product) return reply.status(404).send({ error: 'Product not found' });

    if (selling_price <= product.source_price) {
      return reply.status(400).send({
        error: `Selling price must be above ${product.source_price}`
      });
    }

    const existingListing = await db('product_listings')
      .where({ seller_id: seller.id, imported_product_id: id }).first();

    const listingData = {
      selling_price,
      custom_title: custom_title || product.title,
      source_price_at_listing: product.source_price,
      status: 'active'
    };

    let listing;
    if (existingListing) {
      [listing] = await db('product_listings')
        .where({ id: existingListing.id })
        .update(listingData).returning('*');
    } else {
      [listing] = await db('product_listings').insert({
        seller_id: seller.id,
        imported_product_id: id,
        ...listingData
      }).returning('*');
    }

    const profit = (selling_price - product.source_price).toFixed(2);
    const margin = ((profit / selling_price) * 100).toFixed(2);

    return reply.status(201).send({
      message: 'Listed successfully',
      listing,
      profit_per_sale: profit,
      margin_percent: margin
    });
  });
};