const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const FALLBACK_ADMIN_KEY = 'dala-admin-demo';
const seedPayload = require('../../data/shop-seed.json');
const seedCategories = seedPayload.categories || [];
const seedProducts = seedPayload.products || [];

const fallbackStore = {
  initialized: false,
  categories: [],
  products: [],
  orders: []
};

let schemaReadyPromise;

function getSqlClient() {
  const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

function safeParseJson(value, fallback) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function mapCategory(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    heroImage: row.hero_image,
    accent: row.accent,
    sortOrder: row.sort_order
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : null,
    currency: row.currency,
    sku: row.sku,
    badge: row.badge,
    stockStatus: row.stock_status,
    featured: Boolean(row.featured),
    image: row.image,
    gallery: safeParseJson(row.gallery, []),
    sortOrder: row.sort_order
  };
}

function ensureFallbackSeeded() {
  if (fallbackStore.initialized) return;
  fallbackStore.categories = seedCategories.map((category, index) => ({
    id: index + 1,
    ...category
  }));
  fallbackStore.products = seedProducts.map((product, index) => ({
    id: index + 1,
    ...product
  }));
  fallbackStore.initialized = true;
}

async function syncSeedData(sql) {
  for (const category of seedCategories) {
    await sql`
      INSERT INTO shop_categories (slug, name, description, hero_image, accent, sort_order)
      VALUES (${category.slug}, ${category.name}, ${category.description}, ${category.heroImage}, ${category.accent}, ${category.sortOrder})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        hero_image = EXCLUDED.hero_image,
        accent = EXCLUDED.accent,
        sort_order = EXCLUDED.sort_order
    `;
  }

  for (const product of seedProducts) {
    await sql`
      INSERT INTO shop_products (
        slug, category_slug, name, short_description, description, price, compare_at_price,
        currency, sku, badge, stock_status, featured, image, gallery, sort_order, updated_at
      ) VALUES (
        ${product.slug}, ${product.categorySlug}, ${product.name}, ${product.shortDescription},
        ${product.description}, ${product.price}, ${product.compareAtPrice || null}, ${product.currency || 'NGN'},
        ${product.sku || null}, ${product.badge || null}, ${product.stockStatus || 'in_stock'},
        ${Boolean(product.featured)}, ${product.image || null}, ${JSON.stringify(product.gallery || [])},
        ${product.sortOrder || 0}, NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        category_slug = EXCLUDED.category_slug,
        name = EXCLUDED.name,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        compare_at_price = EXCLUDED.compare_at_price,
        currency = EXCLUDED.currency,
        sku = EXCLUDED.sku,
        badge = EXCLUDED.badge,
        stock_status = EXCLUDED.stock_status,
        featured = EXCLUDED.featured,
        image = EXCLUDED.image,
        gallery = EXCLUDED.gallery,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `;
  }

  const categorySlugs = seedCategories.map((item) => item.slug);
  const productSlugs = seedProducts.map((item) => item.slug);

  if (productSlugs.length) {
    await sql`DELETE FROM shop_products WHERE NOT (slug = ANY(${productSlugs}))`;
  }

  if (categorySlugs.length) {
    await sql`DELETE FROM shop_categories WHERE NOT (slug = ANY(${categorySlugs}))`;
  }
}

