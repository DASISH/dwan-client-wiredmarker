<xsl:stylesheet id="treeindex" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>
  <xsl:template match="WM_INDEX_LIST">
    <html>
      <head>
        <title><xsl:value-of select="@title"/></title>
        <script type="text/javascript">
        <![CDATA[
          function twisty(elem){
            var cur_twisty = (elem.src.indexOf("fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII")>=0)?true:false;
            var sibling = elem.nextSibling;
            while(sibling){
              if(sibling.nodeName.toUpperCase() == 'DIV'){
                sibling.style.display = cur_twisty?'none':'';
                break;
              }
              sibling = sibling.nextSibling;
            }
            if(!sibling) return;
            elem.src = cur_twisty ?
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAChSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAMcGU//z5E4wZGRnhbBgACCAWGOPbt28M6Gx2dnYwDRBAYEX//v1jEBISgiuCsf/+/QumAQIIrOjr168MV69eBQtoa2vD2SBxEAAIIBaY8V++fIGbBGPDrAUIILCiHz9+MIiLi4MFHjx4AFcMEgcBgAACKZpdW/MITzAxzAYIMADnOV3STeCBBwAAAABJRU5ErkJggg==" :
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=";
          }
          function load(aEvent){
            return;
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
        <style>
          a {
            color : rgb(0,0,238);
          }
          a:hover {
            color : #f90;
          }
          img.twisty {
            margin-right: 4px;
          }
          img.twisty:hover {
            cursor : pointer;
          }
        </style>
      </head>
      <body style="margin: 0.25em;" onload="load(event);">
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="INDEX">
    <div style="margin-left: 0.25em;margin-bottom: 2px;">
      <table style="padding:0px;border:1px solid #fc6;" width="100%">
        <tr><td style="background-color: #ffc;font-weight: bold;">
          <xsl:value-of select="TITLE"/>
        </td></tr>
        <tr><td>
          <xsl:apply-templates/>
        </td></tr>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="INDEX/TITLE"/>




  <xsl:template match="URL">
    <div style="margin-left: 1em;">
      <table width="100%">
        <tbody>
          <tr>
            <td>
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACNSURBVHjaYoyNOZTKwMCQzoAbzAQIIAagojP/8QCQPEAAscCU//z5E8MIdnZ2MA0QQHBF3759w6kIIIDAiv79+8cgJCSEoejv379gGiCAwIq+fv3KcPXqVQxFIHEQAAggFphVX758wVAEcwJAAIEV/fjxg0FcXBxDEUgcBAACCKRodm3NIzzBxDAbIMAAYadJkYnDnfwAAAAASUVORK5CYII=" valign="top" class="twisty" onclick="twisty(this)">
              </img>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="DOCUMENT_URL" />
                </xsl:attribute>
                <xsl:attribute name="title">
                  <xsl:value-of select="DOCUMENT_TITLE" />
                </xsl:attribute>
                <xsl:value-of select="DOCUMENT_URL" />
              </a>
              <xsl:apply-templates/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="OBJECTS">
    <div style="">
      <table style="padding:0px;border:1px solid #fc6;border-top:1px solid #fc6;" width="100%">
        <tbody>
          <xsl:apply-templates/>
        </tbody>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="OBJECT">
    <tr style="">
      <th style="background-color: #e6e6e6;font-size:0.9em;width:4em;">Note</th><td style="border-bottom:1px solid #ffe5b1;"><xsl:value-of select="NOTE"/></td>
      <td style="width:1em;border-left:1px solid #ffe5b1;border-bottom:1px solid #ffe5b1;">
        <a style="font-size:0.8em;">
          <xsl:attribute name="href">
            <xsl:value-of select="HYPER_ANCHOR" />
          </xsl:attribute>Link
        </a>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="INDEX/URLS/URL/DOCUMENT_URL"/>
  <xsl:template match="INDEX/URLS/URL/FAVICON"/>
  <xsl:template match="INDEX/URLS/URL/DOCUMENT_TITLE"/>

  <xsl:template match="xsl:stylesheet">
    <!-- ignore -->
  </xsl:template>
</xsl:stylesheet>
