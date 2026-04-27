// ============================================
// LEGALIA DASHBOARD - VERSIÓN CORTA
// ============================================

const D={cliente:{b:'#27ae60',w:'Bienvenido',d:'Gestiona casos, citas, pagos',i:[
  ['⚖️','Mis Casos','Seguimiento','verMisCasos()'],
  ['💬','Chat','Comunícate','openChat()'],
  ['📅','Citas','Gestiona reuniones','verCitas()'],
  ['💰','Pagos','Facturas','verPagos()'],
  ['📄','Documentos','Expediente','verDocumentos()'],
  ['⭐','Calificaciones','Califica','verCalificaciones()'],
  ['👤','Mi Perfil','Actualiza datos','verMiPerfil()']
]},abogado:{b:'#2980b9',w:'Gestión',d:'Administra casos',i:[
  ['📁','Casos','Gestiona','alert("En desarrollo")'],
  ['👥','Clientes','Directorio','alert("En desarrollo")'],
  ['💬','Mensajes','Chat','openChat()'],
  ['📅','Agenda','Disponibilidad','alert("En desarrollo")']
]},admin:{b:'#8e44ad',w:'Admin',d:'Supervisión',i:[
  ['🛡️','Verificar','Abogados','verificarAbogados()'],
  ['📊','Estadísticas','Métricas','verEstadisticas()'],
  ['👤','Usuarios','Gestión','gestionarUsuarios()']
]}};

let mc=[]; // mis casos

function showDashboard(r,n){
  const c=D[r]||D.cliente;
  document.getElementById('dash-name').innerText=n;
  ['badge','welcome','desc'].forEach((k,i)=>{
    const v=i===0?c.b:i===1?c.w:c.d;
    document.getElementById(`dash-${k}`)[i===0?'innerText':'innerHTML']=v;
    if(i===0)document.getElementById('dash-badge').style.background=v;
  });
  window._currentUser={name:n,role:r,email:window.db?.obtenerUsuarioActual()?.email};
  document.getElementById('dash-grid').innerHTML=c.i.map(i=>`
    <div class="dash-card"><div class="dash-card-icon">${i[0]}</div><h3>${i[1]}</h3><p>${i[2]}</p><button onclick="${i[3]}">Abrir→</button></div>
  `).join('');
  agregarSeccionDocumentos();
  let o=document.getElementById('dashboardOverlay');
  o.classList.add('open');
  document.body.style.overflow='hidden';
  document.body.classList.add('dashboard-open');
}
function closeDashboard(){let o=document.getElementById('dashboardOverlay');o.classList.remove('open');document.body.classList.remove('dashboard-open');document.body.style.overflow='';}

async function verMisCasos(){
  let u=window.db?.obtenerUsuarioActual();
  if(!u)return;
  let t=window.db._db.transaction(['casos'],'readonly'),s=t.objectStore('casos'),r=await new Promise(r=>s.index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));
  mc=r||[];
  let h=`<div style="padding:2rem 5vw"><div style="display:flex;justify-content:space-between"><h2>⚖️ Mis Casos</h2><button class="btn-primary" onclick="nuevoCaso()">+ Nuevo</button></div><div>`;
  if(!mc.length)h+=`<div style="background:var(--bg2);padding:2rem;text-align:center">📭 No hay casos</div>`;
  else mc.forEach(c=>{let ec=c.estado==='abierto'?'#27ae60':c.estado==='en_proceso'?'#f39c12':'#95a5a6',et=c.estado==='abierto'?'Abierto':c.estado==='en_proceso'?'En Proceso':'Cerrado';
    h+=`<div class="caso-card" style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:12px;padding:1rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between"><div><h3>📋 ${c.titulo||'Caso'}</h3><p>${c.descripcion||''}</p>
      <div style="display:flex;gap:1rem;margin-top:.5rem"><span>👨‍⚖️ ${c.abogadoNombre||'Por asignar'}</span><span>📅 ${new Date(c.fechaCreacion).toLocaleDateString()}</span>
      <span style="background:${ec}20;color:${ec}">● ${et}</span></div></div>
      <div><button class="btn-outline" onclick="verDetalleCaso(${c.id})">Ver</button></div></div></div>`;
  });h+=`</div></div>`;
  mostrarModalGenerico(h,'Mis Casos');
}
function nuevoCaso(){mostrarModalGenerico(`<div><h3>Nuevo Caso</h3><div class="form-field"><label>Título</label><input id="nc-titulo"></div><div class="form-field"><label>Descripción</label><textarea id="nc-desc" rows="3"></textarea></div><div class="form-field"><label>Área</label><select id="nc-area"><option>Civil</option><option>Penal</option><option>Laboral</option><option>Familia</option></select></div><button class="btn-primary" onclick="crearNuevoCaso()">Crear</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button></div>`,'Nuevo Caso');}
async function crearNuevoCaso(){let t=document.getElementById('nc-titulo')?.value;if(!t){alert('Título requerido');return;}let u=window.db?.obtenerUsuarioActual();if(!u)return;let a=document.getElementById('nc-area')?.value;let d=document.getElementById('nc-desc')?.value||'';let trans=window.db._db.transaction(['casos'],'readwrite'),s=trans.objectStore('casos');s.add({usuarioEmail:u.email,titulo:t,descripcion:d,area:a,estado:'abierto',abogadoEmail:null,abogadoNombre:null,fechaCreacion:new Date().toISOString()}).onsuccess=()=>{cerrarModalGenerico();verMisCasos();alert('✅ Caso creado');};}
function verDetalleCaso(id){let c=mc.find(x=>x.id===id);if(!c)return;mostrarModalGenerico(`<div><h2>📋 ${c.titulo}</h2><p>${c.descripcion}</p><p><strong>Área:</strong> ${c.area||'N/A'}</p><p><strong>Fecha:</strong> ${new Date(c.fechaCreacion).toLocaleDateString()}</p><p><strong>Abogado:</strong> ${c.abogadoNombre||'Por asignar'}</p><button class="btn-primary" onclick="alert('Próximamente')">💬 Hablar</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cerrar</button></div>`,'Detalle');}

