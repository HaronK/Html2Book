
function Html2Book(convert_handler, save_handler)
{
	// convert current document to XML
	var doc_xml = HTMLtoXML(document.documentElement.outerHTML);

	// convert XML to book
	var book_data = convert_handler.convert(doc_xml);

	// save book
	save_handler.save(book_data);
}
