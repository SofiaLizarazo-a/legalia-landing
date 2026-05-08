// ============================================
// LEGALIA - CHAT PROFESIONAL
// ============================================

console.log('💬 [chat.js] Cargando...');

const chatState = {
    phase: 'initial',
    step: 0,
    lawyer: null,
    history: [],
    typing: false,
    userName: '',
    selectedArea: null,
    conversationId: null,
};

const AREAS_LEGALES = [
    { id: 'civil', nombre: 'Derecho Civil', keywords: ['civil', 'contrato', 'deuda', 'arriendo', 'vecino'], abogado: { nombre: 'Dr. Andrés Morales', avatar: '⚖️', especialidad: 'Derecho Civil', email: 'andres.morales@legalia.com' } },
    { id: 'penal', nombre: 'Derecho Penal', keywords: ['penal', 'delito', 'robo', 'hurto', 'denuncia'], abogado: { nombre: 'Dr. Felipe Soto', avatar: '🧑‍⚖️', especialidad: 'Derecho Penal', email: 'felipe.soto@legalia.com' } },
    { id: 'laboral', nombre: 'Derecho Laboral', keywords: ['laboral', 'despido', 'trabajo', 'empresa', 'salario'], abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Derecho Laboral', email: 'camila.rios@legalia.com' } },
    { id: 'familia', nombre: 'Derecho de Familia', keywords: ['familia', 'divorcio', 'custodia', 'alimentos'], abogado: { nombre: 'Dra. Valeria Cruz', avatar: '👩‍⚖️', especialidad: 'Derecho de Familia', email: 'valeria.cruz@legalia.com' } },
    { id: 'comercial', nombre: 'Derecho Comercial', keywords: ['comercial', 'empresa', 'sociedad', 'proveedor'], abogado: { nombre: 'Dr. Ricardo Méndez', avatar: '⚖️', especialidad: 'Derecho Comercial', email: 'ricardo.mendez@legalia.com' } },
    { id: 'administrativo', nombre: 'Derecho Administrativo', keywords: ['administrativo', 'estado', 'licencia', 'multa'], abogado: { nombre: 'Dr. Sergio Torres', avatar: '🧑‍⚖️', especialidad: 'Derecho Administrativo', email: 'sergio.torres@legalia.com' } }
];

const PREGUNTAS_PROFESIONALES = [
    { pregunta: "¿Podría describir brevemente cuál es su situación legal?", instruccion: "Explique su caso con sus propias palabras." },
    { pregunta: "¿Desde cuándo ocurrió este hecho?", instruccion: "Indique una fecha o período aproximado." },
    { pregunta: "¿Cuenta con algún documento o prueba relacionada?", instruccion: "Dígame 'sí' o 'no'. Si tiene documentos, mencione cuáles." },
    { pregunta: "¿Ha buscado asesoría legal previamente sobre este caso?", instruccion: "Responda 'sí' o 'no'." },
    { pregunta: "¿Cuál es su objetivo principal con este proceso legal?", instruccion: "Explique qué espera lograr." }
];

function openChat() {
    const overlay = document.getElementById('chatOverlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    chatState.phase = 'initial';
    chatState.step = 0;
    chatState.lawyer = null;
    chatState.history = [];
    chatState.selectedArea = null;
    chatState.conversationId = null;
    chatState.userName = (window._currentUser || {}).name || 'Cliente';

    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('chat-input').value = '';
    document.getElementById('chat-assign-badge').style.display = 'none';
    document.getElementById('chat-avatar').textContent = '🤖';
    document.getElementById('chat-who').textContent = 'Asistente Legal Legalia';
    document.getElementById('chat-status').textContent = '● En línea · Consulta inicial';

    cargarConversacionesGuardadas();

    setTimeout(() => {
        addBubble('bot', `Buenos días/tardes, ${chatState.userName}. Soy el asistente de **Legalia**.\n\n**¿Podría indicarme cuál es el área legal de su caso?**\n\n• Derecho Civil\n• Derecho Penal\n• Derecho Laboral\n• Derecho de Familia\n• Derecho Comercial\n• Derecho Administrativo\n\n*(Responda con el nombre del área, ej: "Derecho Laboral")*`);
    }, 400);
}

async function cargarConversacionesGuardadas() {
    const usuarioActual = window.db?.obtenerUsuarioActual();
    if (!usuarioActual) return;
    try {
        const conversaciones = await window.db.conversaciones.obtenerPorUsuario(usuarioActual.email);
        if (conversaciones && conversaciones.length > 0) {
            const ultima = conversaciones[conversaciones.length - 1];
            chatState.conversationId = ultima.id;
            chatState.history = ultima.mensajes || [];
            if (chatState.history.length > 0) {
                addBubble('system', `📂 Conversación anterior cargada (${new Date(ultima.fecha).toLocaleString()})`);
            }
        }
    } catch (error) {
        console.error('Error al cargar conversaciones:', error);
    }
}

async function guardarConversacionActual() {
    const usuarioActual = window.db?.obtenerUsuarioActual();
    if (!usuarioActual || chatState.history.length === 0) return;
    try {
        if (chatState.conversationId) {
            await window.db.conversaciones.actualizar(chatState.conversationId, chatState.history);
        } else {
            const id = await window.db.conversaciones.guardar(usuarioActual.email, chatState.history, chatState.selectedArea?.nombre);
            chatState.conversationId = id;
        }
    } catch (error) {
        console.error('Error al guardar conversación:', error);
    }
}

function identificarArea(texto) {
    const textoLower = texto.toLowerCase();
    for (const area of AREAS_LEGALES) {
        for (const keyword of area.keywords) {
            if (textoLower.includes(keyword)) return area;
        }
    }
    return null;
}

function closeChat() {
    guardarConversacionActual();
    document.getElementById('chatOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

async function crearDocumentosPendientes(docsSolicitados, area, abogadoEmail) {
    const user = window.db?.obtenerUsuarioActual();
    if (!user) {
        console.error('❌ No hay usuario logueado');
        return false;
    }
    
    let creados = 0;
    for (const doc of docsSolicitados) {
        try {
            await window.db.documentos.agregar(user.email, doc.nombre, doc.descripcion, area?.nombre || 'General', abogadoEmail);
            console.log(`✅ Documento pendiente creado: ${doc.nombre}`);
            creados++;
        } catch (error) {
            console.error('❌ Error al crear documento:', error);
        }
    }
    
    if (creados > 0 && typeof cargarDocumentosPendientesCliente === 'function') {
        setTimeout(() => cargarDocumentosPendientesCliente(), 500);
    }
    
    return creados;
}

function generarRespuestaInteligente(mensaje, area) {
    const msg = mensaje.toLowerCase();
    
    // DETECTAR SI EL USUARIO NO TIENE DOCUMENTOS
    if ((msg.includes('no tengo') || msg.includes('no cuento') || msg.includes('me falta') || msg.includes('sin documento') || msg.includes('no hay') || msg.includes('carezco')) && 
        (msg.includes('documento') || msg.includes('papel') || msg.includes('prueba') || msg.includes('evidencia'))) {
        
        let docsSolicitados = [];
        if (area?.id === 'laboral') {
            docsSolicitados = [
                { nombre: 'Contrato laboral', descripcion: 'Contrato de trabajo firmado' },
                { nombre: 'Horarios de trabajo', descripcion: 'Registro de horarios' },
                { nombre: 'Comunicaciones con la empresa', descripcion: 'Correos o mensajes' },
                { nombre: 'Pagos de nómina', descripcion: 'Comprobantes de pago' }
            ];
        } else if (area?.id === 'civil') {
            docsSolicitados = [
                { nombre: 'Contrato o acuerdo', descripcion: 'Documento firmado' },
                { nombre: 'Correspondencia', descripcion: 'Correos o mensajes' },
                { nombre: 'Facturas o comprobantes', descripcion: 'Documentos de pago' }
            ];
        } else if (area?.id === 'penal') {
            docsSolicitados = [
                { nombre: 'Denuncia o reporte', descripcion: 'Copia de la denuncia' },
                { nombre: 'Pruebas', descripcion: 'Fotos, videos o documentos' },
                { nombre: 'Notificaciones', descripcion: 'Citaciones oficiales' }
            ];
        } else {
            docsSolicitados = [
                { nombre: 'Documentación relevante', descripcion: 'Documentos relacionados con su caso' }
            ];
        }
        
        // Crear documentos de forma asíncrona
        const abogadoEmail = chatState.lawyer?.email || area?.abogado?.email || null;
        crearDocumentosPendientes(docsSolicitados, area, abogadoEmail);
        
        let listaDocs = '';
        docsSolicitados.forEach(doc => { listaDocs += `• **${doc.nombre}**: ${doc.descripcion}\n`; });
        
        return `Entiendo que no cuenta con todos los documentos necesarios. 📋\n\nHe generado una solicitud de **${docsSolicitados.length} documentos** que aparecerán en su panel de "Mis Documentos" dentro del dashboard.\n\n**Documentos solicitados:**\n${listaDocs}\n\nPor favor, ingrese al dashboard y suba los documentos que tenga disponibles. Cuando los suba, podré revisarlos y darle una mejor orientación.`;
    }
    
    // RESPUESTAS INTELIGENTES POR CONTEXTO
    if (msg.includes('hora') || msg.includes('horas') || msg.includes('jornada')) {
        return "En Colombia, la jornada laboral máxima es de **48 horas a la semana** (8 horas diarias). Si trabaja más de 48 horas sin pago de horas extras, es **ilegal** según el Código Sustantivo del Trabajo.\n\n¿Podría indicarme cuántas horas trabaja exactamente a la semana? ¿Le pagan las horas extras que trabaja?";
    }
    
    if (msg.includes('vacaciones') || msg.includes('día de la familia')) {
        return "El 'Día de la Familia' **no es un día festivo obligatorio por ley** en Colombia. Las empresas pueden otorgarlo voluntariamente.\n\nSin embargo, si usted trabaja más de 48 horas semanales, tiene derecho al **pago de horas extras**. ¿Podría decirme cuántas horas trabaja a la semana?";
    }
    
    if (msg.includes('gracias') || msg.includes('vale') || msg.includes('ok') || msg.includes('perfecto')) {
        return "¡De nada! Estoy aquí para ayudarle. 🤝\n\nSi necesita más orientación o tiene nuevos documentos, no dude en contactarme. ¿Hay algo más en lo que pueda ayudarle?";
    }
    
    return `Gracias por compartir su caso, ${chatState.userName}. 📋\n\nPara poder orientarle mejor, ¿podría indicarme si tiene documentos como contrato, correos o comprobantes?\n\n**Si no tiene algunos documentos**, dígame "no tengo documentos" y generaré una solicitud en su dashboard.\n\n¿Qué información adicional puede darme sobre su situación?`;
}

async function sendMsg() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || chatState.typing) return;

    input.value = '';
    input.style.height = 'auto';

    addBubble('user', text);
    chatState.history.push({ role: 'user', content: text });
    await guardarConversacionActual();

    if (chatState.phase === 'initial') {
        const areaEncontrada = identificarArea(text);
        
        if (areaEncontrada) {
            chatState.selectedArea = areaEncontrada;
            chatState.phase = 'asking_questions';
            chatState.step = 0;
            await guardarConversacionActual();
            
            addBubble('bot', `Gracias por indicarme que su caso es de **${areaEncontrada.nombre}**. Para poder asignarle el abogado más adecuado, voy a hacerle algunas preguntas.\n\n**${PREGUNTAS_PROFESIONALES[0].pregunta}**\n\n${PREGUNTAS_PROFESIONALES[0].instruccion}`);
            return;
        } else {
            addBubble('bot', `No logré identificar el área legal. Por favor, indíqueme cuál es:\n\n• Derecho Civil\n• Derecho Penal\n• Derecho Laboral\n• Derecho de Familia\n• Derecho Comercial\n• Derecho Administrativo\n\n*(Responda con el nombre del área)*`);
            return;
        }
    }
    
    if (chatState.phase === 'asking_questions') {
        chatState.step++;
        
        if (chatState.step < PREGUNTAS_PROFESIONALES.length) {
            const p = PREGUNTAS_PROFESIONALES[chatState.step];
            addBubble('bot', `**${p.pregunta}**\n\n${p.instruccion}`);
        } else {
            chatState.phase = 'offering_lawyer';
            await guardarConversacionActual();
            addBubble('bot', `Muchas gracias por compartir esta información, ${chatState.userName}. Con base en lo que me ha comentado, puedo asignarle un abogado especializado en **${chatState.selectedArea.nombre}**.\n\n**¿Desea que le asigne un abogado ahora mismo?**\n\n*(Responda "sí" o "no")*`);
        }
        return;
    }
    
    if (chatState.phase === 'offering_lawyer') {
        const respuesta = text.toLowerCase();
        
        if (respuesta === 'si' || respuesta === 'sí' || respuesta === 'yes') {
            chatState.lawyer = chatState.selectedArea.abogado;
            chatState.phase = 'assigned';
            await guardarConversacionActual();
            
            document.getElementById('chat-avatar').textContent = chatState.lawyer.avatar;
            document.getElementById('chat-who').textContent = chatState.lawyer.nombre;
            document.getElementById('chat-status').textContent = `● En línea · ${chatState.lawyer.especialidad}`;
            document.getElementById('chat-assign-badge').style.display = 'block';
            
            addBubble('system', `✅ **Abogado asignado**\n\n📋 **Nombre:** ${chatState.lawyer.nombre}\n⚖️ **Especialidad:** ${chatState.lawyer.especialidad}\n\nEl abogado se unirá a la conversación en un momento.`);
            
            await sleep(1000);
            showTyping(chatState.lawyer.nombre);
            await sleep(1500);
            hideTyping();
            
            const saludoAbogado = `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}, abogado especialista en ${chatState.lawyer.especialidad}. He revisado la información que compartió con el asistente.\n\nAhora quedo a su disposición. Cuénteme con más detalle su situación.\n\n📌 **Nota:** Si necesita subir documentos, dígame "no tengo documentos" y generaré la solicitud en su dashboard.`;
            
            addBubble('bot', saludoAbogado, chatState.lawyer.avatar);
            
            // Crear un caso automáticamente al asignar abogado
            const user = window.db?.obtenerUsuarioActual();
            if (user) {
                const titulo = `Caso de ${chatState.selectedArea.nombre} - ${new Date().toLocaleDateString()}`;
                await window.db.casos.crear(user.email, user.nombre + ' ' + user.apellido, titulo, chatState.history.map(m => m.content).join(' ').substring(0, 200), chatState.selectedArea.nombre);
                console.log('✅ Caso creado automáticamente');
            }
            
        } else if (respuesta === 'no') {
            addBubble('bot', `Comprendo. Si en algún momento desea recibir asesoría legal, no dude en contactarnos.\n\n**¿Hay algo más en lo que pueda ayudarle?**`);
        } else {
            addBubble('bot', `Por favor, responda **"sí"** si desea que le asigne un abogado, o **"no"** si prefiere continuar.\n\n**¿Desea que le asigne un abogado?** *(sí / no)*`);
        }
        return;
    }
    
    if (chatState.phase === 'assigned' && chatState.lawyer) {
        showTyping(chatState.lawyer.nombre);
        await sleep(2000);
        hideTyping();
        
        const respuesta = generarRespuestaInteligente(text, chatState.selectedArea);
        addBubble('bot', respuesta, chatState.lawyer.avatar);
        
        chatState.history.push({ role: 'assistant', content: respuesta });
        await guardarConversacionActual();
    }
}

// Funciones auxiliares UI
function addBubble(type, html, avatar) {
    const container = document.getElementById('chat-messages');
    const wrap = document.createElement('div');

    if (type === 'system') {
        wrap.style.cssText = 'align-self:center;max-width:90%;text-align:center;margin:0.5rem 0;';
        wrap.innerHTML = `<div class="bubble system" style="background:transparent;border:1px dashed var(--gold-border);color:var(--text-muted);font-size:.78rem;font-style:italic;padding:.5rem;border-radius:2px;">${html}</div>`;
    } else {
        wrap.className = `chat-bubble-wrap ${type}`;
        const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        const ava = type === 'user'
            ? `<div class="bubble-avatar">${(chatState.userName || 'U')[0].toUpperCase()}</div>`
            : `<div class="bubble-avatar">${avatar || '🤖'}</div>`;
        wrap.innerHTML = `${ava}<div><div class="bubble ${type}" style="white-space: pre-line;">${html}</div><div class="bubble-time">${now}</div></div>`;
    }

    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
}

function showTyping(name) {
    chatState.typing = true;
    document.getElementById('chat-typing').style.display = 'block';
    document.getElementById('chat-typing').textContent = `${name || 'Abogado'} está escribiendo…`;
}

function hideTyping() {
    chatState.typing = false;
    document.getElementById('chat-typing').style.display = 'none';
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

console.log('✅ [chat.js] Cargado correctamente');
