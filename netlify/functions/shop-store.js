const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const FALLBACK_ADMIN_KEY = 'dala-admin-demo';

const seedCategories = [
  {
    slug: 'drinks-yoghurt',
    name: 'Drinks & Yoghurt',
    description: 'Shelf-ready beverage lines, yoghurt drinks, and breakfast-friendly liquid ranges.',
    heroImage: '/assets/catalog/2026/3.webp',
    accent: 'sunrise',
    sortOrder: 1
  },
  {
    slug: 'body-care-wellness',
    name: 'Body Care & Wellness',
    description: 'Body-care staples and wellness-led essentials presented as a polished retail collection.',
    heroImage: '/assets/catalog/2026/11.webp',
    accent: 'clay',
    sortOrder: 2
  },
  {
    slug: 'infant-child-care',
    name: 'Infant & Child Care',
    description: 'Early-life essentials arranged for clear, confident browsing.',
    heroImage: '/assets/catalog/2026/17.webp',
    accent: 'gold',
    sortOrder: 3
  },
  {
    slug: 'pantry-staples-flour',
    name: 'Pantry Staples & Flour',
    description: 'Daily pantry building blocks and flour-led essentials for modern trade shelves.',
    heroImage: '/assets/catalog/2026/20.webp',
    accent: 'sand',
    sortOrder: 4
  },
  {
    slug: 'snacks-confectionery',
    name: 'Snacks & Confectionery',
    description: 'Snackable, giftable, and impulse-buy products curated into one premium storefront lane.',
    heroImage: '/assets/catalog/2026/29.webp',
    accent: 'berry',
    sortOrder: 5
  },
  {
    slug: 'spices-condiments',
    name: 'Spices & Condiments',
    description: 'Kitchen flavor essentials, seasonings, and condiments with strong shelf presence.',
    heroImage: '/assets/catalog/2026/34.webp',
    accent: 'spice',
    sortOrder: 6
  },
  {
    slug: 'household-items',
    name: 'Household Items',
    description: 'Home-use staples collected into a clean, practical household range.',
    heroImage: '/assets/catalog/2026/39.webp',
    accent: 'forest',
    sortOrder: 7
  }
];

