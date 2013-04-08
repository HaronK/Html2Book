
var pagePort = null;
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
        pagePort.postMessage({id: "generate", data: {status: "failure", message: message.data}});
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
            generate(message.data, function(data)
            {
                pagePort.postMessage({id: "generate", data: data});
            });
            break;
        }
    }
    catch (e)
    {
        pagePort.postMessage({id: "generate", data: {status: "failure", message: e.message /*+ "Stack: " + e.stack*/}});
    }
}

function saveBook(book_xml, file_name, convert_handler, save_handler, sendResponse)
{
    sendResponse({status: "message", message: "Saving..."});
    var book_data = convert_handler.serialize(book_xml);
    save_handler.save(file_name, book_data);
    sendResponse({status: "message", message: " done", type: "add"});
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
        convert_handler.convert(location.href, document.documentElement.outerHTML, data.formatterParams, function(converted_data)
        {
            var book_data = converted_data.data;
            var book_title = converted_data.title;

            sendResponse({status: "message", message: "Initializing '" + data.saverId + "' saver..."});
            var save_handler = new window[saver.klass](converter.mime);
            sendResponse({status: "message", message: " done", type: "add"});

            var fileName = page.name + '.' + book_title.replace(/[\s"]/g, '_');
            if (data.config.debug.status)
            {
                if (data.config.debug.save_xhtml && converted_data.xhtml)
                {
                    save_handler.save(fileName + '.xml', converted_data.xhtml);
                }
                if (data.config.debug.save_xsl && converted_data.xsl)
                {
                    save_handler.save(fileName + '.xsl', converted_data.xsl);
                }
            }

            saveBook(book_data, fileName + '.' + data.formatterId, convert_handler, save_handler, sendResponse);

            sendResponse({status: "succeed"});
        });
        sendResponse({status: "message", message: "Converting page done"});
    });
}
