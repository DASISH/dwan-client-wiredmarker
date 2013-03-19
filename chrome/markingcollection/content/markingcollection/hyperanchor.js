var bitsHyperAnchorDummy_urlBarListener = {
	QueryInterface : function(aIID){
		if(aIID.equals(Components.interfaces.nsIWebProgressListener) || aIID.equals(Components.interfaces.nsISupportsWeakReference) || aIID.equals(Components.interfaces.nsISupports)) return this;
		throw Components.results.NS_NOINTERFACE;
	},
	onLocationChange : function(webProgress, aRequest, aURI){
		if(!webProgress.isLoadingDocument) bitsHyperAnchorDummy.processNewURL(aURI,webProgress.DOMWindow.document);
	},
	onStateChange : function(webProgress, request, stateFlags, status){
		var aURI = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
		aURI.spec = webProgress.DOMWindow.document.location.toString();
		if(!webProgress.isLoadingDocument) bitsHyperAnchorDummy.processNewURL(aURI,webProgress.DOMWindow.document);

	},
	onProgressChange : function(){},
	onStatusChange : function(){},
	onSecurityChange : function(){},
	onLinkIconAvailable : function(){}
};

var bitsHyperAnchorDummy = {
/////////////////////////////////////////////////////////////////////
	_anchor_title   : "hyperanchor",
	_anchor_version : "1.3",
	_id       : "bits_hyperanchor",
	_init     : false,
	_APP_ID   : "{7c70a669-5a3f-4390-a507-670639880928}",
	_timer    : null,
	_select   : false,
	_anchorNode : null,
	_anchorNode_style : null,
	_hyperanchor_title : null,
	_hyperanchor_version : null,

	_iconopentimer : null,
	_iconclosetimer : null,
	_icondisp  : false,
	_iconnode  : {},
	_wndowLinkIcon : null,
	_wndowLinkIconW : 800,
	_wndowLinkIconH : 300,

	get STRING(){ return document.getElementById("bitsHyperAnchorDummyString"); },

/////////////////////////////////////////////////////////////////////
	get _contextMenuObject(){
		if("gContextMenu" in window && gContextMenu){
			return gContextMenu;
		}else if("gContextMenu" in window.top && window.top.gContextMenu){
			return window.top.gContextMenu;
		}else{
			return {
				target  : null,
				onLink  : false,
				link    : false,
				onImage : false
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	get nodePositionInRange(){
		return {
			SINGLE : 0,
			START  : 1,
			MIDDLE : 2,
			END    : 3
		};
	},

/////////////////////////////////////////////////////////////////////
	gBrowser : function(){
		return gBrowser;
	},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(this._init) return;
		try{
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			var app_version = parseInt(info.version);
			this.gBrowser().addEventListener("pageshow",  bitsHyperAnchorDummy.load,   false);
			this.gBrowser().addEventListener("pagehide",  bitsHyperAnchorDummy.unload, false);
			this.gBrowser().tabContainer.addEventListener("TabSelect", bitsHyperAnchorDummy.select, false);
			if(app_version<4) this.gBrowser().addProgressListener(bitsHyperAnchorDummy_urlBarListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
			else this.gBrowser().addProgressListener(bitsHyperAnchorDummy_urlBarListener);
			setTimeout(function(){ bitsHyperAnchorDummy._load(bitsHyperAnchorDummy.gBrowser().contentDocument);},0);
			this._init = true;
		}catch(ex){
			alert("bitsHyperAnchorDummy.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		if(this._init){
			this.gBrowser().removeEventListener("pageshow",  bitsHyperAnchorDummy.load,   false);
			this.gBrowser().removeEventListener("pagehide",  bitsHyperAnchorDummy.unload, false);
			this.gBrowser().tabContainer.removeEventListener("TabSelect", bitsHyperAnchorDummy.select, false);
			this.gBrowser().removeProgressListener(bitsHyperAnchorDummy_urlBarListener);
			if(this._wndowLinkIcon && !this._wndowLinkIcon.closed) this._wndowLinkIcon.close();
		}
		if(this._timer) clearTimeout(this._timer);
		this._timer = null;
	},

/////////////////////////////////////////////////////////////////////
	processNewURL: function(aURI,aDoc){
		bitsHyperAnchorDummy._removeMarker();
		if(bitsHyperAnchorDummy._timer) clearTimeout(bitsHyperAnchorDummy._timer);
		bitsHyperAnchorDummy._timer = setTimeout(function(){bitsHyperAnchorDummy._load(aDoc);},0);
	},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){
		if(bitsHyperAnchorDummy._timer) clearTimeout(bitsHyperAnchorDummy._timer);
		bitsHyperAnchorDummy._timer = setTimeout(function(){ bitsHyperAnchorDummy._removeMarker(); bitsHyperAnchorDummy._load(aEvent.target); },0);
	},

/////////////////////////////////////////////////////////////////////
	_load : function(aDoc){
		if(this._timer){
			clearTimeout(this._timer);
			this._timer = null;
		}
		var doc = aDoc;
		if(!doc.location) return;
		this._hyperanchor_title = null;
		this._hyperanchor_version = null;
		var hyperanchor = null;
		var bgnNode = null;
		var endNode = null;
		var bgnContents = null;
		var endContents = null;
		var style   = null;
		var target = {};
		var hash = this.getLocationHash(doc.location.href);
		var hashReg = new RegExp("#"+this._anchor_title+"([0-9\.]*):(.+)$");
		if(hash && hash.match(hashReg)){
			this._hyperanchor_version = RegExp.$1;
			hyperanchor = RegExp.$2;
			var anchor = this.xmlDecode(hyperanchor);
			if(anchor.match(/[\:\&]*vr=([^\&]+)?/)){
				this._hyperanchor_version = unescape(RegExp.$1);
				if(anchor.match(/[\:\&]*bx=([^\&]+)?/)) bgnNode     = this.xmlEncode(unescape(RegExp.$1));
				if(anchor.match(/[\:\&]*bi=([^\&]+)?/)) bgnNode    += "(" + unescape(RegExp.$1) + ")";
				if(anchor.match(/[\:\&]*bt=([^\&]+)?/)) bgnNode    += "(" + unescape(RegExp.$1) + ")";
				if(anchor.match(/[\:\&]*bc=([^\&]+)?/)) bgnContents = RegExp.$1;
				if(anchor.match(/[\:\&]*ex=([^\&]+)?/)) endNode     = this.xmlEncode(unescape(RegExp.$1));
				if(anchor.match(/[\:\&]*ei=([^\&]+)?/)) endNode    += "(" + unescape(RegExp.$1) + ")";
				if(anchor.match(/[\:\&]*et=([^\&]+)?/)) endNode    += "(" + unescape(RegExp.$1) + ")";
				if(anchor.match(/[\:\&]*ec=([^\&]+)?/)) endContents = RegExp.$1;
				if(anchor.match(/[\:\&]*st=([^\&]+)?/)) style       = unescape(RegExp.$1);

			// Ver 1.2, 1.3
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))&(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))&(.+)$/)){
				bgnNode = unescape(RegExp.$1);
				endNode = unescape(RegExp.$2);
				style   = unescape(RegExp.$3);
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))&(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))$/)){
				bgnNode = unescape(RegExp.$1);
				endNode = unescape(RegExp.$2);
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))&&(.+)$/)){
				bgnNode = unescape(RegExp.$1);
				style   = unescape(RegExp.$2);
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))$/)){
				bgnNode = unescape(RegExp.$1);

			// Ver 1.0, 1.1
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\))&(.+\([0-9]+\)\([0-9]+\))&(.+)$/)){
				bgnNode = unescape(RegExp.$1);
				endNode = unescape(RegExp.$2);
				style   = unescape(RegExp.$3);
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\))&(.+\([0-9]+\)\([0-9]+\))$/)){
				bgnNode = unescape(RegExp.$1);
				endNode = unescape(RegExp.$2);
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\))&&(.+)$/)){
				bgnNode = unescape(RegExp.$1);
				style   = unescape(RegExp.$2);
			}else if(hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\))$/)){
				bgnNode = unescape(RegExp.$1);
			}
		}
		if(bgnNode){
			bgnNode = this.xmlDecode(bgnNode);
			// Ver 1.2, 1.3
			if(bgnNode.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)\(([\s\S]*)\)/m)){
				target.startPath   = RegExp.$1;
				target.startOffset = RegExp.$2;
				target.startType   = RegExp.$3;
				target.startContents   = RegExp.$4;
			// Ver 1.0, 1.1
			}else if(bgnNode.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/)){
				target.startPath   = RegExp.$1;
				target.startOffset = RegExp.$2;
				target.startType   = RegExp.$3;
			}
			target.startNode = this.XPath.getCurrentNodeFromXPath(doc,target.startPath,target.startOffset,target.startType);
			if(!target.startNode || !target.startNode.node){
				return null;
			}
		}
		if(endNode){
			endNode = this.xmlDecode(endNode);
			// Ver 1.2, 1.3
			if(endNode.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)\(([\s\S]*)\)/)){
				target.endPath   = RegExp.$1;
				target.endOffset = RegExp.$2;
				target.endType   = RegExp.$3;
				target.endContents   = RegExp.$4;
			// Ver 1.0, 1.1
			}else if(endNode.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/)){
				target.endPath   = RegExp.$1;
				target.endOffset = RegExp.$2;
				target.endType   = RegExp.$3;
			}
			target.endNode = this.XPath.getCurrentNodeFromXPath(doc,target.endPath,target.endOffset,target.endType);
		}
		if(style){
			style = this.xmlDecode(style);
			target.style = style;
		}else{
			target.style = "outline:1px dotted invert;outline-offset:0;background-color:#ff9;";
		}
		if(target.startNode && target.startNode.node){
			var node = target.startNode.node;
			if(node.nodeType == 3){
				if(target.endNode){
					if(this.checkMarkupedText(doc, target)){
						var mdoc = target.startNode.node.ownerDocument;
						var startXPath = this.XPath.getOffsetFromParentNode(target.startNode.node,target.startNode.offset);
						var endXPath = this.XPath.getOffsetFromParentNode(target.endNode.node,target.endNode.offset);
						bgnNode = startXPath.xpath + "(" + startXPath.offset + ")(" + startXPath.type + ")";
						endNode = endXPath.xpath + "(" + endXPath.offset + ")(" + endXPath.type + ")";
						this.xPathMarker(mdoc,{start : bgnNode, end : endNode}, { id : this._id, style : target.style });
						var xPathResult = this.XPath.evaluate('//*[@id="'+ this._id +'"]', mdoc);
						node = null;
						if(xPathResult.snapshotLength>0) node = xPathResult.snapshotItem(0);
					}
				}else{
					node = target.startNode.node.parentNode;
					var range = doc.createRange();
					try{
						range.setStart(target.startNode.node, target.startNode.offset);
						range.setEnd(target.startNode.node, target.startNode.offset);
					}catch(ex2){
						this._dump("bitsHyperAnchorDummy._load():["+range.toString()+"]::"+ex2);
						return;
					}
					var startContainer = range.startContainer;
					var ownerDoc = startContainer.ownerDocument;
					node = ownerDoc.createElement("span");
					node.id = this._id;
					node.setAttribute("style",target.style);
					var docfrag = range.extractContents();
					node.appendChild(docfrag);
					range.insertNode(node);
				}
			}else if((target.startType.length > 0) &&  (target.startType == 3) && (node.nodeType == 1)){
			
			}else if(node.nodeType == 1){
				if(this.checkMarkupedAttribute(node, target)){
					this._anchorNode = node;
					this._anchorNode_style = this._anchorNode.style.cssText;
					this._anchorNode.setAttribute("style",target.style);
				}
			}
			var offsetY = this.getPageOffsetTop(node);
			var win = doc.defaultView;
			win.scroll( win.pageXOffset, offsetY-10);
		}
		this._hyperanchor_version = null;
		if(doc.body){
			var hyperanchor_icon = nsPreferences.copyUnicharPref("wiredmarker.hyperanchor.icon_display","icon_display_left_popup");
			if(!hyperanchor_icon || hyperanchor_icon == "icon_none") return;
			var sURL = this._getURLStringFromDocument(doc);
			if(sURL == "") return;
			var icon_url = this.Common.getChromeImageURI(this.Common.convertURLToObject("chrome://markingcollection/skin/hyperanchor.png"));
			var links = doc.links;
			if(links){
				if(!this._iconnode[sURL]){
					if(hyperanchor_icon == "icon_display_left_popup" || hyperanchor_icon == "icon_display_right_popup"){
						var i;
						for(i=0;i<links.length;i++){
							if(!this._isShowLinkIcon(links[i])) continue;
							links[i].addEventListener("mouseover", bitsHyperAnchorDummy.mouseover, false);
							links[i].addEventListener("mouseout",  bitsHyperAnchorDummy.mouseout, false);
						}
					}else if(hyperanchor_icon == "icon_display_left" || hyperanchor_icon == "icon_display_right"){
						var i;
						for(i=0;i<links.length;i++){
							if(!this._isShowLinkIcon(links[i])) continue;
							var span = doc.createElement("span");
							span.style.paddingLeft='16px';
							span.style.lineHeight='16px';
							span.style.backgroundImage='url(' + icon_url + ')';
							span.style.backgroundRepeat='no-repeat';
							span.style.backgroundColor='#eee';
							span.style.cursor='pointer';
							span.style.border='1px solid gray';
							span.style.zIndex='65535';
							span.addEventListener("click",  bitsHyperAnchorDummy.clickLinkIcon, false);
							span.setAttribute("href",links[i].href);
							span.setAttribute("id",this._id+"_icon_"+i);
							if(hyperanchor_icon == "icon_display_left"){
								span.style.marginRight='4px';
								links[i].parentNode.insertBefore(span,links[i]);
							}else if(hyperanchor_icon == "icon_display_right"){
								span.style.marginLeft='4px';
								if(links[i].nextSibling){
									links[i].parentNode.insertBefore(span,links[i].nextSibling);
								}else{
									links[i].parentNode.appendChild(span);
								}
							}
						}
					}
					this._iconnode[sURL] = doc.createElement("div");
					this._iconnode[sURL].style.position='absolute';
					this._iconnode[sURL].style.left='0px';
					this._iconnode[sURL].style.top='0px';
					this._iconnode[sURL].style.width='16px';
					this._iconnode[sURL].style.height='16px';
					this._iconnode[sURL].style.backgroundImage='url(' + icon_url + ')';
					this._iconnode[sURL].style.backgroundRepeat='no-repeat';
					this._iconnode[sURL].style.backgroundColor='#eee';
					this._iconnode[sURL].style.cursor='pointer';
					this._iconnode[sURL].style.border='1px solid gray';
					this._iconnode[sURL].style.zIndex='65535';
					this._iconnode[sURL].style.display='none';
					this._iconnode[sURL].addEventListener("mouseover", bitsHyperAnchorDummy.mouseoverLinkIcon, false);
					this._iconnode[sURL].addEventListener("mouseout",  bitsHyperAnchorDummy.mouseout, false);
					this._iconnode[sURL].addEventListener("click",  bitsHyperAnchorDummy.clickLinkIcon, false);
				}
			}
		}
	},


