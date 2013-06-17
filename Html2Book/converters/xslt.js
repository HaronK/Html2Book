
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

function requestXslChain(data, result, obj, onload)
{
    if (data.index >= data.chain.length)
        return;

    obj.showMessage({message: "Loading " + data.chain[data.index] + "..."});
    requestFileAsync(resolvePath(data.chain[data.index++]), obj, function(fileData, obj)
    {
        result.push(fileData);

        obj.showMessage({message: " loaded", type: "add"});

        if (data.index < data.chain.length)
            requestXslChain(data, result, obj, onload);
        else
            onload(obj);
    });
}

// XSLT converter

function XsltConverter(data, onload)
{
    this.init_data = data;

    if (data.pageFormatter.xslChain != null)
    {
        this.xsl_data = null;
        this.xslChain = [];
        requestXslChain({index: 0, chain: data.pageFormatter.xslChain}, this.xslChain, this, onload);
    }
    else
    {
        this.xsl_data = null;
        this.xslChain = null;
        requestFileAsync(resolvePath(data.formatter.xsl), this, function(fileData, obj)
        {
            var formatterXsl = fileData;

            requestFileAsync(resolvePath(data.pageFormatter.xsl), obj, function(fileData, obj)
            {
                // embed pageXsl into formatterXsl
                var pageData = fileData.match(/<!--\s*BEGIN\s*-->\s*([\s\S]*)\s*<!--\s*END\s*-->/m);
                obj.xsl_data = formatterXsl.replace(/<!--\s*PAGE_INCLUDE\s*-->/, pageData[1]);
                onload(obj);
            });
        });
    }
}

XsltConverter.prototype = {
    sendResponse: function(id, data)
    {
        this.init_data.sendResponse(id, data);
    },
    showMessage: function(data)
    {
        this.init_data.sendResponse("message", data);
    },
    _applyXSLT: function(xml_doc, transform_params)
    {
        if (this.xsl_data != null)
        {
            this.showMessage({message: "Applying XSLT..."});
            var xsl_doc = str2XML(this.xsl_data);
            var res = applyXSLT(xsl_doc, xml_doc, transform_params);
            this.showMessage({message: " applied", type: "add"});
            return res;
        }

        // parse xsl chain
        var result = xml_doc;
        for (var i = 0; i < this.xslChain.length; i++)
        {
            this.showMessage({message: "Applying " + this.init_data.pageFormatter.xslChain[i] + "..."});
            var xsl_doc = str2XML(this.xslChain[i]);
            var res = applyXSLT(xsl_doc, result, transform_params);
            result = res;
            this.showMessage({message: " applied", type: "add"});
        }
        return result;
    },
    convert: function(pageUrl, page_data, formatter_params, onfinish)
    {
        this.showMessage({message: "Converting HTML to XHTML..."});
        var xhtml_data = HTMLtoXML(page_data);
        this.showMessage({message: " converted", type: "add"});

        this.showMessage({message: "Removing xmlns attributes..."});
        xhtml_data = xhtml_data.replace(/\s+xmlns="[^"]*"/, ""); // HACK!!!
        this.showMessage({message: " removed", type: "add"});

        this.showMessage({message: "Parsing XHTML..."});
        var xml_doc = str2XML(xhtml_data);
        this.showMessage({message: " parsed", type: "add"});

        var formatter_handler = null;
        var transform_params = {};
        if (this.init_data.formatter.klass)
        {
            formatter_handler = new window[this.init_data.formatter.klass];
            if (formatter_handler.getTransformParams)
                transform_params = formatter_handler.getTransformParams(formatter_params);
        }

        var result = this._applyXSLT(xml_doc, transform_params);

        var title = xml_doc.evaluate(this.init_data.pageFormatter.fileNameRegEx, xml_doc, null,
                XPathResult.ANY_TYPE, null).iterateNext().textContent;

        if (!result)
        {
            this.sendResponse("generate", {status: "failure", message: "Result of applying XSL transformation is null"});
            onfinish({data: null, title: title, xhtml: xhtml_data, xsl: this.xsl_data});
            return;
        }

        // do page post transformation work if needed
        if (formatter_handler && formatter_handler.postTransform)
        {
            var xsl_data = this.xsl_data;
            this.showMessage({message: "Applying post transform step..."});
            formatter_handler.postTransform(pageUrl, result, function()
            {
//                this.showMessage({message: " done", type: "add"});
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
