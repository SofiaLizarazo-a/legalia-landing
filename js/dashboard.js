// ============================================
// LEGALIA DASHBOARD - VERSIÓN CORTA
// ============================================

let DC=[];

function showDashboard(r,n){
  let o=document.getElementById('dashboardOverlay');
  document.getElementById('dash-name').innerText=n;
  let c={cliente:{b:'Cliente',bc:'#27ae60',w:'Bienvenido',d:'Gestiona casos, citas, pagos',
    i:[['⚖️','Mis Casos','Seguimiento','verMisCasos()'],['💬','Chat','Comunícate','openChat()'],['📅','Citas','Reuniones','verCitas()'],
       ['💰','Pagos','Facturas','verPagos()'],['📄','Documentos','Expediente','verDocumentos()'],['⭐','Calificaciones','Califica','verCalificaciones()'],
       ['👤','Mi Perfil','Actualiza','verMiPerfil()']]},
    abogado:{b:'Abogado',bc:'#2980b9',w:'Gestión',d:'Administra casos',
    i:[['📁','Casos','Gestión','alert("En desarrollo")'],['👥','Clientes','Directorio','alert("En desarrollo")'],['💬','Mensajes','Chat','openChat()'],
       ['📅','Agenda','Disponibilidad','alert("En desarrollo")']]},
    admin:{b:'Admin',bc:'#8e44ad',w:'Panel Admin',d:'Supervisión',
    i:[['🛡️','Verificar','Abogados','alert("Admin")'],['📊','Estadísticas','Métricas','alert("Admin")'],['👤','Usuarios','Gestión','alert("Admin")']]}}[r]||c.cliente;
  document.getElementById('dash-badge').innerText=c.b;document.getElementById('dash-badge').style.background=c.bc;
  document.getElementById('dash-welcome').innerHTML=c.w;document.getElementById('dash-desc').innerHTML=c.d;
  window._currentUser={name:n,role:r};
  document.getElementById('dash-grid').innerHTML=c.i.map(i=>`<div class="dash-card"><div class="dash-card-icon">${i[0]}</div><h3>${i[1]}</h3><p>${i[2]}</p><button onclick="${i[3]}">Abrir→</button></div>`).join('');
  agregarDocs();o.classList.add('open');document.body.style.overflow='hidden';document.body.classList.add('dashboard-open');
}
function closeDashboard(){let o=document.getElementById('dashboardOverlay');o.classList.remove('open');document.body.classList.remove('dashboard-open');document.body.style.overflow='';}

