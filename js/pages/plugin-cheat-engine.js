'use strict';

var cheatTableFileList = document.getElementById('cheatTableFileList');
var cheatTableSearch = document.getElementById('cheatTableSearch');
var cheatTableFileCount = document.getElementById('cheatTableFileCount');
var cheatTableSteamArtworkMap = window.cheatTableArtworkManifest || {};

if (typeof initSharedPage === 'function') {
    initSharedPage({
        header: {
            rootId: 'sharedHeaderRoot',
            options: {
                homeHref: 'index.html',
                toolBaseHref: ''
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

function getCheatTableDisplayName(fileName) {
    return String(fileName || '').replace(/\.[^.]+$/, '');
}

function getCheatTableExtension(fileName) {
    var match = String(fileName || '').match(/(\.[^.]+)$/);
    return match ? match[1].toUpperCase() : '';
}

function getCheatTableArtwork(fileName) {
    if (!fileName || !Object.prototype.hasOwnProperty.call(cheatTableSteamArtworkMap, fileName)) {
        return null;
    }

    return cheatTableSteamArtworkMap[fileName];
}

function getCheatTableGroupKey(fileName) {
    var displayName = getCheatTableDisplayName(fileName).trim();
    var firstCharacter = displayName.charAt(0).toUpperCase();

    if (/^[A-Z]$/.test(firstCharacter)) {
        return firstCharacter;
    }

    return '#';
}

function updateCheatTableCount(count) {
    if (!cheatTableFileCount) {
        return;
    }

    var labelTemplate = window.sharedI18n && typeof window.sharedI18n.t === 'function'
        ? window.sharedI18n.t('toolsPage.cheatTables.count', '{{count}} file')
        : '{{count}} file';

    cheatTableFileCount.textContent = String(labelTemplate).replace('{{count}}', String(count));
}

function renderCheatTableFiles() {
    if (!cheatTableFileList || !Array.isArray(window.cheatTableFiles) || !window.cheatTableFiles.length) {
        return;
    }

    var keyword = cheatTableSearch ? String(cheatTableSearch.value || '').trim().toLowerCase() : '';
    var filteredFiles = window.cheatTableFiles.filter(function (fileName) {
        if (!keyword) {
            return true;
        }

        return String(fileName).toLowerCase().indexOf(keyword) !== -1;
    });

    var groupedFiles = filteredFiles.reduce(function (accumulator, fileName) {
        var groupKey = getCheatTableGroupKey(fileName);

        if (!accumulator[groupKey]) {
            accumulator[groupKey] = [];
        }

        accumulator[groupKey].push(fileName);
        return accumulator;
    }, {});

    var sortedGroupKeys = Object.keys(groupedFiles).sort(function (left, right) {
        if (left === '#') {
            return -1;
        }

        if (right === '#') {
            return 1;
        }

        return left.localeCompare(right);
    });

    cheatTableFileList.innerHTML = '';

    sortedGroupKeys.forEach(function (groupKey) {
        var groupSection = document.createElement('section');
        var groupTitle = document.createElement('h4');
        var groupGrid = document.createElement('div');

        groupSection.className = 'tools-file-group';
        groupTitle.className = 'tools-file-group-title';
        groupTitle.textContent = groupKey;
        groupGrid.className = 'tools-file-grid';

        groupedFiles[groupKey].forEach(function (fileName) {
            var fileLink = document.createElement('a');
            var fileUrl = 'products/Plugins/My%20Cheat%20Tables/' + encodeURIComponent(fileName);
            var fileArtwork = getCheatTableArtwork(fileName);
            var fileLinkHead = document.createElement('div');
            var fileNameLabel = document.createElement('span');
            var fileExtensionLabel = document.createElement('span');
            fileLink.className = 'tools-file-link';
            fileLink.href = fileUrl;
            fileLink.download = fileName;
            fileLinkHead.className = 'tools-file-link-head';
            fileNameLabel.className = 'tools-file-link-name';
            fileNameLabel.textContent = fileArtwork && fileArtwork.title
                ? fileArtwork.title
                : getCheatTableDisplayName(fileName);
            fileExtensionLabel.className = 'tools-file-link-ext';
            fileExtensionLabel.textContent = getCheatTableExtension(fileName);
            fileLinkHead.appendChild(fileNameLabel);
            fileLinkHead.appendChild(fileExtensionLabel);
            fileLink.appendChild(fileLinkHead);

            if (fileArtwork && fileArtwork.imageSrc) {
                var fileMedia = document.createElement('div');
                var fileImage = document.createElement('img');

                fileMedia.className = 'tools-file-link-media';
                fileImage.className = 'tools-file-link-image';
                fileImage.src = fileArtwork.imageSrc;
                fileImage.alt = fileNameLabel.textContent;
                fileImage.loading = 'lazy';
                fileImage.referrerPolicy = 'no-referrer';
                fileMedia.appendChild(fileImage);
                fileLink.appendChild(fileMedia);
            }

            groupGrid.appendChild(fileLink);
        });

        groupSection.appendChild(groupTitle);
        groupSection.appendChild(groupGrid);
        cheatTableFileList.appendChild(groupSection);
    });

    updateCheatTableCount(filteredFiles.length);
}

if (cheatTableSearch) {
    cheatTableSearch.addEventListener('input', renderCheatTableFiles);
}

if (window.sharedI18n && typeof window.sharedI18n.onChange === 'function') {
    window.sharedI18n.onChange(function () {
        renderCheatTableFiles();
    });
}

renderCheatTableFiles();