const seedProducts = [
  {
    slug: 'tropical-juice-assortment',
    name: 'Tropical Juice Assortment',
    categorySlug: 'drinks-yoghurt',
    shortDescription: 'A retail-ready beverage assortment for shelves that move quickly.',
    description: 'A curated drinks assortment designed for modern trade shelves, bringing together breakfast-friendly, family-friendly beverage options in a clean, premium retail presentation.',
    price: 8500,
    compareAtPrice: 9600,
    sku: 'DRINK-001',
    badge: 'Best Seller',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/3.webp',
    gallery: ['/assets/catalog/2026/3.webp', '/assets/catalog/2026/4.webp', '/assets/catalog/2026/5.webp'],
    sortOrder: 1
  },
  {
    slug: 'greek-yoghurt-drink-range',
    name: 'Greek Yoghurt Drink Range',
    categorySlug: 'drinks-yoghurt',
    shortDescription: 'A chilled-shelf yoghurt line packaged for premium retail display.',
    description: 'A yoghurt drink range built for clean retail presentation, clear family appeal, and strong repeat-purchase potential in modern grocery environments.',
    price: 11200,
    compareAtPrice: 12600,
    sku: 'DRINK-002',
    badge: 'New In',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/6.webp',
    gallery: ['/assets/catalog/2026/6.webp', '/assets/catalog/2026/7.webp', '/assets/catalog/2026/8.webp'],
    sortOrder: 2
  },
  {
    slug: 'family-breakfast-beverage-line',
    name: 'Family Breakfast Beverage Line',
    categorySlug: 'drinks-yoghurt',
    shortDescription: 'Breakfast-led beverages grouped into one strong shelf assortment.',
    description: 'A family-oriented beverage line arranged as an easy retail buy for supermarkets that want reliable breakfast-category shelf coverage.',
    price: 9900,
    compareAtPrice: 10800,
    sku: 'DRINK-003',
    badge: 'Featured',
    stockStatus: 'in_stock',
    featured: false,
    image: '/assets/catalog/2026/9.webp',
    gallery: ['/assets/catalog/2026/9.webp', '/assets/catalog/2026/10.webp'],
    sortOrder: 3
  },
  {
    slug: 'wellness-body-care-kit',
    name: 'Wellness Body Care Kit',
    categorySlug: 'body-care-wellness',
    shortDescription: 'Body-care essentials grouped into a clean retail-ready bundle.',
    description: 'A wellness-led personal care assortment designed to present well on shelf and cover everyday body-care needs in one polished collection.',
    price: 13200,
    compareAtPrice: 14500,
    sku: 'BODY-001',
    badge: 'Featured',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/11.webp',
    gallery: ['/assets/catalog/2026/11.webp', '/assets/catalog/2026/12.webp', '/assets/catalog/2026/13.webp'],
    sortOrder: 4
  },
  {
    slug: 'herbal-care-staples',
    name: 'Herbal Care Staples',
    categorySlug: 'body-care-wellness',
    shortDescription: 'A shelf-focused body and wellness range with calm premium presentation.',
    description: 'A curated personal care lineup designed for wellness-conscious shelves and easier category navigation in-store.',
    price: 11800,
    compareAtPrice: 12900,
    sku: 'BODY-002',
    badge: 'Popular',
    stockStatus: 'in_stock',
    featured: false,
    image: '/assets/catalog/2026/14.webp',
    gallery: ['/assets/catalog/2026/14.webp', '/assets/catalog/2026/15.webp', '/assets/catalog/2026/16.webp'],
    sortOrder: 5
  },
  {
    slug: 'infant-nutrition-essentials',
    name: 'Infant Nutrition Essentials',
    categorySlug: 'infant-child-care',
    shortDescription: 'A cleanly grouped infant-care assortment for trusted everyday retail.',
    description: 'An infant and child care range positioned for clarity, trust, and easy family-focused shelf browsing in premium supermarket settings.',
    price: 14750,
    compareAtPrice: 15900,
    sku: 'INFANT-001',
    badge: 'Trusted',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/17.webp',
    gallery: ['/assets/catalog/2026/17.webp', '/assets/catalog/2026/18.webp', '/assets/catalog/2026/19.webp'],
    sortOrder: 6
  },
  {
    slug: 'pantry-foundation-pack',
    name: 'Pantry Foundation Pack',
    categorySlug: 'pantry-staples-flour',
    shortDescription: 'Core pantry goods and flour-based essentials in one broad assortment.',
    description: 'A foundational pantry range created for supermarkets and household buyers who want strong everyday staples in one dependable retail collection.',
    price: 16500,
    compareAtPrice: 17800,
    sku: 'PANTRY-001',
    badge: 'Best Seller',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/20.webp',
    gallery: ['/assets/catalog/2026/20.webp', '/assets/catalog/2026/21.webp', '/assets/catalog/2026/22.webp'],
    sortOrder: 7
  },
  {
    slug: 'premium-flour-and-grains-selection',
    name: 'Premium Flour & Grains Selection',
    categorySlug: 'pantry-staples-flour',
    shortDescription: 'Pantry and grains assortment designed for wide household appeal.',
    description: 'A broad pantry selection that covers flour, grains, and everyday cooking needs in a shelf-friendly format.',
    price: 17400,
    compareAtPrice: 18950,
    sku: 'PANTRY-002',
    badge: 'Popular',
    stockStatus: 'in_stock',
    featured: false,
    image: '/assets/catalog/2026/23.webp',
    gallery: ['/assets/catalog/2026/23.webp', '/assets/catalog/2026/24.webp', '/assets/catalog/2026/25.webp'],
    sortOrder: 8
  },
  {
    slug: 'home-cooking-staples-range',
    name: 'Home Cooking Staples Range',
    categorySlug: 'pantry-staples-flour',
    shortDescription: 'Cooking staples gathered into one dependable everyday retail line.',
    description: 'A pantry assortment optimized for repeat household shopping and practical shelf organization in modern trade.',
    price: 15800,
    compareAtPrice: 16850,
    sku: 'PANTRY-003',
    badge: 'Featured',
    stockStatus: 'in_stock',
    featured: false,
    image: '/assets/catalog/2026/26.webp',
    gallery: ['/assets/catalog/2026/26.webp', '/assets/catalog/2026/27.webp', '/assets/catalog/2026/28.webp'],
    sortOrder: 9
  },
  {
    slug: 'snack-time-favorites',
    name: 'Snack Time Favorites',
    categorySlug: 'snacks-confectionery',
    shortDescription: 'A bright, shelf-ready snack assortment for impulse-friendly placement.',
    description: 'A snack-focused product collection built for front-of-store visibility, strong shelf appeal, and convenient grab-and-go buying.',
    price: 7200,
    compareAtPrice: 8100,
    sku: 'SNACK-001',
    badge: 'Top Rated',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/29.webp',
    gallery: ['/assets/catalog/2026/29.webp', '/assets/catalog/2026/30.webp', '/assets/catalog/2026/31.webp'],
    sortOrder: 10
  },
  {
    slug: 'confectionery-gift-selection',
    name: 'Confectionery Gift Selection',
    categorySlug: 'snacks-confectionery',
    shortDescription: 'A confectionery-led assortment with premium retail gifting appeal.',
    description: 'A polished confectionery selection created for festive shelves, premium snack browsing, and higher-margin retail presentation.',
    price: 9300,
    compareAtPrice: 10100,
    sku: 'SNACK-002',
    badge: 'Limited',
    stockStatus: 'low_stock',
    featured: false,
    image: '/assets/catalog/2026/32.webp',
    gallery: ['/assets/catalog/2026/32.webp', '/assets/catalog/2026/33.webp'],
    sortOrder: 11
  },
  {
    slug: 'signature-spice-collection',
    name: 'Signature Spice Collection',
    categorySlug: 'spices-condiments',
    shortDescription: 'Spices and condiments arranged as a clean kitchen essentials range.',
    description: 'A seasoning and condiment selection that gives the kitchen aisle a stronger premium offer with clear category grouping and attractive shelf presentation.',
    price: 8900,
    compareAtPrice: 9600,
    sku: 'SPICE-001',
    badge: 'Chef Pick',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/34.webp',
    gallery: ['/assets/catalog/2026/34.webp', '/assets/catalog/2026/35.webp', '/assets/catalog/2026/36.webp'],
    sortOrder: 12
  },
  {
    slug: 'kitchen-flavor-essentials',
    name: 'Kitchen Flavor Essentials',
    categorySlug: 'spices-condiments',
    shortDescription: 'Condiments and spice lines with strong pantry and kitchen relevance.',
    description: 'A category-led spice and condiment range designed for repeat purchase and everyday cooking use in premium supermarkets.',
    price: 8400,
    compareAtPrice: 9300,
    sku: 'SPICE-002',
    badge: 'Featured',
    stockStatus: 'in_stock',
    featured: false,
    image: '/assets/catalog/2026/37.webp',
    gallery: ['/assets/catalog/2026/37.webp', '/assets/catalog/2026/38.webp'],
    sortOrder: 13
  },
  {
    slug: 'household-care-range',
    name: 'Household Care Range',
    categorySlug: 'household-items',
    shortDescription: 'Home essentials presented as a neat, practical household collection.',
    description: 'A household assortment created for practical home care needs with clean packaging and strong shelf organization.',
    price: 12400,
    compareAtPrice: 13600,
    sku: 'HOUSE-001',
    badge: 'Home Pick',
    stockStatus: 'in_stock',
    featured: true,
    image: '/assets/catalog/2026/39.webp',
    gallery: ['/assets/catalog/2026/39.webp'],
    sortOrder: 14
  }
];

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

      const categoryCount = await sql`SELECT COUNT(*)::int AS count FROM shop_categories`;
      if (categoryCount[0].count === 0) {
        for (const category of seedCategories) {
          await sql`
            INSERT INTO shop_categories (slug, name, description, hero_image, accent, sort_order)
            VALUES (${category.slug}, ${category.name}, ${category.description}, ${category.heroImage}, ${category.accent}, ${category.sortOrder})
          `;
        }
      }

      const productCount = await sql`SELECT COUNT(*)::int AS count FROM shop_products`;
      if (productCount[0].count === 0) {
        for (const product of seedProducts) {
          await sql`
            INSERT INTO shop_products (
              slug, category_slug, name, short_description, description, price, compare_at_price,
              currency, sku, badge, stock_status, featured, image, gallery, sort_order
            ) VALUES (
              ${product.slug}, ${product.categorySlug}, ${product.name}, ${product.shortDescription},
              ${product.description}, ${product.price}, ${product.compareAtPrice}, 'NGN', ${product.sku},
              ${product.badge}, ${product.stockStatus}, ${product.featured}, ${product.image},
              ${JSON.stringify(product.gallery)}, ${product.sortOrder}
            )
          `;
        }
      }
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