/////////////////////////////////////////////////////////////////////
	getLocationHash : function(URL){
		var hash = "";
		var RE = new RegExp("(#" + this._anchor_title + "[^#]+)#?");
		if(URL.match(RE)) hash = RegExp.$1;
		return decodeURIComponent(hash);
	},


/////////////////////////////////////////////////////////////////////
	checkMarkupedText : function(doc, target){
try{
		if( target.startContents == null || target.startContents.length <= 0 && target.endContents == null || target.endContents.length <= 0) return true;
		if(!target.startNode.node || !target.endNode.node) return false;
		if (target.startNode.node.nodeType == 3 && target.endNode.node.nodeType == 3){
			var preSearchFlag = true;
			var startNodeValue = this.XPath.trimWhiteSpaceNodeIE(target.startNode.node.nodeValue,true);
			var endNodeValue   = this.XPath.trimWhiteSpaceNodeIE(target.endNode.node.nodeValue,true);
			if(target.startNode.offset == -1) {target.startNode.offset = 0; preSearchFlag = false;}
			if(target.endNode.offset == -1) {target.endNode.offset = endNodeValue.length; preSearchFlag = false;}
			if(preSearchFlag && startNodeValue.length >= (target.startNode.offset + target.startContents.length) && endNodeValue.length >= target.endNode.offset)
			{
				var contentsFounded = true;
				var contents = target.startContents.replace(/[ ]+/mg,"");
				var refStr = startNodeValue.substr(target.startNode.offset);
				refStr = refStr.replace(/[ \t\n\r]+/mg,"").substring(0,contents.length);
				if(refStr != contents) contentsFounded = false;
				var contents = target.endContents.replace(/[ ]+/mg,"");
				var refStr = endNodeValue.substr(0,target.endNode.offset);
				refStr = refStr.split("").reverse().join("");
				refStr = refStr.replace(/[ \t\n\r]+/mg,"").substring(0,contents.length);
				if(refStr != contents.split("").reverse().join("")) contentsFounded = false;
				if(contentsFounded)  return true;
			}
  	}
		var rootNode = doc.body;
		var nodeAry = new Array();
		var startNodeInfo = new Array();
		startNodeInfo["node"] = target.startNode.node;
		startNodeInfo["nodeIdx"] = -1;
		var endNodeInfo = new Array();
		endNodeInfo["node"] = target.endNode.node;
		endNodeInfo["nodeIdx"] = -1;
		this.getNodeAry(rootNode, nodeAry, startNodeInfo, endNodeInfo);
		var mappingMargin = bitsMarker.alignment;
		var startCharInfoAry = new Array();
		var startStartCharIdx = this.getCharInfoAry(startCharInfoAry, "start", nodeAry, startNodeInfo["nodeIdx"], target.startNode.offset, mappingMargin, target.startContents);
		var startCharInfo = this.searchMarkupedChar("start", startCharInfoAry, target.startContents, startStartCharIdx);
		var endCharInfoAry = new Array();
		var endStartCharIdx = this.getCharInfoAry(endCharInfoAry, "end", nodeAry, endNodeInfo["nodeIdx"], target.endNode.offset, mappingMargin, target.endContents);
		var endCharInfo = this.searchMarkupedChar("end", endCharInfoAry, target.endContents, endStartCharIdx, startCharInfo);
		if(startCharInfo && endCharInfo){
			target.startNode.node = startCharInfo["node"];
			target.startNode.offset = startCharInfo["offset"];
			target.endNode.node = endCharInfo["node"];
			target.endNode.offset = endCharInfo["offset"];
		}else{
			return false;
		}
		return true;
}catch(e){
	alert(e);
}
	},

