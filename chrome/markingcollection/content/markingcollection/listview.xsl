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
        <![CDATA[
          function twisty(elem){
            var cur_twisty = (elem.src.indexOf("fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII")>=0)?true:false;
            var childid = elem.getAttribute("childid").split(",");
            for(var i=0;i<childid.length;i++){
              var child_elem = document.getElementById(childid[i]);
              if(!child_elem) continue;
              child_elem.style.display = cur_twisty?'none':'';
            }
            elem.src = cur_twisty ?
                       "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAChSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAMcGU//z5E4wZGRnhbBgACCAWGOPbt28M6Gx2dnYwDRBAYEX//v1jEBISgiuCsf/+/QumAQIIrOjr168MV69eBQtoa2vD2SBxEAAIIBaY8V++fIGbBGPDrAUIILCiHz9+MIiLi4MFHjx4AFcMEgcBgAACKZpdW/MITzAxzAYIMADnOV3STeCBBwAAAABJRU5ErkJggg==":
                       "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=";
          }
          function load(aEvent){
            return;
            var regexp_png = new RegExp("^data:image/\\w+;base64,");
            var nodeWalker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
            for(var txtNode=nodeWalker.nextNode();txtNode;txtNode = nodeWalker.nextNode()){
              if(txtNode.parentNode.nodeName == "TEXTAREA") continue;
              try{
                if(txtNode.nodeValue.match(/^(data:image\/\w+;base64,).*/img)){ txtNode.nodeValue = RegExp.$1; }
              }catch(e){
                if(regexp_png.test(txtNode.nodeValue)){ txtNode.nodeValue = "data:image/png;base64,"; }
              }
              txtNode.nodeValue = txtNode.nodeValue.replace(/([\/&\?])([^\/&\?])/mg,"$1 $2");
            }
          }
        ]]>
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
          <table style="padding:0px;border:1px solid #fc6;" width="100%">
            <thead>
              <tr style="background-color:#ffe6b2;"><td colspan="6" style="font-family:arial;font-size:0.9em;font-weight:bold;">
                <label><xsl:value-of select="FID_TITLE" /></label>
              </td></tr>
              <tr style="background-color:#fff7e5;">
                <td style="font-family:arial;font-size:0.9em;font-weight:bold;border-top:1px solid #fc6;border-right:1px solid #ffe6b2;"><br/></td>
                <td style="font-family:arial;font-size:0.9em;font-weight:bold;border-top:1px solid #fc6;border-right:1px solid #ffe6b2;">TITLE</td>
                <td style="font-family:arial;font-size:0.9em;font-weight:bold;border-top:1px solid #fc6;border-right:1px solid #ffe6b2;">NOTE</td>
                <td style="font-family:arial;font-size:0.9em;font-weight:bold;border-top:1px solid #fc6;border-right:0px solid #ffe6b2;">DATE</td>
              </tr>
            </thead>
            <tbody>
              <xsl:apply-templates />
            </tbody>
          </table>
        </div>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="FOLDER/FID_TITLE" />
  <xsl:template match="FOLDER/FID_NOTE" />
  <xsl:template match="FOLDER/FID_STYLE" />
  <xsl:template match="FOLDER/ID" />
  <xsl:template match="FOLDER/CHILDID" />



  <xsl:template match="OBJECT">
    <tr>
      <td nowrap="true" width="5%" align="center" valign="top" style="font-family:arial;font-size:0.7em;border-top:1px solid #fc6;border-right:1px solid #ffe6b2;">
        <a target="_blank">
          <xsl:choose>
            <xsl:when test="HYPER_ANCHOR!=''">
              <xsl:attribute name="href"><xsl:value-of select="HYPER_ANCHOR" /></xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="href"><xsl:value-of select="DOC_URL" /></xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAdElEQVR42nXQgQ0AEQwF0Jrpm4mZmEln6rXBoeeaiODlK4F8JRG6VNgXKE2gc0k4UXZwJgJMbcMdpuaugiaqB32hFLwbE1W20ZMP6FGuoxNtozIWtEPWBAADWWQM9kDOMRxXzyQp1kaH63s2eH7JBdJfbfAB7M5JYzCbw3sAAAAASUVORK5CYII=" border="0" style="margin-top:6px;"/>
        </a>
      </td>
      <td width="45%" valign="top" style="font-family:arial;font-size:0.9em;border-top:1px solid #fc6;border-right:1px solid #ffe6b2;">
        <div style="width:100%;height:100%;min-height:1em;max-height:10em;overflow:auto;" edit="true" dbcolumn="title">
          <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
          <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
          <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
          <xsl:value-of select="OID_TITLE" />
        </div>
      </td>
      <td width="45%" valign="top" style="font-family:arial;font-size:0.9em;margin-left:1em;border-top:1px solid #fc6;border-right:1px solid #ffe6b2;">
        <div style="width:100%;height:100%;min-height:1em;max-height:10em;overflow:auto;" edit="true" dbcolumn="note">
          <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
          <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
          <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
          <xsl:value-of select="OID_NOTE" />
        </div>
      </td>
      <td width="5%" align="right" valign="top" style="font-family:arial;font-size:0.7em;border-top:1px solid #fc6;border-right:0px solid #ffe6b2;">
        <label><xsl:value-of select="OID_DATE" /></label>
      </td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
