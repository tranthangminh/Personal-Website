(function () {
    'use strict';

    var escapeHtml = window.sharedUtils.escapeHtml;
    function translate(key, fallback) {
        if (window.sharedI18n && typeof window.sharedI18n.t === 'function') {
            return window.sharedI18n.t(key, fallback);
        }

        return fallback != null ? fallback : key;
    }

    window.renderSharedContact = function (rootId, options) {
        var opts = options || {};
        var root = document.getElementById(rootId);
        if (!root) {
            return;
        }

        var sectionClass = escapeHtml(opts.pageClass || 'page contact-page');
        var sectionId = opts.id ? ' id="' + escapeHtml(opts.id) + '"' : '';
        var rv = opts.includeReveal === false ? '' : ' reveal-up';
        var assetBase = opts.assetBase ? String(opts.assetBase) : '';
        var linkBase = opts.linkBase != null ? String(opts.linkBase) : assetBase;
        var showExploreLinks = opts.showExploreLinks !== false;
        var signatureSrc = escapeHtml(assetBase + 'images/Signature.png');
        var title = escapeHtml(translate('contact.title', 'LIÊN HỆ'));
        var intro = escapeHtml(translate('contact.intro', 'Sẵn sàng hợp tác cho các dự án diễn xuất, thiết kế 2D/3D, nhiếp ảnh và phát triển công cụ hỗ trợ quy trình làm việc.'));
        var directTitle = escapeHtml(translate('contact.directTitle', 'Liên Hệ Trực Tiếp'));
        var socialTitle = escapeHtml(translate('contact.socialTitle', 'Mạng Xã Hội'));
        var exploreTitle = escapeHtml(translate('contact.exploreTitle', 'Lĩnh Vực Hoạt Động Khác'));
        var callRevealLabel = escapeHtml(translate('contact.callReveal', 'Gọi ngay'));
        var callLabel = escapeHtml(translate('contact.call', 'Gọi: 036 321 9989'));
        var emailLabel = escapeHtml(translate('contact.email', 'Email: maxiechen96@gmail.com'));
        var moreSocialLabel = escapeHtml(translate('contact.moreSocial', 'Xem thêm mạng xã hội'));
        var signatureAlt = escapeHtml(translate('contact.signatureAlt', 'Chữ ký'));
        var copyright = escapeHtml(translate('contact.copyright', 'Bản quyền 2026 Trần Thắng Minh. Bảo lưu mọi quyền.'));
        var exploreItems = [
            {
                label: escapeHtml(translate('header.profession.actor', 'Diễn Viên')),
                href: escapeHtml(linkBase + 'actor/')
            },
            {
                label: escapeHtml(translate('header.profession.photographer', 'Nhiếp Ảnh')),
                href: escapeHtml(linkBase + 'photographer/')
            },
            {
                label: escapeHtml(translate('header.profession.artist', 'Họa Sĩ')),
                href: escapeHtml(linkBase + 'artist/')
            },
            {
                label: escapeHtml(translate('header.tool.photoshop', 'Tool Photoshop')),
                href: escapeHtml(linkBase + 'tools/?tab=photoshop')
            },
            {
                label: escapeHtml(translate('header.tool.maya', 'Tool Maya')),
                href: escapeHtml(linkBase + 'tools/?tab=maya')
            },
            {
                label: escapeHtml(translate('header.tool.cheatEngine', 'Tool Cheat Engine')),
                href: escapeHtml(linkBase + 'tools/?tab=cheat-engine')
            }
        ];
        var exploreLinksHtml = exploreItems.map(function (item) {
            return '<a class="contact-explore-link" href="' + item.href + '">' + item.label + '</a>';
        }).join('');
        var exploreSectionHtml = showExploreLinks
            ? '' +
                '<div class="contact-explore-shell content-wrap' + rv + '">' +
                '    <div class="contact-explore">' +
                '        <h3 class="contact-explore-title">' + exploreTitle + '</h3>' +
                '        <div class="contact-explore-links">' + exploreLinksHtml + '</div>' +
                '    </div>' +
                '</div>'
            : '';

        root.innerHTML = '' +
            '<section class="' + sectionClass + '"' + sectionId + '>' +
            exploreSectionHtml +
            '    <div class="contact-wrap">' +
            '        <div class="contact-top' + rv + '">' +
            '            <h2 class="contact-title">' + title + '</h2>' +
            '            <p class="contact-intro">' + intro + '</p>' +
            '        </div>' +
            '        <div class="contact-grid">' +
            '            <aside class="contact-side' + rv + '">' +
            '                <div class="contact-card">' +
            '                    <h3 class="contact-card-title">' + directTitle + '</h3>' +
            '                    <div class="contact-actions">' +
            '                        <button class="call-btn call-btn-toggle" id="contactCallToggle" type="button" data-phone="+84363219989" data-phone-display="' + callLabel + '">' + callRevealLabel + '</button>' +
            '                        <a class="mail-btn" href="mailto:maxiechen96@gmail.com">' + emailLabel + '</a>' +
            '                    </div>' +
            '                </div>' +
            '                <div class="contact-card">' +
            '                    <h3 class="contact-card-title">' + socialTitle + '</h3>' +
            '                    <div class="contact-social">' +
            '                        <a class="social-link" href="https://www.facebook.com/maxiechen/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/facebook.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/facebook.svg\');"></span></a>' +
            '                        <a class="social-link" href="https://www.instagram.com/maxiechen/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/instagram.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/instagram.svg\');"></span></a>' +
            '                        <a class="social-link" href="https://www.tiktok.com/@max9.tran" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/tiktok.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/tiktok.svg\');"></span></a>' +
            '                        <a class="social-link" href="https://www.youtube.com/@MaxTran96" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/youtube.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/youtube.svg\');"></span></a>' +
            '                        <details class="social-more">' +
            '                            <summary class="social-more-toggle" aria-label="' + moreSocialLabel + '"></summary>' +
            '                            <div class="social-more-list">' +
            '                                <a class="social-link" href="https://www.reddit.com/user/maxiechen96/" target="_blank" rel="noopener noreferrer" aria-label="Reddit"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/reddit.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/reddit.svg\');"></span></a>' +
            '                                <a class="social-link" href="https://discord.com/users/@maxiechen" target="_blank" rel="noopener noreferrer" aria-label="Discord"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/discord.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/discord.svg\');"></span></a>' +
            '                                <a class="social-link" href="https://github.com/tranthangminh" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><span class="social-icon icon-mask" style="mask-image: url(\'' + assetBase + 'svg/github.svg\'); -webkit-mask-image: url(\'' + assetBase + 'svg/github.svg\');"></span></a>' +
            '                            </div>' +
            '                        </details>' +
            '                    </div>' +
            '                </div>' +
            '                <div class="contact-signature"><img class="signature-img" src="' + signatureSrc + '" alt="' + signatureAlt + '"></div>' +
            '                <div class="contact-meta">' +
            '                    <div>' + copyright + '</div>' +
            '                </div>' +
            '            </aside>' +
            '        </div>' +
            '    </div>' +
            '</section>';

        var callToggle = root.querySelector('#contactCallToggle');
        if (callToggle) {
            callToggle.addEventListener('click', function () {
                var phone = callToggle.getAttribute('data-phone') || '';
                var phoneDisplay = callToggle.getAttribute('data-phone-display') || '';

                if (!phone) {
                    return;
                }

                callToggle.classList.add('is-revealed');
                callToggle.textContent = phoneDisplay;
                window.setTimeout(function () {
                    window.location.href = 'tel:' + phone;
                }, 0);
            });
        }
    };
})();
