/* =====================================================================
   Site Loader — Lottie-based loading animation used everywhere on the site
   (page load, blog/project fetches, form sending) plus a full-screen
   "no internet" state. Falls back gracefully to the CSS spinner if the
   Lottie library or JSON assets fail to load.
   ===================================================================== */
(function () {
    'use strict';

    var LOADING_URL = 'assets/loading.json';
    var NO_INTERNET_URL = 'assets/no-internet.json';

    // Prefer the embedded animation data (js/loading-data.js) so nothing has to
    // be fetched over the network — this works on file://, localhost and the
    // live site identically. fetch() is only a last-resort fallback.
    var loadingData = window.LOADING_ANIMATION || null;
    var noInternetData = window.NO_INTERNET_ANIMATION || null;

    var loadingReady;
    if (loadingData) {
        loadingReady = Promise.resolve(loadingData);
    } else {
        loadingReady = fetch(LOADING_URL)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) { loadingData = d; return d; })
            .catch(function () { return null; });
    }

    function ensureNoInternet() {
        if (noInternetData) return Promise.resolve(noInternetData);
        return fetch(NO_INTERNET_URL)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) { noInternetData = d; return d; })
            .catch(function () { return null; });
    }

    function hasLottie() { return typeof window.lottie !== 'undefined'; }

    // Mount the loading animation inside an element. Returns the Lottie
    // instance (or null). Safe to call twice — it won't double-mount.
    function mount(el, opts) {
        if (!el || el._lottieMounted) return el && el._lottieInstance;
        if (!hasLottie() || !loadingData) return null;
        opts = opts || {};
        try {
            el.innerHTML = '';
            var anim = window.lottie.loadAnimation({
                container: el,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: loadingData
            });
            el._lottieMounted = true;
            el._lottieInstance = anim;
            el.classList.add('lottie-mounted');
            return anim;
        } catch (e) {
            return null;
        }
    }

    function unmount(el) {
        if (el && el._lottieInstance) {
            try { el._lottieInstance.destroy(); } catch (e) {}
            el._lottieInstance = null;
            el._lottieMounted = false;
        }
    }

    // Upgrade every existing .loading-spinner to the Lottie loader.
    function upgradeSpinners(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var spinners = scope.querySelectorAll('.loading-spinner:not(.lottie-mounted)');
        spinners.forEach(function (el) { mount(el); });
        // If the root itself is a spinner (MutationObserver added node)
        if (root && root.classList && root.classList.contains('loading-spinner')) {
            mount(root);
        }
    }

    // Watch the DOM so dynamically-injected loaders (blogs, projects, README,
    // modals, retries) also get the Lottie animation automatically.
    function observe() {
        if (!('MutationObserver' in window)) return;
        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                for (var i = 0; i < m.addedNodes.length; i++) {
                    var node = m.addedNodes[i];
                    if (node.nodeType === 1) upgradeSpinners(node);
                }
                for (var j = 0; j < m.removedNodes.length; j++) {
                    var rn = m.removedNodes[j];
                    if (rn.nodeType === 1) {
                        if (rn.classList && rn.classList.contains('lottie-mounted')) unmount(rn);
                        if (rn.querySelectorAll) rn.querySelectorAll('.lottie-mounted').forEach(unmount);
                    }
                }
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    /* ---------- Splash screen ---------- */
    function initSplash() {
        var container = document.getElementById('splashLottie');
        if (container) loadingReady.then(function () { mount(container); });
    }

    /* ---------- Contact-form button loader ---------- */
    // Replaces a button's content with a small inline Lottie + label, and
    // returns a restore() function to put the original content back.
    function mountButton(btn, label) {
        if (!btn) return function () {};
        var original = btn.innerHTML;
        btn.disabled = true;
        if (hasLottie() && loadingData) {
            btn.innerHTML = '<span class="btn-lottie"></span><span>' + (label || 'Sending...') + '</span>';
            mount(btn.querySelector('.btn-lottie'));
        } else {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (label || 'Sending...');
        }
        return function restore() {
            btn.disabled = false;
            btn.innerHTML = original;
        };
    }

    /* ---------- No-internet overlay ---------- */
    function buildOverlay() {
        var existing = document.getElementById('noInternetOverlay');
        if (existing) return existing;
        var overlay = document.createElement('div');
        overlay.id = 'noInternetOverlay';
        overlay.className = 'no-internet-overlay';
        // NOTE: no Font Awesome icons here — this screen must render with zero
        // network resources (icons are CDN-hosted and unavailable offline).
        overlay.innerHTML =
            '<div class="no-internet-content">' +
                '<div id="noInternetLottie" class="no-internet-lottie"></div>' +
                '<h3 class="no-internet-title">No Internet Connection</h3>' +
                '<p class="no-internet-text">Please check your connection. This page will refresh automatically once you are back online.</p>' +
                '<button type="button" class="btn btn-primary no-internet-retry" id="noInternetRetry">Retry</button>' +
            '</div>';
        document.body.appendChild(overlay);
        overlay.querySelector('#noInternetRetry').addEventListener('click', function () {
            if (navigator.onLine) hideNoInternet(); else location.reload();
        });
        return overlay;
    }

    function showNoInternet() {
        var overlay = buildOverlay();
        overlay.classList.add('visible');
        ensureNoInternet().then(function (data) {
            var c = document.getElementById('noInternetLottie');
            if (c && !c._lottieMounted && hasLottie() && data) {
                try {
                    window.lottie.loadAnimation({
                        container: c, renderer: 'svg', loop: true, autoplay: true, animationData: data
                    });
                    c._lottieMounted = true;
                } catch (e) {}
            }
        });
    }

    function hideNoInternet() {
        var overlay = document.getElementById('noInternetOverlay');
        if (overlay) overlay.classList.remove('visible');
    }

    function handleBackOnline() {
        var overlay = document.getElementById('noInternetOverlay');
        // If we showed the offline screen, reload so failed fetches (blogs,
        // projects, etc.) re-run — matching the "refresh automatically" copy.
        if (overlay && overlay.classList.contains('visible')) {
            location.reload();
        } else {
            hideNoInternet();
        }
    }

    function initConnectivity() {
        window.addEventListener('offline', showNoInternet);
        window.addEventListener('online', handleBackOnline);
        if (navigator && navigator.onLine === false) showNoInternet();
    }

    /* ---------- Public API ---------- */
    window.SiteLoader = {
        ready: loadingReady,
        mount: mount,
        upgradeSpinners: upgradeSpinners,
        mountButton: mountButton,
        showNoInternet: showNoInternet,
        hideNoInternet: hideNoInternet,
        isOffline: function () { return navigator && navigator.onLine === false; }
    };

    function start() {
        initSplash();
        loadingReady.then(function () { upgradeSpinners(document); });
        observe();
        initConnectivity();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
