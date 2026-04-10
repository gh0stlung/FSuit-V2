/* ============================================================
   FINANCE SUITE 4 — Core App
   State management, routing, storage, utilities
   ============================================================ */

'use strict';

/* ── Storage ── */
const DB_KEY = 'fs4_';

const db = {
  get(k, def = null) {
    try {
      const raw = localStorage.getItem(DB_KEY + k);
      return raw !== null ? JSON.parse(raw) : def;
    } catch { return def; }
  },
  set(k, v) {
    try { localStorage.setItem(DB_KEY + k, JSON.stringify(v)); } catch(e) { console.warn('Storage full', e); }
  }
};

/* ── Migrate from old versions ── */
function migrateData() {
  const prefixes = ['v50_', 'fs3_', 'v49_'];
  for (const pre of prefixes) {
    try {
      if (!db.get('txs') && localStorage.getItem(pre + 'walletTxs')) {
        const p = JSON.parse(localStorage.getItem(pre + 'walletTxs'));
        const d = p?.d ?? p;
        if (Array.isArray(d) && d.length) db.set('txs', d);
      }
      if (!db.get('funds') && localStorage.getItem(pre + 'walletFunds')) {
        const p = JSON.parse(localStorage.getItem(pre + 'walletFunds'));
        const d = p?.d ?? p;
        if (Array.isArray(d) && d.length) db.set('funds', d);
      }
      if (!db.get('tenants') && localStorage.getItem(pre + 'rentTracker')) {
        const p = JSON.parse(localStorage.getItem(pre + 'rentTracker'));
        const d = p?.d ?? p;
        if (Array.isArray(d) && d.length) db.set('tenants', d);
      }
    } catch {}
  }
}

/* ── App State ── */
const APP = {
  // Data
  txs:     [],
  funds:   [],
  tenants: [],
  budget:  5000,

  // UI
  currentScreen: 'home',
  screenHistory: [],
  activeTenantId: null,
  walletMonth: null,       // 'YYYY-MM'
  walletSelDate: null,     // 'YYYY-DD-MM'
  expandedRecords: {},

  init() {
    migrateData();
    this.txs     = db.get('txs', []);
    this.funds   = db.get('funds', []);
    this.tenants = db.get('tenants', []);
    this.budget  = db.get('budget', 5000);
    this.walletMonth   = getMonthKey(new Date());
    this.walletSelDate = getLocalISO();
  },

  save() {
    db.set('txs',     this.txs);
    db.set('funds',   this.funds);
    db.set('tenants', this.tenants);
    db.set('budget',  this.budget);
  }
};

/* ── Utilities ── */
function getLocalISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseISO(iso) {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-');
  return new Date(+y, +m - 1, +d);
}

