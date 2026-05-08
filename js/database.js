// ============================================
// LEGALIA DATABASE - VERSIÓN SIMPLIFICADA Y ROBUSTA
// ============================================

const DB_NAME = 'LegaliaDB';
const DB_VERSION = 3;

let dbInstance = null;
let usuarioActual = null;

// Usuario administrador por defecto
const ADMIN = {
    email: 'admin@legalia.com',
    password: 'Admin123',
    role: 'administrador',
    nombre: 'Administrador',
    apellido: 'Legalia',
    activo: true,
    fechaRegistro: new Date().toISOString()
};

// ==================== INICIALIZACIÓN ====================

function iniciarBaseDatos() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Abriendo conexión a IndexedDB...');
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function(event) {
            console.error('❌ Error al abrir DB:', event.target.error);
            reject(new Error('No se pudo acceder a la base de datos. Verifica que tu navegador soporte IndexedDB.'));
        };
        
        request.onsuccess = function(event) {
            dbInstance = event.target.result;
            console.log('✅ Base de datos conectada exitosamente');
            
            // Inicializar admin si no existe
            inicializarAdmin().then(() => {
                resolve(dbInstance);
            }).catch(err => {
                console.warn('⚠️ Error al inicializar admin:', err);
                resolve(dbInstance);
            });
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            console.log('🔄 Actualizando estructura de base de datos...');
            
            // Crear tabla de usuarios
            if (!db.objectStoreNames.contains('usuarios')) {
                const userStore = db.createObjectStore('usuarios', { keyPath: 'email' });
                userStore.createIndex('role', 'role', { unique: false });
                userStore.createIndex('nombre', 'nombre', { unique: false });
                console.log('✅ Tabla "usuarios" creada');
            }
            
            // Crear tabla de casos
            if (!db.objectStoreNames.contains('casos')) {
                const casoStore = db.createObjectStore('casos', { keyPath: 'id', autoIncrement: true });
                casoStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
                casoStore.createIndex('abogadoEmail', 'abogadoEmail', { unique: false });
                casoStore.createIndex('estado', 'estado', { unique: false });
                console.log('✅ Tabla "casos" creada');
            }
            
            // Crear tabla de documentos
            if (!db.objectStoreNames.contains('documentos')) {
                const docStore = db.createObjectStore('documentos', { keyPath: 'id', autoIncrement: true });
                docStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
                docStore.createIndex('estado', 'estado', { unique: false });
                console.log('✅ Tabla "documentos" creada');
            }
            
            // Crear tabla de citas
            if (!db.objectStoreNames.contains('citas')) {
                const citaStore = db.createObjectStore('citas', { keyPath: 'id', autoIncrement: true });
                citaStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
                citaStore.createIndex('fecha', 'fecha', { unique: false });
                console.log('✅ Tabla "citas" creada');
            }
            
            // Crear tabla de pagos
            if (!db.objectStoreNames.contains('pagos')) {
                const pagoStore = db.createObjectStore('pagos', { keyPath: 'id', autoIncrement: true });
                pagoStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
                console.log('✅ Tabla "pagos" creada');
            }
            
            // Crear tabla de calificaciones
            if (!db.objectStoreNames.contains('calificaciones')) {
                const calStore = db.createObjectStore('calificaciones', { keyPath: 'id', autoIncrement: true });
                calStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
                calStore.createIndex('abogadoEmail', 'abogadoEmail', { unique: false });
                console.log('✅ Tabla "calificaciones" creada');
            }
            
            // Crear tabla de conversaciones
            if (!db.objectStoreNames.contains('conversaciones')) {
                const convStore = db.createObjectStore('conversaciones', { keyPath: 'id', autoIncrement: true });
                convStore.createIndex('usuarioEmail', 'usuarioEmail', { unique: false });
                console.log('✅ Tabla "conversaciones" creada');
            }
        };
    });
}

async function inicializarAdmin() {
    try {
        const existe = await obtenerUsuarioPorEmail(ADMIN.email);
        if (!existe) {
            await crearUsuario(ADMIN.nombre, ADMIN.apellido, ADMIN.email, ADMIN.password, ADMIN.role);
            console.log('✅ Usuario administrador creado');
        }
    } catch (error) {
        console.error('Error al inicializar admin:', error);
    }
}

