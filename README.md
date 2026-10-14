# MAKE.INC — Employee & Studio Management Portal

A responsive employee portal for an architecture and design-build studio, with your original MAKE.INC logo. Built with dependency-free HTML, CSS and JavaScript. Installable as a Progressive Web App (PWA) after hosting over HTTPS. Optional Supabase backend provides real employee sign-in, shared data, server-stamped attendance and private receipt storage. An optional Google Sheets bridge mirrors attendance, leave, reimbursements, staff and tasks; Principals can maintain tasks in the Tasks tab.

## What's included

- **Employees:** individual registration/sign-in, approval-gated account, account profile, dashboard, punch in/out, lunch/tea break timers, net working time, work history, daily project tasks, sick/normal leave requests, reimbursement submissions with optional receipt.
- **Administrators:** team attendance, task assignment, leave approval/rejection, reimbursement approval/rejection/mark-paid, staff account activation.
- **Principal Architects:** all admin capabilities, PLUS permission to promote/demote employees and administrators. No manager can deactivate or demote their own account through the app.
- **Reminders:** in-app notice after **45 minutes of tea break**, **1 hour of lunch**, or an **open shift longer than 9 hours**. Optional browser notifications if allowed. Net working time is paused during active breaks and resumes as soon as the break ends.
- **Responsive/PWA:** mobile navigation, desktop sidebar, installable home-screen app after deployment.

## Try the interactive demo — no setup

1. Extract the project ZIP.
2. Double-click `index.html` in Chrome, Edge or a modern web browser. **OR** open the separately included `MAKE-INC-PORTAL-ONE-FILE-DEMO.html` with just one file.
3. Select **Employee view**, **Admin view**, or **Principal view** under the demo sign-in form.
4. Try the punch controls, break timers, task states, leave submissions, approvals, and employee access permissions.
5. The sample data is stored in **your browser only**. Demo mode does **not** provide secure logins or synchronization across employees.

**Important:** The demonstration is for UI review and testing, NOT real staff attendance. Go live using the steps below.

## Google Sheets integration (optional)

See [`GOOGLE-SHEETS-SETUP.md`](./GOOGLE-SHEETS-SETUP.md) for the two-way Sheets bridge and [`GOOGLE-SHEETS-APPS-SCRIPT.gs`](./GOOGLE-SHEETS-APPS-SCRIPT.gs) for the script. The management workbook contains Attendance (including late punch-in/out indicators), Leave Request, Reimbursement, Tasks, Staff Directory, Settings and Sync Log. After configuration, the sheet mirrors portal activity about once per minute; Principal-edited task rows sync into Supabase immediately and the open app refreshes task data about every 25 seconds. Keep the workbook and Apps Script restricted to management.

## Deploy real, separate team accounts — Supabase + static hosting

### 1) Create a Supabase project

- Create a project at <https://supabase.com>.
- Open its **SQL Editor**. Paste the entire `supabase-schema.sql` file and run it on a **new/fresh project**.
- This creates tables, security policies, private receipt storage, the signup trigger and server-controlled attendance/management functions.
- Under **Authentication > Providers**, enable Email. It is advisable to require email confirmation.
- Keep the Supabase **service role** secret; it is never used in the browser.

### 2) Connect your portal

Edit `config.js`:

```js
window.MAKE_INC_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY'
};
```

Both values are available under Supabase **Project Settings > API / API Keys** (menu names may vary). **Only use the publishable/anon public browser key**, never `service_role` or database passwords. Once both values are filled in, the app switches from sample demo mode to secure live mode automatically.

### 3) Publish the site using a static hosting service

You do **not** need to run a web server or purchase a separate backend server; Supabase is the backend.

