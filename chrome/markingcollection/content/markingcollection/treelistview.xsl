<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet id="treelist" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>
  <xsl:template match="LIST">
    <html>
      <head>
        <meta name="fid"><xsl:attribute name="content"><xsl:value-of select="@fid"/></xsl:attribute></meta>
        <meta name="dbtype"><xsl:attribute name="content"><xsl:value-of select="@dbtype"/></xsl:attribute></meta>
        <meta name="xslpath"><xsl:attribute name="content"><xsl:value-of select="@xslpath"/></xsl:attribute></meta>
        <meta name="_fileid"><xsl:attribute name="content"><xsl:value-of select="@_fileid"/></xsl:attribute></meta>
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
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAChSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAMcGU//z5E4wZGRnhbBgACCAWGOPbt28M6Gx2dnYwDRBAYEX//v1jEBISgiuCsf/+/QumAQIIrOjr168MV69eBQtoa2vD2SBxEAAIIBaY8V++fIGbBGPDrAUIILCiHz9+MIiLi4MFHjx4AFcMEgcBgAACKZpdW/MITzAxzAYIMADnOV3STeCBBwAAAABJRU5ErkJggg==" :
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=";
          }
          function load(aEvent){
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
        <div style="margin-left: 0.25em;">
          <xsl:attribute name="id">
            <xsl:value-of select="ID" />
          </xsl:attribute>
          <table style="padding:0px;border:1px solid #fc6;" width="100%">
            <tr><td style="background-color: #fc6;font-weight: bold;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=" valign="center" style="margin-right: 4px;" onclick="twisty(this)">
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
        <div style="margin-left: 1em;">
          <xsl:attribute name="id">
            <xsl:value-of select="ID" />
          </xsl:attribute>

          <table style="padding:0px;border-left:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
            <tr><td style="background-color: #fc6;font-weight: bold;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=" valign="center" style="margin-right: 4px;" onclick="twisty(this)">
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
    <div style="margin-left: 1em;">
      <xsl:attribute name="id">
        <xsl:value-of select="ID" />
      </xsl:attribute>
      <table style="padding:0px;border-left:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
        <thead>
          <tr>
            <td colspan="3" style="background-color: #ffc;font-weight: bold;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=" valign="center" style="margin-right: 4px;" onclick="twisty(this)">
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
            <th width="10" style="background-color: #e6e6e6;font-size:0.9em;">Note</th>
             <xsl:choose>
               <xsl:when test="OID_IMG!=''">
                  <td width="" style="font-family:serif;">
                    <label edit="true" dbcolumn="note">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_NOTE" />
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
                    <label edit="true" dbcolumn="note">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_NOTE" />
                    </label>
                  </td>
                  <td rowspan="4" align="" valign="top" style="border-left:1px solid #ff9;">
                    <xsl:copy-of select="OID_STRUCTURE" />
                  </td>
               </xsl:when>
               <xsl:otherwise>
                  <td width="400" style="font-family:serif;">
                    <label edit="true" dbcolumn="note">
                      <xsl:attribute name="oid"><xsl:value-of select="OID" /></xsl:attribute>
                      <xsl:attribute name="dbtype"><xsl:value-of select="DBTYPE" /></xsl:attribute>
                      <xsl:attribute name="pfid"><xsl:value-of select="PFID" /></xsl:attribute>
                      <xsl:value-of select="OID_NOTE" />
                    </label>
                  </td>
               </xsl:otherwise>
             </xsl:choose>
          </tr>
          <tr>
            <th width="10" style="background-color: #e6e6e6;font-size:0.9em;">URL</th>
            <td >
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
            <td  style="">
              <textarea rows="1" wrap="soft" readonly="true" style="width:100%;-moz-appearance: none !important;border: none;background:white  !important;" onfocus="this.select();"><xsl:value-of select="HYPER_ANCHOR"/></textarea>
            </td>
          </tr>
          <tr>
            <th width="10" style="background-color: #e6e6e6;font-size:0.9em;">Contents</th>
            <td  style="">
              <xsl:value-of select="OID_TXT" />
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </xsl:template>

</xsl:stylesheet>
