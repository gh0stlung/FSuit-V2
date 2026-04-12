'use strict';

/* ── Storage ── */
const DB = 'fs4_';
const db = {
  get(k, def=null) { try { const r=localStorage.getItem(DB+k); return r!==null?JSON.parse(r):def; } catch{return def;} },
  set(k,v) { try{localStorage.setItem(DB+k,JSON.stringify(v));}catch(e){console.warn(e);} }
};

/* ── Migrate old data ── */
function migrateData() {
  for (const pre of ['v50_','fs3_','v49_']) {
    try {
      if (!db.get('txs') && localStorage.getItem(pre+'walletTxs')) {
        const p=JSON.parse(localStorage.getItem(pre+'walletTxs')); const d=p?.d??p;
        if (Array.isArray(d)&&d.length) db.set('txs',d);
      }
      if (!db.get('funds') && localStorage.getItem(pre+'walletFunds')) {
        const p=JSON.parse(localStorage.getItem(pre+'walletFunds')); const d=p?.d??p;
        if (Array.isArray(d)&&d.length) db.set('funds',d);
      }
      if (!db.get('tenants') && localStorage.getItem(pre+'rentTracker')) {
        const p=JSON.parse(localStorage.getItem(pre+'rentTracker')); const d=p?.d??p;
        if (Array.isArray(d)&&d.length) db.set('tenants',d);
      }
    } catch {}
  }
}

/* ── State ── */
const APP = {
  txs:[], funds:[], tenants:[], budget:5000,
  currentScreen:'home', screenHistory:[],
  activeTenantId:null, walletMonth:null, walletSelDate:null,
  expandedRecords:{},
  init() {
    migrateData();
    this.txs     = db.get('txs',[]);
    this.funds   = db.get('funds',[]);
    this.tenants = db.get('tenants',[]);
    this.budget  = db.get('budget',5000);
    this.walletMonth   = getMonthKey(new Date());
    this.walletSelDate = getLocalISO();
  },
  save() {
    db.set('txs',this.txs); db.set('funds',this.funds);
    db.set('tenants',this.tenants); db.set('budget',this.budget);
  }
};

