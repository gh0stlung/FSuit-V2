/* Finance Suite — Settings Module */
function renderSettings(){
  const el=document.getElementById('screen-settings');
  const txC=APP.txs.length,fC=APP.funds.length,tC=APP.tenants.length;
  const spent=APP.txs.reduce((s,t)=>s+sf(t.amount),0);
  const earned=APP.funds.reduce((s,f)=>s+sf(f.amount),0);
  el.innerHTML=`
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div><h1 class="topbar-title">Settings</h1></div>
        <div style="width:34px"></div>
      </div>
      <div class="scroll-y">
        <div class="settings-wrap" style="padding-top:8px">

          <div style="background:linear-gradient(140deg,rgba(224,152,24,.1),rgba(224,152,24,.04));border:1px solid rgba(224,152,24,.2);border-radius:18px;padding:16px;margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <span style="font-size:28px">💎</span>
              <div>
                <p style="font-size:16px;font-weight:800;letter-spacing:-.02em">Finance Suite</p>
                <p style="font-size:10px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.09em">v4 · Local First · No Tracking</p>
              </div>
            </div>
            <div class="ov-grid">
              <div class="ov-item"><p class="ov-v">${txC+fC}</p><p class="ov-l">Records</p></div>
              <div class="ov-item"><p class="ov-v">${tC}</p><p class="ov-l">Tenants</p></div>
              <div class="ov-item"><p class="ov-v">${new Set([...APP.txs.map(t=>t.date?.slice(0,7)),...APP.funds.map(f=>f.date?.slice(0,7))]).size}</p><p class="ov-l">Months</p></div>
            </div>
          </div>

          <div class="settings-section">
            <p class="settings-section-ttl">Wallet</p>
            <div class="settings-block">
              <div class="settings-row">
                <span class="sr-ico">💰</span>
                <div class="sr-body"><p class="sr-title">Monthly Budget</p><p class="sr-sub">₹${sf(APP.budget).toLocaleString('en-IN')} / month</p></div>
                <div class="sr-action"><button class="sm-btn" onclick="openBudgetSheet()">Edit</button></div>
              </div>
              <div class="settings-row">
                <span class="sr-ico">📈</span>
                <div class="sr-body"><p class="sr-title">Lifetime</p><p class="sr-sub">Earned ₹${sf(earned).toLocaleString('en-IN')} · Spent ₹${sf(spent).toLocaleString('en-IN')}</p></div>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <p class="settings-section-ttl">Data</p>
            <div class="settings-block">
              <div class="settings-row">
                <span class="sr-ico">💾</span>
                <div class="sr-body"><p class="sr-title">Export Backup</p><p class="sr-sub">Download as JSON</p></div>
                <div class="sr-action"><button class="sm-btn" onclick="exportData()">Export</button></div>
              </div>
              <div class="settings-row">
                <span class="sr-ico">📥</span>
                <div class="sr-body"><p class="sr-title">Import Backup</p><p class="sr-sub">Restore from JSON</p></div>
                <div class="sr-action"><label class="sm-btn" style="cursor:pointer">Import<input type="file" accept=".json" style="display:none" onchange="importData(event)"/></label></div>
              </div>
              <div class="settings-row">
                <span class="sr-ico">🗑️</span>
                <div class="sr-body"><p class="sr-title">Clear All Data</p><p class="sr-sub" style="color:var(--red)">Cannot be undone</p></div>
                <div class="sr-action"><button class="sm-btn danger" onclick="clearAllData()">Clear</button></div>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <p class="settings-section-ttl">About</p>
            <div class="settings-block">
              <div class="settings-row"><span class="sr-ico">🔒</span><div class="sr-body"><p class="sr-title">Privacy</p><p class="sr-sub">All data on your device. No servers, no ads.</p></div></div>
              <div class="settings-row"><span class="sr-ico">📱</span><div class="sr-body"><p class="sr-title">Install App</p><p class="sr-sub">Add to home screen for fullscreen</p></div></div>
            </div>
          </div>

        </div>
      </div>
    </div>`;
}

function exportData(){
  const d={version:4,exportedAt:new Date().toISOString(),txs:APP.txs,funds:APP.funds,tenants:APP.tenants,budget:APP.budget};
  const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download=`finance-suite-${getLocalISO()}.json`;a.click();URL.revokeObjectURL(u);
  UI.toast('Exported');
}

function importData(e){
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const d=JSON.parse(ev.target.result);
      openDialog({icon:'📥',title:'Import Data?',body:`Overwrite with backup from ${d.exportedAt?.slice(0,10)||'?'}`,confirmLabel:'Import',confirmClass:'confirm-ok',onConfirm:()=>{
        if(Array.isArray(d.txs))APP.txs=d.txs;
        if(Array.isArray(d.funds))APP.funds=d.funds;
        if(Array.isArray(d.tenants))APP.tenants=d.tenants;
        if(d.budget)APP.budget=sf(d.budget);
        APP.save();renderSettings();renderHome();UI.toast('Imported');
      }});
    }catch{UI.toast('Invalid file');}
  };
  r.readAsText(file);
}

function clearAllData(){
  openDialog({icon:'⚠️',title:'Clear All Data?',body:'ALL records permanently deleted.',confirmLabel:'Clear',confirmClass:'confirm',onConfirm:()=>{
    APP.txs=[];APP.funds=[];APP.tenants=[];APP.budget=5000;
    APP.save();renderSettings();renderHome();UI.toast('Cleared');
  }});
}
