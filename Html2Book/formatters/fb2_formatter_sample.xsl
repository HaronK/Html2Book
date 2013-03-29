<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- BEGIN -->
	<!-- ****************** FB2 tags ****************** -->
	<xsl:template name="title-info.genres.data"/> <!-- Mandatory -->

	<xsl:variable name="title-info.author.first-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="title-info.author.middle-name"/>
	<xsl:variable name="title-info.author.last-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="title-info.author.nickname"/> <!-- Mandatory if title-title-info.author.first-name and title-info.author.last-name are not exist -->
	<xsl:variable name="title-info.author.home-page"/>
	<xsl:variable name="title-info.author.email"/>
	<xsl:variable name="title-info.author.id"/>
	<xsl:variable name="title-info.book-title"/> <!-- Mandatory -->
	<xsl:variable name="title-info.annotation"/>
	<xsl:variable name="title-info.keywords"/>
	<xsl:variable name="title-info.date"/>
	<xsl:variable name="title-info.coverpage"/> <!-- on|off(empty) -->
	<xsl:variable name="title-info.coverpage.image"/> <!-- Mandatory if title-info.coverpage is on -->
	<xsl:variable name="title-info.lang"/> <!-- Mandatory -->
	<xsl:variable name="title-info.src-lang"/>
	
	<xsl:variable name="document-info.author.first-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="document-info.author.middle-name"/>
	<xsl:variable name="document-info.author.last-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="document-info.author.nickname"/> <!-- Mandatory if title-title-info.author.first-name and title-info.author.last-name are not exist -->
	<xsl:variable name="document-info.author.home-page"/>
	<xsl:variable name="document-info.author.email"/>
	<xsl:variable name="document-info.author.id"/>
	<xsl:variable name="document-info.program-used"/>
	<xsl:variable name="document-info.date"/> <!-- Mandatory -->
	<xsl:variable name="document-info.src-url"/>
	<xsl:variable name="document-info.src-ocr"/>
	<xsl:variable name="document-info.id"/> <!-- Mandatory -->
	<xsl:variable name="document-info.version"/> <!-- Mandatory -->
	<xsl:variable name="document-info.history"/>
	<xsl:variable name="document-info.publisher"/>
	
	<xsl:variable name="custom-info"/>
	
	<xsl:variable name="body.title"/>
	<xsl:variable name="body.epigraph"/>
	
	<xsl:template name="body.sections.data"/> <!-- Mandatory -->
	<!-- END -->

</xsl:stylesheet>