
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

function resolvePath(path)
{
    var localFile = path.split("|");
    return (localFile.length == 2 && localFile[0] == 'local') ? chrome.extension.getURL(localFile[1]) : path;
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

function checkObjectFields(obj, fields)
{
    if (!obj)
        return false;
    for (var field in fields)
    {
        if (!obj.hasOwnProperty(field))
            return false;
    }
    return true;
}

function initDefaultConfig(config)
{
    if (!config)
        config = {};

    if (!config.converters)
        config.converters = {};

    // xslt is a default converter
    if (!checkObjectFields(config.converters.xslt, ["klass", "mime"]))
    {
        config.converters.xslt = {
            imports : [ '../extern/htmlparser.js', '../converters/xslt.js'],
            klass : XsltConverter,
            mime : 'text/xml;charset=' + document.characterSet,
            checkFormatter: function(formatter)
            {
                if (!formatter.hasOwnProperty("xsl"))
                {
                    alert("Formatter '" + formatter + "' doesn't contain mandatory field 'xsl'");
                    return false;
                }
                return true;
            }
        };
    }

    if (!config.formatters)
        config.formatters = {};

    // fb2 is a default formatter
    if (!checkObjectFields(config.formatters.fb2, ["converter", "initialize", "finalize", "xsl"]))
    {
        config.formatters.fb2 = {
            converter: "xslt",
            initialize: function() {},
            finalize: function() {},
            xsl: "local|../formatters/fb2.xsl",
        };
    }

    if (!config.savers)
        config.savers = {};

    // fs is a default saver
    if (!checkObjectFields(config.savers.fs, ["klass"]))
    {
        config.savers.fs = {
            imports : [ '../extern/FileSaver.js', '../savers/fs.js'],
            klass : FsSaver,
        };
    }

    if (!config.pages)
        config.pages = {};

    // habr_article is a default page
    if (!checkObjectFields(config.pages.habr_article, ["addr", "converters", "embed"]))
    {
        // test data
        config.pages.habr_article = {
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
        };
    }
}

function checkMandatoryFields(fields, obj, objName)
{
    for (var field in fields)
    {
        if (!obj.hasOwnProperty(field))
        {
            alert(objName + " doesn't contain mandatory field '" + field + "'");
            return false;
        }
    }
    return true;
}

function checkConfigConverters(config)
{
    var converters = [];
    for (var converter in config.converters)
    {
        if (!checkMandatoryFields(["klass", "mime"], config.converters[converter], "Converter '" + converter + "'"))
            return null;
        converters.push(converter);
    }
    return converters;

}

function checkConfigFormatters(config)
{
    var formatters = [];
    for (var formatter in config.formatters)
    {
        if (!checkMandatoryFields(["converter", "mime"], config.formatters[formatter], "Converter '" + formatter + "'"))
            return null;

        if (!config.converters.hasOwnProperty(config.formatters[formatter].converter))
        {
            alert("Formatter '" + formatter + "' uses unknown converter '" + config.formatters[formatter].converter + "'");
            return null;
        }

        // converter should check formatter if needed. usually it's fields existence check
        var converter = config.converters[config.formatters[formatter].converter];
        if (converter.checkFormatter && !converter.checkFormatter(config.formatters[formatter]))
            return null;

        formatters.push(converter);
    }
    return formatters;

}

function checkConfigSavers(config)
{
    for (var saver in config.savers)
    {
        if (!checkMandatoryFields(["klass"], config.savers[saver], "Saver '" + saver + "'"))
            return null;
    }
}

function checkCofigPages(config, global_converters)
{
    for (var page in config.pages)
    {
        if (!checkMandatoryFields(["addr", "embed"], config.pages[page], "Page '" + page + "'"))
            return null;

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
    config = initDefaultConfig(config);

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
