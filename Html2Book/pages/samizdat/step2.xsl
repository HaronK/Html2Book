<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="xml" indent="yes"/>

<!-- 	<xsl:param name="date"/> -->
<!-- 	<xsl:param name="time"/> -->

	<xsl:template match="text()" mode="sections">
		<xsl:variable name="content-text" select="."/>
		<xsl:if test="normalize-space($content-text) != ''">
			<xsl:value-of select="$content-text"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="img" mode="sections">
		<xsl:if test="@src">
			<image alt="{@src}"><xsl:apply-templates mode="sections"/></image>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="dd" mode="sections">
		<p><xsl:apply-templates mode="sections"/></p>
	</xsl:template>

	<xsl:template match="body.sections.data" mode="content">
		<body.sections.data><section>
				<xsl:apply-templates mode="sections"/>
		</section></body.sections.data>
	</xsl:template>

	<xsl:template match="@*|node()" mode="content">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()" mode="content"/>
		</xsl:copy>
	</xsl:template>
	
	<xsl:template match="/">
		<xsl:apply-templates mode="content"/>
	</xsl:template>

</xsl:stylesheet>