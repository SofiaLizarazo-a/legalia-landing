// ============================================
// LEGALIA - MÓDULO DE CHAT
// Asistente virtual y asignación de abogados
// ============================================

const chatState = {
  phase: 'auto',
  lawyer: null,
  msgCount: 0,
  assignAfter: 4,
  history: [],
  typing: false,
  userName: '',
};

const LAWYERS = [
  { name: 'Dr. Andrés Morales', spec: 'Derecho Civil', avatar: '⚖️' },
  { name: 'Dra. Camila Ríos', spec: 'Derecho Laboral', avatar: '👩‍⚖️' },
  { name: 'Dr. Felipe Soto', spec: 'Derecho Penal', avatar: '🧑‍⚖️' },
  { name: 'Dra. Valeria Cruz', spec: 'Derecho de Familia', avatar: '👩‍⚖️' },
];

function openChat() {
  const overlay = document.getElementById('chatOverlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  chatState.phase = 'auto';
  chatState.lawyer = null;
  chatState.msgCount = 0;
  chatState.history = [];
  chatState.userName = (window._currentUser || {}).name || 'Cliente';

  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-assign-badge').style.display = 'none';
  document.getElementById('chat-avatar').textContent = '🤖';
  document.getElementById('chat-who').textContent = 'Asistente Legal Legalia';
  document.getElementById('chat-status').textContent = '● En línea · Respuesta automática';

  setTimeout(() => {
    addBubble('bot',
      `Hola ${chatState.userName} 👋, soy el asistente legal de <strong>Legalia</strong>. Estoy aquí para orientarte antes de que te asignemos un abogado especializado.<br><br>
      Cuéntame, ¿en qué área legal necesitas ayuda? Por ejemplo:<br>
      • Derecho laboral (despido, liquidación)<br>
      • Derecho civil (contratos, deudas)<br>
      • Derecho penal<br>
      • Derecho de familia (divorcio, custodia)`
    );
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
  chatState.msgCount++;
  chatState.history.push({ role: 'user', content: text });

  if (chatState.phase === 'auto' && chatState.msgCount === chatState.assignAfter) {
    await sleep(800);
    await assignLawyer();
    return;
  }

  showTyping();
  const reply = await getAIResponse(text);
  hideTyping();
  chatState.history.push({ role: 'assistant', content: reply });
  addBubble('bot', reply);
}

async function assignLawyer() {
  addBubble('system', '⏳ Analizando tu consulta para asignarte el abogado más adecuado…');
  await sleep(2200);

  const texto = chatState.history.map(m => m.content).join(' ').toLowerCase();
  let lawyer = LAWYERS[Math.floor(Math.random() * LAWYERS.length)];
  if (texto.includes('laboral') || texto.includes('despido') || texto.includes('trabajo')) lawyer = LAWYERS[1];
  else if (texto.includes('penal') || texto.includes('delito') || texto.includes('crimen')) lawyer = LAWYERS[2];
  else if (texto.includes('familia') || texto.includes('divorcio') || texto.includes('custodia')) lawyer = LAWYERS[3];
  else if (texto.includes('civil') || texto.includes('contrato') || texto.includes('deuda')) lawyer = LAWYERS[0];

  chatState.lawyer = lawyer;
  chatState.phase = 'assigned';

  document.getElementById('chat-avatar').textContent = lawyer.avatar;
  document.getElementById('chat-who').textContent = lawyer.name;
  document.getElementById('chat-status').textContent = `● En línea · ${lawyer.spec}`;
  document.getElementById('chat-assign-badge').style.display = 'block';

  addBubble('system', `✅ <strong>${lawyer.name}</strong> (${lawyer.spec}) ha sido asignado/a a tu caso y se ha unido a la conversación.`);

  await sleep(1000);
  showTyping(lawyer.name);
  await sleep(2000);
  hideTyping();

  const intro = await getAIResponseAsLawyer(
    `El asistente automático ya tuvo ${chatState.assignAfter} mensajes con el cliente. Ahora tú eres ${lawyer.name}, abogado especialista en ${lawyer.spec}. Saluda al cliente ${chatState.userName}, presenta tu especialidad brevemente y pregúntale por los detalles específicos de su caso para poder orientarlo mejor. Sé cálido, profesional y directo.`,
    lawyer
  );
  chatState.history.push({ role: 'assistant', content: intro });
  addBubble('bot', intro, lawyer.avatar);
}

async function getAIResponse(userMsg) {
  const systemPrompt = chatState.phase === 'assigned'
    ? `Eres ${chatState.lawyer.name}, abogado especialista en ${chatState.lawyer.spec} de la plataforma Legalia en Colombia. 
Respondes siempre como este abogado: profesional, empático, con lenguaje claro pero preciso. 
Brinda orientación legal real pero aclara que para un concepto formal se necesita revisión del caso completo.
No menciones que eres IA. Mantén coherencia con el historial de la conversación. Respuestas concisas (3-5 oraciones máximo).`
    : `Eres el asistente legal automático de Legalia, una plataforma legal colombiana.
Tu rol es orientar al usuario, identificar el área legal de su problema y recopilar información básica antes de asignarle un abogado.
Sé amigable, claro y profesional. No des consejos legales definitivos, solo orientación general.
Menciona que pronto se le asignará un abogado especializado. Respuestas concisas (3-4 oraciones).`;

  try {
    const messages = [...chatState.history.slice(-8)];
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
    return data.content?.[0]?.text || 'Disculpa, tuve un inconveniente. ¿Puedes repetir tu consulta?';
  } catch (e) {
    return 'Tuve un problema de conexión. Por favor intenta de nuevo en un momento.';
  }
}

async function getAIResponseAsLawyer(prompt, lawyer) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Eres ${lawyer.name}, abogado especialista en ${lawyer.spec} de Legalia Colombia. 
Respondes siempre en primera persona como este abogado. No menciones que eres IA.`,
        messages: [
          ...chatState.history.slice(-6),
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || `Hola ${chatState.userName}, soy ${lawyer.name}. Estoy revisando tu caso y en un momento te doy más detalles.`;
  } catch (e) {
    return `Hola ${chatState.userName}, soy ${lawyer.name} especialista en ${lawyer.spec}. Cuéntame los detalles de tu situación para orientarte mejor.`;
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
    wrap.innerHTML = `
      ${ava}
      <div>
        <div class="bubble ${type}">${html}</div>
        <div class="bubble-time">${now}</div>
      </div>`;
  }

  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function showTyping(name) {
  chatState.typing = true;
  const who = name || (chatState.phase === 'assigned' ? chatState.lawyer?.name : 'Asistente');
  document.getElementById('chat-typing').style.display = 'block';
  document.getElementById('chat-typing').textContent = `${who} está escribiendo…`;
}

function hideTyping() {
  chatState.typing = false;
  document.getElementById('chat-typing').style.display = 'none';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