/////////////////////////////////////////////////////////////////////
	getNodeAry : function(node, nodeAry, startNodeInfo, endNodeInfo){
try{
	if(!node) return;
	if(node.hasChildNodes()){
		var tname = node.tagName;
		if(tname){
			tname = tname.toLowerCase();
			if(tname == "script"){
				return;
			}else if(tname == "style"){
				return;
			}else if(tname == "head"){
				return;
			}else{
				var children = node.childNodes;
				for(var i=0;i<children.length;i++){
					this.getNodeAry(children[i], nodeAry, startNodeInfo, endNodeInfo);
				}
			}
		}else{
			var children = node.childNodes;
			for(var i=0;i<children.length;i++){
				this.getNodeAry(children[i], nodeAry, startNodeInfo, endNodeInfo);
			}
		}
	}else{
		nodeAry.push(node);
		if(node == startNodeInfo["node"]) startNodeInfo["nodeIdx"] = nodeAry.length - 1;
		if(node == endNodeInfo["node"]) endNodeInfo["nodeIdx"] = nodeAry.length - 1;
	}
	
}catch(e){
	alert("catch : " + e);
}
	},
	

/////////////////////////////////////////////////////////////////////
	getCharInfoAry : function(charInfoAry, mode, nodeAry, targetIdx, offset, margin, contents){
try{
	var charInfoAryBack = new Array();
	var strLen = 0;
	var isEnd = false;
	var tmpOffset = offset;
	for(var i=targetIdx;i<nodeAry.length;i++){
		var node = nodeAry[i];
		if(node.nodeType != node.TEXT_NODE) continue;
		if(node.parentNode && node.parentNode.nodeName == "SCRIPT") continue;
		var nodeValue = node.nodeValue;
		if(i != targetIdx) tmpOffset = 0;
		for(var charIdx=tmpOffset;charIdx<=nodeValue.length;charIdx++){
			if(mode == "start"){
				if(strLen >= (margin + contents.length)){
					isEnd = true;
					break;
				}
			}else{
				if(strLen >= margin){
					isEnd = true;
					break;
				}
			}
			var charInfo = new Array();
			charInfo["node"] = node;
			charInfo["nodeIdx"] = i;
			charInfo["offset"] = charIdx;
			if(charIdx >= nodeValue.Length){
				charInfo["char"] = "";
			}else{
				charInfo["char"] = nodeValue.charAt(charIdx);
			}
			charInfoAryBack.push(charInfo);
			if(charInfo["char"].replace(/[ \t\n\r]+/mg,"").length > 0) strLen++;
		}
		if(isEnd) break;
		tmpOffset = 0;
	}
	var charInfoAryForward = new Array();
	strLen = 0;
	isEnd = false;
	tmpOffset = offset;
	for(var i=targetIdx;i>=0;i--){
		var node = nodeAry[i];
		if(node.nodeType != node.TEXT_NODE) continue;
		if(node.parentNode && node.parentNode.nodeName == "SCRIPT") continue;
		var nodeValue = node.nodeValue;
		if(i != targetIdx) tmpOffset = nodeValue.length - 1;
		for(var charIdx=tmpOffset;charIdx>=0;charIdx--){
			if(mode == "start"){
				if(strLen>margin){
					isEnd = true;
					break;
				}
			}else{
				if(strLen>(contents.length + margin + 1)){
					isEnd = true;
					break;
				}
			}
			var charInfo = new Array();
			charInfo["node"] = node;
			charInfo["nodeIdx"] = i;
			charInfo["offset"] = charIdx;
			if(charIdx >= nodeValue.Length){
				charInfo["char"] = "";
			}else{
				charInfo["char"] = nodeValue.charAt(charIdx);
			}
			charInfoAryForward.unshift(charInfo);
			if(charInfo["char"].replace(/[ \t\n\r]+/mg,"").length > 0) strLen++;
		}
		if(isEnd) break;
	}
	charInfoAryForward.pop();
	for(var i=0;i<charInfoAryForward.length;i++){
		charInfoAry.push(charInfoAryForward[i]);
	}
	for(var i=0;i<charInfoAryBack.length;i++){
		charInfoAry.push(charInfoAryBack[i]);
	}
	if(mode == "start"){
		return charInfoAryForward.length;
	}else{
		charInfoAry.reverse();
		return charInfoAryBack.length;
	}
}catch(e){
	alert(e);
}
	},

/////////////////////////////////////////////////////////////////////
	searchMarkupedChar : function(mode, charInfoAry, contents, searchStartIdx, startCharInfo){
try{
	contents = contents.replace(/[ ]+/mg,"");
	if(mode == "end"){
		var tmp = "";
		for(var i=(contents.length-1);i>=0;i--){
			tmp += contents.charAt(i);
		}
		contents = tmp;
	}
	var back = charInfoAry.length - searchStartIdx - contents.length;
	var cnt  = (searchStartIdx > back) ? searchStartIdx : back;
	for(var i=0;i<=cnt;i++){
		for(var j=0;j<2;j++){
			if((i == 0) && (j == 0)) continue;
			var k = (j == 0) ? searchStartIdx - i : searchStartIdx + i;
			if((k < 0) || (k > (charInfoAry.length - contents.length + 1))) continue;
			if(startCharInfo){
				if(charInfoAry[k]["nodeIdx"] < startCharInfo["nodeIdx"]){
					continue;
				}else if(charInfoAry[k]["nodeIdx"] == startCharInfo["nodeIdx"]){
					if(charInfoAry[k]["offset"] < startCharInfo["offset"]){
						continue;
					}
				}
			}
			var c = charInfoAry[k]["char"].replace(/[\t\n\r]+/mg,"");
			if(c == null || c.length <= 0) continue;
			var charInfoStr = "";
			var len = 0;
			var aryIdx = 0;
			for(aryIdx=0;len<contents.length;aryIdx++){
				if(k + aryIdx > charInfoAry.length - 1) break;
				var tmpC = charInfoAry[k + aryIdx]["char"].replace(/[\t\n\r ]+/mg,"");
				if(tmpC.length <= 0) continue;
				charInfoStr += tmpC;
				len++;
			}
			if(charInfoStr == contents){
				if(mode == "start"){
					return charInfoAry[k];
				}else{
					if((k - 1) < 0){
						var charInfo_ = charInfoAry[k];
						charInfo_["offset"]++;
						return charInfo_;
					}else{
						return charInfoAry[k - 1];
					}
				}
			}
		}
	}
	return false;
}catch(e){
	alert(e);
}

	},

/////////////////////////////////////////////////////////////////////
	checkMarkupedAttribute : function(elem, target){
try{
		if(elem.tagName != "A" && elem.tagName != "IMG") return true;
		if(target.startContents == null || target.startContents.length <= 0) return true;
		var attr = elem.getAttribute("id", 0);
		var attrMap = target.startContents.split(':');
		if(attrMap.length < 2) return false;
		var attrName = attrMap[0];
		var attrValue = attrMap[1];
		for(var i=2;i<attrMap.length;i++){
			attrValue += ":" + attrMap[i];
		}
		var elemAttrValue = elem.getAttribute(attrName, 0);
		if(elemAttrValue == null || elemAttrValue.length <= 0) return false;
		var elemAttrValueSplited = elemAttrValue.split('#')[0];
		if(elemAttrValueSplited != attrValue) return false;
		return true;
}catch(e){
	alert(e);
}
	},

/////////////////////////////////////////////////////////////////////
	unmarkerWindow : function(marker_id){
		bitsHyperAnchorDummy.unmarkerWindow2(this.Common.getFocusedWindow(),marker_id);
	},
	
