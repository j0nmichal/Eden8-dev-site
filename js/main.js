/* Eden 8 Foundation — Main JS */


/* --- Nav scroll state --- */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');

window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  nav?.classList.toggle('open');
  const isOpen = nav?.classList.contains('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.nav__links a').forEach(link => {
  link.addEventListener('click', () => {
    nav?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* --- Active nav link --- */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

/* --- Fade-in on scroll --- */
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => io.observe(el));
}

/* --- Hero particle constellation --- */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -1000, y: -1000 };
  const COUNT = 90;
  const CONNECTION_DIST = 140;
  const MOUSE_INFLUENCE = 300;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.r = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.4 + 0.1;
  }

  Particle.prototype.update = function () {
    /* gentle drift toward mouse */
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_INFLUENCE) {
      const force = (MOUSE_INFLUENCE - dist) / MOUSE_INFLUENCE * 0.004;
      this.vx += dx * force;
      this.vy += dy * force;
    }
    /* speed cap */
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 2.5) { this.vx *= 2.5 / speed; this.vy *= 2.5 / speed; }

    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p = particles[i], q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(91, 123, 192, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    /* dots */
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91, 123, 192, ${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  init();
  draw();

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    mouse.x = -1000; mouse.y = -1000;
  });
})();

/* --- Contact form (mailto fallback) --- */
const form = document.getElementById('contact-form');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const type = data.get('inquiry-type') || 'General';
  const name = data.get('name') || '';
  const org  = data.get('organization') || '';
  const msg  = data.get('message') || '';
  const sub  = encodeURIComponent(`[Eden 8 — ${type}] ${name}${org ? ' / ' + org : ''}`);
  const body = encodeURIComponent(`Name: ${name}\nOrganization: ${org}\n\n${msg}`);
  window.location.href = `mailto:info@eden8foundation.org?subject=${sub}&body=${body}`;
});

/* --- Smooth scroll for anchor CTAs --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
