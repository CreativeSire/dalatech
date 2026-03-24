/**
 * DUAL CARD SLIDER
 * Premium floating card with Supermarket/Brand toggle
 */

(function() {
  'use strict';

  // Run on all devices (mobile and desktop)

  function initDualCardSlider() {
    const containers = document.querySelectorAll('.dual-card-container');
    
    containers.forEach(container => {
      const slider = container.querySelector('.dual-card-slider');
      const toggleBtns = container.querySelectorAll('.toggle-btn');
      const supermarketBtn = container.querySelector('.toggle-btn[data-face="supermarket"]');
      const brandBtn = container.querySelector('.toggle-btn[data-face="brand"]');
      
      if (!slider) return;

      let currentFace = 'supermarket';

      // Toggle button click handlers
      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const face = btn.dataset.face;
          if (face !== currentFace) {
            flipCard(face);
          }
        });
      });

      // Flip card function
      function flipCard(face) {
        currentFace = face;
        
        if (face === 'brand') {
          slider.classList.add('flipped');
          brandBtn.classList.add('active');
          supermarketBtn.classList.remove('active');
        } else {
          slider.classList.remove('flipped');
          supermarketBtn.classList.add('active');
          brandBtn.classList.remove('active');
        }

        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }

      // Swipe functionality removed - using toggle buttons only

      // Auto-rotate every 10 seconds
      let autoRotateInterval;

      function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
          const nextFace = currentFace === 'supermarket' ? 'brand' : 'supermarket';
          flipCard(nextFace);
        }, 10000);
      }

      function stopAutoRotate() {
        clearInterval(autoRotateInterval);
      }

      // Stop auto-rotate on toggle button click
      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          stopAutoRotate();
          // Restart after 10 seconds
          setTimeout(startAutoRotate, 10000);
        });
      });

      // Start auto-rotate after 2 seconds
      setTimeout(startAutoRotate, 2000);

      // Pause when not visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAutoRotate();
          } else {
            stopAutoRotate();
          }
        });
      }, { threshold: 0.5 });

      observer.observe(container);
    });
  }

  // Alternative: Slide version
  function initDualCardSlide() {
    const containers = document.querySelectorAll('.dual-card-slide');
    
    containers.forEach(container => {
      const inner = container.querySelector('.dual-card-slide-inner');
      const toggleBtns = container.querySelectorAll('.toggle-btn');
      
      if (!inner) return;

      let currentSlide = 0;

      toggleBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          currentSlide = index;
          updateSlide();
        });
      });

      function updateSlide() {
        if (currentSlide === 0) {
          inner.classList.remove('slide-right');
        } else {
          inner.classList.add('slide-right');
        }

        toggleBtns.forEach((btn, index) => {
          btn.classList.toggle('active', index === currentSlide);
        });
      }

      // Swipe support
      let startX = 0;
      
      container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0 && currentSlide === 0) {
            currentSlide = 1;
            updateSlide();
          } else if (diff < 0 && currentSlide === 1) {
            currentSlide = 0;
            updateSlide();
          }
        }
      }, { passive: true });
    });
  }

  // 3D tilt effect on touch
  function init3DTilt() {
    const cards = document.querySelectorAll('.dual-card-slider, .dual-card-slide');
    
    cards.forEach(card => {
      card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        
        const tiltX = (y - 0.5) * 10;
        const tiltY = (x - 0.5) * -10;
        
        const currentTransform = card.style.transform || '';
        const baseTransform = currentTransform.includes('rotateY(180deg)') ? 'rotateY(180deg)' : '';
        
        card.style.transform = `${baseTransform} perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      }, { passive: true });
      
      card.addEventListener('touchend', () => {
        const currentTransform = card.style.transform || '';
        const baseTransform = currentTransform.includes('rotateY(180deg)') ? 'rotateY(180deg)' : '';
        card.style.transform = baseTransform;
      }, { passive: true });
    });
  }

  // Initialize all
  function init() {
    initDualCardSlider();
    initDualCardSlide();
    init3DTilt();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
