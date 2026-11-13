# CMS Admin Guide

There are two ways to manage content for TAG Christian Media. Use whichever fits the task.

## Option A: In-app admin panel (recommended for day-to-day edits)

**URL:** `https://the-vlog.vercel.app/admin`

This is a lightweight, password-gated panel built directly into the live site. It covers every content type below with plain forms, including image/video upload (which goes straight to Cloudinary behind the scenes). Sign in from the password screen, or from the "Sign In" link in the site's nav bar.

Use this for: editing text, swapping images, adding/removing Testimonies, Events, or Content Features. Changes are saved and published immediately — no separate publish step.

## Option B: Strapi admin panel (for media library management, permissions, and API tokens)

**URL:** `https://the-vlog-backend-zjxi.onrender.com/admin` (local dev: `http://localhost:1337/admin`)

This is the full Strapi CMS admin. Use this for anything the in-app panel doesn't cover:
- Browsing/organizing the media library
- Managing public API permissions (Settings → Users & Permissions → Roles)
- Creating API tokens (Settings → API Tokens)
- Managing other admin accounts

Render's free tier spins down when idle, so the first request after a quiet period can take ~50 seconds.

---

## Content Types Overview

Your website has 7 manageable content types, plus a Subscriber list from the "Join the Community" sign-up form (view-only, under Content Manager → Subscriber — no admin UI for it beyond that since it's a simple email list).

### Single Types (1 record each)
1. **Hero** - Main landing section
2. **About** - About section
3. **Footer** - Footer section
4. **Booking** - Booking section

### Collection Types (Multiple records)
1. **Content Features** - Videos, blogs, scriptures, podcasts
2. **Testimonies** - Community member testimonies
3. **Events** - Upcoming events and services

---

## Managing Each Section

### 1. Hero Section

- **Badge** - Top badge text (e.g., "LIVE NOW")
- **Headline 1** - Main headline first part
- **Headline Accent** - Main headline colored part (shows in cyan)
- **Headline 2** - Secondary headline
- **Subheadline** - Supporting text
- **CTA Primary** - Primary button text
- **CTA Secondary** - Secondary button text
- **Scripture Text** - Bible verse text
- **Scripture Reference** - Bible reference (e.g., "John 3:16")
- **Stats** - Statistics, as a JSON array of `{"value":"200+","label":"Episodes"}`
- **Main Image** - Hero background/main image (upload)
- **Main Video** - Optional hero video (upload)
- **Small Images** - Additional decorative images (upload multiple)
- **Live Label** - Label for live indicator

### 2. About Section

- **Mission Text** - Your mission statement
- **Mission Scripture Text** / **Mission Scripture Reference**
- **Body Text** - Main content body
- **Image** - About section image (upload)
- **Float Stat Value** / **Float Stat Label** / **Float Stat Sub**
- **Float Small Value** / **Float Small Label**
- **Pillars** - JSON array of `{"title":"...","description":"..."}`
- **Stats** - JSON array of `{"value":"...","label":"..."}`

### 3. Footer Section

- **Scripture of Week Text** / **Scripture of Week Reference**
- **Tagline** / **Tagline Verse**
- **Description**

### 4. Booking Section

- **Types** - JSON array of `{"label":"...","description":"..."}`
- **Highlights** - JSON array of strings
- **Scripture Text** / **Scripture Reference**
- **Image** - Booking section image (upload)
- **Image Caption**

### 5. Content Features (Videos, Blogs, etc.)

- **Feature ID** - Unique slug, e.g. `videos`
- **Label** - Category (e.g., "Videos", "Blogs", "Scriptures")
- **Headline** / **Description** / **Detail**
- **Image** / **Video** (upload)
- **Tag** / **Highlight**
- **Sort Order** - Order of display (0 = first)

### 6. Testimonies

- **Client ID** - Unique identifier for the person
- **Name** / **Role** / **Quote**
- **Image** - Profile image (upload)
- **Verse** - Related Bible verse (optional)
- **Sort Order**

### 7. Events

- **Client ID** - Unique event identifier
- **Title** / **Date** / **Time** / **Location** / **Description**
- **Image** - Event banner (upload)
- **Badge** / **Badge Color** ("cyan" or "white")
- **Spots**
- **Sort Order**

---

## Image Upload Tips

- Supported formats: JPG, PNG, WebP, GIF, MP4 (for video fields)
- Keep files under a few MB for best performance
- Uploads are stored on Cloudinary, not on the server, so they survive redeploys

---

## Publishing

- **In-app admin (`/admin`):** Save writes and publishes in one step — changes show on the live site within about a minute.
- **Strapi admin:** Content types have Draft/Publish enabled. After editing, click **Publish** (top right) — a saved-but-unpublished draft will not appear on the public site.

---

## Troubleshooting

**Can't log in to the in-app admin?**
- Check the `ADMIN_PANEL_PASSWORD` value set in the Vercel project's environment variables.

**Can't log in to the Strapi admin?**
- Confirm you're using the account you created at first setup. There's no self-service password reset configured — recovery requires direct database/API access.

**Image won't upload?**
- Check the file size and format.
- If uploads fail entirely, check that `CLOUDINARY_NAME` / `CLOUDINARY_KEY` / `CLOUDINARY_SECRET` are set on Render, and that the Cloudinary API key's role has upload ("create") permission — the default "Media Library User" role does not grant this; "Master Admin" does.

**Changes not showing on the live site?**
- In the Strapi admin, make sure you clicked **Publish**, not just **Save**.
- Hard refresh the browser (Ctrl+Shift+R).
- The backend is on Render's free tier and spins down when idle — the first request after a quiet period can take up to ~50 seconds.

---

**Last updated:** November 2026 — reflects the Vercel + Render + Cloudinary deployment, including the in-app admin panel.
