// ============================================
// LEGALIA DASHBOARD
// ============================================

const D = {
  cliente: { b: '#27ae60', w: 'Bienvenido a tu espacio legal', d: 'Gestiona tus casos, citas, pagos y documentos', i: [
    ['⚖️', 'Mis Casos', 'Seguimiento', 'verMisCasos()'],
    ['💬', 'Chat', 'Comunícate', 'openChat()'],
    ['📅', 'Citas', 'Gestiona reuniones', 'verCitas()'],
    ['💰', 'Pagos', 'Facturas', 'verPagos()'],
    ['📄', 'Documentos', 'Expediente', 'verDocumentos()'],
    ['⭐', 'Calificaciones', 'Califica', 'verCalificaciones()'],
    ['👤', 'Mi Perfil', 'Actualiza datos', 'verMiPerfil()']
  ]},
  abogado: { b: '#2980b9', w: 'Panel de gestión de casos', d: 'Administra tu cartera de clientes', i: [
    ['📁', 'Casos Asignados', 'Gestiona', 'verCasosAbogado()'],
    ['👥', 'Mis Clientes', 'Directorio', 'verClientes()'],
    ['💬', 'Mensajes', 'Chat', 'openChat()'],
    ['📅', 'Agenda', 'Disponibilidad', 'verAgendaAbogado()']
  ]},
  admin: { b: '#8e44ad', w: 'Panel de Administración', d: 'Supervisión completa de la plataforma', i: [
    ['🛡️', 'Verificar Abogados', 'Activa credenciales', 'verificarAbogados()'],
    ['📊', 'Estadísticas', 'Métricas', 'verEstadisticas()'],
    ['👤', 'Usuarios', 'Gestión', 'gestionarUsuarios()']
  ]}
};

function showDashboard(r, n) {
  let c = D[r] || D.cliente;
  document.getElementById('dash-name').innerText = n;
  document.getElementById('dash-badge').innerText = c.b === '#27ae60' ? 'Cliente' : (c.b === '#2980b9' ? 'Abogado' : 'Administrador');
  document.getElementById('dash-badge').style.background = c.b;
  document.getElementById('dash-welcome').innerHTML = c.w;
  document.getElementById('dash-desc').innerHTML = c.d;
  window._currentUser = { name: n, role: r, email: window.db?.obtenerUsuarioActual()?.email };
  let grid = document.getElementById('dash-grid');
  grid.innerHTML = c.i.map(i => `<div class="dash-card"><div class="dash-card-icon">${i[0]}</div><h3 class="dash-card-title">${i[1]}</h3><p class="dash-card-desc">${i[2]}</p><button class="dash-card-btn" onclick="${i[3]}">Abrir →</button></div>`).join('');
  agregarSeccionDocumentos();
  let o = document.getElementById('dashboardOverlay');
  o.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('dashboard-open');
}

function closeDashboard() {
  let o = document.getElementById('dashboardOverlay');
  o.classList.remove('open');
  document.body.classList.remove('dashboard-open');
  document.body.style.overflow = '';
}

let mc = [];

async function verMisCasos() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let t = window.db._db.transaction(['casos'], 'readonly');
  let r = await new Promise(res => t.objectStore('casos').index('usuarioEmail').getAll(u.email).onsuccess = e => res(e.target.result));
  mc = r || [];
  let h = `<div style="padding:2rem 5vw"><div style="display:flex;justify-content:space-between"><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">⚖️ Mis Casos</h2><button class="btn-primary" onclick="mostrarFormularioNuevoCaso()">+ Nuevo Caso</button></div><div>`;
  if (!mc.length) h += `<div style="background:var(--bg2);padding:2rem;text-align:center">📭 No tienes casos registrados</div>`;
  else mc.forEach(c => {
    let ec = c.estado === 'abierto' ? '#27ae60' : (c.estado === 'en_proceso' ? '#f39c12' : '#95a5a6');
    let et = c.estado === 'abierto' ? 'Abierto' : (c.estado === 'en_proceso' ? 'En Proceso' : 'Cerrado');
    h += `<div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:12px;padding:1rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap"><div><h3 style="color:var(--text)">📋 ${c.titulo || 'Caso'}</h3><p style="color:var(--text-muted)">${c.descripcion || ''}</p>
      <div style="display:flex;gap:1rem;margin-top:.5rem;flex-wrap:wrap"><span>👨‍⚖️ ${c.abogadoNombre || 'Por asignar'}</span><span>📅 ${new Date(c.fechaCreacion).toLocaleDateString()}</span>
      <span style="background:${ec}20;color:${ec};padding:0.2rem 0.6rem;border-radius:12px">● ${et}</span></div></div>
      <div><button class="btn-outline" style="padding:0.4rem 1rem" onclick="verDetalleCaso(${c.id})">Ver</button></div></div></div>`;
  });
  h += `</div></div>`;
  mostrarModalGenerico(h, 'Mis Casos');
}

