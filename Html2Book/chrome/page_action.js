
function setMessage(msg)
{
    document.querySelector('#message').appendChild(document.createElement("br"));
    document.querySelector('#message').innerText += msg;
}

function addMessage(msg)
{
    document.querySelector('#message').innerText += msg;
}

var onPageCommandRespond = null;
var pageCommandPort = null;

function processPageCommand(response)
{
    switch (response.id)
    {
    case "generate":
        onPageCommandRespond(response.data);
        break;
    case "message":
        if (response.data.type == "add")
            addMessage(response.data.message);
        else
            setMessage(response.data.message);
        break;
    }
}

function generateButton(tabId, pageId, formatterId, saverId) //, name, converter_klass, converter_params, saver_klass, mime)
{
    var h2b_button = document.createElement("button");
    h2b_button.type = "button";

    var listener = {
        handleEvent : function(evt)
        {
            h2b_button.disabled = true;
            var addComments = document.querySelector('#comments').checked;

            setMessage(MSG("page_action_converting_to", [formatterId]));
            onPageCommandRespond = function(response)
            {
                switch (response.status)
                {
                case "succeed":
                    setMessage(MSG("page_action_converting_fin"));
                    h2b_button.disabled = false;
                    window.close();
                    break;
                case "failure":
                    setMessage(MSG("page_action_doc_gen_err", [response.message]));
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

            try
            {
                pageCommandPort.postMessage({id: "generate",
                                             data: {pageId: pageId, formatterId: formatterId,
                                                    saverId: "fs", config: Html2BookConfig,
                                                    formatterParams: {addComments: addComments}}});
            }
            catch (e)
            {
                setMessage("Exception: " + e.message + "\nStack: " + e.stack);
            }
        }
    };

    h2b_button.addEventListener("click", listener, false);

    var h2b_button_text = document.createTextNode(formatterId);
    h2b_button.appendChild(h2b_button_text);

    document.querySelector('#buttons').appendChild(h2b_button);
}

window.onload = function()
{
    chrome.windows.getCurrent(function(w)
    {
        chrome.tabs.getSelected(w.id, function(t)
        {
            Html2BookConfig.load(function()
            {
                Html2BookConfig.checkConfig();

                var pageId = Html2BookConfig.getPageConfig(t.url);

                // generate buttons and button's scripts
                for (var formatterId in Html2BookConfig.pages[pageId].formatters)
                {
                    generateButton(t.id, pageId, formatterId, "fs");
                }

                // check comments exporting availability
                document.querySelector('#commentsBlock').style.display =
                    Html2BookConfig.pages[pageId].formatters[formatterId].commentsSupported ? "block" : "none";

                // check debug mode
                document.querySelector('#debug').style.display =
                        Html2BookConfig.debug.status ? "block" : "none";

                document.querySelector('#saveXhtml').checked = Html2BookConfig.debug.save_xhtml;
                document.querySelector('#saveXsl').checked   = Html2BookConfig.debug.save_xsl;

                document.querySelector('#saveXhtml').onchange = function()
                {
                    Html2BookConfig.debug.save_xhtml = document.querySelector('#saveXhtml').checked;
                };

                document.querySelector('#saveXsl').onchange = function()
                {
                    Html2BookConfig.debug.save_xsl = document.querySelector('#saveXsl').checked;
                };
            });

            pageCommandPort = chrome.tabs.connect(t.id, {name: "h2b_pageCommand"});
            pageCommandPort.onMessage.addListener(function(message)
            {
                processPageCommand(message);
            });
            pageCommandPort.onDisconnect.addListener(function()
            {
                pageCommandPort = null;
            });
        });
    });

    document.querySelector('#message').innerText        = MSG("page_action_msg");
    document.querySelector('#commentsLabel').innerText  = MSG("page_action_add_comments");
    document.querySelector('#saveXhtmlLabel').innerText = MSG("page_action_save_xhtml");
    document.querySelector('#saveXslLabel').innerText   = MSG("page_action_save_xsl");
};

