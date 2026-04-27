// ============================================
// LEGALIA - DASHBOARD COMPLETO (CORREGIDO)
// ============================================

function showDashboard(role, name) {
  const dashboardOverlay = document.getElementById('dashboardOverlay');
  
  // CORREGIDO: Mostrar nombre correctamente
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
        { icon: '📁', title: 'Casos Asignados', desc: 'Gestiona todos tus procesos legales en curso.', action: 'alert("Módulo en desarrollo para abogados")' },
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

  // CORREGIDO: Mostrar texto correctamente (no el código de color)
  document.getElementById('dash-badge').textContent = cfg.badge;
  document.getElementById('dash-badge').style.background = cfg.badgeColor;
  document.getElementById('dash-welcome').textContent = cfg.welcome;
  document.getElementById('dash-desc').textContent = cfg.desc;

  window._currentUser = { name, role, email: window.db?.obtenerUsuarioActual()?.email };
  
  const grid = document.getElementById('dash-grid');
  grid.innerHTML = cfg.items.map(item => {
    return `<div class="dash-card" style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:12px;padding:1.5rem;transition:all 0.3s;cursor:pointer;">
      <div class="dash-card-icon" style="font-size:2rem;margin-bottom:1rem;">${item.icon}</div>
      <h3 class="dash-card-title" style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:400;color:var(--text);margin-bottom:0.5rem;">${item.title}</h3>
      <p class="dash-card-desc" style="font-size:0.85rem;color:var(--text-muted);line-height:1.6;margin-bottom:1.2rem;">${item.desc}</p>
      <button class="dash-card-btn" onclick="${item.action}" style="background:none;border:1px solid var(--gold-border);color:var(--gold);padding:0.45rem 1rem;cursor:pointer;border-radius:4px;font-family:'DM Sans',sans-serif;font-size:0.72rem;transition:all 0.3s;">Abrir →</button>
    </div>`;
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
// MODALES CON ESTILOS CORRECTOS
// ============================================

let modalGenericoActivo = null;

function mostrarModalGenerico(contenido, titulo) {
  if (modalGenericoActivo) modalGenericoActivo.remove();
  
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;overflow-y:auto;';
  
  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--bg);border:1px solid var(--gold-border);border-radius:12px;max-width:900px;width:90%;max-height:85vh;overflow-y:auto;margin:2rem auto;';
  
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg);z-index:10;';
  header.innerHTML = `<h3 style="margin:0;color:var(--gold);font-family:\'Cormorant Garamond\',serif;font-size:1.5rem;">${titulo}</h3><button onclick="cerrarModalGenerico()" style="background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-muted);">&times;</button>`;
  
  const body = document.createElement('div');
  body.style.cssText = 'padding:1.5rem;';
  body.innerHTML = contenido;
  
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  modalGenericoActivo = overlay;
  document.body.style.overflow = 'hidden';
}

function cerrarModalGenerico() {
  if (modalGenericoActivo) {
    modalGenericoActivo.remove();
    modalGenericoActivo = null;
  }
  document.body.style.overflow = '';
}

// ============================================
// FUNCIONES DE CADA MÓDULO
// ============================================

function verMisCasos() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  const nombreUsuario = usuarioActual?.nombre || window._currentUser?.name || 'Usuario';
  
  const html = `
    <div style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">⚖️</div>
      <h2 style="color:var(--gold);margin-bottom:1rem;">Mis Casos</h2>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;">Aquí podrás ver y gestionar todos tus procesos legales.</p>
      <div style="background:var(--bg2);border-radius:8px;padding:1rem;margin-bottom:1rem;">
        <p style="color:var(--text);"><strong>${nombreUsuario}</strong>, pronto podrás:</p>
        <ul style="text-align:left;color:var(--text-muted);margin-top:0.5rem;">
          <li>✓ Ver todos tus casos activos</li>
          <li>✓ Crear nuevos casos legales</li>
          <li>✓ Hacer seguimiento a cada proceso</li>
          <li>✓ Ver quién es tu abogado asignado</li>
        </ul>
      </div>
      <button class="btn-primary" onclick="cerrarModalGenerico()" style="margin-top:1rem;">Cerrar</button>
    </div>
  `;
  mostrarModalGenerico(html, 'Mis Casos');
}

function verCitas() {
  const html = `
    <div style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">📅</div>
      <h2 style="color:var(--gold);margin-bottom:1rem;">Mis Citas</h2>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;">Gestiona tus reuniones con abogados.</p>
      <div style="background:var(--bg2);border-radius:8px;padding:1rem;">
        <p>📌 Próximamente podrás:</p>
        <ul style="text-align:left;margin-top:0.5rem;">
          <li>✓ Agendar citas con tu abogado</li>
          <li>✓ Ver tu calendario de reuniones</li>
          <li>✓ Recibir recordatorios</li>
        </ul>
      </div>
      <button class="btn-primary" onclick="cerrarModalGenerico()" style="margin-top:1rem;">Cerrar</button>
    </div>
  `;
  mostrarModalGenerico(html, 'Citas');
}

