/**
 * This waits until the transition on any back/forward button's text has completed,
 * then, if the button is currently hovered, applies a delay to the text's collapse
 * transition (and clears the delay otherwise). In practice, this means that the
 * button will always immediately expand or collapse when hovered or unhovered,
 * UNLESS it makes it to fully expanded. In that case, on unhover, the text will
 * stay expanded for an additional half-second, then collapse like normal.
 * 
 * Doing this with CSS wasn't an option because the usual strategy of "add a delay
 * and remove it on :hover" causes partially expanded buttons to freeze on unhover,
 * since as soon as the mouse leaves the element, the delay from unhovered selector
 * starts to apply.
 * 
 * And look, I'd rather avoid JavaScript here as much as the next guy. But since
 * transition-delay isn't an animatable property per the spec, there's no way for me to
 * update it on a delay in CSS, even with transition-behavior: allow-discrete. Hell, I
 * even tried sticking it in a @keyframes animation, but, as I eventually discovered,
 * this doesn't work for the same reason of "the spec says so".
 * 
 * The snippet below is the closest I can get to hooking into the transition state like
 * I wanted to. Since transitionend only fires on a *completed* transition, this ignores
 * hovers and unhovers in the middle of the transition entirely. Given the constraints,
 * I'd say it's not bad.
 */
window.addEventListener('transitionend', (e) => {
    if (e.target.matches('.text-reveal')) {
        if (e.target.closest('.scroll-wrapper').matches(':hover')) {
            e.target.style.transitionDelay = "350ms";
        } else {
            e.target.style.transitionDelay = "";
        }
    }
});

/**
 * If the button isn't already expanded, we want a quick mouseover of the wrapper (e.g.,
 * on the way to the address bar) to be ignored entirely. However, if the button is in the
 * process of collapsing already, a mouseover across the wrapper should stop the transition
 * without delay. This helps prevent quick, sporadic mouseovers from causing herky-jerky
 * freezing in the middle of a collapse.
 */
window.addEventListener('transitionstart', (e) => {
    if (e.target.matches('.text-reveal')) {
        if (!e.target.closest('.scroll-pill').matches(':hover')) {
            e.target.style.transitionDelay = "0s";
        } else {
            e.target.style.transitionDelay = "225ms";
        }
    }
});