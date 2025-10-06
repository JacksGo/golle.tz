
let hasTriggeredAbout = false;
let hasTriggeredSignature = false;

const observer = new IntersectionObserver((e) => {
    for (const event of e) {
        const fullyHidden = !event.isIntersecting;
        const fullyVisible = event.intersectionRatio === 1;

        if (!fullyHidden && !fullyVisible) continue;

        if (fullyVisible) {
            switch (event.target.id) {
                case 'about':
                    document.querySelector('#about .role-list').classList.add('scrolling');
                    hasTriggeredAbout = true;
                    break;
                case 'article':
                    document.querySelector('#article #signature').classList.add('drawing');
                    hasTriggeredSignature = true;
                    break;
                case 'signature':
                    const articleRect = document.getElementById('article').getBoundingClientRect();
                    const viewportRect = visualViewport;

                    if (articleRect.height > viewportRect.height) {
                        document.getElementById('signature').classList.add('drawing');
                        hasTriggeredSignature = true;
                    }
                default:
                    break;
            }

            /**
             * Unobserve elements as their animations are triggered so that we're not
             * watching for intersections that won't have any effect. 
             */
            if (hasTriggeredAbout) observer.unobserve(document.getElementById('about'));
            if (hasTriggeredSignature) {
                observer.unobserve(document.getElementById('article'));
                observer.unobserve(document.getElementById('signature'));
            }

            /**
             * Since IntersectionObservers are relatively heavy, as soon as we've triggered
             * both animations, stop the observer completely since there's nothing left to
             * observe.
             */
            if (hasTriggeredAbout && hasTriggeredSignature) observer.disconnect();
        }
    }
}, {
    root: null,
    threshold: [0, 1],
});

observer.observe(document.getElementById('about'));
observer.observe(document.getElementById('article'));
observer.observe(document.getElementById('signature'));
