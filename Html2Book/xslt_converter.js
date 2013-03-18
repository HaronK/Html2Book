
function XsltConverter(xsl_file, onload)
{
    this.xsl_data = null;
    requestFile(xsl_file, function(xhr) {
        this.xsl_data = xhr.responseText;
        onload(xhr.responseText);
    });
}

XsltConverter.prototype = {
    convert : function(page_data)
    {
        var xml_data = HTMLtoXML(page_data);
        return applyXSLT(this.xsl_data, xml_data);
    },
};
