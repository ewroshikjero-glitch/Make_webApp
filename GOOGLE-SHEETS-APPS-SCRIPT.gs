/**
 * MAKE.INC Google Sheets ↔ Supabase bridge
 * Bound to the MAKE.INC management spreadsheet.
 *
 * SECURITY:
 * - Store SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Script Properties only.
 * - Never paste the service-role key into the web app, a cell, or a shared document.
 * - Keep the spreadsheet and Apps Script project restricted to authorized management.
 * - Protect the Tasks tab so only Principal Architects can edit it.
 *
 * Data flow:
 * - App → Supabase immediately → Google Sheets on the scheduled sync (every minute).
 * - Principal edits Tasks tab → Apps Script upserts tasks into Supabase immediately.
 * - Portal polls Supabase about every 25 seconds, so sheet-created tasks appear in the app shortly after sync.
 */

const MAKE_SHEETS = {
  timezone: 'Asia/Kolkata',
  tabs: {
    Attendance: ['Shift ID', 'Work Date', 'Employee Name', 'Employee Email', 'Scheduled Start', 'Punch In', 'Late In (min after grace)', 'Scheduled End', 'Punch Out', 'Late Out (min)', 'Net Work Hours', 'Break Hours', 'Status', 'Reminder'],
    'Leave Request': ['Request ID', 'Submitted At', 'Employee Name', 'Employee Email', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Reviewed By', 'Reviewed At', 'Manager Note'],
    Reimbursement: ['Claim ID', 'Submitted At', 'Employee Name', 'Employee Email', 'Amount (INR)', 'Category', 'Spent On', 'Description', 'Receipt Path', 'Status', 'Reviewed By', 'Reviewed At', 'Manager Note'],
    Tasks: ['Task ID', 'Task Title', 'Description', 'Project', 'Assignee Email', 'Priority', 'Due Date', 'Status', 'Assigned By Email', 'Updated At'],
    'Staff Directory': ['Employee ID', 'Full Name', 'Email', 'Role', 'Job Title', 'Phone', 'Account Status', 'Created At'],
    'Sync Log': ['Timestamp', 'Level', 'Message', 'Details'],
    Settings: ['Setting', 'Value', 'Notes']
  },
  settings: [
    ['Office Start Time', '09:30', 'EXAMPLE — change this to your official office start time. Used to calculate late punch-in minutes.'],
    ['Office End Time', '18:30', 'EXAMPLE — change this to your official office end time. Used to calculate late punch-out minutes.'],
    ['Late Punch Grace (minutes)', 10, 'Minutes after the scheduled start before late minutes begin accumulating.'],
    ['Open Shift Reminder (hours)', 9, 'Reminder shown in Attendance if a shift is still open beyond this duration.'],
    ['Tea Break Guideline (minutes)', 45, 'Reference only; the app also shows a live break timer.'],
    ['Lunch Break Guideline (minutes)', 60, 'Reference only; the app also shows a live break timer.'],
    ['Time Zone', 'Asia/Kolkata', 'Use this time zone for the studio in Kochi / Ernakulam.']
  ]
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('MAKE.INC Portal')
    .addItem('Set up / repair tabs and sync triggers', 'setupMakeIncSync')
    .addItem('Sync all data now', 'syncAllFromSupabase')
    .addItem('Push Tasks tab to portal now', 'syncTasksToSupabase')
    .addSeparator()
    .addItem('Show setup status', 'showMakeIncStatus')
    .addToUi();
}

/** Run once from the spreadsheet after adding Script Properties. */
function setupMakeIncSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(MAKE_SHEETS.tabs).forEach(name => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const headers = MAKE_SHEETS.tabs[name];
    if (sh.getLastRow() === 0 || String(sh.getRange(1, 1).getDisplayValue()).trim() !== headers[0]) {
      sh.clear();
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    styleSheet_(sh, headers.length);
  });
  const settings = ss.getSheetByName('Settings');
  if (settings.getLastRow() < 2) settings.getRange(2, 1, MAKE_SHEETS.settings.length, 3).setValues(MAKE_SHEETS.settings);
  styleSheet_(settings, 3);
  protectTabs_();
  installTriggers_();
  log_('INFO', 'MAKE.INC Sheets bridge configured.', 'Scheduled sync runs every minute; Tasks edits sync immediately.');
  if (getConfig_().url && getConfig_().key) syncAllFromSupabase();
  SpreadsheetApp.getUi().alert('MAKE.INC Sheets bridge is configured. Check the Sync Log tab for connection status.');
}