// ==================== USUARIOS ====================

function crearUsuario(nombre, apellido, email, password, role = 'cliente') {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        
        const nuevoUsuario = {
            email: email.toLowerCase(),
            nombre: nombre,
            apellido: apellido,
            password: password,
            role: role,
            activo: true,
            telefono: '',
            documento: '',
            fechaRegistro: new Date().toISOString()
        };
        
        const request = store.add(nuevoUsuario);
        
        request.onsuccess = () => resolve(nuevoUsuario);
        request.onerror = (event) => {
            if (event.target.error.name === 'ConstraintError') {
                reject(new Error('Email ya registrado'));
            } else {
                reject(new Error('Error al crear usuario'));
            }
        };
    });
}

function obtenerUsuarioPorEmail(email) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        const request = store.get(email.toLowerCase());
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Error al buscar usuario'));
    });
}

function autenticarUsuario(email, password, role) {
    return new Promise(async (resolve, reject) => {
        try {
            const usuario = await obtenerUsuarioPorEmail(email);
            
            if (!usuario) {
                reject(new Error('Usuario no encontrado'));
                return;
            }
            
            if (usuario.password !== password) {
                reject(new Error('Contraseña incorrecta'));
                return;
            }
            
            if (usuario.role !== role) {
                reject(new Error(`No eres ${role === 'administrador' ? 'administrador' : role}`));
                return;
            }
            
            if (!usuario.activo) {
                reject(new Error('Cuenta desactivada. Contacta al administrador.'));
                return;
            }
            
            resolve(usuario);
        } catch (error) {
            reject(error);
        }
    });
}

function obtenerTodosUsuarios() {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener usuarios'));
    });
}

function obtenerUsuariosPorRol(role) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['usuarios'], 'readonly');
        const index = transaction.objectStore('usuarios').index('role');
        const request = index.getAll(role);
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener usuarios por rol'));
    });
}

function actualizarUsuario(usuario) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        const request = store.put(usuario);
        
        request.onsuccess = () => resolve(usuario);
        request.onerror = () => reject(new Error('Error al actualizar usuario'));
    });
}

// ==================== CASOS ====================

function crearCaso(usuarioEmail, usuarioNombre, titulo, descripcion, area) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['casos'], 'readwrite');
        const store = transaction.objectStore('casos');
        
        const nuevoCaso = {
            usuarioEmail: usuarioEmail.toLowerCase(),
            usuarioNombre: usuarioNombre,
            titulo: titulo,
            descripcion: descripcion,
            area: area,
            estado: 'Pendiente',
            abogadoEmail: null,
            abogadoNombre: null,
            fechaCreacion: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
        };
        
        const request = store.add(nuevoCaso);
        
        request.onsuccess = () => resolve({ id: request.result, ...nuevoCaso });
        request.onerror = () => reject(new Error('Error al crear caso'));
    });
}

function obtenerCasosPorUsuario(usuarioEmail) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['casos'], 'readonly');
        const index = transaction.objectStore('casos').index('usuarioEmail');
        const request = index.getAll(usuarioEmail.toLowerCase());
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener casos'));
    });
}

function obtenerTodosLosCasos() {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['casos'], 'readonly');
        const store = transaction.objectStore('casos');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener todos los casos'));
    });
}

function actualizarEstadoCaso(id, estado) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['casos'], 'readwrite');
        const store = transaction.objectStore('casos');
        const request = store.get(id);
        
        request.onsuccess = () => {
            const caso = request.result;
            if (!caso) {
                reject(new Error('Caso no encontrado'));
                return;
            }
            caso.estado = estado;
            caso.ultimaActualizacion = new Date().toISOString();
            
            const updateRequest = store.put(caso);
            updateRequest.onsuccess = () => resolve(caso);
            updateRequest.onerror = () => reject(new Error('Error al actualizar estado'));
        };
        request.onerror = () => reject(new Error('Error al buscar caso'));
    });
}

