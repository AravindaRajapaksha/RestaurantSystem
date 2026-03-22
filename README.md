# RestoBite

RestoBite is a React + Vite restaurant ordering app backed by Supabase for authentication, menu management, and customer orders.

## Features

- Customer signup, login, Google auth, password reset
- Admin-only menu management with Supabase-backed food records
- Live checkout flow that stores orders and order items in Supabase
- Customer profile page with editable profile details and order history
- Admin dashboard with live order, revenue, top-item, and order-status data

## Tech Stack

- React 19
- Vite
- React Router
- Supabase

## Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Vercel deployments, add the same two variables in Project Settings -> Environment Variables and redeploy.

## Database Setup

Use the SQL editor in Supabase and run one of these scripts:

- Fresh project: `database/full_setup.sql`
- Existing project that already has `foods`, `profiles`, or earlier order tables: `database/upgrade_existing_schema.sql`

Optional helper scripts already included:

- `database/promote_admin.sql`
- `database/setup_auth_and_offers.sql`
- `database/profiles_auth_setup.sql`
- `database/foods_offer_columns.sql`
- `database/profile_avatar_setup.sql`

## Promote an Admin User

1. Create a user through the app or Supabase Auth.
2. Open `database/promote_admin.sql`.
3. Replace the target email if needed and run it in Supabase SQL Editor.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Menu items are loaded from the `foods` table.
- Checkout writes to `orders` and `order_items`.
- Profile updates depend on the latest `profiles` schema, including phone and avatar fields.
- Admin dashboard views depend on the order tables being present and up to date.
