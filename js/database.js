// ============================================
// LEGALIA DATABASE - 
// ============================================

let usuarioActual = null;

// Usuario administrador por defecto
const ADMIN = {
    email: 'admin@legalia.com',
    password: 'Admin123',
    role: 'administrador',
    nombre: 'Administrador',
    apellido: 'Legalia',
    activo: true,
    telefono: '',
    documento: '',
    fechaRegistro: new Date().toISOString()
};

// ==================== INICIALIZACIÓN ====================

function iniciarBaseDatos() {
    return new Promise((resolve) => {
        console.log('🔄 Inicializando LocalStorage...');
        
        // Crear estructura si no existe
        if (!localStorage.getItem('legalia_usuarios')) {
            localStorage.setItem('legalia_usuarios', JSON.stringify([]));
        }
        if (!localStorage.getItem('legalia_casos')) {
            localStorage.setItem('legalia_casos', JSON.stringify([]));
        }
        if (!localStorage.getItem('legalia_documentos')) {
            localStorage.setItem('legalia_documentos', JSON.stringify([]));
        }
        if (!localStorage.getItem('legalia_citas')) {
            localStorage.setItem('legalia_citas', JSON.stringify([]));
        }
        if (!localStorage.getItem('legalia_pagos')) {
            localStorage.setItem('legalia_pagos', JSON.stringify([]));
        }
        if (!localStorage.getItem('legalia_calificaciones')) {
            localStorage.setItem('legalia_calificaciones', JSON.stringify([]));
        }
        if (!localStorage.getItem('legalia_conversaciones')) {
            localStorage.setItem('legalia_conversaciones', JSON.stringify([]));
        }
        
        // Inicializar admin
        inicializarAdmin();
        
        console.log('✅ LocalStorage listo');
        resolve(true);
    });
}

function inicializarAdmin() {
    const usuarios = JSON.parse(localStorage.getItem('legalia_usuarios'));
    const adminExiste = usuarios.find(u => u.email === ADMIN.email);
    
    if (!adminExiste) {
        usuarios.push(ADMIN);
        localStorage.setItem('legalia_usuarios', JSON.stringify(usuarios));
        console.log('✅ Administrador creado');
    }
}

// ==================== USUARIOS ====================

function crearUsuario(nombre, apellido, email, password, role = 'cliente') {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem('legalia_usuarios'));
        const existe = usuarios.find(u => u.email === email.toLowerCase());
        
        if (existe) {
            reject(new Error('Email ya registrado'));
            return;
        }
        
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
        
        usuarios.push(nuevoUsuario);
        localStorage.setItem('legalia_usuarios', JSON.stringify(usuarios));
        resolve(nuevoUsuario);
    });
}

function obtenerUsuarioPorEmail(email) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('legalia_usuarios'));
        const usuario = usuarios.find(u => u.email === email.toLowerCase());
        resolve(usuario || null);
    });
}

function autenticarUsuario(email, password, role) {
    return new Promise(async (resolve, reject) => {
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
            reject(new Error('Cuenta desactivada'));
            return;
        }
        
        resolve(usuario);
    });
}

function obtenerTodosUsuarios() {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('legalia_usuarios'));
        resolve(usuarios || []);
    });
}

function obtenerUsuariosPorRol(role) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('legalia_usuarios'));
        const filtrados = usuarios.filter(u => u.role === role);
        resolve(filtrados || []);
    });
}

function actualizarUsuario(usuario) {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem('legalia_usuarios'));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        
        if (index === -1) {
            reject(new Error('Usuario no encontrado'));
            return;
        }
        
        usuarios[index] = usuario;
        localStorage.setItem('legalia_usuarios', JSON.stringify(usuarios));
        resolve(usuario);
    });
}

// ==================== CASOS ====================

function crearCaso(usuarioEmail, usuarioNombre, titulo, descripcion, area) {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem('legalia_casos'));
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
        localStorage.setItem('legalia_casos', JSON.stringify(casos));
        resolve(nuevoCaso);
    });
}

function obtenerCasosPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem('legalia_casos'));
        const filtrados = casos.filter(c => c.usuarioEmail === usuarioEmail.toLowerCase());
        resolve(filtrados || []);
    });
}

function obtenerTodosLosCasos() {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem('legalia_casos'));
        resolve(casos || []);
    });
}

function actualizarEstadoCaso(id, estado) {
    return new Promise((resolve, reject) => {
        const casos = JSON.parse(localStorage.getItem('legalia_casos'));
        const index = casos.findIndex(c => c.id === id);
        
        if (index === -1) {
            reject(new Error('Caso no encontrado'));
            return;
        }
        
        casos[index].estado = estado;
        casos[index].ultimaActualizacion = new Date().toISOString();
        localStorage.setItem('legalia_casos', JSON.stringify(casos));
        resolve(casos[index]);
    });
}

function asignarAbogadoACaso(id, abogadoEmail, abogadoNombre) {
    return new Promise((resolve, reject) => {
        const casos = JSON.parse(localStorage.getItem('legalia_casos'));
        const index = casos.findIndex(c => c.id === id);
        
        if (index === -1) {
            reject(new Error('Caso no encontrado'));
            return;
        }
        
        casos[index].abogadoEmail = abogadoEmail;
        casos[index].abogadoNombre = abogadoNombre;
        casos[index].estado = 'En Progreso';
        casos[index].ultimaActualizacion = new Date().toISOString();
        localStorage.setItem('legalia_casos', JSON.stringify(casos));
        resolve(casos[index]);
    });
}

