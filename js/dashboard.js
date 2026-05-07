// ============================================
// LEGALIA DASHBOARD - VERSIÓN MEJORADA
// ============================================

let DC = [];

function showDashboard(role, name) {
    const overlay = document.getElementById('dashboardOverlay');
    document.getElementById('dash-name').innerText = name;
    
    const configs = {
        cliente: {
            badge: 'Cliente',
            badgeColor: '#27ae60',
            welcome: `Bienvenido, ${name}`,
            desc: 'Desde aquí puedes gestionar tus casos, comunicarte con tu abogado y realizar pagos.',
            items: [
                { icon: '⚖️', title: 'Mis Casos', desc: 'Seguimiento de tus procesos legales', action: 'verMisCasos()' },
                { icon: '💬', title: 'Chat Legal', desc: 'Comunicación segura con tu abogado', action: 'openChat()' },
                { icon: '📅', title: 'Agenda', desc: 'Citas y reuniones programadas', action: 'verCitas()' },
                { icon: '💰', title: 'Pagos', desc: 'Facturas y método de pago', action: 'verPagos()' },
                { icon: '📄', title: 'Documentos', desc: 'Expediente digital', action: 'verDocumentos()' },
                { icon: '⭐', title: 'Calificar', desc: 'Evalúa a tu abogado', action: 'verCalificaciones()' },
                { icon: '👤', title: 'Mi Perfil', desc: 'Actualiza tu información', action: 'verMiPerfil()' }
            ]
        },
        abogado: {
            badge: 'Abogado',
            badgeColor: '#2980b9',
            welcome: `Bienvenido, Abog. ${name}`,
            desc: 'Administra tus casos, clientes y agenda profesional.',
            items: [
                { icon: '📁', title: 'Mis Casos', desc: 'Casos asignados', action: 'verCasosAbogado()' },
                { icon: '👥', title: 'Clientes', desc: 'Directorio de clientes', action: 'verClientes()' },
                { icon: '💬', title: 'Mensajes', desc: 'Comunicación con clientes', action: 'openChat()' },
                { icon: '📅', title: 'Agenda', desc: 'Disponibilidad y citas', action: 'verAgendaAbogado()' },
                { icon: '📊', title: 'Reportes', desc: 'Informes de casos', action: 'verReportesAbogado()' }
            ]
        },
        administrador: {
            badge: 'Admin',
            badgeColor: '#8e44ad',
            welcome: `Bienvenido, Administrador ${name}`,
            desc: 'Panel de control completo de la plataforma Legalia.',
            items: [
                { icon: '🛡️', title: 'Verificar Abogados', desc: 'Valida credenciales profesionales', action: 'verificarAbogados()' },
                { icon: '📊', title: 'Estadísticas', desc: 'Métricas de la plataforma', action: 'verEstadisticas()' },
                { icon: '👤', title: 'Usuarios', desc: 'Gestión de cuentas', action: 'gestionarUsuarios()' },
                { icon: '⚖️', title: 'Casos Globales', desc: 'Supervisión de procesos', action: 'verCasosGlobales()' },
                { icon: '💰', title: 'Transacciones', desc: 'Monitoreo de pagos', action: 'verTransacciones()' }
            ]
        }
    };
    
    const config = configs[role] || configs.cliente;
    
    document.getElementById('dash-badge').innerText = config.badge;
    document.getElementById('dash-badge').style.background = config.badgeColor;
    document.getElementById('dash-welcome').innerHTML = config.welcome;
    document.getElementById('dash-desc').innerHTML = config.desc;
    
    window._currentUser = { name: name, role: role };
    
    const grid = document.getElementById('dash-grid');
    grid.innerHTML = config.items.map(item => `
        <div class="dash-card" onclick="${item.action}">
            <div class="dash-card-icon">${item.icon}</div>
            <h3 class="dash-card-title">${item.title}</h3>
            <p class="dash-card-desc">${item.desc}</p>
            <button class="dash-card-btn" onclick="event.stopPropagation();${item.action}">Acceder →</button>
        </div>
    `).join('');
    
    agregarDocs();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('dashboard-open');
}

