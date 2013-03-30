
var storage = chrome.storage.sync;
var Html2BookConfig = null;

function setPageMessage(msg)
{
    document.querySelector('#pageMessage').appendChild(document.createElement("br"));
    document.querySelector('#pageMessage').innerText += msg;
}

function createOption(value, text)
{
    var option = document.createElement("option");
    option.value = value;

    var option_text = document.createTextNode(text);
    option.appendChild(option_text);

    return option;
}

var activePageId = null;

function showPageJson(pageId)
{
    var pageJson = JSON.stringify(Html2BookConfig.pages[pageId], null, 2);
    document.querySelector('#pageJson').value = pageJson;
}

function onChangePageSelector()
{
    var pageId = document.querySelector('#pageSelector').selectedOptions[0].value;
    if (activePageId == pageId)
        return;

    if (activePageId)
    {
        var pageJson = document.querySelector('#pageJson').value;
        Html2BookConfig.pages[activePageId] = JSON.parse(pageJson);
    }

    showPageJson(pageId);

    activePageId = pageId;
};


// Restores select box state to saved value from localStorage.
function restoreOptions()
{
//    setPageMessage("Restore options");
    storage.get('html2book_config', function(config)
    {
        // check configuration is valid
        Html2BookConfig = checkConfig(config.html2book_config);

        // generate sites/pages tab content
        var pageSelector = document.querySelector('#pageSelector');
        pageSelector.onchange = onChangePageSelector;

        for (var pageId in Html2BookConfig.pages)
        {
            var option = createOption(pageId, Html2BookConfig.pages[pageId].name);
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
//    setPageMessage("Save options");
    var pageJson = document.querySelector('#pageJson').value;
    Html2BookConfig.pages[activePageId] = JSON.parse(pageJson);

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

    var pageName = prompt("Задайте имя конфигурации для новой страницы.", pageId);
    if (!pageName)
        return;

    if (Html2BookConfig.pages.hasOwnProperty(pageId))
        alert("Страница с таким именем уже существует.");
    else
    {
        var pageConfig = '{"name": "' + pageName + '", "addr": ["http://www\\\\.example\\\\.com"], \
                           "formatters": {"fb2": { \
                               "xsl": "http://www\\\\.example\\\\.com/' + pageId + '2fb2.xsl", \
                               "fileNameRegEx": "//title", \
                               "commentsSupported": false \
                          }}}';
        var pageJson = JSON.parse(pageConfig);
        Html2BookConfig.pages[pageId] = pageJson;

        var option = createOption(pageId, Html2BookConfig.pages[pageId].name);
        var pageSelector = document.querySelector('#pageSelector');
        pageSelector.appendChild(option);

        pageSelector.selectedIndex = pageSelector.options.length - 1;

        onChangePageSelector();
    }
};

document.querySelector('#restorePages').onclick = function()
{
    if (confirm("Восстановить настройки по умолчанию для Хабра и Самиздата?\nНастройки для других страниц останутся неизменными."))
    {
        initDefaultPages(Html2BookConfig);

        var pageId = document.querySelector('#pageSelector').selectedOptions[0].value;
        showPageJson(pageId);
    }
};
