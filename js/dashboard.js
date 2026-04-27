dashboard.js
// ============================================
// LEGALIA - DASHBOARD COMPLETO
// Mis Casos | Citas | Pagos | Documentos | Calificaciones | Mi Perfil
// ============================================

let dashboardCasos = [];
let dashboardCitas = [];
let dashboardPagos = [];

// ============================================
// MOSTRAR DASHBOARD PRINCIPAL
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

  // Cargar sección de documentos pendientes
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
// MIS CASOS
// ============================================

async function verMisCasos() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;

  try {
    // Obtener casos de la BD
    const transaction = window.db._db.transaction(['casos'], 'readonly');
    const store = transaction.objectStore('casos');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioActual.email);
    
    request.onsuccess = async () => {
      dashboardCasos = request.result || [];
      
      let html = `
        <div style="padding: 2rem 5vw; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="font-family:'Cormorant Garamond',serif; font-size: 2rem; color: var(--gold);">⚖️ Mis Casos</h2>
            <button class="btn-primary" onclick="mostrarFormularioNuevoCaso()">+ Nuevo Caso</button>
          </div>
          <div id="lista-casos" style="display: flex; flex-direction: column; gap: 1rem;">
      `;
      
      if (dashboardCasos.length === 0) {
        html += `<div style="background: var(--bg2); border: 1px solid var(--gold-border); padding: 2rem; text-align: center; color: var(--text-muted);">📭 No tienes casos registrados. Crea tu primer caso.</div>`;
      } else {
        dashboardCasos.forEach(caso => {
          const estadoColor = caso.estado === 'abierto' ? '#27ae60' : (caso.estado === 'en_proceso' ? '#f39c12' : '#95a5a6');
          const estadoTexto = caso.estado === 'abierto' ? 'Abierto' : (caso.estado === 'en_proceso' ? 'En Proceso' : 'Cerrado');
          
          html += `
            <div class="caso-card" style="background: var(--card-bg); border: 1px solid var(--gold-border); border-radius: 12px; padding: 1.5rem; transition: all 0.3s;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div style="flex: 1;">
                  <h3 style="font-size: 1.2rem; color: var(--text); margin-bottom: 0.5rem;">📋 ${caso.titulo || 'Caso sin título'}</h3>
                  <p style="color: var(--text-muted); margin-bottom: 0.5rem;">${caso.descripcion || 'Sin descripción'}</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.8rem;">
                    <span style="background: var(--bg2); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem;">👨‍⚖️ Abogado: ${caso.abogadoNombre || 'Por asignar'}</span>
                    <span style="background: var(--bg2); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem;">📅 Creado: ${new Date(caso.fechaCreacion).toLocaleDateString()}</span>
                    <span style="background: ${estadoColor}20; color: ${estadoColor}; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem;">● ${estadoTexto}</span>
                  </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn-outline" style="padding: 0.4rem 1rem; font-size: 0.7rem;" onclick="verDetalleCaso(${caso.id})">Ver detalles</button>
                  <button class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.7rem;" onclick="editarCaso(${caso.id})">Editar</button>
                </div>
              </div>
            </div>
          `;
        });
      }
      
      html += `</div></div>`;
      mostrarModalGenerico(html, 'Mis Casos');
    };
  } catch (error) {
    console.error('Error al cargar casos:', error);
    alert('Error al cargar casos: ' + error.message);
  }
}

function mostrarFormularioNuevoCaso() {
  const html = `
    <div style="padding: 1rem;">
      <h3 style="font-size: 1.3rem; margin-bottom: 1rem; color: var(--gold);">📋 Nuevo Caso Legal</h3>
      <div class="form-field">
        <label>Título del caso</label>
        <input type="text" id="nuevo-caso-titulo" placeholder="Ej: Conflicto laboral con empresa X">
      </div>
      <div class="form-field">
        <label>Descripción del caso</label>
        <textarea id="nuevo-caso-descripcion" rows="4" placeholder="Describe detalladamente tu situación legal..." style="width:100%; background:var(--bg2); border:1px solid var(--gold-border); color:var(--text); padding:0.7rem;"></textarea>
      </div>
      <div class="form-field">
        <label>Área legal</label>
        <select id="nuevo-caso-area">
          <option value="civil">Derecho Civil</option>
          <option value="penal">Derecho Penal</option>
          <option value="laboral">Derecho Laboral</option>
          <option value="familia">Derecho de Familia</option>
          <option value="comercial">Derecho Comercial</option>
          <option value="administrativo">Derecho Administrativo</option>
        </select>
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="btn-primary" onclick="crearNuevoCaso()">Crear Caso</button>
        <button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button>
      </div>
    </div>
  `;
  mostrarModalGenerico(html, 'Nuevo Caso');
}

