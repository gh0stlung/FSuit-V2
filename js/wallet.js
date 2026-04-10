/* ============================================================
   FINANCE SUITE 4 — Wallet Module
   ============================================================ */

/* ── Render home screen ── */
function renderHome() {
  const el = document.getElementById('screen-home');
  const c  = walletComputed();
  const h  = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  el.innerHTML = `
    <div class="launcher-wrap">
      <div class="launcher-hero anim-up">
        <p class="launcher-greeting">${greet}</p>
        <h1 class="launcher-title">Finance<br><span class="glow">Suite</span></h1>
      </div>

      <!-- Balance card -->
      <div class="balance-hero anim-up stagger" style="margin:0 0 20px;">
        <p class="bh-label">Total Balance</p>
        <div class="bh-amount"><span class="bh-curr">₹</span>${sf(c.totalBal).toLocaleString('en-IN')}</div>
        <div class="bh-chips">
          <div class="bh-chip">
            <p class="bc-label">Cash</p>
            <p class="bc-val mono" style="color:${c.cashBal < 0 ? 'var(--c-red)' : 'var(--c-text)'}">₹${sf(c.cashBal).toLocaleString('en-IN')}</p>
          </div>
          <div class="bh-chip">
            <p class="bc-label">Online</p>
            <p class="bc-val mono" style="color:${c.onlineBal < 0 ? 'var(--c-red)' : 'var(--c-text)'}">₹${sf(c.onlineBal).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <!-- Module buttons -->
      <div class="stagger">
        <div class="module-btn gold anim-up" onclick="navigate('wallet')">
          <div class="module-icon gold">💰</div>
          <div class="module-text">
            <p class="module-name">Wallet</p>
            <p class="module-desc">Expenses & Income</p>
          </div>
          <div class="module-arr">${I.chevR}</div>
        </div>
        <div class="module-btn blue anim-up" onclick="navigate('rentbook')">
          <div class="module-icon blue">🏠</div>
          <div class="module-text">
            <p class="module-name">RentBook</p>
            <p class="module-desc">Property Manager</p>
          </div>
          <div class="module-arr">${I.chevR}</div>
        </div>
      </div>

      <div style="margin-top:auto;padding-top:20px;text-align:center">
        <button class="icon-btn" onclick="navigate('settings')" style="margin:auto;border-radius:14px;width:auto;padding:0 18px;gap:8px;font-size:13px;font-weight:600;color:var(--c-text3)">
          ${I.settings} Settings
        </button>
        <p style="margin-top:12px;font-size:11px;color:var(--c-text3);letter-spacing:0.08em">FINANCE SUITE v4 · LOCAL FIRST</p>
      </div>
    </div>
  `;
}

