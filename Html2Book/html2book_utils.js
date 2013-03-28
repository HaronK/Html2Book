
function len(obj)
{
    return Object.keys(obj).length;
}

String.prototype.endsWith = function(str)
{
    return (this.match(str + "$") == str);
};

String.prototype.startsWith = function(str)
{
    return (this.match("^" + str) == str);
};

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
    return (localFile.length == 2 && localFile[0] == 'chrome') ? chrome.extension.getURL(localFile[1]) : path;
}

// ---------------------------------------------------------------------------

// Source: http://www.w3schools.com/xsl/xsl_client.asp

function requestFileAsync(file_name, obj, onload)
{
    var xhr = new XMLHttpRequest();

    xhr.open("GET", file_name, true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4)
            onload(xhr, obj);
    };
    xhr.send(null);
}

function requestFileSync(file_name)
{
    var xhr = new XMLHttpRequest();

    xhr.open("GET", file_name, false);

    return xhr;
}

function applyXSLT(xsl_data, xml_data)
{
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl_data);
    var result = xsltProcessor.transformToDocument(xml_data);
    return result;
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
            imports : ['extern/htmlparser.js', 'converters/xslt.js'],
            klass : "XsltConverter",
            mime : 'text/xml;charset=' + document.characterSet,
            formatterFields: ["xsl", "embedPath"],
            pageFormatterFields: ["xsl"],
        };
    }

    if (!config.formatters)
        config.formatters = {};

    // fb2 is a default formatter
    if (!checkObjectFields(config.formatters.fb2, ["converter", "xsl"]))
    {
        config.formatters.fb2 = {
            imports : ['formatters/fb2.js'],
            klass : "Fb2Formatter",
            converter: "xslt",
            xsl: "chrome|../formatters/fb2.xsl",
            embedPath: "",
        };
    }

    if (!config.savers)
        config.savers = {};

    // fs is a default saver
    if (!checkObjectFields(config.savers.fs, ["klass"]))
    {
        config.savers.fs = {
            imports : [ 'extern/FileSaver.js', 'savers/fs.js'],
            klass : "FsSaver",
        };
    }

    if (!config.pages)
        config.pages = {};

    // habr_article is a default page
    if (!checkObjectFields(config.pages.habr_article, ["addr", "formatters"]))
    {
        // test data
        config.pages.habr_article = {
            addr: ['http://habrahabr\\.ru/post/\\d+',
                   'http://habrahabr\\.ru/company/\\w+/blog/\\d+'], // pages url template
            formatters: {
                fb2: { xsl: 'chrome|../pages/habr2fb2.xsl' },
            },
        };
    }

    // samlib_page is a default page
    if (!checkObjectFields(config.pages.samlib_page, ["addr", "formatters"]))
    {
        // test data
        config.pages.samlib_page = {
            addr: ['http://samlib\\.ru/\\w/\\w+/.+?\\.s?html'], // pages url template
            formatters: {
                fb2: { xsl: 'chrome|../pages/samlib2fb2.xsl' },
            },
        };
    }

    return config;
}

function validateMandatoryFields(fields, obj, objName)
{
    for (var i = 0; i < fields.length; ++i)
    {
        if (!obj.hasOwnProperty(fields[i]))
        {
            alert(objName + " doesn't contain mandatory field '" + field[i] +
                    "'. Mandatory fields: [" + fields + "]");
            return false;
        }
    }
    return true;
}

function checkConfigConverters(config)
{
    for (var converterId in config.converters)
    {
        if (!validateMandatoryFields(["klass", "mime"], config.converters[converterId], "Converter '" + converterId + "'"))
            return null;
    }
}

function checkConfigFormatters(config)
{
    for (var formatterId in config.formatters)
    {
        var formatter = config.formatters[formatterId];
        if (!validateMandatoryFields(["converter"], formatter, "Formatter '" + formatterId + "'"))
            return null;

        if (!config.converters.hasOwnProperty(formatter.converter))
        {
            alert("Formatter '" + formatterId + "' uses unknown converter '" + formatter.converter + "'");
            return null;
        }

        // check formatter fields required by converter
        var converter = config.converters[formatter.converter];
        if (converter.formatterFields &&
            !validateMandatoryFields(converter.formatterFields, formatter, "Formatter '" + formatterId + "'"))
            return null;
    }
}

function checkConfigSavers(config)
{
    for (var saverId in config.savers)
    {
        if (!validateMandatoryFields(["klass"], config.savers[saverId], "Saver '" + saverId + "'"))
            return null;
    }
}

function checkCofigPages(config)
{
    for (var pageId in config.pages)
    {
        var page = config.pages[pageId];
        if (!validateMandatoryFields(["addr", "formatters"], page, "Page '" + pageId + "'"))
            return null;

        for (var formatterId in page.formatters)
        {
            if (!config.formatters.hasOwnProperty(formatterId))
            {
                alert("Page '" + pageId + "' uses unknown formatter '" + formatterId + "'");
                return null;
            }

            var converter = config.converters[config.formatters[formatterId].converter];
            if (converter.pageFormatterFields &&
                !validateMandatoryFields(converter.pageFormatterFields, page.formatters[formatterId],
                    "Page '" + pageId + "' formatter '" + formatterId + "'"))
                return null;
        }
    }
}

function checkConfig(config)
{
    config = initDefaultConfig(config);

    checkConfigConverters(config);
    checkConfigSavers(config);
    checkCofigPages(config);

    return config;
}

function getPageConfig(config, location)
{
    if (config.pages)
    {
        for (var pageId in config.pages)
        {
            var addr = config.pages[pageId].addr;
            for (var i = 0; i < addr.length; i++)
            {
                var patt = new RegExp(addr[i]);
                if (patt.test(location))
                {
                    return pageId;
                }
            }
        }
    }
    return null;
}
