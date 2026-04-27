// ============================================
// LEGALIA DATABASE - VERSIÓN OPTIMIZADA
// ============================================

const DB_NAME='LegaliaDB',DB_VERSION=2;
let db=null,usuarioActual=null;
const ADMIN={email:'admin@legalia.com',password:'Admin123',role:'administrador',nombre:'Administrador',apellido:'Legalia',fechaRegistro:new Date().toISOString(),activo:true};

function iniciarBaseDatos(){return new Promise((res,rej)=>{let r=indexedDB.open(DB_NAME,DB_VERSION);
  r.onerror=e=>rej(e.target.error);
  r.onsuccess=e=>{db=e.target.result;window.db._db=db;console.log('✅ DB conectada');inicializarAdmin().then(()=>res(db)).catch(()=>res(db));};
  r.onupgradeneeded=e=>{db=e.target.result;
    if(!db.objectStoreNames.contains('usuarios')){let s=db.createObjectStore('usuarios',{keyPath:'email'});s.createIndex('role','role');s.createIndex('nombre','nombre');console.log('✅ Tabla usuarios');}
    if(!db.objectStoreNames.contains('conversaciones')){let s=db.createObjectStore('conversaciones',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('fecha','fecha');console.log('✅ Tabla conversaciones');}
    if(!db.objectStoreNames.contains('documentos')){let s=db.createObjectStore('documentos',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('estado','estado');s.createIndex('casoId','casoId');console.log('✅ Tabla documentos');}
    if(!db.objectStoreNames.contains('casos')){let s=db.createObjectStore('casos',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('abogadoEmail','abogadoEmail');s.createIndex('estado','estado');console.log('✅ Tabla casos');}
    if(!db.objectStoreNames.contains('citas')){let s=db.createObjectStore('citas',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('casoId','casoId');s.createIndex('fecha','fecha');console.log('✅ Tabla citas');}
    if(!db.objectStoreNames.contains('pagos')){let s=db.createObjectStore('pagos',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('casoId','casoId');console.log('✅ Tabla pagos');}
    if(!db.objectStoreNames.contains('calificaciones')){let s=db.createObjectStore('calificaciones',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('abogadoEmail','abogadoEmail');console.log('✅ Tabla calificaciones');}
    if(!db.objectStoreNames.contains('notificaciones')){let s=db.createObjectStore('notificaciones',{keyPath:'id',autoIncrement:true});s.createIndex('usuarioEmail','usuarioEmail');s.createIndex('leida','leida');console.log('✅ Tabla notificaciones');}
  };
});}

async function inicializarAdmin(){let existe=await obtenerUsuarioPorEmail(ADMIN.email);if(!existe)await crearUsuario(ADMIN.nombre,ADMIN.apellido,ADMIN.email,ADMIN.password,ADMIN.role);}

function crearUsuario(n,a,e,p,r='cliente'){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');obtenerUsuarioPorEmail(e).then(ex=>{if(ex)return rej('Email ya registrado');let t=db.transaction(['usuarios'],'readwrite'),s=t.objectStore('usuarios'),req=s.add({nombre:n,apellido:a,email:e.toLowerCase(),password:p,role:r,telefono:'',documento:'',fechaRegistro:new Date().toISOString(),activo:true,fotoPerfil:null});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);}).catch(rej);});}
function obtenerUsuarioPorEmail(e){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['usuarios'],'readonly').objectStore('usuarios').get(e.toLowerCase());req.onsuccess=()=>res(req.result||null);req.onerror=e=>rej(e.target.error);});}
function autenticarUsuario(e,p,role){return new Promise((res,rej)=>{obtenerUsuarioPorEmail(e).then(u=>{if(!u)return rej('Usuario no encontrado');if(u.password!==p)return rej('Contraseña incorrecta');if(u.role!==role)return rej(`No es ${role}`);if(!u.activo)return rej('Cuenta desactivada');res(u);}).catch(rej);});}
function obtenerTodosUsuarios(){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['usuarios'],'readonly').objectStore('usuarios').getAll();req.onsuccess=()=>res(req.result||[]);req.onerror=e=>rej(e.target.error);});}

function guardarConversacion(ue,m,area=null){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['conversaciones'],'readwrite').objectStore('conversaciones').add({usuarioEmail:ue.toLowerCase(),mensajes:m,areaSeleccionada:area,fecha:new Date().toISOString(),ultimaActualizacion:new Date().toISOString()});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);});}
function obtenerConversacionesUsuario(ue){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['conversaciones'],'readonly').objectStore('conversaciones').index('usuarioEmail').getAll(ue.toLowerCase());req.onsuccess=()=>res(req.result||[]);req.onerror=e=>rej(e.target.error);});}
function actualizarConversacion(id,m){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['conversaciones'],'readwrite').objectStore('conversaciones').get(id);req.onsuccess=()=>{let c=req.result;if(!c)return rej('No encontrada');c.mensajes=m;c.ultimaActualizacion=new Date().toISOString();db.transaction(['conversaciones'],'readwrite').objectStore('conversaciones').put(c).onsuccess=()=>res(c);};req.onerror=e=>rej(e.target.error);});}

