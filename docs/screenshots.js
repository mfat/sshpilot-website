(function () {
    const scheduleLayout = (() => {

        let rafId = null;
        return (callback) => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                callback();
            });
        };
    })();

    function getAspectRatio(frame) {
        const img = frame.querySelector('img');
        if (!img) {
            return 1;
        }
        if (img.naturalWidth && img.naturalHeight) {
            return img.naturalWidth / img.naturalHeight;
        }
        const rect = img.getBoundingClientRect();
        if (rect.width && rect.height) {
            return rect.width / rect.height;
        }
        return 1;
    }

    function applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, isLastRow) {
        if (!row.length) return;
        const aspectSum = row.reduce((sum, item) => sum + item.ratio, 0);
        if (!aspectSum) return;
        const gapTotal = gap * Math.max(0, row.length - 1);
        const widthAtTarget = aspectSum * targetRowHeight;
        let scale = (innerWidth - gapTotal) / widthAtTarget;
        const maxScale = maxRowHeight / targetRowHeight;

        if (isLastRow) {
            scale = Math.min(scale, 1);
        }

        if (!Number.isFinite(scale) || scale <= 0) {
            scale = 1;
        }

        scale = Math.min(scale, maxScale);
        const rowHeight = Math.max(1, targetRowHeight * scale);

        row.forEach(({ frame, ratio }) => {
            const width = rowHeight * ratio;
            frame.style.width = `${width}px`;
            frame.style.height = `${rowHeight}px`;
        });
    }

    function layoutGallery(gallery) {
        const styles = getComputedStyle(gallery);
        const targetRowHeight = parseFloat(styles.getPropertyValue('--jg-target-row-height')) || 160;
        const maxRowHeight = parseFloat(styles.getPropertyValue('--jg-max-row-height')) || targetRowHeight * 1.2;
        const gap = parseFloat(styles.getPropertyValue('--jg-gap')) || parseFloat(styles.columnGap || styles.gap || 0) || 0;
        const paddingLeft = parseFloat(styles.paddingLeft) || 0;
        const paddingRight = parseFloat(styles.paddingRight) || 0;
        const innerWidth = gallery.clientWidth - paddingLeft - paddingRight;
        if (innerWidth <= 0) {
            return;
        }

        const frames = Array.from(gallery.querySelectorAll('.screenshot-frame'));
        if (!frames.length) {
            return;
        }

        frames.forEach((frame) => {
            frame.style.removeProperty('width');
            frame.style.removeProperty('height');
        });

        let row = [];
        let aspectAccumulator = 0;

        frames.forEach((frame) => {
            const ratio = getAspectRatio(frame);
            if (!Number.isFinite(ratio) || ratio <= 0) {
                return;
            }

            row.push({ frame, ratio });
            aspectAccumulator += ratio;

            const expectedWidth = aspectAccumulator * targetRowHeight + gap * Math.max(0, row.length - 1);
            if (expectedWidth >= innerWidth) {
                const gapTotal = gap * Math.max(0, row.length - 1);
                const scale = (innerWidth - gapTotal) / (aspectAccumulator * targetRowHeight);
                const maxScale = maxRowHeight / targetRowHeight;

                if (scale > maxScale && row.length > 1) {
                    const lastItem = row.pop();
                    aspectAccumulator -= lastItem.ratio;
                    applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, false);
                    row = [lastItem];
                    aspectAccumulator = lastItem.ratio;
                } else {
                    applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, false);
                    row = [];
                    aspectAccumulator = 0;
                }
            }
        });

        if (row.length) {
            applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, true);
        }
    }

    function waitForImages(frames) {
        return Promise.all(frames.map((frame) => {
            const img = frame.querySelector('img');
            if (!img) return Promise.resolve();
            if (img.complete && img.naturalHeight !== 0) {
                return Promise.resolve();
            }
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        }));
    }

    function initialiseJustifiedGallery(gallery) {
        if (!gallery) return;

        const runLayout = () => scheduleLayout(() => layoutGallery(gallery));

        const frames = () => Array.from(gallery.querySelectorAll('.screenshot-frame'));

        waitForImages(frames()).then(runLayout);

        window.addEventListener('resize', runLayout);

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(runLayout);

            resizeObserver.observe(gallery);
        }

        if (typeof MutationObserver !== 'undefined') {
            const mutationObserver = new MutationObserver(() => {
                waitForImages(frames()).then(runLayout);

            });
            mutationObserver.observe(gallery, { childList: true, subtree: true });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const gallery = document.querySelector('.screenshots-gallery');
        if (gallery) {
            initialiseJustifiedGallery(gallery);

        }
    });
})();
