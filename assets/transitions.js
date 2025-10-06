

/**
 * Directional MPA view transitions.
 * Ported from https://view-transitions.chrome.dev/pagination/mpa/ with modifications.
 */

// Determine support for view transitions via CSS OM.
document.addEventListener('DOMContentLoaded', (e) => {
    switch (true) {
        case !window.navigation:
        case !('CSSViewTransitionRule' in window):
            throw new Error("View transitions aren't supported. Aborting.");
        default:
            break;
	}
});

// Note: determining the types is typically needed only on the new page (thus: in `pageswap`)
// However, because we set the `view-transition-names` based on the types (see `mpa.css`)
// we also determine it on the outgoing page.
window.addEventListener('pageswap', async (e) => {
	if (!e.viewTransition) return;

    const transitionType = determineTransitionType(e.activation.from, e.activation.entry);

    // console.log(`pageSwap: ${transitionType}`);
    e.viewTransition.types.add(transitionType);
});

window.addEventListener('pagereveal', async (e) => {
	if (!e.viewTransition) return;
    
    const transitionType = determineTransitionType(navigation.activation.from, navigation.activation.entry);

    // console.log(`pageReveal: ${transitionType}`);
    e.viewTransition.types.add(transitionType);
});

// Determine the View Transition class to use based on the old and new navigation entries
// Also take the navigateEvent into account to detect UA back/forward navigations
const determineTransitionType = (oldNavigationEntry, newNavigationEntry) => {
	if (!oldNavigationEntry || !newNavigationEntry) return 'unknown';

	const currentPathname = new URL(oldNavigationEntry.url).pathname;
	const destinationPathname = new URL(newNavigationEntry.url).pathname;

    // Going nowhere?
	if (currentPathname === destinationPathname) return 'reload';
    
    // Going from an article to the home page
    if (destinationPathname === '/') return 'backwards';
        
    // Going from the home page to an article
    if (currentPathname === '/') return 'forwards';

    // ???
    return 'unknown';
};