function mostrarFormularioNuevoCaso() {
  mostrarModalGenerico(`<div><h3 style="color:var(--gold)">📋 Nuevo Caso</h3><div class="form-field"><label>Título</label><input id="nc-titulo" placeholder="Ej: Conflicto laboral"></div><div class="form-field"><label>Descripción</label><textarea id="nc-desc" rows="3" placeholder="Describe tu situación..."></textarea></div><div class="form-field"><label>Área</label><select id="nc-area"><option>Civil</option><option>Penal</option><option>Laboral</option><option>Familia</option></select></div><div style="display:flex;gap:1rem"><button class="btn-primary" onclick="crearNuevoCaso()">Crear</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button></div></div>`, 'Nuevo Caso');
}

async function crearNuevoCaso() {
  let t = document.getElementById('nc-titulo')?.value.trim();
  if (!t) { alert('Título requerido'); return; }
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let a = document.getElementById('nc-area')?.value;
  let d = document.getElementById('nc-desc')?.value || '';
  let trans = window.db._db.transaction(['casos'], 'readwrite');
  trans.objectStore('casos').add({ usuarioEmail: u.email, titulo: t, descripcion: d, area: a, estado: 'abierto', abogadoEmail: null, abogadoNombre: null, fechaCreacion: new Date().toISOString(), ultimaActualizacion: new Date().toISOString() }).onsuccess = () => { cerrarModalGenerico(); verMisCasos(); alert('✅ Caso creado'); };
}

function verDetalleCaso(id) {
  let c = mc.find(x => x.id === id);
  if (!c) return;
  mostrarModalGenerico(`<div><h2 style="color:var(--gold)">📋 ${c.titulo}</h2><p>${c.descripcion}</p><p><strong>Área:</strong> ${c.area || 'N/A'}</p><p><strong>Fecha:</strong> ${new Date(c.fechaCreacion).toLocaleDateString()}</p><p><strong>Abogado:</strong> ${c.abogadoNombre || 'Por asignar'}</p><div style="display:flex;gap:1rem;margin-top:1rem"><button class="btn-primary" onclick="alert('Próximamente')">💬 Hablar</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cerrar</button></div></div>`, 'Detalle del Caso');
}

async function verCitas() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let t = window.db._db.transaction(['citas'], 'readonly');
  let r = await new Promise(res => t.objectStore('citas').index('usuarioEmail').getAll(u.email).onsuccess = e => res(e.target.result));
  let h = `<div style="padding:2rem 5vw"><div style="display:flex;justify-content:space-between"><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">📅 Mis Citas</h2><button class="btn-primary" onclick="mostrarFormularioNuevaCita()">+ Agendar</button></div><div>`;
  if (!r.length) h += `<div style="background:var(--bg2);padding:2rem;text-align:center">📅 No hay citas agendadas</div>`;
  else r.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(c => { h += `<div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1rem"><div><strong>📌 ${c.titulo}</strong><br>📅 ${new Date(c.fecha).toLocaleString()}<br>${c.descripcion || ''}</div></div>`; });
  h += `</div></div>`;
  mostrarModalGenerico(h, 'Citas');
}

function mostrarFormularioNuevaCita() {
  mostrarModalGenerico(`<div><h3 style="color:var(--gold)">📅 Agendar Cita</h3><div class="form-field"><label>Título</label><input id="c-titulo" placeholder="Ej: Consulta inicial"></div><div class="form-field"><label>Fecha/Hora</label><input type="datetime-local" id="c-fecha"></div><div class="form-field"><label>Descripción</label><textarea id="c-desc" rows="2" placeholder="¿Qué se tratará?"></textarea></div><div style="display:flex;gap:1rem"><button class="btn-primary" onclick="crearCita()">Agendar</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button></div></div>`, 'Nueva Cita');
}

