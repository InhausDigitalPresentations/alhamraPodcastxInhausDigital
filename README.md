# Al Hamra × INHAUS — Supper Club Podcast (technical proposal)

Static site, no build step. Works on GitHub Pages as-is.

## Publish on GitHub Pages
1. Create a repo (private is fine on paid plans; Pages on a free account needs a public repo).
2. Upload everything in this folder to the root of the repo (keep `.nojekyll`).
3. Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
4. The deck is live at `https://<user>.github.io/<repo>/` in a minute or two.

## Images
Drop ChatGPT images into `images/` using the file names in `images/PROMPTS.md`.
Each slot shows a labelled placeholder until its file exists, then loads automatically.

## Clean version for the client
Yellow notes mark items to confirm. Add `?final` to the URL to hide them:
`https://<user>.github.io/<repo>/?final` — but fix the notes before sending.

## PDF for the submission
The technical proposal must be a PDF (Annex C 2.x). Open the site in Chrome →
Print → Save as PDF → Margins: None → Background graphics: on. One slide per page, 16:9.

Navigation: arrow keys / Page Up-Down / space. No pricing appears anywhere in this deck (Annex B goes separately).
