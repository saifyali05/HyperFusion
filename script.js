/* =============================================
   HyperFusion 2026 — script.js
   JIS College of Engineering
   Main JavaScript File
   ============================================= */

/* ===== 0. LENIS SMOOTH SCROLL ===== */
const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: true,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

/* ===== 1. LOADING SCREEN ===== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  document.body.classList.add('loading');

  // Simulate loading completion after animation
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    // Trigger reveal animations after load
    revealOnScroll();
  }, 2500);
});


/* ===== 2. PARTICLE CANVAS ANIMATION ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId;

// Resize canvas to fill window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

// Particle class
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.6 ? '#6c63ff' : Math.random() > 0.5 ? '#00d4ff' : '#f472b6';
    this.pulse = Math.random() * Math.PI * 2; // random start phase
    this.pulseSpeed = 0.02 + Math.random() * 0.02;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulse += this.pulseSpeed;
    this.opacity = 0.15 + Math.abs(Math.sin(this.pulse)) * 0.4;

    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Draw lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 120;

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.15;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#6c63ff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// Initialize particles
function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 100);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

// Animate particles
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  animationFrameId = requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Pause animation when hero section is not visible (performance)
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    if (!animationFrameId) animateParticles();
  } else {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}, { threshold: 0.1 });

heroObserver.observe(document.getElementById('hero'));


/* ===== 3. STICKY NAVBAR ===== */
const navbar = document.getElementById('navbar');

function handleNavScroll() {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll);


/* ===== 4. ACTIVE NAV LINK ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  let scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);


/* ===== 5. HAMBURGER MOBILE MENU ===== */
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');
const mobileOverlay = document.getElementById('mobileOverlay');

function toggleMobileMenu() {
  hamburger.classList.toggle('open');
  navLinksContainer.classList.toggle('open');
  mobileOverlay.classList.toggle('active');
  document.body.style.overflow = hamburger.classList.contains('open') ? 'hidden' : '';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  navLinksContainer.classList.remove('open');
  mobileOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', toggleMobileMenu);

// Close menu when a nav link is clicked
navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});


/* ===== 6. SMOOTH SCROLL FOR ANCHOR LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
      const top = target.offsetTop - navHeight;
      lenis.scrollTo(target, { offset: -navHeight });
    }
  });
});


/* ===== 7. COUNTDOWN TIMER ===== */
// Set target date: July 17, 2026
const countdownTarget = new Date('2026-07-17T09:00:00+05:30');

function updateCountdown() {
  const now = new Date();
  const diff = countdownTarget - now;

  if (diff <= 0) {
    // Registration closed
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    document.querySelector('.countdown-label').textContent = 'Registration Closed';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Animate number change
  setCountValue('days', days);
  setCountValue('hours', hours);
  setCountValue('minutes', minutes);
  setCountValue('seconds', seconds);
}

// Set value with animation
function setCountValue(id, value) {
  const el = document.getElementById(id);
  const padded = String(value).padStart(2, '0');

  if (el.textContent !== padded) {
    el.classList.add('flip');
    setTimeout(() => el.classList.remove('flip'), 300);
    el.textContent = padded;
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* ===== 8. SCROLL REVEAL ANIMATIONS ===== */
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// Also call on DOMContentLoaded for elements above fold
document.addEventListener('DOMContentLoaded', revealOnScroll);



/* ===== 10. FAQ ACCORDION ===== */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all FAQs
    faqItems.forEach(faq => {
      faq.classList.remove('open');
      faq.querySelector('.faq-answer').style.maxHeight = null;
    });

    // Toggle clicked FAQ
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});


/* ===== 11. REGISTRATION MODAL ===== */
const modalOverlay = document.getElementById('modalOverlay');
const registrationForm = document.getElementById('registrationForm');
const regSuccess = document.getElementById('regSuccess');

function openModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Reset form
  if (registrationForm) {
    registrationForm.style.display = 'block';
    registrationForm.reset();
  }
  if (regSuccess) regSuccess.style.display = 'none';
}

function closeModal(event) {
  if (!modalOverlay) return;
  // Only close if clicking the overlay itself (not the modal box)
  if (event && event.target !== modalOverlay) return;
  forceCloseModal();
}

function forceCloseModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal button calls forceCloseModal
const modalCloseBtn = document.getElementById('modalCloseBtn');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', forceCloseModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
    forceCloseModal();
  }
});

// Success close button
document.getElementById('regSuccessClose')?.addEventListener('click', forceCloseModal);


