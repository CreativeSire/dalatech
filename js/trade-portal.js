/* ============================================================
   DALA Technologies Trade Portal — Shared JavaScript
   trade-portal.js
   ============================================================ */

'use strict';

/* ── Auth helpers ─────────────────────────────────────────── */
const TradeAuth = {
  key: 'dala_trade_session',

  getSession() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  setSession(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },

  clearSession() {
    localStorage.removeItem(this.key);
  },

  isLoggedIn() {
    const s = this.getSession();
    return s && s.type === 'retailer';
  }
};

/* ── Auth Guard (call on protected pages) ─────────────────── */
function tradeAuthGuard() {
  if (!TradeAuth.isLoggedIn()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/* ── Populate retailer info from session ──────────────────── */
function populateRetailerInfo() {
  const s = TradeAuth.getSession();
  if (!s) return;

  // Sidebar name + tier
  document.querySelectorAll('[data-retailer-name]').forEach(el => {
    el.textContent = s.name || 'Retailer';
  });
  document.querySelectorAll('[data-retailer-tier]').forEach(el => {
    el.textContent = s.tier || 'Partner';
  });
  document.querySelectorAll('[data-retailer-location]').forEach(el => {
    el.textContent = s.location || '';
  });
  document.querySelectorAll('[data-retailer-manager]').forEach(el => {
    el.textContent = s.manager || '';
  });

  // Topbar greeting
  const greetEl = document.querySelector('[data-greeting]');
  if (greetEl) {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    greetEl.textContent = `${greeting}, ${s.name}`;
  }

  // Date
  const dateEl = document.querySelector('[data-topbar-date]');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Sidebar avatar initials
  document.querySelectorAll('[data-retailer-initials]').forEach(el => {
    const parts = (s.name || 'R').split(' ');
    el.textContent = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  });
}

/* ── Sidebar: active state from body data attribute ──────── */
function initSidebarActive() {
  const page = document.body.getAttribute('data-trade-page') || '';
  document.querySelectorAll('.sidebar-nav a[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
}

/* ── Sidebar: mobile hamburger toggle ─────────────────────── */
function initMobileSidebar() {
  const sidebar = document.querySelector('.trade-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const hamburger = document.querySelector('.hamburger-btn');

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    overlay && overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    overlay && overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger && hamburger.addEventListener('click', openSidebar);
  overlay && overlay.addEventListener('click', closeSidebar);
}

/* ── Logout ────────────────────────────────────────────────── */
function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      TradeAuth.clearSession();
      window.location.href = 'index.html';
    });
  });
}

/* ── Toast notifications ──────────────────────────────────── */
function showToast(message, type = 'success', duration = 5000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icon = type === 'success' ? 'fa-circle-check' :
               type === 'error'   ? 'fa-circle-xmark' : 'fa-circle-info';

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Modal helpers ─────────────────────────────────────────── */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('open');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}

function openPanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.add('open');
}

function closePanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.remove('open');
}

/* ── Order line total calculation ─────────────────────────── */
function initOrderCalculations() {
  const table = document.querySelector('.order-lines-table');
  if (!table) return;

  function recalc() {
    let subtotal = 0;
    table.querySelectorAll('tr[data-unit-price]').forEach(row => {
      const unitPrice = parseFloat(row.getAttribute('data-unit-price')) || 0;
      const qtyInput = row.querySelector('.qty-input');
      const qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
      const lineTotal = unitPrice * qty;
      const lineTotalEl = row.querySelector('.line-total');
      if (lineTotalEl) lineTotalEl.textContent = '₦' + lineTotal.toLocaleString();
      subtotal += lineTotal;
    });

    const delivery = 5000;
    const total = subtotal + delivery;

    const subtotalEl = document.getElementById('order-subtotal');
    const totalEl    = document.getElementById('order-total');
    const moqEl      = document.getElementById('moq-status');

    if (subtotalEl) subtotalEl.textContent = '₦' + subtotal.toLocaleString();
    if (totalEl)    totalEl.textContent    = '₦' + total.toLocaleString();
    if (moqEl) {
      const met = subtotal >= 50000;
      moqEl.innerHTML = met
        ? '<span class="badge badge-green"><i class="fa-solid fa-check"></i> Met</span>'
        : '<span class="badge badge-red"><i class="fa-solid fa-xmark"></i> Not met</span>';
    }
  }

  table.addEventListener('input', e => {
    if (e.target.classList.contains('qty-input')) recalc();
  });

  // Remove row
  table.addEventListener('click', e => {
    if (e.target.closest('.btn-remove-row')) {
      e.target.closest('tr').remove();
      recalc();
    }
  });
}

/* ── Slide panel for order detail ─────────────────────────── */
function initOrderDetailPanels() {
  document.querySelectorAll('[data-view-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-view-order');
      populateOrderDetail(orderId);
      openPanel('order-detail-panel');
    });
  });

  const closeBtn = document.querySelector('[data-close-panel="order-detail-panel"]');
  closeBtn && closeBtn.addEventListener('click', () => closePanel('order-detail-panel'));
}

function populateOrderDetail(orderId) {
  const el = document.getElementById('panel-order-id');
  if (el) el.textContent = orderId;
}

/* ── Brand catalog filter ─────────────────────────────────── */
function initCatalogFilter() {
  const searchInput = document.getElementById('catalog-search');
  const brandFilter = document.getElementById('catalog-brand-filter');
  const availFilter = document.getElementById('catalog-avail-filter');
  const tableRows   = document.querySelectorAll('.sku-table-row');
  const brandCards  = document.querySelectorAll('.brand-card[data-brand]');

  function applyFilters() {
    const q     = searchInput ? searchInput.value.toLowerCase() : '';
    const brand = brandFilter ? brandFilter.value : '';
    const avail = availFilter ? availFilter.value : '';

    tableRows.forEach(row => {
      const rowBrand = (row.getAttribute('data-brand') || '').toLowerCase();
      const rowText  = row.textContent.toLowerCase();
      const rowAvail = row.getAttribute('data-availability') || '';

      const matchSearch = !q || rowText.includes(q);
      const matchBrand  = !brand || rowBrand === brand.toLowerCase();
      const matchAvail  = !avail || rowAvail === avail;

      row.style.display = matchSearch && matchBrand && matchAvail ? '' : 'none';
    });

    brandCards.forEach(card => {
      const cardBrand = (card.getAttribute('data-brand') || '').toLowerCase();
      const matchBrand = !brand || cardBrand === brand.toLowerCase();
      card.style.display = matchBrand ? '' : 'none';
    });
  }

  searchInput && searchInput.addEventListener('input', applyFilters);
  brandFilter && brandFilter.addEventListener('change', applyFilters);
  availFilter && availFilter.addEventListener('change', applyFilters);
}

/* ── Init all on DOMContentLoaded ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarActive();
  initMobileSidebar();
  initLogout();
  initOrderCalculations();
  initOrderDetailPanels();
  initCatalogFilter();
});
