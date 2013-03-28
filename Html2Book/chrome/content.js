
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
    }
});

function saveBook(book_xml, convert_handler, save_handler, sendResponse)
{
    sendResponse({status: "message", message: "Saving..."});
    var book_data = convert_handler.serialize(book_xml);
    save_handler.save(book_data);
    sendResponse({status: "message", message: " done", type: "add"});
    sendResponse({status: "succeed"});
}

function generate(pageId, formatterId, saverId, config, sendResponse)
{
    var page      = config.pages[pageId];                   // TODO: check if not null if needed
    var formatter = config.formatters[formatterId];         // TODO: check if not null if needed
    var converter = config.converters[formatter.converter]; // TODO: check if not null if needed
    var saver     = config.savers[saverId];                 // TODO: check if not null if needed

    sendResponse({status: "message", message: "Initializing '" + formatter.converter + "' converter..."});
    var convert_handler = new window[converter.klass](formatter, page.formatters[formatterId], function()
    {
        sendResponse({status: "message", message: " done", type: "add"});

        sendResponse({status: "message", message: "Initializing '" + saverId + "' saver..."});
        var save_handler = new window[saver.klass]('book.' + formatterId, converter.mime);
        sendResponse({status: "message", message: " done", type: "add"});

        sendResponse({status: "message", message: "Converting page..."});
        var book_xml = convert_handler.convert(document.documentElement.outerHTML);
        sendResponse({status: "message", message: " done", type: "add"});

        // do page post transformation work if needed
        if (formatter.klass)
        {
            var formatter_handler = new window[formatter.klass];
            if (formatter_handler.postTransform)
            {
                sendResponse({status: "message", message: "Applying post transform step..."});
                formatter_handler.postTransform(book_xml, function()
                {
                    sendResponse({status: "message", message: " done", type: "add"});
                    saveBook(book_xml, convert_handler, save_handler, sendResponse);
                });
            }
            else
            {
                saveBook(book_xml, convert_handler, save_handler, sendResponse);
            }
        }
        else
        {
            saveBook(book_xml, convert_handler, save_handler, sendResponse);
        }
    });
}

chrome.runtime.onConnect.addListener(function(port)
{
    if (port.name != "h2b_pageCommand")
        return;

    port.onMessage.addListener(function(message)
    {
        switch (message.id)
        {
        case "generate":
            try
            {
                generate(message.data.pageId, message.data.formatterId, message.data.saverId, message.data.config, function(data)
                {
                    port.postMessage({id: "generate", data: data});
                });
            }
            catch (e)
            {
                port.postMessage({id: "generate", data: {status: "failure", message: e.message /*+ "Stack: " + e.stack*/}});
            }
            break;
        }
    });
 });
