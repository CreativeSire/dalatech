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
