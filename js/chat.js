// ============================================
// LEGALIA - MÓDULO DE CHAT CORREGIDO
// Primero: opciones numeradas
// Luego: chat con abogado asignado
// ============================================

const chatState = {
  phase: 'menu',        // 'menu' = mostrando opciones, 'assigned' = con abogado
  lawyer: null,
  history: [],
  typing: false,
  userName: '',
  selectedArea: null,
};

const AREAS_LEGALES = [
  { numero: 1, nombre: 'Derecho Civil', abogado: { nombre: 'Dr. Andrés Morales', avatar: '⚖️', especialidad: 'Civil (contratos, deudas, responsabilidad civil)' } },
  { numero: 2, nombre: 'Derecho Penal', abogado: { nombre: 'Dr. Felipe Soto', avatar: '🧑‍⚖️', especialidad: 'Penal (delitos, defensa penal)' } },
  { numero: 3, nombre: 'Derecho Laboral', abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Laboral (despidos, liquidaciones, acoso laboral)' } },
  { numero: 4, nombre: 'Derecho de Familia', abogado: { nombre: 'Dra. Valeria Cruz', avatar: '👩‍⚖️', especialidad: 'Familia (divorcios, custodia, alimentos)' } },
  { numero: 5, nombre: 'Derecho Comercial', abogado: { nombre: 'Dr. Ricardo Méndez', avatar: '⚖️', especialidad: 'Comercial (contratos empresariales, sociedades)' } },
  { numero: 6, nombre: 'Derecho Administrativo', abogado: { nombre: 'Dr. Sergio Torres', avatar: '🧑‍⚖️', especialidad: 'Administrativo (contratos estatales, licencias)' } },
];

function openChat() {
  const overlay = document.getElementById('chatOverlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Reiniciar estado
  chatState.phase = 'menu';
  chatState.lawyer = null;
  chatState.history = [];
  chatState.selectedArea = null;
  chatState.userName = (window._currentUser || {}).name || 'Cliente';

  // Limpiar UI
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-assign-badge').style.display = 'none';
  document.getElementById('chat-avatar').textContent = '🤖';
  document.getElementById('chat-who').textContent = 'Asistente Legal Legalia';
  document.getElementById('chat-status').textContent = '● En línea · Selecciona un área';

  // Mensaje de bienvenida con opciones numeradas
  setTimeout(() => {
    let menuTexto = `Hola ${chatState.userName} 👋, soy el asistente legal de <strong>Legalia</strong>.\n\n`;
    menuTexto += `Por favor, **selecciona el área legal** que necesitas escribiendo el **número** correspondiente:\n\n`;
    AREAS_LEGALES.forEach(area => {
      menuTexto += `<strong>${area.numero}.</strong> ${area.nombre}\n`;
    });
    menuTexto += `\n*(Ejemplo: responde "2" si necesitas Derecho Penal)*`;
    
    addBubble('bot', menuTexto);
    chatState.phase = 'waiting_for_number';
  }, 400);
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
  // CASO 1: Esperando que el usuario elija un número
  // ========================================
  if (chatState.phase === 'waiting_for_number') {
    const numero = parseInt(text);
    const areaSeleccionada = AREAS_LEGALES.find(a => a.numero === numero);
    
    if (!areaSeleccionada) {
      addBubble('bot', `❌ Por favor, responde con un **número válido** del 1 al ${AREAS_LEGALES.length}.\n\n${generarMenuNumeros()}`);
      return;
    }

    // Usuario eligió un área válida
    chatState.selectedArea = areaSeleccionada;
    chatState.lawyer = areaSeleccionada.abogado;
    chatState.phase = 'assigned';
    
    // Actualizar UI del chat
    document.getElementById('chat-avatar').textContent = chatState.lawyer.avatar;
    document.getElementById('chat-who').textContent = chatState.lawyer.nombre;
    document.getElementById('chat-status').textContent = `● En línea · ${chatState.lawyer.especialidad}`;
    document.getElementById('chat-assign-badge').style.display = 'block';
    
    // Mensaje de confirmación
    addBubble('system', `✅ Has seleccionado **${areaSeleccionada.nombre}**\n\n📋 Te ha sido asignado: **${chatState.lawyer.nombre}** (${chatState.lawyer.especialidad})`);
    
    await sleep(1000);
    
    // El abogado saluda y pide los detalles del caso
    showTyping(chatState.lawyer.nombre);
    await sleep(1500);
    hideTyping();
    
    const saludoAbogado = `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}, tu abogado especialista en ${chatState.lawyer.especialidad}. 👋\n\nPara poder ayudarte mejor, cuéntame brevemente los **detalles de tu caso**:\n- ¿Desde cuándo ocurrió?\n- ¿Hay documentación relevante?\n- ¿Cuál es tu objetivo principal?`;
    
    addBubble('bot', saludoAbogado, chatState.lawyer.avatar);
    chatState.history.push({ role: 'assistant', content: saludoAbogado });
    return;
  }
  
  // ========================================
  // CASO 2: Chat con el abogado asignado
  // ========================================
  if (chatState.phase === 'assigned' && chatState.lawyer) {
    showTyping(chatState.lawyer.nombre);
    
    try {
      const respuesta = await getLawyerResponse(text);
      hideTyping();
      addBubble('bot', respuesta, chatState.lawyer.avatar);
      chatState.history.push({ role: 'assistant', content: respuesta });
    } catch (error) {
      hideTyping();
      addBubble('bot', 'Disculpa, tuve un problema de conexión. ¿Puedes repetir tu mensaje?', chatState.lawyer.avatar);
    }
    return;
  }
}

// Generar menú de números (formato amigable)
function generarMenuNumeros() {
  let menu = "Opciones disponibles:\n\n";
  AREAS_LEGALES.forEach(area => {
    menu += `${area.numero}. ${area.nombre}\n`;
  });
  return menu;
}

// Obtener respuesta del abogado usando la API
async function getLawyerResponse(userMsg) {
  const systemPrompt = `Eres ${chatState.lawyer.nombre}, abogado especialista en ${chatState.lawyer.especialidad} de la plataforma Legalia en Colombia.

Reglas IMPORTANTES:
1. Responde SIEMPRE en primera persona como este abogado.
2. Sé profesional, empático y claro.
3. Brinda orientación legal útil, pero aclara que para un concepto formal se necesita revisión del caso completo.
4. Si el usuario da detalles específicos (fechas, documentos, situaciones), reconócelos y haz preguntas de seguimiento relevantes.
5. Tus respuestas deben ser concisas pero completas (3-5 oraciones como mínimo).
6. No menciones que eres una IA.
7. Ofrece pasos concretos que el cliente pueda seguir.

Contexto del caso: El usuario seleccionó ${chatState.selectedArea.nombre}.`;

  try {
    const messages = [...chatState.history.slice(-10)]; // contexto de últimos 10 mensajes
    if (messages[messages.length - 1]?.content !== userMsg) {
      messages.push({ role: 'user', content: userMsg });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || `Gracias por compartir tu caso, ${chatState.userName}. ¿Podrías darme más detalles específicos para poder orientarte mejor?`;
  } catch (e) {
    console.error('Error en API:', e);
    return `Disculpa, estoy teniendo problemas técnicos. ¿Podrías repetir tu mensaje?`;
  }
}

async function getAIResponseAsLawyer(prompt, lawyer) {
  // Esta función se mantiene por compatibilidad, pero ahora usamos getLawyerResponse
  return getLawyerResponse(prompt);
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
