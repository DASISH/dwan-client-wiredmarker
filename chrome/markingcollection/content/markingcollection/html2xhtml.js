var bitsHTML2XHTMLService = {
	init : function(){},
	getXHTML : function(aNode, aLang, aEncoding, aNeedNl, aInsidePre){
		var i,j;
		var xhtml = '';
		var childNodes = aNode.childNodes;
		var childLength = childNodes.length;
		var localName;
		var node;
		var attributes;
		var attributesLength;
		var attrName;
		var attrValue;
		var pageMode = true;
		for(i=0;i<childLength;i++){
			node = childNodes[i];
			switch(node.nodeType){
				case Node.ELEMENT_NODE :
					localName = node.localName.toLowerCase();
					if(localName == '') break;
					if(localName == 'meta' && String(node.name).toLowerCase() == 'generator') break;
					if(!aNeedNl && localName == 'body') pageMode = false;
					if(localName == 'html'){
						xhtml = '<?xml version="1.0"';
						if(aEncoding) xhtml += ' encoding="'+aEncoding+'"';
						xhtml += '?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';
					}
					xhtml += '<'+localName;
					attributes = node.attributes;
					attributesLength = attributes.length;
					for(j=0;j<attributesLength;j++){
						attrName = attributes[j].localName.toLowerCase();
						attrValue = null;
						switch(attrName){
							case "style" : attrValue = node.style.cssText; break;
							case "class" : attrValue = node.className; break;
							case "http-equiv": attrValue = node.httpEquiv; break;
							case "noshade": case "checked": case "selected": case "multiple": case "nowrap": case "disabled": attrValue = 'true'; break;
							default: try{ attrValue = node.getAttribute(attrName); }catch(e){ attrValue = null; }
						}
						if(aLang && (attrName == 'lang' || attrName == 'xml:lang')) attrValue = aLang;
						if(attrValue != null && (!(localName == 'li' && attrName == 'value'))) xhtml += ' '+attrName+'="'+ String(attrValue).replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;") +'"';
					}
					if(localName == 'img' && !node.hasAttribute('alt')) xhtml += ' alt=""';
					if(localName == 'html'){
						if(aLang){
							if(!node.hasAttribute('lang')) xhtml += ' lang="'+aLang+'"';
							if(!node.hasAttribute('xml:lang')) xhtml += ' xml:lang="'+aLang+'"';
						}
						if(!node.hasAttribute('xmlns')) xhtml += ' xmlns="http://www.w3.org/1999/xhtml"';
					}
					if(node.hasChildNodes()){
						xhtml += '>';
						xhtml += this.getXHTML(node, aLang, aEncoding, true, (aInsidePre||localName=='pre')?true:false);
						xhtml += '</'+localName+'>';
					}else{
						xhtml += ' />';
					}
					break;
				case Node.TEXT_NODE :
					var textContent = node.textContent;
					if(!aInsidePre){
						textContent = String(textContent).replace(/^\s*/g, "").replace(/\s*$/g, "").replace(/\n{2,}/g, "\n").replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00A0/g, "&nbsp;");
						if(textContent == '\n') textContent = '';
					}
					xhtml += textContent;
					break;
				default:
					break;
			}
		}
		if(!aNeedNl && !pageMode) xhtml = xhtml.replace(/<\/?head>[\n]*/gi, "").replace(/<head \/>[\n]*/gi, "").replace(/<\/?body>[\n]*/gi, "");
		return xhtml;
	}
};
