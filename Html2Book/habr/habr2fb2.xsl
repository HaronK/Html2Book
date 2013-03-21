<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="xml" indent="yes"/>
	
	<!-- ****************** Content parsers ****************** -->
	<xsl:key name="bits"
		match="node()[not(self::br|self::ul|self::h4)]"
		use="generate-id((..|preceding-sibling::br[1]|preceding-sibling::ul[1]|preceding-sibling::h4[1])[last()])"/>
	
	<xsl:template match="a" mode="content-p">
		<xsl:if test="@href">
			<a href="{@href}"><xsl:apply-templates mode="content-p"/></a>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="text()" mode="content-p">
		<xsl:variable name="content-text" select="."/>
		<xsl:if test="normalize-space($content-text) != ''">
			<xsl:value-of select="normalize-space($content-text)"/>
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
	
	<xsl:template match="@*|node()" mode="content">
		<p><xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/></p>
		<xsl:apply-templates select="(br|ul|h4)" mode="content"/>
	</xsl:template>
	
	<!-- ****************** FB2 tag values ****************** -->
	<xsl:variable name="title-info_author_first-name"/>
	<xsl:variable name="title-info_author_middle-name"/>
	<xsl:variable name="title-info_author_last-name"/>
	<xsl:variable name="title-info_author_nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="title-info_author_home-page" select="//div[@class='author']/a[1]/@href"/>
	<xsl:variable name="title-info_author_email"/>
	<xsl:variable name="title-info_author_id"/>
	<xsl:variable name="title-info_book-title" select="//title"/>
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
	<xsl:variable name="document-info_program-used"/>
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

	<!-- ****************** Utilities ****************** -->
	<xsl:template name="mandatory-tag">
		<xsl:param name="name" />
		<xsl:param name="value" />
		<xsl:if test="string($value) = ''">
			<xsl:message terminate="yes">
				Mandatory variable '<xsl:value-of select="$name" />'is not defined!
			</xsl:message>
		</xsl:if>
	</xsl:template>
	
	<!-- ****************** FB2 tag data templates ****************** -->
	<xsl:template name="stylesheets">
		<!-- <stylesheet type="text/css"/> -->
	</xsl:template>
	
	<xsl:template name="title-info_genres">
		<!-- Mandatory -->
		<genre>comp_www</genre>
		<genre>comp_programming</genre>
		<genre>comp_hard</genre>
		<genre>comp_soft</genre>
		<genre>comp_db</genre>
		<genre>comp_osnet</genre>
		<genre>computers</genre>
	</xsl:template>
	
	<xsl:template name="title-info_author_first-name">
		<xsl:if test="string($title-info_author_first-name) != ''">
			<first-name><xsl:value-of select="$title-info_author_first-name"/></first-name>
		</xsl:if>
	</xsl:template>
	<xsl:template name="title-info_author_middle-name">
		<xsl:if test="string($title-info_author_middle-name) != ''">
			<middle-name><xsl:value-of select="$title-info_author_middle-name"/></middle-name>
		</xsl:if>
	</xsl:template>
	<xsl:template name="title-info_author_last-name">
		<xsl:if test="string($title-info_author_last-name) != ''">
			<last-name><xsl:value-of select="$title-info_author_last-name"/></last-name>
		</xsl:if>
	</xsl:template>
	<xsl:template name="title-info_author_nickname">
		<xsl:if test="string($title-info_author_nickname) != ''">
			<nickname><xsl:value-of select="$title-info_author_nickname"/></nickname>
		</xsl:if>
	</xsl:template>
	<xsl:template name="title-info_author_home-pages">
		<xsl:if test="string($title-info_author_home-page) != ''">
			<home-page><xsl:value-of select="$title-info_author_home-page"/></home-page>
		</xsl:if>
	</xsl:template>
	<xsl:template name="title-info_author_emails">
		<xsl:if test="string($title-info_author_email) != ''">
			<email><xsl:value-of select="$title-info_author_email"/></email>
		</xsl:if>
	</xsl:template>
	<xsl:template name="title-info_author_id">
		<xsl:if test="string($title-info_author_id) != ''">
			<id><xsl:value-of select="$title-info_author_id"/></id>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="title-info_authors">
		<!-- Mandatory -->
		<!-- TODO: check mandatory tags -->
		<author>
			<xsl:call-template name="title-info_author_first-name"/>
			<xsl:call-template name="title-info_author_middle-name"/>
			<xsl:call-template name="title-info_author_last-name"/>
			<xsl:call-template name="title-info_author_nickname"/>
			<xsl:call-template name="title-info_author_home-pages"/>
			<xsl:call-template name="title-info_author_emails"/>
			<xsl:call-template name="title-info_author_id"/>
		</author>
	</xsl:template>
	
	<xsl:template name="title-info_book-title">
		<!-- Mandatory -->
		<xsl:call-template name="mandatory-tag">
			<xsl:with-param name="name">title-info_book-title</xsl:with-param>
			<xsl:with-param name="value" select="$title-info_book-title"/>
		</xsl:call-template>

		<book-title><xsl:value-of select="$title-info_book-title"/></book-title>
	</xsl:template>
	
	<xsl:template name="title-info_annotation">
		<xsl:if test="string($title-info_annotation) != ''">
			<annotation><p><xsl:value-of select="$title-info_annotation"/></p></annotation>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="title-info_keywords">
		<xsl:if test="string($title-info_keywords) != ''">
			<keywords><xsl:value-of select="$title-info_keywords"/></keywords>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="title-info_date">
		<xsl:if test="string($title-info_date) != ''">
			<!-- TODO: set value attribute properly -->
			<date value="2002-10-19"><xsl:value-of select="$title-info_date"/></date>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="title-info_coverpage_images">
		<!-- Mandatory -->
		<xsl:call-template name="mandatory-tag">
			<xsl:with-param name="name">title-info_coverpage_image</xsl:with-param>
			<xsl:with-param name="value" select="$title-info_coverpage_image"/>
		</xsl:call-template>

		<image><xsl:value-of select="$title-info_coverpage_image"/></image>
	</xsl:template>
	
	<xsl:template name="title-info_coverpage">
		<xsl:if test="string($title-info_coverpage) = 'on'">
			<coverpage><xsl:call-template name="title-info_coverpage_images"/></coverpage>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="title-info_lang">
		<!-- Mandatory -->
		<xsl:call-template name="mandatory-tag">
			<xsl:with-param name="name">title-info_lang</xsl:with-param>
			<xsl:with-param name="value" select="$title-info_lang"/>
		</xsl:call-template>

		<lang><xsl:value-of select="$title-info_lang"/></lang>
	</xsl:template>
	
	<xsl:template name="title-info_src-lang">
		<xsl:if test="string($title-info_src-lang) != ''">
			<src-lang><xsl:value-of select="$title-info_src-lang"/></src-lang>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="title-info_translators">
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
	
	<xsl:template name="title-info_sequences">
		<!-- <sequence name="sequence_name" number="1" xml:lang="ru"/> -->
	</xsl:template>
	
	<xsl:template name="title-info">
		<!-- Mandatory -->
		<title-info>
			<xsl:call-template name="title-info_genres"/>
			<xsl:call-template name="title-info_authors"/>
			<xsl:call-template name="title-info_book-title"/>
			<xsl:call-template name="title-info_annotation"/>
			<xsl:call-template name="title-info_keywords"/>
			<xsl:call-template name="title-info_date"/>
			<xsl:call-template name="title-info_coverpage"/>
			<xsl:call-template name="title-info_lang"/>
			<xsl:call-template name="title-info_src-lang"/>
			<xsl:call-template name="title-info_translators"/>
			<xsl:call-template name="title-info_sequences"/>
		</title-info>
	</xsl:template>
	
	<xsl:template name="src-title-info">
		<!-- <src-title-info>
			<xsl:call-template name="src-title-info_genres"/>
			<xsl:call-template name="src-title-info_author"/>
			<xsl:call-template name="src-title-info_book-title"/>
			<xsl:call-template name="src-title-info_annotation"/>
			<xsl:call-template name="src-title-info_keywords"/>
			<xsl:call-template name="src-title-info_date"/>
			<xsl:call-template name="src-title-info_coverpage"/>
			<xsl:call-template name="src-title-info_lang"/>
			<xsl:call-template name="src-title-info_src-lang"/>
			<xsl:call-template name="src-title-info_translator"/>
			<xsl:call-template name="src-title-info_sequence"/>
		</src-title-info> -->
	</xsl:template>
	
	
	<xsl:template name="document-info_author_first-name">
		<xsl:if test="string($document-info_author_first-name) != ''">
			<first-name><xsl:value-of select="$document-info_author_first-name"/></first-name>
		</xsl:if>
	</xsl:template>
	<xsl:template name="document-info_author_middle-name">
		<xsl:if test="string($document-info_author_middle-name) != ''">
			<middle-name><xsl:value-of select="$document-info_author_middle-name"/></middle-name>
		</xsl:if>
	</xsl:template>
	<xsl:template name="document-info_author_last-name">
		<xsl:if test="string($document-info_author_last-name) != ''">
			<last-name><xsl:value-of select="$document-info_author_last-name"/></last-name>
		</xsl:if>
	</xsl:template>
	<xsl:template name="document-info_author_nickname">
		<xsl:if test="string($document-info_author_nickname) != ''">
			<nickname><xsl:value-of select="$document-info_author_nickname"/></nickname>
		</xsl:if>
	</xsl:template>
	<xsl:template name="document-info_author_home-pages">
		<xsl:if test="string($document-info_author_home-page) != ''">
			<home-page><xsl:value-of select="$document-info_author_home-page"/></home-page>
		</xsl:if>
	</xsl:template>
	<xsl:template name="document-info_author_emails">
		<xsl:if test="string($document-info_author_email) != ''">
			<email><xsl:value-of select="$document-info_author_email"/></email>
		</xsl:if>
	</xsl:template>
	<xsl:template name="document-info_author_id">
		<xsl:if test="string($document-info_author_id) != ''">
			<id><xsl:value-of select="$document-info_author_id"/></id>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="document-info_authors">
		<!-- Mandatory -->
		<author>
			<xsl:call-template name="document-info_author_first-name"/>
			<xsl:call-template name="document-info_author_middle-name"/>
			<xsl:call-template name="document-info_author_last-name"/>
			<xsl:call-template name="document-info_author_nickname"/>
			<xsl:call-template name="document-info_author_home-pages"/>
			<xsl:call-template name="document-info_author_emails"/>
			<xsl:call-template name="document-info_author_id"/>
		</author>
	</xsl:template>
	
	
	<xsl:template name="document-info_program-used">
		<xsl:if test="string($document-info_program-used) != ''">
			<!-- TODO: set xml:lang attribute properly -->
			<program-used xml:lang="ru"><xsl:value-of select="$document-info_program-used"/></program-used>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="document-info_date">
		<!-- Mandatory -->
		<xsl:call-template name="mandatory-tag">
			<xsl:with-param name="name">document-info_date</xsl:with-param>
			<xsl:with-param name="value" select="$document-info_date"/>
		</xsl:call-template>

		<!-- TODO: set value attribute properly -->
		<date value="2002-10-19"><xsl:value-of select="$document-info_date"/></date>
	</xsl:template>
	
	<xsl:template name="document-info_src-urls">
		<xsl:if test="string($document-info_src-url) != ''">
			<src-url><xsl:value-of select="$document-info_src-url"/></src-url>
		</xsl:if>
	</xsl:template>

	<xsl:template name="document-info_src-ocr">
		<xsl:if test="string($document-info_src-ocr) != ''">
			<!-- TODO: set xml:lang attribute properly -->
			<src-ocr xml:lang="ru"><xsl:value-of select="$document-info_src-ocr"/></src-ocr>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="document-info_id">
		<!-- Mandatory -->
		<xsl:call-template name="mandatory-tag">
			<xsl:with-param name="name">document-info_id</xsl:with-param>
			<xsl:with-param name="value" select="$document-info_id"/>
		</xsl:call-template>

		<id><xsl:value-of select="$document-info_id"/></id>
	</xsl:template>
	
	<xsl:template name="document-info_version">
		<!-- Mandatory -->
		<xsl:call-template name="mandatory-tag">
			<xsl:with-param name="name">document-info_version</xsl:with-param>
			<xsl:with-param name="value" select="$document-info_version"/>
		</xsl:call-template>

		<version><xsl:value-of select="$document-info_version"/></version>
	</xsl:template>
	
	<xsl:template name="document-info_history">
		<xsl:if test="string($document-info_history) != ''">
			<!-- TODO: set id and xml:lang attributes properly -->
			<history id="history" xml:lang="ru"><xsl:value-of select="$document-info_history"/></history>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="document-info_publishers">
		<xsl:if test="string($document-info_publisher) != ''">
			<!-- TODO: set xml:lang attribute properly -->
			<publisher xml:lang="ru"><xsl:value-of select="$document-info_publisher"/></publisher>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="document-info">
		<!-- Mandatory -->
		<document-info>
			<xsl:call-template name="document-info_authors"/>
			<xsl:call-template name="document-info_program-used"/>
			<xsl:call-template name="document-info_date"/>
			<xsl:call-template name="document-info_src-urls"/>
			<xsl:call-template name="document-info_src-ocr"/>
			<xsl:call-template name="document-info_id"/>
			<xsl:call-template name="document-info_version"/>
			<xsl:call-template name="document-info_history"/>
			<xsl:call-template name="document-info_publishers"/>
		</document-info>
	</xsl:template>
	
	<xsl:template name="publish-info">
		<!-- TODO: add implementation -->
		<!-- <publish-info>
			<xsl:call-template name="publish-info_book-name"/>
			<xsl:call-template name="publish-info_publisher"/>
			<xsl:call-template name="publish-info_city"/>
			<xsl:call-template name="publish-info_year"/>
			<xsl:call-template name="publish-info_isbn"/>
			<xsl:call-template name="publish-info_sequences"/>
		</publish-info> -->
	</xsl:template>
	
	<xsl:template name="custom-infos">
		<xsl:if test="string($custom-info) != ''">
			<!-- TODO: set info-type attribute properly -->
			<custom-info info-type="info"><xsl:value-of select="$custom-info"/></custom-info>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="description">
		<!-- Mandatory -->
		<description>
			<xsl:call-template name="title-info"/>
			<!-- <xsl:call-template name="src-title-info"/> -->
			<xsl:call-template name="document-info"/>
			<xsl:call-template name="publish-info"/>
			<xsl:call-template name="custom-infos"/>
			<!-- <xsl:call-template name="outputs"/> -->
		</description>
	</xsl:template>
	
	<xsl:template name="body_image">
		<!-- <image xlink:href=""/> -->
	</xsl:template>
	
	<xsl:template name="body_title">
		<xsl:if test="string($body_title) != ''">
			<!-- TODO: set xml:lang attribute properly -->
			<title xml:lang="ru"><xsl:value-of select="$body_title"/></title>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="body_epigraphs">
		<xsl:if test="string($body_epigraph) != ''">
			<!-- TODO: set id attribute properly -->
			<epigraph id="id1"><xsl:value-of select="$body_epigraph"/></epigraph>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="body_sections">
		<!-- Mandatory -->
		<xsl:call-template name="body_sections_data"/>
	</xsl:template>
	
	<xsl:template name="body">
		<!-- Mandatory -->
		<body>
			<xsl:call-template name="body_image"/>
			<xsl:call-template name="body_title"/>
			<xsl:call-template name="body_epigraphs"/>
			<xsl:call-template name="body_sections"/>
		</body>
	</xsl:template>
	
	<xsl:template name="body-notes">
		<!-- <body type="notes">
		</body> -->
	</xsl:template>
	
	<xsl:template name="body-comments">
		<!-- <body type="comments">
		</body> -->
	</xsl:template>
	
	<xsl:template name="binaries">
		<!-- <binary id="cover.jpg" content-type="image/jpeg">Data</binary> -->
	</xsl:template>
	
	<!-- FB2 generator -->
	<xsl:template match="/">
		<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
			<xsl:call-template name="stylesheets"/>
			<xsl:call-template name="description"/>
			<xsl:call-template name="body"/>
			<xsl:call-template name="body-notes"/>
			<xsl:call-template name="body-comments"/>
			<xsl:call-template name="binaries"/>
		</FictionBook>
	</xsl:template>
</xsl:stylesheet>