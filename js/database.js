// ============================================
// LEGALIA - BASE DE DATOS (IndexedDB)
// ============================================

const DB_NAME = 'LegaliaDB';
const DB_VERSION = 1;

// Variables globales
let db = null;
let usuarioActual = null;

// Administrador predefinido (no se puede registrar)
const ADMIN_PREDETERMINADO = {
  id: 'admin-001',
  nombre: 'Administrador',
  apellido: 'Legalia',
  email: 'admin@legalia.com',
  password: 'Admin123',
  role: 'administrador',
  fechaRegistro: new Date().toISOString(),
  activo: true
};

// ============================================
// INICIALIZAR BASE DE DATOS
// ============================================
function iniciarBaseDatos() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error al abrir la base de datos:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      
      // 🔥 LÍNEA CRÍTICA: expone la conexión de la BD para que auth.js pueda esperarla
      window.db._db = db;
      
      console.log('✅ Base de datos conectada correctamente');
      
      // Inicializar administrador predefinido si no existe
      inicializarAdministrador().then(() => {
        resolve(db);
      }).catch(err => {
        console.warn('Error al inicializar admin:', err);
        resolve(db); // Resolvemos igual para no bloquear
      });
    };
    
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      
      // ========================================
      // CREAR TABLAS (Object Stores)
      // ========================================
      
      // Tabla de USUARIOS
      if (!db.objectStoreNames.contains('usuarios')) {
        const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'email' });
        usuariosStore.createIndex('role', 'role', { unique: false });
        usuariosStore.createIndex('nombre', 'nombre', { unique: false });
        console.log('✅ Tabla "usuarios" creada');
      }
      
      // Tabla de CONVERSACIONES
      if (!db.objectStoreNames.contains('conversaciones')) {
        const conversacionesStore = db.createObjectStore('conversaciones', { keyPath: 'id', autoIncrement: true });
        conversacionesStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
        conversacionesStore.createIndex('fecha', 'fecha', { unique: false });
        console.log('✅ Tabla "conversaciones" creada');
      }
      
      // Tabla de DOCUMENTOS
      if (!db.objectStoreNames.contains('documentos')) {
        const documentosStore = db.createObjectStore('documentos', { keyPath: 'id', autoIncrement: true });
        documentosStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
        documentosStore.createIndex('estado', 'estado', { unique: false });
        documentosStore.createIndex('casoId', 'casoId', { unique: false });
        console.log('✅ Tabla "documentos" creada');
      }
      
      // Tabla de CASOS
      if (!db.objectStoreNames.contains('casos')) {
        const casosStore = db.createObjectStore('casos', { keyPath: 'id', autoIncrement: true });
        casosStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
        casosStore.createIndex('abogadoEmail', 'abogadoEmail', { unique: false });
        casosStore.createIndex('estado', 'estado', { unique: false });
        casosStore.createIndex('fechaCreacion', 'fechaCreacion', { unique: false });
        console.log('✅ Tabla "casos" creada');
      }
      
      // Tabla de NOTIFICACIONES
      if (!db.objectStoreNames.contains('notificaciones')) {
        const notificacionesStore = db.createObjectStore('notificaciones', { keyPath: 'id', autoIncrement: true });
        notificacionesStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
        notificacionesStore.createIndex('leida', 'leida', { unique: false });
        console.log('✅ Tabla "notificaciones" creada');
      }
    };
  });
}

// ============================================
// INICIALIZAR ADMINISTRADOR PREDETERMINADO
// ============================================
async function inicializarAdministrador() {
  try {
    const adminExiste = await obtenerUsuarioPorEmail(ADMIN_PREDETERMINADO.email);
    
    if (!adminExiste) {
      await crearUsuario(
        ADMIN_PREDETERMINADO.nombre,
        ADMIN_PREDETERMINADO.apellido,
        ADMIN_PREDETERMINADO.email,
        ADMIN_PREDETERMINADO.password,
        ADMIN_PREDETERMINADO.role
      );
      console.log('✅ Administrador predefinido creado:', ADMIN_PREDETERMINADO.email);
    } else {
      console.log('✅ Administrador ya existe');
    }
  } catch (error) {
    console.error('❌ Error al inicializar administrador:', error);
  }
}

// ============================================
// CRUD - USUARIOS
// ============================================
function crearUsuario(nombre, apellido, email, password, role = 'cliente') {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    // Verificar si el usuario ya existe
    obtenerUsuarioPorEmail(email).then(usuarioExistente => {
      if (usuarioExistente) {
        reject(new Error('Ya existe una cuenta con este correo electrónico'));
        return;
      }
      
      const transaction = db.transaction(['usuarios'], 'readwrite');
      const store = transaction.objectStore('usuarios');
      
      const nuevoUsuario = {
        nombre,
        apellido,
        email: email.toLowerCase(),
        password,
        role,
        fechaRegistro: new Date().toISOString(),
        activo: true,
        fotoPerfil: null
      };
      
      const request = store.add(nuevoUsuario);
      
      request.onsuccess = () => {
        resolve(nuevoUsuario);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    }).catch(reject);
  });
}

