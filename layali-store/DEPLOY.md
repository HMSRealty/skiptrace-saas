# Deploying the Layali storefront (live URL)

This app is self-contained (its own `package.json`, no database, no external
image dependency). Deploy it as its **own project** with the root directory set
to `layali-store`. ~2 minutes.

## One-click (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHMSRealty%2Fskiptrace-saas%2Ftree%2Fclaude%2Fmena-beauty-ecommerce-blueprint-drv3rc&root-directory=layali-store&project-name=layali-store&env=NEXT_PUBLIC_WHATSAPP_NUMBER&envDescription=WhatsApp%20number%20that%20receives%20orders%20-%20digits%20only%20with%20country%20code)

Click → sign in to Vercel → it pre-fills **root directory = `layali-store`** and
prompts for `NEXT_PUBLIC_WHATSAPP_NUMBER`. Deploy → you get a live URL. (If the
button creates a copy you'd rather avoid, use the manual import below against
your own repo instead.)

## Option A — Vercel (recommended, easiest)

1. Go to **vercel.com → Add New → Project** and import the GitHub repo
   `HMSRealty/skiptrace-saas`.
2. **Important:** set **Root Directory = `layali-store`** (Vercel will then
   detect Next.js automatically).
3. Add environment variable:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = your number, digits only with country code
     (e.g. `9665XXXXXXXX`). This is where all COD / WhatsApp orders are sent.
4. Deploy. You get a live `*.vercel.app` URL; add your custom domain in
   **Settings → Domains**.

> The existing Vercel project on this repo builds the *root* (the skiptrace
> app), so create a **separate** project for the store with the root directory
> above — they won't interfere.

## Option B — Netlify

1. **Add new site → Import from Git** → pick the repo.
2. **Base directory:** `layali-store`
3. Build command: `npm run build` · Publish: `.next` (use the Next.js plugin).
4. Add the `NEXT_PUBLIC_WHATSAPP_NUMBER` env var. Deploy.

## Option C — any Node host

```bash
cd layali-store
npm install
NEXT_PUBLIC_WHATSAPP_NUMBER=9665XXXXXXXX npm run build
NEXT_PUBLIC_WHATSAPP_NUMBER=9665XXXXXXXX npm start   # serves on :3000
```

## After deploy
- Replace placeholder images: drop real photos in `public/products/<id>.(jpg|png)`
  and `public/collections/<slug>.(jpg|png)`, then update the paths in
  `src/data/products.ts` / `collections.ts` (or keep the `.svg` names and
  overwrite the files).
- Set brand details (socials, email, currency rates) in `src/data/config.ts`.
