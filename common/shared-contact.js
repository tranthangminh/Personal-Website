(function () {
    'use strict';

    var escapeHtml = (window.sharedUtils && window.sharedUtils.escapeHtml) || function (str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

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
        var sectionId = opts.id ? ' id="' + escapeHtml(opts.id) + '"' : ' id="contactSection"';
        var rv = opts.includeReveal === false ? '' : ' reveal-up';
        var assetBase = opts.assetBase ? String(opts.assetBase) : '';

        var connectTitle = escapeHtml(translate('contact.connectTitle', 'Liên Hệ'));
        var quoteText = escapeHtml(translate('contact.quote', 'Để lại giá trị cho cuộc sống'));
        var callLabel = escapeHtml(translate('contact.callBtn', 'Gọi'));
        var emailLabel = escapeHtml(translate('contact.emailBtn', 'Email'));
        var copyright = escapeHtml(translate('contact.copyright', '© 2026 Trần Thắng Minh. All rights reserved.'));

        var facebookSvg = assetBase + 'svg/facebook.svg';
        var instagramSvg = assetBase + 'svg/instagram.svg';
        var tiktokSvg = assetBase + 'svg/tiktok.svg';
        var youtubeSvg = assetBase + 'svg/youtube.svg';
        var redditSvg = assetBase + 'svg/reddit.svg';
        var discordSvg = assetBase + 'svg/discord.svg';
        var githubSvg = assetBase + 'svg/github.svg';
        var phoneSvg = assetBase + 'svg/phone.svg';
        var emailSvg = assetBase + 'svg/email.svg';

        var moreSocialLabel = escapeHtml(translate('contact.moreSocial', 'Xem thêm mạng xã hội'));

        var mainSocials = [
            { name: 'Facebook', url: 'https://www.facebook.com/maxiechen/', svg: facebookSvg },
            { name: 'Instagram', url: 'https://www.instagram.com/maxiechen/', svg: instagramSvg },
            { name: 'TikTok', url: 'https://www.tiktok.com/@max9.tran', svg: tiktokSvg },
            { name: 'YouTube', url: 'https://www.youtube.com/@MaxTran96', svg: youtubeSvg }
        ];

        var moreSocials = [
            { name: 'Reddit', url: 'https://www.reddit.com/user/maxiechen96/', svg: redditSvg },
            { name: 'Discord', url: 'https://discord.com/users/@maxiechen', svg: discordSvg },
            { name: 'GitHub', url: 'https://github.com/tranthangminh', svg: githubSvg }
        ];

        var mainSocialsHtml = mainSocials.map(function (s) {
            return '<a class="contact-social-btn" href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHtml(s.name) + '">' +
                '<span class="contact-social-icon" style="-webkit-mask-image: url(\'' + s.svg + '\'); mask-image: url(\'' + s.svg + '\');"></span>' +
                '</a>';
        }).join('');

        var moreSocialsHtml = moreSocials.map(function (s) {
            return '<a class="contact-social-btn" href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHtml(s.name) + '">' +
                '<span class="contact-social-icon" style="-webkit-mask-image: url(\'' + s.svg + '\'); mask-image: url(\'' + s.svg + '\');"></span>' +
                '</a>';
        }).join('');

        root.innerHTML = '' +
            '<section class="' + sectionClass + '"' + sectionId + '>' +
            '    <div class="content-wrap">' +
            '        <div class="contact-bar' + rv + '">' +
            '            <!-- Left 30%: Social Media -->' +
            '            <div class="contact-col contact-col-social">' +
            '                <span class="contact-connect-title">' + connectTitle + '</span>' +
            '                <div class="contact-social-row">' +
                                 mainSocialsHtml +
            '                    <details class="social-more">' +
            '                        <summary class="social-more-toggle" aria-label="' + moreSocialLabel + '"></summary>' +
            '                        <div class="social-more-list">' +
                                         moreSocialsHtml +
            '                        </div>' +
            '                    </details>' +
            '                </div>' +
            '            </div>' +
            '            <!-- Center 40%: Quote -->' +
            '            <div class="contact-col contact-col-quote">' +
            '                <div class="contact-quote-wrap">' +
            '                    <span class="contact-quote-mark" aria-hidden="true">&ldquo;</span>' +
            '                    <span class="contact-quote-text">' + quoteText + '</span>' +
            '                    <span class="contact-quote-mark" aria-hidden="true">&rdquo;</span>' +
            '                </div>' +
            '            </div>' +
            '            <!-- Right 30%: Action Buttons (Call & Email) -->' +
            '            <div class="contact-col contact-col-actions">' +
            '                <a class="contact-action-btn contact-btn-call" href="tel:+84363219989" aria-label="Gọi điện thoại">' +
            '                    <span class="contact-btn-icon" style="-webkit-mask-image: url(\'' + phoneSvg + '\'); mask-image: url(\'' + phoneSvg + '\');" aria-hidden="true"></span>' +
            '                    <span>' + callLabel + '</span>' +
            '                </a>' +
            '                <a class="contact-action-btn contact-btn-email" href="mailto:maxiechen96@gmail.com" aria-label="Gửi Email">' +
            '                    <span class="contact-btn-icon" style="-webkit-mask-image: url(\'' + emailSvg + '\'); mask-image: url(\'' + emailSvg + '\');" aria-hidden="true"></span>' +
            '                    <span>' + emailLabel + '</span>' +
            '                </a>' +
            '            </div>' +
            '        </div>' +
            '        <div class="contact-copyright-row">' +
            '            <span>' + copyright + '</span>' +
            '        </div>' +
            '    </div>' +
            '</section>';

        var socialMore = root.querySelector('.social-more');
        if (socialMore) {
            document.addEventListener('click', function (e) {
                if (!socialMore.contains(e.target) && socialMore.hasAttribute('open')) {
                    socialMore.removeAttribute('open');
                }
            });
        }
    };
})();