async function ensureSchema() {
  const sql = getSqlClient();
  if (!sql) {
    ensureFallbackSeeded();
    return 'fallback';
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS shop_categories (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          hero_image TEXT,
          accent TEXT,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS shop_products (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          category_slug TEXT NOT NULL REFERENCES shop_categories(slug) ON DELETE CASCADE,
          name TEXT NOT NULL,
          short_description TEXT,
          description TEXT,
          price NUMERIC(12,2) NOT NULL DEFAULT 0,
          compare_at_price NUMERIC(12,2),
          currency TEXT NOT NULL DEFAULT 'NGN',
          sku TEXT,
          badge TEXT,
          stock_status TEXT NOT NULL DEFAULT 'in_stock',
          featured BOOLEAN NOT NULL DEFAULT FALSE,
          image TEXT,
          gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS shop_orders (
          id SERIAL PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          checkout_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          customer_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company_name TEXT,
          address_line_1 TEXT,
          address_line_2 TEXT,
          city TEXT,
          state TEXT,
          notes TEXT,
          subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'NGN',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS shop_order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES shop_products(id) ON DELETE SET NULL,
          product_name TEXT NOT NULL,
          product_slug TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
          image TEXT
        )
      `;

      await syncSeedData(sql);
    })();
  }

  await schemaReadyPromise;
  return 'neon';
}

async function listCategories() {
  const mode = await ensureSchema();
  if (mode === 'fallback') return fallbackStore.categories;

  const sql = getSqlClient();
  const rows = await sql`SELECT * FROM shop_categories ORDER BY sort_order, name`;
  return rows.map(mapCategory);
}

async function listProducts({ category, search, featured, limit } = {}) {
  const mode = await ensureSchema();
  if (mode === 'fallback') {
    const categoriesBySlug = new Map(fallbackStore.categories.map((item) => [item.slug, item.name]));
    let items = [...fallbackStore.products];
    if (category) items = items.filter((item) => item.categorySlug === category);
    if (search) {
      const query = search.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query)
      );
    }
    if (featured) items = items.filter((item) => item.featured);
    if (limit) items = items.slice(0, limit);
    return items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ ...item, categoryName: categoriesBySlug.get(item.categorySlug) || 'Collection' }));
  }

  const sql = getSqlClient();
  const categories = await listCategories();
  const categoriesBySlug = new Map(categories.map((item) => [item.slug, item.name]));
  const rows = await sql`SELECT * FROM shop_products ORDER BY featured DESC, sort_order, name`;
  let items = rows.map(mapProduct);
  if (category) items = items.filter((item) => item.categorySlug === category);
  if (search) {
    const query = search.toLowerCase();
    items = items.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.shortDescription.toLowerCase().includes(query)
    );
  }
  if (featured) items = items.filter((item) => item.featured);
  if (limit) items = items.slice(0, limit);
  return items.map((item) => ({ ...item, categoryName: categoriesBySlug.get(item.categorySlug) || 'Collection' }));
}

async function getProductBySlug(slug) {
  const mode = await ensureSchema();
  if (mode === 'fallback') {
    const item = fallbackStore.products.find((product) => product.slug === slug) || null;
    if (!item) return null;
    const category = fallbackStore.categories.find((entry) => entry.slug === item.categorySlug);
    return { ...item, categoryName: category?.name || 'Collection' };
  }

  const sql = getSqlClient();
  const rows = await sql`SELECT * FROM shop_products WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return null;
  const product = mapProduct(rows[0]);
  const categories = await listCategories();
  const category = categories.find((entry) => entry.slug === product.categorySlug);
  return { ...product, categoryName: category?.name || 'Collection' };
}

function generateOrderNumber(prefix) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const token = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${stamp}-${token}`;
}

async function createOrder(payload) {
  const mode = await ensureSchema();
  const orderNumber = generateOrderNumber(payload.checkoutType === 'quote' ? 'QTE' : 'ORD');
  const subtotal = payload.items.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity)), 0);

  if (mode === 'fallback') {
    const order = {
      id: fallbackStore.orders.length + 1,
      orderNumber,
      status: 'pending',
      subtotal,
      currency: 'NGN',
      ...payload
    };
    fallbackStore.orders.push(order);
    return { orderNumber, status: 'pending' };
  }

  const sql = getSqlClient();
  const orderRows = await sql`
    INSERT INTO shop_orders (
      order_number, checkout_type, status, customer_name, email, phone, company_name,
      address_line_1, address_line_2, city, state, notes, subtotal, currency
    ) VALUES (
      ${orderNumber}, ${payload.checkoutType}, 'pending', ${payload.customerName}, ${payload.email},
      ${payload.phone}, ${payload.companyName || null}, ${payload.addressLine1 || null},
      ${payload.addressLine2 || null}, ${payload.city || null}, ${payload.state || null},
      ${payload.notes || null}, ${subtotal}, 'NGN'
    )
    RETURNING id
  `;

  const orderId = orderRows[0].id;
  for (const item of payload.items) {
    await sql`
      INSERT INTO shop_order_items (order_id, product_id, product_name, product_slug, quantity, unit_price, image)
      VALUES (
        ${orderId},
        ${item.productId || null},
        ${item.productName},
        ${item.productSlug || null},
        ${item.quantity},
        ${item.unitPrice},
        ${item.image || null}
      )
    `;
  }

  return { orderNumber, status: 'pending' };
}

function requireAdmin(event) {
  const provided = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  const expected = process.env.SHOP_ADMIN_KEY || FALLBACK_ADMIN_KEY;
  return provided && provided === expected;
}

async function upsertProduct(payload) {
  const mode = await ensureSchema();
  if (mode === 'fallback') {
    const existing = fallbackStore.products.find((item) => item.slug === payload.slug);
    if (existing) {
      Object.assign(existing, payload);
      return existing;
    }
    const created = {
      id: fallbackStore.products.length + 1,
      featured: false,
      stockStatus: 'in_stock',
      gallery: [],
      ...payload
    };
    fallbackStore.products.push(created);
    return created;
  }

  const sql = getSqlClient();
  await sql`
    INSERT INTO shop_products (
      slug, category_slug, name, short_description, description, price, compare_at_price, currency,
      sku, badge, stock_status, featured, image, gallery, sort_order, updated_at
    ) VALUES (
      ${payload.slug}, ${payload.categorySlug}, ${payload.name}, ${payload.shortDescription},
      ${payload.description}, ${payload.price}, ${payload.compareAtPrice || null}, ${payload.currency || 'NGN'},
      ${payload.sku || null}, ${payload.badge || null}, ${payload.stockStatus || 'in_stock'},
      ${Boolean(payload.featured)}, ${payload.image || null}, ${JSON.stringify(payload.gallery || [])},
      ${payload.sortOrder || 0}, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      category_slug = EXCLUDED.category_slug,
      name = EXCLUDED.name,
      short_description = EXCLUDED.short_description,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      compare_at_price = EXCLUDED.compare_at_price,
      currency = EXCLUDED.currency,
      sku = EXCLUDED.sku,
      badge = EXCLUDED.badge,
      stock_status = EXCLUDED.stock_status,
      featured = EXCLUDED.featured,
      image = EXCLUDED.image,
      gallery = EXCLUDED.gallery,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW()
  `;

  return getProductBySlug(payload.slug);
}

module.exports = {
  requireAdmin,
  listCategories,
  listProducts,
  getProductBySlug,
  createOrder,
  upsertProduct,
  ensureSchema
};
