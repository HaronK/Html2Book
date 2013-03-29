
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

    convert: function(page_data)
    {
        var xml_data = HTMLtoXML(page_data);
        xml_data = xml_data.replace(/\s+xmlns="[^"]*"/, ""); // HACK!!!

        var xsl_doc = str2XML(this.xsl_data);
        var xml_doc = str2XML(xml_data);
        var result = applyXSLT(xsl_doc, xml_doc);

        var title = xml_doc.evaluate(this.fileNameRegEx, xml_doc, null, XPathResult.ANY_TYPE, null)
                        .iterateNext().textContent;
        return {xml: result, title: title};
    },

    serialize: function(xmlData)
    {
        var serializer = new XMLSerializer();
        return serializer.serializeToString(xmlData);
    },
};