A simple option is [Netlify Drop](https://app.netlify.com/drop): upload the whole folder's site files (index.html, app.js, styles.css, config.js, logo.png, icons, manifest.json, sw.js). Alternatively deploy those files with [Cloudflare Pages](https://pages.cloudflare.com/) or GitHub Pages. Use HTTPS.

**Do not publish** `supabase-schema.sql` if you would prefer the database setup script not be public; it is not needed by the running website. Keep `README.md` and test files outside your published folder if desired.

In Supabase **Authentication > URL Configuration**, set the Site URL to your published HTTPS URL and add it under the allowed redirect URLs, so email verification points to the correct site.

### 4) Register the first Principal Architect

- Open your published portal, select **Create an account** and register the Principal Architect's email. Confirm the email if Supabase requires it.
- In the Supabase SQL Editor, run this **once**, changing the email to the first principal's actual account:

```sql
update public.profiles
set role = 'principal', job_title = 'Principal Architect', is_active = true
where email = 'principal@your-office.com';
```

- Log in as the Principal Architect. The **Team & Access** tab will now be available.
- Each employee signs up with their own email/password. Their access is **pending** until the principal or admin approves it in **Team & Access**.
- From the same tab, a Principal Architect can assign the Admin role to trusted team members. Admins can activate ordinary employees, assign tasks and review requests, but cannot elevate themselves or others to management.

### 5) Install the mobile app

After the HTTPS portal is published:

- **Android (Chrome):** open the URL → browser menu → **Add to Home screen** / **Install app**.
- **iPhone (Safari):** open the URL → **Share** → **Add to Home Screen**.

This is an **installable web app (PWA)**, not a compiled Android APK or native iOS app. Attendance submission, tasks, approvals and receipts require internet connectivity to reach Supabase. The basic app shell may remain available offline if previously cached, but new data cannot be submitted offline.

## Working time rules

- **Punch In** starts an open shift using the Supabase database server timestamp.
- **Start Tea Break / Start Lunch Break** opens a break. Only one may run at a time.
- During the break, **net working time remains paused**, and the corresponding break timer continues.
- **End Break** closes that break; net working time resumes automatically.
- **Punch Out** is only allowed after ending an active break. It records the end time using the Supabase server timestamp.
- **Net work** = elapsed shift time - sum of break intervals. Dashboard clocks are visual live estimates; official attendance entries are taken from the server.
- Time displays are localized to **Asia/Kolkata**. The 8-hour dashboard progress target and 9-hour shift reminder can be changed in `app.js`.

## Reminders and limits

Reminders work while the portal is open. Users may enable browser notifications, which can appear when permission is granted and the application page is running. Guaranteed reminders when the portal is **closed** (push/email/SMS) require a backend scheduler, a notification service and an organization policy. Such background notifications are **not included** in this starter app.

This starter app does not include payroll calculations, public holiday calendars, leave accrual/balances, IP/GPS verification, multiple approval levels, geofencing or automatic corrections for forgotten overnight punch-outs. If these become needed, they should be configured with explicit studio policies before use.

## Files

| File | Purpose |
|---|---|
| `index.html` | Web app entry point |
| `styles.css` | MAKE.INC visual design and responsiveness |
| `app.js` | Screens, timers, forms, sample demo and Supabase REST integration |
| `config.js` | Public Supabase project URL and public browser API key |
| `supabase-schema.sql` | Database, row-level security, role rules, RPC functions, receipt storage |
| `GOOGLE-SHEETS-APPS-SCRIPT.gs` | Secure management-side Google Sheets bridge |
| `GOOGLE-SHEETS-SETUP.md` | Step-by-step Google Sheets setup and permissions guide |
| `logo.png` | Original MAKE.INC logo, transparently cropped |
| `icon-192.png` / `icon-512.png` | Home-screen app icons |
| `manifest.json` / `sw.js` | Progressive Web App installation and shell caching |

## Security and deployment notes

- Signup accounts cannot choose their own role; the database creates every new account as an unapproved employee.
- A verified manager role is required for approvals/task creation. Principal role changes are enforced in the database, not just hidden in the interface.
- The database denies employees write access to other staff attendance, tasks, leave decisions, roles, or reimbursement reviews.
- Submitted receipt files are stored in a private bucket and opened through short-lived signed URLs.
- Demo mode is intentionally **not secure**; never collect real employment data in it.
- Review local labor policies and your studio's consent/privacy notice before implementing time tracking for employees.
- A successful browser/UI test does not substitute for end-to-end testing against your own Supabase project and deployment.

© MAKE.INC — DESIGN + BUILD.
