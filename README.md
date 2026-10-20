# Pet Friend

Static HTML pages are served by Vercel. The catalog and admin panel use a same-origin Node.js API backed by PostgreSQL. Firebase is not used by the deployed site.

## Backend setup

Create a PostgreSQL database, then add these environment variables to the Vercel project:

- `DATABASE_URL` — PostgreSQL connection string. If the Vercel Neon integration is connected, the API also accepts its `POSTGRES_URL` variable. A managed database may require `?sslmode=require`.
- `ADMIN_PASSWORD` — a long, unique admin password. It is read only by the server API.
- `SESSION_SECRET` — at least 32 random characters used to sign the admin session cookie.

The API creates its tables on the first request. The database user needs permission to create tables and indexes. Admin sessions use an eight-hour, signed, `HttpOnly`, `SameSite=Strict` cookie; login attempts are limited per IP in PostgreSQL.

## Move existing Firebase data once

The importer is an optional local migration tool. The running website and its API do not use Firebase. To preserve the current catalog, use a Firebase service account with Firestore read access on your own computer and set `DATABASE_URL` for the new PostgreSQL database.

PowerShell example:

```powershell
$env:DATABASE_URL = "postgresql://..."
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\private\petfriend-service-account.json"
npm install
npm run import:firebase
```

You can instead set `FIREBASE_SERVICE_ACCOUNT_JSON` to the service-account JSON content. Never add service-account files or database credentials to Git. The importer copies products, brands, categories, site settings, WhatsApp click counts, and embedded product/brand images. Run it once before switching the live site to the new backend.

If you do not need the existing Firebase records, skip the importer and add products from `/admin` after configuring the database and environment variables.

## API overview

Public routes provide products, brands, categories, and site settings. The admin routes handle product, brand, category, and setting changes. Product and brand images are stored as PostgreSQL binary data and served from `/api/media/...`; they are not returned inline with catalog JSON.

Products can be assigned a URL slug, meta title, and meta description from the admin product editor. Slugged products use `/mehsul/{slug}` URLs; product pages publish canonical, Open Graph, and Product structured data. `/sitemap.xml` is generated from published catalog items and is referenced by `robots.txt`.

Active brands use the SEO slug, title, and description configured in the admin panel and are shareable at `/brend/{slug}`. Product detail pages include a public rating and review form; reviews are stored in PostgreSQL through `GET /api/reviews?productId=...` and `POST /api/reviews`.

The `firebase-admin` package is a development dependency used only by the one-time importer. It is not imported by the deployed API functions.
