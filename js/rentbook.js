/* Finance Suite — RentBook Module */

function renderRentBook(){
  const el=document.getElementById('screen-rentbook');
  const total=APP.tenants.length;
  const due=APP.tenants.filter(t=>tenantComputed(t).balance>0).length;
  const ok=APP.tenants.filter(t=>tenantComputed(t).balance<=0).length;

  const items=APP.tenants.length===0
    ?`<div class="empty"><div class="empty-ico">🏠</div><p class="empty-ttl">No tenants yet</p><p class="empty-hint">Tap + to add your first tenant</p></div>`
    :APP.tenants.map(t=>{
      const st=tenantComputed(t),bal=st.balance;
      const bc=bal>0?'due':bal<0?'adv':'clear';
      const bt=bal===0?'Clear':bal>0?`-₹${Math.abs(bal).toLocaleString('en-IN')}`:`+₹${Math.abs(bal).toLocaleString('en-IN')}`;
      return `
        <div class="tenant-item" onclick="openTenantDetail(${t.id})">
          <div class="tenant-avatar">${(t.name||'?')[0].toUpperCase()}</div>
          <div class="tenant-info">
            <p class="tenant-name">${t.name}</p>
            <p class="tenant-house">${t.houseNo||'No unit'} · ₹${sf(t.baseRent).toLocaleString('en-IN')}/mo</p>
          </div>
          <span class="tenant-bal ${bc}">${bt}</span>
          <div class="tx-del" onclick="event.stopPropagation();deleteTenant(${t.id})">${I.trash}</div>
        </div>`;
    }).join('');

  el.innerHTML=`
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div><h1 class="topbar-title">RentBook</h1></div>
        <div style="width:34px"></div>
      </div>
      <div class="scroll-y">
        <div class="rent-sum">
          <div class="rsm warn"><p class="rsm-val">${total}</p><p class="rsm-lbl">Tenants</p></div>
          <div class="rsm danger"><p class="rsm-val">${due}</p><p class="rsm-lbl">Due</p></div>
          <div class="rsm ok"><p class="rsm-val">${ok}</p><p class="rsm-lbl">Cleared</p></div>
        </div>
        <p class="section-label">All Tenants</p>
        <div class="list-wrap" style="padding-top:4px">${items}</div>
      </div>
      <div class="fab" onclick="openTenantSheet(null)">${I.plus}</div>
    </div>`;
}

function renderRentDetail(){
  const el=document.getElementById('screen-rentdetail');
  const t=APP.tenants.find(t=>t.id===APP.activeTenantId);
  if(!t){goBack();return;}
  const st=tenantComputed(t),bal=st.balance;
  const bc=bal>0?'due':bal<0?'adv':'clear';
  const bamt=bal===0?'Settled':`₹${Math.abs(bal).toLocaleString('en-IN')}`;
  const blbl=bal>0?'BALANCE DUE':bal<0?'ADVANCE PAID':'ALL CLEAR';

  const recs=st.records.length===0
    ?`<div class="empty"><div class="empty-ico">📋</div><p class="empty-ttl">No bills yet</p><p class="empty-hint">Tap "New Bill" above</p></div>`
    :st.records.map(r=>buildRecordCard(r,t)).join('');

  el.innerHTML=`
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div style="flex:1;min-width:0">
          <h1 class="topbar-title" style="font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</h1>
          <p class="topbar-sub">${t.houseNo||''}</p>
        </div>
        <button class="icon-btn" onclick="openTenantSheet(${t.id})">${I.edit}</button>
      </div>
      <div class="scroll-y">
        <div class="tenant-hero">
          <p class="th-name">${t.name}</p>
          <p class="th-meta">${t.houseNo||'No unit'} · ₹${sf(t.baseRent).toLocaleString('en-IN')}/mo</p>
          <div class="th-bal ${bc}">
            ${bal!==0?`<span class="sym">₹</span>${Math.abs(bal).toLocaleString('en-IN')}`:'Settled'}
          </div>
          <p class="th-status ${bc}">${blbl}</p>
          <div class="th-newbill-btn" onclick="openNewBillSheet(${t.id})">+ New Bill</div>
        </div>
        <div class="deposit-row">
          <p class="dep-lbl">Security Deposit</p>
          <p class="dep-val">₹${sf(t.securityDeposit||0).toLocaleString('en-IN')}</p>
        </div>
        <p class="section-label">Billing History</p>
        <div class="list-wrap" style="padding-top:4px">${recs}</div>
      </div>
    </div>`;
}