function asignarAbogadoACaso(id, abogadoEmail, abogadoNombre) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['casos'], 'readwrite');
        const store = transaction.objectStore('casos');
        const request = store.get(id);
        
        request.onsuccess = () => {
            const caso = request.result;
            if (!caso) {
                reject(new Error('Caso no encontrado'));
                return;
            }
            caso.abogadoEmail = abogadoEmail;
            caso.abogadoNombre = abogadoNombre;
            caso.estado = 'En Progreso';
            caso.ultimaActualizacion = new Date().toISOString();
            
            const updateRequest = store.put(caso);
            updateRequest.onsuccess = () => resolve(caso);
            updateRequest.onerror = () => reject(new Error('Error al asignar abogado'));
        };
        request.onerror = () => reject(new Error('Error al buscar caso'));
    });
}

// ==================== DOCUMENTOS ====================

function agregarDocumento(usuarioEmail, nombre, descripcion, area, abogadoEmail = null) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['documentos'], 'readwrite');
        const store = transaction.objectStore('documentos');
        
        const nuevoDoc = {
            usuarioEmail: usuarioEmail.toLowerCase(),
            nombre: nombre,
            descripcion: descripcion,
            area: area,
            abogadoEmail: abogadoEmail,
            estado: 'pendiente',
            archivo: null,
            fechaSolicitud: new Date().toISOString(),
            fechaSubida: null
        };
        
        const request = store.add(nuevoDoc);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Error al agregar documento'));
    });
}

function obtenerDocumentosPendientes(usuarioEmail) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['documentos'], 'readonly');
        const index = transaction.objectStore('documentos').index('usuarioEmail');
        const request = index.getAll(usuarioEmail.toLowerCase());
        
        request.onsuccess = () => {
            const docs = request.result || [];
            resolve(docs.filter(d => d.estado === 'pendiente'));
        };
        request.onerror = () => reject(new Error('Error al obtener documentos pendientes'));
    });
}

function subirDocumento(id, archivoNombre) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['documentos'], 'readwrite');
        const store = transaction.objectStore('documentos');
        const request = store.get(id);
        
        request.onsuccess = () => {
            const doc = request.result;
            if (!doc) {
                reject(new Error('Documento no encontrado'));
                return;
            }
            doc.estado = 'subido';
            doc.archivo = archivoNombre;
            doc.fechaSubida = new Date().toISOString();
            
            const updateRequest = store.put(doc);
            updateRequest.onsuccess = () => resolve(doc);
            updateRequest.onerror = () => reject(new Error('Error al subir documento'));
        };
        request.onerror = () => reject(new Error('Error al buscar documento'));
    });
}

// ==================== CITAS ====================

function crearCita(usuarioEmail, titulo, fecha, descripcion, casoId = null) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['citas'], 'readwrite');
        const store = transaction.objectStore('citas');
        
        const nuevaCita = {
            usuarioEmail: usuarioEmail.toLowerCase(),
            titulo: titulo,
            fecha: new Date(fecha).toISOString(),
            descripcion: descripcion,
            casoId: casoId,
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };
        
        const request = store.add(nuevaCita);
        
        request.onsuccess = () => resolve({ id: request.result, ...nuevaCita });
        request.onerror = () => reject(new Error('Error al crear cita'));
    });
}

function obtenerCitasPorUsuario(usuarioEmail) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['citas'], 'readonly');
        const index = transaction.objectStore('citas').index('usuarioEmail');
        const request = index.getAll(usuarioEmail.toLowerCase());
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener citas'));
    });
}

// ==================== PAGOS ====================

function crearPago(usuarioEmail, casoId, casoTitulo, concepto, monto) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['pagos'], 'readwrite');
        const store = transaction.objectStore('pagos');
        
        const nuevoPago = {
            usuarioEmail: usuarioEmail.toLowerCase(),
            casoId: casoId,
            casoTitulo: casoTitulo,
            concepto: concepto,
            monto: monto,
            fecha: new Date().toISOString(),
            estado: 'pagado',
            numeroFactura: 'FAC-' + Date.now()
        };
        
        const request = store.add(nuevoPago);
        
        request.onsuccess = () => resolve({ id: request.result, ...nuevoPago });
        request.onerror = () => reject(new Error('Error al crear pago'));
    });
}

function obtenerPagosPorUsuario(usuarioEmail) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['pagos'], 'readonly');
        const index = transaction.objectStore('pagos').index('usuarioEmail');
        const request = index.getAll(usuarioEmail.toLowerCase());
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener pagos'));
    });
}

