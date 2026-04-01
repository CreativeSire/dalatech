/* ============================================================
   DALA Technologies — Brand Partner Portal
   Shared JS: brand-portal.js
   ============================================================ */

/* ── Auth helpers ── */
const BP_KEY = 'bp_session';

function bpLogin(data) {
  localStorage.setItem(BP_KEY, JSON.stringify(data));
}

function bpGetSession() {
  try { return JSON.parse(localStorage.getItem(BP_KEY)); }
  catch { return null; }
}

function bpLogout() {
  localStorage.removeItem(BP_KEY);
  window.location.href = 'index.html';
}

/* Auth guard: call on every protected page */
function bpGuard() {
  const session = bpGetSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

/* ── Populate brand name wherever [data-bp-brand] appears ── */
function bpFillBrand(session) {
  document.querySelectorAll('[data-bp-brand]').forEach(el => {
    el.textContent = session.brandName || 'Your Brand';
  });
  document.querySelectorAll('[data-bp-contact]').forEach(el => {
    el.textContent = session.contactName || '';
  });
  document.querySelectorAll('[data-bp-manager]').forEach(el => {
    el.textContent = session.manager || '';
  });
  // Topbar title
  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle && session.brandName) {
    topbarTitle.textContent = session.brandName + "'s Dashboard";
  }
  // Sidebar brand tag
  const sidebarBrand = document.getElementById('sidebar-brand-name');
  if (sidebarBrand) sidebarBrand.textContent = session.brandName;
  // Brand avatar initials
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar && session.brandName) {
    const words = session.brandName.split(' ');
    sidebarAvatar.textContent = words.length >= 2
      ? words[0][0] + words[1][0]
      : session.brandName.substring(0, 2);
    sidebarAvatar.textContent = sidebarAvatar.textContent.toUpperCase();
  }
}

/* ── Sidebar active state ── */
function bpSidebarActive() {
  const page = document.body.dataset.bpPage;
  document.querySelectorAll('.sidebar-nav a[data-page]').forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ── Mobile sidebar toggle ── */
function bpMobileNav() {
  const toggle  = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

/* ── Current date in topbar ── */
function bpSetDate() {
  const el = document.getElementById('topbar-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ── Animate CSS bar charts ── */
function bpAnimateBars() {
  const bars = document.querySelectorAll('.bar-fill[data-width]');
  // Use IntersectionObserver so bars animate on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(bar => io.observe(bar));
}

/* ── Tab switching (orders page) ── */
function bpTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content[data-tab]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.querySelector(`.tab-content[data-tab="${btn.dataset.tab}"]`);
      if (target) target.classList.add('active');
    });
  });
}

/* ── Panel (slide-in form) toggle ── */
function bpPanels() {
  document.querySelectorAll('[data-panel-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.panelOpen;
      const panel = document.getElementById(id);
      if (panel) panel.classList.add('open');
    });
  });
  document.querySelectorAll('[data-panel-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.panelClose;
      const panel = document.getElementById(id);
      if (panel) panel.classList.remove('open');
    });
  });
  // Close on overlay click
  document.querySelectorAll('.panel-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

/* ── Logout wiring ── */
function bpWireLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', bpLogout);
  });
}

/* ── Submit feedback for demo forms ── */
function bpDemoForms() {
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const id = form.dataset.demoForm;
      // Show success message
      let msg = document.getElementById(id + '-success');
      if (!msg) {
        msg = document.createElement('div');
        msg.id = id + '-success';
        msg.className = 'info-note info-green';
        msg.style.marginTop = '12px';
        msg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Request submitted successfully. Your DALA account manager will be in touch within 1 business day.';
        form.after(msg);
      } else {
        msg.style.display = 'flex';
      }
      form.reset();
    });
  });
}

/* ── Master init (called on every protected page) ── */
function bpInit() {
  const session = bpGuard();
  if (!session) return;
  bpFillBrand(session);
  bpSidebarActive();
  bpMobileNav();
  bpSetDate();
  bpAnimateBars();
  bpTabs();
  bpPanels();
  bpWireLogout();
  bpDemoForms();
}

/* ── Login page logic (only on index.html) ── */
function bpLoginPage() {
  // Redirect if already logged in
  if (bpGetSession()) {
    window.location.href = 'dashboard.html';
    return;
  }
  const form  = document.getElementById('login-form');
  const error = document.getElementById('login-error');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('#email').value.trim();
    const pwd   = form.querySelector('#password').value;
    if (pwd === 'demo') {
      bpLogin({
        type: 'brand',
        brandName: "Wilson's Lemonade",
        category: 'Beverages',
        contactName: 'Emeka Wilson',
        manager: 'Sola Okafor',
        joined: 'January 2024'
      });
      window.location.href = 'dashboard.html';
    } else {
      error.classList.add('visible');
    }
  });
  // Hide error on input change
  form.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => error.classList.remove('visible'));
  });
}
