// ============================================
// LEGALIA - AUTENTICACIÓN (OPTIMIZADA)
// ============================================

console.log('🔐 [auth.js] Cargando...');

function getTipo() {
    const activeTab = document.querySelector('#loginModal .modal-tab.active');
    if (!activeTab) return 'cliente';
    const text = activeTab.textContent.trim().toLowerCase();
    if (text.includes('admin')) return 'administrador';
    if (text.includes('abogado')) return 'abogado';
    return 'cliente';
}

async function esperarDB() {
    let intentos = 0;
    while (!window.db && intentos < 30) {
        await new Promise(r => setTimeout(r, 100));
        intentos++;
    }
    if (!window.db) throw new Error('La base de datos no está disponible. Recarga la página.');
    if (window.db.iniciar) await window.db.iniciar();
    return true;
}

async function doLogin() {
    clearModalMessages('loginModal');
    
    const email = document.querySelector('#loginModal input[type="email"]').value.trim();
    const password = document.querySelector('#loginModal input[type="password"]').value.trim();
    const role = getTipo();
    
    if (!email || !password) {
        showModalMessage('loginModal', '✗ Correo y contraseña son obligatorios', 'error');
        return;
    }
    if (!valEmail(email)) {
        showModalMessage('loginModal', '✗ Ingresa un correo electrónico válido', 'error');
        return;
    }
    
    showLoader();
    try {
        await esperarDB();
        const user = await window.db.usuarios.autenticar(email, password, role);
        window.db.setUsuarioActual(user);
        closeModal('loginModal');
        showToast(`✓ Bienvenido, ${user.nombre}!`, 'success');
        showDashboard(role, user.nombre);
    } catch (err) {
        const mensajes = {
            'Usuario no encontrado': '✗ No existe una cuenta con este correo electrónico. Verifica o regístrate.',
            'Contraseña incorrecta': '✗ Contraseña incorrecta. Inténtalo nuevamente.',
            'No eres administrador': '✗ Este correo no está registrado como Administrador.',
            'No eres abogado': '✗ Este correo no está registrado como Abogado.',
            'No eres cliente': '✗ Este correo no está registrado como Cliente.',
            'Cuenta desactivada': '✗ Tu cuenta está desactivada. Contacta al administrador.'
        };
        showModalMessage('loginModal', mensajes[err.message] || `✗ ${err.message}`, 'error');
    } finally {
        hideLoader();
    }
}

async function doRegister() {
    clearModalMessages('registerModal');
    
    const nombre = document.querySelector('#registerModal input[placeholder="Tu nombre"]').value.trim();
    const apellido = document.querySelector('#registerModal input[placeholder="Tu apellido"]').value.trim();
    const email = document.querySelector('#registerModal input[type="email"]').value.trim();
    const password = document.querySelector('#registerModal input[type="password"]').value.trim();
    const roleBtn = document.querySelector('.user-type-btn.active');
    const role = roleBtn ? roleBtn.id.replace('reg-', '') : 'cliente';
    
    if (!nombre || !apellido || !email || !password) {
        showModalMessage('registerModal', '✗ Todos los campos son obligatorios', 'error');
        return;
    }
    if (!valEmail(email)) {
        showModalMessage('registerModal', '✗ Ingresa un correo electrónico válido', 'error');
        return;
    }
    if (password.length < 8) {
        showModalMessage('registerModal', '✗ La contraseña debe tener al menos 8 caracteres', 'error');
        return;
    }
    
    if (role === 'abogado') {
        const tarjeta = document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]');
        const especialidad = document.querySelector('#registerModal select');
        if (!tarjeta || !tarjeta.value.trim()) {
            showModalMessage('registerModal', '✗ La tarjeta profesional es requerida para abogados', 'error');
            return;
        }
        if (!especialidad || !especialidad.value) {
            showModalMessage('registerModal', '✗ Selecciona una especialidad', 'error');
            return;
        }
    }
    
    showLoader();
    try {
        await esperarDB();
        await window.db.usuarios.crear(nombre, apellido, email, password, role);
        closeModal('registerModal');
        
        // Limpiar formulario
        const campos = [
            '#registerModal input[placeholder="Tu nombre"]',
            '#registerModal input[placeholder="Tu apellido"]',
            '#registerModal input[type="email"]',
            '#registerModal input[type="password"]'
        ];
        campos.forEach(sel => { const el = document.querySelector(sel); if (el) el.value = ''; });
        if (document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]')) {
            document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]').value = '';
        }
        if (document.querySelector('#registerModal select')) {
            document.querySelector('#registerModal select').value = '';
        }
        
        openModal('login');
        setTimeout(() => {
            const loginEmail = document.querySelector('#loginModal input[type="email"]');
            if (loginEmail) loginEmail.value = email;
            showModalMessage('loginModal', '✓ Cuenta creada exitosamente. ¡Ahora inicia sesión!', 'success');
        }, 100);
        
        showToast('✓ Registro exitoso. Ahora inicia sesión con tus credenciales.', 'success');
    } catch (err) {
        const mensaje = err.message === 'Email ya registrado' 
            ? '✗ Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?' 
            : `✗ ${err.message}`;
        showModalMessage('registerModal', mensaje, 'error');
    } finally {
        hideLoader();
    }
}

function doLogout() {
    window.db?.setUsuarioActual(null);
    closeDashboard();
    showToast('✓ Sesión cerrada correctamente', 'info');
    setTimeout(() => location.reload(), 500);
}