/////////////////////////////////////////////////////////////////////
	unmarkerWindow2 : function(win, marker_id){
		var result = false;
		if(win != null){
			var doc = win.document;
			if(win.frames != null){
				var i;
				for(i=0;i<win.frames.length;i++){
					bitsHyperAnchorDummy.unmarkerWindow2(win.frames[i],marker_id);
				}
			}
			if(!result){
				var marker = doc.getElementById(marker_id);
				while(marker != null){
					var parent = marker.parentNode;
					var children = marker.childNodes;
					var index;
					for(index=children.length-1;index>=0;index--){
						parent.insertBefore(children[0],marker);
					}
					parent.removeChild(marker);
					parent.normalize();
					result = true;
					marker = doc.getElementById(marker_id)
				}
			}
		}
		return result;
	},

	
/////////////////////////////////////////////////////////////////////
	_removeMarker : function(){
		bitsHyperAnchorDummy.unmarkerWindow(bitsHyperAnchorDummy._id);
		if(bitsHyperAnchorDummy._anchorNode) bitsHyperAnchorDummy._anchorNode.setAttribute("style",bitsHyperAnchorDummy._anchorNode_style);
		bitsHyperAnchorDummy._anchorNode = null;
		bitsHyperAnchorDummy._anchorNode_style = null;
	},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){
		if(bitsHyperAnchorDummy._timer) clearTimeout(bitsHyperAnchorDummy._timer);
		bitsHyperAnchorDummy._timer = null;
		if(bitsHyperAnchorDummy._iconopentimer) clearTimeout(bitsHyperAnchorDummy._iconopentimer);
		bitsHyperAnchorDummy._iconopentimer = null;
		if(bitsHyperAnchorDummy._iconclosetimer) clearTimeout(bitsHyperAnchorDummy._iconclosetimer);
		bitsHyperAnchorDummy._iconclosetimer = null;
		var doc = aEvent.target;
		if(doc.body){
			var sURL = bitsHyperAnchorDummy._getURLStringFromDocument(doc);
			if(sURL == "") return;
			if(bitsHyperAnchorDummy._iconnode[sURL]){
				try{if(this._iconnode[sURL].parentNode) this._iconnode[sURL].parentNode.removeChild(bitsHyperAnchorDummy._iconnode[sURL]);}catch(e){}
				delete bitsHyperAnchorDummy._iconnode[sURL];
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	select : function(aEvent){
		if(bitsHyperAnchorDummy._timer){
			clearTimeout(bitsHyperAnchorDummy._timer);
			bitsHyperAnchorDummy._timer = null;
		}
		if(bitsHyperAnchorDummy._iconopentimer) clearTimeout(bitsHyperAnchorDummy._iconopentimer);
		bitsHyperAnchorDummy._iconopentimer = null;
		if(bitsHyperAnchorDummy._iconclosetimer) clearTimeout(bitsHyperAnchorDummy._iconclosetimer);
		bitsHyperAnchorDummy._iconclosetimer = null;
	},

/////////////////////////////////////////////////////////////////////
	getElementStyle : function(elem){
		var style = {};
		if(elem){
			var resource_exp = new RegExp("^resource:");
			var rules = Components.classes["@mozilla.org/inspector/dom-utils;1"].getService(Components.interfaces["inIDOMUtils"]).getCSSStyleRules(elem);
			var i;
			var j;
			var propertyName;
			var priority;
			var value;
			for(i=0;i<rules.Count();i++) {
				var rule = rules.GetElementAt(i);
				if(rule instanceof CSSStyleRule && (!rule.parentStyleSheet.href || !resource_exp.test(rule.parentStyleSheet.href))){
					for(j=0;j<rule.style.length;j++){
						propertyName = rule.style.item(j);
						if(propertyName == '') continue;
						priority = rule.style.getPropertyPriority(propertyName);
						value = rule.style.getPropertyValue(propertyName);
						if(!style[propertyName] || !style[propertyName].priority){
							style[propertyName] = {};
							style[propertyName].value = value;
							style[propertyName].priority = priority;
						}
					}
				}
			}
			if(elem.style){
				for(j=0;j<elem.style.length;j++){
					propertyName = elem.style.item(j);
					if(propertyName == '') continue;
					priority = elem.style.getPropertyPriority(propertyName);
					value = elem.style.getPropertyValue(propertyName);
					if(!style[propertyName] || !style[propertyName].priority){
						style[propertyName] = {};
						style[propertyName].value = value;
						style[propertyName].priority = priority;
					}
				}
			}
		}
		return style;
	},

/////////////////////////////////////////////////////////////////////
	getPageOffsetTop : function(elem){
		if(!elem) return 0;
		var top = elem.offsetTop;
		var tempElem;
		var offsetHeight;
		var scrollHeight;
		var style;
		var scrollTop;
		while(elem && elem.offsetParent != null){
			if(elem && elem.parentNode && elem.offsetParent != elem.parentNode){
				tempElem = elem;
				while(tempElem && tempElem.parentNode && elem.offsetParent != tempElem.parentNode){
					offsetHeight = tempElem.parentNode.offsetHeight;
					scrollHeight = tempElem.parentNode.scrollHeight;
					if(offsetHeight != scrollHeight){
						style = this.getElementStyle(tempElem.parentNode);
						if(!style['height']) offsetHeight = scrollHeight;
					}
					if(offsetHeight != scrollHeight){
						scrollTop = elem.offsetTop - tempElem.parentNode.offsetTop;
						if(scrollTop>15) scrollTop -= 15;
						if(scrollTop>0){
							tempElem.parentNode.scrollTop = scrollTop;
							if(tempElem.parentNode.scrollTop>0) top = tempElem.parentNode.offsetTop;
						}
						elem = tempElem.parentNode;
						break;
					}
					tempElem = tempElem.parentNode;
				}
			}
			if(elem.offsetParent.offsetHeight != elem.offsetParent.scrollHeight) elem.offsetParent.scrollTop = top - (top>15?15:0);
			elem = elem.offsetParent;
			if(elem) top += elem.offsetTop;
		}
		return top;
	},

/////////////////////////////////////////////////////////////////////
	xmlDecode : function(aString){
		return aString.replace(/&nbsp;/mg," ").replace(/&amp;/mg,"&").replace(/&lt;/mg,"<").replace(/&gt;/mg,">").replace(/&quot;/mg,"\"");
	},

/////////////////////////////////////////////////////////////////////
	xmlEncode : function(aString){
		return aString.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	},

/////////////////////////////////////////////////////////////////////
	_getAnchorURL : function(){
		var url = null;
		var hyperanchor = null;
		var i;
		var hcnt = 0;
		try{
			for(i=0;i<arguments.length;i++){
				var target = arguments[i];
				if(target.node == undefined || target.offset == undefined) continue;
				if(!hyperanchor){
					url = this.Common.getURLStringFromDocument(target.node.ownerDocument);
					hyperanchor = this._anchor_title + this._anchor_version + ":";
				}
				var xPath = this.XPath.getOffsetFromParentNode(target.node,target.offset);
				var contents = "";
				if(target.contents){
					contents = target.contents;
					contents = this.xmlDecode(contents);
					contents = contents.replace(/[\r\n\t ]+/mg,"");
					contents = this.trim(contents);
					contents = this._getContentsPrefix(target.prefix, target.node, contents);
					contents = this.xmlEncode(contents);
				}
				if(hcnt>0) hyperanchor += "&";
				hyperanchor += this.xmlEncode(xPath.xpath) + "("+xPath.offset+")("+xPath.type+")"+"("+contents+")";
				hcnt++;
			}
			if(hcnt>0){
				for(i=0;i<arguments.length;i++){
					var target = arguments[i];
					if(target.style == undefined || target.style == '') continue;
					target.style = target.style.replace(/:\s+rgb\(([0-9]+),\s+([0-9]+),\s+([0-9]+)\)/mg,":rgb($1,$2,$3)").replace(/;\s+/mg,";");
					hyperanchor += "&" + this.xmlEncode(target.style);
					break;
				}
			}
		}catch(ex){
			hyperanchor = null;
			this._dump("bitsHyperAnchorDummy._getAnchorURL():"+ex);
		}
		return url + "#" + encodeURIComponent(hyperanchor);
	},

/////////////////////////////////////////////////////////////////////
	_getContentsPrefix : function(aPrefix, aNode, aContents){
		if(this._isTextNode(aNode)){
			var subLen = aContents.length < 3 ? aContents.length : 3;
			if(aPrefix == "b"){
				return aContents.substring(0, subLen);
			
			}else if(aPrefix == "e"){
				return aContents.substring(aContents.length - subLen);
			}
		}else{
			var tagName = aNode.tagName.toUpperCase();
			if(tagName == "IMG"){
				var strSrc = aNode.getAttribute("src");
				if(strSrc.indexOf("#") > 0) strSrc = strSrc.split("#", 1)[0];
				return "src:" + strSrc;
			
			}else if(tagName == "A"){
				var strHref = aNode.getAttribute("href");
				if(strHref.indexOf("#") > 0) strHref = strHref.split("#", 1)[0];
				return "href:" + strHref;
			}
		}
		return "";
	},


/////////////////////////////////////////////////////////////////////
	resetEmptyNode : function(doc,range){
		if(range.startContainer.nodeType == range.startContainer.TEXT_NODE && range.endContainer.nodeType == range.endContainer.TEXT_NODE){
			if(range.startContainer.nodeValue.replace(/[\r\n\t]+/mg,"").length == 0){
				function _acceptNode(aNode){
					if(aNode.nodeType == aNode.TEXT_NODE && (/^[\t\n\r ]+$/.test(aNode.nodeValue))) return NodeFilter.FILTER_REJECT;
					return NodeFilter.FILTER_ACCEPT;
				};
				var nodeWalker = doc.createTreeWalker(doc,NodeFilter.SHOW_TEXT,_acceptNode,false);
				nodeWalker.currentNode = range.startContainer;
				var startContainer = nodeWalker.nextNode();
				var endContainer = range.endContainer;
				var endOffset = range.endOffset;
				range = doc.createRange();
				try{
					range.setStart(startContainer, 0);
					range.setEnd(endContainer, endOffset);
				}catch(ex2){
					this._dump("bitsHyperAnchorDummy.addBookmark():"+ex2);
					return null;
				}
			}
		}
		return range;
	},

/////////////////////////////////////////////////////////////////////
	xPathMarker : function(aDoc, aXPath, aAttributes){
		try{
			var rtnNode = [];
			var doc = aDoc;
			if(!aDoc || !aXPath || !aXPath.start || !aXPath.end) return null;
			aXPath.start.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
			aXPath.startPath   = RegExp.$1;
			aXPath.startOffset = RegExp.$2;
			aXPath.startType   = RegExp.$3;
			aXPath.end.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
			aXPath.endPath   = RegExp.$1;
			aXPath.endOffset = RegExp.$2;
			aXPath.endType   = RegExp.$3;
			var startNode = null;
			var endNode = null;
			if(aXPath.con_url && this.Common.getURLStringFromDocument(doc) != aXPath.con_url){
				var win = doc.defaultView;
				doc = null;
				if(win.frames != null){
					var i;
					for(var i=0;i<win.frames.length;i++){
						if(this.Common.getURLStringFromDocument(win.frames[i].document) == aXPath.con_url){
							doc = win.frames[i].document;
							break;
						}
					}
				}
			}
			if(!doc) return null;
			startNode = this.XPath.getCurrentNodeFromXPath(doc,aXPath.startPath,aXPath.startOffset,aXPath.startType);
			if(!startNode || !startNode.node) return null;
			endNode = this.XPath.getCurrentNodeFromXPath(doc,aXPath.endPath,aXPath.endOffset,aXPath.endType);
			if(!endNode || !endNode.node) return null;
			var range = doc.createRange();
			try{
				range.setStart(startNode.node, startNode.offset);
				range.setEnd(endNode.node, endNode.offset);
			}catch(ex2){
				this._dump("bitsHyperAnchorDummy.xPathMarker():"+aAttributes.id+"=["+range.toString()+"]::"+ex2);
				return null;
			}
			rtnNode.push({id : aAttributes.id, text : range.toString()});
			var aWindow = doc.defaultView;
			var startC     = range.startContainer;
			var endC       = range.endContainer;
			var sOffset    = range.startOffset;
			var eOffset    = range.endOffset;
			var sameNode   = (startC == endC);
			var sameOffset = (sOffset == eOffset);
			if(sameNode && sameOffset){
				var newNode = this._createSpanNode(aWindow,aAttributes,this.nodePositionInRange.SINGLE);
				this._wrapTextNodeWithSpan(doc,startC,newNode);
				return rtnNode;
			}
			var createNode = false;
			function _acceptNode(aNode){
				if(aNode.nodeType != aNode.TEXT_NODE && aNode.nodeType != aNode.ELEMENT_NODE) return NodeFilter.FILTER_REJECT;
				return NodeFilter.FILTER_ACCEPT;
			};
			if(!sameNode || !this._isTextNode(startC)){
				var endNode;
				if(endC.nodeType == endC.ELEMENT_NODE && endC.childNodes.length > range.endOffset){
					endNode = endC.childNodes[range.endOffset];
				}else{
					endNode = endC;
				}
				var nodeWalker = doc.createTreeWalker(range.commonAncestorContainer,NodeFilter.SHOW_ALL,_acceptNode,false);
				nodeWalker.currentNode = startC; 
				for(var txtNode=nodeWalker.nextNode();txtNode && txtNode != endNode;txtNode = nodeWalker.nextNode()){
					if(txtNode.nodeType == txtNode.ELEMENT_NODE) continue;
					var xContext = txtNode.nodeValue.replace(/[\r\n\t]+/mg,"");
					if(xContext.length == 0) continue;
					if(!createNode){
						xContext = txtNode.nodeValue.replace(/[ ]+/mg,"");
						if(xContext.length == 0) continue;
					}
					if(
						txtNode.parentNode.nodeName == "SCRIPT" ||
						txtNode.parentNode.nodeName == "TABLE" ||
						txtNode.parentNode.nodeName == "THEAD" ||
						txtNode.parentNode.nodeName == "TBODY" ||
						txtNode.parentNode.nodeName == "TFOOT" ||
						txtNode.parentNode.nodeName == "TR"
					) continue;
					if(endC.compareDocumentPosition(txtNode) == endC.DOCUMENT_POSITION_FOLLOWING) continue;
					var newNode = this._createSpanNode(aWindow,aAttributes,this.nodePositionInRange.MIDDLE);
					nodeWalker.currentNode = this._wrapTextNodeWithSpan(doc,txtNode,newNode);
					createNode = true;
				}
			}
			if(endC.parentNode.nodeName != "SCRIPT"){
				if(this._isTextNode(endC)) endC.splitText(eOffset);
				if(!sameNode && endC.nodeValue){
					var xContext = endC.nodeValue.replace(/[\r\n\t ]+/mg,"");
					if(xContext.length > 0){
						var newNode = this._createSpanNode(aWindow,aAttributes,this.nodePositionInRange.END);
						this._wrapTextNodeWithSpan(doc,endC,newNode);
						createNode = true;
					}
				}
			}
			if(this._isTextNode(startC) && startC.parentNode.nodeName != "SCRIPT"){ 
				var secondHalf = startC.splitText(sOffset);
				var xContext = secondHalf.nodeValue.replace(/[\r\n\t ]+/mg,"");
				if(xContext.length > 0){
					if(sameNode){
						var newNode = this._createSpanNode(aWindow,aAttributes,this.nodePositionInRange.SINGLE);
						this._wrapTextNodeWithSpan(doc,secondHalf,newNode);
						createNode = true;
					}else{
						var newNode = this._createSpanNode(aWindow,aAttributes,this.nodePositionInRange.START);
						this._wrapTextNodeWithSpan(doc,secondHalf,newNode);
						createNode = true;
					}
				}
			} 
			if(!createNode && sameNode) this._markerRange(range,aAttributes);
			range.collapse(true);
			if(aAttributes.id){
				var xPathResult = this.XPath.evaluate('//*[@id="'+aAttributes.id+'"]', doc);
				for(var k=0;k<xPathResult.snapshotLength;k++){
					var node = xPathResult.snapshotItem(k);
					if(xPathResult.snapshotLength>1){
						if(k==0){
							node.style.borderRight = "";
						}else if(k==(xPathResult.snapshotLength-1)){
							node.style.borderLeft = "";
						}else{
							node.style.borderLeft = "";
							node.style.borderRight = "";
						}
					}
				}
			}
			return rtnNode;
		}catch(ex){
			this._dump("bitsHyperAnchorDummy.xPathMarker():"+ex);
			return null;
		}
	},


/////////////////////////////////////////////////////////////////////
	_isTextNode : function(aNode){ 
		return aNode.nodeType == aNode.TEXT_NODE;
	},

/////////////////////////////////////////////////////////////////////
	_createSpanNode : function(aWindow,aAttributes,aNodePosInRange){
		var newNode = aWindow.document.createElement("span");
		for(var attr in aAttributes){
			newNode.setAttribute(attr,aAttributes[attr]);
		}
		return newNode;
	},

/////////////////////////////////////////////////////////////////////
	_wrapTextNodeWithSpan : function(aDoc,aTextNode,aSpanNode){
		var clonedTextNode = aTextNode.cloneNode(false);
		var nodeParent     = aTextNode.parentNode;
		aSpanNode.appendChild(clonedTextNode);
		nodeParent.replaceChild(aSpanNode,aTextNode);
		return clonedTextNode;
	},

/////////////////////////////////////////////////////////////////////
	_markerRange : function (range,aAttributes){
		try{
			var startContainer = range.startContainer;
			var ownerDoc = startContainer.ownerDocument;
			var spanNode = ownerDoc.createElement("span");
			var attr;
			for(attr in aAttributes){
				spanNode.setAttribute(attr,aAttributes[attr]);
			}
			var docfrag = range.extractContents();
			spanNode.appendChild(docfrag);
			range.insertNode(spanNode);
			return spanNode;
		}catch(ex){
			this._dump("bitsHyperAnchorDummy._markerRange():"+ex);
			return null;
		}
	},

/////////////////////////////////////////////////////////////////////
	mouseout : function(aEvent){
		bitsHyperAnchorDummy._mouseout(aEvent);
	},

	_mouseout : function(aEvent){
		if(this._iconopentimer) clearTimeout(this._iconopentimer);
		this._iconopentimer = null;
		var node = aEvent.currentTarget;
		if(this._iconclosetimer) clearTimeout(this._iconclosetimer);
		this._iconclosetimer = setTimeout(function(){bitsHyperAnchorDummy._hideLinkIcon(node);},500);
	},

	mouseover : function(aEvent){
		bitsHyperAnchorDummy._mouseover(aEvent);
	},

	_mouseover : function(aEvent){
		if(aEvent.currentTarget.nodeName != "A") return;
		var node = aEvent.currentTarget;
		if(this._iconopentimer) clearTimeout(this._iconopentimer);
		this._iconopentimer = setTimeout(function(){bitsHyperAnchorDummy._showLinkIcon(node);},500);
	},

	mouseoverLinkIcon : function(aEvent){
		bitsHyperAnchorDummy._mouseoverLinkIcon(aEvent);
	},

	_mouseoverLinkIcon : function(aEvent){
		if(this._iconopentimer) clearTimeout(this._iconopentimer);
		this._iconopentimer = null;
		if(this._iconclosetimer) clearTimeout(this._iconclosetimer);
		this._iconclosetimer = null;
	},

	_hideLinkIcon : function(aNode){
		if(this._iconclosetimer) clearTimeout(this._iconclosetimer);
		var sURL = this._getURLStringFromDocument(aNode.ownerDocument);
		if(this._iconnode[sURL]){
			this._iconnode[sURL].style.display = 'none';
			if(this._iconnode[sURL].parentNode) this._iconnode[sURL].parentNode.removeChild(this._iconnode[sURL]);
		}
	},

	_isShowLinkIcon : function(aNode){
		try{
			var href = decodeURIComponent(aNode.href);
			var hrefReg = new RegExp("#"+this._anchor_title+"([0-9\.]*):(.+)$");
			if(href && href.match(hrefReg)){
				return true;
			}else{
				return false;
			}
			return true;
		}catch(e){
			return false;
		}
	},
	
	_showLinkIcon : function(aNode){
		if(this._iconopentimer) clearTimeout(this._iconopentimer);
		if(!this._isShowLinkIcon(aNode)) return;
		var doc = aNode.ownerDocument;
		var sURL = this._getURLStringFromDocument(doc);
		if(sURL == "") return;
		var hyperanchor_icon = nsPreferences.copyUnicharPref("wiredmarker.hyperanchor.icon_display","icon_display_left_popup");
		if(!hyperanchor_icon || hyperanchor_icon == "icon_none") return;
		if(hyperanchor_icon == "icon_display_right_popup"){
			var span =doc.createElement("span");
			if(aNode.nextSibling){
				aNode.parentNode.insertBefore(span,aNode.nextSibling);
			}else{
				aNode.parentNode.appendChild(span);
			}
			var offset = this._getPageOffset(span);
			aNode.parentNode.removeChild(span);
			aNode.parentNode.normalize();
			if(this._iconnode[sURL] && offset.top>0 && offset.left>0){
				if(!this._iconnode[sURL].parentNode) aNode.ownerDocument.body.appendChild(this._iconnode[sURL]);
				this._iconnode[sURL].style.top = (offset.top>10?offset.top-10:0) + 'px';
				this._iconnode[sURL].style.left = (offset.left+4) + 'px';
				this._iconnode[sURL].style.display = '';
				this._iconnode[sURL].setAttribute("href",aNode.href);
			}
		}else if(hyperanchor_icon == "icon_display_left_popup"){
			var offset = this._getPageOffset(aNode);
			if(this._iconnode[sURL] && offset.top>0 && offset.left>0){
				if(!this._iconnode[sURL].parentNode) aNode.ownerDocument.body.appendChild(this._iconnode[sURL]);
				this._iconnode[sURL].style.top = (offset.top>0?offset.top:0) + 'px';
				this._iconnode[sURL].style.left = (offset.left-20>0?offset.left-20:0) + 'px';
				this._iconnode[sURL].style.display = '';
				this._iconnode[sURL].setAttribute("href",aNode.href);
			}
		}
	},

	clickLinkIcon : function(aEvent){
		bitsHyperAnchorDummy._clickLinkIcon(aEvent);
	},

	_clickLinkIcon : function(aEvent){
		var node = aEvent.currentTarget;
		var href = node.getAttribute("href");
		var sw = screen.availWidth  -  screen.availLeft;
		var sh = screen.availHeight -  screen.availTop;
		var screenX = aEvent.screenX;
		var screenY = aEvent.screenY;
		if(screenX+this._wndowLinkIconW>sw) screenX = sw-this._wndowLinkIconW;
		if(screenY+this._wndowLinkIconH>sh) screenY = sh-this._wndowLinkIconH;
		if(this._wndowLinkIcon && !this._wndowLinkIcon.closed){
			try{this._wndowLinkIcon.removeEventListener("pageshow",  bitsHyperAnchorDummy.load, false);}catch(ex){}
			this._wndowLinkIcon.close();
		}
		this._wndowLinkIcon = window.open(href, "_wndowLinkIcon" , "chrome,resizable=yes,scrollbars=yes,outerHeight="+this._wndowLinkIconH+",outerWidth="+this._wndowLinkIconW+",screenX="+screenX+",screenY="+screenY);
		this._wndowLinkIcon.addEventListener("pageshow",  bitsHyperAnchorDummy.load, false);
		bitsHyperAnchorDummy._mouseout(aEvent);
	},

	_getPageOffset : function(elem){
		if(!elem) return 0;
		var top = elem.offsetTop;
		var left = elem.offsetLeft;
		while(elem.offsetParent != null){
			if(elem.parentNode.offsetHeight != elem.parentNode.scrollHeight){
				elem.parentNode.scrollTop = elem.offsetTop - elem.parentNode.offsetTop;
				elem = elem.parentNode;
				top = elem.offsetTop;
				left = elem.offsetLeft;
			}
			elem = elem.offsetParent;
			top += elem.offsetTop;
			left += elem.offsetLeft;
		}
		return {top:top,left:left};
	},

	_getURLStringFromDocument : function(aDocument){
		if(!aDocument || !aDocument.location) return "";
		var location = aDocument.location;
		try{
			return location.protocol + "//" + location.host +location.pathname + location.search;
		}catch(ex){
			return location.href;
		}
	},

	trim : function(argValue){
		return argValue.replace(/^[ 　]*/gim, "").replace(/[ 　]*$/gim, "");
	},

/////////////////////////////////////////////////////////////////////
	Common : {

		get RDF()     { return Components.classes['@mozilla.org/rdf/rdf-service;1'].getService(Components.interfaces.nsIRDFService); },
		get RDFC()    { return Components.classes['@mozilla.org/rdf/container;1'].getService(Components.interfaces.nsIRDFContainer); },
		get RDFCU()   { return Components.classes['@mozilla.org/rdf/container-utils;1'].getService(Components.interfaces.nsIRDFContainerUtils); },
		get DIR()     { return Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties); },
		get IO()      { return Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService); },
		get UNICODE(){ return Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].getService(Components.interfaces.nsIScriptableUnicodeConverter); },
		get WINDOW()  { return Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator); },
		get PROMPT()  { return Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService); },
		get PREF()    { return Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch); },
		get JSSSL()   { return Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader); },
		get ENV()     { return Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment); },
		get FAVICON(){ return Components.classes["@mozilla.org/browser/favicon-service;1"].getService(Components.interfaces.nsIFaviconService); },
		get MIME()    { return Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService); },