function obtenerUsuarioPorEmail(email) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['usuarios'], 'readonly');
    const store = transaction.objectStore('usuarios');
    const request = store.get(email.toLowerCase());
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function autenticarUsuario(email, password, role) {
  return new Promise((resolve, reject) => {
    obtenerUsuarioPorEmail(email).then(usuario => {
      if (!usuario) {
        reject(new Error('Usuario no encontrado'));
        return;
      }
      
      if (usuario.password !== password) {
        reject(new Error('Contraseña incorrecta'));
        return;
      }
      
      if (usuario.role !== role) {
        reject(new Error(`Esta cuenta no está registrada como ${role}`));
        return;
      }
      
      if (!usuario.activo) {
        reject(new Error('Cuenta desactivada. Contacte al administrador'));
        return;
      }
      
      resolve(usuario);
    }).catch(reject);
  });
}

function obtenerTodosUsuarios() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['usuarios'], 'readonly');
    const store = transaction.objectStore('usuarios');
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// ============================================
// CRUD - CONVERSACIONES
// ============================================
function guardarConversacion(usuarioEmail, mensajes, areaSeleccionada = null) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['conversaciones'], 'readwrite');
    const store = transaction.objectStore('conversaciones');
    
    const conversacion = {
      usuarioEmail: usuarioEmail.toLowerCase(),
      mensajes: mensajes,
      areaSeleccionada: areaSeleccionada,
      fecha: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    };
    
    const request = store.add(conversacion);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function obtenerConversacionesUsuario(usuarioEmail) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['conversaciones'], 'readonly');
    const store = transaction.objectStore('conversaciones');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioEmail.toLowerCase());
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function actualizarConversacion(id, mensajes) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    obtenerConversacionPorId(id).then(conversacion => {
      if (!conversacion) {
        reject(new Error('Conversación no encontrada'));
        return;
      }
      
      const transaction = db.transaction(['conversaciones'], 'readwrite');
      const store = transaction.objectStore('conversaciones');
      
      conversacion.mensajes = mensajes;
      conversacion.ultimaActualizacion = new Date().toISOString();
      
      const request = store.put(conversacion);
      
      request.onsuccess = () => {
        resolve(conversacion);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    }).catch(reject);
  });
}

function obtenerConversacionPorId(id) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['conversaciones'], 'readonly');
    const store = transaction.objectStore('conversaciones');
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// ============================================
// CRUD - DOCUMENTOS
// ============================================
function agregarDocumento(usuarioEmail, nombre, descripcion, area, casoId = null) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['documentos'], 'readwrite');
    const store = transaction.objectStore('documentos');
    
    const documento = {
      usuarioEmail: usuarioEmail.toLowerCase(),
      nombre: nombre,
      descripcion: descripcion,
      area: area,
      casoId: casoId,
      estado: 'pendiente',
      archivo: null,
      fechaSolicitud: new Date().toISOString(),
      fechaSubida: null
    };
    
    const request = store.add(documento);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function obtenerDocumentosPendientesUsuario(usuarioEmail) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['documentos'], 'readonly');
    const store = transaction.objectStore('documentos');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioEmail.toLowerCase());
    
    request.onsuccess = () => {
      const documentos = (request.result || []).filter(doc => doc.estado === 'pendiente');
      resolve(documentos);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function subirDocumento(docId, archivoNombre) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['documentos'], 'readwrite');
    const store = transaction.objectStore('documentos');
    const request = store.get(docId);
    
    request.onsuccess = () => {
      const documento = request.result;
      if (!documento) {
        reject(new Error('Documento no encontrado'));
        return;
      }
      
      documento.estado = 'subido';
      documento.archivo = archivoNombre;
      documento.fechaSubida = new Date().toISOString();
      
      const updateRequest = store.put(documento);
      
      updateRequest.onsuccess = () => {
        resolve(documento);
      };
      
      updateRequest.onerror = (event) => {
        reject(event.target.error);
      };
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// ============================================
// CRUD - NOTIFICACIONES
// ============================================
function agregarNotificacion(usuarioEmail, mensaje, tipo = 'info') {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['notificaciones'], 'readwrite');
    const store = transaction.objectStore('notificaciones');
    
    const notificacion = {
      usuarioEmail: usuarioEmail.toLowerCase(),
      mensaje: mensaje,
      tipo: tipo,
      leida: false,
      fecha: new Date().toISOString()
    };
    
    const request = store.add(notificacion);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function obtenerNotificacionesUsuario(usuarioEmail) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de datos no inicializada'));
      return;
    }
    
    const transaction = db.transaction(['notificaciones'], 'readonly');
    const store = transaction.objectStore('notificaciones');
    const index = store.index('usuarioEmail');
    const request = index.getAll(usuarioEmail.toLowerCase());
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.db = {
  iniciar: iniciarBaseDatos,
  _db: null, // Será asignado cuando la BD se conecte
  usuarios: {
    crear: crearUsuario,
    obtener: obtenerUsuarioPorEmail,
    autenticar: autenticarUsuario,
    todos: obtenerTodosUsuarios
  },
  conversaciones: {
    guardar: guardarConversacion,
    obtenerPorUsuario: obtenerConversacionesUsuario,
    actualizar: actualizarConversacion
  },
  documentos: {
    agregar: agregarDocumento,
    pendientes: obtenerDocumentosPendientesUsuario,
    subir: subirDocumento
  },
  notificaciones: {
    agregar: agregarNotificacion,
    obtener: obtenerNotificacionesUsuario
  },
  obtenerUsuarioActual: () => usuarioActual,
  setUsuarioActual: (user) => { usuarioActual = user; }
};
