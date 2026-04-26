// ============================================
// LEGALIA - MÓDULO DE CHAT CORREGIDO
// ============================================

const chatState = {
  phase: 'menu',
  lawyer: null,
  history: [],
  typing: false,
  userName: '',
  selectedArea: null,
};

const AREAS_LEGALES = [
  { numero: 1, nombre: 'Derecho Civil', abogado: { nombre: 'Dr. Andrés Morales', avatar: '⚖️', especialidad: 'Civil' } },
  { numero: 2, nombre: 'Derecho Penal', abogado: { nombre: 'Dr. Felipe Soto', avatar: '🧑‍⚖️', especialidad: 'Penal' } },
  { numero: 3, nombre: 'Derecho Laboral', abogado: { nombre: 'Dra. Camila Ríos', avatar: '👩‍⚖️', especialidad: 'Laboral' } },
  { numero: 4, nombre: 'Derecho de Familia', abogado: { nombre: 'Dra. Valeria Cruz', avatar: '👩‍⚖️', especialidad: 'Familia' } },
  { numero: 5, nombre: 'Derecho Comercial', abogado: { nombre: 'Dr. Ricardo Méndez', avatar: '⚖️', especialidad: 'Comercial' } },
  { numero: 6, nombre: 'Derecho Administrativo', abogado: { nombre: 'Dr. Sergio Torres', avatar: '🧑‍⚖️', especialidad: 'Administrativo' } },
];

function openChat() {
  const overlay = document.getElementById('chatOverlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  chatState.phase = 'menu';
  chatState.lawyer = null;
  chatState.history = [];
  chatState.selectedArea = null;
  chatState.userName = (window._currentUser || {}).name || 'Cliente';

  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-assign-badge').style.display = 'none';
  document.getElementById('chat-avatar').textContent = '🤖';
  document.getElementById('chat-who').textContent = 'Asistente Legal Legalia';
  document.getElementById('chat-status').textContent = '● En línea · Selecciona un área';

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

  if (chatState.phase === 'waiting_for_number') {
    const numero = parseInt(text);
    const areaSeleccionada = AREAS_LEGALES.find(a => a.numero === numero);
    
    if (!areaSeleccionada) {
      let menu = `❌ Número inválido. Elige del 1 al ${AREAS_LEGALES.length}:\n\n`;
      AREAS_LEGALES.forEach(a => { menu += `${a.numero}. ${a.nombre}\n`; });
      addBubble('bot', menu);
      return;
    }

    chatState.selectedArea = areaSeleccionada;
    chatState.lawyer = areaSeleccionada.abogado;
    chatState.phase = 'assigned';
    
    document.getElementById('chat-avatar').textContent = chatState.lawyer.avatar;
    document.getElementById('chat-who').textContent = chatState.lawyer.nombre;
    document.getElementById('chat-status').textContent = `● En línea · ${chatState.lawyer.especialidad}`;
    document.getElementById('chat-assign-badge').style.display = 'block';
    
    addBubble('system', `✅ Has seleccionado **${areaSeleccionada.nombre}**\n\n📋 Te ha sido asignado: **${chatState.lawyer.nombre}**`);
    
    await sleep(1000);
    
    showTyping(chatState.lawyer.nombre);
    await sleep(1500);
    hideTyping();
    
    const saludo = `Hola ${chatState.userName}, soy ${chatState.lawyer.nombre}. Cuéntame los detalles de tu caso para poder orientarte.`;
    addBubble('bot', saludo, chatState.lawyer.avatar);
    return;
  }
  
  if (chatState.phase === 'assigned' && chatState.lawyer) {
    showTyping(chatState.lawyer.nombre);
    await sleep(2000);
    hideTyping();
    addBubble('bot', `Gracias por compartir tu caso. ¿Podrías darme más detalles específicos?`, chatState.lawyer.avatar);
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
