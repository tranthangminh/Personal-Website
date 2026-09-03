'use strict';

if (typeof initSharedPage === 'function') {
    initSharedPage({
        titleKey: 'meta.home.title',
        header: {
            rootId: 'sharedHeaderRoot',
            options: { homeHref: 'index.html' }
        },
        welcome: {
            rootId: 'sharedWelcomeRoot',
            options: {
                variant: 'home',
                titleKey: 'welcome.home.title'
            }
        },
        contact: {
            rootId: 'sharedContactRoot',
            options: {
                pageClass: 'page contact-page',
                id: 'contactSection',
                includeReveal: true,
                showExploreLinks: false
            }
        },
        bookNow: {
            rootId: 'sharedBookNowRoot',
            options: { id: 'bookNowButton' }
        },
        lightbox: {
            rootId: 'sharedLightboxRoot'
        },
        headerMenus: {},
        welcomeBehavior: {
            showFrames: 1,
            hideAfter: 1000
        },
        lightboxInit: {
            triggerSelector: '.actor-item img',
            fallbackAltKey: 'lightbox.fallbackAlt',
            fallbackAlt: 'Ảnh phóng to'
        },
        momentum: {
            selector: '.actor-grid'
        },
        bookNowBehavior: {
            buttonId: 'bookNowButton',
            hideWhenVisible: 'contactSection',
            visibilityThreshold: 0.45
        }
    });
}

// Actor Video Carousel
const aboutActorVideoLink = document.getElementById('aboutActorVideoLink');
const aboutActorVideoThumb = document.getElementById('aboutActorVideoThumb');
const aboutActorVideoPrev = document.getElementById('aboutActorVideoPrev');
const aboutActorVideoNext = document.getElementById('aboutActorVideoNext');
const aboutActorVideoTitle = document.getElementById('aboutActorVideoTitle');
let aboutActorVideoRenderToken = 0;

const aboutActorVideos = [
    { id: 'S-YVjeYC4T8', title: 'Trộm Vía', embeddable: false },
    { id: '9WZ0-d3x1QU', title: 'Sư phụ - NPC game logic', embeddable: false },
    { id: 'r7RW-Ppiqv8', title: 'Clip nổi bật', embeddable: false }
];
let aboutActorVideoIndex = 0;
let isVideoPlayingInline = false;
let activeVideoIframe = null;

function stopInlineVideo() {
    if (activeVideoIframe) {
        if (activeVideoIframe.parentNode) {
            activeVideoIframe.parentNode.removeChild(activeVideoIframe);
        }
        activeVideoIframe = null;
    }
    isVideoPlayingInline = false;
}

function playInlineVideo(videoId) {
    stopInlineVideo();

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
    iframe.style.position = 'absolute';
    iframe.style.inset = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '5';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');

    aboutActorVideoLink.appendChild(iframe);
    activeVideoIframe = iframe;
    isVideoPlayingInline = true;
}

function fetchAboutActorVideoTitle(video) {
    const watchUrl = 'https://www.youtube.com/watch?v=' + video.id;
    const oembedUrl = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(watchUrl) + '&format=json';

    return fetch(oembedUrl)
    .then(function (response) {
        if (!response.ok) {
            throw new Error('oEmbed request failed');
        }
        return response.json();
    })
    .then(function (data) {
        if (data && data.title) {
            video.title = data.title;
        }
    })
    .catch(function () {
        /* Keep fallback title if oEmbed is blocked */
    });
}

function renderAboutActorVideo() {
    if (!aboutActorVideoLink || !aboutActorVideoThumb) {
        return;
    }

    stopInlineVideo();

    aboutActorVideoRenderToken += 1;
    const currentToken = aboutActorVideoRenderToken;
    const currentVideo = aboutActorVideos[aboutActorVideoIndex];
    const href = 'https://www.youtube.com/watch?v=' + currentVideo.id;
    const thumb = 'https://img.youtube.com/vi/' + currentVideo.id + '/hqdefault.jpg';
    const thumbAlt = 'Ảnh xem trước video diễn viên số ' + (aboutActorVideoIndex + 1);

    aboutActorVideoLink.href = href;
    if (aboutActorVideoTitle) {
        aboutActorVideoTitle.classList.add('is-switching');
        aboutActorVideoTitle.textContent = currentVideo.title;
    }

    aboutActorVideoThumb.classList.add('is-switching');

    const preloadImage = new Image();
    preloadImage.onload = function () {
        if (currentToken !== aboutActorVideoRenderToken) {
            return;
        }
        aboutActorVideoThumb.src = thumb;
        aboutActorVideoThumb.alt = thumbAlt;
        requestAnimationFrame(function () {
            aboutActorVideoThumb.classList.remove('is-switching');
            if (aboutActorVideoTitle) {
                aboutActorVideoTitle.classList.remove('is-switching');
            }
        });
    };
    preloadImage.onerror = function () {
        if (currentToken !== aboutActorVideoRenderToken) {
            return;
        }
        aboutActorVideoThumb.src = thumb;
        aboutActorVideoThumb.alt = thumbAlt;
        aboutActorVideoThumb.classList.remove('is-switching');
        if (aboutActorVideoTitle) {
            aboutActorVideoTitle.classList.remove('is-switching');
        }
    };
    preloadImage.src = thumb;
}

if (aboutActorVideoLink && aboutActorVideoThumb) {
    renderAboutActorVideo();

    Promise.all(aboutActorVideos.map(fetchAboutActorVideoTitle))
    .then(function () {
        renderAboutActorVideo();
    })
    .catch(function () {
        /* Ignore and keep fallback titles */
    });

    aboutActorVideoLink.addEventListener('click', function (event) {
        const currentVideo = aboutActorVideos[aboutActorVideoIndex];
        if (currentVideo.embeddable !== false) {
            event.preventDefault();
            if (!isVideoPlayingInline) {
                playInlineVideo(currentVideo.id);
            }
        }
    });

    if (aboutActorVideoPrev) {
        aboutActorVideoPrev.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            aboutActorVideoIndex = (aboutActorVideoIndex - 1 + aboutActorVideos.length) % aboutActorVideos.length;
            renderAboutActorVideo();
        });
    }

    if (aboutActorVideoNext) {
        aboutActorVideoNext.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            aboutActorVideoIndex = (aboutActorVideoIndex + 1) % aboutActorVideos.length;
            renderAboutActorVideo();
        });
    }
}

// Scroll Reveal Animations
const revealElements = Array.from(document.querySelectorAll('.reveal-up'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    revealElements.forEach(function (el) {
        el.classList.add('is-visible');
    });
} else if (revealElements.length) {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (element) {
        revealObserver.observe(element);
    });
}
