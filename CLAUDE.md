# JGQ — BBQ Restaurant Tracker

Private, invite-only PWA for tracking BBQ restaurant visits. Family app.

## Stack

- **Frontend**: React 19 + Vite 8 + TypeScript strict + Tailwind v4
- **Routing**: React Router v7 (SPA/library mode — NOT framework mode)
- **Backend**: Supabase (Postgres + RLS + Edge Functions on Deno)
- **Storage**: Cloudflare R2 (presigned PUT URLs via Edge Function)
- **Maps**: Google Places API (New) via `@googlemaps/js-api-loader`
- **Auth**: Custom PIN-based; NO Supabase Auth. JWT signed with Supabase JWT secret, stored in localStorage

## Auth Flow

1. User picks name → types PIN
2. `pin-auth` Edge Function verifies bcrypt hash → returns signed JWT
3. JWT stored in `localStorage` as `jgq_session`
4. `src/lib/supabase.ts` singleton injects `Authorization: Bearer <jwt>` on every request via custom `fetch`
5. RLS uses `auth.uid()` = JWT `sub` claim

**Critical JWT claims**: `sub`, `role: 'authenticated'`, `iss: 'supabase'` — all three required or auth.uid() returns NULL.

## Design System

- Tailwind v4 CSS-first: tokens in `src/index.css` via `@theme inline {}` (NOT tailwind.config.js)
- `@theme inline` is mandatory for dark/light toggle to work at runtime
- Dark default; light via `[data-theme="light"]` on `<html>`
- Theme applied before React mounts in `src/main.tsx`
- Typography: Oswald (font-heading) via @fontsource for h1-h6 and `.font-heading` class

## Key Constraints

- **Tailwind v4**: no `tailwind.config.js` — all config in CSS
- **React Router v7**: use `BrowserRouter` + `Routes` + `Route` (SPA mode). AppShell must render `<Outlet />`
- **bcryptjs** (not bcrypt) in Edge Functions — bcrypt uses native addons, Deno can't load them
- **Visit INSERT** before sides/sauces/photos — RLS on children joins to visits
- **Photo compression** on file select (not submit) — avoids blocking at submit time
- **Draft** saved to localStorage `jgq_draft_visit`, cleared on submit AND abandon

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # TypeScript check + Vite build
pnpm lint         # oxlint

# Supabase
supabase init && supabase link --project-ref <ref>
supabase db push                     # Apply migrations
supabase functions deploy pin-auth
supabase functions deploy get-upload-url
supabase functions deploy admin-users
supabase secrets set R2_ENDPOINT="..." R2_ACCESS_KEY_ID="..." R2_SECRET_ACCESS_KEY="..." R2_BUCKET_NAME="jgq-photos" R2_PUBLIC_URL="..."
supabase gen types typescript --project-id <ref> > src/types/database.ts
```

## First-Time Setup

1. Create Supabase project
2. `supabase init && supabase link --project-ref <ref>`
3. `supabase db push` (runs migrations 001 + 002)
4. Deploy Edge Functions + set R2 secrets
5. Insert first admin user via Supabase SQL editor:
   ```sql
   -- Generate hash: node -e "require('bcryptjs').hash('yourpin', 10).then(console.log)"
   INSERT INTO public.users (name, pin_hash, is_admin)
   VALUES ('YourName', '$2a$10$...', true);
   ```
6. Copy `.env.example` to `.env.local`, fill in values
7. `pnpm dev`
8. Navigate to `/admin` to create other users

## File Structure

```
src/
  components/
    ui/           StarPicker, SpicinessInput, PhotoUpload, ChipSelect
    layout/       AppShell (Outlet), ThemeToggle
    restaurant/   RestaurantSearch
    visit/
      steps/      Step1Restaurant…Step7Review
      VisitCard.tsx
  pages/          LoginPage, HomePage, RestaurantPage, NewVisitPage,
                  VisitDetailPage, AdminPage
  lib/            supabase.ts, auth.ts, r2.ts, places.ts,
                  imageCompression.ts, visitSubmit.ts
  types/          index.ts
supabase/
  migrations/     001_initial_schema.sql, 002_rls_policies.sql
  functions/      pin-auth/, get-upload-url/, admin-users/
public/
  icons/          icon-192.png, icon-512.png, icon-512-maskable.png
```

## R2 CORS (set in Cloudflare dashboard)

```json
[{ "AllowedOrigins": ["*"], "AllowedMethods": ["GET","PUT"], "AllowedHeaders": ["Content-Type","Content-Length"], "MaxAgeSeconds": 3000 }]
```

Content-Type in PUT must exactly match `PutObjectCommand`'s `ContentType` (`image/webp`).