let modal=null;
function mostrarModal(c,t){if(modal)modal.remove();let o=document.createElement('div');o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center';let m=document.createElement('div');m.style.cssText='background:var(--bg);border:1px solid var(--gold-border);border-radius:8px;max-width:800px;width:90%;max-height:85vh;overflow:auto';let h=document.createElement('div');h.style.cssText='display:flex;justify-content:space-between;padding:1rem;border-bottom:1px solid var(--gold-border)';h.innerHTML=`<h3 style="color:var(--gold)">${t}</h3><button onclick="cerrarModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer">&times;</button>`;let b=document.createElement('div');b.innerHTML=c;m.appendChild(h);m.appendChild(b);o.appendChild(m);document.body.appendChild(o);modal=o;}
function cerrarModal(){if(modal)modal.remove();modal=null;}

async function verMisCasos(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let r=await new Promise(r=>window.db._db.transaction(['casos'],'readonly').objectStore('casos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));DC=r||[];let h=`<div><h2>⚖️ Mis Casos</h2><button onclick="nuevoCaso()">+ Nuevo</button><div>`;if(!DC.length)h+=`<div>📭 No hay casos</div>`;else DC.forEach(c=>{h+=`<div><h3>📋 ${c.titulo||'Caso'}</h3><p>${c.descripcion||''}</p><p>👨‍⚖️ ${c.abogadoNombre||'Por asignar'} · 📅 ${new Date(c.fechaCreacion).toLocaleDateString()}</p><button onclick="verDetalle(${c.id})">Ver</button></div>`;});h+=`</div>`;mostrarModal(h,'Mis Casos');}
function nuevoCaso(){mostrarModal(`<div><h3>Nuevo Caso</h3><input id="t" placeholder="Título"><textarea id="d" rows="2" placeholder="Descripción"></textarea><select id="a"><option>Civil</option><option>Penal</option><option>Laboral</option><option>Familia</option></select><button onclick="crearCaso()">Crear</button><button onclick="cerrarModal()">Cancelar</button></div>`,'Nuevo Caso');}
async function crearCaso(){let t=document.getElementById('t')?.value;if(!t){alert('Título requerido');return;}let u=window.db?.obtenerUsuarioActual();if(!u)return;await window.db._db.transaction(['casos'],'readwrite').objectStore('casos').add({usuarioEmail:u.email,titulo:t,descripcion:document.getElementById('d')?.value||'',area:document.getElementById('a')?.value||'Civil',estado:'abierto',abogadoEmail:null,abogadoNombre:null,fechaCreacion:new Date().toISOString()});cerrarModal();verMisCasos();alert('✅ Caso creado');}
function verDetalle(id){let c=DC.find(x=>x.id===id);if(!c)return;mostrarModal(`<div><h3>📋 ${c.titulo}</h3><p>${c.descripcion}</p><p><strong>Área:</strong> ${c.area}<br><strong>Abogado:</strong> ${c.abogadoNombre||'Por asignar'}<br><strong>Fecha:</strong> ${new Date(c.fechaCreacion).toLocaleDateString()}</p><button onclick="cerrarModal()">Cerrar</button></div>`,'Detalle');}

async function verCitas(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let r=await new Promise(r=>window.db._db.transaction(['citas'],'readonly').objectStore('citas').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));let h=`<div><h2>📅 Citas</h2><button onclick="nuevaCita()">+ Agendar</button><div>`;if(!r.length)h+=`<div>📅 No hay citas</div>`;else r.forEach(c=>{h+=`<div><strong>📌 ${c.titulo}</strong><br>📅 ${new Date(c.fecha).toLocaleString()}<br>${c.descripcion||''}</div>`;});h+=`</div>`;mostrarModal(h,'Citas');}
function nuevaCita(){mostrarModal(`<div><h3>Agendar Cita</h3><input id="t" placeholder="Título"><input type="datetime-local" id="f"><textarea id="d" rows="2" placeholder="Descripción"></textarea><button onclick="crearCita()">Agendar</button><button onclick="cerrarModal()">Cancelar</button></div>`,'Nueva Cita');}
async function crearCita(){let t=document.getElementById('t')?.value,f=document.getElementById('f')?.value;if(!t||!f){alert('Completa los campos');return;}let u=window.db?.obtenerUsuarioActual();if(!u)return;await window.db._db.transaction(['citas'],'readwrite').objectStore('citas').add({usuarioEmail:u.email,titulo:t,fecha:new Date(f).toISOString(),descripcion:document.getElementById('d')?.value||''});cerrarModal();verCitas();alert('✅ Cita agendada');}

async function verPagos(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let casos=await new Promise(r=>window.db._db.transaction(['casos'],'readonly').objectStore('casos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));let h=`<div><h2>💰 Pagos</h2><div><h3>Nueva Factura</h3><select id="c">${casos.map(c=>`<option value="${c.id}">${c.titulo}</option>`).join('')}</select><select id="cp"><option>Certificado</option><option>Consulta</option><option>Servicio</option></select><input id="m" type="number" placeholder="Valor"><button onclick="genFactura()">Generar</button></div><div id="lp"></div></div>`;mostrarModal(h,'Pagos');cargarPagos();}
async function cargarPagos(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let p=await new Promise(r=>window.db._db.transaction(['pagos'],'readonly').objectStore('pagos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));let lp=document.getElementById('lp');if(lp)lp.innerHTML=p.length?p.map(p=>`<div><strong>${p.concepto}</strong> - $${p.monto}<br><small>${new Date(p.fecha).toLocaleString()}</small><button onclick="verFactura(${p.id})">Ver</button> <button onclick="envFactura(${p.id})">📧</button></div>`).join(''):'<div>No hay pagos</div>';}
function genFactura(){let c=document.getElementById('c')?.value,cp=document.getElementById('cp')?.value,m=parseFloat(document.getElementById('m')?.value);if(!c||!m){alert('Datos incompletos');return;}alert(`✅ Factura generada\nConcepto: ${cp}\nMonto: $${m}`);verPagos();}
function verFactura(id){mostrarModal(`<div><h2>LEGALIA</h2><p>Factura #${id}</p><button onclick="window.print()">Imprimir</button><button onclick="cerrarModal()">Cerrar</button></div>`,'Factura');}
function envFactura(id){let u=window.db?.obtenerUsuarioActual();if(u)window.location.href=`mailto:${u.email}?subject=Factura Legalia`;}

function verDocumentos(){mostrarModal(`<div><h2>📄 Documentos</h2><div><input id="dn" placeholder="Nombre"><textarea id="dd" rows="2" placeholder="Descripción"></textarea><input type="file" id="df"><button onclick="subirDoc()">Subir</button></div><div id="ld"></div></div>`,'Documentos');cargarDocs();}
async function cargarDocs(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let d=await new Promise(r=>window.db._db.transaction(['documentos'],'readonly').objectStore('documentos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));let ld=document.getElementById('ld');if(ld)ld.innerHTML=d.length?d.map(d=>`<div><strong>📄 ${d.nombre}</strong><br><small>${d.descripcion||''} · ${new Date(d.fechaSolicitud).toLocaleDateString()}</small></div>`).join(''):'<div>📭 No hay documentos</div>';}
function subirDoc(){let n=document.getElementById('dn')?.value;if(!n){alert('Nombre requerido');return;}alert('✅ Documento subido');cargarDocs();}

function verCalificaciones(){mostrarModal(`<div><h2>⭐ Calificaciones</h2><div><select id="ab"><option>Dr. Andrés</option><option>Dra. Camila</option></select><div id="estrellas">${[1,2,3,4,5].map(i=>`<span onclick="selStar(${i})" id="s${i}">☆</span>`).join('')}</div><textarea id="r" rows="2" placeholder="Tu experiencia..."></textarea><button onclick="enviarCal()">Enviar</button></div><div id="lc"></div></div>`,'Calificaciones');cargarCal();}
let star=0;function selStar(p){star=p;for(let i=1;i<=5;i++)document.getElementById(`s${i}`).innerHTML=i<=p?'★':'☆';}
function enviarCal(){if(!star){alert('Selecciona puntuación');return;}alert('✅ Calificación enviada');cargarCal();}
async function cargarCal(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let c=await new Promise(r=>window.db._db.transaction(['calificaciones'],'readonly').objectStore('calificaciones').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));let lc=document.getElementById('lc');if(lc)lc.innerHTML=c.length?c.map(c=>`<div><strong>${'★'.repeat(c.puntuacion)}</strong><br>${c.resena||''}<br><small>${new Date(c.fecha).toLocaleDateString()}</small></div>`).join(''):'<div>No hay calificaciones</div>';}

function verMiPerfil(){let u=window.db?.obtenerUsuarioActual();if(!u)return;mostrarModal(`<div><h2>👤 Mi Perfil</h2><div><div id="foto" style="width:80px;height:80px;border-radius:50%;background:var(--gold-dim);margin:auto">👤</div><button onclick="document.getElementById('fotoinput').click()">Cambiar foto</button><input type="file" id="fotoinput" style="display:none" accept="image/*"><input id="pn" value="${u.nombre||''}" placeholder="Nombre"><input id="pa" value="${u.apellido||''}" placeholder="Apellido"><input id="pt" value="${u.telefono||''}" placeholder="Teléfono"><input id="pd" value="${u.documento||''}" placeholder="Documento"><button onclick="guardarPerfil()">Guardar</button></div></div>`,'Mi Perfil');}
async function guardarPerfil(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let n=document.getElementById('pn')?.value,a=document.getElementById('pa')?.value;if(!n||!a){alert('Nombre y apellido requeridos');return;}u.nombre=n;u.apellido=a;u.telefono=document.getElementById('pt')?.value;u.documento=document.getElementById('pd')?.value;await window.db._db.transaction(['usuarios'],'readwrite').objectStore('usuarios').put(u);window.db.setUsuarioActual(u);alert('✅ Perfil actualizado');cerrarModal();document.getElementById('dash-name').innerText=n;}

async function agregarDocs(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let d=await window.db.documentos.pendientes(u.email);if(!d?.length)return;let s=document.getElementById('doc-pend-section');if(s)s.remove();s=document.createElement('div');s.id='doc-pend-section';s.innerHTML=`<div style="margin-top:2rem;padding:0 5vw"><div>📄 Documentos pendientes</div><div id="dp"></div></div>`;document.querySelector('#dashboardOverlay>div')?.appendChild(s);actDocs();}
async function actDocs(){let c=document.getElementById('dp');if(!c)return;let u=window.db?.obtenerUsuarioActual();if(!u)return;let d=await window.db.documentos.pendientes(u.email);if(!d?.length){document.getElementById('doc-pend-section')?.remove();return;}c.innerHTML=d.map(d=>`<div><strong>📄 ${d.nombre}</strong><br><small>${d.descripcion}<br>${new Date(d.fechaSolicitud).toLocaleString()}</small><button onclick="subirDocPen(${d.id})">Subir</button></div>`).join('');}
function subirDocPen(id){let i=document.createElement('input');i.type='file';i.onchange=async e=>{if(e.target.files[0]){await window.db.documentos.subir(id,e.target.files[0].name);actDocs();alert('✅ Documento subido');}};i.click();}

window.agregarDocumentoPendiente=async(n,d,a)=>{let u=window.db?.obtenerUsuarioActual();if(!u)return;let id=await window.db.documentos.agregar(u.email,n,d,a);actDocs();return id;};
window.actualizarListaDocumentos=actDocs;

function verCasosAbogado(){alert('En desarrollo');}
function verClientes(){alert('En desarrollo');}
function verAgendaAbogado(){alert('En desarrollo');}
function verificarAbogados(){alert('Admin');}
function verEstadisticas(){alert('Admin');}
function gestionarUsuarios(){alert('Admin');}
function editarCaso(id){alert('Editar');}
function eliminarCita(id){alert('Eliminar');}
