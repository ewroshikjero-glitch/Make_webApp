import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// Load Firebase configuration
let app = null;
let auth = null;
let cachedAccessToken = null; // MANDATORY: In-memory token cache only
let isSigningIn = false;
let authListeners = [];

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

async function initFirebase() {
  try {
    const res = await fetch('/firebase-applet-config.json');
    if (!res.ok) throw new Error('Could not fetch firebase-applet-config.json');
    const firebaseConfig = await res.json();
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        cachedAccessToken = null;
      }
      authListeners.forEach(fn => fn(user, cachedAccessToken));
    });
  } catch (err) {
    console.warn('Firebase initialization note:', err.message);
  }
}

export const GoogleSheetsBridge = {
  getScopes() {
    return SCOPES;
  },

  onAuthChange(fn) {
    authListeners.push(fn);
    if (auth?.currentUser) {
      fn(auth.currentUser, cachedAccessToken);
    }
  },

  getCurrentUser() {
    return auth?.currentUser || null;
  },

  getAccessToken() {
    return cachedAccessToken;
  },

  async signIn() {
    if (!auth) await initFirebase();
    if (!auth) throw new Error('Firebase Auth is not available.');

    const provider = new GoogleAuthProvider();
    SCOPES.forEach(scope => provider.addScope(scope));
    // Prompt consent to ensure fresh tokens and scopes
    provider.setCustomParameters({ prompt: 'consent select_account' });

    isSigningIn = true;
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('No access token returned from Google Auth');
      }
      cachedAccessToken = credential.accessToken;
      authListeners.forEach(fn => fn(result.user, cachedAccessToken));
      return { user: result.user, accessToken: cachedAccessToken };
    } finally {
      isSigningIn = false;
    }
  },

  async signOut() {
    if (auth) {
      await signOut(auth);
    }
    cachedAccessToken = null;
    authListeners.forEach(fn => fn(null, null));
  },

  async fetchWithAuth(url, options = {}) {
    if (!cachedAccessToken) {
      throw new Error('Please connect your Google account first.');
    }
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${cachedAccessToken}`
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      cachedAccessToken = null;
      authListeners.forEach(fn => fn(auth?.currentUser || null, null));
      throw new Error('Google authorization expired. Please reconnect your Google account.');
    }
    return response;
  },

  async listSpreadsheets() {
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,modifiedTime,webViewLink)`;
    const res = await this.fetchWithAuth(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to list Google Spreadsheets');
    }
    const data = await res.json();
    return data.files || [];
  },

  async getSpreadsheetMetadata(spreadsheetId) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`;
    const res = await this.fetchWithAuth(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to access spreadsheet');
    }
    return await res.json();
  },

  async createStudioSpreadsheet(title, studioData) {
    const body = {
      properties: {
        title: title || 'MAKE.INC — Studio Operations'
      },
      sheets: [
        { properties: { title: 'Attendance' } },
        { properties: { title: 'Tasks' } },
        { properties: { title: 'Leave Requests' } },
        { properties: { title: 'Reimbursements' } },
        { properties: { title: 'Staff Directory' } },
        { properties: { title: 'Settings' } }
      ]
    };

    const res = await this.fetchWithAuth('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to create Google Sheet');
    }

    const created = await res.json();
    const spreadsheetId = created.spreadsheetId;

    if (studioData) {
      await this.syncDataToSheet(spreadsheetId, studioData);
    }

    return created;
  },

  async syncDataToSheet(spreadsheetId, data) {
    const profiles = data.profiles || [];
    const nameMap = {};
    const emailMap = {};
    profiles.forEach(p => {
      nameMap[p.id] = p.full_name;
      emailMap[p.id] = p.email;
    });

    // 1. Attendance values
    const attendanceHeaders = ['Shift ID', 'Employee Name', 'Email', 'Punch In', 'Punch Out', 'Breaks (hrs)', 'Net Worked (hrs)', 'Status', 'Date'];
    const attendanceRows = (data.shifts || []).map(s => {
      const pIn = s.punched_in_at ? new Date(s.punched_in_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—';
      const pOut = s.punched_out_at ? new Date(s.punched_out_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—';
      const d = s.punched_in_at ? s.punched_in_at.slice(0, 10) : '';
      const workedH = s.punched_out_at ? ((new Date(s.punched_out_at) - new Date(s.punched_in_at)) / 3600000).toFixed(2) : 'Active';
      return [
        s.id || '',
        nameMap[s.user_id] || 'Unknown',
        emailMap[s.user_id] || '',
        pIn,
        pOut,
        '0.00',
        workedH,
        s.punched_out_at ? 'Completed' : 'Active',
        d
      ];
    });

    // 2. Tasks values
    const taskHeaders = ['Task ID', 'Task Title', 'Project', 'Assignee Email', 'Priority', 'Due Date', 'Status', 'Description'];
    const taskRows = (data.tasks || []).map(t => [
      t.id || '',
      t.title || '',
      t.project || 'General',
      emailMap[t.assignee_id] || '',
      t.priority || 'medium',
      t.due_date || '',
      t.status || 'todo',
      t.description || ''
    ]);

    // 3. Leave Requests
    const leaveHeaders = ['Request ID', 'Employee Name', 'Email', 'Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Manager Note'];
    const leaveRows = (data.leave_requests || []).map(r => [
      r.id || '',
      nameMap[r.user_id] || '',
      emailMap[r.user_id] || '',
      r.type || 'normal',
      r.start_date || '',
      r.end_date || '',
      r.reason || '',
      r.status || 'pending',
      r.manager_note || ''
    ]);

    // 4. Reimbursements
    const reimbursementHeaders = ['Claim ID', 'Employee Name', 'Email', 'Category', 'Spent On', 'Amount (INR)', 'Description', 'Status'];
    const reimbursementRows = (data.reimbursements || []).map(rm => [
      rm.id || '',
      nameMap[rm.user_id] || '',
      emailMap[rm.user_id] || '',
      rm.category || '',
      rm.spent_on || '',
      rm.amount || 0,
      rm.description || '',
      rm.status || 'pending'
    ]);

    // 5. Staff Directory
    const staffHeaders = ['Staff ID', 'Full Name', 'Email', 'Job Title', 'Role', 'Status'];
    const staffRows = profiles.map(p => [
      p.id || '',
      p.full_name || '',
      p.email || '',
      p.job_title || 'Architect',
      p.role || 'employee',
      p.is_active ? 'Active' : 'Pending'
    ]);

    // 6. Settings
    const settingHeaders = ['Setting', 'Value', 'Notes'];
    const settingRows = [
      ['Tea Break Guideline (minutes)', '45', 'In-app reminder limit'],
      ['Lunch Break Guideline (minutes)', '60', 'In-app reminder limit (1 hour)'],
      ['Open Shift Reminder (hours)', '9', 'Reminder threshold for open shifts'],
      ['Time Zone', 'Asia/Kolkata', 'MAKE.INC studio standard time zone'],
      ['Last Portal Sync', new Date().toISOString(), 'Timestamp of the last full sync']
    ];

    const batchData = [
      { range: 'Attendance!A1:I', values: [attendanceHeaders, ...attendanceRows] },
      { range: 'Tasks!A1:H', values: [taskHeaders, ...taskRows] },
      { range: 'Leave Requests!A1:I', values: [leaveHeaders, ...leaveRows] },
      { range: 'Reimbursements!A1:H', values: [reimbursementHeaders, ...reimbursementRows] },
      { range: 'Staff Directory!A1:F', values: [staffHeaders, ...staffRows] },
      { range: 'Settings!A1:C', values: [settingHeaders, ...settingRows] }
    ];

    const res = await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to update sheet values');
    }

    return await res.json();
  },

  async importTasksFromSheet(spreadsheetId, profiles = []) {
    const res = await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A2:H100`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to read Tasks tab');
    }
    const data = await res.json();
    const rows = data.values || [];

    const emailToId = {};
    profiles.forEach(p => {
      emailToId[p.email.toLowerCase().trim()] = p.id;
    });

    return rows.filter(row => row[1] && row[1].trim()).map((row, idx) => {
      const assigneeEmail = String(row[3] || '').toLowerCase().trim();
      const assigneeId = emailToId[assigneeEmail] || profiles[0]?.id || 'demo-employee';
      return {
        id: row[0] || ('sheet-task-' + Date.now() + '-' + idx),
        title: String(row[1] || '').trim(),
        project: String(row[2] || 'General').trim(),
        assignee_id: assigneeId,
        priority: ['high', 'medium', 'low'].includes(String(row[4] || '').toLowerCase()) ? String(row[4]).toLowerCase() : 'medium',
        due_date: row[5] || '',
        status: ['todo', 'in_progress', 'done'].includes(String(row[6] || '').toLowerCase()) ? String(row[6]).toLowerCase() : 'todo',
        description: String(row[7] || '').trim(),
        source: 'google-sheets'
      };
    });
  }
};

window.GoogleSheetsBridge = GoogleSheetsBridge;
initFirebase();
