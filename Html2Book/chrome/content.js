
function saveBook(book_xml, convert_handler, save_handler)
{
    var book_data = convert_handler.serialize(book_xml);
    save_handler.save(book_data);
    sendResponse({succeed: true});
}

function generate(pageId, formatterId, saverId, config)
{
    var page      = config.pages[pageId];                   // TODO: check if not null if needed
    var formatter = config.formatters[formatterId];         // TODO: check if not null if needed
    var converter = config.converters[formatter.converter]; // TODO: check if not null if needed
    var saver     = config.savers[saverId];                 // TODO: check if not null if needed

    var convert_handler = new window[converter.klass](formatter, page.formatters[formatterId], function()
    {
        var save_handler = new window[saver.klass]('book.' + formatterId, converter.mime);

        var book_xml = convert_handler.convert(document.documentElement.outerHTML);

        // do page post transformation work if needed
        if (formatter.klass)
        {
            var formatter_handler = new window[formatter.klass];
            if (formatter_handler.postTransform)
            {
                formatter_handler.postTransform(book_xml,
                function()
                {
                    saveBook(book_xml, convert_handler, save_handler);
                });
            }
            else
            {
                saveBook(book_xml, convert_handler, save_handler);
            }
        }
        else
        {
            saveBook(book_xml, convert_handler, save_handler);
        }
    });
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse)
{
    switch (message.id)
    {
    case "data":
        sendResponse({location: document.location, page: document.documentElement.outerHTML});
        break;
    case "generate":
        try
        {
            generate(message.pageId, message.formatterId, message.saverId, message.config);
        }
        catch (e)
        {
            sendResponse({succeed: false, errorMessage: e});
        }
        break;
    }
});