async function crearNuevoCaso() {
  const titulo = document.getElementById('nuevo-caso-titulo')?.value.trim();
  const descripcion = document.getElementById('nuevo-caso-descripcion')?.value.trim();
  const area = document.getElementById('nuevo-caso-area')?.value;
  
  if (!titulo) {
    alert('Por favor ingresa un título para el caso');
    return;
  }
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const transaction = window.db._db.transaction(['casos'], 'readwrite');
    const store = transaction.objectStore('casos');
    
    const nuevoCaso = {
      usuarioEmail: usuarioActual.email,
      titulo: titulo,
      descripcion: descripcion || 'Sin descripción',
      area: area,
      estado: 'abierto',
      abogadoEmail: null,
      abogadoNombre: null,
      fechaCreacion: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    };
    
    const request = store.add(nuevoCaso);
    request.onsuccess = () => {
      cerrarModalGenerico();
      verMisCasos();
      alert('✅ Caso creado exitosamente');
    };
    request.onerror = (event) => {
      alert('Error al crear el caso: ' + event.target.error);
    };
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function verDetalleCaso(casoId) {
  const caso = dashboardCasos.find(c => c.id === casoId);
  if (!caso) return;
  
  const estadoColor = caso.estado === 'abierto' ? '#27ae60' : (caso.estado === 'en_proceso' ? '#f39c12' : '#95a5a6');
  const estadoTexto = caso.estado === 'abierto' ? 'Abierto' : (caso.estado === 'en_proceso' ? 'En Proceso' : 'Cerrado');
  
  const html = `
    <div style="padding: 1rem;">
      <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--gold);">📋 ${caso.titulo}</h3>
      <div style="margin-bottom: 1.5rem;">
        <span style="background: ${estadoColor}20; color: ${estadoColor}; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem;">● ${estadoTexto}</span>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="font-weight: 600; margin-bottom: 0.3rem;">Descripción</h4>
        <p style="color: var(--text-muted);">${caso.descripcion}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div><strong>Área legal:</strong> ${caso.area || 'No especificada'}</div>
        <div><strong>Fecha creación:</strong> ${new Date(caso.fechaCreacion).toLocaleDateString()}</div>
        <div><strong>Abogado asignado:</strong> ${caso.abogadoNombre || 'Por asignar'}</div>
        <div><strong>Última actualización:</strong> ${new Date(caso.ultimaActualizacion).toLocaleDateString()}</div>
      </div>
      
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button class="btn-primary" onclick="alert('Próximamente: chat con abogado')">💬 Hablar con abogado</button>
        <button class="btn-outline" onclick="cerrarModalGenerico()">Cerrar</button>
      </div>
    </div>
  `;
  mostrarModalGenerico(html, 'Detalle del Caso');
}

// ============================================
// CITAS
// ============================================

async function verCitas() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const transaction = window.db._db.transaction(['citas'], 'readonly');
    const store = transaction.objectStore('citas');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioActual.email);
    
    request.onsuccess = () => {
      const citas = request.result || [];
      
      let html = `
        <div style="padding: 2rem 5vw; max-width: 900px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="font-family:'Cormorant Garamond',serif; font-size: 2rem; color: var(--gold);">📅 Mis Citas</h2>
            <button class="btn-primary" onclick="mostrarFormularioNuevaCita()">+ Agendar Cita</button>
          </div>
          <div id="lista-citas" style="display: flex; flex-direction: column; gap: 1rem;">
      `;
      
      if (citas.length === 0) {
        html += `<div style="background: var(--bg2); border: 1px solid var(--gold-border); padding: 2rem; text-align: center;">📅 No tienes citas agendadas.</div>`;
      } else {
        citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        citas.forEach(cita => {
          html += `
            <div class="cita-card" style="background: var(--card-bg); border: 1px solid var(--gold-border); border-radius: 12px; padding: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                  <div style="font-weight: 600;">📌 ${cita.titulo}</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">📅 ${new Date(cita.fecha).toLocaleString()}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${cita.descripcion || ''}</div>
                </div>
                <button class="btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.7rem;" onclick="eliminarCita(${cita.id})">Cancelar</button>
              </div>
            </div>
          `;
        });
      }
      
      html += `</div></div>`;
      mostrarModalGenerico(html, 'Mis Citas');
    };
  } catch (error) {
    alert('Error al cargar citas: ' + error.message);
  }
}