function verPagos() {
  const html = `
    <div style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">💰</div>
      <h2 style="color:var(--gold);margin-bottom:1rem;">Pagos y Facturación</h2>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;">Realiza pagos y consulta tus facturas.</p>
      <div style="background:var(--bg2);border-radius:8px;padding:1rem;">
        <p>💳 Próximamente podrás:</p>
        <ul style="text-align:left;margin-top:0.5rem;">
          <li>✓ Generar facturas de servicios</li>
          <li>✓ Realizar pagos seguros</li>
          <li>✓ Descargar comprobantes</li>
        </ul>
      </div>
      <button class="btn-primary" onclick="cerrarModalGenerico()" style="margin-top:1rem;">Cerrar</button>
    </div>
  `;
  mostrarModalGenerico(html, 'Pagos');
}

function verDocumentos() {
  const html = `
    <div style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">📄</div>
      <h2 style="color:var(--gold);margin-bottom:1rem;">Mis Documentos</h2>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;">Accede a tu expediente digital.</p>
      <div style="background:var(--bg2);border-radius:8px;padding:1rem;">
        <p>📁 Próximamente podrás:</p>
        <ul style="text-align:left;margin-top:0.5rem;">
          <li>✓ Ver todos tus documentos</li>
          <li>✓ Subir nuevos documentos</li>
          <li>✓ Compartir documentos con tu abogado</li>
        </ul>
      </div>
      <button class="btn-primary" onclick="cerrarModalGenerico()" style="margin-top:1rem;">Cerrar</button>
    </div>
  `;
  mostrarModalGenerico(html, 'Documentos');
}

function verCalificaciones() {
  const html = `
    <div style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">⭐</div>
      <h2 style="color:var(--gold);margin-bottom:1rem;">Calificaciones</h2>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;">Califica a los abogados que te atendieron.</p>
      <div style="background:var(--bg2);border-radius:8px;padding:1rem;">
        <p>📝 Próximamente podrás:</p>
        <ul style="text-align:left;margin-top:0.5rem;">
          <li>✓ Calificar a tus abogados</li>
          <li>✓ Dejar reseñas</li>
          <li>✓ Ver calificaciones de otros usuarios</li>
        </ul>
      </div>
      <button class="btn-primary" onclick="cerrarModalGenerico()" style="margin-top:1rem;">Cerrar</button>
    </div>
  `;
  mostrarModalGenerico(html, 'Calificaciones');
}

function verMiPerfil() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  const nombre = usuarioActual?.nombre || window._currentUser?.name || 'Usuario';
  const email = usuarioActual?.email || '';
  
  const html = `
    <div style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">👤</div>
      <h2 style="color:var(--gold);margin-bottom:1rem;">Mi Perfil</h2>
      <div style="background:var(--bg2);border-radius:8px;padding:1rem;text-align:left;">
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Rol:</strong> ${usuarioActual?.role || window._currentUser?.role || 'Cliente'}</p>
        <hr style="border-color:var(--gold-border);margin:1rem 0;">
        <p>📝 Próximamente podrás editar:</p>
        <ul>
          <li>✓ Foto de perfil</li>
          <li>✓ Teléfono y dirección</li>
          <li>✓ Documento de identidad</li>
        </ul>
      </div>
      <button class="btn-primary" onclick="cerrarModalGenerico()" style="margin-top:1rem;">Cerrar</button>
    </div>
  `;
  mostrarModalGenerico(html, 'Mi Perfil');
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
      <div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
        <div style="flex:1;">
          <div style="font-weight:500;color:var(--text);">📄 ${escapeHtml(doc.nombre)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(doc.descripcion)}</div>
          <div style="font-size:0.65rem;color:var(--gold);margin-top:0.5rem;">${doc.area || 'General'} · Solicitado: ${new Date(doc.fechaSolicitud).toLocaleString()} · ⏳ Pendiente</div>
        </div>
        <button onclick="subirDocumentoPendiente(${doc.id})" style="background:var(--gold);color:#fff;border:none;padding:0.5rem 1rem;cursor:pointer;border-radius:4px;">📎 Subir</button>
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
        alert(`✅ Documento "${file.name}" subido correctamente`);
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
// FUNCIONES ADMIN
// ============================================

function verificarAbogados() {
  mostrarModalGenerico(`
    <div style="text-align:center;">
      <div style="font-size:3rem;">🛡️</div>
      <h2 style="color:var(--gold);">Verificar Abogados</h2>
      <p>Lista de abogados pendientes de verificación.</p>
      <button class="btn-primary" onclick="cerrarModalGenerico()">Cerrar</button>
    </div>
  `, 'Verificar Abogados');
}

function verEstadisticas() {
  mostrarModalGenerico(`
    <div style="text-align:center;">
      <div style="font-size:3rem;">📊</div>
      <h2 style="color:var(--gold);">Estadísticas</h2>
      <p>Métricas de uso de la plataforma.</p>
      <button class="btn-primary" onclick="cerrarModalGenerico()">Cerrar</button>
    </div>
  `, 'Estadísticas');
}

function gestionarUsuarios() {
  mostrarModalGenerico(`
    <div style="text-align:center;">
      <div style="font-size:3rem;">👤</div>
      <h2 style="color:var(--gold);">Gestión de Usuarios</h2>
      <p>Administra todas las cuentas de la plataforma.</p>
      <button class="btn-primary" onclick="cerrarModalGenerico()">Cerrar</button>
    </div>
  `, 'Gestión de Usuarios');
}

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
window.cerrarModalGenerico = cerrarModalGenerico;
