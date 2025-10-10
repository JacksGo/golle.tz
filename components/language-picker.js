const languagePickerStyles = new CSSStyleSheet();
languagePickerStyles.replaceSync(`
    ::slotted(*) {
        display: none;
    }

    button, #menu {
        --text-nudge: 0.325ch;
    }
    
    button {
        appearance: none;
        padding: 0;
        font-family: inherit;
        font-size: inherit;
        position: relative;
        
        /* I know, I know, but it looks more consistent this way. */
        cursor: pointer;

        /* Safari Strugglefest 2025 */
        /**
         * I don't have the engine knowledge to explain why, exactly, but Safari, on both iOS and
         * Mac, doesn't mark the calculated width of the button as dirty on mouseout here. It could
         * be some sort of insane internal race condition, where the auto width is computed before
         * the .text-reveal collapses, but surely it should still bump the calculation afterwards,
         * right? Right now, Safari doesn't even support auto width transitions, so getting to this
         * point has already taken a series of unsavory compromises. I'm going to leave this as-is
         * because there's not a lot I can do for single-vendor engine issues.
         */
        /* min-width: calc(2em + 1lh + 4px); */
        
        height: calc(2em + 1lh + 4px);
        box-sizing: border-box;
        overflow: hidden;

        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0;

        line-height: 1;
        border-radius: 9999px;
        background: transparent;
        border: 2px solid white;

        justify-self: flex-start;

        &::before {
            content: '';
            width: 300%;
            height: 100%;
            position: absolute;
            right: 0%;
            /* background-image: linear-gradient(45deg, white, white calc((100% + 10%) / 3), transparent calc((100% - 10%) / (3 / 2)), transparent); */
            background-image: linear-gradient(45deg, white, white calc((100% + 10%) / 3), rgb(0 0 0 / 50%) calc((100% - 10%) / (3 / 2)), rgb(0 0 0 / 50%));
            z-index: -1;

            @media (prefers-reduced-motion: no-preference) {
                transition: right 0.5s ease-in-out;
            }
        }
    }

    button:hover, button:has(+ [popover]:popover-open) {
        width: min-content;
    }

    button:hover::before, button:has(+ [popover]:popover-open)::before {
        right: -200%;
    }

    .button-face {
        grid-column: 1 / 4;
        display: grid;
        grid-template-columns: subgrid;
        padding: 1em;
        color: black;
        order: 0;

        &#huh {
            display: none;
        }

        .flag {
            margin-inline: calc(0.5lh / -2);
        }
    }

    button:has(+ #menu input.language-en:checked) .button-face#en { order: -1; }
    button:has(+ #menu input.language-fr:checked) .button-face#fr { order: -1; }
    button:has(+ #menu input.language-de:checked) .button-face#de { order: -1; }

    button:not(:has(+ #menu input:checked)) {
        border-color: #155715;
        background: #155715;

        .button-face#huh {
            display: grid;
            order: -1;
        }
    }

    .button-face .text-reveal {
        interpolate-size: allow-keywords;
        
        width: 0;
        white-space: nowrap;
        text-overflow: clip;
        pointer-events: none;
        justify-self: stretch;
        text-align: start;
        color: white;

        @media (prefers-reduced-motion: no-preference) {
            transition: width 0.5s ease-in-out;
        }

        .gap-before {
            margin-inline-start: calc(0.5em + var(--text-nudge) + (0.5lh / 2));
            margin-inline-end: calc(0.5em + 1em);
            display: flex;
            width: 100%;

            @media (prefers-reduced-motion: no-preference) {
                transition: margin-inline-start 0.5s ease-in-out, color 0.5s ease-in-out;
            }
        }

        button:hover &, button:has(+ [popover]:popover-open) & {
            width: auto;
        }

        button:hover & .gap-before, button:has(+ [popover]:popover-open) & .gap-before {
            /* margin-inline-start: calc(0.5em + (0.5lh / 2)); */
            color: black;
        }
    }

    .button-face#huh {
        background: #155715;
        color: white;

        .flag {
            background: #0f7c10;
            width: calc(2em + 1lh);
            height: calc(2em + 1lh);
            margin: -1em;
            border-radius: 50%;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;

            &::before {
                font-size: 125%;
                content: '🏆';
                color: transparent;
                background: white;
                background-clip: text;
            }
        }

        .text-reveal {
            display: flex;
            flex-direction: column;
            margin-top: calc((1lh + (0.75lh / 2)) / -2);
            gap: calc(0.75lh / 2);
            font-size: 90%;

            /* For some reason makes the opening animation lurch at a seemingly arbitrary point. */
            /* transition-duration: 1s; */
            
            pointer-events: all;
        }
        
        .gap-before {
            margin-inline-start: calc(1em + 0.5em + (0.5lh / 2));
            margin-inline-end: 0;
            color: white;
        }

        .jamer-score {
            font-size: 50%;
            background: white;
            height: 2em;
            width: 2em;
            flex-shrink: 0;
            border-radius: 1em;
            color: #155715;
            font-weight: bold;
            font-weight: 800;
            line-height: 2em;
            text-align: center;
            margin-inline-end: 0.5ch;
        }
    }
    
    #menu {
        margin: 0;
        margin-block-start: 2px;
        padding: 0;
        inset: auto;
        position-area: span-inline-end block-end;
        
        border: none;
        border-radius: calc((1em + 1lh + 1em) / 2);
        background: white;
        box-shadow: 1px 1px 10px rgb(0 0 0 / 12.5%);

        color: black;

        /**
         * Neither Firefox nor Safari seemingly support positioning top-layer elements relative
         * to children. In this specific case? In all cases? I don't know. Below is a hacky fix--
         * I always know where the language picker is going to be on the page, so for browsers that
         * don't support trigger-relative positioning, I can just place the menu below where the
         * button *will* be, and everything works out. Do not move the language picker. I repeat,
         * do NOT move the language pick-- noooo! My carefully crafted illusion of cross-browser
         * compatibility!
         */
        @supports not (position-area: span-inline-end block-end) {
            position: fixed;
            top: calc(2em + 1lh + 4px + 1em);
            left: 1em;
        }
    }

    #item-group {
        display: grid;
        grid-template-columns: auto 1fr auto;
    }

    label {
        display: grid;
        grid-column: 1 / 4;
        grid-template-columns: subgrid;

        cursor: pointer;

        align-items: center;
        padding-inline: 0.25em 0.5em;
        /* gap: 0.5em; */
        gap: calc(0.5em + var(--text-nudge));
        padding: 1em;
        padding-inline-start: calc(1em - (0.5lh / 2) + 2px);
        padding-inline-end: calc(1em + 2px);
        line-height: 1lh;

        background: white;
    }

    label::after {
        content: '';
        width: 1em;
        text-align: end;
        margin-inline-start: 2px;
        margin-inline-end: -2px;
    }

    label:has(input:checked)::after {
        content: '\\2713' / '';
    }

    input[type='radio'], .flag {
        display: block;
        appearance: none;
        width: calc(3lh / 2);
        height: 1lh;
        border-radius: 0.25em;
        margin: 0;

        font-size: inherit;
        font-family: inherit;
        line-height: 1;
    }

    .visually-hidden {
        position: absolute;
        top: 0;
        left: 0;
        width: 0px;
        height: 0px;
        overflow: hidden;
        clip-path: rect(0 0 0 0);
    }

    /**
     * Let the record reflect I tried to do the stars, but it was going to be utter agony the
     * whole way through, and even I have limits (apparently).
     */
    .language-en {
        background:
            linear-gradient(#3d3b6e),
            repeating-linear-gradient(#b22335, #b22335 round(down, calc(50% / 6.5), 1%), #eee round(down, calc(50% / 6.5), 1%), #eee calc(100% / 7.5));
        background-size: 
            50% var(--blue-height),
            100% 100%;
        background-repeat: no-repeat, no-repeat;

        --blue-height: round(down, calc(9 * round(down, calc((50% / 6.5)), calc(50% / 6.5))), calc(50% / 6.5));
    }

    .language-fr {
        background: linear-gradient(90deg, #002495 calc(100% / 3), #eee calc(100% / 3), #eee calc(200% / 3), #ee293a calc(200% / 3));
    }

    .language-de {
        background: linear-gradient(#141414 calc(100% / 3), #ee1f24 calc(100% / 3), #ee1f24 calc(200% / 3), #ffce05 calc(200% / 3));
    }
`);

class LanguagePicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [languagePickerStyles];
        this.shadowRoot.innerHTML = `
            <button id="button" aria-haspopup="menu" popovertarget="menu" aria-labelledby="picker-button-label" aria-describedby="picker-button-description">
                <div id="en" class="button-face" aria-hidden="true">
                    <div class="flag language-en"></div>
                    <div class="text-reveal">
                        <span class="gap-before">English</span>
                    </div>
                </div>
                <div id="fr" class="button-face" aria-hidden="true">
                    <div class="flag language-fr"></div>
                    <div class="text-reveal">
                        <span class="gap-before">Français</span>
                    </div>
                </div>
                <div id="de" class="button-face" aria-hidden="true">
                    <div class="flag language-de"></div>
                    <div class="text-reveal">
                        <span class="gap-before">Deutsch</span>
                    </div>
                </div>
                <div id="huh" class="button-face" aria-hidden="true">
                    <div class="flag"></div>
                    <div class="text-reveal">
                        <span class="gap-before" id="achievement-title">Achievement unlocked</span>
                        <span class="gap-before">
                            <span class="jamer-score">J</span>
                            <span id="achievement-description">100 - Break the language picker</span>
                        </span>
                    </div>
                </div>
            </button>

            <div id="menu" role="dialog" aria-labelledby="picker-dialog-label" popover>
                <div id="item-group" aria-role="radiogroup">
                    <!--<div id="focus-sentinel-start" tabindex="0"></div>-->
                    <label lang="en">
                        <input type="radio" value="en" name="language" class="language-en" checked autofocus/>
                        English
                    </label>
                    <label lang="fr">
                        <input type="radio" value="fr" name="language" class="language-fr"/>
                        Français
                    </label>
                    <label lang="de">
                        <input type="radio" value="de" name="language" class="language-de"/>
                        Deutsch
                    </label>
                    <!--<div id="focus-sentinel-end" tabindex="0"></div>-->
                </div>
            </div>

            <slot></slot>

            <div id="picker-button-label" class="visually-hidden" aria-hidden="true">Language picker</div>
            <div id="picker-dialog-label" class="visually-hidden" aria-hidden="true">Language picker</div>
            <div id="picker-button-description" class="visually-hidden" aria-hidden="true">
                Click or press enter to open language picker. Use the arrow keys to change languages. Press escape to exit.
            </div>
        `;

        this.$button = this.shadowRoot.getElementById('button');
        this.$menu = this.shadowRoot.getElementById('menu');
        this.$itemGroup = this.shadowRoot.getElementById('item-group');
        this.$pickerButtonLabel = this.shadowRoot.getElementById('picker-button-label');
        this.$pickerDialogLabel = this.shadowRoot.getElementById('picker-dialog-label');
        this.$pickerButtonDescription = this.shadowRoot.getElementById('picker-button-description');
        this.$achievementTitle = this.shadowRoot.getElementById('achievement-title');
        this.$achievementDescription = this.shadowRoot.getElementById('achievement-description');

        this.$itemGroup.addEventListener('change', (e) => {           
            this.dispatchEvent(new CustomEvent('languagepickerchange', {
                bubbles: true,
                composed: true,
                detail: { language: e.target.value }
            }));
        });

        this.onLanguageChanged = this.INTERNAL_handleLanguageChange.bind(this);
        this.onTranslationAvailable = this.INTERNAL_handleTranslationAvailable.bind(this);
        this.setLanguageAsChecked = this.INTERNAL_setLanguageAsChecked.bind(this);
        this.onMenuToggle = this.INTERNAL_handleMenuToggle.bind(this);
    }

    INTERNAL_handleLanguageChange(e) {
        const currentLanguage = this.$itemGroup.querySelector(':checked')?.value;
        if (!currentLanguage || currentLanguage !== e.detail.language) {
            this.setLanguageAsChecked(e.detail.language);
        }

        // Safari is the new IE. Please DO @ me.
        this.$button.style.display = 'none';
        this.$button.offsetHeight;
        this.$button.style.display = '';
    }

    INTERNAL_setLanguageAsChecked(lang) {
        const shouldCheck = this.$itemGroup.querySelector(`input[value='${lang}']`);
        if (shouldCheck) shouldCheck.checked = true;

        for (const checkbox of this.$itemGroup.querySelectorAll('input')) {
            if (checkbox.value !== lang) {
                checkbox.checked = false;
            }
        }
    }

    INTERNAL_handleMenuToggle(e) {
        if (e.newState === 'closed') {
            this.$button.focus();

            // This is great. I love this and have no problems with it whatsoever.
            if (!CSS.supports('interpolate-size: allow-keywords')) {
                this.$button.style.display = 'none';
                this.$button.offsetHeight;
                this.$button.style.display = '';
            }
        }
    }

    INTERNAL_handleTranslationAvailable(e) {
        const lang = e.detail?.language;
        const source = e.detail?.data;

        const hasStrings = !!source
            && source['translations.language_picker']
            && source['translations.picker_instructions']
            && source['translations.achievement_unlocked']
            && source['translations.break_the_language_picker'];

        if (!hasStrings) return;

        this.$achievementTitle.textContent = source['translations.achievement_unlocked'];
        this.$achievementDescription.textContent = source['translations.break_the_language_picker'];
        this.$pickerButtonLabel.textContent = source['translations.language_picker'];
        this.$pickerDialogLabel.textContent = source['translations.language_picker'];
        this.$pickerButtonDescription.textContent = source['translations.picker_instructions'];

        this.$pickerButtonLabel.lang = lang;
        this.$pickerDialogLabel.lang = lang;
        this.$pickerButtonDescription.lang = lang;
        this.$button.lang = lang;
        this.lang = lang;
    }

    connectedCallback() {
        /**
         * Attempt to stop the stars and stripes jumpscare on initial load by using the host
         * document's lang property, if it's been set, as the default. This allows us to get
         * an almost-certainly correct initial value without having to wait for event
         * propagation. Well, not propagation, but dispatch, since we're listening in capture
         * phase. You get what I mean. Event slow. Hash map fast. *caveman grunts*
         */
        if (this.ownerDocument.documentElement.lang) {
            this.setLanguageAsChecked(this.ownerDocument.documentElement.lang);
        }
        
        this.$menu.addEventListener('toggle', this.onMenuToggle);
        
        this.ownerDocument.addEventListener('languagepickerchange', this.onLanguageChanged, { capture: true });
        this.ownerDocument.addEventListener('translationavailable', this.onTranslationAvailable, { capture: true });
    }

    disconnectedCallback() {
        this.$menu.removeEventListener('toggle', this.onMenuToggle);

        this.ownerDocument.removeEventListener('languagepickerchange', this.onLanguageChanged, { capture: true });
        this.ownerDocument.removeEventListener('translationavailable', this.onTranslationAvailable, { capture: true });
    }

    get value() {
        const selectedRadio = this.$itemGroup.querySelector(':checked');

        if (!selectedRadio) {
            return null;
        } else {
            return selectedRadio.value;
        }
    }
}

customElements.define("language-picker", LanguagePicker);