/* ── Utils ── */
function getLocalISO() {
  const d=new Date(), off=d.getTimezoneOffset()*60000;
  return new Date(d.getTime()-off).toISOString().slice(0,10);
}
function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}
function parseISO(iso) {
  if(!iso) return new Date();
  const [y,m,d]=iso.split('-'); return new Date(+y,+m-1,+d);
}
function fmtDate(iso) {
  if(!iso) return '';
  return parseISO(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'});
}
function fmtMonthLong(iso) {
  return new Date(iso+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'});
}
function sf(v) { const n=parseFloat(v); return isNaN(n)?0:Math.round(n*100)/100; }
function uid() { return Date.now()+Math.floor(Math.random()*9999); }
function clamp(v,min,max) { return Math.max(min,Math.min(max,v)); }

/* ── Icons ── */
const I = {
  back:     `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4L5 9l6 5"/></svg>`,
  plus:     `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/></svg>`,
  chevR:    `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l4 4-4 4"/></svg>`,
  chevL:    `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L5 7l4 4"/></svg>`,
  trash:    `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h9M5 3V2h3v1M3.5 3l.7 8h4.6l.7-8M5.5 6v3M7.5 6v3"/></svg>`,
  edit:     `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2l3 3L5 14H2v-3L11 2z"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/></svg>`,
  home:     `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7L7 2l5 5v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7z"/><path d="M5 13V9h4v4"/></svg>`,
  bolt:     `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1L2 7h4l-1 4 5-6H6l1-4z"/></svg>`,
  close:    `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="11" y2="11"/><line x1="11" y1="2" x2="2" y2="11"/></svg>`,
};

/* ── Navigation ── */
function navigate(to, fromDir='right') {
  const from=APP.currentScreen;
  if(from===to) return;
  const fromEl=document.getElementById('screen-'+from);
  const toEl=document.getElementById('screen-'+to);
  if(!fromEl||!toEl) return;
  APP.screenHistory.push(from);
  APP.currentScreen=to;
  renderScreen(to);
  const exitAnim = fromDir==='right'?'exiting-left':'exiting-right';
  const enterAnim = fromDir==='right'?'from-right':'from-left';
  fromEl.dataset.state=exitAnim;
  toEl.dataset.state='active';
  toEl.classList.add(enterAnim);
  setTimeout(()=>{ fromEl.dataset.state='hidden'; toEl.classList.remove(enterAnim); },360);
}

function goBack() {
  if(UI.sheetOpen){closeSheet();return;}
  if(UI.dialogOpen){closeDialog();return;}
  const prev=APP.screenHistory.pop();
  if(!prev) return;
  const fromEl=document.getElementById('screen-'+APP.currentScreen);
  const toEl=document.getElementById('screen-'+prev);
  if(!fromEl||!toEl) return;
  APP.currentScreen=prev;
  renderScreen(prev);
  fromEl.dataset.state='exiting-right';
  toEl.dataset.state='active';
  toEl.classList.add('from-left');
  setTimeout(()=>{ fromEl.dataset.state='hidden'; toEl.classList.remove('from-left'); },360);
}

/* ── Sheet ── */
const UI = {
  sheetOpen:false, dialogOpen:false, _toast:null,
  toast(msg,dur=2200) {
    const el=document.getElementById('toast');
    el.textContent=msg; el.classList.add('show');
    clearTimeout(this._toast);
    this._toast=setTimeout(()=>el.classList.remove('show'),dur);
  }
};

let _sheetId=null;
function openSheet(id, renderFn) {
  _sheetId=id; UI.sheetOpen=true;
  const bd=document.getElementById('sheet-backdrop');
  const sh=document.getElementById('sheet');
  const body=document.getElementById('sheet-body');
  const footer=document.getElementById('sheet-footer');
  const titleEl=document.getElementById('sheet-title');
  body.innerHTML=''; footer.innerHTML='';
  renderFn({body,footer,titleEl});
  bd.classList.add('open'); sh.classList.add('open');
  history.pushState({sheet:id},'');
}
function closeSheet() {
  _sheetId=null; UI.sheetOpen=false;
  document.getElementById('sheet-backdrop').classList.remove('open');
  document.getElementById('sheet').classList.remove('open');
}

/* ── Dialog ── */
let _dlgCb=null;
function openDialog({icon='🗑️',title,body,confirmLabel='Delete',confirmClass='confirm',onConfirm}) {
  _dlgCb=onConfirm; UI.dialogOpen=true;
  document.getElementById('dlg-icon').textContent=icon;
  document.getElementById('dlg-title').textContent=title;
  document.getElementById('dlg-body').textContent=body||'';
  const btn=document.getElementById('dlg-confirm');
  btn.textContent=confirmLabel; btn.className='dlg-btn '+confirmClass;
  document.getElementById('dialog-backdrop').classList.add('open');
  history.pushState({dialog:true},'');
}
function closeDialog() {
  UI.dialogOpen=false; _dlgCb=null;
  document.getElementById('dialog-backdrop').classList.remove('open');
}
function confirmDialog() { const fn=_dlgCb; closeDialog(); if(fn) fn(); }

/* ── Render dispatcher ── */
function renderScreen(name) {
  ({home:renderHome,wallet:renderWallet,rentbook:renderRentBook,rentdetail:renderRentDetail,settings:renderSettings}[name]||(() => {}))();
}

/* ── Computed: Wallet ── */
function walletComputed() {
  const m=APP.walletMonth;
  const allInc=APP.funds.reduce((s,f)=>s+sf(f.amount),0);
  const allExp=APP.txs.reduce((s,t)=>s+sf(t.amount),0);
  const totalBal=sf(allInc-allExp);
  const cashBal=sf(APP.funds.filter(f=>f.method==='cash').reduce((s,f)=>s+sf(f.amount),0)-APP.txs.filter(t=>t.method==='cash').reduce((s,t)=>s+sf(t.amount),0));
  const onlineBal=sf(APP.funds.filter(f=>f.method==='online').reduce((s,f)=>s+sf(f.amount),0)-APP.txs.filter(t=>t.method==='online').reduce((s,t)=>s+sf(t.amount),0));
  const mInc=APP.funds.filter(f=>f.date.startsWith(m)).reduce((s,f)=>s+sf(f.amount),0);
  const mExp=APP.txs.filter(t=>t.date.startsWith(m)).reduce((s,t)=>s+sf(t.amount),0);
  const daily={};
  APP.txs.filter(t=>t.date.startsWith(m)).forEach(t=>{ if(!daily[t.date])daily[t.date]={exp:0,inc:0}; daily[t.date].exp+=sf(t.amount); });
  APP.funds.filter(f=>f.date.startsWith(m)).forEach(f=>{ if(!daily[f.date])daily[f.date]={exp:0,inc:0}; daily[f.date].inc+=sf(f.amount); });
  const sel=APP.walletSelDate;
  const selEntries=[
    ...APP.txs.filter(t=>t.date===sel).map(t=>({...t,kind:'expense'})),
    ...APP.funds.filter(f=>f.date===sel).map(f=>({...f,kind:'income',cat:'income'}))
  ].sort((a,b)=>b.id-a.id);
  return {totalBal,cashBal,onlineBal,mInc,mExp,daily,selEntries};
}

/* ── Computed: Tenant ── */
function tenantComputed(t) {
  if(!t||!t.records||!t.records.length) return {balance:0,records:[]};
  const sorted=[...t.records].sort((a,b)=>a.monthISO.localeCompare(b.monthISO));
  let running=0;
  const records=sorted.map(r=>{
    const opening=running;
    const billTotal=sf(sf(r.rentAmount)+sf(r.electricBill));
    const paidTotal=(r.payments||[]).reduce((s,p)=>s+sf(p.amount),0);
    running=sf(opening+billTotal-paidTotal);
    return {...r,opening,billTotal,paidTotal,runningBalance:running};
  });
  return {balance:running,records:records.reverse()};
}

/* ── Categories ── */
const CATS=[
  {id:'food',   emoji:'🍱',name:'Food'},
  {id:'veg',    emoji:'🥦',name:'Veg'},
  {id:'grocery',emoji:'🛒',name:'Grocery'},
  {id:'petrol', emoji:'⛽',name:'Petrol'},
  {id:'medical',emoji:'💊',name:'Medical'},
  {id:'shop',   emoji:'🛍️',name:'Shopping'},
  {id:'house',  emoji:'🏠',name:'Housing'},
  {id:'travel', emoji:'🚗',name:'Travel'},
  {id:'bill',   emoji:'⚡',name:'Bills'},
  {id:'other',  emoji:'📦',name:'Other'},
];
function getCat(id){return CATS.find(c=>c.id===id)||CATS[CATS.length-1];}
