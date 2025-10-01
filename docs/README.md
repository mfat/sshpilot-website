# SSH Pilot Website v2

This is the development version of the SSH Pilot website. The current live version remains in the `docs/` directory.

## Development Setup

- **Live Version**: `docs/` (currently deployed)
- **Development Version**: `v2/` (this directory)
- **Branch**: `v2-development`

## File Structure

```
v2/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── screenshots.js      # Screenshots gallery logic
├── screenshots/        # Screenshot images
├── io.github.mfat.sshpilot.svg  # Logo
└── README.md           # This file
```

## Development Workflow

1. Make changes in the `v2/` directory
2. Test locally by opening `v2/index.html` in a browser
3. Commit changes to the `v2-development` branch
4. When ready to deploy v2, merge to main and update deployment

## Recent Changes

- Enhanced button clickability with extended touch targets
- Improved accessibility with proper z-index layering
- Added user-select prevention for better UX
- Extended clickable areas with pseudo-elements

## Next Steps for v2

- [ ] Modernize the design with latest web standards
- [ ] Improve responsive design
- [ ] Add animations and micro-interactions
- [ ] Optimize performance
- [ ] Add dark mode improvements
- [ ] Enhance accessibility features

## Blog Configuration

Production builds load blog posts from GitHub issues. By default, only issues opened by the configured repository owner are displayed. To allow additional trusted authors, set the `data-blog-author-allowlist` attribute on `docs/blog.html`'s `<body>` element with a comma- or space-separated list of GitHub logins. For example:

```html
<body
    data-blog-repo-owner="mfat"
    data-blog-author-allowlist="mfat,octocat">
```

Only posts created by these accounts will appear on the published blog.