/* ===== 12. REGISTRATION FORM VALIDATION & SUBMISSION ===== */
if (registrationForm) {
registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const teamName = document.getElementById('teamName');
  const teamSize = document.getElementById('teamSize');
  const leaderName = document.getElementById('leaderName');
  const leaderEmail = document.getElementById('leaderEmail');
  const leaderPhone = document.getElementById('leaderPhone');
  const collegeName = document.getElementById('collegeName');
  const theme = document.getElementById('theme');
  const projectIdea = document.getElementById('projectIdea');
  const agreeTerms = document.getElementById('agreeTerms');

  let valid = true;

  // Reset errors
  [teamName, teamSize, leaderName, leaderEmail, leaderPhone, collegeName, theme, projectIdea].forEach(el => {
    el.classList.remove('error');
  });

  // Validate
  if (!teamName.value.trim()) { teamName.classList.add('error'); valid = false; }
  if (!teamSize.value) { teamSize.classList.add('error'); valid = false; }
  if (!leaderName.value.trim()) { leaderName.classList.add('error'); valid = false; }
  if (!isValidEmail(leaderEmail.value)) { leaderEmail.classList.add('error'); valid = false; }
  if (!leaderPhone.value.trim() || leaderPhone.value.trim().length < 10) { leaderPhone.classList.add('error'); valid = false; }
  if (!collegeName.value.trim()) { collegeName.classList.add('error'); valid = false; }
  if (!theme.value) { theme.classList.add('error'); valid = false; }
  if (!projectIdea.value.trim() || projectIdea.value.trim().length < 20) { projectIdea.classList.add('error'); valid = false; }

  if (!agreeTerms.checked) {
    alert('Please agree to the Terms & Conditions to proceed.');
    valid = false;
  }

  if (!valid) {
    // Shake the form
    registrationForm.classList.add('shake');
    setTimeout(() => registrationForm.classList.remove('shake'), 600);
    return;
  }

  // Simulate submission
  const submitBtn = document.getElementById('regSubmitBtn');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  submitBtn.disabled = true;

  setTimeout(() => {
    // Show success
    registrationForm.style.display = 'none';
    regSuccess.style.display = 'block';

    // Generate Registration ID
    const regId = 'HF2026-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('regId').textContent = regId;

    submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Submit Registration';
    submitBtn.disabled = false;
  }, 2000);
});
}


/* ===== 13. CONTACT FORM VALIDATION & SUBMISSION ===== */
// Contact form has been removed.


/* ===== 14. EMAIL VALIDATION HELPER ===== */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ===== 15. SCROLL TO TOP BUTTON ===== */
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  lenis.scrollTo(0);
});


/* ===== 16. NAVBAR LINK SMOOTH SCROLL ===== */
// Ensure all nav links close mobile menu and scroll
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});


/* ===== 17. THEME CARD HOVER TILT EFFECT ===== */
const themeCards = document.querySelectorAll('.theme-card');

// Skip tilt on touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
  themeCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

      card.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ===== 18. PRIZE CARD TILT EFFECT ===== */
const prizeCards = document.querySelectorAll('.prize-card');

if (!isTouchDevice) {
  prizeCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -8;
      const rotateY = (x - centerX) / centerX * 8;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ===== 19. TEAM CARD HOVER EFFECT ===== */
const teamCards = document.querySelectorAll('.team-card');

teamCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
  });
});


/* ===== 20. SPONSOR LOGO HOVER GLOW ===== */
const sponsorCards = document.querySelectorAll('.sponsor-logo-card');

sponsorCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 20px rgba(108, 99, 255, 0.3)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});


/* ===== 21. TYPED TEXT EFFECT FOR HERO ===== */
const tagWords = document.querySelectorAll('.tag-word');

tagWords.forEach((word, index) => {
  word.style.opacity = '0';
  word.style.transform = 'translateY(10px)';
  word.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  setTimeout(() => {
    word.style.opacity = '1';
    word.style.transform = 'translateY(0)';
  }, 300 + (index * 200));
});


/* ===== 22. SCHEDULE TABLE ROW HOVER GLOW ===== */
document.querySelectorAll('.schedule-row').forEach(row => {
  row.addEventListener('mouseenter', () => {
    row.style.transition = 'background 0.2s ease';
  });
});


/* ===== 23. STATS COUNTER ANIMATION ===== */
function animateCounter(element, target, duration = 2000, prefix = '', suffix = '') {
  let start = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = prefix + target + suffix;
      clearInterval(timer);
    } else {
      element.textContent = prefix + Math.floor(start) + suffix;
    }
  }, 16);
}

// Observe stats and animate when visible
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      const targets = [500, 1, 50, 36];
      const prefixes = ['', '₹', '', ''];
      const suffixes = ['+', 'L+', '+', ''];

      statNumbers.forEach((el, i) => {
        animateCounter(el, targets[i], 2000, prefixes[i], suffixes[i]);
      });

      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);


/* ===== 24. GLITCH EFFECT ON TITLE (Subtle) ===== */
const heroTitle = document.querySelector('.hero-title');

if (heroTitle) {
  setInterval(() => {
    heroTitle.classList.add('glitch');
    setTimeout(() => heroTitle.classList.remove('glitch'), 200);
  }, 6000);
}

