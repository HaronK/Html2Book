
var pagePort = null;

function sendPageResponse(id, data)
{
    try
    {
        console.log("H2B: " + JSON.stringify(data));
        pagePort.postMessage({id: id, data: data});
    }
    catch (e)
    {
        console.log("Cannot send page response: id='" + id + "', data: " + JSON.stringify(data) +
                    "\nException: " + e.message);
    }
}

function showPageMessage(data)
{
    sendPageResponse("message", data);
}

var onUtilityRespond = null;
var utilityPort = chrome.runtime.connect({name: "h2b_utility"});
utilityPort.onMessage.addListener(function(message)
{
    switch (message.id)
    {
    case "image2base64":
    case "loadFile":
        onUtilityRespond(message.data);
        break;
    case "error":
        sendPageResponse("generate", {status: "failure", message: message.data});
        break;
    }
});

chrome.runtime.onConnect.addListener(function(port)
{
    if (port.name != "h2b_pageCommand")
        return;

    pagePort = port;
    pagePort.onMessage.addListener(function(message)
    {
        processPageCommand(message);
    });
    pagePort.onDisconnect.addListener(function()
    {
        pagePort = null;
    });
});

function processPageCommand(message)
{
    try
    {
        switch (message.id)
        {
        case "generate":
            generate(message.data);
            break;
        }
    }
    catch (e)
    {
        sendPageResponse("generate", {status: "failure", message: "Exception: " + e.message + "\nStack: " + e.stack});
    }
}

function saveBook(book_xml, file_name, convert_handler, save_handler)
{
    showPageMessage({message: "Saving..."});
    var book_data = convert_handler.serialize(book_xml);
    save_handler.save(file_name, book_data);
    showPageMessage({message: " done", type: "add"});
}

function generate(data)
{
    var page      = data.config.pages[data.pageId];              // TODO: check if not null if needed
    var formatter = data.config.formatters[data.formatterId];    // TODO: check if not null if needed
    var converter = data.config.converters[formatter.converter]; // TODO: check if not null if needed
    var saver     = data.config.savers[data.saverId];            // TODO: check if not null if needed

    showPageMessage({message: "Initializing '" + formatter.converter + "' converter..."});
    new window[converter.klass](
        {formatter: formatter, pageFormatter: page.formatters[data.formatterId], sendResponse: sendPageResponse},
        function(obj)
        {
            showPageMessage({message: " converter initialized"});

            showPageMessage({message: "Converting page..."});
            obj.convert(location.href, document.documentElement.outerHTML, data.formatterParams, function(converted_data)
            {
                var book_title = converted_data.title;

                showPageMessage({message: "Initializing '" + data.saverId + "' saver..."});
                var save_handler = new window[saver.klass](converter.mime);
                showPageMessage({message: " saver initialized"});

                var fileName = page.name + '.' + book_title.replace(/[\s"]/g, '_');
                if (data.config.debug.status)
                {
                    if (data.config.debug.save_xhtml && converted_data.xhtml)
                    {
                        save_handler.save(fileName + '.xml', converted_data.xhtml);
                    }
                    if (data.config.debug.save_xsl && converted_data.xsl)
                    {
                        save_handler.save(page.name + '.xsl', converted_data.xsl);
                    }
                }

                if (converted_data.data)
                {
                    saveBook(converted_data.data, fileName + '.' + data.formatterId, obj, save_handler);
                }

                sendPageResponse("generate", {status: "succeed"});
            }
        );
        showPageMessage({message: "Converting page done"});
    });
}
