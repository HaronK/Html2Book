<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- BEGIN -->
	<!-- ****************** FB2 tags ****************** -->
	<xsl:template name="title-info_genres_data"/>

	<xsl:variable name="title-info_author_first-name"/>
	<xsl:variable name="title-info_author_middle-name"/>
	<xsl:variable name="title-info_author_last-name"/>
	<xsl:variable name="title-info_author_nickname"/>
	<xsl:variable name="title-info_author_home-page"/>
	<xsl:variable name="title-info_author_email"/>
	<xsl:variable name="title-info_author_id"/>
	<xsl:variable name="title-info_book-title"/>
	<xsl:variable name="title-info_annotation"/>
	<xsl:variable name="title-info_keywords"/>
	<xsl:variable name="title-info_date"/>
	<xsl:variable name="title-info_coverpage"/> <!-- on|off(empty) -->
	<xsl:variable name="title-info_coverpage_image"/>
	<xsl:variable name="title-info_lang"/>
	<xsl:variable name="title-info_src-lang"/>
	
	<xsl:variable name="document-info_author_first-name"/>
	<xsl:variable name="document-info_author_middle-name"/>
	<xsl:variable name="document-info_author_last-name"/>
	<xsl:variable name="document-info_author_nickname"/>
	<xsl:variable name="document-info_author_home-page"/>
	<xsl:variable name="document-info_author_email"/>
	<xsl:variable name="document-info_author_id"/>
	<xsl:variable name="document-info_program-used"/>
	<xsl:variable name="document-info_date"/>
	<xsl:variable name="document-info_src-url"/>
	<xsl:variable name="document-info_src-ocr"/>
	<xsl:variable name="document-info_id"/>
	<xsl:variable name="document-info_version"/>
	<xsl:variable name="document-info_history"/>
	<xsl:variable name="document-info_publisher"/>
	
	<xsl:variable name="custom-info"/>
	
	<xsl:variable name="body_title"/>
	<xsl:variable name="body_epigraph"/>
	
	<xsl:template name="body_sections_data"/>
	<!-- END -->

</xsl:stylesheet>