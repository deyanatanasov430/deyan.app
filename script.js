const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const animElements = document.querySelectorAll(
  '.product-card, .testimonial-card, .gallery-item, .about-card, .course-feature, .contact-item, .stat'
);
animElements.forEach((el, i) => {
  el.classList.add('fade-in');
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  observer.observe(el);
});

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const productSelect = document.getElementById('product');
    const productText = productSelect && productSelect.selectedIndex > 0 ? productSelect.options[productSelect.selectedIndex].text : 'Общо запитване';
    const message = document.getElementById('message').value.trim();

    if (!name) {
      showFieldError('name', 'Моля, въведете вашето име');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Изпращане...';
    }

    const formData = new FormData();
    formData.append('Форма', 'Контактна форма / Запитване');
    formData.append('Име', name);
    formData.append('Телефон', phone || 'Не е посочен');
    formData.append('Интерес', productText);
    formData.append('Съобщение', message || 'Няма текст');

    fetch("https://formspree.io/f/xzezpeql", {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .finally(() => {
      contactForm.reset();
      formSuccess.style.display = 'block';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Изпрати съобщение';
      }

      setTimeout(() => {
        formSuccess.style.display = 'none';
      }, 6000);
    });
  });
}

function showFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  field.style.borderColor = '#e53e3e';
  field.focus();
  setTimeout(() => { field.style.borderColor = ''; }, 3000);
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.querySelector('.gallery-overlay').style.opacity = '1';
  });
  item.addEventListener('mouseleave', () => {
    item.querySelector('.gallery-overlay').style.opacity = '0';
  });
});

function animateCounter(el, target, suffix) {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, 25);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(num => {
        const text = num.textContent;
        if (text.includes('400')) animateCounter(num, 400, '+');
        else if (text.includes('5')) animateCounter(num, 5, '+');
        else if (text.includes('100')) animateCounter(num, 100, '%');
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

console.log('Slavka Mladenova website loaded successfully!');

function openLightbox(src, title, desc) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxImg').alt = title;
  document.getElementById('lightboxTitle').textContent = title;
  document.getElementById('lightboxDesc').textContent = desc;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

function openOrder(productName) {
  const modal = document.getElementById('orderModal');
  const modalBody = document.getElementById('orderModalBody');
  const successView = document.getElementById('orderSuccess');

  if (modalBody) modalBody.style.display = 'block';
  if (successView) successView.style.display = 'none';

  const form = document.getElementById('orderForm');
  if (form) {
    form.reset();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Направи поръчка';
    }
  }

  document.getElementById('orderProduct').value = productName;
  document.getElementById('orderProductName').textContent = productName;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrder() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLightbox(); closeOrder(); }
});

const orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name  = document.getElementById('oname').value.trim();
    const phone = document.getElementById('ophone').value.trim();
    const qty   = document.getElementById('oqty').value.trim();
    const notes = document.getElementById('onotes').value.trim();
    const product = document.getElementById('orderProduct').value;

    if (!name || !phone) return;

    const btn = orderForm.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Изпращане...';
    }

    const formData = new FormData();
    formData.append('Форма', '🛒 Нова поръчка');
    formData.append('Продукт', product);
    formData.append('Име на клиента', name);
    formData.append('Телефон', phone);
    formData.append('Количество', qty || 'Не е посочено');
    formData.append('Детайли / Бележки', notes || 'Няма');

    fetch("https://formspree.io/f/xzezpeql", {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .finally(() => {
      const modalBody = document.getElementById('orderModalBody');
      const successView = document.getElementById('orderSuccess');

      if (modalBody) modalBody.style.display = 'none';
      if (successView) successView.style.display = 'flex';

      orderForm.reset();
    });
  });
}