/* ── Render Wallet ── */
function renderWallet() {
  const el = document.getElementById('screen-wallet');
  const c  = walletComputed();
  const m  = APP.walletMonth;

  // Budget ring
  const budget    = sf(APP.budget);
  const bPct      = budget > 0 ? clamp((c.mExp / budget) * 100, 0, 100) : 0;
  const overBudget = c.mExp > budget;
  const ringColor = overBudget ? 'var(--c-red)' : bPct > 70 ? 'var(--c-accent2)' : 'var(--c-green)';
  const R = 32, circ = 2 * Math.PI * R;
  const dash = (bPct / 100) * circ;

  // Calendar
  const [y, mo] = m.split('-').map(Number);
  const dInM    = new Date(y, mo, 0).getDate();
  const startD  = new Date(y, mo - 1, 1).getDay();
  const today   = getLocalISO();

  let calCells = '';
  for (let i = 0; i < startD; i++) calCells += `<div></div>`;
  for (let d = 1; d <= dInM; d++) {
    const iso = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dd  = c.daily[iso];
    const cls = ['cal-cell',
      iso === APP.walletSelDate ? 'selected' : iso === today ? 'today' : '',
      dd ? 'has-tx' : ''
    ].filter(Boolean).join(' ');
    const dots = dd ? `<div class="cal-dot-row">${dd.exp > 0 ? '<div class="cal-dot exp"></div>' : ''}${dd.inc > 0 ? '<div class="cal-dot inc"></div>' : ''}</div>` : '';
    calCells += `<div class="${cls}" onclick="selectWalletDate('${iso}')">${d}${dots}</div>`;
  }

  // Transactions list
  let txHtml = '';
  if (!c.selEntries.length) {
    txHtml = `<div class="empty" style="padding:36px 20px">
      <div class="empty-icon">📋</div>
      <p class="empty-title">No transactions</p>
      <p class="empty-hint">on ${fmtDate(APP.walletSelDate)}</p>
    </div>`;
  } else {
    txHtml = c.selEntries.map(e => {
      const isInc = e.kind === 'income';
      const cat   = isInc ? { emoji: '💰', name: 'Income' } : getCat(e.cat);
      const iconBg = isInc ? 'var(--c-green-d)' : 'var(--c-red-d)';
      return `
        <div class="list-item" onclick="${isInc ? `openEditFund(${e.id})` : `openEditTx(${e.id})`}">
          <div class="item-icon" style="background:${iconBg}">${cat.emoji}</div>
          <div class="item-body">
            <p class="item-title">${e.title || cat.name}</p>
            <div class="item-sub">
              <span class="chip ${isInc ? 'chip-green' : 'chip-red'}">${isInc ? 'Income' : cat.name}</span>
              <span style="font-size:11px;color:var(--c-text3)">${e.method || 'cash'}</span>
            </div>
          </div>
          <div class="item-right">
            <p class="item-amount ${isInc ? 'pos' : 'neg'}">${isInc ? '+' : '-'}₹${sf(e.amount).toLocaleString('en-IN')}</p>
          </div>
          <div class="item-del-btn" onclick="event.stopPropagation();deleteTxOrFund('${isInc ? 'fund' : 'tx'}',${e.id})">${I.trash}</div>
        </div>
      `;
    }).join('');
  }

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <!-- Topbar -->
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div>
          <h1 class="topbar-title">Wallet</h1>
        </div>
        <button class="icon-btn accent" onclick="openAddFundSheet()">+ ADD</button>
      </div>

      <div class="scroll-y" id="wallet-scroll">
        <!-- Balance -->
        <div class="balance-hero">
          <p class="bh-label">Total Balance</p>
          <div class="bh-amount"><span class="bh-curr">₹</span>${sf(c.totalBal).toLocaleString('en-IN')}</div>
          <div class="bh-chips">
            <div class="bh-chip">
              <p class="bc-label">Cash</p>
              <p class="bc-val mono" style="color:${c.cashBal < 0 ? 'var(--c-red)' : 'var(--c-text)'}">₹${sf(c.cashBal).toLocaleString('en-IN')}</p>
            </div>
            <div class="bh-chip">
              <p class="bc-label">Online</p>
              <p class="bc-val mono" style="color:${c.onlineBal < 0 ? 'var(--c-red)' : 'var(--c-text)'}">₹${sf(c.onlineBal).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <!-- Month nav -->
        <div class="month-nav">
          <button class="month-nav-btn" onclick="changeWalletMonth(-1)">${I.chevL}</button>
          <p class="month-nav-label">${fmtMonthLong(m)}</p>
          <button class="month-nav-btn" onclick="changeWalletMonth(1)">${I.chevR}</button>
        </div>

        <!-- Stats -->
        <div class="stat-grid px-20 mb-8">
          <div class="stat-card">
            <p class="sc-label">Monthly Income</p>
            <p class="sc-value" style="color:var(--c-green)">₹${sf(c.mInc).toLocaleString('en-IN')}</p>
          </div>
          <div class="stat-card">
            <p class="sc-label">Monthly Expense</p>
            <p class="sc-value" style="color:var(--c-red)">₹${sf(c.mExp).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <!-- Budget -->
        <div class="px-20 mb-8">
          <div class="card no-tap" style="padding:16px;display:flex;align-items:center;gap:16px">
            <div class="budget-ring-wrap">
              <svg viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="${R}" stroke="rgba(255,255,255,0.07)" stroke-width="5" fill="none"/>
                <circle cx="36" cy="36" r="${R}" stroke="${ringColor}" stroke-width="5" fill="none"
                  stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-linecap="round"/>
              </svg>
              <div class="budget-ring-center">
                <p class="budget-ring-pct" style="color:${ringColor}">${Math.round(bPct)}%</p>
                <p class="budget-ring-lbl">spent</p>
              </div>
            </div>
            <div style="flex:1">
              <p style="font-size:14px;font-weight:700;margin-bottom:4px">Monthly Budget</p>
              <p class="mono" style="font-size:13px;color:var(--c-text2)">₹${sf(c.mExp).toLocaleString('en-IN')} / ₹${sf(budget).toLocaleString('en-IN')}</p>
              ${overBudget ? `<p class="chip chip-red" style="margin-top:6px;display:inline-flex">Over budget!</p>` : ''}
            </div>
            <button class="btn btn-ghost btn-sm" onclick="openBudgetSheet()">Edit</button>
          </div>
        </div>

        <!-- Calendar -->
        <div class="px-20 mb-8">
          <div class="card no-tap" style="padding:14px">
            <div class="cal-hdr-row">
              ${['S','M','T','W','T','F','S'].map(d => `<div class="cal-hdr-cell">${d}</div>`).join('')}
            </div>
            <div class="cal-grid">${calCells}</div>
          </div>
        </div>

        <!-- Transactions for selected date -->
        <p class="section-label">${fmtDate(APP.walletSelDate)}</p>
        <div class="list-wrap pt-4">${txHtml}</div>
      </div>

      <!-- FAB -->
      <div class="fab" onclick="openAddTxSheet()">
        ${I.plus}
      </div>
    </div>
  `;
}

/* ── Wallet actions ── */
function selectWalletDate(iso) {
  APP.walletSelDate = iso;
  renderWallet();
}

function changeWalletMonth(dir) {
  const [y, m] = APP.walletMonth.split('-').map(Number);
  const nd = new Date(y, m - 1 + dir, 1);
  APP.walletMonth = getMonthKey(nd);
  renderWallet();
}

/* ── Add/Edit Expense sheet ── */
function openAddTxSheet(editId = null) {
  let existing = null;
  if (editId) existing = APP.txs.find(t => t.id === editId);

  openSheet('addTx', ({ body, footer, titleEl }) => {
    titleEl.textContent = editId ? 'Edit Expense' : 'New Expense';

    let selCat    = existing?.cat    || 'food';
    let selMethod = existing?.method || 'cash';

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Amount</label>
        <div class="amount-wrap">
          <span class="rupee-prefix">₹</span>
          <input class="form-input" id="tx-amount" type="number" inputmode="decimal"
            placeholder="0" min="0" step="any"
            value="${existing?.amount || ''}" autocomplete="off"/>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Category</label>
        <div class="cat-grid" id="cat-grid">
          ${CATS.map(c => `
            <div class="cat-item ${c.id === selCat ? 'sel' : ''}" data-cat="${c.id}" onclick="selectCat(this, '${c.id}')">
              <span class="cat-emoji">${c.emoji}</span>
              <span class="cat-name">${c.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Note (optional)</label>
        <input class="form-input" id="tx-title" type="text" inputmode="text"
          placeholder="What was this for?" maxlength="60"
          value="${existing?.title || ''}" autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label">Payment Method</label>
        <div class="seg-ctrl" id="method-ctrl">
          <div class="seg-btn ${selMethod === 'cash' ? 'active' : ''}" onclick="selectMethod(this,'cash')">💵 Cash</div>
          <div class="seg-btn ${selMethod === 'online' ? 'active' : ''}" onclick="selectMethod(this,'online')">📱 Online</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="tx-date" type="date"
          value="${existing?.date || APP.walletSelDate}" max="${getLocalISO()}"/>
      </div>
    `;

    footer.innerHTML = `
      <div style="display:flex;gap:10px">
        ${editId ? `<button class="btn btn-danger" onclick="deleteTxOrFund('tx',${editId})">${I.trash}</button>` : ''}
        <button class="btn btn-primary btn-full" onclick="saveTx(${editId || 'null'})">
          ${editId ? 'Update' : 'Save'} Expense
        </button>
      </div>
    `;

    requestAnimationFrame(() => document.getElementById('tx-amount')?.focus());
  });
}

function openEditTx(id) { openAddTxSheet(id); }

function selectCat(el, id) {
  document.querySelectorAll('#cat-grid .cat-item').forEach(i => i.classList.remove('sel'));
  el.classList.add('sel');
}

function selectMethod(el, val) {
  document.querySelectorAll('#method-ctrl .seg-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function saveTx(editId = null) {
  const amount = sf(document.getElementById('tx-amount')?.value);
  const title  = document.getElementById('tx-title')?.value?.trim() || '';
  const cat    = document.querySelector('#cat-grid .cat-item.sel')?.dataset.cat || 'other';
  const method = document.querySelector('#method-ctrl .seg-btn.active')?.textContent.trim().toLowerCase().includes('cash') ? 'cash' : 'online';
  const date   = document.getElementById('tx-date')?.value || APP.walletSelDate;

  if (!amount || amount <= 0) { UI.toast('Enter a valid amount'); return; }

  const tx = {
    id:     editId || uid(),
    amount, cat,
    title:  title || getCat(cat).name,
    method, date
  };

  if (editId) {
    APP.txs = APP.txs.map(t => t.id === editId ? tx : t);
    UI.toast('Expense updated');
  } else {
    APP.txs.unshift(tx);
    if (APP.txs.length > 1000) APP.txs = APP.txs.slice(0, 1000);
    UI.toast('Expense added');
  }

  APP.walletSelDate = date;
  APP.save();
  closeSheet();
  renderWallet();
}

/* ── Add/Edit Income sheet ── */
function openAddFundSheet(editId = null) {
  let existing = null;
  if (editId) existing = APP.funds.find(f => f.id === editId);

  openSheet('addFund', ({ body, footer, titleEl }) => {
    titleEl.textContent = editId ? 'Edit Income' : 'Add Money';

    let selMethod = existing?.method || 'cash';

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Amount</label>
        <div class="amount-wrap">
          <span class="rupee-prefix" style="color:var(--c-green)">₹</span>
          <input class="form-input" id="fund-amount" type="number" inputmode="decimal"
            placeholder="0" min="0" step="any"
            value="${existing?.amount || ''}" autocomplete="off"
            style="color:var(--c-green)"/>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Source</label>
        <input class="form-input" id="fund-note" type="text" inputmode="text"
          placeholder="e.g. Salary, Freelance, Rent…" maxlength="60"
          value="${existing?.note || ''}" autocomplete="off"/>
      </div>

      <div class="form-group">
        <label class="form-label">Method</label>
        <div class="seg-ctrl" id="fund-method">
          <div class="seg-btn ${selMethod === 'cash' ? 'active' : ''}" onclick="selectMethod(this,'cash')">💵 Cash</div>
          <div class="seg-btn ${selMethod === 'online' ? 'active' : ''}" onclick="selectMethod(this,'online')">📱 Online</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="fund-date" type="date"
          value="${existing?.date || APP.walletSelDate}" max="${getLocalISO()}"/>
      </div>
    `;

    footer.innerHTML = `
      <div style="display:flex;gap:10px">
        ${editId ? `<button class="btn btn-danger" onclick="deleteTxOrFund('fund',${editId})">${I.trash}</button>` : ''}
        <button class="btn btn-success btn-full" onclick="saveFund(${editId || 'null'})">
          ${editId ? 'Update' : 'Add'} Income
        </button>
      </div>
    `;

    requestAnimationFrame(() => document.getElementById('fund-amount')?.focus());
  });
}

function openEditFund(id) { openAddFundSheet(id); }

function saveFund(editId = null) {
  const amount = sf(document.getElementById('fund-amount')?.value);
  const note   = document.getElementById('fund-note')?.value?.trim() || 'Income';
  const method = document.querySelector('#fund-method .seg-btn.active')?.textContent.trim().toLowerCase().includes('cash') ? 'cash' : 'online';
  const date   = document.getElementById('fund-date')?.value || APP.walletSelDate;

  if (!amount || amount <= 0) { UI.toast('Enter a valid amount'); return; }

  const fund = { id: editId || uid(), amount, note, method, date };

  if (editId) {
    APP.funds = APP.funds.map(f => f.id === editId ? fund : f);
    UI.toast('Income updated');
  } else {
    APP.funds.unshift(fund);
    if (APP.funds.length > 1000) APP.funds = APP.funds.slice(0, 1000);
    UI.toast('Income added');
  }

  APP.walletSelDate = date;
  APP.save();
  closeSheet();
  renderWallet();
  // Refresh home if it's in history
  if (APP.screenHistory.includes('home')) renderHome();
}

/* ── Budget sheet ── */
function openBudgetSheet() {
  openSheet('budget', ({ body, footer, titleEl }) => {
    titleEl.textContent = 'Monthly Budget';

    body.innerHTML = `
      <p style="font-size:14px;color:var(--c-text2);margin-bottom:16px">Set your monthly spending limit to track progress.</p>
      <div class="form-group">
        <label class="form-label">Budget Amount</label>
        <div class="amount-wrap">
          <span class="rupee-prefix">₹</span>
          <input class="form-input" id="budget-amount" type="number" inputmode="decimal"
            placeholder="5000" min="0" step="100"
            value="${APP.budget}" autocomplete="off"/>
        </div>
      </div>
    `;

    footer.innerHTML = `<button class="btn btn-primary btn-full" onclick="saveBudget()">Set Budget</button>`;
    requestAnimationFrame(() => document.getElementById('budget-amount')?.focus());
  });
}

function saveBudget() {
  const v = sf(document.getElementById('budget-amount')?.value);
  if (!v || v < 0) { UI.toast('Enter a valid budget'); return; }
  APP.budget = v;
  APP.save();
  closeSheet();
  renderWallet();
  UI.toast('Budget updated');
}

/* ── Delete tx/fund ── */
function deleteTxOrFund(kind, id) {
  openDialog({
    icon: '🗑️',
    title: `Delete ${kind === 'tx' ? 'Expense' : 'Income'}?`,
    body: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      if (kind === 'tx')   APP.txs   = APP.txs.filter(t => t.id !== id);
      if (kind === 'fund') APP.funds = APP.funds.filter(f => f.id !== id);
      APP.save();
      closeSheet();
      renderWallet();
      if (APP.screenHistory.includes('home')) renderHome();
      UI.toast('Deleted');
    }
  });
}