async function crearCita() {
  let t = document.getElementById('c-titulo')?.value.trim();
  let f = document.getElementById('c-fecha')?.value;
  if (!t || !f) { alert('Completa los campos'); return; }
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let trans = window.db._db.transaction(['citas'], 'readwrite');
  trans.objectStore('citas').add({ usuarioEmail: u.email, titulo: t, fecha: new Date(f).toISOString(), descripcion: document.getElementById('c-desc')?.value || '', fechaCreacion: new Date().toISOString() }).onsuccess = () => { cerrarModalGenerico(); verCitas(); alert('✅ Cita agendada'); };
}

async function verPagos() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let casos = await new Promise(res => window.db._db.transaction(['casos'], 'readonly').objectStore('casos').index('usuarioEmail').getAll(u.email).onsuccess = e => res(e.target.result));
  let h = `<div style="padding:2rem 5vw"><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">💰 Pagos</h2>
    <div style="background:var(--bg2);padding:1.5rem;border-radius:12px;margin-bottom:2rem"><h3>🧾 Nueva Factura</h3>
    <select id="p-caso" class="form-field"><option value="">-- Selecciona un caso --</option>${casos.map(c => `<option value="${c.id}">${c.titulo}</option>`).join('')}</select>
    <select id="p-concepto" class="form-field"><option>Certificado</option><option>Consulta</option><option>Servicio</option></select>
    <input type="number" id="p-monto" placeholder="Valor (COP)" class="form-field">
    <button class="btn-primary" onclick="generarFactura()">Generar Factura</button></div>
    <h3>📋 Historial</h3><div id="lista-pagos"></div></div>`;
  mostrarModalGenerico(h, 'Pagos');
  cargarHistorialPagos();
}

async function cargarHistorialPagos() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let pagos = await new Promise(res => window.db._db.transaction(['pagos'], 'readonly').objectStore('pagos').index('usuarioEmail').getAll(u.email).onsuccess = e => res(e.target.result));
  let lp = document.getElementById('lista-pagos');
  if (!lp) return;
  if (!pagos.length) lp.innerHTML = '<div style="background:var(--bg2);padding:1rem;text-align:center">No hay pagos</div>';
  else lp.innerHTML = pagos.map(p => `<div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;margin-bottom:0.5rem"><div><strong>${p.concepto}</strong> - $${p.monto.toLocaleString()}<br><small>${new Date(p.fecha).toLocaleString()}</small></div><button class="btn-outline" style="padding:0.2rem 0.6rem" onclick="verFactura(${p.id})">Ver</button> <button class="btn-outline" style="padding:0.2rem 0.6rem" onclick="enviarFacturaCorreo(${p.id})">📧</button></div>`).join('');
}

function generarFactura() {
  let c = document.getElementById('p-caso')?.value;
  let con = document.getElementById('p-concepto')?.value;
  let m = parseFloat(document.getElementById('p-monto')?.value);
  if (!c || !m) { alert('Selecciona un caso y monto'); return; }
  alert(`✅ Factura generada\nConcepto: ${con}\nMonto: $${m.toLocaleString()}`);
  verPagos();
}

function verDocumentos() {
  let h = `<div style="padding:2rem 5vw"><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">📄 Documentos</h2>
    <div style="background:var(--bg2);padding:1.5rem;border-radius:12px;margin-bottom:2rem"><h3>📎 Subir documento</h3>
    <input type="text" id="doc-n" placeholder="Nombre" class="form-field">
    <textarea id="doc-d" rows="2" placeholder="Descripción" class="form-field"></textarea>
    <input type="file" id="doc-f" class="form-field">
    <button class="btn-primary" onclick="subirNuevoDocumento()">Subir</button></div>
    <h3>📁 Expediente</h3><div id="lista-docs"></div></div>`;
  mostrarModalGenerico(h, 'Documentos');
  cargarDocumentosExpediente();
}

async function cargarDocumentosExpediente() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let docs = await new Promise(res => window.db._db.transaction(['documentos'], 'readonly').objectStore('documentos').index('usuarioEmail').getAll(u.email).onsuccess = e => res(e.target.result));
  let ld = document.getElementById('lista-docs');
  if (!ld) return;
  if (!docs.length) ld.innerHTML = '<div style="background:var(--bg2);padding:1rem;text-align:center">📭 No hay documentos</div>';
  else ld.innerHTML = docs.map(d => `<div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;margin-bottom:0.5rem"><strong>📄 ${d.nombre}</strong><br><small>${d.descripcion || ''} · ${new Date(d.fechaSolicitud).toLocaleDateString()} · ${d.estado === 'subido' ? '✅ Subido' : '⏳ Pendiente'}</small></div>`).join('');
}

