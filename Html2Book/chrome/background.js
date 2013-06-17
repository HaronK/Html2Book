
function injectImports(tabId, imports)
{
    for (var i = 0; i < imports.length; i++)
        chrome.tabs.executeScript(tabId, {file: resolvePath(imports[i])});
}

function injectPageScripts(tabId, pageId)
{
    var page = Html2BookConfig.pages[pageId];

    // add default saver imports
    if (Html2BookConfig.savers.fs.imports)
        injectImports(tabId, Html2BookConfig.savers.fs.imports);

    // add page converters imports
    var page_converters = {};
    for (var formatterId in page.formatters)
    {
        var formatter = Html2BookConfig.formatters[formatterId]; // TODO: check if not null if needed
        page_converters[formatter.converter] = true;
    }
    for (var converter in page_converters)
    {
        if (Html2BookConfig.converters[converter].imports)
            injectImports(tabId, Html2BookConfig.converters[converter].imports);
    }

    // embed buttons
    for (var formatterId in Html2BookConfig.pages[pageId].formatters)
    {
        var formatter = Html2BookConfig.formatters[formatterId]; // TODO: check if not null if needed

        if (formatter.imports)
            injectImports(tabId, formatter.imports);
    }
}

function preparePages(tab)
{
    var pageId = Html2BookConfig.getPageConfig(tab.url);
    if (pageId)
    {
        // inject content script
        injectPageScripts(tab.id, pageId);

        chrome.pageAction.show(tab.id);
    }
    else
    {
        chrome.pageAction.hide(tab.id);
    }
}

var configLoaded = false;

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
    if (configLoaded)
    {
        preparePages(tab);
    }
    else
    {
        Html2BookConfig.load(function()
        {
            Html2BookConfig.checkConfig();
            preparePages(tab);
            configLoaded = true;
        });
    }
});

var canvas = document.createElement("canvas");
var context = canvas.getContext('2d');

function image2base64(href, onfinish)
{
    var imageObj = new Image();
    imageObj.onload = function()
    {
        canvas.width = this.width;
        canvas.height = this.height;

        context.drawImage(imageObj, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        // escape data:image prefix
        var imageData = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

        onfinish(imageData);
    };
    imageObj.src = href;
}

chrome.runtime.onConnect.addListener(function(port)
{
    if (port.name != "h2b_utility")
        return;

    port.onMessage.addListener(function(message)
    {
        try
        {
            switch (message.id)
            {
            case "image2base64":
                image2base64(message.imageHref, function(data)
                {
                    port.postMessage({id: "image2base64", data: data});
                });
                break;
            case "loadFile":
                requestFileAsync(message.filePath, null, function(xhr, obj)
                {
                    port.postMessage({id: "loadFile", data: xhr.responseText});
                });
                break;
            }
        }
        catch (e)
        {
            port.postMessage({id: "error", data: "Error: " + e.message /*+ "Stack: " + e.stack*/});
        }
    });
});

function updateTabsPageActions()
{
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs)
    {
        for (var i = 0; i < tabs.length; ++i)
        {
            preparePages(tabs[i]);
        }
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace)
{
    Html2BookConfig.onChanged(changes, function()
    {
        // refresh pageActions for all tabs
        updateTabsPageActions();
    });
});

//chrome.management.onInstalled.addListener(function(info)
//{
//    // https://developer.chrome.com/extensions/management.html#event-onInstalled
//});

// Fired when the extension is first installed, when the extension is updated to a new version,
// and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener(function(details)
{
    // https://developer.chrome.com/extensions/runtime.html#event-onInstalled

    // NOTE: remove old data. This code should be removed in new version of extension.
//    chrome.storage.sync.clear();
    chrome.storage.sync.remove('html2book_config');

//    alert("To make new version of extension work properly default settings should be reloaded."); // TODO: localize
    Html2BookConfig.initDefaultConfig();
//    Html2BookConfig.save();
});

//(function()
//{
//    if (configLoaded)
//    {
//        updateTabsPageActions();
//    }
//    else
//    {
//        Html2BookConfig.load(function()
//        {
//            Html2BookConfig.checkConfig();
//            updateTabsPageActions();
//            configLoaded = true;
//        });
//    }
//})();

