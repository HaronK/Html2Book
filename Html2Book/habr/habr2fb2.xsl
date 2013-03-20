<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="xml" indent="yes"/>
	
	<!-- FB2 tag values -->
	<xsl:variable name="title-info_author_nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="title-info_author_home-page" select="//div[@class='author']/a[1]/@href"/>
	<xsl:variable name="title-info_book-title" select="//span[@class='post_title']"/>
	<xsl:variable name="title-info_coverpage_image"/>
	<xsl:variable name="title-info_lang" select="html/@xml:lang"/>
	
	<xsl:variable name="document-info_author_nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="document-info_date" select="//div[@class='published']"/>
	<xsl:variable name="document-info_id" select="//meta[@property='og:url']/@content"/>
	<xsl:variable name="document-info_version" select="//div[@class='pageviews']"/>
	
	<!-- FB2 tag data templates -->
	<xsl:template name="title-info_genres">
		<!-- Mandatory -->
		<genre>history_russia</genre>
	</xsl:template>
	
	<xsl:template name="title-info_author_first-name">
		<!-- <first-name><xsl:value-of select="$title-info_author_first-name"/></first-name> -->
	</xsl:template>
	<xsl:template name="title-info_author_middle-name">
		<!-- <middle-name><xsl:value-of select="$title-info_author_middle-name"/></middle-name> -->
	</xsl:template>
	<xsl:template name="title-info_author_last-name">
		<!-- <last-name><xsl:value-of select="$title-info_author_last-name"/></last-name> -->
	</xsl:template>
	<xsl:template name="title-info_author_nickname">
		<nickname><xsl:value-of select="$title-info_author_nickname"/></nickname>
	</xsl:template>
	<xsl:template name="title-info_author_home-page">
		<home-page><xsl:value-of select="$title-info_author_home-page"/></home-page>
	</xsl:template>
	<xsl:template name="title-info_author_email">
		<!-- <email><xsl:value-of select="$title-info_author_email"/></email> -->
	</xsl:template>
	<xsl:template name="title-info_author_id">
		<!-- <id><xsl:value-of select="$title-info_author_id"/></id> -->
	</xsl:template>
	
	<xsl:template name="title-info_author">
		<!-- Mandatory -->
		<author>
			<xsl:call-template name="title-info_author_first-name"/>
			<xsl:call-template name="title-info_author_middle-name"/>
			<xsl:call-template name="title-info_author_last-name"/>
			<xsl:call-template name="title-info_author_nickname"/>
			<xsl:call-template name="title-info_author_home-page"/>
			<xsl:call-template name="title-info_author_email"/>
			<xsl:call-template name="title-info_author_id"/>
		</author>
	</xsl:template>
	
	<xsl:template name="title-info_book-title">
		<!-- Mandatory -->
		<book-title><xsl:value-of select="$title-info_book-title"/></book-title>
	</xsl:template>
	
	<xsl:template name="title-info_annotation">
		<!-- <annotation><xsl:value-of select="$title-info_annotation"/></annotation> -->
	</xsl:template>
	
	<xsl:template name="title-info_keywords">
		<!-- <keywords><xsl:value-of select="$title-info_keywords"/></keywords> -->
	</xsl:template>
	
	<xsl:template name="title-info_date">
		<!-- <date value="2002-10-19"><xsl:value-of select="$title-info_date"/></date> -->
	</xsl:template>
	
	<xsl:template name="title-info_coverpage_image">
		<!-- Mandatory -->
		<image><xsl:value-of select="$title-info_coverpage_image"/></image>
	</xsl:template>
	
	<xsl:template name="title-info_coverpage">
		<!-- <coverpage><xsl:call-template name="title-info_coverpage_image"/></coverpage> -->
	</xsl:template>
	
	<xsl:template name="title-info_lang">
		<!-- Mandatory -->
		<lang><xsl:value-of select="$title-info_lang"/></lang>
	</xsl:template>
	
	<xsl:template name="title-info_src-lang">
		<!-- <src-lang><xsl:value-of select="$title-info_src-lang"/></src-lang> -->
	</xsl:template>
	
	<xsl:template name="title-info_translator">
		<!-- <translator>
			<xsl:call-template name="title-info_translator_first-name"/>
			<xsl:call-template name="title-info_translator_middle-name"/>
			<xsl:call-template name="title-info_translator_last-name"/>
			<xsl:call-template name="title-info_translator_nickname"/>
			<xsl:call-template name="title-info_translator_home-page"/>
			<xsl:call-template name="title-info_translator_email"/>
			<xsl:call-template name="title-info_translator_id"/>
		</translator> -->
	</xsl:template>
	
	<xsl:template name="title-info_sequence">
		<!-- <sequence name="sequence_name" number="1" xml:lang="ru"/> -->
	</xsl:template>
	
	<xsl:template name="title-info">
		<title-info>
			<xsl:call-template name="title-info_genres"/>
			<xsl:call-template name="title-info_author"/>
			<xsl:call-template name="title-info_book-title"/>
			<xsl:call-template name="title-info_annotation"/>
			<xsl:call-template name="title-info_keywords"/>
			<xsl:call-template name="title-info_date"/>
			<xsl:call-template name="title-info_coverpage"/>
			<xsl:call-template name="title-info_lang"/>
			<xsl:call-template name="title-info_src-lang"/>
			<xsl:call-template name="title-info_translator"/>
			<xsl:call-template name="title-info_sequence"/>
		</title-info>
	</xsl:template>
	
	<xsl:template name="document-info_author_first-name">
		<!-- <first-name><xsl:value-of select="$document-info_author_first-name"/></first-name> -->
	</xsl:template>
	<xsl:template name="document-info_author_middle-name">
		<!-- <middle-name><xsl:value-of select="$document-info_author_middle-name"/></middle-name> -->
	</xsl:template>
	<xsl:template name="document-info_author_last-name">
		<!-- <last-name><xsl:value-of select="$document-info_author_last-name"/></last-name> -->
	</xsl:template>
	<xsl:template name="document-info_author_nickname">
		<nickname><xsl:value-of select="$document-info_author_nickname"/></nickname>
	</xsl:template>
	<xsl:template name="document-info_author_home-page">
		<!-- <home-page><xsl:value-of select="$document-info_author_home-page"/></home-page> -->
	</xsl:template>
	<xsl:template name="document-info_author_email">
		<!-- <email><xsl:value-of select="$document-info_author_email"/></email> -->
	</xsl:template>
	<xsl:template name="document-info_author_id">
		<!-- <id><xsl:value-of select="$document-info_author_id"/></id> -->
	</xsl:template>
	
	<xsl:template name="document-info_author">
		<!-- Mandatory -->
		<author>
			<xsl:call-template name="document-info_author_first-name"/>
			<xsl:call-template name="document-info_author_middle-name"/>
			<xsl:call-template name="document-info_author_last-name"/>
			<xsl:call-template name="document-info_author_nickname"/>
			<xsl:call-template name="document-info_author_home-page"/>
			<xsl:call-template name="document-info_author_email"/>
			<xsl:call-template name="document-info_author_id"/>
		</author>
	</xsl:template>
	
	<xsl:template name="document-info_program-used">
		<!-- <program-used xml:lang="ru"><xsl:value-of select="$document-info_program-used"/></program-used> -->
	</xsl:template>
	
	<xsl:template name="document-info_date">
		<!-- Mandatory -->
		<!--  value="2002-10-19" -->
		<date><xsl:value-of select="$document-info_date"/></date>
	</xsl:template>
	
	<xsl:template name="document-info_id">
		<!-- Mandatory -->
		<id><xsl:value-of select="$document-info_id"/></id>
	</xsl:template>
	
	<xsl:template name="document-info_version">
		<!-- Mandatory -->
		<version><xsl:value-of select="$document-info_version"/></version>
	</xsl:template>
	
	<xsl:template name="document-info">
		<!-- Mandatory -->
		<title-info>
			<xsl:call-template name="document-info_author"/>
			<xsl:call-template name="document-info_program-used"/>
			<xsl:call-template name="document-info_date"/>
			<xsl:call-template name="document-info_id"/>
			<xsl:call-template name="document-info_version"/>
		</title-info>
	</xsl:template>
	
	<!-- FB2 generator -->
	<xsl:template match="/">
		<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
			<description>
				<xsl:call-template name="title-info"/>
				<xsl:call-template name="document-info"/>
			</description>
		</FictionBook>
	</xsl:template>
</xsl:stylesheet>