/* ============================================================
   FINANCE SUITE 4 — RentBook Module
   ============================================================ */

/* ── Render RentBook list ── */
function renderRentBook() {
  const el = document.getElementById('screen-rentbook');

  const total   = APP.tenants.length;
  const due     = APP.tenants.filter(t => tenantComputed(t).balance > 0).length;
  const cleared = APP.tenants.filter(t => tenantComputed(t).balance <= 0).length;

  const tenantHTML = APP.tenants.length === 0
    ? `<div class="empty"><div class="empty-icon">🏠</div><p class="empty-title">No tenants yet</p><p class="empty-hint">Tap + to add your first tenant</p></div>`
    : APP.tenants.map(t => {
        const st  = tenantComputed(t);
        const bal = st.balance;
        const balClass = bal > 0 ? 'due' : bal < 0 ? 'adv' : 'clear';
        const balText  = bal === 0 ? 'Settled' : `₹${Math.abs(bal).toLocaleString('en-IN')}`;
        const balLabel = bal > 0 ? 'due' : bal < 0 ? 'advance' : '';
        return `
          <div class="tenant-item" onclick="openTenantDetail(${t.id})">
            <div class="tenant-avatar">${(t.name || '?')[0].toUpperCase()}</div>
            <div class="tenant-info">
              <p class="tenant-name">${t.name}</p>
              <p class="tenant-house">${t.houseNo || 'No house no.'} · ₹${sf(t.baseRent).toLocaleString('en-IN')}/mo</p>
            </div>
            <div class="tenant-right">
              <p class="tenant-balance ${balClass}">${balText}</p>
              ${balLabel ? `<p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--c-text3)">${balLabel}</p>` : ''}
            </div>
            <div class="item-del-btn" onclick="event.stopPropagation();deleteTenant(${t.id})">${I.trash}</div>
          </div>
        `;
      }).join('');

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div><h1 class="topbar-title">RentBook</h1></div>
        <div style="width:40px"></div>
      </div>

      <div class="scroll-y">
        <!-- Summary -->
        <div class="rent-summary">
          <div class="rsm-card">
            <p class="rsm-val">${total}</p>
            <p class="rsm-lbl">Tenants</p>
          </div>
          <div class="rsm-card danger">
            <p class="rsm-val">${due}</p>
            <p class="rsm-lbl">Due</p>
          </div>
          <div class="rsm-card success">
            <p class="rsm-val">${cleared}</p>
            <p class="rsm-lbl">Cleared</p>
          </div>
        </div>

        <p class="section-label">All Tenants</p>
        <div class="list-wrap pt-4">${tenantHTML}</div>
      </div>

      <div class="fab" onclick="openTenantSheet(null)">
        ${I.plus}
      </div>
    </div>
  `;
}

/* ── Render Tenant Detail ── */
function renderRentDetail() {
  const el = document.getElementById('screen-rentdetail');
  const t  = APP.tenants.find(t => t.id === APP.activeTenantId);
  if (!t) { goBack(); return; }

  const st  = tenantComputed(t);
  const bal = st.balance;
  const balClass = bal > 0 ? 'due' : bal < 0 ? 'adv' : 'clear';
  const balAmt   = bal === 0 ? 'Settled' : `₹${Math.abs(bal).toLocaleString('en-IN')}`;
  const balLabel = bal > 0 ? 'BALANCE DUE' : bal < 0 ? 'ADVANCE PAID' : 'ALL CLEAR';
  const balLabelColor = bal > 0 ? 'var(--c-red)' : bal < 0 ? 'var(--c-green)' : 'var(--c-text3)';

  const recordsHTML = st.records.length === 0
    ? `<div class="empty"><div class="empty-icon">📋</div><p class="empty-title">No bills yet</p><p class="empty-hint">Tap "New Bill" to create the first bill</p></div>`
    : st.records.map(r => buildRecordCard(r, t)).join('');

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div>
          <h1 class="topbar-title" style="font-size:19px">${t.name}</h1>
          <p class="topbar-subtitle">${t.houseNo || ''}</p>
        </div>
        <button class="icon-btn" onclick="openTenantSheet(${t.id})">${I.edit}</button>
      </div>

      <div class="scroll-y">
        <!-- Hero balance -->
        <div class="tenant-hero">
          <p class="th-name">${t.name}</p>
          <p class="th-meta">${t.houseNo || ''} · ₹${sf(t.baseRent).toLocaleString('en-IN')}/mo</p>
          <div class="th-balance ${balClass}">
            ${bal !== 0 ? `<span class="th-curr">₹</span>${Math.abs(bal).toLocaleString('en-IN')}` : 'Settled'}
          </div>
          <p style="margin-top:6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${balLabelColor}">${balLabel}</p>
          <button class="btn btn-ghost btn-sm" style="margin-top:14px;border-color:rgba(255,255,255,0.15)" onclick="openNewBillSheet(${t.id})">
            ${I.plus} New Bill
          </button>
        </div>

        <!-- Deposit -->
        <div class="deposit-strip">
          <p class="ds-label">Security Deposit</p>
          <p class="ds-val">₹${sf(t.securityDeposit || 0).toLocaleString('en-IN')}</p>
        </div>

        <p class="section-label">Billing History</p>
        <div class="list-wrap pt-4">${recordsHTML}</div>
      </div>
    </div>
  `;
}

function buildRecordCard(r, t) {
  const isExp = APP.expandedRecords[r.id];
  const balClass = r.runningBalance > 0 ? 'due' : r.runningBalance < 0 ? 'adv' : 'clear';
  const balText  = r.runningBalance === 0 ? '₹0' :
    `${r.runningBalance < 0 ? '-' : ''}₹${Math.abs(r.runningBalance).toLocaleString('en-IN')}`;

  const paymentsHTML = (r.payments || []).length === 0
    ? `<p style="font-size:12px;color:var(--c-text3);padding:4px 0">No payments recorded</p>`
    : (r.payments || []).map(p => `
        <div class="payment-row">
          <div class="pr-left">
            <span style="font-size:18px">💳</span>
            <div>
              <p class="pr-amt">₹${sf(p.amount).toLocaleString('en-IN')}</p>
              <p class="pr-date">${fmtDate(p.date)} <span class="pr-method">${p.method || 'cash'}</span></p>
            </div>
          </div>
          <div class="payment-del-btn" onclick="deletePayment(${t.id}, ${r.id}, ${p.id})">${I.trash}</div>
        </div>
      `).join('');

  const bodyHTML = isExp ? `
    <div class="record-body">
      <div class="record-row rent">
        <div class="rr-label">${I.home} Rent</div>
        <div class="rr-value">₹${sf(r.rentAmount).toLocaleString('en-IN')}</div>
      </div>
      <div class="record-row elec">
        <div class="rr-label">${I.bolt} Electricity</div>
        <div class="rr-value">
          ₹${sf(r.electricBill).toLocaleString('en-IN')}
          ${r.units > 0 ? `<div style="font-size:10px;color:var(--c-text3);margin-top:2px">${r.prevReading}→${r.currReading} (${r.units} units)</div>` : ''}
        </div>
      </div>
      ${r.opening !== 0 ? `
        <div class="record-row carry">
          <div class="rr-label">${I.rupee} Carried Forward</div>
          <div class="rr-value ${r.opening > 0 ? 'plus' : 'minus'}">
            ${r.opening > 0 ? '+' : ''}₹${Math.abs(r.opening).toLocaleString('en-IN')}
          </div>
        </div>
      ` : ''}
      <div class="payments-title">Payments</div>
      ${paymentsHTML}
      <div class="record-actions" style="margin-top:4px">
        <button class="btn btn-danger btn-sm" onclick="deleteRecord(${t.id}, ${r.id})">Delete Bill</button>
        <button class="btn btn-primary btn-sm" style="flex:2" onclick="openPaymentSheet(${t.id}, ${r.id}, ${sf(r.billTotal + r.opening - r.paidTotal)})">
          + Payment
        </button>
      </div>
    </div>
  ` : '';

  return `
    <div class="record-card ${isExp ? 'expanded' : ''}" id="rec-${r.id}">
      <div class="record-head" onclick="toggleRecord(${r.id})">
        <div>
          <p class="record-month-label">${r.month}</p>
          <p class="record-bill-sub">Bill ₹${sf(r.billTotal).toLocaleString('en-IN')}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div>
            <p class="record-balance-lbl">Balance</p>
            <p class="record-balance ${balClass}">${balText}</p>
          </div>
          <div class="record-chevron">${I.chevR}</div>
        </div>
      </div>
      ${bodyHTML}
    </div>
  `;
}

function toggleRecord(id) {
  APP.expandedRecords[id] = !APP.expandedRecords[id];
  // Re-render just the record card
  const t = APP.tenants.find(t => t.id === APP.activeTenantId);
  if (!t) return;
  const st = tenantComputed(t);
  const r  = st.records.find(r => r.id === id);
  if (!r) return;
  const el = document.getElementById(`rec-${id}`);
  if (el) el.outerHTML = buildRecordCard(r, t);
}

/* ── Open tenant detail ── */
function openTenantDetail(id) {
  APP.activeTenantId = id;
  APP.expandedRecords = {};
  navigate('rentdetail');
}

/* ── Add/Edit Tenant sheet ── */
function openTenantSheet(editId) {
  const existing = editId ? APP.tenants.find(t => t.id === editId) : null;

  openSheet('tenant', ({ body, footer, titleEl }) => {
    titleEl.textContent = editId ? 'Edit Tenant' : 'Add Tenant';

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tenant Name</label>
        <input class="form-input" id="t-name" type="text" inputmode="text"
          placeholder="Full name" maxlength="50"
          value="${existing?.name || ''}" autocomplete="off"/>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">House / Unit No.</label>
          <input class="form-input" id="t-house" type="text" inputmode="text"
            placeholder="A-101" maxlength="20"
            value="${existing?.houseNo || ''}" autocomplete="off"/>
        </div>
        <div class="form-group">
          <label class="form-label">Rent Due Day</label>
          <input class="form-input" id="t-day" type="number" inputmode="numeric"
            placeholder="1" min="1" max="31"
            value="${existing?.rentDay || 1}"/>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Monthly Rent (₹)</label>
          <div class="amount-wrap">
            <span class="rupee-prefix" style="font-size:16px">₹</span>
            <input class="form-input" id="t-rent" type="number" inputmode="decimal"
              placeholder="0" min="0" step="100"
              value="${existing?.baseRent || ''}" style="font-size:20px"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Security Deposit (₹)</label>
          <div class="amount-wrap">
            <span class="rupee-prefix" style="font-size:16px">₹</span>
            <input class="form-input" id="t-deposit" type="number" inputmode="decimal"
              placeholder="0" min="0" step="100"
              value="${existing?.securityDeposit || ''}" style="font-size:20px"/>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-primary btn-full" onclick="saveTenant(${editId || 'null'})">
        ${editId ? 'Update Tenant' : 'Add Tenant'}
      </button>
    `;

    requestAnimationFrame(() => document.getElementById('t-name')?.focus());
  });
}

