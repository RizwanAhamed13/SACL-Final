/* ============================================================
   SACL Quality Management — Central API Router
   ============================================================ */

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api'
  : window.location.origin + '/api';

const API = {
  QC_REGISTER:     `${API_BASE}/qc-register`,
  MICRO_STRUCTURE: `${API_BASE}/micro-structure`,
  MICRO_TENSILE:   `${API_BASE}/micro-tensile`,
  IMPACT_TEST:     `${API_BASE}/impact-test`,
  USERS:           `${API_BASE}/users`,
  PART_NAMES:      `${API_BASE}/part-names`,
};

/* ── HTTP helpers ─────────────────────────────────────────── */
async function apiPost(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || `Server error ${res.status}`);
  return res.json();
}

async function apiGet(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

async function apiPut(endpoint, id, payload) {
  const res = await fetch(`${endpoint}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || `Server error ${res.status}`);
  return res.json();
}

async function apiDelete(endpoint, id) {
  const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
}

/* ── Toast ────────────────────────────────────────────────── */
function showToast(message, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = message;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── Form data ────────────────────────────────────────────── */
function getFormData(formId) {
  const form = document.getElementById(formId);
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (value === '') { data[key] = null; }
    else if (!isNaN(value) && value.trim() !== '') { data[key] = Number(value); }
    else { data[key] = value; }
  });
  return data;
}

/* ── Submit + reload table ────────────────────────────────── */
async function handleFormSubmit(formId, endpoint, successMsg, loadFn) {
  try {
    const payload = getFormData(formId);
    await apiPost(endpoint, payload);
    showToast(successMsg || 'Record saved!', 'success');
    document.getElementById(formId).reset();
    closeForm();
    if (loadFn) loadFn();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

/* ── Sidebar ──────────────────────────────────────────────── */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (window.innerWidth <= 992) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  } else {
    sidebar.classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  }
}

function closeMobileSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.classList.remove('show');
}

function initSidebar() {
  if (localStorage.getItem('sidebarCollapsed') === 'true' && window.innerWidth > 992) {
    document.querySelector('.sidebar').classList.add('collapsed');
    document.querySelector('.main-content').classList.add('expanded');
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) closeMobileSidebar();
  });
}

/* ── Form panel toggle ────────────────────────────────────── */
function openForm() {
  document.getElementById('formPanel').classList.add('open');
  document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeForm() {
  const p = document.getElementById('formPanel');
  if (p) p.classList.remove('open');
}

/* ── Date helper ──────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  return d.split('T')[0];
}

function dash(v) { return (v === null || v === undefined || v === '') ? '—' : v; }

function escHtml(v) {
  return (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function loadPartNameOptions(datalistId) {
  try {
    const data = await apiGet(`${API.PART_NAMES}/active`);
    const dl = document.getElementById(datalistId);
    if (!dl) return;
    dl.innerHTML = data.map(p => `<option value="${escHtml(p.name)}">`).join('');
  } catch (e) { /* silently ignore if backend unavailable */ }
}
