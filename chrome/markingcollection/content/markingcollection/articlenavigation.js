var bitsArticleNavigation = {
/////////////////////////////////////////////////////////////////////
	_init   : false,
	_timer  : null,
	_zoomtimer  : null,
	_select : false,
	_height : 0,
	_moveovertimer  : null,
	_contentDocument : null,

	_textZoom : 0,

	_no_dbtype : "articleip",

	prefObserver : {
		domain  : 'wiredmarker',
			//"wiredmarker.xxx"という名前の設定が変更された場合全てで処理を行う
			observe : function(aSubject, aTopic, aPrefstring) {
				if (aTopic == 'nsPref:changed') {
					switch (aPrefstring){
						case "wiredmarker.last_update":
//							var inittime = bitsObjectMng.DataSource.inittime;
//							var value = nsPreferences.copyUnicharPref(aPrefstring);
//							var arr = value.split("\t");
//							if(inittime == arr[2]) return;
							if(!bitsArticleNavigation) return;
							if(!bitsArticleNavigation.disp) return;

							var value = nsPreferences.copyUnicharPref(aPrefstring,"");
							var arr = value.split("\t");
//							bitsArticleNavigation._dump(arr[3]+"\t"+arr[4]);
							if(arr[3] == "INSERT" && arr[4] == "FOLDER") return;

							if(bitsArticleNavigation._timer) clearTimeout(bitsArticleNavigation._timer);
							bitsArticleNavigation._timer = setTimeout(function(){ bitsArticleNavigation.drawConcordance(); },100);
							break;

						case "wiredmarker.concordance":
							var mode = nsPreferences.copyUnicharPref("wiredmarker.concordance","");
							var checked = document.getElementById("viewMarkingCollection").getAttribute("checked");
							bitsArticleNavigation.done();
							bitsArticleNavigation.init();
							if(mode == "" && checked == "true"){
								bitsArticleNavigation._sidebarshow();
							}
							break;

						default:
							break;
					}
				}
			}
	},

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("ArticleNavigationOverlayString"); },
	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get XPath()      { return bitsObjectMng.XPath;      },
	get Database()   { return bitsObjectMng.Database;   },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

	get SIDEBAR()              { return document.getElementById("sidebar"); },
	get CONCORDANCE()          { return document.getElementById("ArticleNavigationConcordance"); },
	get CONCORDANCE_Splitter() { return document.getElementById("ArticleNavigationConcordanceSplitter"); },

	get CONCORDANCE_AREAT()    { return document.getElementById("ArticleNavigationConcordanceArea"); },
	get CONCORDANCE_BASELINE() { return document.getElementById("ArticleNavigationConcordanceBaseLine");},
	get CONCORDANCE_SENTENCE() { return document.getElementById("ArticleNavigationConcordanceItemSentence");},
	get CONCORDANCE_MAPPING()  { return document.getElementById("ArticleNavigationConcordanceItemMapping");},
	get CONCORDANCE_SECTION()  { return document.getElementById("ArticleNavigationConcordanceItemSection"); },

	get ZoomReduce()  { return (top.document.getElementById("cmd_textZoomReduce")?top.document.getElementById("cmd_textZoomReduce"):top.document.getElementById("cmd_fullZoomReduce")); },
	get ZoomEnlarge() { return (top.document.getElementById("cmd_textZoomEnlarge")?top.document.getElementById("cmd_textZoomEnlarge"):top.document.getElementById("cmd_fullZoomEnlarge")); },
	get ZoomReset()   { return (top.document.getElementById("cmd_textZoomReset")?top.document.getElementById("cmd_textZoomReset"):top.document.getElementById("cmd_fullZoomReset")); },

	get MarkingCollectionWindowID() { return "MarkingCollectionWindow"; },
	get ArticleIPWindowID()         { return "ArticleIPWindow"; },

	get disp() { return (this.CONCORDANCE.getAttribute("hidden")=="true"?false:true); },

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(bitsArticleNavigation._init) return;
		try{
			if(!bitsObjectMng){
				setTimeout(function(){bitsArticleNavigation.init(aEvent)},1000);
				return;
			}
		}catch(ex){
			setTimeout(function(){bitsArticleNavigation.init(aEvent)},1000);
			return;
		}
		try{
			this.Common.addPrefListener(this.prefObserver);

			bitsArticleNavigation._textZoom = bitsArticleNavigation.gBrowser.markupDocumentViewer.textZoom;

			var mode = nsPreferences.copyUnicharPref("wiredmarker.concordance","");
			if(mode == ""){
				bitsArticleNavigation.SIDEBAR.addEventListener("pageshow", bitsArticleNavigation.sidebarshow, false);
				bitsArticleNavigation.SIDEBAR.addEventListener("pagehide", bitsArticleNavigation.sidebarhide, false);
			}else if(mode == "display"){
				bitsArticleNavigation._sidebarshow();
			}

			bitsArticleNavigation._init = true;

		}catch(ex){
			this.Common.alert("bitsArticleNavigation.init():"+ex);
			bitsArticleNavigation._init = false;
		}

	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(bitsArticleNavigation._init){
			bitsArticleNavigation._sidebarhide();

			bitsArticleNavigation.SIDEBAR.removeEventListener("pageshow", bitsArticleNavigation.sidebarshow, false);
			bitsArticleNavigation.SIDEBAR.removeEventListener("pagehide", bitsArticleNavigation.sidebarhide, false);

			bitsArticleNavigation.Common.removePrefListener(bitsArticleNavigation.prefObserver);
		}
		bitsArticleNavigation._init = false;

		if(bitsArticleNavigation._timer) clearTimeout(bitsArticleNavigation._timer);
		bitsArticleNavigation._timer = null;
	},

