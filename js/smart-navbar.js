/**
 * SMART NAVBAR - Hide on scroll down, Show on scroll up
 * Mobile-first navigation pattern
 */

(function() {
  'use strict';

  // Only run on mobile
  if (window.innerWidth > 768) return;

  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  const scrollThreshold = 10; // Minimum scroll before hiding

  function updateNavbar() {
    const currentScrollY = window.scrollY;
    
    // Don't hide if at the top
    if (currentScrollY < scrollThreshold) {
      navbar.classList.remove('nav-hidden');
      navbar.classList.add('nav-visible');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Scrolling down - hide navbar
    if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
      navbar.classList.add('nav-hidden');
      navbar.classList.remove('nav-visible');
    }
    // Scrolling up - show navbar
    else if (currentScrollY < lastScrollY) {
      navbar.classList.remove('nav-hidden');
      navbar.classList.add('nav-visible');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  // Throttled scroll handler
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Initial state
  navbar.classList.add('nav-visible');

})();
