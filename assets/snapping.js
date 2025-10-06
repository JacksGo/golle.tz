/**
 * Scroll snap events aren't widely supported yet, but this serves as a nice progressive
 * enhancement, since it's gated behind an event which will never fire in browsers that
 * don't support the feature. I *could* use an IntersectionObserver for this, and actually
 * did initially, but that's computationally expensive and fails to catch edge cases. I'm
 * happy with the compute tradeoff of the about/history IntersectionObserver above, but
 * this doesn't justify that level of commitment.
 * 
 * In a future where scroll snap events are supported in all major browsers, I'll be able
 * to replace the other IntersectionObserver with it, too.
 */

const hashToElementId = (hash) => {
    const id = hash && hash.at(0) === '#' ? hash.slice(1,) : hash;
    if (id === 'top' || document.getElementById(id) !== null) {
        return id;
    } else {
        return null;
    }
};

const enableSnapping = () => {
    if (hasReachedInitialHash) return;

    setTimeout(() => {
        console.info(`Initial hash reached: #${initialId}. Unlocking snap listener.`);
        hasReachedInitialHash = true;
        document.documentElement.classList.remove('snap-suspended');
    }, 250);
}

let hasReachedInitialHash = !location.hash || location.hash === '#top';
const initialId = hashToElementId(location.hash);

if (hasReachedInitialHash) {
    document.documentElement.classList.remove('snap-suspended');
}

window.addEventListener('scrollsnapchange', (e) => {
    let currentId = hashToElementId(location.hash);
    let newId;

    if (!e.snapTargetBlock) return;

    if (e.snapTargetBlock.matches('.scroll-wrapper')) {
        newId = e.snapTargetBlock.parentElement.id;
    } else if (e.snapTargetBlock.id === 'article') {
        newId = 'history';
    }

    if (!hasReachedInitialHash) {
        if (newId !== initialId) {
            console.warn(`Ignored a snap to #${newId || 'top'} because we're still waiting to reach the initial hash of #${initialId}.`);
            return;
        } else {
            enableSnapping();
            return;
        }
    }

    if (!newId && currentId) {
        newId = 'top';
    } else if (!newId) {
        return;
    }

    if (currentId !== newId && hasReachedInitialHash) {
        const uri = new URL(location);
        uri.hash = newId;
        // console.log(`Looks like you're going to ${uri.hash}, Jimbo.`);
        history.replaceState(null, '', uri.href);

        /**
         * @todo needs a check shim to make sure we grab the hash on load and scroll to it.
         * Since loading the page will trigger a scrollsnapchange event, it seems to just
         * wipe out the auto jump from the browser completely.
         */
    }
});

let isReady = false;
document.addEventListener('readystatechange', (e) => {
    if (isReady || document.readyState !== 'complete') {
        return;
    }
    
    try {
        const navEntries = performance.getEntriesByType('navigation');
        isRefresh = navEntries.length > 0 && navEntries[0].type === 'reload';

        // console.log("Is a refresh?", isRefresh);

        if (!isRefresh) {
            return;
        }

        if (location.hash && !hasReachedInitialHash) {
            const targetId = hashToElementId(location.hash);
            const outerTarget = document.getElementById(targetId);

            if (!outerTarget) {
                // console.log("Invalid outerTarget");
                return;
            }

            outerTarget.scrollIntoView({ behavior: 'instant' });
        }
    } finally {
        isReady = true;
        enableSnapping();
    }
});
