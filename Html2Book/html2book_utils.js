
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
    for (var import in imports)
    {
        appendScriptFile(import);
    }
}

function generateButton(name, converter_klass, converter_params, saver_klass)
{
    // generate button script
    var script_text =
        "function convert2" + name + "(){\n" +
        "    var convert_handler = new " + converter_klass + "(" + (converter_params ? converter_params : "") + ");\n" +
        "    var save_handler = new " + saver_klass + "('book." + name + ");\n" +
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

function requestFile(file_name)
{
    if (window.XMLHttpRequest)
    {
        xhttp = new XMLHttpRequest();
    }
    else
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", xml_file, false);
    xhttp.send("");

//    if (xmlhttp.readyState != 4 || xmlhttp.status != 200)
//        alert("ERROR");

    return xhttp;
}

function loadFileAsText(text_file)
{
    return requestFile(text_file).responseText;
}

function loadXMLDoc(xml_file)
{
    return requestFile(xml_file).responseXML;
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
        return xsltProcessor.transformToFragment(xml_data, document);
    }
}

// Config functions

function loadConfig(config_text)
{
    var config_str = "var Html2BookConfig = {" + config_text + "};";
    eval(config_str);
}

function checkConfigConverters()
{
    // xslt is a default converter
    if (!Html2BookConfig.converters ||
        !Html2BookConfig.converters.xslt ||
        !Html2BookConfig.converters.xslt.klass)
    {
        Html2BookConfig.converters.xslt = {
            imports : [ 'http://ejohn.org/files/htmlparser.js',
                        'https://github.com/HaronK/Html2Book/raw/master/Html2Book/xslt_converter.js'],
            klass : 'XsltConverter',
        };
    }

    var converters = [];
    for (var converter in Html2BookConfig.converters)
    {
        if (!Html2BookConfig.converters[converter].klass)
            alert("Converter '" + converter + "' doesn't contain mandatory field 'klass'");
        converters.push(converter);
    }
    return converters;

}

function checkConfigSavers()
{
    // fs is a default saver
    if (!Html2BookConfig.savers ||
        !Html2BookConfig.savers.fs ||
        !Html2BookConfig.savers.fs.klass)
    {
        Html2BookConfig.savers.fs = {
            imports : [ 'https://raw.github.com/eligrey/FileSaver.js/master/FileSaver.js',
                        'https://raw.github.com/eligrey/Blob.js/master/Blob.js',
                        'https://github.com/HaronK/Html2Book/raw/master/Html2Book/fs_saver.js'],
            klass : 'FsSaver',
        };
    }

    for (var saver in Html2BookConfig.savers)
    {
        if (!Html2BookConfig.savers[saver].klass)
            alert("Saver '" + saver + "' doesn't contain mandatory field 'klass'");
    }
}

function checkCofigPages(converters)
{
    // check pages config
    for (var page in Html2BookConfig.pages)
    {
        if (!Html2BookConfig.pages[page].addr)
            alert("Page '" + page + "' doesn't contain mandatory field 'addr'");
        if (!Html2BookConfig.pages[page].embed)
            alert("Page '" + page + "' doesn't contain mandatory field 'embed'");

        var converters = Html2BookConfig.pages[page].converters;
        if (!converters || len(converters) == 0)
            alert("Page '" + page + "' should contain at leas one converter"); // ?
        for (var converter in converters)
        {
            if (!converters[converter].type)
                alert("Page '" + page + "' converter '" + converter + "' doesn't contain mandatory field 'type'");
            if (converters.indexOf(converters[converter].type) == -1)
                alert("Page '" + page + "' converter '" + converter + "' has unknown type '"
                        + converters[converter].type + "'");
        }
    }
}

function checkConfig()
{
    if (!Html2BookConfig)
        alert("Html2BookConfig is not defined");

    var converters = checkConfigConverters();
    checkConfigSavers();
    checkCofigPages(converters);
}

function getPageConfig(addr)
{
    for (var page in Html2BookConfig.pages)
    {
        for (var a in Html2BookConfig.pages[page].addr)
        {
            var patt = new RegExp(a);
            if (patt.test(addr))
            {
                return page;
            }
        }
    }
    return null;
}