function saveTenant(editId = null) {
  const name    = document.getElementById('t-name')?.value?.trim();
  const houseNo = document.getElementById('t-house')?.value?.trim() || '';
  const rent    = sf(document.getElementById('t-rent')?.value);
  const deposit = sf(document.getElementById('t-deposit')?.value);
  const rentDay = clamp(parseInt(document.getElementById('t-day')?.value) || 1, 1, 31);

  if (!name) { UI.toast('Enter tenant name'); return; }

  if (editId) {
    APP.tenants = APP.tenants.map(t =>
      t.id === editId
        ? { ...t, name, houseNo, baseRent: rent, securityDeposit: deposit, rentDay }
        : t
    );
    UI.toast('Tenant updated');
    closeSheet();
    renderRentDetail();
  } else {
    APP.tenants.unshift({ id: uid(), name, houseNo, baseRent: rent, securityDeposit: deposit, rentDay, records: [] });
    UI.toast('Tenant added');
    closeSheet();
    renderRentBook();
  }
  APP.save();
}

/* ── New Bill sheet ── */
function openNewBillSheet(tenantId) {
  const t = APP.tenants.find(t => t.id === tenantId);
  if (!t) return;

  // Pre-fill previous reading from latest record
  const sorted = (t.records || []).sort((a, b) => b.monthISO.localeCompare(a.monthISO));
  const lastReading = sorted[0]?.currReading ?? '';

  openSheet('bill', ({ body, footer, titleEl }) => {
    titleEl.textContent = 'New Bill';

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Billing Month</label>
        <input class="form-input" id="bill-month" type="month"
          value="${getMonthKey(new Date())}" max="${getMonthKey(new Date())}"/>
      </div>

      <div style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:16px;padding:14px;margin-bottom:14px">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:var(--c-text3);margin-bottom:10px">Electricity Meter</p>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Old Reading</label>
            <input class="form-input mono" id="bill-old" type="number" inputmode="decimal"
              placeholder="0" min="0" step="any"
              value="${lastReading}" autocomplete="off"/>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">New Reading</label>
            <input class="form-input mono" id="bill-new" type="number" inputmode="decimal"
              placeholder="0" min="0" step="any" autocomplete="off"
              oninput="updateBillPreview()"/>
          </div>
        </div>
        <div id="bill-preview" style="margin-top:10px;padding:10px;background:var(--c-accent-d);border-radius:10px;border:1px solid rgba(232,160,32,0.2);display:none">
          <p style="font-size:12px;font-weight:600;color:var(--c-accent2)" id="bill-preview-text"></p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Manual Electric Bill (₹) <span style="color:var(--c-text3)">— leave blank for auto</span></label>
        <div class="amount-wrap">
          <span class="rupee-prefix" style="font-size:16px">₹</span>
          <input class="form-input" id="bill-manual" type="number" inputmode="decimal"
            placeholder="Auto-calculated" min="0" step="any" style="font-size:20px"
            oninput="updateBillPreview()"/>
        </div>
      </div>

      <div style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:14px">
        <p style="font-size:11px;font-weight:700;color:var(--c-text3);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:8px">Tenant Info</p>
        <div style="display:flex;justify-content:space-between">
          <p style="font-size:13px;color:var(--c-text2)">Base Rent</p>
          <p class="mono" style="font-size:13px">₹${sf(t.baseRent).toLocaleString('en-IN')}</p>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px">
          <p style="font-size:13px;color:var(--c-text2)">Rate per unit</p>
          <p class="mono" style="font-size:13px">₹8 / unit</p>
        </div>
      </div>
    `;

    // Store tenant id
    footer.dataset.tid = tenantId;
    footer.innerHTML = `<button class="btn btn-primary btn-full" onclick="saveBill(${tenantId})">Generate Bill</button>`;

    requestAnimationFrame(() => document.getElementById('bill-new')?.focus());
  });
}

function updateBillPreview() {
  const old    = sf(document.getElementById('bill-old')?.value);
  const newR   = sf(document.getElementById('bill-new')?.value);
  const manual = document.getElementById('bill-manual')?.value;
  const prev   = document.getElementById('bill-preview');
  const text   = document.getElementById('bill-preview-text');
  if (!prev || !text) return;

  if (newR > old || manual) {
    const units = Math.max(0, newR - old);
    const elec  = manual ? sf(manual) : sf(units * 8);
    text.textContent = manual
      ? `Manual bill: ₹${elec.toLocaleString('en-IN')}`
      : `${units} units × ₹8 = ₹${elec.toLocaleString('en-IN')}`;
    prev.style.display = 'block';
  } else {
    prev.style.display = 'none';
  }
}

function saveBill(tenantId) {
  const month  = document.getElementById('bill-month')?.value;
  const oldR   = sf(document.getElementById('bill-old')?.value);
  const newR   = sf(document.getElementById('bill-new')?.value);
  const manual = document.getElementById('bill-manual')?.value;

  if (!month) { UI.toast('Select billing month'); return; }

  const ti = APP.tenants.findIndex(t => t.id === tenantId);
  if (ti === -1) return;

  const t     = APP.tenants[ti];
  const units = Math.max(0, sf(newR - oldR));
  const elec  = manual ? sf(manual) : sf(units * 8);
  const rent  = sf(t.baseRent);

  const newRecord = {
    id:           uid(),
    monthISO:     month,
    month:        fmtMonthLong(month),
    prevReading:  oldR,
    currReading:  newR,
    units,
    rentAmount:   rent,
    electricBill: elec,
    totalBill:    sf(rent + elec),
    payments:     []
  };

  const recs = [...(t.records || [])];
  const existIdx = recs.findIndex(r => r.monthISO === month);
  if (existIdx !== -1) {
    recs[existIdx] = { ...newRecord, id: recs[existIdx].id, payments: recs[existIdx].payments };
  } else {
    recs.unshift(newRecord);
    if (recs.length > 120) recs.pop();
  }

  APP.tenants[ti] = { ...t, records: recs };
  APP.save();
  closeSheet();
  renderRentDetail();
  UI.toast('Bill generated');
}

/* ── Payment sheet ── */
function openPaymentSheet(tenantId, recId, pendingAmt) {
  openSheet('payment', ({ body, footer, titleEl }) => {
    titleEl.textContent = 'Record Payment';

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Amount Received (₹)</label>
        <div class="amount-wrap">
          <span class="rupee-prefix" style="color:var(--c-green)">₹</span>
          <input class="form-input" id="pay-amount" type="number" inputmode="decimal"
            placeholder="0" min="0" step="any"
            value="${pendingAmt > 0 ? pendingAmt : ''}" autocomplete="off"
            style="color:var(--c-green)"/>
        </div>
        ${pendingAmt > 0 ? `<p style="font-size:12px;color:var(--c-text3);margin-top:6px">Pending: ₹${sf(pendingAmt).toLocaleString('en-IN')}</p>` : ''}
      </div>

      <div class="form-group">
        <label class="form-label">Method</label>
        <div class="seg-ctrl" id="pay-method">
          <div class="seg-btn active" onclick="selectMethod(this,'cash')">💵 Cash</div>
          <div class="seg-btn" onclick="selectMethod(this,'online')">📱 Online</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Payment Date</label>
        <input class="form-input" id="pay-date" type="date"
          value="${getLocalISO()}" max="${getLocalISO()}"/>
      </div>
    `;

    footer.innerHTML = `<button class="btn btn-success btn-full" onclick="savePayment(${tenantId}, ${recId})">Record Payment</button>`;
    requestAnimationFrame(() => document.getElementById('pay-amount')?.focus());
  });
}