function fmtDate(iso) {
  if (!iso) return '';
  return parseISO(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function fmtMonthLong(iso) {
  const d = new Date(iso + '-01');
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function sf(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function fmtINR(v, showSign = false) {
  const n = sf(v);
  const str = Math.abs(n).toLocaleString('en-IN');
  if (showSign && n < 0) return `-₹${str}`;
  if (showSign && n > 0) return `+₹${str}`;
  return `₹${str}`;
}

function uid() { return Date.now() + Math.floor(Math.random() * 1000); }

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* ── Icons (inline SVG strings) ── */
const I = {
  back:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4L6 10l6 6"/></svg>`,
  plus:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/></svg>`,
  chevR:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4l6 6-6 6"/></svg>`,
  chevL:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4L6 10l6 6"/></svg>`,
  chevDown: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l6 6 6-6"/></svg>`,
  close:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>`,
  trash:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h14M8 5V3h4v2M5 5l1 12h8l1-12M8 9v5M12 9v5"/></svg>`,
  edit:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2l4 4L5 19H1v-4L14 2z"/></svg>`,
  settings: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></svg>`,
  home:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9L10 3l7 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M7 19v-6h6v6"/></svg>`,
  wallet:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 8h16"/><circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  building: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="2" width="14" height="17" rx="1"/><path d="M7 7h2M11 7h2M7 11h2M11 11h2M7 19v-5h6v5"/></svg>`,
  bolt:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z"/></svg>`,
  rupee:    `<svg viewBox="0 0 20 20" fill="currentColor"><text x="3" y="16" font-size="14" font-weight="600">₹</text></svg>`,
  cal:      `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v2M13 2v2"/></svg>`,
  check:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l5 5 8-8"/></svg>`,
};

/* ── Router ── */
function navigate(to, fromDir = 'right') {
  const fromScreen = APP.currentScreen;
  if (fromScreen === to) return;

  const fromEl = document.getElementById(`screen-${fromScreen}`);
  const toEl   = document.getElementById(`screen-${to}`);
  if (!fromEl || !toEl) return;

  APP.screenHistory.push(fromScreen);
  APP.currentScreen = to;

  // Render destination before showing
  renderScreen(to);

  const exitAnim = fromDir === 'right' ? 'exiting-left' : 'exiting-right';
  const enterAnim = fromDir === 'right' ? 'from-right' : 'from-left';

  fromEl.dataset.state = exitAnim;
  toEl.dataset.state = 'active';
  toEl.classList.add(enterAnim);

  setTimeout(() => {
    fromEl.dataset.state = 'hidden';
    fromEl.classList.remove(exitAnim);
    toEl.classList.remove(enterAnim);
  }, 380);
}

function goBack() {
  // If a sheet is open, close it first
  if (UI.sheetOpen) { closeSheet(); return; }
  if (UI.dialogOpen) { closeDialog(); return; }

  const prev = APP.screenHistory.pop();
  if (!prev) return;

  const fromEl = document.getElementById(`screen-${APP.currentScreen}`);
  const toEl   = document.getElementById(`screen-${prev}`);
  if (!fromEl || !toEl) return;

  APP.currentScreen = prev;
  renderScreen(prev);

  fromEl.dataset.state = 'exiting-right';
  toEl.dataset.state = 'active';
  toEl.classList.add('from-left');

  setTimeout(() => {
    fromEl.dataset.state = 'hidden';
    toEl.classList.remove('from-left');
  }, 380);
}

window.addEventListener('popstate', () => goBack());

/* ── UI helpers ── */
const UI = {
  sheetOpen: false,
  dialogOpen: false,
  toastTimer: null,

  toast(msg, duration = 2200) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  }
};

/* ── Sheet system ── */
let currentSheet = null;

function openSheet(id, renderFn) {
  currentSheet = id;
  UI.sheetOpen = true;

  const backdrop = document.getElementById('sheet-backdrop');
  const sheet    = document.getElementById('sheet');
  const body     = document.getElementById('sheet-body');
  const footer   = document.getElementById('sheet-footer');
  const titleEl  = document.getElementById('sheet-title');

  // Reset content
  body.innerHTML = '';
  footer.innerHTML = '';

  renderFn({ body, footer, titleEl });

  backdrop.classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';

  history.pushState({ sheet: id }, '');
}

function closeSheet() {
  currentSheet = null;
  UI.sheetOpen = false;

  const backdrop = document.getElementById('sheet-backdrop');
  const sheet    = document.getElementById('sheet');

  backdrop.classList.remove('open');
  sheet.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Dialog system ── */
let dialogCallback = null;

function openDialog({ icon = '🗑️', title, body, confirmLabel = 'Delete', confirmClass = 'btn-danger', onConfirm }) {
  dialogCallback = onConfirm;
  UI.dialogOpen = true;

  document.getElementById('dlg-icon').textContent  = icon;
  document.getElementById('dlg-title').textContent = title;
  document.getElementById('dlg-body').textContent  = body || '';
  document.getElementById('dlg-confirm').textContent = confirmLabel;
  document.getElementById('dlg-confirm').className = `btn ${confirmClass}`;

  document.getElementById('dialog-backdrop').classList.add('open');
  history.pushState({ dialog: true }, '');
}

function closeDialog() {
  UI.dialogOpen = false;
  dialogCallback = null;
  document.getElementById('dialog-backdrop').classList.remove('open');
}

function confirmDialog() {
  const fn = dialogCallback;
  closeDialog();
  if (fn) fn();
}

/* ── Render dispatcher ── */
function renderScreen(name) {
  switch (name) {
    case 'home':       renderHome();       break;
    case 'wallet':     renderWallet();     break;
    case 'rentbook':   renderRentBook();   break;
    case 'rentdetail': renderRentDetail(); break;
    case 'settings':   renderSettings();   break;
  }
}

/* ── Wallet computed ── */
function walletComputed() {
  const m = APP.walletMonth;

  // All-time balances
  const totalInc  = APP.funds.reduce((s, f) => s + sf(f.amount), 0);
  const totalExp  = APP.txs.reduce((s, t) => s + sf(t.amount), 0);
  const totalBal  = sf(totalInc - totalExp);

  const cashInc   = APP.funds.filter(f => f.method === 'cash').reduce((s, f) => s + sf(f.amount), 0);
  const cashExp   = APP.txs.filter(t => t.method === 'cash').reduce((s, t) => s + sf(t.amount), 0);
  const cashBal   = sf(cashInc - cashExp);
  const onlineInc = APP.funds.filter(f => f.method === 'online').reduce((s, f) => s + sf(f.amount), 0);
  const onlineExp = APP.txs.filter(t => t.method === 'online').reduce((s, t) => s + sf(t.amount), 0);
  const onlineBal = sf(onlineInc - onlineExp);

  // Monthly
  const mFunds = APP.funds.filter(f => f.date.startsWith(m));
  const mTxs   = APP.txs.filter(t => t.date.startsWith(m));
  const mInc   = mFunds.reduce((s, f) => s + sf(f.amount), 0);
  const mExp   = mTxs.reduce((s, t) => s + sf(t.amount), 0);

  // Daily map for calendar dots
  const daily = {};
  mTxs.forEach(t => {
    if (!daily[t.date]) daily[t.date] = { exp: 0, inc: 0 };
    daily[t.date].exp += sf(t.amount);
  });
  mFunds.forEach(f => {
    if (!daily[f.date]) daily[f.date] = { exp: 0, inc: 0 };
    daily[f.date].inc += sf(f.amount);
  });

  // Selected day entries
  const sel = APP.walletSelDate;
  const selEntries = [
    ...APP.txs.filter(t => t.date === sel).map(t => ({ ...t, kind: 'expense' })),
    ...APP.funds.filter(f => f.date === sel).map(f => ({ ...f, kind: 'income', cat: 'income' }))
  ].sort((a, b) => b.id - a.id);

  return { totalBal, cashBal, onlineBal, mInc, mExp, daily, selEntries };
}

/* ── Tenant computed ── */
function tenantComputed(t) {
  if (!t || !t.records || !t.records.length) return { balance: 0, records: [] };

  const sorted = [...t.records].sort((a, b) => a.monthISO.localeCompare(b.monthISO));
  let running = 0;

  const records = sorted.map(r => {
    const opening   = running;
    const billTotal = sf(sf(r.rentAmount) + sf(r.electricBill));
    const paidTotal = (r.payments || []).reduce((s, p) => s + sf(p.amount), 0);
    running = sf(opening + billTotal - paidTotal);
    return { ...r, opening, billTotal, paidTotal, runningBalance: running };
  });

  return { balance: running, records: records.reverse() };
}

/* ── CATEGORIES ── */
const CATS = [
  { id: 'food',    emoji: '🍱', name: 'Food' },
  { id: 'veg',     emoji: '🥦', name: 'Veg' },
  { id: 'grocery', emoji: '🛒', name: 'Grocery' },
  { id: 'petrol',  emoji: '⛽', name: 'Petrol' },
  { id: 'medical', emoji: '💊', name: 'Medical' },
  { id: 'shop',    emoji: '🛍️', name: 'Shopping' },
  { id: 'house',   emoji: '🏠', name: 'Housing' },
  { id: 'travel',  emoji: '🚗', name: 'Travel' },
  { id: 'bill',    emoji: '⚡', name: 'Bills' },
  { id: 'other',   emoji: '📦', name: 'Other' },
];

function getCat(id) { return CATS.find(c => c.id === id) || CATS[CATS.length - 1]; }
