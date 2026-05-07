// ============================================
// LEGALIA DASHBOARD - VERSIÓN COMPLETA FINAL
// ============================================

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
                { icon: '📄', title: 'Mis Documentos', desc: 'Tus documentos y los pendientes por subir', action: 'verDocumentosCliente()' },
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
                { icon: '📁', title: 'Mis Casos', desc: 'Casos asignados a ti', action: 'verCasosAbogado()' },
                { icon: '👥', title: 'Mis Clientes', desc: 'Clientes con casos activos', action: 'verClientesAbogado()' },
                { icon: '💬', title: 'Chat con Clientes', desc: 'Comunicación con clientes', action: 'openChat()' },
                { icon: '📅', title: 'Mi Agenda', desc: 'Disponibilidad y citas', action: 'verAgendaAbogado()' },
                { icon: '📊', title: 'Reportes', desc: 'Informes de tus casos', action: 'verReportesAbogado()' }
            ]
        },
        administrador: {
            badge: 'Admin',
            badgeColor: '#8e44ad',
            welcome: `Bienvenido, Administrador ${name}`,
            desc: 'Panel de control completo de la plataforma Legalia.',
            items: [
                { icon: '🛡️', title: 'Verificar Abogados', desc: 'Valida credenciales profesionales', action: 'verificarAbogadosAdmin()' },
                { icon: '👥', title: 'Todos los Usuarios', desc: 'Clientes y abogados registrados', action: 'verTodosUsuarios()' },
                { icon: '🌍', title: 'Casos Globales', desc: 'Todos los casos y sus estados', action: 'verCasosGlobalesAdmin()' },
                { icon: '💰', title: 'Transacciones', desc: 'Monitoreo de pagos', action: 'verTransaccionesAdmin()' }
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
    
    if (role === 'cliente') {
        cargarDocumentosPendientesCliente();
    }
    
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
    if (type === 'error') {
        msg.style.cssText = 'background:rgba(198,40,40,0.1);border:1px solid #c62828;color:#c62828;padding:0.75rem;margin-bottom:1rem;border-radius:8px;text-align:center';
    } else {
        msg.style.cssText = 'background:rgba(46,125,50,0.1);border:1px solid #2e7d32;color:#2e7d32;padding:0.75rem;margin-bottom:1rem;border-radius:8px;text-align:center';
    }
    msg.textContent = message;
    const modalBody = document.querySelector('#dashboardOverlay > div > div:last-child');
    if (modalBody && modalBody.firstChild) {
        modalBody.insertBefore(msg, modalBody.firstChild);
    }
    setTimeout(() => msg.remove(), 3000);
}

// ==================== CLIENTE ====================

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
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:1rem">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <h3 style="font-family:Cormorant Garamond,serif">📋 ${c.titulo}</h3>
                        <span style="background:var(--gold-dim);color:var(--gold);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem">${c.estado}</span>
                    </div>
                    <p style="color:var(--text-muted);margin-top:0.5rem">${c.descripcion || 'Sin descripción'}</p>
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
            <input id="nuevoCaso-titulo" placeholder="Título del caso" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <textarea id="nuevoCaso-desc" rows="3" placeholder="Describe tu situación legal..." style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px"></textarea>
            <select id="nuevoCaso-area" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
                <option value="">Selecciona el área legal</option>
                <option>Derecho Civil</option><option>Derecho Penal</option><option>Derecho Laboral</option>
                <option>Derecho de Familia</option><option>Derecho Comercial</option><option>Derecho Administrativo</option>
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
    
    await window.db.casos.crear(
        user.email, 
        user.nombre + ' ' + user.apellido,
        titulo, 
        document.getElementById('nuevoCaso-desc')?.value || '', 
        document.getElementById('nuevoCaso-area')?.value || 'Civil'
    );
    
    cerrarModal();
    showToast('✓ Caso creado exitosamente', 'success');
    setTimeout(() => verMisCasos(), 500);
}

async function verCitas() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const citas = await window.db.citas.obtenerPorUsuario(user.email);
    
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
            <input id="nuevaCita-titulo" placeholder="Título de la cita" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <input type="datetime-local" id="nuevaCita-fecha" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <textarea id="nuevaCita-desc" rows="2" placeholder="Descripción / Motivo de la cita" style="width:100%;padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px"></textarea>
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
    
    await window.db.citas.crear(user.email, titulo, fecha, document.getElementById('nuevaCita-desc')?.value || '');
    
    cerrarModal();
    showToast('✓ Cita agendada exitosamente', 'success');
    setTimeout(() => verCitas(), 500);
}

