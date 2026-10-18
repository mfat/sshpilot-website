# SSH Pilot Website

Source for [sshpilot.app](https://sshpilot.app), served by GitHub Pages from this `docs/` directory on the `main` branch. It is plain static HTML and CSS with a little inline JavaScript — no build step.

## File Structure

```
docs/
├── index.html                   # Home page
├── reviews.html                 # Press and reviews page
├── index.css                    # Shared stylesheet for both pages
├── logo.svg                     # Logo (nav and favicon)
├── io.github.mfat.sshpilot.svg  # App icon
├── os/                          # Distro / OS logos for the install cards
├── screenshots/                 # App screenshots (see SCREENSHOTS.md)
└── CNAME                        # Custom domain for GitHub Pages
```

## Local Preview

Open `docs/index.html` in a browser, or serve the directory:

```bash
python3 -m http.server -d docs
```

## Runtime Behavior

The pages call the public GitHub API from the browser:

- `repos/mfat/sshpilot` — shows the star count in the nav.
- `repos/mfat/sshpilot/releases/latest` — points the .deb, .rpm, macOS and Windows install cards at the matching release files. If the call fails, the cards fall back to the latest release page.

The install section also checks the visitor's user agent to mention their OS and tag the matching package as "Your system".

## Making Changes

- **Styles:** edit `index.css`. Colors and fonts are defined as CSS variables at the top.
- **Reviews:** add a card to `reviews.html`, and optionally to the "In the press" section of `index.html`.
- **Screenshots:** see [SCREENSHOTS.md](SCREENSHOTS.md).

Commit to `main` and push; GitHub Pages deploys automatically.