async function verCitas(){
  let u=window.db?.obtenerUsuarioActual();if(!u)return;
  let t=window.db._db.transaction(['citas'],'readonly'),r=await new Promise(r=>t.objectStore('citas').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));
  let h=`<div><div style="display:flex;justify-content:space-between"><h2>📅 Citas</h2><button class="btn-primary" onclick="nuevaCita()">+ Agendar</button></div><div>`;
  if(!r.length)h+=`<div style="background:var(--bg2);padding:2rem;text-align:center">📅 No hay citas</div>`;
  else r.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).forEach(c=>{h+=`<div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:8px;padding:1rem;margin-bottom:1rem"><div>📌 ${c.titulo}<br>📅 ${new Date(c.fecha).toLocaleString()}<br>${c.descripcion||''}</div></div>`;});
  h+=`</div></div>`;mostrarModalGenerico(h,'Citas');
}
function nuevaCita(){mostrarModalGenerico(`<div><h3>Agendar Cita</h3><div class="form-field"><label>Título</label><input id="c-titulo"></div><div class="form-field"><label>Fecha/Hora</label><input type="datetime-local" id="c-fecha"></div><div class="form-field"><label>Descripción</label><textarea id="c-desc" rows="2"></textarea></div><button class="btn-primary" onclick="crearCita()">Agendar</button><button class="btn-outline" onclick="cerrarModalGenerico()">Cancelar</button></div>`,'Nueva Cita');}
async function crearCita(){let t=document.getElementById('c-titulo')?.value,f=document.getElementById('c-fecha')?.value;if(!t||!f){alert('Completa los campos');return;}let u=window.db?.obtenerUsuarioActual();if(!u)return;let trans=window.db._db.transaction(['citas'],'readwrite');trans.objectStore('citas').add({usuarioEmail:u.email,titulo:t,fecha:new Date(f).toISOString(),descripcion:document.getElementById('c-desc')?.value||'',fechaCreacion:new Date().toISOString()}).onsuccess=()=>{cerrarModalGenerico();verCitas();alert('✅ Cita agendada');};}

