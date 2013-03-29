<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- BEGIN -->
	<!-- ****************** Content parsers ****************** -->
	<xsl:key name="bits"
		match="node()[not(self::dd)]"
		use="generate-id((..|preceding-sibling::dd[1]
							)[last()])"/>

	<xsl:template match="text()" mode="content-p">
		<xsl:variable name="content-text" select="."/>
		<xsl:if test="normalize-space($content-text) != ''">
			<xsl:value-of select="$content-text"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="dd" mode="content">
		<p><xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></p>
	</xsl:template>

	<xsl:template match="@*|node()" mode="content">
		<p><xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></p>
		<xsl:apply-templates select="dd" mode="content"/>
	</xsl:template>
	
	<!-- ****************** FB2 tags ****************** -->
	<xsl:template name="title-info_genres_data"> <!-- Mandatory -->
		<genre>sf_fantasy</genre>
		<genre>sf</genre>
	</xsl:template>

	<xsl:variable name="title-info_author_first-name"/> <!-- Mandatory if title-info_author_nickname doesn't exist -->
	<xsl:variable name="title-info_author_middle-name"/>
	<xsl:variable name="title-info_author_last-name"/> <!-- Mandatory if title-info_author_nickname doesn't exist -->
	<xsl:variable name="title-info_author_nickname" select="//body/center/table//tr[1]/td[1]//li[2]/a" /> <!-- Mandatory if title-title-info_author_first-name and title-info_author_last-name are not exist -->
	<xsl:variable name="title-info_author_home-page"/>
	<xsl:variable name="title-info_author_email"/>
	<xsl:variable name="title-info_author_id"/>
	<xsl:variable name="title-info_book-title" select="//body/center/h2" /> <!-- Mandatory -->
	<xsl:variable name="title-info_annotation" select="//body/center/table//tr[2]/td/ul/li/font/i" />
	<xsl:variable name="title-info_keywords"/>
	<xsl:variable name="title-info_date"/>
	<xsl:variable name="title-info_coverpage"/> <!-- on|off(empty) -->
	<xsl:variable name="title-info_coverpage_image"/> <!-- Mandatory if title-info_coverpage is on -->
	<xsl:variable name="title-info_lang">ru</xsl:variable> <!-- Mandatory -->
	<xsl:variable name="title-info_src-lang"/>
	
	<xsl:variable name="document-info_author_first-name"/> <!-- Mandatory if title-info_author_nickname doesn't exist -->
	<xsl:variable name="document-info_author_middle-name"/>
	<xsl:variable name="document-info_author_last-name"/> <!-- Mandatory if title-info_author_nickname doesn't exist -->
	<xsl:variable name="document-info_author_nickname" select="//body/center/table//tr[1]/td[1]//li[2]/a" /> <!-- Mandatory if title-title-info_author_first-name and title-info_author_last-name are not exist -->
	<xsl:variable name="document-info_author_home-page"/>
	<xsl:variable name="document-info_author_email"/>
	<xsl:variable name="document-info_author_id"/>
	<xsl:variable name="document-info_program-used"/>
	<xsl:variable name="document-info_date" select="//body/center/table//tr[1]/td[1]//li[3]" /> <!-- Mandatory -->
	<xsl:variable name="document-info_src-url"/>
	<xsl:variable name="document-info_src-ocr"/>
	<xsl:variable name="document-info_id" select="//body/center/table//tr[1]/td[1]//li[1]/a/@href" /> <!-- Mandatory -->
	<xsl:variable name="document-info_version" select="1" /> <!-- Mandatory -->
	<xsl:variable name="document-info_history"/>
	<xsl:variable name="document-info_publisher"/>
	
	<xsl:variable name="custom-info"/>
	
	<xsl:variable name="body_title"/>
	<xsl:variable name="body_epigraph"/>
	
	<xsl:template name="body_sections_data"> <!-- Mandatory -->
		<section>
			<xsl:apply-templates select="//body/dd" mode="content"/>
		</section>
	</xsl:template>
	<!-- END -->

</xsl:stylesheet>