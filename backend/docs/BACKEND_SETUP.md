# CHara Realty — Laravel API

## Database (MySQL)

1. Create database:

```sql
CREATE DATABASE chara_realty_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copy `.env.example` to `.env` and set:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chara_realty_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

3. Run migrations:

```bash
php artisan migrate
```

## Run API

```bash
php artisan serve
```

Default: `http://127.0.0.1:8000` — routes are under `/api/*`.

## CORS

`config/cors.php` allows origins from `CORS_ALLOWED_ORIGINS` (comma-separated). Defaults include `http://localhost:5173` for Vite.

## Frontend (Vite)

- `frontend/.env` — optional `VITE_API_BASE_URL` (empty = same-origin `/api` with proxy).
- `frontend/vite.config.ts` proxies `/api` → `http://127.0.0.1:8000`.

## Hybrid sync

On first successful API connection, if `localStorage` has `chara_realty_simulation_v1` and `chara_migrated_to_api_v1` is not set, the SPA calls `POST /api/sync/from-local` with the snapshot, then hydrates from `GET /api/properties` and `GET /api/inquiries`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness |
| GET | `/api/properties` | List properties |
| GET | `/api/properties/{id}` | One property |
| POST | `/api/properties` | Upsert (sync) |
| GET | `/api/inquiries` | List inquiries |
| POST | `/api/inquiries` | Create / upsert |
| PUT | `/api/inquiries/{id}` | Update |
| POST | `/api/clients` | Create / upsert client |
| POST | `/api/deals` | Create / upsert deal |
| POST | `/api/sync/from-local` | Bulk import from SPA snapshot |

**Note:** Protect `/api/sync/from-local` in production (token / IP allowlist).