async function verPagos() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const pagos = await window.db.pagos.obtenerPorUsuario(user.email);
    
    let html = `
        <div style="margin-bottom:1.5rem">
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">💰 Pagos y Facturas</h2>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1.5rem">
                <h3 style="font-size:1rem;margin-bottom:0.8rem">🔹 Nueva Factura</h3>
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
    
    const container = document.getElementById('lista-pagos');
    if (container && pagos.length) {
        pagos.forEach(p => {
            container.innerHTML += `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">
                    <div><strong>${p.concepto}</strong><br><small>${new Date(p.fecha).toLocaleString()}</small></div>
                    <div><span style="color:var(--gold);font-weight:bold">$${p.monto}</span></div>
                </div>
            `;
        });
    }
}

function generarFactura() {
    const concepto = document.getElementById('pago-concepto')?.value;
    const monto = document.getElementById('pago-monto')?.value;
    if (!concepto || !monto) {
        showModalMessageSimple('✗ Completa concepto y monto', 'error');
        return;
    }
    
    const user = window.db?.obtenerUsuarioActual();
    if (user) {
        window.db.pagos.crear(user.email, null, null, concepto, parseFloat(monto));
    }
    
    showModalMessageSimple(`✓ Factura generada: ${concepto} - $${monto}`, 'success');
    setTimeout(() => verPagos(), 1000);
}

async function verDocumentosCliente() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const docs = await new Promise(resolve => {
        window.db._db.transaction(['documentos'], 'readonly')
            .objectStore('documentos')
            .index('usuarioEmail')
            .getAll(user.email)
            .onsuccess = e => resolve(e.target.result || []);
    });
    
    const pendientes = docs.filter(d => d.estado === 'pendiente');
    const subidos = docs.filter(d => d.estado === 'subido');
    
    let html = `
        <div>
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">📄 Mis Documentos</h2>
            <div style="background:rgba(237,108,2,0.1);border:1px solid #ed6c02;border-radius:8px;padding:1rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:0.8rem;color:#ed6c02">⚠️ Documentos Pendientes por Subir</h3>
                <div id="lista-pendientes-cliente">${pendientes.length === 0 ? '<p style="color:var(--text-muted)">✅ No hay documentos pendientes</p>' : ''}</div>
            </div>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:0.8rem">📎 Documentos Subidos</h3>
                <div id="lista-subidos-cliente">${subidos.length === 0 ? '<p style="color:var(--text-muted)">📭 No hay documentos subidos</p>' : ''}</div>
            </div>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem">
                <h3 style="margin-bottom:0.8rem">➕ Subir Nuevo Documento</h3>
                <input id="doc-nombre" placeholder="Nombre del documento" style="width:100%;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                <textarea id="doc-desc" rows="2" placeholder="Descripción" style="width:100%;padding:0.6rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px"></textarea>
                <button class="btn-gold" onclick="subirDocumentoNuevo()" style="width:100%;margin-top:0.5rem">📤 Subir Documento</button>
            </div>
        </div>
    `;
    mostrarModal(html, 'Mis Documentos');
    
    const pendientesContainer = document.getElementById('lista-pendientes-cliente');
    if (pendientesContainer && pendientes.length) {
        pendientesContainer.innerHTML = pendientes.map(d => `
            <div style="background:var(--card-hover);border:1px solid #ed6c02;border-radius:8px;padding:0.8rem;margin-bottom:0.8rem">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">
                    <div><strong>📄 ${d.nombre}</strong><p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem">${d.descripcion || ''}</p></div>
                    <button class="doc-btn" onclick="subirDocumentoPendiente(${d.id})">Subir ahora</button>
                </div>
            </div>
        `).join('');
    }
    
    const subidosContainer = document.getElementById('lista-subidos-cliente');
    if (subidosContainer && subidos.length) {
        subidosContainer.innerHTML = subidos.map(d => `
            <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;margin-bottom:0.8rem">
                <strong>📄 ${d.nombre}</strong><p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem">${d.descripcion || ''}</p>
                <small style="color:#2e7d32">✅ Subido el ${d.fechaSubida ? new Date(d.fechaSubida).toLocaleDateString() : 'recientemente'}</small>
            </div>
        `).join('');
    }
}

async function subirDocumentoNuevo() {
    const nombre = document.getElementById('doc-nombre')?.value;
    if (!nombre) {
        showModalMessageSimple('✗ El nombre del documento es obligatorio', 'error');
        return;
    }
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    
    await window.db.documentos.agregar(user.email, nombre, document.getElementById('doc-desc')?.value || '', 'General');
    showToast('✓ Documento subido exitosamente', 'success');
    cerrarModal();
    setTimeout(() => verDocumentosCliente(), 500);
}

async function subirDocumentoPendiente(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
        if (e.target.files[0]) {
            await window.db.documentos.subir(id, e.target.files[0].name);
            showToast('✓ Documento subido exitosamente', 'success');
            cerrarModal();
            setTimeout(() => verDocumentosCliente(), 500);
        }
    };
    input.click();
}

async function cargarDocumentosPendientesCliente() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const docs = await window.db.documentos.pendientes(user.email);
    
    let section = document.getElementById('doc-pend-section');
    if (section) section.remove();
    
    if (docs && docs.length > 0) {
        section = document.createElement('div');
        section.id = 'doc-pend-section';
        section.innerHTML = `
            <div style="margin-top:2rem;padding:1rem;background:rgba(237,108,2,0.1);border:1px solid #ed6c02;border-radius:8px">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem"><span>⚠️</span><strong>Documentos Pendientes por Subir (${docs.length})</strong></div>
                <div id="lista-docs-pendientes-dashboard"></div>
            </div>
        `;
        document.querySelector('#dashboardOverlay > div > div:last-child')?.appendChild(section);
        
        const container = document.getElementById('lista-docs-pendientes-dashboard');
        if (container) {
            container.innerHTML = docs.map(d => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid var(--gold-border)">
                    <div><strong>${d.nombre}</strong><p style="font-size:0.7rem;color:var(--text-muted)">${d.descripcion || ''}</p></div>
                    <button class="doc-btn" onclick="subirDocumentoPendiente(${d.id})">Subir</button>
                </div>
            `).join('');
        }
    }
}

