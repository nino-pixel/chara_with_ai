# Security posture (CHara Realty API)

This document outlines practices aligned with common **information security** expectations (e.g. ISO 27001–inspired controls) without over-engineering the codebase.

## Implemented

- **Authentication**: Laravel Sanctum personal access tokens for admin API routes; passwords hashed with bcrypt (via Laravel `hashed` cast / `Hash`).
- **Authorization**: Sensitive routes protected with `auth:sanctum` (see `routes/api.php`).
- **Input validation**: Request validation on write endpoints (`InquiryController`, `ClientController`, `DealController`, `PropertyController`, `SyncController`, `AuthController`).
- **Rate limiting**: Login throttling; public `POST /api/inquiries` limited per IP (`AppServiceProvider` + `throttle:inquiries`).
- **CORS**: Explicit allowed origins via `CORS_ALLOWED_ORIGINS` — no `*` wildcard in configuration intent (see `config/cors.php`).
- **API envelope**: Success responses include `success: true`; errors standardized for `api/*` in `bootstrap/app.php` (no stack traces when `APP_DEBUG=false`).
- **Secrets**: `.env` is gitignored; use `.env.example` as a template only.

## Future-ready (not implemented)

- **Role-based access** (admin vs client): Feature flag `CHARA_FEATURE_ROLES` in `config/chara.php` — wire policies/gates when requirements are defined.
- **HTTPS enforcement**: `CHARA_FORCE_HTTPS` in `config/chara.php` — enforce at reverse proxy / load balancer in production; Laravel `TrustProxies` as needed.

## Operational checklist (production)

1. Set `APP_DEBUG=false`, `APP_ENV=production`, strong `APP_KEY`.
2. Restrict `CORS_ALLOWED_ORIGINS` to real SPA domains (HTTPS).
3. Use TLS termination at the edge; set secure cookie/session settings if moving to cookie-based SPA auth.
4. Review Sanctum token lifetime and rotation policies for your threat model.
