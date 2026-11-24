/**
 * VERITY Administrator Dashboard — Application logic.
 *
 * Auth flow:
 *   1. Supabase signInWithPassword (email + password).
 *   2. On success, read the current access token from the Supabase session.
 *   3. Call GET /api/verity/admin/me with Authorization: Bearer <token>.
 *   4. Only render the dashboard if the backend confirms administrator access.
 *   5. On 401/403, deny access and sign out.
 *
 * All private API requests include the current access token, use
 * cache: no-store, and handle 401/403/502/503 safely. Tokens and secrets
 * are never logged or displayed.
 */
(() => {
  'use strict';

  // ---------------- References to global config ----------------
  const SUPABASE_CONFIG = window.VERITY_SUPABASE_CONFIG || {};
  const ADMIN_CONFIG = window.VERITY_ADMIN_CONFIG || {};
  const API_BASE = ADMIN_CONFIG.apiBaseUrl || '';
  const ENDPOINTS = ADMIN_CONFIG.endpoints || {};

  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('VERITY admin: Supabase configuration is missing.');
  }

  const supabase = window.supabase && typeof window.supabase.createClient === 'function'
    ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : null;

  // ---------------- DOM elements ----------------
  const shell = document.getElementById('admin-shell');
  const viewLogin = document.getElementById('view-login');
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  const loginStatus = document.getElementById('login-status');
  const adminEmail = document.getElementById('admin-email');
  const adminPassword = document.getElementById('admin-password');

  const adminSidebar = document.getElementById('admin-sidebar');
  const adminMain = document.getElementById('admin-main');
  const adminHeader = document.getElementById('admin-header');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const adminBadge = document.getElementById('admin-badge');
  const sidebarAdminIdentity = document.getElementById('sidebar-admin-identity');
  const headerLogout = document.getElementById('header-logout');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mainContent = document.getElementById('main-content');

  const confirmDialog = document.getElementById('confirm-dialog');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmOk = document.getElementById('confirm-ok');

  // ---------------- State ----------------
  let currentUser = null; // { user_id: string } from /api/verity/admin/me
  let activeView = null;
  let activeCaseId = null;
  let confirmResolve = null;

  // ---------------- Helpers ----------------

  function setLoginError(message) {
    loginStatus.textContent = message;
    loginStatus.className = 'field status error';
    loginStatus.hidden = false;
  }

  function clearLoginError() {
    loginStatus.hidden = true;
    loginStatus.textContent = '';
  }

  function setLoginLoading(loading) {
    loginButton.disabled = loading;
    loginButton.setAttribute('aria-busy', String(loading));
    if (loading) loginButton.textContent = 'Signing in\u2026';
    else loginButton.textContent = 'Sign in';
  }

  function showView(viewId) {
    document.querySelectorAll('.admin-view').forEach((el) => el.hidden = true);
    const view = document.getElementById(viewId);
    if (view) view.hidden = false;
    activeView = viewId;
  }

  function showLogin() {
    shell.classList.remove('dashboard-mode');
    adminSidebar.hidden = true;
    adminMain.hidden = true;
    adminHeader.hidden = true;
    showView('view-login');
    clearLoginError();
    setLoginLoading(false);
    adminEmail.value = '';
    adminPassword.value = '';
  }

  function showDashboard() {
    shell.classList.add('dashboard-mode');
    adminSidebar.hidden = false;
    adminMain.hidden = false;
    adminHeader.hidden = false;
    viewLogin.hidden = true;
    renderView('enquiries');
  }

  function setAdminIdentity(userId) {
    const short = (userId || '').slice(0, 8);
    adminBadge.textContent = 'ADMIN ' + short.toUpperCase();
    sidebarAdminIdentity.textContent = 'Signed in as ' + short + '...';
  }

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '\u2014';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return String(iso); }
  }

  function formatDateTime(iso) {
    if (!iso) return '\u2014';
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return String(iso); }
  }

  // ---------------- API request wrapper ----------------

  async function getAccessToken() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return (data && data.session && data.session.access_token) || null;
  }

  async function apiRequest(path, options = {}) {
    const token = await getAccessToken();
    const headers = {
      'Accept': 'application/json',
      'Cache-Control': 'no-store',
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (options.json) headers['Content-Type'] = 'application/json';

    const url = API_BASE + path;
    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      cache: 'no-store',
    };
    if (options.json) fetchOptions.body = JSON.stringify(options.json);
    const finalUrl = options.params
      ? url + (url.includes('?') ? '&' : '?') + new URLSearchParams(
          Object.fromEntries(
            Object.entries(options.params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          )
        )
      : url;

    let response;
    try {
      response = await fetch(finalUrl, fetchOptions);
    } catch (err) {
      // Network failure — do not log internals
      throw new Error('network_error');
    }

    if (!response.ok) {
      const err = new Error('http_error');
      err.status = response.status;
      err.response = response;
      throw err;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  function handleApiError(err, fallback) {
    if (err.status === 401 || err.status === 403) {
      // Not authorized — sign out and return to login
      signOutAndRedirect();
      return null;
    }
    if (err.status === 502 || err.status === 503) {
      showErrorBanner(fallback || 'The service is temporarily unavailable. Please try again later.');
      return null;
    }
    if (err.message === 'network_error') {
      showErrorBanner('Unable to connect to the service. Please check your connection and try again.');
      return null;
    }
    showErrorBanner(fallback || 'An unexpected error occurred.');
    return null;
  }

  function showErrorBanner(message) {
    // Remove existing
    const existing = mainContent.querySelector('.error-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-alert"/></svg>' + escapeHtml(message);
    mainContent.prepend(banner);
    setTimeout(() => banner.remove(), 8000);
  }

  function showSuccessBanner(message) {
    const existing = mainContent.querySelector('.success-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.className = 'success-banner';
    banner.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>' + escapeHtml(message);
    mainContent.prepend(banner);
    setTimeout(() => banner.remove(), 5000);
  }

  async function signOutAndRedirect() {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    currentUser = null;
    activeCaseId = null;
    showLogin();
  }

  // ---------------- Authentication ----------------

  async function attemptLogin(email, password) {
    if (!supabase) {
      setLoginError('Authentication service is not configured.');
      return;
    }

    setLoginLoading(true);
    clearLoginError();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Generic message — never expose Supabase internals
        setLoginError('Invalid email or password. Please try again.');
        setLoginLoading(false);
        return;
      }

      // Backend verification: call /api/verity/admin/me with the access token
      const session = (await supabase.auth.getSession()).data.session;
      const token = session && session.access_token;
      if (!token) {
        setLoginError('Unable to obtain session token.');
        setLoginLoading(false);
        return;
      }

      try {
        const me = await apiRequest(ENDPOINTS.adminMe);
        if (me && me.user_id) {
          currentUser = { user_id: me.user_id };
          setAdminIdentity(me.user_id);
          showDashboard();
        } else {
          setLoginError('Administrator access could not be confirmed.');
          await signOutAndRedirect();
        }
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          setLoginError('Administrator access is required.');
          await signOutAndRedirect();
        } else {
          setLoginError('Unable to verify administrator access. Please try again.');
        }
        setLoginLoading(false);
      }
    } catch {
      setLoginError('Unable to sign in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  }

  // ---------------- View rendering ----------------

  function renderView(viewId, caseId) {
    pageTitle.textContent = 'VERITY Admin';
    pageSubtitle.textContent = 'Private investigation workspace';
    mainContent.innerHTML = '';

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === viewId);
    });

    if (viewId === 'logout') {
      signOutAndRedirect();
      return;
    }

    switch (viewId) {
      case 'enquiries':
        pageTitle.textContent = 'Enquiry Inbox';
        pageSubtitle.textContent = 'Intake enquiries awaiting review';
        renderEnquiries();
        break;
      case 'cases':
        pageTitle.textContent = 'Cases';
        pageSubtitle.textContent = 'Active investigation cases';
        renderCases();
        break;
      case 'case-detail':
        activeCaseId = caseId;
        renderCaseDetail(caseId);
        break;
      default:
        renderEnquiries();
    }
  }

  function setContentLoading(loading) {
    // Simple loading indicator
    let loader = mainContent.querySelector('.loading');
    if (loading) {
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'loading';
        loader.textContent = 'Loading\u2026';
        mainContent.appendChild(loader);
      }
    } else if (loader) {
      loader.remove();
    }
  }

  // ---------------- Enquiries ----------------

  async function renderEnquiries() {
    setContentLoading(true);
    try {
      const data = await apiRequest(ENDPOINTS.enquiries, {
        params: { limit: 50, offset: 0 },
      });
      setContentLoading(false);
      if (!data) return;

      const enquiries = Array.isArray(data.enquiries) ? data.enquiries : [];

      const container = document.createElement('div');
      container.className = 'view-container';

      const header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML = `
        <div>
          <h2>Enquiry Inbox</h2>
          <p>${enquiries.length} intake enquiry${enquiries.length !== 1 ? 's' : ''}</p>
        </div>
        <div class="page-actions">
          <button class="button button-primary" id="btn-refresh-enquiries">
            <svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg> Refresh
          </button>
        </div>
      `;
      container.appendChild(header);

      // Search / filter
      const filterBar = document.createElement('div');
      filterBar.className = 'card';
      filterBar.style.padding = '16px';
      filterBar.style.marginBottom = '16px';
      filterBar.innerHTML = `
        <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <div class="form-field">
            <label>Search</label>
            <input type="search" id="enq-search" placeholder="Search enquiries\u2026">
          </div>
          <div class="form-field">
            <label>Status</label>
            <select id="enq-status">
              <option value="">All statuses</option>
            </select>
          </div>
          <div class="form-field" style="align-self: end;">
            <button class="button button-primary button-full" id="btn-apply-filters">Apply filters</button>
          </div>
        </div>
      `;
      container.appendChild(filterBar);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'card table-wrap';
      const table = document.createElement('table');
      table.innerHTML = `
        <thead>
          <tr>
            <th>Reference</th>
            <th>Contact / Business</th>
            <th>Purpose</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="enq-table-body"></tbody>
      `;
      tableWrap.appendChild(table);
      container.appendChild(tableWrap);

      const tbody = table.querySelector('#enq-table-body');

      function renderRows(rows) {
        tbody.innerHTML = '';
        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No enquiries found.</td></tr>';
          return;
        }
        rows.forEach((enq) => {
          const tr = document.createElement('tr');
          const ref = 'VR-' + (enq.id || '').slice(0, 8).toUpperCase();
          const statusBadge = `<span class="badge status-${(enq.status || 'unknown').toLowerCase().replace(/\s/g, '-')}">${escapeHtml(enq.status || '—')}</span>`;
          const created = formatDate(enq.created_at);
          // Use extra fields if available; enquiry schema is extra: allow on backend
          const contact = escapeHtml(enq.business_email || enq.email || enq.contact || '—');
          const business = escapeHtml(enq.company_name || enq.business || '—');
          const purpose = escapeHtml(enq.verification_purpose || enq.purpose || '—');
          tr.innerHTML = `
            <td><span class="value mono">${escapeHtml(ref)}</span></td>
            <td>${contact}<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${business}</div></td>
            <td>${purpose}</td>
            <td>${created}</td>
            <td>${statusBadge}</td>
            <td>
              <button class="button button-small button-primary" data-action="open-case" data-enquiry-id="${escapeHtml(enq.id)}">Create case</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Wire case creation buttons
        table.querySelectorAll('[data-action="open-case"]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const enquiryId = btn.getAttribute('data-enquiry-id');
            openCaseFromEnquiry(enquiryId);
          });
        });
      }

      renderRows(enquiries);

      // Filter handlers
      const searchInput = filterBar.querySelector('#enq-search');
      const statusSelect = filterBar.querySelector('#enq-status');
      const applyBtn = filterBar.querySelector('#btn-apply-filters');

      // Populate status options from backend data
      const statuses = [...new Set(enquiries.map((e) => e.status).filter(Boolean))];
      statusSelect.innerHTML = '<option value="">All statuses</option>' + statuses.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');

      applyBtn.addEventListener('click', () => {
        const term = searchInput.value.toLowerCase();
        const st = statusSelect.value;
        const filtered = enquiries.filter((e) => {
          const haystack = ((e.business_email || '') + ' ' + (e.company_name || '') + ' ' + (e.id || '')).toLowerCase();
          return (!term || haystack.includes(term)) && (!st || e.status === st);
        });
        renderRows(filtered);
      });

      const refreshBtn = header.querySelector('#btn-refresh-enquiries');
      refreshBtn.addEventListener('click', () => renderEnquiries());

      mainContent.appendChild(container);
    } catch (err) {
      setContentLoading(false);
      handleApiError(err, 'Failed to load enquiries.');
    }
  }

  async function openCaseFromEnquiry(enquiryId) {
    // Pre-fill case creation from enquiry; the DB generates case_reference
    const title = prompt('Enter a case title for enquiry ' + enquiryId.slice(0, 8) + ':', 'Investigation');
    if (!title) return;

    setContentLoading(true);
    try {
      const created = await apiRequest(ENDPOINTS.cases, {
        method: 'POST',
        json: {
          enquiry_id: enquiryId,
          title: title,
          status: 'open',
        },
      });
      setContentLoading(false);
      if (!created) return;
      showSuccessBanner('Case created: ' + escapeHtml(created.case_reference));
      renderView('case-detail', created.id);
    } catch (err) {
      setContentLoading(false);
      if (err.status === 409) {
        showErrorBanner('A case already exists for this enquiry.');
        renderView('cases');
      } else {
        handleApiError(err, 'Failed to create case.');
      }
    }
  }

  // ---------------- Cases ----------------

  async function renderCases() {
    setContentLoading(true);
    try {
      const data = await apiRequest(ENDPOINTS.cases, {
        params: { limit: 50, offset: 0 },
      });
      setContentLoading(false);
      if (!data) return;

      const cases = Array.isArray(data.cases) ? data.cases : [];

      const container = document.createElement('div');
      container.className = 'view-container';

      const header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML = `
        <div>
          <h2>Cases</h2>
          <p>${cases.length} investigation case${cases.length !== 1 ? 's' : ''}</p>
        </div>
        <div class="page-actions">
          <button class="button button-primary" id="btn-refresh-cases">
            <svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg> Refresh
          </button>
        </div>
      `;
      container.appendChild(header);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'card table-wrap';
      const table = document.createElement('table');
      table.innerHTML = `
        <thead>
          <tr>
            <th>Case reference</th>
            <th>Enquiry</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="case-table-body"></tbody>
      `;
      tableWrap.appendChild(table);
      container.appendChild(tableWrap);

      const tbody = table.querySelector('#case-table-body');

      function renderRows(rows) {
        tbody.innerHTML = '';
        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No cases found.</td></tr>';
          return;
        }
        rows.forEach((c) => {
          const tr = document.createElement('tr');
          const ref = escapeHtml(c.case_reference || '—');
          const enquiryRef = 'VR-' + (c.enquiry_id || '').slice(0, 8).toUpperCase();
          const statusBadge = `<span class="badge status-${(c.status || 'unknown').toLowerCase().replace(/\s/g, '-')}">${escapeHtml(c.status || '—')}</span>`;
          const created = formatDate(c.created_at);
          tr.innerHTML = `
            <td><span class="value mono">${ref}</span></td>
            <td><span class="value mono">${escapeHtml(enquiryRef)}</span></td>
            <td>${escapeHtml(c.title || '—')}</td>
            <td>${statusBadge}</td>
            <td>${created}</td>
            <td>
              <button class="button button-small button-primary" data-action="open-case-detail" data-case-id="${escapeHtml(c.id)}">Open</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        table.querySelectorAll('[data-action="open-case-detail"]').forEach((btn) => {
          btn.addEventListener('click', () => {
            renderView('case-detail', btn.getAttribute('data-case-id'));
          });
        });
      }

      renderRows(cases);

      const refreshBtn = header.querySelector('#btn-refresh-cases');
      refreshBtn.addEventListener('click', () => renderCases());

      mainContent.appendChild(container);
    } catch (err) {
      setContentLoading(false);
      handleApiError(err, 'Failed to load cases.');
    }
  }

  // ---------------- Case detail ----------------

  async function renderCaseDetail(caseId) {
    setContentLoading(true);
    try {
      const caseData = await apiRequest(ENDPOINTS.caseById(caseId));
      setContentLoading(false);
      if (!caseData) return;

      const container = document.createElement('div');
      container.className = 'view-container';

      // Header bar with actions
      const headerBar = document.createElement('div');
      headerBar.className = 'page-header';
      const isClosed = caseData.status === 'closed';
      headerBar.innerHTML = `
        <div>
          <h2>Case ${escapeHtml(caseData.case_reference || '—')}</h2>
          <p>Enquiry ${escapeHtml(caseData.enquiry_id || '—')}</p>
        </div>
        <div class="page-actions">
          <button class="button button-ghost" id="btn-back-cases">
            <svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg> Back to cases
          </button>
          ${!isClosed ? `
          <button class="button button-primary" id="btn-edit-case">
            <svg class="icon" aria-hidden="true"><use href="#icon-edit"/></svg> Edit case
          </button>
          ` : ''}
        </div>
      `;
      container.appendChild(headerBar);
      headerBar.querySelector('#btn-back-cases').addEventListener('click', () => renderView('cases'));

      if (!isClosed) {
        headerBar.querySelector('#btn-edit-case').addEventListener('click', () => openCaseEdit(caseData));
      }

      // Case detail grid
      const detailCard = document.createElement('div');
      detailCard.className = 'card';
      detailCard.innerHTML = `
        <div class="card-header">
          <div>
            <h3>Case details</h3>
            <div class="subtitle">Reference: ${escapeHtml(caseData.case_reference || '—')}</div>
          </div>
          <span class="badge status-${(caseData.status || 'unknown').toLowerCase().replace(/\s/g, '-')}">${escapeHtml(caseData.status || '—')}</span>
        </div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-field"><div class="label">Title</div><div class="value">${escapeHtml(caseData.title || '—')}</div></div>
            <div class="detail-field"><div class="label">Description</div><div class="value">${escapeHtml(caseData.description || '\u2014')}</div></div>
            <div class="detail-field"><div class="label">Status</div><div class="value">${escapeHtml(caseData.status || '—')}</div></div>
            <div class="detail-field"><div class="label">Opened by</div><div class="value">${escapeHtml(caseData.opened_by || '—')}</div></div>
            <div class="detail-field"><div class="label">Assigned to</div><div class="value">${escapeHtml(caseData.assigned_to || '\u2014')}</div></div>
            <div class="detail-field"><div class="label">Created</div><div class="value">${formatDateTime(caseData.created_at)}</div></div>
            <div class="detail-field"><div class="label">Updated</div><div class="value">${formatDateTime(caseData.updated_at)}</div></div>
            ${caseData.closed_at ? `<div class="detail-field"><div class="label">Closed at</div><div class="value">${formatDateTime(caseData.closed_at)}</div></div>` : ''}
            ${caseData.agreed_fee_amount != null ? `<div class="detail-field"><div class="label">Agreed fee</div><div class="value">${escapeHtml(caseData.agreed_fee_amount)} ${escapeHtml(caseData.agreed_fee_currency || '')}</div></div>` : ''}
          </div>
        </div>
      `;
      container.appendChild(detailCard);

      // Tabs: Evidence / Findings / Reports
      const tabsContainer = document.createElement('div');
      tabsContainer.className = 'card';
      tabsContainer.innerHTML = `
        <div class="card-header" style="padding:0;">
          <div class="role tabs" role="tablist" aria-label="Case sections">
            <button class="tab active" type="button" role="tab" data-tab="evidence">Evidence</button>
            <button class="tab" type="button" role="tab" data-tab="findings">Findings</button>
            <button class="tab" type="button" role="tab" data-tab="reports">Reports</button>
          </div>
        </div>
        <div class="card-body" style="padding:0;">
          <div id="tabpanel-evidence" class="tabpanel"></div>
          <div id="tabpanel-findings" class="tabpanel" hidden></div>
          <div id="tabpanel-reports" class="tabpanel" hidden></div>
        </div>
      `;
      container.appendChild(tabsContainer);

      const tabs = tabsContainer.querySelectorAll('.tab');
      const panels = {
        evidence: tabsContainer.querySelector('#tabpanel-evidence'),
        findings: tabsContainer.querySelector('#tabpanel-findings'),
        reports: tabsContainer.querySelector('#tabpanel-reports'),
      };

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach((t) => {
            t.classList.toggle('active', t === tab);
            t.setAttribute('aria-selected', String(t === tab));
          });
          Object.entries(panels).forEach(([key, panel]) => {
            panel.hidden = key !== tab.dataset.tab;
          });
          if (tab.dataset.tab === 'evidence') renderEvidence(caseId, panels.evidence);
          if (tab.dataset.tab === 'findings') renderFindings(caseId, panels.findings);
          if (tab.dataset.tab === 'reports') renderReports(caseId, panels.reports);
        });
      });

      // Initial tab load
      renderEvidence(caseId, panels.evidence);

      mainContent.appendChild(container);
    } catch (err) {
      setContentLoading(false);
      if (err.status === 404) {
        mainContent.innerHTML = '';
        mainContent.insertAdjacentHTML('beforeend', `
          <div class="empty-state">
            <svg class="icon" aria-hidden="true"><use href="#icon-alert"/></svg>
            <h3>Case not found</h3>
            <p>The requested investigation case does not exist or may have been removed.</p>
          </div>
        `);
        return;
      }
      handleApiError(err, 'Failed to load case details.');
    }
  }

  async function openCaseEdit(caseData) {
    const isClosed = caseData.status === 'closed';
    if (isClosed) {
      showErrorBanner('Closed cases cannot be modified.');
      return;
    }

    const form = document.createElement('div');
    form.className = 'card';
    form.innerHTML = `
      <div class="card-header">
        <h3>Edit case</h3>
        <button class="button button-ghost button-small" id="btn-close-edit">Cancel</button>
      </div>
      <div class="card-body">
        <form id="edit-case-form" novalidate>
          <div class="form-grid">
            <div class="form-field">
              <label>Title</label>
              <input type="text" name="title" value="${escapeHtml(caseData.title || '')}" required>
              <span class="field-error" id="edit-title-error"></span>
            </div>
            <div class="form-field">
              <label>Description</label>
              <textarea name="description" rows="3">${escapeHtml(caseData.description || '')}</textarea>
              <span class="field-error" id="edit-description-error"></span>
            </div>
            <div class="form-field">
              <label>Status</label>
              <select name="status">
                ${ADMIN_CONFIG.caseStatuses.map((s) => `<option value="${escapeHtml(s)}" ${caseData.status === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
              <span class="field-error" id="edit-status-error"></span>
            </div>
            <div class="form-field">
              <label>Assigned to (user id)</label>
              <input type="text" name="assigned_to" value="${escapeHtml(caseData.assigned_to || '')}" placeholder="Optional UUID">
              <span class="field-error" id="edit-assigned-error"></span>
            </div>
            <div class="form-field">
              <label>Agreed fee amount</label>
              <input type="number" name="agreed_fee_amount" min="0" step="0.01" value="${escapeHtml(caseData.agreed_fee_amount != null ? caseData.agreed_fee_amount : '')}">
              <span class="field-error" id="edit-fee-error"></span>
            </div>
            <div class="form-field">
              <label>Currency (ISO-4217)</label>
              <input type="text" name="agreed_fee_currency" maxlength="3" value="${escapeHtml(caseData.agreed_fee_currency || '')}" placeholder="USD">
              <span class="field-error" id="edit-currency-error"></span>
            </div>
          </div>
          <div class="form-actions">
            <button class="button button-ghost" type="button" id="btn-cancel-edit">Cancel</button>
            <button class="button button-primary" type="submit">Save changes</button>
          </div>
        </form>
      </div>
    `;

    mainContent.insertBefore(form, mainContent.firstChild);
    form.querySelector('#btn-close-edit').addEventListener('click', () => form.remove());
    form.querySelector('#btn-cancel-edit').addEventListener('click', () => form.remove());

    form.querySelector('#edit-case-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const fd = new FormData(event.target);
      const updates = {};
      if (fd.get('title')) updates.title = fd.get('title');
      if (fd.get('description') !== null) updates.description = fd.get('description') || null;
      if (fd.get('status')) updates.status = fd.get('status');
      if (fd.get('assigned_to')) updates.assigned_to = fd.get('assigned_to');
      if (fd.get('agreed_fee_amount') !== '') updates.agreed_fee_amount = parseFloat(fd.get('agreed_fee_amount'));
      if (fd.get('agreed_fee_currency')) updates.agreed_fee_currency = fd.get('agreed_fee_currency');

      if (Object.keys(updates).length === 0) {
        showErrorBanner('No changes provided.');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving\u2026';

      try {
        const updated = await apiRequest(ENDPOINTS.caseById(caseData.id), {
          method: 'PATCH',
          json: updates,
        });
        if (updated) {
          showSuccessBanner('Case updated.');
          form.remove();
          renderCaseDetail(updated.id);
        }
      } catch (err) {
        if (err.status === 409) {
          showErrorBanner('This case is closed and cannot be modified.');
        } else if (err.status === 400) {
          showErrorBanner('The referenced enquiry does not exist.');
        } else {
          handleApiError(err, 'Failed to update case.');
        }
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  // ---------------- Evidence ----------------

  async function renderEvidence(caseId, panel) {
    panel.innerHTML = '';
    setContentLoading(true);
    try {
      const data = await apiRequest(ENDPOINTS.evidence(caseId), {
        params: { limit: 50, offset: 0 },
      });
      setContentLoading(false);
      if (!data) return;

      const items = Array.isArray(data.evidence) ? data.evidence : [];

      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="margin:0;font-size:15px;font-weight:700;">Evidence</h3>
          <button class="button button-small button-primary" id="btn-add-evidence">
            <svg class="icon" aria-hidden="true"><use href="#icon-plus"/></svg> Add evidence
          </button>
        </div>
        <div class="table-wrap" style="margin-bottom:0;">
          <table>
            <thead>
              <tr>
                <th style="width:160px;">Source</th>
                <th>Type</th>
                <th>Description</th>
                <th>Verification</th>
                <th>Collected</th>
              </tr>
            </thead>
            <tbody id="ev-table-body"></tbody>
          </table>
        </div>
      `;

      const tbody = panel.querySelector('#ev-table-body');
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">No evidence records.</td></tr>';
      } else {
        items.forEach((e) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${escapeHtml(e.source_name || '—')}${e.source_url ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;word-break:break-all;">' + escapeHtml(e.source_url) + '</div>' : ''}</td>
            <td><span class="type-badge type-${(e.evidence_type || 'other').toLowerCase()}">${escapeHtml(e.evidence_type || '—')}</span></td>
            <td>${escapeHtml(e.factual_description || '—')}</td>
            <td><span class="badge status-${(e.verification_status || 'unverified').toLowerCase()}">${escapeHtml(e.verification_status || '—')}</span></td>
            <td>${formatDateTime(e.collected_at)}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      panel.querySelector('#btn-add-evidence').addEventListener('click', () => openEvidenceForm(caseId, panel));
    } catch (err) {
      setContentLoading(false);
      handleApiError(err, 'Failed to load evidence.');
    }
  }

  async function openEvidenceForm(caseId, panel) {
    const form = document.createElement('div');
    form.className = 'card';
    form.style.marginTop = '16px';
    form.innerHTML = `
      <div class="card-header">
        <h3>Add evidence</h3>
        <button class="button button-ghost button-small" id="btn-close-ev-form">Cancel</button>
      </div>
      <div class="card-body">
        <form id="ev-form" novalidate>
          <div class="form-grid">
            <div class="form-field">
              <label>Source name <span style="color:var(--danger);">*</span></label>
              <input type="text" name="source_name" required>
              <span class="field-error" id="ev-source-error"></span>
            </div>
            <div class="form-field">
              <label>Source URL</label>
              <input type="url" name="source_url" placeholder="https://example.com">
              <span class="field-error" id="ev-url-error"></span>
            </div>
            <div class="form-field">
              <label>Evidence type <span style="color:var(--danger);">*</span></label>
              <select name="evidence_type" required>
                ${ADMIN_CONFIG.evidenceTypes.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
              </select>
              <span class="field-error" id="ev-type-error"></span>
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>Factual description <span style="color:var(--danger);">*</span></label>
              <textarea name="factual_description" rows="3" required></textarea>
              <span class="field-error" id="ev-desc-error"></span>
            </div>
            <div class="form-field">
              <label>Verification status</label>
              <select name="verification_status">
                ${ADMIN_CONFIG.verificationStatuses.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
              </select>
              <span class="field-error" id="ev-verif-error"></span>
            </div>
            <div class="form-field">
              <label>Reliability notes</label>
              <textarea name="reliability_notes" rows="2"></textarea>
              <span class="field-error" id="ev-notes-error"></span>
            </div>
          </div>
          <div class="form-actions">
            <button class="button button-ghost" type="button" id="btn-cancel-ev">Cancel</button>
            <button class="button button-primary" type="submit">Add evidence</button>
          </div>
        </form>
      </div>
    `;

    panel.appendChild(form);
    form.querySelector('#btn-close-ev-form').addEventListener('click', () => form.remove());
    form.querySelector('#btn-cancel-ev').addEventListener('click', () => form.remove());

    form.querySelector('#ev-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const fd = new FormData(event.target);
      const payload = {
        source_name: fd.get('source_name'),
        source_url: fd.get('source_url') || null,
        evidence_type: fd.get('evidence_type'),
        factual_description: fd.get('factual_description'),
        verification_status: fd.get('verification_status'),
        collected_at: null,
        reliability_notes: fd.get('reliability_notes') || null,
      };

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Adding\u2026';

      try {
        const created = await apiRequest(ENDPOINTS.evidence(caseId), {
          method: 'POST',
          json: payload,
        });
        if (created) {
          showSuccessBanner('Evidence added.');
          form.remove();
          renderEvidence(caseId, panel);
        }
      } catch (err) {
        handleApiError(err, 'Failed to add evidence.');
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  // ---------------- Findings ----------------

  async function renderFindings(caseId, panel) {
    panel.innerHTML = '';
    setContentLoading(true);
    try {
      const data = await apiRequest(ENDPOINTS.findings(caseId), {
        params: { limit: 50, offset: 0 },
      });
      setContentLoading(false);
      if (!data) return;

      const items = Array.isArray(data.findings) ? data.findings : [];

      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="margin:0;font-size:15px;font-weight:700;">Findings</h3>
          <button class="button button-small button-primary" id="btn-add-finding">
            <svg class="icon" aria-hidden="true"><use href="#icon-plus"/></svg> Add finding
          </button>
        </div>
        <div class="table-wrap" style="margin-bottom:0;">
          <table>
            <thead>
              <tr>
                <th style="width:180px;">Type</th>
                <th>Title</th>
                <th>Description</th>
                <th style="width:100px;">Confidence</th>
                <th style="width:160px;">Created</th>
              </tr>
            </thead>
            <tbody id="fd-table-body"></tbody>
          </table>
        </div>
      `;

      const tbody = panel.querySelector('#fd-table-body');
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">No findings recorded.</td></tr>';
      } else {
        items.forEach((f) => {
          const conf = f.confidence != null ? f.confidence + '%' : '\u2014';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><span class="badge">${escapeHtml(f.finding_type || '—').replace(/_/g, ' ')}</span></td>
            <td>${escapeHtml(f.title || '—')}</td>
            <td>${escapeHtml(f.description || '—')}</td>
            <td>${conf}</td>
            <td>${formatDateTime(f.created_at)}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      panel.querySelector('#btn-add-finding').addEventListener('click', () => openFindingForm(caseId, panel));
    } catch (err) {
      setContentLoading(false);
      handleApiError(err, 'Failed to load findings.');
    }
  }

  async function openFindingForm(caseId, panel) {
    const form = document.createElement('div');
    form.className = 'card';
    form.style.marginTop = '16px';
    form.innerHTML = `
      <div class="card-header">
        <h3>Add finding</h3>
        <button class="button button-ghost button-small" id="btn-close-fd-form">Cancel</button>
      </div>
      <div class="card-body">
        <form id="fd-form" novalidate>
          <div class="form-grid">
            <div class="form-field">
              <label>Finding type <span style="color:var(--danger);">*</span></label>
              <select name="finding_type" required>
                ${ADMIN_CONFIG.findingTypes.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t).replace(/_/g, ' ')}</option>`).join('')}
              </select>
              <span class="field-error" id="fd-type-error"></span>
              <p class="field-hint" style="font-size:11px;color:var(--text-muted);margin-top:4px;">Unverified information is never treated as confirmed fact.</p>
            </div>
            <div class="form-field">
              <label>Title <span style="color:var(--danger);">*</span></label>
              <input type="text" name="title" required>
              <span class="field-error" id="fd-title-error"></span>
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>Description <span style="color:var(--danger);">*</span></label>
              <textarea name="description" rows="3" required></textarea>
              <span class="field-error" id="fd-desc-error"></span>
            </div>
            <div class="form-field">
              <label>Confidence (0\u2013100)</label>
              <input type="number" name="confidence" min="0" max="100">
              <span class="field-error" id="fd-conf-error"></span>
            </div>
          </div>
          <div class="form-actions">
            <button class="button button-ghost" type="button" id="btn-cancel-fd">Cancel</button>
            <button class="button button-primary" type="submit">Add finding</button>
          </div>
        </form>
      </div>
    `;

    panel.appendChild(form);
    form.querySelector('#btn-close-fd-form').addEventListener('click', () => form.remove());
    form.querySelector('#btn-cancel-fd').addEventListener('click', () => form.remove());

    form.querySelector('#fd-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const fd = new FormData(event.target);
      const confidenceVal = fd.get('confidence');
      const payload = {
        finding_type: fd.get('finding_type'),
        title: fd.get('title'),
        description: fd.get('description'),
        confidence: confidenceVal ? parseInt(confidenceVal, 10) : null,
      };

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Adding\u2026';

      try {
        const created = await apiRequest(ENDPOINTS.findings(caseId), {
          method: 'POST',
          json: payload,
        });
        if (created) {
          showSuccessBanner('Finding added.');
          form.remove();
          renderFindings(caseId, panel);
        }
      } catch (err) {
        handleApiError(err, 'Failed to add finding.');
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  // ---------------- Reports ----------------

  async function renderReports(caseId, panel) {
    panel.innerHTML = '';
    setContentLoading(true);
    try {
      const data = await apiRequest(ENDPOINTS.reports(caseId), {
        params: { limit: 50, offset: 0 },
      });
      setContentLoading(false);
      if (!data) return;

      const items = Array.isArray(data.reports) ? data.reports : [];

      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="margin:0;font-size:15px;font-weight:700;">Reports</h3>
          <button class="button button-small button-primary" id="btn-add-report">
            <svg class="icon" aria-hidden="true"><use href="#icon-plus"/></svg> Add report version
          </button>
        </div>
        <div class="table-wrap" style="margin-bottom:0;">
          <table>
            <thead>
              <tr>
                <th style="width:80px;">Version</th>
                <th>Status</th>
                <th>Title</th>
                <th>Storage reference</th>
                <th style="width:160px;">Generated</th>
              </tr>
            </thead>
            <tbody id="rp-table-body"></tbody>
          </table>
        </div>
      `;

      const tbody = panel.querySelector('#rp-table-body');
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">No reports recorded.</td></tr>';
      } else {
        items.forEach((r) => {
          const tr = document.createElement('tr');
          const ref = escapeHtml(r.document_storage_reference || '\u2014');
          tr.innerHTML = `
            <td><span class="value mono">${r.version}</span></td>
            <td><span class="badge status-${(r.status || 'draft').toLowerCase()}">${escapeHtml(r.status || '—')}</span></td>
            <td>${escapeHtml(r.title || '—')}</td>
            <td style="font-size:12px;color:var(--text-muted);word-break:break-all;">${ref}</td>
            <td>${formatDateTime(r.created_at)}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      panel.querySelector('#btn-add-report').addEventListener('click', () => openReportForm(caseId, panel));
    } catch (err) {
      setContentLoading(false);
      handleApiError(err, 'Failed to load reports.');
    }
  }

  async function openReportForm(caseId, panel) {
    // Determine next version
    const form = document.createElement('div');
    form.className = 'card';
    form.style.marginTop = '16px';
    form.innerHTML = `
      <div class="card-header">
        <h3>Add report version</h3>
        <button class="button button-ghost button-small" id="btn-close-rp-form">Cancel</button>
      </div>
      <div class="card-body">
        <form id="rp-form" novalidate>
          <div class="form-grid">
            <div class="form-field">
              <label>Version <span style="color:var(--danger);">*</span></label>
              <input type="number" name="version" min="1" required>
              <span class="field-error" id="rp-version-error"></span>
              <p class="field-hint" style="font-size:11px;color:var(--text-muted);margin-top:4px;">Each report version must be unique for this case.</p>
            </div>
            <div class="form-field">
              <label>Status <span style="color:var(--danger);">*</span></label>
              <select name="status" required>
                ${ADMIN_CONFIG.reportStatuses.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
              </select>
              <span class="field-error" id="rp-status-error"></span>
            </div>
            <div class="form-field">
              <label>Title <span style="color:var(--danger);">*</span></label>
              <input type="text" name="title" required>
              <span class="field-error" id="rp-title-error"></span>
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>Content</label>
              <textarea name="content" rows="4"></textarea>
              <span class="field-error" id="rp-content-error"></span>
            </div>
            <div class="form-field">
              <label>Document storage reference</label>
              <input type="text" name="document_storage_reference" placeholder="private/storage/path.pdf">
              <span class="field-error" id="rp-ref-error"></span>
              <p class="field-hint" style="font-size:11px;color:var(--text-muted);margin-top:4px;">Private storage path only — never a public URL.</p>
            </div>
          </div>
          <div class="form-actions">
            <button class="button button-ghost" type="button" id="btn-cancel-rp">Cancel</button>
            <button class="button button-primary" type="submit">Create report</button>
          </div>
        </form>
      </div>
    `;

    panel.appendChild(form);
    form.querySelector('#btn-close-rp-form').addEventListener('click', () => form.remove());
    form.querySelector('#btn-cancel-rp').addEventListener('click', () => form.remove());

    const refInput = form.querySelector('input[name="document_storage_reference"]');
    if (refInput) {
      refInput.addEventListener('input', () => {
        const refError = form.querySelector('#rp-ref-error');
        if (refError) refError.textContent = '';
      });
    }

    form.querySelector('#rp-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const fd = new FormData(event.target);
      const versionVal = parseInt(fd.get('version'), 10);
      const documentStorageRef = fd.get('document_storage_reference') || '';
      if (documentStorageRef.startsWith('http://') || documentStorageRef.startsWith('https://')) {
        const refError = form.querySelector('#rp-ref-error');
        if (refError) refError.textContent = 'Document storage reference must be a private storage path, not a public URL.';
        return;
      }
      const payload = {
        version: isNaN(versionVal) ? 1 : versionVal,
        status: fd.get('status'),
        title: fd.get('title'),
        content: fd.get('content') || null,
        document_storage_reference: fd.get('document_storage_reference') || null,
      };

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Creating\u2026';

      try {
        const created = await apiRequest(ENDPOINTS.reports(caseId), {
          method: 'POST',
          json: payload,
        });
        if (created) {
          showSuccessBanner('Report version ' + created.version + ' created.');
          form.remove();
          renderReports(caseId, panel);
        }
      } catch (err) {
        if (err.status === 409) {
          showErrorBanner('A report with this version already exists for this case.');
        } else {
          handleApiError(err, 'Failed to create report.');
        }
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  // ---------------- Confirmation dialog (unused currently but available) ----------------

  confirmCancel.addEventListener('click', () => {
    confirmDialog.close();
  });
  confirmOk.addEventListener('click', () => {
    confirmDialog.close();
  });

  // ---------------- Event wiring ----------------

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    attemptLogin(adminEmail.value, adminPassword.value);
  });

  menuToggle.addEventListener('click', () => {
    const currentlyHidden = adminSidebar.getAttribute('hidden') !== null;
    const willBeOpen = !currentlyHidden;
    adminSidebar.hidden = !willBeOpen;
    menuToggle.setAttribute('aria-expanded', String(willBeOpen));
    const closeIcon = menuToggle.querySelector('.close-icon');
    const menuIcon = menuToggle.querySelector('.menu-icon');
    if (willBeOpen) {
      closeIcon.style.display = 'inline-block';
      menuIcon.style.display = 'none';
    } else {
      closeIcon.style.display = 'none';
      menuIcon.style.display = 'inline-block';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      menuToggle.click();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      adminSidebar.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  headerLogout.addEventListener('click', signOutAndRedirect);

  // ---------------- Initialization ----------------

  let initializing = false;

  async function initializeApp() {
    if (initializing) return;
    initializing = true;

    try {
      if (!supabase) {
        showLogin();
        setLoginError('Authentication service is not configured.');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data && data.session;
      const token = session && session.access_token;

      if (!session || !token) {
        showLogin();
        return;
      }

      try {
        const me = await apiRequest(ENDPOINTS.adminMe);
        if (me && me.user_id) {
          currentUser = { user_id: me.user_id };
          setAdminIdentity(me.user_id);
          showDashboard();
        } else {
          await signOutAndRedirect();
        }
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          await signOutAndRedirect();
        } else if (err.status === 502 || err.status === 503 || err.message === 'network_error') {
          showLogin();
          setLoginError('The authentication service is temporarily unavailable. Please try again later.');
        } else {
          showLogin();
          setLoginError('Unable to verify administrator access. Please try again.');
        }
      }
    } catch {
      showLogin();
      setLoginError('Unable to initialize session. Please try again.');
    } finally {
      initializing = false;
    }
  }

  // Handle Supabase auth state changes (sign-out elsewhere, token refresh)
  if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (initializing) return;
      if (event === 'SIGNED_OUT') {
        signOutAndRedirect();
      } else if (event === 'TOKEN_REFRESHED' && session && session.access_token) {
        apiRequest(ENDPOINTS.adminMe)
          .then((me) => {
            if (me && me.user_id) {
              currentUser = { user_id: me.user_id };
              setAdminIdentity(me.user_id);
              if (adminSidebar.hidden) showDashboard();
            } else {
              signOutAndRedirect();
            }
          })
          .catch((err) => {
            if (err.status === 401 || err.status === 403) signOutAndRedirect();
          });
      }
    });
  }

  initializeApp();

})();
