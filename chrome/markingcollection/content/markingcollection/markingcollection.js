var bitsMarkingCollection = {
/////////////////////////////////////////////////////////////////////
	_location : null,
	_init     : false,
	_removefile : [],
	// _homepage : "http://www.wired-marker.org/index.cgi",
        _homepage : "http://dasish.eu/",
	_version : "",
	_contentWindow : null,
	_markingtimer  : null,
	_uncategorized : {	//未分類フォルダ用定義
		dbtype : "_uncategorized"
	},
	_app_version : 2,

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("MarkingCollectionOverlayString"); },
	get DEF_STRING() { return document.getElementById("bitsDefaultString"); },
	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get XPath()      { return bitsObjectMng.XPath;      },
	get Database()   { return bitsObjectMng.Database;   },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

	get BROWSER()       { return document.getElementById("MarkingCollectionBrowser"); },
	get ProgressPanel() { return document.getElementById("MarkingCollectionProgressPanel"); },
	get Progressmeter() { return document.getElementById("MarkingCollectionProgressmeter"); },

	get BOOKMARKS_MENU_2() { return document.getElementById("bookmarks-menu"); }, /* Ver2.0 */
	get BOOKMARKS_MENU_3() { return document.getElementById("bookmarksMenu"); },  /* Ver3.0 */

	get BROADCASTER() { return document.getElementById("viewMarkingCollection"); },

	localfolder : {
		get id(){ return "0"; },
		get about(){ return bitsObjectMng.DataSource.ABOUT_ITEM+"00000000000000"; },
		get title(){ return bitsObjectMng.STRING.getString("LOCAL_FOLDER"); },
	},

	sharedfolder : {
		_id : 0,
		get id(){ return this._id; },
		get title(){ return bitsObjectMng.STRING.getString("SHARED_FOLDER"); },

		init : function(){
			this._id = 1;
		},
		about : function(aID){
			if(aID == undefined) return "";
			aID = ""+aID;
			while(aID.length<14) aID = "0"+aID;
			return bitsObjectMng.DataSource.ABOUT_ITEM+aID;
		},
	},

	dbinfo : {
		_xmldoc : undefined,
		_xmlfolder : undefined,

		get dbFolder()   { return this._xmlfolder; },

		init : function(aForced){
			if(aForced == undefined) aForced = false;
			var hasHidden = false;
			var addon_info_arr = null;
			var extensionDir = bitsMarkingCollection.Common.getExtensionDir().clone();
			if(extensionDir){
				this._xmlfolder = extensionDir;
				var xmlfile = extensionDir.clone();
				xmlfile.append("db.xml");
				var defaultMode = bitsMarkingCollection.Database._defaultMode;
				if(!xmlfile.exists()){
					var db_order = 0;
					db_order++;
					var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
					aContent += '<!DOCTYPE DATABASES>\n<DATABASES>\n';
					aContent += '  <DATABASE id="' + defaultMode + '" disabled="false" hidden="false" db_default="true" db_contextmenu="true" db_order="' + db_order + '">\n';
					aContent += '    <DATABASE_TITLE>'  + bitsMarkingCollection.localfolder.title + '</DATABASE_TITLE>\n';
					aContent += '    <DATABASE_DBTYPE>' + defaultMode + '</DATABASE_DBTYPE>\n';
					aContent += '    <DATABASE_FILE>'   + bitsMarkingCollection.Common.convertFilePathToURL(bitsMarkingCollection.Database._getConnectFile(defaultMode).path) + '</DATABASE_FILE>\n';
					aContent += '    <DATABASE_ICON>chrome://markingcollection/skin/localfolder.png</DATABASE_ICON>\n';
					aContent += '  </DATABASE>\n';
					aContent += '</DATABASES>\n';
					bitsMarkingCollection.Common.writeFile(xmlfile,aContent,"UTF-8");
				}
				if(xmlfile.exists()){
					function _loadXMLDocument(pUri){
						if(pUri == undefined) return undefined;
						var xmlDocument = bitsMarkingCollection.loadXMLDocument(pUri);
						if(xmlDocument){
							return xmlDocument.documentElement;
						}else{
							return undefined;
						}
					}
					function _createXMLDocument(aXMLFile){
						if(!aXMLFile) return undefined;
						try{
							return _loadXMLDocument(bitsMarkingCollection.Common.IO.newFileURI(aXMLFile).spec);
						}catch(ex){
							bitsMarkingCollection._dump("bitsMarkingCollection._createXMLDocument():"+ ex);
							return undefined;
						}
					}
					this._xmldoc = _createXMLDocument(xmlfile);

					if(this._xmldoc && bitsMarkingCollection._uncategorized.use){
						var elem = bitsContextMenu._contextMenuUncategorized;
						if(elem){
							elem.setAttribute("fid","0");
							elem.setAttribute("_style",bitsMarkingCollection._uncategorized.style);
							elem.setAttribute("dbtype",bitsMarkingCollection._uncategorized.dbtype);
						}
						bitsMarkingCollection.Database.init(bitsMarkingCollection._uncategorized.dbtype,bitsMarkingCollection._uncategorized.file);
					}
					if(this._xmldoc){
						var alldbunused = nsPreferences.getBoolPref("wiredmarker.startup.alldbunused", false);
						var elemDBs = this._xmldoc.getElementsByTagName("DATABASE");
						if(elemDBs && elemDBs.length>0){
							var check_init = false;
							var check_default = false;
							var check_contextmenu = false;
							var i,j;
							for(i=0;i<elemDBs.length;i++){
								var elemDB = elemDBs[i];
								var id = elemDB.getAttribute("id");
								if(!id) continue;

								if(!elemDB.hasAttribute("hidden")){
									hasHidden = true;
									elemDB.setAttribute("hidden","false");
								}

								var elemDBTYPE = elemDB.getElementsByTagName("DATABASE_DBTYPE")[0];
								var elemFILE = elemDB.getElementsByTagName("DATABASE_FILE")[0];
								if(!elemDBTYPE || !elemFILE) continue;
								if(elemDBTYPE.textContent == "" || elemFILE.textContent == "") continue;

								var db_default = (elemDB.getAttribute("db_default")=="true"?true:false);
								if(!aForced && !db_default && alldbunused) elemDB.setAttribute("disabled",true);
								var db_contextmenu = (elemDB.getAttribute("db_contextmenu")=="true"?true:false);

								check_default |= db_default;
								check_contextmenu |= db_contextmenu;

								var disabled = elemDB.getAttribute("disabled");
								if(disabled == "true"){
									bitsMarkingCollection.Database.done(elemDBTYPE.textContent);
									continue;
								}
								bitsMarkingCollection.Database.init(elemDBTYPE.textContent,bitsMarkingCollection.Common.convertURLToFile(elemFILE.textContent));

								check_init = true;
								try{
									var version = bitsMarkingCollection.Database.getVersion(elemDBTYPE.textContent);
									if(parseFloat(version?version:0)<parseFloat(bitsMarkingCollection.Database.version)){
										bitsMarkingCollection.Database.convert( elemDBTYPE.textContent );
										aForced = false;
										alldbunused = true;
									}
								}catch(ex){
									bitsMarkingCollection._dump("bitsMarkingCollection.dbinfo.init():"+ ex);
								}
							}
							if(!check_init || !check_default){
								for(i=0;i<elemDBs.length;i++){
									var elemDB = elemDBs[i];
									var id = elemDB.getAttribute("id");
									if(!id) continue;

									var elemDBTYPE = elemDB.getElementsByTagName("DATABASE_DBTYPE")[0];
									var elemFILE = elemDB.getElementsByTagName("DATABASE_FILE")[0];
									if(!elemDBTYPE || !elemFILE) continue;
									if(elemDBTYPE.textContent == "" || elemFILE.textContent == "") continue;
									elemDB.removeAttribute("disabled");
									if(!check_default) elemDB.setAttribute("db_default",true);
									if(!check_contextmenu) elemDB.setAttribute("db_contextmenu",true);
									if(check_init) break;
									bitsMarkingCollection.Database.init(elemDBTYPE.textContent,bitsMarkingCollection.Common.convertURLToFile(elemFILE.textContent));
									try{
										var version = bitsMarkingCollection.Database.getVersion(elemDBTYPE.textContent);
										if(parseFloat(version?version:0)<parseFloat(bitsMarkingCollection.Database.version)){
											bitsMarkingCollection.Database.convert( elemDBTYPE.textContent );
										}
									}catch(ex){
										bitsMarkingCollection._dump("bitsMarkingCollection.dbinfo.init():"+ ex);
									}
									aForced = false;
									alldbunused = true;
									break;
								}
							}
						}

						if(hasHidden || (!aForced && alldbunused)){
							var s = new XMLSerializer();
							var xml = s.serializeToString(this._xmldoc);
							bitsMarkingCollection.Common.writeFile(xmlfile, xml+"\n","UTF-8");
						}
					}
				}
			}
		},

		getAddonInfo : function(aDBType){
			if(aDBType == undefined) return undefined;
			if(this._xmldoc == undefined) this.init();;
			if(this._xmldoc == undefined) return undefined;
			var rtn = undefined;
			var elemDBs = this._xmldoc.getElementsByTagName("DATABASE");
			if(elemDBs && elemDBs.length>0){
				var i,j;
				for(i=0;i<elemDBs.length;i++){
					var elemDB = elemDBs[i];
					var id = elemDB.getAttribute("id");
					if(!id || id != aDBType) continue;
					for(j=0;j<elemDB.childNodes.length;j++){
						var elem = elemDB.childNodes[j];
						if(!elem.nodeName.match(/^ADDON_(.+)$/)) continue;
						if(rtn == undefined) rtn = {};
						var key = RegExp.$1.toLowerCase();
						rtn[key] = elem.textContent;
					}
				}
			}
			return rtn;
		},

		getAllDBInfo : function(){
			if(this._xmldoc == undefined) this.init();;
			if(this._xmldoc == undefined) return undefined;
			var rtn = undefined;
			var attr = undefined;
			var use_addon_dbtype = [];
			if(bitsScrapPartyAddonService && bitsScrapPartyAddonService.existsAddon()){
				var addon_info_arr = bitsScrapPartyAddonService.getAddonInfo();
				if(addon_info_arr && addon_info_arr.length > 0){
					var i;
					for(i=0;i<addon_info_arr.length;i++){
						if(addon_info_arr[i].dbtype == undefined) continue;
						use_addon_dbtype[addon_info_arr[i].dbtype.value] = addon_info_arr[i].id.value;
					}
				}
			}
			if(bitsMarkingCollection._uncategorized.use){
				if(rtn == undefined) rtn = [];
				if(attr == undefined) attr = {};
				attr.db_order = "0";
				attr.db_default = false;
				attr.db_contextmenu = false;
				attr.database_title = bitsMarkingCollection._uncategorized.title;
				attr.database_dbtype = bitsMarkingCollection._uncategorized.dbtype;
				attr.database_file = bitsMarkingCollection.Common.IO.newFileURI(bitsMarkingCollection._uncategorized.file).spec;
				rtn.push(attr);
				attr = undefined;
			}
			var elemDBs = this._xmldoc.getElementsByTagName("DATABASE");
			if(elemDBs && elemDBs.length>0){
				var i,j;
				for(i=0;i<elemDBs.length;i++){
					var elemDB = elemDBs[i];
					var id = elemDB.getAttribute("id");
					if(!id) continue;
					var disabled = elemDB.getAttribute("disabled");
					if(disabled == "true") continue;
					var db_order = parseInt(elemDB.getAttribute("db_order"));
					var db_default = (elemDB.getAttribute("db_default")=="true"?true:false);
					var db_contextmenu = (elemDB.getAttribute("db_contextmenu")=="true"?true:false);
					for(j=0;j<elemDB.childNodes.length;j++){
						var elem = elemDB.childNodes[j];
						if(elem.nodeType != elem.ELEMENT_NODE) continue;
						if(rtn == undefined) rtn = [];
						if(attr == undefined) attr = {};
						var key = elem.nodeName.toLowerCase();
						attr[key] = elem.textContent;
					}
					if(attr["addon_dbtype"] && use_addon_dbtype[attr["addon_dbtype"]] == undefined){
						attr = undefined;
					}
					if(rtn != undefined && attr != undefined){
						if(db_order != undefined) attr["db_order"] = db_order;
						if(db_default != undefined) attr["db_default"] = db_default;
						if(db_default != undefined) attr["db_contextmenu"] = db_contextmenu;
						rtn.push(attr);
						attr = undefined;
					}
				}
			}
			return rtn;
		},
	},

	Observer : {
		domain  : 'wiredmarker', //"objectmng.xxx"という名前の設定が変更された場合全てで処理を行う
		observe : function(aSubject, aTopic, aPrefstring) {
			try{
				if (aTopic == 'nsPref:changed') {
					switch (aPrefstring){
						case "wiredmarker.menu.position":
							bitsMarkingCollection.disMainMenu()
							break;
						case "wiredmarker.uncategorized.use":
							bitsMarkingCollection._uncategorized.use = nsPreferences.getBoolPref("wiredmarker.uncategorized.use", true);
							bitsMarkingCollection.dbinfo.init();
							break;
						case "wiredmarker.uncategorized.style":
							bitsMarkingCollection._uncategorized.style = nsPreferences.copyUnicharPref("wiredmarker.uncategorized.style", bitsMarkingCollection.STRING.getString("UN_FOLDER_STYLE"));
							break;
						case "wiredmarker.uncategorized.title":
							bitsMarkingCollection._uncategorized.title = nsPreferences.copyUnicharPref("wiredmarker.uncategorized.title", bitsMarkingCollection.STRING.getString("UN_FOLDER"));
							break;
						default:
							break;
					}
				}
			}catch(ex){
				window.top.bitsObjectMng.Common.alert("mcDatabaseObserver:"+ex);
			}
		},
	},

/////////////////////////////////////////////////////////////////////
	progressListener : {
		QueryInterface : function(aIID){
			if(aIID.equals(Components.interfaces.nsIWebProgressListener) || aIID.equals(Components.interfaces.nsISupportsWeakReference) || aIID.equals(Components.interfaces.nsISupports)) return this;
			throw Components.results.NS_NOINTERFACE;
		},
		onLocationChange : function(webProgress, aRequest, aURI){
			if(webProgress.isLoadingDocument) return;

			
                        bitsMarkingCollection.marking(webProgress.DOMWindow.document);
			bitsObjectMng.Common.pageshow(webProgress.DOMWindow.document);
                        
                        
		},
		onStateChange : function(webProgress, request, stateFlags, status){
			if(webProgress.isLoadingDocument) return;
                        
                        //TODO: not good palcement, realod occurs all the time!
                        annotationProxy.getAnnotations(webProgress.DOMWindow.document.URL);//Get all annotations on a specific url
                        
			bitsMarkingCollection.marking(webProgress.DOMWindow.document);
			bitsObjectMng.Common.pageshow(webProgress.DOMWindow.document);
		},
		onProgressChange : function(){},
		onStatusChange : function(){},
		onSecurityChange : function(){},
		onLinkIconAvailable : function(){}
	},

