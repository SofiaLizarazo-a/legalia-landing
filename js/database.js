// ============================================
// LEGALIA - BASE DE DATOS (LocalStorage)
// ============================================

console.log('📁 [database.js] Cargando...');

// Configuración de tablas
const DB_TABLES = {
    usuarios: 'legalia_usuarios',
    casos: 'legalia_casos',
    documentos: 'legalia_documentos',
    citas: 'legalia_citas',
    pagos: 'legalia_pagos',
    calificaciones: 'legalia_calificaciones',
    conversaciones: 'legalia_conversaciones'
};

// Usuario administrador por defecto
const USUARIO_ADMIN = {
    email: 'admin@legalia.com',
    password: 'Admin123',
    role: 'administrador',
    nombre: 'Administrador',
    apellido: 'Legalia',
    activo: true,
    telefono: '3000000000',
    documento: '12345678',
    fechaRegistro: new Date().toISOString()
};

// ==================== INICIALIZACIÓN ====================

function iniciarBaseDatos() {
    return new Promise((resolve) => {
        try {
            // Crear todas las tablas si no existen
            Object.values(DB_TABLES).forEach(tabla => {
                if (!localStorage.getItem(tabla)) {
                    localStorage.setItem(tabla, JSON.stringify([]));
                    console.log(`✅ Tabla ${tabla} creada`);
                }
            });
            
            // Verificar y crear admin si no existe
            const usuarios = JSON.parse(localStorage.getItem(DB_TABLES.usuarios));
            if (!usuarios.find(u => u.email === USUARIO_ADMIN.email)) {
                usuarios.push(USUARIO_ADMIN);
                localStorage.setItem(DB_TABLES.usuarios, JSON.stringify(usuarios));
                console.log('✅ Administrador creado');
            }
            
            console.log('✅ Base de datos local lista');
            resolve(true);
        } catch (error) {
            console.error('❌ Error al iniciar DB:', error);
            resolve(false);
        }
    });
}

// ==================== USUARIOS ====================

function crearUsuario(nombre, apellido, email, password, role = 'cliente') {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem(DB_TABLES.usuarios));
        
        if (usuarios.find(u => u.email === email.toLowerCase())) {
            reject(new Error('Email ya registrado'));
            return;
        }
        
        const nuevoUsuario = {
            email: email.toLowerCase(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            password: password,
            role: role,
            activo: true,
            telefono: '',
            documento: '',
            fechaRegistro: new Date().toISOString()
        };
        
        usuarios.push(nuevoUsuario);
        localStorage.setItem(DB_TABLES.usuarios, JSON.stringify(usuarios));
        resolve(nuevoUsuario);
    });
}

function obtenerUsuario(email) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem(DB_TABLES.usuarios)) || [];
        resolve(usuarios.find(u => u.email === email.toLowerCase()) || null);
    });
}

function autenticarUsuario(email, password, role) {
    return new Promise(async (resolve, reject) => {
        const user = await obtenerUsuario(email);
        
        if (!user) {
            reject(new Error('Usuario no encontrado'));
            return;
        }
        if (user.password !== password) {
            reject(new Error('Contraseña incorrecta'));
            return;
        }
        if (user.role !== role) {
            const nombreRol = role === 'administrador' ? 'administrador' : role;
            reject(new Error(`No eres ${nombreRol}`));
            return;
        }
        if (!user.activo) {
            reject(new Error('Cuenta desactivada. Contacta al administrador.'));
            return;
        }
        
        resolve(user);
    });
}

function obtenerTodosUsuarios() {
    return new Promise((resolve) => {
        resolve(JSON.parse(localStorage.getItem(DB_TABLES.usuarios)) || []);
    });
}

function obtenerUsuariosPorRol(role) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem(DB_TABLES.usuarios)) || [];
        resolve(usuarios.filter(u => u.role === role));
    });
}

function actualizarUsuario(usuario) {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem(DB_TABLES.usuarios));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        
        if (index === -1) {
            reject(new Error('Usuario no encontrado'));
            return;
        }
        
        usuarios[index] = usuario;
        localStorage.setItem(DB_TABLES.usuarios, JSON.stringify(usuarios));
        resolve(usuario);
    });
}

// ==================== CASOS ====================

function crearCaso(usuarioEmail, usuarioNombre, titulo, descripcion, area) {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem(DB_TABLES.casos));
        const nuevoCaso = {
            id: Date.now(),
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
        casos.push(nuevoCaso);
        localStorage.setItem(DB_TABLES.casos, JSON.stringify(casos));
        resolve(nuevoCaso);
    });
}

function obtenerCasosPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem(DB_TABLES.casos)) || [];
        resolve(casos.filter(c => c.usuarioEmail === usuarioEmail.toLowerCase()));
    });
}

function obtenerTodosLosCasos() {
    return new Promise((resolve) => {
        resolve(JSON.parse(localStorage.getItem(DB_TABLES.casos)) || []);
    });
}

function actualizarEstadoCaso(id, estado) {
    return new Promise((resolve, reject) => {
        const casos = JSON.parse(localStorage.getItem(DB_TABLES.casos));
        const index = casos.findIndex(c => c.id === id);
        
        if (index === -1) {
            reject(new Error('Caso no encontrado'));
            return;
        }
        
        casos[index].estado = estado;
        casos[index].ultimaActualizacion = new Date().toISOString();
        localStorage.setItem(DB_TABLES.casos, JSON.stringify(casos));
        resolve(casos[index]);
    });
}

function asignarAbogadoACaso(id, abogadoEmail, abogadoNombre) {
    return new Promise((resolve, reject) => {
        const casos = JSON.parse(localStorage.getItem(DB_TABLES.casos));
        const index = casos.findIndex(c => c.id === id);
        
        if (index === -1) {
            reject(new Error('Caso no encontrado'));
            return;
        }
        
        casos[index].abogadoEmail = abogadoEmail;
        casos[index].abogadoNombre = abogadoNombre;
        casos[index].estado = 'En Progreso';
        localStorage.setItem(DB_TABLES.casos, JSON.stringify(casos));
        resolve(casos[index]);
    });
}

// ==================== DOCUMENTOS ====================

function agregarDocumento(usuarioEmail, nombre, descripcion, area, abogadoEmail = null) {
    return new Promise((resolve) => {
        const docs = JSON.parse(localStorage.getItem(DB_TABLES.documentos));
        const nuevoDoc = {
            id: Date.now(),
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
        docs.push(nuevoDoc);
        localStorage.setItem(DB_TABLES.documentos, JSON.stringify(docs));
        resolve(nuevoDoc.id);
    });
}

function obtenerDocumentosPendientes(usuarioEmail) {
    return new Promise((resolve) => {
        const docs = JSON.parse(localStorage.getItem(DB_TABLES.documentos)) || [];
        resolve(docs.filter(d => d.usuarioEmail === usuarioEmail.toLowerCase() && d.estado === 'pendiente'));
    });
}

function subirDocumento(id, archivoNombre) {
    return new Promise((resolve, reject) => {
        const docs = JSON.parse(localStorage.getItem(DB_TABLES.documentos));
        const index = docs.findIndex(d => d.id === id);
        
        if (index === -1) {
            reject(new Error('Documento no encontrado'));
            return;
        }
        
        docs[index].estado = 'subido';
        docs[index].archivo = archivoNombre;
        docs[index].fechaSubida = new Date().toISOString();
        localStorage.setItem(DB_TABLES.documentos, JSON.stringify(docs));
        resolve(docs[index]);
    });
}

// ==================== CITAS ====================

function crearCita(usuarioEmail, titulo, fecha, descripcion, casoId = null) {
    return new Promise((resolve) => {
        const citas = JSON.parse(localStorage.getItem(DB_TABLES.citas));
        const nuevaCita = {
            id: Date.now(),
            usuarioEmail: usuarioEmail.toLowerCase(),
            titulo: titulo,
            fecha: new Date(fecha).toISOString(),
            descripcion: descripcion,
            casoId: casoId,
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };
        citas.push(nuevaCita);
        localStorage.setItem(DB_TABLES.citas, JSON.stringify(citas));
        resolve(nuevaCita);
    });
}

function obtenerCitasPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const citas = JSON.parse(localStorage.getItem(DB_TABLES.citas)) || [];
        resolve(citas.filter(c => c.usuarioEmail === usuarioEmail.toLowerCase()));
    });
}

// ==================== PAGOS ====================

function crearPago(usuarioEmail, casoId, casoTitulo, concepto, monto) {
    return new Promise((resolve) => {
        const pagos = JSON.parse(localStorage.getItem(DB_TABLES.pagos));
        const nuevoPago = {
            id: Date.now(),
            usuarioEmail: usuarioEmail.toLowerCase(),
            casoId: casoId,
            casoTitulo: casoTitulo,
            concepto: concepto,
            monto: monto,
            fecha: new Date().toISOString(),
            estado: 'pagado',
            numeroFactura: 'FAC-' + Date.now()
        };
        pagos.push(nuevoPago);
        localStorage.setItem(DB_TABLES.pagos, JSON.stringify(pagos));
        resolve(nuevoPago);
    });
}

function obtenerPagosPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const pagos = JSON.parse(localStorage.getItem(DB_TABLES.pagos)) || [];
        resolve(pagos.filter(p => p.usuarioEmail === usuarioEmail.toLowerCase()));
    });
}

// ==================== CALIFICACIONES ====================

function crearCalificacion(usuarioEmail, abogadoEmail, puntuacion, resena) {
    return new Promise((resolve) => {
        const calificaciones = JSON.parse(localStorage.getItem(DB_TABLES.calificaciones));
        const nuevaCal = {
            id: Date.now(),
            usuarioEmail: usuarioEmail.toLowerCase(),
            abogadoEmail: abogadoEmail,
            puntuacion: puntuacion,
            resena: resena || '',
            fecha: new Date().toISOString()
        };
        calificaciones.push(nuevaCal);
        localStorage.setItem(DB_TABLES.calificaciones, JSON.stringify(calificaciones));
        resolve(nuevaCal.id);
    });
}

// ==================== CONVERSACIONES ====================

function guardarConversacion(usuarioEmail, mensajes, areaSeleccionada = null) {
    return new Promise((resolve) => {
        const conversaciones = JSON.parse(localStorage.getItem(DB_TABLES.conversaciones));
        const nuevaConv = {
            id: Date.now(),
            usuarioEmail: usuarioEmail.toLowerCase(),
            mensajes: mensajes,
            areaSeleccionada: areaSeleccionada,
            fecha: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
        };
        conversaciones.push(nuevaConv);
        localStorage.setItem(DB_TABLES.conversaciones, JSON.stringify(conversaciones));
        resolve(nuevaConv.id);
    });
}

function obtenerConversacionesPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const conversaciones = JSON.parse(localStorage.getItem(DB_TABLES.conversaciones)) || [];
        resolve(conversaciones.filter(c => c.usuarioEmail === usuarioEmail.toLowerCase()));
    });
}

function actualizarConversacion(id, mensajes) {
    return new Promise((resolve, reject) => {
        const conversaciones = JSON.parse(localStorage.getItem(DB_TABLES.conversaciones));
        const index = conversaciones.findIndex(c => c.id === id);
        
        if (index === -1) {
            reject(new Error('Conversación no encontrada'));
            return;
        }
        
        conversaciones[index].mensajes = mensajes;
        conversaciones[index].ultimaActualizacion = new Date().toISOString();
        localStorage.setItem(DB_TABLES.conversaciones, JSON.stringify(conversaciones));
        resolve(conversaciones[index]);
    });
}

// ==================== EXPORTAR API ====================

window.db = {
    iniciar: iniciarBaseDatos,
    _db: true,
    
    usuarios: {
        crear: crearUsuario,
        obtener: obtenerUsuario,
        autenticar: autenticarUsuario,
        todos: obtenerTodosUsuarios,
        obtenerPorRol: obtenerUsuariosPorRol,
        actualizar: actualizarUsuario
    },
    
    casos: {
        crear: crearCaso,
        obtenerPorUsuario: obtenerCasosPorUsuario,
        obtenerTodos: obtenerTodosLosCasos,
        actualizarEstado: actualizarEstadoCaso,
        asignarAbogado: asignarAbogadoACaso
    },
    
    documentos: {
        agregar: agregarDocumento,
        pendientes: obtenerDocumentosPendientes,
        subir: subirDocumento
    },
    
    citas: {
        crear: crearCita,
        obtenerPorUsuario: obtenerCitasPorUsuario
    },
    
    pagos: {
        crear: crearPago,
        obtenerPorUsuario: obtenerPagosPorUsuario
    },
    
    calificaciones: {
        crear: crearCalificacion
    },
    
    conversaciones: {
        guardar: guardarConversacion,
        obtenerPorUsuario: obtenerConversacionesPorUsuario,
        actualizar: actualizarConversacion
    },
    
    obtenerUsuarioActual: () => window._usuarioActual,
    setUsuarioActual: (u) => { window._usuarioActual = u; }
};

console.log('✅ [database.js] API exportada correctamente');
