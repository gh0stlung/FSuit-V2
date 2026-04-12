/* Finance Suite — Wallet Module */

function renderHome() {
  const el = document.getElementById('screen-home');
  const c  = walletComputed();
  const h  = new Date().getHours();
  const gr = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  el.innerHTML = `
    <div class="home-wrap">
      <p class="home-greeting au au1">${gr}</p>
      <h1 class="home-title au au2">Finance<br><span class="glow">Suite</span></h1>

      <div class="home-bal au au3">
        <p class="hb-lbl">Total Balance</p>
        <div class="hb-amt"><span class="sym">₹</span>${sf(c.totalBal).toLocaleString('en-IN')}</div>
        <div class="home-chips">
          <div class="h-chip">
            <p class="hc-l">Cash</p>
            <p class="hc-v" style="color:${c.cashBal<0?'var(--red)':'var(--t1)'}">₹${sf(c.cashBal).toLocaleString('en-IN')}</p>
          </div>
          <div class="h-chip">
            <p class="hc-l">Online</p>
            <p class="hc-v" style="color:${c.onlineBal<0?'var(--red)':'var(--t1)'}">₹${sf(c.onlineBal).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div class="module-btn mod-gold au au4" onclick="navigate('wallet')">
        <div class="mod-icon gold">💰</div>
        <div class="mod-text">
          <p class="mod-name">Wallet</p>
          <p class="mod-desc">Expenses & Income</p>
        </div>
        <div class="mod-arr">${I.chevR}</div>
      </div>

      <div class="module-btn mod-blue au au5" onclick="navigate('rentbook')">
        <div class="mod-icon blue">🏠</div>
        <div class="mod-text">
          <p class="mod-name">RentBook</p>
          <p class="mod-desc">Property Manager</p>
        </div>
        <div class="mod-arr">${I.chevR}</div>
      </div>

      <div style="margin-top:auto;padding-top:18px;text-align:center">
        <button onclick="navigate('settings')" style="background:var(--surf);border:1px solid var(--bdr);border-radius:20px;padding:8px 16px;font-family:var(--ui);font-size:11px;font-weight:700;color:var(--t3);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
          ${I.settings} Settings
        </button>
        <p style="margin-top:10px;font-size:10px;color:var(--t3);letter-spacing:.09em">FINANCE SUITE · LOCAL FIRST</p>
      </div>
    </div>`;
}

