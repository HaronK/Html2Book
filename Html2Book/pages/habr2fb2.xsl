<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<!-- BEGIN -->
	<!-- ****************** Content parsers ****************** -->
	<xsl:key name="bits"
		match="node()[not(self::br|self::ul|self::ol|self::h4|self::h5|self::h6|self::table|self::code|self::pre)]"
		use="generate-id((..|preceding-sibling::br[1]
							|preceding-sibling::ul[1]
							|preceding-sibling::ol[1]
							|preceding-sibling::h4[1]
							|preceding-sibling::h5[1]
							|preceding-sibling::h6[1]
							|preceding-sibling::table[1]
							|preceding-sibling::code[1]
							|preceding-sibling::pre[1]
							)[last()])"/>
	
	<xsl:template name="content-code-print">
		<xsl:param name="pText" select="."/>
		<xsl:choose>
			<xsl:when test="normalize-space($pText) != ''">
				<p><code><xsl:value-of select="$pText"/></code></p>
			</xsl:when>
			<xsl:otherwise>
				<empty-line/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:variable name="_crlf"><xsl:text>
</xsl:text></xsl:variable>

	<xsl:template name="content-code">
		<xsl:param name="pText" select="."/>
		<!--
			This is hack! It should be:
			<xsl:variable name="crlf" select="&#xA;"/>
			but it doesn't work for me.
		-->
		<xsl:variable name="crlf" select="string($_crlf)"/>
		<xsl:if test="string-length($pText)">
			<xsl:choose>
				<xsl:when test="contains($pText, $crlf)">
					<xsl:call-template name="content-code-print">
						<xsl:with-param name="pText" select="substring-before($pText, $crlf)"/>
					</xsl:call-template>
 					<xsl:call-template name="content-code">
						<xsl:with-param name="pText" select="substring-after($pText, $crlf)"/>
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="content-code-print">
						<xsl:with-param name="pText" select="$pText"/>
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>

	<xsl:template match="a" mode="content-p">
		<xsl:if test="@href">
			<a href="{@href}"><xsl:apply-templates mode="content-p"/></a>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="b" mode="content-p">
		<strong><xsl:apply-templates mode="content-p"/></strong>
	</xsl:template>
	
	<xsl:template match="i" mode="content-p">
		<emphasis><xsl:apply-templates mode="content-p"/></emphasis>
	</xsl:template>
	
	<xsl:template match="s|strike|del" mode="content-p">
		<strikethrough><xsl:apply-templates mode="content-p"/></strikethrough>
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
		<p><xsl:call-template name="parse-paragraph"/></p>
	</xsl:template>

	<xsl:template match="ol" mode="content">
		<xsl:for-each select="li">
			<p><xsl:value-of select="position()"/><xsl:text>. </xsl:text>
			<xsl:call-template name="parse-paragraph"/></p>
			<xsl:call-template name="parse-tags"/>
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="ul" mode="content">
		<xsl:for-each select="li">
			<p><xsl:text>* </xsl:text>
			<xsl:call-template name="parse-paragraph"/></p>
			<xsl:call-template name="parse-tags"/>
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="h4" mode="content">
		<empty-line/>
		<subtitle><xsl:call-template name="parse-paragraph"/></subtitle>
	</xsl:template>
	
	<xsl:template match="h5" mode="content">
		<empty-line/>
		<subtitle><xsl:call-template name="parse-paragraph"/></subtitle>
	</xsl:template>
	
	<xsl:template match="h6" mode="content">
		<empty-line/>
		<subtitle><xsl:call-template name="parse-paragraph"/></subtitle>
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
		<p><strong>[------- TABLE BEGIN -------]</strong></p>
		<xsl:apply-templates mode="content-p"/>
		<p><strong>[------- TABLE END   -------]</strong></p>
	</xsl:template>
	
	<xsl:template match="code" mode="content">
		<empty-line/>
		<xsl:call-template name="content-code"/>
		<empty-line/>
	</xsl:template>
	
	<xsl:template name="parse-tags">
		<xsl:apply-templates select="(br|ul|ol|h4|h5|h6|table|code|pre)" mode="content"/>
	</xsl:template>
	
	<xsl:template name="parse-paragraph">
		<xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/>
	</xsl:template>
	
	<xsl:template match="pre" mode="content">
		<xsl:call-template name="parse-tags"/>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="content">
		<p><xsl:call-template name="parse-paragraph"/></p>
		<xsl:call-template name="parse-tags"/>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="comment-link">
		<a href="#{@id}"><xsl:value-of select="div[1]/div[1]/a[@class='username']"/> - <xsl:value-of select="div[1]/div[1]/time"/></a>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="comment-answers">
		<empty-line/>
		<p>Ответы:</p>
		<xsl:for-each select="div[@class='comment_item']">
			<p><xsl:value-of select="position()"/>. <xsl:apply-templates select="." mode="comment-link"/></p>
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="comment-navigate">
		<xsl:param name="title"/>
		<empty-line/>
		<p><xsl:value-of select="$title"/><xsl:apply-templates select="." mode="comment-link"/></p>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="comments">
		<xsl:param name="parent-link"/>
		<xsl:param name="parent-title"/>
		<xsl:for-each select="div[@class='comment_item']">
			<section id="{@id}">
				<title>
					<p><xsl:value-of select="div[1]/div[1]/a[@class='username']"/></p>
					<p><xsl:value-of select="div[1]/div[1]/time"/></p>
				</title>
				<section>
					<p><xsl:value-of select="div[1]/div[2]"/></p>
					
					<xsl:apply-templates select="div[@class='reply_comments']" mode="comment-answers"/>
					
					<empty-line/>
					<p>Наверх: <a href="#{$parent-link}"><xsl:value-of select="$parent-title"/></a></p>
					
					<xsl:apply-templates select="preceding-sibling::div[1]" mode="comment-navigate">
						<xsl:with-param name="title">Предыдущий: </xsl:with-param>
					</xsl:apply-templates>
					
					<xsl:apply-templates select="following-sibling::div[1]" mode="comment-navigate">
						<xsl:with-param name="title">Следующий: </xsl:with-param>
					</xsl:apply-templates>
				</section>
				<xsl:apply-templates select="div[@class='reply_comments']" mode="comments">
					<xsl:with-param name="parent-link" select="@id"/>
					<xsl:with-param name="parent-title"><xsl:value-of select="div[1]/div[1]/a[@class='username']"/> - <xsl:value-of select="div[1]/div[1]/time"/></xsl:with-param>
				</xsl:apply-templates>
			</section>
		</xsl:for-each>
	</xsl:template>
	
	<!-- ****************** FB2 tag values ****************** -->
	<xsl:template name="title-info.genres.data"> <!-- Mandatory -->
		<genre>comp_www</genre>
		<genre>comp_programming</genre>
		<genre>comp_hard</genre>
		<genre>comp_soft</genre>
		<genre>comp_db</genre>
		<genre>comp_osnet</genre>
		<genre>computers</genre>
	</xsl:template>

	<xsl:variable name="title-info.author.first-name"/>
	<xsl:variable name="title-info.author.middle-name"/>
	<xsl:variable name="title-info.author.last-name"/>
	<xsl:variable name="title-info.author.nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="title-info.author.home-page" select="//div[@class='author']/a[1]/@href"/>
	<xsl:variable name="title-info.author.email"/>
	<xsl:variable name="title-info.author.id"/>
	<xsl:variable name="title-info.book-title" select="//title"/> <!-- Mandatory -->
	<xsl:variable name="title-info.annotation">
		<xsl:for-each select="//div[@class='hubs']/a">
			<xsl:if test="position() > 1">, </xsl:if>
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="title-info.keywords">
		<xsl:for-each select="//ul[@class='tags']//a">
			<xsl:if test="position() > 1">, </xsl:if>
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="title-info.date"/>
	<xsl:variable name="title-info.coverpage">off</xsl:variable>
	<xsl:variable name="title-info.coverpage.image"/>
	<xsl:variable name="title-info.lang" select="html/@xml:lang"/> <!-- Mandatory -->
	<xsl:variable name="title-info.src-lang"/>
	
	<xsl:variable name="document-info.author.first-name"/>
	<xsl:variable name="document-info.author.middle-name"/>
	<xsl:variable name="document-info.author.last-name"/>
	<xsl:variable name="document-info.author.nickname" select="//div[@class='author']/a[1]"/>
	<xsl:variable name="document-info.author.home-page"/>
	<xsl:variable name="document-info.author.email"/>
	<xsl:variable name="document-info.author.id"/>
	<xsl:variable name="document-info.program-used">Html2Book Chrome extension (https://github.com/HaronK/Html2Book)</xsl:variable>
	<xsl:variable name="document-info.date" select="//div[@class='published']"/>
	<xsl:variable name="document-info.src-url" select="//meta[@property='og:url']/@content"/>
	<xsl:variable name="document-info.src-ocr"/>
	<xsl:variable name="document-info.id" select="//meta[@property='og:url']/@content"/>
	<xsl:variable name="document-info.version" select="//div[@class='pageviews']"/>
	<xsl:variable name="document-info.history"/>
	<xsl:variable name="document-info.publisher"/>
	
	<xsl:variable name="custom-info"/>
	
	<xsl:variable name="body.image"/>
	<xsl:variable name="body.title" select="//span[@class='post_title']"/>
	<xsl:variable name="body.epigraph"/>
	<xsl:template name="body.sections.data"> <!-- Mandatory -->
		<section id="main">
			<title><p><xsl:value-of select="//span[@class='post_title']"/></p></title>
			<xsl:apply-templates select="//div[@class='content html_format']" mode="content"/>
		</section>
	</xsl:template>

	<xsl:param name="body-comments">off</xsl:param> <!-- on|off(empty) -->
	<xsl:variable name="body-comments.image"/>
	<xsl:variable name="body-comments.title">Коментарии (<xsl:value-of select="//span[@id='comments_count']"/>)</xsl:variable>
	<xsl:variable name="body-comments.epigraph"/>
	<xsl:template name="body-comments.sections.data"> <!-- Mandatory if body-comments is on -->
		<xsl:apply-templates select="//div[@class='comments_list ']" mode="comments">
			<xsl:with-param name="parent-link">main</xsl:with-param>
			<xsl:with-param name="parent-title">Основная статья</xsl:with-param>
		</xsl:apply-templates>
	</xsl:template>
	<!-- END -->

</xsl:stylesheet>