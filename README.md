# Sooraj & Sivakami — Wedding Invitation Website

A minimal Kerala-traditional digital invitation for the wedding (morning) and reception (evening) on **Sunday, 31 January 2027**.
Built with plain **HTML5, CSS3 and vanilla JavaScript**: no frameworks, no build step, no dependencies besides Google Fonts.

```
wedding-invitation/
├── index.html            # the invitation (all 13 sections, SEO + Open Graph + Event JSON-LD)
├── css/style.css         # mobile-first styles, animations, Kasavu borders
├── js/script.js          # countdowns, music, navigation, scroll reveal
├── assets/
│   ├── images/og-image.jpg   # 1200×630 social-share image (WhatsApp/Facebook)
│   ├── icons/                # favicon.svg, favicon-32, apple-touch-icon, 192/512 icons
│   └── audio/                # optional licensed music file (not required)
├── 404.html  robots.txt  sitemap.xml  site.webmanifest
└── README.md
```

## Event details (checked against the printed card)

| | |
|---|---|
| Groom | Sooraj, son of Mrs. Rajeswari S. & Mr. Sureshkumar C. K., Chenganikkattu Pisharam, Chalakudy, Thrissur – 680 307 |
| Bride | Sivakami, daughter of Mrs. Deepa Sajan & Mr. Sajan T. N., Thayeri House, Aripalam, Thrissur |
| Date | Sunday, 31 January 2027 (1202 Makaram 17) |
| Groom's departure | 9:00 AM from the groom's residence |
| Wedding / Muhurtham | 10:30 AM – 11:20 AM, KKMS Auditorium, Valavanangadi, Padiyoor |
| Thalikettu | Vaikkam Sri Subramanya Swami Temple, Padiyoor (no separate time printed, so none is shown) |
| Reception | 6:00 PM – 9:00 PM, Rajiv Gandhi Town Hall, Chalakudy |
| Sharing the happiness | Swathy C. S. |

> The bride's name is spelled **Sivakami** on the printed card and is used that way throughout the site.

## Run locally

Any static server works. From this folder:

```bash
python -m http.server 8080      # then open http://localhost:8080
# or
npx serve .
```

You can also open `index.html` directly.

## Before you share the link (important)

1. **Replace the placeholder domain.** Search the project for `https://your-domain.example/` and replace it with your real address, e.g. `https://sooraj-sivakami.netlify.app/`. It appears in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt` and `sitemap.xml`.
   WhatsApp needs an **absolute** `og:image` URL to show the preview card.
2. Deploy, then paste the link into a WhatsApp chat with yourself to check the preview. WhatsApp caches previews, so set the domain before sending the link widely.
   You can also test it in the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

## Deploy (free options)

- **Netlify**: drag the `wedding-invitation` folder onto <https://app.netlify.com/drop>. `404.html` is picked up automatically.
- **GitHub Pages**: push the folder contents to a repo, then go to Settings → Pages → deploy from branch (root).
- **Cloudflare Pages / Vercel**: create a project, use no build command, and set the output directory to `/`.
- **Any shared hosting**: upload the files to `public_html` (or similar) over FTP.

Serve over **HTTPS**.

## Countdowns and timezone

`js/script.js` defines both targets in India Standard Time (fixed UTC+05:30) and converts them to absolute UTC timestamps. The visitor's own timezone has no effect.

- Wedding: 31 Jan 2027, 10:30 AM IST. During the Muhurtham (until 11:20) it shows a "happening now" message, then a "now married" message.
- Reception: 31 Jan 2027, 6:00 PM IST. Between 6 and 9 PM it shows "underway", then "thank you".

Numbers never go negative.

## Background music

- Music **never autoplays**. Guests tap the ♪ button (bottom-left) to play or pause, and a mute button appears once music has started.
- By default the site plays an **original instrumental generated in the browser** with the Web Audio API: a tanpura-style drone and a soft melody in raga Mohanam. No audio file or licence is needed, and it adds 0 KB to the download.
- To use a recording instead, place a file you hold the rights to in `assets/audio/` (e.g. `music.mp3`, ideally under 1.5 MB) and set `var MUSIC_FILE = 'assets/audio/music.mp3';` in `js/script.js`.
- Music pauses automatically when the guest switches apps or tabs. If audio isn't supported, the controls are hidden and the site works normally.

## Privacy / search engines

The page is indexable by default and includes title, description, Open Graph, Event structured data, a sitemap and robots.txt. It also lists family names and home addresses. To keep it out of Google while still sharing by link:

- add `<meta name="robots" content="noindex">` to the `<head>` of `index.html`, and
- leave `robots.txt` as **Allow** so crawlers can see the noindex tag. WhatsApp and Facebook previews will still work.

## Customising

- **Colours and fonts**: CSS variables at the top of `css/style.css`.
- **Text**: everything is plain HTML in `index.html`. Edit the bride/groom names in the hero, couple, closing, `<title>`/meta tags and the JSON-LD, and the countdown messages in `js/script.js`.
- **Share image**: replace `assets/images/og-image.jpg` with any 1200×630 JPG.

## Accessibility and performance notes

- Semantic sections with a single `<h1>`, a skip link, labelled controls. Keyboard focus is visible and touch targets are at least 44 px.
- `prefers-reduced-motion` disables animations and smooth scrolling.
- All illustrations are inline SVG (no image downloads above the fold). Total page weight excluding fonts is about 70 KB.

## Launch checklist

- [ ] Replace `your-domain.example` everywhere (see above)
- [ ] Decide index vs. `noindex`
- [ ] Open on a phone and test Get Directions and music
- [ ] Check the WhatsApp/Facebook link preview
- [ ] Optional: submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and add analytics (GA4/Plausible) if wanted. No IDs are included.