/////////////////////////////////////////////////////////////////////
		getTimeStamp : function(advance){
			var dd = new Date;
			if(advance) dd.setTime(dd.getTime() + 100000 * advance);
			var y = dd.getFullYear();
			var m = dd.getMonth() + 1; if(m < 10) m = "0" + m;
			var d = dd.getDate();      if(d < 10) d = "0" + d;
			var h = dd.getHours();     if(h < 10) h = "0" + h;
			var i = dd.getMinutes();   if(i < 10) i = "0" + i;
			var s = dd.getSeconds();   if(s < 10) s = "0" + s;
			return y.toString() + m.toString() + d.toString() + h.toString() + i.toString() + s.toString();
		},

/////////////////////////////////////////////////////////////////////
		convertURLToObject : function(aURLString){
			var aURL = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
			aURL.spec = aURLString;
			return aURL;
		},

/////////////////////////////////////////////////////////////////////
		convertFormUnicode : function(aString, aCharset){
			if(!aString) return "";
			try{
				this.UNICODE.charset = aCharset;
				aString = this.UNICODE.ConvertFromUnicode(aString);
			}catch(ex){}
			return aString;
		},

/////////////////////////////////////////////////////////////////////
		getURLStringFromDocument : function(aDocument){
			if(!aDocument) return "";
			var location = aDocument.location;
			try{
				return location.protocol + "//" + location.host +location.pathname + location.search;
			}catch(ex){
				return location.href;
			}
		},

