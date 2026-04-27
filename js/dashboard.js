// ============================================
// LEGALIA - DASHBOARD COMPLETO (CORREGIDO)
// ============================================

function showDashboard(role, name) {
  const dashboardOverlay = document.getElementById('dashboardOverlay');
  document.getElementById('dash-name').textContent = name;

  const configs = {
    cliente: {
      badge: 'Cliente',
      badgeColor: '#27ae60',
      welcome: 'Bienvenido a tu espacio legal',
      desc: 'Aquí puedes gestionar tus casos, citas, pagos y documentos legales.',
      items: [
        { icon: '⚖️', title: 'Mis Casos', desc: 'Visualiza y da seguimiento a tus procesos legales activos.', action: 'verMisCasos()' },
        { icon: '💬', title: 'Chat Seguro', desc: 'Comunícate directamente con tu abogado asignado.', action: 'openChat()' },
        { icon: '📅', title: 'Citas', desc: 'Gestiona tus reuniones programadas.', action: 'verCitas()' },
        { icon: '💰', title: 'Pagos', desc: 'Realiza pagos y consulta tus facturas.', action: 'verPagos()' },
        { icon: '📄', title: 'Documentos', desc: 'Accede y organiza los documentos de tu expediente.', action: 'verDocumentos()' },
        { icon: '⭐', title: 'Calificaciones', desc: 'Califica a los abogados que te atendieron.', action: 'verCalificaciones()' },
        { icon: '👤', title: 'Mi Perfil', desc: 'Actualiza tus datos personales y foto de perfil.', action: 'verMiPerfil()' },
      ]
    },
    abogado: {
      badge: 'Abogado',
      badgeColor: '#2980b9',
      welcome: 'Panel de gestión de casos',
      desc: 'Administra tu cartera de clientes, actualiza casos y gestiona tu agenda profesional.',
      items: [
        { icon: '📁', title: 'Casos Asignados', desc: 'Gestiona todos tus procesos legales en curso.', action: 'verCasosAbogado()' },
        { icon: '👥', title: 'Mis Clientes', desc: 'Directorio y perfiles de tus clientes.', action: 'verClientes()' },
        { icon: '💬', title: 'Mensajes', desc: 'Bandeja de comunicación segura con clientes.', action: 'openChat()' },
        { icon: '📅', title: 'Agenda', desc: 'Administra tu disponibilidad y citas programadas.', action: 'verAgendaAbogado()' },
        { icon: '📊', title: 'Reportes', desc: 'Genera reportes detallados por caso o período.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📋', title: 'Expedientes', desc: 'Sube y organiza documentos por caso.', action: 'alert("Módulo en desarrollo")' },
      ]
    },
    administrador: {
      badge: 'Administrador',
      badgeColor: '#8e44ad',
      welcome: 'Panel de Administración',
      desc: 'Supervisión completa de la plataforma: usuarios, casos, transacciones y estadísticas.',
      items: [
        { icon: '🛡️', title: 'Verificar Abogados', desc: 'Activa y valida credenciales de abogados registrados.', action: 'verificarAbogados()' },
        { icon: '📊', title: 'Estadísticas', desc: 'Métricas de uso y rendimiento de la plataforma.', action: 'verEstadisticas()' },
        { icon: '👤', title: 'Usuarios', desc: 'Gestiona todas las cuentas y niveles de acceso.', action: 'gestionarUsuarios()' },
        { icon: '⚖️', title: 'Supervisar Casos', desc: 'Monitorea todos los procesos registrados.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💰', title: 'Transacciones', desc: 'Audita pagos y facturación del sistema.', action: 'alert("Módulo en desarrollo")' },
        { icon: '⚙️', title: 'Configuración', desc: 'Ajusta parámetros y políticas de la plataforma.', action: 'alert("Módulo en desarrollo")' },
      ]
    }
  };

  const cfg = configs[role] || configs.cliente;

  document.getElementById('dash-badge').textContent = cfg.badge;
  document.getElementById('dash-badge').style.background = cfg.badgeColor;
  document.getElementById('dash-welcome').textContent = cfg.welcome;
  document.getElementById('dash-desc').textContent = cfg.desc;

  window._currentUser = { name, role, email: window.db?.obtenerUsuarioActual()?.email };
  
  const grid = document.getElementById('dash-grid');
  grid.innerHTML = cfg.items.map(item => {
    return `<div class="dash-card"><div class="dash-card-icon">${item.icon}</div><h3 class="dash-card-title">${item.title}</h3><p class="dash-card-desc">${item.desc}</p><button class="dash-card-btn" onclick="${item.action}">Abrir →</button></div>`;
  }).join('');

  agregarSeccionDocumentos();

  dashboardOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('dashboard-open');
}

