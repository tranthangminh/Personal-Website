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
    const showcaseMainTitle = document.getElementById('showcaseMainTitle');
    const showcaseMainBadge = document.getElementById('showcaseMainBadge');
    const card1 = document.getElementById('showcaseCard1');
    const card2 = document.getElementById('showcaseCard2');

    if (!showcaseMain || !card1 || !card2) return;

    // Data definition for the 3 professions
    const professionsData = {
        actor: {
            id: 'actor',
            title: 'DIỄN VIÊN',
            badge: 'TỪ NĂM 2021',
            href: 'actor.html',
            images: [
                'assets/images/Actor/main-01.jpg',
                'assets/images/Actor/main-02.jpg',
                'assets/images/Actor/main-03.jpg',
                'assets/images/Actor/main-04.jpg',
                'assets/images/Actor/main-05.jpg',
                'assets/images/Actor/main-06.jpg',
                'assets/images/Actor/main-07.jpg',
                'assets/images/Actor/main-08.jpg'
            ],
            sideCover: 'assets/images/Actor/main-01.jpg',
            sideBadge: 'ACTOR · TỪ 2021'
        },
        artist: {
            id: 'artist',
            title: 'HỌA SĨ',
            badge: '2D/3D · TỪ NĂM 2017',
            href: 'artist.html',
            images: [
                'assets/images/2D/POSTER%203000x2100.jpg',
                'assets/images/2D/230716_PosterK22_ver1.jpg',
                'assets/images/2D/DoiNhuY.jpg',
                'assets/images/2D/PhamCongCucHoa.jpg',
                'assets/images/2D/PosterK18.jpg',
                'assets/images/2D/ThiHen.jpg',
                'assets/images/3D/marvels-spider-man-2-symbiote-nest-plant-sonic-bursts-1-1024x576.jpg',
                'assets/images/3D/Down_Right_Fierce_Pathfinder.jpg'
            ],
            sideCover: 'assets/images/2D/POSTER%203000x2100.jpg',
            sideBadge: '2D/3D · TỪ 2017'
        },
        photographer: {
            id: 'photographer',
            title: 'NHIẾP ẢNH',
            badge: 'PORTRAIT · TỪ NĂM 2023',
            href: 'photographer.html',
            images: [
                'assets/images/Photographer/MAX90056.jpg',
                'assets/images/Photographer/MAX90082_(2).jpg',
                'assets/images/Photographer/MAX90158.jpg',
                'assets/images/Photographer/MAX90197_(2).jpg',
                'assets/images/Photographer/MAX92880.jpg',
                'assets/images/Photographer/MAX94862.jpg',
                'assets/images/Photographer/492882309_9629082393805507_1623897313072216052_n.jpg'
            ],
            sideCover: 'assets/images/Photographer/MAX90056.jpg',
            sideBadge: 'PORTRAIT · TỪ 2023'
        }
    };

    let activeId = 'actor';
    let sideSlot1Id = 'artist';
    let sideSlot2Id = 'photographer';
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

    let currentStep = 0; // 0: Main, 1: Card 1, 2: Card 2

    function startSlideshow() {
        stopSlideshow();
        currentStep = 0;
        slideshowInterval = setInterval(function () {
            if (currentStep === 0) {
                // Ô 1 (Main spotlight 60%) đổi ảnh
                const nextMainImg = getNextRandomImage(activeId, 'main');
                activeMainLayer = switchCover(showcaseCoverA, showcaseCoverB, activeMainLayer, nextMainImg);
            } else if (currentStep === 1) {
                // Ô 2 (Card 1 Hàng trên) đổi ảnh sau 0.5s
                const nextC1Img = getNextRandomImage(sideSlot1Id, 'c1');
                const c1A = document.getElementById('showcaseCard1CoverA');
                const c1B = document.getElementById('showcaseCard1CoverB');
                activeC1Layer = switchCover(c1A, c1B, activeC1Layer, nextC1Img);
            } else if (currentStep === 2) {
                // Ô 3 (Card 2 Hàng dưới) đổi ảnh sau 0.5s
                const nextC2Img = getNextRandomImage(sideSlot2Id, 'c2');
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

    function renderShowcase() {
        const mainData = professionsData[activeId];
        showcaseMain.setAttribute('data-profession', mainData.id);
        showcaseMain.setAttribute('aria-label', 'Mở trang chi tiết ' + mainData.title);
        showcaseMainTitle.textContent = mainData.title;
        showcaseMainBadge.textContent = mainData.badge;

        // Immediately set initial covers
        const initialMainImg = getNextRandomImage(activeId, 'main');
        activeMainLayer = switchCover(showcaseCoverA, showcaseCoverB, activeMainLayer, initialMainImg);

        // Update Side Slot 1
        const s1Data = professionsData[sideSlot1Id];
        card1.setAttribute('data-profession', s1Data.id);
        card1.setAttribute('aria-label', 'Chuyển mục ' + s1Data.title + ' thành tiêu điểm');
        const c1Title = document.getElementById('showcaseCard1Title');
        const c1Badge = document.getElementById('showcaseCard1Badge');
        const c1A = document.getElementById('showcaseCard1CoverA');
        const c1B = document.getElementById('showcaseCard1CoverB');
        if (c1Title) c1Title.textContent = s1Data.title;
        if (c1Badge) c1Badge.textContent = s1Data.sideBadge;
        const initialC1Img = getNextRandomImage(sideSlot1Id, 'c1');
        activeC1Layer = switchCover(c1A, c1B, activeC1Layer, initialC1Img);

        // Update Side Slot 2
        const s2Data = professionsData[sideSlot2Id];
        card2.setAttribute('data-profession', s2Data.id);
        card2.setAttribute('aria-label', 'Chuyển mục ' + s2Data.title + ' thành tiêu điểm');
        const c2Title = document.getElementById('showcaseCard2Title');
        const c2Badge = document.getElementById('showcaseCard2Badge');
        const c2A = document.getElementById('showcaseCard2CoverA');
        const c2B = document.getElementById('showcaseCard2CoverB');
        if (c2Title) c2Title.textContent = s2Data.title;
        if (c2Badge) c2Badge.textContent = s2Data.sideBadge;
        const initialC2Img = getNextRandomImage(sideSlot2Id, 'c2');
        activeC2Layer = switchCover(c2A, c2B, activeC2Layer, initialC2Img);

        startSlideshow();
    }

    function swapToSpotlight(newProfId, slotNum) {
        if (newProfId === activeId) return;
        const oldActive = activeId;
        activeId = newProfId;
        if (slotNum === 1) {
            sideSlot1Id = oldActive;
        } else {
            sideSlot2Id = oldActive;
        }
        renderShowcase();
    }

    // Event listeners: CLICK ONLY (Hover removed as requested)
    card1.addEventListener('click', function (e) {
        e.preventDefault();
        swapToSpotlight(sideSlot1Id, 1);
    });
    card1.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            swapToSpotlight(sideSlot1Id, 1);
        }
    });

    card2.addEventListener('click', function (e) {
        e.preventDefault();
        swapToSpotlight(sideSlot2Id, 2);
    });
    card2.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            swapToSpotlight(sideSlot2Id, 2);
        }
    });

    // Main spotlight click / keyboard -> Navigate to target page
    showcaseMain.addEventListener('click', function () {
        const dest = professionsData[activeId].href;
        if (dest) window.location.href = dest;
    });
    showcaseMain.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const dest = professionsData[activeId].href;
            if (dest) window.location.href = dest;
        }
    });

    // Start initial showcase
    renderShowcase();
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
