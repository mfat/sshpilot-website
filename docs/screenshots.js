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

    function parseMinWidth(value) {
        if (!value || value === 'auto' || value === 'none') {
            return 0;
        }
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }

    function parseMaxWidth(value) {
        if (!value || value === 'none') {
            return Infinity;
        }
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
    }

    function clampWidthForItem(item, rowHeight) {
        let width = rowHeight * item.ratio;
        if (item.minWidth > 0) {
            width = Math.max(width, item.minWidth);
        }
        if (Number.isFinite(item.maxWidth)) {
            width = Math.min(width, item.maxWidth);
        }
        return Math.max(0, width);
    }

    function getRowWidth(row, rowHeight) {
        return row.reduce((sum, item) => sum + clampWidthForItem(item, rowHeight), 0);
    }

    function getScaleBounds(row, targetRowHeight, maxRowHeight, isLastRow) {
        let minScale = 0;
        let maxScale = maxRowHeight > 0 ? maxRowHeight / targetRowHeight : Infinity;

        if (!Number.isFinite(maxScale) || maxScale <= 0) {
            maxScale = Infinity;
        }

        row.forEach((item) => {
            if (!Number.isFinite(item.ratio) || item.ratio <= 0) {
                return;
            }

            if (item.minWidth > 0) {
                const candidate = item.minWidth / (item.ratio * targetRowHeight);
                if (Number.isFinite(candidate)) {
                    minScale = Math.max(minScale, candidate);
                }
            }

            if (Number.isFinite(item.maxWidth)) {
                const candidate = item.maxWidth / (item.ratio * targetRowHeight);
                if (Number.isFinite(candidate)) {
                    maxScale = Math.min(maxScale, candidate);
                }
            }
        });

        if (isLastRow) {
            maxScale = Math.min(maxScale, 1);
        }

        minScale = Math.max(minScale, 0);

        if (!Number.isFinite(maxScale) || maxScale <= 0) {
            maxScale = minScale > 0 ? minScale : 1;
        }

        if (maxScale < minScale) {
            maxScale = minScale;
        }

        return { minScale, maxScale };
    }

    function getWidthForScale(row, targetRowHeight, scale) {
        return getRowWidth(row, targetRowHeight * scale);
    }

    function resolveRowScale(row, targetRowHeight, maxRowHeight, widthAvailable, isLastRow) {
        const { minScale, maxScale } = getScaleBounds(row, targetRowHeight, maxRowHeight, isLastRow);
        const lower = minScale;
        const upper = maxScale;
        const widthAtLower = getWidthForScale(row, targetRowHeight, lower);
        const widthAtUpper = getWidthForScale(row, targetRowHeight, upper);

        if (!Number.isFinite(widthAvailable) || widthAvailable <= 0) {
            return {
                scale: lower,
                minScale: lower,
                maxScale: upper,
                widthAtLower,
                widthAtUpper,
                reachedLower: true,
                reachedUpper: false,
            };
        }

        let scale = lower;
        let reachedLower = false;
        let reachedUpper = false;

        if (widthAvailable <= widthAtLower) {
            scale = lower;
            reachedLower = true;
        } else if (widthAvailable >= widthAtUpper) {
            scale = upper;
            reachedUpper = true;
        } else {
            let lo = lower;
            let hi = upper;

            for (let i = 0; i < 20; i++) {
                const mid = (lo + hi) / 2;
                const width = getWidthForScale(row, targetRowHeight, mid);
                if (width < widthAvailable) {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }

            scale = (lo + hi) / 2;
        }

        return {
            scale,
            minScale: lower,
            maxScale: upper,
            widthAtLower,
            widthAtUpper,
            reachedLower,
            reachedUpper,
        };
    }

    function applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, isLastRow) {
        if (!row.length) return;
        const gapTotal = gap * Math.max(0, row.length - 1);
        const widthAvailable = innerWidth - gapTotal;

        const {
            scale,
        } = resolveRowScale(row, targetRowHeight, maxRowHeight, widthAvailable, isLastRow);

        const rowHeight = Math.max(1, targetRowHeight * scale);

        row.forEach((item) => {
            const width = clampWidthForItem(item, rowHeight);
            item.frame.style.width = `${width}px`;
            item.frame.style.height = `${rowHeight}px`;
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

        const items = frames.map((frame) => {
            const ratio = getAspectRatio(frame);
            if (!Number.isFinite(ratio) || ratio <= 0) {
                return null;
            }

            const computed = getComputedStyle(frame);
            const minWidth = parseMinWidth(computed.minWidth);
            const maxWidth = parseMaxWidth(computed.maxWidth);

            return { frame, ratio, minWidth, maxWidth };
        }).filter(Boolean);

        let row = [];

        items.forEach((item) => {
            row.push(item);

            const expectedWidth = getRowWidth(row, targetRowHeight) + gap * Math.max(0, row.length - 1);
            if (expectedWidth >= innerWidth) {
                const gapTotal = gap * Math.max(0, row.length - 1);
                const widthAvailable = innerWidth - gapTotal;

                const scaleInfo = resolveRowScale(row, targetRowHeight, maxRowHeight, widthAvailable, false);

                const shouldDeferLastItem = row.length > 1 && (
                    (scaleInfo.reachedUpper && widthAvailable > scaleInfo.widthAtUpper + 0.5) ||
                    (scaleInfo.reachedLower && widthAvailable < scaleInfo.widthAtLower - 0.5)
                );

                if (shouldDeferLastItem) {
                    const lastItem = row.pop();
                    applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, false);
                    row = [lastItem];
                } else {
                    applyRowLayout(row, innerWidth, targetRowHeight, maxRowHeight, gap, false);
                    row = [];
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
