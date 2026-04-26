// ============================================
// LEGALIA - DASHBOARD CON BASE DE DATOS
// ============================================

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
// FUNCIONES PARA ADMINISTRADOR
// ============================================

async function verificarAbogados() {
  if (!window.db) {
    alert('Base de datos no disponible');
    return;
  }
  
  try {
    const usuarios = await window.db.usuarios.todos();
    const abogados = usuarios.filter(u => u.role === 'abogado');
    
    if (abogados.length === 0) {
      alert('No hay abogados pendientes de verificación.');
      return;
    }
    
    let mensaje = '📋 ABOGADOS REGISTRADOS:\n\n';
    abogados.forEach((abogado, index) => {
      mensaje += `${index + 1}. ${abogado.nombre} ${abogado.apellido}\n`;
      mensaje += `   Email: ${abogado.email}\n`;
      mensaje += `   Estado: ${abogado.activo ? '✅ Activo' : '⏳ Pendiente'}\n\n`;
    });
    mensaje += 'Para activar/desactivar un abogado, usa la consola con: window.db.usuarios.activar("email@ejemplo.com", true/false)';
    alert(mensaje);
  } catch (error) {
    alert('Error al cargar abogados: ' + error.message);
  }
}

async function verEstadisticas() {
  if (!window.db) {
    alert('Base de datos no disponible');
    return;
  }
  
  try {
    const usuarios = await window.db.usuarios.todos();
    const conversaciones = await window.db.conversaciones.obtenerPorUsuario('todos');
    const documentos = await window.db.documentos.pendientes('todos');
    
    const clientes = usuarios.filter(u => u.role === 'cliente').length;
    const abogados = usuarios.filter(u => u.role === 'abogado').length;
    const admins = usuarios.filter(u => u.role === 'administrador').length;
    
    alert(`📊 ESTADÍSTICAS DE LEGALIA\n\n` +
          `👥 USUARIOS:\n` +
          `   • Clientes: ${clientes}\n` +
          `   • Abogados: ${abogados}\n` +
          `   • Administradores: ${admins}\n` +
          `   • Total: ${usuarios.length}\n\n` +
          `💬 CONVERSACIONES: ${conversaciones?.length || 0}\n` +
          `📄 DOCUMENTOS PENDIENTES: ${documentos?.length || 0}`);
  } catch (error) {
    alert('Error al cargar estadísticas: ' + error.message);
  }
}

async function gestionarUsuarios() {
  if (!window.db) {
    alert('Base de datos no disponible');
    return;
  }
  
  try {
    const usuarios = await window.db.usuarios.todos();
    
    if (usuarios.length === 0) {
      alert('No hay usuarios registrados.');
      return;
    }
    
    let mensaje = '👥 LISTA DE USUARIOS:\n\n';
    usuarios.forEach((user, index) => {
      const roleIcon = user.role === 'cliente' ? '👤' : (user.role === 'abogado' ? '⚖️' : '👑');
      mensaje += `${index + 1}. ${roleIcon} ${user.nombre} ${user.apellido}\n`;
      mensaje += `   📧 ${user.email}\n`;
      mensaje += `   🔹 Rol: ${user.role}\n`;
      mensaje += `   📅 Registrado: ${new Date(user.fechaRegistro).toLocaleDateString()}\n`;
      mensaje += `   ${user.activo ? '✅ Activo' : '❌ Inactivo'}\n\n`;
    });
    alert(mensaje);
  } catch (error) {
    alert('Error al cargar usuarios: ' + error.message);
  }
}

// ============================================
// FUNCIONES PARA DOCUMENTOS PENDIENTES (CON BD)
// ============================================

async function agregarSeccionDocumentos() {
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
  await actualizarListaDocumentos();
}

