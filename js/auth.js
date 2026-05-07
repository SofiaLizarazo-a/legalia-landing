// ============================================
// LEGALIA AUTH - VERSIÓN CORREGIDA
// ============================================

function showToast(message, type = 'success') {
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

function showModalError(modalId, message) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    let errorDiv = modal.querySelector('.modal-error-fixed');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'modal-error-fixed';
        errorDiv.style.cssText = 'background:rgba(198,40,40,0.1);border:1px solid #c62828;color:#c62828;padding:0.75rem 1rem;margin-bottom:1rem;border-radius:8px;font-size:0.85rem;text-align:center;';
        
        const modalTag = modal.querySelector('.modal-tag');
        if (modalTag) {
            modalTag.insertAdjacentElement('afterend', errorDiv);
        } else {
            modal.querySelector('.modal').insertBefore(errorDiv, modal.querySelector('.modal').firstChild);
        }
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showModalSuccess(modalId, message) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    let successDiv = modal.querySelector('.modal-success-fixed');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'modal-success-fixed';
        successDiv.style.cssText = 'background:rgba(46,125,50,0.1);border:1px solid #2e7d32;color:#2e7d32;padding:0.75rem 1rem;margin-bottom:1rem;border-radius:8px;font-size:0.85rem;text-align:center;';
        
        const modalTag = modal.querySelector('.modal-tag');
        if (modalTag) {
            modalTag.insertAdjacentElement('afterend', successDiv);
        } else {
            modal.querySelector('.modal').insertBefore(successDiv, modal.querySelector('.modal').firstChild);
        }
    }
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

function clearModalMessages(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const errorDiv = modal.querySelector('.modal-error-fixed');
    if (errorDiv) errorDiv.style.display = 'none';
    
    const successDiv = modal.querySelector('.modal-success-fixed');
    if (successDiv) successDiv.style.display = 'none';
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
        showModalError('loginModal', '✗ Ingresa tu correo y contraseña');
        return;
    }
    if (!email) {
        showModalError('loginModal', '✗ El correo electrónico es obligatorio');
        return;
    }
    if (!password) {
        showModalError('loginModal', '✗ La contraseña es obligatoria');
        return;
    }
    if (!valEmail(email)) {
        showModalError('loginModal', '✗ Ingresa un correo electrónico válido (ejemplo@dominio.com)');
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
        let mensajeError = err.message;
        if (mensajeError === 'Usuario no encontrado') {
            mensajeError = '✗ No existe una cuenta con este correo electrónico. Verifica o regístrate.';
        } else if (mensajeError === 'Contraseña incorrecta') {
            mensajeError = '✗ Contraseña incorrecta. Inténtalo nuevamente.';
        } else if (mensajeError === 'No eres administrador') {
            mensajeError = '✗ Este correo no está registrado como Administrador. Verifica tu rol.';
        } else if (mensajeError === 'No eres abogado') {
            mensajeError = '✗ Este correo no está registrado como Abogado. Verifica tu rol.';
        } else if (mensajeError === 'No eres cliente') {
            mensajeError = '✗ Este correo no está registrado como Cliente. Verifica tu rol.';
        } else if (mensajeError === 'Cuenta desactivada') {
            mensajeError = '✗ Tu cuenta está desactivada. Contacta al administrador.';
        }
        showModalError('loginModal', mensajeError);
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
        showModalError('registerModal', '✗ Todos los campos son obligatorios');
        return;
    }
    if (!valEmail(email)) {
        showModalError('registerModal', '✗ Ingresa un correo electrónico válido (ejemplo@dominio.com)');
        return;
    }
    if (password.length < 8) {
        showModalError('registerModal', '✗ La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    if (role === 'abogado') {
        const tarjeta = document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]');
        const especialidad = document.querySelector('#registerModal select');
        if (!tarjeta || !tarjeta.value.trim()) {
            showModalError('registerModal', '✗ La tarjeta profesional es requerida para abogados');
            return;
        }
        if (!especialidad || !especialidad.value) {
            showModalError('registerModal', '✗ Selecciona una especialidad');
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
            showModalSuccess('loginModal', '✓ Cuenta creada exitosamente. ¡Ahora inicia sesión!');
        }, 100);
        
        showToast('✓ Registro exitoso. Ahora inicia sesión con tus credenciales.', 'success');
    } catch (err) {
        let mensajeError = err.message;
        if (mensajeError === 'Email ya registrado') {
            mensajeError = '✗ Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?';
        }
        showModalError('registerModal', mensajeError);
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
