<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/"> 
     <h1>
          <xsl:value-of select="//title"/>
     </h1> 
     <h2>
          <xsl:value-of select="//author"/>
     </h2>
     <xsl::text>Test data.</xsl::text>
  </xsl:template>
</xsl:stylesheet>