// ==================== CALIFICACIONES ====================

function crearCalificacion(usuarioEmail, abogadoEmail, puntuacion, resena) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['calificaciones'], 'readwrite');
        const store = transaction.objectStore('calificaciones');
        
        const nuevaCalificacion = {
            usuarioEmail: usuarioEmail.toLowerCase(),
            abogadoEmail: abogadoEmail,
            puntuacion: puntuacion,
            resena: resena || '',
            fecha: new Date().toISOString()
        };
        
        const request = store.add(nuevaCalificacion);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Error al crear calificación'));
    });
}

// ==================== CONVERSACIONES ====================

function guardarConversacion(usuarioEmail, mensajes, areaSeleccionada = null) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['conversaciones'], 'readwrite');
        const store = transaction.objectStore('conversaciones');
        
        const conversacion = {
            usuarioEmail: usuarioEmail.toLowerCase(),
            mensajes: mensajes,
            areaSeleccionada: areaSeleccionada,
            fecha: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
        };
        
        const request = store.add(conversacion);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Error al guardar conversación'));
    });
}

function obtenerConversacionesPorUsuario(usuarioEmail) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['conversaciones'], 'readonly');
        const index = transaction.objectStore('conversaciones').index('usuarioEmail');
        const request = index.getAll(usuarioEmail.toLowerCase());
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Error al obtener conversaciones'));
    });
}

function actualizarConversacion(id, mensajes) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return reject(new Error('Base de datos no inicializada'));
        
        const transaction = dbInstance.transaction(['conversaciones'], 'readwrite');
        const store = transaction.objectStore('conversaciones');
        const request = store.get(id);
        
        request.onsuccess = () => {
            const conv = request.result;
            if (!conv) {
                reject(new Error('Conversación no encontrada'));
                return;
            }
            conv.mensajes = mensajes;
            conv.ultimaActualizacion = new Date().toISOString();
            
            const updateRequest = store.put(conv);
            updateRequest.onsuccess = () => resolve(conv);
            updateRequest.onerror = () => reject(new Error('Error al actualizar conversación'));
        };
        request.onerror = () => reject(new Error('Error al buscar conversación'));
    });
}

// ==================== EXPORTAR API ====================

window.db = {
    iniciar: iniciarBaseDatos,
    _db: null,
    
    // Usuarios
    usuarios: {
        crear: crearUsuario,
        obtener: obtenerUsuarioPorEmail,
        autenticar: autenticarUsuario,
        todos: obtenerTodosUsuarios,
        obtenerPorRol: obtenerUsuariosPorRol,
        actualizar: actualizarUsuario
    },
    
    // Casos
    casos: {
        crear: crearCaso,
        obtenerPorUsuario: obtenerCasosPorUsuario,
        obtenerTodos: obtenerTodosLosCasos,
        actualizarEstado: actualizarEstadoCaso,
        asignarAbogado: asignarAbogadoACaso
    },
    
    // Documentos
    documentos: {
        agregar: agregarDocumento,
        pendientes: obtenerDocumentosPendientes,
        subir: subirDocumento
    },
    
    // Citas
    citas: {
        crear: crearCita,
        obtenerPorUsuario: obtenerCitasPorUsuario
    },
    
    // Pagos
    pagos: {
        crear: crearPago,
        obtenerPorUsuario: obtenerPagosPorUsuario
    },
    
    // Calificaciones
    calificaciones: {
        crear: crearCalificacion
    },
    
    // Conversaciones
    conversaciones: {
        guardar: guardarConversacion,
        obtenerPorUsuario: obtenerConversacionesPorUsuario,
        actualizar: actualizarConversacion
    },
    
    // Utilidades
    obtenerUsuarioActual: () => usuarioActual,
    setUsuarioActual: (u) => { usuarioActual = u; }
};

// Asignar dbInstance después de inicializar
iniciarBaseDatos().then(db => {
    window.db._db = db;
    console.log('✅ Sistema de base de datos listo');
}).catch(err => {
    console.error('❌ Error fatal al iniciar DB:', err);
});

console.log('📁 Script database.js cargado');