// Add CSS for glitch via JS
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
  @keyframes glitch {
    0% { text-shadow: none; }
    20% { text-shadow: -2px 0 #00d4ff, 2px 0 #f472b6; }
    40% { text-shadow: 2px 0 #00d4ff, -2px 0 #f472b6; }
    60% { text-shadow: -1px 0 #6c63ff, 1px 0 #00d4ff; }
    80% { text-shadow: 1px 0 #6c63ff; }
    100% { text-shadow: none; }
  }
  .hero-title.glitch .title-hack {
    animation: glitch 0.2s ease-in-out;
  }
  @keyframes flip {
    0% { transform: translateY(-10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .count-number.flip {
    animation: flip 0.3s ease-out;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  .shake { animation: shake 0.5s ease; }
`;
document.head.appendChild(glitchStyle);


/* ===== 25. NAV SCROLL PROGRESS INDICATOR ===== */
// Create progress bar element
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: linear-gradient(90deg, #6c63ff, #00d4ff);
  z-index: 9999;
  pointer-events: none;
  transition: width 0.1s linear;
`;
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
});


/* ===== 26. INTERSECTION OBSERVER FOR TIMELINE ===== */
const timelineItems = document.querySelectorAll('.timeline-item');

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
    }
  });
}, { threshold: 0.3 });

timelineItems.forEach((item, index) => {
  const side = item.dataset.side;
  item.style.opacity = '0';
  item.style.transform = side === 'left' ? 'translateX(-40px)' : 'translateX(40px)';
  item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
  timelineObserver.observe(item);
});


/* ===== 27. PERK CHIP HOVER WAVE ===== */
const perkChips = document.querySelectorAll('.perk-chip');

perkChips.forEach((chip, index) => {
  chip.style.transitionDelay = `${index * 50}ms`;
});


/* ===== 28. DYNAMIC YEAR IN FOOTER ===== */
// Already hardcoded as 2026 in HTML, but this ensures it's always current
const yearEl = document.querySelector('.footer-bottom-content p');
// (already set to 2026 in HTML)


/* ===== 29. BACK TO TOP VISIBILITY ON SECTION CHANGE ===== */
// Already handled in scroll event listener above


/* ===== 30. KEYBOARD ACCESSIBILITY FOR FAQ ===== */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', function () {
    const isOpen = this.parentElement.classList.contains('open');
    this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Keyboard: Enter and Space already trigger click on buttons
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});


/* ===== 31. SPONSOR LOGO SCROLL CAROUSEL (Auto Scroll) ===== */
// Adds a subtle auto-animation hint on sponsor rows
const sponsorRows = document.querySelectorAll('.sponsor-logos-row');
let sponsorObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.sponsor-logo-card').forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }
  });
}, { threshold: 0.2 });

sponsorRows.forEach(row => {
  row.querySelectorAll('.sponsor-logo-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  sponsorObserver.observe(row);
});


/* ===== 32. CONSOLE BRANDING ===== */
console.log(
  '%c HyperFusion 2026 ',
  'background: linear-gradient(135deg, #6c63ff, #00d4ff); color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;'
);
console.log(
  '%c JIS College of Engineering | Innovate • Build • Transform ',
  'color: #6c63ff; font-size: 12px; font-weight: 500;'
);
console.log('%c Made with ❤️ by the HyperFusion Dev Team', 'color: #64748b; font-size: 11px;');


/* ===== 33. WINDOW RESIZE HANDLER ===== */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
    // Re-init particles on orientation change
    if (window.innerWidth !== canvas.width) {
      resizeCanvas();
      initParticles();
    }
  }, 300);
});


/* ===== 34. INITIALIZE EVERYTHING ===== */
document.addEventListener('DOMContentLoaded', () => {
  handleNavScroll();
  updateActiveNav();
  updateCountdown();

  // Set initial nav state
  if (window.scrollY === 0) {
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector('.nav-link[href="#hero"]')?.classList.add('active');
  }

  console.log('✅ HyperFusion 2026 initialized successfully!');
});

/* ===== 35. ADD ORBS TO ALL SECTIONS ===== */
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section:not(.hero-section)');
  const orbConfigs = [
    { size: 350, color: 'rgba(108, 99, 255, 0.12)', top: '-80px', left: '-80px', delay: '0s' },
    { size: 250, color: 'rgba(0, 212, 255, 0.1)', bottom: '-40px', right: '-40px', delay: '-3s' },
    { size: 200, color: 'rgba(244, 114, 182, 0.08)', top: '50%', right: '15%', delay: '-6s' }
  ];

  sections.forEach(section => {
    // Make section position relative for orb positioning
    if (getComputedStyle(section).position === 'static') {
      section.style.position = 'relative';
    }
    // Ensure overflow hidden
    section.style.overflow = 'hidden';

    orbConfigs.forEach(config => {
      const orb = document.createElement('div');
      orb.className = 'section-orb';
      orb.style.cssText = `
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        pointer-events: none;
        z-index: 0;
        width: ${config.size}px;
        height: ${config.size}px;
        background: ${config.color};
        ${config.top ? `top: ${config.top};` : ''}
        ${config.bottom ? `bottom: ${config.bottom};` : ''}
        ${config.left ? `left: ${config.left};` : ''}
        ${config.right ? `right: ${config.right};` : ''}
        animation: orbFloat 8s ease-in-out infinite;
        animation-delay: ${config.delay};
      `;
      section.prepend(orb);
    });
  });
});
