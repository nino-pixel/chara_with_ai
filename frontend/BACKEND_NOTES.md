# Backend notes — Admin Dashboard & security

Use this when wiring the frontend to the API. **Focus muna sa frontend**; these are for later implementation.

---

## Dashboard data sources

| Card / Chart | Table | Query / Field |
|-------------|--------|----------------|
| **Total Clients** | `clients` | `COUNT(id)` |
| **Active Listings** | `properties` | `WHERE status = 'available'` (count) |
| **Monthly Sales** | `transactions` | `SUM(amount)` for current month |
| **Pending Inquiries** | `inquiries` | `WHERE status IN ('new', 'pending')` (count) |
| **Closed Deals** | `transactions` | `WHERE status = 'closed'` (count) |
| **Line chart — Sales trend** | `transactions` | `SELECT month, SUM(amount) FROM transactions GROUP BY month` (last 12 months) |
| **Bar chart — Client source** | `clients` | `source` (Facebook, Website, Walk-in, Referral) — GROUP BY source |
| **Pie chart — Property status** | `properties` | `status` (Available, Reserved, Sold) — counts |
| **Bar chart — Inquiries per month** | `inquiries` | GROUP BY month (last 12 months) |
| **Recent activity table** | `transactions` / `inquiries` | Latest 10 rows: client, property, status, date |

---

## Security (required)

- Dashboard (and all `/admin/*` routes) **must not be public** and **not client-accessible**.
- Backend must enforce: if `user.role != "admin"` (or allowed role), **redirect** or return 403.
- Do not rely on frontend-only checks; protect API endpoints and admin routes on the server.

---

## Optional

- Reserve a `reserved` status for properties if you want the pie chart to match (Available / Reserved / Sold).
- Add `source` to `clients` (Facebook, Website, Walk-in, Referral) for lead-source reporting.

---

## Clients Management

**Permissions:** Super Admin = all; Staff = view/edit only; Encoder = add only. Check role before delete/bulk/export.

**clients table:** id, name, email (unique), phone, address, source, status, notes, password (nullable), admin_notes, created_at, updated_at.

**Related:** inquiries.client_id, transactions.client_id, favorites.client_id. Validation: empty name, invalid email, duplicate email.

---

## Inquiry / Leads — source tracking (Manual + Automatic)

**Design:** Redundancy = reliability. Use both UTM (automatic) and user-selected source (manual backup).

### Database (inquiries / leads table)

Minimum columns for source:

| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | — |
| `client_id` | FK nullable | If linked to client |
| `property_id` | FK nullable | Property inquired |
| `source_auto` | string nullable | From URL: `utm_source` (facebook, google, website, etc.) |
| `source_manual` | string nullable | User-selected: Facebook, Google, Referral, Walk-in, Website, Other |
| `utm_campaign` | string nullable | From URL |
| `utm_medium` | string nullable | From URL |
| `created_at` | timestamp | — |

(Plus existing: name, email, phone, message, status, assigned_to, etc.)

### URL tracking

Public links (e.g. from FB post) should use UTM:

`yoursite.com/inquiry?utm_source=facebook&utm_campaign=promo_march&utm_medium=social`

Frontend already reads these and sends as `source_auto`, `utm_campaign`, `utm_medium`. Form also has visible “How did you find us?” dropdown → `source_manual`.

### Backend save logic (final_source)

When saving an inquiry/lead:

- If `source_auto` is present → use it as the primary source (e.g. for reporting).
- Else if `source_manual` is present → use it.
- Else → treat as `"unknown"`.

Optionally store a computed `final_source` for easy filtering/analytics, or derive at query time. Keep both `source_auto` and `source_manual` so you can compare (e.g. auto: facebook vs manual: referral = inconsistency to review).

**Property leads count:** Do not allow admin to edit. Compute from inquiries/leads table: `COUNT(*) WHERE property_id = ?`. Display only in table and property profile.

---

## Activity / Audit Log

**Purpose:** Track who did what, when, and why. Answer: “Sino nagbago?”, “Kailan?”, “Bakit?”

**Table:** `activity_log` (or `audit_log`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | — |
| `at` | timestamp | When (ISO or datetime) |
| `actor` | string | Who (user name or id) |
| `action` | string | created, updated, archived, restored, deleted, status_changed, assigned, login, other |
| `entity_type` | string | property, client, inquiry, settings, other |
| `entity_id` | string nullable | ID of the record (e.g. property id, client id) |
| `entity_label` | string | Display name (e.g. property title, client name) |
| `details` | text | Extra context (e.g. archive reason, “Bulk archive. Reason: …”) |

Frontend calls `logActivity({ actor, action, entityType, entityId, entityLabel, details })` after create/update/archive (properties, clients) and on login. Persist each call as one row. Keep recent entries in memory for the Activity Log page; backend should store all for long-term audit.
