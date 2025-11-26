// Motion preference detection shared across behaviors
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = () => prefersReducedMotion.matches;

// Initialize AOS and accessibility enhancements
document.addEventListener('DOMContentLoaded', function() {
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50,
    disable: reduceMotion
  });

  if (reduceMotion()) {
    document.documentElement.classList.add('reduce-motion');
  }

  const handleReduceMotionChange = (event) => {
    document.documentElement.classList.toggle('reduce-motion', event.matches);
  };

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', handleReduceMotionChange);
  } else if (prefersReducedMotion.addListener) {
    prefersReducedMotion.addListener(handleReduceMotionChange);
  }

  // Set current year dynamically
  document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', function() {
    const isOpen = mobileMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  });
}

function closeMobileMenu() {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
    closeMobileMenu();
  }
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: reduceMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    }
    if (this.closest('.mobile-menu')) {
      closeMobileMenu();
    }
  });
});

// Google Analytics Event Tracking
(function() {
  // Helper function to send GA events
  function trackEvent(eventName, category, label) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, {
        'event_category': category,
        'event_label': label
      });
    }
  }

  // CV Download tracking
  const cvLink = document.querySelector('a[href="files/CV.pdf"]');
  if (cvLink) {
    cvLink.addEventListener('click', function() {
      trackEvent('download_cv', 'engagement', 'CV PDF Download');
    });
  }

  // Email link tracking
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function() {
      trackEvent('contact_click', 'engagement', 'Email');
    });
  });

  // Phone link tracking
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
      trackEvent('contact_click', 'engagement', 'Phone');
    });
  });

  // Social link tracking
  const socialLinks = {
    'linkedin.com': 'LinkedIn',
    'github.com': 'GitHub'
  };

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const href = link.getAttribute('href');
    for (const [domain, name] of Object.entries(socialLinks)) {
      if (href && href.includes(domain)) {
        link.addEventListener('click', function() {
          trackEvent('social_click', 'engagement', name);
        });
        break;
      }
    }
  });

  // Section scroll tracking
  const sectionsToTrack = ['experience', 'skills', 'projects', 'education', 'contact'];
  const trackedSections = new Set();

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        if (!trackedSections.has(sectionId)) {
          trackedSections.add(sectionId);
          trackEvent('section_view', 'scroll', sectionId);
        }
      }
    });
  }, observerOptions);

  sectionsToTrack.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      sectionObserver.observe(section);
    }
  });
})();