function closeDashboard() {
    const overlay = document.getElementById('dashboardOverlay');
    overlay.classList.remove('open');
    document.body.classList.remove('dashboard-open');
    document.body.style.overflow = '';
}

let modal = null;

function mostrarModal(content, title) {
    if (modal) modal.remove();
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
    modal = overlayDiv;
}

function cerrarModal() {
    if (modal) modal.remove();
    modal = null;
}

function showModalMessageSimple(message, type = 'success') {
    const existing = document.querySelector('.modal-temp-msg');
    if (existing) existing.remove();
    const msg = document.createElement('div');
    msg.className = `modal-${type} modal-temp-msg`;
    msg.style.cssText = 'margin-bottom:1rem;padding:0.75rem;border-radius:8px;text-align:center';
    msg.textContent = message;
    const modalBody = document.querySelector('#dashboardOverlay > div > div:last-child');
    if (modalBody && modalBody.firstChild) {
        modalBody.insertBefore(msg, modalBody.firstChild);
    }
    setTimeout(() => msg.remove(), 3000);
}

// ===== FUNCIONES CLIENTE =====
async function verMisCasos() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const casos = await new Promise(resolve => {
        window.db._db.transaction(['casos'], 'readonly')
            .objectStore('casos')
            .index('usuarioEmail')
            .getAll(user.email)
            .onsuccess = e => resolve(e.target.result || []);
    });
    DC = casos;
    
    let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">⚖️ Mis Casos</h2>
            <button class="dash-card-btn" onclick="cerrarModal();setTimeout(()=>nuevoCaso(),100)">+ Nuevo Caso</button>
        </div>
        <div style="display:grid;gap:1rem">
    `;
    
    if (!casos.length) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">📭 No tienes casos registrados. Crea tu primer caso.</div>`;
    } else {
        casos.forEach(c => {
            html += `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;transition:all .3s;cursor:pointer" onclick="verDetalle(${c.id})">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
                        <h3 style="font-family:Cormorant Garamond,serif;color:var(--text)">📋 ${c.titulo || 'Caso sin título'}</h3>
                        <span style="background:var(--gold-dim);color:var(--gold);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem">${c.estado || 'Activo'}</span>
                    </div>
                    <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.5rem">${c.descripcion || 'Sin descripción'}</p>
                    <div style="display:flex;gap:1rem;margin-top:0.8rem;font-size:0.7rem;color:var(--gold)">
                        <span>👨‍⚖️ ${c.abogadoNombre || 'Por asignar'}</span>
                        <span>📅 ${new Date(c.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    mostrarModal(html, 'Mis Casos');
}

function nuevoCaso() {
    mostrarModal(`
        <div style="display:flex;flex-direction:column;gap:1rem">
            <h3 style="color:var(--gold);font-family:Cormorant Garamond,serif">Nuevo Caso</h3>
            <input id="nuevoCaso-titulo" placeholder="Título del caso" class="form-field" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);color:var(--text);border-radius:6px">
            <textarea id="nuevoCaso-desc" rows="3" placeholder="Describe tu situación legal..." style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);color:var(--text);border-radius:6px"></textarea>
            <select id="nuevoCaso-area" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);color:var(--text);border-radius:6px">
                <option value="">Selecciona el área legal</option>
                <option>Derecho Civil</option>
                <option>Derecho Penal</option>
                <option>Derecho Laboral</option>
                <option>Derecho de Familia</option>
                <option>Derecho Comercial</option>
                <option>Derecho Administrativo</option>
            </select>
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
                <button class="btn-gold" onclick="crearCaso()" style="flex:1">Crear Caso</button>
                <button class="btn-ghost" onclick="cerrarModal()" style="flex:1">Cancelar</button>
            </div>
        </div>
    `, 'Nuevo Caso');
}

async function crearCaso() {
    const titulo = document.getElementById('nuevoCaso-titulo')?.value;
    if (!titulo) {
        showModalMessageSimple('✗ El título es obligatorio', 'error');
        return;
    }
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    
    await window.db._db.transaction(['casos'], 'readwrite')
        .objectStore('casos')
        .add({
            id: Date.now(),
            usuarioEmail: user.email,
            titulo: titulo,
            descripcion: document.getElementById('nuevoCaso-desc')?.value || '',
            area: document.getElementById('nuevoCaso-area')?.value || 'Civil',
            estado: 'Activo',
            abogadoEmail: null,
            abogadoNombre: null,
            fechaCreacion: new Date().toISOString()
        });
    
    cerrarModal();
    showToast('✓ Caso creado exitosamente', 'success');
    setTimeout(() => verMisCasos(), 500);
}

function verDetalle(id) {
    const caso = DC.find(x => x.id === id);
    if (!caso) return;
    mostrarModal(`
        <div style="display:flex;flex-direction:column;gap:1rem">
            <h3 style="color:var(--gold)">📋 ${caso.titulo}</h3>
            <p><strong>Descripción:</strong> ${caso.descripcion || 'Sin descripción'}</p>
            <p><strong>Área legal:</strong> ${caso.area}</p>
            <p><strong>Estado:</strong> <span style="color:var(--gold)">${caso.estado}</span></p>
            <p><strong>Abogado:</strong> ${caso.abogadoNombre || 'Pendiente de asignación'}</p>
            <p><strong>Fecha creación:</strong> ${new Date(caso.fechaCreacion).toLocaleDateString()}</p>
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
                <button class="btn-ghost" onclick="cerrarModal()" style="flex:1">Cerrar</button>
            </div>
        </div>
    `, 'Detalle del Caso');
}

async function verCitas() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const citas = await new Promise(resolve => {
        window.db._db.transaction(['citas'], 'readonly')
            .objectStore('citas')
            .index('usuarioEmail')
            .getAll(user.email)
            .onsuccess = e => resolve(e.target.result || []);
    });
    
    let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold)">📅 Mis Citas</h2>
            <button class="dash-card-btn" onclick="cerrarModal();setTimeout(()=>nuevaCita(),100)">+ Agendar Cita</button>
        </div>
        <div style="display:grid;gap:1rem">
    `;
    
    if (!citas.length) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">📅 No tienes citas agendadas</div>`;
    } else {
        citas.forEach(c => {
            html += `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:1rem">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <h3 style="font-family:Cormorant Garamond,serif">📌 ${c.titulo}</h3>
                        <span style="background:var(--gold-dim);color:var(--gold);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem">${c.estado || 'Pendiente'}</span>
                    </div>
                    <p style="color:var(--gold);font-size:0.85rem;margin-top:0.5rem">📅 ${new Date(c.fecha).toLocaleString()}</p>
                    <p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.3rem">${c.descripcion || ''}</p>
                </div>
            `;
        });
    }
    html += `</div>`;
    mostrarModal(html, 'Agenda de Citas');
}

