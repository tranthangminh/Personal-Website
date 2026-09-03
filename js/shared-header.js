(function () {
    'use strict';

    var escapeHtml = window.sharedUtils.escapeHtml;
    var STORAGE_THEME_KEY = 'theme';

    function getPreferredTheme() {
        var savedTheme = null;
        try {
            savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
        } catch (error) {}

        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    function getThemeIconMaskHtml(theme, assetBase) {
        var base = typeof assetBase === 'string' ? assetBase : '';
        var isDark = theme === 'dark';
        var svgFileName = isDark ? 'light-mode.svg' : 'dark-mode.svg';
        var rawSvg = isDark
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 12.99c-.56 6.06-5.93 10.52-11.99 9.96C4.95 22.39.49 17.02 1.05 10.96 1.54 5.68 5.72 1.49 11.01 1c-2.81 3.81-2.01 9.18 1.8 11.99 3.03 2.24 7.16 2.24 10.19 0Z"/></svg>';

        var maskUrl = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:'
            ? 'data:image/svg+xml;utf8,' + encodeURIComponent(rawSvg)
            : escapeHtml(base + 'svg/' + svgFileName);

        return '<span class="theme-icon icon-mask" style="mask-image: url(\'' + maskUrl + '\'); -webkit-mask-image: url(\'' + maskUrl + '\');"></span>';
    }

    function updateThemeToggleUI(theme) {
        var themeToggleBtn = document.getElementById('themeToggleBtn');
        if (!themeToggleBtn) return;
        var isDark = theme === 'dark';
        var titleText = isDark
            ? translate('header.themeToLight', 'Chuyển sang giao diện Sáng')
            : translate('header.themeToDark', 'Chuyển sang giao diện Tối');

        themeToggleBtn.setAttribute('title', titleText);
        themeToggleBtn.setAttribute('aria-label', titleText);
        themeToggleBtn.innerHTML = getThemeIconMaskHtml(theme);
    }

    function applyTheme(theme) {
        var validTheme = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', validTheme);
        try {
            localStorage.setItem(STORAGE_THEME_KEY, validTheme);
        } catch (error) {}
        updateThemeToggleUI(validTheme);
        return validTheme;
    }

    // Initialize theme immediately on script load
    applyTheme(getPreferredTheme());

    window.sharedTheme = {
        get: function () {
            return document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        },
        set: function (theme) {
            return applyTheme(theme);
        },
        toggle: function () {
            var current = this.get();
            var next = current === 'dark' ? 'light' : 'dark';
            return applyTheme(next);
        }
    };

    function translate(key, fallback) {
        if (window.sharedI18n && typeof window.sharedI18n.t === 'function') {
            return window.sharedI18n.t(key, fallback);
        }

        return fallback != null ? fallback : key;
    }

    window.initSharedHeaderMenus = function (options) {
        var opts = options || {};
        var menuWraps = Array.prototype.slice.call(document.querySelectorAll('.menu-wrap'));
        var headerHomeLink = document.getElementById('headerHomeLink');
        var languageButtons = Array.prototype.slice.call(document.querySelectorAll('.lang-btn[data-lang]'));
        var themeToggleBtn = document.getElementById('themeToggleBtn');

        function closeMenus() {
            menuWraps.forEach(function (menuWrap) {
                var menuList = menuWrap.querySelector('.menu-list');
                if (menuList) {
                    menuList.classList.remove('is-open');
                }
            });
        }

        if (menuWraps.length) {
            menuWraps.forEach(function (menuWrap) {
                var menuButton = menuWrap.querySelector('.menu-btn');
                var menuList = menuWrap.querySelector('.menu-list');

                if (!menuButton || !menuList) {
                    return;
                }

                if (menuButton.tagName.toLowerCase() === 'button') {
                    menuButton.addEventListener('click', function (event) {
                        event.stopPropagation();
                        var isOpen = menuList.classList.contains('is-open');
                        closeMenus();
                        menuList.classList.toggle('is-open', !isOpen);
                    });
                }
            });

            document.addEventListener('click', function (event) {
                if (!event.target.closest('.menu-wrap')) {
                    closeMenus();
                }
            });
        }

        if (headerHomeLink && typeof opts.onHomeClick === 'function') {
            headerHomeLink.addEventListener('click', function (event) {
                closeMenus();
                opts.onHomeClick(event, {
                    closeMenus: closeMenus,
                    headerHomeLink: headerHomeLink,
                    menuWraps: menuWraps
                });
            });
        }

        if (languageButtons.length) {
            languageButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var targetLanguage = button.getAttribute('data-lang');
                    var i18n = window.sharedI18n;

                    if (!targetLanguage || !i18n || typeof i18n.setLanguage !== 'function') {
                        return;
                    }

                    if (typeof i18n.getLanguage === 'function' && i18n.getLanguage() === targetLanguage) {
                        return;
                    }

                    closeMenus();
                    i18n.setLanguage(targetLanguage);

                    try {
                        var nextUrl = new URL(window.location.href);
                        nextUrl.searchParams.set('lang', targetLanguage);
                        window.location.replace(nextUrl.toString());
                    } catch (error) {
                        window.location.reload();
                    }
                });
            });
        }

        if (themeToggleBtn) {
            updateThemeToggleUI(window.sharedTheme.get());
            themeToggleBtn.addEventListener('click', function () {
                closeMenus();
                if (window.sharedTheme && typeof window.sharedTheme.toggle === 'function') {
                    window.sharedTheme.toggle();
                }
            });
        }

        return {
            closeMenus: closeMenus,
            headerHomeLink: headerHomeLink,
            menuWraps: menuWraps,
            languageButtons: languageButtons,
            themeToggleBtn: themeToggleBtn
        };
    };

    window.renderSharedHeader = function (rootId, options) {
        var opts = options || {};
        var root = document.getElementById(rootId);
        if (!root) {
            return;
        }

        var homeHref = escapeHtml(opts.homeHref || 'index.html');
        var professionItems = Array.isArray(opts.professionItems) && opts.professionItems.length ? opts.professionItems : [
            { labelKey: 'header.profession.actor', label: 'Di\u1ec5n Vi\u00ean', href: 'actor.html' },
            { labelKey: 'header.profession.artist', label: 'H\u1ecda S\u0129', href: 'artist.html' },
            { labelKey: 'header.profession.photographer', label: 'Nhi\u1ebfp \u1ea2nh', href: 'photographer.html' }
        ];
        var toolBaseHref = typeof opts.toolBaseHref === 'string' ? opts.toolBaseHref : '';
        var productsHref = escapeHtml(opts.productsHref || toolBaseHref + 'products.html');
        var toolItems = Array.isArray(opts.toolItems) && opts.toolItems.length ? opts.toolItems : [
            { labelKey: 'header.tool.chromeExtension', label: 'Chrome Extension', href: toolBaseHref + 'products.html?tab=chrome-extension' },
            { labelKey: 'header.tool.plugins', label: 'Plugins', href: toolBaseHref + 'products.html?tab=plugins' },
            { labelKey: 'header.tool.windowsApps', label: 'Windows Apps', href: toolBaseHref + 'products.html?tab=windows-apps' },
            { labelKey: 'header.tool.books', label: 'Books', href: toolBaseHref + 'products.html?tab=books' }
        ];
        var currentLanguage = window.sharedI18n && typeof window.sharedI18n.getLanguage === 'function'
            ? window.sharedI18n.getLanguage()
            : 'vi';

        function renderMenuHtml(items) {
            return items.map(function (item) {
                var label = escapeHtml(translate(item.labelKey, item.label || ''));
                if (item.href) {
                    return '<li><a href="' + escapeHtml(item.href) + '">' + label + '</a></li>';
                }
                return '<li>' + label + '</li>';
            }).join('');
        }

        var professionMenuHtml = renderMenuHtml(professionItems);
        var toolMenuHtml = renderMenuHtml(toolItems);
        var nextLanguage = currentLanguage === 'en' ? 'vi' : 'en';
        var nextLanguageCode = nextLanguage === 'en' ? 'EN' : 'VN';
        var nextLanguageFlagClass = nextLanguage === 'en' ? 'lang-flag--en' : 'lang-flag--vi';
        var languageSwitchHtml = '' +
            '<div class="lang-switch">' +
            '    <button class="lang-btn lang-btn--toggle" type="button" data-lang="' + nextLanguage + '" aria-label="' + escapeHtml(translate('header.languageAria', 'Switch language')) + '">' +
            '        <span class="lang-flag ' + nextLanguageFlagClass + '" aria-hidden="true"></span>' +
            '        <span class="lang-code">' + nextLanguageCode + '</span>' +
            '    </button>' +
            '</div>';
        var initialTheme = window.sharedTheme ? window.sharedTheme.get() : getPreferredTheme();
        var initialThemeIconHtml = getThemeIconMaskHtml(initialTheme, opts.assetBase);
        var initialTitle = initialTheme === 'dark'
            ? translate('header.themeToLight', 'Chuyển sang giao diện Sáng')
            : translate('header.themeToDark', 'Chuyển sang giao diện Tối');

        var themeSwitchHtml = '' +
            '<div class="theme-switch">' +
            '    <button class="theme-btn theme-btn--toggle" id="themeToggleBtn" type="button" aria-label="' + escapeHtml(initialTitle) + '" title="' + escapeHtml(initialTitle) + '">' +
            initialThemeIconHtml +
            '    </button>' +
            '</div>';

        var assetBase = typeof opts.assetBase === 'string' ? opts.assetBase : '';
        var rawLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 15.55" width="24" height="15.55"><polygon points="16.3 0 16.07 0 8.19 15.55 11.81 15.55 18 3.34 16.3 0"/><polygon points="24 .48 20.38 .48 15.41 10.28 18.08 15.55 21.7 15.55 19.03 10.28 24 .48"/><polygon points="11.61 6.9 8.11 0 7.88 0 0 15.55 3.61 15.55 7.87 7.14 8.12 7.14 9.8 10.46 11.61 6.9"/></svg>';
        var logoSvgMask = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:'
            ? 'data:image/svg+xml;utf8,' + encodeURIComponent(rawLogoSvg)
            : escapeHtml(assetBase + 'svg/logo-MAX.svg');

        root.innerHTML = '' +
            '<div class="header-shell">' +
            '    <div class="header content-wrap">' +
            '        <div class="header-left">' +
            themeSwitchHtml +
            '            <div class="menu-wrap">' +
            '                <button class="menu-btn" type="button">' + escapeHtml(translate('header.professions', 'Ngh\u1ec1 Nghi\u1ec7p')) + '</button>' +
            '                <ul class="menu-list">' + professionMenuHtml + '</ul>' +
            '            </div>' +
            '        </div>' +
            '        <a class="header-home" id="headerHomeLink" href="' + homeHref + '" aria-label="' + escapeHtml(translate('header.homeAria', 'Quay v\u1ec1 trang ch\u1ee7')) + '">' +
            '            <span class="header-logo icon-mask" style="mask-image: url(\'' + logoSvgMask + '\'); -webkit-mask-image: url(\'' + logoSvgMask + '\');"></span>' +
            '        </a>' +
            '        <div class="header-right">' +
            '            <div class="menu-wrap">' +
            '                <a class="menu-btn" href="' + productsHref + '">' + escapeHtml(translate('header.tools', 'S\u1ea3n Ph\u1ea9m')) + '</a>' +
            '                <ul class="menu-list">' + toolMenuHtml + '</ul>' +
            '            </div>' +
            languageSwitchHtml +
            '        </div>' +
            '    </div>' +
            '</div>';
    };
})();
