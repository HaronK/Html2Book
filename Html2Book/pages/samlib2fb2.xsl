<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- BEGIN -->
	<!-- ****************** Content parsers ****************** -->
	<xsl:key name="bits"
		match="node()[not(self::dd|self::br
							|self::ul|self::ol
							|self::h1|self::h2|self::h3|self::h4|self::h5|self::h6
							|self::table|self::code
							|self::pre|self::div)]"
		use="generate-id((..|preceding-sibling::dd[1]
							|preceding-sibling::br[1]
							|preceding-sibling::ul[1]
							|preceding-sibling::ol[1]
							|preceding-sibling::h1[1]
							|preceding-sibling::h2[1]
							|preceding-sibling::h3[1]
							|preceding-sibling::h4[1]
							|preceding-sibling::h5[1]
							|preceding-sibling::h6[1]
							|preceding-sibling::table[1]
							|preceding-sibling::code[1]
							|preceding-sibling::pre[1]
							|preceding-sibling::div[1]
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
	
	<xsl:template match="i|em" mode="content-p">
		<emphasis><xsl:apply-templates mode="content-p"/></emphasis>
	</xsl:template>
	
	<xsl:template match="s|strike|del" mode="content-p">
		<strikethrough><xsl:apply-templates mode="content-p"/></strikethrough>
	</xsl:template>
	
	<xsl:template match="u" mode="content-p">
		<xsl:apply-templates mode="content-p"/>
	</xsl:template>
	
	<xsl:template match="img" mode="content-p">
		<xsl:if test="@src">
			<image alt="{@src}"><xsl:apply-templates mode="content-p"/></image>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="node()" mode="content-p">
		<xsl:apply-templates mode="content-p"/>
	</xsl:template>
	
	<xsl:template match="text()" mode="content-p">
		<xsl:variable name="content-text" select="."/>
		<xsl:if test="normalize-space($content-text) != ''">
			<xsl:value-of select="$content-text"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="dd|br" mode="content">
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
	
	<xsl:template match="h1|h2|h3|h4|h5|h6" mode="content">
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
		<xsl:apply-templates select="(dd|br|ul|ol|h1|h2|h3|h4|h5|h6|table|code|pre|div)" mode="content"/>
	</xsl:template>
	
	<xsl:template name="parse-paragraph">
		<xsl:apply-templates select="key('bits', generate-id())" mode="content-p"/>
	</xsl:template>
	
	<xsl:template match="pre" mode="content">
		<xsl:call-template name="parse-tags"/>
	</xsl:template>
	
	<xsl:template match="div" mode="content">
		<xsl:apply-templates mode="content"/>
	</xsl:template>
	
	<xsl:template match="@*|node()" mode="content">
		<p><xsl:call-template name="parse-paragraph"/></p>
		<xsl:call-template name="parse-tags"/>
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
	<xsl:template name="title-info.annotation.data">
		<p><xsl:value-of select="//body/center/table//tr[2]/td/ul/li/font/i"/></p>
	</xsl:template>
	<xsl:variable name="title-info.keywords"/>
	<xsl:variable name="title-info.date"/>
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
	
	<xsl:variable name="hrBegin" select="(//hr)[2]/following-sibling::*"/>
	<xsl:variable name="hrEnd" select="(//hr)[count(//hr)-1]/preceding-sibling::*"/>
	
	<xsl:template name="body.sections.data"> <!-- Mandatory -->
		<section>
			<xsl:apply-templates select="$hrBegin[count(.| $hrEnd)=count($hrEnd)]" mode="content"/>
		</section>
	</xsl:template>

	<xsl:variable name="body-comments.image"/>
	<xsl:variable name="body-comments.title"/>
	<xsl:variable name="body-comments.epigraph"/>
	<xsl:template name="body-comments.sections.data"/> <!-- Mandatory if body-comments is on -->
	<!-- END -->

</xsl:stylesheet>