function buildRecordCard(r,t){
  const open=APP.expandedRecords[r.id];
  const bc=r.runningBalance>0?'due':r.runningBalance<0?'adv':'clear';
  const bt=r.runningBalance===0?'₹0':`${r.runningBalance<0?'-':''}₹${Math.abs(r.runningBalance).toLocaleString('en-IN')}`;

  const pays=(r.payments||[]).length===0
    ?`<p style="font-size:12px;color:var(--t3);padding:2px 0">No payments</p>`
    :(r.payments||[]).map(p=>`
      <div class="pay-row">
        <div class="pay-left">
          <span class="pay-emoji">💳</span>
          <div>
            <p class="pay-amt">₹${sf(p.amount).toLocaleString('en-IN')}</p>
            <p class="pay-date">${fmtDate(p.date)} · ${p.method||'cash'}</p>
          </div>
        </div>
        <div class="pay-del" onclick="deletePayment(${t.id},${r.id},${p.id})">${I.trash}</div>
      </div>`).join('');

  const body=open?`
    <div class="rec-body">
      <div class="rec-row rent-r">
        <div class="rec-row-lbl">${I.home} Rent</div>
        <div class="rec-row-val">₹${sf(r.rentAmount).toLocaleString('en-IN')}</div>
      </div>
      <div class="rec-row elec-r">
        <div class="rec-row-lbl">${I.bolt} Electric</div>
        <div class="rec-row-val">
          ₹${sf(r.electricBill).toLocaleString('en-IN')}
          ${r.units>0?`<div style="font-size:10px;color:var(--t3);margin-top:1px">${r.prevReading}→${r.currReading} (${r.units}u)</div>`:''}
        </div>
      </div>
      ${r.opening!==0?`
      <div class="rec-row carry-r">
        <div class="rec-row-lbl">Carry Forward</div>
        <div class="rec-row-val ${r.opening>0?'plus':'minus'}">${r.opening>0?'+':''}₹${Math.abs(r.opening).toLocaleString('en-IN')}</div>
      </div>`:''}
      <p class="pay-title">Payments</p>
      ${pays}
      <div class="rec-actions">
        <div class="rec-act danger" onclick="deleteRecord(${t.id},${r.id})">Delete</div>
        <div class="rec-act primary" onclick="openPaymentSheet(${t.id},${r.id},${sf(r.billTotal+r.opening-r.paidTotal)})">+ Payment</div>
      </div>
    </div>`:'';

  return `
    <div class="rec-card${open?' open':''}" id="rec-${r.id}">
      <div class="rec-head" onclick="toggleRecord(${r.id})">
        <div>
          <p class="rec-month">${r.month}</p>
          <p class="rec-bill-sub">Bill ₹${sf(r.billTotal).toLocaleString('en-IN')}</p>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="rec-right">
            <p class="rec-bal-lbl">Balance</p>
            <p class="rec-bal ${bc}">${bt}</p>
          </div>
          <div class="rec-chev">${I.chevR}</div>
        </div>
      </div>
      ${body}
    </div>`;
}

function toggleRecord(id){
  APP.expandedRecords[id]=!APP.expandedRecords[id];
  const t=APP.tenants.find(t=>t.id===APP.activeTenantId);
  if(!t)return;
  const st=tenantComputed(t),r=st.records.find(r=>r.id===id);
  if(!r)return;
  const el=document.getElementById(`rec-${id}`);
  if(el)el.outerHTML=buildRecordCard(r,t);
}

