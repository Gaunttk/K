# JGQ BBQ Tracker

Private, invite-only PWA for tracking BBQ restaurant visits with obsessive detail. Built for a small family group.

## Quick Start

1. Copy `.env.example` to `.env.local` and fill in your credentials
2. Run `supabase init && supabase link --project-ref <your-ref>`
3. Run `supabase db push` to apply migrations
4. Deploy Edge Functions (see CLAUDE.md for full setup)
5. Insert first admin user via Supabase SQL editor (see CLAUDE.md)
6. `pnpm install && pnpm dev`

## Stack

React 19 + Vite 8 + TypeScript + Tailwind v4 + Supabase + Cloudflare R2 + Google Places API

See `CLAUDE.md` for the full architecture reference.
