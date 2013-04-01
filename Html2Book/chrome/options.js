
var storage = chrome.storage.sync;
var Html2BookConfig = null;
var pageSelector = document.querySelector('#pageSelector');

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

// Restores select box state to saved value from localStorage.
function restoreOptions()
{
    storage.get('html2book_config', function(config)
    {
        // check configuration is valid
        Html2BookConfig = checkConfig(config.html2book_config);

        // generate sites/pages tab content
        for (var pageId in Html2BookConfig.pages)
        {
            var option = createOption(pageId);
            pageSelector.appendChild(option);
        }
        onChangePageSelector();

        // TODO: generate converters tab content

        // TODO: generate savers tab content

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
    storage.set({'html2book_config': Html2BookConfig}, function()
    {
        // TODO: check errors
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);

chrome.storage.onChanged.addListener(function(changes, namespace)
{
    var config = changes["html2book_config"];
    if (config)
    {
        if (ownSave)
            ownSave = false;
        else if (confirm("Настройки Html2Book были изменены в другом экземпляре браузера. Применить изменения?"))
            location.reload();
    }
});

document.querySelector('#addPage').onclick = function()
{
    var pageId = prompt("Задайте идентификатор конфигурации для новой страницы.", "my_cool_page");
    if (!pageId)
        return;

    if (Html2BookConfig.pages.hasOwnProperty(pageId))
    {
        alert("Страница с таким именем уже существует.");
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
    if (confirm("Удалить настройки для страницы '" + pageId +"'"))
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
        alert("Page '" + pageId + "' is not a default page.");
        return;
    }

    if (pageSelector.selectedIndex != -1 &&
        confirm("Восстановить настройки по умолчанию для текущей страницы?"))
    {
        Html2BookConfig.pages[pageId] = DefaultPages[pageId];
        onChangePageSelector(true);
    }
};

document.querySelector('#restoreAllPages').onclick = function()
{
    if (confirm("Восстановить настройки для страниц по умолчанию?\nНастройки для других страниц останутся неизменными."))
    {
        initDefaultPages(Html2BookConfig);
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
