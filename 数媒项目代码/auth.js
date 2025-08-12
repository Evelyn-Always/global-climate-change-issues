// 鉴权 + 二级路由 + 移动端侧边栏
// 若前后端不同源，把 API_BASE 改成你的后端地址，例如 'http://localhost:3000'
const API_BASE = 'http://127.0.0.1:5000';

const LS_TOKEN='__AUTH_TOKEN__', LS_USER='__AUTH_USER__', DAY_MS=24*60*60*1000;
const $=(s)=>document.querySelector(s), $$=(s)=>Array.from(document.querySelectorAll(s)), byId=(id)=>document.getElementById(id);
const now=()=>Date.now(), sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const NAV_LINK_SEL = '.nav-link, .mobile-nav-link';

const routeMap = {
  '#dashboard':'dashboard-page',
  '#trends':'trends-page',
  '#themes':'themes-page',
  '#alerts':'alerts-page',
  '#timeline':'timeline-page',
  '#news-policy':'news-policy-page',
  '#discussion':'discussion-page',
  '#download-share':'download-share-page',
  '#future-topic':'future-topic-page',
  '#system':'system-page'
};

async function apiFetch(path, options={}) {
  const sess=readSession();
  const headers={'Content-Type':'application/json', ...(options.headers||{})};
  if (sess?.token) headers.Authorization=`Bearer ${sess.token}`;
  const res=await fetch(API_BASE+path,{...options,headers});
  if(!res.ok){ let msg=`HTTP ${res.status}`; try{ const j=await res.json(); if(j?.message) msg=j.message; }catch{} throw new Error(msg); }
  return res.json();
}

function saveSession(token,user,remember){ const payload={token,exp: now()+(remember?7:1)*DAY_MS}; localStorage.setItem(LS_TOKEN,JSON.stringify(payload)); localStorage.setItem(LS_USER,JSON.stringify(user)); }
function readSession(){ try{ const raw=localStorage.getItem(LS_TOKEN); if(!raw) return null; const p=JSON.parse(raw); if(!p?.exp||p.exp<now()) return null; return p; }catch{return null;} }
function getUser(){ try{ return JSON.parse(localStorage.getItem(LS_USER)||'null'); }catch{return null;} }
function clearSession(){ localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_USER); }

async function signIn(username,password,remember){
  // 优先真实后端
  try{
    const data=await apiFetch('/api/auth/login',{ method:'POST', body: JSON.stringify({ username,password,remember }) });
    if(!data?.token||!data?.user) throw new Error('登录失败');
    saveSession(data.token,data.user,remember);
    return data.user;
  }catch(e){
    // 本地 mock（便于前端先跑）
    if (username==='admin' && password==='admin123') {
      const user={ id:'u_admin', username:'admin', role:'admin', displayName:'管理员' };
      const token='mock.'+btoa(JSON.stringify({u:user.username,t:Date.now()}))+'.token';
      saveSession(token,user,remember); return user;
    }
    if (username==='viewer' && password==='viewer123') {
      const user={ id:'u_viewer', username:'viewer', role:'viewer', displayName:'只读用户' };
      const token='mock.'+btoa(JSON.stringify({u:user.username,t:Date.now()}))+'.token';
      saveSession(token,user,remember); return user;
    }
    throw e;
  }
}

function showSection(id){
  $$('.page-content').forEach(sec=>sec.classList.add('hidden'));
  const el=byId(id); if(el) el.classList.remove('hidden');
  if(id==='alerts-page' && typeof window.showAlertsPageHook==='function'){ requestAnimationFrame(()=>setTimeout(()=>window.showAlertsPageHook(),50)); }
  return el;
}
function setActiveByHash(hash){
  $$('.nav-link').forEach(a=>a.classList.remove('nav-active'));
  const d=$(`.nav-link[href="${hash}"]`); if(d) d.classList.add('nav-active');
  $$('.mobile-nav-link').forEach(a=>a.classList.remove('nav-active'));
  const m=$(`.mobile-nav-link[href="${hash}"]`); if(m) m.classList.add('nav-active');
}
function applyUserUI(user){
  const authed=!!user;
  const info=byId('user-info'), entry=byId('user-auth-entry'), nick=byId('user-nickname');
  if(info&&entry){ if(authed){ entry.classList.add('hidden'); info.classList.remove('hidden'); if(nick) nick.textContent=user.displayName||user.username; } else { info.classList.add('hidden'); entry.classList.remove('hidden'); if(nick) nick.textContent=''; } }
  const adminDesk=byId('nav-admin'), adminMob=byId('nav-admin-mobile');
  [adminDesk, adminMob].forEach(el=>{ if(!el) return; if(authed && user.role==='admin') el.classList.remove('hidden'); else el.classList.add('hidden'); });
  const loginM=byId('auth-open-btn-mobile'), logoutM=byId('logout-btn-mobile');
  if(loginM && logoutM){ if(authed){ loginM.classList.add('hidden'); logoutM.classList.remove('hidden'); } else { logoutM.classList.add('hidden'); loginM.classList.remove('hidden'); } }
}

function showSystemSubview(sub,user){
  const panes=['settings','help','users'];
  panes.forEach(k=>byId(`system-${k}-pane`)?.classList.add('hidden'));
  if(sub==='users' && user.role!=='admin'){ toast('仅管理员可访问用户管理','warn'); sub='settings'; }
  byId(`system-${sub}-pane`)?.classList.remove('hidden');
  document.querySelectorAll('.sys-tab').forEach(a=>a.classList.remove('bg-primary','text-white'));
  const tab=document.querySelector(`.sys-tab[href="#system/${sub}"]`); if(tab){ tab.classList.add('bg-primary','text-white'); }
}

