# Screenshots

The home page gallery (`#screenshots` in `docs/index.html`) shows one large screenshot with a row of thumbnails below it and previous/next buttons. The list of screenshots is written directly in the HTML.

## Adding a Screenshot

1. Copy the PNG into `docs/screenshots/`:

   ```bash
   cp my-feature.png docs/screenshots/
   ```

2. Add a thumbnail button to the `.shot-tabs` list in `docs/index.html`. The `title` is used as the caption:

   ```html
   <button role="tab" aria-selected="false" title="My feature" aria-label="My feature"><img src="screenshots/my-feature.png" alt="" loading="lazy"></button>
   ```

   Buttons appear in the order they are listed. The "1 / 9" counter updates on its own.

3. Commit and push:

   ```bash
   git add docs/screenshots/my-feature.png docs/index.html
   git commit -m "Add my-feature screenshot"
   git push origin main
   ```

## Changing the First Screenshot

The first button is selected on page load. If you reorder the list, also update the main image (`#shot-img`) and caption (`#shot-label`) in `index.html` to match the new first entry.

## Guidelines

- **Format:** PNG.
- **Size:** the frame uses a 1437×991 aspect ratio. Screenshots of a different shape are letterboxed, not cropped (thumbnails are cropped to fill).
- **Naming:** lowercase with hyphens, e.g. `file-manager.png`.
- **Weight:** keep each file small (ideally under 250 KB). All thumbnails load the full-size image.

## Removing a Screenshot

Delete its `<button>` from `.shot-tabs` and remove the PNG from `docs/screenshots/`.
