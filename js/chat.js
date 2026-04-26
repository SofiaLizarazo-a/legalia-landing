// ============================================
// LEGALIA - CHAT PROFESIONAL CON INSTRUCCIONES CLARAS
// Cada pregunta indica al usuario QUÉ responder
// ============================================

const chatState = {
  phase: 'initial',      // 'initial' -> 'asking_questions' -> 'offering_lawyer' -> 'assigned'
  step: 0,
  lawyer: null,
  history: [],
  typing: false,
  userName: '',
  selectedArea: null,
};

const AREAS_LEGALES = [
  { id: 'civil', nombre: 'Derecho Civil', keywords: ['civil', 'contrato', 'deuda', 'arriendo', 'vecino'], abogado: { nombre: 'Dr. Andrés Morales', avatar: '⚖️', especialidad: 'Derecho Civil' } },
  { id: 'penal', nombre: 'Derecho Penal', keywords: ['penal', 'delito', 'robo', 'hurto', 'denuncia', 'fiscalía'], abogado: { nombre: 'Dr. Felipe Soto', avatar: '🧑‍⚖️', especialidad: 'Derecho Penal' } },
  { id: 'laboral', nombre: 'Derecho Laboral', keywords: ['laboral', 'despido', 'trabajo', 'empresa', 'salario', 'contrato laboral'], abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Derecho Laboral' } },
  { id: 'familia', nombre: 'Derecho de Familia', keywords: ['familia', 'divorcio', 'custodia', 'alimentos', 'separación', 'hijos'], abogado: { nombre: 'Dra. Valeria Cruz', avatar: '👩‍⚖️', especialidad: 'Derecho de Familia' } },
  { id: 'comercial', nombre: 'Derecho Comercial', keywords: ['comercial', 'empresa', 'sociedad', 'proveedor', 'contrato comercial'], abogado: { nombre: 'Dr. Ricardo Méndez', avatar: '⚖️', especialidad: 'Derecho Comercial' } },
  { id: 'administrativo', nombre: 'Derecho Administrativo', keywords: ['administrativo', 'estado', 'contrato estatal', 'licencia', 'multa'], abogado: { nombre: 'Dr. Sergio Torres', avatar: '🧑‍⚖️', especialidad: 'Derecho Administrativo' } },
];

// Preguntas profesionales con instrucciones claras de respuesta
const PREGUNTAS_PROFESIONALES = [
  { pregunta: "¿Podría describir brevemente cuál es su situación legal?", instruccion: "**Responda:** explique su caso con sus propias palabras." },
  { pregunta: "¿Desde cuándo ocurrió este hecho?", instruccion: "**Responda:** indique una fecha o período aproximado (ej: 'hace 2 meses', 'en enero de 2025')." },
  { pregunta: "¿Cuenta con algún documento o prueba relacionada?", instruccion: "**Responda:** sí o no. Si tiene documentos, mencione cuáles (contrato, correos, facturas, fotos, etc.)." },
  { pregunta: "¿Ha buscado asesoría legal previamente sobre este caso?", instruccion: "**Responda:** sí o no. Si es sí, indique con quién y qué le dijeron." },
  { pregunta: "¿Cuál es su objetivo principal con este proceso legal?", instruccion: "**Responda:** explique qué espera lograr (ej: 'que me paguen una deuda', 'obtener la custodia', 'que me reinstalen en mi trabajo')." }
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
  chatState.userName = (window._currentUser || {}).name || 'Cliente';

  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-assign-badge').style.display = 'none';
  document.getElementById('chat-avatar').textContent = '🤖';
  document.getElementById('chat-who').textContent = 'Asistente Legal Legalia';
  document.getElementById('chat-status').textContent = '● En línea · Consulta inicial';

  setTimeout(() => {
    addBubble('bot', `Buenos días/tardes, ${chatState.userName}. Soy el asistente de **Legalia**, plataforma de gestión legal.\n\nPara poder orientarle de la mejor manera y asignarle el abogado más adecuado, necesito hacerle algunas preguntas.\n\n**¿Podría indicarme cuál es el área legal de su caso?**\n\n${generarListaAreas()}\n\n*(Responda con el nombre del área, ej: "Derecho Laboral" o "Penal")*`);
  }, 400);
}

function generarListaAreas() {
  let lista = "";
  AREAS_LEGALES.forEach(area => {
    lista += `• **${area.nombre}**\n`;
  });
  return lista;
}

function identificarArea(texto) {
  const textoLower = texto.toLowerCase();
  for (const area of AREAS_LEGALES) {
    for (const keyword of area.keywords) {
      if (textoLower.includes(keyword)) {
        return area;
      }
    }
  }
  return null;
}

function closeChat() {
  document.getElementById('chatOverlay').style.display = 'none';
  document.body.style.overflow = 'hidden';
}

async function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || chatState.typing) return;

  input.value = '';
  input.style.height = 'auto';

  addBubble('user', text);
  chatState.history.push({ role: 'user', content: text });

  // ========================================
  // CASO 1: Identificando el área legal
  // ========================================
  if (chatState.phase === 'initial') {
    const areaEncontrada = identificarArea(text);
    
    if (areaEncontrada) {
      chatState.selectedArea = areaEncontrada;
      chatState.phase = 'asking_questions';
      chatState.step = 0;
      
      const primeraPregunta = PREGUNTAS_PROFESIONALES[0];
      addBubble('bot', `Gracias por indicarme que su caso es de **${areaEncontrada.nombre}**. Para poder asignarle el abogado más adecuado, voy a hacerle algunas preguntas.\n\n**${primeraPregunta.pregunta}**\n\n${primeraPregunta.instruccion}`);
      return;
    } else {
      addBubble('bot', `No logré identificar el área legal. Por favor, indíqueme cuál es el área de su caso:\n\n${generarListaAreas()}\n\n*(Responda con el nombre del área, ej: "Derecho Laboral" o "Penal")*`);
      return;
    }
  }
  
  // ========================================
  // CASO 2: Haciendo preguntas profesionales
  // ========================================
  if (chatState.phase === 'asking_questions') {
    chatState.step++;
    
    if (chatState.step < PREGUNTAS_PROFESIONALES.length) {
      const siguientePregunta = PREGUNTAS_PROFESIONALES[chatState.step];
      addBubble('bot', `**${siguientePregunta.pregunta}**\n\n${siguientePregunta.instruccion}`);
    } else {
      // Terminaron las preguntas, ofrecer abogado
      chatState.phase = 'offering_lawyer';
      addBubble('bot', `Muchas gracias por compartir esta información, ${chatState.userName}. Con base en lo que me ha comentado, puedo asignarle un abogado especializado en **${chatState.selectedArea.nombre}**.\n\n**¿Desea que le asigne un abogado ahora mismo?**\n\n*(Responda "sí" o "no")*`);
    }
    return;
  }
  
  // ========================================
  // CASO 3: Ofreciendo asignar abogado
  // ========================================
  if (chatState.phase === 'offering_lawyer') {
    const respuesta = text.toLowerCase();
    
    if (respuesta === 'si' || respuesta === 'sí' || respuesta === 'yes' || respuesta === 's') {
      chatState.lawyer = chatState.selectedArea.abogado;
      chatState.phase = 'assigned';
      
      document.getElementById('chat-avatar').textContent = chatState.lawyer.avatar;
      document.getElementById('chat-who').textContent = chatState.lawyer.nombre;
      document.getElementById('chat-status').textContent = `● En línea · ${chatState.lawyer.especialidad}`;
      document.getElementById('chat-assign-badge').style.display = 'block';
      
      addBubble('system', `✅ **Abogado asignado**\n\n📋 **Nombre:** ${chatState.lawyer.nombre}\n⚖️ **Especialidad:** ${chatState.lawyer.especialidad}\n\nEl abogado se unirá a la conversación en un momento.`);
      
      await sleep(1000);
      showTyping(chatState.lawyer.nombre);
      await sleep(1500);
      hideTyping();
      
      const saludoAbogado = `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}, abogado especialista en ${chatState.lawyer.especialidad}. He revisado la información que compartió con el asistente.\n\nAhora quedo a su disposición. Por favor, cuénteme con más detalle su situación para poder brindarle la mejor orientación legal.`;
      
      addBubble('bot', saludoAbogado, chatState.lawyer.avatar);
      
    } else if (respuesta === 'no') {
      addBubble('bot', `Comprendo. Si en algún momento desea recibir asesoría legal, no dude en contactarnos.\n\n**¿Hay algo más en lo que pueda ayudarle?**\n\n*(Responda "sí" para continuar o "no" para finalizar)*`);
    } else {
      addBubble('bot', `Por favor, responda **"sí"** si desea que le asigne un abogado, o **"no"** si prefiere continuar con el asistente.\n\n**¿Desea que le asigne un abogado?** *(sí / no)*`);
    }
    return;
  }
  
  // ========================================
  // CASO 4: Chat con el abogado asignado
  // ========================================
  if (chatState.phase === 'assigned' && chatState.lawyer) {
    showTyping(chatState.lawyer.nombre);
    await sleep(2000);
    hideTyping();
    
    // Respuestas profesionales del abogado según el área
    const respuestasPorArea = {
      'civil': [
        `Gracias por compartir su caso. Para poder asesorarle mejor, ¿podría indicarme si cuenta con el contrato o algún documento que respalde su situación?`,
        `Entiendo. En materia civil, los plazos de prescripción son importantes. ¿Recuerda cuándo ocurrieron los hechos exactamente?`,
        `¿Ha enviado alguna comunicación formal a la otra parte? (carta, correo, etc.)`
      ],
      'penal': [
        `Comprendo su situación. En materia penal, es fundamental actuar con rapidez. ¿Ha presentado ya alguna denuncia ante la Fiscalía?`,
        `¿Tiene conocimiento de si la otra parte ha contratado un abogado? ¿Le han notificado algo formalmente?`,
        `¿Cuenta con algún testigo o prueba que pueda respaldar su versión de los hechos?`
      ],
      'laboral': [
        `Gracias por contarme. En asuntos laborales, es importante revisar su contrato y liquidación. ¿Podría indicarme cuánto tiempo trabajó en esa empresa?`,
        `¿Le entregaron carta de despido? ¿Cuál fue la causa que le informaron?`,
        `¿Ha intentado conciliar con la empresa ante el Ministerio de Trabajo?`
      ],
      'familia': [
        `Entiendo su situación. En derecho de familia, la mediación es un primer paso importante. ¿Ha intentado llegar a un acuerdo con la otra parte?`,
        `¿Cuenta con los registros civiles de los hijos? ¿Hay algún acuerdo previo de alimentos o visitas?`,
        `¿Ha existido violencia intrafamiliar o necesita medidas de protección?`
      ],
      'comercial': [
        `Gracias por la información. En asuntos comerciales, revisar los contratos es fundamental. ¿Tiene el contrato firmado?`,
        `¿La otra parte ha incumplido algún plazo o cláusula específica? ¿Le ha enviado alguna notificación?`,
        `¿Cuál es el monto aproximado de la controversia?`
      ],
      'administrativo': [
        `Comprendo. En derecho administrativo, los plazos suelen ser perentorios. ¿Recibió alguna notificación oficial?`,
        `¿Ha presentado algún recurso o petición ante la entidad correspondiente?`,
        `¿Tiene conocimiento de si la entidad ya emitió algún acto administrativo?`
      ]
    };
    
    const respuestas = respuestasPorArea[chatState.selectedArea.id] || [
      `Gracias por compartir su caso. ¿Podría darme más detalles para poder orientarle mejor?`,
      `Entiendo. ¿Hay algo más que deba saber sobre su situación?`,
      `Para poder ayudarle, ¿podría especificar qué espera lograr con este proceso legal?`
    ];
    
    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
    addBubble('bot', respuesta, chatState.lawyer.avatar);
  }
}

// Funciones auxiliares
function addBubble(type, html, avatar) {
  const container = document.getElementById('chat-messages');
  const wrap = document.createElement('div');

  if (type === 'system') {
    wrap.style.cssText = 'align-self:center;max-width:90%;text-align:center;';
    wrap.innerHTML = `<div class="bubble system" style="white-space: pre-line;">${html}</div>`;
  } else {
    wrap.className = `chat-bubble-wrap ${type}`;
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const ava = type === 'user'
      ? `<div class="bubble-avatar">${(chatState.userName || 'U')[0].toUpperCase()}</div>`
      : `<div class="bubble-avatar">${avatar || '🤖'}</div>`;
    wrap.innerHTML = `
      ${ava}
      <div>
        <div class="bubble ${type}" style="white-space: pre-line;">${html}</div>
        <div class="bubble-time">${now}</div>
      </div>`;
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