/////////////////////////////////////////////////////////////////////
		getChromeImageURI : function(aURI){
			try{
				const IOService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
				var channel = IOService.newChannelFromURI(aURI);
				var stream  = channel.open();
				var bstream = Components.classes['@mozilla.org/binaryinputstream;1'].createInstance(Components.interfaces.nsIBinaryInputStream);
				bstream.setInputStream(stream);
				var len = stream.available();
				var bytes = bstream.readByteArray(len);
				bstream.close();
				stream.close();
				var mime = this.MIME.getTypeFromURI(aURI);
				var images = String.fromCharCode.apply(String, bytes);
				var image_b64 = btoa(images);
				var dataUri = 'data:' + mime +';base64,' + image_b64;
				return dataUri;
			}catch(e){
				bitsObjectMng._dump("bitsHyperAnchorDummy.Common.getChromeImageURI():"+e);
			}
		  return null;
		},

/////////////////////////////////////////////////////////////////////
		getFocusedWindow : function(){
			var win = document.commandDispatcher.focusedWindow;
			if(!win || win == window || win instanceof Components.interfaces.nsIDOMChromeWindow) win = window._content;
			return win;
		},
	},

/////////////////////////////////////////////////////////////////////
	XPath : {
		xpe : new XPathEvaluator(),

		_acceptNode : function(aNode){
			if(aNode.nodeType == aNode.TEXT_NODE && (/^[\t\n\r ]+$/.test(aNode.nodeValue))) return NodeFilter.FILTER_REJECT;
			return NodeFilter.FILTER_ACCEPT;
		},
		
/////////////////////////////////////////////////////////////////////
		getOffsetFromParentNode : function(aNode,aOffset){
			var xPathNode = aNode;
			var xPathText = "";
			var tmpOffset = aOffset;
			var filter = null;
			if(bitsHyperAnchorDummy._hyperanchor_version != '') filter = this._acceptNode;
			if(this._isTextNode(xPathNode)) xPathNode = xPathNode.parentNode;
			while(xPathNode && xPathNode.id && xPathNode.id.indexOf("bits_") == 0) xPathNode = xPathNode.parentNode;
			while(xPathNode){
				xPathText = this.createXPath(xPathNode);
				if(xPathText.indexOf("bits_") < 0) break;
				xPathNode = xPathNode.parentNode;
			}
			while(xPathText.match(/^(.*)?\/([A-Z]+)\[(\d+)\]$/)){
				var rpath = RegExp.$1;
				var rnode = RegExp.$2;
				var rcnt = RegExp.$3;
				for(;rcnt>0;rcnt--){
					var rnode_xpath = this.evaluate(rpath+'/'+rnode+'['+rcnt+']',xPathNode.ownerDocument);
					if(rnode_xpath){
						for(r2cnt=0;r2cnt<rnode_xpath.snapshotLength;r2cnt++){
							var r2node = rnode_xpath.snapshotItem(r2cnt);
							if(r2node && r2node.id && r2node.id.indexOf("bits_") == 0){
								xPathNode = r2node.parentNode;
								rpath = this.createXPath(xPathNode);
								rcnt = 0;
								break;
							}
						}
					}
				}
				xPathText = rpath;
			}
			if(xPathNode){
				xPathText = this.createXPath(xPathNode);
				if(this._isTextNode(aNode)){
					var nodeWalker = xPathNode.ownerDocument.createTreeWalker(xPathNode,NodeFilter.SHOW_ALL,filter,false);
					var txtNode=nodeWalker.nextNode();
					if(bitsHyperAnchorDummy._hyperanchor_version == null && txtNode.nodeValue == null && aNode.nodeValue.match(/^[\t\n\r ]+$/)){
							tmpOffset = 0;
					}else{
						if(txtNode){
							var nodeCnt = 0;
							var brFlag = false;
							var textareaFlag = false;
							for(;txtNode && txtNode != aNode; txtNode = nodeWalker.nextNode()){
								if(txtNode.nodeType == txtNode.ELEMENT_NODE){
									if(txtNode.nodeName == "BR"){
										brFlag = true;
									}else if(brFlag){
										brFlag = false;
									}
									if(txtNode.nodeName == "TEXTAREA"){
										textareaFlag = true;
									}else if(textareaFlag){
										textareaFlag = false;
									}
									continue;
								}
								if(txtNode.nodeType != txtNode.TEXT_NODE) continue;
								if(textareaFlag){
									textareaFlag = false;
									continue;
								}
								var nodeValue;
								if(bitsHyperAnchorDummy._hyperanchor_version == null){
										var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
										nodeValue = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
								}else{
								 if(bitsHyperAnchorDummy._hyperanchor_version == ''){
									nodeValue = txtNode.nodeValue;
									}else{
										if(parseFloat(bitsHyperAnchorDummy._hyperanchor_version)>=1.1){
											var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
											nodeValue = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
										}else{
											nodeValue = this.trimWhiteSpaceNodeV1_0(txtNode.nodeValue);
										}
									}
								}
								tmpOffset += nodeValue.length;
								nodeCnt++;
								if(brFlag) brFlag = false;
							}
							if(txtNode == aNode && aOffset > 0){
								var xContext = "";
								var range = xPathNode.ownerDocument.createRange();
								try{
									range.setStart(txtNode, 0);
									range.setEnd(txtNode, aOffset);
								}catch(ex2){
									range = null;
								}
								if(range) xContext = range.toString();
								if(bitsHyperAnchorDummy._hyperanchor_version == null){
									var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
									xContext = this.trimWhiteSpaceNodeIE(xContext,ignorFlag);
								}else{
									if(bitsHyperAnchorDummy._hyperanchor_version == ''){
									}else{
										if(parseFloat(bitsHyperAnchorDummy._hyperanchor_version)>=1.1){
											var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
											xContext = this.trimWhiteSpaceNodeIE(xContext,ignorFlag);
										}else{
											xContext = this.trimWhiteSpaceNodeV1_0(xContext);
										}
									}
								}
								if(aOffset>xContext.length) tmpOffset -= (aOffset-xContext.length);
							}
							if(tmpOffset<0) tmpOffset = 0;
						}else{
							tmpOffset = 0;
						}
					}
					
				}else{
					var nodeWalker = xPathNode.ownerDocument.createTreeWalker(aNode,NodeFilter.SHOW_TEXT,null,false);
					var aTxtNode=nodeWalker.nextNode();
					if(aTxtNode){
						var nodeWalker = xPathNode.ownerDocument.createTreeWalker(xPathNode,NodeFilter.SHOW_TEXT,filter,false);
						var txtNode=nodeWalker.nextNode();
						var nodeValue;
						if(txtNode){
							for(;txtNode && txtNode != aTxtNode;txtNode = nodeWalker.nextNode()){
								if(bitsHyperAnchorDummy._hyperanchor_version == null){
									var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
									nodeValue = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
								}else{
									if(bitsHyperAnchorDummy._hyperanchor_version == ''){
										nodeValue = txtNode.nodeValue;
									}else{
										if(parseFloat(bitsHyperAnchorDummy._hyperanchor_version)>=1.1){
											var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
											nodeValue = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
										}else{
											nodeValue = this.trimWhiteSpaceNodeV1_0(txtNode.nodeValue);
										}
									}
								}
								tmpOffset += nodeValue.length;
							}
							if(txtNode == aNode){
								var xContext;
								if(bitsHyperAnchorDummy._hyperanchor_version == null){
									var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
									xContext = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
								}else{
									if(bitsHyperAnchorDummy._hyperanchor_version == ''){
										xContext = txtNode.nodeValue;
									}else{
										if(parseFloat(bitsHyperAnchorDummy._hyperanchor_version)>=1.1){
											var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
											xContext = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
										}else{
											xContext = this.trimWhiteSpaceNodeV1_0(txtNode.nodeValue);
										}
									}
								}
								if(nodeValue.length>xContext.length) tmpOffset -= (nodeValue.length-xContext.length);
							}
							if(tmpOffset<0) tmpOffset = 0;
						}else{
							tmpOffset = 0;
						}
					}
				}
			}
			return {
				node   : xPathNode,
				xpath  : xPathText,
				offset : tmpOffset,
				type   : aNode.nodeType,
			};
		},
		
/////////////////////////////////////////////////////////////////////
		getCurrentNodeFromXPath : function(aDoc,aXPath,aOffset,aType){
			try{
				var rtnNode = null;
				var tmpOffset = aOffset;
				var realOffset = -1;
				var filter = null;
				if(bitsHyperAnchorDummy._hyperanchor_version != '') filter = this._acceptNode;
				try{var evaluateNode = this.evaluate(aXPath,aDoc).snapshotItem(0);}catch(ex2){}
				if(evaluateNode && aType == 3){
					var nodeWalker = aDoc.createTreeWalker(evaluateNode,NodeFilter.SHOW_ALL,filter,false);
					var txtNode=nodeWalker.nextNode();
					if(txtNode){
						var nodeCnt=0;
						var brFlag = false;
						var textareaFlag = false;
						var lstNode = null;
						for(;txtNode;txtNode = nodeWalker.nextNode()){
							if(txtNode.nodeType == txtNode.ELEMENT_NODE){
								if(txtNode.nodeName == "BR"){
									brFlag = true;
								}else if(brFlag){
									brFlag = false;
								}
								if(txtNode.nodeName == "TEXTAREA"){
									textareaFlag = true;
								}else if(textareaFlag){
									textareaFlag = false;
								}
								continue;
							}
							if(txtNode.nodeType != txtNode.TEXT_NODE) continue;
							if(textareaFlag){
								textareaFlag = false;
								continue;
							}
							var nodeValue;
							if(bitsHyperAnchorDummy._hyperanchor_version == ''){
								nodeValue = txtNode.nodeValue;
							}else{
								if(parseFloat(bitsHyperAnchorDummy._hyperanchor_version)>=1.1){
									var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
									nodeValue = this.trimWhiteSpaceNodeIE(txtNode.nodeValue,ignorFlag);
								}else{
									nodeValue = this.trimWhiteSpaceNodeV1_0(txtNode.nodeValue);
								}
							}
							
							if(tmpOffset - nodeValue.length<0 || (tmpOffset>0 && (tmpOffset - nodeValue.length)==0)){
								rtnNode = txtNode;
								break;
							}
							tmpOffset -= nodeValue.length;
							lstNode = txtNode;
							nodeWalker.currentNode = txtNode;
							nodeCnt++;
							if(brFlag) brFlag = false;
						}
						
						if(rtnNode == null){
							rtnNode = lstNode;
						}else{
							if(bitsHyperAnchorDummy._hyperanchor_version == ''){
								realOffset = tmpOffset;
							}else{
								if(parseFloat(bitsHyperAnchorDummy._hyperanchor_version)>=1.1){
									var ignorFlag = (nodeCnt==0 || brFlag) ? true : false;
									realOffset = this.calcRealOffsetIE(rtnNode.nodeValue,tmpOffset,ignorFlag);
								}else{
									realOffset = this.calcRealOffsetV1_0(rtnNode.nodeValue,tmpOffset);
								}
							}
						}
						
					}else{
						rtnNode = evaluateNode;
					}
				}else{
					rtnNode = evaluateNode;
				}
				return { node: rtnNode, offset : realOffset};
			}catch(ex){
				bitsObjectMng._dump("getCurrentNodeFromXPath():"+ex);
				return undefined;
			}
		},
		
/////////////////////////////////////////////////////////////////////
		trimWhiteSpaceNodeIE : function(nodeValue,flag){
			if(flag){
				nodeValue = nodeValue.replace(/^[\n\r\t ]+/mg,"").replace(/[\n\r\t ]+/mg," ");
			}else{
				nodeValue = nodeValue.replace(/[\n\r\t ]+/mg," ");
			}
			return nodeValue;
		},
		
/////////////////////////////////////////////////////////////////////
		calcRealOffsetIE : function(nodeValue,aOffset,flag){
			var realOffset = 0;
			if(flag && nodeValue.match(/^([\n\r\t ]+)/)){
				var spText = RegExp.$1;
				nodeValue = RegExp.rightContext;
				realOffset += spText.length;
			}
			var i= 0;
			while(i < aOffset && nodeValue.length > 0){
				if(nodeValue.match(/^([\n\r\t ]+)/)){
					var spText = RegExp.$1;
					nodeValue = RegExp.rightContext;
					realOffset += spText.length;
					i += 1;
				}else if(nodeValue.match(/^([^ \t\n\r])/)){
					nodeValue = RegExp.rightContext;
					realOffset += 1;
					i += 1;
				}
			}
			return realOffset;
		},
		
/////////////////////////////////////////////////////////////////////
		trimWhiteSpaceNodeV1_0 : function(nodeValue){
			return nodeValue.replace(/^[\n\r\t ]+/mg,"").replace(/[\n\r\t ]+/mg," ");
		},
		
/////////////////////////////////////////////////////////////////////
		calcRealOffsetV1_0 : function(nodeValue,aOffset){
			var realOffset = 0;
			if(nodeValue.match(/^([\n\r\t ]+)/)){
				var spText = RegExp.$1;
				nodeValue = RegExp.rightContext;
				realOffset += spText.length;
			}
			var i= 0;
			while(i < aOffset && nodeValue.length > 0){
				if(nodeValue.match(/^([\n\r\t ]+)/)){
					var spText = RegExp.$1;
					nodeValue = RegExp.rightContext;
					realOffset += spText.length;
					i += 1;
				}else if(nodeValue.match(/^([^ \t\n\r])/)){
					nodeValue = RegExp.rightContext;
					realOffset += 1;
					i += 1;
				}
			}
			return realOffset;
		},

/////////////////////////////////////////////////////////////////////
		_isTextNode : function(aNode){ 
			return aNode.nodeType == aNode.TEXT_NODE;
		},

/////////////////////////////////////////////////////////////////////
		getDocument : function(aNode){
			return (aNode.ownerDocument == null ? aNode : aNode.ownerDocument);
		},

/////////////////////////////////////////////////////////////////////
		getDocumentElement : function(aNode){
			return (aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
		},

/////////////////////////////////////////////////////////////////////
		evaluate : function(aExpr, aNode){
			return this.getDocument(aNode).evaluate(aExpr, aNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);;
		},

/////////////////////////////////////////////////////////////////////
		isPMC : function(aNode){
			if(!aNode || !aNode.ownerDocument) return false;
			if(aNode.ownerDocument.URL.match(/^http:\/\/www\.pubmedcentral\.nih\.gov\//)) return true;
			if(aNode.ownerDocument.URL.match(/^http:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\//)) return true;
			return false;
		},

/////////////////////////////////////////////////////////////////////
		isUseNodeId : function(aNode){
			if(!aNode.id || aNode.id.match(/^bits_/)) return false;
			var id_check = this.isPMC(aNode);
			if(id_check && aNode.id.match(/^[A-Za-z_]+\d+[a-z]*$/)) return false;
			var id_nodes = this.evaluate('//*[@id="'+aNode.id+'"]', aNode);
			if(id_nodes.snapshotLength>1) return false;
			return true;
		},

/////////////////////////////////////////////////////////////////////
		createXPath : function(aNode){
			var nodeName = aNode.localName.toLowerCase();
			if(this.isUseNodeId(aNode)) return '//'+nodeName+'[@id="'+aNode.id+'"]';
			var path = [];
			var node = aNode;
			var i;
			var j;
			var tarNode;
			var tarNodeName;
			var ancestorNodes = []
			var nodes = this.evaluate('ancestor-or-self::*', node);
			var len = nodes.snapshotLength;
			for(i=0;i<len;i++){ ancestorNodes.push(nodes.snapshotItem(i)); }
			for(i=ancestorNodes.length-1;i>=0;i--){
				tarNode = ancestorNodes[i];
				if(tarNode.id && this.isUseNodeId(tarNode)) break;
				nodes = this.evaluate('preceding-sibling::*[@id]', tarNode);
				tarNode = null;
				len = nodes.snapshotLength;
				for(j=len-1;j>=0;j--){
					tarNode = nodes.snapshotItem(j);
					if(this.isUseNodeId(tarNode)) break;
					tarNode = null;
				}
				if(tarNode) break;
			}
			if(tarNode){
				tarNodeName = '//'+tarNode.localName.toLowerCase()+'[@id="'+tarNode.id+'"]';
			}else{
				tarNode = this.getDocumentElement(node);
				tarNodeName = '/'+tarNode.localName.toLowerCase()+'[1]';
			}
			while(tarNode.parentNode != node.parentNode){
				nodes = this.evaluate('preceding-sibling::'+nodeName, node);
				path.unshift(nodeName+'['+(nodes.snapshotLength+1)+']');
				node = node.parentNode;
				nodeName = node.localName.toLowerCase();
			}
			if(tarNode != node){
				var axis = 'following-sibling::';
				nodes = this.evaluate(axis+nodeName, tarNode);
				len = nodes.snapshotLength;
				for(i=0;i<len&&nodes.snapshotItem(i)!=node;i++){}
				path.unshift(axis+nodeName+'['+(i+1)+']');
			}
			path.unshift(tarNodeName);
			return path.join('/');
		},
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);

	},
	
/////////////////////////////////////////////////////////////////////
};