function verCalificaciones() {
    mostrarModal(`
        <div>
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">⭐ Calificar Abogado</h2>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1rem">
                <select id="cal-abogado" style="width:100%;padding:0.6rem;margin-bottom:0.8rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                    <option>Selecciona un abogado</option>
                    <option>Dr. Andrés Morales - Civil</option><option>Dr. Felipe Soto - Penal</option><option>Dra. Camila Ríos - Laboral</option>
                </select>
                <div id="estrellas" style="display:flex;gap:0.3rem;margin-bottom:0.8rem;font-size:1.5rem;cursor:pointer">
                    ${[1,2,3,4,5].map(i => `<span onclick="seleccionarEstrella(${i})" id="estrella-${i}" style="color:var(--text-muted)">☆</span>`).join('')}
                </div>
                <textarea id="cal-resena" rows="2" placeholder="Cuéntanos tu experiencia..." style="width:100%;padding:0.6rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px"></textarea>
                <button class="btn-gold" onclick="enviarCalificacion()" style="width:100%;margin-top:0.8rem">Enviar Calificación</button>
            </div>
        </div>
    `, 'Calificaciones');
}

let calificacionSeleccionada = 0;

function seleccionarEstrella(puntuacion) {
    calificacionSeleccionada = puntuacion;
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`estrella-${i}`);
        if (star) {
            star.innerHTML = i <= puntuacion ? '★' : '☆';
            star.style.color = i <= puntuacion ? 'var(--gold)' : 'var(--text-muted)';
        }
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
            <div style="text-align:center"><div style="width:80px;height:80px;border-radius:50%;background:var(--gold-dim);display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:2rem;border:2px solid var(--gold)">👤</div></div>
            <input id="perfil-nombre" value="${user.nombre || ''}" placeholder="Nombre" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <input id="perfil-apellido" value="${user.apellido || ''}" placeholder="Apellido" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
            <input id="perfil-telefono" value="${user.telefono || ''}" placeholder="Teléfono" style="padding:0.8rem;background:var(--bg2);border:1px solid var(--gold-border);border-radius:6px">
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
    await window.db.usuarios.actualizar(user);
    window.db.setUsuarioActual(user);
    cerrarModal();
    showToast('✓ Perfil actualizado correctamente', 'success');
    document.getElementById('dash-name').innerText = nombre;
}

// ==================== ABOGADO ====================

