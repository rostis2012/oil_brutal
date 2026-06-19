(function () {
  'use strict';

  const STORAGE_KEY = 'aldi-theme';
  const html = document.documentElement;

  /* ── Theme ── */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    html.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'));

    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  /* ── Preloader ── */
  function initPreloader() {
    const el = document.getElementById('preloader');
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reduced ? 400 : 800;

    setTimeout(() => {
      el.classList.add('is-done');
      document.body.classList.remove('is-loading');
    }, delay);
  }

  /* ── Custom cursor ── */
  function initCursor() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    document.body.classList.add('has-cursor');

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    function loop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    }
    loop();

    const interactives = 'a, button, input, textarea, .btn, .faq__btn, .fleet__card, .product, .card';
    document.querySelectorAll(interactives).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  /* ── Nav scroll ── */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── Mobile menu ── */
  function initMobileMenu() {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el) => obs.observe(el));
  }

  /* ── FAQ ── */
  function initFaq() {
    document.querySelectorAll('.faq__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const wasOpen = item.classList.contains('is-open');

        document.querySelectorAll('.faq__item').forEach((i) => {
          i.classList.remove('is-open');
          i.querySelector('.faq__btn').setAttribute('aria-expanded', 'false');
        });

        if (!wasOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── Phone mask ── */
  function initPhoneMask() {
    const input = document.querySelector('input[name="phone"]');
    if (!input) return;

    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('380')) v = v.slice(3);
      if (v.startsWith('0')) v = v.slice(1);

      let f = '+38 (0';
      if (v.length > 0) f += v.slice(0, 2);
      if (v.length > 2) f += ') ' + v.slice(2, 5);
      if (v.length > 5) f += '-' + v.slice(5, 7);
      if (v.length > 7) f += '-' + v.slice(7, 9);
      e.target.value = f;
    });
  }

  /* ── Form ── */
  function showFormError(msg) {
    const el = document.getElementById('form-error');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearFormError() {
    const el = document.getElementById('form-error');
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
  }

  function initForm() {
    const form = document.getElementById('lead-form-el');
    const modal = document.getElementById('success-modal');
    const closeBtn = document.getElementById('modal-close');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormError();

      const name = form.querySelector('#name');
      const phone = form.querySelector('#phone');
      if (!name?.value.trim()) {
        showFormError('Вкажіть ваше ім\'я.');
        name?.focus();
        return;
      }
      if (!phone?.value.trim() || phone.value.replace(/\D/g, '').length < 10) {
        showFormError('Вкажіть коректний номер телефону.');
        phone?.focus();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = 'Надсилаємо...';
      btn.disabled = true;

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form),
        });
        const data = await res.json();

        if (data.success) {
          form.reset();
          clearFormError();
          modal.classList.add('is-open');
          document.body.classList.add('modal-open');
        } else {
          showFormError('Помилка відправки. Спробуйте пізніше.');
        }
      } catch {
        showFormError('Помилка з\'єднання. Перевірте інтернет.');
      } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    });

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  /* ── Smooth anchor scroll ── */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPreloader();
    initCursor();
    initNav();
    initMobileMenu();
    initReveal();
    initFaq();
    initPhoneMask();
    initForm();
    initAnchors();
  });
})();