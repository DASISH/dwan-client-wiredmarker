// 指定タグ取込
var bitsImportTagService = {
	_progressWindow : null,

	get STRING()     { return document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get mcTreeHandler() {try{return this.SIDEBAR_WIN.mcTreeHandler;}catch(e){return undefined;}},
	get mcPropertyView() {try{return this.SIDEBAR_WIN.mcPropertyView;}catch(e){return undefined;}},
	get bitsItemView() {try{return this.SIDEBAR_WIN.bitsItemView;}catch(e){return undefined;}},
	get mcItemView() {try{return this.SIDEBAR_WIN.mcItemView;}catch(e){return undefined;}},

/////////////////////////////////////////////////////////////////////
	init : function(){

	},

/////////////////////////////////////////////////////////////////////
	done : function(){

	},

/////////////////////////////////////////////////////////////////////
	dispList : function(aEvent){
		try{
			var bitsItemView = null;
			var mcTreeHandler = null;
			var mcPropertyView = null;
			var mcItemView = null;

			if(this.bitsItemView) bitsItemView = this.bitsItemView;
			if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
			if(this.mcPropertyView) mcPropertyView = this.mcPropertyView;
			if(this.mcItemView) mcItemView = this.mcItemView;
			if(!mcTreeHandler) return;
			var aRes = mcTreeHandler.resource;
			if(!aRes) return;

			var tags = this._analyzeDocument();
			var result = {accept : false};
			window.openDialog("chrome://markingcollection/content/importtagDialog.xul", "", "chrome,centerscreen,modal", tags, result);
			if(result.accept){

				var fid = this.DataSource.getProperty(aRes, "id");
				var fid_style = this.DataSource.getProperty(aRes, "style");
				var dbtype = this.DataSource.getProperty(aRes, "dbtype");
				var param = {
					fid       : fid,
					fid_style : fid_style,
					dbtype    : dbtype
				};

				if(!this._progressWindow){
					var x = screen.width;
					var y = screen.height;
					this._progressWindow = window.openDialog(
																						"chrome://markingcollection/content/progress.xul",
																						"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
																						{status: this.STRING.getString("MSG_IMPORT_TAG") + "..."});
				}

				if(this._progressWindow && !this._progressWindow.closed){
					if(result.tags.length>0){
						if(this._progressWindow.setStatus){
							var num = 0;
							var i;
							for(i=0;i<result.tags.length;i++){
								num += (tags[result.type][result.tags[i]]?tags[result.type][result.tags[i]].length:0);
							}
							this._progressWindow.setStatus(this.STRING.getString("MSG_IMPORT_TAG") + "... [ "+ num + " ]");
						}
						this._progressWindow.focus();
						var self = this;
						setTimeout(function(){ self._execImport(tags,param,result); },100);
					}else{
						if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
						this._progressWindow = null;
					}
				}
			}
		}catch(e){
			this._dump("bitsImportTagService.dispList():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_execImport : function(tags,param,result,arr,options){
		try{
			if((!result.tags || result.tags.length == 0) && arr == undefined){
				if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
				this._progressWindow = null;
				return;
			}
			if(arr == undefined){
				var tag = result.tags.shift();
				arr = tags[result.type][tag];
			}
			if(arr && arr.length>0){
				if(this._progressWindow && !this._progressWindow.closed && this._progressWindow.setStatus){
					var num = 0;
					for(var i=0;i<result.tags.length;i++){
						num += (tags[result.type][result.tags[i]]?tags[result.type][result.tags[i]].length:0);
					}
					num += arr.length;
					this._progressWindow.setStatus(this.STRING.getString("MSG_IMPORT_TAG") + "... [ "+ num + " ]");
				}
				for(var i=0;i<10;i++){
					var node = arr.shift();
					var doc = node.ownerDocument;
					var win = doc.defaultView;
					if(node.nodeName.toUpperCase() == "IMG" && result.img_opt == "image"){
						var aXferString = node.src + "\n" + node.alt;
						bitsMarkingCollection.addURLText(param,-1,undefined, aXferString, node, (result.tags.length==0 && arr.length==0 ? true : false),false);
					}else{
						var selection = win.getSelection();
						if(selection){
							selection.removeAllRanges();
							var range = doc.createRange();
							range.selectNodeContents(node);
							selection.addRange(range);
							bitsMarkingCollection.addSelectedText(param,-1,undefined,(result.tags.length==0 && arr.length==0 ? true : false),false);
						}
					}
					if(arr.length == 0){
						arr = undefined;
						break;
					}
				}
			}
			var self = this;
			setTimeout(function(){ self._execImport(tags,param,result,arr,options); },100);
		}catch(e){
			this._dump("bitsImportTagService._execImport():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_getDocument : function(aWin){
		var docs = [];
		if(!aWin) return docs;
		if(aWin.frames != null){
			var i;
			for(i=0;i<aWin.frames.length;i++){
				docs = docs.concat(this._getDocument(aWin.frames[i]));
			}
		}
		if(aWin.document) docs.push(aWin.document);
		return docs;
	},

/////////////////////////////////////////////////////////////////////
	_analyzeDocument : function(){
		var regexp = new RegExp("^"+bitsMarker.id_key);
		var tags = {
			html   : {},
			nohtml : {},
		};
		var htmlTags = this._getHtmlTags();
		var DOCS = this._getDocument(this.gBrowser.contentWindow);
		var i,j;
		for(i=0;i<DOCS.length;i++){
			if(!DOCS[i].body) continue;
			var nodeWalker = DOCS[i].createTreeWalker(DOCS[i].body,NodeFilter.SHOW_ELEMENT,null,false);
			var node;
			for(node=nodeWalker.nextNode();node;node = nodeWalker.nextNode()){
				j=0;
				var elms = [node];

				if(elms[j].nodeName.toUpperCase() == "SCRIPT"){
					continue;
				}else if(elms[j].nodeName.toUpperCase() == "SPAN"){
					if(elms[j].hasAttribute("id") && regexp.test(elms[j].id)) continue; //Markerを除外
				}else if(elms[j].nodeName.toUpperCase() == "IMG"){
					if(!elms[j].hasAttribute("src")) continue;
				}else if(elms[j].nodeName.toUpperCase() == "A"){
					if(!elms[j].hasChildNodes()) continue;
					if(!elms[j].hasAttribute("href")) continue;
				}else{
					if(!elms[j].hasChildNodes()) continue;
					var textContent = elms[j].textContent.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
					if(textContent.length == 0) continue;
				}
				if(htmlTags[elms[j].nodeName.toUpperCase()] != undefined){
					if(htmlTags[elms[j].nodeName.toUpperCase()]){
						if(tags.html[elms[j].nodeName.toLowerCase()] == undefined) tags.html[elms[j].nodeName.toLowerCase()] = [];
						tags.html[elms[j].nodeName.toLowerCase()].push(elms[j]);
					}
				}else{
					if(tags.nohtml[elms[j].nodeName.toLowerCase()] == undefined) tags.nohtml[elms[j].nodeName.toLowerCase()] = [];
					tags.nohtml[elms[j].nodeName.toLowerCase()].push(elms[j]);
				}
			}
		}
		return tags;
	},

/////////////////////////////////////////////////////////////////////
	_getHtmlTags : function(){
		var htmlTags = {
				"A" : 1,
				"ABBR" : 0,
				"ACRONYM" : 0,
				"ADDRESS" : 0,
				"APPLET" : 0,
				"AREA" : 0,
				"B" : 0,
				"BASE" : 0,
				"BASEFONT" : 0,
				"BDO" : 0,
				"BIG" : 0,
				"BLOCKQUOT" : 0, 
				"BLOCKQUOTE" : 0, 
				"BODY" : 0,
				"BR" : 0,
				"BUTTON" : 0,
				"CAPTION" : 0,
				"CENTER" : 0,
				"CITE" : 0,
				"CODE" : 0,
				"COL" : 0,
				"COLGROUP" : 0,
				"DD" : 0,
				"DEL" : 0,
				"DFN" : 0,
				"DIR" : 0,
				"DIV" : 0,
				"DL" : 0,
				"DT" : 0,
				"EM" : 0,
				"FIELDSET" : 0,
				"FONT" : 0,
				"FORM" : 0,
				"FRAME" : 0,
				"FRAMESET" : 0,
				"H1" : 0,
				"H2" : 0,
				"H3" : 0,
				"H4" : 0,
				"H5" : 0,
				"H6" : 0,
				"HEAD" : 0,
				"HR" : 0,
				"HTML" : 0,
				"I" : 0,
				"IFRAME" : 0,
				"IMG" : 1,
				"INPUT" : 0,
				"INS" : 0,
				"ISINDEX" : 0,
				"KBD" : 0,
				"LABEL" : 0,
				"LEGEND" : 0,
				"LI" : 0,
				"LINK" : 0,
				"MAP" : 0,
				"MENU" : 0,
				"META" : 0,
				"NOBR" : 0,
				"NOFRAMES" : 0,
				"NOSCRIPT" : 0,
				"OBJECT" : 0,
				"OL" : 0,
				"OPTGROUP" : 0,
				"OPTION" : 0,
				"P" : 0,
				"PARAM" : 0,
				"PRE" : 0,
				"Q" : 0,
				"S" : 0,
				"SAMP" : 0,
				"SCRIPT" : 0,
				"SELECT" : 0,
				"SMALL" : 0,
				"SPAN" : 0,
				"STRIKE" : 0,
				"STRONG" : 0,
				"STYLE" : 0,
				"SUB" : 0,
				"SUP" : 0,
				"TABLE" : 0,
				"TBODY" : 0,
				"TD" : 0,
				"TEXTAREA" : 0,
				"TFOOT" : 0,
				"TH" : 0,
				"THEAD" : 0,
				"TITLE" : 0,
				"TR" : 0,
				"TT" : 0,
				"U" : 0,
				"UL" : 0,
				"VAR" : 0,
		};
		return htmlTags;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
