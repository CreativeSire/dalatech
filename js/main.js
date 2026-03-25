/**
 * DALA Technologies - Main JavaScript
 * The Retail Execution Control Layer
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initNavigation();
  initScrollAnimations();
  initWhatsAppChat();
  initSmoothScroll();
  initMobileReveal();
  initParallaxScroll();
});

/**
 * Navigation functionality
 */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
    });
  }
  
  // Close mobile menu on link click
  const links = navLinks?.querySelectorAll('a');
  links?.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    });
  });
}

/**
 * Scroll animations using Intersection Observer
 */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  fadeElements.forEach(el => observer.observe(el));
}

/**
 * WhatsApp Floating Chat
 */
function initWhatsAppChat() {
  const whatsappButton = document.querySelector('.whatsapp-button');
  const whatsappChat = document.querySelector('.whatsapp-chat');
  const whatsappClose = document.querySelector('.whatsapp-close');
  
  if (!whatsappButton || !whatsappChat) return;
  
  // Toggle chat
  whatsappButton.addEventListener('click', () => {
    whatsappChat.classList.toggle('active');
  });
  
  // Close chat
  if (whatsappClose) {
    whatsappClose.addEventListener('click', () => {
      whatsappChat.classList.remove('active');
    });
  }
  
  // Handle chat options
  const chatOptions = document.querySelectorAll('.chat-option');
  chatOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.type;
      
      let message = '';
      
      if (type === 'brand') {
        message = "Hello! I'm interested in listing my brand with DALA Technologies.";
      } else if (type === 'retailer') {
        message = "Hello! I'm a retailer interested in partnering with DALA Technologies.";
      }
      
      // Open WhatsApp with the message
      const phoneNumber = '2348148824115'; // DALA's WhatsApp number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  });
  
  // Close chat when clicking outside
  document.addEventListener('click', (e) => {
    if (!whatsappButton.contains(e.target) && !whatsappChat.contains(e.target)) {
      whatsappChat.classList.remove('active');
    }
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Form validation helper
 */
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('error');
      
      // Add error message if not exists
      let errorMsg = input.parentElement.querySelector('.error-message');
      if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.style.color = '#E53935';
        errorMsg.style.fontSize = '0.875rem';
        errorMsg.style.marginTop = '4px';
        errorMsg.style.display = 'block';
        input.parentElement.appendChild(errorMsg);
      }
      errorMsg.textContent = 'This field is required';
    } else {
      input.classList.remove('error');
      const errorMsg = input.parentElement.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
    }
  });
  
  return isValid;
}

/**
 * Add CSS for form errors
 */
const style = document.createElement('style');
style.textContent = `
  .form-input.error,
  .form-textarea.error,
  .form-select.error {
    border-color: #E53935 !important;
  }
  
  .form-input.error:focus,
  .form-textarea.error:focus,
  .form-select.error:focus {
    box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1) !important;
  }
`;
document.head.appendChild(style);

// Initialize form validation on all forms
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    if (!validateForm(form)) {
      e.preventDefault();
    }
  });
});


/**
 * Mobile Reveal Animations
 * Premium scroll-triggered animations for mobile
 */
function initMobileReveal() {
  // Only run on mobile
  if (window.innerWidth > 768) return;

  const revealElements = document.querySelectorAll('.reveal-mobile, .reveal-left, .reveal-right, .stagger-children');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * Parallax Scroll Effect for Mobile
 * Subtle parallax on scroll for depth
 */
function initParallaxScroll() {
  // Only run on mobile
  if (window.innerWidth > 768) return;

  const parallaxElements = document.querySelectorAll('.parallax-mobile');
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = el.dataset.speed || 0.5;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const yPos = (rect.top - window.innerHeight / 2) * speed * 0.1;
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

/**
 * Touch Feedback Enhancement
 * Adds active states for better touch feedback
 */
function initTouchFeedback() {
  // Add touch feedback to all buttons and links
  const touchElements = document.querySelectorAll('a, button, .btn, .card-3d, .side-card');
  
  touchElements.forEach(el => {
    el.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    }, { passive: true });
    
    el.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    }, { passive: true });
  });
}

// Initialize touch feedback
document.addEventListener('DOMContentLoaded', initTouchFeedback);


/**
 * ============================================
 * MOBILE SLIDERS - Story, Trust, Values
 * ============================================
 */

// Story Section Mobile Slider
function initStorySlider() {
  const track = document.getElementById('storyTrack');
  if (!track) return;
  
  const cards = track.querySelectorAll('.story-3d-card');
  const dots = document.querySelectorAll('.story-dot');
  let currentIndex = 0;
  const totalCards = cards.length;
  
  function goToSlide(index) {
    if (index < 0) index = totalCards - 1;
    if (index >= totalCards) index = 0;
    
    currentIndex = index;
    
    // Move track
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update cards
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === currentIndex);
    });
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }
  
  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });
  
  // Auto-advance
  setInterval(() => {
    goToSlide(currentIndex + 1);
  }, 5000);
  
  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
  }
}

// Trust Section Mobile Slider
function initTrustSlider() {
  const track = document.getElementById('trustSlider');
  if (!track) return;
  
  const slides = track.querySelectorAll('.trust-slide');
  const dots = document.querySelectorAll('.trust-dot');
  const prevBtn = document.getElementById('trustPrev');
  const nextBtn = document.getElementById('trustNext');
  
  if (!slides.length) return;
  
  let currentIndex = 0;
  const totalSlides = slides.length;
  
  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentIndex = index;
    
    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }
  
  // Button handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }
  
  // Dot handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });
  
  // Auto-advance
  setInterval(() => {
    goToSlide(currentIndex + 1);
  }, 6000);
  
  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
  }
}

// Values Section Mobile Slider
function initValuesSlider() {
  const track = document.querySelector('.values-slider-track');
  if (!track) return;
  
  const slides = track.querySelectorAll('.values-slide');
  const dots = document.querySelectorAll('.values-slider-dot');
  const prevBtn = document.querySelector('.values-nav-btn.prev');
  const nextBtn = document.querySelector('.values-nav-btn.next');
  
  if (!slides.length) return;
  
  let currentIndex = 0;
  const totalSlides = slides.length;
  
  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }
  
  // Button handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }
  
  // Dot handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });
  
  // Auto-advance
  setInterval(() => {
    goToSlide(currentIndex + 1);
  }, 5000);
  
  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
  }
}

// Initialize all mobile sliders on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initStorySlider();
  initTrustSlider();
  initValuesSlider();
});
