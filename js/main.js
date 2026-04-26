// ============================================
// LEGALIA - MÓDULO PRINCIPAL
// Temas, modals, accordions, scroll reveal
// ============================================

function toggleAccordion(btn) {
  const item = btn.closest('.accordion-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

const rootEl = document.documentElement;
try {
  const saved = localStorage.getItem('legalia-theme') || 'light';
  rootEl.setAttribute('data-theme', saved);
} catch (e) {
  rootEl.setAttribute('data-theme', 'light');
}
document.getElementById('themeToggle')?.addEventListener('click', function () {
  const current = rootEl.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  rootEl.setAttribute('data-theme', next);
  try {
    localStorage.setItem('legalia-theme', next);
  } catch (e) { }
});

function openModal(type, userType, fromRegister) {
  if (type === 'login') {
    document.getElementById('loginModal').classList.add('open');
    if (!fromRegister) {
      document.querySelector('#loginModal input[type="email"]').value = '';
      document.querySelector('#loginModal input[type="password"]').value = '';
      const ok = document.querySelector('#loginModal .modal-ok');
      if (ok) ok.style.display = 'none';
      clearModalError('loginModal');
      document.querySelectorAll('#loginModal .modal-tab').forEach((t, i) => {
        t.classList.toggle('active', i === 0);
      });
    }
  } else {
    document.getElementById('registerModal').classList.add('open');
    if (userType) setRegType(userType);
    clearModalError('registerModal');
  }
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

function setLoginType(type, btn) {
  document.querySelectorAll('#loginModal .modal-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function setRegType(type) {
  document.querySelectorAll('.user-type-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('reg-' + type).classList.add('active');
  document.getElementById('lawyer-fields').style.display = type === 'abogado' ? 'block' : 'none';
}

function showModalError(modalId, msg) {
  let err = document.querySelector('#' + modalId + ' .modal-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'modal-error';
    err.style.cssText = 'color:#c0392b;font-size:.78rem;margin-top:.6rem;text-align:center;padding:.5rem;border:1px solid rgba(192,57,43,.3);background:rgba(192,57,43,.06);';
    document.querySelector('#' + modalId + ' .modal-submit').before(err);
  }
  err.textContent = msg;
  err.style.display = 'block';
}

function clearModalError(modalId) {
  const err = document.querySelector('#' + modalId + ' .modal-error');
  if (err) err.style.display = 'none';
}