function renderWallet() {
  const el = document.getElementById('screen-wallet');
  const c  = walletComputed();
  const m  = APP.walletMonth;
  const [y, mo] = m.split('-').map(Number);

  // Budget ring
  const budget = sf(APP.budget);
  const bPct   = budget > 0 ? clamp((c.mExp / budget) * 100, 0, 100) : 0;
  const over   = c.mExp > budget;
  const rc     = over ? 'var(--red)' : bPct > 70 ? 'var(--a2)' : 'var(--grn)';
  const R = 20, circ = 2*Math.PI*R, dash = (bPct/100)*circ;

  // Calendar
  const dInM  = new Date(y, mo, 0).getDate();
  const startD = new Date(y, mo-1, 1).getDay();
  const today  = getLocalISO();
  let cells = '';
  for (let i=0;i<startD;i++) cells+=`<div></div>`;
  for (let d=1;d<=dInM;d++) {
    const iso = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dd  = c.daily[iso];
    const cls = ['cal-cell', iso===APP.walletSelDate?'selected':iso===today?'today':'', dd?'has-tx':''].filter(Boolean).join(' ');
    const dots = dd ? `<div class="cal-dots">${dd.exp>0?'<div class="cal-dot e"></div>':''}${dd.inc>0?'<div class="cal-dot i"></div>':''}</div>` : '';
    cells += `<div class="${cls}" onclick="selectWalletDate('${iso}')">${d}${dots}</div>`;
  }

  // Entries
  let txHTML = '';
  if (!c.selEntries.length) {
    txHTML = `<div class="empty"><div class="empty-ico">📋</div><p class="empty-ttl">No transactions</p><p class="empty-hint">on ${fmtDate(APP.walletSelDate)}</p></div>`;
  } else {
    txHTML = c.selEntries.map(e => {
      const isInc = e.kind === 'income';
      const cat   = isInc ? {emoji:'💰',name:'Income'} : getCat(e.cat);
      return `
        <div class="tx-item" onclick="${isInc?`openEditFund(${e.id})`:`openEditTx(${e.id})`}">
          <div class="tx-ico" style="background:${isInc?'var(--grnd)':'var(--redd)'}">${cat.emoji}</div>
          <div class="tx-body">
            <p class="tx-title">${e.title || cat.name}</p>
            <div class="tx-meta">
              <span class="tx-tag ${isInc?'tag-grn':'tag-red'}">${isInc?'Income':cat.name}</span>
              <span class="tx-method">${e.method||'cash'}</span>
            </div>
          </div>
          <span class="tx-amt ${isInc?'pos':'neg'}">${isInc?'+':'-'}₹${sf(e.amount).toLocaleString('en-IN')}</span>
          <div class="tx-del" onclick="event.stopPropagation();deleteTxOrFund('${isInc?'fund':'tx'}',${e.id})">${I.trash}</div>
        </div>`;
    }).join('');
  }

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div><h1 class="topbar-title">Wallet</h1></div>
        <button class="icon-btn accent" onclick="openAddFundSheet()">+ ADD</button>
      </div>
      <div class="scroll-y">
        <div class="bal-hero">
          <p class="bh-lbl">Total Balance</p>
          <div class="bh-amt"><span class="sym">₹</span>${sf(c.totalBal).toLocaleString('en-IN')}</div>
          <div class="bh-chips">
            <div class="bh-chip"><p class="bc-l">Cash</p><p class="bc-v" style="color:${c.cashBal<0?'var(--red)':'var(--t1)'}">₹${sf(c.cashBal).toLocaleString('en-IN')}</p></div>
            <div class="bh-chip"><p class="bc-l">Online</p><p class="bc-v" style="color:${c.onlineBal<0?'var(--red)':'var(--t1)'}">₹${sf(c.onlineBal).toLocaleString('en-IN')}</p></div>
          </div>
        </div>

        <div class="month-nav">
          <button class="mn-btn" onclick="changeWalletMonth(-1)">${I.chevL}</button>
          <p class="month-nav-lbl">${fmtMonthLong(m)}</p>
          <button class="mn-btn" onclick="changeWalletMonth(1)">${I.chevR}</button>
        </div>

        <div class="stat-row">
          <div class="stat-box"><p class="sb-lbl">Monthly Income</p><p class="sb-val inc">₹${sf(c.mInc).toLocaleString('en-IN')}</p></div>
          <div class="stat-box"><p class="sb-lbl">Monthly Expense</p><p class="sb-val exp">₹${sf(c.mExp).toLocaleString('en-IN')}</p></div>
        </div>

        <div class="budget-row">
          <div class="bgt-ring">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="${R}" stroke="rgba(255,255,255,.07)" stroke-width="4" fill="none"/>
              <circle cx="24" cy="24" r="${R}" stroke="${rc}" stroke-width="4" fill="none"
                stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-linecap="round"/>
            </svg>
            <div class="bgt-ring-center">
              <p class="bgt-pct" style="color:${rc}">${Math.round(bPct)}%</p>
              <p class="bgt-lbl">spent</p>
            </div>
          </div>
          <div class="bgt-info">
            <p class="bgt-title">Monthly Budget</p>
            <p class="bgt-sub">₹${sf(c.mExp).toLocaleString('en-IN')} / ₹${sf(budget).toLocaleString('en-IN')}</p>
            ${over?`<span class="chip chip-red" style="margin-top:4px">Over budget</span>`:''}
          </div>
          <button class="bgt-edit" onclick="openBudgetSheet()">Edit</button>
        </div>

        <div class="cal-wrap">
          <div class="cal-inner">
            <div class="cal-hdr">${['S','M','T','W','T','F','S'].map(d=>`<div class="cal-hdr-d">${d}</div>`).join('')}</div>
            <div class="cal-grid">${cells}</div>
          </div>
        </div>

        <p class="section-label">${fmtDate(APP.walletSelDate)}</p>
        <div class="list-wrap" style="padding-top:4px">${txHTML}</div>
      </div>
      <div class="fab" onclick="openAddTxSheet()">${I.plus}</div>
    </div>`;
}

function selectWalletDate(iso) { APP.walletSelDate = iso; renderWallet(); }
function changeWalletMonth(dir) {
  const [y,m] = APP.walletMonth.split('-').map(Number);
  const d = new Date(y, m-1+dir, 1);
  APP.walletMonth = getMonthKey(d);
  renderWallet();
}

function openAddTxSheet(editId=null) {
  const ex = editId ? APP.txs.find(t=>t.id===editId) : null;
  openSheet('addTx', ({body,footer,titleEl}) => {
    titleEl.textContent = editId ? 'Edit Expense' : 'New Expense';
    const selCat = ex?.cat||'food', selMeth = ex?.method||'cash';
    body.innerHTML = `
      <div class="f-group">
        <label class="f-label">Amount</label>
        <div class="amt-wrap"><span class="amt-sym">₹</span>
          <input class="f-input" id="tx-amt" type="number" inputmode="decimal" placeholder="0" min="0" step="any" value="${ex?.amount||''}"/>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Category</label>
        <div class="cat-grid" id="cat-grid">
          ${CATS.map(c=>`<div class="cat-item${c.id===selCat?' on':''}" data-cat="${c.id}" onclick="selCat(this,'${c.id}')"><span class="cat-e">${c.emoji}</span><span class="cat-n">${c.name}</span></div>`).join('')}
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Note (optional)</label>
        <input class="f-input" id="tx-note" type="text" inputmode="text" placeholder="What was this for?" maxlength="60" value="${ex?.title||''}"/>
      </div>
      <div class="f-group">
        <label class="f-label">Method</label>
        <div class="seg" id="tx-meth">
          <div class="seg-opt${selMeth==='cash'?' on':''}" onclick="selMeth(this)">💵 Cash</div>
          <div class="seg-opt${selMeth==='online'?' on':''}" onclick="selMeth(this)">📱 Online</div>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Date</label>
        <input class="f-input" id="tx-date" type="date" value="${ex?.date||APP.walletSelDate}" max="${getLocalISO()}"/>
      </div>`;
    footer.innerHTML = `<div class="foot-row">${editId?`<button class="del-btn" onclick="deleteTxOrFund('tx',${editId})">${I.trash}</button>`:''}<button class="save-btn" onclick="saveTx(${editId||'null'})">${editId?'Update':'Save'} Expense</button></div>`;
    requestAnimationFrame(()=>document.getElementById('tx-amt')?.focus());
  });
}
function openEditTx(id){openAddTxSheet(id);}

function selCat(el,id){document.querySelectorAll('#cat-grid .cat-item').forEach(i=>i.classList.remove('on'));el.classList.add('on');}
function selMeth(el){const p=el.closest('.seg');p.querySelectorAll('.seg-opt').forEach(b=>b.classList.remove('on'));el.classList.add('on');}

function saveTx(editId=null){
  const amount=sf(document.getElementById('tx-amt')?.value);
  const title=document.getElementById('tx-note')?.value?.trim()||'';
  const cat=document.querySelector('#cat-grid .cat-item.on')?.dataset.cat||'other';
  const isCash=document.querySelector('#tx-meth .seg-opt.on')?.textContent.includes('Cash');
  const method=isCash?'cash':'online';
  const date=document.getElementById('tx-date')?.value||APP.walletSelDate;
  if(!amount||amount<=0){UI.toast('Enter a valid amount');return;}
  const tx={id:editId||uid(),amount,cat,title:title||getCat(cat).name,method,date};
  if(editId){APP.txs=APP.txs.map(t=>t.id===editId?tx:t);UI.toast('Updated');}
  else{APP.txs.unshift(tx);if(APP.txs.length>1000)APP.txs=APP.txs.slice(0,1000);UI.toast('Expense added');}
  APP.walletSelDate=date;APP.save();closeSheet();renderWallet();
}

function openAddFundSheet(editId=null){
  const ex=editId?APP.funds.find(f=>f.id===editId):null;
  openSheet('addFund',({body,footer,titleEl})=>{
    titleEl.textContent=editId?'Edit Income':'Add Money';
    const selMeth=ex?.method||'cash';
    body.innerHTML=`
      <div class="f-group">
        <label class="f-label">Amount</label>
        <div class="amt-wrap grn"><span class="amt-sym">₹</span>
          <input class="f-input grn" id="fund-amt" type="number" inputmode="decimal" placeholder="0" min="0" step="any" value="${ex?.amount||''}"/>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Source</label>
        <input class="f-input" id="fund-note" type="text" inputmode="text" placeholder="Salary, Freelance, Rent…" maxlength="60" value="${ex?.note||''}"/>
      </div>
      <div class="f-group">
        <label class="f-label">Method</label>
        <div class="seg" id="fund-meth">
          <div class="seg-opt${selMeth==='cash'?' on':''}" onclick="selMeth(this)">💵 Cash</div>
          <div class="seg-opt${selMeth==='online'?' on':''}" onclick="selMeth(this)">📱 Online</div>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Date</label>
        <input class="f-input" id="fund-date" type="date" value="${ex?.date||APP.walletSelDate}" max="${getLocalISO()}"/>
      </div>`;
    footer.innerHTML=`<div class="foot-row">${editId?`<button class="del-btn" onclick="deleteTxOrFund('fund',${editId})">${I.trash}</button>`:''}<button class="save-btn grn" onclick="saveFund(${editId||'null'})">${editId?'Update':'Add'} Income</button></div>`;
    requestAnimationFrame(()=>document.getElementById('fund-amt')?.focus());
  });
}
function openEditFund(id){openAddFundSheet(id);}

function saveFund(editId=null){
  const amount=sf(document.getElementById('fund-amt')?.value);
  const note=document.getElementById('fund-note')?.value?.trim()||'Income';
  const isCash=document.querySelector('#fund-meth .seg-opt.on')?.textContent.includes('Cash');
  const method=isCash?'cash':'online';
  const date=document.getElementById('fund-date')?.value||APP.walletSelDate;
  if(!amount||amount<=0){UI.toast('Enter a valid amount');return;}
  const fund={id:editId||uid(),amount,note,method,date};
  if(editId){APP.funds=APP.funds.map(f=>f.id===editId?fund:f);UI.toast('Updated');}
  else{APP.funds.unshift(fund);if(APP.funds.length>1000)APP.funds=APP.funds.slice(0,1000);UI.toast('Income added');}
  APP.walletSelDate=date;APP.save();closeSheet();renderWallet();
  if(APP.screenHistory.includes('home'))renderHome();
}

function openBudgetSheet(){
  openSheet('budget',({body,footer,titleEl})=>{
    titleEl.textContent='Monthly Budget';
    body.innerHTML=`
      <p style="font-size:13px;color:var(--t2);margin-bottom:14px">Set your monthly spending limit.</p>
      <div class="f-group">
        <label class="f-label">Budget Amount</label>
        <div class="amt-wrap"><span class="amt-sym">₹</span>
          <input class="f-input" id="bgt-amt" type="number" inputmode="decimal" placeholder="5000" min="0" step="100" value="${APP.budget}"/>
        </div>
      </div>`;
    footer.innerHTML=`<button class="save-btn" onclick="saveBudget()">Set Budget</button>`;
    requestAnimationFrame(()=>document.getElementById('bgt-amt')?.focus());
  });
}
function saveBudget(){
  const v=sf(document.getElementById('bgt-amt')?.value);
  if(!v||v<0){UI.toast('Enter a valid budget');return;}
  APP.budget=v;APP.save();closeSheet();renderWallet();UI.toast('Budget updated');
}

function deleteTxOrFund(kind,id){
  openDialog({icon:'🗑️',title:`Delete ${kind==='tx'?'Expense':'Income'}?`,body:'This cannot be undone.',confirmLabel:'Delete',confirmClass:'confirm',onConfirm:()=>{
    if(kind==='tx')APP.txs=APP.txs.filter(t=>t.id!==id);
    else APP.funds=APP.funds.filter(f=>f.id!==id);
    APP.save();closeSheet();renderWallet();
    if(APP.screenHistory.includes('home'))renderHome();
    UI.toast('Deleted');
  }});
}
