
document.querySelector('#pagesLabel').innerHtml = MSG("options_pages_label");
document.querySelector('#addPage').innerHtml = MSG("options_add_text");
document.querySelector('#deletePage').innerHtml = MSG("options_delete_text");
document.querySelector('#restorePage').innerHtml = MSG("options_restore_text");
document.querySelector('#restoreAllPages').innerHtml = MSG("options_restore_all_text");

document.querySelector('#convertersLabel').innerHtml = MSG("options_converters_label");

document.querySelector('#saversLabel').innerHtml = MSG("options_savers_label");

document.querySelector('#save').innerHtml = MSG("options_save");

document.querySelector('#debugModeLabel').innerHtml = MSG("options_debug_mode");

var pageSelector = document.querySelector('#pageSelector');

document.querySelector('#debugMode').onchange = function()
{
    Html2BookConfig.debug.status = document.querySelector('#debugMode').checked;
};

function setPageMessage(msg)
{
    document.querySelector('#pageMessage').appendChild(document.createElement("br"));
    document.querySelector('#pageMessage').innerText += msg;
}

function createOption(value)
{
    var option = document.createElement("option");
    option.value = value;

    var option_text = document.createTextNode(value);
    option.appendChild(option_text);

    return option;
}

var activePageId = null;

function showPageJson(pageId)
{
    if (pageId)
    {
        var pageJson = JSON.stringify(Html2BookConfig.pages[pageId], null, 2);
        document.querySelector('#pageJson').value = pageJson;
    }
    else
    {
        document.querySelector('#pageJson').value = "";
    }
}

function onChangePageSelector(forced)
{
    var selectedOptionsCount = pageSelector.selectedOptions.length;
    var pageId = null;

    if (selectedOptionsCount == 1)
    {
        pageId = pageSelector.selectedOptions[0].value;
        if (activePageId == pageId && !forced)
            return;
    }

    if (activePageId && !forced)
    {
        var pageJson = document.querySelector('#pageJson').value;
        Html2BookConfig.pages[activePageId] = JSON.parse(pageJson);
    }

    showPageJson(pageId);

    activePageId = pageId;

    document.querySelector('#deletePage').disabled = (pageId == null);
    document.querySelector('#pageJson').disabled = (pageId == null);
    document.querySelector('#restorePage').disabled = !DefaultPages.hasOwnProperty(pageId);
};

function isSelectorHasOption(pageId)
{
    for (var i = 0; i < pageSelector.options.length; ++i)
    {
        if (pageSelector.options[i]. value == pageId)
            return true;
    }
    return false;
}

pageSelector.onchange = onChangePageSelector;

var configLoaded = false;

// Restores select box state to saved value from localStorage.
function restoreOptions()
{
    if (configLoaded)
        return;

    Html2BookConfig.load(function()
    {
        // check configuration is valid
        Html2BookConfig.checkConfig();

        // generate sites/pages tab content
        for (var pageId in Html2BookConfig.pages)
        {
            var option = createOption(pageId);
            pageSelector.appendChild(option);
        }
        onChangePageSelector();

        // restore debug mode
        document.querySelector('#debugMode').checked = Html2BookConfig.debug.status;

        // TODO: generate converters tab content

        // TODO: generate savers tab content

        configLoaded = true;
    });
}

var ownSave = false;

// Saves options to localStorage.
function saveOptions()
{
    if (activePageId)
    {
        var pageJson = document.querySelector('#pageJson').value;
        Html2BookConfig.pages[activePageId] = JSON.parse(pageJson);
    }

    ownSave = true;
    Html2BookConfig.save();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);

chrome.storage.onChanged.addListener(function(changes, namespace)
{
    var hasChanges = Html2BookConfig.hasChanges(changes);
    if (hasChanges)
    {
        if (ownSave)
            ownSave = false;
        else if (confirm(MSG("options_ext_change")))
            location.reload();
    }
});

document.querySelector('#addPage').onclick = function()
{
    var pageId = prompt(MSG("options_new_page_id"), "my_cool_page");
    if (!pageId)
        return;

    if (Html2BookConfig.pages.hasOwnProperty(pageId))
    {
        alert(MSG("options_page_exists_err", [pageId]));
        return;
    }

    var pageConfig = '{"name": "' + pageId + '", "addr": ["http://www\\\\.example\\\\.com"], \
                       "formatters": {"fb2": { \
                           "xsl": "http://www\\\\.example\\\\.com/' + pageId + '2fb2.xsl", \
                           "fileNameRegEx": "//title", \
                           "commentsSupported": false \
                      }}}';
    var pageJson = JSON.parse(pageConfig);

    Html2BookConfig.pages[pageId] = pageJson;

    // verify json
    var result = validateConfigPage(Html2BookConfig, pageId);
    if (!result.succeed)
    {
        delete Html2BookConfig.pages[pageId];

        alert(result.errorMessage);
        return;
    }

    var option = createOption(pageId);
    pageSelector.appendChild(option);

    pageSelector.selectedIndex = pageSelector.options.length - 1;

    onChangePageSelector();
};

document.querySelector('#deletePage').onclick = function()
{
    if (pageSelector.selectedIndex == -1)
        return;

    var pageId = pageSelector.selectedOptions[0].value;
    if (confirm(MSG("options_del_page", [pageId])))
    {
        pageSelector.remove(pageSelector.selectedIndex);
        delete Html2BookConfig.pages[pageId];

        activePageId = null;
        onChangePageSelector();
    }
};

document.querySelector('#restorePage').onclick = function()
{
    var pageId = pageSelector.selectedOptions[0].value;
    if (!DefaultPages.hasOwnProperty(pageId))
    {
        alert(MSG("options_page_not_def_err", [pageId]));
        return;
    }

    if (pageSelector.selectedIndex != -1 &&
        confirm(MSG("options_restore_page")))
    {
        Html2BookConfig.pages[pageId] = DefaultPages[pageId];
        onChangePageSelector(true);
    }
};

document.querySelector('#restoreAllPages').onclick = function()
{
    if (confirm(MSG("options_restore_all_pages")))
    {
        Html2BookConfig.initDefaultPages();
        for (var pageId in DefaultPages)
        {
            if (!isSelectorHasOption(pageId))
            {
                var option = createOption(pageId);
                pageSelector.appendChild(option);
            }
        }
        onChangePageSelector(true);
    }
};
