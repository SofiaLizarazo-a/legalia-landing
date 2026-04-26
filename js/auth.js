// ============================================
// LEGALIA - AUTENTICACIÓN
// Registro, login y gestión de usuarios
// ============================================

const usuariosDB = {};

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getLoginType() {
  const active = document.querySelector('#loginModal .modal-tab.active');
  if (!active) return 'cliente';
  const t = active.textContent.trim().toLowerCase();
  return t.includes('admin') ? 'administrador' : (t.includes('abogado') ? 'abogado' : 'cliente');
}

function doLogin() {
  clearModalError('loginModal');
  const email = document.querySelector('#loginModal input[type="email"]').value.trim();
  const pass = document.querySelector('#loginModal input[type="password"]').value.trim();
  const role = getLoginType();

  if (!email && !pass) {
    showModalError('loginModal', 'Por favor ingresa tu correo y contraseña.');
    return;
  }
  if (!email) {
    showModalError('loginModal', 'El correo electrónico es obligatorio.');
    return;
  }
  if (!pass) {
    showModalError('loginModal', 'La contraseña es obligatoria.');
    return;
  }
  if (!esEmailValido(email)) {
    showModalError('loginModal', 'Ingresa un correo electrónico válido (ej: nombre@dominio.com).');
    return;
  }

  const key = email.toLowerCase() + '_' + role;
  if (!usuariosDB[key]) {
    showModalError('loginModal', 'No existe una cuenta con ese correo para el perfil seleccionado. ¿Ya te registraste?');
    return;
  }
  if (usuariosDB[key].password !== pass) {
    showModalError('loginModal', 'La contraseña es incorrecta. Intenta de nuevo.');
    return;
  }

  closeModal('loginModal');
  showDashboard(role, usuariosDB[key].nombre);
}

function doRegister() {
  clearModalError('registerModal');
  const nombre = document.querySelector('#registerModal input[placeholder="Tu nombre"]').value.trim();
  const apellido = document.querySelector('#registerModal input[placeholder="Tu apellido"]').value.trim();
  const email = document.querySelector('#registerModal input[type="email"]').value.trim();
  const pass = document.querySelector('#registerModal input[type="password"]').value.trim();
  const role = document.querySelector('.user-type-btn.active').id.replace('reg-', '');

  if (!nombre) {
    showModalError('registerModal', 'El nombre es obligatorio.');
    return;
  }
  if (!apellido) {
    showModalError('registerModal', 'El apellido es obligatorio.');
    return;
  }
  if (!email) {
    showModalError('registerModal', 'El correo electrónico es obligatorio.');
    return;
  }
  if (!pass) {
    showModalError('registerModal', 'La contraseña es obligatoria.');
    return;
  }
  if (!esEmailValido(email)) {
    showModalError('registerModal', 'Ingresa un correo electrónico válido (ej: nombre@dominio.com).');
    return;
  }
  if (pass.length < 8) {
    showModalError('registerModal', 'La contraseña debe tener al menos 8 caracteres.');
    return;
  }

  if (role === 'abogado') {
    const tarjeta = document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]').value.trim();
    const especialidad = document.querySelector('#registerModal select').value;
    if (!tarjeta) {
      showModalError('registerModal', 'El número de tarjeta profesional es obligatorio.');
      return;
    }
    if (!especialidad) {
      showModalError('registerModal', 'Selecciona tu especialidad.');
      return;
    }
  }

  const key = email.toLowerCase() + '_' + role;
  if (usuariosDB[key]) {
    showModalError('registerModal', 'Ya existe una cuenta con ese correo para este perfil.');
    return;
  }

  usuariosDB[key] = { nombre, apellido, email: email.toLowerCase(), password: pass, role };

  closeModal('registerModal');

  document.querySelector('#registerModal input[placeholder="Tu nombre"]').value = '';
  document.querySelector('#registerModal input[placeholder="Tu apellido"]').value = '';
  document.querySelector('#registerModal input[type="email"]').value = '';
  document.querySelector('#registerModal input[type="password"]').value = '';

  openModal('login', null, true);

  const tabs = document.querySelectorAll('#loginModal .modal-tab');
  tabs.forEach(t => t.classList.remove('active'));
  tabs.forEach(t => {
    const txt = t.textContent.trim().toLowerCase();
    if (role === 'cliente' && txt === 'cliente') t.classList.add('active');
    else if (role === 'abogado' && txt === 'abogado') t.classList.add('active');
    else if (role === 'abogado' && txt.includes('abogado')) t.classList.add('active');
    else if ((role === 'administrador' || role === 'admin') && txt.includes('admin')) t.classList.add('active');
  });

  document.querySelector('#loginModal input[type="email"]').value = email;
  document.querySelector('#loginModal input[type="password"]').value = '';

  let ok = document.querySelector('#loginModal .modal-ok');
  if (!ok) {
    ok = document.createElement('p');
    ok.className = 'modal-ok';
    ok.style.cssText = 'color:#27ae60;font-size:.78rem;margin-bottom:.8rem;text-align:center;padding:.5rem;border:1px solid rgba(39,174,96,.3);background:rgba(39,174,96,.06);';
    document.querySelector('#loginModal .form-field').before(ok);
  }
  ok.textContent = '✓ Cuenta creada exitosamente. Ingresa tu contraseña para continuar.';
  ok.style.display = 'block';
}