function savePayment(tenantId, recId) {
  const amount = sf(document.getElementById('pay-amount')?.value);
  const method = document.querySelector('#pay-method .seg-btn.active')?.textContent.trim().toLowerCase().includes('cash') ? 'cash' : 'online';
  const date   = document.getElementById('pay-date')?.value || getLocalISO();

  if (!amount || amount <= 0) { UI.toast('Enter payment amount'); return; }

  const ti = APP.tenants.findIndex(t => t.id === tenantId);
  if (ti === -1) return;
  const ri = APP.tenants[ti].records.findIndex(r => r.id === recId);
  if (ri === -1) return;

  const payment = { id: uid(), amount, method, date };
  APP.tenants[ti].records[ri].payments = [...(APP.tenants[ti].records[ri].payments || []), payment];

  // Auto-sync to wallet as income
  APP.funds.unshift({
    id:     uid(),
    amount,
    note:   `Rent — ${APP.tenants[ti].name}`,
    method,
    date
  });
  if (APP.funds.length > 1000) APP.funds = APP.funds.slice(0, 1000);

  APP.save();
  closeSheet();
  APP.expandedRecords[recId] = true;
  renderRentDetail();
  UI.toast('Payment recorded');
}

/* ── Delete actions ── */
function deleteTenant(id) {
  const t = APP.tenants.find(t => t.id === id);
  openDialog({
    icon: '🏠',
    title: 'Delete Tenant?',
    body: `"${t?.name}" and all billing history will be permanently deleted.`,
    confirmLabel: 'Delete',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      APP.tenants = APP.tenants.filter(t => t.id !== id);
      APP.save();
      renderRentBook();
      UI.toast('Tenant deleted');
    }
  });
}

function deleteRecord(tenantId, recId) {
  openDialog({
    icon: '🗑️',
    title: 'Delete Bill?',
    body: 'This bill and all its payments will be removed.',
    confirmLabel: 'Delete',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      const ti = APP.tenants.findIndex(t => t.id === tenantId);
      if (ti !== -1) APP.tenants[ti].records = APP.tenants[ti].records.filter(r => r.id !== recId);
      APP.save();
      renderRentDetail();
      UI.toast('Bill deleted');
    }
  });
}

function deletePayment(tenantId, recId, payId) {
  openDialog({
    icon: '💳',
    title: 'Delete Payment?',
    body: 'This payment record will be removed.',
    confirmLabel: 'Delete',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      const ti = APP.tenants.findIndex(t => t.id === tenantId);
      if (ti !== -1) {
        const ri = APP.tenants[ti].records.findIndex(r => r.id === recId);
        if (ri !== -1) APP.tenants[ti].records[ri].payments = APP.tenants[ti].records[ri].payments.filter(p => p.id !== payId);
      }
      APP.save();
      APP.expandedRecords[recId] = true;
      renderRentDetail();
      UI.toast('Payment deleted');
    }
  });
}
