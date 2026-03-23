/**
 * MOBILE PREMIUM PRO - Mind Blowing Animations
 * Top Model Mobile Experience
 */

(function() {
  'use strict';

  // Only run on mobile
  if (window.innerWidth > 768) return;

  // ============================================
  // SCROLL REVEAL OBSERVER
  // ============================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .stagger-children'
    );

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Trigger stagger children if parent
          if (entry.target.classList.contains('stagger-children')) {
            entry.target.classList.add('revealed');
          }
          
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ============================================
  // PARALLAX SCROLL EFFECT
  // ============================================
  function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-fast');
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const speed = el.classList.contains('parallax-fast') ? 0.8 : 0.4;
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = (scrollY - el.offsetTop) * speed * 0.1;
          el.style.transform = `translateY(${yPos}px)`;
        }
      });
      
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================
  // MAGNETIC BUTTON EFFECT
  // ============================================
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-magnetic');
    
    buttons.forEach(btn => {
      btn.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = btn.getBoundingClientRect();
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      }, { passive: true });
      
      btn.addEventListener('touchend', () => {
        btn.style.transform = 'translate(0, 0)';
      }, { passive: true });
    });
  }

  // ============================================
  // 3D CARD TILT EFFECT
  // ============================================
  function initCardTilt() {
    const cards = document.querySelectorAll('.card-3d-premium');
    
    cards.forEach(card => {
      card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        
        const tiltX = (y - 0.5) * 10;
        const tiltY = (x - 0.5) * -10;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
      }, { passive: true });
      
      card.addEventListener('touchend', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      }, { passive: true });
    });
  }

  // ============================================
  // NUMBER COUNTER ANIMATION
  // ============================================
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number-premium');
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.textContent);
          const suffix = counter.textContent.replace(/[0-9]/g, '');
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          
          const updateCounter = () => {
            current += step;
            if (current < target) {
              counter.textContent = Math.floor(current) + suffix;
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target + suffix;
            }
          };
          
          updateCounter();
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHORS
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ============================================
  // SWIPE DETECTION FOR CAROUSELS
  // ============================================
  function initSwipeDetection() {
    const swipables = document.querySelectorAll('.swipe-container');
    
    swipables.forEach(container => {
      let startX = 0;
      let currentX = 0;
      
      container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });
      
      container.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
      }, { passive: true });
      
      container.addEventListener('touchend', () => {
        const diff = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
          // Dispatch custom event for carousel
          container.dispatchEvent(new CustomEvent('swipe', {
            detail: { direction: diff > 0 ? 'left' : 'right' }
          }));
        }
      }, { passive: true });
    });
  }

  // ============================================
  // NAVBAR HIDE/SHOW ON SCROLL
  // ============================================
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          
          if (currentScroll > 100) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          
          // Hide on scroll down, show on scroll up
          if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
          } else {
            navbar.style.transform = 'translateY(0)';
          }
          
          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Smooth navbar transition
    navbar.style.transition = 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease';
  }

  // ============================================
  // PAGE TRANSITIONS
  // ============================================
  function initPageTransitions() {
    // Fade in page on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', () => {
      document.body.style.opacity = '1';
    });
    
    // Fade out on link click
    document.querySelectorAll('a').forEach(link => {
      if (link.hostname === window.location.hostname) {
        link.addEventListener('click', (e) => {
          if (!link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            document.body.style.opacity = '0';
            setTimeout(() => {
              window.location = link.href;
            }, 300);
          }
        });
      }
    });
  }

  // ============================================
  // INITIALIZE ALL
  // ============================================
  function init() {
    initScrollReveal();
    initParallax();
    initMagneticButtons();
    initCardTilt();
    initCounters();
    initSmoothScroll();
    initSwipeDetection();
    initNavbarScroll();
    initPageTransitions();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
