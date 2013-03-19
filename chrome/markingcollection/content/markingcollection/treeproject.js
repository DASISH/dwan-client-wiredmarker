var bitsTreeProjectService = {
	_openurl : "",
	_doc     : null,
	_loaddoc : null,
	_url     : "",
	_fileid  : "",
	_oid     : null,
	_savehtml : [],
	_applytimer  : null,

	_caseSensitive_exp : new RegExp("[A-Z]{2,}",""),
	_marker_exp : new RegExp("^"+bitsMarker.id_key+"\\D+\\d+$",""),

	appDataDir  : null,
	appDataURL  : "",
	appDataSTRING : "",
	appDataURLExp : null,
	appDataAddSTRING : "_files",
	zipApp : null,
	zipAppScript : null,
	_title2obj : {},

/////////////////////////////////////////////////////////////////////
	get STRING() { return document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get MAINWINDOW() { return window.top.document.getElementById("main-window"); },
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
	get TREE_INDEXMENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupProjectIndexMenu");}catch(e){return undefined;}},
	get TREE_DOCUMENTMENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupProjectDocumentsMenu");}catch(e){return undefined;}},
	get TREE_DICTIONARYMENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupProjectDictionaryMenu");}catch(e){return undefined;}},

	get xmldoc(){ return this._xmldoc; },

/////////////////////////////////////////////////////////////////////
	init : function(){
		try{
			this.gBrowser.addEventListener("pageshow", bitsTreeProjectService.pageshow, false);
		}catch(ex){
			this._dump("bitsTreeProjectService.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(){
		try{
			this.gBrowser.removeEventListener("pageshow", bitsTreeProjectService.pageshow, false);
		}catch(ex){
			this._dump("bitsTreeProjectService.done():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	pageshow : function(aEvent){
		bitsTreeProjectService._pageshow(aEvent);
	},

/////////////////////////////////////////////////////////////////////
	_pageshow : function(aEvent){
		var self = this;
		var doc = aEvent.target;
		if(doc.location.protcol == "chrome:" || doc.location.protcol == "about:") return;
		if(!doc.body) return;
		if(doc.contentType != "text/plain") return;
		var pre = doc.body.getElementsByTagName("pre")[0];
		if(!pre || pre.style.cssText != "") return;
		var textplain_display = nsPreferences.copyUnicharPref("wiredmarker.textplain.display","usually");
		if(textplain_display == "usually") return;
		setTimeout(function(){
			if(textplain_display == "confirm" && !self.Common.confirm(self.STRING.getString("CONFIRM_BROWSER_TO_FIT_TEXT"))) return;
			var title = doc.title!=""?doc.title:doc.location.toString();
			var textContent = pre.textContent.replace(/(\x0D\x0A|\x0D|\x0A)/g,"<br>$1");
			var textContent_Arr = textContent.split("<br>");
			var cDoc = doc;
			try{
				while(cDoc.body.lastChild){ cDoc.body.removeChild(cDoc.body.lastChild); }
				cDoc.body.appendChild(cDoc.createElement("pre"));
				if(cDoc.body.lastChild){
					var span = cDoc.body.lastChild;
					span.style.whiteSpace = "normal";
					var backgroundColor = nsPreferences.copyUnicharPref("wiredmarker.textplain.background_color");
					var fontFamily = nsPreferences.copyUnicharPref("wiredmarker.textplain.font.name");
					var fontSize = nsPreferences.getIntPref("wiredmarker.textplain.font.size");
					if(backgroundColor) span.style.backgroundColor = backgroundColor;
					if(fontFamily) span.style.fontFamily = fontFamily;
					if(fontSize) span.style.fontSize = fontSize+'pt';
					var i;
					for(i=0;i<textContent_Arr.length;i++){
						span.appendChild(cDoc.createTextNode(textContent_Arr[i]));
						var elem_br = cDoc.createElement("br");
						elem_br.setAttribute("id",bitsMarker.id_key+"dummy_br");
						span.appendChild(elem_br);
					}
				}
				var urlString = self.Common.getURLStringFromDocument(cDoc);
				var info = bitsAutocacheService.getSaveCacheInfo(urlString);
				var rtn = bitsMarkingCollection.marking(cDoc,(info?info.URL:undefined));
			}catch(e){
				self.Common.alert(e);
			}
		},0);
	},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){
		var popup = this.TREE_POPUP;
		if(!popup) return;
		popup.addEventListener("popupshowing",this.popupshowing_tree, false);
	},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){
		var popup = this.TREE_POPUP;
		if(!popup) return;
		popup.removeEventListener("popupshowing",this.popupshowing_tree, false);
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_tree : function(aEvent){
		bitsTreeProjectService._popupshowing_tree(aEvent);
	},

	_popupshowing_tree : function(aEvent){
		var aRes = null;
		var type = null;
		if(this.mcTreeHandler && this.mcTreeHandler.resource) aRes = this.mcTreeHandler.resource;
		if(aRes) type = this.DataSource.getProperty(aRes,"type");
		var contextmenu_type = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.type","");
		if(this.TREE_LISTVIEWMENU.hasAttribute("hidden") || contextmenu_type == "simple"){
			this.TREE_INDEXMENU.setAttribute("hidden","true");
			this.TREE_DOCUMENTMENU.setAttribute("hidden","true");
			this.TREE_DICTIONARYMENU.setAttribute("hidden","true");
		}else if(type && type == "localfolder"){
			this.TREE_DOCUMENTMENU.setAttribute("hidden","true");
			this.TREE_DICTIONARYMENU.setAttribute("hidden","true");
		}else{
			this.TREE_INDEXMENU.removeAttribute("hidden");
			this.TREE_DOCUMENTMENU.removeAttribute("hidden");
			this.TREE_DICTIONARYMENU.removeAttribute("hidden");
		}
	},

/////////////////////////////////////////////////////////////////////
	click : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	blur : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onPopupHiding : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onCommand : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	setWaitCursor : function(aValue){
		var menu_MainBits = window.top.document.getElementById("bitsExtensionsMainMenu");
		var menu_ToolsBits = window.top.document.getElementById("bitsExtensionsToolsMenu");
		var menu_BookmarksBits = window.top.document.getElementById("bitsExtensionsBookmarksMenu");
		var elems = this.SIDEBAR_DOC.getElementsByTagName("*");
		var i;
		if(aValue){
			if(menu_MainBits) menu_MainBits.setAttribute("disabled","true");
			if(menu_ToolsBits) menu_ToolsBits.setAttribute("disabled","true");
			if(menu_BookmarksBits) menu_BookmarksBits.setAttribute("disabled","true");
			for(i=0;i<elems.length;i++){
				try{
					if(elems[i].hasAttribute("disabled") && elems[i].disabled){
						elems[i].setAttribute("disabled_prev","true");
					}else{
						elems[i].setAttribute("disabled","true");
					}
				}catch(e){this._dump("setWaitCursor("+aValue+"):"+e);}
				try{elems[i].setAttribute("wait-cursor","true");}catch(e){this._dump("setWaitCursor("+aValue+"):"+e);}
			}
		}else{
			if(menu_MainBits) menu_MainBits.removeAttribute("disabled");
			if(menu_ToolsBits) menu_ToolsBits.removeAttribute("disabled");
			if(menu_BookmarksBits) menu_BookmarksBits.removeAttribute("disabled");
			for(i=0;i<elems.length;i++){
				try{elems[i].removeAttribute("wait-cursor");}catch(e){this._dump("setWaitCursor("+aValue+"):"+e);}
				try{
					if(elems[i].hasAttribute("disabled_prev")){
						elems[i].removeAttribute("disabled_prev");
					}else{
						elems[i].removeAttribute("disabled");
					}
				}catch(e){this._dump("setWaitCursor("+aValue+"):"+e);}
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	updateFolderProperty : function(aRes,aProperty,aOptions){
		var changed = false;
		var fid = this.DataSource.getProperty(aRes,"id");
		var dbtype = this.DataSource.getProperty(aRes,"dbtype");
		var folders = this.Database.getFolderFormID(fid, dbtype);
		if(folders && folders.length>0){
			if(aProperty != undefined){
				var parser = new DOMParser();
				var xmldoc;
				if(folders[0].fid_property){
					xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
				}
				if(!xmldoc) xmldoc = parser.parseFromString("<PROPERTY/>", "text/xml");
				parser = undefined;
				if(aProperty.icon != undefined){
					var icon_elem;
					this.DataSource.setProperty(aRes,"icon",aProperty.icon);
					icon_elem = xmldoc.getElementsByTagName("ICON")[0];
					if(icon_elem){
						while(icon_elem.hasChildNodes()){ icon_elem.removeChild(icon_elem.lastChild); }
					}else{
						icon_elem = xmldoc.createElement("ICON");
						xmldoc.documentElement.appendChild(icon_elem);
					}
					icon_elem.appendChild(xmldoc.createTextNode(aProperty.icon));
				}
				if(aProperty.contextmenu != undefined){
					var contextmenu_elem;
					this.DataSource.setProperty(aRes,"contextmenu",aProperty.contextmenu);
					contextmenu_elem = xmldoc.getElementsByTagName("CONTEXTMENU")[0];
					if(contextmenu_elem){
						while(contextmenu_elem.hasChildNodes()){ contextmenu_elem.removeChild(contextmenu_elem.lastChild); }
					}else{
						contextmenu_elem = xmldoc.createElement("CONTEXTMENU");
						xmldoc.documentElement.appendChild(contextmenu_elem);
					}
					contextmenu_elem.appendChild(xmldoc.createTextNode(aProperty.contextmenu));
				}
				if(aProperty.propertyOverlay != undefined){
					var propertyOverlay_elem;
					propertyOverlay_elem = xmldoc.getElementsByTagName("PROPERTYOVERLAY")[0];
					if(propertyOverlay_elem){
						while(propertyOverlay_elem.hasChildNodes()){ propertyOverlay_elem.removeChild(propertyOverlay_elem.lastChild); }
					}else{
						propertyOverlay_elem = xmldoc.createElement("PROPERTYOVERLAY");
						xmldoc.documentElement.appendChild(propertyOverlay_elem);
					}
					propertyOverlay_elem.appendChild(xmldoc.createTextNode(aProperty.propertyOverlay));
				}
				var s = new XMLSerializer();
				folders[0].fid_property = s.serializeToString(xmldoc);
				s = undefined;
			}
			if(aOptions != undefined){
				if(aOptions.fid_style != undefined)  folders[0].fid_style  = aOptions.fid_style;
				if(aOptions.fid_mode != undefined)  folders[0].fid_mode  = aOptions.fid_mode;
				if(aOptions.pfid_order != undefined) folders[0].pfid_order = aOptions.pfid_order;
			}
			delete folders[0].dbtype;
			changed = this.Database.updateFolder(folders[0],dbtype);
		}
		return changed;
	},

/////////////////////////////////////////////////////////////////////
	createFolders : function(aEvent){
		var curIdx = this.mcTreeHandler.TREE.currentIndex;
		var curRes = null;
		if(curIdx>=0){
			if(!this.mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(!this.mcTreeHandler.TREE.view.isContainerOpen(curIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(curIdx);
		}else{
			curRes = this.Common.RDF.GetResource(this.mcTreeHandler.TREE.ref);
		}
		var title = this.DataSource.getProperty(curRes,"title");
		var style = this.DataSource.getProperty(curRes,"style");
		var editmode = "0";
		if(title != ""){
			title = "New Project Folder ["+title+"]";
		}else{
			title = "New Project Folder";
		}
		if(editmode == "") editmode = "0";
		if(!style || style==""){
			var styleIdx = nsPreferences.getIntPref("wiredmarker.folderstyleindex",1);
			if(styleIdx>8) styleIdx = 1;
			style = bitsMarker.PRESET_STYLES[styleIdx];
			nsPreferences.setIntPref("wiredmarker.folderstyleindex",styleIdx);
		}
		//プロジェクトフォルダ
		var newRes = this.mcMainService.createGroupFolder(title,curRes.Value,undefined,"","",editmode);
		this.mcController.rebuildLocal();
		bitsMarkingCollection.reOrder(curRes);
		var newIdx = this.mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		this.mcTreeHandler.TREE.view.selection.select(newIdx);
		this.mcTreeHandler.TREE.focus();
		if(!this.mcTreeHandler.TREE.view.isContainerOpen(newIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(newIdx);
		var fid_mode = 0x0002;
		this.updateFolderProperty(newRes,{icon:"chrome://markingcollection/skin/project.png",contextmenu:"mcPopupProjectMainMenu"},{fid_mode : fid_mode });
		this.DataSource.setProperty(newRes,"editmode",fid_mode.toString());
		//ドキュメントフォルダ
		var newRes_Docs = this.mcMainService.createGroupFolder("Documents",newRes.Value,undefined,"","",editmode);
		this.mcController.rebuildLocal();
		bitsMarkingCollection.reOrder(newRes);
		fid_mode = 0x0002;
		this.updateFolderProperty(newRes_Docs,{icon:"chrome://markingcollection/skin/documents.png",contextmenu:"mcPopupProjectDocumentsMenu"},{fid_mode : fid_mode});
		this.DataSource.setProperty(newRes_Docs,"editmode",fid_mode.toString());
		//辞書フォルダ
		var newRes_Dic = this.mcMainService.createGroupFolder("Dictionary",newRes.Value,undefined,"","",editmode);
		this.mcController.rebuildLocal();
		bitsMarkingCollection.reOrder(newRes);
		fid_mode = 0x0002;
		this.updateFolderProperty(newRes_Dic,{icon:"chrome://markingcollection/skin/dictionary.png",contextmenu:"mcPopupProjectDictionaryMenu"},{fid_mode : fid_mode});
		this.DataSource.setProperty(newRes_Dic,"editmode",fid_mode.toString());
		//HAフォルダ
		var newRes_Anchor = this.mcMainService.createGroupFolder("Anchor",newRes.Value,undefined,style,"",editmode);
		this.mcController.rebuildLocal();
		bitsMarkingCollection.reOrder(newRes);
		fid_mode = 0x0000;
		this.updateFolderProperty(newRes_Anchor,{icon:"chrome://markingcollection/skin/hyperanchor.png",contextmenu:"mcPopupProjectAnchorMenu"});
		this.DataSource.setProperty(newRes_Anchor,"editmode",fid_mode.toString());
		var result = this.mcController.property(newRes);
		if(result){
			bitsMarkingCollection.reOrder(curRes);
		}else{
			this.mcTreeHandler.remove(undefined,undefined,true);
		}
		var newIdx = this.mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		this.mcController.rebuildLocal();
		var selectIdx = newIdx;
		if(selectIdx<0) selectIdx = curIdx;
		this.mcTreeHandler.TREE.currentIndex = selectIdx;
		if(!this.mcTreeHandler.TREE.view.selection.isSelected(this.mcTreeHandler.TREE.currentIndex)) this.mcTreeHandler.TREE.view.selection.select(this.mcTreeHandler.TREE.currentIndex);
		this.mcTreeHandler.TREE.focus();
		this.mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
		this.mcPropertyView.dispProperty(this.mcTreeHandler.object);
	},

/////////////////////////////////////////////////////////////////////
	createDocumentsFolder : function(aEvent){
		var curIdx = this.mcTreeHandler.TREE.currentIndex;
		var curRes = null;
		if(curIdx>=0){
			if(!this.mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(!this.mcTreeHandler.TREE.view.isContainerOpen(curIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(curIdx);
		}else{
			curRes = this.Common.RDF.GetResource(this.mcTreeHandler.TREE.ref);
		}
		var title = this.DataSource.getProperty(curRes,"title");
		var style = this.DataSource.getProperty(curRes,"style");
		var editmode = "0";
		if(title != ""){
			title = "New Documents Folder ["+title+"]";
		}else{
			title = "New Documents Folder";
		}
		if(editmode == "") editmode = "0";
		var fid_mode = 0x0002;
		//ドキュメントフォルダ
		var newRes = this.mcMainService.createGroupFolder(title,curRes.Value,undefined,"","",editmode);
		this.mcController.rebuildLocal();
		bitsMarkingCollection.reOrder(newRes);
		var newIdx = this.mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		this.mcTreeHandler.TREE.view.selection.select(newIdx);
		this.mcTreeHandler.TREE.focus();
		if(!this.mcTreeHandler.TREE.view.isContainerOpen(newIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(newIdx);
		this.updateFolderProperty(newRes,
			{
				icon        : "chrome://markingcollection/skin/documents.png",
				contextmenu : "mcPopupProjectDocumentsMenu"
			},
			{ fid_mode : fid_mode }
		);
		this.DataSource.setProperty(newRes,"editmode",fid_mode.toString());
		var result = this.mcController.property(newRes);
		if(result){
			bitsMarkingCollection.reOrder(curRes);
		}else{
			this.mcTreeHandler.remove(undefined,undefined,true);
		}
		var newIdx = this.mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		this.mcController.rebuildLocal();
		var selectIdx = newIdx;
		if(selectIdx<0) selectIdx = curIdx;
		this.mcTreeHandler.TREE.currentIndex = selectIdx;
		if(!this.mcTreeHandler.TREE.view.selection.isSelected(this.mcTreeHandler.TREE.currentIndex)) this.mcTreeHandler.TREE.view.selection.select(this.mcTreeHandler.TREE.currentIndex);
		this.mcTreeHandler.TREE.focus();
		this.mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
		this.mcPropertyView.dispProperty(this.mcTreeHandler.object);
	},

/////////////////////////////////////////////////////////////////////
	createDictionaryFolder : function(aEvent){
		var curIdx = this.mcTreeHandler.TREE.currentIndex;
		var curRes = null;
		if(curIdx>=0){
			if(!this.mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(!this.mcTreeHandler.TREE.view.isContainerOpen(curIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(curIdx);
		}else{
			curRes = this.Common.RDF.GetResource(this.mcTreeHandler.TREE.ref);
		}
		var title = this.DataSource.getProperty(curRes,"title");
		var style = this.DataSource.getProperty(curRes,"style");
		var editmode = "0";
		if(title != ""){
			title = "New Dictionary Folder ["+title+"]";
		}else{
			title = "New Dictionary Folder";
		}
		if(editmode == "") editmode = "0";
		if(!style || style==""){
			var styleIdx = nsPreferences.getIntPref("wiredmarker.folderstyleindex",1);
			if(styleIdx>8) styleIdx = 1;
			style = bitsMarker.PRESET_STYLES[styleIdx];
			nsPreferences.setIntPref("wiredmarker.folderstyleindex",styleIdx);
		}
		var fid_mode = 0x0000;
		//辞書フォルダ
		var newRes = this.mcMainService.createGroupFolder(title,curRes.Value,undefined,style,"",editmode);
		this.mcController.rebuildLocal();
		bitsMarkingCollection.reOrder(newRes);
		var newIdx = this.mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		this.mcTreeHandler.TREE.view.selection.select(newIdx);
		this.mcTreeHandler.TREE.focus();
		if(!this.mcTreeHandler.TREE.view.isContainerOpen(newIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(newIdx);
		this.updateFolderProperty(newRes,
			{
				icon            : "chrome://markingcollection/skin/dictionary.png",
				contextmenu     : "mcPopupProjectDictionaryMenu",
			},
			{fid_mode : fid_mode}
		);
		this.DataSource.setProperty(newRes,"editmode",fid_mode.toString());
		var result = this.mcController.property(newRes);
		if(result){
			bitsMarkingCollection.reOrder(curRes);
		}else{
			this.mcTreeHandler.remove(undefined,undefined,true);
		}
		var newIdx = this.mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		this.mcController.rebuildLocal();
		var selectIdx = newIdx;
		if(selectIdx<0) selectIdx = curIdx;
		this.mcTreeHandler.TREE.currentIndex = selectIdx;
		if(!this.mcTreeHandler.TREE.view.selection.isSelected(this.mcTreeHandler.TREE.currentIndex)) this.mcTreeHandler.TREE.view.selection.select(this.mcTreeHandler.TREE.currentIndex);
		this.mcTreeHandler.TREE.focus();
		this.mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
		this.mcPropertyView.dispProperty(this.mcTreeHandler.object);
	},

/////////////////////////////////////////////////////////////////////
	readDocumentFromFolder : function(aEvent){
		try{
			var mcTreeHandler = null;
			if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
			if(!mcTreeHandler) return;
			var aRes = mcTreeHandler.resource;
			if(!aRes) return;
			this.readDocuments(this.getReadFolder());
		}catch(e){
			this._dump("bitsTreeProjectService.readDocumentFromFolder():"+e);
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
			this._progressWindow = null;
		}
	},

/////////////////////////////////////////////////////////////////////
	readDocumentFromFile : function(aEvent){
		try{
			var mcTreeHandler = null;
			if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
			if(!mcTreeHandler) return;
			var aRes = mcTreeHandler.resource;
			if(!aRes) return;
			this.readDocuments(this.getReadFiles());
		}catch(e){
			this._dump("bitsTreeProjectService.readDocumentFromFile():"+e);
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
			this._progressWindow = null;
		}
	},

/////////////////////////////////////////////////////////////////////
	readDocuments : function(urls){
		try{
			if(!urls || urls.length==0) return;
			var curIdx = this.mcTreeHandler.TREE.currentIndex;
			var aRes =  this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(!this.mcTreeHandler.TREE.view.isContainerOpen(curIdx)) this.mcTreeHandler.TREE.view.toggleOpenState(curIdx);
			var fid = this.DataSource.getProperty(aRes, "id");
			var fid_style = this.DataSource.getProperty(aRes, "style");
			var dbtype = this.DataSource.getProperty(aRes, "dbtype");
			var pfid = this.DataSource.getProperty(aRes, "pfid");
			var param = {
				fid       : fid,
				fid_style : fid_style,
				dbtype    : dbtype,
				resource  : aRes,
				pfid      : pfid
			};
			if(!this._progressWindow){
				var x = screen.width;
				var y = screen.height;
				this._progressWindow = window.openDialog(
					"chrome://markingcollection/content/progress.xul",
					"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
					{status: this.STRING.getString("MSG_READING_DOCUMENTS") + "... [ "+ urls.length + " ]"});
			}
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.focus();
			var self = this;
			setTimeout(function(){ self._readDocuments(param,urls); },100);
			bitsAutocacheService._refreshFlag = false;
			if(this.bitsItemView && this.bitsItemView.isChecked) this.bitsItemView._refreshFlag = false;
			bitsArticleNavigation.stopObserver();
			this.setWaitCursor(true);
		}catch(e){
			this._dump("bitsTreeProjectService.readDocuments():"+e);
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
			this._progressWindow = null;
		}
	},

/////////////////////////////////////////////////////////////////////
	_readDocuments : function(aParam,aUrls){
		try{
			var i;
			for(i=0;i<10 && aUrls.length>0;i++){
				var url = aUrls.shift();
				this._addURLText(aParam,url);
			}
			if(aUrls.length>0){
				var self = this;
				setTimeout(function(){ self._readDocuments(aParam,aUrls); },100);
				if(this._progressWindow && !this._progressWindow.closed && this._progressWindow.setStatus) this._progressWindow.setStatus(this.STRING.getString("MSG_READING_DOCUMENTS") + "... [ "+ aUrls.length + " ]");
			}else{
				if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
				this._progressWindow = null;
				bitsAutocacheService._refreshFlag = true;
				bitsAutocacheService.refresh();
				if(this.bitsItemView && this.bitsItemView.isChecked){
					this.bitsItemView._refreshFlag = true;
					this.bitsItemView.refresh();
				}else if(this.mcTreeViewModeService){
					this.DataSource.flush();
				}
				bitsArticleNavigation.startObserver();
				this.setWaitCursor(false);
			}
		}catch(e){
			this._dump("bitsTreeProjectService._readDocuments():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_addURLText : function(aParam, aURLString){
		try{
			var rtn = false;
			var url = aURLString;
			var doc_url = url;
			var con_url = url;
			var parentID = aParam.fid;
			var style = aParam.fid_style;
			var dbtype = aParam.dbtype;
			var resource = aParam.resource;
			var pfid_order = this.Database.getMaxOrderFormPID(parentID);
			var rObj = this.Database.newObject(undefined,dbtype);
			if(rObj){
				rObj.pfid = parentID;
				rObj.doc_url = bitsAutocacheService.convertCacheURLToOriginalURL(doc_url);
				rObj.doc_title = rObj.doc_url;
				rObj.con_url = bitsAutocacheService.convertCacheURLToOriginalURL(con_url);
				rObj.oid_title = decodeURIComponent(this.Common.getFileName(url));
				if(rObj.oid_title == "") rObj.oid_title = decodeURIComponent(url);
				rObj.doc_title = rObj.oid_title;
				rObj.oid_mode = "0";
				try{ rObj.oid_type = this.Common.MIME.getTypeFromURI(this.Common.convertURLToObject(url)); }catch(e){ rObj.oid_type=null; }
				if(!rObj.oid_type) rObj.oid_type = "url";
				rObj.oid_txt = bitsAutocacheService.convertCacheURLToOriginalURL(url);
				rObj.oid_date = bitsAutocacheService.getURLTimeStampFormatDate(doc_url);
				rObj.pfid_order = ++pfid_order;
				rtn = this.Database.addObject(rObj,dbtype);
				if(rtn){
					if(this.bitsItemView && this.bitsItemView.isChecked){
					}else if(this.mcTreeViewModeService){
						var newDCitem = this.Common.newItem();
						newDCitem.id = rObj.oid;
						newDCitem.about = this.DataSource.getAbout(rObj.oid,rObj.pfid,dbtype);
						newDCitem.pfid = rObj.pfid;
						newDCitem.type = "item";
						newDCitem.title = rObj.oid_title;
						newDCitem.editmode = rObj.oid_mode;
						newDCitem.uri = rObj.doc_url;
						newDCitem.date = rObj.oid_date;
						newDCitem.dbtype = dbtype;
						if(url.indexOf("file://") == 0){
							newDCitem.title = rObj.oid_title;
						}else{
							newDCitem.icon = this.Database.getFavicon(rObj.doc_url,dbtype);
						}
						var aParName = this.DataSource.getID2About(parentID,aParam.pfid,dbtype);
						var newRes = this.DataSource.addItem(newDCitem, aParName, -1, dbtype);
					}
				}
				rObj = undefined;
			}
		}catch(ex){
			bitsMarkingCollection._dump("bitsMarkingCollection.addURLText():"+ex);
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_getDictionaryDir : function(aDBtype){
		if(aDBtype == undefined) return undefined;
		var dir = this.Common.getExtensionDir().clone();
		dir.append("dictionary");
		dir.append(aDBtype);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	_getDictionaryFile : function(aID,aDBtype){
		bitsMarkingCollection._dump("CALLED _getDictionaryFile():");
		if(aID == undefined || aDBtype == undefined) return undefined;
		var file = this._getDictionaryDir(aDBtype);
		if(!file) return undefined;
		file.append(aID+".xml");
		return file;
	},

/////////////////////////////////////////////////////////////////////
	_createDictionaryXML : function(){
		var parser = new DOMParser();
		var xmldoc = parser.parseFromString("<DICTIONARY/>", "text/xml");
		parser = undefined;
		if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
		return xmldoc;
	},

/////////////////////////////////////////////////////////////////////
	_getDictionaryXML : function(aID,aDBtype){
		if(aID == undefined || aDBtype == undefined) return undefined;
		var file = this._getDictionaryFile(aID,aDBtype);
		var content = this.readFile(file);
		if(!content || content == "") return undefined;
		var parser = new DOMParser();
		var xmldoc = parser.parseFromString(content, "text/xml");
		parser = undefined;
		if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
		return xmldoc;
	},

/////////////////////////////////////////////////////////////////////
	_putDictionaryXML : function(aID,aDBtype,aXMLDoc){
		if(aID == undefined || aDBtype == undefined || aXMLDoc == undefined) return undefined;
		var file = this._getDictionaryFile(aID,aDBtype);
		var s = new XMLSerializer();
		var content = s.serializeToString(aXMLDoc);
		s = undefined;
		return this.writeFile(file,content);
	},

/////////////////////////////////////////////////////////////////////
	makeDictionary : function(aEvent){
		var mcTreeHandler = null;
		if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
		if(!mcTreeHandler) return undefined;
		var aRes = mcTreeHandler.resource;
		if(!aRes) return undefined;
		if(this._makeDictionary(aRes)){
			this.Common.alert(this.STRING.getString("SUCCEEDED_DICTIONARY_UPDATE"));
		}else{
			this.Common.alert(this.STRING.getString("ALERT_DICTIONARY_UPDATE"));
		}
	},

/////////////////////////////////////////////////////////////////////
	_makeDictionary : function(aRes){
		var fid = this.DataSource.getProperty(aRes, "id");
		var dbtype = this.DataSource.getProperty(aRes, "dbtype");
		var fid_title = this.DataSource.getProperty(aRes, "title");
		var fid_style = this.DataSource.getProperty(aRes, "style");
		var fid_note = "";
		var folders = this.Database.getFolder({fid:fid},dbtype);
		if(folders){
			if(folders[0].fid_property && folders[0].fid_property != ""){
				try{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
					parser = undefined;
				}catch(ex){}
				if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
				if(xmldoc){
					var elems = xmldoc.getElementsByTagName("TAG");
					if(elems && elems.length>0) fid_title = elems[0].textContent;
					elems = undefined;
					elems = xmldoc.getElementsByTagName("NOTE");
					if(elems && elems.length>0) fid_note = elems[0].textContent;
					elems = undefined;
					xmldoc = undefined;
				}
			}
		}
		var xmldoc = this._getDictionaryXML(fid,dbtype);
		if(!xmldoc) xmldoc = this._createDictionaryXML();
		if(!xmldoc) return undefined;
		/* TITLEエレメント作成 */
		var titleElem = xmldoc.createTextNode(fid_title);
		var elems = xmldoc.documentElement.getElementsByTagName("TITLE");
		if(elems && elems.length > 0){
			if(elems[0].hasChildNodes()){
				elems[0].replaceChild(titleElem,elems[0].firstChild);
			}else{
				elems[0].appendChild(titleElem);
			}
		}else{
			var elem = xmldoc.createElement("TITLE");
			if(elem){
				elem.appendChild(titleElem);
				xmldoc.documentElement.appendChild(elem);
			}
		}
		/* NOTEエレメント作成 */
		var noteElem = xmldoc.createTextNode(fid_note);
		var elems = xmldoc.documentElement.getElementsByTagName("NOTE");
		if(elems && elems.length > 0){
			if(elems[0].hasChildNodes()){
				elems[0].replaceChild(noteElem,elems[0].firstChild);
			}else{
				elems[0].appendChild(noteElem);
			}
		}else{
			var elem = xmldoc.createElement("NOTE");
			if(elem){
				elem.appendChild(noteElem);
				xmldoc.documentElement.appendChild(elem);
			}
		}
		/* STYLEエレメント作成 */
		var styleElem = xmldoc.createTextNode(fid_style);
		var elems = xmldoc.documentElement.getElementsByTagName("STYLE");
		if(elems && elems.length > 0){
			if(elems[0].hasChildNodes()){
				elems[0].replaceChild(styleElem,elems[0].firstChild);
			}else{
				elems[0].appendChild(styleElem);
			}
		}else{
			var elem = xmldoc.createElement("STYLE");
			if(elem){
				elem.appendChild(styleElem);
				xmldoc.documentElement.appendChild(elem);
			}
		}
		/* TERMSエレメント作成 */
		var terms;
		var elems = xmldoc.documentElement.getElementsByTagName("TERMS");
		if(elems && elems.length > 0){
			terms = elems[0];
		}else{
			terms = xmldoc.createElement("TERMS");
			if(terms) xmldoc.documentElement.appendChild(terms);
		}
		if(!terms) return undefined;
		var i;
		var termhash = {};
		var elems = terms.getElementsByTagName("TERM");
		for(i=0;i<elems.length;i++){
			if(!elems[i].textContent) continue;
			termhash[elems[i].textContent.toLowerCase()] = i;
		}
		var objs = this.Database.getObject({pfid:fid},dbtype);
		if(objs){
			for(i=0;i<objs.length;i++){
				var term = objs[i].oid_title.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
				var key = term.toLowerCase();
				if(termhash[key] != undefined) continue;
				termhash[key] = i;
				var elem = xmldoc.createElement("TERM");
				if(!this._caseSensitive_exp.test(term)) term = term.toLowerCase();
				var termElem = xmldoc.createTextNode(term);
				if(!elem || !termElem) continue;
				elem.setAttribute("date",objs[i].oid_date);
				terms.appendChild(elem);
				elem.appendChild(termElem);
			}
		}
		if(this._putDictionaryXML(fid,dbtype,xmldoc)){
			return xmldoc;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	applyDictionary : function(aEvent){
		var mcTreeHandler = null;
		if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
		if(!mcTreeHandler) return;
		var aRes = mcTreeHandler.resource;
		if(!aRes) return;

		var doc = this.gBrowser.contentDocument;
		var doc_url = this.Common.getURLStringFromDocument(doc);
		if(!bitsAutocacheService.isMarking(doc_url)) return undefined;

		var dbtype = this.DataSource.getProperty(aRes, "dbtype");
		this._oid = this.Database._oidIdentify(dbtype,bitsObjectMng.Common.getTimeStamp());

		if(!this._progressWindow){
			var x = screen.width;
			var y = screen.height;
			this._progressWindow = window.openDialog(
				"chrome://markingcollection/content/progress_determined.xul",
				"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
				{status: "Loading Dictionary..."});
		}
		if(this._progressWindow && !this._progressWindow.closed){
			if(this._progressWindow.setStatus) this._progressWindow.setStatus("Loading Dictionary...");
			this._progressWindow.focus();
		}
		var self = this;
		if(this._applytimer) clearTimeout(this._applytimer);
		this._applytimer = setTimeout(function(){ self._applyDictionaryReadingXMLDictionary(doc,aRes); },1000);
		this.setWaitCursor(true);
	},

/////////////////////////////////////////////////////////////////////
	_applyDictionaryReadingXMLDictionary : function(doc,aRes){
		var xmldocs = [];
		var i,j;
		var foldResList = this.DataSource.flattenResources(aRes, 1, true);
		for(i=0;i<foldResList.length;i++){
			var fid = this.DataSource.getProperty(foldResList[i], "id");
			var style = this.DataSource.getProperty(foldResList[i], "style");
			var dbtype = this.DataSource.getProperty(foldResList[i], "dbtype");
			var xmldoc = this._getDictionaryXML(fid,dbtype);
			if(!xmldoc){
				var title = this.DataSource.getProperty(foldResList[i], "title");
				if(this.Common.confirm("[ "+title+" ]\n"+this.STRING.getString("CONFIRM_DICTIONARY_UPDATE"))) xmldoc = this._makeDictionary(foldResList[i]);
			}
			if(xmldoc) xmldocs.push({doc:xmldoc,fid:fid,dbtype:dbtype,style:style});
		}
		var selection = doc.defaultView.getSelection();
		if(!selection) return;
		selection.removeAllRanges();
		if(this._progressWindow && !this._progressWindow.closed){
			if(this._progressWindow.setStatus) this._progressWindow.setStatus("Sort Dictionary...");
			this._progressWindow.focus();
		}
		var self = this;
		this._applytimer = setTimeout(function(){ self._applyDictionaryLoadingDictionary(doc,xmldocs); },1000);
	},

/////////////////////////////////////////////////////////////////////
	_applyDictionaryLoadingDictionary : function(doc,xmldocs){
		var rangeCount = 0;
		var termhash = {};
		var termarray = [];
		var j;
		while(xmldocs && xmldocs.length>0){
			var xmldocobj = xmldocs.shift();
			var xmldoc = xmldocobj.doc;
			/* TERMSエレメント作成 */
			var terms = xmldoc.documentElement.getElementsByTagName("TERMS")[0];
			if(!terms){
				terms = xmldoc.createElement("TERMS");
				if(terms) xmldoc.documentElement.appendChild(terms);
			}
			if(!terms) continue;
			var elems = terms.getElementsByTagName("TERM");
			if(elems.length == 0) continue;
			for(j=0;j<elems.length;j++){
				if(!elems[j].textContent) continue;
				if(elems[j].hasAttribute("delete")) continue;
				if(elems[j].hasAttribute("exception")) continue;
				var key = elems[j].textContent.toLowerCase();
				if(termhash[key] != undefined) continue;
				termhash[key] = j;
				termarray.push({
					term : elems[j].textContent,
					obj  : xmldocobj,
				});
			}
		}
		termhash = undefined;
		if(termarray.length>0){
			termarray.sort(
				function(a,b){
					if(a.term.length>b.term.length) return -1;
					if(a.term.length<b.term.length) return 1;
					return 0;
				}
			);
			if(this._progressWindow && !this._progressWindow.closed){
				if(this._progressWindow.setProgress) this._progressWindow.setProgress(0);
				if(this._progressWindow.setStatus) this._progressWindow.setStatus(this.STRING.getString("MSG_DOCUMENTATION_TO_MATCH_THE_DICTIONARY") + "... [ 0% ], Remaining term:[ "+ termarray.length + " ], Meet term:[ "+ rangeCount + " ]");
				if(this._progressWindow.setCallback) this._progressWindow.setCallback(this._applyDictionaryCancel);
				this._progressWindow.focus();
			}
			var self = this;
			this._applytimer = setTimeout(function(){ self._applyDictionary(doc,termarray,termarray.length); },100);
			bitsAutocacheService._refreshFlag = false;
			if(this.bitsItemView && this.bitsItemView.isChecked) this.bitsItemView._refreshFlag = false;
			bitsArticleNavigation.stopObserver();
		}else{
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
			this._progressWindow = null;
			this.setWaitCursor(false);
		}
	},

/////////////////////////////////////////////////////////////////////
	_applyDictionaryCancel : function(aEvent){
		var self = bitsTreeProjectService;
		if(self._applytimer) clearTimeout(self._applytimer);
		self._applytimer = null;
		if(self._progressWindow && !self._progressWindow.closed) self._progressWindow.close();
		self._progressWindow = null;
		bitsAutocacheService._refreshFlag = true;
		bitsAutocacheService.refresh();
		if(self.bitsItemView && self.bitsItemView.isChecked){
			self.bitsItemView._refreshFlag = true;
			self.bitsItemView.refresh();
		}else if(self.mcTreeViewModeService){
			self.mcTreeViewModeService.rebuild();
		}
		bitsArticleNavigation.startObserver();
		self.setWaitCursor(false);
	},

/////////////////////////////////////////////////////////////////////
	_applyDictionary : function(aDoc,aTermArray,aMaxTerm,aRangeCount){
		var self = this;
		if(aRangeCount == undefined) aRangeCount = 0;
		if(aTermArray.length == 0 || !this._applytimer){
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
			this._progressWindow = null;
			setTimeout(function(){
				self.Common.alert("Term has [ "+ aRangeCount + " ] matches.");
				if(self.bitsItemView && self.bitsItemView.isChecked){
					self.bitsItemView._refreshFlag = true;
					self.bitsItemView.refresh();
				}else if(self.mcTreeViewModeService){
					bitsMarkingCollection._dump("bitsTreeProjectService._applyDictionary(1)");
					self.mcTreeViewModeService.rebuild();
					bitsMarkingCollection._dump("bitsTreeProjectService._applyDictionary(2)");
				}
			},100);
			bitsAutocacheService._refreshFlag = true;
			bitsAutocacheService.refresh();
			var url = this.Common.getURLStringFromDocument(aDoc);
			setTimeout(function(){
				var rtn= bitsAutocacheService.selectRowFromURL(url);
				if(!rtn) setTimeout(function(){ bitsAutocacheService.selectRowFromURL(url); },2000);
			},500);
			bitsArticleNavigation.startObserver();
			this.setWaitCursor(false);
			return;
		}
		var maxcnt = aMaxTerm>=20 ? parseInt(aMaxTerm/20) : aMaxTerm;
		if(maxcnt>100) maxcnt = 100;
		var doc = aDoc;
		var findRange = this._getFindRange();
		var j;
		for(j=0;j<maxcnt && aTermArray.length>0;j++){
			var termobj = aTermArray.shift();
			var findtext = termobj.term;
			findRange.caseSensitive = this._caseSensitive_exp.test(findtext);
			var docRange = doc.createRange();
			docRange.selectNode(doc.body);
			var startRange = docRange.cloneRange();
			var stopRange = docRange.cloneRange();
			startRange.collapse(true);
			stopRange.collapse(false);
			var rangeCount = 0;
			var result;
			while((result = findRange.Find(findtext, docRange, startRange, stopRange))){
				if(result.endContainer != null &&
					 result.startContainer != null &&
					 result.endContainer.nodeType == Node.TEXT_NODE &&
					 result.startContainer.nodeType == Node.TEXT_NODE &&
					 !this._isNodeInputNodeOrChildOf(result.startContainer) &&
					 !this._isNodeInputNodeOrChildOf(result.endContainer)) {
					var startChar = null;
					if(result.startOffset > 0) startChar = result.startContainer.nodeValue.charAt(result.startOffset - 1);
					var endChar = result.endContainer.nodeValue.charAt(result.endOffset);
					if(!this._isWordCharacter(startChar) && !this._isWordCharacter(endChar)){
						if(!((result.startContainer.parentNode && this._marker_exp.test(result.startContainer.parentNode.id)) || (result.endContainer.parentNode && this._marker_exp.test(result.endContainer.parentNode.id)))){
							var rtn = this._addSelectedText(
								aDoc,
								{
									fid       : termobj.obj.fid,
									fid_style : termobj.obj.style,
									dbtype    : termobj.obj.dbtype
								},result);
							if(rtn && rtn[0].id){
								var elem = aDoc.getElementById(rtn[0].id);
								if(elem){
									result.selectNode(elem);
									rangeCount++;
								}
							}
						}else{
						}
					}else{
					}
				}
				startRange = result;
				startRange.collapse(false);
			}
			if(rangeCount>0){
				aRangeCount += rangeCount;
				break;
			}
		}
		this._applytimer = setTimeout(function(){ self._applyDictionary(aDoc,aTermArray,aMaxTerm,aRangeCount); },100);
		if(this._progressWindow && !this._progressWindow.closed){
			var p = (aMaxTerm-aTermArray.length)/aMaxTerm;
			if(this._progressWindow.setProgress) this._progressWindow.setProgress( parseInt(p*100) );
			if(this._progressWindow.setStatus) this._progressWindow.setStatus(this.STRING.getString("MSG_DOCUMENTATION_TO_MATCH_THE_DICTIONARY") + "... [ "+ parseInt(p*100) + "% ], Remaining term:[ "+ aTermArray.length + " ], Meet term:[ "+ aRangeCount + " ]");
		}
	},

/////////////////////////////////////////////////////////////////////
	_addSelectedText : function(aDoc, aParName, aRange){
		try{
			var parentID = aParName.fid;
			var style = aParName.fid_style;
			var dbtype = aParName.dbtype;
			var pfid_order = this.Database.getMaxOrderFormPID(parentID);
			var doc_url = this.Common.getURLStringFromDocument(aDoc);
			bitsAutocacheService.createCache(doc_url);
			var rtnContent = null;
			var parser = new DOMParser();
			var rtnNewObj = [];
			var r;
			var range = aRange.cloneRange();
			if(range.startContainer.nodeType != range.startContainer.TEXT_NODE || range.endContainer.nodeType != range.endContainer.TEXT_NODE){
				var docRange = range.cloneRange();
				var startRange = range.cloneRange();
				var stopRange = range.cloneRange();
				startRange.collapse(true)
				stopRange.collapse(false)
				var xContext = range.toString().replace(/^\s*/g,"").replace(/\s*$/g,"");
				var findRange = bitsMarker._getFindRange();
				var result = findRange.Find(xContext, docRange, startRange, stopRange);
				if(result) range = result.cloneRange();
			}
			var context = range.toString();
			var startContainer = range.startContainer;
			var startOffset = range.startOffset;
			var endContainer = range.endContainer;
			var endOffset = range.endOffset;
			var stXPath = this.XPath.getOffsetFromParentNode(startContainer,startOffset);
			var enXPath = this.XPath.getOffsetFromParentNode(endContainer,endOffset);
			try{
				var hyperAnchor = bitsHyperAnchor._getAnchorURL({node:startContainer,offset:startOffset,style:style,prefix:"b",contents:range.toString()},{node:endContainer,offset:endOffset,prefix:"e",contents:range.toString()});
			}catch(ex3){
				try{
					var hyperAnchor = bitsHyperAnchorDummy._getAnchorURL({node:startContainer,offset:startOffset,style:style,prefix:"b",contents:range.toString()},{node:endContainer,offset:endOffset,prefix:"e",contents:range.toString()});
				}catch(ex3){ hyperAnchor = null; }
			}
			if(hyperAnchor) hyperAnchor = bitsAutocacheService.convertCacheURLToOriginalURL(hyperAnchor);
			var con_url = this.Common.getURLStringFromDocument(stXPath.node.ownerDocument);
			var rObj = {};
			rObj.pfid = parentID;
			rObj.doc_url = bitsAutocacheService.convertCacheURLToOriginalURL(doc_url);
			rObj.con_url = bitsAutocacheService.convertCacheURLToOriginalURL(con_url);
			rObj.doc_title = this.gBrowser.contentDocument.title?this.gBrowser.contentDocument.title:rObj.doc_url;
			rObj.bgn_dom = stXPath.xpath + "("+stXPath.offset+")" + "("+stXPath.type+")";
			rObj.end_dom = enXPath.xpath + "("+enXPath.offset+")" + "("+enXPath.type+")";
			rObj.oid_title = this.Common.exceptCode(context.replace(/[\r\n\t]+/mg," ").replace(/\s{2,}/mg," "));
			rObj.oid_txt = this.Common.exceptCode(context.replace(/\s+$/mg,"").replace(/^\s+/mg,""));
			rObj.oid_date = bitsAutocacheService.getURLTimeStampFormatDate(doc_url);
			rObj.oid_mode = "0";
			rObj.con_doc = stXPath.node.ownerDocument;
			var frame_name;
			if(doc_url != con_url){
				var win = this.gBrowser.contentWindow;
				if(win.frames != null){
					var i;
					for(i=0;i<win.frames.length;i++){
						if(this.Common.getURLStringFromDocument(win.frames[i].document) != con_url) continue;
						frame_name = win.frames[i].name;
						break;
					}
				}
			}
			rObj.oid_type = "text";
			if(hyperAnchor || frame_name){
				var xmldoc = parser.parseFromString("<PROPERTY/>","text/xml");
				if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
				if(xmldoc){
					if(xmldoc.documentElement){
						if(frame_name){
							var xmlnode = xmldoc.createElement("FRAME_NAME");
							if(xmlnode){
								xmlnode.appendChild(xmldoc.createTextNode(frame_name));
								xmldoc.documentElement.appendChild(xmlnode);
							}
						}
						if(hyperAnchor){
							var xmlnode = xmldoc.createElement("HYPER_ANCHOR");
							if(xmlnode){
								xmlnode.appendChild(xmldoc.createTextNode(hyperAnchor));
								xmldoc.documentElement.appendChild(xmlnode);
							}
						}
					}
					var s = new XMLSerializer();
					rObj.oid_property = s.serializeToString(xmldoc);
					s = undefined;
				}
			}
			rtnNewObj.unshift(rObj);
			parser = undefined;
			for(r=0;r<rtnNewObj.length;r++){
				var rObj = this.Database.newObject(this._oid);
				for(var key in rtnNewObj[r]){
					if(key == "oid") continue;
					if(key == "con_doc") continue;
					rObj[key] = rtnNewObj[r][key];
				}
				rObj.pfid_order = ++pfid_order;
				this._oid = parseInt(rObj.oid)-1;
				var rtn = this.Database.addObject(rObj,dbtype);
				if(!rtn) rObj = undefined;
				if(!rObj) continue;
				try{
					rtnContent = bitsMarker.xPathMarker(
						rtnNewObj[r].con_doc,
						{
							start   : rObj.bgn_dom,
							end     : rObj.end_dom,
							context : rObj.oid_txt,
							con_url : this.Common.getURLStringFromDocument(rtnNewObj[r].con_doc)
						},
						{
							id     : rObj.oid,
							dbtype : dbtype,
							pfid   : rObj.pfid,
							style  : style
						}
					);
					if(!rtnContent){
						var rtn = this.Database.removeObject(rObj,dbtype);
					}
				}catch(ex2){
					bitsMarkingCollection._dump("bitsTreeProjectService._addSelectedText():"+ex2);
					rtnContent = null;
				}
			}
		}catch(e){
			bitsMarkingCollection._dump("bitsTreeProjectService._addSelectedText():"+e);
			rtnContent = null;
		}
		return rtnContent;
	},

/////////////////////////////////////////////////////////////////////
	_getFindRange : function(){
		var findRange = Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance();
		if(!findRange || !(findRange instanceof Components.interfaces.nsIFind)) return undefined;
		findRange.caseSensitive = false;
		findRange.findBackwards = false;
		return findRange;
	},

/////////////////////////////////////////////////////////////////////
	_isWordCharacter : function(ch){
		if(ch == null ||  typeof ch != "string" || ch.length != 1) return false;
		var code = ch.charCodeAt(0);
		return code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 138 && code <= 142 || code >= 154 && code <= 159 || code >= 192 && code <= 255;
	},

/////////////////////////////////////////////////////////////////////
	_isNodeInputNodeOrChildOf : function(node){
		if(node.nodeName.toUpperCase() == "INPUT") return true;
		if(node.parentNode != null) return this._isNodeInputNodeOrChildOf(node.parentNode);
		return false;
	},

/////////////////////////////////////////////////////////////////////
	readDictionary : function(aEvent){
		try{
			var mcTreeHandler = null;
			if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
			if(!mcTreeHandler) return;
			var aRes = mcTreeHandler.resource;
			if(!aRes) return;
			var file = this.getReadFile();
			if(file){
				var text_content = null;
				var r_xmldoc = null;
				try{ var mimetype = this.Common.MIME.getTypeFromFile(file); }catch(e){ mimetype=null; }
				if(mimetype == "text/plain"){
					text_content = this.readFile(file);
				}else if(mimetype == "text/xml"){
					text_content = this.readFile(file);
					var parser = new DOMParser();
					r_xmldoc = parser.parseFromString(text_content, "text/xml");
					parser = undefined;
					if(r_xmldoc && r_xmldoc.documentElement.nodeName == "parsererror") r_xmldoc = undefined;
					if(!r_xmldoc){
						this.Common.alert("Read Error!!["+file.path+"]");
						return;
					}
				}else{
					this.Common.alert("Unknown MIME Type!");
					return;
				}
				var fid = this.DataSource.getProperty(aRes, "id");
				var fid_style = this.DataSource.getProperty(aRes, "style");
				var dbtype = this.DataSource.getProperty(aRes, "dbtype");
				var xmldoc = this._getDictionaryXML(fid,dbtype);
				if(!xmldoc) xmldoc = this._createDictionaryXML();
				if(!xmldoc) return;
				var terms = xmldoc.documentElement.getElementsByTagName("TERMS")[0];
				if(!terms){
					terms = xmldoc.createElement("TERMS");
					if(terms) xmldoc.documentElement.appendChild(terms);
				}
				var elems = terms.getElementsByTagName("TERM");
				if(r_xmldoc){
				}else if(text_content){
					var dd = new Date;
					dd.setTime(file.lastModifiedTime);
					var y = dd.getFullYear();
					var m = dd.getMonth() + 1; if(m < 10) m = "0" + m;
					var d = dd.getDate();      if(d < 10) d = "0" + d;
					var h = dd.getHours();     if(h < 10) h = "0" + h;
					var i = dd.getMinutes();   if(i < 10) i = "0" + i;
					var s = dd.getSeconds();   if(s < 10) s = "0" + s;
					var date =  m.toString() + "/" + d.toString() + "/" + y.toString() + " " + h.toString() + ":" + i.toString() + ":" + s.toString();
					var text_arr = text_content.replace(/\x0D\x0A|\x0D|\x0A/g,"\n").split("\n");
					if(!this._progressWindow){
						var x = screen.width;
						var y = screen.height;
						this._progressWindow = window.openDialog(
							"chrome://markingcollection/content/progress_determined.xul",
							"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
							{
								status   : this.STRING.getString("MSG_READING_DICTIONARY") + "...",
								progress : 0,
								callback : function(aEvent){ self._readDictionaryCancel(aRes,xmldoc);}
							});
					}
					var self = this;
					if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.focus();
					if(this._applytimer) clearTimeout(this._applytimer);
					this._applytimer = setTimeout(function(){ self._readDictionaryLoadXMLDictionary(aRes,xmldoc,elems,text_arr,date); },0);
					this.setWaitCursor(true);
				}
			}
		}catch(e){
			this._dump("bitsTreeProjectService.readDictionary():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_readDictionaryCancel : function(aRes,aXMLDoc){
		var self = bitsTreeProjectService;
		if(self._applytimer) clearTimeout(self._applytimer);
		self._applytimer = null;
		var fid = self.DataSource.getProperty(aRes, "id");
		var dbtype = self.DataSource.getProperty(aRes, "dbtype");
		self._putDictionaryXML(fid,dbtype,aXMLDoc);
		if(self._progressWindow && !self._progressWindow.closed) self._progressWindow.close();
		self._progressWindow = null;
		this.setWaitCursor(false);
	},

/////////////////////////////////////////////////////////////////////
	_readDictionaryLoadXMLDictionary : function(aRes,aXMLDoc,aTermElems,aTermArray,aDateString,aTermHash,aIndex){
		var self = this;
		if(aXMLDoc == undefined) return;
		if(aTermHash == undefined) aTermHash = {};
		if(aIndex == undefined) aIndex = 0;
		var i = aIndex;
		for(;i<aIndex+50 && i<aTermElems.length;i++){
			if(!aTermElems[i].textContent) continue;
			if(this._caseSensitive_exp.test(aTermElems[i].textContent)){
				aTermHash[aTermElems[i].textContent] = i+1;
			}else{
				aTermHash[aTermElems[i].textContent.toLowerCase()] = i+1;
			}
		}
		aIndex = i;
		if(aIndex<aTermElems.length){
			this._applytimer = setTimeout(function(){ self._readDictionaryLoadXMLDictionary(aRes,aXMLDoc,aTermElems,aTermArray,aDateString,aTermHash,aIndex); },0);
			return;
		}else{
			if(this._progressWindow && !this._progressWindow.closed){
				if(this._progressWindow.setStatus) this._progressWindow.setStatus(this.STRING.getString("MSG_READING_DICTIONARY") + "... [ 0% ][ "+ aTermArray.length + " ]");
			}
			this._applytimer = setTimeout(function(){ self._readDictionary(aTermArray,aTermHash,aDateString,aRes,aXMLDoc,aTermArray.length); },0);
		}
	},

/////////////////////////////////////////////////////////////////////
	_readDictionary : function(aTermArray,aTermHash,aDateString,aRes,aXMLDoc,aMaxTerm){
		var terms = aXMLDoc.documentElement.getElementsByTagName("TERMS")[0];
		if(!terms) return;
		var i,j;
		for(i=0,j=0;i<50 && j<250 && aTermArray.length>0;j++){
			var term = aTermArray.shift();
			term = term.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
			var key;
			if(this._caseSensitive_exp.test(term)){
				key = term;
			}else{
				key = term.toLowerCase();
			}
			if(aTermHash[key] != undefined) continue;
			i++;
			aTermHash[key] = i;
			var elem = aXMLDoc.createElement("TERM");
			if(!this._caseSensitive_exp.test(term)) term = term.toLowerCase();
			var termElem = aXMLDoc.createTextNode(term);
			if(!elem || !termElem) continue;
			elem.setAttribute("date",aDateString);
			terms.appendChild(elem);
			elem.appendChild(termElem);
		}
		var self = this;
		if(aTermArray.length == 0){
			var fid = this.DataSource.getProperty(aRes, "id");
			var dbtype = this.DataSource.getProperty(aRes, "dbtype");
			this._putDictionaryXML(fid,dbtype,aXMLDoc);
			if(this._progressWindow && !this._progressWindow.closed) this._progressWindow.close();
			this._progressWindow = null;
			setTimeout(function(){ self.Common.alert(self.STRING.getString("SUCCEEDED_READING_DICTIONARY")); },100);
			this.setWaitCursor(false);
			return;
		}
		this._applytimer = setTimeout(function(){ self._readDictionary(aTermArray,aTermHash,aDateString,aRes,aXMLDoc,aMaxTerm); },0);
		if(this._progressWindow && !this._progressWindow.closed){
			var p = (aMaxTerm-aTermArray.length)/aMaxTerm;
			if(this._progressWindow.setProgress) this._progressWindow.setProgress( parseInt(p*100) );
			if(this._progressWindow.setStatus) this._progressWindow.setStatus(this.STRING.getString("MSG_READING_DICTIONARY") + "... [ "+ parseInt(p*100) + "% ][ "+ aTermArray.length + " ]");
		}
	},

/////////////////////////////////////////////////////////////////////
	saveDictionary : function(aEvent){
		var mcTreeHandler = null;
		if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
		if(!mcTreeHandler) return;
		var aRes = mcTreeHandler.resource;
		if(!aRes) return;
		var fid = this.DataSource.getProperty(aRes, "id");
		var title = this.DataSource.getProperty(aRes, "title");
		var dbtype = this.DataSource.getProperty(aRes, "dbtype");
		var xmldoc = this._getDictionaryXML(fid,dbtype);
		if(!xmldoc){
			var title = this.DataSource.getProperty(aRes, "title");
			if(this.Common.confirm("[ "+title+" ]\n"+this.STRING.getString("CONFIRM_DICTIONARY_UPDATE"))) xmldoc = this._makeDictionary(aRes);
		}
		if(!xmldoc) return;
		var dataArray = null;
		var terms = xmldoc.documentElement.getElementsByTagName("TERMS")[0];
		if(terms){
			var i;
			var termhash = {};
			var elems = terms.getElementsByTagName("TERM");
			if(elems.length>0) dataArray = [];
			for(i=0;i<elems.length;i++){
				if(elems[i].hasAttribute("exception")) continue;
				if(!elems[i].textContent) continue;
				if(termhash[elems[i].textContent]) continue;
				termhash[elems[i].textContent] = true;
				dataArray.push(elems[i].textContent);
			}
		}
		if(dataArray){
			var file = this.getSaveFile(title);
			if(file){
				this.writeFile(file,dataArray.join("\n")+"\n");
				this.Common.alert(this.STRING.getString("SUCCEEDED_DICTIONARY_SAVE"));
			}
			dataArray = undefined;
		}else{
			this.Common.alert(this.STRING.getString("ALERT_DICTIONARY_NO_TERMS"));
		}
	},

/////////////////////////////////////////////////////////////////////
	mngDictionary : function(aEvent){
		var mcTreeHandler = null;
		if(this.mcTreeHandler) mcTreeHandler = this.mcTreeHandler;
		if(!mcTreeHandler) return;
		var aRes = mcTreeHandler.resource;
		if(!aRes) return;
		var fid = this.DataSource.getProperty(aRes, "id");
		var style = this.DataSource.getProperty(aRes, "style");
		var title = this.DataSource.getProperty(aRes, "title");
		var dbtype = this.DataSource.getProperty(aRes, "dbtype");
		var xmldoc = this._getDictionaryXML(fid,dbtype);
		if(!xmldoc && this.Common.confirm("[ "+title+" ]\n"+this.STRING.getString("CONFIRM_DICTIONARY_UPDATE"))) xmldoc = this._makeDictionary(aRes);
		if(!xmldoc){
			this.Common.alert(this.STRING.getString("ALERT_DICTIONARY_UPDATE"));
			return;
		}
		var result = {
			accept    : false,
			fid       : fid,
			fid_style : style,
			fid_title : title,
			dbtype    : dbtype,
			xmldoc    : xmldoc,
		};
		window.openDialog("chrome://markingcollection/content/treeprojectDicMngDialog.xul", "", "chrome,centerscreen,modal", result);
		if(result.accept){
			this._putDictionaryXML(fid,dbtype,result.xmldoc);
		}
	},

/////////////////////////////////////////////////////////////////////
	getFolder : function(){
		if(!this.mcTreeHandler) return undefined;
		var curIdx = this.mcTreeHandler.TREE.currentIndex;
		if(curIdx<0) return undefined;
		if(!this.mcTreeHandler.TREE.view.isContainer(curIdx)) return undefined;
		var aRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
		var fid = this.DataSource.getProperty(aRes,"id");
		var dbtype = this.DataSource.getProperty(aRes,"dbtype");
		var folder;
		if(fid != "0"){
			var foldres = this.Database.getFolderFormID(fid,dbtype);
			if(foldres) folder = foldres[0];
		}else{
			folder = {fid:fid,dbtype:dbtype,fid_title:this.DataSource.getProperty(aRes,"title"),fid_property:""};
		}
		return folder;
	},

/////////////////////////////////////////////////////////////////////
	displayIndex : function(aEvent,aXSLPath){
	bitsMarkingCollection._dump("CALLED displayIndex():");
		aEvent.stopPropagation();
		var xmlContent = this.createXML(aXSLPath);
		if(!xmlContent) return;
		bitsTreeListService._fileid = this.Common.getTimeStamp();
		var file = bitsTreeListService.getTreeListDir();
		file.append(bitsTreeListService._fileid+".xml");
		if(file.exists()) file.remove(false);
		file.create(file.NORMAL_FILE_TYPE, 0666);
		var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
		ostream.init(file, 2, 0x200, false);
		this.Common.UNICODE.charset = "UTF-8";
		xmlContent = this.Common.UNICODE.ConvertFromUnicode(xmlContent);
		ostream.write(xmlContent, xmlContent.length);
		ostream.close();
		var cur_uri = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		var basedir = bitsTreeListService.getBaseDir();
		var res_uri = this.Common.convertFilePathToURL(basedir.path);
		if(cur_uri.indexOf(res_uri)>=0) bitsTreeListService._doc = this.gBrowser.contentDocument;
		var url = this.Common.convertFilePathToURL(file.path);
		var loadFlag = false;
		if(this.gBrowser.browsers.length == 1 && res_uri != "" && cur_uri != res_uri){
			loadFlag = true;
		}else if(cur_uri == res_uri){
			loadFlag = false;
		}else{
			loadFlag = true;
			for(var i=0;i<this.gBrowser.browsers.length;i++){
				var doc = this.gBrowser.browsers[i].contentDocument;
				var cur_uri = this.Common.getURLStringFromDocument(doc);
				if(cur_uri.indexOf(res_uri)>=0){
					loadFlag = false;
					this.gBrowser.tabContainer.selectedIndex = i;
					break;
				}
			}
		}
		this.Common.loadURL(url,loadFlag);
		bitsTreeListService._openurl = url;
		if(bitsTreeListService._openurl != ""){
			var remove_dir = this.Common.convertURLToFile(this.Common.getBaseHref(bitsTreeListService._openurl));
			window.top.bitsMarkingCollection._removefile.push(remove_dir);
			if(this.mcTreeViewModeService) this.mcTreeViewModeService._openlist[url] = loadFlag;
		}
	},

/////////////////////////////////////////////////////////////////////
	saveIndex : function(aEvent){
	bitsMarkingCollection._dump("CALLED saveIndex():");
		aEvent.stopPropagation();
		var savedir = this.getSaveFolder();
		if(!savedir) return;
		var xmlContent =this.createXML();
		if(!xmlContent) return;
		if(!this._folder) return;
		var file = savedir.clone();
		file.append(this._folder.fid_title+".xml");
		if(file.exists()){
			var filecnt;
			for(filecnt=1;;filecnt++){
				file = savedir.clone();
				file.append(this._folder.fid_title+"("+filecnt+")"+".xml");
				if(!file.exists()) break;
			}
		}
		file.create(file.NORMAL_FILE_TYPE, 0666);
		var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
		ostream.init(file, 2, 0x200, false);
		this.Common.UNICODE.charset = "UTF-8";
		xmlContent = this.Common.UNICODE.ConvertFromUnicode(xmlContent);
		ostream.write(xmlContent, xmlContent.length);
		ostream.close();
		var msg = this.STRING.getString("SUCCEEDED_INDEX") + "\n";
		msg += file.path;
		var prompts = this.Common.PROMPT;
		var flags = prompts.BUTTON_TITLE_OK + prompts.BUTTON_POS_0_DEFAULT;
		var button = prompts.confirmEx(window, this.STRING.getString("APP_TITLE"), msg, flags, "", "", "", null, {});
	},

/////////////////////////////////////////////////////////////////////
	createXML : function(aXSLPath){
		this._folder = undefined;
		var folder = this.getFolder();
		if(!folder) return;
		this._folder = folder;
		this.createTITLE2OBJ(folder);
		if(!this._title2obj) return "";
		var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
		var stylesheet;
		if(aXSLPath && aXSLPath.match(/^file:/)){
			stylesheet = this.Common.readFile(this.Common.convertURLToFile(aXSLPath));
		}else if(aXSLPath && aXSLPath.match(/^chrome:\/\/markingcollection\/content\//)){
			var xslURL = this.Common.convertURLToObject(aXSLPath);
			stylesheet = bitsTreeListService.loadText(xslURL);
		}else{
			var xslURL = this.Common.convertURLToObject("chrome://markingcollection/content/treeindex_standard.xsl");
			stylesheet = bitsTreeListService.loadText(xslURL);
		}
		if(stylesheet && stylesheet != ""){
			var type = "xsl";
			aContent += '<?xml-stylesheet type="text/'+type+'" href="#treeindex"?>\n';
		}
		aContent += '<!DOCTYPE WM_INDEX_LIST';
		aContent += '[\n';
		aContent += '  <!ATTLIST xsl:stylesheet id ID #REQUIRED>\n';
		aContent += ']';
		aContent += '>\n<WM_INDEX_LIST>\n';
		if(stylesheet && stylesheet != "") aContent += stylesheet+'\n';
		aContent += "</WM_INDEX_LIST>\n";
		if(!this.createXMLDoc(aContent)) return "";
		this._xmldoc.documentElement.setAttribute("title",folder.fid_title);
		var url2icon = {};
		var title_arr = [];
		var title;
		var tcnt;
		var ocnt;
		var kcnt;
		for(title in this._title2obj){
			title_arr.push(title);
		}
		title_arr.sort(function(a,b){
			if(a.toUpperCase() == b.toUpperCase()) return 0;
			if(a.toUpperCase() >  b.toUpperCase()) return 1;
			if(a.toUpperCase() <  b.toUpperCase()) return -1;
		});
		try{
			var indexsnode = this._xmldoc.createElement("INDEXS");
			this._xmldoc.documentElement.appendChild(indexsnode);
		}catch(e){}
		for(tcnt=0;tcnt<title_arr.length;tcnt++){
			title = title_arr[tcnt];
			try{
				indexsnode.appendChild(this._xmldoc.createTextNode("\n  "));
			}catch(e){}
			try{
				var indexnode = this._xmldoc.createElement("INDEX");
				indexsnode.appendChild(indexnode);
			}catch(e){}
			try{
				indexnode.appendChild(this._xmldoc.createTextNode("\n    "));
				var titlenode = this._xmldoc.createElement("TITLE");
				titlenode.appendChild(this._xmldoc.createTextNode(title));
				indexnode.appendChild(titlenode);
			}catch(e){}
			var urlhash = {};
			for(ocnt=0;ocnt<this._title2obj[title].length;ocnt++){
				try{
					var obj = this._title2obj[title][ocnt];
					var objkey;
					if(obj && obj.oid_property){
						try{
							var parser = new DOMParser();
							var xmldoc = parser.parseFromString(obj.oid_property, "text/xml");
							parser = undefined;
							if(this._xmldoc && this._xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
							if(xmldoc){
								var objkeys = ["NOTE","HYPER_ANCHOR"];
								for(kcnt=0;kcnt<objkeys.length;kcnt++){
									objkey = objkeys[kcnt].toUpperCase();
									var elem = xmldoc.getElementsByTagName(objkey)[0];
									if(!elem) continue;
									obj[objkey] = elem.textContent;
								}
							}
						}catch(e){}
					}
					if(obj && obj.doc_url){
						if(urlhash[obj.doc_url] == undefined) urlhash[obj.doc_url] = [];
						urlhash[obj.doc_url].push(obj);
					}
				}catch(e){}
			}
			var urlarr = [];
			var url;
			for(url in urlhash){
				urlarr.push(url);
			}
			if(urlarr.length>0){
				try{
					indexnode.appendChild(this._xmldoc.createTextNode("\n    "));
					var urlsnode = this._xmldoc.createElement("URLS");
					indexnode.appendChild(urlsnode);
					urlarr.sort(function(a,b){
						if(a.toUpperCase() == b.toUpperCase()) return 0;
						if(a.toUpperCase() >  b.toUpperCase()) return 1;
						if(a.toUpperCase() <  b.toUpperCase()) return -1;
					});
					for(ocnt=0;ocnt<urlarr.length;ocnt++){
						url = urlarr[ocnt];
						urlsnode.appendChild(this._xmldoc.createTextNode("\n      "));
						var urlnode = this._xmldoc.createElement("URL");
						urlsnode.appendChild(urlnode);
						urlnode.appendChild(this._xmldoc.createTextNode("\n        "));
						var docurlnode = this._xmldoc.createElement("DOCUMENT_URL");
						docurlnode.appendChild(this._xmldoc.createTextNode(url));
						urlnode.appendChild(docurlnode);
						if(url2icon[url]){
							urlnode.appendChild(this._xmldoc.createTextNode("\n        "));
							var iconnode = this._xmldoc.createElement("FAVICON");
							iconnode.appendChild(this._xmldoc.createTextNode(url2icon[url]));
							urlnode.appendChild(iconnode);
						}
						urlnode.appendChild(this._xmldoc.createTextNode("\n        "));
						var objsnode = this._xmldoc.createElement("OBJECTS");
						urlnode.appendChild(objsnode);
						for(kcnt=0;kcnt<urlhash[url].length;kcnt++){
							var obj = urlhash[url][kcnt];
							if(kcnt == 0){
								urlnode.appendChild(this._xmldoc.createTextNode("\n        "));
								var docurlnode = this._xmldoc.createElement("DOCUMENT_TITLE");
								docurlnode.appendChild(this._xmldoc.createTextNode(obj.doc_title));
								urlnode.appendChild(docurlnode);
							}
							objsnode.appendChild(this._xmldoc.createTextNode("\n          "));
							var objnode = this._xmldoc.createElement("OBJECT");
							objsnode.appendChild(objnode);
							for(objkey in obj){
								objnode.appendChild(this._xmldoc.createTextNode("\n            "));
								var keynode = this._xmldoc.createElement(objkey.toUpperCase());
								keynode.appendChild(this._xmldoc.createTextNode(obj[objkey]));
								objnode.appendChild(keynode);
							}
							if(obj && obj.doc_url){
								if(url2icon[obj.doc_url]){
									objnode.appendChild(this._xmldoc.createTextNode("\n            "));
									var iconnode = this._xmldoc.createElement("ICON");
									iconnode.appendChild(this._xmldoc.createTextNode(url2icon[obj.doc_url]));
									objnode.appendChild(iconnode);
								}
							}
							objnode.appendChild(this._xmldoc.createTextNode("\n          "));
						}
						objsnode.appendChild(this._xmldoc.createTextNode("\n        "));
						urlnode.appendChild(this._xmldoc.createTextNode("\n      "));
					}
					urlsnode.appendChild(this._xmldoc.createTextNode("\n    "));
				}catch(e){}
			}
			try{
				indexnode.appendChild(this._xmldoc.createTextNode("\n  "));
			}catch(e){}
		}
		try{
			indexsnode.appendChild(this._xmldoc.createTextNode("\n"));
			this._xmldoc.documentElement.appendChild(this._xmldoc.createTextNode("\n"));
		}catch(e){}
		return this.xmlSerializer();
	},

/////////////////////////////////////////////////////////////////////
	createTITLE2OBJ : function(aFolder){
		this._title2obj = undefined;
		var title2obj = {};
		var pos = 0;
		var key;
		var object;
		var fid2style = {};
		var contResList = this._getAllObject(aFolder);
		if(contResList.length>0){
			var ocnt;
			for(ocnt=0;ocnt<contResList.length;ocnt++){
				if(!contResList[ocnt].bgn_dom) continue;
				var title = contResList[ocnt].oid_title;
				title = title.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
				var oid = contResList[ocnt].oid;
				var dbtype = contResList[ocnt].dbtype;
				var pfid = contResList[ocnt].pfid;
				var objects = this.Database.getObjectWithProperty({oid:oid},dbtype);
				if(!objects) continue;
				object = objects[0];
				if(title2obj[title] == undefined) title2obj[title] = [];
				pos = title2obj[title].length;
				title2obj[title][pos] = {};
				for(key in object){
					title2obj[title][pos][key] = object[key];
				}
				var i=0;
				if(object.oid_type.match(/^image\/(.+)$/)){
					var blob = this.Database.getObjectBLOB(object.oid,dbtype);
					if(blob && blob.length>0 && blob[0].length>0){
						var images = String.fromCharCode.apply(String, blob[0]);
						var image_b64 = btoa(images); // base64 encoding
						image_b64 = 'data:' + object.oid_type + ';base64,' + image_b64;
						title2obj[title][pos].oid_img  = image_b64;
						/* システムで管理しているイメージの場合 */
						var blobFile = this.Database.getObjectBLOBFile(object.oid,dbtype);
						var blobUrl = this.Common.convertFilePathToURL(blobFile.path);
						if(object.doc_url == blobUrl) title2obj[title][pos].doc_url = image_b64;
						if(object.con_url == blobUrl) title2obj[title][pos].con_url = image_b64;
					}
				}
				if(fid2style[pfid] == undefined){
					var folders = this.Database.getFolderFormID(pfid,dbtype);
					if(folders && folders.length>0) fid2style[pfid] = folders[0].fid_style.replace(/([:;\(,])\s+/mg,"$1");
				}
				if(fid2style[pfid] != undefined) title2obj[title][pos].fid_style = fid2style[pfid];
			}
		}
		contResList = undefined;
		this._title2obj = title2obj;
	},

/////////////////////////////////////////////////////////////////////
	readFile : function(aFile){
		if(!aFile || !aFile.exists()) return undefined;
		try {
			var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
			istream.init(aFile, 1, 0, false);
			var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
			sstream.init(istream);
			var content = sstream.read(sstream.available());
			sstream.close();
			istream.close();
			content = this.Common.convertToUnicode(content,"UTF-8");
			return content;
		}catch(ex){
			this._dump("bitsTreeProjectService ERROR: readFile():" + ex);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	writeFile : function(aFile, aContent){
		try {
			if(!aFile.parent.exists()) aFile.parent.create(aFile.DIRECTORY_TYPE, 0777);
			if(aFile.exists()) aFile.remove(false);
			aFile.create(aFile.NORMAL_FILE_TYPE, 0666);
			var content = this.Common.convertFormUnicode(aContent,"UTF-8");
			var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(aFile, 2, 0x200, false);
			ostream.write(content, content.length);
			ostream.close();
			return true;
		}catch(ex){
			this._dump("bitsTreeProjectService ERROR: Failed to write file: " + aFile.path + "["+ ex + "]");
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	createXMLDoc : function(aContent){
		var parser = new DOMParser();
		this._xmldoc = parser.parseFromString(aContent, "text/xml");
		parser = undefined;
		if(this._xmldoc && this._xmldoc.documentElement.nodeName == "parsererror"){
			this._xmldoc = undefined;
		}
		return this._xmldoc;
	},

/////////////////////////////////////////////////////////////////////
	xmlSerializer : function(){
		if(!this._xmldoc) return "";
		var s = new XMLSerializer();
		var aContent = s.serializeToString(this._xmldoc);
		s = undefined;
		return aContent;
	},

/////////////////////////////////////////////////////////////////////
	validateFileName : function(aFileName){
		var re = /[\/]+/g;
		if (navigator.appVersion.indexOf("Windows") != -1) {
			re = /[\\\/\|]+/g;
			aFileName = aFileName.replace(/[\"]+/g, "'");
			aFileName = aFileName.replace(/[\*\:\?]+/g, " ");
			aFileName = aFileName.replace(/[\<]+/g, "(");
			aFileName = aFileName.replace(/[\>]+/g, ")");
			aFileName = aFileName.replace(/[\"\?!~`]+/g, "");
			aFileName = aFileName.replace(/[\*\&]+/g, "+");
			aFileName = aFileName.replace(/[\\\/\|\:;]+/g, "-");
			aFileName = aFileName.replace(/[\<]+/g, "(");
			aFileName = aFileName.replace(/[\>]+/g, ")");
			aFileName = aFileName.replace(/[\s]+/g, "_");
			aFileName = aFileName.replace(/[%]+/g, "@");
		}else if (navigator.appVersion.indexOf("Macintosh") != -1)
			re = /[\:\/]+/g;
		return aFileName.replace(re, "_");
	},

/////////////////////////////////////////////////////////////////////
	getReadFileFromFolder : function (aFolder){
		var result = [];
		try{
			var entries = aFolder.directoryEntries;
			while(entries.hasMoreElements()){
				var entry = entries.getNext();
				entry.QueryInterface(Components.interfaces.nsIFile);
				if(entry.isDirectory()){
					result = result.concat(this.getReadFileFromFolder(entry));
				}else{
					try{ var mimetype = this.Common.MIME.getTypeFromFile(entry); }catch(e){ mimetype = undefined; }
					if(!mimetype) continue;
					if(mimetype != "text/plain" && mimetype != "text/html" && mimetype != "application/pdf") continue;
					var arg = this.Common.convertFilePathToURL(entry.QueryInterface(Components.interfaces.nsILocalFile).path);
					result.push(arg);
				}
			}
		}catch(e){
			this._dump("bitsTreeProjectService.getReadFileFromFolder():aFolder=["+aFolder+"]");
			this._dump("bitsTreeProjectService.getReadFileFromFolder():"+e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getReadFolder : function (aDefaultFolder){
		var result = undefined;
		try{
			var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
			picker.init(window, "Selected Folder", picker.modeGetFolder);
			if(aDefaultFolder) picker.displayDirectory = aDefaultFolder;
			var showResult = picker.show();
			if(showResult == picker.returnOK) result = this.getReadFileFromFolder(picker.file);
		}catch(e){
			result = undefined;
			this._dump("bitsTreeProjectService.getReadFolder():"+e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getReadFiles : function (){
		var result = undefined;
		try{
			var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
			picker.init(window, "Selected Files", picker.modeOpenMultiple);
			picker.appendFilter("HTML File or Text File or PDF File","*.htm; *.html; *.txt; *.pdf");
			picker.appendFilters(picker.filterHTML | picker.filterText);
			picker.appendFilter("PDF File","*.pdf");
			picker.filterIndex = 0;
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				var files = picker.files;
				result = [];
				while (files.hasMoreElements()){
					var arg = this.Common.convertFilePathToURL(files.getNext().QueryInterface(Components.interfaces.nsILocalFile).path);
					result.push(arg);
				}
			}
		}catch(e){
			result = undefined;
			this._dump("bitsTreeProjectService.getReadFiles():"+e);
			if(e.message=="Component returned failure code: 0x80520001 (NS_ERROR_FILE_UNRECOGNIZED_PATH) [nsIFilePicker.show]"){
				if(this.Common.confirm(this.STRING.getString("CONFIRM_READING_DOCUMENTS_SELECT_OVER"))) result = this.getReadFolder((picker&&picker.displayDirectory?picker.displayDirectory:undefined));
			}
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getReadFile : function (){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = undefined;
		try{
			picker.init(window, "Selected File", picker.modeOpen);
			picker.appendFilters(picker.filterText);
			picker.filterIndex = 0;
			var showResult = picker.show();
			if(showResult == picker.returnOK || showResult == picker.returnReplace) result = picker.file;
		}catch(e){
			result = undefined;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getSaveFile : function (aTitle){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = null;
		try{
			var title = "Selected Save File";
			if(aTitle) title += " ["+aTitle+"]";
			picker.init(window, title, picker.modeSave);
			picker.defaultExtension = ".txt";
			if(aTitle) picker.defaultString  = aTitle + picker.defaultExtension;
			picker.appendFilters(picker.filterText);
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
	getTemplateDir : function(){},

/////////////////////////////////////////////////////////////////////
	createMenu : function(aParentNode,aEntry){},

/////////////////////////////////////////////////////////////////////
	loadText : function(aURI){},

/////////////////////////////////////////////////////////////////////
	_getZipEntry : function(aZipEntry){
		return escape(aZipEntry);
	},

/////////////////////////////////////////////////////////////////////
	addEntryDirectory : function(aZipWriter,aDir,aParentPath){
		var LANG = this.Common.getLang();
		var entries = aDir.directoryEntries;
		while(entries.hasMoreElements()){
			var pDir = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!pDir.isDirectory()) continue;
			var entryName = (aParentPath?aParentPath+"/":"") + pDir.leafName;
			aZipWriter.addEntryDirectory(this._getZipEntry(entryName), pDir.lastModifiedTime, false);
			this.addEntryDirectory(aZipWriter, pDir, entryName);
		}
	},

/////////////////////////////////////////////////////////////////////
	addEntryFile : function(aZipWriter,aDir,aParentPath){
		var entries = aDir.directoryEntries;
		while(entries.hasMoreElements()){
			var pDir = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			var entryName = (aParentPath?aParentPath+"/":"") + pDir.leafName;
			if(pDir.isDirectory()){
				this.addEntryFile(aZipWriter, pDir, entryName);
			}else{
				aZipWriter.addEntryFile(this._getZipEntry(entryName), Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, pDir, false);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	saveFile : function(aEvent){
		try{
			aEvent.preventDefault();
			aEvent.stopPropagation();
			this._savehtml.length = 0;
			this._savehtml = [];
			var contentWindow = null;
			var mcTreeHandler = null;
			if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
			if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
			if(!mcTreeHandler) return;
			var curIdx = mcTreeHandler.TREE.currentIndex;
			if(curIdx<0) return;
			var aRes = null;
			if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			aRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			var fid = this.DataSource.getProperty(aRes,"id");
			var dbtype = this.DataSource.getProperty(aRes,"dbtype");
			if(fid != "0"){
				var foldres = this.Database.getFolderFormID(fid,dbtype);
				if(foldres) this._saveFile(foldres[0]);
			}else{
				this._saveFile({fid:fid,dbtype:dbtype,fid_title:this.DataSource.getProperty(aRes,"title"),fid_property:""});
			}
		}catch(ex){
			this.Common.alert("bitsTreeProjectService.saveFile():"+ex);
		}
	},


/////////////////////////////////////////////////////////////////////
	_saveFile : function(aFolder){
	bitsMarkingCollection._dump("CALLED _saveFile():");
		try{
			var saveFolder = this.getSaveFolder(aFolder.fid_title);
			if(!saveFolder) return;
			var tmpDir = window.top.bitsMarkingCollection.getTmpDir().clone();
			tmpDir.append(this.STRING.getString("APP_TITLE"));
			tmpDir.createUnique(tmpDir.DIRECTORY_TYPE, 0777);
			tmpDir.append(this._getZipEntry(this.validateFileName(aFolder.fid_title)));
			if(tmpDir.exists()) tmpDir.remove(true);
			if(!tmpDir.exists()) tmpDir.create(tmpDir.DIRECTORY_TYPE, 0777);
			var file = tmpDir.clone();
			file.append(this._getZipEntry(this.validateFileName(aFolder.fid_title))+".xml");
			var leafName = unescape(file.leafName);
			var filename = this.Common.splitFileName(leafName)[0];
			this.appDataSTRING = this.appDataAddSTRING;
			var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
			var aURL = this.Common.convertURLToObject("chrome://markingcollection/content/treeexport.xsl");
			var stylesheet = bitsTreeListService.loadText(aURL);
			if(stylesheet && stylesheet != ""){
				var type = "xsl";
				aContent += '<?xml-stylesheet type="text/'+type+'" href="#treeexport"?>\n';
			}
			aContent += '<!DOCTYPE LIST';
			aContent += '[\n';
			aContent += '  <!ATTLIST xsl:stylesheet id ID #REQUIRED>\n';
			aContent += ']';
			aContent += '>\n<LIST title="'+ this.xmlEncode(aFolder.fid_title) +'">\n';
			if(stylesheet && stylesheet != "") aContent += stylesheet+'\n';
			aContent += "</LIST>\n";
			this.createXMLDoc(aContent);
			bitsTreeProjectService.createID2OBJ(aFolder);
			bitsTreeProjectService.createXML(aFolder,this.xmldoc.documentElement);
			aContent = "";
			if(this._savehtml.length>0){
				var elem = this.xmldoc.createElement("BASENAME");
				var elemT = this.xmldoc.createTextNode(filename);
				if(elem && elemT){
					elem.appendChild(elemT);
					this.xmldoc.documentElement.appendChild(elem)
				}
			}
			aContent = this.xmlSerializer();
			this.Common.writeFile(file, aContent, "UTF-8");
			var savePath = null;
			if(this._savehtml.length>0){
				savePath = file.parent.clone();
				savePath.append(this.appDataSTRING);
				if(savePath.exists()) savePath.remove(true);
				savePath.create(savePath.DIRECTORY_TYPE, 0777);
				var i;
				for(i=0;i<this._savehtml.length;i++){
					var htmlfile = this.Common.convertURLToFile(this._savehtml[i]);
					if(!htmlfile.exists()) continue;
					var htmlpath2 = htmlfile.parent.clone();
					var htmlpath1 = htmlpath2.parent.clone();
					var copypath1 = savePath.clone();
					copypath1.append(htmlpath1.leafName);
					if(!copypath1.exists()) copypath1.create(copypath1.DIRECTORY_TYPE, 0777);
					var copyfile1 = copypath1.clone();
					copyfile1.append(".info");
					if(!copyfile1.exists()){
						var htmlfile1 = htmlpath1.clone();
						htmlfile1.append(".info");
						if(htmlfile1.exists()) htmlfile1.copyTo(copypath1,htmlfile1.leafName);
						htmlfile1 = undefined;
					}
					copyfile1 = undefined;
					var copypath2 = copypath1.clone();
					copypath2.append(htmlpath2.leafName);
					if(copypath2.exists()) continue;
					htmlpath2.copyTo(copypath1,htmlpath2.leafName);
					var urlinfo = copypath2.clone();
					urlinfo.append(".urlinfo");
					if(urlinfo.exists()){
						var content = this.Common.readFile(urlinfo);
						if(content && content != ""){
							var content_arr = content.split("\n");
							var j,k;
							for(j=0;j<content_arr.length;j++){
								var url_arr = content_arr[j].split("\t");
								for(k=0;k<url_arr.length;k++){
									if(url_arr[k].match(this.appDataURLExp)) url_arr[k] = url_arr[k].replace(this.appDataURLExp, this.appDataSTRING);
								}
								content_arr[j] = url_arr.join("\t");
							}
							content = content_arr.join("\n");
							this.Common.writeFile(urlinfo, content, "UTF-8");
						}
					}
					urlinfo = undefined;
					htmlfile = undefined;
					htmlpath2 = undefined;
					htmlpath2 = undefined;
					copypath1 = undefined;
					copypath2 = undefined;
				}
			}
			try{
				var nsIZipWriter = Components.interfaces.nsIZipWriter;
				var zipWriter = Components.classes["@mozilla.org/zipwriter;1"].createInstance(nsIZipWriter);
			}catch(e){}
			var zipFile;
			if(zipWriter){
				var parent = tmpDir.parent.clone();
				zipFile = saveFolder.clone();
				zipFile.append(filename+".zip");
				if(zipFile.exists()){
					var filecnt;
					for(filecnt=1;;filecnt++){
						zipFile = saveFolder.clone();
						zipFile.append(filename+"("+filecnt+")"+".zip");
						if(!zipFile.exists()) break;
					}
				}
				if(!zipFile.exists()) zipFile.create(zipFile.NORMAL_FILE_TYPE, 0664);
				zipWriter.open(zipFile, 0x04 | 0x08 | 0x20);
				this.addEntryDirectory(zipWriter, parent);
				this.addEntryFile(zipWriter, parent);
				zipWriter.close();
				if(parent.exists()) parent.remove(true);
			}else if(this.zipApp){
				try{
					var LANG = this.Common.getLang();
					var args = [];
					if(this.zipAppScript) args.push(this.Common.convertFormUnicode(this.zipAppScript.path,LANG));
					if(navigator.platform == "Win32") args.push("//Nologo");
					zipFile = saveFolder.clone();
					zipFile.append(filename+".zip");
					if(zipFile.exists()){
						var filecnt;
						for(filecnt=1;;filecnt++){
							zipFile = saveFolder.clone();
							zipFile.append(filename+"("+filecnt+")"+".zip");
							if(!zipFile.exists()) break;
						}
					}
					args.push(this.Common.convertFormUnicode(zipFile.path,LANG));
					if(navigator.platform == "Win32"){
						args.push(this.Common.convertFormUnicode(tmpDir.path,LANG));
					}else{
						args.push("-r");
						args.push(this.Common.convertFormUnicode(tmpDir.path,LANG));
					}
					var proc = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
					proc.init(this.zipApp);
					proc.run(true, args, args.length);
					if(tmpDir.parent.exists()) tmpDir.parent.remove(true);
				}catch(ex2){
					this.Common.alert("bitsTreeProjectService._saveFile():"+ex2);
					if(zipFile && zipFile.exists()) zipFile.remove(true);
					var parent = tmpDir.parent.clone();
					zipFile = saveFolder.clone();
					zipFile.append(tmpDir.leafName);
					if(zipFile.exists()){
						var filecnt;
						for(filecnt=1;;filecnt++){
							zipFile = saveFolder.clone();
							zipFile.append(tmpDir.leafName+"("+filecnt+")");
							if(!zipFile.exists()) break;
						}
					}
					tmpDir.moveTo(saveFolder,zipFile.leafName);
					if(parent.exists()) parent.remove(true);
				}
			}else{
				var parent = tmpDir.parent.clone();
				zipFile = saveFolder.clone();
				zipFile.append(unescape(tmpDir.leafName));
				if(zipFile.exists()){
					var filecnt;
					for(filecnt=1;;filecnt++){
						zipFile = saveFolder.clone();
						zipFile.append(unescape(tmpDir.leafName)+"("+filecnt+")");
						if(!zipFile.exists()) break;
					}
				}
				tmpDir.moveTo(saveFolder,zipFile.leafName);
				if(parent.exists()) parent.remove(true);
			}
			var msg = this.STRING.getString("SUCCEEDED_EXPORT") + "\n";
			if(zipFile && zipFile.exists()){
				msg += zipFile.path;
			}else{
				msg += saveFolder.path;
			}
			var prompts = this.Common.PROMPT;
			var flags = prompts.BUTTON_TITLE_OK + prompts.BUTTON_POS_0_DEFAULT;
			var button = prompts.confirmEx(window, bitsTreeProjectService.STRING.getString("APP_TITLE"), msg, flags, "", "", "", null, {});
		}catch(ex){
			this.Common.alert("bitsTreeProjectService._saveFile():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	getBaseDir : function(){
		var dir  = window.top.bitsMarkingCollection.getExtensionDir().clone();
		dir.append("treelist");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getTreeListDir : function(){
		var dir  = this.getBaseDir().clone();
		dir.append(this._fileid);
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	xmlEncode : function(aString){
		return aString.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	},

/////////////////////////////////////////////////////////////////////
	_getAllObject : function(aFolder){
		var rtn = [];
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			var aocnt;
			for(aocnt=0;aocnt<Foldres.length;aocnt++){
				rtn = rtn.concat(this._getAllObject(Foldres[aocnt]));
			}
		}
		var Objects = this.Database.getObjectFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Objects) rtn = rtn.concat(Objects);
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_getAllFolder : function(aFolder){
		var rtn = [];
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			var aocnt;
			for(aocnt=0;aocnt<Foldres.length;aocnt++){
				rtn.push(Foldres[aocnt]);
				rtn = rtn.concat(this._getAllFolder(Foldres[aocnt]));
			}
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_getAllChild : function(aFolder){
		var rtn = [];
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			Foldres.sort(function(a,b){ return a.pfid_order - b.pfid_order; });
			rtn = rtn.concat(Foldres);
		}
		var Objects = this.Database.getObjectFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Objects){
			Objects.sort(function(a,b){ return a.pfid_order - b.pfid_order; });
			rtn = rtn.concat(Objects);
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	createID2OBJ : function(aFolder){
		var title2obj = {};
		var fid2style = {};
		var contResList = this._getAllObject(aFolder);
		if(contResList.length>0){
			var ocnt;
			for(ocnt=0;ocnt<contResList.length;ocnt++){
				var oid = contResList[ocnt].oid;
				if(title2obj[title] != undefined) continue;
				var dbtype = contResList[ocnt].dbtype;
				var objects = this.Database.getObjectWithProperty({oid:oid},dbtype);
				if(!objects) continue;
				title2obj[title] = {};
				var i=0;
				if(objects[i].oid_type.match(/^image\/(.+)$/)){
					var blob = this.Database.getObjectBLOB(objects[i].oid,dbtype);
					if(blob && blob.length>0 && blob[0].length>0){
						var images = String.fromCharCode.apply(String, blob[0]);
						var image_b64 = btoa(images); // base64 encoding
						image_b64 = 'data:' + objects[i].oid_type + ';base64,' + image_b64;
						title2obj[title].img  = image_b64;
						/* システムで管理しているイメージの場合 */
						var blobFile = this.Database.getObjectBLOBFile(objects[i].oid,dbtype);
						var blobUrl = this.Common.convertFilePathToURL(blobFile.path);
						if(objects[i].doc_url == blobUrl) objects[i].doc_url = image_b64;
						if(objects[i].con_url == blobUrl) objects[i].con_url = image_b64;
					}
				}
				if(window.top.bitsScrapPartySaveService){
					if(objects[i].doc_url.match(this.appDataURLExp)){
						this._savehtml.push(objects[i].doc_url);
						objects[i].doc_url = objects[i].doc_url.replace(this.appDataURLExp, this.appDataSTRING);
					}
					if(objects[i].con_url.match(this.appDataURLExp)){
						objects[i].con_url = objects[i].con_url.replace(this.appDataURLExp, this.appDataSTRING);
					}
				}
				title2obj[title].text = objects[i].oid_txt;
				title2obj[title].uri = objects[i].doc_url;
				title2obj[title].uri_title = objects[i].doc_title;
				title2obj[title].con_url = objects[i].con_url;
				title2obj[title].type = objects[i].oid_type;
				title2obj[title].st = objects[i].bgn_dom;
				title2obj[title].en = objects[i].end_dom;
				if(objects[i].oid_property && objects[i].oid_property != "") title2obj[title].property = objects[i].oid_property;
				title2obj[title].dbtype = objects[i].dbtype;
				title2obj[title].date = objects[i].oid_date;
				title2obj[title].mode = objects[i].oid_mode;
				if(fid2style[objects[i].pfid] == undefined){
					var folders = this.Database.getFolderFormID(objects[i].pfid,dbtype);
					if(folders && folders.length>0) fid2style[objects[i].pfid] = folders[0].fid_style.replace(/([:;\(,])\s+/mg,"$1");
				}
				if(fid2style[objects[i].pfid] != undefined) title2obj[title].style = fid2style[objects[i].pfid];
			}
		}
		contResList = undefined;
		this.title2obj = title2obj;
	},

/////////////////////////////////////////////////////////////////////
	createTextNode : function(aString,aParentNode){
		if(aString && aString != ""){
			var elemS = this.xmldoc.createTextNode(aString);
			if(elemS) aParentNode.appendChild(elemS);
		}
	},

/////////////////////////////////////////////////////////////////////
	createElement : function(aTagName,aString,aParentNode,aTab){
		if(!aTagName || !aParentNode) return;
		if(aTab && aTab != ""){
			var elemT = this.xmldoc.createTextNode(aTab);
			if(elemT) aParentNode.appendChild(elemT);
		}
		var elem = this.xmldoc.createElement(aTagName);
		if(elem){
			if(aString){
				if(aString != ""){
					var elemS = this.xmldoc.createTextNode(aString);
					if(elemS) elem.appendChild(elemS);
				}
			}else{
				var elemR = this.xmldoc.createTextNode("\n");
				if(elemR) elem.appendChild(elemR);
			}
			aParentNode.appendChild(elem)
			var elemR = this.xmldoc.createTextNode("\n");
			if(elemR) aParentNode.appendChild(elemR);
		}
		return elem;
	},

/////////////////////////////////////////////////////////////////////
	createXMLObject : function(aObject,aParentNode,aDepth){
		var title2obj = this.title2obj;
		if(aDepth == undefined) aDepth = 0;
		var aTab = "";
		for(var i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var oid = aObject.oid;
		var alink = "";
		var structure = "";
		var hyperAnchor = "";
		var disp_image_size_x = "";
		var disp_image_size_y = "";
		var disp_image_size = "";
		var out_property = [];
		var xmldoc;
		var structureElem;
		if(aObject.oid_property && aObject.oid_property != ""){
			try{
				var parser = new DOMParser();
				xmldoc = parser.parseFromString(aObject.oid_property, "text/xml");
				parser = undefined;
			}catch(ex){}
			if(xmldoc && xmldoc.documentElement.nodeName == "parsererror"){
				title2obj[title].property = "";
				xmldoc = undefined;
			}
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("LINK")[0];
				if(xmlnode) alink = xmlnode.textContent;
				/* STRUCTURE内のデータはxhtmlで格納されている為、そのまま出力する */
				xmlnode = xmldoc.getElementsByTagName("STRUCTURE")[0];
				if(xmlnode && xmlnode.hasChildNodes()){
					structureElem = xmlnode.cloneNode(true);
				}
				xmlnode = xmldoc.getElementsByTagName("IMG_LIST_DISP_SIZE")[0];
				if(xmlnode){
					disp_image_size = xmlnode.textContent;
					if(disp_image_size.match(/^(\d+),(\d+)$/mg)){
						disp_image_size_x = RegExp.$1;
						disp_image_size_y = RegExp.$2;
					}
				}
				xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
				if(xmlnode){
					out_property["NOTE"] = {};
					out_property["NOTE"].type  = "text";
					out_property["NOTE"].value = xmlnode.textContent;
				}
				xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
				if(xmlnode) hyperAnchor = xmlnode.textContent;
			}
		}
		var oNode = this.createElement("OBJECT",undefined,aParentNode,aTab+"  ");
		this.createElement("OID_TITLE",aObject.oid_title,oNode,aTab+"    ");
		if(out_property["NOTE"]) this.createElement("OID_NOTE",out_property["NOTE"].value,oNode,aTab+"    ");
		var tag;
		for(tag in out_property){
			if(typeof out_property[tag] == "function") continue;
			this.createElement("OID_PROPERTY_"+ tag,out_property[tag].value,oNode,aTab+"    ");
		}
		if(disp_image_size_x && disp_image_size_y){
			this.createElement("OID_IMG_DISP_WIDTH",disp_image_size_x,oNode,aTab+"    ");
			this.createElement("OID_IMG_DISP_HEIGHT",disp_image_size_x,oNode,aTab+"    ");
		}
		if(title2obj[title].img) this.createElement("OID_IMG",title2obj[title].img,oNode,aTab+"    ");
		if(title2obj[title].uri) this.createElement("DOC_URL",title2obj[title].uri,oNode,aTab+"    ");
		if(title2obj[title].uri_title) this.createElement("DOC_TITLE",title2obj[title].uri_title,oNode,aTab+"    ");
		if(title2obj[title].st) this.createElement("BGN_DOM",title2obj[title].st,oNode,aTab+"    ");
		if(title2obj[title].en) this.createElement("END_DOM",title2obj[title].en,oNode,aTab+"    ");
		if(title2obj[title].con_url) this.createElement("CON_URL",title2obj[title].con_url,oNode,aTab+"    ");
		if(title2obj[title].type) this.createElement("OID_TYPE",title2obj[title].type,oNode,aTab+"    ");
		if(title2obj[title].date) this.createElement("OID_DATE",title2obj[title].date,oNode,aTab+"    ");
		if(title2obj[title].mode) this.createElement("OID_MODE",title2obj[title].mode,oNode,aTab+"    ");
		if(alink != "") this.createElement("OID_LINK",alink,oNode,aTab+"    ");
		if(structureElem){
			var elem = this.createElement("OID_STRUCTURE","",oNode,aTab+"    ");
			var i;
			for(i=0;i<structureElem.childNodes.length;i++){
				elem.appendChild(structureElem.childNodes[i].cloneNode(true));
			}
		}
		if(title2obj[title].text) this.createElement("OID_TXT",title2obj[title].text,oNode,aTab+"    ");
		if(title2obj[title].property) this.createElement("OID_PROPERTY",title2obj[title].property,oNode,aTab+"    ");
		if(title2obj[title].dbtype) this.createElement("OID_DBTYPE",title2obj[title].dbtype,oNode,aTab+"    ");
		if(hyperAnchor != ""){
			this.createElement("HYPER_ANCHOR",hyperAnchor,oNode,aTab+"    ");
		}else if(title2obj[title].con_url && title2obj[title].st){
			var text = title2obj[title].con_url + '#hyperanchor:' + this.xmlEncode(title2obj[title].st);
			if(title2obj[title].en) text += "&" + this.xmlEncode(title2obj[title].en);
			if(title2obj[title].style) text += "&" + this.xmlEncode(title2obj[title].style);
			this.createElement("HYPER_ANCHOR",text,oNode,aTab+"    ");
		}
		this.createTextNode(aTab+"  ",oNode);
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
