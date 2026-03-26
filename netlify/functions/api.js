const auth = require('./auth');
const {
  requireAdmin,
  listCategories,
  listProducts,
  getProductBySlug,
  createOrder,
  upsertProduct
} = require('./shop-store');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Content-Type': 'application/json'
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = (event.path || '/')
    .replace('/.netlify/functions/api', '')
    .replace('/api', '') || '/';

  try {
    if (path.startsWith('/auth')) {
      return auth.handler(event, context);
    }

    if (path === '/shop/categories' && event.httpMethod === 'GET') {
      const categories = await listCategories();
      return json(200, { categories });
    }

    if (path === '/shop/products' && event.httpMethod === 'GET') {
      const params = new URLSearchParams(
        event.rawQuery ||
        new URL(event.rawUrl || 'https://example.com').searchParams.toString() ||
        ''
      );
      const products = await listProducts({
        category: params.get('category') || null,
        search: params.get('search') || null,
        featured: params.get('featured') === 'true',
        limit: params.get('limit') ? Number(params.get('limit')) : null
      });
      return json(200, { products });
    }

    if (path.startsWith('/shop/products/') && event.httpMethod === 'GET') {
      const slug = path.split('/').pop();
      const product = await getProductBySlug(slug);
      if (!product) return json(404, { message: 'Product not found' });
      return json(200, { product });
    }

    if (path === '/shop/orders' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.customerName || !body.email || !body.phone || !Array.isArray(body.items) || body.items.length === 0) {
        return json(400, { message: 'Missing required order fields' });
      }

      const result = await createOrder({
        checkoutType: body.checkoutType === 'quote' ? 'quote' : 'manual',
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        companyName: body.companyName,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        notes: body.notes,
        items: body.items
      });

      return json(201, {
        message: body.checkoutType === 'quote' ? 'Quote request submitted' : 'Order placed successfully',
        ...result
      });
    }

    if (path === '/shop/admin/products' && event.httpMethod === 'POST') {
      if (!requireAdmin(event)) return json(401, { message: 'Unauthorized' });
      const body = JSON.parse(event.body || '{}');
      if (!body.slug || !body.name || !body.categorySlug) {
        return json(400, { message: 'Missing required product fields' });
      }

      const product = await upsertProduct(body);
      return json(200, { product, message: 'Product saved successfully' });
    }

    return json(404, { message: 'Not found' });
  } catch (error) {
    console.error('API error:', error);
    return json(500, { message: 'Server error', error: error.message });
  }
};