function mostrarFormularioNuevaCita() {
  const html = `
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">📅 Agendar nueva cita</h3>
      <div class="form-field">
        <label>Título</label>
        <input type="text" id="nueva-cita-titulo" placeholder="Ej: Consulta inicial">
      </div>
      <div class="form-field">
        <label>Fecha y hora</label>
        <input type="datetime-local" id="nueva-cita-fecha">
      </div>
      <div class="form-field">
        <label>Descripción</label>
        <textarea id="nueva-cita-descripcion" rows="3" placeholder="¿Qué se tratará en la cita?" style="width:100%; background:var(--bg2); border:1px solid var(--gold-border); color:var(--text); padding:0.7rem;"></textarea>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button class="btn-primary" onclick="crearNuevaCita()">Agendar</button>
        <button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button>
      </div>
    </div>
  `;
  mostrarModalGenerico(html, 'Nueva Cita');
}

async function crearNuevaCita() {
  const titulo = document.getElementById('nueva-cita-titulo')?.value.trim();
  const fecha = document.getElementById('nueva-cita-fecha')?.value;
  const descripcion = document.getElementById('nueva-cita-descripcion')?.value.trim();
  
  if (!titulo) {
    alert('Ingresa un título para la cita');
    return;
  }
  if (!fecha) {
    alert('Selecciona una fecha y hora');
    return;
  }
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const transaction = window.db._db.transaction(['citas'], 'readwrite');
    const store = transaction.objectStore('citas');
    
    const nuevaCita = {
      usuarioEmail: usuarioActual.email,
      titulo: titulo,
      fecha: new Date(fecha).toISOString(),
      descripcion: descripcion || '',
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString()
    };
    
    const request = store.add(nuevaCita);
    request.onsuccess = () => {
      cerrarModalGenerico();
      verCitas();
      alert('✅ Cita agendada exitosamente');
    };
    request.onerror = () => alert('Error al agendar la cita');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ============================================
// PAGOS
// ============================================

async function verPagos() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  // Obtener casos del usuario para el selector
  const transaction = window.db._db.transaction(['casos'], 'readonly');
  const store = transaction.objectStore('casos');
  const index = store.index('usuarioEmail');
  const request = index.getAll(usuarioActual.email);
  
  request.onsuccess = () => {
    const casos = request.result || [];
    
    let html = `
      <div style="padding: 2rem 5vw; max-width: 800px; margin: 0 auto;">
        <h2 style="font-family:'Cormorant Garamond',serif; font-size: 2rem; color: var(--gold); margin-bottom: 2rem;">💰 Pagos y Facturación</h2>
        
        <div style="background: var(--bg2); border: 1px solid var(--gold-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">🧾 Generar nueva factura</h3>
          <div class="form-field">
            <label>Seleccionar caso</label>
            <select id="pago-caso-id">
              <option value="">-- Selecciona un caso --</option>
              ${casos.map(c => `<option value="${c.id}">${c.titulo}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label>Concepto del pago</label>
            <select id="pago-concepto">
              <option value="certificado">Certificado legal</option>
              <option value="consulta">Consulta jurídica</option>
              <option value="documento">Documento/Formulario</option>
              <option value="servicio">Servicio del abogado</option>
            </select>
          </div>
          <div class="form-field">
            <label>Valor a pagar (COP)</label>
            <input type="number" id="pago-monto" placeholder="Ej: 150000">
          </div>
          <button class="btn-primary" onclick="generarFactura()">Generar factura</button>
        </div>
        
        <h3 style="margin-bottom: 1rem;">📋 Historial de pagos</h3>
        <div id="lista-pagos" style="display: flex; flex-direction: column; gap: 0.8rem;">
          <!-- Aquí se cargarán los pagos guardados -->
        </div>
      </div>
    `;
    mostrarModalGenerico(html, 'Pagos');
    cargarHistorialPagos();
  };
}

async function cargarHistorialPagos() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const transaction = window.db._db.transaction(['pagos'], 'readonly');
    const store = transaction.objectStore('pagos');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioActual.email);
    
    request.onsuccess = () => {
      const pagos = request.result || [];
      const listaPagos = document.getElementById('lista-pagos');
      if (!listaPagos) return;
      
      if (pagos.length === 0) {
        listaPagos.innerHTML = '<div style="background: var(--bg2); padding: 1rem; text-align: center; color: var(--text-muted);">No hay pagos registrados.</div>';
      } else {
        listaPagos.innerHTML = pagos.map(pago => `
          <div style="background: var(--card-bg); border: 1px solid var(--gold-border); border-radius: 8px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div><strong>📄 ${pago.concepto}</strong></div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Caso: ${pago.casoTitulo || 'N/A'} · Fecha: ${new Date(pago.fecha).toLocaleString()}</div>
              </div>
              <div>
                <span style="color: #27ae60; font-weight: 600;">$${pago.monto.toLocaleString()}</span>
              </div>
            </div>
            <div style="margin-top: 0.5rem;">
              <button class="btn-outline" style="padding: 0.2rem 0.6rem; font-size: 0.65rem;" onclick="verFactura(${pago.id})">Ver factura</button>
              <button class="btn-outline" style="padding: 0.2rem 0.6rem; font-size: 0.65rem; margin-left: 0.5rem;" onclick="enviarFacturaCorreo(${pago.id})">📧 Enviar al correo</button>
            </div>
          </div>
        `).join('');
      }
    };
  } catch (error) {
    console.error('Error cargar pagos:', error);
  }
}

function generarFactura() {
  const casoId = document.getElementById('pago-caso-id')?.value;
  const concepto = document.getElementById('pago-concepto')?.value;
  const monto = parseFloat(document.getElementById('pago-monto')?.value);
  
  if (!casoId) {
    alert('Selecciona un caso');
    return;
  }
  if (!monto || monto <= 0) {
    alert('Ingresa un monto válido');
    return;
  }
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  // Obtener el título del caso
  const transaction = window.db._db.transaction(['casos'], 'readonly');
  const store = transaction.objectStore('casos');
  const request = store.get(parseInt(casoId));
  
  request.onsuccess = async () => {
    const caso = request.result;
    
    const factura = {
      usuarioEmail: usuarioActual.email,
      casoId: parseInt(casoId),
      casoTitulo: caso?.titulo || 'Caso',
      concepto: concepto,
      monto: monto,
      fecha: new Date().toISOString(),
      estado: 'pagado',
      numeroFactura: 'FAC-' + Date.now()
    };
    
    const trans = window.db._db.transaction(['pagos'], 'readwrite');
    const pagosStore = trans.objectStore('pagos');
    const addRequest = pagosStore.add(factura);
    
    addRequest.onsuccess = () => {
      alert(`✅ Factura generada exitosamente\n\n${factura.numeroFactura}\nConcepto: ${concepto}\nMonto: $${monto.toLocaleString()}\nSe ha guardado en tu historial.`);
      verPagos();
    };
    addRequest.onerror = () => alert('Error al guardar la factura');
  };
}

function verFactura(pagoId) {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const transaction = window.db._db.transaction(['pagos'], 'readonly');
  const store = transaction.objectStore('pagos');
  const request = store.get(pagoId);
  
  request.onsuccess = () => {
    const pago = request.result;
    if (!pago) return;
    
    const html = `
      <div style="padding: 1.5rem; max-width: 500px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h2 style="color: var(--gold);">LEGALIA</h2>
          <p>Factura de servicios legales</p>
        </div>
        <div style="border-top: 1px solid var(--gold-border); padding-top: 1rem;">
          <p><strong>Número:</strong> ${pago.numeroFactura}</p>
          <p><strong>Fecha:</strong> ${new Date(pago.fecha).toLocaleString()}</p>
          <p><strong>Caso:</strong> ${pago.casoTitulo}</p>
          <p><strong>Concepto:</strong> ${pago.concepto}</p>
          <p><strong>Valor:</strong> $${pago.monto.toLocaleString()}</p>
          <p><strong>Estado:</strong> <span style="color:#27ae60;">${pago.estado}</span></p>
        </div>
        <div style="text-align: center; margin-top: 1.5rem;">
          <button class="btn-primary" onclick="window.print()">🖨️ Imprimir</button>
          <button class="btn-outline" onclick="cerrarModalGenerico()">Cerrar</button>
        </div>
      </div>
    `;
    mostrarModalGenerico(html, `Factura ${pago.numeroFactura}`);
  };
}

function enviarFacturaCorreo(pagoId) {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const transaction = window.db._db.transaction(['pagos'], 'readonly');
  const store = transaction.objectStore('pagos');
  const request = store.get(pagoId);
  
  request.onsuccess = () => {
    const pago = request.result;
    if (!pago) return;
    
    // Simular envío de correo
    const mailto = `mailto:${usuarioActual.email}?subject=Factura Legalia ${pago.numeroFactura}&body=Hola ${usuarioActual.nombre},\n\nAdjunto encontrará los detalles de su factura:\n\nNúmero: ${pago.numeroFactura}\nFecha: ${new Date(pago.fecha).toLocaleString()}\nConcepto: ${pago.concepto}\nValor: $${pago.monto.toLocaleString()}\nEstado: ${pago.estado}\n\nGracias por usar Legalia.`;
    window.location.href = mailto;
    alert('📧 Se abrirá tu cliente de correo para enviar la factura');
  };
}

// ============================================
// DOCUMENTOS
// ============================================

function verDocumentos() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const html = `
    <div style="padding: 2rem 5vw; max-width: 1000px; margin: 0 auto;">
      <h2 style="font-family:'Cormorant Garamond',serif; font-size: 2rem; color: var(--gold); margin-bottom: 2rem;">📄 Mis Documentos</h2>
      
      <div style="background: var(--bg2); border: 1px solid var(--gold-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">📎 Subir nuevo documento</h3>
        <div class="form-field">
          <label>Nombre del documento</label>
          <input type="text" id="doc-nombre" placeholder="Ej: Contrato laboral">
        </div>
        <div class="form-field">
          <label>Descripción</label>
          <textarea id="doc-descripcion" rows="2" placeholder="Breve descripción..." style="width:100%; background:var(--bg2); border:1px solid var(--gold-border); color:var(--text); padding:0.7rem;"></textarea>
        </div>
        <div class="form-field">
          <label>Archivo (opcional)</label>
          <input type="file" id="doc-archivo" accept=".pdf,.jpg,.png,.docx">
        </div>
        <button class="btn-primary" onclick="subirNuevoDocumento()">📤 Subir documento</button>
      </div>
      
      <h3 style="margin-bottom: 1rem;">📁 Documentos en tu expediente</h3>
      <div id="lista-documentos-expediente" style="display: flex; flex-direction: column; gap: 0.8rem;"></div>
    </div>
  `;
  mostrarModalGenerico(html, 'Documentos');
  cargarDocumentosExpediente();
}

async function cargarDocumentosExpediente() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const transaction = window.db._db.transaction(['documentos'], 'readonly');
    const store = transaction.objectStore('documentos');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioActual.email);
    
    request.onsuccess = () => {
      const docs = request.result || [];
      const container = document.getElementById('lista-documentos-expediente');
      if (!container) return;
      
      if (docs.length === 0) {
        container.innerHTML = '<div style="background: var(--bg2); padding: 1.5rem; text-align: center; color: var(--text-muted);">📭 No hay documentos en tu expediente. Sube tu primer documento.</div>';
      } else {
        container.innerHTML = docs.map(doc => `
          <div style="background: var(--card-bg); border: 1px solid var(--gold-border); border-radius: 8px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div><strong>📄 ${doc.nombre}</strong></div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${doc.descripcion || 'Sin descripción'} · ${new Date(doc.fechaSolicitud).toLocaleDateString()} · Estado: ${doc.estado === 'subido' ? '✅ Subido' : '⏳ Pendiente'}</div>
              </div>
              <div>
                ${doc.estado === 'subido' ? '<span style="color:#27ae60;">✓</span>' : '<span style="color:#f39c12;">⏳</span>'}
              </div>
            </div>
          </div>
        `).join('');
      }
    };
  } catch (error) {
    console.error('Error cargar documentos:', error);
  }
}

function subirNuevoDocumento() {
  const nombre = document.getElementById('doc-nombre')?.value.trim();
  const descripcion = document.getElementById('doc-descripcion')?.value.trim();
  const archivoInput = document.getElementById('doc-archivo');
  const archivo = archivoInput?.files[0];
  
  if (!nombre) {
    alert('Ingresa un nombre para el documento');
    return;
  }
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const transaction = window.db._db.transaction(['documentos'], 'readwrite');
  const store = transaction.objectStore('documentos');
  
  const nuevoDoc = {
    usuarioEmail: usuarioActual.email,
    nombre: nombre,
    descripcion: descripcion || '',
    area: 'General',
    estado: archivo ? 'subido' : 'pendiente',
    archivo: archivo ? archivo.name : null,
    fechaSolicitud: new Date().toISOString(),
    fechaSubida: archivo ? new Date().toISOString() : null
  };
  
  const request = store.add(nuevoDoc);
  request.onsuccess = () => {
    alert('✅ Documento subido exitosamente');
    if (archivoInput) archivoInput.value = '';
    document.getElementById('doc-nombre').value = '';
    document.getElementById('doc-descripcion').value = '';
    cargarDocumentosExpediente();
  };
  request.onerror = () => alert('Error al subir el documento');
}

// ============================================
// CALIFICACIONES
// ============================================

async function verCalificaciones() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  // Obtener abogados con los que ha tenido casos
  const transaction = window.db._db.transaction(['casos'], 'readonly');
  const store = transaction.objectStore('casos');
  const index = store.index('usuarioEmail');
  const request = index.getAll(usuarioActual.email);
  
  request.onsuccess = () => {
    const casos = request.result || [];
    const abogadosUnicos = [];
    casos.forEach(caso => {
      if (caso.abogadoNombre && !abogadosUnicos.find(a => a.nombre === caso.abogadoNombre)) {
        abogadosUnicos.push({ nombre: caso.abogadoNombre, email: caso.abogadoEmail });
      }
    });
    
    let html = `
      <div style="padding: 2rem 5vw; max-width: 800px; margin: 0 auto;">
        <h2 style="font-family:'Cormorant Garamond',serif; font-size: 2rem; color: var(--gold); margin-bottom: 2rem;">⭐ Calificaciones</h2>
        
        <div style="background: var(--bg2); border: 1px solid var(--gold-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">✍️ Calificar a tu abogado</h3>
          <div class="form-field">
            <label>Abogado</label>
            <select id="calificacion-abogado-email">
              <option value="">-- Selecciona un abogado --</option>
              ${abogadosUnicos.map(a => `<option value="${a.email}">${a.nombre}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label>Puntuación</label>
            <div id="calificacion-estrellas" style="display: flex; gap: 0.5rem; font-size: 2rem; color: #f39c12;">
              ${[1,2,3,4,5].map(i => `<span onclick="seleccionarPuntuacion(${i})" style="cursor: pointer;" id="estrella-${i}">☆</span>`).join('')}
            </div>
            <input type="hidden" id="calificacion-puntuacion" value="0">
          </div>
          <div class="form-field">
            <label>Reseña</label>
            <textarea id="calificacion-resena" rows="3" placeholder="Cuéntanos tu experiencia con este abogado..." style="width:100%; background:var(--bg2); border:1px solid var(--gold-border); color:var(--text); padding:0.7rem;"></textarea>
          </div>
          <button class="btn-primary" onclick="enviarCalificacion()">Enviar calificación</button>
        </div>
        
        <h3 style="margin-bottom: 1rem;">📋 Mis calificaciones</h3>
        <div id="lista-calificaciones" style="display: flex; flex-direction: column; gap: 0.8rem;"></div>
      </div>
    `;
    mostrarModalGenerico(html, 'Calificaciones');
    cargarCalificacionesGuardadas();
  };
}

let puntuacionSeleccionada = 0;

function seleccionarPuntuacion(puntos) {
  puntuacionSeleccionada = puntos;
  document.getElementById('calificacion-puntuacion').value = puntos;
  for (let i = 1; i <= 5; i++) {
    const estrella = document.getElementById(`estrella-${i}`);
    if (estrella) estrella.textContent = i <= puntos ? '★' : '☆';
  }
}

async function enviarCalificacion() {
  const abogadoEmail = document.getElementById('calificacion-abogado-email')?.value;
  const puntuacion = puntuacionSeleccionada;
  const resena = document.getElementById('calificacion-resena')?.value.trim();
  
  if (!abogadoEmail) {
    alert('Selecciona un abogado');
    return;
  }
  if (puntuacion === 0) {
    alert('Selecciona una puntuación');
    return;
  }
  
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const transaction = window.db._db.transaction(['calificaciones'], 'readwrite');
  const store = transaction.objectStore('calificaciones');
  
  const calificacion = {
    usuarioEmail: usuarioActual.email,
    abogadoEmail: abogadoEmail,
    puntuacion: puntuacion,
    resena: resena || '',
    fecha: new Date().toISOString()
  };
  
  const request = store.add(calificacion);
  request.onsuccess = () => {
    alert('✅ Calificación enviada. ¡Gracias por tu feedback!');
    seleccionarPuntuacion(0);
    document.getElementById('calificacion-resena').value = '';
    cargarCalificacionesGuardadas();
  };
  request.onerror = () => alert('Error al enviar la calificación');
}

async function cargarCalificacionesGuardadas() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const transaction = window.db._db.transaction(['calificaciones'], 'readonly');
  const store = transaction.objectStore('calificaciones');
  const index = store.index('usuarioEmail');
  const request = index.getAll(usuarioActual.email);
  
  request.onsuccess = () => {
    const calificaciones = request.result || [];
    const container = document.getElementById('lista-calificaciones');
    if (!container) return;
    
    if (calificaciones.length === 0) {
      container.innerHTML = '<div style="background: var(--bg2); padding: 1rem; text-align: center;">No has calificado a ningún abogado aún.</div>';
    } else {
      container.innerHTML = calificaciones.map(cal => `
        <div style="background: var(--card-bg); border: 1px solid var(--gold-border); border-radius: 8px; padding: 0.8rem;">
          <div style="display: flex; justify-content: space-between;">
            <strong>${cal.abogadoEmail}</strong>
            <span style="color: #f39c12;">${'★'.repeat(cal.puntuacion)}${'☆'.repeat(5 - cal.puntuacion)}</span>
          </div>
          <div style="font-size: 0.8rem; margin-top: 0.3rem;">${cal.resena || 'Sin reseña'}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.3rem;">${new Date(cal.fecha).toLocaleDateString()}</div>
        </div>
      `).join('');
    }
  };
}

// ============================================
// MI PERFIL
// ============================================

function verMiPerfil() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const html = `
    <div style="padding: 2rem 5vw; max-width: 600px; margin: 0 auto;">
      <h2 style="font-family:'Cormorant Garamond',serif; font-size: 2rem; color: var(--gold); margin-bottom: 2rem;">👤 Mi Perfil</h2>
      
      <div style="background: var(--bg2); border: 1px solid var(--gold-border); border-radius: 12px; padding: 1.5rem;">
        <div style="text-align: center; margin-bottom: 1rem;">
          <div id="perfil-foto-preview" style="width: 100px; height: 100px; border-radius: 50%; background: var(--gold-dim); margin: 0 auto 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 2px solid var(--gold);">
            👤
          </div>
          <button class="btn-outline" style="font-size: 0.7rem;" onclick="cambiarFotoPerfil()">Cambiar foto</button>
          <input type="file" id="perfil-foto-input" accept="image/*" style="display: none;" onchange="previsualizarFotoPerfil()">
        </div>
        
        <div class="form-field">
          <label>Nombre</label>
          <input type="text" id="perfil-nombre" value="${usuarioActual.nombre || ''}">
        </div>
        <div class="form-field">
          <label>Apellido</label>
          <input type="text" id="perfil-apellido" value="${usuarioActual.apellido || ''}">
        </div>
        <div class="form-field">
          <label>Correo electrónico</label>
          <input type="email" id="perfil-email" value="${usuarioActual.email || ''}" readonly style="background: var(--bg3);">
        </div>
        <div class="form-field">
          <label>Teléfono</label>
          <input type="tel" id="perfil-telefono" placeholder="Ej: 3001234567" value="${usuarioActual.telefono || ''}">
        </div>
        <div class="form-field">
          <label>Documento de identidad</label>
          <input type="text" id="perfil-documento" placeholder="CC: 12345678" value="${usuarioActual.documento || ''}">
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button class="btn-primary" onclick="guardarCambiosPerfil()">Guardar cambios</button>
          <button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  mostrarModalGenerico(html, 'Mi Perfil');
}

function cambiarFotoPerfil() {
  document.getElementById('perfil-foto-input')?.click();
}

function previsualizarFotoPerfil() {
  const input = document.getElementById('perfil-foto-input');
  const preview = document.getElementById('perfil-foto-preview');
  if (input && input.files && input.files[0] && preview) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function guardarCambiosPerfil() {
  const usuarioActual = window.db?.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  const nombre = document.getElementById('perfil-nombre')?.value.trim();
  const apellido = document.getElementById('perfil-apellido')?.value.trim();
  const telefono = document.getElementById('perfil-telefono')?.value.trim();
  const documento = document.getElementById('perfil-documento')?.value.trim();
  
  if (!nombre || !apellido) {
    alert('Nombre y apellido son obligatorios');
    return;
  }
  
  // Actualizar en la base de datos
  const transaction = window.db._db.transaction(['usuarios'], 'readwrite');
  const store = transaction.objectStore('usuarios');
  
  usuarioActual.nombre = nombre;
  usuarioActual.apellido = apellido;
  usuarioActual.telefono = telefono;
  usuarioActual.documento = documento;
  
  const request = store.put(usuarioActual);
  request.onsuccess = () => {
    window.db.setUsuarioActual(usuarioActual);
    alert('✅ Perfil actualizado correctamente');
    cerrarModalGenerico();
    // Actualizar nombre en el dashboard
    document.getElementById('dash-name').textContent = nombre;
  };
  request.onerror = () => alert('Error al guardar los cambios');
}

// ============================================
// FUNCIONES AUXILIARES (Modales genéricos)
// ============================================

let modalGenericoActivo = null;

function mostrarModalGenerico(contenido, titulo) {
  cerrarModalGenerico();
  
  const overlay = document.createElement('div');
  overlay.id = 'modal-generico-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;overflow-y:auto;';
  
  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--bg);border:1px solid var(--gold-border);border-radius:8px;max-width:900px;width:90%;max-height:90vh;overflow-y:auto;margin:2rem auto;';
  
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg);';
  header.innerHTML = `<h3 style="margin:0;color:var(--gold);">${titulo}</h3><button onclick="cerrarModalGenerico()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>`;
  
  const body = document.createElement('div');
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
// DOCUMENTOS PENDIENTES (Sección en dashboard)
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
          <div style="font-size:0.65rem;color:var(--gold);margin-top:0.5rem;">${doc.area} · Solicitado: ${new Date(doc.fechaSolicitud).toLocaleString()} · ⏳ Pendiente</div>
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

// Funciones placeholder para abogado/administrador
function verCasosAbogado() { alert('Módulo en desarrollo para abogados'); }
function verClientes() { alert('Módulo en desarrollo'); }
function verAgendaAbogado() { alert('Módulo en desarrollo'); }
function editarCaso(id) { alert('Editar caso próximo'); }
function eliminarCita(id) { alert('Eliminar cita próximo'); }


volvamos a este pero obviamente borremos cosas sin perder estructura
