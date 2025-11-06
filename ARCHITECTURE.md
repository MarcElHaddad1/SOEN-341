# Architecture

## Overview
This project is a **front-end only**, browser-based events application. All state (users, session, events, attendees) is stored in **localStorage**.

- **Auth & Session**: `auth.js` seeds users, performs login/signup, and stores the current session and roles in localStorage.
- **App Logic**: `script.js` renders events, handles filters/search, shows the Details modal (with QR for claimed tickets), and exposes admin-only creation/management.
- **Pages**: 
  - `login.html` → authentication/registration → redirects to `admin.html` (admin) or `student.html` (student).
  - `admin.html` and `student.html` are thin dashboards that link to `index.html`.
  - `index.html` hosts the events UI for everyone. Admins see the Create Event modal.

See the block diagram in [`system-block.mmd`](./system-block.mmd).

## Components

### Pages (UI)
- **login.html**: login or student signup, then redirect by role.
- **admin.html / student.html**: role badge, logout, and a link to the main app.
- **index.html**: event catalog; admin-only create/manage UI is conditionally available.

### Application Logic
- **script.js**
  - Load & render events from localStorage (with seeded defaults).
  - Filters, search, date range.
  - Details modal with attendee list (admin) and claim button (student).
  - Generates a QR after a successful claim.

### Auth & Session
- **auth.js**
  - Seeded users (admin/student), signup for new students.
  - Session persistence, role guard helpers.
  - Read/write to `localStorage` keys: `users`, `session`.

### Data Model 
- `users`: array/map of `{ id, email, passwordHash/plain, role }`
- `session`: `{ userId, role, ... }`
- `events`: array of `{ id, title, when, where, capacity, ... }`
- `attendees_by_event`: map `{ [eventId]: { [userId]: attendeeInfo } }`

### Styling
- **styles.css**: responsive grid/cards, modals, badges, inputs.

## Known Limitations
- Roles/security are **client-side only** and can be bypassed via DevTools.
- QR codes are **unsigned**; anyone could forge them.
- Time handling depends on the browser locale/timezone.

## Suggested Backend
- Node/Express (or Firebase) for:
  - Auth (hashed passwords, sessions/JWT).
  - Event CRUD scoped by organizer.
  - Ticket claims (one per user, enforce capacity).
  - Signed QR (JWT) + `/verify` endpoint.
- Replace localStorage writes with API calls; keep local cache for UX.
