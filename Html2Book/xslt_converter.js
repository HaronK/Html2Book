
function XsltConverter(xsl_file)
{
	this.xsl_data = loadXMLDoc(xsl_file);
}

XsltConverter.prototype = {
	convert: function(xml_data) {
		return applyXSLT(this.xsl_data, xml_data);
	},
};