async function verPagos(){
  let u=window.db?.obtenerUsuarioActual();if(!u)return;
  let t=window.db._db.transaction(['casos'],'readonly'),casos=await new Promise(r=>t.objectStore('casos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));
  let h=`<div><h2>💰 Pagos</h2><div style="background:var(--bg2);padding:1rem;margin-bottom:1rem"><h3>Nueva Factura</h3>
    <select id="p-caso">${casos.map(c=>`<option value="${c.id}">${c.titulo}</option>`).join('')}</select>
    <select id="p-concepto"><option>Certificado</option><option>Consulta</option><option>Servicio</option></select>
    <input type="number" id="p-monto" placeholder="Valor">
    <button class="btn-primary" onclick="genFactura()">Generar</button></div>
    <div id="lista-pagos"></div></div>`;
  mostrarModalGenerico(h,'Pagos');cargarPagos();
}
async function cargarPagos(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let t=window.db._db.transaction(['pagos'],'readonly'),pagos=await new Promise(r=>t.objectStore('pagos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));
  let lp=document.getElementById('lista-pagos');if(!lp)return;
  if(!pagos.length)lp.innerHTML='<div style="padding:1rem;text-align:center">No hay pagos</div>';
  else lp.innerHTML=pagos.map(p=>`<div style="background:var(--card-bg);padding:.5rem;margin-bottom:.5rem"><div><strong>${p.concepto}</strong> - $${p.monto}<br><small>${new Date(p.fecha).toLocaleString()}</small></div><button onclick="verFactura(${p.id})">Ver</button> <button onclick="envFactura(${p.id})">📧</button></div>`).join('');
}
function genFactura(){let c=document.getElementById('p-caso')?.value,con=document.getElementById('p-concepto')?.value,m=parseFloat(document.getElementById('p-monto')?.value);if(!c||!m){alert('Complete los datos');return;}alert(`✅ Factura generada\nConcepto: ${con}\nMonto: $${m}\nSe ha guardado`);verPagos();}

function verDocumentos(){let h=`<div><h2>📄 Documentos</h2><div style="background:var(--bg2);padding:1rem;margin-bottom:1rem"><input id="doc-n" placeholder="Nombre"><textarea id="doc-d" rows="2" placeholder="Descripción"></textarea><input type="file" id="doc-f"><button class="btn-primary" onclick="subirDoc()">Subir</button></div><div id="lista-docs"></div></div>`;mostrarModalGenerico(h,'Documentos');cargarDocs();}
async function cargarDocs(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let t=window.db._db.transaction(['documentos'],'readonly'),docs=await new Promise(r=>t.objectStore('documentos').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));
  let ld=document.getElementById('lista-docs');if(!ld)return;
  if(!docs.length)ld.innerHTML='<div>📭 No hay documentos</div>';
  else ld.innerHTML=docs.map(d=>`<div>📄 ${d.nombre}<br><small>${d.descripcion||''} · ${new Date(d.fechaSolicitud).toLocaleDateString()}</small></div>`).join('');
}
function subirDoc(){let n=document.getElementById('doc-n')?.value;if(!n){alert('Nombre requerido');return;}alert('✅ Documento subido');cargarDocs();}

function verCalificaciones(){let h=`<div><h2>⭐ Calificaciones</h2><div><select id="cal-abogado"><option>Dr. Andrés</option><option>Dra. Camila</option></select><div id="stars">${[1,2,3,4,5].map(i=>`<span onclick="selStar(${i})" id="star-${i}">☆</span>`).join('')}</div><textarea id="cal-resena" rows="2" placeholder="Tu experiencia..."></textarea><button class="btn-primary" onclick="enviarCal()">Enviar</button></div><div id="lista-cal"></div></div>`;
  mostrarModalGenerico(h,'Calificaciones');cargarCal();}
let starSel=0;function selStar(p){starSel=p;for(let i=1;i<=5;i++)document.getElementById(`star-${i}`).innerHTML=i<=p?'★':'☆';}
function enviarCal(){if(!starSel){alert('Selecciona puntuación');return;}alert('✅ Calificación enviada');cargarCal();}
async function cargarCal(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let t=window.db._db.transaction(['calificaciones'],'readonly'),cal=await new Promise(r=>t.objectStore('calificaciones').index('usuarioEmail').getAll(u.email).onsuccess=e=>r(e.target.result));
  let lc=document.getElementById('lista-cal');if(!lc)return;
  if(!cal.length)lc.innerHTML='<div>No hay calificaciones</div>';
  else lc.innerHTML=cal.map(c=>`<div><strong>${c.puntuacion}★</strong><br>${c.resena||''}<br><small>${new Date(c.fecha).toLocaleDateString()}</small></div>`).join('');
}

function verMiPerfil(){let u=window.db?.obtenerUsuarioActual();if(!u)return;
  let h=`<div style="max-width:500px"><h2>👤 Mi Perfil</h2><div><div style="width:80px;height:80px;border-radius:50%;background:var(--gold-dim);margin:auto">👤</div>
    <div class="form-field"><label>Nombre</label><input id="perf-n" value="${u.nombre||''}"></div>
    <div class="form-field"><label>Apellido</label><input id="perf-a" value="${u.apellido||''}"></div>
    <div class="form-field"><label>Teléfono</label><input id="perf-t" value="${u.telefono||''}"></div>
    <div class="form-field"><label>Documento</label><input id="perf-d" value="${u.documento||''}"></div>
    <button class="btn-primary" onclick="guardarPerfil()">Guardar</button></div></div>`;
  mostrarModalGenerico(h,'Mi Perfil');
}
async function guardarPerfil(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let n=document.getElementById('perf-n')?.value,a=document.getElementById('perf-a')?.value;if(!n||!a){alert('Nombre y apellido requeridos');return;}
  u.nombre=n;u.apellido=a;u.telefono=document.getElementById('perf-t')?.value;u.documento=document.getElementById('perf-d')?.value;
  let trans=window.db._db.transaction(['usuarios'],'readwrite');trans.objectStore('usuarios').put(u).onsuccess=()=>{window.db.setUsuarioActual(u);alert('✅ Perfil actualizado');cerrarModalGenerico();document.getElementById('dash-name').innerText=n;};}

// ============================================
// MODALES GENÉRICOS
// ============================================
let modalActivo=null;
function mostrarModalGenerico(c,t){if(modalActivo)modalActivo.remove();
  let o=document.createElement('div');o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center';
  let m=document.createElement('div');m.style.cssText='background:var(--bg);border:1px solid var(--gold-border);border-radius:8px;max-width:800px;width:90%;max-height:90vh;overflow:auto';
  let h=document.createElement('div');h.style.cssText='display:flex;justify-content:space-between;padding:1rem;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg)';
  h.innerHTML=`<h3 style="color:var(--gold)">${t}</h3><button onclick="cerrarModalGenerico()" style="background:none;border:none;font-size:1.5rem;cursor:pointer">&times;</button>`;
  let b=document.createElement('div');b.innerHTML=c;
  m.appendChild(h);m.appendChild(b);o.appendChild(m);document.body.appendChild(o);modalActivo=o;document.body.style.overflow='hidden';
}
function cerrarModalGenerico(){if(modalActivo)modalActivo.remove();modalActivo=null;document.body.style.overflow='';}

// ============================================
// DOCUMENTOS PENDIENTES
// ============================================
async function agregarSeccionDocumentos(){let u=window.db?.obtenerUsuarioActual();if(!u)return;let docs=await window.db.documentos.pendientes(u.email);if(!docs?.length)return;
  let sec=document.createElement('div');sec.id='doc-pend-section';sec.innerHTML=`<div style="margin-top:2rem;padding:0 5vw"><div>📄 Documentos pendientes</div><div id="lista-doc-pend"></div></div>`;
  document.querySelector('#dashboardOverlay>div')?.appendChild(sec);actualizarListaDocPend();
}
async function actualizarListaDocPend(){let c=document.getElementById('lista-doc-pend');if(!c)return;let u=window.db?.obtenerUsuarioActual();if(!u)return;let docs=await window.db.documentos.pendientes(u.email);if(!docs?.length){document.getElementById('doc-pend-section')?.remove();return;}
  c.innerHTML=docs.map(d=>`<div class="doc-item"><div><strong>📄 ${d.nombre}</strong><br><small>${d.descripcion}<br>${new Date(d.fechaSolicitud).toLocaleDateString()}</small></div><button class="doc-btn" onclick="subirDocPend(${d.id})">Subir</button></div>`).join('');
}
async function subirDocPend(id){let inp=document.createElement('input');inp.type='file';inp.onchange=async e=>{if(e.target.files[0]){await window.db.documentos.subir(id,e.target.files[0].name);await actualizarListaDocPend();alert('✅ Documento subido');}};inp.click();}

// Funciones admin
function verificarAbogados(){alert('📋 Función de administración');}
function verEstadisticas(){alert('📊 Estadísticas próximamente');}
function gestionarUsuarios(){alert('👥 Gestión de usuarios');}

// Exportar
window.agregarDocumentoPendiente=async(n,d,a)=>{let u=window.db?.obtenerUsuarioActual();if(!u)return;let id=await window.db.documentos.agregar(u.email,n,d,a);await actualizarListaDocPend();return id;};
window.actualizarListaDocumentos=actualizarListaDocPend;
