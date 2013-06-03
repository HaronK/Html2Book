
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

function requestXslChain(data, result)
{
    if (data.index == data.chain.length)
        return;

    requestFileAsync(resolvePath(data.chain[data.index++]), null, function(fileData, obj)
    {
        result.push(fileData);
        if (data.index < data.chain.length)
            requestXslChain(data, result);
    });
}

// XSLT converter

function XsltConverter(formatter, pageFormatter, onload)
{
    this.formatter = formatter;
    this.fileNameRegEx = pageFormatter.fileNameRegEx;

    if (pageFormatter.xslChain != null)
    {
        this.xsl_data = null;
        this.xslChain = [];
        requestXslChain({index: 0, chain: pageFormatter.xslChain}, this.xslChain);
        onload(this);
    }
    else
    {
        this.xsl_data = null;
        this.xslChain = null;
        requestFileAsync(resolvePath(formatter.xsl), this, function(fileData, obj)
        {
            var formatterXsl = fileData;

            requestFileAsync(resolvePath(pageFormatter.xsl), obj, function(fileData, obj)
            {
                // embed pageXsl into formatterXsl
                var pageData = fileData.match(/<!--\s*BEGIN\s*-->\s*([\s\S]*)\s*<!--\s*END\s*-->/m);
                obj.xsl_data = formatterXsl.replace(/<!--\s*PAGE_INCLUDE\s*-->/, pageData[1]);
                onload(this);
            });
        });
    }
}

XsltConverter.prototype = {
    _applyXSLT: function(xml_doc, transform_params)
    {
        if (this.xsl_data != null)
        {
            var xsl_doc = str2XML(this.xsl_data);
            return applyXSLT(xsl_doc, xml_doc, transform_params);
        }

        // parse xsl chain
        var result = xml_doc;
        for (var i = 0; i < this.xslChain.length; i++)
        {
            var xsl_doc = str2XML(this.xslChain[i]);
            var res = applyXSLT(xsl_doc, result, transform_params);
            result = res;
        }
        return result;
    },
    convert: function(pageUrl, page_data, formatter_params, onfinish)
    {
        var xhtml_data = HTMLtoXML(page_data);
        xhtml_data = xhtml_data.replace(/\s+xmlns="[^"]*"/, ""); // HACK!!!

        var xml_doc = str2XML(xhtml_data);

        var formatter_handler = null;
        var transform_params = {};
        if (this.formatter.klass)
        {
            formatter_handler = new window[this.formatter.klass];
            if (formatter_handler.getTransformParams)
                transform_params = formatter_handler.getTransformParams(formatter_params);
        }

        var result = this._applyXSLT(xml_doc, transform_params);

        var title = xml_doc.evaluate(this.fileNameRegEx, xml_doc, null, XPathResult.ANY_TYPE, null)
                        .iterateNext().textContent;

        if (!result)
        {
            sendPageResponse("generate", {status: "failure", message: "Result of applying XSL transformation is null"});
            onfinish({data: null, title: title, xhtml: xhtml_data, xsl: this.xsl_data});
            return;
        }

        // do page post transformation work if needed
        if (formatter_handler && formatter_handler.postTransform)
        {
            var xsl_data = this.xsl_data;
            showPageMessage({message: "Applying post transform step..."});
            formatter_handler.postTransform(pageUrl, result, function()
            {
                showPageMessage({message: " done", type: "add"});
                onfinish({data: result, title: title, xhtml: xhtml_data, xsl: xsl_data});
            });
        }
        else
        {
            onfinish({data: result, title: title, xhtml: xhtml_data, xsl: this.xsl_data});
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
