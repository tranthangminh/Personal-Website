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

        var connectTitle = escapeHtml(translate('contact.connectTitle', "LET'S CONNECT"));
        var quoteText = escapeHtml(translate('contact.quote', 'Để lại giá trị cho cuộc sống'));
        var callLabel = escapeHtml(translate('contact.callBtn', 'Gọi'));
        var emailLabel = escapeHtml(translate('contact.emailBtn', 'Email'));
        var copyright = escapeHtml(translate('contact.copyright', '© 2026 Trần Thắng Minh. All rights reserved.'));

        var linkedinSvg = assetBase + 'svg/linkedin.svg';
        var behanceSvg = assetBase + 'svg/behance.svg';
        var dribbbleSvg = assetBase + 'svg/dribbble.svg';
        var instagramSvg = assetBase + 'svg/instagram.svg';
        var phoneSvg = assetBase + 'svg/phone.svg';
        var emailSvg = assetBase + 'svg/email.svg';

        root.innerHTML = '' +
            '<section class="' + sectionClass + '"' + sectionId + '>' +
            '    <div class="content-wrap">' +
            '        <div class="contact-bar' + rv + '">' +
            '            <!-- Left 30%: Social Media -->' +
            '            <div class="contact-col contact-col-social">' +
            '                <span class="contact-connect-title">' + connectTitle + '</span>' +
            '                <div class="contact-social-row">' +
            '                    <a class="contact-social-btn" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">' +
            '                        <span class="contact-social-icon" style="-webkit-mask-image: url(\'' + linkedinSvg + '\'); mask-image: url(\'' + linkedinSvg + '\');"></span>' +
            '                    </a>' +
            '                    <a class="contact-social-btn" href="https://www.behance.net/" target="_blank" rel="noopener noreferrer" aria-label="Behance">' +
            '                        <span class="contact-social-icon" style="-webkit-mask-image: url(\'' + behanceSvg + '\'); mask-image: url(\'' + behanceSvg + '\');"></span>' +
            '                    </a>' +
            '                    <a class="contact-social-btn" href="https://dribbble.com/" target="_blank" rel="noopener noreferrer" aria-label="Dribbble">' +
            '                        <span class="contact-social-icon" style="-webkit-mask-image: url(\'' + dribbbleSvg + '\'); mask-image: url(\'' + dribbbleSvg + '\');"></span>' +
            '                    </a>' +
            '                    <a class="contact-social-btn" href="https://www.instagram.com/maxiechen/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' +
            '                        <span class="contact-social-icon" style="-webkit-mask-image: url(\'' + instagramSvg + '\'); mask-image: url(\'' + instagramSvg + '\');"></span>' +
            '                    </a>' +
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
    };
})();
