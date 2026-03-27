(function () {
  const apiBase = '/api/store';
  const cartKey = 'dala-store-cart';
  const storeRoot = '/store';
  let toastTimer;

  function currency(value) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  async function api(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || 'Something went wrong');
    }
    return payload;
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function route(path = '') {
    return `${storeRoot}${path}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toast(message) {
    let node = document.querySelector('.store-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'store-toast';
      document.body.appendChild(node);
    }

    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('is-visible'), 2200);
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(cartKey, JSON.stringify(items));
    renderCartCount();
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  function subtotal(items) {
    return items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
  }

  function renderCartCount() {
    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = cartCount();
    });
  }

  function categoryIcon(slug) {
    const icons = {
      'drinks-yoghurt': 'fa-glass-water',
      'body-care-wellness': 'fa-heart-pulse',
      'infant-child-care': 'fa-baby',
      'pantry-staples-flour': 'fa-basket-shopping',
      'snacks-confectionery': 'fa-cookie-bite',
      'spices-condiments': 'fa-pepper-hot',
      'household-items': 'fa-house'
    };
    return icons[slug] || 'fa-box-open';
  }

  function categoryTone(slug) {
    const tones = {
      'drinks-yoghurt': 'sunrise',
      'body-care-wellness': 'clay',
      'infant-child-care': 'gold',
      'pantry-staples-flour': 'sand',
      'snacks-confectionery': 'berry',
      'spices-condiments': 'spice',
      'household-items': 'forest'
    };
    return tones[slug] || 'neutral';
  }

  function groupByCategory(products) {
    return products.reduce((map, product) => {
      if (!map[product.categorySlug]) map[product.categorySlug] = [];
      map[product.categorySlug].push(product);
      return map;
    }, {});
  }

  function placeholderMarkup(label, slug, large = false) {
    return `
      <div class="store-placeholder store-placeholder--${categoryTone(slug)} ${large ? 'store-placeholder--large' : ''}">
        <div class="store-placeholder__badge">
          <i class="fas ${categoryIcon(slug)}"></i>
        </div>
        <strong>${escapeHtml(label)}</strong>
      </div>
    `;
  }

  function addToCart(product, quantity = 1) {
    const items = getCart();
    const existing = items.find((item) => item.productSlug === product.slug);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        unitPrice: Number(product.price),
        categorySlug: product.categorySlug,
        quantity
      });
    }

    setCart(items);
    toast(`${product.name} added to cart`);
  }

  function updateQuantity(slug, delta) {
    const next = getCart()
      .map((item) => item.productSlug === slug
        ? { ...item, quantity: Math.max(0, Number(item.quantity) + delta) }
        : item)
      .filter((item) => item.quantity > 0);

    setCart(next);
    return next;
  }

  function removeFromCart(slug) {
    const next = getCart().filter((item) => item.productSlug !== slug);
    setCart(next);
    return next;
  }

  function sidebarMarkup(categories, groupedProducts, activeSlug = '') {
    return categories.map((category) => {
      const count = (groupedProducts[category.slug] || []).length;
      return `
        <a class="store-rail-link ${category.slug === activeSlug ? 'is-active' : ''}" href="${route(`/category.html?slug=${category.slug}`)}">
          <span class="store-rail-link__icon"><i class="fas ${categoryIcon(category.slug)}"></i></span>
          <span class="store-rail-link__copy">
            <strong>${escapeHtml(category.name)}</strong>
            <small>${count} product${count === 1 ? '' : 's'}</small>
          </span>
        </a>
      `;
    }).join('');
  }

  function collectionChip(category, activeSlug = '') {
    return `
      <a class="store-chip ${category.slug === activeSlug ? 'is-active' : ''}" href="${route(`/category.html?slug=${category.slug}`)}">
        <i class="fas ${categoryIcon(category.slug)}"></i>
        <span>${escapeHtml(category.name)}</span>
      </a>
    `;
  }

  function categoryCard(category, products) {
    const count = products.length;
    return `
      <article class="store-card store-card--collection">
        <a class="store-card__media" href="${route(`/category.html?slug=${category.slug}`)}">
          ${placeholderMarkup(category.name, category.slug, true)}
          <span class="store-card__count">${count} product${count === 1 ? '' : 's'}</span>
        </a>
        <div class="store-card__body">
          <div>
            <h3>${escapeHtml(category.name)}</h3>
            <p>${escapeHtml(category.description || '')}</p>
          </div>
          <div class="store-card__footer">
            <span class="store-meta-pill">Store Collection</span>
            <a class="store-btn store-btn-secondary" href="${route(`/category.html?slug=${category.slug}`)}">Browse</a>
          </div>
        </div>
      </article>
    `;
  }

  function productCard(product) {
    return `
      <article class="store-card store-card--product">
        <a class="store-card__media" href="${route(`/product.html?slug=${product.slug}`)}">
          ${placeholderMarkup(product.name, product.categorySlug)}
          <span class="store-card__badge">${escapeHtml(product.badge || 'DALA Pick')}</span>
        </a>
        <div class="store-card__body">
          <div class="store-card__meta">
            <span class="store-meta-pill">${product.stockStatus === 'low_stock' ? 'Low Stock' : 'In Stock'}</span>
            <span class="store-meta-pill">${escapeHtml(product.categoryName || 'Collection')}</span>
          </div>
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.shortDescription || '')}</p>
          </div>
          <div class="store-card__footer store-card__footer--product">
            <div class="store-price-block">
              <strong>${currency(product.price)}</strong>
              ${product.compareAtPrice ? `<span>${currency(product.compareAtPrice)}</span>` : ''}
            </div>
            <div class="store-card__actions">
              <a class="store-link-btn" href="${route(`/product.html?slug=${product.slug}`)}">Details</a>
              <button class="store-btn store-btn-dark" data-add-to-cart='${JSON.stringify({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                categorySlug: product.categorySlug
              }).replace(/'/g, '&#39;')}'>Add</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function bindAddToCart(scope = document) {
    scope.querySelectorAll('[data-add-to-cart]').forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const product = JSON.parse(button.dataset.addToCart);
        addToCart(product, 1);
      });
    });
  }

  function renderSidebar(categories, groupedProducts, activeSlug = '') {
    document.querySelectorAll('[data-store-sidebar]').forEach((node) => {
      node.innerHTML = sidebarMarkup(categories, groupedProducts, activeSlug);
    });
  }

  function renderChips(categories, activeSlug = '') {
    document.querySelectorAll('[data-collection-tabs], [data-category-tabs]').forEach((node) => {
      node.innerHTML = categories.map((category) => collectionChip(category, activeSlug)).join('');
    });
  }

  function sortProducts(products, mode) {
    const next = [...products];
    if (mode === 'price-asc') next.sort((a, b) => a.price - b.price);
    if (mode === 'price-desc') next.sort((a, b) => b.price - a.price);
    if (mode === 'name-asc') next.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return next;
  }

  async function initHome() {
    const [categoryResult, featuredResult, allProductsResult] = await Promise.all([
      api('/categories'),
      api('/products?featured=true&limit=10'),
      api('/products?limit=80')
    ]);

    const grouped = groupByCategory(allProductsResult.products);
    const categoryGrid = document.querySelector('[data-category-grid]');
    const featuredGrid = document.querySelector('[data-featured-products]');
    const resultsTitle = document.querySelector('[data-store-results-title]');
    const form = document.querySelector('[data-store-search]');
    const input = document.querySelector('[data-store-query]');

    renderSidebar(categoryResult.categories, grouped);
    renderChips(categoryResult.categories);

    if (categoryGrid) {
      categoryGrid.innerHTML = categoryResult.categories
        .map((category) => categoryCard(category, grouped[category.slug] || []))
        .join('');
    }

    const renderFeatured = (query = '') => {
      const term = query.trim().toLowerCase();
      const results = term
        ? allProductsResult.products.filter((product) =>
            `${product.name} ${product.shortDescription} ${product.categoryName}`.toLowerCase().includes(term))
        : featuredResult.products;

      if (resultsTitle) {
        resultsTitle.textContent = term ? `Results for "${query.trim()}"` : 'Featured products';
      }

      if (featuredGrid) {
        featuredGrid.innerHTML = results.length
          ? results.slice(0, 12).map(productCard).join('')
          : '<div class="store-empty">No matching products yet. Try another keyword or open a collection.</div>';
        bindAddToCart(featuredGrid);
      }
    };

    renderFeatured();

    if (form && input) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        renderFeatured(input.value);
      });
      input.addEventListener('input', () => {
        if (!input.value.trim()) renderFeatured('');
      });
    }
  }

  async function initCategory() {
    const slug = qs('slug');
    const [categoryResult, allProductsResult] = await Promise.all([
      api('/categories'),
      api('/products?limit=80')
    ]);

    const grouped = groupByCategory(allProductsResult.products);
    const category = categoryResult.categories.find((item) => item.slug === slug) || categoryResult.categories[0];
    let products = grouped[category.slug] || [];

    const titleNodes = document.querySelectorAll('[data-category-name]');
    const descriptionNode = document.querySelector('[data-category-description]');
    const countNode = document.querySelector('[data-category-count]');
    const imageNode = document.querySelector('[data-category-image]');
    const grid = document.querySelector('[data-category-products]');
    const resultsTitle = document.querySelector('[data-category-results-title]');
    const form = document.querySelector('[data-store-category-search]');
    const input = document.querySelector('[data-store-category-query]');
    const sortSelect = document.querySelector('[data-category-sort]');

    renderSidebar(categoryResult.categories, grouped, category.slug);
    renderChips(categoryResult.categories, category.slug);

    titleNodes.forEach((node) => { node.textContent = category.name; });
    if (descriptionNode) descriptionNode.textContent = category.description || '';
    if (countNode) countNode.textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
    if (imageNode) imageNode.innerHTML = placeholderMarkup(category.name, category.slug, true);

    const renderGrid = (query = '', sortMode = 'default') => {
      const term = query.trim().toLowerCase();
      let visible = term
        ? products.filter((product) =>
            `${product.name} ${product.shortDescription}`.toLowerCase().includes(term))
        : [...products];

      visible = sortProducts(visible, sortMode);

      if (resultsTitle) {
        resultsTitle.textContent = term ? `Results for "${query.trim()}"` : 'Everything in this collection';
      }

      if (grid) {
        grid.innerHTML = visible.length
          ? visible.map(productCard).join('')
          : '<div class="store-empty">No matching products in this collection yet.</div>';
        bindAddToCart(grid);
      }
    };

    renderGrid();

    if (form && input) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        renderGrid(input.value, sortSelect ? sortSelect.value : 'default');
      });
      input.addEventListener('input', () => {
        if (!input.value.trim()) renderGrid('', sortSelect ? sortSelect.value : 'default');
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        renderGrid(input ? input.value : '', sortSelect.value);
      });
    }
  }

  async function initProduct() {
    const slug = qs('slug');
    const [{ product }, allProductsResult] = await Promise.all([
      api(`/products/${slug}`),
      api('/products?limit=80')
    ]);

    const related = allProductsResult.products
      .filter((item) => item.categorySlug === product.categorySlug && item.slug !== product.slug)
      .slice(0, 4);

    const addButton = document.querySelector('[data-product-add]');
    const quoteButton = document.querySelector('[data-product-quote]');
    const qtyNode = document.querySelector('[data-product-qty-value]');
    const totalNode = document.querySelector('[data-product-total]');
    const relatedGrid = document.querySelector('[data-related-products]');
    let quantity = 1;

    document.querySelector('[data-product-name]').textContent = product.name;
    document.querySelector('[data-product-short]').textContent = product.shortDescription || '';
    document.querySelector('[data-product-description]').textContent = product.description || '';
    document.querySelector('[data-product-price]').textContent = currency(product.price);
    document.querySelector('[data-product-breadcrumb]').textContent = product.name;
    document.querySelector('[data-product-badge]').textContent = product.badge || 'DALA Pick';
    document.querySelector('[data-product-sku]').textContent = product.sku || 'DALA';
    document.querySelector('[data-product-stock]').textContent = product.stockStatus === 'low_stock' ? 'Low stock' : 'In stock';

    const compareNode = document.querySelector('[data-product-compare]');
    if (product.compareAtPrice) {
      compareNode.textContent = currency(product.compareAtPrice);
    } else if (compareNode) {
      compareNode.remove();
    }

    const categoryLink = document.querySelector('[data-product-category-link]');
    if (categoryLink) {
      categoryLink.textContent = product.categoryName || 'Collection';
      categoryLink.href = route(`/category.html?slug=${product.categorySlug}`);
    }

    const mainImage = document.querySelector('[data-product-main-image]');
    if (mainImage) {
      mainImage.innerHTML = placeholderMarkup(product.name, product.categorySlug, true);
    }

    const gallery = document.querySelector('[data-product-gallery]');
    if (gallery) {
      gallery.innerHTML = [
        'Product view',
        product.categoryName || 'Collection',
        product.badge || 'DALA Pick'
      ].map((label, index) => `
        <button type="button" class="${index === 0 ? 'is-active' : ''}" data-gallery-tab="${escapeHtml(label)}">${label}</button>
      `).join('');

      gallery.querySelectorAll('[data-gallery-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          gallery.querySelectorAll('button').forEach((node) => node.classList.remove('is-active'));
          button.classList.add('is-active');
        });
      });
    }

    const features = document.querySelector('[data-product-features]');
    if (features) {
      features.innerHTML = [
        'Clear price visibility for fast decisions',
        'Quantity-first ordering for restock flows',
        'Same product can move into cart or quote'
      ].map((item) => `<li><i class="fas fa-check"></i><span>${item}</span></li>`).join('');
    }

    const payload = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      categorySlug: product.categorySlug
    };

    function renderQuantity() {
      if (qtyNode) qtyNode.textContent = quantity;
      if (totalNode) totalNode.textContent = currency(product.price * quantity);
      if (addButton) addButton.textContent = `Add ${quantity} to cart`;
      if (quoteButton) quoteButton.textContent = quantity > 1 ? `Request quote for ${quantity}` : 'Request quote';
    }

    document.querySelectorAll('[data-product-qty]').forEach((button) => {
      button.addEventListener('click', () => {
        quantity = Math.max(1, quantity + Number(button.dataset.productQty));
        renderQuantity();
      });
    });

    if (addButton) {
      addButton.addEventListener('click', () => addToCart(payload, quantity));
    }
    if (quoteButton) {
      quoteButton.addEventListener('click', () => {
        addToCart(payload, quantity);
        window.location.href = route('/checkout.html?mode=quote');
      });
    }

    if (relatedGrid) {
      relatedGrid.innerHTML = related.length
        ? related.map(productCard).join('')
        : '<div class="store-empty">More products from this collection will appear here.</div>';
      bindAddToCart(relatedGrid);
    }

    renderQuantity();
  }

  function renderLineItems(items, container, summaryNode) {
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `
        <div class="store-empty">
          <h3>Your cart is empty</h3>
          <p>Start with a collection, add your products, and build your order from there.</p>
          <a class="store-btn store-btn-primary" href="${route('/')}">Browse Store</a>
        </div>
      `;
      if (summaryNode) summaryNode.textContent = currency(0);
      return;
    }

    container.innerHTML = items.map((item) => `
      <article class="store-line-item">
        <div class="store-line-item__media">
          ${placeholderMarkup(item.productName, item.categorySlug || 'household-items')}
        </div>
        <div class="store-line-item__meta">
          <div>
            <h3>${escapeHtml(item.productName)}</h3>
            <p>${currency(item.unitPrice)} each</p>
          </div>
          <div class="store-qty-inline">
            <button type="button" data-qty="${item.productSlug}" data-delta="-1">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="${item.productSlug}" data-delta="1">+</button>
          </div>
        </div>
        <div class="store-line-item__price">
          <strong>${currency(item.unitPrice * item.quantity)}</strong>
          <button type="button" class="store-link-btn" data-remove="${item.productSlug}">Remove</button>
        </div>
      </article>
    `).join('');

    if (summaryNode) summaryNode.textContent = currency(subtotal(items));
  }

  function attachLineItemHandlers(container, onChange) {
    container.querySelectorAll('[data-qty]').forEach((button) => {
      button.addEventListener('click', () => {
        onChange(updateQuantity(button.dataset.qty, Number(button.dataset.delta)));
      });
    });

    container.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        onChange(removeFromCart(button.dataset.remove));
      });
    });
  }

  function initCart() {
    const container = document.querySelector('[data-cart-items]');
    const subtotalNode = document.querySelector('[data-cart-subtotal]');
    if (!container) return;

    const render = (items) => {
      renderLineItems(items, container, subtotalNode);
      attachLineItemHandlers(container, render);
    };

    render(getCart());
  }

  function initCheckout() {
    const form = document.querySelector('[data-checkout-form]');
    if (!form) return;

    const items = getCart();
    const mode = qs('mode') === 'quote' ? 'quote' : 'manual';
    const itemsNode = document.querySelector('[data-checkout-items]');
    const subtotalNode = document.querySelector('[data-checkout-subtotal]');
    const modeNode = document.querySelector('[data-checkout-mode]');
    const headingNode = document.querySelector('[data-checkout-heading]');

    if (modeNode) modeNode.textContent = mode === 'quote' ? 'Request a quote' : 'Manual order';
    if (headingNode) headingNode.textContent = mode === 'quote' ? 'Submit your quote request' : 'Complete your order';

    renderLineItems(items, itemsNode, subtotalNode);

    if (!items.length) {
      form.innerHTML = `
        <div class="store-empty">
          <h3>Your cart is empty</h3>
          <p>Add products before continuing to checkout.</p>
          <a class="store-btn store-btn-primary" href="${route('/')}">Back to Store</a>
        </div>
      `;
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        checkoutType: mode,
        customerName: formData.get('customerName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        companyName: formData.get('companyName'),
        addressLine1: formData.get('addressLine1'),
        addressLine2: formData.get('addressLine2'),
        city: formData.get('city'),
        state: formData.get('state'),
        notes: formData.get('notes'),
        items
      };

      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = mode === 'quote' ? 'Submitting quote...' : 'Placing order...';

      try {
        const result = await api('/orders', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setCart([]);
        window.location.href = route(`/order-success.html?order=${encodeURIComponent(result.orderNumber)}&mode=${mode}`);
      } catch (error) {
        toast(error.message);
      } finally {
        submit.disabled = false;
        submit.textContent = mode === 'quote' ? 'Submit quote request' : 'Place manual order';
      }
    });
  }

  function initSuccess() {
    const orderNode = document.querySelector('[data-order-number]');
    const modeNode = document.querySelector('[data-order-mode]');
    if (orderNode) orderNode.textContent = qs('order') || 'Pending confirmation';
    if (modeNode) modeNode.textContent = qs('mode') === 'quote' ? 'Quote request received' : 'Manual order received';
  }

  async function initAdmin() {
    const grid = document.querySelector('[data-admin-products]');
    const keyInput = document.querySelector('[data-admin-key]');
    const form = document.querySelector('[data-admin-form]');
    const categorySelect = document.querySelector('[data-admin-category]');
    if (!grid || !form || !keyInput) return;

    const [categoryResult, productsResult] = await Promise.all([
      api('/categories'),
      api('/products')
    ]);

    if (categorySelect) {
      categorySelect.innerHTML = categoryResult.categories
        .map((category) => `<option value="${category.slug}">${escapeHtml(category.name)}</option>`)
        .join('');
    }

    grid.innerHTML = productsResult.products.map((product) => `
      <article class="store-admin-product">
        <header>
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <p>${escapeHtml(product.slug)}</p>
          </div>
          <span class="store-meta-pill">${currency(product.price)}</span>
        </header>
        <button class="store-btn store-btn-secondary" type="button" data-fill-product='${JSON.stringify(product).replace(/'/g, '&#39;')}'>Edit product</button>
      </article>
    `).join('');

    grid.querySelectorAll('[data-fill-product]').forEach((button) => {
      button.addEventListener('click', () => {
        const product = JSON.parse(button.dataset.fillProduct);
        Object.entries({
          slug: product.slug,
          name: product.name,
          categorySlug: product.categorySlug,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice || '',
          sku: product.sku || '',
          badge: product.badge || '',
          stockStatus: product.stockStatus || 'in_stock',
          featured: product.featured ? 'true' : 'false',
          image: product.image || '',
          gallery: (product.gallery || []).join(', '),
          sortOrder: product.sortOrder || 0
        }).forEach(([key, value]) => {
          const field = form.querySelector(`[name="${key}"]`);
          if (field) field.value = value;
        });
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        slug: formData.get('slug'),
        name: formData.get('name'),
        categorySlug: formData.get('categorySlug'),
        shortDescription: formData.get('shortDescription'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        compareAtPrice: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : null,
        sku: formData.get('sku'),
        badge: formData.get('badge'),
        stockStatus: formData.get('stockStatus'),
        featured: formData.get('featured') === 'true',
        image: formData.get('image'),
        gallery: (formData.get('gallery') || '').split(',').map((item) => item.trim()).filter(Boolean),
        sortOrder: Number(formData.get('sortOrder') || 0)
      };

      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'Saving...';

      try {
        await api('/admin/products', {
          method: 'POST',
          headers: { 'X-Admin-Key': keyInput.value },
          body: JSON.stringify(payload)
        });
        toast('Product saved successfully');
        window.location.reload();
      } catch (error) {
        toast(error.message);
      } finally {
        submit.disabled = false;
        submit.textContent = 'Save product';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    renderCartCount();
    bindAddToCart(document);

    const page = document.body.dataset.storePage;
    try {
      if (page === 'home') await initHome();
      if (page === 'category') await initCategory();
      if (page === 'product') await initProduct();
      if (page === 'cart') initCart();
      if (page === 'checkout') initCheckout();
      if (page === 'success') initSuccess();
      if (page === 'admin') await initAdmin();
    } catch (error) {
      console.error(error);
      toast(error.message || 'Something went wrong');
    }
  });
})();