function subirNuevoDocumento() {
  let n = document.getElementById('doc-n')?.value.trim();
  if (!n) { alert('Nombre requerido'); return; }
  alert('✅ Documento subido');
  cargarDocumentosExpediente();
}

function verCalificaciones() {
  let h = `<div style="padding:2rem 5vw"><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">⭐ Calificaciones</h2>
    <div style="background:var(--bg2);padding:1.5rem;border-radius:12px;margin-bottom:2rem"><h3>✍️ Calificar</h3>
    <select id="cal-abogado" class="form-field"><option>Dr. Andrés</option><option>Dra. Camila</option></select>
    <div id="stars" style="display:flex;gap:0.5rem;font-size:2rem;color:#f39c12;margin-bottom:1rem">${[1,2,3,4,5].map(i => `<span onclick="seleccionarPuntuacion(${i})" id="star-${i}" style="cursor:pointer">☆</span>`).join('')}</div>
    <textarea id="cal-resena" rows="2" placeholder="Tu experiencia..." class="form-field"></textarea>
    <button class="btn-primary" onclick="enviarCalificacion()">Enviar</button></div>
    <h3>📋 Mis calificaciones</h3><div id="lista-cal"></div></div>`;
  mostrarModalGenerico(h, 'Calificaciones');
  cargarCalificacionesGuardadas();
}

let puntuacionSeleccionada = 0;
function seleccionarPuntuacion(p) { puntuacionSeleccionada = p; for (let i = 1; i <= 5; i++) document.getElementById(`star-${i}`).innerHTML = i <= p ? '★' : '☆'; }
function enviarCalificacion() { if (!puntuacionSeleccionada) { alert('Selecciona puntuación'); return; } alert('✅ Calificación enviada'); cargarCalificacionesGuardadas(); }
async function cargarCalificacionesGuardadas() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let cal = await new Promise(res => window.db._db.transaction(['calificaciones'], 'readonly').objectStore('calificaciones').index('usuarioEmail').getAll(u.email).onsuccess = e => res(e.target.result));
  let lc = document.getElementById('lista-cal');
  if (!lc) return;
  if (!cal.length) lc.innerHTML = '<div style="background:var(--bg2);padding:1rem;text-align:center">No hay calificaciones</div>';
  else lc.innerHTML = cal.map(c => `<div style="background:var(--card-bg);border-radius:8px;padding:0.8rem;margin-bottom:0.5rem"><strong>${'★'.repeat(c.puntuacion)}${'☆'.repeat(5 - c.puntuacion)}</strong><br>${c.resena || ''}<br><small>${new Date(c.fecha).toLocaleDateString()}</small></div>`).join('');
}

function verMiPerfil() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let h = `<div style="padding:2rem 5vw;max-width:600px;margin:0 auto"><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">👤 Mi Perfil</h2>
    <div style="background:var(--bg2);padding:1.5rem;border-radius:12px"><div style="text-align:center;margin-bottom:1rem"><div id="perfil-foto-preview" style="width:80px;height:80px;border-radius:50%;background:var(--gold-dim);margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid var(--gold)">👤</div><button class="btn-outline" style="font-size:0.7rem;margin-top:0.5rem" onclick="cambiarFotoPerfil()">Cambiar foto</button><input type="file" id="perfil-foto-input" accept="image/*" style="display:none" onchange="previsualizarFotoPerfil()"></div>
    <div class="form-field"><label>Nombre</label><input type="text" id="perfil-nombre" value="${u.nombre || ''}"></div>
    <div class="form-field"><label>Apellido</label><input type="text" id="perfil-apellido" value="${u.apellido || ''}"></div>
    <div class="form-field"><label>Teléfono</label><input type="tel" id="perfil-telefono" placeholder="Ej: 3001234567" value="${u.telefono || ''}"></div>
    <div class="form-field"><label>Documento</label><input type="text" id="perfil-documento" placeholder="CC: 12345678" value="${u.documento || ''}"></div>
    <div style="display:flex;gap:1rem"><button class="btn-primary" onclick="guardarCambiosPerfil()">Guardar</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button></div></div></div>`;
  mostrarModalGenerico(h, 'Mi Perfil');
}
function cambiarFotoPerfil() { document.getElementById('perfil-foto-input')?.click(); }
function previsualizarFotoPerfil() { let i = document.getElementById('perfil-foto-input'), p = document.getElementById('perfil-foto-preview'); if (i?.files?.[0] && p) { let r = new FileReader(); r.onload = e => { p.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; }; r.readAsDataURL(i.files[0]); } }
async function guardarCambiosPerfil() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let n = document.getElementById('perfil-nombre')?.value.trim();
  let a = document.getElementById('perfil-apellido')?.value.trim();
  if (!n || !a) { alert('Nombre y apellido requeridos'); return; }
  u.nombre = n; u.apellido = a; u.telefono = document.getElementById('perfil-telefono')?.value; u.documento = document.getElementById('perfil-documento')?.value;
  window.db._db.transaction(['usuarios'], 'readwrite').objectStore('usuarios').put(u).onsuccess = () => { window.db.setUsuarioActual(u); alert('✅ Perfil actualizado'); cerrarModalGenerico(); document.getElementById('dash-name').innerText = n; };
}

