# X Lab faculty website

A static, bilingual, three-page website for Xu Zheng and X Lab, focused on Multimodal and Situational Intelligence. It uses plain HTML, CSS, and JavaScript, so it has no build step and works both at a custom domain and under a GitHub Pages project path.

## Site structure

- `/` — 2026 news, selected publications, and a contact/booking section
- `/lab/` — Lab members, profile, and values
- `/join/` — Opportunities and contact

The former `/research/` URL redirects to X Lab, while `/publications/` redirects to its homepage section. `/posters/` remains an unlisted recruitment-poster preview. Navigation and footer markup are shared through `script.js`, while all URLs are relative so the site works at `username.github.io/repository-name/`.

## Publish with GitHub Pages

1. Create a GitHub repository named `faculty-lab-homepage` under the `zhengxuJosh` account.
2. Push this directory to the repository's `main` branch.
3. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
4. The included workflow deploys the static files automatically. The expected project URL is:
   `https://zhengxujosh.github.io/faculty-lab-homepage/`

Before the first push, sign in to GitHub with an account authorized to create repositories under `zhengxuJosh`. This folder is a local site directory, not yet a Git repository. Publish only after checking that its photos, poster sources, and other assets are intended to be public. Do not add credentials or private calendar data. After deployment, confirm that `/`, `/lab/`, and `/join/` open at the public project URL, then test the bilingual switch and email links there.

If the repository name changes, update the absolute URLs in `index.html`, the page metadata, `robots.txt`, and `sitemap.xml`. Navigation links do not need changes.

## Local preview

Serve the directory with any static file server and open its root URL. Do not open the HTML files directly from the filesystem because browser security rules can differ from hosted behavior.

## Meeting requests

The homepage offers separate student (20-minute) and collaborator (30-minute) meeting requests. The calendar is visible by default, marks dates with published busy periods, and displays the selected day's occupied times. Public recurring rules live in `availability.js`, in Beijing time (Asia/Shanghai): Monday 17:45–21:00 and Wednesday 09:30–12:15 from 2026-11-09 through 2027-01-01 inclusive. Only generic busy periods are published; keep course titles, classroom locations, credentials and private calendar details out of this repository. Keep the bilingual weekly summary in `index.html` in sync when updating these rules.

Visitors can request dates from tomorrow through the later of the semester end or 30 days ahead. The form checks the whole meeting duration for overlap, including when switching dates or meeting types. A meeting ending exactly when a busy period begins, or starting exactly when it ends, is allowed. The checks run in the browser; they do not reserve time. Other times still require confirmation, and the schedule is maintained manually rather than connected to a live calendar.

Submitting opens a prefilled email to `zhengx@gbu.edu.cn`. The visitor must send the draft; no request is automatically submitted or confirmed. Zoom or Tencent Meeting details are shared only after manual confirmation. Real-time Feishu availability and automatic email delivery require a separate secure backend, not GitHub Pages alone.
