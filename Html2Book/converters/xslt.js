
function str2XML(text)
{
    var doc;
    if (window.ActiveXObject)
    {
        doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(text);
    }
    else
    {
        var parser = new DOMParser();
        doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
}

function requestFileAsync(filePath, obj, onload)
{
    onUtilityRespond = function(fileData)
    {
        onload(fileData, obj);
    };
    utilityPort.postMessage({id: "loadFile", filePath: filePath});
}

// XSLT converter

function XsltConverter(formatter, pageFormatter, onload)
{
    this.formatter = formatter;
    this.fileNameRegEx = pageFormatter.fileNameRegEx;

    requestFileAsync(resolvePath(formatter.xsl), this, function(fileData, obj)
    {
        obj.formatterXsl = fileData;

        requestFileAsync(resolvePath(pageFormatter.xsl), obj, function(fileData, obj)
        {
            obj.pageXsl = fileData;

            obj._embed();
            onload();
        });
    });
}

XsltConverter.prototype = {
    _embed: function() // embed pageXsl into formatterXsl
    {
        var pageData = this.pageXsl.match(/<!--\s*BEGIN\s*-->\s*([\s\S]*)\s*<!--\s*END\s*-->/m);
        this.xsl_data = this.formatterXsl.replace(/<!--\s*PAGE_INCLUDE\s*-->/, pageData[1]);
    },

    convert: function(page_data, formatter_params, onfinish)
    {
        var xml_data = HTMLtoXML(page_data);
        xml_data = xml_data.replace(/\s+xmlns="[^"]*"/, ""); // HACK!!!

        var xsl_doc = str2XML(this.xsl_data);
        var xml_doc = str2XML(xml_data);

        var formatter_handler = null;
        var transform_params = {};
        if (this.formatter.klass)
        {
            formatter_handler = new window[this.formatter.klass];
            if (formatter_handler.getTransformParams)
                transform_params = formatter_handler.getTransformParams(formatter_params);
        }

        var result = applyXSLT(xsl_doc, xml_doc, transform_params);

        var title = xml_doc.evaluate(this.fileNameRegEx, xml_doc, null, XPathResult.ANY_TYPE, null)
                        .iterateNext().textContent;

        // do page post transformation work if needed
        if (formatter_handler && formatter_handler.postTransform)
        {
//            sendResponse({status: "message", message: "Applying post transform step..."});
            formatter_handler.postTransform(result, function()
            {
//                sendResponse({status: "message", message: " done", type: "add"});
                onfinish({xml: result, title: title});
            });
        }
        else
        {
            onfinish({xml: result, title: title});
        }
    },

    serialize: function(xmlData)
    {
        var serializer = new XMLSerializer();
        var result = serializer.serializeToString(xmlData);

        // TODO: HACK!!! This should be done by XSLTProcessor but it doesn't do this
        if (!result.startsWith('<?xml'))
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + result;

        return result;
    },
};