// ==================== DOCUMENTOS ====================

function agregarDocumento(usuarioEmail, nombre, descripcion, area, abogadoEmail = null) {
    return new Promise((resolve) => {
        const documentos = JSON.parse(localStorage.getItem('legalia_documentos'));
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
        
        documentos.push(nuevoDoc);
        localStorage.setItem('legalia_documentos', JSON.stringify(documentos));
        resolve(nuevoDoc.id);
    });
}

function obtenerDocumentosPendientes(usuarioEmail) {
    return new Promise((resolve) => {
        const documentos = JSON.parse(localStorage.getItem('legalia_documentos'));
        const filtrados = documentos.filter(d => d.usuarioEmail === usuarioEmail.toLowerCase() && d.estado === 'pendiente');
        resolve(filtrados || []);
    });
}

function subirDocumento(id, archivoNombre) {
    return new Promise((resolve, reject) => {
        const documentos = JSON.parse(localStorage.getItem('legalia_documentos'));
        const index = documentos.findIndex(d => d.id === id);
        
        if (index === -1) {
            reject(new Error('Documento no encontrado'));
            return;
        }
        
        documentos[index].estado = 'subido';
        documentos[index].archivo = archivoNombre;
        documentos[index].fechaSubida = new Date().toISOString();
        localStorage.setItem('legalia_documentos', JSON.stringify(documentos));
        resolve(documentos[index]);
    });
}

// ==================== CITAS ====================

function crearCita(usuarioEmail, titulo, fecha, descripcion, casoId = null) {
    return new Promise((resolve) => {
        const citas = JSON.parse(localStorage.getItem('legalia_citas'));
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
        localStorage.setItem('legalia_citas', JSON.stringify(citas));
        resolve(nuevaCita);
    });
}

function obtenerCitasPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const citas = JSON.parse(localStorage.getItem('legalia_citas'));
        const filtrados = citas.filter(c => c.usuarioEmail === usuarioEmail.toLowerCase());
        resolve(filtrados || []);
    });
}

// ==================== PAGOS ====================

function crearPago(usuarioEmail, casoId, casoTitulo, concepto, monto) {
    return new Promise((resolve) => {
        const pagos = JSON.parse(localStorage.getItem('legalia_pagos'));
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
        localStorage.setItem('legalia_pagos', JSON.stringify(pagos));
        resolve(nuevoPago);
    });
}

function obtenerPagosPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const pagos = JSON.parse(localStorage.getItem('legalia_pagos'));
        const filtrados = pagos.filter(p => p.usuarioEmail === usuarioEmail.toLowerCase());
        resolve(filtrados || []);
    });
}

// ==================== CALIFICACIONES ====================

function crearCalificacion(usuarioEmail, abogadoEmail, puntuacion, resena) {
    return new Promise((resolve) => {
        const calificaciones = JSON.parse(localStorage.getItem('legalia_calificaciones'));
        const nuevaCal = {
            id: Date.now(),
            usuarioEmail: usuarioEmail.toLowerCase(),
            abogadoEmail: abogadoEmail,
            puntuacion: puntuacion,
            resena: resena || '',
            fecha: new Date().toISOString()
        };
        
        calificaciones.push(nuevaCal);
        localStorage.setItem('legalia_calificaciones', JSON.stringify(calificaciones));
        resolve(nuevaCal.id);
    });
}

// ==================== CONVERSACIONES ====================

function guardarConversacion(usuarioEmail, mensajes, areaSeleccionada = null) {
    return new Promise((resolve) => {
        const conversaciones = JSON.parse(localStorage.getItem('legalia_conversaciones'));
        const nuevaConv = {
            id: Date.now(),
            usuarioEmail: usuarioEmail.toLowerCase(),
            mensajes: mensajes,
            areaSeleccionada: areaSeleccionada,
            fecha: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
        };
        
        conversaciones.push(nuevaConv);
        localStorage.setItem('legalia_conversaciones', JSON.stringify(conversaciones));
        resolve(nuevaConv.id);
    });
}

function obtenerConversacionesPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const conversaciones = JSON.parse(localStorage.getItem('legalia_conversaciones'));
        const filtrados = conversaciones.filter(c => c.usuarioEmail === usuarioEmail.toLowerCase());
        resolve(filtrados || []);
    });
}

function actualizarConversacion(id, mensajes) {
    return new Promise((resolve, reject) => {
        const conversaciones = JSON.parse(localStorage.getItem('legalia_conversaciones'));
        const index = conversaciones.findIndex(c => c.id === id);
        
        if (index === -1) {
            reject(new Error('Conversación no encontrada'));
            return;
        }
        
        conversaciones[index].mensajes = mensajes;
        conversaciones[index].ultimaActualizacion = new Date().toISOString();
        localStorage.setItem('legalia_conversaciones', JSON.stringify(conversaciones));
        resolve(conversaciones[index]);
    });
}

// ==================== EXPORTAR API ====================

window.db = {
    iniciar: iniciarBaseDatos,
    _db: true,
    
    usuarios: {
        crear: crearUsuario,
        obtener: obtenerUsuarioPorEmail,
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
    
    obtenerUsuarioActual: () => usuarioActual,
    setUsuarioActual: (u) => { usuarioActual = u; }
};

console.log('📁 database.js cargado (modo LocalStorage - 100% funcional)');
