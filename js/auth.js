// ============================================
// LEGALIA - AUTENTICACIÓN CON BASE DE DATOS
// ============================================

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getLoginType() {
  const active = document.querySelector('#loginModal .modal-tab.active');
  if (!active) return 'cliente';
  const t = active.textContent.trim().toLowerCase();
  return t.includes('admin') ? 'administrador' : (t.includes('abogado') ? 'abogado' : 'cliente');
}

// ============================================
// INICIAR SESIÓN CON BASE DE DATOS
// ============================================
async function doLogin() {
  clearModalError('loginModal');
  const email = document.querySelector('#loginModal input[type="email"]').value.trim();
  const pass = document.querySelector('#loginModal input[type="password"]').value.trim();
  const role = getLoginType();

  // Validaciones
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

  try {
    // Verificar si la base de datos está lista
    if (!window.db) {
      showModalError('loginModal', 'La base de datos no está inicializada. Recarga la página.');
      return;
    }

    // Autenticar usuario
    const usuario = await window.db.usuarios.autenticar(email, pass, role);
    
    // Guardar usuario actual
    window.db.setUsuarioActual(usuario);
    
    // Cerrar modal y mostrar dashboard
    closeModal('loginModal');
    showDashboard(role, usuario.nombre);
    
  } catch (error) {
    showModalError('loginModal', error.message);
  }
}

// ============================================
// REGISTRAR USUARIO CON BASE DE DATOS
// ============================================
async function doRegister() {
  clearModalError('registerModal');
  const nombre = document.querySelector('#registerModal input[placeholder="Tu nombre"]').value.trim();
  const apellido = document.querySelector('#registerModal input[placeholder="Tu apellido"]').value.trim();
  const email = document.querySelector('#registerModal input[type="email"]').value.trim();
  const pass = document.querySelector('#registerModal input[type="password"]').value.trim();
  const role = document.querySelector('.user-type-btn.active').id.replace('reg-', '');

  // Validaciones básicas
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

  // Validaciones específicas para abogado
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

  try {
    // Verificar si la base de datos está lista
    if (!window.db) {
      showModalError('registerModal', 'La base de datos no está inicializada. Recarga la página.');
      return;
    }

    // Crear usuario en la base de datos
    const nuevoUsuario = await window.db.usuarios.crear(nombre, apellido, email, pass, role);
    
    // Cerrar modal de registro
    closeModal('registerModal');

    // Limpiar campos del formulario
    document.querySelector('#registerModal input[placeholder="Tu nombre"]').value = '';
    document.querySelector('#registerModal input[placeholder="Tu apellido"]').value = '';
    document.querySelector('#registerModal input[type="email"]').value = '';
    document.querySelector('#registerModal input[type="password"]').value = '';
    if (role === 'abogado') {
      document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]').value = '';
      document.querySelector('#registerModal select').value = '';
    }

    // Abrir modal de login y pre-llenar email
    openModal('login', null, true);

    // Seleccionar el tab correcto según el rol
    const tabs = document.querySelectorAll('#loginModal .modal-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabs.forEach(t => {
      const txt = t.textContent.trim().toLowerCase();
      if (role === 'cliente' && txt === 'cliente') t.classList.add('active');
      else if (role === 'abogado' && txt === 'abogado') t.classList.add('active');
      else if (role === 'abogado' && txt.includes('abogado')) t.classList.add('active');
      else if ((role === 'administrador' || role === 'admin') && txt.includes('admin')) t.classList.add('active');
    });

    // Pre-llenar email
    document.querySelector('#loginModal input[type="email"]').value = email;
    document.querySelector('#loginModal input[type="password"]').value = '';

    // Mostrar mensaje de éxito
    showModalSuccess('loginModal', '✓ Cuenta creada exitosamente. Ingresa tu contraseña para continuar.');
    
  } catch (error) {
    showModalError('registerModal', error.message);
  }
}

// ============================================
// CERRAR SESIÓN
// ============================================
function doLogout() {
  window.db.setUsuarioActual(null);
  closeDashboard();
  // Recargar la página para reiniciar el estado
  location.reload();
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function showModalSuccess(modalId, msg) {
  let ok = document.querySelector('#' + modalId + ' .modal-ok');
  if (!ok) {
    ok = document.createElement('p');
    ok.className = 'modal-ok';
    ok.style.cssText = 'color:#27ae60;font-size:.78rem;margin-bottom:.8rem;text-align:center;padding:.5rem;border:1px solid rgba(39,174,96,.3);background:rgba(39,174,96,.06);';
    const formField = document.querySelector('#' + modalId + ' .form-field');
    if (formField) {
      formField.before(ok);
    } else {
      document.querySelector('#' + modalId + ' .modal').appendChild(ok);
    }
  }
  ok.textContent = msg;
  ok.style.display = 'block';
}