function openMobileSidebar(){
  const overlay=byId('mobile-sidebar'), panel=byId('mobile-sidebar-content');
  if(!overlay||!panel) return;
  overlay.classList.remove('hidden');
  requestAnimationFrame(()=>panel.classList.remove('-translate-x-full'));
}
function closeMobileSidebar(){
  const overlay=byId('mobile-sidebar'), panel=byId('mobile-sidebar-content');
  if(!overlay||!panel) return;
  panel.classList.add('-translate-x-full');
  setTimeout(()=>overlay.classList.add('hidden'), 200);
}

function navigateByHash(hash){
  const sess=readSession(), user=getUser(), logged=!!(sess&&user);
  if(!hash) hash='#dashboard';

  if(!logged){ showSection('auth-page'); setActiveByHash(''); return; }

  if(hash.startsWith('#system')){
    showSection('system-page');
    const sub=(hash.split('/')[1]||'settings').split('?')[0];
    setActiveByHash(`#system/${sub}`);
    showSystemSubview(sub,user);
    closeMobileSidebar();
    return;
  }

  const target=routeMap[hash];
  if(target && byId(target)){ showSection(target); setActiveByHash(hash); }
  else { showSection('dashboard-page'); setActiveByHash('#dashboard'); }
  closeMobileSidebar();
}

function toast(msg,type='ok'){ const el=document.createElement('div'); const color=type==='ok'?'bg-emerald-600':type==='warn'?'bg-amber-600':'bg-red-600'; el.className=`fixed bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 rounded text-white text-sm shadow-lg ${color} z-[9999]`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{el.style.opacity='0'; el.style.transition='opacity .4s';},1600); setTimeout(()=>el.remove(),2100); }

function bindEvents(){
  // 桌面+移动 导航
  $$(NAV_LINK_SEL).forEach(a=>{
    a.addEventListener('click',(e)=>{
      const href=a.getAttribute('href')||''; if(href.startsWith('#')){ e.preventDefault(); if(location.hash!==href) location.hash=href; else navigateByHash(href); }
    });
  });
  // 移动端菜单按钮与遮罩
  byId('mobile-menu-button')?.addEventListener('click', (e)=>{ e.preventDefault(); openMobileSidebar(); });
  byId('mobile-sidebar')?.addEventListener('click', (e)=>{ if(e.target?.id==='mobile-sidebar') closeMobileSidebar(); });

  // 桌面 登录/退出
  byId('auth-open-btn')?.addEventListener('click',(e)=>{ e.preventDefault(); showSection('auth-page'); setActiveByHash(''); closeMobileSidebar(); });
  byId('logout-btn')?.addEventListener('click', async (e)=>{ e.preventDefault(); try{ await apiFetch('/api/auth/logout',{method:'POST'});}catch{} clearSession(); applyUserUI(null); toast('已退出'); await sleep(120); showSection('auth-page'); setActiveByHash(''); closeMobileSidebar(); });

  // 移动端 登录/退出（如果添加了按钮）
  byId('auth-open-btn-mobile')?.addEventListener('click',(e)=>{ e.preventDefault(); showSection('auth-page'); setActiveByHash(''); closeMobileSidebar(); });
  byId('logout-btn-mobile')?.addEventListener('click', async (e)=>{ e.preventDefault(); try{ await apiFetch('/api/auth/logout',{method:'POST'});}catch{} clearSession(); applyUserUI(null); toast('已退出'); await sleep(120); showSection('auth-page'); setActiveByHash(''); closeMobileSidebar(); });

  // 登录页
  byId('auth-toggle-pwd')?.addEventListener('click',()=>{
    const input=byId('auth-password'); if(!input) return;
    const t=input.getAttribute('type')==='password'?'text':'password';
    input.setAttribute('type',t);
    byId('auth-toggle-pwd').innerHTML=t==='password'?'<i class="fa fa-eye"></i>':'<i class="fa fa-eye-slash"></i>';
  });
  byId('auth-form')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const username=(byId('auth-username')?.value||'').trim();
    const password=(byId('auth-password')?.value||'').trim();
    const remember=!!byId('auth-remember')?.checked;
    const btn=byId('auth-submit'), msg=byId('auth-msg');
    if(!username||!password) return;
    btn.disabled=true; btn.innerHTML='<i class="fa fa-spinner fa-spin"></i> 登录中...'; msg.textContent='';
    try{
      const user=await signIn(username,password,remember);
      applyUserUI(user);
      toast('登录成功');
      await sleep(120);
      location.hash='#dashboard';
      navigateByHash('#dashboard');
    }catch(err){
      msg.textContent = err?.message || '登录失败，请重试';
    }finally{
      btn.disabled=false; btn.innerHTML='<i class="fa fa-sign-in"></i> 登录';
    }
  });

  window.addEventListener('hashchange',()=>navigateByHash(location.hash));
}

function bootstrap(){
  bindEvents();
  const sess=readSession(), user=getUser();
  applyUserUI(sess&&user?user:null);
  if(sess&&user){ navigateByHash(location.hash||'#dashboard'); } else { showSection('auth-page'); setActiveByHash(''); }
  // 暴露 API 给其它脚本（如 admin-users.js）
  window.__API__ = { apiFetch, getUser, readSession };
}
document.addEventListener('DOMContentLoaded', bootstrap);