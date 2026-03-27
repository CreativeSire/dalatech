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

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch (error) {
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

  function renderCartCount() {
    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = cartCount();
    });
  }

  function toast(message) {
    let node = document.querySelector('.shop-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'shop-toast';
      document.body.appendChild(node);
    }

    node.textContent = message;
    node.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.classList.remove('is-visible');
    }, 2200);
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function route(path = '') {
    return `${storeRoot}${path}`;
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
        image: product.image,
        quantity
      });
    }

    setCart(items);
    toast(`${product.name} added to cart`);
  }

  function updateQuantity(slug, delta) {
    const items = getCart()
      .map((item) => {
        if (item.productSlug !== slug) return item;
        return { ...item, quantity: Math.max(0, Number(item.quantity) + delta) };
      })
      .filter((item) => item.quantity > 0);

    setCart(items);
    return items;
  }

  function removeFromCart(slug) {
    const items = getCart().filter((item) => item.productSlug !== slug);
    setCart(items);
    return items;
  }

  function subtotal(items) {
    return items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
  }

  function categoryProductsMap(products) {
    return products.reduce((map, product) => {
      if (!map[product.categorySlug]) map[product.categorySlug] = [];
      map[product.categorySlug].push(product);
      return map;
    }, {});
  }

  function categoryVisual(category, categoryProducts = []) {
    const featured = categoryProducts.slice(0, 3);
    if (!featured.length) {
      return `<img src="${category.heroImage}" alt="${category.name}" loading="lazy">`;
    }

    return `
      <div class="store-category-stack" aria-hidden="true">
        ${featured.map((product, index) => `
          <figure class="store-category-shot store-category-shot--${index + 1}">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </figure>
        `).join('')}
      </div>
      <div class="store-category-overlay">
        <span class="store-category-count">${categoryProducts.length} products</span>
        <span class="store-category-caption">${category.name}</span>
      </div>
    `;
  }

  function categoryCoverImage(category, categoryProducts = []) {
    return (categoryProducts[0] && categoryProducts[0].image) || category.heroImage;
  }

  function productCard(product) {
    return `
      <article class="shop-product-card">
        <a class="shop-product-card__media" href="${route(`/product.html?slug=${product.slug}`)}">
          <span class="shop-product-badge">${product.badge || 'DALA Pick'}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </a>
        <div class="shop-product-card__body">
          <div class="shop-product-meta">
            <span class="shop-pill">${product.stockStatus === 'low_stock' ? 'Low Stock' : 'In Stock'}</span>
            <span class="shop-pill">${product.categoryName || 'Collection'}</span>
          </div>
          <div>
            <h3>${product.name}</h3>
            <p>${product.shortDescription || ''}</p>
          </div>
          <div class="shop-product-card__footer">
            <div class="shop-price-group">
              <span class="shop-price">${currency(product.price)}</span>
              ${product.compareAtPrice ? `<span class="shop-compare">${currency(product.compareAtPrice)}</span>` : ''}
            </div>
            <button class="shop-btn shop-btn-dark" data-add-to-cart='${JSON.stringify({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image
            }).replace(/'/g, '&#39;')}'>Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function categoryCard(category) {
    const categoryProducts = arguments[1] || [];
    return `
      <article class="shop-category-card">
        <a class="shop-category-card__media shop-category-card__media--store" href="${route(`/category.html?slug=${category.slug}`)}">
          ${categoryVisual(category, categoryProducts)}
        </a>
        <div class="shop-category-card__body">
          <div>
            <h3>${category.name}</h3>
            <p>${category.description || ''}</p>
          </div>
          <div class="shop-category-card__footer">
            <span class="shop-pill">Store Collection</span>
            <a class="shop-btn shop-btn-secondary" href="${route(`/category.html?slug=${category.slug}`)}">Browse</a>
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

  async function initShopHome() {
    const [categoryResult, featuredResult, allProductsResult] = await Promise.all([
      api('/categories'),
      api('/products?featured=true&limit=8'),
      api('/products?limit=60')
    ]);
    const productsByCategory = categoryProductsMap(allProductsResult.products);

    const categoryGrid = document.querySelector('[data-category-grid]');
    const featuredGrid = document.querySelector('[data-featured-products]');
    const collectionTabs = document.querySelector('[data-collection-tabs]');

    if (collectionTabs) {
      collectionTabs.innerHTML = categoryResult.categories
        .slice(0, 6)
        .map((category) => `<a class="shop-tab" href="${route(`/category.html?slug=${category.slug}`)}">${category.name}</a>`)
        .join('');
    }

    if (categoryGrid) {
      categoryGrid.innerHTML = categoryResult.categories
        .map((category) => categoryCard(category, productsByCategory[category.slug] || []))
        .join('');
    }

    if (featuredGrid) {
      featuredGrid.innerHTML = featuredResult.products.map(productCard).join('');
      bindAddToCart(featuredGrid);
    }
  }

  async function initCategoryPage() {
    const slug = qs('slug');
    const [categoryResult, productResult] = await Promise.all([
      api('/categories'),
      api(`/products?category=${encodeURIComponent(slug || '')}`)
    ]);

    const category = categoryResult.categories.find((item) => item.slug === slug) || categoryResult.categories[0];
    const products = slug ? productResult.products : [];
    const headerTitle = document.querySelector('[data-category-name]');
    const headerText = document.querySelector('[data-category-description]');
    const headerImage = document.querySelector('[data-category-image]');
    const productGrid = document.querySelector('[data-category-products]');
    const tabs = document.querySelector('[data-category-tabs]');

    if (tabs) {
      tabs.innerHTML = categoryResult.categories
        .map((item) => `<a class="shop-tab ${item.slug === category.slug ? 'is-active' : ''}" href="${route(`/category.html?slug=${item.slug}`)}">${item.name}</a>`)
        .join('');
    }

    if (headerTitle) headerTitle.textContent = category.name;
    if (headerText) headerText.textContent = category.description;
    if (headerImage) {
      headerImage.src = categoryCoverImage(category, products);
      headerImage.alt = category.name;
    }

    if (productGrid) {
      if (products.length === 0) {
        productGrid.innerHTML = '<div class="shop-state">This collection will appear here as soon as products are added.</div>';
      } else {
        productGrid.innerHTML = products.map(productCard).join('');
        bindAddToCart(productGrid);
      }
    }
  }

  async function initProductPage() {
    const slug = qs('slug');
    const result = await api(`/products/${slug}`);
    const product = result.product;
    const mainImage = document.querySelector('[data-product-main-image]');
    const gallery = document.querySelector('[data-product-gallery]');
    const featureList = document.querySelector('[data-product-features]');
    const addButton = document.querySelector('[data-product-add]');
    const quoteButton = document.querySelector('[data-product-quote]');

    document.querySelector('[data-product-name]').textContent = product.name;
    document.querySelector('[data-product-short]').textContent = product.shortDescription || '';
    document.querySelector('[data-product-price]').textContent = currency(product.price);
    document.querySelector('[data-product-description]').textContent = product.description || '';
    document.querySelector('[data-product-sku]').textContent = product.sku || 'DALA';
    document.querySelector('[data-product-stock]').textContent = product.stockStatus === 'low_stock' ? 'Low stock' : 'In stock';
    document.querySelector('[data-product-badge]').textContent = product.badge || 'DALA Pick';

    const compare = document.querySelector('[data-product-compare]');
    if (product.compareAtPrice) {
      compare.textContent = currency(product.compareAtPrice);
    } else {
      compare.remove();
    }

    if (mainImage) {
      mainImage.src = product.image;
      mainImage.alt = product.name;
    }

    if (gallery) {
      const shots = product.gallery && product.gallery.length ? product.gallery : [product.image];
      gallery.innerHTML = shots.map((image, index) => `
        <button type="button" ${index === 0 ? 'class="is-active"' : ''} data-gallery-image="${image}">
          <img src="${image}" alt="${product.name} view ${index + 1}" loading="lazy">
        </button>
      `).join('');

      gallery.querySelectorAll('[data-gallery-image]').forEach((button) => {
        button.addEventListener('click', () => {
          mainImage.src = button.dataset.galleryImage;
          gallery.querySelectorAll('button').forEach((item) => item.classList.remove('is-active'));
          button.classList.add('is-active');
        });
      });
    }

    if (featureList) {
      featureList.innerHTML = [
        'Clear product information and visible pricing',
        'Easy quantity selection for retail ordering',
        'Quick reorder flow for repeat buyers'
      ].map((item) => `<li><i class="fas fa-check"></i><span>${item}</span></li>`).join('');
    }

    const payload = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image
    };

    if (addButton) {
      addButton.addEventListener('click', () => addToCart(payload, 1));
    }

    if (quoteButton) {
      quoteButton.addEventListener('click', () => {
        addToCart(payload, 1);
        window.location.href = route('/checkout.html?mode=quote');
      });
    }
  }

  function renderCartItems(items, container, summaryNode) {
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `
        <div class="shop-empty">
          <h3>Your cart is empty</h3>
          <p>Start with one of the DALA collections and build your order from there.</p>
          <a class="shop-btn shop-btn-primary" href="${route('/')}">Browse the store</a>
        </div>
      `;
      if (summaryNode) summaryNode.textContent = currency(0);
      return;
    }

    container.innerHTML = items.map((item) => `
      <article class="shop-cart-item">
        <img src="${item.image}" alt="${item.productName}" loading="lazy">
        <div class="shop-cart-item__meta">
          <div>
            <h3>${item.productName}</h3>
            <p>${currency(item.unitPrice)} each</p>
          </div>
          <div class="shop-qty">
            <button type="button" data-qty="${item.productSlug}" data-delta="-1">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="${item.productSlug}" data-delta="1">+</button>
          </div>
        </div>
        <div>
          <strong>${currency(item.unitPrice * item.quantity)}</strong>
          <button type="button" class="shop-btn shop-btn-secondary" data-remove="${item.productSlug}">Remove</button>
        </div>
      </article>
    `).join('');

    if (summaryNode) summaryNode.textContent = currency(subtotal(items));
  }

  function attachCartHandlers(container, onChange) {
    container.querySelectorAll('[data-qty]').forEach((button) => {
      button.addEventListener('click', () => {
        const slug = button.dataset.qty;
        const delta = Number(button.dataset.delta);
        onChange(updateQuantity(slug, delta));
      });
    });

    container.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        onChange(removeFromCart(button.dataset.remove));
      });
    });
  }

  function initCartPage() {
    const container = document.querySelector('[data-cart-items]');
    const summaryNode = document.querySelector('[data-cart-subtotal]');
    if (!container) return;

    const render = (items) => {
      renderCartItems(items, container, summaryNode);
      attachCartHandlers(container, render);
    };

    render(getCart());
  }

  function initCheckoutPage() {
    const form = document.querySelector('[data-checkout-form]');
    if (!form) return;

    const items = getCart();
    const mode = qs('mode') === 'quote' ? 'quote' : 'manual';
    const itemTarget = document.querySelector('[data-checkout-items]');
    const subtotalTarget = document.querySelector('[data-checkout-subtotal]');
    const modeTarget = document.querySelector('[data-checkout-mode]');
    const headingTarget = document.querySelector('[data-checkout-heading]');

    if (modeTarget) modeTarget.textContent = mode === 'quote' ? 'Request a quote' : 'Place a manual order';
    if (headingTarget) headingTarget.textContent = mode === 'quote' ? 'Submit a quote request' : 'Complete your order';

    renderCartItems(items, itemTarget, subtotalTarget);

    if (!items.length) {
      form.innerHTML = `
        <div class="shop-empty">
          <h3>Your cart is empty</h3>
          <p>Add products before continuing to checkout.</p>
          <a class="shop-btn shop-btn-primary" href="${route('/')}">Back to the store</a>
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

  function initOrderSuccess() {
    const orderNode = document.querySelector('[data-order-number]');
    const modeNode = document.querySelector('[data-order-mode]');
    if (orderNode) orderNode.textContent = qs('order') || 'Pending confirmation';
    if (modeNode) modeNode.textContent = qs('mode') === 'quote' ? 'Quote request received' : 'Manual order received';
  }

  async function initAdminPage() {
    const shell = document.querySelector('[data-admin-products]');
    const keyInput = document.querySelector('[data-admin-key]');
    const form = document.querySelector('[data-admin-form]');
    const categoryInput = document.querySelector('[data-admin-category]');

    if (!shell || !form || !keyInput) return;

    const [categoriesResult, productsResult] = await Promise.all([
      api('/categories'),
      api('/products')
    ]);

    categoryInput.innerHTML = categoriesResult.categories
      .map((category) => `<option value="${category.slug}">${category.name}</option>`)
      .join('');

    shell.innerHTML = productsResult.products.map((product) => `
      <article class="shop-admin-product">
        <header>
          <div>
            <strong>${product.name}</strong>
            <p>${product.slug}</p>
          </div>
          <span class="shop-pill">${currency(product.price)}</span>
        </header>
        <button class="shop-btn shop-btn-secondary" type="button" data-fill-product='${JSON.stringify(product).replace(/'/g, '&#39;')}'>Edit product</button>
      </article>
    `).join('');

    shell.querySelectorAll('[data-fill-product]').forEach((button) => {
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
          headers: {
            'X-Admin-Key': keyInput.value
          },
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

    const page = document.body.dataset.shopPage;

    try {
      if (page === 'home') await initShopHome();
      if (page === 'category') await initCategoryPage();
      if (page === 'product') await initProductPage();
      if (page === 'cart') initCartPage();
      if (page === 'checkout') initCheckoutPage();
      if (page === 'success') initOrderSuccess();
      if (page === 'admin') await initAdminPage();
    } catch (error) {
      console.error(error);
      toast(error.message || 'Something went wrong');
    }
  });
})();
