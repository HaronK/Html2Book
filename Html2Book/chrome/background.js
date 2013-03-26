
var storage = chrome.storage.sync;
var Html2BookConfig = null;

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

function preparePages(tabId, tab)
{
    var pageId = getPageConfig(Html2BookConfig, tab.url);
    if (pageId)
    {
        // inject content script
        injectPageScripts(tabId, pageId);

        chrome.pageAction.show(tabId);
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
    if (changeInfo.status == "complete")
    {
        if (Html2BookConfig)
        {
            preparePages(tabId, tab);
        }
        else
        {
            storage.get('html2book_config', function(config)
            {
                Html2BookConfig = checkConfig(config);
                preparePages(tabId, tab);
            });
        }
    }
});
