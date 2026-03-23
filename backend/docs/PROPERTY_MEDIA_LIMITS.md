# Property images (file uploads)

Admin saves listing photos via **multipart/form-data**:

- Field **`property`**: JSON string (metadata + existing gallery URLs).
- **`cover`**: optional single image file (stored under `storage/app/public/properties`).
- **`gallery[]`**: optional multiple image files (appended to `gallery` URLs in JSON).

Returned URLs use Laravel `Storage::url()` (typically `APP_URL` + `/storage/properties/...`).

## One-time setup

```bash
php artisan storage:link
```

Serves files from `public/storage` → `storage/app/public`.

## PHP (e.g. XAMPP `php.ini`)

```ini
upload_max_filesize = 50M
post_max_size = 55M
memory_limit = 256M
```

## Nginx

```nginx
client_max_body_size 55M;
```

## MySQL

For large JSON in `extra`:

```ini
max_allowed_packet = 64M
```

## Vite dev

`vite.config.ts` proxies `/storage` to the Laravel host so `/storage/...` image URLs work on `localhost:5173`.

## Production

Prefer CDN/S3 URLs in `image` / `gallery` for very high traffic; multipart upload remains supported for admin.