function nuevaCita() {
    mostrarModal(`
        <div style="display:flex;flex-direction:column;gap:1rem">
            <h3 style="color:var(--gold);font-family:Cormorant Garamond,serif">Agendar Nueva Cita</h3>
            <input id="nuevaCita-titulo" placeholder="Título de la cita" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);color:var(--text);border-radius:6px">
            <input type="datetime-local" id="nuevaCita-fecha" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);color:var(--text);border-radius:6px">
            <textarea id="nuevaCita-desc" rows="2" placeholder="Descripción / Motivo de la cita" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);color:var(--text);border-radius:6px"></textarea>
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
                <button class="btn-gold" onclick="crearCita()" style="flex:1">Agendar</button>
                <button class="btn-ghost" onclick="cerrarModal()" style="flex:1">Cancelar</button>
            </div>
        </div>
    `, 'Nueva Cita');
}

async function crearCita() {
    const titulo = document.getElementById('nuevaCita-titulo')?.value;
    const fecha = document.getElementById('nuevaCita-fecha')?.value;
    if (!titulo || !fecha) {
        showModalMessageSimple('✗ Completa todos los campos', 'error');
        return;
    }
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    
    await window.db._db.transaction(['citas'], 'readwrite')
        .objectStore('citas')
        .add({
            id: Date.now(),
            usuarioEmail: user.email,
            titulo: titulo,
            fecha: new Date(fecha).toISOString(),
            descripcion: document.getElementById('nuevaCita-desc')?.value || '',
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        });
    
    cerrarModal();
    showToast('✓ Cita agendada exitosamente', 'success');
    setTimeout(() => verCitas(), 500);
}

