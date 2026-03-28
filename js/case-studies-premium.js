/**
 * DALA Case Studies - Premium Interactions
 * Sophisticated animations and smooth interactions
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    revealThreshold: 0.15,
    revealRootMargin: '0px 0px -50px 0px',
    parallaxElements: true,
    smoothScroll: true
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const debounce = (fn, delay = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const throttle = (fn, limit = 16) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ============================================
  // REVEAL ANIMATIONS (Intersection Observer)
  // ============================================
  class RevealAnimation {
    constructor() {
      this.elements = document.querySelectorAll('.premium-reveal');
      this.observer = null;
      this.init();
    }

    init() {
      if (!this.elements.length) return;

      const options = {
        root: null,
        rootMargin: CONFIG.revealRootMargin,
        threshold: CONFIG.revealThreshold
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.reveal(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      this.elements.forEach(el => this.observer.observe(el));
    }

    reveal(element) {
      // Add stagger delay for child elements
      const children = element.querySelectorAll('.premium-reveal-child');
      children.forEach((child, index) => {
        child.style.transitionDelay = `${index * 80}ms`;
      });

      // Trigger reveal
      requestAnimationFrame(() => {
        element.classList.add('revealed');
      });

      // Animate numbers if present
      this.animateNumbers(element);
    }

    animateNumbers(element) {
      const numbers = element.querySelectorAll('.premium-animate-number');
      numbers.forEach(num => {
        const target = parseInt(num.dataset.target, 10);
        const suffix = num.dataset.suffix || '';
        const prefix = num.dataset.prefix || '';
        const duration = parseInt(num.dataset.duration, 10) || 2000;
        
        this.countUp(num, target, prefix, suffix, duration);
      });
    }

    countUp(element, target, prefix, suffix, duration) {
      const startTime = performance.now();
      const startValue = 0;
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out expo
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(startValue + (target - startValue) * easeProgress);
        
        element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // ============================================
  // PARALLAX EFFECTS
  // ============================================
  class ParallaxEffect {
    constructor() {
      this.elements = document.querySelectorAll('[data-parallax]');
      this.ticking = false;
      this.init();
    }

    init() {
      if (!this.elements.length) return;
      window.addEventListener('scroll', throttle(() => this.update(), 16), { passive: true });
    }

    update() {
      if (this.ticking) return;
      
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;

        this.elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const speed = parseFloat(el.dataset.parallax) || 0.5;
          
          if (rect.top < windowHeight && rect.bottom > 0) {
            const offset = (scrollY - el.offsetTop + windowHeight) * speed;
            el.style.transform = `translateY(${offset}px)`;
          }
        });
        
        this.ticking = false;
      });
      
      this.ticking = true;
    }
  }

  // ============================================
  // HERO LOADING ANIMATION
  // ============================================
  class HeroLoader {
    constructor() {
      this.hero = document.querySelector('.premium-hero');
      this.bg = document.querySelector('.premium-hero-bg img');
      this.init();
    }

    init() {
      if (!this.hero) return;

      // Add loaded class when image is ready
      if (this.bg) {
        if (this.bg.complete) {
          this.onLoad();
        } else {
          this.bg.addEventListener('load', () => this.onLoad());
        }
      } else {
        this.onLoad();
      }
    }

    onLoad() {
      setTimeout(() => {
        this.hero.classList.add('loaded');
      }, 100);
    }
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      this.init();
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => this.handleClick(e));
      });
    }

    handleClick(e) {
      const href = e.currentTarget.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      
      const offset = target.getBoundingClientRect().top + window.pageYOffset;
      const headerOffset = 80;
      
      window.scrollTo({
        top: offset - headerOffset,
        behavior: 'smooth'
      });
    }
  }

  // ============================================
  // NAVIGATION SHADOW ON SCROLL
  // ============================================
  class NavigationScroll {
    constructor() {
      this.navbar = document.querySelector('.navbar');
      this.lastScroll = 0;
      this.init();
    }

    init() {
      if (!this.navbar) return;
      window.addEventListener('scroll', throttle(() => this.update(), 16), { passive: true });
    }

    update() {
      const currentScroll = window.pageYOffset;
      
      // Add/remove background
      if (currentScroll > 100) {
        this.navbar.classList.add('navbar-scrolled');
      } else {
        this.navbar.classList.remove('navbar-scrolled');
      }
      
      this.lastScroll = currentScroll;
    }
  }

  // ============================================
  // STORY CARD HOVER EFFECTS
  // ============================================
  class StoryCardEffects {
    constructor() {
      this.cards = document.querySelectorAll('.premium-story');
      this.init();
    }

    init() {
      this.cards.forEach(card => {
        card.addEventListener('mouseenter', () => this.onEnter(card));
        card.addEventListener('mouseleave', () => this.onLeave(card));
      });
    }

    onEnter(card) {
      // Pause other cards slightly for focus effect
      this.cards.forEach(c => {
        if (c !== card) {
          c.style.opacity = '0.7';
          c.style.transform = 'scale(0.98)';
        }
      });
    }

    onLeave(card) {
      // Reset all cards
      this.cards.forEach(c => {
        c.style.opacity = '';
        c.style.transform = '';
      });
    }
  }

  // ============================================
  // TEXT REVEAL ANIMATION (Character by character)
  // ============================================
  class TextReveal {
    constructor() {
      this.elements = document.querySelectorAll('[data-text-reveal]');
      this.init();
    }

    init() {
      this.elements.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        
        // Wrap each character in span
        text.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.opacity = '0';
          span.style.transform = 'translateY(20px)';
          span.style.display = 'inline-block';
          span.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 30}ms`;
          el.appendChild(span);
        });

        // Trigger animation when visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.querySelectorAll('span').forEach(span => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
              });
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.5 });

        observer.observe(el);
      });
    }
  }

  // ============================================
  // MAGNETIC BUTTON EFFECT
  // ============================================
  class MagneticButton {
    constructor() {
      this.buttons = document.querySelectorAll('.premium-magnetic');
      this.init();
    }

    init() {
      this.buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => this.onMove(e, btn));
        btn.addEventListener('mouseleave', () => this.onLeave(btn));
      });
    }

    onMove(e, btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    }

    onLeave(btn) {
      btn.style.transform = '';
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    new RevealAnimation();
    new ParallaxEffect();
    new HeroLoader();
    new SmoothScroll();
    new NavigationScroll();
    new StoryCardEffects();
    new TextReveal();
    new MagneticButton();

    // Add loaded class to body for initial animations
    document.body.classList.add('page-loaded');
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    // Any cleanup needed
  });

})();
