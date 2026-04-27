// ============================================
// LEGALIA AUTH - VERSIÓN CORTA
// ============================================

function valEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);}
function getTipo(){let a=document.querySelector('#loginModal .modal-tab.active');if(!a)return'cliente';let t=a.textContent.trim().toLowerCase();return t.includes('admin')?'administrador':(t.includes('abogado')?'abogado':'cliente');}
async function esperarDB(){let i=0;while(i<50){if(window.db&&window.db._db)return true;await new Promise(r=>setTimeout(r,100));i++;}throw new Error('DB no disponible');}
function showModalSuccess(m,msg){let ok=document.querySelector('#'+m+' .modal-ok');if(!ok){ok=document.createElement('p');ok.className='modal-ok';ok.style.cssText='color:#27ae60;font-size:.78rem;margin-bottom:.8rem;text-align:center;padding:.5rem;border:1px solid rgba(39,174,96,.3);background:rgba(39,174,96,.06);';let ff=document.querySelector('#'+m+' .form-field');ff?ff.before(ok):document.querySelector('#'+m+' .modal').appendChild(ok);}ok.textContent=msg;ok.style.display='block';}

function showModalError(modalId, msg) {
  let err = document.querySelector('#' + modalId + ' .modal-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'modal-error';
    err.style.cssText = 'color:#c0392b;font-size:.78rem;margin-top:.6rem;text-align:center;padding:.5rem;border:1px solid rgba(192,57,43,.3);background:rgba(192,57,43,.06);border-radius:4px;';
    const submitBtn = document.querySelector('#' + modalId + ' .modal-submit');
    if (submitBtn) submitBtn.parentNode.insertBefore(err, submitBtn);
    else document.querySelector('#' + modalId + ' .modal').appendChild(err);
  }
  err.textContent = msg;
  err.style.display = 'block';
}

function clearModalError(modalId) {
  const err = document.querySelector('#' + modalId + ' .modal-error');
  if (err) err.style.display = 'none';
}

async function doLogin(){
  clearModalError('loginModal');try{await esperarDB();}catch(e){showModalError('loginModal',e.message);return;}
  let e=document.querySelector('#loginModal input[type="email"]').value.trim(),p=document.querySelector('#loginModal input[type="password"]').value.trim(),r=getTipo();
  if(!e&&!p){showModalError('loginModal','Ingresa correo y contraseña');return;}
  if(!e){showModalError('loginModal','Correo requerido');return;}
  if(!p){showModalError('loginModal','Contraseña requerida');return;}
  if(!valEmail(e)){showModalError('loginModal','Email inválido');return;}
  try{let u=await window.db.usuarios.autenticar(e,p,r);window.db.setUsuarioActual(u);closeModal('loginModal');showDashboard(r,u.nombre);}
  catch(err){showModalError('loginModal',err.message);}
}

async function doRegister(){
  clearModalError('registerModal');try{await esperarDB();}catch(e){showModalError('registerModal',e.message);return;}
  let n=document.querySelector('#registerModal input[placeholder="Tu nombre"]').value.trim();
  let a=document.querySelector('#registerModal input[placeholder="Tu apellido"]').value.trim();
  let e=document.querySelector('#registerModal input[type="email"]').value.trim();
  let p=document.querySelector('#registerModal input[type="password"]').value.trim();
  let r=document.querySelector('.user-type-btn.active').id.replace('reg-','');
  if(!n||!a||!e||!p){showModalError('registerModal','Todos los campos son obligatorios');return;}
  if(!valEmail(e)){showModalError('registerModal','Email inválido');return;}
  if(p.length<8){showModalError('registerModal','Mínimo 8 caracteres');return;}
  if(r==='abogado'){let t=document.querySelector('#registerModal input[placeholder="Número de tarjeta profesional"]').value.trim();let esp=document.querySelector('#registerModal select').value;
    if(!t){showModalError('registerModal','Tarjeta profesional requerida');return;}
    if(!esp){showModalError('registerModal','Seleccione especialidad');return;}}
  try{await window.db.usuarios.crear(n,a,e,p,r);
    closeModal('registerModal');
    document.querySelector('#registerModal input[placeholder="Tu nombre"]').value='';
    document.querySelector('#registerModal input[placeholder="Tu apellido"]').value='';
    document.querySelector('#registerModal input[type="email"]').value='';
    document.querySelector('#registerModal input[type="password"]').value='';
    openModal('login',null,true);
    document.querySelector('#loginModal input[type="email"]').value=e;
    showModalSuccess('loginModal','✓ Cuenta creada. Ingresa tu contraseña.');}
  catch(err){showModalError('registerModal',err.message);}
}
function doLogout(){window.db?.setUsuarioActual(null);closeDashboard();location.reload();}
