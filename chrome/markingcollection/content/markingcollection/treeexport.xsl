<xsl:stylesheet id="treeexport" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>
  <xsl:template match="LIST">
    <html>
      <head>
        <title><xsl:value-of select="@title" /></title>
        <script type="text/javascript">
        <![CDATA[
          function load(aEvent){
            var regexp_png = new RegExp("^data:image/\\w+;base64,");
            var nodeWalker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
            for(var txtNode=nodeWalker.nextNode();txtNode;txtNode = nodeWalker.nextNode()){
              try{if(txtNode.parentNode.nodeName == "TEXTAREA") continue;}catch(e){}
              try{if(regexp_png.test(txtNode.nodeValue)){ txtNode.nodeValue = "data:image/png;base64,"; }}catch(e){}
              try{txtNode.nodeValue = txtNode.nodeValue.replace(/([\/&\?])(\w)/mg,"$1 $2");}catch(e){}
            }
          }
        ]]>
        </script>
      </head>
      <body style="margin: 0.25em;" onload="load(event);">
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="FOLDER">
    <xsl:choose>
      <xsl:when test="position() = 2">
        <div style="margin-left: 0.25em;">
          <table style="padding:0px;border:1px solid #fc6;" width="100%">
            <tr><td style="background-color: #fc6;font-weight: bold;">
              <xsl:value-of select="FID_TITLE" />
            </td></tr>
            <tr><td>
              <xsl:apply-templates />
            </td></tr>
          </table>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <div style="margin-left: 1em;">
          <table style="padding:0px;border-left:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
            <tr><td style="background-color: #fc6;font-weight: bold;">
              <xsl:value-of select="FID_TITLE" />
            </td></tr>
            <tr><td>
              <xsl:apply-templates />
            </td></tr>
          </table>
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="FOLDER/FID_TITLE" />
  <xsl:template match="FOLDER/FID_NOTE" />
  <xsl:template match="FOLDER/FID_STYLE" />
  <xsl:template match="FOLDER/FID_MODE" />
  <xsl:template match="FOLDER/FID_PROPERTY" />
  <xsl:template match="FOLDER/FID_DBTYPE" />
  <xsl:template match="BASENAME" />




  <xsl:template match="OBJECT">
    <div style="margin-left: 1em;">
      <table style="padding:0px;border-left:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
        <thead>
          <tr>
            <td colspan="3" style="background-color: #ffc;font-weight: bold;">
              <label>
                <xsl:value-of select="OID_TITLE" />
              </label>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th width="10" style="background-color: #e6e6e6;">Note</th>
             <xsl:choose>
               <xsl:when test="OID_IMG!=''">
                  <td width="" style="font-family:serif;">
                    <label>
                      <xsl:value-of select="OID_PROPERTY_NOTE" />
                    </label>
                  </td>
                  <td rowspan="4" align="right" valign="top">
                    <img style="border-left:1px solid #ff9;">
                      <xsl:attribute name="src"><xsl:value-of select="OID_IMG" /></xsl:attribute>
                      <xsl:attribute name="width"><xsl:value-of select="OID_IMG_DISP_WIDTH" /></xsl:attribute>
                      <xsl:attribute name="height"><xsl:value-of select="OID_IMG_DISP_HEIGHT" /></xsl:attribute>
                    </img>
                  </td>
               </xsl:when>
               <xsl:when test="OID_STRUCTURE!=''">
                  <td width="" style="font-family:serif;">
                    <label>
                      <xsl:value-of select="OID_PROPERTY_NOTE" />
                    </label>
                  </td>
                  <td rowspan="4" align="" valign="top" style="border-left:1px solid #ff9;">
                    <xsl:copy-of select="OID_STRUCTURE" />
                  </td>
               </xsl:when>
               <xsl:otherwise>
                  <td width="400" style="font-family:serif;">
                    <label>
                      <xsl:value-of select="OID_PROPERTY_NOTE" />
                    </label>
                  </td>
               </xsl:otherwise>
             </xsl:choose>
          </tr>
          <tr>
            <th width="10" style="background-color: #e6e6e6;">URL</th>
            <td>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="DOC_URL" />
                </xsl:attribute>
                <xsl:value-of select="DOC_URL" />
              </a>
            </td>
          </tr>
          <tr>
            <th width="10" style="background-color: #e6e6e6;font-size:0.9em;white-space:nowrap;">
              <a href="http://www.hyper-anchor.org/" target="_hyperanchor" title="HYPER-ANCHOR Homepage">HYPER-ANCHOR</a>
            </th>
            <td>
              <textarea rows="1" wrap="soft" readonly="true" style="width:100%;-moz-appearance: none !important;border: none;background:white  !important;" onfocus="this.select();"><xsl:value-of select="HYPER_ANCHOR"/></textarea>
            </td>
          </tr>
          <tr>
            <th width="10" style="background-color: #e6e6e6;">Contents</th>
            <td>
              <xsl:value-of select="OID_TXT" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </xsl:template>
  <xsl:template match="xsl:stylesheet">
    <!-- ignore -->
  </xsl:template>
</xsl:stylesheet>
