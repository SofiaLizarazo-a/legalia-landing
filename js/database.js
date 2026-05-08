// ============================================
// LEGALIA DATABASE - VERSIÓN ULTRA SIMPLE
// ============================================

console.log('🚀 Cargando database.js...');

// Variable global
window._usuarioActual = null;

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

// Inicializar almacenamiento
function iniciarStorage() {
    console.log('📦 Inicializando LocalStorage...');
    
    if (!localStorage.getItem('usuarios')) {
        localStorage.setItem('usuarios', JSON.stringify([USUARIO_ADMIN]));
        console.log('✅ Usuarios inicializados con admin');
    }
    
    if (!localStorage.getItem('casos')) {
        localStorage.setItem('casos', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('documentos')) {
        localStorage.setItem('documentos', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('citas')) {
        localStorage.setItem('citas', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('pagos')) {
        localStorage.setItem('pagos', JSON.stringify([]));
    }
    
    console.log('✅ Storage listo');
    return true;
}

// API de usuarios
function crearUsuario(nombre, apellido, email, password, role) {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios'));
        if (usuarios.find(u => u.email === email)) {
            reject(new Error('Email ya registrado'));
            return;
        }
        
        const nuevo = {
            email, nombre, apellido, password, role,
            activo: true, telefono: '', documento: '',
            fechaRegistro: new Date().toISOString()
        };
        usuarios.push(nuevo);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        resolve(nuevo);
    });
}

function obtenerUsuario(email) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios'));
        resolve(usuarios.find(u => u.email === email) || null);
    });
}

function autenticarUsuario(email, password, role) {
    return new Promise(async (resolve, reject) => {
        const user = await obtenerUsuario(email);
        if (!user) reject(new Error('Usuario no encontrado'));
        else if (user.password !== password) reject(new Error('Contraseña incorrecta'));
        else if (user.role !== role) reject(new Error(`No eres ${role}`));
        else if (!user.activo) reject(new Error('Cuenta desactivada'));
        else resolve(user);
    });
}

function obtenerTodosUsuarios() {
    return new Promise((resolve) => {
        resolve(JSON.parse(localStorage.getItem('usuarios')) || []);
    });
}

function obtenerUsuariosPorRol(role) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        resolve(usuarios.filter(u => u.role === role));
    });
}

function actualizarUsuario(usuario) {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index === -1) {
            reject(new Error('Usuario no encontrado'));
            return;
        }
        usuarios[index] = usuario;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        resolve(usuario);
    });
}

// API de casos
function crearCaso(usuarioEmail, usuarioNombre, titulo, descripcion, area) {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem('casos'));
        const nuevo = {
            id: Date.now(),
            usuarioEmail, usuarioNombre, titulo, descripcion, area,
            estado: 'Pendiente',
            abogadoEmail: null, abogadoNombre: null,
            fechaCreacion: new Date().toISOString()
        };
        casos.push(nuevo);
        localStorage.setItem('casos', JSON.stringify(casos));
        resolve(nuevo);
    });
}

function obtenerCasosPorUsuario(email) {
    return new Promise((resolve) => {
        const casos = JSON.parse(localStorage.getItem('casos')) || [];
        resolve(casos.filter(c => c.usuarioEmail === email));
    });
}

function obtenerTodosLosCasos() {
    return new Promise((resolve) => {
        resolve(JSON.parse(localStorage.getItem('casos')) || []);
    });
}

function actualizarEstadoCaso(id, estado) {
    return new Promise((resolve, reject) => {
        const casos = JSON.parse(localStorage.getItem('casos'));
        const index = casos.findIndex(c => c.id === id);
        if (index === -1) {
            reject(new Error('Caso no encontrado'));
            return;
        }
        casos[index].estado = estado;
        localStorage.setItem('casos', JSON.stringify(casos));
        resolve(casos[index]);
    });
}

// API de documentos
function agregarDocumento(usuarioEmail, nombre, descripcion, area) {
    return new Promise((resolve) => {
        const docs = JSON.parse(localStorage.getItem('documentos'));
        const nuevo = {
            id: Date.now(),
            usuarioEmail, nombre, descripcion, area,
            estado: 'pendiente',
            fechaSolicitud: new Date().toISOString()
        };
        docs.push(nuevo);
        localStorage.setItem('documentos', JSON.stringify(docs));
        resolve(nuevo.id);
    });
}

function obtenerDocumentosPendientes(usuarioEmail) {
    return new Promise((resolve) => {
        const docs = JSON.parse(localStorage.getItem('documentos')) || [];
        resolve(docs.filter(d => d.usuarioEmail === usuarioEmail && d.estado === 'pendiente'));
    });
}

function subirDocumento(id, archivo) {
    return new Promise((resolve, reject) => {
        const docs = JSON.parse(localStorage.getItem('documentos'));
        const index = docs.findIndex(d => d.id === id);
        if (index === -1) {
            reject(new Error('Documento no encontrado'));
            return;
        }
        docs[index].estado = 'subido';
        docs[index].archivo = archivo;
        docs[index].fechaSubida = new Date().toISOString();
        localStorage.setItem('documentos', JSON.stringify(docs));
        resolve(docs[index]);
    });
}

// API de citas
function crearCita(usuarioEmail, titulo, fecha, descripcion) {
    return new Promise((resolve) => {
        const citas = JSON.parse(localStorage.getItem('citas'));
        const nueva = {
            id: Date.now(),
            usuarioEmail, titulo, fecha: new Date(fecha).toISOString(),
            descripcion, estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };
        citas.push(nueva);
        localStorage.setItem('citas', JSON.stringify(citas));
        resolve(nueva);
    });
}

function obtenerCitasPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        resolve(citas.filter(c => c.usuarioEmail === usuarioEmail));
    });
}

// API de pagos
function crearPago(usuarioEmail, casoId, conceptoTitulo, concepto, monto) {
    return new Promise((resolve) => {
        const pagos = JSON.parse(localStorage.getItem('pagos'));
        const nuevo = {
            id: Date.now(),
            usuarioEmail, casoId, concepto, monto,
            fecha: new Date().toISOString(),
            numeroFactura: 'FAC-' + Date.now()
        };
        pagos.push(nuevo);
        localStorage.setItem('pagos', JSON.stringify(pagos));
        resolve(nuevo);
    });
}

function obtenerPagosPorUsuario(usuarioEmail) {
    return new Promise((resolve) => {
        const pagos = JSON.parse(localStorage.getItem('pagos')) || [];
        resolve(pagos.filter(p => p.usuarioEmail === usuarioEmail));
    });
}

// Inicializar
iniciarStorage();

// Exportar API global
window.db = {
    iniciar: () => Promise.resolve(true),
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
        asignarAbogado: (id, email, nombre) => Promise.resolve({})
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
        crear: (ue, ae, p, r) => Promise.resolve(Date.now())
    },
    obtenerUsuarioActual: () => window._usuarioActual,
    setUsuarioActual: (u) => { window._usuarioActual = u; }
};

console.log('✅ database.js cargado correctamente');
