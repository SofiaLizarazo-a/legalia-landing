// ============================================
// LEGALIA - CHAT PROFESIONAL CON SOLICITUD DE DOCUMENTOS
// ============================================

const chatState = {
  phase: 'initial',
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
  { id: 'laboral', nombre: 'Derecho Laboral', keywords: ['laboral', 'despido', 'trabajo', 'empresa', 'salario', 'horas', 'vacaciones', 'directivos'], abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Derecho Laboral' } },
  { id: 'familia', nombre: 'Derecho de Familia', keywords: ['familia', 'divorcio', 'custodia', 'alimentos', 'separación'], abogado: { nombre: 'Dra. Valeria Cruz', avatar: '👩‍⚖️', especialidad: 'Derecho de Familia' } },
  { id: 'comercial', nombre: 'Derecho Comercial', keywords: ['comercial', 'empresa', 'sociedad', 'proveedor'], abogado: { nombre: 'Dr. Ricardo Méndez', avatar: '⚖️', especialidad: 'Derecho Comercial' } },
  { id: 'administrativo', nombre: 'Derecho Administrativo', keywords: ['administrativo', 'estado', 'licencia', 'multa'], abogado: { nombre: 'Dr. Sergio Torres', avatar: '🧑‍⚖️', especialidad: 'Derecho Administrativo' } },
];

const PREGUNTAS_PROFESIONALES = [
  { pregunta: "¿Podría describir brevemente cuál es su situación legal?", instruccion: "**Responda:** explique su caso con sus propias palabras." },
  { pregunta: "¿Desde cuándo ocurrió este hecho?", instruccion: "**Responda:** indique una fecha o período aproximado (ej: 'hace 2 meses', 'en enero de 2025')." },
  { pregunta: "¿Cuenta con algún documento o prueba relacionada?", instruccion: "**Responda:** sí o no. Si tiene documentos, mencione cuáles (contrato, correos, facturas, etc.)." },
  { pregunta: "¿Ha buscado asesoría legal previamente sobre este caso?", instruccion: "**Responda:** sí o no. Si es sí, indique con quién y qué le dijeron." },
  { pregunta: "¿Cuál es su objetivo principal con este proceso legal?", instruccion: "**Responda:** explique qué espera lograr (ej: 'que me paguen una deuda', 'obtener la custodia')." }
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
    addBubble('bot', `Buenos días/tardes, ${chatState.userName}. Soy el asistente de **Legalia**.\n\n**¿Podría indicarme cuál es el área legal de su caso?**\n\n• Derecho Civil\n• Derecho Penal\n• Derecho Laboral\n• Derecho de Familia\n• Derecho Comercial\n• Derecho Administrativo\n\n*(Responda con el nombre del área, ej: "Derecho Laboral")*`);
  }, 400);
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

