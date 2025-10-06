const cachedLanguages = new Map();

/**
 * Dispatch an event containing the new strings. This can be picked up and used by any
 * component, but is most useful to shadow DOM components for receiving updates across
 * the shadow boundary.
 */
const propagateToShadow = (lang, source) => {
    document.documentElement.dispatchEvent(new CustomEvent('translationavailable', {
        composed: true,
        detail: {
            language: lang,
            data: source
        }
    }));
}

const changeDisplayLanguage = async (lang) => {
    if (!['en','fr','de'].includes(lang)) throw new RangeError("Unsupported language");

    let source;
    if (cachedLanguages.has(lang)) {
        source = cachedLanguages.get(lang);
    } else {
        source = await fetch(`/locales/${lang}.json`, { credentials: 'include', mode: 'no-cors' })
        .then(async res => {
            const parsed = await res.json();
            cachedLanguages.set(lang, parsed);
            return parsed;
        })
        .catch(() => {
            throw new Error(`Unable to load language file "${lang}"`);
        });
    }

    const elementsToChange = document.querySelectorAll('[data-string]');

    for (element of elementsToChange) {
        if (Object.keys(source).includes(element.dataset.string)) {
            element.innerHTML = source[element.dataset.string];

            if (element.dataset.pageTitle !== undefined) {
                document.title = `${source[element.dataset.string]} - Jackson Golletz`;
            }
        } else {
            element.textContent = `Missing string: ${lang}:${element.dataset.string}`;
            element.style.border = '10px dashed red';
        }
    }

    const graphicsToChange = document.querySelectorAll('[data-alt-string]');

    for (graphic of graphicsToChange) {
        if (Object.keys(source).includes(graphic.dataset.altString)) {
            graphic.setAttribute('alt', source[graphic.dataset.altString]);
            graphic.setAttribute('lang', lang);
        } else {
            graphic.style.border = '10px dashed red';
        }
    }

    /** Provide the new strings to any shadow DOMs listening to the root */
    propagateToShadow(lang, source);

    document.documentElement.lang = lang;
    document.documentElement.dataset.translated = true;
}

document.getElementById('language-picker').addEventListener('languagepickerchange', (e) => {
    changeDisplayLanguage(e.detail.language);

    if (['en', 'fr', 'de'].includes(e.detail.language)) {
        localStorage.setItem('lang', e.detail.language);
    }
});

/**
 * @todo Prewarm language files based on navigator.languages
 * @todone Store language setting in cookies/localStorage.
 */

const pushRadioStates = (storedLanguage) => {
    document.documentElement.dispatchEvent(new CustomEvent('languagepickerchange', {
        composed: true,
        detail: { language: storedLanguage }
    }));
};

document.addEventListener('readystatechange', (e) => {
    if (document.readyState === 'loading') return;

    /**
     * @todo This runs twice. Low-cost, but a potential optimization. The reason is described below
     * in the 'complete' branch. Double fetching was the simpler approach compared to caching in a
     * global variable or something.
     */
    const storedLanguage = localStorage.getItem('lang') ?? 'en';
    if (storedLanguage === 'en' || !storedLanguage) return;

    if (document.readyState === 'interactive') {
        changeDisplayLanguage(storedLanguage);
    }

    /**
     * Manually dispatch a change event to update the radio states. This needs to happen
     * later in the load sequence because the language-picker component is a script
     * resource, so will be loaded after 'interactive'. We split the functionality in two
     * to reduce the FOUTT (flash of untranslated text) as much as possible first, then
     * update the picker whenever it's ready.
     */
    if (document.readyState === 'complete') {
        pushRadioStates(storedLanguage);
    }
});

/**
 * This is important to have in browsers that support it because back-navigation that pulls from
 * bfcache will, by its very nature, not fire readystatechange, and thus may display a stale
 * language setting if it was changed on the "forward" (n+1) page. The event supplies an
 * e.persisted value which allows us to only initiate this supplemental update when loading from
 * cache, and let the readystatechange listener handle the load otherwise.
 */
window.addEventListener('pageshow', (e) => {
    /** Only re-check the language when pulling from bfcache, otherwise ignore. */
    if (!e.persisted) return;

    /**
     * Unlike in readystatechange, we don't exit if the language is 'en', because the forward page
     * may have been a different language (and, for that matter, so might have this page in the
     * bfcache).
     */
    const storedLanguage = localStorage.getItem('lang') ?? 'en';

    changeDisplayLanguage(storedLanguage);
    pushRadioStates(storedLanguage);
});