/////////////////////////////////////////////////////////////////////
	getProfDir : function(){
		var dir = this.Common.DIR.get("ProfD", Components.interfaces.nsIFile);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getTmpDir : function(){
		var dir = this.Common.DIR.get("TmpD", Components.interfaces.nsIFile);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getTempDir : function(){
		try{
			var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
			file.append(this.STRING.getString("APP_TITLE"));
			file.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0700);
			return file;
		}catch(ex){
			throw new Error("bitsMarkingCollection.getTempDir():"+ex);
		}
		return null;
	},

/////////////////////////////////////////////////////////////////////
	getExtInstDir : function(){
		var dir = null;
		var id = bitsMarkingCollection.STRING.getString("APP_ID");
		try{
			dir = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id);
		}catch(ex){
			dir = bitsMarkingCollection.getProfDir();
			if(dir){
				dir.append("extensions");
				dir.append(id);
			}
		}
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getExtensionDir : function(){
		var dir;
		try {
			var isDefault = nsPreferences.getBoolPref("wiredmarker.data.default");
			dir = nsPreferences.getLocalizedUnicharPref("wiredmarker.data.path", Components.interfaces.nsIPrefLocalizedString).data;
			dir = this.Common.convertPathToFile(dir);
		}catch(ex){
			isDefault = true;
		}
		if(isDefault){
			var profDir = this.getProfDir();
			if(profDir){
				var oldAppDir = profDir.clone();
				oldAppDir.append("ScrapParty");
				if(oldAppDir && oldAppDir.exists()) oldAppDir.moveTo(profDir, this.STRING.getString("APP_TITLE"));
			}
			if(profDir){
				dir = profDir.clone();
				if(dir) dir.append(this.STRING.getString("APP_TITLE"));
			}
		}
		if(dir && !dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getContentDir : function(aID, aSuppressCreate){
		var dir = this.getExtensionDir().clone();
		dir.append("data");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	disMainMenu : function(){
		var disp = nsPreferences.getBoolPref("wiredmarker.menu.topmenu", true);
		var position = nsPreferences.copyUnicharPref("wiredmarker.menu.position", null);
		if(position == null){
			position = this._app_version<4?"topmenu":"appmenu";
			var isXp = false;
			var res = window.navigator.oscpu.match(/Windows NT (.+)/);
			if(res && res[1]<6) isXp = true;
			if(this._app_version>=4 && isXp) position = "topmenu";
			setTimeout(function(){nsPreferences.setUnicharPref("wiredmarker.menu.position", position);},0);
			return;
		}
		if(position == "appmenu" &&
			Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS != "WINNT"){
			position = "topmenu";
			setTimeout(function(){nsPreferences.setUnicharPref("wiredmarker.menu.position", position);},0);
			return;
		}
		var menu_AppBits = window.top.document.getElementById("bitsExtensionsAppMenu");
		var menu_MainBits = window.top.document.getElementById("bitsExtensionsMainMenu");
		var menu_ToolsBits = window.top.document.getElementById("bitsExtensionsToolsMenu");
		var menu_BookmarksBits = window.top.document.getElementById("bitsExtensionsBookmarksMenu");
		var menuseparator_BookmarksBits = window.top.document.getElementById("bitsExtensionsBookmarksMenuseparator");
		if(!menu_MainBits || !menu_ToolsBits || !menu_BookmarksBits) return;

		var menu_child;
		if(position != "appmenu" && menu_AppBits && menu_AppBits.hasChildNodes()){
			menu_child = menu_AppBits.firstChild.cloneNode(true);
		}else if(position != "topmenu" && menu_MainBits.hasChildNodes()){
			menu_child = menu_MainBits.firstChild.cloneNode(true);
		}else if(position != "tools" && menu_ToolsBits.hasChildNodes()){
			menu_child = menu_ToolsBits.firstChild.cloneNode(true);
		}else if(position != "bookmarks" && menu_BookmarksBits.hasChildNodes()){
			menu_child = menu_BookmarksBits.firstChild.cloneNode(true);
		}

		if(menu_AppBits) menu_AppBits.setAttribute("hidden",true);
		menu_MainBits.setAttribute("hidden",true);
		menu_ToolsBits.setAttribute("hidden",true);
		menu_BookmarksBits.setAttribute("hidden",true);
		if(menuseparator_BookmarksBits) menuseparator_BookmarksBits.setAttribute("hidden","true");

		switch(position){
			case "bookmarks":
				if(menu_child) menu_BookmarksBits.appendChild(menu_child);
				menu_BookmarksBits.removeAttribute("hidden");
				if(menuseparator_BookmarksBits) menuseparator_BookmarksBits.removeAttribute("hidden");
				break;
			case "tools":
				if(menu_child) menu_ToolsBits.appendChild(menu_child);
				menu_ToolsBits.removeAttribute("hidden");
				break;
			case "appmenu":
				if(menu_AppBits){
					if(menu_child) menu_AppBits.appendChild(menu_child);
					menu_AppBits.removeAttribute("hidden");
				}
				break;
			default:
				if(menu_child) menu_MainBits.appendChild(menu_child);
				menu_MainBits.removeAttribute("hidden");
				break;
		}

		if(!menu_child) return;

		if(position != "appmenu" && menu_AppBits && menu_AppBits.hasChildNodes()){
			while(menu_AppBits.hasChildNodes()){
				menu_AppBits.removeChild(menu_AppBits.lastChild);
			}
		}
		if(position != "topmenu" && menu_MainBits.hasChildNodes()){
			while(menu_MainBits.hasChildNodes()){
				menu_MainBits.removeChild(menu_MainBits.lastChild);
			}
		}
		if(position != "tools" && menu_ToolsBits.hasChildNodes()){
			while(menu_ToolsBits.hasChildNodes()){
				menu_ToolsBits.removeChild(menu_ToolsBits.lastChild);
			}
		}
		if(position != "bookmarks" && menu_BookmarksBits.hasChildNodes()){
			while(menu_BookmarksBits.hasChildNodes()){
				menu_BookmarksBits.removeChild(menu_BookmarksBits.lastChild);
			}
		}

	},

/////////////////////////////////////////////////////////////////////
	dispHP : function(addon){
		var self = bitsMarkingCollection;
		self._version = addon.version;
		//最初のインストール後にホームページを開く
		var version = nsPreferences.copyUnicharPref("wiredmarker.version");
		if(version == null || version != self._version){
			if(parseFloat(version) <= parseFloat("3.1.09020400")){
				var textplain_display = nsPreferences.copyUnicharPref("wiredmarker.textplain.display","usually");
				if(textplain_display != "usually") nsPreferences.setUnicharPref("wiredmarker.textplain.display", "usually");
			}
			// self.Common.loadURL(self._homepage+"?version="+encodeURIComponent(self._version)+"&locale="+encodeURIComponent(self.DEF_STRING.getString("general.useragent.locale")),true);
                        self.Common.loadURL(self._homepage,true);
			nsPreferences.setUnicharPref("wiredmarker.version", self._version);
		}
	},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(bitsMarkingCollection._init) return;
		try{
			if(!bitsObjectMng){
				setTimeout(function(){bitsMarkingCollection.init(aEvent)},1000);
				return;
			}
		}catch(ex){
			setTimeout(function(){bitsMarkingCollection.init(aEvent)},1000);
			return;
		}
		try{
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			this._app_version = parseInt(info.version);
		}catch(e){}
		try{
			/* ver2.0 と ver3.0 ではブックマークメニューのIDが違う為、動的にメニューを生成 */
			var insertafter = null;
			var menuelem = this.BOOKMARKS_MENU_2;
			if(menuelem){
				var elem = document.getElementById("bookmarkAllCmd");
				if(elem){
					if(elem.nextSibling && elem.nextSibling.nextSibling) insertafter = elem.nextSibling.nextSibling;
				}else{
					menuelem = undefined;
				}
			}else{
				menuelem = this.BOOKMARKS_MENU_3;
				var elem = document.getElementById("organizeBookmarksSeparator");
				if(elem){
					insertafter = elem;
				}else{
					menuelem = undefined;
				}
			}
			if(menuelem && menuelem.hasChildNodes()){
				var childnode = menuelem.firstChild;
				while(childnode){
					if(childnode.nodeName.toLowerCase() == "menupopup") break;
					childnode = menuelem.nextSibling;
				}
				if(childnode){
					var doc = menuelem.ownerDocument;
					var menu = doc.createElement("menu");
					var menuseparator = doc.createElement("menuseparator");
					if(menu && menuseparator){
						menu.setAttribute("id","bitsExtensionsBookmarksMenu");
						/* menu.setAttribute("class","menu-iconic");
						menu.setAttribute("image","chrome://markingcollection/skin/icon_16.gif"); */
						menu.setAttribute("hidden","true");
						menu.setAttribute("label",this.STRING.getString("APP_DISP_TITLE"));
						menu.setAttribute("accesskey","M");
						menuseparator.setAttribute("id","bitsExtensionsBookmarksMenuseparator");
						menuseparator.setAttribute("hidden","true");
						if(insertafter && insertafter.nextSibling){
							var nextSibling = insertafter.nextSibling;
							childnode.insertBefore(menu,nextSibling);
							childnode.insertBefore(menuseparator,nextSibling);
						}else{
							childnode.appendChild(menu);
							childnode.appendChild(menuseparator);
						}
					}
				}
			}
		}catch(ex){
			this.Common.alert("bitsMarkingCollection.init():"+ex);
		}
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) this.showConsole();
		try{
			var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
			this.dispHP(em.getItemForID(this.STRING.getString("APP_ID")));
		}catch(ex){
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.getAddonByID(this.STRING.getString("APP_ID"), bitsMarkingCollection.dispHP);
		}

		//古い設定を削除
		var i;
		var userPrefs = [
			"scrapparty.menu.topmenu",
			"objectmng.last_update",
			"markingcollection.viewmode",
			"markingcollection.rootfolder",
			"markingcollection.rootfolder_dbtype",
			"markingcollection.folderautoopen",
			"markingcollection.filter.folder",
			"markingcollection.folderstyleindex",
			"markingcollection.filter.folder",
			"markingcollection.filter.keyword",
			"markingcollection.propertyview",
			"markingcollection.multidocument",
			"scrappartymerge.merge",
			"scrappartymerge.conditionMerge",
			"scrappartymerge.confirmMerge",
			"scrapparty.startup.alldbunused",
			"wiredmarker.autocache.manually.exec",
			"wiredmarker.autocache.manually.confirm",
		];
		for(i=8;i>0;i--){
			userPrefs.push("markingcollection.marker.style." + i);
		}
		for(i=0;i<userPrefs.length;i++){
			try{
				this.Common.PREF.clearUserPref(userPrefs[i]);
			}catch(ex){}
		}
		this._uncategorized.use = nsPreferences.getBoolPref("wiredmarker.uncategorized.use", true);
		this._uncategorized.style = nsPreferences.copyUnicharPref("wiredmarker.uncategorized.style", this.STRING.getString("UN_FOLDER_STYLE"));
		this._uncategorized.title = nsPreferences.copyUnicharPref("wiredmarker.uncategorized.title", this.STRING.getString("UN_FOLDER"));
		this._uncategorized.file = this.getExtensionDir().clone();
		this._uncategorized.file.append(this._uncategorized.dbtype+".sqlite");
		try{
			//メニュー表示位置の処理
			this.disMainMenu();
			try{
				bitsObjectMng.getBrowser().addEventListener("pageshow", bitsMarkingCollection.load,   false);
				bitsObjectMng.getBrowser().addEventListener("pagehide", bitsMarkingCollection.unload, false);
				bitsObjectMng.getBrowser().addEventListener("select",   bitsMarkingCollection.select, false);
			}catch(ex2){
				this.Common.alert("bitsMarkingCollection.init(4):"+ex2);
			}
			if(this._app_version<4) bitsObjectMng.getBrowser().addProgressListener(bitsMarkingCollection.progressListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
			else bitsObjectMng.getBrowser().addProgressListener(bitsMarkingCollection.progressListener);
			try{
				bitsMarkingCollection.sharedfolder.init();
			}catch(ex2){
				this.Common.alert("bitsMarkingCollection.init(5):"+ex2);
			}
			bitsHTML2XHTMLService.init();
			bitsMarkingCollection.dbinfo.init();
			bitsMarker.init();
			bitsContextMenu.init();
			bitsMenuTree.init();
			bitsTreeListService.init();
			bitsTreeExportService.init();
			bitsSubstitutionTree.init();
			bitsTreeProjectService.init();
			bitsAutocacheService.init();
			bitsShortcutService.init();
			bitsMetaCapture.init();
			bitsPubmedCentralService.init();
			bitsScrapPartyAddonService.init(aEvent);
			// ダミーHYPER-ANCHOR処理
			try{
				if(!bitsHyperAnchor || bitsHyperAnchor.clickLinkIcon == undefined) bitsHyperAnchorDummy.init(aEvent);
			}catch(ex2){
				bitsHyperAnchorDummy.init(aEvent);
			}
			bitsMarkingCollection._init = true;
			bitsMarkingCollection.Common.addPrefListener(bitsMarkingCollection.Observer);
                        
                        annotationProxy.getAnnotations('');//Get all annotations
		}catch(ex){
			this.Common.alert("bitsMarkingCollection.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		if(bitsMarkingCollection._init){
			bitsObjectMng.getBrowser().removeProgressListener(bitsMarkingCollection.progressListener);
			bitsObjectMng.getBrowser().removeEventListener("pageshow", bitsMarkingCollection.load,   false);
			bitsObjectMng.getBrowser().removeEventListener("pagehide", bitsMarkingCollection.unload, false);
			bitsObjectMng.getBrowser().removeEventListener("select",   bitsMarkingCollection.select, false);
			bitsMarkingCollection.Common.removePrefListener(bitsMarkingCollection.Observer);
			bitsSubstitutionTree.done();
			bitsTreeExportService.done();
			bitsTreeListService.done();
			bitsMenuTree.done();
			bitsContextMenu.done();
			bitsAutocacheService.done();
			bitsShortcutService.done();
			bitsMetaCapture.done();
			bitsPubmedCentralService.done();
			bitsScrapPartyAddonService.done(aEvent);
			try{
				if(!bitsHyperAnchor || bitsHyperAnchor.clickLinkIcon == undefined) bitsHyperAnchorDummy.done(aEvent);
			}catch(ex2){
				bitsHyperAnchorDummy.done(aEvent);
			}
		}
		for(var i=0;i<this._removefile.length;i++){
			if(this._removefile[i].exists()) this._removefile[i].remove(true);
		}
	},

/////////////////////////////////////////////////////////////////////
	load : function(event){
		var aEvent = event;
		bitsScrapPartyAddonService.eventListener(aEvent,0);
		var rtn = bitsMarkingCollection.marking(aEvent.target);
		bitsScrapPartyAddonService.eventListener(aEvent,1);
	},

/////////////////////////////////////////////////////////////////////
	marking : function(aDoc, aContentURLString){
		var url;
                
		if(aContentURLString){
			url = aContentURLString;
		}else{
			url = this.Common.getURLStringFromDocument(aDoc);
		}
                
		if(url.indexOf("chrome:") >= 0 || url.indexOf("about:") >= 0) return;
		if(bitsObjectMng.getBrowser().contentDocument.location == aDoc.location) bitsMarkingCollection._location = aDoc.location;
//this._dump("marking():url=["+url+"]");
                //alert('marking: '+url+' aDoc '+aDoc.location);
		var rtnObj = bitsMarkingCollection.Database.getAllObjectFormContentURL(url);
		if(rtnObj){
			if(this._markingtimer) clearTimeout(this._markingtimer);
			this._markingtimer = null;
			this.endProgessmeter();
			if(rtnObj.length>0) rtnObj.sort(function(a,b){return parseInt(a.oid)-parseInt(b.oid);});
			if(rtnObj.length>=100){
				this.initProgressmeter();
				var self = this;
				this._markingtimer = setTimeout(function(){ self.marking_proc(aDoc,rtnObj,0,aContentURLString); },0);
			}else{
				var cnt;
this._dump("marking():rtnObj=["+rtnObj.length+"]");
				for(cnt=0;cnt<rtnObj.length;cnt++){
					var rObj = rtnObj[cnt];
					if(rObj.oid_type.match(/^image\/(.+)$/)) continue;
					if(!aDoc.defaultView) return;
					var style;
					if(rObj.pfid == "0" && rObj.dbtype == bitsMarkingCollection._uncategorized.dbtype){
						style = bitsMarkingCollection._uncategorized.style;
					}else{
						style = rObj.fid_style;
					}
					var rtnContent = bitsMarker.xPathMarker(
						aDoc,
						{
							start   : rObj.bgn_dom,
							end     : rObj.end_dom,
							context : rObj.oid_txt,
							con_url : (aContentURLString ? this.Common.getURLStringFromDocument(aDoc) : rObj.con_url)
						},
						{
							id     : rObj.oid,
							dbtype : rObj.dbtype,
							pfid   : rObj.pfid,
							style  : style
						}
					);
					if(rtnContent){
						for(var key in rtnContent){
							this._dump("marking():rtnContent["+key+"]=["+rtnContent[key]+"]");
						}
					}else{
this._dump("marking():rtnContent=["+rtnContent+"]");
					}
				}
			}
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
	marking_proc : function(aDoc,aArr,aIndex,aContentURLString){
		if(aIndex>=aArr.length || !this._markingtimer){
			this.endProgessmeter();
			return;
		}
		var endNum = aIndex+20;
		for(;aIndex<aArr.length && aIndex<endNum;aIndex++){
			var rObj = aArr[aIndex];
			if(rObj.oid_type.match(/^image\/(.+)$/)) continue;
			if(!aDoc.defaultView) return;
			var style;
			if(rObj.pfid == "0" && rObj.dbtype == bitsMarkingCollection._uncategorized.dbtype){
				style = bitsMarkingCollection._uncategorized.style;
			}else{
				style = rObj.fid_style;
			}
			var rtnContent = bitsMarker.xPathMarker(
					aDoc,
					{
						start   : rObj.bgn_dom,
						end     : rObj.end_dom,
						context : rObj.oid_txt,
						con_url : (aContentURLString ? this.Common.getURLStringFromDocument(aDoc) : rObj.con_url)
					},
					{
						id     : rObj.oid,
						dbtype : rObj.dbtype,
						pfid   : rObj.pfid,
						style  : style
					}
				);
		}
		var self = this;
		this._markingtimer = setTimeout(function(){ self.marking_proc(aDoc,aArr,aIndex,aContentURLString); },0);
		this.execProgressmeter(parseInt((aIndex/aArr.length)*100));
	},

/////////////////////////////////////////////////////////////////////
	unload : function(event){
		bitsScrapPartyAddonService.eventListener(event,1);
	},

/////////////////////////////////////////////////////////////////////
	select : function(event){
		bitsScrapPartyAddonService.eventListener(event,1);
	},

/////////////////////////////////////////////////////////////////////
	openPrefWindow : function(){
		var self = this;
		setTimeout(function(){
			var lastModifiedTime = 0;
			var xmlfile = self.Common.getExtensionDir().clone();
			xmlfile.append("db.xml");
			if(xmlfile.exists()) lastModifiedTime = xmlfile.lastModifiedTime;
			var uncategorized_use = nsPreferences.getBoolPref("wiredmarker.uncategorized.use", true);
			var result = {};
			window.openDialog(
				"chrome://markingcollection/content/settingDialog.xul", "AllMarker:Setting",
				"chrome,titlebar,toolbar,centerscreen,modal",result
			);
			if(result.reboot){
				if(self.Common.confirm(self.STRING.getString("CONFIRM_SETTING_CHANGE_RESTART_APP"))){
					self.reboot();
					return;
				}
			}
			self.dbinfo.init(true);
			bitsContextMenu.rebuildCSS();
			//ファイルが更新されているので表示内容を更新する。
			if((xmlfile.exists() && lastModifiedTime != xmlfile.lastModifiedTime) || (uncategorized_use != nsPreferences.getBoolPref("wiredmarker.uncategorized.use", true))){
				var contentWindow = null;
				var mcTreeViewModeService = null;
				var bitsTreeDate = null;
				if(self._contentWindow) contentWindow = self._contentWindow;
				if(contentWindow && contentWindow.mcTreeViewModeService) mcTreeViewModeService = contentWindow.mcTreeViewModeService;
				if(contentWindow && contentWindow.bitsTreeDate) bitsTreeDate = contentWindow.bitsTreeDate;
				if(mcTreeViewModeService) mcTreeViewModeService.rebuild();
				if(bitsTreeDate) bitsTreeDate.refresh();
			}
			xmlfile = undefined;
		},100); //onpopuphidingイベントが発生するまで100ms必要？
	},

/////////////////////////////////////////////////////////////////////
	reboot : function(){
		var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"].createInstance(Components.interfaces.nsISupportsPRBool);
		os.notifyObservers(cancelQuit, "quit-application-requested", "restart");
		if (cancelQuit.data) return;
		var nsIAppStartup = Components.interfaces.nsIAppStartup;
		Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(nsIAppStartup.eRestart | nsIAppStartup.eAttemptQuit);
	},

/////////////////////////////////////////////////////////////////////
	reOrder : function(aParRes){
		try{
			var dbtype;
			var pfid_order = 1;
			var pfid = this.DataSource.getProperty(aParRes,"id");
			var listContRes = this.DataSource.seqResources(aParRes);
			var i;
			for(i=0;i<listContRes.length;i++){
				var dbitem = {};
				dbitem.pfid = pfid;
				dbitem.pfid_order = pfid_order;
				if(this.DataSource.isContainer(listContRes[i])){
					dbitem.fid = this.DataSource.getProperty(listContRes[i],"id");
					dbtype = this.DataSource.getProperty(listContRes[i],"dbtype");
					var changed = this.Database.updateFolder(dbitem,dbtype);
				}else{
					dbitem.oid = this.DataSource.getProperty(listContRes[i],"id");
					dbtype = this.DataSource.getProperty(listContRes[i],"dbtype");
					var changed = this.Database.updateObject(dbitem,dbtype);
				}
				pfid_order++;
			}
		}catch(ex){
		}
	},

/////////////////////////////////////////////////////////////////////
	addPDFText : function(aParName, aIdx, aRow, aXferString, aRebuild, aIsCacheConfirm){
		var MIMEType = "application/pdf";
		var PrimaryExtension = "pdf";
		if(this.gBrowser.contentDocument.contentType != MIMEType) return undefined;
		try{
			if(aRebuild == undefined) aRebuild = true;
			if(aIsCacheConfirm == undefined) aIsCacheConfirm = true;
			var rtn = false;
			var url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			var url_title = aXferString;
			var comment_url = url;
			var doc_url = url;
			var con_url = url;
			if(aIsCacheConfirm && !bitsAutocacheService.isMarking(doc_url)) return true;
			var stXPath = null;
			var enXPath = null;
			var hyperAnchor = null;
			var rtnNewRes = [];
			var parentID  = 0;
			var style = "";
			var dbtype = "";
			if(typeof aParName == "string"){
				var aRes = this.Common.RDF.GetResource(aParName);
				style = this.DataSource.getProperty(aRes,"style");
				dbtype = this.DataSource.getProperty(aRes,"dbtype");
				if(aParName != this.DataSource.ABOUT_ROOT) parentID = this.DataSource.getProperty(aRes,"id");
			}else{
				parentID = aParName.fid;
				style = aParName.fid_style;
				dbtype = aParName.dbtype;
			}
			var pfid_order = this.Database.getMaxOrderFormPID(parentID);
			url_title = url_title.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
			var rObj = this.Database.newObject(undefined,dbtype);
			if(rObj){
				rObj.pfid = parentID;
				rObj.doc_url = bitsAutocacheService.convertCacheURLToOriginalURL(doc_url);
				rObj.doc_title = this.gBrowser.contentDocument.title?this.gBrowser.contentDocument.title:rObj.doc_url;
				if(bitsAutocacheService.isCacheURL(doc_url)){
					var info = bitsAutocacheService.getSaveCacheInfo(doc_url);
					if(info && info.TITLE) rObj.doc_title = info.TITLE;
				}
				rObj.con_url = bitsAutocacheService.convertCacheURLToOriginalURL(con_url);
				if(stXPath && enXPath){
					rObj.bgn_dom = stXPath.xpath + "("+stXPath.offset+")" + "("+stXPath.type+")";
					rObj.end_dom = enXPath.xpath + "("+enXPath.offset+")" + "("+enXPath.type+")";
				}
				rObj.oid_title = url_title;
				if(rObj.oid_title == "") rObj.oid_title = decodeURIComponent(this.Common.getFileName(url));
				if(rObj.oid_title == "") rObj.oid_title = decodeURIComponent(url);
				rObj.oid_type = MIMEType;
				rObj.oid_property = "";

				var parser = new DOMParser();
				var xmldoc = parser.parseFromString("<PROPERTY/>","text/xml");
				if(xmldoc){
					if(xmldoc.documentElement){
						var icon = "";
						try{
							var pext = this.Common.MIME.getPrimaryExtension(MIMEType,PrimaryExtension)
							icon = "d."+pext;
						}catch(e){
							icon = "d.pdf";
						}
						var xmlnode = xmldoc.createElement("ICON");
						if(xmlnode){
							xmlnode.appendChild(xmldoc.createTextNode("moz-icon://"+icon+"?size=16"));
							xmldoc.documentElement.appendChild(xmlnode);
						}
						var s = new XMLSerializer();
						rObj.oid_property = s.serializeToString(xmldoc);
						s = undefined;
					}
				}
				parser = undefined;
				xmldoc = undefined;

				rObj.oid_mode = "0";
				rObj.oid_title = this.Common.exceptCode(aXferString.replace(/[\r\n\t]+/mg," ").replace(/\s{2,}/mg," "));
				rObj.oid_txt = this.Common.exceptCode(aXferString.replace(/\s+$/mg,"").replace(/^\s+/mg,""));
				rObj.oid_date = bitsAutocacheService.getURLTimeStampFormatDate(doc_url);
				rObj.pfid_order = ++pfid_order;
			}

			if(rObj){
				var rtnObj = bitsPubmedCentralService.getPubmedInfoSync(rObj);
				rObj = this.setInitMarkerData(rtnObj?rtnObj:rObj,false);
				var result = {
					con_url   : rObj.con_url,
					title     : rObj.oid_title,
					property  : rObj.oid_property,
					doc_title : rObj.doc_title
				};
				window.openDialog("chrome://markingcollection/content/confirmAddTextDialog.xul", "", "chrome,centerscreen,modal", result);
				if(!result.accept) return true;
				rObj.oid_title = result.title;
				rObj.doc_title = result.doc_title;
				rObj.oid_property = result.property;
			}
			if(rObj){
				var rtn = this.Database.addObject(rObj,dbtype);
				if(rtn){
					rObj = this.Database.getObject({oid:rObj.oid,pfid:rObj.pfid},dbtype)[0];
				}else{
					rObj = undefined;
				}
			}
			if(rObj){
				bitsAutocacheService.createCache(rObj.doc_url,undefined,aRebuild);
				var newDCitem = this.Database.makeObjectToItem(rObj);
				if(url.indexOf("file://") == 0){
					newDCitem.title = rObj.oid_title;
				}else{
					newDCitem.icon = this.Database.getFavicon(rObj.doc_url,dbtype);
				}
				var rtnContent = null;
				if(rtnContent && rtnContent.length && rtnContent.length>0) newDCitem.source = rtnContent[0].id;
				var newRes = null;
 				if(typeof aParName != "string"){
					var f_pfid = undefined;
					var rtnFolder = this.Database.getFolder({fid:parentID},dbtype);
					if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
					rtnFolder = undefined;
					aParName = bitsObjectMng.DataSource.getID2About(parentID,f_pfid,dbtype);
				}
				var contentWindow = null;
				var mcTreeHandler = null;
				var bitsItemView = null;
				var bitsTreeDate = null;
				if(this._contentWindow) contentWindow = this._contentWindow;
				if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
				if(contentWindow && contentWindow.bitsItemView) bitsItemView = contentWindow.bitsItemView;
				if(contentWindow && contentWindow.bitsTreeDate) bitsTreeDate = contentWindow.bitsTreeDate;
				if(!bitsItemView || !bitsItemView.isChecked){
					if(rtn) newRes = this.DataSource.addItem(newDCitem, aParName, aIdx, dbtype);
					if(newRes){
						this.DataSource.flush();
						//追加したObjectにフォーカスを移す
						var mcPropertyView = null;
						if(contentWindow && contentWindow.mcPropertyView) mcPropertyView = contentWindow.mcPropertyView;
						if(mcTreeHandler){
							var folderautoopen = nsPreferences.getBoolPref("wiredmarker.folderautoopen", true);
							if(!folderautoopen){
								var parentRes = this.DataSource.findParentResource(newRes);
								var parentIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(parentRes);
								if(parentIdx>=0) folderautoopen = mcTreeHandler.TREE.view.isContainerOpen(parentIdx);
							}
							if(folderautoopen){
								var resArr = [];
								var parentRes = newRes;
								do{
									parentRes = this.DataSource.findParentResource(parentRes);
									if(parentRes) resArr.push(parentRes);
								}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
								var i;
								for(i=resArr.length-1;i>=0;i--){
									var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
									if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
								}
								var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
								if(selectIdx>=0){
									mcTreeHandler.TREE.currentIndex = selectIdx;
									if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
									mcTreeHandler.TREE.focus();
									mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
									if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
								}
							}
						}
						rtnNewRes.push(newRes);
					}
				}else if(bitsItemView && bitsItemView.isChecked){
					if(mcTreeHandler){
						var resArr = [];
						var parentRes = this.Common.RDF.GetResource(aParName);
						do{
							parentRes = this.DataSource.findParentResource(parentRes);
							if(parentRes) resArr.push(parentRes);
						}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
						var i;
						for(i=resArr.length-1;i>=0;i--){
							var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
							if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
						}
						var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(this.Common.RDF.GetResource(aParName));
						if(selectIdx>=0){
							mcTreeHandler.TREE.currentIndex = selectIdx;
							if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
							mcTreeHandler.TREE.focus();
							mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
							if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
						}
					}
					try{
						if(aRebuild && bitsItemView){
							if(bitsTreeDate && bitsTreeDate.isChecked){
								var param = {dbtype:dbtype};
								for(var key in rObj){
									param[key] = rObj[key];
								}
								bitsTreeDate.onSelectTab(param);
							}else{
								var aRes = this.Common.RDF.GetResource(aParName);
								var viewmode = this._contentWindow.mcTreeViewModeService.viewmode;
								var fid = this.DataSource.getProperty(aRes, "id");
								var dbtype = this.DataSource.getProperty(aRes, "dbtype");
								var oid = rObj.oid;
								bitsItemView.onTreeClick({viewmode:viewmode,fid:fid,dbtype:dbtype,res:aRes});
								bitsItemView.setSelection(oid,dbtype);
								setTimeout(function(){ bitsItemView.setSelection(oid,dbtype); },500);
							}
						}
					}catch(ex){ bitsMarkingCollection._dump("bitsMarkingCollection.addURLText():"+ex); }
				}
				var param = {
					id      : rObj.oid,
					dbtype  : dbtype,
					rebuild : aRebuild,
				};
				if(bitsItemView && !bitsItemView.isChecked){
					if(newRes) param.res = newRes;
				}else if(bitsItemView){
					param.res = this.Common.RDF.GetResource(aParName);
				}
				if(url.indexOf("http://") == 0 || url.indexOf("https://") == 0 || url.indexOf("ftp://") == 0){
					this.getContentTypeFromURL(this.gBrowser.contentDocument, url, param);
				}else if(url.indexOf("file://") == 0){
					this._oID = rObj.oid;
					this._dbtype = dbtype;
					this.BROWSER.addEventListener("pageshow", bitsMarkingCollection.loadFile, true);
					this.BROWSER.loadURI(url);
				}
				rObj = undefined;
				newDCitem = undefined;
				rtn = true;
			}
		}catch(ex){
			bitsMarkingCollection._dump("bitsMarkingCollection.addPDFText():"+ex);
		}
		if(rtn)
			return rtn;
		else
			return undefined;
	},

/////////////////////////////////////////////////////////////////////
	addURLText : function(aParName, aIdx, aRow, aXferString, aOriginalTarget, aRebuild, aIsCacheConfirm){
		try{
			if(aRebuild == undefined) aRebuild = true;
			if(aIsCacheConfirm == undefined) aIsCacheConfirm = true;
			var rtn = false;
			var url = aXferString.split("\n")[0];
			var url_title = aXferString.split("\n")[1];
			if(!url_title || url == url_title) url_title = "";
			var comment_url = url;
			var doc_url = url;
			var con_url = url;
			var doc_url_hash = "";
			if(aOriginalTarget){
				doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
				doc_url_hash = this.Common.getURLHashStringFromDocument(this.gBrowser.contentDocument);
				if(aIsCacheConfirm && !bitsAutocacheService.isMarking(doc_url)) return undefined;
			}
			var stXPath = null;
			var enXPath = null;
			var hyperAnchor = null;
			var rtnNewRes = [];
			var parentID  = 0;
			var style = "";
			var dbtype = "";
			if(typeof aParName == "string"){
				var aRes = this.Common.RDF.GetResource(aParName);
				style = this.DataSource.getProperty(aRes,"style");
				dbtype = this.DataSource.getProperty(aRes,"dbtype");
				if(aParName != this.DataSource.ABOUT_ROOT) parentID = this.DataSource.getProperty(aRes,"id");
			}else{
				parentID = aParName.fid;
				style = aParName.fid_style;
				dbtype = aParName.dbtype;
			}
			var pfid_order = this.Database.getMaxOrderFormPID(parentID);
			if(aOriginalTarget && (aOriginalTarget.nodeName == "IMG" || aOriginalTarget.nodeName == "A")){
				if(aOriginalTarget.nodeName == "IMG"){
					url = aOriginalTarget.src;
					if(aOriginalTarget.alt) url_title = aOriginalTarget.alt;
				}
				var doc = aOriginalTarget.ownerDocument;
				var range = doc.createRange();
				if(aOriginalTarget.nodeName == "IMG"){
					range.selectNodeContents(aOriginalTarget);
				}else if(aOriginalTarget.nodeName == "A"){
					range.selectNodeContents(aOriginalTarget);
				}
				stXPath = this.XPath.getOffsetFromParentNode(range.startContainer,range.startOffset);
				enXPath = this.XPath.getOffsetFromParentNode(range.endContainer,range.endOffset);
				con_url = this.Common.getURLStringFromDocument(doc);
				var attribute = "";
				if (aOriginalTarget.nodeName == "IMG") {
					attribute = aOriginalTarget.getAttribute("src");
				}else if (aOriginalTarget.nodeName == "A") {
					attribute = aOriginalTarget.getAttribute("href");
				}
				try{
					hyperAnchor = bitsHyperAnchor._getAnchorURL({node:range.startContainer,offset:range.startOffset,style:style,prefix:"b",contents:attribute},{node:range.endContainer,offset:range.endOffset,prefix:"e",contents:attribute});
				}catch(ex3){
					try{
						hyperAnchor = bitsHyperAnchorDummy._getAnchorURL({node:range.startContainer,offset:range.startOffset,style:style,prefix:"b",contents:attribute},{node:range.endContainer,offset:range.endOffset,prefix:"e",contents:attribute});
					}catch(ex3){
						hyperAnchor = null;
					}
				}
				hyperAnchor = bitsAutocacheService.convertCacheURLToOriginalURL(hyperAnchor);
			}
			url_title = url_title.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
			var rObj = this.Database.newObject(undefined,dbtype);
			if(rObj){
				rObj.pfid = parentID;
				rObj.doc_url = bitsAutocacheService.convertCacheURLToOriginalURL(doc_url);
				rObj.doc_title = this.gBrowser.contentDocument.title?this.gBrowser.contentDocument.title:rObj.doc_url;
				if(bitsAutocacheService.isCacheURL(doc_url)){
					var info = bitsAutocacheService.getSaveCacheInfo(doc_url);
					if(info && info.TITLE) rObj.doc_title = info.TITLE;
				}
				rObj.con_url = bitsAutocacheService.convertCacheURLToOriginalURL(con_url);
				if(stXPath && enXPath){
					rObj.bgn_dom = stXPath.xpath + "("+stXPath.offset+")" + "("+stXPath.type+")";
					rObj.end_dom = enXPath.xpath + "("+enXPath.offset+")" + "("+enXPath.type+")";
				}
				rObj.oid_title = url_title;
				if(rObj.oid_title == "") rObj.oid_title = decodeURIComponent(this.Common.getFileName(url));
				if(rObj.oid_title == "") rObj.oid_title = decodeURIComponent(url);
				rObj.oid_property = "";
				var frame_name;
				var frame_id;
				if(doc_url != con_url){
					var win = this.gBrowser.contentWindow;
					if(win.frames != null){
						var i;
						for(i=0;i<win.frames.length;i++){
							if(bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(win.frames[i].document)) != con_url) continue;
							frame_name = win.frames[i].name;
							frame_id = win.frames[i].id;
							break;
						}
					}
				}
				if(url != comment_url || hyperAnchor || frame_name || frame_id || doc_url_hash){
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString("<PROPERTY></PROPERTY>","text/xml");
					if(xmldoc){
						if(xmldoc.documentElement){
							if(url != comment_url){
								var xmlnode = xmldoc.createElement("LINK");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(comment_url));
									xmldoc.documentElement.appendChild(xmlnode);
								}
							}
							if(frame_name){
								var xmlnode = xmldoc.createElement("FRAME_NAME");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(frame_name));
									xmldoc.documentElement.appendChild(xmlnode);
								}
							}
							if(frame_id){
								var xmlnode = xmldoc.createElement("FRAME_ID");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(frame_id));
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
							if(doc_url_hash){
								var xmlnode = xmldoc.createElement("LOCATION_HASH");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(doc_url_hash));
									xmldoc.documentElement.appendChild(xmlnode);
								}
							}
							var s = new XMLSerializer();
							rObj.oid_property = s.serializeToString(xmldoc);
							s = undefined;
						}
					}
					parser = undefined;
					xmldoc = undefined;
				}
				rObj.oid_mode = "0";
				try{ rObj.oid_type = this.Common.MIME.getTypeFromURI(this.Common.convertURLToObject(url)); }catch(e){ rObj.oid_type=null; }
				if(!rObj.oid_type) rObj.oid_type = "url";
				rObj.oid_txt = bitsAutocacheService.convertCacheURLToOriginalURL(url);
				rObj.oid_date = bitsAutocacheService.getURLTimeStampFormatDate(doc_url);
				rObj.pfid_order = ++pfid_order;
				if(aOriginalTarget && (aOriginalTarget.nodeName == "IMG" || aOriginalTarget.nodeName == "A")){
					rObj.oid_property = bitsMetaCapture.capture(this.gBrowser.contentDocument,rObj.oid_property);
				}
				rObj = this.setInitMarkerData(rObj);
			}
			if(rObj){
				var rtn = this.Database.addObject(rObj,dbtype);
				if(rtn){
					rObj = this.Database.getObject({oid:rObj.oid,pfid:rObj.pfid},dbtype)[0];
				}else{
					rObj = undefined;
				}
			}
			if(rObj){
				bitsAutocacheService.createCache(rObj.doc_url,undefined,aRebuild);
				var newDCitem = this.Database.makeObjectToItem(rObj);
				if(url.indexOf("file://") == 0){
					newDCitem.title = rObj.oid_title;
				}else{
					newDCitem.icon = this.Database.getFavicon(rObj.doc_url,dbtype);
				}
				var rtnContent = null;
				if(stXPath && enXPath && (aOriginalTarget && aOriginalTarget.nodeName != "IMG")){
					rtnContent = bitsMarker.xPathMarker(
						stXPath.node.ownerDocument,
						{
							start   : rObj.bgn_dom,
							end     : rObj.end_dom,
							context : rObj.oid_txt,
							con_url : this.Common.getURLStringFromDocument(stXPath.node.ownerDocument)
						},
						{
							id     : rObj.oid,
							dbtype : dbtype,
							style  : ""
						}
					);
				}
				if(rtnContent && rtnContent.length && rtnContent.length>0) newDCitem.source = rtnContent[0].id;
				var newRes = null;

 				if(typeof aParName != "string"){
					var f_pfid = undefined;
					var rtnFolder = this.Database.getFolder({fid:parentID},dbtype);
					if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
					rtnFolder = undefined;
					aParName = this.DataSource.getID2About(parentID,f_pfid,dbtype);
				}
				var contentWindow = null;
				var mcTreeHandler = null;
				var bitsItemView = null;
				var bitsTreeDate = null;
				if(this._contentWindow) contentWindow = this._contentWindow;
				if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
				if(contentWindow && contentWindow.bitsItemView) bitsItemView = contentWindow.bitsItemView;
				if(contentWindow && contentWindow.bitsTreeDate) bitsTreeDate = contentWindow.bitsTreeDate;
				if(!bitsItemView || !bitsItemView.isChecked){
					if(rtn) newRes = this.DataSource.addItem(newDCitem, aParName, aIdx, dbtype);
					if(newRes){
						this.DataSource.flush();
						//追加したObjectにフォーカスを移す
						var mcPropertyView = null;
						if(contentWindow && contentWindow.mcPropertyView) mcPropertyView = contentWindow.mcPropertyView;
						if(mcTreeHandler){
							var folderautoopen = nsPreferences.getBoolPref("wiredmarker.folderautoopen", true);
							if(!folderautoopen){
								var parentRes = this.DataSource.findParentResource(newRes);
								var parentIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(parentRes);
								if(parentIdx>=0) folderautoopen = mcTreeHandler.TREE.view.isContainerOpen(parentIdx);
							}
							if(folderautoopen){
								var resArr = [];
								var parentRes = newRes;
								do{
									parentRes = this.DataSource.findParentResource(parentRes);
									if(parentRes) resArr.push(parentRes);
								}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
								var i;
								for(i=resArr.length-1;i>=0;i--){
									var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
									if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
								}
								var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
								if(selectIdx>=0){
									mcTreeHandler.TREE.currentIndex = selectIdx;
									if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
									mcTreeHandler.TREE.focus();
									mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
									if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
								}
							}
						}
						rtnNewRes.push(newRes);
					}
				}else if(bitsItemView && bitsItemView.isChecked){
					if(mcTreeHandler){
						var resArr = [];
						var parentRes = this.Common.RDF.GetResource(aParName);
						do{
							parentRes = this.DataSource.findParentResource(parentRes);
							if(parentRes) resArr.push(parentRes);
						}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
						var i;
						for(i=resArr.length-1;i>=0;i--){
							var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
							if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
						}
						var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(this.Common.RDF.GetResource(aParName));
						if(selectIdx>=0){
							mcTreeHandler.TREE.currentIndex = selectIdx;
							if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
							mcTreeHandler.TREE.focus();
							mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
							if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
						}
					}
					try{
						if(aRebuild && bitsItemView){
							if(bitsTreeDate && bitsTreeDate.isChecked){
								var param = {dbtype:dbtype};
								for(var key in rObj){
									param[key] = rObj[key];
								}
								bitsTreeDate.onSelectTab(param);
							}else{
								var aRes = this.Common.RDF.GetResource(aParName);
								var viewmode = this._contentWindow.mcTreeViewModeService.viewmode;
								var fid = this.DataSource.getProperty(aRes, "id");
								var dbtype = this.DataSource.getProperty(aRes, "dbtype");
								var oid = rObj.oid;
								bitsItemView.onTreeClick({viewmode:viewmode,fid:fid,dbtype:dbtype,res:aRes});
								bitsItemView.setSelection(oid,dbtype);
								setTimeout(function(){ bitsItemView.setSelection(oid,dbtype); },500);
							}
						}
					}catch(ex){ bitsMarkingCollection._dump("bitsMarkingCollection.addURLText():"+ex); }
				}
				var param = {
					id      : rObj.oid,
					dbtype  : dbtype,
					rebuild : aRebuild,
				};
				if(bitsItemView && !bitsItemView.isChecked){
					if(newRes) param.res = newRes;
				}else if(bitsItemView){
					param.res = this.Common.RDF.GetResource(aParName);
				}
				if(aOriginalTarget && (url.indexOf("http://") == 0 || url.indexOf("https://") == 0 || url.indexOf("ftp://") == 0)){
					this.getContentTypeFromURL(aOriginalTarget.ownerDocument, url, param);
				}else if(url.indexOf("file://") == 0){
					this._oID = rObj.oid;
					this._dbtype = dbtype;
					this.BROWSER.addEventListener("pageshow", bitsMarkingCollection.loadFile, true);
					this.BROWSER.loadURI(url);
				}
				if(aOriginalTarget && aOriginalTarget.nodeName != "IMG" && aOriginalTarget.blur) aOriginalTarget.blur();
				var tempObj = {dbtype : dbtype};
				for(var key in rObj){
					tempObj[key] = rObj[key];
				}
				bitsPubmedCentralService.getPubmedInfo(tempObj);
				rObj = undefined;
				newDCitem = undefined;
				rtn = true;
			}
		}catch(ex){
			bitsMarkingCollection._dump("bitsMarkingCollection.addURLText():"+ex);
		}
		if(rtnNewRes.length>0)
			return rtnNewRes;
		else
			return undefined;
	},