async function verPagos() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const pagos = await new Promise(resolve => {
        window.db._db.transaction(['pagos'], 'readonly')
            .objectStore('pagos')
            .index('usuarioEmail')
            .getAll(user.email)
            .onsuccess = e => resolve(e.target.result || []);
    });
    
    let html = `
        <div style="margin-bottom:1.5rem">
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">💰 Pagos y Facturas</h2>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1.5rem">
                <h3 style="font-size:1rem;margin-bottom:0.8rem">🔹 Nueva Factura</h3>
                <select id="pago-caso" style="width:100%;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                    <option>Selecciona un caso</option>
                </select>
                <input id="pago-concepto" placeholder="Concepto" style="width:100%;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                <input id="pago-monto" type="number" placeholder="Monto" style="width:100%;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                <button class="btn-gold" onclick="generarFactura()" style="width:100%;margin-top:0.5rem">Generar Factura</button>
            </div>
            <h3 style="margin-bottom:0.8rem">📜 Historial de Pagos</h3>
            <div id="lista-pagos" style="display:grid;gap:0.8rem">
                ${!pagos.length ? '<div style="text-align:center;padding:2rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">💰 No hay pagos registrados</div>' : ''}
            </div>
        </div>
    `;
    mostrarModal(html, 'Pagos');
    
    pagos.forEach(p => {
        const container = document.getElementById('lista-pagos');
        if (container) {
            container.innerHTML += `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">
                    <div>
                        <strong>${p.concepto}</strong><br>
                        <small>${new Date(p.fecha).toLocaleString()}</small>
                    </div>
                    <div>
                        <span style="color:var(--gold);font-weight:bold">$${p.monto}</span><br>
                        <button onclick="verFactura(${p.id})" style="background:none;color:var(--gold);border:none;cursor:pointer;font-size:0.7rem">Ver factura →</button>
                    </div>
                </div>
            `;
        }
    });
}

function generarFactura() {
    const concepto = document.getElementById('pago-concepto')?.value;
    const monto = document.getElementById('pago-monto')?.value;
    if (!concepto || !monto) {
        showModalMessageSimple('✗ Completa concepto y monto', 'error');
        return;
    }
    showModalMessageSimple(`✓ Factura generada: ${concepto} - $${monto}`, 'success');
    setTimeout(() => verPagos(), 1000);
}

function verFactura(id) {
    mostrarModal(`
        <div style="text-align:center">
            <h2 style="color:var(--gold)">LEGALIA</h2>
            <p>Factura #${id}</p>
            <hr style="margin:1rem 0;border-color:var(--gold-border)">
            <button class="btn-ghost" onclick="window.print()" style="margin-top:1rem">🖨️ Imprimir</button>
        </div>
    `, 'Factura Digital');
}

function verDocumentos() {
    mostrarModal(`
        <div>
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">📄 Mis Documentos</h2>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1rem">
                <h3 style="margin-bottom:0.8rem">Subir Documento</h3>
                <input id="doc-nombre" placeholder="Nombre del documento" style="width:100%;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                <textarea id="doc-desc" rows="2" placeholder="Descripción" style="width:100%;padding:0.6rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px"></textarea>
                <button class="btn-gold" onclick="subirDocumento()" style="width:100%;margin-top:0.5rem">📤 Subir Documento</button>
            </div>
            <div id="lista-documentos"></div>
        </div>
    `, 'Documentos');
    cargarDocumentos();
}

