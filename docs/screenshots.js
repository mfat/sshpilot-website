(function () {
    const scheduleMasonryUpdate = (function () {
        let rafId = null;
        return (callback) => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                callback();
            });
        };
    })();

    function initialiseMasonry(gallery) {
        if (!gallery) return;
        const items = () => Array.from(gallery.querySelectorAll('.screenshot-frame'));

        const getMaxSpan = (rowHeight, rowGap) => {
            const maxHeight = parseFloat(getComputedStyle(gallery).getPropertyValue('--masonry-max-height'));
            if (!maxHeight) {
                return Infinity;
            }
            return Math.max(1, Math.round((maxHeight + rowGap) / (rowHeight + rowGap)));
        };

        const clampImageHeight = (item) => {
            const img = item.querySelector('img');
            if (!img) return;
            const styles = getComputedStyle(gallery);
            const maxHeight = parseFloat(styles.getPropertyValue('--masonry-max-height'));
            if (!maxHeight) {
                img.style.removeProperty('max-height');
                return;
            }
            img.style.maxHeight = `${maxHeight}px`;
        };

        const computeSpan = (item) => {
            if (!item) return;
            item.style.removeProperty('grid-row-end');
            const styles = getComputedStyle(gallery);
            const rowHeight = parseFloat(styles.getPropertyValue('--masonry-row-height')) || 8;
            const rowGap = parseFloat(styles.rowGap || styles.getPropertyValue('row-gap')) || 0;
            const maxSpan = getMaxSpan(rowHeight, rowGap);
            clampImageHeight(item);
            const itemHeight = item.getBoundingClientRect().height;
            if (!itemHeight) return;
            const span = Math.max(1, Math.round((itemHeight + rowGap) / (rowHeight + rowGap)));
            item.style.gridRowEnd = `span ${Math.min(span, maxSpan)}`;
        };

        const updateAll = () => {
            scheduleMasonryUpdate(() => {
                items().forEach(computeSpan);
            });
        };

        const observeImages = () => {
            items().forEach((item) => {
                const img = item.querySelector('img');
                if (!img) return;
                if (img.complete && img.naturalHeight !== 0) {
                    computeSpan(item);
                    return;
                }
                img.addEventListener('load', () => computeSpan(item), { once: true });
                img.addEventListener('error', () => computeSpan(item), { once: true });
            });
        };

        observeImages();
        updateAll();

        window.addEventListener('resize', updateAll);

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(updateAll);
            resizeObserver.observe(gallery);
        }

        if (typeof MutationObserver !== 'undefined') {
            const mutationObserver = new MutationObserver(() => {
                observeImages();
                updateAll();
            });
            mutationObserver.observe(gallery, { childList: true, subtree: true });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const gallery = document.querySelector('.screenshots-gallery');
        if (gallery) {
            initialiseMasonry(gallery);
        }
    });
})();
