// ============================================
// LEGALIA AUTH - VERSIÓN MEJORADA
// ============================================

function showToast(message, type = 'success') {
    // Eliminar toast existente
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoader() {
    let loader = document.querySelector('.loader-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="loader-spinner"></div>';
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) loader.style.display = 'none';
}

function clearModalMessages(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const existingMessages = modal.querySelectorAll('.modal-success, .modal-error, .modal-info, .modal-warning');
    existingMessages.forEach(msg => msg.remove());
}

function showModalMessage(modalId, message, type = 'error') {
    clearModalMessages(modalId);
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal');
    const msgDiv = document.createElement('div');
    msgDiv.className = `modal-${type}`;
    msgDiv.textContent = message;
    
    const modalTag = modal.querySelector('.modal-tag');
    if (modalTag) {
        modalTag.insertAdjacentElement('afterend', msgDiv);
    } else {
        modalContent.insertBefore(msgDiv, modalContent.firstChild);
    }
}

function valEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getTipo() {
    const activeTab = document.querySelector('#loginModal .modal-tab.active');
    if (!activeTab) return 'cliente';
    const text = activeTab.textContent.trim().toLowerCase();
    if (text.includes('admin')) return 'administrador';
    if (text.includes('abogado')) return 'abogado';
    return 'cliente';
}

async function esperarDB() {
    let i = 0;
    while (i < 50) {
        if (window.db && window.db._db) return true;
        await new Promise(r => setTimeout(r, 100));
        i++;
    }
    throw new Error('La base de datos no está disponible. Recarga la página.');
}

async function doLogin() {
    clearModalMessages('loginModal');
    const email = document.querySelector('#loginModal input[type="email"]').value.trim();
    const password = document.querySelector('#loginModal input[type="password"]').value.trim();
    const role = getTipo();
    
    if (!email && !password) {
        showModalMessage('loginModal', '✗ Ingresa tu correo y contraseña', 'error');
        return;
    }
    if (!email) {
        showModalMessage('loginModal', '✗ El correo electrónico es obligatorio', 'error');
        return;
    }
    if (!password) {
        showModalMessage('loginModal', '✗ La contraseña es obligatoria', 'error');
        return;
    }
    if (!valEmail(email)) {
        showModalMessage('loginModal', '✗ Ingresa un correo electrónico válido (ejemplo@dominio.com)', 'error');
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
        showModalMessage('loginModal', `✗ ${err.message}`, 'error');
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
        document.querySelector('#registerModal input[placeholder="Tu nombre"]').value = '';
        document.querySelector('#registerModal input[placeholder="Tu apellido"]').value = '';
        document.querySelector('#registerModal input[type="email"]').value = '';
        document.querySelector('#registerModal input[type="password"]').value = '';
        
        // Abrir login y prellenar email
        openModal('login');
        setTimeout(() => {
            const loginEmail = document.querySelector('#loginModal input[type="email"]');
            if (loginEmail) loginEmail.value = email;
            showModalMessage('loginModal', '✓ Cuenta creada exitosamente. Ahora inicia sesión.', 'success');
        }, 100);
        
        showToast('✓ Registro exitoso. Revisa tu correo para verificar tu cuenta.', 'success');
    } catch (err) {
        showModalMessage('registerModal', `✗ ${err.message}`, 'error');
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
