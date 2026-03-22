/**
 * DALA Technologies - Animation Library
 * Scroll-triggered animations, micro-interactions, and visual enhancements
 */

(function() {
  'use strict';

  // ==========================================
  // INTERSECTION OBSERVER UTILITY
  // ==========================================
  class ScrollAnimator {
    constructor() {
      this.observers = new Map();
      this.init();
    }

    init() {
      // Default observer for fade-in animations
      this.createObserver('fade-in', {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }, (entry, target) => {
        if (entry.isIntersecting) {
          target.classList.add('is-visible');
          // Trigger child stagger animations
          const staggerChildren = target.querySelectorAll('.stagger-child');
          staggerChildren.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('is-visible');
            }, index * 100);
          });
        }
      });

      // Counter animation observer
      this.createObserver('counter', {
        threshold: 0.5
      }, (entry, target) => {
        if (entry.isIntersecting && !target.classList.contains('counted')) {
          target.classList.add('counted');
          this.animateCounter(target);
        }
      });

      // Reveal up observer (for sections)
      this.createObserver('reveal-up', {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      }, (entry, target) => {
        if (entry.isIntersecting) {
          target.classList.add('is-visible');
        }
      });
    }

    createObserver(name, options, callback) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => callback(entry, entry.target));
      }, options);

      this.observers.set(name, observer);
    }

    observe(element, observerName) {
      const observer = this.observers.get(observerName);
      if (observer && element) {
        observer.observe(element);
      }
    }

    animateCounter(element) {
      const target = parseInt(element.dataset.target) || 0;
      const suffix = element.dataset.suffix || '';
      const prefix = element.dataset.prefix || '';
      const duration = parseInt(element.dataset.duration) || 2000;
      
      let startTime = null;
      const startValue = 0;

      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

      const updateCounter = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        
        const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
        element.textContent = prefix + currentValue.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    }
  }

  // ==========================================
  // FLOATING ELEMENTS
  // ==========================================
  class FloatingElements {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      const floaters = document.querySelectorAll('.float-element');
      floaters.forEach((el, index) => {
        this.elements.push({
          el: el,
          speed: parseFloat(el.dataset.speed) || 1,
          amplitude: parseFloat(el.dataset.amplitude) || 20,
          phase: (index * Math.PI) / 3
        });
      });

      this.animate();
    }

    animate() {
      const time = Date.now() / 1000;
      
      this.elements.forEach(item => {
        const y = Math.sin(time * item.speed + item.phase) * item.amplitude;
        const x = Math.cos(time * item.speed * 0.5 + item.phase) * (item.amplitude * 0.3);
        item.el.style.transform = `translate(${x}px, ${y}px)`;
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================
  // MAGNETIC BUTTONS
  // ==========================================
  class MagneticButtons {
    constructor() {
      this.buttons = [];
      this.init();
    }

    init() {
      const magneticElements = document.querySelectorAll('.magnetic');
      
      magneticElements.forEach(btn => {
        btn.addEventListener('mousemove', (e) => this.handleMouseMove(e, btn));
        btn.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, btn));
      });
    }

    handleMouseMove(e, btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const strength = parseFloat(btn.dataset.magnetic) || 0.3;
      
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    }

    handleMouseLeave(e, btn) {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        btn.style.transition = '';
      }, 300);
    }
  }

  // ==========================================
  // PARALLAX LAYERS
  // ==========================================
  class ParallaxLayers {
    constructor() {
      this.layers = [];
      this.init();
    }

    init() {
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach(el => {
        this.layers.push({
          el: el,
          speed: parseFloat(el.dataset.parallax) || 0.5
        });
      });

      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }

    handleScroll() {
      const scrolled = window.pageYOffset;
      
      this.layers.forEach(layer => {
        const yPos = -(scrolled * layer.speed);
        layer.el.style.transform = `translateY(${yPos}px)`;
      });
    }
  }

  // ==========================================
  // MARQUEE ANIMATION
  // ==========================================
  class MarqueeAnimation {
    constructor(container, options = {}) {
      this.container = container;
      this.speed = options.speed || 1;
      this.direction = options.direction || 'left';
      this.pauseOnHover = options.pauseOnHover !== false;
      this.init();
    }

    init() {
      const track = this.container.querySelector('.marquee-track');
      if (!track) return;

      // Clone content for seamless loop
      const content = track.innerHTML;
      track.innerHTML = content + content;

      let position = 0;
      let isPaused = false;

      const animate = () => {
        if (!isPaused) {
          position += this.direction === 'left' ? -this.speed : this.speed;
          const trackWidth = track.scrollWidth / 2;
          
          if (Math.abs(position) >= trackWidth) {
            position = 0;
          }
          
          track.style.transform = `translateX(${position}px)`;
        }
        requestAnimationFrame(animate);
      };

      if (this.pauseOnHover) {
        this.container.addEventListener('mouseenter', () => isPaused = true);
        this.container.addEventListener('mouseleave', () => isPaused = false);
      }

      animate();
    }
  }

  // ==========================================
  // LINE DRAW ANIMATION
  // ==========================================
  class LineDrawAnimation {
    constructor() {
      this.init();
    }

    init() {
      const lines = document.querySelectorAll('.draw-line');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
          }
        });
      }, { threshold: 0.5 });

      lines.forEach(line => observer.observe(line));
    }
  }

  // ==========================================
  // TYPEWRITER EFFECT
  // ==========================================
  class TypewriterEffect {
    constructor(element, options = {}) {
      this.element = element;
      this.text = element.textContent;
      this.speed = options.speed || 50;
      this.delay = options.delay || 0;
      this.cursor = options.cursor !== false;
      this.init();
    }

    init() {
      this.element.textContent = '';
      this.element.classList.add('typewriter');
      
      if (this.cursor) {
        this.cursorEl = document.createElement('span');
        this.cursorEl.className = 'typewriter-cursor';
        this.element.appendChild(this.cursorEl);
      }

      setTimeout(() => this.type(), this.delay);
    }

    type(index = 0) {
      if (index < this.text.length) {
        if (this.cursorEl) {
          this.element.insertBefore(
            document.createTextNode(this.text.charAt(index)),
            this.cursorEl
          );
        } else {
          this.element.textContent += this.text.charAt(index);
        }
        setTimeout(() => this.type(index + 1), this.speed);
      } else if (this.cursorEl) {
        this.cursorEl.remove();
      }
    }
  }

  // ==========================================
  // SHINE EFFECT
  // ==========================================
  class ShineEffect {
    constructor() {
      this.init();
    }

    init() {
      const shineElements = document.querySelectorAll('.shine-effect');
      
      shineElements.forEach(el => {
        el.addEventListener('mousemove', (e) => this.handleMouseMove(e, el));
        el.addEventListener('mouseleave', (e) => this.handleMouseLeave(el));
      });
    }

    handleMouseMove(e, el) {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      el.style.setProperty('--shine-x', `${x}%`);
      el.style.setProperty('--shine-y', `${y}%`);
      el.classList.add('shining');
    }

    handleMouseLeave(el) {
      el.classList.remove('shining');
    }
  }

  // ==========================================
  // PROGRESSIVE REVEAL FOR IMAGES
  // ==========================================
  class ProgressiveImageReveal {
    constructor() {
      this.init();
    }

    init() {
      const images = document.querySelectorAll('.reveal-image');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      }, { threshold: 0.3 });

      images.forEach(img => observer.observe(img));
    }
  }

  // ==========================================
  // INITIALIZE ALL ANIMATIONS
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize core animation system
    const scrollAnimator = new ScrollAnimator();
    
    // Initialize floating elements
    new FloatingElements();
    
    // Initialize magnetic buttons
    new MagneticButtons();
    
    // Initialize parallax
    new ParallaxLayers();
    
    // Initialize line draw
    new LineDrawAnimation();
    
    // Initialize shine effects
    new ShineEffect();
    
    // Initialize progressive image reveal
    new ProgressiveImageReveal();

    // Initialize marquees
    document.querySelectorAll('.marquee-container').forEach(container => {
      new MarqueeAnimation(container, {
        speed: parseFloat(container.dataset.speed) || 1,
        direction: container.dataset.direction || 'left'
      });
    });

    // Observe elements with data-animate attributes
    document.querySelectorAll('[data-animate]').forEach(el => {
      const animationType = el.dataset.animate;
      scrollAnimator.observe(el, animationType);
    });

    // Observe counter elements
    document.querySelectorAll('[data-counter]').forEach(el => {
      scrollAnimator.observe(el, 'counter');
    });

    // Observe reveal-up sections
    document.querySelectorAll('.reveal-section').forEach(el => {
      scrollAnimator.observe(el, 'reveal-up');
    });

    // Observe stagger containers
    document.querySelectorAll('.stagger-container').forEach(el => {
      scrollAnimator.observe(el, 'fade-in');
    });

    // Initialize typewriter effects
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      new TypewriterEffect(el, {
        speed: parseInt(el.dataset.typewriterSpeed) || 50,
        delay: parseInt(el.dataset.typewriterDelay) || 0
      });
    });

    // Testimonials Slider
    const testimonialsSlider = document.getElementById('testimonialsSlider');
    const testimonialPrev = document.getElementById('testimonialPrev');
    const testimonialNext = document.getElementById('testimonialNext');
    const testimonialsDots = document.getElementById('testimonialsDots');
    
    if (testimonialsSlider && testimonialPrev && testimonialNext) {
      const slides = testimonialsSlider.querySelectorAll('.testimonial-slide');
      const dots = testimonialsDots ? testimonialsDots.querySelectorAll('.dot') : [];
      let currentSlide = 0;
      let autoPlayInterval;
      
      const showSlide = (index) => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
        
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
      };
      
      const nextSlide = () => {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
      };
      
      const prevSlide = () => {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
      };
      
      testimonialNext.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
      });
      
      testimonialPrev.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
      });
      
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
          resetAutoPlay();
        });
      });
      
      // Auto-play functionality
      const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
      };
      
      const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        startAutoPlay();
      };
      
      startAutoPlay();
      
      // Pause on hover
      testimonialsSlider.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
      });
      
      testimonialsSlider.addEventListener('mouseleave', () => {
        startAutoPlay();
      });
    }

    // Benefits Slider (for-brands page)
    const benefitsSlider = document.getElementById('benefitsSlider');
    const benefitsPrev = document.getElementById('benefitsPrev');
    const benefitsNext = document.getElementById('benefitsNext');
    const benefitsDots = document.getElementById('benefitsDots');
    
    if (benefitsSlider && benefitsPrev && benefitsNext) {
      const slides = benefitsSlider.querySelectorAll('.benefit-slide');
      const dots = benefitsDots ? benefitsDots.querySelectorAll('.dot') : [];
      let currentBenefitSlide = 0;
      let benefitAutoPlayInterval;
      
      const showBenefitSlide = (index) => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
        
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        
        currentBenefitSlide = index;
      };
      
      const nextBenefitSlide = () => {
        const next = (currentBenefitSlide + 1) % slides.length;
        showBenefitSlide(next);
      };
      
      const prevBenefitSlide = () => {
        const prev = (currentBenefitSlide - 1 + slides.length) % slides.length;
        showBenefitSlide(prev);
      };
      
      benefitsNext.addEventListener('click', () => {
        nextBenefitSlide();
        resetBenefitAutoPlay();
      });
      
      benefitsPrev.addEventListener('click', () => {
        prevBenefitSlide();
        resetBenefitAutoPlay();
      });
      
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showBenefitSlide(index);
          resetBenefitAutoPlay();
        });
      });
      
      // Auto-play functionality
      const startBenefitAutoPlay = () => {
        benefitAutoPlayInterval = setInterval(nextBenefitSlide, 6000);
      };
      
      const resetBenefitAutoPlay = () => {
        clearInterval(benefitAutoPlayInterval);
        startBenefitAutoPlay();
      };
      
      startBenefitAutoPlay();
      
      // Pause on hover
      benefitsSlider.addEventListener('mouseenter', () => {
        clearInterval(benefitAutoPlayInterval);
      });
      
      benefitsSlider.addEventListener('mouseleave', () => {
        startBenefitAutoPlay();
      });
      
      // Touch/swipe support for mobile
      let touchStartX = 0;
      let touchEndX = 0;
      
      benefitsSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      benefitsSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
      
      const handleSwipe = () => {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
          nextBenefitSlide();
          resetBenefitAutoPlay();
        } else if (touchEndX - touchStartX > swipeThreshold) {
          prevBenefitSlide();
          resetBenefitAutoPlay();
        }
      };
    }

    // Navbar scroll behavior
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
        
        lastScroll = currentScroll;
      }, { passive: true });
    }

    // ==========================================
    // PREMIUM CRYSTAL ISLAND
    // ==========================================
    const crystalIsland = document.getElementById('crystalIsland');
    const crystalSection = document.getElementById('crystalSection');
    
    if (crystalIsland) {
      const hub = crystalIsland.querySelector('.crystal-hub');
      const satellites = crystalIsland.querySelectorAll('.crystal-satellite');
      
      // 3D Tilt for Hub
      if (hub) {
        const hubInner = hub.querySelector('.crystal-hub-inner');
        
        hub.addEventListener('mousemove', (e) => {
          const rect = hub.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;
          
          hubInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        hub.addEventListener('mouseleave', () => {
          hubInner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
      }
      
      // 3D Tilt for Satellites with depth
      satellites.forEach(satellite => {
        const inner = satellite.querySelector('.satellite-inner');
        const depth = parseFloat(satellite.dataset.depth) || 1;
        
        satellite.addEventListener('mousemove', (e) => {
          const rect = satellite.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -12 * depth;
          const rotateY = ((x - centerX) / centerX) * 12 * depth;
          
          inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${20 * depth}px)`;
        });
        
        satellite.addEventListener('mouseleave', () => {
          inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
      });
      
      // MOBILE TOUCH 3D TILT SUPPORT
      // Enable 3D tilt effects on touch devices for performance
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      if (isTouchDevice && hub) {
        const hubInner = hub.querySelector('.crystal-hub-inner');
        
        // Touch tilt for hub
        hub.addEventListener('touchstart', (e) => {
          const touch = e.touches[0];
          const rect = hub.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;
          
          if (hubInner) {
            hubInner.style.transition = 'transform 0.1s ease';
            hubInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          }
        }, { passive: true });
        
        hub.addEventListener('touchmove', (e) => {
          const touch = e.touches[0];
          const rect = hub.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;
          
          if (hubInner) {
            hubInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          }
        }, { passive: true });
        
        hub.addEventListener('touchend', () => {
          if (hubInner) {
            hubInner.style.transition = 'transform 0.3s ease';
            hubInner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
          }
        }, { passive: true });
      }
      
      // Touch tilt for satellites on mobile
      if (isTouchDevice) {
        satellites.forEach(satellite => {
          const inner = satellite.querySelector('.satellite-inner');
          const depth = parseFloat(satellite.dataset.depth) || 1;
          
          satellite.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = satellite.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -12 * depth;
            const rotateY = ((x - centerX) / centerX) * 12 * depth;
            
            if (inner) {
              inner.style.transition = 'transform 0.1s ease';
              inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${20 * depth}px)`;
            }
          }, { passive: true });
          
          satellite.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = satellite.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -12 * depth;
            const rotateY = ((x - centerX) / centerX) * 12 * depth;
            
            if (inner) {
              inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${20 * depth}px)`;
            }
          }, { passive: true });
          
          satellite.addEventListener('touchend', () => {
            if (inner) {
              inner.style.transition = 'transform 0.3s ease';
              inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            }
          }, { passive: true });
        });
      }
      
      // Scroll reveal animation
      const crystalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Animate hub
            if (hub) {
              hub.style.opacity = '0';
              hub.style.transform = 'translate(-50%, -50%) translateZ(100px) scale(0.8)';
              setTimeout(() => {
                hub.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                hub.style.opacity = '1';
                hub.style.transform = 'translate(-50%, -50%) translateZ(50px)';
              }, 100);
            }
            
            // Animate satellites with stagger
            satellites.forEach((sat, index) => {
              const delay = 200 + (index * 150);
              sat.style.opacity = '0';
              setTimeout(() => {
                sat.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                sat.style.opacity = '1';
              }, delay);
            });
            
            // Trigger counters
            setTimeout(() => {
              crystalIsland.querySelectorAll('.hub-number[data-count]').forEach(num => {
                const target = parseInt(num.dataset.count);
                animateCrystalCounter(num, target);
              });
            }, 500);
            
            crystalObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      crystalObserver.observe(crystalIsland);
      
      // Counter animation
      function animateCrystalCounter(element, target) {
        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            element.textContent = target;
          }
        };
        
        updateCounter();
      }
      
      // Parallax on scroll for crystal elements
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.pageYOffset;
            const sectionTop = crystalSection.offsetTop;
            const sectionHeight = crystalSection.offsetHeight;
            
            if (scrollY > sectionTop - window.innerHeight && 
                scrollY < sectionTop + sectionHeight) {
              const progress = (scrollY - sectionTop + window.innerHeight) / (sectionHeight + window.innerHeight);
              
              satellites.forEach((sat, index) => {
                const depth = parseFloat(sat.dataset.depth) || 1;
                const floatY = Math.sin(progress * Math.PI * 2 + index) * 10 * depth;
                sat.style.transform = sat.style.transform.replace(/translateY\([^)]*\)/, '') + ` translateY(${floatY}px)`;
              });
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  });

  // Expose classes globally for manual initialization
  window.DALAAnimations = {
    ScrollAnimator,
    FloatingElements,
    MagneticButtons,
    ParallaxLayers,
    MarqueeAnimation,
    LineDrawAnimation,
    TypewriterEffect,
    ShineEffect,
    ProgressiveImageReveal
  };

})();