/////////////////////////////////////////////////////////////////////
	_makeURI : function(aURL, aOriginCharset, aBaseURI){
		var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		return ioService.newURI(aURL, aOriginCharset, aBaseURI);
	},

/////////////////////////////////////////////////////////////////////
	_getImageProperties : function(aDoc, aUrlString){
		if(!aDoc) return;
		if(!aUrlString || aUrlString == "") return undefined;
		var aSelf = this;
		if(!aUrlString.match(/^[a-z]{3,5}:\/\//)){
			var docURI = aSelf._makeURI(aDoc.location.href, aDoc.characterSet);
			aUrlString = aSelf.Common.resolveURL(docURI.spec, aUrlString);
		}
		if(!aUrlString.match(/^[a-z]{3,5}:\/\//)){
			return undefined;
		}
		var imgURI = aSelf._makeURI(aUrlString, aDoc.characterSet);
		var contentType = null;
		var contentDisposition = null;
		try{
			var imageCache = Components.classes["@mozilla.org/image/cache;1"].getService(Components.interfaces.imgICache);
			var props = imageCache.findEntryProperties(imgURI);
			if(props){
				contentType = props.get("type", nsISupportsCString);
				contentDisposition = props.get("content-disposition", nsISupportsCString);
			}
		}catch(e){}
		return {
			URI : imgURI,
			contentType : contentType && contentType.type == contentType.TYPE_CSTRING ? contentType.data : null,
			contentDisposition : contentDisposition && contentDisposition.type == contentDisposition.TYPE_CSTRING ? contentDisposition.data : null,
		};
	},

/////////////////////////////////////////////////////////////////////
	getContentTypeFromURL : function(aDoc, aUrl, aParam, aAsync, aInfo){
		if(aAsync == undefined) aAsync = true;
		var uri = aUrl;
		var xmlhttp = null;
		var rtn = "";
		if(aParam && aParam.rebuild == undefined) aParam.rebuild = true;
		xmlhttp = new XMLHttpRequest();
		if(xmlhttp){
			if(aAsync){
				xmlhttp.onreadystatechange = function (){
					if(xmlhttp.readyState == 4){
						if(xmlhttp.status == 200){
							var imgProp = bitsMarkingCollection._getImageProperties(aDoc, aUrl)
							var contentType = imgProp.contentType;
							var id = aParam.id;
							var dbtype = aParam.dbtype;
							var type = "url";
							var ext = "txt";
							if(contentType){
								if(contentType.match(/^image\/(\S+)/)){
									type = "image";
									ext = RegExp.$1;
								}else if(contentType.match(/^text\/(\S+)/)){
									ext = RegExp.$1;
									ext = ext.replace(/[^A-Za-z0-9]+$/mg,"");
								}
							}
							var bytes = [];
							var filestream = xmlhttp.responseText;
							var i;
							for(i=0; i<filestream.length;i++){
								bytes[i] = filestream.charCodeAt(i) & 0xff;
							}
							if(type == "image"){
								bitsMarkingCollection.Database.updateObject({oid:id,oid_type:contentType},dbtype);
								bitsMarkingCollection.Database.updateObjectBLOB(id,bytes,dbtype);
								if(aParam.res){
									var contentWindow = null;
									var bitsItemView = null;
									var bitsTreeDate = null;
									if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
									if(contentWindow && contentWindow.bitsItemView) bitsItemView = contentWindow.bitsItemView;
									if(contentWindow && contentWindow.bitsTreeDate) bitsTreeDate = contentWindow.bitsTreeDate;
									if(bitsItemView && !bitsItemView.isChecked){
										bitsMarkingCollection.DataSource.flush();
									}else{
										if(bitsTreeDate && bitsTreeDate.isChecked){
											var idx = bitsTreeDate.TREE.currentIndex;
											var rows = bitsTreeDate.getSelection();
											if(rows && rows.length && rows[0]<bitsTreeDate.rowCount){
												var row = {value:rows[0]};
												var mcTreeViewModeService = bitsMarkingCollection._contentWindow.mcTreeViewModeService;
												var viewmode = mcTreeViewModeService.viewmode;
												var param = {
													viewmode : viewmode,
													dbtype   : bitsTreeDate.itemObjects[row.value].dbtype,
													where    : [],
												};
												if(bitsMarkingCollection._uncategorized.use){
													param.res = bitsMarkingCollection.Common.RDF.GetResource(bitsMarkingCollection.DataSource.getID2About("0",undefined,bitsMarkingCollection._uncategorized.dbtype));
												}
												if(bitsTreeDate.itemObjects && bitsTreeDate.itemObjects[row.value]){
													if(bitsTreeDate.itemObjects[row.value].date){
														param.where.push({
															key : "substr(om_object.oid_date,7,4)",
															val : bitsTreeDate.itemObjects[row.value].date.year
														});
														if(bitsTreeDate.itemObjects[row.value].date.month){
															param.where.push({
																key : "substr(om_object.oid_date,1,2)",
																val : bitsTreeDate.itemObjects[row.value].date.month
															});
															if(bitsTreeDate.itemObjects[row.value].date.day){
																param.where.push({
																	key : "substr(om_object.oid_date,4,2)",
																	val : bitsTreeDate.itemObjects[row.value].date.day
																});
															}
														}
													}
												}
												bitsItemView.onTreeDateClick(param);
											}else{
												bitsItemView.onTreeDateClick();
											}
										}else{
											try{
												var mcTreeViewModeService = bitsMarkingCollection._contentWindow.mcTreeViewModeService;
												var aRes = aParam.res;
												var viewmode = mcTreeViewModeService.viewmode;
												var fid = bitsMarkingCollection.DataSource.getProperty(aRes, "id");
												var dbtype = bitsMarkingCollection.DataSource.getProperty(aRes, "dbtype");
												if(aParam.rebuild && bitsItemView) bitsItemView.onTreeClick({viewmode:viewmode,fid:fid,dbtype:dbtype,res:aRes});
											}catch(ex){}
										}
									}
								}
							}else{
							}
						}else{
						}
					}else{
					}
				};
			}
			xmlhttp.open("GET", uri , aAsync);
			xmlhttp.overrideMimeType('text/plain; charset=x-user-defined');
			xmlhttp.send(null);
			if(!aAsync){
				if(xmlhttp.status == 200){
					var imgProp = this._getImageProperties(aDoc, aUrl)
					aInfo.contentType = imgProp.contentType;
					if(aInfo.contentType.match(/^image\/(\S+)/)){
						var bytes = [];
						var filestream = xmlhttp.responseText;
						var i;
						for(i=0; i<filestream.length;i++){
							bytes[i] = filestream.charCodeAt(i) & 0xff;
						}
						aInfo.bytes = bytes;
					}
				}
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	loadFile : function(aEvent) {
		var doc = bitsMarkingCollection.BROWSER.contentDocument;
		var contentType = doc.contentType;
		var type = "url";
		if(contentType.match(/^image\/(\S+)/)) type = "image";
		if(type == "image"){
			try{
				var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(bitsMarkingCollection.Common.convertURLToFile(bitsMarkingCollection.Common.getURLStringFromDocument(doc)), 1, 0, false);
				var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
				sstream.init(istream);
				var bstream = Components.classes['@mozilla.org/binaryinputstream;1'].createInstance(Components.interfaces.nsIBinaryInputStream);
				bstream.setInputStream(istream);
				var len = sstream.available();
				var bytes = bstream.readByteArray(len);
				sstream.close();
				istream.close();
			}catch(ex){bitsMarkingCollection.Common.alert(ex);}
			bitsMarkingCollection.Database.updateObject({oid:bitsMarkingCollection._oID,oid_type:contentType}, bitsMarkingCollection._dbtype);
			bitsMarkingCollection.Database.updateObjectBLOB(bitsMarkingCollection._oID, bytes, bitsMarkingCollection._dbtype);
		}
		bitsMarkingCollection.BROWSER.removeEventListener("pageshow", bitsMarkingCollection.loadFile, true);
		bitsMarkingCollection.BROWSER.loadURI("about:blank");
	},

/////////////////////////////////////////////////////////////////////
	addSelectedText : function(aParName, aIdx, aRow, aRebuild, aIsCacheConfirm){
		if(aRebuild == undefined) aRebuild = true;
		if(aIsCacheConfirm == undefined) aIsCacheConfirm = true;
		var targetWindow = this.Common.getFocusedWindow();
		var parentID  = 0;
		var style = "";
		var dbtype = "";
		if(typeof aParName == "string"){
			var aRes = this.Common.RDF.GetResource(aParName);
			style = this.DataSource.getProperty(aRes,"style");
			dbtype = this.DataSource.getProperty(aRes,"dbtype");
			if(aParName != this.DataSource.ABOUT_ROOT) parentID = this.DataSource.getProperty(aRes,"id");
		}else{
			parentID = aParName.fid;
			style = aParName.fid_style;
			dbtype = aParName.dbtype;
		}
		var pfid_order = this.Database.getMaxOrderFormPID(parentID);
		var selection = targetWindow.getSelection();
		if(!selection) return undefined;
		var selectText = selection.toString();
		if(selectText == "") return undefined;
		var doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		if(aIsCacheConfirm && !bitsAutocacheService.isMarking(doc_url)) return undefined;
		var doc_url_hash = this.Common.getURLHashStringFromDocument(this.gBrowser.contentDocument);
		var selectimportimage = nsPreferences.copyUnicharPref("wiredmarker.selectimportimage","none");
		var rtnNewRes = [];
		var rtnNewObj = [];
		var r;
		var ranges = [];
		for(r=selection.rangeCount-1;r>=0;r--){
			var range   = selection.getRangeAt(r);
			var obj = {
				startContainer : range.startContainer,
				startOffset    : range.startOffset,
				endContainer   : range.endContainer,
				endOffset      : range.endOffset,
				collapsed      : range.collapsed,
				commonAncestorContainer : range.commonAncestorContainer
			};
			ranges.unshift(obj);
		}
		for(r=ranges.length-1;r>=0;r--){
			var context = "";
			var contextArray = [];
			var range = this.gBrowser.contentDocument.createRange();
			range.setStart(ranges[r].startContainer, ranges[r].startOffset);
			range.setEnd(ranges[r].endContainer, ranges[r].endOffset);
			if(selectimportimage == "none"){
				context = range.toString();
				contextArray.push(range.toString());
			}else{
				var nodeWalker = this.gBrowser.contentDocument.createTreeWalker(range.cloneContents(),NodeFilter.SHOW_ALL,null,false);
				var txtNode; 
				for(txtNode=nodeWalker.nextNode();txtNode;txtNode = nodeWalker.nextNode()){
					if(txtNode.nodeName == "#text"){
						context += txtNode.nodeValue;
						contextArray.push(txtNode.nodeValue);
					}else if(txtNode.nodeName == "IMG"){
						if(selectimportimage == "alt"){
							contextArray.push(txtNode.alt);
						}else{
							contextArray.push(bitsSubstitutionTree.getSubstitutionText(txtNode));
						}
					}
				}
			}
			var startContainer = range.startContainer;
			var startOffset = range.startOffset;
			var endContainer = range.endContainer;
			var endOffset = range.endOffset;
			try{
				var imgElems = [];
				var tableElems = [];
				var contentDocument = startContainer.ownerDocument;
				var nodeWalker = contentDocument.createTreeWalker(range.cloneContents(),NodeFilter.SHOW_ELEMENT,null,false);
				var elemNode=nodeWalker.nextNode();
				for(;elemNode;elemNode = nodeWalker.nextNode()){
					if(elemNode.nodeName == "IMG"){
						imgElems.push(elemNode);
						continue;
					}
					if(elemNode.nodeName == "TABLE"){
						var border = elemNode.getAttribute("border");
						if(border == "" || border == "0") elemNode.setAttribute("border","1");
						tableElems.push(elemNode);
						continue;
					}
				}
				var structure = "";
				if(
					range.commonAncestorContainer.nodeName == "TABLE" ||
					range.commonAncestorContainer.nodeName == "THEAD" ||
					range.commonAncestorContainer.nodeName == "TBODY" ||
					range.commonAncestorContainer.nodeName == "TFOOT" ||
					(tableElems && tableElems.length > 0)
				){
					var divNode = this.gBrowser.contentDocument.createElement("div");
					if(divNode){
						if(tableElems.length > 0){
							divNode.appendChild(range.cloneContents());
						}else{
							var tableNode = range.commonAncestorContainer;
							if(range.commonAncestorContainer.nodeName != "TABLE") tableNode = tableNode.parentNode;
							var parentNode = tableNode.cloneNode(false);
							parentNode.appendChild(range.cloneContents());
							divNode.appendChild(parentNode);
						}
						var elemImg = divNode.getElementsByTagName("IMG");
						if(elemImg && elemImg.length>0){
							var imgcnt;
							for(imgcnt=0;imgcnt<elemImg.length;imgcnt++){
								if(!elemImg[imgcnt].src) continue;
								elemImg[imgcnt].src = elemImg[imgcnt].src;
								if(!(elemImg[imgcnt].src.match(/^http/) || elemImg[imgcnt].src.match(/^file/))) continue;
								if(elemImg[imgcnt].src.indexOf("http://") == 0 || elemImg[imgcnt].src.indexOf("https://") == 0){
									var aInfo = {};
									if(!aInfo.contentType) this.getContentTypeFromURL(contentDocument, elemImg[imgcnt].src, undefined, false, aInfo);
									if(!aInfo.contentType || !aInfo.contentType.match(/^image\/(\S+)/)) continue;
									var images = String.fromCharCode.apply(String, aInfo.bytes);
									var image_b64 = btoa(images); // base64 encoding
									elemImg[imgcnt].src = 'data:' + aInfo.contentType + ';base64,' + image_b64;
								}else if(elemImg[imgcnt].src.indexOf("file://") == 0){
									try{
										var file = bitsMarkingCollection.Common.convertURLToFile(elemImg[imgcnt].src);
										var ext = "???";
										var n;
										if((n = file.path.lastIndexOf(".")) != -1){
											ext = file.path.substring(n+1);
											if(!ext.match(/^[A-Za-z0-9]+$/)) ext = "???";
										}
										var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
										istream.init(file, 1, 0, false);
										var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
										sstream.init(istream);
										var bstream = Components.classes['@mozilla.org/binaryinputstream;1'].createInstance(Components.interfaces.nsIBinaryInputStream);
										bstream.setInputStream(istream);
										var len = sstream.available();
										var bytes = bstream.readByteArray(len);
										var images = String.fromCharCode.apply(String, bytes);
										var image_b64 = btoa(images); // base64 encoding
										elemImg[imgcnt].src = 'data:image/'+ext+';base64,' + image_b64;
										sstream.close();
										istream.close();
									}catch(ex3){
										bitsMarkingCollection._dump("bitsMarkingCollection.addSelectedText():"+ex3);
									}
								}
							}
						}
						var removeTags = new Array("script","form","select","input","textarea");
						for(var tagCnt=0;tagCnt<removeTags.length;tagCnt++){
							var elems = divNode.getElementsByTagName(removeTags[tagCnt]);
							if(elems && elems.length>0){
								var scrcnt;
								for(scrcnt=elems.length-1;scrcnt>=0;scrcnt--){
									elems[scrcnt].parentNode.removeChild(elems[scrcnt]);
								}
							}
						}
						var styleHash = [];
						var styleSheets = contentDocument.styleSheets;
						if(styleSheets && styleSheets.length>0){
							try{
								var sheet_cnt;
								var css_cnt;
								var selector_cnt;
								var selector_arr = [];
								var selector;
								var style_cnt;
								var cssRules;
								var cssRule;
								for(sheet_cnt=0;sheet_cnt<styleSheets.length;sheet_cnt++){
									if(styleSheets[sheet_cnt].disabled) continue;
									cssRules = styleSheets[sheet_cnt].cssRules;
									if(cssRules && cssRules.length>0){
										for(css_cnt=0;css_cnt<cssRules.length;css_cnt++){
											if(cssRules[css_cnt].type != cssRules[css_cnt].STYLE_RULE) continue;
											cssRule = cssRules[css_cnt].style;
											if(cssRule && cssRule.length>0){
												selector_arr = cssRules[css_cnt].selectorText.split(",");
												for(selector_cnt=0;selector_cnt<selector_arr.length;selector_cnt++){
													selector = selector_arr[selector_cnt].replace(/^\s*/mg,"").replace(/\s*$/mg,"");
													if(!styleHash[selector]) styleHash[selector] = "";
													for(style_cnt=0;style_cnt<cssRule.length;style_cnt++){
														styleHash[selector] += cssRule[style_cnt] + ":" + cssRule.getPropertyValue(cssRule[style_cnt]) + ";";
													}
												}
											}
										}
									}
								}
							}catch(ex3){
								bitsMarkingCollection._dump("bitsMarkingCollection.addSelectedText():"+ex3);
							}
							var elems = divNode.getElementsByTagName("*");
							if(elems && elems.length>0){
								var nodeClass;
								var nodeID;
								var nodeName;
								var nodeStyle;
								var elem_cnt;
								for(elem_cnt=0;elem_cnt<elems.length;elem_cnt++){
									nodeClass = elems[elem_cnt].getAttribute("class");
									nodeID = elems[elem_cnt].getAttribute("id");
									nodeStyle = elems[elem_cnt].getAttribute("style");
									if(!nodeStyle) nodeStyle = "";
									nodeName = elems[elem_cnt].nodeName.toLowerCase();
									if(nodeClass && nodeClass != ""){
										if(styleHash[nodeName+"."+nodeClass]){
											nodeStyle += styleHash[nodeName+"."+nodeClass]+";";
										}else if(styleHash["."+nodeClass]){
											nodeStyle += styleHash["."+nodeClass]+";";
										}
									}
									if(nodeID && nodeID != ""){
										if(styleHash[nodeName+"#"+nodeID]){
											nodeStyle += styleHash[nodeName+"#"+nodeID]+";";
										}else if(styleHash["#"+nodeID]){
											nodeStyle += styleHash["#"+nodeID]+";";
										}
									}
									if((!nodeClass || nodeClass == "") && (!nodeID || nodeID == "")){
										if(styleHash[nodeName]) nodeStyle += styleHash[nodeName]+";";
									}
									if(nodeName == "a"){
										if(elems[elem_cnt].href) elems[elem_cnt].href = elems[elem_cnt].href;
										if(styleHash["a:link"]) nodeStyle += styleHash[":link"]+";";
										if(styleHash["a:visited"]) nodeStyle += styleHash[":visited"]+";";
										if(styleHash["a:active"]) nodeStyle += styleHash[":active"]+";";
										if(styleHash["a:hover"]) nodeStyle += styleHash[":hover"]+";";
									}
									if(nodeStyle != "") elems[elem_cnt].setAttribute("style",nodeStyle);
								}
							}
						}
						try{
							structure = bitsHTML2XHTMLService.get_xhtml(divNode);
							structure = structure.replace(/&nbsp;/mg," ").replace(/[\r\n]+/mg,"\n").replace(/\s+?\n/mg,"\n").replace(/\n+/mg,"");
						}catch(ex3){
							bitsMarkingCollection._dump("bitsMarkingCollection.addSelectedText():"+ex3);
						}
						parentNode = undefined;
					}
					divNode = undefined;
				}
				tableElems = undefined;
			}catch(ex2){
				bitsMarkingCollection._dump("bitsMarkingCollection.addSelectedText():"+ex2);
			}
			try{
				if(startContainer.nodeType != startContainer.TEXT_NODE || endContainer.nodeType != endContainer.TEXT_NODE){
					var docRange = range.cloneRange();
					var startRange = range.cloneRange();
					var stopRange = range.cloneRange();
					startRange.collapse(true)
					stopRange.collapse(false)
					var findRange = bitsMarker._getFindRange();
					var result = findRange.Find(range.toString().replace(/^\s*/g,"").replace(/\s*$/g,""), docRange, startRange, stopRange);
					if(result){
						range = result.cloneRange();
						startContainer = range.startContainer;
						startOffset = range.startOffset;
						endContainer = range.endContainer;
						endOffset = range.endOffset;
					}
				}
				var stXPath = this.XPath.getOffsetFromParentNode(startContainer,startOffset);
				var enXPath = this.XPath.getOffsetFromParentNode(endContainer,endOffset);
				try{
					var hyperAnchor =  bitsHyperAnchor._getAnchorURL({node:startContainer,offset:startOffset,style:style,prefix:"b",contents:range.toString()},{node:endContainer,offset:endOffset,prefix:"e",contents:range.toString()});
				}catch(ex3){
					try{
						var hyperAnchor =  bitsHyperAnchorDummy._getAnchorURL({node:startContainer,offset:startOffset,style:style,prefix:"b",contents:range.toString()},{node:endContainer,offset:endOffset,prefix:"e",contents:range.toString()});
					}catch(ex3){
						hyperAnchor = null;
					}
				}
				hyperAnchor = bitsAutocacheService.convertCacheURLToOriginalURL(hyperAnchor);
				var con_url = this.Common.getURLStringFromDocument(stXPath.node.ownerDocument);
				var rObj = this.Database.newObject();
				if(rObj){
					rObj.pfid = parentID;
					rObj.doc_url = bitsAutocacheService.convertCacheURLToOriginalURL(doc_url);
					rObj.con_url = bitsAutocacheService.convertCacheURLToOriginalURL(con_url);
					rObj.doc_title = this.gBrowser.contentDocument.title?this.gBrowser.contentDocument.title:rObj.doc_url;
					if(bitsAutocacheService.isCacheURL(doc_url)){
						var info = bitsAutocacheService.getSaveCacheInfo(doc_url);
						if(info && info.TITLE) rObj.doc_title = info.TITLE;
					}
					rObj.bgn_dom = stXPath.xpath + "("+stXPath.offset+")" + "("+stXPath.type+")";
					rObj.end_dom = enXPath.xpath + "("+enXPath.offset+")" + "("+enXPath.type+")";

					rObj.oid_title = contextArray.join("");
					rObj.oid_title = this.Common.exceptCode(rObj.oid_title.replace(/[\r\n\t]+/mg," ").replace(/\s{2,}/mg," "));

					rObj.oid_txt = contextArray.join("");
					rObj.oid_txt = this.Common.exceptCode(rObj.oid_txt.replace(/\s+$/mg,"").replace(/^\s+/mg,""));

					rObj.oid_date = bitsAutocacheService.getURLTimeStampFormatDate(doc_url);
					rObj.pfid_order = ++pfid_order;
					rObj.oid_mode = "0";
					rObj.con_doc = stXPath.node.ownerDocument;
					var frame_name;
					var frame_id;
					if(doc_url != con_url){
						var win = this.gBrowser.contentWindow;
						if(win.frames != null){
							var i;
this._dump("addSelectedText():win.frames.length=["+win.frames.length+"]");
							for(i=0;i<win.frames.length;i++){
this._dump("addSelectedText():win.frames["+i+"].document.URL=["+win.frames[i].document.URL+"]");
								if(bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(win.frames[i].document)) != con_url) continue;
								frame_name = win.frames[i].name;
this._dump("addSelectedText():frame_name=["+frame_name+"]");
								var nodes = bitsObjectMng.XPath.evaluate('//*[@name="'+win.frames[i].name+'"]',this.gBrowser.contentDocument);
this._dump("addSelectedText():nodes=["+nodes+"]["+(nodes?nodes.snapshotLength:0)+"]");
								if(nodes && nodes.snapshotLength == 1){
									frame_id = nodes.snapshotItem(0).id;
								}
								break;
							}
						}
					}
this._dump("addSelectedText():frame_id=["+frame_id+"]");
					var parser = new DOMParser();
					var xmldoc = null;
					if(!structure || structure == ""){
						rObj.oid_type = "text";
						if(hyperAnchor || frame_name || frame_id || doc_url_hash){
							xmldoc = parser.parseFromString("<PROPERTY></PROPERTY>","text/xml");
						}
					}else{
						rObj.oid_type = "structure";
						xmldoc = parser.parseFromString("<PROPERTY><STRUCTURE>"+structure+"</STRUCTURE></PROPERTY>","text/xml");
					}
					if(xmldoc){
						if(xmldoc.documentElement){
							if(frame_name){
								var xmlnode = xmldoc.createElement("FRAME_NAME");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(frame_name));
									xmldoc.documentElement.appendChild(xmlnode);
								}
							}
							if(frame_id){
								var xmlnode = xmldoc.createElement("FRAME_ID");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(frame_id));
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
							if(doc_url_hash){
								var xmlnode = xmldoc.createElement("LOCATION_HASH");
								if(xmlnode){
									xmlnode.appendChild(xmldoc.createTextNode(doc_url_hash));
									xmldoc.documentElement.appendChild(xmlnode);
								}
							}
						}
						var s = new XMLSerializer();
						rObj.oid_property = s.serializeToString(xmldoc);
						s = undefined;
					}
					parser = undefined;
					rtnNewObj.unshift(rObj);
				}
			}catch(ex2){
				bitsMarkingCollection._dump("bitsMarkingCollection.addSelectedText():"+ex2);
			}
		}

		var objArr = [];
		for(r=0;r<rtnNewObj.length;r++){
			var rObj = this.Database.newObject();
			for(var key in rtnNewObj[r]){
				if(key == "oid") continue;
				if(key == "con_doc") continue;
				rObj[key] = rtnNewObj[r][key];
			}
			rObj = this.setInitMarkerData(rObj);
			if(!rObj) return;
			objArr.push(rObj);
		}

		bitsAutocacheService.createCache(undefined,undefined,aRebuild);

		if(typeof aParName != "string"){
			var f_pfid = undefined;
			var rtnFolder = this.Database.getFolder({fid:parentID},dbtype);
			if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
			rtnFolder = undefined;
			aParName = this.DataSource.getID2About(parentID,f_pfid,dbtype);
		}

		var contentWindow = null;
		var bitsItemView = null;
		var mcTreeHandler = null;
		var mcPropertyView = null;
		var mcItemView = null;
		var bitsTreeDate = null;
		if(this._contentWindow){
			if(this._contentWindow) contentWindow = this._contentWindow;
			if(contentWindow && contentWindow.bitsItemView) bitsItemView = contentWindow.bitsItemView;
			if(bitsItemView){
				if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
				if(contentWindow && contentWindow.mcPropertyView) mcPropertyView = contentWindow.mcPropertyView;
				if(contentWindow && contentWindow.mcItemView) mcItemView = contentWindow.mcItemView;
				if(contentWindow && contentWindow.bitsTreeDate) bitsTreeDate = contentWindow.bitsTreeDate;
			}
		}

		var pfid_order = this.Database.getMaxOrderFormPID(parentID);
		for(r=0;r<objArr.length;r++){
			var rObj = objArr[r];
			rObj.oid_property = bitsMetaCapture.capture(this.gBrowser.contentDocument,rObj.oid_property);
			rObj.pfid_order = ++pfid_order;
			var rtn = this.Database.addObject(rObj,dbtype);
			if(!rtn) rObj = undefined;
			if(!rObj) continue;
			rObj = this.Database.getObject({oid:rObj.oid,pfid:rObj.pfid},dbtype)[0];
			if(!rObj) continue;
			try{
				var rtnContent = bitsMarker.xPathMarker(
					rtnNewObj[r].con_doc,
					{
						start   : rObj.bgn_dom,
						end     : rObj.end_dom,
						context : this.Common.exceptCode(context.replace(/\s+$/mg,"").replace(/^\s+/mg,"")),
						con_url : this.Common.getURLStringFromDocument(rtnNewObj[r].con_doc)
					},
					{
						id     : rObj.oid,
						dbtype : dbtype,
						pfid   : rObj.pfid,
						style  : style
					}
				);
				if(rtnContent){
					if(this._contentWindow){
						if(bitsItemView){
							if(bitsItemView.isChecked){
								if(mcTreeHandler){
									var resArr = [];
									var parentRes = this.Common.RDF.GetResource(aParName);
									do{
										parentRes = this.DataSource.findParentResource(parentRes);
										if(parentRes) resArr.push(parentRes);
									}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
									var i;
									for(i=resArr.length-1;i>=0;i--){
										var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
										if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
									}
									var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(this.Common.RDF.GetResource(aParName));
									if(selectIdx>=0){
										mcTreeHandler.TREE.currentIndex = selectIdx;
										if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
										mcTreeHandler.TREE.focus();
										mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
										if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
									}
								}
								if(!aRebuild) aRebuild = ((r==rtnNewObj.length-1)?true:false);
								if(aRebuild && mcItemView){
									if(bitsTreeDate && bitsTreeDate.isChecked){
										var param = {dbtype:dbtype};
										for(var key in rObj){
											param[key] = rObj[key];
										}
										bitsTreeDate.onSelectTab(param);
									}else{
										mcItemView.onTreeClick();
									}
									var oid = rObj.oid;
									mcItemView.setSelection(oid,dbtype);
									setTimeout(function(){ mcItemView.setSelection(oid,dbtype); },500);
								}
							}else{
								var newDCitem = this.Database.makeObjectToItem(rObj);
								if(rtnContent.length && rtnContent.length>0){
									newDCitem.source = rtnContent[0].id;
								}else{
									newDCitem.source = rtnContent.id;
								}
								var newRes = this.DataSource.addItem(newDCitem, aParName, aIdx, dbtype);
								if(newRes){
									this.DataSource.flush();
									if(mcTreeHandler){
										var folderautoopen = nsPreferences.getBoolPref("wiredmarker.folderautoopen", true);
										if(!folderautoopen){
											var parentRes = this.DataSource.findParentResource(newRes);
											var parentIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(parentRes);
											if(parentIdx>=0) folderautoopen = mcTreeHandler.TREE.view.isContainerOpen(parentIdx);
										}
										if(folderautoopen){
											var resArr = [];
											var parentRes = newRes;
											do{
												parentRes = this.DataSource.findParentResource(parentRes);
												if(parentRes) resArr.push(parentRes);
											}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
											var i;
											for(i=resArr.length-1;i>=0;i--){
												var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
												if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
											}
											var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
											if(selectIdx>=0){
												mcTreeHandler.TREE.currentIndex = selectIdx;
												if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
												mcTreeHandler.TREE.focus();
												mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
												if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
											}
										}
									}
									rtnNewRes.push(newRes);
								}
								newDCitem = undefined;
							}
						}else{
							try{
								var aRes = this.Common.RDF.GetResource(aParName);
								var viewmode = this._contentWindow.mcTreeViewModeService.viewmode;
								var fid = this.DataSource.getProperty(aRes, "id");
								var dbtype = this.DataSource.getProperty(aRes, "dbtype");
								if(!aRebuild) aRebuild = ((r==rtnNewObj.length-1)?true:false);
								if(aRebuild && bitsItemView) bitsItemView.onTreeClick({viewmode:viewmode,fid:fid,dbtype:dbtype,res:aRes});
							}catch(ex){}
						}
					}
					var tempObj = {dbtype : dbtype};
					for(var key in rObj){
						tempObj[key] = rObj[key];
					}
					bitsPubmedCentralService.getPubmedInfo(tempObj);
				}else{
					var rtn = this.Database.removeObject(rObj,dbtype);
				}
			}catch(ex2){
				bitsMarkingCollection._dump("bitsMarkingCollection.addSelectedText():"+ex2);
			}
		}
		selection.removeAllRanges();
		if(rtnNewRes.length>0)
			return rtnNewRes;
		else
			return undefined;
	},

/////////////////////////////////////////////////////////////////////
	updateSelectedText : function(aElem){
		var dbtype = aElem.getAttribute("dbtype");
		var pfid = aElem.getAttribute("pfid");
		var style = aElem.style.cssText;
		var oid = "";
		var match_exp = new RegExp("^"+bitsMarker.id_key+"\\D+(\\d+)$","m");
		if(aElem.id.match(match_exp)){
			var match_dbtype = aElem.getAttribute("dbtype");
			match_exp = new RegExp("^"+bitsMarker.id_key+match_dbtype+"(\\d+)$","m");
			if(match_exp.test(aElem.id)) oid = RegExp.$1;
		}
		if(oid == "") return;
		var targetWindow = this.Common.getFocusedWindow();
		var contentWindow = null;
		var mcTreeHandler = null;
		var mcPropertyView = null;
		var currentIndex = -1;
		var aRes = null;
		if(this._contentWindow) contentWindow = this._contentWindow;
		if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
		if(contentWindow && contentWindow.mcPropertyView) mcPropertyView = contentWindow.mcPropertyView;
		if(mcTreeHandler) currentIndex = mcTreeHandler.TREE.currentIndex;
		if(currentIndex >= 0) aRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(currentIndex);
		var selection = targetWindow.getSelection();
		if(!selection) return false;
		var selectText = selection.toString();
		if(selectText == "") return false;
		var xpath = [];
		for(var r=0;r<selection.rangeCount;r++){
			var range = selection.getRangeAt(r);
			if(range.startContainer.nodeType != range.startContainer.TEXT_NODE || range.endContainer.nodeType != range.endContainer.TEXT_NODE){
				var docRange = range.cloneRange();
				var startRange = range.cloneRange();
				var stopRange = range.cloneRange();
				startRange.collapse(true)
				stopRange.collapse(false)
				var findRange = bitsMarker._getFindRange();
				var result = findRange.Find(range.toString().replace(/^\s*/g,"").replace(/\s*$/g,""), docRange, startRange, stopRange);
				if(result) range = result.cloneRange();
			}
			var context = this.Common.exceptCode(range.toString().replace(/\s+$/mg,"").replace(/^\s+/mg,""));
			var stXPath = this.XPath.getOffsetFromParentNode(range.startContainer,range.startOffset);
			var enXPath = this.XPath.getOffsetFromParentNode(range.endContainer,range.endOffset);
			if(!stXPath || !enXPath) continue;
			var bgn_dom = stXPath.xpath + "("+stXPath.offset+")" + "("+stXPath.type+")";
			var end_dom = enXPath.xpath + "("+enXPath.offset+")" + "("+enXPath.type+")";
			var con_url = this.Common.getURLStringFromDocument(stXPath.node.ownerDocument);
			try{
				var hyperAnchor = bitsHyperAnchor._getAnchorURL({node:range.startContainer,offset:range.startOffset,style:style,prefix:"b",contents:range.toString()},{node:range.endContainer,offset:range.endOffset,prefix:"e",contents:range.toString()});
			}catch(ex3){
				try{
					var hyperAnchor = bitsHyperAnchorDummy._getAnchorURL({node:range.startContainer,offset:range.startOffset,style:style,prefix:"b",contents:range.toString()},{node:range.endContainer,offset:range.endOffset,prefix:"e",contents:range.toString()});
				}catch(ex3){
					hyperAnchor = null;
					bitsMarkingCollection._dump("bitsMarkingCollection.updateSelectedText():ex3=["+ex3 +"]");
				}
			}
			if(hyperAnchor) hyperAnchor = bitsAutocacheService.convertCacheURLToOriginalURL(hyperAnchor);
			xpath.push({doc:stXPath.node.ownerDocument,context:context,bgn_dom:bgn_dom,end_dom:end_dom,con_url:con_url,hyperAnchor:hyperAnchor});
			break; //最初の選択テキストのみ有効
		}
		selection.removeAllRanges();
		if(xpath.length == 0) return;

		var rValue = this.Database.getObjectFormID(oid,dbtype);
		if(!rValue) return;
		rValue[0].oid_title = xpath[0].context;
		rValue[0].oid_txt = xpath[0].context;
		rValue[0] = this.setInitMarkerData(rValue[0]);
		if(!rValue[0]) return;

		bitsMarker.unmarkerWindow(aElem.id);
		var rtn = false;
		var r;
		for(r=0;r<xpath.length;r++){
			var rtnContent = bitsMarker.xPathMarker(
				xpath[r].doc,
				{
					start   : xpath[r].bgn_dom,
					end     : xpath[r].end_dom,
					context : xpath[r].context,
					con_url : xpath[r].con_url
				},{
					id     : oid,
					dbtype : dbtype,
					pfid   : pfid,
					style  : style
				});
			if(!rtnContent) continue;
			var oid_property = "";
			if(rValue) oid_property = rValue[0].oid_property;
			if(xpath[r].hyperAnchor){
				var parser = new DOMParser();
				try{ var xmldoc = parser.parseFromString(oid_property,"text/xml"); }catch(e){xmldoc = null; }
				if(!xmldoc) xmldoc = parser.parseFromString("<PROPERTY/>","text/xml");
				if(xmldoc){
					if(xmldoc.documentElement && hyperAnchor){
						var xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
						if(xmlnode){
							while(xmlnode.hasChildNodes()){
								xmlnode.removeChild(xmlnode.lastChild);
							}
						}else{
							xmlnode = xmldoc.createElement("HYPER_ANCHOR");
							xmldoc.documentElement.appendChild(xmlnode);
						}
						xmlnode.appendChild(xmldoc.createTextNode(xpath[r].hyperAnchor));
					}
					var s = new XMLSerializer();
					oid_property = s.serializeToString(xmldoc);
					s = undefined;
				}
				parser = undefined;
			}
			rtn = this.Database.updateObject({
				oid:oid,
				oid_type     : "text",
				oid_txt      : xpath[r].context,
				bgn_dom      : xpath[r].bgn_dom,
				end_dom      : xpath[r].end_dom,
				con_url      : bitsAutocacheService.convertCacheURLToOriginalURL(xpath[r].con_url),
				oid_property : oid_property
			},dbtype);
		}
		if(currentIndex>=0){
			mcTreeHandler.TREE.currentIndex = currentIndex;
			if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
			mcTreeHandler.TREE.focus();
			mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(currentIndex);
			if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
		}
	},

/////////////////////////////////////////////////////////////////////
	setInitMarkerData : function(aObject,aEdit){
		if(aEdit == undefined) aEdit = true;
		var initdata_edit = nsPreferences.getBoolPref("wiredmarker.marker.initdata.edit", true);
		if(!aEdit) initdata_edit = false;
		var title_mode = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.title","WM_TITLE");
		var note_mode = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.note","WM_TEXT");
		var title_format = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.title_format","");
		var note_format = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.note_format","");
		try{
			aObject.doc_title = decodeURIComponent(aObject.doc_title);
		}catch(e){
			this._dump("setInitMarkerData():e="+e);
			aObject.doc_title = aObject.doc_title;
		}
		var wm_text = aObject.oid_title;
		switch(title_mode){
			case "WM_TITLE":
				aObject.oid_title = aObject.doc_title;
				break;
			case "WM_DATE":
				aObject.oid_title = aObject.oid_date;
				break;
			case "WM_FORMAT":
				if(title_format || initdata_edit){
					aObject.oid_title = title_format.replace(/WM_TEXT/gi,wm_text).replace(/WM_TITLE/gi,aObject.doc_title).replace(/WM_DATE/gi,aObject.oid_date);
				}
				break;
		}
		var note = wm_text;
		var parser = new DOMParser();
		try{var xmldoc = parser.parseFromString(aObject.oid_property,"text/xml");}catch(e){xmldoc=null;}
		if(xmldoc){
			var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
			if(xmlnode) note = xmlnode.textContent;
		}
		if(note_mode){
			switch(note_mode){
				case "WM_TEXT":
					note = wm_text;
					break;
				case "WM_TITLE":
					note = aObject.doc_title;
					break;
				case "WM_DATE":
					note = aObject.oid_date;
					break;
				case "WM_FORMAT":
					if(note_format || initdata_edit){
						note = note_format.replace(/WM_TEXT/gi,wm_text).replace(/WM_TITLE/gi,aObject.doc_title).replace(/WM_DATE/gi,aObject.oid_date);
					}
					break;
			}
			if(note){
				if(!xmldoc) xmldoc = parser.parseFromString("<PROPERTY/>","text/xml");
				var xmlnode = xmldoc.getElementsByTagName("NOTE")[0]
				if(!xmlnode){
					xmlnode = xmldoc.createElement("NOTE");
					xmldoc.documentElement.appendChild(xmlnode);
				}else{
					while(xmlnode.lastChild){ xmlnode.removeChild(xmlnode.lastChild); }
				}
				xmlnode.appendChild(xmldoc.createTextNode(note));
				var s = new XMLSerializer();
				aObject.oid_property = s.serializeToString(xmldoc);
				s = undefined;
			}
		}else{
			note = "";
		}
		if(initdata_edit){
			var result = {};
			result.accept = false;
			result.title = aObject.oid_title;
			result.note = note;
			window.openDialog("chrome://markingcollection/content/markerInitDataDialog.xul", "", "chrome,centerscreen,modal,dialog,resizable=yes", result);
			if(result.accept){
				result.title = result.title.replace(/\t/mg,"        ");
				result.title = this.Common.exceptCode(result.title);
				result.title = result.title.replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
				result.note = result.note.replace(/\t/mg,"        ");
				result.note = result.note.replace(/\x0D\x0A|\x0D|\x0A/g," __BR__ ");
				result.note = this.Common.exceptCode(result.note);
				result.note = result.note.replace(/[\r\n]/mg, " ").replace(/ __BR__ /mg,"\n");
				aObject.oid_title = result.title;
				var parser = new DOMParser();
				try{var xmldoc = parser.parseFromString(aObject.oid_property,"text/xml");}catch(e){xmldoc=null;}
				if(!xmldoc) xmldoc = parser.parseFromString("<PROPERTY/>","text/xml");
				parser = undefined;
				if(result.note){
					var xmlnode = xmldoc.getElementsByTagName("NOTE")[0]
					if(!xmlnode){
						xmlnode = xmldoc.createElement("NOTE");
						xmldoc.documentElement.appendChild(xmlnode);
					}else{
						while(xmlnode.lastChild){ xmlnode.removeChild(xmlnode.lastChild); }
					}
					xmlnode.appendChild(xmldoc.createTextNode(result.note));
				}else{
					var xmlnode = xmldoc.getElementsByTagName("NOTE")[0]
					if(xmlnode) xmlnode.parentNode.removeChild(xmlnode);
				}
				var s = new XMLSerializer();
				aObject.oid_property = s.serializeToString(xmldoc);
				s = undefined;
			}else{
				return undefined;
			}
		}
		parser = undefined;
		return aObject;
	},

/////////////////////////////////////////////////////////////////////
	getFolderFromPFID : function(aPFID){
		if(!aPFID || aPFID == "0") return null;
		var rtnFolder = bitsMarkingCollection.Database.getFolderFormID(aPFID,undefined,bitsMarkingCollection.Database._defaultMode);
		if(!rtnFolder) return null;
		var rtnArr = bitsMarkingCollection.getFolderFromPFID(rtnFolder[0].pfid);
		if(rtnArr) rtnFolder = rtnFolder.concat(rtnArr);
		return rtnFolder;
	},

/////////////////////////////////////////////////////////////////////
	checkFolderNameRepetition  : function(aDBType){
		if(aDBType == undefined) return;
		var rtnFolder = bitsMarkingCollection.Database.getAllFolder(aDBType);
		if(rtnFolder && rtnFolder.length>1){
			var folders_name = [];
			var i;
			for(i=0;i<rtnFolder.length;i++){
				var chkid = rtnFolder[i].pfid.toString() + "\t" + rtnFolder[i].fid_title;
				if(!folders_name[chkid]) folders_name[chkid] = [];
				folders_name[chkid].push(rtnFolder[i].fid);
			}
			for(i=0;i<rtnFolder.length;i++){
				var folder = rtnFolder[i];
				var chkid = folder.pfid.toString() + "\t" + folder.fid_title;
				if(folders_name[chkid] && folders_name[chkid].length>1){
					var cnt;
					var folders_name_arr = folders_name[chkid];
					for(cnt=0;cnt<folders_name_arr.length;cnt++){
						if(folders_name_arr[cnt] != folder.fid || cnt==0) continue;
						var chkid = folder.pfid.toString() + "\t" + folder.fid_title + " (" + (cnt+1).toString() + ")";
						while(folders_name[chkid]){
							cnt++;
							chkid = folder.pfid.toString() + "\t" + folder.fid_title + " (" + (cnt+1).toString() + ")";
						}
						folder.fid_title += " (" + (cnt+1).toString() + ")";
						folders_name[chkid] = [];
						folders_name[chkid].push(folder.fid);
						if(folder.dbtype) delete folder.dbtype;
						bitsMarkingCollection.Database.updateFolder(folder,aDBType);
						break;
					}
				}
			}
		}
		rtnFolder = undefined;
		return;
	},

/////////////////////////////////////////////////////////////////////
	rebuildRdf : function(aFunc){
		try{
			var aFile = this.DataSource.file;
			this.Database.initSeq();
			var refRootfolder = nsPreferences.copyUnicharPref("wiredmarker.rootfolder","");
			var rootFolder = undefined;
			var rootFolder_dbtype = undefined;
			if(!refRootfolder || refRootfolder.match(/^0+$/)){
				rootFolder = undefined;
			}else{
				rootFolder = refRootfolder;
				rootFolder_dbtype = nsPreferences.copyUnicharPref("wiredmarker.rootfolder_dbtype","");
				if(!rootFolder_dbtype || rootFolder_dbtype == "") rootFolder_dbtype = this.Database._defaultMode;
				//ルートフォルダが存在するかチェック
				if(!this.Database.isOpenDB(rootFolder_dbtype) || !this.Database._fidExists(rootFolder_dbtype, rootFolder)){
					rootFolder = undefined;
					rootFolder_dbtype = undefined;
					nsPreferences.setUnicharPref("wiredmarker.rootfolder","");
					nsPreferences.setUnicharPref("wiredmarker.rootfolder_dbtype","");
				}
			}
			var tmpFolderFilter = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
			var tmpFolderFilterArr = tmpFolderFilter.split("\t");
			var folderFilterHash = [];
			var i;
			for(i=0;i<tmpFolderFilterArr.length;i++){
				if(!tmpFolderFilterArr[i].match(/^(\d+):(\d+):(.+)$/)) continue;
				var filter_fid = RegExp.$1;
				var filter_casesensitive = RegExp.$2;
				var filter_keyword = RegExp.$3;
				folderFilterHash[filter_fid] = new RegExp(filter_keyword,(filter_casesensitive==1)?"mg":"img");
			}
			tmpFolderFilterArr = undefined;
			tmpFolderFilter = undefined;
			var contentWindow = null;
			var mcTreeSharedFolder = null;
			var mcTreeViewModeService = null;
			if(this._contentWindow) contentWindow = this._contentWindow;
			if(contentWindow && contentWindow.mcTreeSharedFolder) mcTreeSharedFolder = contentWindow.mcTreeSharedFolder;
			if(contentWindow && contentWindow.mcTreeViewModeService) mcTreeViewModeService = contentWindow.mcTreeViewModeService;
//フォルダ名称重複チェック
			this.checkFolderNameRepetition(this.Database._defaultMode);
			if(bitsScrapPartyAddonService && bitsScrapPartyAddonService.existsAddon()){
				var extensionDir = bitsMarkingCollection.Common.getExtensionDir().clone();
				if(extensionDir){
					var dbtype_arr = bitsScrapPartyAddonService.getAddonDBType();
					if(dbtype_arr && dbtype_arr.length > 0){
						while(dbtype_arr.length > 0){
							var addon_dbtype = dbtype_arr.shift();
							var regexp = new RegExp("^("+ addon_dbtype +")(\\d*)\\.sqlite$", "m");
							var entries = extensionDir.directoryEntries;
							while(entries.hasMoreElements()){
								var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
								if(entry.isFile() && entry.leafName.match(regexp)){
									var dbtype = RegExp.$1;
									var dbversion = RegExp.$2;
									this.checkFolderNameRepetition(dbtype+dbversion);
								}
							}
						}
					}
				}
			}
			var rtn = null;
			var viewmode = "all";
			if(mcTreeViewModeService) viewmode = mcTreeViewModeService.viewmode;

/////////////////////////////////////////////////////////////////////
			var rdf_hash = [];
			var dbtype_arr = [];
			if(viewmode == "single" || viewmode == "all"){
				var dbinfo = this.dbinfo.getAllDBInfo();
				if(dbinfo){
					var i;
					for(i=0;i<dbinfo.length;i++){
						if(rdf_hash[""+dbinfo[i].database_dbtype]) continue;
						dbtype_arr.push(dbinfo[i].database_dbtype);
						rdf_hash[""+dbinfo[i].database_dbtype] = {};
						rdf_hash[""+dbinfo[i].database_dbtype].title = dbinfo[i].database_title;
						rdf_hash[""+dbinfo[i].database_dbtype].icon  = dbinfo[i].database_icon;
					}
				}
				if(dbtype_arr.length>0){
					var i;
					var dbtype_cnt;
					for(dbtype_cnt=0;dbtype_cnt<dbtype_arr.length;dbtype_cnt++){
						var dbtype = dbtype_arr[dbtype_cnt];
						if(rootFolder_dbtype && rootFolder_dbtype != dbtype) continue;
						var rtnFolder = [];
						var rtnObj = [];
						var pfid2Folder = [];
						var fid2Folder = [];
						var pfid2Object = [];
						var rtnArr = this.Database.getAllFolder(dbtype);
						if(rtnArr) rtnFolder = rtnFolder.concat(rtnArr);
						rtnArr = undefined;
						if(rtnObj && rtnObj.length>0){
							for(i=0;i<rtnObj.length;i++){
								if(pfid2Object[rtnObj[i].pfid] == undefined) pfid2Object[rtnObj[i].pfid] = [];
								if(folderFilterHash[rtnObj[i].pfid] && !rtnObj[i].oid_title.match(folderFilterHash[rtnObj[i].pfid])) continue;
								pfid2Object[rtnObj[i].pfid].push(rtnObj[i]);
							}
							if(rtnFolder && rtnFolder.length>0){
								var hash = [];
								for(i=0;i<rtnObj.length;i++){
									if(hash[rtnObj[i].pfid]) continue;
									hash[rtnObj[i].pfid] = rtnObj[i].oid;
									var rtnArr = bitsMarkingCollection.getFolderFromPFID(rtnObj[i].pfid);
									if(rtnArr) rtnFolder = rtnFolder.concat(rtnArr);
								}
							}
						}
						if(rtnFolder && rtnFolder.length>0){
							rtnFolder.sort(
								function(a,b){
									var len = parseFloat(a.pfid_order)-parseFloat(b.pfid_order);
									return len;
								}
							);
							for(i=0;i<rtnFolder.length;i++){
								if(fid2Folder[rtnFolder[i].fid]) continue;
								fid2Folder[rtnFolder[i].fid] = [];
								fid2Folder[rtnFolder[i].fid].push(rtnFolder[i]);
								if(folderFilterHash[rtnFolder[i].pfid] && !rtnFolder[i].fid_title.match(folderFilterHash[rtnFolder[i].pfid])) continue;
								if(pfid2Folder[rtnFolder[i].pfid] == undefined) pfid2Folder[rtnFolder[i].pfid] = [];
								pfid2Folder[rtnFolder[i].pfid].push(rtnFolder[i]);
							}
						}
						rtnFolder = undefined;
						if(rootFolder){
							rdf_hash[""+rootFolder_dbtype].rdf = this.Database.makeRdf(rootFolder,true,false,pfid2Folder,fid2Folder,pfid2Object,undefined,rootFolder_dbtype);
						}else{
							rdf_hash[""+dbtype].rdf = this.Database.makeRdf(undefined,true,false,pfid2Folder,fid2Folder,pfid2Object,undefined,dbtype);
						}
						rtnFolder = undefined;
						rtnObj = undefined;
						pfid2Folder = undefined;
						fid2Folder = undefined;
						pfid2Object = undefined;
					}
				}
			}
/////////////////////////////////////////////////////////////////////

			var rtnShared = null;
			if((viewmode == "single" || viewmode == "all") && mcTreeSharedFolder && mcTreeSharedFolder.isChecked){
				var rtnFolder = [];
				var rtnObj = [];
				var pfid2Folder = [];
				var fid2Folder = [];
				var pfid2Object = [];
				var i;
				var rtnFolder = bitsMarkingCollection.Database.getAllFolder(this.Database._sharedMode);
				if(viewmode == "single"){
					rtnObj = bitsMarkingCollection.Database.getObjectFormURL(this.Common.getURLStringFromDocument(this.gBrowser.contentDocument),this.Database._sharedMode);
				}else if(viewmode == "all"){
					rtnObj = bitsMarkingCollection.Database.getAllObject(this.Database._sharedMode);
				}
				if(rtnObj){
					rtnObj.sort(
						function(a,b){
							var len = parseFloat(a.pfid_order)-parseFloat(b.pfid_order);
							return len;
						}
					);
					for(i=0;i<rtnObj.length;i++){
						if(pfid2Object[rtnObj[i].pfid] == undefined) pfid2Object[rtnObj[i].pfid] = [];
						if(folderFilterHash[rtnObj[i].pfid] && !rtnObj[i].oid_title.match(folderFilterHash[rtnObj[i].pfid])) continue;
						pfid2Object[rtnObj[i].pfid].push(rtnObj[i]);
					}
					if(rtnFolder){
						var hash = [];
						for(i=0;i<rtnObj.length;i++){
							if(hash[rtnObj[i].pfid]) continue;
							hash[rtnObj[i].pfid] = rtnObj[i].oid;
							var rtnArr = bitsMarkingCollection.getFolderFromPFID(rtnObj[i].pfid);
							if(rtnArr) rtnFolder = rtnFolder.concat(rtnArr);
						}
					}
				}
				if(rtnFolder){
					rtnFolder.sort(
						function(a,b){
							var len = parseFloat(a.pfid_order)-parseFloat(b.pfid_order);
							return len;
						}
					);
					for(i=0;i<rtnFolder.length;i++){
						if(fid2Folder[rtnFolder[i].fid]) continue;
						fid2Folder[rtnFolder[i].fid] = [];
						fid2Folder[rtnFolder[i].fid].push(rtnFolder[i]);
						if(folderFilterHash[rtnFolder[i].pfid] && !rtnFolder[i].fid_title.match(folderFilterHash[rtnFolder[i].pfid])) continue;
						if(pfid2Folder[rtnFolder[i].pfid] == undefined) pfid2Folder[rtnFolder[i].pfid] = [];
						pfid2Folder[rtnFolder[i].pfid].push(rtnFolder[i]);
					}
				}
				rtnFolder = undefined;
				rtnShared = this.Database.makeRdf(rootFolder,true,false,pfid2Folder,fid2Folder,pfid2Object,undefined,this.Database._sharedMode);
			}

			if(viewmode == "single" || viewmode == "all"){
				var results = null;
				if(rtn && rtn.list) results = rtn.list;
				var out_txt = "";
				var out_txt_utf8 = "";
				out_txt += '<?xml version="1.0"?>\n';
				out_txt += '<RDF:RDF xmlns:NS1="' + bitsObjectMng.NS_OBJECTMANAGEMENT + '"\n';
				out_txt += '         xmlns:NC="http://home.netscape.com/NC-rdf#"\n';
				out_txt += '         xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n';

				if(rootFolder == undefined){
					var shared_id = this.sharedfolder.id + dbtype_arr.length;
					var shared_about = this.sharedfolder.about(shared_id);
					out_txt += '  <RDF:Seq RDF:about="'+ bitsObjectMng.DataSource.ABOUT_ROOT +'">\n';
					if(dbtype_arr.length>0){
						var dbtype_cnt;
						for(dbtype_cnt=0;dbtype_cnt<dbtype_arr.length;dbtype_cnt++){
							var local_about = this.sharedfolder.about(dbtype_cnt);
							out_txt += '    <RDF:li RDF:resource="'+ local_about +'"/>\n';
						}
					}
					if(mcTreeSharedFolder && mcTreeSharedFolder.isChecked) out_txt += '    <RDF:li RDF:resource="'+ shared_about +'"/>\n';
					out_txt += '  </RDF:Seq>\n';
					if(dbtype_arr.length>0){
						var dbtype_cnt;
						for(dbtype_cnt=0;dbtype_cnt<dbtype_arr.length;dbtype_cnt++){
							var dbtype = dbtype_arr[dbtype_cnt];
							var local_id = dbtype_cnt;
							var local_about = this.sharedfolder.about(local_id);
							this.DataSource.setID2About("0",undefined,local_about,dbtype);
							var resultsLocal = null;
							if(rdf_hash[""+dbtype] && rdf_hash[""+dbtype].rdf && rdf_hash[""+dbtype].rdf.list) resultsLocal = rdf_hash[""+dbtype].rdf.list;
							out_txt += '  <RDF:Seq RDF:about="'+ local_about +'">\n';
							if(resultsLocal){
								resultsLocal.sort(
									function(a,b){
										var len = parseFloat(a.pfid_order)-parseFloat(b.pfid_order);
										return len;
									}
								);
								var cnt;
								for(cnt=0;cnt<resultsLocal.length;cnt++){
									out_txt += '    <RDF:li RDF:resource="'+ resultsLocal[cnt].about +'"/>\n';
								}
							}
							out_txt += '  </RDF:Seq>\n';
							if(dbtype == this._uncategorized.dbtype){
								out_txt += '  <RDF:Description RDF:about="' + local_about +'"';
								out_txt += '\n                   NS1:id="0"';
								out_txt += '\n                   NS1:title="'+rdf_hash[""+dbtype].title+'"';
								out_txt += '\n                   NS1:type="'+dbtype+'"';
								out_txt += '\n                   NS1:icon=""';
								out_txt += '\n                   NS1:editmode="'+ (""+0x0004) +'"';
								out_txt += '\n                   NS1:cssrule="css_'+dbtype+'_0"';
								out_txt += '\n                   NS1:style="'+this._uncategorized.style+'"';
								out_txt += '\n                   NS1:source=""';
								out_txt += '\n                   NS1:addon_id=""';
								out_txt += '\n                   NS1:pfid=""';
								out_txt += '\n                   NS1:pfid_order=""';
								out_txt += '\n                   NS1:uri=""';
								out_txt += '\n                   NS1:comment=""';
								out_txt += '\n                   NS1:chars=""';
								out_txt += '\n                   NS1:shortcut=""';
								out_txt += '\n                   NS1:contextmenu=""';
								out_txt += '\n                   NS1:dbtype="'+dbtype+'"';
								out_txt += '/>\n';
							}else{
								out_txt += '  <RDF:Description RDF:about="' + local_about +'"';
								out_txt += '\n                   NS1:id="0"';
								out_txt += '\n                   NS1:title="'+rdf_hash[""+dbtype].title+'"';
								out_txt += '\n                   NS1:type="localfolder"';
								out_txt += '\n                   NS1:icon="'+rdf_hash[""+dbtype].icon+'"';
								out_txt += '\n                   NS1:editmode="'+ (""+0x1F03) +'"';
								out_txt += '\n                   NS1:cssrule="css_'+dbtype+'_0"';
								out_txt += '\n                   NS1:style=""';
								out_txt += '\n                   NS1:source=""';
								out_txt += '\n                   NS1:addon_id=""';
								out_txt += '\n                   NS1:pfid=""';
								out_txt += '\n                   NS1:pfid_order=""';
								out_txt += '\n                   NS1:uri=""';
								out_txt += '\n                   NS1:comment=""';
								out_txt += '\n                   NS1:chars=""';
								out_txt += '\n                   NS1:shortcut=""';
								out_txt += '\n                   NS1:contextmenu=""';
								out_txt += '\n                   NS1:dbtype="'+dbtype+'"';
								out_txt += '/>\n';
							}

							if(resultsLocal) out_txt += this.Database._outputRDF(resultsLocal);
							resultsLocal = undefined;
						}
					}

					if(mcTreeSharedFolder && mcTreeSharedFolder.isChecked){
						var resultsShared = null;
						if(rtnShared && rtnShared.list) resultsShared = rtnShared.list;
						out_txt += '  <RDF:Seq RDF:about="'+ shared_about +'">\n';
						if(resultsShared){
							resultsShared.sort(
								function(a,b){
									var len = parseFloat(a.pfid_order)-parseFloat(b.pfid_order);
									return len;
								}
							);
							var cnt;
							for(cnt=0;cnt<resultsShared.length;cnt++){
								out_txt += '    <RDF:li RDF:resource="'+ resultsShared[cnt].about +'"/>\n';
							}
						}
						out_txt += '  </RDF:Seq>\n';
						out_txt += '  <RDF:Description RDF:about="' + shared_about +'"';
						out_txt += '\n                   NS1:id="0"';
						out_txt += '\n                   NS1:title="'+this.sharedfolder.title+'"';
						out_txt += '\n                   NS1:type="sharedfolder"';
						out_txt += '\n                   NS1:icon="chrome://markingcollection/skin/sharedfolder.png"';
						out_txt += '\n                   NS1:editmode="'+ (""+0x1003) +'"';
						out_txt += '\n                   NS1:cssrule="css_'+this.Database._sharedMode+'_0"';
						out_txt += '\n                   NS1:style=""';
						out_txt += '\n                   NS1:source=""';
						out_txt += '\n                   NS1:addon_id=""';
						out_txt += '\n                   NS1:pfid=""';
						out_txt += '\n                   NS1:pfid_order=""';
						out_txt += '\n                   NS1:uri=""';
						out_txt += '\n                   NS1:comment=""';
						out_txt += '\n                   NS1:chars=""';
						out_txt += '\n                   NS1:shortcut=""';
						out_txt += '\n                   NS1:dbtype="'+this.Database._sharedMode+'"';
						out_txt += '/>\n';
						if(resultsShared) out_txt += this.Database._outputRDF(resultsShared);
					}
				}else{
					if(dbtype_arr.length>0){
						var dbtype_cnt;
						for(dbtype_cnt=0;dbtype_cnt<dbtype_arr.length;dbtype_cnt++){
							var dbtype = dbtype_arr[dbtype_cnt];
							if(dbtype != rootFolder_dbtype) continue;
							var local_id = dbtype_cnt;
							var local_about = this.sharedfolder.about(local_id);
							var resultsLocal = null;
							if(rdf_hash[""+dbtype] && rdf_hash[""+dbtype].rdf && rdf_hash[""+dbtype].rdf.list) resultsLocal = rdf_hash[""+dbtype].rdf.list;
							if(!resultsLocal) continue;
							out_txt += '  <RDF:Seq RDF:about="'+ bitsObjectMng.DataSource.ABOUT_ROOT +'">\n';
							if(resultsLocal){
								resultsLocal.sort(
									function(a,b){
										var len = parseFloat(a.pfid_order)-parseFloat(b.pfid_order);
										return len;
									}
								);
								var cnt;
								for(cnt=0;cnt<resultsLocal.length;cnt++){
									out_txt += '    <RDF:li RDF:resource="'+ resultsLocal[cnt].about +'"/>\n';
								}
							}
							out_txt += '  </RDF:Seq>\n';
							out_txt += '  <RDF:Description RDF:about="' + local_about +'"';
							out_txt += '\n                   NS1:id="0"';
							out_txt += '\n                   NS1:title="'+rdf_hash[""+dbtype].title+'"';
							out_txt += '\n                   NS1:type="localfolder"';
							out_txt += '\n                   NS1:icon="'+rdf_hash[""+dbtype].icon+'"';
							out_txt += '\n                   NS1:editmode="'+ (""+0x1F03) +'"';
							out_txt += '\n                   NS1:cssrule="css'+dbtype+'_0"';
							out_txt += '\n                   NS1:style=""';
							out_txt += '\n                   NS1:source=""';
							out_txt += '\n                   NS1:addon_id=""';
							out_txt += '\n                   NS1:pfid=""';
							out_txt += '\n                   NS1:pfid_order=""';
							out_txt += '\n                   NS1:uri=""';
							out_txt += '\n                   NS1:comment=""';
							out_txt += '\n                   NS1:chars=""';
							out_txt += '\n                   NS1:shortcut=""';
							out_txt += '\n                   NS1:dbtype="'+dbtype+'"';
							out_txt += '/>\n';
							if(resultsLocal) out_txt += this.Database._outputRDF(resultsLocal);
							resultsLocal = undefined;
							break;
						}
					}
				}
				out_txt += '</RDF:RDF>\n';
				this.Common.writeFile(aFile,out_txt,"UTF-8");
			}
		}catch(ex){
			bitsMarkingCollection._dump("bitsMarkingCollection.rebuildRdf():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	loadXMLDocument : function(pUri){
		try{
			var aFile = this.Common.convertURLToFile(pUri);
			var fileContents = this.Common.readFile(aFile);
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			fileContents = converter.ConvertToUnicode(fileContents);

			var domParser = new DOMParser();
			var xmlDocument = domParser.parseFromString(fileContents, "text/xml");
			domParser = undefined;
			return xmlDocument;
		}catch(ex2){
			bitsMarkingCollection._dump("bitsMarkingCollection.loadXMLDocument("+pUri+"):"+ ex2);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	initProgressmeter : function(){
		var prog = bitsMarkingCollection.ProgressPanel;
		if(prog){
			prog.removeAttribute("hidden");
			prog = bitsMarkingCollection.Progressmeter;
			if(prog) prog.setAttribute("value", "0");
		}
	},

/////////////////////////////////////////////////////////////////////
	execProgressmeter : function(aValue){
		var prog = bitsMarkingCollection.Progressmeter;
		if(prog) prog.value = aValue;
	},

/////////////////////////////////////////////////////////////////////
	endProgessmeter : function(){
		var prog = bitsMarkingCollection.ProgressPanel;
		if(prog) prog.setAttribute("hidden", true);
	},

/////////////////////////////////////////////////////////////////////
	showConsole : function () {
		window.open("chrome://global/content/console.xul", "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(!nsPreferences.getBoolPref("wiredmarker.debug", false)) return;
		var dumpString = new String(aString);
		var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
		                      .getService(Components.interfaces.nsIConsoleService);
		aConsoleService.logStringMessage(dumpString);
		window.dump(aString+"\n");
	},
};
