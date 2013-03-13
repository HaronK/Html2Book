
// Source: http://www.w3schools.com/xsl/xsl_client.asp

function loadXMLDoc(xml_file)
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
	return xhttp.responseXML;
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
