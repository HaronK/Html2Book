
function appendImports(imports)
{
    for (var i = 0; i < imports.length; i++)
    {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = imports[i];
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

function generateButton(name, converter_klass, converter_params, saver_klass, mime)
{
    var h2b_button = document.createElement("button");
    h2b_button.type = "button";
    h2b_button.disabled = true;

    var convert_handler = new converter_klass(converter_params, function(data) {
        convert_handler.xsl_data = data;
        h2b_button.disabled = false;
    });
    var save_handler = new saver_klass('book.' + name, mime);
    var listener = {
            handleEvent : function(evt)
            {
                var book_data = convert_handler.convert(document.documentElement.outerHTML);
                save_handler.save(book_data);
            }
    };

    h2b_button.addEventListener("click", listener, false);

    var h2b_button_text = document.createTextNode(name);
    h2b_button.appendChild(h2b_button_text);

    document.body.appendChild(h2b_button);
}

var storage = chrome.storage.sync;
var Html2BookConfig = null;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {id: "location"}, function(response)
    {
        var message = document.querySelector('#message');
        message.innerText += 'done ' + "(" + response.location.href + ")";

        storage.get('html2book_config', function(config)
        {
            Html2BookConfig = checkConfig(config);

            var page = getPageConfig(Html2BookConfig, response.location.href);

            // add default saver imports
//            appendImports(Html2BookConfig.savers.fs.imports);

            // add page converters imports and embed buttons
            var page_converters = Html2BookConfig.pages[page].converters;
            for (var converter_name in page_converters)
            {
                var type = page_converters[converter_name].type;
                var converter = Html2BookConfig.converters[type];
//                var imports = converter.imports;
//                appendImports(imports);

                // generate button and button script
                generateButton(converter_name, converter.klass, page_converters[converter_name].params,
                        Html2BookConfig.savers.fs.klass, converter.mime);
            }
        });
    });
});
