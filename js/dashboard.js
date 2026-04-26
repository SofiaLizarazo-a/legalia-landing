// ============================================
// LEGALIA - DASHBOARD CON DOCUMENTOS PENDIENTES
// ============================================

// Variable global para documentos pendientes (compartida con chat.js)
window.documentosPendientesGlobal = window.documentosPendientesGlobal || [];

function showDashboard(role, name) {
  const dashboardOverlay = document.getElementById('dashboardOverlay');
  document.getElementById('dash-name').textContent = name;

  const configs = {
    cliente: {
      badge: 'Cliente',
      badgeColor: '#27ae60',
      welcome: 'Bienvenido a tu espacio legal',
      desc: 'Aquí puedes gestionar tus casos, comunicarte con tu abogado y hacer seguimiento de tus procesos legales.',
      items: [
        { icon: '⚖️', title: 'Mis Casos', desc: 'Visualiza y da seguimiento a tus procesos legales activos.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💬', title: 'Chat Seguro', desc: 'Comunícate directamente con tu abogado asignado.', action: 'openChat()' },
        { icon: '📅', title: 'Mis Citas', desc: 'Gestiona tus reuniones y recordatorios.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💳', title: 'Pagos', desc: 'Consulta tu historial de pagos y facturas.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📄', title: 'Documentos', desc: 'Accede y organiza los documentos de tu expediente.', action: 'alert("Módulo en desarrollo")' },
        { icon: '⭐', title: 'Calificar Servicio', desc: 'Evalúa la atención recibida al cerrar un caso.', action: 'alert("Módulo en desarrollo")' },
      ]
    },
    abogado: {
      badge: 'Abogado',
      badgeColor: '#2980b9',
      welcome: 'Panel de gestión de casos',
      desc: 'Administra tu cartera de clientes, actualiza casos y gestiona tu agenda profesional.',
      items: [
        { icon: '📁', title: 'Casos Activos', desc: 'Gestiona todos tus procesos legales en curso.', action: 'alert("Módulo en desarrollo")' },
        { icon: '👥', title: 'Mis Clientes', desc: 'Directorio y perfiles de tus clientes.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💬', title: 'Mensajes', desc: 'Bandeja de comunicación segura con clientes.', action: 'openChat()' },
        { icon: '📅', title: 'Agenda', desc: 'Administra tu disponibilidad y citas programadas.', action: 'alert("Módulo en desarrollo")' },
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
        { icon: '🛡️', title: 'Verificar Abogados', desc: 'Activa y valida credenciales de abogados registrados.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📊', title: 'Estadísticas', desc: 'Métricas de uso y rendimiento de la plataforma.', action: 'alert("Módulo en desarrollo")' },
        { icon: '👤', title: 'Usuarios', desc: 'Gestiona todas las cuentas y niveles de acceso.', action: 'alert("Módulo en desarrollo")' },
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

  window._currentUser = { name, role };
  const grid = document.getElementById('dash-grid');
  grid.innerHTML = cfg.items.map(item => {
    return `<div class="dash-card"><div class="dash-card-icon">${item.icon}</div><h3 class="dash-card-title">${item.title}</h3><p class="dash-card-desc">${item.desc}</p><button class="dash-card-btn" onclick="${item.action}">Abrir →</button></div>`;
  }).join('');

  // Agregar sección de documentos pendientes después del grid
  agregarSeccionDocumentos();

  dashboardOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDashboard() {
  document.getElementById('dashboardOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================
// FUNCIONES PARA DOCUMENTOS PENDIENTES
// ============================================

function agregarSeccionDocumentos() {
  const dashboardContent = document.querySelector('#dashboardOverlay > div');
  if (!dashboardContent) return;
  
  // Verificar si ya existe la sección
  if (document.getElementById('documentos-pendientes-section')) return;
  
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
      <div id="lista-documentos" style="display:flex;flex-direction:column;gap:0.8rem;"></div>
    </div>
  `;
  
  dashboardContent.appendChild(docSection);
  actualizarListaDocumentos();
}

function actualizarListaDocumentos() {
  const lista = document.getElementById('lista-documentos');
  if (!lista) return;
  
  const documentos = window.documentosPendientesGlobal || [];
  
  if (documentos.length === 0) {
    lista.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--gold-border);padding:1.5rem;text-align:center;color:var(--text-muted);font-size:.85rem;">
      📭 No hay documentos pendientes por subir.
    </div>`;
    return;
  }
  
  lista.innerHTML = documentos.map(doc => `
    <div class="doc-item" style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
      <div style="flex:1;">
        <div style="font-weight:500;color:var(--text);font-size:0.9rem;">📄 ${escapeHtml(doc.nombre)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${escapeHtml(doc.descripcion)}</div>
        <div style="font-size:0.65rem;color:var(--gold);margin-top:0.5rem;">
          ${doc.area || 'General'} · Solicitado: ${doc.fecha || new Date().toLocaleString()}
          ${doc.estado === 'subido' ? ' · ✅ Subido' : ' · ⏳ Pendiente'}
        </div>
      </div>
      ${doc.estado === 'pendiente' ? 
        `<button class="doc-btn" onclick="subirDocumentoDesdeDashboard(${doc.id})" style="background:var(--gold);color:#fff;border:none;padding:0.4rem 1rem;font-size:0.7rem;cursor:pointer;border-radius:4px;">📎 Subir documento</button>` : 
        `<span style="color:#27ae60;font-size:0.75rem;">✓ Documento subido</span>`
      }
    </div>
  `).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function subirDocumentoDesdeDashboard(docId) {
  const documento = window.documentosPendientesGlobal?.find(d => d.id === docId);
  if (!documento) {
    alert('Documento no encontrado');
    return;
  }
  
  // Crear input de archivo oculto
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx,.jpg,.png';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      documento.estado = 'subido';
      documento.archivo = file.name;
      documento.fechaSubida = new Date().toLocaleString();
      
      // Actualizar la lista visual
      actualizarListaDocumentos();
      
      // Mostrar mensaje en el chat si está abierto
      const chatOverlay = document.getElementById('chatOverlay');
      if (chatOverlay && chatOverlay.style.display === 'flex') {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          const systemMsg = document.createElement('div');
          systemMsg.style.cssText = 'align-self:center;max-width:90%;text-align:center;margin:0.5rem 0;';
          systemMsg.innerHTML = `<div class="bubble system" style="background:transparent;border:1px dashed var(--gold-border);color:var(--text-muted);font-size:.78rem;font-style:italic;padding:.5rem;border-radius:2px;">📎 Documento subido: ${documento.nombre} (${file.name})</div>`;
          chatMessages.appendChild(systemMsg);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
      
      alert(`✅ Documento "${documento.nombre}" subido correctamente.\n\nArchivo: ${file.name}`);
    }
  };
  input.click();
}

// Función para agregar documentos desde el chat (será llamada por chat.js)
function agregarDocumentoPendiente(nombre, descripcion, area) {
  const nuevoDoc = {
    id: Date.now(),
    nombre: nombre,
    descripcion: descripcion,
    estado: 'pendiente',
    fecha: new Date().toLocaleString(),
    area: area || 'General'
  };
  
  if (!window.documentosPendientesGlobal) {
    window.documentosPendientesGlobal = [];
  }
  window.documentosPendientesGlobal.push(nuevoDoc);
  
  // Actualizar la lista si el dashboard está abierto
  actualizarListaDocumentos();
  
  return nuevoDoc;
}

// Exponer funciones globalmente para que chat.js pueda usarlas
window.agregarDocumentoPendiente = agregarDocumentoPendiente;
window.subirDocumentoDesdeDashboard = subirDocumentoDesdeDashboard;
window.actualizarListaDocumentos = actualizarListaDocumentos;