/////////////////////////////////////////////////////////////////////
	startObserver : function(){
		try{
			this.Common.addPrefListener(this.prefObserver);
			if(!this.disp) return;
			if(this._timer) clearTimeout(bitsArticleNavigation._timer);
			var self = this;
			this._timer = setTimeout(function(){ self.drawConcordance(); },100);
		}catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	stopObserver : function(){
		try{
			this.Common.removePrefListener(this.prefObserver);
		}catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	zoom : function(aEvent){
		if(bitsArticleNavigation._zoomtimer) clearTimeout(bitsArticleNavigation._zoomtimer);
		bitsArticleNavigation._zoomtimer = setTimeout(bitsArticleNavigation.zoomConcordance,0);
	},

/////////////////////////////////////////////////////////////////////
	zoomConcordance : function(){
		if(bitsArticleNavigation._zoomtimer) clearTimeout(bitsArticleNavigation._zoomtimer);
		bitsArticleNavigation._zoomtimer = null;
		if(bitsArticleNavigation._textZoom != bitsArticleNavigation.gBrowser.markupDocumentViewer.textZoom) bitsArticleNavigation.redrawConcordance();
		bitsArticleNavigation.scrollConcordance(bitsArticleNavigation.gBrowser.contentDocument);
	},

/////////////////////////////////////////////////////////////////////
	sidebarshow : function(event){
		if(!event.target.documentElement) return;
		if(
			event.target.documentElement.id != bitsArticleNavigation.MarkingCollectionWindowID &&
			event.target.documentElement.id != bitsArticleNavigation.ArticleIPWindowID
		) return;
		bitsArticleNavigation._sidebarshow();
	},

/////////////////////////////////////////////////////////////////////
	_sidebarshow : function(event){

		if(this._timer) clearTimeout(this._timer);
		this._timer = setTimeout(bitsArticleNavigation.drawConcordance,0);

		this.CONCORDANCE.removeAttribute("hidden");

		this.gBrowser.addEventListener("pageshow", this.pageshow, false);
		this.gBrowser.addEventListener("select", this.pageselect, false);
		this.gBrowser.addEventListener("resize", this.resizeListener, false);

		this.CONCORDANCE.addEventListener("click", this.clickConcordance, false);



		this.ZoomReduce.addEventListener("command", bitsArticleNavigation.zoom, false);
		this.ZoomEnlarge.addEventListener("command", bitsArticleNavigation.zoom, false);
		this.ZoomReset.addEventListener("command", bitsArticleNavigation.zoom, false);

		this.pageshow(this.gBrowser.contentDocument);
	},

/////////////////////////////////////////////////////////////////////
	sidebarhide : function(event){
		if(!event.target.documentElement) return;
		if(
			event.target.documentElement.id != bitsArticleNavigation.MarkingCollectionWindowID &&
			event.target.documentElement.id != bitsArticleNavigation.ArticleIPWindowID
		) return;
		bitsArticleNavigation._sidebarhide();
	},

/////////////////////////////////////////////////////////////////////
	_sidebarhide : function(){
		this.hideConcordanceAll();

		this.gBrowser.removeEventListener("pageshow", this.pageshow, false);
		this.gBrowser.removeEventListener("select", this.pageselect, false);
		this.gBrowser.removeEventListener("resize", this.resizeListener, false);

		this.CONCORDANCE.removeEventListener("click", this.clickConcordance, false);

		this.ZoomReduce.removeEventListener("command", this.zoom, false);
		this.ZoomEnlarge.removeEventListener("command", this.zoom, false);
		this.ZoomReset.removeEventListener("command", this.zoom, false);

		this.CONCORDANCE.setAttribute("hidden",true);
	},

/////////////////////////////////////////////////////////////////////
	pageshow : function(event){
		if(bitsArticleNavigation._timer) clearTimeout(bitsArticleNavigation._timer);
		bitsArticleNavigation._timer = setTimeout(bitsArticleNavigation.drawConcordance,0);

		bitsArticleNavigation._contentDocument = bitsArticleNavigation.gBrowser.contentDocument;
		var doc = bitsArticleNavigation._contentDocument;

		if(doc.defaultView.frames && doc.defaultView.frames.length>0){
			for(var wincnt=0;wincnt<doc.defaultView.frames.length;wincnt++){
				if(!doc.defaultView.frames[wincnt].document.documentElement) continue;
				doc.defaultView.frames[wincnt].document.addEventListener("scroll", bitsArticleNavigation.scrollListener, false);
				doc.defaultView.frames[wincnt].document.addEventListener("mouseover", bitsArticleNavigation.mouseoverListener, false);
			}
		}
		if(doc.documentElement){
			doc.addEventListener("scroll", bitsArticleNavigation.scrollListener, false);
		}
	},

/////////////////////////////////////////////////////////////////////
	pageselect : function(event){
		if(!bitsArticleNavigation._select){
			bitsArticleNavigation._select = true;
			return;
		}
		bitsArticleNavigation._select = false;

		bitsArticleNavigation._contentDocument = bitsArticleNavigation.gBrowser.contentDocument;

		if(bitsArticleNavigation._timer) clearTimeout(bitsArticleNavigation._timer);
		bitsArticleNavigation._timer = setTimeout(bitsArticleNavigation.drawConcordance,0);
	},

/////////////////////////////////////////////////////////////////////
	getElemOffsetHeight : function(elem,height){
		if(!elem) return 0;
		if(!height) height = 0;
		if(height < elem.offsetHeight) height = elem.offsetHeight;
		for(var i=0;i<elem.childNodes.length;i++){
			var c_elem = elem.childNodes[i];
			if(c_elem.firstChild){
				height = bitsArticleNavigation.getElemOffsetHeight(c_elem,height);
			}else{
				if(height < c_elem.offsetHeight) height = c_elem.offsetHeight;
			}
		}
		return height;
	},

/////////////////////////////////////////////////////////////////////
	getElementById : function(pElemId){
		try {
			if(!pElemId || pElemId=="") return null;

			var DOC = [];
			if(this.gBrowser.contentWindow.frames){
				for(var wincnt=0;wincnt<this.gBrowser.contentWindow.frames.length;wincnt++){
					DOC.push(this.gBrowser.contentWindow.frames[wincnt].document);
				}
			}
			DOC.push(this.gBrowser.contentDocument);
			var elem = null;
			for(var i=0;i<DOC.length;i++){
				var doc = DOC[i];
				elem = doc.getElementById(pElemId);
				if(elem) break;
			}
			return elem;
		}catch(ex){
			this._dump("getElementById():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	drawConcordanceFromID : function(aID,aStyle){
		var elem_id = aID;
		var elem = bitsArticleNavigation.getElementById(elem_id);
		if(!elem) return;
		if(!elem.ownerDocument.documentElement.offsetWidth) return;

		var xPathResult = bitsArticleNavigation.XPath.evaluate('//*[@id="'+elem_id+'"]', elem.ownerDocument);

		var elemOffset = bitsArticleNavigation.getPageOffset(elem);
		if(!elemOffset) return;

		var elemMinOffset = elemOffset;
		var elemMinHeight = bitsArticleNavigation.getElemOffsetHeight(elem) + elemMinOffset.top;

		var elemMaxOffset = elemOffset;
		var elemMaxHeight = elemMinHeight;


		for(var j=0;j<xPathResult.snapshotLength;j++){
			var node = xPathResult.snapshotItem(j);
			var offset = bitsArticleNavigation.getPageOffset(node);
			var height = bitsArticleNavigation.getElemOffsetHeight(node);
			if(offset.top+height>elemMaxHeight){
				elemMaxOffset = offset;
				elemMaxHeight = height+offset.top;
			}
			if(offset.top+height<elemMinHeight){
				elemMinOffset = offset;
				elemMinHeight = height+offset.top;
			}
		}

		var ConcordanceItemMapping = bitsArticleNavigation.CONCORDANCE_MAPPING;
		var ConcordanceBaseLine = bitsArticleNavigation.CONCORDANCE_BASELINE;

		var ConcordanceItemMappingClone = ConcordanceBaseLine.ownerDocument.getElementById(elem_id);
		if(!ConcordanceItemMappingClone){
			ConcordanceItemMappingClone = ConcordanceItemMapping.cloneNode(true);
			if(!ConcordanceItemMappingClone) return;
			ConcordanceBaseLine.appendChild(ConcordanceItemMappingClone);
			ConcordanceItemMappingClone.id = elem_id;
		}

		var lastElemOffset = {width:elem.ownerDocument.documentElement.offsetWidth,height:elem.ownerDocument.documentElement.offsetHeight};
		if(elem.ownerDocument.body){
			if(elem.ownerDocument.body.offsetWidth > lastElemOffset.width)   lastElemOffset.width  = elem.ownerDocument.body.offsetWidth;
			if(elem.ownerDocument.body.offsetHeight > lastElemOffset.height) lastElemOffset.height = elem.ownerDocument.body.offsetHeight;
		}
		var itemHeightRate = ConcordanceBaseLine.offsetHeight/lastElemOffset.height;

		if(aStyle){
			ConcordanceItemMappingClone.setAttribute("style",aStyle);
			if(ConcordanceItemMappingClone.style.borderBottom){
				ConcordanceItemMappingClone.style.border = ConcordanceItemMappingClone.style.borderBottom;
				ConcordanceItemMappingClone.style.borderWidth = 'thin';
			}else if(!ConcordanceItemMappingClone.style.backgroundColor && ConcordanceItemMappingClone.style.color){
				ConcordanceItemMappingClone.style.border = 'thin solid '+ ConcordanceItemMappingClone.style.color;
			}else if(ConcordanceItemMappingClone.style.backgroundColor){
				ConcordanceItemMappingClone.style.border = 'thin solid '+ ConcordanceItemMappingClone.style.backgroundColor;
			}
		}else{
			ConcordanceItemMappingClone.style.border = 'thin solid #000';
		}

		ConcordanceItemMappingClone.style.position = 'absolute';
		ConcordanceItemMappingClone.style.left = '0px';
		ConcordanceItemMappingClone.style.width = (ConcordanceBaseLine.offsetWidth-4) +'px';
		ConcordanceItemMappingClone.style.display = '';

		var rtnHeight = Math.round((elemMaxHeight-elemMinOffset.top)*itemHeightRate)-2;
		if(rtnHeight<0) rtnHeight = 0;
		var rtnTop =Math.round(elemMinOffset.top*itemHeightRate);
		if(rtnTop<0) rtnTop = 0;

		ConcordanceItemMappingClone.style.top =rtnTop + 'px';
		ConcordanceItemMappingClone.style.height = rtnHeight + 'px';
	},

/////////////////////////////////////////////////////////////////////
	drawConcordanceFromObject : function(aObject,aStyle){
		if(!aObject) return;

		var elem_id = aObject.oid;

		var DOC = [];
		if(this.gBrowser.contentWindow.frames){
			for(var wincnt=0;wincnt<this.gBrowser.contentWindow.frames.length;wincnt++){
				DOC.push(this.gBrowser.contentWindow.frames[wincnt].document);
			}
		}
		DOC.push(this.gBrowser.contentDocument);

		var doc = null;
		var i;
		for(i=0;i<DOC.length;i++){
//			if(aObject.con_url == this.Common.getURLStringFromDocument(DOC[i])){
			if(aObject.con_url == bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(DOC[i]))){
				doc = DOC[i];
				break;
			}
		}

		if(!doc) return;

		var aXPath = {};
		aObject.bgn_dom.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
		aXPath.startPath   = RegExp.$1;
		aXPath.startOffset = RegExp.$2;
		aXPath.startType   = RegExp.$3;

		aObject.end_dom.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
		aXPath.endPath   = RegExp.$1;
		aXPath.endOffset = RegExp.$2;
		aXPath.endType   = RegExp.$3;

		var elem = null;
		if(aObject.bgn_dom != aObject.end_dom){

			var startNode = this.XPath.getCurrentNodeFromXPath(doc,aXPath.startPath,aXPath.startOffset,aXPath.startType);
			if(!startNode || !startNode.node) return;
			var endNode = this.XPath.getCurrentNodeFromXPath(doc,aXPath.endPath,aXPath.endOffset,aXPath.endType);
			if(!endNode || !endNode.node) return;

			var range = doc.createRange();
			try{
				range.setStart(startNode.node, startNode.offset);
				range.setEnd(endNode.node, endNode.offset);
			}catch(ex2){
				this._dump("bitsArticleNavigation.drawConcordanceFromObject():"+ex2);
				return false;
			}


			var nodeWalker = doc.createTreeWalker(range.commonAncestorContainer,NodeFilter.SHOW_ELEMENT,null,false);
			if(nodeWalker){
				var txtNode=nodeWalker.nextNode();
				for(;txtNode;txtNode = nodeWalker.nextNode()){

					if(range.compareNode(txtNode) == range.NODE_BEFORE) continue;
					if(range.compareNode(txtNode) == range.NODE_AFTER) break;


					if(txtNode.nodeName != "IMG") continue;
					if(txtNode.src != aObject.oid_txt) continue;
					elem = txtNode;
					break;
				}
			}
		}else{
			var startNode = this.XPath.getCurrentNodeFromXPath(doc,aXPath.startPath,aXPath.startOffset,aXPath.startType);
			if(!startNode || !startNode.node) return;
			elem = startNode.node;
		}






		var elemOffset = bitsArticleNavigation.getPageOffset(elem);
		if(!elemOffset) return;

		var elemMinOffset = elemOffset;
		var elemMinHeight = bitsArticleNavigation.getElemOffsetHeight(elem) + elemMinOffset.top;

		var elemMaxOffset = elemOffset;
		var elemMaxHeight = elemMinHeight;

		var ConcordanceItemMapping = bitsArticleNavigation.CONCORDANCE_MAPPING;
		var ConcordanceBaseLine = bitsArticleNavigation.CONCORDANCE_BASELINE;

		var ConcordanceItemMappingClone = ConcordanceBaseLine.ownerDocument.getElementById(elem_id);
		if(!ConcordanceItemMappingClone){
			ConcordanceItemMappingClone = ConcordanceItemMapping.cloneNode(true);
			if(!ConcordanceItemMappingClone) return;
			ConcordanceBaseLine.appendChild(ConcordanceItemMappingClone);
			ConcordanceItemMappingClone.id = elem_id;
		}

		var lastElemOffset = {width:elem.ownerDocument.documentElement.offsetWidth,height:elem.ownerDocument.documentElement.offsetHeight};
		var itemHeightRate = ConcordanceBaseLine.offsetHeight/lastElemOffset.height;


		if(aStyle){
			ConcordanceItemMappingClone.setAttribute("style",aStyle);
			if(ConcordanceItemMappingClone.style.borderBottom){
				ConcordanceItemMappingClone.style.border = ConcordanceItemMappingClone.style.borderBottom;
				ConcordanceItemMappingClone.style.borderWidth = 'thin';
			}else if(!ConcordanceItemMappingClone.style.backgroundColor && ConcordanceItemMappingClone.style.color){
				ConcordanceItemMappingClone.style.border = 'thin solid '+ ConcordanceItemMappingClone.style.color;
			}else if(ConcordanceItemMappingClone.style.backgroundColor){
				ConcordanceItemMappingClone.style.border = 'thin solid '+ ConcordanceItemMappingClone.style.backgroundColor;
			}
		}else{
			ConcordanceItemMappingClone.style.border = 'thin solid #000';
		}

		ConcordanceItemMappingClone.style.position = 'absolute';
		ConcordanceItemMappingClone.style.left = '0px';
		ConcordanceItemMappingClone.style.width = (ConcordanceBaseLine.offsetWidth-4) +'px';
		ConcordanceItemMappingClone.style.display = '';

		var rtnHeight = Math.round((elemMaxHeight-elemMinOffset.top)*itemHeightRate)-2;
		if(rtnHeight<0) rtnHeight = 0;
		var rtnTop =Math.round(elemMinOffset.top*itemHeightRate);
		if(rtnTop<0) rtnTop = 0;

		ConcordanceItemMappingClone.style.top =rtnTop + 'px';
		ConcordanceItemMappingClone.style.height = rtnHeight + 'px';
	},

/////////////////////////////////////////////////////////////////////
	drawConcordance : function(){
		try{
			var self = bitsArticleNavigation;
//self._dump("bitsArticleNavigation.drawConcordance()");
			self.hideConcordanceAll();
			var urlString = self.Common.getURLStringFromDocument(self.gBrowser.contentDocument);
			var rtnObj = self.Database.getAllObjectFormContentURL(bitsAutocacheService.convertCacheURLToOriginalURL(urlString));
			if(rtnObj){
				self._timer = setTimeout(function(){ self._drawConcordance(rtnObj); },0);
			}else{
				self.scrollConcordance(self.gBrowser.contentDocument);
				self._textZoom = self.gBrowser.markupDocumentViewer.textZoom;
			}
		}catch(e){
			self._dump("bitsArticleNavigation.drawConcordance():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_drawConcordance : function(aObjs){
//this._dump("bitsArticleNavigation._drawConcordance():aObjs=["+ (aObjs?aObjs.length:0) + "]");
		try{
			var i;
			for(i=0;i<10 && aObjs.length>0;i++){
				var obj = aObjs.shift();
				if(obj.oid_type.match(/^image.+$/im)){
					this.drawConcordanceFromObject(obj,obj.fid_style);
				}else{
					var elem_id = bitsMarker.id_key+obj.dbtype+obj.oid;
					this.drawConcordanceFromID(elem_id,obj.fid_style);
				}
			}
			if(aObjs.length == 0){
				this.scrollConcordance(this.gBrowser.contentDocument);
				this._textZoom = this.gBrowser.markupDocumentViewer.textZoom;
				return;
			}
			var self = this;
			this._timer = setTimeout(function(){ self._drawConcordance(aObjs); },500);
		}catch(e){
			this._dump("bitsArticleNavigation._drawConcordance():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	hideConcordanceAll : function(){
		var conChild = this.CONCORDANCE_BASELINE.lastChild;
		var previousSibling = null;
		while(conChild){
			previousSibling = conChild.previousSibling;
			this.CONCORDANCE_BASELINE.removeChild(conChild);
			conChild = previousSibling;
		}
	},

/////////////////////////////////////////////////////////////////////
	getPageOffset : function(aElem){
		try {
			if(!aElem) return null;
			var elem = aElem;
			var top = elem.offsetTop;
			var left = elem.offsetLeft;
			while(elem.offsetParent != null){
				if(elem.parentNode && elem.parentNode.offsetHeight != elem.parentNode.scrollHeight){
					elem = elem.parentNode;
					top = elem.offsetTop;
					left = elem.offsetLeft;
				}
				if(!elem || !elem.offsetParent) break;
				elem = elem.offsetParent;
				top += elem.offsetTop;
				left += elem.offsetLeft;
			}
			return {left:left,top:top};
		} catch( e ){
			bitsArticleNavigation._dump("bitsArticleNavigation.getPageOffset():["+e+"]");
		}
	},

/////////////////////////////////////////////////////////////////////
	clickConcordance : function(aEvent){
		try {
			if(!bitsArticleNavigation._contentDocument) return;
			var curDocument = bitsArticleNavigation._contentDocument;
			var ConcordanceBaseLine = bitsArticleNavigation.CONCORDANCE_BASELINE;
			var pageOffset = bitsArticleNavigation.getPageOffset(ConcordanceBaseLine);
			var frame = bitsArticleNavigation._contentDocument.defaultView;;
			if(!frame) return;
			if(bitsArticleNavigation._textZoom != bitsArticleNavigation.gBrowser.markupDocumentViewer.textZoom) bitsArticleNavigation.redrawConcordance();

			var y_offs = aEvent.pageY-pageOffset.top;
			if(bitsArticleNavigation._height>0) y_offs -= Math.round(bitsArticleNavigation._height/2);
			var offsetHeight = curDocument.documentElement.offsetHeight;
			if(curDocument.body && offsetHeight < curDocument.body.offsetHeight) offsetHeight = curDocument.body.offsetHeight;
			y_offs = Math.round((y_offs/ConcordanceBaseLine.offsetHeight) * offsetHeight);
			frame.scroll( frame.pageXOffset, y_offs );
			bitsArticleNavigation.scrollConcordance(curDocument);

		} catch( e ){
			bitsArticleNavigation._dump("bitsArticleNavigation.clickConcordance():["+e+"]");
		}
	},

/////////////////////////////////////////////////////////////////////
	scrollListener : function(aEvent){
		if(bitsArticleNavigation._textZoom != bitsArticleNavigation.gBrowser.markupDocumentViewer.textZoom) bitsArticleNavigation.redrawConcordance();
		bitsArticleNavigation.scrollConcordance(aEvent.target);
	},

/////////////////////////////////////////////////////////////////////
	mouseoverListener : function(aEvent){
		if(!aEvent.target.ownerDocument) return;

		if(bitsArticleNavigation._contentDocument == aEvent.target.ownerDocument) return;
		bitsArticleNavigation._contentDocument = aEvent.target.ownerDocument;
		if(bitsArticleNavigation._textZoom != bitsArticleNavigation.gBrowser.markupDocumentViewer.textZoom) bitsArticleNavigation.redrawConcordance();
		bitsArticleNavigation.scrollConcordance(aEvent.target.ownerDocument);
	},

/////////////////////////////////////////////////////////////////////
	scrollConcordance : function(aDoc){
		try{
			if(!aDoc || !aDoc.documentElement) return;

			const cloneElemId = 'ArticleNavigationConcordanceDispPos';
			const topElemId  = 'ArticleNavigationConcordanceDispPosLeft';
			const bottomElemId = 'ArticleNavigationConcordanceDispPosRight';

			const scrollHeight = aDoc.documentElement.scrollHeight
			var scrollTop = aDoc.documentElement.scrollTop;
			var clientHeight = aDoc.documentElement.clientHeight
			if(scrollHeight == clientHeight && aDoc.body){
				if(aDoc.body.scrollTop)    scrollTop    = aDoc.body.scrollTop;
				if(aDoc.body.clientHeight) clientHeight = aDoc.body.clientHeight;
			}
			var concordanceBaseLine = bitsArticleNavigation.CONCORDANCE_BASELINE;
			var rate = concordanceBaseLine.offsetHeight/scrollHeight;

			var topElem = document.getElementById(topElemId);
			if(!topElem){
				topElem = document.getElementById(cloneElemId).cloneNode(true);
				topElem.setAttribute("id",topElemId);
				concordanceBaseLine.appendChild(topElem);
			}
			var bottomElem = top.document.getElementById(bottomElemId);
			if(!bottomElem){
				bottomElem = top.document.getElementById(cloneElemId).cloneNode(true);
				bottomElem.setAttribute("id",bottomElemId);
				concordanceBaseLine.appendChild(bottomElem);
			}
			topElem.style.display = '';
			bottomElem.style.display = '';

			topElem.style.left = "0px";
			topElem.style.top = "0px";
			topElem.style.height = parseInt(scrollTop*rate) + "px";
			topElem.style.width = "100%";
			if(scrollTop == 0) topElem.style.height = "0px";

			bottomElem.style.left = "0px";
			bottomElem.style.top = parseInt((scrollTop+clientHeight)*rate)+1 + "px";
			bottomElem.style.height = parseInt((scrollHeight-(scrollTop+clientHeight))*rate)+2 + "px";
			bottomElem.style.width = "100%";

			bitsArticleNavigation._height = bottomElem.offsetTop - (topElem.offsetTop+topElem.offsetHeight);
		}catch(e){
			bitsArticleNavigation._dump("bitsArticleNavigation.scrollConcordance():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	resizeListener : function (aEvent){
		bitsArticleNavigation.redrawConcordance();
		bitsArticleNavigation.scrollConcordance(bitsArticleNavigation.gBrowser.contentDocument);
	},

/////////////////////////////////////////////////////////////////////
	redrawConcordance : function (){
		var self = bitsArticleNavigation;
		try{
			var ConcordanceBaseLine = self.CONCORDANCE_BASELINE;
			if(!ConcordanceBaseLine) return;
			var conChild = ConcordanceBaseLine.lastChild;
			if(conChild){
				if(self._timer) clearTimeout(self._timer);
				self._timer = setTimeout(function(){ self._redrawConcordance(conChild); },0);
			}
			self._textZoom = self.gBrowser.markupDocumentViewer.textZoom;
		}catch(e){
			bitsArticleNavigation._dump("bitsArticleNavigation.redrawConcordance():["+e+"]");
		}
	},

/////////////////////////////////////////////////////////////////////
	_redrawConcordance : function (aElem){
		var self = bitsArticleNavigation;
		try{
			var i;
			var conChild = aElem;
			for(i=0;i<100 && conChild;i++){
				var elem = self.getElementById(conChild.id);
				if(!elem){
					conChild = conChild.previousSibling;
					continue;
				}
				self.drawConcordanceFromID(conChild.id,conChild.style.cssText);
				conChild = conChild.previousSibling;
			}
			if(conChild){
				self._timer = setTimeout(function(){ self._redrawConcordance(conChild); },500);
			}else{
				self._textZoom = self.gBrowser.markupDocumentViewer.textZoom;
			}
		}catch(e){
			bitsArticleNavigation._dump("bitsArticleNavigation._redrawConcordance():["+e+"]");
		}
	},

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
