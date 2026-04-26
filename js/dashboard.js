function showDashboard(role, name) {
  const dashboardOverlay = document.getElementById('dashboardOverlay');
  document.getElementById('dash-name').textContent = name;

  const configs = {
    cliente: {
      badge: 'Cliente',
      badgeColor: '#27ae60',
      welcome: 'Bienvenido a tu espacio legal',
      desc: 'Aquí puedes gestionar tus casos, comunicarte con tu abogado y hacer seguimiento de tus procesos legales.',
      items: [
        { icon: '⚖️', title: 'Mis Casos', desc: 'Visualiza y da seguimiento a tus procesos legales activos.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💬', title: 'Chat Seguro', desc: 'Comunícate directamente con tu abogado asignado.', action: 'openChat()' },
        { icon: '📅', title: 'Mis Citas', desc: 'Gestiona tus reuniones y recordatorios.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💳', title: 'Pagos', desc: 'Consulta tu historial de pagos y facturas.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📄', title: 'Documentos', desc: 'Accede y organiza los documentos de tu expediente.', action: 'alert("Módulo en desarrollo")' },
        { icon: '⭐', title: 'Calificar Servicio', desc: 'Evalúa la atención recibida al cerrar un caso.', action: 'alert("Módulo en desarrollo")' },
      ]
    },
    abogado: {
      badge: 'Abogado',
      badgeColor: '#2980b9',
      welcome: 'Panel de gestión de casos',
      desc: 'Administra tu cartera de clientes, actualiza casos y gestiona tu agenda profesional.',
      items: [
        { icon: '📁', title: 'Casos Activos', desc: 'Gestiona todos tus procesos legales en curso.', action: 'alert("Módulo en desarrollo")' },
        { icon: '👥', title: 'Mis Clientes', desc: 'Directorio y perfiles de tus clientes.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💬', title: 'Mensajes', desc: 'Bandeja de comunicación segura con clientes.', action: 'openChat()' },
        { icon: '📅', title: 'Agenda', desc: 'Administra tu disponibilidad y citas programadas.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📊', title: 'Reportes', desc: 'Genera reportes detallados por caso o período.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📋', title: 'Expedientes', desc: 'Sube y organiza documentos por caso.', action: 'alert("Módulo en desarrollo")' },
      ]
    },
    administrador: {
      badge: 'Administrador',
      badgeColor: '#8e44ad',
      welcome: 'Panel de Administración',
      desc: 'Supervisión completa de la plataforma: usuarios, casos, transacciones y estadísticas.',
      items: [
        { icon: '🛡️', title: 'Verificar Abogados', desc: 'Activa y valida credenciales de abogados registrados.', action: 'alert("Módulo en desarrollo")' },
        { icon: '📊', title: 'Estadísticas', desc: 'Métricas de uso y rendimiento de la plataforma.', action: 'alert("Módulo en desarrollo")' },
        { icon: '👤', title: 'Usuarios', desc: 'Gestiona todas las cuentas y niveles de acceso.', action: 'alert("Módulo en desarrollo")' },
        { icon: '⚖️', title: 'Supervisar Casos', desc: 'Monitorea todos los procesos registrados.', action: 'alert("Módulo en desarrollo")' },
        { icon: '💰', title: 'Transacciones', desc: 'Audita pagos y facturación del sistema.', action: 'alert("Módulo en desarrollo")' },
        { icon: '⚙️', title: 'Configuración', desc: 'Ajusta parámetros y políticas de la plataforma.', action: 'alert("Módulo en desarrollo")' },
      ]
    }
  };

  const cfg = configs[role] || configs.cliente;

  document.getElementById('dash-badge').textContent = cfg.badge;
  document.getElementById('dash-badge').style.background = cfg.badgeColor;
  document.getElementById('dash-welcome').textContent = cfg.welcome;
  document.getElementById('dash-desc').textContent = cfg.desc;

  window._currentUser = { name, role };
  const grid = document.getElementById('dash-grid');
  grid.innerHTML = cfg.items.map(item => {
    return `<div class="dash-card"><div class="dash-card-icon">${item.icon}</div><h3 class="dash-card-title">${item.title}</h3><p class="dash-card-desc">${item.desc}</p><button class="dash-card-btn" onclick="${item.action}">Abrir →</button></div>`;
  }).join('');

  dashboardOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDashboard() {
  document.getElementById('dashboardOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
