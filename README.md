# MOTH / ORCHID — Portfolio v3

Responsive editorial portfolio with:
- Dedicated project detail route (`#project/<id>`)
- Fullscreen image lightbox (keyboard arrows / Esc)
- YouTube, Vimeo and MP4/WebM showreels
- Multiple gallery images per project
- Separate custom thumbnail and manual sort order
- Basic traffic analytics (page views, project views, sessions)
- Hidden Studio entry + Supabase Auth and Row Level Security

## Files
- `index.html` — public site, project detail and Studio UI
- `styles.css` — editorial / cinematic design system
- `app.js` — Supabase data, uploads, routes, gallery and analytics
- `config.js` — public Supabase URL + anon key and contact links
- `supabase-schema.sql` — database, policies and storage setup

## Setup / migration
1. Open Supabase SQL Editor.
2. Run the complete `supabase-schema.sql` file. It is written to add v3 columns/tables to the previous v2 schema.
3. Create an admin in Supabase Authentication > Users. Disable public signups.
4. Copy the user's UUID and run:
   ```sql
   insert into public.admin_users(user_id) values ('YOUR-AUTH-USER-UUID');
   ```
5. In `config.js`, set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and your actual email/social URLs. Use only the public anon/publishable key; never the service_role key.
6. Serve locally using `python3 -m http.server 8000` and visit `http://localhost:8000`.
7. Deploy the project root to Netlify, Vercel or GitHub Pages.

## Admin workflow
Tap the discreet ✳ at bottom-right or visit `/#studio`, sign in, then:
- Set a project title, category, year, description, external URL.
- Add a YouTube/Vimeo/MP4 showreel URL if applicable.
- Upload a thumbnail image and select multiple gallery images.
- Set sort order (smaller numbers appear first).
- Edit project details or delete a project.

## Analytics
The site records anonymous page-view and project-view events. Studio displays counts for the last 30 days, plus per-project views. `Sessions` is an approximate unique browser session count, not a people count. Analytics are intentionally basic and should not be treated as audited traffic measurement. For production-grade analytics, add a privacy notice/consent where required and consider a dedicated analytics service.

## Notes
- The detail route is client-side hash routing; direct links such as `/#project/<uuid>` work after the project list loads.
- Fullscreen gallery opens when an image is selected; keyboard arrows navigate and Esc closes.
- Showreel embeds support YouTube and Vimeo URLs, or direct `.mp4` / `.webm` / `.ogg` URLs.
- Uploads are limited to 8 MB per image and JPG/PNG/WebP.
- Public visitors can read projects and gallery images. Only user IDs in `admin_users` can write data or upload images. Supabase RLS is the security boundary; the hidden Studio icon is only a UI detail.
