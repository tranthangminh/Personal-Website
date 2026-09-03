'use strict';

if (typeof initSharedPage === 'function') {
    initSharedPage({
        titleKey: 'meta.products.title',
        header: {
            rootId: 'sharedHeaderRoot',
            options: {
                homeHref: 'index.html',
                assetBase: '',
                productBaseHref: 'products.html',
                professionBaseHref: 'jobs/'
            }
        },
        contact: {
            rootId: 'sharedContactRoot',
            options: {
                pageClass: 'contact-page',
                id: 'contactSection',
                includeReveal: false,
                assetBase: ''
            }
        },
        bookNow: {
            rootId: 'sharedBookNowRoot',
            options: { id: 'bookNowButton' }
        },
        headerMenus: {},
        bookNowBehavior: {
            buttonId: 'bookNowButton',
            hideWhenVisible: 'contactSection',
            visibilityThreshold: 0.45
        }
    });
}

function initProductsTabs() {
    var switchButtons = Array.prototype.slice.call(document.querySelectorAll('.products-switch-btn[data-product-tab]'));
    var categorySections = Array.prototype.slice.call(document.querySelectorAll('.products-category-section[data-product-section]'));

    if (!switchButtons.length || !categorySections.length) {
        return;
    }

    function setActiveTab(targetTab, updateUrl) {
        var validTab = targetTab || 'all';

        switchButtons.forEach(function (btn) {
            var btnTab = btn.getAttribute('data-product-tab');
            var isActive = btnTab === validTab;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        categorySections.forEach(function (section) {
            var sectionCategory = section.getAttribute('data-product-section');
            var shouldShow = validTab === 'all' || sectionCategory === validTab;
            section.classList.toggle('is-hidden', !shouldShow);
        });

        if (updateUrl) {
            try {
                var url = new URL(window.location.href);
                if (validTab === 'all') {
                    url.searchParams.delete('tab');
                } else {
                    url.searchParams.set('tab', validTab);
                }
                window.history.replaceState({}, '', url.toString());
            } catch (error) {}
        }
    }

    switchButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tab = btn.getAttribute('data-product-tab');
            setActiveTab(tab, true);
        });
    });

    // Initialize from URL search params or hash
    var initialTab = 'all';
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var tabParam = urlParams.get('tab');
        if (tabParam) {
            initialTab = tabParam.toLowerCase();
        } else if (window.location.hash) {
            initialTab = window.location.hash.replace('#', '').toLowerCase();
        }
    } catch (error) {}

    var hasMatchingTab = switchButtons.some(function (btn) {
        return btn.getAttribute('data-product-tab') === initialTab;
    });

    setActiveTab(hasMatchingTab ? initialTab : 'all', false);
}

function initProductDownloadCounters() {
    var downloadButtons = Array.prototype.slice.call(document.querySelectorAll('.product-download-btn[data-product-id]'));
    if (!downloadButtons.length) return;

    var API_BASE = 'https://countapi.mileshilliard.com/api/v1';

    function getStorageKey(id) {
        return 'tranthangminh_dl_count_' + id;
    }

    function getApiKey(id) {
        return 'tranthangminh_dl_' + id;
    }

    function updateCountUI(countEl, val) {
        if (!countEl) return;
        var num = parseInt(val, 10);
        if (!isNaN(num) && num >= 0) {
            countEl.textContent = String(num);
        }
    }

    downloadButtons.forEach(function (btn) {
        var productId = btn.getAttribute('data-product-id');
        var downloadUrl = btn.getAttribute('data-download-url');
        var downloadName = btn.getAttribute('data-download-name');
        var isDirect = btn.getAttribute('data-direct-download') === 'true';
        var countEl = btn.querySelector('.product-download-count');

        if (!productId || !countEl) return;

        // 1. Read cached count from localStorage immediately
        try {
            var cached = localStorage.getItem(getStorageKey(productId));
            if (cached !== null) {
                updateCountUI(countEl, cached);
            }
        } catch (e) {}

        // 2. Fetch latest global count from API
        var apiKey = getApiKey(productId);
        if (typeof fetch === 'function') {
            fetch(API_BASE + '/get/' + encodeURIComponent(apiKey))
                .then(function (res) {
                    if (!res.ok) return null;
                    return res.json();
                })
                .then(function (data) {
                    if (data && typeof data.value === 'number') {
                        updateCountUI(countEl, data.value);
                        try {
                            localStorage.setItem(getStorageKey(productId), String(data.value));
                        } catch (e) {}
                    }
                })
                .catch(function () {});
        }

        // 3. Handle Download Action
        function executeDownload(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // A. Optimistically increment count on UI
            var currentVal = parseInt(countEl.textContent, 10) || 0;
            var nextVal = currentVal + 1;
            updateCountUI(countEl, nextVal);
            try {
                localStorage.setItem(getStorageKey(productId), String(nextVal));
            } catch (err) {}

            // B. Send hit to API in background to persist globally
            if (typeof fetch === 'function') {
                fetch(API_BASE + '/hit/' + encodeURIComponent(apiKey))
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data && typeof data.value === 'number') {
                            updateCountUI(countEl, data.value);
                            try {
                                localStorage.setItem(getStorageKey(productId), String(data.value));
                            } catch (err) {}
                        }
                    })
                    .catch(function () {});
            }

            // C. Trigger download or open store page
            if (downloadUrl) {
                if (isDirect) {
                    var a = document.createElement('a');
                    a.href = downloadUrl;
                    if (downloadName) {
                        a.download = downloadName;
                    }
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        if (a.parentNode) {
                            a.parentNode.removeChild(a);
                        }
                    }, 200);
                } else {
                    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                }
            }
        }

        btn.addEventListener('click', executeDownload);
        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                executeDownload(e);
            }
        });
    });
}

function initProducts() {
    initProductsTabs();
    initProductDownloadCounters();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProducts);
} else {
    initProducts();
}