function installTriggers_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['syncAllFromSupabase', 'handleTaskSheetEdit'].includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncAllFromSupabase').timeBased().everyMinutes(1).create();
  ScriptApp.newTrigger('handleTaskSheetEdit').forSpreadsheet(ss).onEdit().create();
}

function showMakeIncStatus() {
  const cfg = getConfig_();
  const triggers = ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction()).join(', ') || 'none';
  SpreadsheetApp.getUi().alert('Supabase URL: ' + (cfg.url ? 'configured' : 'MISSING') +
    '\nService role key: ' + (cfg.key ? 'configured' : 'MISSING') +
    '\nInstalled triggers: ' + triggers +
    '\n\nCheck the Sync Log tab for recent results.');
}

/** Installable on-edit trigger: only the protected Tasks tab is an input source. */
function handleTaskSheetEdit(e) {
  try {
    if (!e || !e.range) return;
    const sh = e.range.getSheet();
    if (sh.getName() !== 'Tasks' || e.range.getRow() < 2) return;
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) throw new Error('Another sync is in progress. Please wait a moment and try again.');
    try { syncTasksToSupabase_(); } finally { lock.releaseLock(); }
  } catch (err) {
    log_('ERROR', 'Task sheet edit could not sync.', String(err && err.message || err));
  }
}

function syncTasksToSupabase() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Another sync is in progress. Please retry shortly.');
  try {
    const result = syncTasksToSupabase_();
    SpreadsheetApp.getUi().alert('Task sync complete: ' + result.synced + ' task(s) synced; ' + result.skipped + ' skipped. See Sync Log for details.');
  } finally { lock.releaseLock(); }
}

function syncTasksToSupabase_() {
  const cfg = getConfig_(); requireConfig_(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Tasks');
  if (!sh || sh.getLastRow() < 2) return {synced: 0, skipped: 0};
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(h => norm_(h));
  const col = name => headers.indexOf(norm_(name));
  const c = {
    id: col('Task ID'), title: col('Task Title'), description: col('Description'), project: col('Project'),
    assignee: col('Assignee Email'), priority: col('Priority'), due: col('Due Date'), status: col('Status'),
    assignedBy: col('Assigned By Email'), updated: col('Updated At')
  };
  if ([c.id, c.title, c.assignee, c.status].some(i => i < 0)) throw new Error('Tasks tab headers do not match the supplied template. Run setup again.');
  const profiles = getJson_(cfg, 'profiles', 'select=id,email,role,is_active&limit=2000');
  const byEmail = {};
  profiles.forEach(p => { byEmail[String(p.email || '').toLowerCase()] = p; });
  const principals = profiles.filter(p => p.role === 'principal' && p.is_active);
  const defaultAssigner = principals[0] || profiles.find(p => p.role === 'admin' && p.is_active);
  let synced = 0, skipped = 0;
  const toWriteIds = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const title = String(row[c.title] || '').trim();
    if (!title) { toWriteIds.push([row[c.id] || '']); continue; }
    const email = String(row[c.assignee] || '').trim().toLowerCase();
    const assignee = byEmail[email];
    const assignedEmail = c.assignedBy >= 0 ? String(row[c.assignedBy] || '').trim().toLowerCase() : '';
    const assigner = byEmail[assignedEmail] || defaultAssigner;
    if (!assignee || !assignee.is_active) {
      skipped++;
      log_('WARN', 'Task row skipped: assignee not found or inactive.', 'Row ' + (r + 1) + ' · ' + email + ' · ' + title);
      toWriteIds.push([row[c.id] || '']);
      continue;
    }
    if (!assigner) {
      skipped++;
      log_('WARN', 'Task row skipped: no active Principal/Admin account found.', 'Row ' + (r + 1) + ' · ' + title);
      toWriteIds.push([row[c.id] || '']);
      continue;
    }
    const id = String(row[c.id] || '').trim() || Utilities.getUuid();
    const priorityValue = String(c.priority >= 0 ? row[c.priority] : 'medium').toLowerCase().trim();
    const statusValue = String(c.status >= 0 ? row[c.status] : 'todo').toLowerCase().trim().replace(/\s+/g, '_');
    const due = c.due >= 0 ? dateForApi_(row[c.due]) : null;
    const task = {
      id: id,
      title: title.slice(0, 120),
      description: String(c.description >= 0 ? row[c.description] || '' : '').slice(0, 5000),
      project: String(c.project >= 0 ? row[c.project] || '' : '').slice(0, 200),
      assignee_id: assignee.id,
      assigned_by: assigner.id,
      priority: ['high', 'medium', 'low'].includes(priorityValue) ? priorityValue : 'medium',
      due_date: due,
      status: ['todo', 'in_progress', 'done'].includes(statusValue) ? statusValue : 'todo',
      updated_at: new Date().toISOString()
    };
    try {
      request_(cfg, '/rest/v1/tasks?on_conflict=id', 'post', [task], {'Prefer': 'resolution=merge-duplicates,return=minimal'});
      synced++;
      toWriteIds.push([id]);
      if (c.updated >= 0) sh.getRange(r + 1, c.updated + 1).setValue(new Date());
    } catch (err) {
      skipped++;
      log_('ERROR', 'Task row failed to sync.', 'Row ' + (r + 1) + ' · ' + title + ' · ' + String(err.message || err));
      toWriteIds.push([row[c.id] || '']);
    }
  }
  if (toWriteIds.length && c.id >= 0) sh.getRange(2, c.id + 1, toWriteIds.length, 1).setValues(toWriteIds);
  log_('INFO', 'Task sheet sync finished.', synced + ' synced; ' + skipped + ' skipped.');
  return {synced, skipped};
}

