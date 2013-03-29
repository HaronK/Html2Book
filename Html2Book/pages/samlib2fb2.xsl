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
	<xsl:template name="title-info.genres.data"> <!-- Mandatory -->
		<genre>sf_fantasy</genre>
		<genre>sf</genre>
	</xsl:template>

	<xsl:variable name="title-info.author.first-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="title-info.author.middle-name"/>
	<xsl:variable name="title-info.author.last-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="title-info.author.nickname" select="//body/center/table//tr[1]/td[1]//li[2]/a" /> <!-- Mandatory if title-title-info.author.first-name and title-info.author.last-name are not exist -->
	<xsl:variable name="title-info.author.home-page"/>
	<xsl:variable name="title-info.author.email"/>
	<xsl:variable name="title-info.author.id"/>
	<xsl:variable name="title-info.book-title" select="//body/center/h2" /> <!-- Mandatory -->
	<xsl:variable name="title-info.annotation" select="//body/center/table//tr[2]/td/ul/li/font/i" />
	<xsl:variable name="title-info.keywords"/>
	<xsl:variable name="title-info.date"/>
	<xsl:variable name="title-info.coverpage"/> <!-- on|off(empty) -->
	<xsl:variable name="title-info.coverpage.image"/> <!-- Mandatory if title-info.coverpage is on -->
	<xsl:variable name="title-info.lang">ru</xsl:variable> <!-- Mandatory -->
	<xsl:variable name="title-info.src-lang"/>
	
	<xsl:variable name="document-info.author.first-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="document-info.author.middle-name"/>
	<xsl:variable name="document-info.author.last-name"/> <!-- Mandatory if title-info.author.nickname doesn't exist -->
	<xsl:variable name="document-info.author.nickname" select="//body/center/table//tr[1]/td[1]//li[2]/a" /> <!-- Mandatory if title-title-info.author.first-name and title-info.author.last-name are not exist -->
	<xsl:variable name="document-info.author.home-page"/>
	<xsl:variable name="document-info.author.email"/>
	<xsl:variable name="document-info.author.id"/>
	<xsl:variable name="document-info.program-used"/>
	<xsl:variable name="document-info.date" select="//body/center/table//tr[1]/td[1]//li[3]" /> <!-- Mandatory -->
	<xsl:variable name="document-info.src-url"/>
	<xsl:variable name="document-info.src-ocr"/>
	<xsl:variable name="document-info.id" select="//body/center/table//tr[1]/td[1]//li[1]/a/@href" /> <!-- Mandatory -->
	<xsl:variable name="document-info.version" select="1" /> <!-- Mandatory -->
	<xsl:variable name="document-info.history"/>
	<xsl:variable name="document-info.publisher"/>
	
	<xsl:variable name="custom-info"/>
	
	<xsl:variable name="body.image"/>
	<xsl:variable name="body.title"/>
	<xsl:variable name="body.epigraph"/>
	<xsl:template name="body.sections.data"> <!-- Mandatory -->
		<section>
			<xsl:apply-templates select="//body/dd" mode="content"/>
		</section>
	</xsl:template>

	<xsl:param name="body-comments"/> <!-- on|off(empty) -->
	<xsl:variable name="body-comments.image"/>
	<xsl:variable name="body-comments.title"/>
	<xsl:variable name="body-comments.epigraph"/>
	<xsl:template name="body-comments.sections.data"/> <!-- Mandatory if body-comments is on -->
	<!-- END -->

</xsl:stylesheet>