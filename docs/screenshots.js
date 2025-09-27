(function () {
    function createScreenshotFigure(item) {
        const figure = document.createElement('figure');
        figure.className = 'screenshot-frame';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = `screenshots/${item.file}`;
        img.alt = item.caption;

        const caption = document.createElement('figcaption');
        caption.textContent = item.caption;

        figure.appendChild(img);
        figure.appendChild(caption);

        return figure;
    }

    function renderScreenshots(gallery, screenshots) {
        gallery.innerHTML = '';

        if (!screenshots.length) {
            const empty = document.createElement('p');
            empty.className = 'screenshots-empty-state';
            empty.textContent = 'Screenshots are on the way.';
            gallery.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        screenshots.forEach((item) => {
            fragment.appendChild(createScreenshotFigure(item));
        });

        gallery.appendChild(fragment);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const gallery = document.querySelector('.screenshots-gallery');
        if (!gallery) return;

        const screenshots = Array.isArray(window.screenshotData)
            ? window.screenshotData
            : [];

        renderScreenshots(gallery, screenshots);
    });
})();