async function actualizarListaDocumentos() {
  const lista = document.getElementById('lista-documentos');
  if (!lista) return;
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) {
    lista.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--gold-border);padding:1.5rem;text-align:center;color:var(--text-muted);font-size:.85rem;">
      📭 Inicia sesión para ver tus documentos.
    </div>`;
    return;
  }
  
  try {
    const documentos = await window.db.documentos.pendientes(usuarioActual.email);
    
    if (!documentos || documentos.length === 0) {
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
            ${doc.area || 'General'} · Solicitado: ${new Date(doc.fechaSolicitud).toLocaleString()}
            ${doc.estado === 'subido' ? ' · ✅ Subido' : ' · ⏳ Pendiente'}
          </div>
        </div>
        ${doc.estado === 'pendiente' ? 
          `<button class="doc-btn" onclick="subirDocumentoDesdeDashboard(${doc.id})" style="background:var(--gold);color:#fff;border:none;padding:0.5rem 1rem;font-size:0.75rem;cursor:pointer;border-radius:4px;transition:all 0.3s;">📎 Subir documento</button>` : 
          `<span style="color:#27ae60;font-size:0.75rem;">✓ Documento subido</span>`
        }
      </div>
    `).join('');
  } catch (error) {
    console.error('Error al cargar documentos:', error);
    lista.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--gold-border);padding:1.5rem;text-align:center;color:var(--error);font-size:.85rem;">
      ❌ Error al cargar documentos: ${error.message}
    </div>`;
  }
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

async function subirDocumentoDesdeDashboard(docId) {
  const documento = await obtenerDocumentoPorId(docId);
  if (!documento) {
    alert('Documento no encontrado');
    return;
  }
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx,.jpg,.png';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await window.db.documentos.subir(docId, file.name);
        
        // Actualizar la lista visual
        await actualizarListaDocumentos();
        
        // Mostrar mensaje en el chat si está abierto
        const chatOverlay = document.getElementById('chatOverlay');
        if (chatOverlay && chatOverlay.style.display === 'flex') {
          const chatMessages = document.getElementById('chat-messages');
          if (chatMessages) {
            const systemMsg = document.createElement('div');
            systemMsg.style.cssText = 'align-self:center;max-width:90%;text-align:center;margin:0.5rem 0;';
            systemMsg.innerHTML = `<div class="bubble system">📎 Documento subido: ${documento.nombre} (${file.name})</div>`;
            chatMessages.appendChild(systemMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }
        
        alert(`✅ Documento "${documento.nombre}" subido correctamente.\n\nArchivo: ${file.name}`);
      } catch (error) {
        alert('Error al subir el documento: ' + error.message);
      }
    }
  };
  input.click();
}

async function obtenerDocumentoPorId(docId) {
  return new Promise((resolve, reject) => {
    if (!window.db || !window.db._db) {
      reject(new Error('Base de datos no disponible'));
      return;
    }
    
    const transaction = window.db._db.transaction(['documentos'], 'readonly');
    const store = transaction.objectStore('documentos');
    const request = store.get(docId);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Función para agregar documentos desde el chat (con BD)
async function agregarDocumentoPendiente(nombre, descripcion, area) {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) {
    console.error('No hay usuario logueado');
    return null;
  }
  
  try {
    const docId = await window.db.documentos.agregar(
      usuarioActual.email,
      nombre,
      descripcion,
      area
    );
    
    // Actualizar la lista visual
    await actualizarListaDocumentos();
    
    return { id: docId, nombre, descripcion, area };
  } catch (error) {
    console.error('Error al agregar documento:', error);
    return null;
  }
}

// Exponer funciones globalmente
window.agregarDocumentoPendiente = agregarDocumentoPendiente;
window.subirDocumentoDesdeDashboard = subirDocumentoDesdeDashboard;
window.actualizarListaDocumentos = actualizarListaDocumentos;
window.verificarAbogados = verificarAbogados;
window.verEstadisticas = verEstadisticas;
window.gestionarUsuarios = gestionarUsuarios;
