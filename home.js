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

// ==========================================================================
// PROFESSIONS SHOWCASE (ASYMMETRICAL 60/40 SPOTLIGHT SYSTEM)
// ==========================================================================
(function initProfessionsShowcase() {
    const showcaseMain = document.getElementById('showcaseMain');
    const showcaseCoverA = document.getElementById('showcaseCoverA');
    const showcaseCoverB = document.getElementById('showcaseCoverB');
    const card1 = document.getElementById('showcaseCard1');
    const card2 = document.getElementById('showcaseCard2');

    if (!showcaseMain || !card1 || !card2) return;

    // Data definition for the 3 professions
    const professionsData = {
        actor: {
            id: 'actor',
            title: 'DIỄN VIÊN',
            badge: 'TỪ NĂM 2021',
            href: 'jobs/actor.html',
            images: [
                'jobs/actor/main-01.jpg',
                'jobs/actor/main-02.jpg',
                'jobs/actor/main-03.jpg',
                'jobs/actor/main-04.jpg',
                'jobs/actor/main-05.jpg',
                'jobs/actor/main-06.jpg',
                'jobs/actor/main-07.jpg',
                'jobs/actor/main-08.jpg'
            ],
            sideCover: 'jobs/actor/main-01.jpg',
            sideBadge: 'TỪ NĂM 2021'
        },
        artist: {
            id: 'artist',
            title: 'HỌA SĨ 2D/3D',
            badge: 'TỪ NĂM 2017',
            href: 'jobs/artist.html',
            images: [
                'jobs/artist-2D/POSTER%203000x2100.jpg',
                'jobs/artist-2D/230716_PosterK22_ver1.jpg',
                'jobs/artist-2D/DoiNhuY.jpg',
                'jobs/artist-2D/PhamCongCucHoa.jpg',
                'jobs/artist-2D/PosterK18.jpg',
                'jobs/artist-2D/ThiHen.jpg',
                'jobs/artist-3D/marvels-spider-man-2-symbiote-nest-plant-sonic-bursts-1-1024x576.jpg',
                'jobs/artist-3D/Down_Right_Fierce_Pathfinder.jpg'
            ],
            sideCover: 'jobs/artist-2D/POSTER%203000x2100.jpg',
            sideBadge: 'TỪ NĂM 2017'
        },
        photographer: {
            id: 'photographer',
            title: 'NHIẾP ẢNH',
            badge: 'TỪ NĂM 2023',
            href: 'jobs/photographer.html',
            images: [
                'jobs/photographer/MAX90056.jpg',
                'jobs/photographer/MAX90082_(2).jpg',
                'jobs/photographer/MAX90158.jpg',
                'jobs/photographer/MAX90197_(2).jpg',
                'jobs/photographer/MAX92880.jpg',
                'jobs/photographer/MAX94862.jpg',
                'jobs/photographer/492882309_9629082393805507_1623897313072216052_n.jpg'
            ],
            sideCover: 'jobs/photographer/MAX90056.jpg',
            sideBadge: 'TỪ NĂM 2023'
        }
    };

    let activeMainLayer = 'A';
    let activeC1Layer = 'A';
    let activeC2Layer = 'A';
    let mainImgIndex = 0;
    let c1ImgIndex = 0;
    let c2ImgIndex = 0;
    let slideshowInterval = null;

    function getNextRandomImage(profId, slotType) {
        const pool = professionsData[profId] ? professionsData[profId].images : null;
        if (!pool || !pool.length) return '';
        if (pool.length === 1) return pool[0];
        const prevIdx = slotType === 'main' ? mainImgIndex : (slotType === 'c1' ? c1ImgIndex : c2ImgIndex);
        let nextIdx = 0;
        do {
            nextIdx = Math.floor(Math.random() * pool.length);
        } while (nextIdx === prevIdx && pool.length > 1);

        if (slotType === 'main') mainImgIndex = nextIdx;
        else if (slotType === 'c1') c1ImgIndex = nextIdx;
        else c2ImgIndex = nextIdx;

        return pool[nextIdx];
    }

    function switchCover(layerA, layerB, activeLayerName, imgSrc) {
        if (!layerA || !layerB || !imgSrc) return activeLayerName;
        const targetLayer = activeLayerName === 'A' ? layerB : layerA;
        const currentLayer = activeLayerName === 'A' ? layerA : layerB;

        targetLayer.style.backgroundImage = 'url("' + imgSrc + '")';
        targetLayer.classList.add('is-active');
        currentLayer.classList.remove('is-active');
        return activeLayerName === 'A' ? 'B' : 'A';
    }

    let currentStep = 0; // 0: Main (Diễn viên), 1: Card 1 (Họa sĩ), 2: Card 2 (Nhiếp ảnh)

    function startSlideshow() {
        stopSlideshow();
        currentStep = 0;
        slideshowInterval = setInterval(function () {
            if (currentStep === 0) {
                // Diễn viên
                const nextMainImg = getNextRandomImage('actor', 'main');
                activeMainLayer = switchCover(showcaseCoverA, showcaseCoverB, activeMainLayer, nextMainImg);
            } else if (currentStep === 1) {
                // Họa sĩ
                const nextC1Img = getNextRandomImage('artist', 'c1');
                const c1A = document.getElementById('showcaseCard1CoverA');
                const c1B = document.getElementById('showcaseCard1CoverB');
                activeC1Layer = switchCover(c1A, c1B, activeC1Layer, nextC1Img);
            } else if (currentStep === 2) {
                // Nhiếp ảnh
                const nextC2Img = getNextRandomImage('photographer', 'c2');
                const c2A = document.getElementById('showcaseCard2CoverA');
                const c2B = document.getElementById('showcaseCard2CoverB');
                activeC2Layer = switchCover(c2A, c2B, activeC2Layer, nextC2Img);
            }
            // Chu kỳ xoay vòng 0 -> 1 -> 2 -> 0... (mỗi ô đổi 1.5s/lần)
            currentStep = (currentStep + 1) % 3;
        }, 500);
    }

    function stopSlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
        }
    }

    function initShowcase() {
        // Khởi tạo ảnh ngẫu nhiên ban đầu cho cả 3 mục
        const initialMainImg = getNextRandomImage('actor', 'main');
        activeMainLayer = switchCover(showcaseCoverA, showcaseCoverB, activeMainLayer, initialMainImg);

        const initialC1Img = getNextRandomImage('artist', 'c1');
        const c1A = document.getElementById('showcaseCard1CoverA');
        const c1B = document.getElementById('showcaseCard1CoverB');
        activeC1Layer = switchCover(c1A, c1B, activeC1Layer, initialC1Img);

        const initialC2Img = getNextRandomImage('photographer', 'c2');
        const c2A = document.getElementById('showcaseCard2CoverA');
        const c2B = document.getElementById('showcaseCard2CoverB');
        activeC2Layer = switchCover(c2A, c2B, activeC2Layer, initialC2Img);

        startSlideshow();
    }

    // Khởi động luân chuyển ảnh showcase
    initShowcase();
})();

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