/** Scheduled mirror: Supabase remains the source of truth for attendance, approvals and expenses. */
function syncAllFromSupabase() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return;
  try {
    const cfg = getConfig_(); requireConfig_(cfg);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const profiles = getJson_(cfg, 'profiles', 'select=*&order=full_name.asc&limit=2000');
    const shifts = getJson_(cfg, 'shifts', 'select=*&order=punched_in_at.desc&limit=5000');
    const breaks = getJson_(cfg, 'break_entries', 'select=*&order=started_at.desc&limit=10000');
    const tasks = getJson_(cfg, 'tasks', 'select=*&order=created_at.desc&limit=5000');
    const leaves = getJson_(cfg, 'leave_requests', 'select=*&order=created_at.desc&limit=5000');
    const claims = getJson_(cfg, 'reimbursements', 'select=*&order=created_at.desc&limit=5000');
    const profileById = {};
    profiles.forEach(p => profileById[p.id] = p);
    const breaksByShift = {};
    breaks.forEach(b => { (breaksByShift[b.shift_id] ||= []).push(b); });
    const settings = readSettings_();
    const now = new Date();

    const attendanceRows = shifts.map(s => {
      const p = profileById[s.user_id] || {};
      const workDate = Utilities.formatDate(new Date(s.punched_in_at), MAKE_SHEETS.timezone, 'yyyy-MM-dd');
      const start = scheduledDate_(workDate, settings.start);
      const end = scheduledDate_(workDate, settings.end);
      const inDate = new Date(s.punched_in_at);
      const outDate = s.punched_out_at ? new Date(s.punched_out_at) : null;
      const lateIn = Math.max(0, Math.floor((inDate.getTime() - start.getTime()) / 60000) - settings.grace);
      const lateOut = outDate ? Math.max(0, Math.floor((outDate.getTime() - end.getTime()) / 60000)) : '';
      const bs = breaksByShift[s.id] || [];
      const breakMs = bs.reduce((sum, b) => {
        const from = new Date(b.started_at).getTime();
        const to = b.ended_at ? new Date(b.ended_at).getTime() : now.getTime();
        return sum + Math.max(0, to - from);
      }, 0);
      const elapsed = Math.max(0, (outDate ? outDate.getTime() : now.getTime()) - inDate.getTime());
      const activeBreak = bs.some(b => !b.ended_at);
      const reminderHours = settings.reminderHours;
      const openLong = !outDate && elapsed >= reminderHours * 3600000;
      const status = outDate ? 'COMPLETED' : activeBreak ? 'ON BREAK' : openLong ? 'OPEN SHIFT · CHECK' : 'IN PROGRESS';
      const reminder = openLong ? 'Check whether employee forgot to punch out.' : activeBreak ? 'Break timer active; work timer paused.' : lateIn > 0 ? 'Late punch-in recorded.' : '';
      return [s.id, workDate, p.full_name || 'Unknown employee', p.email || '', settings.start, inDate, lateIn, settings.end, outDate || '', lateOut, Math.max(0, elapsed - breakMs) / 3600000, breakMs / 3600000, status, reminder];
    });

    const leaveRows = leaves.map(x => {
      const p = profileById[x.user_id] || {}, reviewer = profileById[x.reviewed_by] || {};
      return [x.id, x.created_at ? new Date(x.created_at) : '', p.full_name || '', p.email || '', x.type === 'sick' ? 'Sick' : 'Normal', x.start_date || '', x.end_date || '', x.reason || '', x.status || '', reviewer.full_name || '', x.reviewed_at ? new Date(x.reviewed_at) : '', x.manager_note || ''];
    });
    const reimbursementRows = claims.map(x => {
      const p = profileById[x.user_id] || {}, reviewer = profileById[x.reviewed_by] || {};
      return [x.id, x.created_at ? new Date(x.created_at) : '', p.full_name || '', p.email || '', Number(x.amount || 0), x.category || '', x.spent_on || '', x.description || '', x.receipt_path || '', x.status || '', reviewer.full_name || '', x.reviewed_at ? new Date(x.reviewed_at) : '', x.manager_note || ''];
    });
    const taskRows = tasks.map(x => {
      const assignee = profileById[x.assignee_id] || {}, assigner = profileById[x.assigned_by] || {};
      return [x.id, x.title || '', x.description || '', x.project || '', assignee.email || '', x.priority || 'medium', x.due_date || '', x.status || 'todo', assigner.email || '', x.updated_at ? new Date(x.updated_at) : (x.created_at ? new Date(x.created_at) : '')];
    });
    const staffRows = profiles.map(p => [p.id, p.full_name || '', p.email || '', p.role || 'employee', p.job_title || '', p.phone || '', p.is_active ? 'Active' : 'Pending approval', p.created_at ? new Date(p.created_at) : '']);

    writeTable_(ss, 'Attendance', attendanceRows);
    writeTable_(ss, 'Leave Request', leaveRows);
    writeTable_(ss, 'Reimbursement', reimbursementRows);
    writeTable_(ss, 'Tasks', taskRows);
    writeTable_(ss, 'Staff Directory', staffRows);
    protectTabs_(profiles);
    log_('INFO', 'Full Supabase → Sheets sync complete.', profiles.length + ' staff · ' + shifts.length + ' shifts · ' + tasks.length + ' tasks · ' + leaves.length + ' leave requests · ' + claims.length + ' reimbursements.');
  } catch (err) {
    log_('ERROR', 'Full sync failed.', String(err && err.message || err));
  } finally { lock.releaseLock(); }
}