async function cargarDocumentos() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const docs = await new Promise(resolve => {
        window.db._db.transaction(['documentos'], 'readonly')
            .objectStore('documentos')
            .index('usuarioEmail')
            .getAll(user.email)
            .onsuccess = e => resolve(e.target.result || []);
    });
    
    const container = document.getElementById('lista-documentos');
    if (container) {
        if (!docs.length) {
            container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">📭 No hay documentos subidos</div>';
        } else {
            container.innerHTML = docs.map(d => `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;margin-bottom:0.8rem">
                    <strong>📄 ${d.nombre}</strong>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem">${d.descripcion || ''}</p>
                    <small style="color:var(--gold)">${new Date(d.fechaSolicitud).toLocaleDateString()}</small>
                </div>
            `).join('');
        }
    }
}

function subirDocumento() {
    const nombre = document.getElementById('doc-nombre')?.value;
    if (!nombre) {
        showModalMessageSimple('✗ El nombre del documento es obligatorio', 'error');
        return;
    }
    showModalMessageSimple('✓ Documento subido exitosamente', 'success');
    cargarDocumentos();
}

function verCalificaciones() {
    mostrarModal(`
        <div>
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">⭐ Calificar Abogado</h2>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1rem">
                <select id="cal-abogado" style="width:100%;padding:0.6rem;margin-bottom:0.8rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                    <option>Selecciona un abogado</option>
                    <option>Dr. Andrés Morales - Civil</option>
                    <option>Dr. Felipe Soto - Penal</option>
                    <option>Dra. Camila Ríos - Laboral</option>
                </select>
                <div id="estrellas" style="display:flex;gap:0.3rem;margin-bottom:0.8rem;font-size:1.5rem;cursor:pointer">
                    ${[1,2,3,4,5].map(i => `<span onclick="seleccionarEstrella(${i})" id="estrella-${i}" style="color:var(--text-muted)">☆</span>`).join('')}
                </div>
                <textarea id="cal-resena" rows="2" placeholder="Cuéntanos tu experiencia..." style="width:100%;padding:0.6rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px"></textarea>
                <button class="btn-gold" onclick="enviarCalificacion()" style="width:100%;margin-top:0.8rem">Enviar Calificación</button>
            </div>
            <div id="lista-calificaciones"></div>
        </div>
    `, 'Calificaciones');
}

let calificacionSeleccionada = 0;

function seleccionarEstrella(puntuacion) {
    calificacionSeleccionada = puntuacion;
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`estrella-${i}`);
        if (star) star.innerHTML = i <= puntuacion ? '★' : '☆';
        if (star) star.style.color = i <= puntuacion ? 'var(--gold)' : 'var(--text-muted)';
    }
}

function enviarCalificacion() {
    if (calificacionSeleccionada === 0) {
        showModalMessageSimple('✗ Selecciona una puntuación', 'error');
        return;
    }
    showModalMessageSimple(`✓ Calificación de ${calificacionSeleccionada}★ enviada. ¡Gracias por tu opinión!`, 'success');
    calificacionSeleccionada = 0;
}

function verMiPerfil() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    mostrarModal(`
        <div style="display:flex;flex-direction:column;gap:1rem">
            <div style="text-align:center">
                <div style="width:80px;height:80px;border-radius:50%;background:var(--gold-dim);display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:2rem;border:2px solid var(--gold)">👤</div>
            </div>
            <input id="perfil-nombre" value="${user.nombre || ''}" placeholder="Nombre" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <input id="perfil-apellido" value="${user.apellido || ''}" placeholder="Apellido" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <input id="perfil-telefono" value="${user.telefono || ''}" placeholder="Teléfono" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <input id="perfil-documento" value="${user.documento || ''}" placeholder="Documento de identidad" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
                <button class="btn-gold" onclick="guardarPerfil()" style="flex:1">Guardar Cambios</button>
                <button class="btn-ghost" onclick="cerrarModal()" style="flex:1">Cancelar</button>
            </div>
        </div>
    `, 'Mi Perfil');
}

