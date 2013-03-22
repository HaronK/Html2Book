
function XsltConverter(xsl_file, onload)
{
    var localFile = xsl_file.split("|");
    var file2load = (localFile.length == 2 && localFile[0] == 'local')
                    ? chrome.extension.getURL(localFile[1])
                    : xsl_file;
    requestFile(file2load, function(xhr) {
        onload(xhr.responseText);
    });
}

function str2XML(text)
{
    if (window.ActiveXObject)
    {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(text);
    }
    else
    {
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
}

XsltConverter.prototype = {
    convert : function(page_data)
    {
        var xml_data = HTMLtoXML(page_data);
        xml_data = xml_data.replace(/\s+xmlns="[^"]*"/, ""); // HACK!!!
        return applyXSLT(str2XML(this.xsl_data), str2XML(xml_data));
    },
};
