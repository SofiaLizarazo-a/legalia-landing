// ============================================
// LEGALIA - CHAT PROFESIONAL CON INSTRUCCIONES CLARAS
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
  { id: 'civil', nombre: 'Derecho Civil', keywords: ['civil', 'contrato', 'deuda'], abogado: { nombre: 'Dr. Andrés Morales', avatar: '⚖️', especialidad: 'Derecho Civil' } },
  { id: 'penal', nombre: 'Derecho Penal', keywords: ['penal', 'delito', 'robo'], abogado: { nombre: 'Dr. Felipe Soto', avatar: '🧑‍⚖️', especialidad: 'Derecho Penal' } },
  { id: 'laboral', nombre: 'Derecho Laboral', keywords: ['laboral', 'despido', 'trabajo'], abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Derecho Laboral' } },
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
      addBubble('bot', `Gracias por la información. **¿Desea que le asigne un abogado ahora mismo?**\n\n*(Responda "sí" o "no")*`);
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
      
      addBubble('bot', `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}. Cuénteme los detalles de su caso para poder orientarle.`, chatState.lawyer.avatar);
      
    } else {
      addBubble('bot', `Comprendo. Si necesita asesoría, no dude en contactarnos. ¿Hay algo más en lo que pueda ayudarle?`);
    }
    return;
  }
  
  if (chatState.phase === 'assigned' && chatState.lawyer) {
    showTyping(chatState.lawyer.nombre);
    await sleep(2000);
    hideTyping();
    addBubble('bot', `Gracias por compartir su caso. ¿Podría darme más detalles específicos para poder orientarle mejor?`, chatState.lawyer.avatar);
  }
}

function addBubble(type, html, avatar) {
  const container = document.getElementById('chat-messages');
  const wrap = document.createElement('div');

  if (type === 'system') {
    wrap.style.cssText = 'align-self:center;max-width:90%;text-align:center;';
    wrap.innerHTML = `<div class="bubble system">${html}</div>`;
  } else {
    wrap.className = `chat-bubble-wrap ${type}`;
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const ava = type === 'user'
      ? `<div class="bubble-avatar">${(chatState.userName || 'U')[0].toUpperCase()}</div>`
      : `<div class="bubble-avatar">${avatar || '🤖'}</div>`;
    wrap.innerHTML = `${ava}<div><div class="bubble ${type}">${html}</div><div class="bubble-time">${now}</div></div>`;
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