let modalActivo = null;
function mostrarModalGenerico(c, t) { if (modalActivo) modalActivo.remove(); let o = document.createElement('div'); o.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center'; let m = document.createElement('div'); m.style.cssText = 'background:var(--bg);border:1px solid var(--gold-border);border-radius:8px;max-width:800px;width:90%;max-height:90vh;overflow:auto'; let h = document.createElement('div'); h.style.cssText = 'display:flex;justify-content:space-between;padding:1rem;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg)'; h.innerHTML = `<h3 style="color:var(--gold);margin:0">${t}</h3><button onclick="cerrarModalGenerico()" style="background:none;border:none;font-size:1.5rem;cursor:pointer">&times;</button>`; let b = document.createElement('div'); b.innerHTML = c; m.appendChild(h); m.appendChild(b); o.appendChild(m); document.body.appendChild(o); modalActivo = o; document.body.style.overflow = 'hidden'; }
function cerrarModalGenerico() { if (modalActivo) modalActivo.remove(); modalActivo = null; document.body.style.overflow = ''; }

async function agregarSeccionDocumentos() {
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let docs = await window.db.documentos.pendientes(u.email);
  if (!docs?.length) return;
  let sec = document.getElementById('doc-pend-section');
  if (sec) sec.remove();
  sec = document.createElement('div');
  sec.id = 'doc-pend-section';
  sec.innerHTML = `<div style="margin-top:2rem;padding:0 5vw"><div style="font-size:.66rem;letter-spacing:.3em;color:var(--gold);margin-bottom:1rem">📄 Documentos pendientes</div><div id="lista-doc-pend"></div></div>`;
  document.querySelector('#dashboardOverlay>div')?.appendChild(sec);
  actualizarListaDocPend();
}
async function actualizarListaDocPend() {
  let c = document.getElementById('lista-doc-pend');
  if (!c) return;
  let u = window.db?.obtenerUsuarioActual();
  if (!u) return;
  let docs = await window.db.documentos.pendientes(u.email);
  if (!docs?.length) { document.getElementById('doc-pend-section')?.remove(); return; }
  c.innerHTML = docs.map(d => `<div class="doc-item"><div><strong>📄 ${d.nombre}</strong><br><small>${d.descripcion}<br>${new Date(d.fechaSolicitud).toLocaleString()}</small></div><button class="doc-btn" onclick="subirDocPendiente(${d.id})">Subir</button></div>`).join('');
}
async function subirDocPendiente(id) { let inp = document.createElement('input'); inp.type = 'file'; inp.onchange = async e => { if (e.target.files[0]) { await window.db.documentos.subir(id, e.target.files[0].name); await actualizarListaDocPend(); alert('✅ Documento subido'); } }; inp.click(); }

function verCasosAbogado() { alert('Módulo en desarrollo'); }
function verClientes() { alert('Módulo en desarrollo'); }
function verAgendaAbogado() { alert('Módulo en desarrollo'); }
function verificarAbogados() { alert('📋 Función de administración'); }
function verEstadisticas() { alert('📊 Estadísticas próximamente'); }
function gestionarUsuarios() { alert('👥 Gestión de usuarios'); }

window.agregarDocumentoPendiente = async (n, d, a) => { let u = window.db?.obtenerUsuarioActual(); if (!u) return; let id = await window.db.documentos.agregar(u.email, n, d, a); await actualizarListaDocPend(); return id; };
window.actualizarListaDocumentos = actualizarListaDocPend;
window.subirDocumentoPendiente = subirDocPendiente;
