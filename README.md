# $Ponswifhat — Website

A static site for the $Ponswifhat community meme token: lore, tokenomics, socials,
and a browser-based **Hat Booth** that lets visitors drop the green WIF beanie onto
any photo they upload (all done client-side — no server, no image ever leaves
their device).

## Files

```
index.html          the whole page
css/style.css        all styling
js/script.js          hat booth logic + small site interactions
assets/               images (mascot, banner, hat cutout, favicon)
```

## Run it locally

No build step — it's plain HTML/CSS/JS. Just open `index.html` in a browser, or
serve it locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy it (pick one, all free)

**Netlify / Vercel (easiest)**
1. Create a new GitHub repo and push this folder to it.
2. On netlify.com or vercel.com, "Import Project" → pick the repo.
3. Leave build settings blank (it's static) → Deploy. You'll get a live URL in ~30s.
4. Add your own domain later under Site Settings → Domains.

**GitHub Pages**
1. Push this folder to a GitHub repo.
2. Repo → Settings → Pages → Source: `main` branch, `/root`.
3. Your site goes live at `https://<username>.github.io/<repo>`.

**Drag-and-drop**
Netlify Drop (app.netlify.com/drop) — drag the whole folder in, done.

## About the Hat Booth

- Upload a photo (click or drag-and-drop) → the green hat appears on a canvas.
- Drag it into place, use the sliders to resize/rotate, then download the result.
- There's also a "paste an image URL" option for people who'd rather link an image
  than upload a file (useful for a saved X profile picture link).
- **Note on Twitter/X usernames:** X does not allow public, unauthenticated apps
  to pull a user's profile picture directly from just a username — that requires
  X's own API and login. So instead of guessing, the tool asks people to either
  upload the picture or paste its direct image URL. If you later want true
  "type your @handle and go," that needs a small backend with X API credentials
  to fetch the avatar server-side — happy to help build that as a next step.

## Editing content

- Contract address, links, and lore text all live directly in `index.html` —
  search for the section comments (`<!-- ============ LORE ============ -->`, etc.)
  to find each part quickly.
- Colors, fonts, and spacing are all defined as CSS variables at the top of
  `css/style.css` under `:root`.

## Swap in more images

Drop new files into `assets/` and reference them with `assets/yourfile.jpg` in
`index.html`. If you want to change the hat graphic itself, replace
`assets/hat.png` — keep the background transparent for the booth tool to work
cleanly.