function getJson_(cfg, table, query) {
  const result = request_(cfg, '/rest/v1/' + table + '?' + query, 'get');
  if (!Array.isArray(result)) throw new Error('Unexpected response for ' + table);
  return result;
}

function request_(cfg, path, method, payload, extraHeaders) {
  const options = {
    method: method || 'get',
    headers: Object.assign({apikey: cfg.key, Authorization: 'Bearer ' + cfg.key}, extraHeaders || {}),
    muteHttpExceptions: true
  };
  if (payload !== undefined) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  const response = UrlFetchApp.fetch(cfg.url + path, options);
  const code = response.getResponseCode();
  const body = response.getContentText();
  if (code < 200 || code >= 300) throw new Error('Supabase returned HTTP ' + code + ': ' + body.slice(0, 700));
  if (!body) return null;
  try { return JSON.parse(body); } catch (_) { return body; }
}

function getConfig_() {
  const p = PropertiesService.getScriptProperties();
  return {url: String(p.getProperty('SUPABASE_URL') || '').replace(/\/$/, ''), key: String(p.getProperty('SUPABASE_SERVICE_ROLE_KEY') || '')};
}
function requireConfig_(cfg) {
  if (!cfg.url || !cfg.key) throw new Error('Missing Script Properties. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Apps Script → Project Settings → Script Properties.');
}
function readSettings_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  const vals = sh && sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues() : [];
  const map = {};
  vals.forEach(r => map[String(r[0] || '').trim()] = r[1]);
  return {
    start: normalizeTime_(map['Office Start Time'], '09:30'),
    end: normalizeTime_(map['Office End Time'], '18:30'),
    grace: Math.max(0, Number(map['Late Punch Grace (minutes)'] ?? 10) || 0),
    reminderHours: Math.max(1, Number(map['Open Shift Reminder (hours)'] ?? 9) || 9)
  };
}
function normalizeTime_(v, fallback) {
  if (v instanceof Date) return Utilities.formatDate(v, MAKE_SHEETS.timezone, 'HH:mm');
  const s = String(v || fallback).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallback;
  return String(Math.min(23, Number(m[1]))).padStart(2, '0') + ':' + String(Math.min(59, Number(m[2]))).padStart(2, '0');
}
function scheduledDate_(ymd, hhmm) { return new Date(ymd + 'T' + hhmm + ':00+05:30'); }
function dateForApi_(v) {
  if (!v) return null;
  if (v instanceof Date) return Utilities.formatDate(v, MAKE_SHEETS.timezone, 'yyyy-MM-dd');
  const s = String(v).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : Utilities.formatDate(d, MAKE_SHEETS.timezone, 'yyyy-MM-dd');
}
function writeTable_(ss, name, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  const headers = MAKE_SHEETS.tabs[name];
  const cleanRows = rows.map(row => row.map(safeCell_));
  sh.clearContents();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (cleanRows.length) sh.getRange(2, 1, cleanRows.length, headers.length).setValues(cleanRows);
  styleSheet_(sh, headers.length);
  if (name === 'Attendance' && cleanRows.length) {
    sh.getRange(2, 6, cleanRows.length, 1).setNumberFormat('dd mmm yyyy, hh:mm:ss');
    sh.getRange(2, 9, cleanRows.length, 1).setNumberFormat('dd mmm yyyy, hh:mm:ss');
    sh.getRange(2, 11, cleanRows.length, 2).setNumberFormat('0.00');
  }
  if (name === 'Reimbursement' && cleanRows.length) sh.getRange(2, 5, cleanRows.length, 1).setNumberFormat('₹#,##0.00');
  sh.setFrozenRows(1);
}
function styleSheet_(sh, columns) {
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, columns).setBackground('#182127').setFontColor('#F8F5EF').setFontWeight('bold').setWrap(true).setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);
  sh.setTabColor(sh.getName() === 'Tasks' ? '#B89472' : '#263740');
  sh.getRange(1, 1, Math.max(2, sh.getLastRow()), columns).setFontFamily('Arial').setVerticalAlignment('middle');
  sh.getRange(1, 1, 1, columns).setFontFamily('Arial').setFontSize(10).setFontWeight('bold');
  sh.autoResizeColumns(1, columns);
  for (let c = 1; c <= columns; c++) sh.setColumnWidth(c, Math.min(300, Math.max(100, sh.getColumnWidth(c))));
  sh.getBandings().forEach(b => b.remove());
  if (sh.getLastRow() > 1) {
    sh.getRange(1, 1, sh.getLastRow(), columns).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
    sh.getRange(1, 1, 1, columns).setBackground('#182127').setFontColor('#F8F5EF').setFontWeight('bold');
  }
}
function protectTabs_(profiles) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  profiles = profiles || [];
  const principalEmails = profiles.filter(p => p.role === 'principal' && p.is_active).map(p => p.email).filter(Boolean);
  const managerEmails = profiles.filter(p => ['principal', 'admin'].includes(p.role) && p.is_active).map(p => p.email).filter(Boolean);
  Object.keys(MAKE_SHEETS.tabs).forEach(name => {
    const sh = ss.getSheetByName(name);
    if (!sh) return;
    let protections = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    let protection = protections.length ? protections[0] : sh.protect();
    protection.setDescription('MAKE.INC managed data — edit through the portal, except Tasks which is Principal-managed.');
    protection.setWarningOnly(false);
    try { const editors = protection.getEditors(); if (editors.length) protection.removeEditors(editors); } catch (_) {}
    try { if (protection.canDomainEdit()) protection.setDomainEdit(false); } catch (_) {}
    const allowed = name === 'Tasks' ? principalEmails : managerEmails;
    if (allowed.length) { try { protection.addEditors(allowed); } catch (err) { log_('WARN', 'Could not set sheet protection editors for ' + name + '.', String(err.message || err)); } }
  });
}
function safeCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' && /^[=+@\-]/.test(v)) return "'" + v;
  return v;
}
function norm_(s) { return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function log_(level, message, details) {
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sync Log');
    if (!sh) return;
    sh.appendRow([new Date(), level, safeCell_(message), safeCell_(details || '')]);
    const last = sh.getLastRow();
    if (last > 501) sh.deleteRows(2, last - 501);
    sh.getRange(Math.max(2, sh.getLastRow()), 1, 1, 1).setNumberFormat('dd mmm yyyy, hh:mm:ss');
  } catch (_) {}
}
