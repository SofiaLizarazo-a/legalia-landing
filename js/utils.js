// ============================================
// LEGALIA - UTILIDADES COMPARTIDAS
// ============================================

console.log('🔧 [utils.js] Cargando...');

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:8px;color:white;z-index:10000;animation:slideInRight 0.3s ease;background:${type === 'success' ? '#2e7d32' : type === 'error' ? '#c62828' : '#b8942a'}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== LOADER ====================
function showLoader() {
    let loader = document.querySelector('.loader-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001';
        loader.innerHTML = '<div style="width:50px;height:50px;border:3px solid var(--gold-border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite"></div>';
        document.body.appendChild(loader);
        
        if (!document.querySelector('#loader-keyframes')) {
            const style = document.createElement('style');
            style.id = 'loader-keyframes';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }';
            document.head.appendChild(style);
        }
    }
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) loader.style.display = 'none';
}

// ==================== MODAL MESSAGES ====================
function showModalMessage(modalId, message, type = 'error') {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const className = type === 'error' ? 'modal-error-fixed' : 'modal-success-fixed';
    const bgColor = type === 'error' ? 'rgba(198,40,40,0.1)' : 'rgba(46,125,50,0.1)';
    const borderColor = type === 'error' ? '#c62828' : '#2e7d32';
    const textColor = type === 'error' ? '#c62828' : '#2e7d32';
    
    let msgDiv = modal.querySelector('.' + className);
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.className = className;
        msgDiv.style.cssText = `background:${bgColor};border:1px solid ${borderColor};color:${textColor};padding:10px;margin-bottom:15px;border-radius:8px;text-align:center;font-size:14px`;
        const modalTag = modal.querySelector('.modal-tag');
        if (modalTag) modalTag.insertAdjacentElement('afterend', msgDiv);
        else modal.querySelector('.modal').insertBefore(msgDiv, modal.querySelector('.modal').firstChild);
    }
    msgDiv.textContent = message;
    msgDiv.style.display = 'block';
}

function clearModalMessages(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const errorDiv = modal.querySelector('.modal-error-fixed');
    if (errorDiv) errorDiv.style.display = 'none';
    const successDiv = modal.querySelector('.modal-success-fixed');
    if (successDiv) successDiv.style.display = 'none';
}

// ==================== VALIDACIONES ====================
function valEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// ==================== MODALES UI (Dashboard) ====================
let modalActual = null;

function mostrarModal(content, title) {
    if (modalActual) modalActual.remove();
    const overlayDiv = document.createElement('div');
    overlayDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center';
    const modalDiv = document.createElement('div');
    modalDiv.style.cssText = 'background:var(--bg);border:1px solid var(--gold-border);border-radius:12px;max-width:800px;width:90%;max-height:85vh;overflow:auto;box-shadow:0 20px 35px -10px rgba(0,0,0,0.3)';
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg);z-index:10';
    header.innerHTML = `<h3 style="color:var(--gold);font-family:Cormorant Garamond,serif;font-size:1.4rem">${title}</h3><button onclick="cerrarModal()" style="background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-muted)">&times;</button>`;
    const body = document.createElement('div');
    body.style.cssText = 'padding:1.5rem';
    body.innerHTML = content;
    modalDiv.appendChild(header);
    modalDiv.appendChild(body);
    overlayDiv.appendChild(modalDiv);
    document.body.appendChild(overlayDiv);
    modalActual = overlayDiv;
}

function cerrarModal() {
    if (modalActual) modalActual.remove();
    modalActual = null;
}

function showSimpleMessage(message, type = 'success') {
    const existing = document.querySelector('.modal-temp-msg');
    if (existing) existing.remove();
    const msg = document.createElement('div');
    msg.style.cssText = `background:${type === 'error' ? 'rgba(198,40,40,0.1)' : 'rgba(46,125,50,0.1)'};border:1px solid ${type === 'error' ? '#c62828' : '#2e7d32'};color:${type === 'error' ? '#c62828' : '#2e7d32'};padding:0.75rem;margin-bottom:1rem;border-radius:8px;text-align:center`;
    msg.textContent = message;
    const modalBody = document.querySelector('#dashboardOverlay > div > div:last-child');
    if (modalBody && modalBody.firstChild) modalBody.insertBefore(msg, modalBody.firstChild);
    setTimeout(() => msg.remove(), 3000);
}

console.log('✅ [utils.js] Utilidades compartidas cargadas');
