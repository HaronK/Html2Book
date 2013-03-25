<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<!-- BEGIN -->
	<!-- ****************** Content parsers ****************** -->
	<xsl:key name="bits"
		match="node()[not(self::br|self::ul|self::h4|self::table)]"
		use="generate-id((..|preceding-sibling::br[1]|preceding-sibling::ul[1]|preceding-sibling::h4[1]|preceding-sibling::table[1])[last()])"/>
	
	<xsl:template match="text()" mode="content-code">
		<xsl:value-of select="."/>
	</xsl:template>

	<xsl:template match="code" mode="content-p">
		<code>
			<xsl:apply-templates mode="content-code"/>
		</code>
	</xsl:template>
	
	<xsl:template match="a" mode="content-p">
		<xsl:if test="@href">
			<a href="{@href}"><xsl:apply-templates mode="content-p"/></a>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="img" mode="content-p">
		<xsl:if test="@src">
			<image alt="{@src}"><xsl:apply-templates mode="content-p"/></image>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="text()" mode="content-p">
		<xsl:variable name="content-text" select="."/>
		<xsl:if test="normalize-space($content-text) != ''">
			<xsl:value-of select="$content-text"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="br" mode="content">
		<p><xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></p>
	</xsl:template>

	<xsl:template match="ul" mode="content">
		<xsl:for-each select="li">
			<p><xsl:value-of select="position()"/><xsl:text>. </xsl:text>
			<xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></p>
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="h4" mode="content">
		<subtitle><xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></subtitle>
	</xsl:template>
	
	<xsl:template match="tr" mode="content-p">
		<p>[ 
			<xsl:for-each select="th|td">
				<xsl:if test="position() > 1"> | </xsl:if>
				<xsl:apply-templates mode="content-p"/>
			</xsl:for-each>
		 ]</p>
	</xsl:template>
	
	<xsl:template match="table" mode="content">
		<p><strong>TABLE:</strong></p>
		<xsl:apply-templates mode="content-p"/>
		<p><strong>:TABLE</strong></p>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="content">
		<p><xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></p>
		<xsl:apply-templates select="(br|ul|h4|table)" mode="content"/>
	</xsl:template>
	
	<!-- ****************** FB2 tag values ****************** -->
	<xsl:template name="title-info_genres_data"> <!-- Mandatory -->
		<!-- Mandatory -->
		<genre>comp_www</genre>
		<genre>comp_programming</genre>
		<genre>comp_hard</genre>
		<genre>comp_soft</genre>
		<genre>comp_db</genre>
		<genre>comp_osnet</genre>
		<genre>computers</genre>
	</xsl:template>

	<xsl:variable name="title-info_author_first-name"/>
	<xsl:variable name="title-info_author_middle-name"/>
	<xsl:variable name="title-info_author_last-name"/>
	<xsl:variable name="title-info_author_nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="title-info_author_home-page" select="//div[@class='author']/a[1]/@href"/>
	<xsl:variable name="title-info_author_email"/>
	<xsl:variable name="title-info_author_id"/>
	<xsl:variable name="title-info_book-title" select="//title"/> <!-- Mandatory -->
	<xsl:variable name="title-info_annotation">
		<xsl:for-each select="//div[@class='hubs']/a">
			<xsl:if test="position() > 1">, </xsl:if>
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="title-info_keywords">
		<xsl:for-each select="//ul[@class='tags']//a">
			<xsl:if test="position() > 1">, </xsl:if>
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="title-info_date"/>
	<xsl:variable name="title-info_coverpage">off</xsl:variable>
	<xsl:variable name="title-info_coverpage_image"/>
	<xsl:variable name="title-info_lang" select="html/@xml:lang"/>
	<xsl:variable name="title-info_src-lang"/>
	
	<xsl:variable name="document-info_author_first-name"/>
	<xsl:variable name="document-info_author_middle-name"/>
	<xsl:variable name="document-info_author_last-name"/>
	<xsl:variable name="document-info_author_nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="document-info_author_home-page"/>
	<xsl:variable name="document-info_author_email"/>
	<xsl:variable name="document-info_author_id"/>
	<xsl:variable name="document-info_program-used">Html2Book Chrome extension (https://github.com/HaronK/Html2Book)</xsl:variable>
	<xsl:variable name="document-info_date" select="//div[@class='published']"/>
	<xsl:variable name="document-info_src-url" select="//meta[@property='og:url']/@content"/>
	<xsl:variable name="document-info_src-ocr"/>
	<xsl:variable name="document-info_id" select="//meta[@property='og:url']/@content"/>
	<xsl:variable name="document-info_version" select="//div[@class='pageviews']"/>
	<xsl:variable name="document-info_history"/>
	<xsl:variable name="document-info_publisher"/>
	
	<xsl:variable name="custom-info"/>
	
	<xsl:variable name="body_title" select="//span[@class='post_title']"/>
	<xsl:variable name="body_epigraph"/>
	
	<xsl:template name="body_sections_data">
		<!-- Mandatory -->
		<section>
			<xsl:apply-templates select="//div[@class='content html_format']" mode="content"/>
		</section>
	</xsl:template>
	<!-- END -->

</xsl:stylesheet>