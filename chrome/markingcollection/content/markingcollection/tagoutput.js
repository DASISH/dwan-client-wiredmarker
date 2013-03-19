/////////////////////////////////////////////////////////////////////
// タグ付き出力機能関連
/////////////////////////////////////////////////////////////////////
var bitsTagOutputService = {

	_saveinfo : null,

	get STRING()     { return document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get XPath()      { return bitsObjectMng.XPath;      },
	get Database()   { return bitsObjectMng.Database;   },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

	get BROWSER()    { return document.getElementById("bitsTagOutputBrowser"); },

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get CONTENT() { return window.top.document.getElementById("content"); },

	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get mcTreeHandler() {try{return this.SIDEBAR_WIN.mcTreeHandler;}catch(e){return undefined;}},
	get mcMainService() {try{return this.SIDEBAR_WIN.mcMainService;}catch(e){return undefined;}},
	get mcController() {try{return this.SIDEBAR_WIN.mcController;}catch(e){return undefined;}},
	get mcPropertyView() {try{return this.SIDEBAR_WIN.mcPropertyView;}catch(e){return undefined;}},
	get mcTreeViewModeService() {try{return this.SIDEBAR_WIN.mcTreeViewModeService;}catch(e){return undefined;}},
	get bitsItemView() {try{return this.SIDEBAR_WIN.bitsItemView;}catch(e){return undefined;}},

	get TREE_POPUP(){try{return this.SIDEBAR_DOC.getElementById("mcPopup");}catch(e){return undefined;}},
	get TREE_LISTVIEWMENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupViewMenu");}catch(e){return undefined;}},
	get TREE_TAGOUTPUTMENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupTagOutput");}catch(e){return undefined;}},
	get TREE_TAGOUTPUTMENU_SEP(){try{return this.SIDEBAR_DOC.getElementById("mcPopupTagOutputMenuseparator");}catch(e){return undefined;}},

	get ITEMTREE_POPUP(){try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopup");}catch(e){return undefined;}},
	get ITEMTREE_CACHEMENU(){try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopupCache");}catch(e){return undefined;}},
	get ITEMTREE_TAGOUTPUTMENU(){try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopupTagOutput");}catch(e){return undefined;}},
	get ITEMTREE_TAGOUTPUTMENU_SEP(){try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopupTagOutputMenuseparator");}catch(e){return undefined;}},

	get _contentAreaContextMenu() { return window.top.document.getElementById("contentAreaContextMenu"); },
	get CONTEXTMENU() { return window.top.document.getElementById("MarkingCollectionContextMenuTagOutput"); },
	get CONTEXTMENUSEP() { return window.top.document.getElementById("MarkingCollectionContextMenuTagOutputSeparator"); },


/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		this._contentAreaContextMenu.addEventListener("popupshowing",this.popupshowing_contextmenu,false);
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		this._contentAreaContextMenu.removeEventListener("popupshowing",this.popupshowing_contextmenu,false);
	},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){
		var popup = this.TREE_POPUP;
		if(!popup) return;
		popup.addEventListener("popupshowing",this.popupshowing_tree, false);
		var popup = this.ITEMTREE_POPUP;
		if(!popup) return;
		popup.addEventListener("popupshowing",this.popupshowing_itemview, false);
//		popup.addEventListener("popupshown",this.popupshown_tree, false);
	},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){
		var popup = this.TREE_POPUP;
		if(!popup) return;
		popup.removeEventListener("popupshowing",this.popupshowing_tree, false);
		var popup = this.ITEMTREE_POPUP;
		if(!popup) return;
		popup.removeEventListener("popupshowing",this.popupshowing_itemview, false);
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_contextmenu : function(aEvent){
		bitsTagOutputService._popupshowing_contextmenu(aEvent);
	},

	_popupshowing_contextmenu : function(aEvent){
		this.CONTEXTMENUSEP.setAttribute("hidden","true");
		this.CONTEXTMENU.setAttribute("hidden","true");
		var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
		var contextmenu_type = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.type","");
		if(contextmenu_mode == "legacy" && contextmenu_type == "simple") return;
		var popup_elem = false;
		var cm = bitsContextMenu._contextMenuObject;
		if(cm && (cm.isTextSelected || cm.onLink || cm.onImage)) popup_elem = true;
		if(this.isDispContextmenu(this.gBrowser.contentDocument)){
			this.CONTEXTMENU.removeAttribute("hidden");
			if(popup_elem) this.CONTEXTMENUSEP.removeAttribute("hidden");
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_tree : function(aEvent){
		bitsTagOutputService._popupshowing_tree(aEvent);
	},

	_popupshowing_tree : function(aEvent){
		var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
		if(contextmenu_mode == "legacy"){
			var contextmenu_type = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.type","");
			if(contextmenu_type == "simple"){
				this.TREE_TAGOUTPUTMENU.setAttribute("hidden","true");
			}else{
				this.TREE_TAGOUTPUTMENU.removeAttribute("hidden");
			}
			if(contextmenu_type == "simple"){
				this.TREE_TAGOUTPUTMENU_SEP.setAttribute("hidden","true");
			}else{
				this.TREE_TAGOUTPUTMENU_SEP.removeAttribute("hidden");
			}
		}else{
			this.TREE_TAGOUTPUTMENU.removeAttribute("hidden");
			if(this.TREE_LISTVIEWMENU.hasAttribute("hidden")){
				this.TREE_TAGOUTPUTMENU_SEP.setAttribute("hidden","true");
			}else{
				this.TREE_TAGOUTPUTMENU_SEP.removeAttribute("hidden");
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshown_tree : function(aEvent){
		bitsTagOutputService._popupshown_tree(aEvent);
	},

	_popupshown_tree : function(aEvent){
		var popup = aEvent.target;
		var elem = popup.firstChild;
		while(elem){
			if(!elem.hidden) this._dump("elem=["+elem.nodeName+"]["+elem.id+"]["+elem.hidden+"]");
			elem = elem.nextSibling;
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_itemview : function(aEvent){
		bitsTagOutputService._popupshowing_itemview(aEvent);
	},

	_popupshowing_itemview : function(aEvent){
		var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
		if(contextmenu_mode == "legacy"){
			var contextmenu_type = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.type","");
			if(contextmenu_type == "simple"){
				this.ITEMTREE_TAGOUTPUTMENU.setAttribute("hidden","true");
			}else{
				this.ITEMTREE_TAGOUTPUTMENU.removeAttribute("hidden");
			}
			if(contextmenu_type == "simple"){
				this.ITEMTREE_TAGOUTPUTMENU_SEP.setAttribute("hidden","true");
			}else{
				this.ITEMTREE_TAGOUTPUTMENU_SEP.removeAttribute("hidden");
			}
		}else{
			this.ITEMTREE_TAGOUTPUTMENU.removeAttribute("hidden");
			this.ITEMTREE_TAGOUTPUTMENU_SEP.removeAttribute("hidden");
		}
	},

/////////////////////////////////////////////////////////////////////
	pageshow : function(aEvent){
		bitsTagOutputService._pageshow(aEvent);
	},

/////////////////////////////////////////////////////////////////////
	_pageshow : function(aEvent){
		var aDoc = aEvent.target;
		var URLString = this.Common.getURLStringFromDocument(aDoc);
		if(URLString.indexOf("chrome:") >= 0 || URLString.indexOf("about:") >= 0){
			if(this._saveinfo.cb){
				var self = this;
				setTimeout(function(){ self._saveinfo.cb(aEvent); },0);
			}
			return;
		}
		if(this._saveinfo.uri != URLString || !aDoc.body) return;
		if(!this._saveinfo.file){
			var aSaveFile = this.getSaveFile(this.getDocomentFilename(aDoc));
			if(aSaveFile){
				this._saveinfo.file = aSaveFile.clone();
			}else{
				this.BROWSER.removeEventListener("pageshow", this.pageshow, false);
				this._saveinfo.cb = undefined;
				this._saveinfo = undefined;
				return;
			}
		}
		var orgURLString = URLString;
		if(bitsAutocacheService.isCacheURL(orgURLString)) orgURLString = bitsAutocacheService.convertCacheURLToOriginalURL(orgURLString);
		var folderTag = {}
		var rtnObj = this.Database.getAllObjectFormContentURL(orgURLString);
		if(rtnObj && rtnObj.length>0){
			var cnt;
			for(cnt=0;cnt<rtnObj.length;cnt++){
				var rObj = rtnObj[cnt];
				if(rObj.oid_type.match(/^image\/(.+)$/)) continue;
				if(!aDoc.defaultView) return;
				var rtnContent = bitsMarker.xPathMarker(
					aDoc,
					{
						start   : rObj.bgn_dom,
						end     : rObj.end_dom,
						context : rObj.oid_txt,
						con_url : URLString
					},{
						id     : rObj.oid,
						dbtype : rObj.dbtype,
						pfid   : rObj.pfid,
						style  : rObj.fid_style
					}
				);
				if(folderTag[rObj.pfid]) continue;
				folderTag[rObj.pfid] = {
					dbtype : rObj.dbtype,
					style  : rObj.fid_style
				};
			}
			var parser = new DOMParser();
			for(var fid in folderTag){
				var rtnFolder = this.Database.getFolder({fid:fid},folderTag[fid].dbtype);
				if(!rtnFolder) continue;
				rtnFolder = rtnFolder[0];
				folderTag[fid].tag = rtnFolder.fid_title;
				if(rtnFolder.fid_property){
					var xmldoc = parser.parseFromString(rtnFolder.fid_property, "text/xml");
					if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
					if(xmldoc){
						var tagNode = xmldoc.getElementsByTagName("TAG")[0];
						if(tagNode) folderTag[fid].tag = tagNode.textContent;
						tagNode = undefined;
						xmldoc = undefined;
					}
				}
			}
			parser = undefined;
			var nodesSnapshot = this.getMarkerNodes(aDoc);
			for(var i=0;i<nodesSnapshot.snapshotLength;i++){
				var node = nodesSnapshot.snapshotItem(i);
				var fid = node.getAttribute('pfid');
				if(!folderTag[fid]) continue;
				if(this._saveinfo.hidden){
					var range = aDoc.createRange();
					range.selectNodeContents(node);
					var tagNode = aDoc.createElement(folderTag[fid].tag);
					var docfrag = range.extractContents();
					tagNode.appendChild(docfrag);
					range.insertNode(tagNode);
					range = undefined;
				}else{
					var tagNode = aDoc.createTextNode('<'+folderTag[fid].tag+'>');
					if(node.firstChild){
						node.insertBefore(tagNode,node.firstChild);
					}else{
						node.appendChild(tagNode);
					}
					node.appendChild(aDoc.createTextNode('</'+folderTag[fid].tag+'>'));
				}
				if(this._saveinfo.style){
					var attrs = node.attributes;
					for(var a=attrs.length-1;a>=0;a--){
						if(attrs[a].name == 'style') continue;
						node.removeAttribute(attrs[a].name);
					}
				}else{
					var parent = node.parentNode;
					var children = node.childNodes;
					var index;
					for(index = children.length-1;index>=0;index--){
						parent.insertBefore(children[0],node);
					}
					parent.removeChild(node);
					parent.normalize();
				}
			}
			if(this._saveinfo.rpath){
				if(aDoc.images && aDoc.images.length>0){
					for(var i=0;i<aDoc.images.length;i++){
						aDoc.images[i].setAttribute("src",aDoc.images[i].src);
					}
				}
				if(aDoc.links && aDoc.links.length>0){
					for(var i=0;i<aDoc.links.length;i++){
						aDoc.links[i].setAttribute("href",aDoc.links[i].href);
					}
				}
				var nodesSnapshot = this.XPath.evaluate('//link[@href]',aDoc);
				for(var i=0;i<nodesSnapshot.snapshotLength;i++){
					var node = nodesSnapshot.snapshotItem(i);
					node.setAttribute("href",node.href);
				}
				var nodesSnapshot = this.XPath.evaluate('//*[@style]',aDoc);
				for(var i=0;i<nodesSnapshot.snapshotLength;i++){
					var node = nodesSnapshot.snapshotItem(i);
					if(!node.style.backgroundImage) continue;
					if(node.style.backgroundImage.match(/^url\((.+)?\)/)){
						node.style.backgroundImage = 'url(' + this.Common.resolveURL(aDoc.location.href,RegExp.$1) + ')';
					}
				}
			}
			var file = null;
			if(!this._saveinfo.file.exists() || this._saveinfo.file.isFile()){
				file = this._saveinfo.file.clone();
			}else if(this._saveinfo.file.isDirectory()){
				var fn = this.getDocomentFilename(aDoc);
				if(fn){
					file = this._saveinfo.file.clone();
					file.append(fn);
					if(file.exists()){
						if(!this.Common.confirm(this.STRING.getString("CONFIRM_FILE_OVERWRITE")+"\n["+file.path+"]")){
							file = this.getSaveFile(file.path);
							if(!file){
								if(this._saveinfo.list && this._saveinfo.list.length>0) this._saveinfo.list.length = 0;
								this._saveinfo.cb = undefined;
							}
						}
					}
				}
			}
			if(file){
				var content = null;
				if(this._saveinfo.style || this._saveinfo.hidden || aDoc.contentType != 'text/plain'){
					content = '<html>' + aDoc.documentElement.innerHTML + '</html>';
				}else{
					var nodesSnapshot = this.XPath.evaluate('/html/body/pre[1]',aDoc);
					if(nodesSnapshot && nodesSnapshot.snapshotLength>0) content = nodesSnapshot.snapshotItem(0).textContent;
				}
				if(content) this.writeFile(file,content,aDoc.characterSet);
			}
		}
		if(this._saveinfo.list && this._saveinfo.list.length>0){
			this._saveinfo.uri = this._saveinfo.list.shift();
			this.BROWSER.loadURI(this._saveinfo.uri);
		}else if(this._saveinfo.cb){
			var self = this;
			setTimeout(function(){ self._saveinfo.cb(aEvent); },0);
		}else{
			this.BROWSER.removeEventListener("pageshow", this.pageshow, false);
			this._saveinfo.cb = undefined;
			this._saveinfo = undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	isDispContextmenu : function(aDoc){
		var nodesSnapshot = this.getMarkerNodes(aDoc);
		return (nodesSnapshot&&nodesSnapshot.snapshotLength>0?true:false);
	},

/////////////////////////////////////////////////////////////////////
	getMarkerNodes : function(aDoc){
		return this.XPath.evaluate('//*[@id and @dbtype and @pfid]',aDoc);
	},

/////////////////////////////////////////////////////////////////////
	getOptions : function(){
		var result = {
			accept : false,
			uri    : null,
			file   : null,
			list   : null,
			cb     : this.outputDone,
			hidden : nsPreferences.getBoolPref("wiredmarker.tagoutput.tag.hidden", false),
			style  : nsPreferences.getBoolPref("wiredmarker.tagoutput.tag.style",  false),
			rpath  : nsPreferences.getBoolPref("wiredmarker.tagoutput.path.change",true)
		};
		window.openDialog("chrome://markingcollection/content/tagoutputDialog.xul", "", "chrome,centerscreen,modal", result);
		if(result.accept){
			nsPreferences.setBoolPref("wiredmarker.tagoutput.tag.hidden", result.hidden);
			nsPreferences.setBoolPref("wiredmarker.tagoutput.tag.style",  result.style);
			nsPreferences.setBoolPref("wiredmarker.tagoutput.path.change",result.rpath);
			delete result.accept;
			return result;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	onTagOutputRdfCommand : function(aParam){
		if(!this.mcTreeHandler) return;
		var aRes = this.mcTreeHandler.resource;
		if(!aRes) return;
		this._saveinfo = this.getOptions();
		if(!this._saveinfo) return;
		if(this.DataSource.isContainer(aRes)){
			this._saveinfo.file = this.getSaveFolder(this.DataSource.getProperty(aRes, "title"));
			if(!this._saveinfo.file) return;

			this._saveinfo.list = [];
			var hash = {};

			var folderList = this.DataSource.flattenResources(aRes, 1, true);
//			this._dump(folderList.length);
			var f;
			for(f=0;f<folderList.length;f++){
				var fid = this.DataSource.getProperty(folderList[f], "id");
				var dbtype = this.DataSource.getProperty(folderList[f], "dbtype");
				var rtnObjs = this.Database.getObject({pfid:fid},dbtype);
				if(rtnObjs && rtnObjs.length){
					var i;
					for(i=0;i<rtnObjs.length;i++){
						if(hash[rtnObjs[i].doc_url] != undefined) continue;
						hash[rtnObjs[i].doc_url] = rtnObjs[i].doc_url;
						this._saveinfo.list.push(rtnObjs[i].doc_url);
					}
				}
			}

//			this._dump("this._saveinfo.list.length=["+this._saveinfo.list.length+"]");

			if(this._saveinfo.list.length>0){
				this._saveinfo.uri = this._saveinfo.list.shift();
				this.BROWSER.addEventListener("pageshow", this.pageshow, false);
				this.BROWSER.loadURI(this._saveinfo.uri);
			}
		}else{
			this._saveinfo.uri = this.DataSource.getProperty(aRes, "uri");
			this.BROWSER.addEventListener("pageshow", this.pageshow, false);
			this.BROWSER.loadURI(this._saveinfo.uri);
		}
	},

/////////////////////////////////////////////////////////////////////
	onTagOutputItemviewCommand : function(aParam){
		var object = this.bitsItemView.object;
		if(!object) return;
		this._saveinfo = this.getOptions();
		if(!this._saveinfo) return;
		this._saveinfo.uri = object.doc_url;
		this.BROWSER.addEventListener("pageshow", this.pageshow, false);
		this.BROWSER.loadURI(this._saveinfo.uri);
	},

/////////////////////////////////////////////////////////////////////
	onTagOutputContextmenuCommand : function(aParam){
		this._saveinfo = this.getOptions();
		if(!this._saveinfo) return;
		this._saveinfo.uri = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		this.BROWSER.addEventListener("pageshow", this.pageshow, false);
		this.BROWSER.loadURI(this._saveinfo.uri);
		aParam.event.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	outputDone : function(aEvent){
		bitsTagOutputService._outputDone(aEvent);
	},

	_outputDone : function(aEvent){
		if(this._saveinfo.uri == this.Common.getURLStringFromDocument(aEvent.target)){
			this.BROWSER.removeEventListener("pageshow", this.pageshow, false);
			this._saveinfo.cb = undefined;
			this._saveinfo = undefined;
			this.Common.alert('Output documents.');
		}
	},

/////////////////////////////////////////////////////////////////////
	writeFile : function(aFile, aContent, aCharacterSet){
		try {
			if(aCharacterSet == undefined) aCharacterSet = 'UTF-8';
			if(!aFile.parent.exists()) aFile.parent.create(aFile.DIRECTORY_TYPE, 0777);
			if(aFile.exists()) aFile.remove(false);
			aFile.create(aFile.NORMAL_FILE_TYPE, 0666);
			var content = this.Common.convertFormUnicode(aContent,aCharacterSet);
			var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(aFile, 2, 0x200, false);
			ostream.write(content, content.length);
			ostream.close();
			return true;
		}catch(ex){
			this._dump("bitsTagOutputService ERROR: Failed to write file: " + aFile.path + "["+ ex + "]");
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	saveTagDocoment : function (aParam){
	},

/////////////////////////////////////////////////////////////////////
	getDocomentFilename : function (aDoc){
		var fileBaseName = null;
		var fileExtension = null;
		var fileDefault = null;
		var aURL = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
		aURL.spec = (typeof aDoc == 'string' ? aDoc : aDoc.location.href);
		if(aURL.fileBaseName) fileBaseName = aURL.fileBaseName;
		if(aURL.fileExtension) fileExtension = aURL.fileExtension;
		if(!fileBaseName){
			var fileName = this.Common.getFileName(aURL.spec);
			var splitFileName = this.Common.splitFileName(fileName);
			if(!splitFileName[0] || splitFileName[0] == ""){
				fileBaseName = "";
				var arr = aURL.spec.split("/");
				while(arr.length){
					fileBaseName = arr.pop();
					if(fileBaseName.length>0) break;
				}
				if(fileBaseName.length == 0) fileBaseName = "index";
			}else{
				fileBaseName = decodeURIComponent(splitFileName[0]);
			}
		}
		if(!fileExtension && typeof aDoc == 'object'){
			if(aDoc.contentType=='text/plain'){
				fileExtension = 'txt';
			}else{
				fileExtension = 'html';
			}
		}
		if(typeof aDoc == 'object' && aDoc.contentType && aDoc.contentType=='text/html') fileExtension = 'html';
		if(fileExtension){
			if(this._saveinfo.style || this._saveinfo.hidden) fileExtension = "html";
			if(fileExtension != 'html') fileExtension = "txt";
		}
		if(fileBaseName && fileExtension) fileDefault = fileBaseName + "." + fileExtension;
		return fileDefault;
	},

/////////////////////////////////////////////////////////////////////
	getSaveFile : function (aFilename){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = null;
		try{
			var title = "Selected Save File";
			picker.init(window, title, picker.modeSave);
			if(aFilename) picker.defaultString  = aFilename;
			picker.appendFilters(picker.filterAll|picker.filterText|picker.filterHTML);
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				result = picker.file;
			}else if(showResult == picker.returnReplace){
				if(picker.file.exists()) picker.file.remove(false);
				result = picker.file;
			}
		}catch(e){
			result = null;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getSaveFolder : function (aTitle){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = null;
		try{
			var title = "Selected Save Folder";
			if(aTitle) title += " ["+aTitle+"]";
			picker.init(window, title, picker.modeGetFolder);
			if(aTitle) picker.defaultString  = aTitle;
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				result = picker.file;
			}else if(showResult == picker.returnReplace){
				if(picker.file.exists()) picker.file.remove(false);
				result = picker.file;
			}
		}catch(e){
			result = null;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	}
};