async function verCasosAbogado() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const todosLosCasos = await window.db.casos.obtenerTodos();
    const misCasos = todosLosCasos.filter(c => c.abogadoEmail === user.email);
    
    let html = `<div><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">📁 Casos Asignados</h2><div style="display:grid;gap:1rem">`;
    
    if (!misCasos.length) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">📭 No tienes casos asignados aún</div>`;
    } else {
        misCasos.forEach(c => {
            html += `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:1rem">
                    <div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-family:Cormorant Garamond,serif">📋 ${c.titulo}</h3><span style="background:var(--gold-dim);color:var(--gold);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem">${c.estado}</span></div>
                    <p style="color:var(--text-muted);margin-top:0.5rem">${c.descripcion || 'Sin descripción'}</p>
                    <div style="display:flex;gap:1rem;margin-top:0.8rem;font-size:0.7rem;color:var(--gold)"><span>👤 Cliente: ${c.usuarioNombre || c.usuarioEmail}</span><span>📅 ${new Date(c.fechaCreacion).toLocaleDateString()}</span></div>
                    <div style="margin-top:1rem"><select id="estado-${c.id}" style="padding:0.4rem;background:var(--bg);border:1px solid var(--gold-border);border-radius:4px">
                        <option value="Pendiente" ${c.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En Progreso" ${c.estado === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                        <option value="Resuelto" ${c.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                        <option value="Cerrado" ${c.estado === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                    </select><button class="dash-card-btn" style="margin-left:0.5rem" onclick="actualizarEstadoCaso(${c.id})">Actualizar Estado</button></div>
                </div>
            `;
        });
    }
    html += `</div></div>`;
    mostrarModal(html, 'Mis Casos');
}

async function actualizarEstadoCaso(casoId) {
    const select = document.getElementById(`estado-${casoId}`);
    if (!select) return;
    await window.db.casos.actualizarEstado(casoId, select.value);
    showToast(`✓ Estado actualizado a "${select.value}"`, 'success');
    cerrarModal();
    setTimeout(() => verCasosAbogado(), 500);
}

async function verClientesAbogado() {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) return;
    const todosLosCasos = await window.db.casos.obtenerTodos();
    const misCasos = todosLosCasos.filter(c => c.abogadoEmail === user.email);
    const clientesMap = new Map();
    misCasos.forEach(c => {
        if (!clientesMap.has(c.usuarioEmail)) {
            clientesMap.set(c.usuarioEmail, { email: c.usuarioEmail, nombre: c.usuarioNombre || c.usuarioEmail, casos: [] });
        }
        clientesMap.get(c.usuarioEmail).casos.push(c);
    });
    
    let html = `<div><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">👥 Mis Clientes</h2>`;
    if (clientesMap.size === 0) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">👥 No tienes clientes asignados aún</div>`;
    } else {
        clientesMap.forEach(cliente => {
            html += `<div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1rem"><h3>👤 ${cliente.nombre}</h3><p style="font-size:0.8rem;color:var(--text-muted)">${cliente.email}</p><p><strong>Casos activos:</strong> ${cliente.casos.length}</p></div>`;
        });
    }
    html += `</div>`;
    mostrarModal(html, 'Mis Clientes');
}

function verAgendaAbogado() {
    mostrarModal(`<div style="text-align:center;padding:2rem"><p>Próximamente podrás gestionar tu disponibilidad y agenda profesional.</p><button class="btn-ghost" onclick="cerrarModal()">Cerrar</button></div>`, 'Mi Agenda');
}

function verReportesAbogado() {
    mostrarModal(`<div style="text-align:center;padding:2rem"><p>Próximamente podrás generar reportes detallados de tus casos.</p><button class="btn-ghost" onclick="cerrarModal()">Cerrar</button></div>`, 'Reportes');
}

// ==================== ADMINISTRADOR ====================

async function verificarAbogadosAdmin() {
    const abogados = await window.db.usuarios.obtenerPorRol('abogado');
    let html = `<div><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">🛡️ Verificar Abogados</h2><div style="display:grid;gap:1rem">`;
    
    if (!abogados.length) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">📭 No hay abogados registrados</div>`;
    } else {
        abogados.forEach(a => {
            html += `
                <div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:1rem">
                    <div style="display:flex;justify-content:space-between;align-items:center"><h3>${a.nombre} ${a.apellido}</h3><span style="background:${a.activo ? '#2e7d32' : '#ed6c02'};color:white;padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem">${a.activo ? 'Verificado' : 'Pendiente'}</span></div>
                    <p style="color:var(--text-muted);margin-top:0.5rem">📧 ${a.email}</p>
                    <div style="margin-top:1rem"><button class="dash-card-btn" onclick="aprobarAbogado('${a.email}')">${a.activo ? 'Desactivar' : 'Aprobar'}</button></div>
                </div>
            `;
        });
    }
    html += `</div></div>`;
    mostrarModal(html, 'Verificar Abogados');
}

