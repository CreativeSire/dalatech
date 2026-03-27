/* ============================================================
   DALA Store — Premium Marketplace Frontend
   Handles: hero carousel, flash-deal countdown, cart drawer,
   quick-view modal, mobile bottom nav, scroll carousels,
   wishlist toggles, newsletter, add-to-cart intercept.
   ============================================================ */

(function () {
  'use strict';

  /* ── Utilities ── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function currency(v) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(Number(v || 0));
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem('dala-store-cart') || '[]'); }
    catch { return []; }
  }
  function setCart(items) {
    localStorage.setItem('dala-store-cart', JSON.stringify(items));
    syncCartUI();
  }
  function cartTotal() {
    return getCart().reduce((s, i) => s + Number(i.unitPrice || 0) * Number(i.quantity || 0), 0);
  }
  function cartCount() {
    return getCart().reduce((s, i) => s + Number(i.quantity || 0), 0);
  }

  /* ── Cart count badges ── */
  function syncCartUI() {
    const count = cartCount();
    qsa('[data-cart-count]').forEach(el => { el.textContent = count; });
    renderDrawerItems();
  }

  /* ── Add to cart (marketplace variant) ── */
  function addToCart(product, qty) {
    qty = qty || 1;
    const items = getCart();
    const existing = items.find(i => i.productSlug === product.slug);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        unitPrice: Number(product.price),
        image: product.image || '',
        quantity: qty
      });
    }
    setCart(items);
    openDrawer();
  }

  /* ── Wire all [data-add-to-cart] buttons ── */
  function wireAddToCartButtons(scope) {
    scope = scope || document;
    qsa('[data-add-to-cart]', scope).forEach(btn => {
      if (btn.dataset.mktBound) return;
      btn.dataset.mktBound = '1';
      btn.addEventListener('click', e => {
        e.stopPropagation();
        try {
          const product = JSON.parse(btn.dataset.addToCart);
          addToCart(product, 1);
        } catch (err) {
          console.warn('Add to cart parse error', err);
        }
      });
    });
  }

  /* ── Observe DOM for new product cards (API renders them async) ── */
  const cardObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          wireAddToCartButtons(node);
          wireQuickViewButtons(node);
        }
      });
    });
  });
  cardObserver.observe(document.body, { childList: true, subtree: true });

  /* ======================================================
     HERO CAROUSEL
  ====================================================== */
  (function initCarousel() {
    const carousel = qs('#hero-carousel');
    if (!carousel) return;

    const track = qs('#hero-track');
    const dots = qsa('.mkt-dot', carousel);
    const slides = qsa('.mkt-slide', track);
    const total = slides.length;
    let current = 0;
    let autoTimer;

    function go(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => go(current + 1), 5000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    qs('#hero-prev', carousel)?.addEventListener('click', () => { go(current - 1); startAuto(); });
    qs('#hero-next', carousel)?.addEventListener('click', () => { go(current + 1); startAuto(); });
    dots.forEach(dot => dot.addEventListener('click', () => { go(Number(dot.dataset.index)); startAuto(); }));

    /* Touch/swipe */
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { go(dx < 0 ? current + 1 : current - 1); startAuto(); }
    });

    startAuto();
  })();

  /* ======================================================
     FLASH DEAL COUNTDOWN (midnight reset)
  ====================================================== */
  (function initCountdown() {
    const hEl = qs('#fd-hours');
    const mEl = qs('#fd-mins');
    const sEl = qs('#fd-secs');
    if (!hEl) return;

    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      let diff = Math.floor((midnight - now) / 1000);
      const h = Math.floor(diff / 3600); diff %= 3600;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ======================================================
     CART DRAWER
  ====================================================== */
  function openDrawer() {
    qs('#mkt-cart-drawer')?.classList.add('is-open');
    qs('#mkt-drawer-overlay')?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    qs('#mkt-cart-drawer')?.classList.remove('is-open');
    qs('#mkt-drawer-overlay')?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderDrawerItems() {
    const container = qs('#mkt-drawer-items');
    const subtotalEl = qs('#mkt-drawer-subtotal');
    if (!container) return;

    const items = getCart();
    if (subtotalEl) subtotalEl.textContent = currency(cartTotal());

    if (!items.length) {
      container.innerHTML = `
        <div class="mkt-drawer-empty">
          <i class="fas fa-cart-shopping"></i>
          <p>Your cart is empty.<br>Start adding items from the store.</p>
        </div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="mkt-drawer-item" data-slug="${item.productSlug}">
        <div class="mkt-drawer-item-img">
          ${item.image ? `<img src="${item.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : '<i class="fas fa-box"></i>'}
        </div>
        <div>
          <p class="mkt-drawer-item-name">${item.productName}</p>
          <p class="mkt-drawer-item-price">${currency(item.unitPrice)}</p>
          <div class="mkt-drawer-item-qty">
            <button data-drawer-delta="-1" data-drawer-slug="${item.productSlug}">−</button>
            <span>${item.quantity}</span>
            <button data-drawer-delta="1" data-drawer-slug="${item.productSlug}">+</button>
          </div>
        </div>
        <button class="mkt-drawer-item-remove" data-drawer-remove="${item.productSlug}" aria-label="Remove">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    `).join('');

    /* Qty buttons */
    qsa('[data-drawer-delta]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.drawerSlug;
        const delta = Number(btn.dataset.drawerDelta);
        const cart = getCart().map(i => i.productSlug === slug
          ? { ...i, quantity: Math.max(0, i.quantity + delta) }
          : i
        ).filter(i => i.quantity > 0);
        setCart(cart);
      });
    });

    /* Remove buttons */
    qsa('[data-drawer-remove]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.drawerRemove;
        setCart(getCart().filter(i => i.productSlug !== slug));
      });
    });
  }

  /* Open/close triggers */
  qsa('[data-cart-drawer-open]').forEach(el => {
    el.addEventListener('click', openDrawer);
  });
  qs('#mkt-drawer-close')?.addEventListener('click', closeDrawer);
  qs('#mkt-drawer-overlay')?.addEventListener('click', closeDrawer);

  /* ======================================================
     QUICK VIEW MODAL
  ====================================================== */
  function openQV(product) {
    const overlay = qs('#mkt-qv-overlay');
    const modal = qs('#mkt-qv-modal');
    const inner = qs('#mkt-qv-inner');
    if (!modal || !inner) return;

    const bgColor = product.bgColor || '#f5f5f5';
    const icon = product.icon || 'fa-box-open';

    inner.innerHTML = `
      <div class="mkt-qv-body">
        <div class="mkt-qv-img" style="background:${bgColor}">
          ${product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:14px">`
            : `<i class="fas ${icon}" style="font-size:3.5rem;color:#aaa"></i>`
          }
        </div>
        <div class="mkt-qv-info">
          <h3>${product.name}</h3>
          <p class="mkt-qv-price">${currency(product.price)}</p>
          ${product.compareAtPrice ? `<p class="mkt-qv-compare">${currency(product.compareAtPrice)}</p>` : ''}
          <p class="mkt-qv-desc">${product.shortDescription || 'Quality product from a trusted Nigerian brand.'}</p>
          <div class="mkt-qv-actions">
            <button class="mkt-qv-add" id="mkt-qv-add-btn">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
            <a class="mkt-qv-view" href="/store/product.html?slug=${product.slug}">View full details</a>
          </div>
        </div>
      </div>`;

    qs('#mkt-qv-add-btn')?.addEventListener('click', () => {
      addToCart(product, 1);
      closeQV();
    });

    overlay?.classList.add('is-open');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeQV() {
    qs('#mkt-qv-overlay')?.classList.remove('is-open');
    qs('#mkt-qv-modal')?.classList.remove('is-open');
    // Only restore scroll if drawer isn't also open
    if (!qs('#mkt-cart-drawer')?.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
  }

  qs('#mkt-qv-close')?.addEventListener('click', closeQV);
  qs('#mkt-qv-overlay')?.addEventListener('click', closeQV);

  /* Wire Quick View on product cards (API-rendered cards) */
  function wireQuickViewButtons(scope) {
    scope = scope || document;
    qsa('.shop-product-card', scope).forEach(card => {
      if (card.dataset.qvBound) return;
      card.dataset.qvBound = '1';

      const qvBtn = document.createElement('button');
      qvBtn.className = 'mkt-qv-trigger';
      qvBtn.textContent = 'Quick view';
      qvBtn.style.cssText = `
        position:absolute;bottom:0;left:0;right:0;
        background:rgba(26,26,46,0.92);color:#fff;border:none;
        padding:9px;font-size:0.78rem;font-weight:700;cursor:pointer;
        opacity:0;transition:opacity 0.2s;z-index:5;
      `;
      card.style.position = 'relative';
      card.appendChild(qvBtn);

      card.addEventListener('mouseenter', () => { qvBtn.style.opacity = '1'; });
      card.addEventListener('mouseleave', () => { qvBtn.style.opacity = '0'; });

      qvBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const addBtn = card.querySelector('[data-add-to-cart]');
        if (!addBtn) return;
        try {
          const product = JSON.parse(addBtn.dataset.addToCart);
          openQV(product);
        } catch {}
      });
    });
  }

  /* ======================================================
     HORIZONTAL SCROLL CAROUSELS
  ====================================================== */
  function initScrollCarousel(scrollId, prevId, nextId) {
    const scroll = qs('#' + scrollId);
    const prev = qs('#' + prevId);
    const next = qs('#' + nextId);
    if (!scroll) return;
    const step = 300;
    prev?.addEventListener('click', () => scroll.scrollBy({ left: -step, behavior: 'smooth' }));
    next?.addEventListener('click', () => scroll.scrollBy({ left: step, behavior: 'smooth' }));
  }
  initScrollCarousel('bev-scroll', 'bev-prev', 'bev-next');

  /* ── Wishlist heart toggles ── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.mkt-wish-btn');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;
    btn.classList.toggle('is-active');
    icon.classList.toggle('fa-heart');
    icon.classList.toggle('fas');
    icon.classList.toggle('far');
  });

  /* ======================================================
     MOBILE HAMBURGER
  ====================================================== */
  qs('#mkt-hamburger')?.addEventListener('click', () => {
    qs('#mkt-mobile-nav')?.classList.toggle('is-open');
  });

  /* ======================================================
     MOBILE BOTTOM NAV — active state
  ====================================================== */
  (function syncBottomNav() {
    const path = window.location.pathname;
    qsa('.mkt-bottom-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href && path.includes(href.split('/').pop().split('?')[0])) {
        item.classList.add('mkt-bottom-item--active');
      }
    });
  })();

  /* ======================================================
     NEWSLETTER FORM
  ====================================================== */
  qs('#mkt-newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    form.innerHTML = '<span style="color:#4ade80;font-size:1rem;font-weight:700">&#10003; You\'re subscribed!</span>';
  });

  /* ======================================================
     HEADER SCROLL SHRINK
  ====================================================== */
  (function initScrollBehaviour() {
    const header = qs('#mkt-header');
    const catNav = qs('#mkt-cat-nav');
    if (!header) return;
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 80) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
      }
      if (catNav) {
        catNav.style.top = y > 80 ? '62px' : '70px';
      }
      lastY = y;
    }, { passive: true });
  })();

  /* ======================================================
     INIT — run after DOM ready
  ====================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    syncCartUI();
    wireAddToCartButtons();
    wireQuickViewButtons();
  });

  /* Also run immediately if DOM already ready */
  if (document.readyState !== 'loading') {
    syncCartUI();
    wireAddToCartButtons();
    wireQuickViewButtons();
  }

})();
