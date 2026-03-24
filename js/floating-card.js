/**
 * FLOATING CARD - Auto-rotating card with pause on touch
 * For "Built For Two Sides of Retail" mobile section
 */

(function() {
  'use strict';

  // Only run on mobile
  if (window.innerWidth > 768) return;

  const container = document.getElementById('dualFloatingCard');
  if (!container) return;

  const slides = container.querySelectorAll('.floating-card-slide');
  const dots = container.querySelectorAll('.floating-dot');
  
  let currentSlide = 0;
  let autoRotateInterval;
  let isPaused = false;
  const rotateDelay = 7000; // 7 seconds

  // Show specific slide
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
  }

  // Next slide
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  // Start auto-rotation
  function startAutoRotate() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, rotateDelay);
  }

  // Stop auto-rotation
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
      autoRotateInterval = null;
    }
  }

  // Pause on touch/click
  function pause() {
    isPaused = true;
    container.classList.add('paused');
  }

  // Resume auto-rotation
  function resume() {
    isPaused = false;
    container.classList.remove('paused');
  }

  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      pause();
      
      // Resume after 10 seconds of inactivity
      setTimeout(() => {
        resume();
      }, 10000);
    });
  });

  // Touch events to pause
  container.addEventListener('touchstart', pause, { passive: true });
  container.addEventListener('touchend', () => {
    // Resume after 5 seconds
    setTimeout(() => {
      resume();
    }, 5000);
  }, { passive: true });

  // Mouse events for desktop testing
  container.addEventListener('mouseenter', pause);
  container.addEventListener('mouseleave', resume);

  // Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
      }
      pause();
      
      // Resume after 10 seconds
      setTimeout(() => {
        resume();
      }, 10000);
    }
  }

  // Start auto-rotation
  startAutoRotate();

  // Handle visibility change (pause when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoRotate();
    } else {
      startAutoRotate();
    }
  });

})();