// Función para generar respuestas inteligentes del abogado según el mensaje del usuario
function generarRespuestaInteligente(mensaje, area) {
  const msg = mensaje.toLowerCase();
  
  // ========================================
  // DETECTAR SI EL USUARIO NO TIENE DOCUMENTOS
  // ========================================
  if ((msg.includes('no tengo') || msg.includes('no cuento') || msg.includes('me falta') || msg.includes('sin documento') || msg.includes('no hay') || msg.includes('carezco')) && 
      (msg.includes('documento') || msg.includes('papel') || msg.includes('prueba') || msg.includes('evidencia'))) {
    
    // Generar solicitud de documentos según el área
    let docsSolicitados = [];
    if (area?.id === 'laboral') {
      docsSolicitados = [
        { nombre: 'Contrato laboral', descripcion: 'Contrato de trabajo firmado donde consten las condiciones laborales' },
        { nombre: 'Horarios de trabajo', descripcion: 'Registro de horarios o cronograma laboral' },
        { nombre: 'Comunicaciones con la empresa', descripcion: 'Correos, cartas o mensajes con los directivos' },
        { nombre: 'Pagos de nómina', descripcion: 'Últimos 6 meses de comprobantes de pago o desprendibles' }
      ];
    } else if (area?.id === 'civil') {
      docsSolicitados = [
        { nombre: 'Contrato o acuerdo', descripcion: 'Documento firmado donde conste el acuerdo entre las partes' },
        { nombre: 'Correspondencia', descripcion: 'Correos o mensajes relacionados con el caso' },
        { nombre: 'Facturas o comprobantes', descripcion: 'Documentos que acrediten pagos o deudas' }
      ];
    } else if (area?.id === 'penal') {
      docsSolicitados = [
        { nombre: 'Denuncia o reporte', descripcion: 'Copia de la denuncia presentada ante autoridades' },
        { nombre: 'Pruebas', descripcion: 'Fotografías, videos o documentos que respalden su versión' },
        { nombre: 'Notificaciones', descripcion: 'Citaciones o notificaciones de autoridades' }
      ];
    } else if (area?.id === 'familia') {
      docsSolicitados = [
        { nombre: 'Registros civiles', descripcion: 'Registros de nacimiento o matrimonio' },
        { nombre: 'Acuerdos previos', descripcion: 'Acuerdos de alimentos o custodia existentes' },
        { nombre: 'Pruebas de ingresos', descripcion: 'Certificados laborales o declaración de renta' }
      ];
    } else {
      docsSolicitados = [
        { nombre: 'Documentación relevante', descripcion: 'Cualquier documento relacionado con su caso' }
      ];
    }
    
    // Crear las solicitudes de documentos usando la función global del dashboard
    let listaDocs = '';
    docsSolicitados.forEach(doc => {
      if (window.agregarDocumentoPendiente) {
        window.agregarDocumentoPendiente(doc.nombre, doc.descripcion, area?.nombre || 'General');
      }
      listaDocs += `• **${doc.nombre}**: ${doc.descripcion}\n`;
    });
    
    // Actualizar la lista de documentos pendientes si el dashboard está abierto
    if (window.actualizarListaDocumentos) {
      window.actualizarListaDocumentos();
    }
    
    return `Entiendo que no cuenta con todos los documentos necesarios. 📋\n\nPara poder ayudarle mejor, he **generado una solicitud de documentos** que aparecerá en su **panel de "Documentos pendientes"** dentro del dashboard.\n\n**Documentos solicitados:**\n${listaDocs}\n\nPor favor, ingrese al dashboard y suba los documentos que tenga disponibles desde la sección **"Documentos pendientes"**. Cuando los suba, yo podré revisarlos y darle una mejor orientación.\n\n**📌 Nota:** Si tiene algunos de estos documentos ahora mismo, puede mencionármelos para ir analizando su caso.`;
  }
  
  // ========================================
  // RESPUESTAS INTELIGENTES POR CONTEXTO
  // ========================================
  if (msg.includes('hora') || msg.includes('horas') || msg.includes('jornada') || msg.includes('42') || msg.includes('48')) {
    return "En Colombia, la jornada laboral máxima es de **48 horas a la semana** (8 horas diarias). Si trabaja más de 48 horas sin pago de horas extras, eso es **ilegal** según el Código Sustantivo del Trabajo.\n\n¿Podría indicarme cuántas horas trabaja exactamente a la semana? ¿Le pagan las horas extras que trabaja?";
  }
  
  if (msg.includes('vacaciones') || msg.includes('día de la familia')) {
    return "El 'Día de la Familia' **no es un día festivo obligatorio por ley** en Colombia. Las empresas pueden otorgarlo voluntariamente.\n\nSin embargo, si usted trabaja más de 48 horas semanales, tiene derecho al **pago de horas extras**. ¿Podría decirme cuántas horas trabaja a la semana? ¿Esto está estipulado en su contrato?";
  }
  
  if (msg.includes('directivos') || msg.includes('empresa') || msg.includes('respuesta') || msg.includes('evadiendo')) {
    return "Lamento que no le estén dando una respuesta clara. 📌 **Le recomiendo:**\n\n1️⃣ Envíe una **comunicación formal por escrito** (carta o correo) a Recursos Humanos solicitando una explicación.\n2️⃣ Guarde copia de **todas las comunicaciones**.\n3️⃣ Si no hay respuesta, puede acudir al **Ministerio del Trabajo**.\n\n¿Le gustaría que le ayude a **redactar un modelo de carta o correo** para enviar a la empresa?";
  }
  
  if (msg.includes('subí') || (msg.includes('documento') && (msg.includes('subi') || msg.includes('adjunté') || msg.includes('cargue')))) {
    return "✅ **¡Excelente!** Gracias por subir el documento. Ya puedo verlo en mi sistema.\n\nLo revisaré con detenimiento para poder orientarle mejor. ¿Necesita alguna aclaración adicional mientras tanto o hay algo más que quiera contarme sobre su caso?";
  }
  
  if (msg.includes('carta') || msg.includes('modelo') || msg.includes('redactar')) {
    return "📝 **Modelo de comunicación formal:**\n\n*"Estimado departamento de Recursos Humanos:\n\nPor medio de la presente, solicito comedidamente una explicación formal sobre [describa su situación específica].\n\nAgradezco su pronta respuesta.*\n\n¿Le parece bien este modelo? ¿Necesita que lo ajuste para su situación específica?";
  }
  
  if (msg.includes('gracias') || msg.includes('vale') || msg.includes('ok') || msg.includes('perfecto')) {
    return "¡De nada! Estoy aquí para ayudarle. 🤝\n\nSi en algún momento necesita más orientación o tiene nuevos documentos para mostrar, no dude en contactarme. ¿Hay algo más en lo que pueda ayudarle?";
  }
  
  // ========================================
  // RESPUESTA POR DEFECTO
  // ========================================
  return `Gracias por compartir su caso, ${chatState.userName}. 📋\n\nPara poder orientarle mejor, ¿podría indicarme si tiene documentos como contrato, correos o comprobantes?\n\n**Si no tiene algunos documentos**, puedo solicitarle los específicos que necesita para su caso desde el dashboard. Solo dígame "no tengo documentos" y generaré la solicitud.\n\n¿Qué información adicional puede darme sobre su situación?`;
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
      
      addBubble('bot', `Gracias por indicarme que su caso es de **${areaEncontrada.nombre}**. Para poder asignarle el abogado más adecuado, voy a hacerle algunas preguntas.\n\n**${PREGUNTAS_PROFESIONALES[0].pregunta}**\n\n${PREGUNTAS_PROFESIONALES[0].instruccion}`);
      return;
    } else {
      addBubble('bot', `No logré identificar el área legal. Por favor, indíqueme cuál es:\n\n• Derecho Civil\n• Derecho Penal\n• Derecho Laboral\n• Derecho de Familia\n\n*(Responda con el nombre del área, ej: "Derecho Laboral")*`);
      return;
    }
  }
  
  // ========================================
  // CASO 2: Haciendo preguntas profesionales
  // ========================================
  if (chatState.phase === 'asking_questions') {
    chatState.step++;
    
    if (chatState.step < PREGUNTAS_PROFESIONALES.length) {
      const p = PREGUNTAS_PROFESIONALES[chatState.step];
      addBubble('bot', `**${p.pregunta}**\n\n${p.instruccion}`);
    } else {
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
    
    if (respuesta === 'si' || respuesta === 'sí' || respuesta === 'yes') {
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
      
      const saludoAbogado = `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}, abogado especialista en ${chatState.lawyer.especialidad}. He revisado la información que compartió con el asistente.\n\nAhora quedo a su disposición. Cuénteme con más detalle su situación para poder brindarle la mejor orientación legal.\n\n📌 **Nota:** Si necesita subir documentos, puedo solicitarle los específicos solo dígame "no tengo documentos" y generaré la solicitud en su dashboard.`;
      
      addBubble('bot', saludoAbogado, chatState.lawyer.avatar);
      
    } else if (respuesta === 'no') {
      addBubble('bot', `Comprendo. Si en algún momento desea recibir asesoría legal, no dude en contactarnos.\n\n**¿Hay algo más en lo que pueda ayudarle?**\n\n*(Responda "sí" para continuar o "no" para finalizar)*`);
    } else {
      addBubble('bot', `Por favor, responda **"sí"** si desea que le asigne un abogado, o **"no"** si prefiere continuar con el asistente.\n\n**¿Desea que le asigne un abogado?** *(sí / no)*`);
    }
    return;
  }
  
  // ========================================
  // CASO 4: Chat INTELIGENTE con el abogado
  // ========================================
  if (chatState.phase === 'assigned' && chatState.lawyer) {
    showTyping(chatState.lawyer.nombre);
    await sleep(2000);
    hideTyping();
    
    const respuesta = generarRespuestaInteligente(text, chatState.selectedArea);
    addBubble('bot', respuesta, chatState.lawyer.avatar);
  }
}

// ========================================
// FUNCIONES AUXILIARES UI
// ========================================

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
