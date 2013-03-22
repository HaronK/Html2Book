
function len(obj)
{
    return Object.keys(obj).length;
}

function appendScriptFile(file)
{
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = file;
    document.head.appendChild(script);
}

function appendScriptText(text)
{
    var script = document.createElement('script');
    script.type = "text/javascript";
    var script_text = document.createTextNode(text);
    script.appendChild(script_text);
    document.head.appendChild(elem);
}

function embedAfter(blockClass, element)
{
    var elem = document.getElementsByClassName(blockClass);
    if (elem.length == 0)
    {
        alert("Cannot find '" + blockClass + "' element");
        return;
    }
    else
        elem[0].appendChild(element);
}

function appendImports(imports)
{
    for (var import_ in imports)
    {
        appendScriptFile(import_);
    }
}

function generateButton(name, converter_klass, converter_params, saver_klass, mime)
{
    // generate button script
    var script_text =
        "function convert2" + name + "(){\n" +
        "    var convert_handler = new " + converter_klass + "(" + (converter_params ? converter_params : "") + ");\n" +
        "    var save_handler = new " + saver_klass + "('book." + name + ", " + mime + ");\n" +
        "    var book_data = convert_handler.convert(document.documentElement.outerHTML);\n" +
        "    save_handler.save(book_data);\n" +
        "}";
    appendScriptText(script_text);

    var h2b_button = document.createElement("button");
    h2b_button.type = "button";
    h2b_button.onclik = "convert2" + name + "()";
    var h2b_button_text = document.createTextNode(name);
    h2b_button.appendChild(h2b_button_text);
    return h2b_button;
}

// ---------------------------------------------------------------------------

// Source: http://www.w3schools.com/xsl/xsl_client.asp

function requestFile(file_name, onload)
{
    if (window.XMLHttpRequest)
    {
        xhr = new XMLHttpRequest();
    }
    else
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhr.open("GET", file_name, true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4)
            onload(xhr);
    };
    xhr.send(null);

//    if (xmlhttp.readyState != 4 || xmlhttp.status != 200)
//        alert("ERROR");

    return xhr;
}

function applyXSLT(xsl_data, xml_data)
{
    // code for IE
    if (window.ActiveXObject)
    {
        return xml_data.transformNode(xsl_data);
    }
    // code for Mozilla, Firefox, Opera, etc.
    else if (document.implementation && document.implementation.createDocument)
    {
        xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsl_data);
        var result = xsltProcessor.transformToDocument(xml_data);
        return result;
    }
}

// Config functions

function loadConfig(config_text)
{
    var config_str = "var Html2BookConfig = {" + config_text + "};";
    eval(config_str);
}

function checkConfigConverters(config)
{
    // xslt is a default converter
    if (!config.converters)
        config.converters = {};

    if (!config.converters.xslt ||
        !config.converters.xslt.klass ||
        !config.converters.xslt.mime)
    {
        config.converters.xslt = {
            imports : [ '../extern/htmlparser.js', '../converters/xslt_converter.js'],
            klass : XsltConverter,
            mime : 'text/xml;charset=' + document.characterSet,
        };
    }

    var converters = [];
    for (var converter in config.converters)
    {
        if (!config.converters[converter].klass)
        {
            alert("Converter '" + converter + "' doesn't contain mandatory field 'klass'");
            return null;
        }
        if (!config.converters[converter].mime)
        {
            alert("Converter '" + converter + "' doesn't contain mandatory field 'mime'");
            return null;
        }
        converters.push(converter);
    }
    return converters;

}

function checkConfigSavers(config)
{
    // fs is a default saver
    if (!config.savers)
        config.savers = {};

    if (!config.savers.fs ||
        !config.savers.fs.klass)
    {
        config.savers.fs = {
            imports : [ '../extern/FileSaver.js', '../extern/Blob.js', '../savers/fs_saver.js'],
            klass : FsSaver,
        };
    }

    for (var saver in config.savers)
    {
        if (!config.savers[saver].klass)
        {
            alert("Saver '" + saver + "' doesn't contain mandatory field 'klass'");
            return null;
        }
    }
}

function checkCofigPages(config, global_converters)
{
    if (!config.pages)
    {
        // test data
        config.pages = {
            habr_article: {
                addr: ['http://habrahabr.ru/post/\\d+',
                       'http://habrahabr.ru/company/\\w+/blog/\\d+'], // pages url template
                converters: {
                    fb2: {
                        type: 'xslt',
                        params: 'local|../habr/habr2fb2.xsl',
                    },
                },
                embed: function(element){ // embedding element into the page
                    var element2 = element.cloneNode(true);
                    embedAfter('title', element);
                    embedAfter('content', element2);
                },
            },
        };
    }

    // check pages config
    for (var page in config.pages)
    {
        if (!config.pages[page].addr)
        {
            alert("Page '" + page + "' doesn't contain mandatory field 'addr'");
            return;
        }
        if (!config.pages[page].embed)
        {
            alert("Page '" + page + "' doesn't contain mandatory field 'embed'");
            return;
        }

        var converters = config.pages[page].converters;
        if (!converters || len(converters) == 0)
        {
            alert("Page '" + page + "' should contain at leas one converter"); // ?
            return;
        }
        for (var converter in converters)
        {
            if (!converters[converter].type)
            {
                alert("Page '" + page + "' converter '" + converter + "' doesn't contain mandatory field 'type'");
                return;
            }
            if (global_converters.indexOf(converters[converter].type) == -1)
            {
                alert("Page '" + page + "' converter '" + converter + "' has unknown type '"
                        + converters[converter].type + "'");
                return;
            }
        }
    }
}

function checkConfig(config)
{
    if (!config)
        config = {};

    var converters = checkConfigConverters(config);
    checkConfigSavers(config);
    checkCofigPages(config, converters);

    return config;
}

function getPageConfig(config, location)
{
    if (config.pages)
    {
        for (var page in config.pages)
        {
            var addr = config.pages[page].addr;
            for (var i = 0; i < addr.length; i++)
            {
                var patt = new RegExp(addr[i]);
                if (patt.test(location))
                {
                    return page;
                }
            }
        }
    }
    return null;
}
