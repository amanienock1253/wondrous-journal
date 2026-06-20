# Wondrous Journal

A mobile-first Progressive Web App for capturing ideas, problems, scout observations, and project notes.

## Project 001 of Wondrous Tech

Built with React, Vite, Supabase, and inline CSS-in-JS styles. The app includes authentication, journal CRUD, insights, and offline shell support via a service worker.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Create the Supabase table using the SQL editor:

```sql
create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  type text,
  title text,
  body text,
  location text,
  excited int,
  created_at timestamptz default now()
);

alter table entries enable row level security;

create policy "Users can manage their own entries"
on entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

4. Run the app

```bash
npm run dev
```

5. Deploy to Vercel

- Connect your GitHub repository to Vercel.
- Set the environment variables in Vercel using the same names from `.env`.
- Deploy the site.

## Install on iPhone

1. Open the app URL in Safari.
2. Tap the Share button.
3. Select "Add to Home Screen".
4. Launch the installed PWA from the home screen.

## Notes

- The app uses Supabase auth for email/password sign in and sign up.
- Entries are stored in Supabase and scoped to the authenticated user.
- A service worker caches the app shell so the app loads offline after the first visit.
"# wondrous-journal" 
