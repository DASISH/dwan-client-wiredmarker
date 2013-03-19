<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>
  <xsl:template match="LIST">
    <html>
      <head>
        <title><xsl:value-of select="@title" /></title>
        <script type="text/javascript">
          function twisty(elem){
            var cur_twisty = (elem.src.indexOf("twisty-open")>=0)?true:false;
            var childid = elem.getAttribute("childid").split(",");
            for(var i=0;i &lt; childid.length;i++){
              var child_elem = document.getElementById(childid[i]);
              if(!child_elem) continue;
              child_elem.style.display = cur_twisty?'none':'';
            }
            elem.src = cur_twisty?"chrome://markingcollection/skin/twisty-clsd.png":"chrome://markingcollection/skin/twisty-open.png";
          }
          function load(aEvent){
            var nodeWalker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
            for(var txtNode=nodeWalker.nextNode();txtNode;txtNode = nodeWalker.nextNode()){
              if(txtNode.nodeValue.match(/^(data:image\/\w+;base64,).*/img)){ txtNode.nodeValue = RegExp.$1; }
              txtNode.nodeValue = txtNode.nodeValue.replace(/([\/&amp;\?])(\w)/mg,"$1 $2");
            }
          }
        </script>

      </head>
      <body style="margin: 1em;" onload="load(event)">
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="FOLDER">
    <xsl:choose>
      <xsl:when test="position() = 2">
        <div>
          <xsl:attribute name="id">
            <xsl:value-of select="ID" />
          </xsl:attribute>
          <table style="margin-left: 0.25em;padding:0px;border:1px solid #fc6;" width="100%">
            <tr><td style="background-color: #fc6;font-weight: bold;">
              <img src="chrome://markingcollection/skin/twisty-open.png" valign="center" style="margin-right: 4px;" onclick="twisty(this)">
                <xsl:attribute name="childid">
                  <xsl:value-of select="CHILDID" />
                </xsl:attribute>
              </img>
              <xsl:value-of select="FID_TITLE" />
            </td></tr>
            <tr><td>
              <xsl:apply-templates />
            </td></tr>
          </table>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <div>
          <xsl:attribute name="id">
            <xsl:value-of select="ID" />
          </xsl:attribute>

          <table style="margin-left: 1em;padding:0px;border-left:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
            <tr><td style="background-color: #fc6;font-weight: bold;">
              <img src="chrome://markingcollection/skin/twisty-open.png" valign="center" style="margin-right: 4px;" onclick="twisty(this)">
                <xsl:attribute name="childid">
                  <xsl:value-of select="CHILDID" />
                </xsl:attribute>
              </img>
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
  <xsl:template match="FOLDER/ID" />
  <xsl:template match="FOLDER/CHILDID" />



  <xsl:template match="OBJECT">
    <div>
      <xsl:attribute name="id">
        <xsl:value-of select="ID" />
      </xsl:attribute>
      <table style="margin-left: 1em;padding:0px;border-left:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
        <thead>
          <tr>
            <td colspan="3" style="background-color: #ffc;font-weight: bold;">
              <img src="chrome://markingcollection/skin/twisty-open.png" valign="center" style="margin-right: 4px;" onclick="twisty(this)">
                <xsl:attribute name="childid"><xsl:value-of select="ID" />child</xsl:attribute>
              </img>
              <label edit="true" dbcolumn="title">
                <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                <xsl:value-of select="OID_TITLE" />
              </label>
            </td>
          </tr>
        </thead>
        <tbody>
          <xsl:attribute name="id"><xsl:value-of select="ID" />child</xsl:attribute>
          <tr>
            <th width="10" style="background-color: #e6e6e6;">Note</th>
             <xsl:choose>
               <xsl:when test="OID_IMG!=''">
                  <td width="" style="font-family:serif;">
                    <label edit="true" dbcolumn="property::note">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_PROPERTY_NOTE" />
                    </label>
                  </td>
                  <td rowspan="4" align="right" valign="top">
                    <img edit="true" style="border-left:1px solid #ff9;">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="src"><xsl:value-of select="OID_IMG" /></xsl:attribute>
                      <xsl:attribute name="width"><xsl:value-of select="OID_IMG_DISP_WIDTH" /></xsl:attribute>
                      <xsl:attribute name="height"><xsl:value-of select="OID_IMG_DISP_HEIGHT" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                    </img>
                  </td>
               </xsl:when>
               <xsl:when test="OID_STRUCTURE!=''">
                  <td width="" style="font-family:serif;">
                    <label edit="true" dbcolumn="property::note">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_PROPERTY_NOTE" />
                    </label>
                  </td>
                  <td rowspan="4" align="" valign="top" style="border-left:1px solid #ff9;">
                    <xsl:copy-of select="OID_STRUCTURE" />
                  </td>
               </xsl:when>
               <xsl:otherwise>
                  <td width="400" style="font-family:serif;">
                    <label edit="true" dbcolumn="property::note">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_PROPERTY_NOTE" />
                    </label>
                  </td>
               </xsl:otherwise>
             </xsl:choose>
          </tr>
          <tr>
            <th width="10" style="background-color: #e6e6e6;">Private</th>
              <td style="font-family:serif;">

                <xsl:choose>
                  <xsl:when test="OID_PROPERTY_PRIVATE!=''">
                    <xsl:apply-templates select="/LIST/FOLDER/OBJECT/OID_PROPERTY_PRIVATE" />
                  </xsl:when>
                  <xsl:otherwise>
                    <label edit="true" dbcolumn="property::private">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_PROPERTY_PRIVATE" />
                    </label>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
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
            <th width="10" style="background-color: #e6e6e6;">Contents</th>
            <td  style="">
              <xsl:value-of select="OID_TXT" />
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="OID_PROPERTY_PRIVATE">
   <xsl:choose>
     <xsl:when test="@type='checkbox'">
     </xsl:when>
     <xsl:otherwise>
      <label edit="true" dbcolumn="property::private">
        <xsl:attribute name="oid"><xsl:value-of select="@oid" /></xsl:attribute>
        <xsl:attribute name="dbtype"><xsl:value-of select="@dbtype" /></xsl:attribute>
        <xsl:attribute name="input"><xsl:value-of select="@type" /></xsl:attribute>
        <xsl:value-of select="." />
      </label>
     </xsl:otherwise>
   </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
