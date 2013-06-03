<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="xml" indent="yes"/>

<!-- 	<xsl:param name="date"/> -->
<!-- 	<xsl:param name="time"/> -->

	<xsl:template match="text()" mode="content">
		<xsl:variable name="content-text" select="."/>
		<xsl:if test="normalize-space($content-text) != ''">
			<xsl:value-of select="$content-text"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="@*|node()" mode="content">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()" mode="content"/>
		</xsl:copy>
	</xsl:template>
	
	<xsl:variable name="hrBegin" select="(//hr)[2]/following-sibling::*"/>
	<xsl:variable name="hrEnd" select="(//hr)[count(//hr)-1]/preceding::*"/>
	
	<xsl:template match="/">
		<book>
			<title-info.genres.data>
				<genre>sf_fantasy</genre>
				<genre>sf</genre>
			</title-info.genres.data>
			<title-info.author.nickname><xsl:value-of select="//body/center/table//tr[1]/td[1]//li[2]/a"/></title-info.author.nickname>
			<title-info.book-title><xsl:value-of select="//body/center/h2"/></title-info.book-title>
			<title-info.annotation.data><p><xsl:value-of select="//body/center/table//tr[2]/td/ul/li/font/i"/></p></title-info.annotation.data>
			<title-info.lang>ru</title-info.lang>

			<document-info.author.nickname><xsl:value-of select="//body/center/table//tr[1]/td[1]//li[2]/a"/></document-info.author.nickname>
			<document-info.date><xsl:value-of select="//body/center/table//tr[1]/td[1]//li[3]"/></document-info.date>
			<document-info.id><xsl:value-of select="//body/center/table//tr[1]/td[1]//li[1]/a/@href"/></document-info.id>
			<document-info.version>1</document-info.version>

			<body.sections.data><xsl:apply-templates select="$hrBegin[count(.| $hrEnd)=count($hrEnd)]" mode="content"/></body.sections.data>
		</book>
	</xsl:template>

</xsl:stylesheet>