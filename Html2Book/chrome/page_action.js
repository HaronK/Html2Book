
function appendImports(imports)
{
    for (var i = 0; i < imports.length; i++)
    {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = resolvePath(imports[i]);
        document.head.appendChild(script);
    }
}

function appendScriptText(text)
{
    var script = document.createElement('script');
    script.type = "text/javascript";
    var script_text = document.createTextNode(text);
    script.appendChild(script_text);
    document.head.appendChild(elem);
}

var pageSource = null;

function generateButton(tabId, pageId, formatterId, saver) //, name, converter_klass, converter_params, saver_klass, mime)
{
    var page      = Html2BookConfig.pages[pageId];                   // TODO: check if not null if needed
    var formatter = Html2BookConfig.formatters[formatterId];         // TODO: check if not null if needed
    var converter = Html2BookConfig.converters[formatter.converter]; // TODO: check if not null if needed

    var h2b_button = document.createElement("button");
    h2b_button.type = "button";
    h2b_button.disabled = true;

    var convert_handler = new window[converter.klass](formatter, page.formatters[formatterId],
        function()
        {
            h2b_button.disabled = false;
        });

    var save_handler = new window[saver.klass]('book.' + formatterId, converter.mime);
    var listener = {
        handleEvent : function(evt)
        {
            window.close();
            var book_xml = convert_handler.convert(pageSource);

            // do page post transformation work if needed
            if (formatter.klass)
            {
                var formatter_handler = new window[formatter.klass];
                if (formatter_handler.postTransform)
                {
                    formatter_handler.postTransform(book_xml, function()
                    {
                        var book_data = convert_handler.serialize(book_xml);
                        save_handler.save(book_data);
                    });
                }
                else
                {
                    var book_data = convert_handler.serialize(book_xml);
                    save_handler.save(book_data);
                }
            }
            else
            {
                var book_data = convert_handler.serialize(book_xml);
                save_handler.save(book_data);
            }
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
    var tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, {id: "data"}, function(response)
    {
        pageSource = response.page;

        var message = document.querySelector('#message');
        message.innerText += 'done ' + "(" + response.location.href + ")";

        storage.get('html2book_config', function(config)
        {
            Html2BookConfig = checkConfig(config);

            var pageId = getPageConfig(Html2BookConfig, response.location.href);

            // add default saver imports
            appendImports(Html2BookConfig.savers.fs.imports);

            // add page converters imports
            var page_converters = {};
            for (var formatterId in Html2BookConfig.pages[pageId].formatters)
            {
                var formatter = Html2BookConfig.formatters[formatterId]; // TODO: check if not null if needed
                page_converters[formatter.converter] = true;
            }
            for (var converter in page_converters)
            {
                if (Html2BookConfig.converters[converter].imports)
                    appendImports(Html2BookConfig.converters[converter].imports);
            }

            // embed buttons
            for (var formatterId in Html2BookConfig.pages[pageId].formatters)
            {
                var formatter = Html2BookConfig.formatters[formatterId]; // TODO: check if not null if needed

                if (formatter.imports)
                    appendImports(formatter.imports);

                // generate button and button script
                generateButton(tabId, pageId, formatterId, Html2BookConfig.savers.fs);
            }
        });
    });
});
