/**
 * DUAL CARD SLIDER
 * Premium floating card with Supermarket/Brand toggle
 */

(function() {
  'use strict';

  // Only run on mobile
  if (window.innerWidth > 768) return;

  function initDualCardSlider() {
    const containers = document.querySelectorAll('.dual-card-container');
    
    containers.forEach(container => {
      const slider = container.querySelector('.dual-card-slider');
      const toggleBtns = container.querySelectorAll('.toggle-btn');
      const supermarketBtn = container.querySelector('.toggle-btn[data-face="supermarket"]');
      const brandBtn = container.querySelector('.toggle-btn[data-face="brand"]');
      
      if (!slider) return;

      let currentFace = 'supermarket';
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

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

      // Touch swipe handlers
      slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        slider.style.transition = 'none';
      }, { passive: true });

      slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const rotation = currentFace === 'supermarket' ? diff * 0.1 : 180 + diff * 0.1;
        
        // Limit rotation during drag
        if (currentFace === 'supermarket' && rotation > 0 && rotation < 90) {
          slider.style.transform = `rotateY(${rotation}deg)`;
        } else if (currentFace === 'brand' && rotation > 90 && rotation < 270) {
          slider.style.transform = `rotateY(${rotation}deg)`;
        }
      }, { passive: true });

      slider.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        slider.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const diff = currentX - startX;
        const threshold = 50;

        // Determine flip direction based on swipe
        if (currentFace === 'supermarket' && diff < -threshold) {
          flipCard('brand');
        } else if (currentFace === 'brand' && diff > threshold) {
          flipCard('supermarket');
        } else {
          // Snap back to current face
          flipCard(currentFace);
        }
      }, { passive: true });

      // Auto-rotate every 8 seconds if user hasn't interacted
      let autoRotateInterval;
      let userInteracted = false;

      function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
          if (!userInteracted) {
            const nextFace = currentFace === 'supermarket' ? 'brand' : 'supermarket';
            flipCard(nextFace);
          }
        }, 8000);
      }

      function stopAutoRotate() {
        clearInterval(autoRotateInterval);
      }

      // Detect user interaction
      slider.addEventListener('touchstart', () => {
        userInteracted = true;
        stopAutoRotate();
      }, { passive: true });

      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          userInteracted = true;
          stopAutoRotate();
        });
      });

      // Start auto-rotate after 3 seconds
      setTimeout(startAutoRotate, 3000);

      // Pause when not visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!userInteracted) startAutoRotate();
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
