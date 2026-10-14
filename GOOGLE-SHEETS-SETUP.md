# MAKE.INC — Google Sheets connection

This bridge links the portal's secure Supabase database with a Google Sheets workbook.

## What syncs, and how fast?

- **Attendance** — shift ID, employee, work date, punch-in, punch-out, net work hours, break hours, late punch-in minutes, late punch-out minutes, open-shift reminders. Refreshes about every minute.
- **Leave Request** — sick/normal leave, dates, reason, status, reviewer, manager notes. Refreshes about every minute.
- **Reimbursement** — amount, category, date, description, receipt path, approval/payment status. Refreshes about every minute.
- **Tasks** — Principal Architects can create/edit tasks in the Tasks tab. A sheet edit is sent to Supabase immediately, and the app refreshes its data about every 25 seconds while open. The scheduled sync also mirrors status changes from the app back to the sheet.
- **Staff Directory** — staff IDs, names, emails, roles, active/pending status.
- **Settings** — office start/end and grace-period settings used for late punch calculations.
- **Sync Log** — connection errors and sync summaries.

**Architecture:** the portal continues to use Supabase as the secure system of record. Google Sheets is the management reporting view and a convenient task-entry surface. This avoids putting a powerful Google or Supabase secret in the public webpage.

## Setup steps

### 1. Prepare the Google Sheet

1. Create a new Google Sheet from the supplied `MAKE-INC-Google-Sheets-Template.xlsx` (upload it to Google Drive and choose **Open with Google Sheets**) or create a blank spreadsheet.
2. Name it `MAKE.INC — Studio Operations`.
3. Open **Extensions → Apps Script**.
4. Copy all of `GOOGLE-SHEETS-APPS-SCRIPT.gs` from this project into the Apps Script editor, replacing the starter code, and save.

### 2. Add the Supabase credentials securely

1. Open Apps Script **Project Settings** (gear icon).
2. Under **Script Properties**, add:
   - `SUPABASE_URL` = your project URL, e.g. `https://YOUR_PROJECT_ID.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = the **service_role** secret from Supabase Project Settings → API Keys (or the legacy service_role key if your project uses it).
3. Do **not** put the service-role key in a spreadsheet cell, `config.js`, website JavaScript, or a public repository. Apps Script properties are server-side, but the Apps Script project itself must be shared only with trusted administrators.

### 3. Set the office schedule

In the `Settings` tab, update `Office Start Time`, `Office End Time`, and `Late Punch Grace (minutes)` to match the actual MAKE.INC policy. The template uses **09:30–18:30 and a 10-minute grace period only as examples**. Late-in minutes are calculated after the configured grace period; late-out minutes count minutes after the configured end time. Confirm the policy before using these columns for payroll or disciplinary decisions.

### 4. Initialize and authorize the sync

1. In Apps Script, select `setupMakeIncSync` and click **Run**.
2. Review the permissions prompt and authorize the script under the Google account that owns the sheet.
3. Return to the spreadsheet and reload it. A **MAKE.INC Portal** menu should appear.
4. Choose **Sync all data now** and check the `Sync Log` tab for a successful message.
5. If the setup created a missing `Tasks` tab, use its headers exactly as provided. Add task rows starting on row 2.

### 5. Enter tasks in the Tasks tab

Use these columns in order:

`Task ID | Task Title | Description | Project | Assignee Email | Priority | Due Date | Status | Assigned By Email | Updated At`

- Leave `Task ID` blank for a new task; the script assigns an ID.
- `Assignee Email` must exactly match an **active** employee's portal account email.
- Priority must be `high`, `medium`, or `low`.
- Status must be `todo`, `in_progress`, or `done`.
- Leave `Assigned By Email` blank to use the active Principal Architect account by default.
- Do not delete old task rows to cancel work; change the status or use the portal's task workflow. Blank task titles are ignored.

After you edit a task row, the installed edit trigger pushes it to Supabase. With the portal open, employees should see new tasks after the next data refresh (typically within 25–60 seconds). The one-minute schedule mirrors app-side task status changes and the other tabs.

### 6. Restrict access

- Create and own the spreadsheet under a trusted Principal Architect / management Google account.
- Share the spreadsheet and its Apps Script project only with authorized management; **do not share the whole workbook with all employees** because it contains staff attendance, leave reasons, and reimbursement data.
- The script attempts to protect the Tasks tab for active Principal Architect email addresses and the other tabs for active admins/principals. The spreadsheet owner retains owner-level privileges. Check **Data → Protect sheets and ranges** after setup.
- Employees should use their individual portal accounts. They do not need access to the management spreadsheet.

## Troubleshooting

- **No data appears:** ensure the Supabase project is already configured and the first Principal Architect account has been activated. Check Script Properties and the Sync Log.
- **Task row skipped:** verify the assignee email is correct and the employee account is active; use an allowed priority/status.
- **App does not show a sheet task:** confirm the edit trigger exists in Apps Script → Triggers, check Sync Log, and verify the portal is in live Supabase mode (not demo mode).
- **Sync Log says HTTP 401/403:** the URL/key pair may be incorrect or the key may have been rotated. Update Script Properties, never website code.
- **Late-in/out values seem wrong:** set the actual office schedule in Settings. These values are operational indicators, not payroll-ready records without policy review.

## Notes

- This setup requires the portal's Supabase database and live app configuration to be completed first. It does not create a public Google Sheet API endpoint.
- Apps Script time-driven triggers run on Google's schedule and can be delayed occasionally; the sheet is a near-live management mirror, not a second attendance clock.
- Receipt files remain in Supabase private storage; the Reimbursement tab contains their storage path, not a public file URL.
