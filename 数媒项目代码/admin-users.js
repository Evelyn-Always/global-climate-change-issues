// 后台用户管理（二级页）— 走真实接口；未登录/无权限时静默
(function(){
  if(!window.__API__) window.__API__={};
  const { apiFetch } = window.__API__;

  const state = { page:1, pageSize:10, search:'', role:'', status:'', total:0, items:[] };

  async function load(){
    const q=new URLSearchParams({ page:state.page, pageSize:state.pageSize, search:state.search, role:state.role, status:state.status }).toString();
    const data=await apiFetch(`/api/users?${q}`);
    state.items=data.items||[]; state.total=data.total||0;
  }
  async function createUser(p){ return apiFetch('/api/users',{ method:'POST', body: JSON.stringify(p) }); }
  async function updateUser(id,p){ return apiFetch(`/api/users/${id}`,{ method:'PUT', body: JSON.stringify(p) }); }
  async function deleteUser(id){ return apiFetch(`/api/users/${id}`,{ method:'DELETE' }); }
  async function resetPassword(id,newPassword){ return apiFetch(`/api/users/${id}/reset-password`,{ method:'POST', body: JSON.stringify({ newPassword }) }); }

  const qid=(id)=>document.getElementById(id);
  const escapeHtml=(s)=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const debounce=(fn,wait=200)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),wait); }; };
  function toast(msg,type='ok'){ const el=document.createElement('div'); const color=type==='ok'?'bg-emerald-600':type==='warn'?'bg-amber-600':'bg-red-600'; el.className=`fixed bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 rounded text-white text-sm shadow-lg ${color} z-[1000]`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{el.style.opacity='0'; el.style.transition='opacity .4s';},1600); setTimeout(()=>el.remove(),2100); }
  function csvCell(s){ if(s==null) return ''; const str=String(s).replace(/"/g,'""'); return `"${str}"`; }

  function rowTpl(u){
    const roleMap={admin:'管理员',editor:'编辑',viewer:'只读'};
    const pill=u.status==='active'
      ? '<span class="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">启用</span>'
      : '<span class="px-2 py-0.5 text-xs rounded-full bg-slate-500/20 text-slate-300">停用</span>';
    return `
      <tr class="text-slate-200 hover:bg-dark-300/40">
        <td class="px-4 py-3">${escapeHtml(u.username)}</td>
        <td class="px-4 py-3">${escapeHtml(u.email||'')}</td>
        <td class="px-4 py-3">${escapeHtml(u.displayName||u.username)}</td>
        <td class="px-4 py-3">${roleMap[u.role]||u.role}</td>
        <td class="px-4 py-3">${pill}</td>
        <td class="px-4 py-3 text-slate-300">${u.lastLogin||'-'}</td>
        <td class="px-4 py-3 text-slate-300">${u.createdAt||'-'}</td>
        <td class="px-4 py-3 text-right">
          <button class="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white mr-1" data-act="edit" data-id="${u.id}">编辑</button>
          <button class="text-xs px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white mr-1" data-act="reset" data-id="${u.id}">重置密码</button>
          <button class="text-xs px-2 py-1 rounded ${u.status==='active'?'bg-dark-300 hover:bg-dark-200':'bg-emerald-600 hover:bg-emerald-700'} text-white mr-1" data-act="toggle" data-id="${u.id}">
            ${u.status==='active'?'停用':'启用'}
          </button>
          <button class="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white" data-act="del" data-id="${u.id}">删除</button>
        </td>
      </tr>
    `;
  }
  function emptyRow(){ return `<tr><td colspan="8" class="px-4 py-8 text-center text-dark-100"><i class="fa fa-info-circle mr-1"></i> 暂无数据</td></tr>`; }

  function render(){
    const tbody=qid('admin-table-body'); if(!tbody) return;
    tbody.innerHTML = state.items.length ? state.items.map(rowTpl).join('') : emptyRow();
    const totalPages=Math.max(Math.ceil(state.total/state.pageSize),1);
    qid('admin-page-current').textContent = `${state.page} / ${totalPages}`;
    qid('admin-paging-text').textContent = `共 ${state.total} 条`;

    tbody.querySelectorAll('button[data-act]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id=Number(btn.dataset.id), act=btn.dataset.act;
        const u=state.items.find(x=>x.id===id); if(!u) return;
        if(act==='edit') openUserModal('edit',u);
        if(act==='reset') doReset(u);
        if(act==='toggle') doToggle(u);
        if(act==='del') doDelete(u);
      });
    });
  }

  async function refresh(){ await load(); render(); }

  function bindOnce(){
    if(bindOnce._) return; bindOnce._=true;
    qid('admin-search')?.addEventListener('input',debounce((e)=>{ state.search=e.target.value; state.page=1; refresh(); },250));
    qid('admin-filter-role')?.addEventListener('change',(e)=>{ state.role=e.target.value; state.page=1; refresh(); });
    qid('admin-filter-status')?.addEventListener('change',(e)=>{ state.status=e.target.value; state.page=1; refresh(); });
    qid('admin-page-prev')?.addEventListener('click',()=>{ if(state.page>1){ state.page--; refresh(); } });
    qid('admin-page-next')?.addEventListener('click',()=>{ const tp=Math.max(Math.ceil(state.total/state.pageSize),1); if(state.page<tp){ state.page++; refresh(); } });
    qid('admin-btn-add')?.addEventListener('click',()=> openUserModal('create'));
    qid('admin-btn-export')?.addEventListener('click',exportCSV);
    qid('admin-user-modal-close')?.addEventListener('click', closeUserModal);
    qid('admin-user-cancel')?.addEventListener('click', closeUserModal);
    qid('admin-confirm-close')?.addEventListener('click', closeConfirm);
    qid('admin-confirm-cancel')?.addEventListener('click', closeConfirm);
    qid('admin-user-form')?.addEventListener('submit', onSubmitUser);
  }

  function openUserModal(mode,user){
    const isEdit=mode==='edit';
    qid('admin-user-modal-title').textContent=isEdit?'编辑用户':'新增用户';
    qid('admin-user-id').value=isEdit?user.id:'';
    qid('admin-user-username').value=isEdit?user.username:'';
    qid('admin-user-email').value=isEdit?(user.email||''):'';
    qid('admin-user-role').value=isEdit?user.role:'viewer';
    qid('admin-user-status').value=isEdit?user.status:'active';
    qid('admin-user-password').value='';
    qid('admin-password-block').querySelector('label').textContent = isEdit ? '新密码（可留空）' : '初始密码';
    openModal('admin-user-modal','admin-user-modal-content');
  }
  function closeUserModal(){ closeModal('admin-user-modal','admin-user-modal-content'); }

  async function onSubmitUser(e){
    e.preventDefault();
    const id=qid('admin-user-id').value.trim();
    const payload={
      username: qid('admin-user-username').value.trim(),
      email: qid('admin-user-email').value.trim(),
      role: qid('admin-user-role').value,
      status: qid('admin-user-status').value
    };
    const pwd=qid('admin-user-password').value.trim();
    if(!payload.username) return toast('请填写用户名','warn');
    try{
      if(id){
        if(pwd) payload.password=pwd;
        await updateUser(id,payload);
        toast('已更新');
      }else{
        if(!pwd||pwd.length<6) return toast('新增用户需设置至少6位密码','warn');
        payload.password=pwd;
        await createUser(payload);
        toast('已新增');
      }
      closeUserModal(); await refresh();
    }catch(err){ toast(err?.message||'操作失败','error'); }
  }

  function showConfirm(text, onOK){
    qid('admin-confirm-text').textContent=text||'确认要执行该操作吗？';
    openModal('admin-confirm-modal','admin-confirm-modal-content');
    const ok=qid('admin-confirm-ok');
    ok.onclick=async()=>{ try{ await onOK?.(); } finally { closeConfirm(); } };
  }
  function closeConfirm(){ closeModal('admin-confirm-modal','admin-confirm-modal-content'); }

  async function doReset(u){
    showConfirm(`确认重置用户「${u.username}」的密码吗？`, async ()=>{
      const newPwd=prompt('请输入新密码（至少6位）：','');
      if(!newPwd||newPwd.length<6) return toast('密码至少6位','warn');
      await resetPassword(u.id,newPwd);
      toast('已重置密码');
    });
  }
  async function doToggle(u){
    const next=u.status==='active'?'suspended':'active';
    await updateUser(u.id,{ status: next });
    toast(next==='active'?'已启用':'已停用');
    await refresh();
  }
  async function doDelete(u){
    showConfirm(`确认删除用户「${u.username}」？不可恢复。`, async ()=>{
      await deleteUser(u.id);
      const remain=state.total-1;
      const lastPage=Math.max(Math.ceil(remain/state.pageSize),1);
      if(state.page>lastPage) state.page=lastPage;
      toast('已删除'); await refresh();
    });
  }

  function exportCSV(){
    const header=['用户名','邮箱','显示名','角色','状态','最近登录','创建时间'];
    const lines=[header.join(',')].concat(
      state.items.map(u=>[u.username,u.email||'',u.displayName||u.username,u.role,u.status,u.lastLogin||'',u.createdAt||''].map(csvCell).join(','))
    );
    const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`users_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  function openModal(id,contentId){ const m=qid(id), c=qid(contentId); if(!m||!c)return; m.classList.remove('opacity-0','pointer-events-none'); setTimeout(()=>{ c.classList.remove('scale-95'); c.classList.add('scale-100'); },10); }
  function closeModal(id,contentId){ const m=qid(id), c=qid(contentId); if(!m||!c)return; c.classList.remove('scale-100'); c.classList.add('scale-95'); setTimeout(()=>{ m.classList.add('opacity-0','pointer-events-none'); },180); }

  async function ensureReady(){ try{ await load(); bindOnce(); render(); }catch(e){ /* 未登录/无权时忽略 */ } }

  // 进入 users 面板时加载
  function setupVisibility(){
    const host=document.getElementById('system-users-pane'); if(!host) return;
    const mo=new MutationObserver(()=>{ const visible=!host.classList.contains('hidden'); if(visible) ensureReady(); });
    mo.observe(host,{ attributes:true, attributeFilter:['class'] });
    if(!host.classList.contains('hidden')) ensureReady();
  }
  document.addEventListener('DOMContentLoaded', setupVisibility);
})();