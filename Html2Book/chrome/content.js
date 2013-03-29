
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

function generate(data, sendResponse)
{
    var page      = data.config.pages[data.pageId];              // TODO: check if not null if needed
    var formatter = data.config.formatters[data.formatterId];    // TODO: check if not null if needed
    var converter = data.config.converters[formatter.converter]; // TODO: check if not null if needed
    var saver     = data.config.savers[data.saverId];            // TODO: check if not null if needed

    sendResponse({status: "message", message: "Initializing '" + formatter.converter + "' converter..."});
    var convert_handler = new window[converter.klass](formatter, page.formatters[data.formatterId], function()
    {
        sendResponse({status: "message", message: " done", type: "add"});

        sendResponse({status: "message", message: "Converting page..."});
        convert_handler.convert(document.documentElement.outerHTML, data.formatterParams, function(data)
        {
            var book_xml = data.xml;
            var book_title = data.title;
             sendResponse({status: "message", message: "Initializing '" + data.saverId + "' saver..."});
            var fileName = book_title.replace(/[\s"]/g, '_') + '.' + data.formatterId;
            var save_handler = new window[saver.klass](fileName, converter.mime);
            sendResponse({status: "message", message: " done", type: "add"});

            saveBook(book_xml, convert_handler, save_handler, sendResponse);
        });
        sendResponse({status: "message", message: "Converting page done"});
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
                generate(message.data, function(data)
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
