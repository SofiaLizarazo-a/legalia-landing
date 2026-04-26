// ============================================
// LEGALIA - CHAT CON SOLICITUD DE DOCUMENTOS
// ============================================

const chatState = {
  phase: 'initial',
  step: 0,
  lawyer: null,
  history: [],
  typing: false,
  userName: '',
  selectedArea: null,
  documentosSolicitados: [], // Documentos pendientes
};

// Almacenar solicitudes de documentos (simulado)
let documentosPendientesGlobal = [];

const AREAS_LEGALES = [
  { id: 'civil', nombre: 'Derecho Civil', keywords: ['civil', 'contrato', 'deuda'], abogado: { nombre: 'Dr. Andrés Morales', avatar: '⚖️', especialidad: 'Derecho Civil' } },
  { id: 'penal', nombre: 'Derecho Penal', keywords: ['penal', 'delito', 'robo'], abogado: { nombre: 'Dr. Felipe Soto', avatar: '🧑‍⚖️', especialidad: 'Derecho Penal' } },
  { id: 'laboral', nombre: 'Derecho Laboral', keywords: ['laboral', 'despido', 'trabajo', 'horas', 'vacaciones'], abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Derecho Laboral' } },
  { id: 'familia', nombre: 'Derecho de Familia', keywords: ['familia', 'divorcio', 'custodia'], abogado: { nombre: 'Dra. Valeria Cruz', avatar: '👩‍⚖️', especialidad: 'Derecho de Familia' } },
];

const PREGUNTAS_PROFESIONALES = [
  { pregunta: "¿Podría describir brevemente cuál es su situación legal?", instruccion: "**Responda:** explique su caso con sus propias palabras." },
  { pregunta: "¿Desde cuándo ocurrió este hecho?", instruccion: "**Responda:** indique una fecha o período aproximado." },
  { pregunta: "¿Cuenta con algún documento o prueba relacionada?", instruccion: "**Responda:** sí o no. Si tiene documentos, mencione cuáles." },
  { pregunta: "¿Ha buscado asesoría legal previamente?", instruccion: "**Responda:** sí o no. Si es sí, indique con quién." },
  { pregunta: "¿Cuál es su objetivo principal?", instruccion: "**Responda:** explique qué espera lograr." }
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
  chatState.documentosSolicitados = [];
  chatState.userName = (window._currentUser || {}).name || 'Cliente';

  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-assign-badge').style.display = 'none';
  document.getElementById('chat-avatar').textContent = '🤖';
  document.getElementById('chat-who').textContent = 'Asistente Legal Legalia';
  document.getElementById('chat-status').textContent = '● En línea · Consulta inicial';

  setTimeout(() => {
    addBubble('bot', `Buenos días/tardes, ${chatState.userName}. Soy el asistente de **Legalia**.\n\n**¿Podría indicarme cuál es el área legal de su caso?**\n\n• Derecho Civil\n• Derecho Penal\n• Derecho Laboral\n• Derecho de Familia\n\n*(Responda con el nombre del área, ej: "Derecho Laboral")*`);
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

function solicitarDocumento(nombreDoc, descripcion) {
  const nuevoDoc = {
    id: Date.now(),
    nombre: nombreDoc,
    descripcion: descripcion,
    estado: 'pendiente',
    fecha: new Date().toLocaleString(),
    area: chatState.selectedArea?.nombre || 'General'
  };
  documentosPendientesGlobal.push(nuevoDoc);
  chatState.documentosSolicitados.push(nuevoDoc);
  
  // Actualizar el dashboard si está abierto
  actualizarPanelDocumentos();
  
  return nuevoDoc;
}

function actualizarPanelDocumentos() {
  // Buscar el dashboard abierto y actualizarlo
  const dashGrid = document.getElementById('dash-grid');
  if (dashGrid && documentosPendientesGlobal.length > 0) {
    // Agregar sección de documentos al dashboard
    const docSection = document.getElementById('documentos-pendientes-section');
    if (!docSection) {
      const section = document.createElement('div');
      section.id = 'documentos-pendientes-section';
      section.innerHTML = `<div style="margin-top: 2rem;"><div class="section-tag" style="margin-bottom: 1rem;">📄 Documentos pendientes</div><div id="lista-documentos"></div></div>`;
      dashGrid.parentElement?.appendChild(section);
    }
    const lista = document.getElementById('lista-documentos');
    if (lista) {
      lista.innerHTML = documentosPendientesGlobal.map(doc => `
        <div class="doc-item">
          <div class="doc-info">
            <div class="doc-nombre">📄 ${doc.nombre}</div>
            <div class="doc-descripcion">${doc.descripcion}</div>
            <div class="doc-badge">${doc.area} · Solicitado: ${doc.fecha}</div>
          </div>
          <button class="doc-btn" onclick="abrirSubirDocumento(${doc.id})">Subir documento</button>
        </div>
      `).join('');
    }
  }
}

function abrirSubirDocumento(docId) {
  const documento = documentosPendientesGlobal.find(d => d.id === docId);
  if (!documento) return;
  
  // Simular subida de archivo
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx,.jpg,.png';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      documento.estado = 'subido';
      documento.archivo = file.name;
      documento.fechaSubida = new Date().toLocaleString();
      
      // Notificar al abogado en el chat si está abierto
      if (chatState.phase === 'assigned' && chatState.lawyer) {
        addBubble('system', `📎 **Documento subido:** ${documento.nombre}\n📄 Archivo: ${file.name}\n🕒 Fecha: ${documento.fechaSubida}\n\nEl abogado ha sido notificado.`);
      }
      
      actualizarPanelDocumentos();
      alert(`Documento "${documento.nombre}" subido correctamente.`);
    }
  };
  input.click();
}

function generarRespuestaInteligente(mensaje, area) {
  const msg = mensaje.toLowerCase();
  
  // Detectar si el usuario NO tiene documentos
  if ((msg.includes('no tengo') || msg.includes('no cuento') || msg.includes('me falta') || msg.includes('sin documento')) && 
      (msg.includes('documento') || msg.includes('papel') || msg.includes('prueba'))) {
    
    // Generar solicitud de documentos según el área
    let docsSolicitados = [];
    if (area?.id === 'laboral') {
      docsSolicitados = [
        { nombre: 'Contrato laboral', descripcion: 'Contrato de trabajo firmado donde consten las condiciones laborales' },
        { nombre: 'Horarios de trabajo', descripcion: 'Registro de horarios o cronograma laboral' },
        { nombre: 'Comunicaciones con la empresa', descripcion: 'Correos, cartas o mensajes con los directivos' },
        { nombre: 'Pago de nómina', descripcion: 'Últimos 6 meses de comprobantes de pago' }
      ];
    } else if (area?.id === 'civil') {
      docsSolicitados = [
        { nombre: 'Contrato o acuerdo', descripcion: 'Documento firmado donde conste el acuerdo' },
        { nombre: 'Correspondencia', descripción: 'Correos o mensajes relacionados con el caso' },
        { nombre: 'Facturas o comprobantes', descripcion: 'Documentos que acrediten pagos o deudas' }
      ];
    } else {
      docsSolicitados = [
        { nombre: 'Documentación relevante', descripcion: 'Cualquier documento relacionado con su caso' }
      ];
    }
    
    // Crear las solicitudes de documentos
    docsSolicitados.forEach(doc => {
      solicitarDocumento(doc.nombre, doc.descripcion);
    });
    
    let listaDocs = '';
    docsSolicitados.forEach(doc => {
      listaDocs += `• **${doc.nombre}**: ${doc.descripcion}\n`;
    });
    
    return `Entiendo que no cuenta con todos los documentos necesarios. Para poder ayudarle mejor, he generado una **solicitud de documentos** que aparecerá en su panel de **"Documentos pendientes"** dentro del dashboard.\n\n**Documentos solicitados:**\n${listaDocs}\n\nPor favor, suba los documentos que tenga disponibles desde el panel. Cuando los suba, yo podré revisarlos y darle una mejor orientación.\n\n¿Podrá subir alguno de estos documentos?`;
  }
  
  // Resto de respuestas inteligentes...
  if (msg.includes('hora') || msg.includes('horas') || msg.includes('jornada') || msg.includes('42')) {
    return "En Colombia, la jornada laboral máxima es de 48 horas a la semana (8 horas diarias). Si trabaja más de 48 horas sin pago de horas extras, eso es ilegal. ¿Podría indicarme cuántas horas trabaja exactamente? ¿Le pagan las horas extras?";
  }
  
  if (msg.includes('vacaciones') || msg.includes('día de la familia')) {
    return "El 'Día de la Familia' no es un día festivo obligatorio por ley. Sin embargo, si trabaja más de 48 horas semanales, tiene derecho al pago de horas extras. ¿Podría decirme cuántas horas trabaja a la semana y si esto está en su contrato?";
  }
  
  if (msg.includes('directivos') || msg.includes('empresa')) {
    return "Le sugiero enviar una comunicación formal por escrito a Recursos Humanos. ¿Le gustaría que le ayude a redactar un modelo de carta o correo?";
  }
  
  if (msg.includes('subí') || msg.includes('documento') && (msg.includes('subi') || msg.includes('adjunté'))) {
    return "✅ ¡Gracias por subir el documento! Lo revisaré para poder orientarle mejor. ¿Necesita alguna aclaración adicional mientras tanto?";
  }
  
  return `Gracias por compartir su caso. Para poder orientarle mejor, ¿podría indicarme si tiene documentos como contrato, correos o comprobantes? Si no los tiene, puedo solicitarle los específicos que necesita.`;
}

async function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || chatState.typing) return;

  input.value = '';
  input.style.height = 'auto';

  addBubble('user', text);
  chatState.history.push({ role: 'user', content: text });

  if (chatState.phase === 'initial') {
    const areaEncontrada = identificarArea(text);
    if (areaEncontrada) {
      chatState.selectedArea = areaEncontrada;
      chatState.phase = 'asking_questions';
      chatState.step = 0;
      addBubble('bot', `Gracias. Su caso es de **${areaEncontrada.nombre}**. Para asignarle el mejor abogado, necesito hacerle unas preguntas.\n\n**${PREGUNTAS_PROFESIONALES[0].pregunta}**\n\n${PREGUNTAS_PROFESIONALES[0].instruccion}`);
      return;
    } else {
      addBubble('bot', `No logré identificar el área. Por favor, indíqueme cuál es:\n\n• Derecho Civil\n• Derecho Penal\n• Derecho Laboral\n• Derecho de Familia`);
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
      addBubble('bot', `Gracias por toda la información. **¿Desea que le asigne un abogado ahora mismo?**\n\n*(Responda "sí" o "no")*`);
    }
    return;
  }
  
  if (chatState.phase === 'offering_lawyer') {
    const respuesta = text.toLowerCase();
    if (respuesta === 'si' || respuesta === 'sí') {
      chatState.lawyer = chatState.selectedArea.abogado;
      chatState.phase = 'assigned';
      
      document.getElementById('chat-avatar').textContent = chatState.lawyer.avatar;
      document.getElementById('chat-who').textContent = chatState.lawyer.nombre;
      document.getElementById('chat-status').textContent = `● En línea · ${chatState.lawyer.especialidad}`;
      document.getElementById('chat-assign-badge').style.display = 'block';
      
      addBubble('system', `✅ **Abogado asignado:** ${chatState.lawyer.nombre} - ${chatState.lawyer.especialidad}`);
      
      await sleep(1000);
      showTyping(chatState.lawyer.nombre);
      await sleep(1500);
      hideTyping();
      
      addBubble('bot', `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}. He revisado la información que compartió con el asistente.\n\nCuénteme con más detalle su situación. Si le faltan documentos, puedo solicitarle los específicos que necesita.`, chatState.lawyer.avatar);
      
    } else {
      addBubble('bot', `Comprendo. Si necesita asesoría, no dude en contactarnos. ¿Hay algo más en lo que pueda ayudarle?`);
    }
    return;
  }
  
  if (chatState.phase === 'assigned' && chatState.lawyer) {
    showTyping(chatState.lawyer.nombre);
    await sleep(2000);
    hideTyping();
    
    const respuesta = generarRespuestaInteligente(text, chatState.selectedArea);
    addBubble('bot', respuesta, chatState.lawyer.avatar);
  }
}

// Funciones auxiliares UI
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