function closeDashboard() {
  document.getElementById('dashboardOverlay').classList.remove('open');
  document.body.classList.remove('dashboard-open');
  document.body.style.overflow = '';
}

// ============================================
// DOCUMENTOS PENDIENTES
// ============================================

async function agregarSeccionDocumentos() {
  const dashboardContent = document.querySelector('#dashboardOverlay > div');
  if (!dashboardContent) return;
  if (document.getElementById('documentos-pendientes-section')) return;
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const docs = await window.db.documentos.pendientes(usuarioActual.email);
    if (!docs || docs.length === 0) return;
    
    const docSection = document.createElement('div');
    docSection.id = 'documentos-pendientes-section';
    docSection.style.marginTop = '2rem';
    docSection.style.padding = '0 5vw';
    docSection.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <div style="font-size:.66rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:.8rem;margin-bottom:1rem;">
          <span style="display:block;width:24px;height:1px;background:var(--gold);"></span>
          📄 Documentos pendientes
        </div>
        <div id="lista-documentos-pendientes" style="display:flex;flex-direction:column;gap:0.8rem;"></div>
      </div>
    `;
    dashboardContent.appendChild(docSection);
    actualizarListaDocumentosPendientes();
  } catch (error) {
    console.error('Error al cargar documentos pendientes:', error);
  }
}

async function actualizarListaDocumentosPendientes() {
  const container = document.getElementById('lista-documentos-pendientes');
  if (!container) return;
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const docs = await window.db.documentos.pendientes(usuarioActual.email);
    if (!docs || docs.length === 0) {
      const section = document.getElementById('documentos-pendientes-section');
      if (section) section.remove();
      return;
    }
    
    container.innerHTML = docs.map(doc => `
      <div class="doc-item" style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
        <div style="flex:1;">
          <div style="font-weight:500;color:var(--text);">📄 ${escapeHtml(doc.nombre)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(doc.descripcion)}</div>
          <div style="font-size:0.65rem;color:var(--gold);margin-top:0.5rem;">${doc.area || 'General'} · Solicitado: ${new Date(doc.fechaSolicitud).toLocaleString()} · ⏳ Pendiente</div>
        </div>
        <button class="doc-btn" onclick="subirDocumentoPendiente(${doc.id})" style="background:var(--gold);color:#fff;border:none;padding:0.5rem 1rem;cursor:pointer;border-radius:4px;">📎 Subir documento</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function subirDocumentoPendiente(docId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx,.jpg,.png';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await window.db.documentos.subir(docId, file.name);
        await actualizarListaDocumentosPendientes();
        alert(`✅ Documento subido correctamente.\n\nArchivo: ${file.name}`);
      } catch (error) {
        alert('Error al subir el documento: ' + error.message);
      }
    }
  };
  input.click();
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>]/g, (m) => {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ============================================
// PLACEHOLDERS
// ============================================

function verMisCasos() { alert('Módulo: Mis Casos - Próximamente'); }
function verCitas() { alert('Módulo: Citas - Próximamente'); }
function verPagos() { alert('Módulo: Pagos - Próximamente'); }
function verDocumentos() { alert('Módulo: Documentos - Próximamente'); }
function verCalificaciones() { alert('Módulo: Calificaciones - Próximamente'); }
function verMiPerfil() { alert('Módulo: Mi Perfil - Próximamente'); }
function verCasosAbogado() { alert('Módulo en desarrollo para abogados'); }
function verClientes() { alert('Módulo en desarrollo'); }
function verAgendaAbogado() { alert('Módulo en desarrollo'); }
function verificarAbogados() { alert('📋 Verificar abogados - Administrador'); }
function verEstadisticas() { alert('📊 Estadísticas - Administrador'); }
function gestionarUsuarios() { alert('👥 Gestión de usuarios - Administrador'); }

// Exponer funciones globales
window.agregarDocumentoPendiente = async (nombre, descripcion, area) => {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return null;
  const docId = await window.db.documentos.agregar(usuarioActual.email, nombre, descripcion, area);
  await actualizarListaDocumentosPendientes();
  return docId;
};
window.actualizarListaDocumentos = actualizarListaDocumentosPendientes;
window.subirDocumentoPendiente = subirDocumentoPendiente;
