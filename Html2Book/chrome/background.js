
var storage = chrome.storage.sync;
var Html2BookConfig = null;

storage.get('html2book_config', function(config) {
    Html2BookConfig = checkConfig(config);
});

function checkForSupportedUrl(tabId, changeInfo, tab) {
    var page = getPageConfig(Html2BookConfig, tab.url);
    if (page)
        chrome.pageAction.show(tabId);
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForSupportedUrl);