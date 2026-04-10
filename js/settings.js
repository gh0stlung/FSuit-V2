/* ============================================================
   FINANCE SUITE 4 — Settings Module
   ============================================================ */

function renderSettings() {
  const el = document.getElementById('screen-settings');

  const txCount     = APP.txs.length;
  const fundCount   = APP.funds.length;
  const rentCount   = APP.tenants.length;
  const totalMonths = new Set([
    ...APP.txs.map(t => t.date?.slice(0,7)),
    ...APP.funds.map(f => f.date?.slice(0,7))
  ]).size;

  const totalSpent = APP.txs.reduce((s,t) => s + sf(t.amount), 0);
  const totalEarned = APP.funds.reduce((s,f) => s + sf(f.amount), 0);

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div class="topbar">
        <button class="icon-btn" onclick="goBack()">${I.back}</button>
        <div><h1 class="topbar-title">Settings</h1></div>
        <div style="width:40px"></div>
      </div>

      <div class="scroll-y">
        <div style="padding:0 20px 80px">

          <!-- App overview card -->
          <div class="card" style="padding:20px;margin-bottom:24px;background:linear-gradient(145deg,rgba(232,160,32,0.1),rgba(232,160,32,0.04));border-color:rgba(232,160,32,0.2)">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
              <div style="font-size:36px">💎</div>
              <div>
                <p style="font-size:18px;font-weight:800;letter-spacing:-0.02em">Finance Suite</p>
                <p style="font-size:11px;color:var(--c-text3);font-weight:600;text-transform:uppercase;letter-spacing:0.08em">v4 · Local First · No Tracking</p>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
              <div style="text-align:center;padding:10px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid var(--c-border)">
                <p class="mono" style="font-size:20px;font-weight:500;margin-bottom:3px">${txCount + fundCount}</p>
                <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text3)">Records</p>
              </div>
              <div style="text-align:center;padding:10px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid var(--c-border)">
                <p class="mono" style="font-size:20px;font-weight:500;margin-bottom:3px">${rentCount}</p>
                <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text3)">Tenants</p>
              </div>
              <div style="text-align:center;padding:10px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid var(--c-border)">
                <p class="mono" style="font-size:20px;font-weight:500;margin-bottom:3px">${totalMonths}</p>
                <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text3)">Months</p>
              </div>
            </div>
          </div>

          <!-- Wallet section -->
          <p class="settings-section-title">Wallet</p>
          <div class="settings-block" style="margin-bottom:20px">
            <div class="settings-row">
              <div class="settings-row-icon">💰</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Monthly Budget</p>
                <p class="settings-row-sub">₹${sf(APP.budget).toLocaleString('en-IN')} / month</p>
              </div>
              <div class="settings-row-action">
                <button class="btn btn-ghost btn-sm" onclick="openBudgetSheet()">Edit</button>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon">📊</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Total Tracked</p>
                <p class="settings-row-sub">${txCount} expenses · ${fundCount} incomes</p>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon">📈</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Lifetime Stats</p>
                <p class="settings-row-sub">Earned ₹${sf(totalEarned).toLocaleString('en-IN')} · Spent ₹${sf(totalSpent).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <!-- RentBook section -->
          <p class="settings-section-title">RentBook</p>
          <div class="settings-block" style="margin-bottom:20px">
            <div class="settings-row">
              <div class="settings-row-icon">🏠</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Tenants</p>
                <p class="settings-row-sub">${rentCount} properties managed</p>
              </div>
              <div class="settings-row-action">
                <button class="btn btn-ghost btn-sm" onclick="navigate('rentbook')">View</button>
              </div>
            </div>
          </div>

          <!-- Data section -->
          <p class="settings-section-title">Data Management</p>
          <div class="settings-block" style="margin-bottom:20px">
            <div class="settings-row">
              <div class="settings-row-icon">💾</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Export Data</p>
                <p class="settings-row-sub">Download all data as JSON</p>
              </div>
              <div class="settings-row-action">
                <button class="btn btn-ghost btn-sm" onclick="exportData()">Export</button>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon">📥</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Import Data</p>
                <p class="settings-row-sub">Restore from JSON backup</p>
              </div>
              <div class="settings-row-action">
                <label class="btn btn-ghost btn-sm" style="cursor:pointer">
                  Import
                  <input type="file" accept=".json" style="display:none" onchange="importData(event)"/>
                </label>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon">🗑️</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Clear All Data</p>
                <p class="settings-row-sub" style="color:var(--c-red)">This cannot be undone</p>
              </div>
              <div class="settings-row-action">
                <button class="btn btn-danger btn-sm" onclick="clearAllData()">Clear</button>
              </div>
            </div>
          </div>

          <!-- About -->
          <p class="settings-section-title">About</p>
          <div class="settings-block" style="margin-bottom:20px">
            <div class="settings-row">
              <div class="settings-row-icon">🔒</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Privacy</p>
                <p class="settings-row-sub">All data stored locally on your device. No servers, no tracking, no ads.</p>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon">📱</div>
              <div class="settings-row-body">
                <p class="settings-row-title">Install as App</p>
                <p class="settings-row-sub">Add to home screen for fullscreen experience</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

/* ── Export ── */
function exportData() {
  const data = {
    version: 4,
    exportedAt: new Date().toISOString(),
    txs:     APP.txs,
    funds:   APP.funds,
    tenants: APP.tenants,
    budget:  APP.budget
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `finance-suite-backup-${getLocalISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  UI.toast('Data exported');
}

/* ── Import ── */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      openDialog({
        icon: '📥',
        title: 'Import Data?',
        body: `This will overwrite your current data with the backup from ${data.exportedAt?.slice(0,10) || 'unknown date'}.`,
        confirmLabel: 'Import',
        confirmClass: 'btn-primary',
        onConfirm: () => {
          if (Array.isArray(data.txs))     APP.txs     = data.txs;
          if (Array.isArray(data.funds))   APP.funds   = data.funds;
          if (Array.isArray(data.tenants)) APP.tenants = data.tenants;
          if (data.budget)                 APP.budget  = sf(data.budget);
          APP.save();
          renderSettings();
          renderHome();
          UI.toast('Data imported successfully');
        }
      });
    } catch {
      UI.toast('Invalid file format');
    }
  };
  reader.readAsText(file);
}

/* ── Clear all ── */
function clearAllData() {
  openDialog({
    icon: '⚠️',
    title: 'Clear All Data?',
    body: 'ALL transactions, income records, and tenant data will be permanently deleted. This cannot be undone.',
    confirmLabel: 'Clear Everything',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      APP.txs     = [];
      APP.funds   = [];
      APP.tenants = [];
      APP.budget  = 5000;
      APP.save();
      renderSettings();
      renderHome();
      UI.toast('All data cleared');
    }
  });
}