async function aprobarAbogado(email) {
    const user = await window.db.usuarios.obtener(email);
    if (user) {
        user.activo = !user.activo;
        await window.db.usuarios.actualizar(user);
        showToast(user.activo ? '✓ Abogado aprobado' : '✓ Abogado desactivado', 'success');
        cerrarModal();
        setTimeout(() => verificarAbogadosAdmin(), 500);
    }
}

async function verTodosUsuarios() {
    const usuarios = await window.db.usuarios.todos();
    const clientes = usuarios.filter(u => u.role === 'cliente');
    const abogados = usuarios.filter(u => u.role === 'abogado');
    
    let html = `
        <div>
            <h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">👥 Todos los Usuarios</h2>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:0.8rem">👤 Clientes (${clientes.length})</h3>
                ${clientes.length ? clientes.map(c => `<div style="padding:0.5rem 0;border-bottom:1px solid var(--gold-border)"><strong>${c.nombre} ${c.apellido}</strong><br><small>${c.email}</small></div>`).join('') : '<p>No hay clientes registrados</p>'}
            </div>
            <div style="background:var(--bg2);border:1px solid var(--gold-border);border-radius:8px;padding:1rem">
                <h3 style="margin-bottom:0.8rem">⚖️ Abogados (${abogados.length})</h3>
                ${abogados.length ? abogados.map(a => `<div style="padding:0.5rem 0;border-bottom:1px solid var(--gold-border)"><strong>${a.nombre} ${a.apellido}</strong><br><small>${a.email} · ${a.activo ? '✅ Verificado' : '⏳ Pendiente'}</small></div>`).join('') : '<p>No hay abogados registrados</p>'}
            </div>
        </div>
    `;
    mostrarModal(html, 'Todos los Usuarios');
}

async function verCasosGlobalesAdmin() {
    const casos = await window.db.casos.obtenerTodos();
    
    let html = `<div><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">🌍 Casos Globales</h2><div style="display:grid;gap:1rem">`;
    
    if (!casos.length) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">📭 No hay casos registrados</div>`;
    } else {
        casos.forEach(c => {
            html += `
                <div style="background:var(--card-hover);border-left:3px solid var(--gold);border-radius:8px;padding:1rem;margin-bottom:0.8rem">
                    <div style="display:flex;justify-content:space-between;align-items:center"><h3>📋 ${c.titulo}</h3><span style="background:var(--gold-dim);color:var(--gold);padding:0.2rem 0.6rem;border-radius:12px;font-size:0.7rem">${c.estado}</span></div>
                    <p style="color:var(--text-muted);margin-top:0.5rem">${c.descripcion || 'Sin descripción'}</p>
                    <div style="display:flex;gap:1rem;margin-top:0.5rem;font-size:0.75rem;flex-wrap:wrap">
                        <span>👤 <strong>Cliente:</strong> ${c.usuarioNombre || c.usuarioEmail}</span>
                        <span>⚖️ <strong>Abogado:</strong> ${c.abogadoNombre || 'Sin asignar'}</span>
                        <span>📅 ${new Date(c.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });
    }
    html += `</div></div>`;
    mostrarModal(html, 'Casos Globales');
}

async function verTransaccionesAdmin() {
    const usuarios = await window.db.usuarios.todos();
    let todosPagos = [];
    for (const u of usuarios) {
        const pagos = await window.db.pagos.obtenerPorUsuario(u.email);
        todosPagos.push(...pagos);
    }
    todosPagos.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = `<div><h2 style="font-family:Cormorant Garamond,serif;color:var(--gold);margin-bottom:1rem">💰 Transacciones</h2><div style="display:grid;gap:0.8rem">`;
    
    if (!todosPagos.length) {
        html += `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--gold-border);border-radius:8px">💰 No hay transacciones registradas</div>`;
    } else {
        todosPagos.forEach(p => {
            html += `<div style="background:var(--card-hover);border:1px solid var(--gold-border);border-radius:8px;padding:0.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap"><div><strong>${p.concepto}</strong><br><small>${p.usuarioEmail} · ${new Date(p.fecha).toLocaleString()}</small></div><div><span style="color:var(--gold);font-weight:bold">$${p.monto}</span></div></div>`;
        });
    }
    html += `</div></div>`;
    mostrarModal(html, 'Transacciones');
}
