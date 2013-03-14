
function XsltConverter(xsl_file)
{
    this.xsl_data = loadXMLDoc(xsl_file);
}

XsltConverter.prototype = {
    convert : function(page_data)
    {
        var xml_data = HTMLtoXML(page_data);
        return applyXSLT(this.xsl_data, xml_data);
    },
};