async function guardarPerfil() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const nombre = document.getElementById('perfil-nombre')?.value;
    if (!nombre) {
        showModalMessageSimple('✗ El nombre es obligatorio', 'error');
        return;
    }
    
    user.nombre = nombre;
    user.apellido = document.getElementById('perfil-apellido')?.value || '';
    user.telefono = document.getElementById('perfil-telefono')?.value || '';
    user.documento = document.getElementById('perfil-documento')?.value || '';
    
    await window.db._db.transaction(['usuarios'], 'readwrite')
        .objectStore('usuarios')
        .put(user);
    window.db.setUsuarioActual(user);
    
    cerrarModal();
    showToast('✓ Perfil actualizado correctamente', 'success');
    document.getElementById('dash-name').innerText = nombre;
}

// ===== FUNCIONES AUXILIARES =====
async function agregarDocs() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const docs = await window.db.documentos.pendientes(user.email);
    if (!docs?.length) return;
    
    let section = document.getElementById('doc-pend-section');
    if (section) section.remove();
    section = document.createElement('div');
    section.id = 'doc-pend-section';
    section.innerHTML = `
        <div style="margin-top:2rem;padding:1rem;background:var(--warning-bg);border:1px solid var(--warning);border-radius:8px">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
                <span>⚠️</span>
                <strong>Documentos Pendientes por Subir</strong>
            </div>
            <div id="lista-docs-pendientes"></div>
        </div>
    `;
    document.querySelector('#dashboardOverlay > div > div:last-child')?.appendChild(section);
    actualizarListaDocumentos();
}

async function actualizarListaDocumentos() {
    const container = document.getElementById('lista-docs-pendientes');
    if (!container) return;
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const docs = await window.db.documentos.pendientes(user.email);
    
    if (!docs?.length) {
        const section = document.getElementById('doc-pend-section');
        if (section) section.remove();
        return;
    }
    
    container.innerHTML = docs.map(d => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid var(--gold-border)">
            <div>
                <strong>${d.nombre}</strong>
                <p style="font-size:0.7rem;color:var(--text-muted)">${d.descripcion || ''}</p>
            </div>
            <button class="doc-btn" onclick="subirDocumentoPendiente(${d.id})">Subir</button>
        </div>
    `).join('');
}

function subirDocumentoPendiente(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
        if (e.target.files[0]) {
            await window.db.documentos.subir(id, e.target.files[0].name);
            actualizarListaDocumentos();
            showToast('✓ Documento subido exitosamente', 'success');
        }
    };
    input.click();
}

window.agregarDocumentoPendiente = async (nombre, descripcion, area) => {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const id = await window.db.documentos.agregar(user.email, nombre, descripcion, area);
    actualizarListaDocumentos();
    return id;
};

window.actualizarListaDocumentos = actualizarListaDocumentos;

// ===== FUNCIONES ABOGADO =====
function verCasosAbogado() {
    mostrarModal(`<div><p>Módulo de casos para abogado en desarrollo.</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Mis Casos');
}

function verClientes() {
    mostrarModal(`<div><p>Directorio de clientes en desarrollo.</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Clientes');
}

function verAgendaAbogado() {
    mostrarModal(`<div><p>Agenda y disponibilidad en desarrollo.</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Agenda');
}

function verReportesAbogado() {
    mostrarModal(`<div><p>Generación de reportes en desarrollo.</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Reportes');
}

// ===== FUNCIONES ADMIN =====
function verificarAbogados() {
    mostrarModal(`<div><p>Panel de verificación de abogados (Admin).</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Verificar Abogados');
}

function verEstadisticas() {
    mostrarModal(`<div><p>Estadísticas y métricas de la plataforma (Admin).</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Estadísticas');
}

function gestionarUsuarios() {
    mostrarModal(`<div><p>Gestión de usuarios (Admin).</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Usuarios');
}

function verCasosGlobales() {
    mostrarModal(`<div><p>Supervisión global de casos (Admin).</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Casos Globales');
}

function verTransacciones() {
    mostrarModal(`<div><p>Monitoreo de pagos y transacciones (Admin).</p><button onclick="cerrarModal()">Cerrar</button></div>`, 'Transacciones');
}