function openTenantDetail(id){
  APP.activeTenantId=id;APP.expandedRecords={};navigate('rentdetail');
}

function openTenantSheet(editId){
  const ex=editId?APP.tenants.find(t=>t.id===editId):null;
  openSheet('tenant',({body,footer,titleEl})=>{
    titleEl.textContent=editId?'Edit Tenant':'Add Tenant';
    body.innerHTML=`
      <div class="f-group">
        <label class="f-label">Name</label>
        <input class="f-input" id="t-name" type="text" inputmode="text" placeholder="Full name" maxlength="50" value="${ex?.name||''}"/>
      </div>
      <div class="f-row">
        <div class="f-group">
          <label class="f-label">House / Unit</label>
          <input class="f-input" id="t-house" type="text" inputmode="text" placeholder="A-101" maxlength="20" value="${ex?.houseNo||''}"/>
        </div>
        <div class="f-group">
          <label class="f-label">Due Day</label>
          <input class="f-input" id="t-day" type="number" inputmode="numeric" placeholder="1" min="1" max="31" value="${ex?.rentDay||1}"/>
        </div>
      </div>
      <div class="f-row">
        <div class="f-group">
          <label class="f-label">Rent ₹/mo</label>
          <div class="amt-wrap"><span class="amt-sym" style="font-size:15px">₹</span>
            <input class="f-input" id="t-rent" type="number" inputmode="decimal" placeholder="0" min="0" step="100" value="${ex?.baseRent||''}" style="font-size:20px;padding-left:24px"/>
          </div>
        </div>
        <div class="f-group">
          <label class="f-label">Deposit ₹</label>
          <div class="amt-wrap"><span class="amt-sym" style="font-size:15px">₹</span>
            <input class="f-input" id="t-dep" type="number" inputmode="decimal" placeholder="0" min="0" step="100" value="${ex?.securityDeposit||''}" style="font-size:20px;padding-left:24px"/>
          </div>
        </div>
      </div>`;
    footer.innerHTML=`<button class="save-btn" onclick="saveTenant(${editId||'null'})">${editId?'Update':'Add'} Tenant</button>`;
    requestAnimationFrame(()=>document.getElementById('t-name')?.focus());
  });
}

function saveTenant(editId=null){
  const name=document.getElementById('t-name')?.value?.trim();
  const houseNo=document.getElementById('t-house')?.value?.trim()||'';
  const rent=sf(document.getElementById('t-rent')?.value);
  const dep=sf(document.getElementById('t-dep')?.value);
  const day=clamp(parseInt(document.getElementById('t-day')?.value)||1,1,31);
  if(!name){UI.toast('Enter tenant name');return;}
  if(editId){
    APP.tenants=APP.tenants.map(t=>t.id===editId?{...t,name,houseNo,baseRent:rent,securityDeposit:dep,rentDay:day}:t);
    UI.toast('Updated');closeSheet();renderRentDetail();
  }else{
    APP.tenants.unshift({id:uid(),name,houseNo,baseRent:rent,securityDeposit:dep,rentDay:day,records:[]});
    UI.toast('Tenant added');closeSheet();renderRentBook();
  }
  APP.save();
}

