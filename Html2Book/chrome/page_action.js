
function setMessage(msg)
{
    document.querySelector('#message').appendChild(document.createElement("br"));
    document.querySelector('#message').innerText += msg;
}

function addMessage(msg)
{
    document.querySelector('#message').innerText += msg;
}

var storage = chrome.storage.sync;
var Html2BookConfig = null;

var onPageCommandRespond = null;
var pageCommandPort = null;
chrome.windows.getCurrent(function(w)
{
    chrome.tabs.getSelected(w.id, function(t)
    {
        storage.get('html2book_config', function(config)
        {
            Html2BookConfig = checkConfig(config);

            var pageId = getPageConfig(Html2BookConfig, t.url);

            // generate buttons and button's scripts
            for (var formatterId in Html2BookConfig.pages[pageId].formatters)
            {
                generateButton(t.id, pageId, formatterId, "fs");
            }
        });

        pageCommandPort = chrome.tabs.connect(t.id, {name: "h2b_pageCommand"});
        pageCommandPort.onMessage.addListener(function(message)
        {
            switch (message.id)
            {
            case "generate":
                onPageCommandRespond(message.data);
                break;
            }
        });
    });
});

function generateButton(tabId, pageId, formatterId, saverId) //, name, converter_klass, converter_params, saver_klass, mime)
{
    var h2b_button = document.createElement("button");
    h2b_button.type = "button";

    if (Html2BookConfig.pages[pageId].formatters[formatterId].commentsSupported)
    {
        document.querySelector('#comments').disabled = false;
    }

    var listener = {
        handleEvent : function(evt)
        {
            h2b_button.disabled = true;
            var addComments = document.querySelector('#comments').checked;

            setMessage("Converting to '" + formatterId + "'... ");
            onPageCommandRespond = function(response)
            {
                switch (response.status)
                {
                case "succeed":
                    setMessage("Converting finished.");
                    h2b_button.disabled = false;
                    window.close();
                    break;
                case "failure":
                    setMessage("Cannot generate document: '" + response.message + "'");
                    h2b_button.disabled = false;
                    break;
                case "message":
                    if (response.type == "add")
                        addMessage(response.message);
                    else
                        setMessage(response.message);
                	break;
                }
            };
            pageCommandPort.postMessage({id: "generate",
                                         data: {pageId: pageId, formatterId: formatterId,
                                                saverId: "fs", config: Html2BookConfig,
                                                formatterParams: {addComments: addComments}}});
        }
    };

    h2b_button.addEventListener("click", listener, false);

    var h2b_button_text = document.createTextNode(formatterId);
    h2b_button.appendChild(h2b_button_text);

    document.querySelector('#buttons').appendChild(h2b_button);
}
