(function () {
  'use strict';

  const homepage = document.body.classList.contains('homepage');
  if (!homepage) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markHomeReady() {
    window.requestAnimationFrame(() => {
      document.body.classList.add('home-loaded');
    });
  }

  function initSectionReveal() {
    const selectors = [
      '.retailer-proof-section .logo-section-header',
      '.retailer-proof-section .brand-marquee',
      '.homepage-bifurcation-section .section-header',
      '.homepage-bifurcation-section .static-card',
      '.brand-proof-section .logo-section-header',
      '.brand-proof-section .brand-marquee',
      '.homepage-proof-section .testimonials-header',
      '.homepage-proof-section .testimonials-slider-container',
      '.homepage-proof-section .testimonials-cta',
      '.homepage-final-cta .cta-container'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    if (!elements.length) return;

    elements.forEach((element) => {
      element.setAttribute('data-home-reveal', '');
    });

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    });

    elements.forEach((element) => observer.observe(element));
  }

  function initHeroDepth() {
    if (prefersReducedMotion) return;

    const hero = document.querySelector('.homepage-hero');
    const heroContainer = hero?.querySelector('.hero-container');
    const atmosphere = hero?.querySelector('.hero-atmosphere');
    if (!hero || !heroContainer || !atmosphere) return;

    let ticking = false;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      const containerShift = progress * 26;
      const atmosphereShift = progress * 42;

      heroContainer.style.transform = `translate3d(0, ${containerShift}px, 0)`;
      atmosphere.style.transform = `translate3d(0, ${atmosphereShift}px, 0)`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  function initTestimonialsSlider() {
    const slider = document.getElementById('testimonialsSlider');
    const prevButton = document.getElementById('testimonialPrev');
    const nextButton = document.getElementById('testimonialNext');
    const dots = document.querySelectorAll('#testimonialsDots .dot');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.testimonial-slide'));
    if (!slides.length) return;

    let currentIndex = slides.findIndex((slide) => slide.classList.contains('active'));
    if (currentIndex < 0) currentIndex = 0;

    const rotateDelay = 6500;
    let autoAdvance = null;
    let isPaused = false;
    let touchStartX = 0;
    let touchEndX = 0;

    function showSlide(nextIndex) {
      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
        dot.setAttribute('aria-pressed', String(index === currentIndex));
      });
    }

    function startAutoAdvance() {
      if (prefersReducedMotion || autoAdvance) return;
      autoAdvance = window.setInterval(() => {
        if (!isPaused) showSlide(currentIndex + 1);
      }, rotateDelay);
    }

    function stopAutoAdvance() {
      if (!autoAdvance) return;
      window.clearInterval(autoAdvance);
      autoAdvance = null;
    }

    function pauseAutoAdvance() {
      isPaused = true;
    }

    function resumeAutoAdvance() {
      isPaused = false;
    }

    prevButton?.addEventListener('click', () => {
      showSlide(currentIndex - 1);
      pauseAutoAdvance();
    });

    nextButton?.addEventListener('click', () => {
      showSlide(currentIndex + 1);
      pauseAutoAdvance();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        pauseAutoAdvance();
      });
    });

    slider.addEventListener('mouseenter', pauseAutoAdvance);
    slider.addEventListener('mouseleave', resumeAutoAdvance);
    slider.addEventListener('focusin', pauseAutoAdvance);
    slider.addEventListener('focusout', resumeAutoAdvance);

    slider.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
      pauseAutoAdvance();
    }, { passive: true });

    slider.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].clientX;
      const delta = touchStartX - touchEndX;
      if (Math.abs(delta) > 42) {
        showSlide(delta > 0 ? currentIndex + 1 : currentIndex - 1);
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoAdvance();
      } else {
        startAutoAdvance();
      }
    });

    showSlide(currentIndex);
    startAutoAdvance();
  }

  function initHomepage() {
    markHomeReady();
    initSectionReveal();
    initHeroDepth();
    initTestimonialsSlider();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepage);
  } else {
    initHomepage();
  }
})();
