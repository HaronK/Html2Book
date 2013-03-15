
var storage = chrome.storage.sync;
var Html2BookConfig = null;

function onLoad() {
    storage.get('html2book_config', function(config) {
        Html2BookConfig = config;
    });
}