function openNewBillSheet(tenantId){
  const t=APP.tenants.find(t=>t.id===tenantId);
  if(!t)return;
  const sorted=(t.records||[]).sort((a,b)=>b.monthISO.localeCompare(a.monthISO));
  const lastR=sorted[0]?.currReading??'';
  openSheet('bill',({body,footer,titleEl})=>{
    titleEl.textContent='New Bill';
    body.innerHTML=`
      <div class="f-group">
        <label class="f-label">Billing Month</label>
        <input class="f-input" id="bill-month" type="month" value="${getMonthKey(new Date())}" max="${getMonthKey(new Date())}"/>
      </div>
      <div style="background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:12px;margin-bottom:11px">
        <p style="font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--t3);margin-bottom:8px">Electricity Meter</p>
        <div class="f-row">
          <div class="f-group" style="margin-bottom:0">
            <label class="f-label">Old Reading</label>
            <input class="f-input mono" id="bill-old" type="number" inputmode="decimal" placeholder="0" min="0" step="any" value="${lastR}"/>
          </div>
          <div class="f-group" style="margin-bottom:0">
            <label class="f-label">New Reading</label>
            <input class="f-input mono" id="bill-new" type="number" inputmode="decimal" placeholder="0" min="0" step="any" oninput="updateBillPreview()"/>
          </div>
        </div>
        <div class="bill-preview" id="bill-preview"><p id="bill-preview-txt"></p></div>
      </div>
      <div class="f-group">
        <label class="f-label">Manual Electric Bill ₹ <span style="color:var(--t3);font-weight:400;text-transform:none;letter-spacing:0">— leave blank for auto</span></label>
        <div class="amt-wrap"><span class="amt-sym" style="font-size:15px">₹</span>
          <input class="f-input" id="bill-manual" type="number" inputmode="decimal" placeholder="Auto" min="0" step="any" style="font-size:20px;padding-left:24px" oninput="updateBillPreview()"/>
        </div>
      </div>
      <div style="background:var(--surf);border:1px solid var(--bdr);border-radius:12px;padding:11px 13px">
        <p style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px">Tenant Info</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <p style="font-size:12px;color:var(--t2)">Base Rent</p>
          <p style="font-family:var(--mono);font-size:12px">₹${sf(t.baseRent).toLocaleString('en-IN')}</p>
        </div>
        <div style="display:flex;justify-content:space-between">
          <p style="font-size:12px;color:var(--t2)">Rate / unit</p>
          <p style="font-family:var(--mono);font-size:12px">₹8</p>
        </div>
      </div>`;
    footer.innerHTML=`<button class="save-btn" onclick="saveBill(${tenantId})">Generate Bill</button>`;
    requestAnimationFrame(()=>document.getElementById('bill-new')?.focus());
  });
}

function updateBillPreview(){
  const old=sf(document.getElementById('bill-old')?.value);
  const nw=sf(document.getElementById('bill-new')?.value);
  const manual=document.getElementById('bill-manual')?.value;
  const prev=document.getElementById('bill-preview');
  const txt=document.getElementById('bill-preview-txt');
  if(!prev||!txt)return;
  if(nw>old||manual){
    const units=Math.max(0,nw-old);
    const elec=manual?sf(manual):sf(units*8);
    txt.textContent=manual?`Manual: ₹${elec.toLocaleString('en-IN')}`:`${units} units × ₹8 = ₹${elec.toLocaleString('en-IN')}`;
    prev.classList.add('show');
  }else prev.classList.remove('show');
}

function saveBill(tenantId){
  const month=document.getElementById('bill-month')?.value;
  const oldR=sf(document.getElementById('bill-old')?.value);
  const newR=sf(document.getElementById('bill-new')?.value);
  const manual=document.getElementById('bill-manual')?.value;
  if(!month){UI.toast('Select billing month');return;}
  const ti=APP.tenants.findIndex(t=>t.id===tenantId);
  if(ti===-1)return;
  const t=APP.tenants[ti];
  const units=Math.max(0,sf(newR-oldR));
  const elec=manual?sf(manual):sf(units*8);
  const rec={id:uid(),monthISO:month,month:fmtMonthLong(month),prevReading:oldR,currReading:newR,units,rentAmount:sf(t.baseRent),electricBill:elec,totalBill:sf(sf(t.baseRent)+elec),payments:[]};
  const recs=[...(t.records||[])];
  const ei=recs.findIndex(r=>r.monthISO===month);
  if(ei!==-1)recs[ei]={...rec,id:recs[ei].id,payments:recs[ei].payments};
  else{recs.unshift(rec);if(recs.length>120)recs.pop();}
  APP.tenants[ti]={...t,records:recs};
  APP.save();closeSheet();renderRentDetail();UI.toast('Bill generated');
}

function openPaymentSheet(tenantId,recId,pending){
  openSheet('payment',({body,footer,titleEl})=>{
    titleEl.textContent='Record Payment';
    body.innerHTML=`
      <div class="f-group">
        <label class="f-label">Amount ₹</label>
        <div class="amt-wrap grn"><span class="amt-sym">₹</span>
          <input class="f-input grn" id="pay-amt" type="number" inputmode="decimal" placeholder="0" min="0" step="any" value="${pending>0?pending:''}"/>
        </div>
        ${pending>0?`<p style="font-size:11px;color:var(--t3);margin-top:5px">Pending: ₹${sf(pending).toLocaleString('en-IN')}</p>`:''}
      </div>
      <div class="f-group">
        <label class="f-label">Method</label>
        <div class="seg" id="pay-meth">
          <div class="seg-opt on" onclick="selMeth(this)">💵 Cash</div>
          <div class="seg-opt" onclick="selMeth(this)">📱 Online</div>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Date</label>
        <input class="f-input" id="pay-date" type="date" value="${getLocalISO()}" max="${getLocalISO()}"/>
      </div>`;
    footer.innerHTML=`<button class="save-btn grn" onclick="savePayment(${tenantId},${recId})">Record Payment</button>`;
    requestAnimationFrame(()=>document.getElementById('pay-amt')?.focus());
  });
}

function savePayment(tenantId,recId){
  const amount=sf(document.getElementById('pay-amt')?.value);
  const isCash=document.querySelector('#pay-meth .seg-opt.on')?.textContent.includes('Cash');
  const method=isCash?'cash':'online';
  const date=document.getElementById('pay-date')?.value||getLocalISO();
  if(!amount||amount<=0){UI.toast('Enter payment amount');return;}
  const ti=APP.tenants.findIndex(t=>t.id===tenantId);
  if(ti===-1)return;
  const ri=APP.tenants[ti].records.findIndex(r=>r.id===recId);
  if(ri===-1)return;
  APP.tenants[ti].records[ri].payments=[...(APP.tenants[ti].records[ri].payments||[]),{id:uid(),amount,method,date}];
  APP.funds.unshift({id:uid(),amount,note:`Rent — ${APP.tenants[ti].name}`,method,date});
  if(APP.funds.length>1000)APP.funds=APP.funds.slice(0,1000);
  APP.save();closeSheet();APP.expandedRecords[recId]=true;renderRentDetail();UI.toast('Payment recorded');
}

function deleteTenant(id){
  const t=APP.tenants.find(t=>t.id===id);
  openDialog({icon:'🏠',title:'Delete Tenant?',body:`"${t?.name}" and all history will be deleted.`,confirmLabel:'Delete',confirmClass:'confirm',onConfirm:()=>{
    APP.tenants=APP.tenants.filter(t=>t.id!==id);APP.save();renderRentBook();UI.toast('Deleted');
  }});
}
function deleteRecord(tenantId,recId){
  openDialog({icon:'🗑️',title:'Delete Bill?',body:'Bill and all payments will be removed.',confirmLabel:'Delete',confirmClass:'confirm',onConfirm:()=>{
    const ti=APP.tenants.findIndex(t=>t.id===tenantId);
    if(ti!==-1)APP.tenants[ti].records=APP.tenants[ti].records.filter(r=>r.id!==recId);
    APP.save();renderRentDetail();UI.toast('Deleted');
  }});
}
function deletePayment(tenantId,recId,payId){
  openDialog({icon:'💳',title:'Delete Payment?',body:'This payment will be removed.',confirmLabel:'Delete',confirmClass:'confirm',onConfirm:()=>{
    const ti=APP.tenants.findIndex(t=>t.id===tenantId);
    if(ti!==-1){const ri=APP.tenants[ti].records.findIndex(r=>r.id===recId);if(ri!==-1)APP.tenants[ti].records[ri].payments=APP.tenants[ti].records[ri].payments.filter(p=>p.id!==payId);}
    APP.save();APP.expandedRecords[recId]=true;renderRentDetail();UI.toast('Deleted');
  }});
}
