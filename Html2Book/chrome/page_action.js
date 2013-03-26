
function setMessage(msg)
{
    document.querySelector('#message').innerText = msg;
}

function addMessage(msg)
{
    document.querySelector('#message').innerText += msg;
}

function generateButton(tabId, pageId, formatterId, saverId) //, name, converter_klass, converter_params, saver_klass, mime)
{
    var h2b_button = document.createElement("button");
    h2b_button.type = "button";

    var listener = {
        handleEvent : function(evt)
        {
            h2b_button.disabled = true;
            chrome.tabs.sendMessage(tabId, {id: "generate", pageId: pageId, formatterId: formatterId, saverId: "fs", config: Html2BookConfig},
                function(response)
                {
                    if (response.succeed)
                        window.close();
                    else
                        setMessage("Cannot generate document: '" + response.errorMessage + "'");
                    h2b_button.disabled = false;
                });
        }
    };

    h2b_button.addEventListener("click", listener, false);

    var h2b_button_text = document.createTextNode(formatterId);
    h2b_button.appendChild(h2b_button_text);

    document.body.appendChild(h2b_button);
}

var storage = chrome.storage.sync;
var Html2BookConfig = null;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
{
    storage.get('html2book_config', function(config)
    {
        Html2BookConfig = checkConfig(config);

        var pageId = getPageConfig(Html2BookConfig, tabs[0].url);
        var tabId = tabs[0].id;

        // generate buttons and button's scripts
        for (var formatterId in Html2BookConfig.pages[pageId].formatters)
        {
            generateButton(tabId, pageId, formatterId, "fs");
        }
    });
});
