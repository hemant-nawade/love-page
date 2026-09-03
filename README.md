# Love Page — Setup Guide

A full-stack personalized gifts store: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Razorpay.

## 1. Install dependencies

```bash
npm install
```

## 2. Create your Supabase project

1. Go to https://supabase.com → New Project.
2. Once created, go to **SQL Editor** → New Query, paste the contents of `supabase/schema.sql`, and run it.
3. New query again → paste `supabase/storage-buckets.sql` → run it.
4. (Optional but recommended) New query → paste `supabase/seed.sql` → run it. This creates your 6 initial products with their personalization fields (photo upload, custom text, etc.) — no images yet, you'll add real photos from the Admin panel.
5. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-only, never expose to the browser)

## 3. Set up Razorpay

1. Log into your existing Razorpay dashboard.
2. Go to **Settings → API Keys** → generate/copy your Key ID and Key Secret.
3. Set:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_ID` → your Key ID (same value in both)
   - `RAZORPAY_KEY_SECRET` → your Key Secret

## 4. Create your admin login

1. Pick your admin email → set as `ADMIN_EMAIL`.
2. Generate a password hash:
   ```bash
   node scripts/hash-password.js "yourChosenPassword"
   ```
3. Copy the printed value into `ADMIN_PASSWORD_HASH`.
4. Generate a random secret for signing admin sessions and put it in `ADMIN_JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 5. Fill in your `.env.local`

Copy `.env.example` to `.env.local` and fill in all the values from steps 2–4, plus:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # update to your real domain after deploy
```

## 6. Run it locally

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login

## 7. Add your real product photos

Go to **Admin → Products → Edit** for each of the 6 seeded products and upload the real photos you have for each gift. Products are fully dynamic — you can add, edit, hide, or delete products anytime without touching code.

## 8. Deploy

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add all the same environment variables from `.env.local` into Vercel's Project → Settings → Environment Variables.
4. Update `NEXT_PUBLIC_SITE_URL` to your real production domain.
5. Deploy.

## How the system enforces the business rules

- **No COD, Razorpay only**: checkout only ever calls Razorpay; there's no COD code path at all.
- **₹50 flat delivery per order**: stored in `store_settings.delivery_charge`, editable from Admin → Settings, applied once per order (not per item).
- **Made to order, no stock**: there's no stock/inventory column anywhere in the schema — every active product simply shows "Made to Order."
- **Payment never trusted from the browser**: `/api/checkout/verify-payment` re-checks Razorpay's HMAC signature server-side before an order is ever created. See `src/lib/razorpay.ts`.
- **Price integrity**: `/api/checkout/create-order` recalculates the amount from live DB prices — it never trusts a client-sent total. `order_items` also stores a name/price *snapshot* at purchase time, so a later price change never rewrites history.
- **Guest checkout, no accounts**: there is no user auth system on the storefront at all — checkout only collects name/phone/email/address.
- **Order tracking requires order ID + phone**: enforced in `/api/track-order` — an order number alone returns nothing.
- **Personalization uploads stay private**: they live in the private `customer-uploads` Supabase bucket with no public read policy; the admin panel accesses them only via short-lived signed URLs.
- **Safe product deletion**: deleting a product that has past orders automatically archives (hides) it instead, so it can't break order history.

## What's included vs. what to extend later

Included: full customer site, dynamic product/personalization system, cart, Razorpay checkout with server verification, order tracking, and a complete admin panel (dashboard stats, product CRUD, order management with photo viewer, manual shipment marking, settings).

Reasonable next additions once this is live: transactional emails (order/shipment confirmations), courier API integration, and an Instagram-specific landing page variant for ad traffic — none of these block launch.