function agregarDocumento(ue,n,d,area,caso=null){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['documentos'],'readwrite').objectStore('documentos').add({usuarioEmail:ue.toLowerCase(),nombre:n,descripcion:d,area:area,casoId:caso,estado:'pendiente',archivo:null,fechaSolicitud:new Date().toISOString(),fechaSubida:null});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);});}
function obtenerDocumentosPendientesUsuario(ue){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['documentos'],'readonly').objectStore('documentos').index('usuarioEmail').getAll(ue.toLowerCase());req.onsuccess=()=>res((req.result||[]).filter(d=>d.estado==='pendiente'));req.onerror=e=>rej(e.target.error);});}
function subirDocumento(id,archivo){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['documentos'],'readwrite').objectStore('documentos').get(id);req.onsuccess=()=>{let d=req.result;if(!d)return rej('No encontrado');d.estado='subido';d.archivo=archivo;d.fechaSubida=new Date().toISOString();db.transaction(['documentos'],'readwrite').objectStore('documentos').put(d).onsuccess=()=>res(d);};req.onerror=e=>rej(e.target.error);});}

function obtenerCasosUsuario(ue){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');db.transaction(['casos'],'readonly').objectStore('casos').index('usuarioEmail').getAll(ue.toLowerCase()).onsuccess=e=>res(e.target.result||[]);});}
function crearCaso(ue,t,d,a){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['casos'],'readwrite').objectStore('casos').add({usuarioEmail:ue.toLowerCase(),titulo:t,descripcion:d,area:a,estado:'abierto',abogadoEmail:null,abogadoNombre:null,fechaCreacion:new Date().toISOString(),ultimaActualizacion:new Date().toISOString()});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);});}
function obtenerCitasUsuario(ue){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');db.transaction(['citas'],'readonly').objectStore('citas').index('usuarioEmail').getAll(ue.toLowerCase()).onsuccess=e=>res(e.target.result||[]);});}
function crearCita(ue,t,f,d,caso=null){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['citas'],'readwrite').objectStore('citas').add({usuarioEmail:ue.toLowerCase(),titulo:t,fecha:new Date(f).toISOString(),descripcion:d||'',casoId:caso,estado:'pendiente',fechaCreacion:new Date().toISOString()});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);});}
function eliminarCita(id){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');db.transaction(['citas'],'readwrite').objectStore('citas').delete(id).onsuccess=()=>res(true);});}
function obtenerPagosUsuario(ue){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');db.transaction(['pagos'],'readonly').objectStore('pagos').index('usuarioEmail').getAll(ue.toLowerCase()).onsuccess=e=>res(e.target.result||[]);});}
function crearPago(ue,casoId,casoTitulo,concepto,monto){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['pagos'],'readwrite').objectStore('pagos').add({usuarioEmail:ue.toLowerCase(),casoId:casoId,casoTitulo:casoTitulo,concepto:concepto,monto:monto,fecha:new Date().toISOString(),estado:'pagado',numeroFactura:'FAC-'+Date.now()});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);});}
function obtenerCalificacionesUsuario(ue){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');db.transaction(['calificaciones'],'readonly').objectStore('calificaciones').index('usuarioEmail').getAll(ue.toLowerCase()).onsuccess=e=>res(e.target.result||[]);});}
function crearCalificacion(ue,ae,p,r){return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');let req=db.transaction(['calificaciones'],'readwrite').objectStore('calificaciones').add({usuarioEmail:ue.toLowerCase(),abogadoEmail:ae,puntuacion:p,resena:r||'',fecha:new Date().toISOString()});req.onsuccess=()=>res(req.result);req.onerror=e=>rej(e.target.error);});}

window.db={iniciar:iniciarBaseDatos,_db:null,
  usuarios:{crear:crearUsuario,obtener:obtenerUsuarioPorEmail,autenticar:autenticarUsuario,todos:obtenerTodosUsuarios,actualizar:async(u)=>{return new Promise((res,rej)=>{if(!db)return rej('DB no inicializada');db.transaction(['usuarios'],'readwrite').objectStore('usuarios').put(u).onsuccess=()=>res(u);});}},
  conversaciones:{guardar:guardarConversacion,obtenerPorUsuario:obtenerConversacionesUsuario,actualizar:actualizarConversacion},
  documentos:{agregar:agregarDocumento,pendientes:obtenerDocumentosPendientesUsuario,subir:subirDocumento},
  casos:{obtenerPorUsuario:obtenerCasosUsuario,crear:crearCaso},
  citas:{obtenerPorUsuario:obtenerCitasUsuario,crear:crearCita,eliminar:eliminarCita},
  pagos:{obtenerPorUsuario:obtenerPagosUsuario,crear:crearPago},
  calificaciones:{obtenerPorUsuario:obtenerCalificacionesUsuario,crear:crearCalificacion},
  obtenerUsuarioActual:()=>usuarioActual,setUsuarioActual:u=>{usuarioActual=u;}};
