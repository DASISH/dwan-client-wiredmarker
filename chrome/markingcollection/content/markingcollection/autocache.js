var bitsAutocacheObserver = {
	domain  : 'wiredmarker', //"objectmng.xxx"という名前の設定が変更された場合全てで処理を行う
	observe : function(aSubject, aTopic, aPrefstring) {
		try{
			if (aTopic == 'nsPref:changed') {
				switch (aPrefstring){
					case "wiredmarker.autocache.use":
						var use = nsPreferences.copyUnicharPref(aPrefstring,"valid");
						var exec = nsPreferences.getBoolPref("wiredmarker.autocache.manually.exec",false);
						var btn = bitsAutocacheService.BUTTON;
						if(btn){
							if(use == "switching"){
								btn.removeAttribute("hidden");
							}else if(use == "valid"){
								btn.setAttribute("hidden",true);
							}else{
								var exec = nsPreferences.getBoolPref("wiredmarker.autocache.manually.exec",false);
								if(exec){
									btn.removeAttribute("hidden");
								}else{
									btn.setAttribute("hidden",true);
								}
							}
						}
						var btn = bitsAutocacheService.TOGGLE_BUTTON;
						if(btn){
							if(use == "valid" || exec){
								btn.removeAttribute("hidden");
								if(bitsAutocacheService._pref.view.disp) btn.setAttribute("checked","true");
							}else{
								btn.setAttribute("hidden","true");
								btn.removeAttribute("checked");
								bitsAutocacheService._pref.view.disp = false;
							}
						}
						bitsAutocacheService.toggleCacheView();
						var menu = bitsAutocacheService.CACHEMENU;
						if(menu){
							menu.setAttribute("hidden","true");
							if(use == "valid" || exec) menu.removeAttribute("hidden");
						}
						break;
					case "wiredmarker.autocache.manually.exec":
						var value = nsPreferences.getBoolPref(aPrefstring,false);
						var btn = bitsAutocacheService.BUTTON;
						if(btn){
							if(value){
								btn.removeAttribute("hidden");
							}else{
								btn.setAttribute("hidden",true);
							}
						}
						var btn = bitsAutocacheService.TOGGLE_BUTTON;
						if(btn){
							if(value){
								btn.removeAttribute("hidden");
							}else{
								btn.setAttribute("hidden",true);
							}
							if(bitsAutocacheService._pref.view.disp) btn.setAttribute("checked","true");
						}
						bitsAutocacheService.toggleCacheView();
						var menu = bitsAutocacheService.CACHEMENU;
						if(menu){
							menu.setAttribute("hidden","true");
							if(value) menu.removeAttribute("hidden");
						}
						break;
					case "wiredmarker.autocache.topmenu.display":
						var display = nsPreferences.getBoolPref(aPrefstring, true);
						var menu = bitsAutocacheService.CACHEMENU;
						if(menu){
							if(display){
								menu.removeAttribute("hidden");
							}else{
								menu.setAttribute("hidden","true");
							}
						}
						break;
					default:
						break;
				}
			}
		}catch(ex){
			window.top.bitsObjectMng.Common.alert("bitsAutocacheObserver:"+ex);
		}
	}
};

var bitsAutocacheService = {
	_refreshFlag : true,
	_cahceinfo : {},
	_url2timestamp : {},
	_disabledTimer : null,
	_refreshTimer : null,
	_refreshDTimer : null,
	_openobject : null,
	_pref : {},
	_cacheList : [],
	_cacheList2URL : {},
	_dbConn : null,
	_dbName : "autocache.sqlite",
	_debuginfo : null,
	_debug_idlist : null,

	get STRING() { return document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},
	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get mcTreeHandler() {try{return this.SIDEBAR_WIN.mcTreeHandler;}catch(e){return undefined;}},
	get mcMainService() {try{return this.SIDEBAR_WIN.mcMainService;}catch(e){return undefined;}},
	get mcController() {try{return this.SIDEBAR_WIN.mcController;}catch(e){return undefined;}},
	get mcPropertyView() {try{return this.SIDEBAR_WIN.mcPropertyView;}catch(e){return undefined;}},
	get bitsItemView() {try{return this.SIDEBAR_WIN.bitsItemView;}catch(e){return undefined;}},
	get mcTreeViewModeService() {try{return this.SIDEBAR_WIN.mcTreeViewModeService;}catch(e){return undefined;}},
	get BUTTON(){try{return this.SIDEBAR_DOC.getElementById("mcToolbarAutocacheButton");}catch(e){return undefined;}},
	get OPEN1() {try{return this.SIDEBAR_DOC.getElementById("mcPopupCache");}catch(e){return undefined;}},
	get OPEN2() {try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopupCache");}catch(e){return undefined;}},
	get OPEN3() {try{return this.SIDEBAR_DOC.getElementById("mcPopupObjectCache");}catch(e){return undefined;}},
	get OPEN_MENUTREE(){return window.top.document.getElementById("bitsMenuTreeObjectContextmenuCache");},
	get CACHEMENU(){return window.top.document.getElementById("bitsCacheMenu");},
	get SPLITTER(){try{return this.SIDEBAR_DOC.getElementById("bitsBrowserAutocacheSplitter");}catch(e){return undefined;}},
	get TOGGLE_BUTTON(){try{return this.SIDEBAR_DOC.getElementById("mcToolbarAutocacheView");}catch(e){return undefined;}},
	get VBOX(){try{return this.SIDEBAR_DOC.getElementById("bitsBrowserAutocacheVBox");}catch(e){return undefined;}},
	get TREE(){try{return this.SIDEBAR_DOC.getElementById("bitsAutocacheTree");}catch(e){return undefined;}},
	get VSB(){try{return this.SIDEBAR_DOC.getElementById("bitsAutocacheSearchButton");}catch(e){return undefined;}},
	get VSM(){try{return this.SIDEBAR_DOC.getElementById("bitsAutocacheSearchTextbox");}catch(e){return undefined;}},
	get idTREE_IFAVICON()  { return "bitsAutocacheIFavicon";   },
	get idTREE_IURL()      { return "bitsAutocacheIUrl";       },
	get idTREE_ITITLE()    { return "bitsAutocacheITitle";     },
	get idTREE_IDATE()     { return "bitsAutocacheIDate";      },
	get idTREE_ICACHE()    { return "bitsAutocacheICache";     },
	get idTREE_IMARKER()   { return "bitsAutocacheIMarker";    },
	get idTREE_ICACHESIZE(){ return "bitsAutocacheICacheSize"; },
	get TREE_IFAVICON()    { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_IFAVICON);}catch(e){return undefined;}  },
	get TREE_IURL()        { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_IURL);}catch(e){return undefined;}      },
	get TREE_ITITLE()      { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_ITITLE);}catch(e){return undefined;}    },
	get TREE_IDATE()       { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_IDATE);}catch(e){return undefined;}     },
	get TREE_ICACHE()      { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_ICACHE);}catch(e){return undefined;}    },
	get TREE_IMARKER()     { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_IMARKER);}catch(e){return undefined;}   },
	get TREE_ICACHESIZE()  { try{return this.SIDEBAR_DOC.getElementById(this.idTREE_ICACHESIZE);}catch(e){return undefined;}},
	get idCONTEXTMENU_OPENALL(){ return "bitsAutocacheTreeContextmenuCacheOpenAll"; },
	get CONTEXTMENU_OPENALL(){try{return this.SIDEBAR_DOC.getElementById(this.idCONTEXTMENU_OPENALL);}catch(e){return undefined;}},

/////////////////////////////////////////////////////////////////////
	get default_cachedir(){
		var dir = this.Common.getExtensionDir();
		dir.append("cache");
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	get cachedir(){
		try{
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			var cache_folder = prefs.getComplexValue("wiredmarker.autocache.save.folder", Components.interfaces.nsILocalFile);
		}catch(e){
			cache_folder = undefined;
		}
		var save_default = nsPreferences.getBoolPref("wiredmarker.autocache.save.default", true);
		if(save_default || !cache_folder){
			return this.default_cachedir;
		}else{
			return cache_folder;
		}
	},

/////////////////////////////////////////////////////////////////////
	getCacheDir : function(){
		var dir;
		if(this.bitsItemView && this.bitsItemView.isChecked){
			var object = this.bitsItemView.object;
			if(object) dir = this.getURLCacheDirFromTimeStamp(object.doc_url,object.oid_date);
		}else{
			var curIdx = this.mcTreeHandler.TREE.currentIndex;
			var curRes = null;
			if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)) curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(curRes) dir = this.getURLCacheDirFromTimeStamp(this.DataSource.getProperty(curRes,"uri"),this.DataSource.getProperty(curRes,"date"));
		}
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	setCacheInfo : function(aURLString,aCacheInfo){
		if(!aURLString || !aCacheInfo) return;
		if(this.isCacheURL(aURLString)) return;
		if(!this._cahceinfo[aURLString]) this._cahceinfo[aURLString] = {};
		for(var key in aCacheInfo){
			this._cahceinfo[aURLString][key] = aCacheInfo[key];
		}
	},

/////////////////////////////////////////////////////////////////////
	getCacheInfo : function(aURLString){
		if(!aURLString) return undefined;
		return (this._cahceinfo[aURLString]?this._cahceinfo[aURLString]:undefined);
	},

/////////////////////////////////////////////////////////////////////
// 指定URLがキャッシュドキュメントへのURLか
/////////////////////////////////////////////////////////////////////
	isCacheURL : function(aURLString){
		if(!aURLString || !aURLString.match(/^file:/)) return false;
		var docFile = this.Common.convertURLToFile(aURLString);
		var autocachedir = this.cachedir;
		var rtn = (autocachedir.path == docFile.path.substr(0,autocachedir.path.length));
		if(rtn) return rtn;
		var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
		url.spec = aURLString;
		var path = url.scheme + "://" + url.host +url.directory;
		var histdbs = this._selectHistoryDB({hid_file:url.fileName,hid_path:path});
		return (histdbs?true:false);
	},

/////////////////////////////////////////////////////////////////////
// キャッシュドキュメントの場合、マーキングするか
/////////////////////////////////////////////////////////////////////
	isMarking : function(aURLString){
		
		var use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use", "valid");
		if(use == "disabled") return true;
		if(!this.isCacheURL(aURLString)) return true;
		var autocache_marking = nsPreferences.copyUnicharPref("wiredmarker.autocache.marking","confirm");
		if(autocache_marking == "disabled"){
			this.Common.alert(this.STRING.getString("ALERT_CACHEPAGE_MARKING"));
			return false;
		}
		if(autocache_marking == "confirm"){
			var info = this.getSaveCacheInfo(aURLString);
			var prompts = this.Common.PROMPT;
			var title = this.STRING.getString("APP_DISP_TITLE");
			var flags;
			if(info && info.URL){
				flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_YES +
					prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
					prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_NO +
					prompts.BUTTON_POS_2_DEFAULT;
			}else{
				flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_YES +
					prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_NO +
					prompts.BUTTON_POS_1_DEFAULT;
			}
			var checkMsg = null;
			var checkState = {value: false};
			var button = prompts.confirmEx(
				window,
				title,
				this.STRING.getString("CONFIRM_CACHEPAGE_MARKING"),
				flags, "", this.STRING.getString("BUTTON_CACHEPAGE_MARKING"), "", checkMsg, checkState);
			if(button!=0){
				if(info && info.URL && button==1) this.Common.loadURL(info.URL);
				return false;
			}
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
// 指定した日時のキャッシュが存在するか
/////////////////////////////////////////////////////////////////////
	existsCache : function(aURLString,aTimeStamp){
		if(!aURLString){
			var dir = this.cachedir.clone();
			var dir_arr = [];
			if(dir.exists() && dir.directoryEntries){
				var entries = dir.directoryEntries;
				while(entries.hasMoreElements()){
					var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
					dir_arr.push(entry);
				}
			}
			return (dir_arr.length>0?true:false);
		}
		if(aTimeStamp && aTimeStamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)) aTimeStamp = RegExp.$3 + RegExp.$1 + RegExp.$2 + RegExp.$4 + RegExp.$5 + RegExp.$6;
		var dir = this.getURLCacheDir(aURLString);
		if(dir || !dir.exists()) return false;
		if(aTimeStamp) dir.append(aTimeStamp);
		return dir.exists();
	},

/////////////////////////////////////////////////////////////////////
// ドキュメントを開いた日時
/////////////////////////////////////////////////////////////////////
	getURLTimeStamp : function(aURLString){
		if(!aURLString) return undefined;
		// キャッシュの場合、キャッシュした日時を返す
		if(this.isCacheURL(aURLString)){
			var file = this.getSaveCacheInfoFile(aURLString);
			if(file && file.parent) return file.parent.leafName;
		}
		if(this._url2timestamp[aURLString] == undefined) this._url2timestamp[aURLString] = this.Common.getTimeStamp();
		return this._url2timestamp[aURLString];
	},

	getURLTimeStampFormatDate : function(aURLString){
		if(!aURLString) return undefined;
		var timeStamp = this.getURLTimeStamp(aURLString);
		if(!timeStamp) return undefined;
		if(timeStamp.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
			return RegExp.$2+"/"+RegExp.$3+"/"+RegExp.$1+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
// キャッシュURLをオリジナルのURLへ変換
/////////////////////////////////////////////////////////////////////
	convertCacheURLToOriginalURL : function(aURLString){
		if(!aURLString) return undefined;
		if(!this.isCacheURL(aURLString)) return aURLString;
		try{
			var infofile = this.getSaveCacheInfoFile(aURLString);
			var infodir = infofile.parent.clone();
			var baseURL = this.Common.convertFilePathToURL(infodir.path);
			var urlinfo_str = this._getSaveCacheUrlInfo(infodir);
			var urlinfo = {};
			var urlinfo_arr = urlinfo_str.split("\n");
			var i;
			var arr;
			for(i=0;i<urlinfo_arr.length;i++){
				arr = urlinfo_arr[i].split("\t");
				if(arr.length>1) urlinfo[arr[1]] = arr[0];
			}
			var cacheurl = aURLString.substring(baseURL.length);
			if(cacheurl.match(/^([^\?#;]+)([\?#;].*)$/)){
				cacheurl = RegExp.$1;
				if(urlinfo[cacheurl] != undefined) return urlinfo[cacheurl] + RegExp.$2;
			}else{
				if(urlinfo[cacheurl] != undefined) return urlinfo[cacheurl];
			}
		}catch(e){
			this._dump("bitsAutocacheService.convertCacheURLToOriginalURL():aURLString=["+aURLString+"]");
			this._dump("bitsAutocacheService.convertCacheURLToOriginalURL():"+e);
			return aURLString;
		}
	},

/////////////////////////////////////////////////////////////////////
// URLとタイムスタンプでフォルダ
/////////////////////////////////////////////////////////////////////
	getURLCacheDirFromTimeStamp : function(aURLString,aTimeStamp){
		if(!aURLString || !aTimeStamp) return undefined;
		var dir = this.cachedir.clone();
		if(aTimeStamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)) aTimeStamp = RegExp.$3 + RegExp.$1 + RegExp.$2 + RegExp.$4 + RegExp.$5 + RegExp.$6;
		if(aTimeStamp.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
			dir.append(RegExp.$1);
			dir.append(RegExp.$2);
			dir.append(RegExp.$3);
			dir.append(RegExp.$4);
		}else{
			dir.append(aTimeStamp.substr(0,4));
			if(aTimeStamp.length>3) dir.append(aTimeStamp.substr(3,2));
			if(aTimeStamp.length>5) dir.append(aTimeStamp.substr(5,2));
			if(aTimeStamp.length>7) dir.append(aTimeStamp.substr(7,2));
		}
		dir.append(this._string2CryptoHash(aURLString));
		dir.append(aTimeStamp);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
// URLのBaseCacheフォルダ
/////////////////////////////////////////////////////////////////////
	getURLCacheDir : function(aURLString,aBaseDir){
		if(!aURLString) return undefined;
		var dir;
		if(aBaseDir){
			dir = aBaseDir.clone();
		}else{
			dir = this.cachedir.clone();
		}
		dir.append(this._string2CryptoHash(aURLString));
		return dir;
	},

/////////////////////////////////////////////////////////////////////
// 新規のCacheフォルダ
/////////////////////////////////////////////////////////////////////
	getNewCacheDir : function(aURLString,aBaseDir){
		if(!aURLString) return undefined;
		var dir = this.getURLCacheDir(aURLString,aBaseDir);
		dir.append(this.getURLTimeStamp(aURLString));
		return dir;
	},

/////////////////////////////////////////////////////////////////////
// 最新のCacheのタイムスタンプ
/////////////////////////////////////////////////////////////////////
	getNewestCacheTimeStamp : function(aURLString,aBaseDir){
		if(!aURLString) return undefined;
		var dir = this.getURLCacheDir(aURLString,aBaseDir);
		if(!dir.exists()) return undefined;
		var dir_arr = [];
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
			dir_arr.push(entry);
		}
		if(dir_arr.length>0){
			dir_arr.sort(function(a, b) { return(parseInt(b.leafName) - parseInt(a.leafName)); });
			return dir_arr[0].leafName;
		}else{
			return undefined;
		}
	},

	getNewestCacheFormatDate : function(aURLString,aBaseDir){
		var timeStamp = this.getNewestCacheTimeStamp(aURLString,aBaseDir);
		if(!timeStamp) return undefined;
		if(timeStamp.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
			return RegExp.$2+"/"+RegExp.$3+"/"+RegExp.$1+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
// 最新のCacheフォルダ
/////////////////////////////////////////////////////////////////////
	getNewestCacheDir : function(aURLString,aBaseDir){
		if(!aURLString) return undefined;
		var dir = this.getURLCacheDir(aURLString,aBaseDir);
		if(!dir.exists()) return undefined;
		var newestCacheTimeStamp = this.getNewestCacheTimeStamp(aURLString,aBaseDir);
		if(newestCacheTimeStamp){
			dir.append(newestCacheTimeStamp);
			return dir;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
// 指定した日時の直前のタイムスタンプ
/////////////////////////////////////////////////////////////////////
	getApproximateCacheTimeStamp : function(aURLString,aTimeStamp){
		if(!aURLString || !aTimeStamp) return undefined;
		if(aTimeStamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)) aTimeStamp = RegExp.$3+RegExp.$1+RegExp.$2+RegExp.$4+RegExp.$5+RegExp.$6;
		var dir = this.getURLCacheDir(aURLString);
		if(!dir.exists()) return undefined;
		var minDir=dir.clone();
		if(aTimeStamp){
			minDir.append(aTimeStamp);
			if(minDir.exists()) return minDir;
			minDir = undefined;
		}
		var min = -1;
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
			if(parseInt(aTimeStamp) < parseInt(entry.leafName)) continue;
			if(min<0 || (parseInt(aTimeStamp)- parseInt(entry.leafName))<min){
				min = parseInt(aTimeStamp)- parseInt(entry.leafName);
				minDir = entry.clone();
				if(min == 0) break;
			}
		}
		if(minDir){
			return minDir.leafName;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
// 指定した日時の直前のCacheフォルダ
/////////////////////////////////////////////////////////////////////
	getApproximateCacheDir : function(aURLString,aTimeStamp){
		if(!aURLString) return undefined;
		var dir = this.getURLCacheDir(aURLString);
		if(!dir.exists()) return undefined;
		var approximateCacheTimeStamp = this.getApproximateCacheTimeStamp(aURLString,aTimeStamp);
		if(approximateCacheTimeStamp){
			dir.append(approximateCacheTimeStamp);
			return dir;
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
// 保存したのCacheの情報を取得
/////////////////////////////////////////////////////////////////////
	getSaveCacheInfo : function(aURLString){
		var aFile = this.Common.convertURLToFile(aURLString);
		if(!aFile || !aFile.exists()) return undefined;
		return this._getSaveCacheInfo((aFile.isDirectory() ? aFile : aFile.parent));
	},
	getSaveCacheInfoFile : function(aURLString){
		var aFile = this.Common.convertURLToFile(aURLString);
		if(!aFile || !aFile.exists()) return undefined;
		return this._getSaveCacheInfoFile((aFile.isDirectory() ? aFile : aFile.parent));
	},
	_getSaveCacheInfoFile : function(aInfoDir){
		if(!aInfoDir) return undefined;
		var infoFile = aInfoDir.clone();
		infoFile.append(".info");
		while(!infoFile.exists()){
			try{if(!aInfoDir.parent) return undefined;}catch(e){return undefined;}
			aInfoDir = aInfoDir.parent.clone();
			infoFile = aInfoDir.clone();
			infoFile.append(".info");
		}
		return infoFile.clone();
	},
	_getSaveCacheInfo : function(aInfoDir){
		if(!aInfoDir) return undefined;
		var infoFile = this._getSaveCacheInfoFile(aInfoDir);
		if(!infoFile) return undefined;
		var info_str = this.readFile(infoFile);
		if(!info_str) return undefined;
		var info = {};
		var info_arr = info_str.split("\n");
		for(var i=0;i<info_arr.length;i++){
			var arr = info_arr[i].split("\t");
			info[arr[0]] = arr[1];
		}
		return info;
	},

	_getSaveCacheUrlInfo : function(aInfoDir){
		if(!aInfoDir) return undefined;
		var infoFile = aInfoDir.clone();
		infoFile.append(".urlinfo");
		var info_str = this.readFile(infoFile);
		if(!info_str) return undefined;
		return info_str;
	},

/////////////////////////////////////////////////////////////////////
	init : function(){
		this.gBrowser.addEventListener("pageshow", this.pageshow, false);
		this.gBrowser.tabContainer.addEventListener("TabSelect", this.tabselect, false);
		bitsMenuTree.POPUP.addEventListener("popupshowing",this.popupshowing_menutree, false);
		this.Common.addPrefListener(bitsAutocacheObserver);
		if(this._connectDB()){
			this._insertInitDB();
		}
		var menu = this.CACHEMENU;
		if(menu){
			menu.setAttribute("hidden","true");
			var display = nsPreferences.getBoolPref("wiredmarker.autocache.topmenu.display", false);
			if(display){
				var use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use", "valid");
				if(use == "valid"){
					menu.removeAttribute("hidden");
				}else if(use == "disabled" && nsPreferences.getBoolPref("wiredmarker.autocache.manually.exec",false)){
					menu.removeAttribute("hidden");
				}else if(use != "valid" && use != "disabled"){
					use = "valid";
					nsPreferences.setUnicharPref("wiredmarker.autocache.use", use);
				}
			}
		}
		var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		this._app_version = parseInt(info.version);
		this._pref.view = {
			disp : nsPreferences.getBoolPref("wiredmarker.autocache.view.disp", false),
		};
	},

/////////////////////////////////////////////////////////////////////
	done : function(){
		this.gBrowser.removeEventListener("pageshow", this.pageshow, false);
		this.gBrowser.tabContainer.removeEventListener("TabSelect", this.tabselect, false);
		bitsMenuTree.POPUP.removeEventListener("popupshowing",this.popupshowing_menutree, false);
		this.Common.removePrefListener(bitsAutocacheObserver);
		this._disconnectDB();
		nsPreferences.setBoolPref("wiredmarker.autocache.view.disp", this._pref.view.disp);
	},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){
		this.SPLITTER.setAttribute("hidden","true");
		if(this.bitsItemView && this.bitsItemView.isChecked){
			this.bitsItemView.POPUP.addEventListener("popupshowing",this.popupshowing, false);
		}else{
			this.mcTreeHandler.POPUP.addEventListener("popupshowing",this.popupshowing, false);
			this.mcTreeHandler.POPUP_OBJECT.addEventListener("popupshowing",this.popupshowing, false);
		}
		var btn = this.BUTTON;
		if(btn){
			var use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use", "valid");
			if(use == "switching"){
				btn.removeAttribute("hidden");
			}else if(use == "disabled" && nsPreferences.getBoolPref("wiredmarker.autocache.manually.exec",false)){
				btn.removeAttribute("hidden");
			}
		}
		var btn = this.TOGGLE_BUTTON;
		if(btn){
			var use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use", "valid");
			if(use == "valid"){
				btn.removeAttribute("hidden");
			}else if(use == "disabled" && nsPreferences.getBoolPref("wiredmarker.autocache.manually.exec",false)){
				btn.removeAttribute("hidden");
			}
			if(this._pref.view.disp) btn.setAttribute("checked","true");
			if(!btn.hasAttribute("hidden") && btn.hasAttribute("checked")) this.SPLITTER.removeAttribute("hidden");
		}
		this.toggleCacheView();
		if(!this.TREE.hasAttribute("hidden")) this.rebuild();
	},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){
		if(this.bitsItemView && this.bitsItemView.isChecked){
			this.bitsItemView.POPUP.removeEventListener("popupshowing",this.popupshowing, false);
		}else if(this.mcTreeHandler){
			this.mcTreeHandler.POPUP.removeEventListener("popupshowing",this.popupshowing, false);
			this.mcTreeHandler.POPUP_OBJECT.removeEventListener("popupshowing",this.popupshowing, false);
		}
	},

/////////////////////////////////////////////////////////////////////
// キャッシュファイルを開いたときの処理を行う
/////////////////////////////////////////////////////////////////////
	pageshow : function(aEvent){
		bitsAutocacheService._pageshow(aEvent);
	},

	_pageshow : function(aEvent){
		var btn = this.BUTTON;
		if(btn) btn.removeAttribute("disabled");
		var urlString = this.Common.getURLStringFromDocument(aEvent.target);
		if(!this.isCacheURL(urlString)){
			try{
				var aURL = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
				aURL.spec = urlString;
			}catch(ex){
				this._dump("bitsAutocacheService._pageshow():"+ ex);
				aURL = undefined;
			}
			if(aURL && aURL.scheme == "file"){
				var fileHandler = this.Common.IO.getProtocolHandler(aURL.scheme).QueryInterface(Components.interfaces.nsIFileProtocolHandler);
				var file = fileHandler.getFileFromURLSpec(urlString);
				var dd = new Date;
				dd.setTime(file.lastModifiedTime);
				var y = dd.getFullYear();
				var m = dd.getMonth() + 1; if(m < 10) m = "0" + m;
				var d = dd.getDate();      if(d < 10) d = "0" + d;
				var h = dd.getHours();     if(h < 10) h = "0" + h;
				var i = dd.getMinutes();   if(i < 10) i = "0" + i;
				var s = dd.getSeconds();   if(s < 10) s = "0" + s;
				this._url2timestamp[urlString] = y.toString() + m.toString() + d.toString() + h.toString() + i.toString() + s.toString();
			}else{
				this._url2timestamp[urlString] = this.Common.getTimeStamp();
			}
			this.disabledButton(aEvent.target);
			try{
				var row = this._cacheList2URL[urlString];
				if(row != undefined){
					this.TREE.currentIndex = row;
					if(!this.TREE.view.selection.isSelected(row)) this.TREE.view.selection.select(row);
					this.TREE.treeBoxObject.ensureRowIsVisible(row);
				}
			}catch(e){}
		}else{
			try{
				var doc = aEvent.target;
				if(doc.location.toString() == this.gBrowser.contentDocument.location.toString()){
					var info = this.getSaveCacheInfo(urlString);
					var timestamp = this.getURLTimeStampFormatDate(urlString);
					var cached_msg = "Cached from " + info.URL;
					if(timestamp) cached_msg += " on " + timestamp;
					doc.title = "["+ cached_msg + "] : " + doc.title;
				}
			}catch(e){alert(e);}
		}
		if(btn) btn.setAttribute("disabled","true");

		var info = this.getSaveCacheInfo(urlString);
		var rtn = bitsMarkingCollection.marking(aEvent.target,(info?info.URL:undefined));
		if(this._isOpenCache && (typeof this._isOpenCache == "string" && this._isOpenCache == urlString)){
			this._isOpenCache = undefined;
			var markerid;
			var oid;
			var style;
			var dbtype;
			if(this._openobject){
				oid = this._openobject.oid;
				style = this._openobject.fid_style;
				dbtype = this._openobject.dbtype;
				markerid = bitsMarker.id_key + this._openobject.dbtype + this._openobject.oid;
				this._openobject = null;
			}else if(this.bitsItemView && this.bitsItemView.isChecked){
				var object = this.bitsItemView.object;
				if(object){
					oid = object.oid;
					style = object.fid_style;
					dbtype = object.dbtype;
					markerid = bitsMarker.id_key + object.dbtype + object.oid;
				}
			}else if(this.mcTreeHandler){
				var curIdx = this.mcTreeHandler.TREE.currentIndex;
				var curRes = null;
				if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)) curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
				if(curRes){
					oid = this.DataSource.getProperty(curRes,"id");
					style = this.DataSource.getProperty(curRes,"style");
					dbtype = this.DataSource.getProperty(curRes,"dbtype");
					markerid = bitsMarker.id_key + dbtype + oid;
				}
			}
			if(markerid){ if(!this.Common.doTopElement(markerid,style,oid,dbtype)) this.Common.doTopElementIMG(oid,dbtype); }
		}
		if(this.TREE && this.TREE.view && info && info.URL && this._cacheList2URL && this._cacheList2URL[info.URL] != undefined){
			this.TREE.currentIndex = this._cacheList2URL[info.URL];
			if(!this.TREE.view.selection.isSelected(this.TREE.currentIndex)) this.TREE.view.selection.select(this.TREE.currentIndex);
			this.TREE.treeBoxObject.ensureRowIsVisible(this.TREE.currentIndex);
		}
	},

/////////////////////////////////////////////////////////////////////
	tabselect : function(aEvent){
		bitsAutocacheService._tabselect(aEvent);
	},

	_tabselect : function(aEvent){
		this.disabledButton(this.gBrowser.selectedBrowser.contentDocument);
	},

/////////////////////////////////////////////////////////////////////
	popupshowingMainContextmenu : function(aEvent){
		if(aEvent.target.id != "bitsCacheContextmenuPopup") return;
		this._explicitOriginalTarget = aEvent.explicitOriginalTarget;
	},

/////////////////////////////////////////////////////////////////////
	popupshowingMainmenu : function(aEvent){
		if(!aEvent.target.nodeName || aEvent.target.nodeName != "menupopup") return;
		aEvent.stopPropagation();
		if(aEvent.target.id == "bitsCacheMenuPopup"){
			var urlsdb = this._selectUrlDB();
			if(!urlsdb){
				var menuitem = document.createElement("menuitem");
				menuitem.setAttribute("label",this.STRING.getString("MSG_CACHEPAGE_NONE"));
				menuitem.setAttribute("disabled","true");
				aEvent.target.appendChild(menuitem);
				return;
			}
			var urlcnt;
			var histcnt;
			for(urlcnt=0;urlcnt<urlsdb.length;urlcnt++){
				var histsdb = this._selectHistoryDB({uid_url:urlsdb[urlcnt].uid_url});
				if(!histsdb) continue;
				histcnt = 0;
				urlsdb[urlcnt] = histsdb[histcnt];
			}
			if(urlsdb.length>0) urlsdb.sort(function(a, b) { return(parseInt(b.hid_date) - parseInt(a.hid_date)); });
			var topmenu_number = nsPreferences.getIntPref("wiredmarker.autocache.topmenu.number", 0);
			if(topmenu_number) urlsdb.length = topmenu_number;
			for(urlcnt=0;urlcnt<urlsdb.length;urlcnt++){
				var menu = document.createElement("menu");
				menu.setAttribute("label",urlsdb[urlcnt].hid_title);
				var icon = this.Database.getFavicon(urlsdb[urlcnt].uid_url);
				if(!icon) icon = "chrome://markingcollection/skin/defaultFavicon.png";
				if(icon){
					menu.setAttribute("class","menu-iconic");
					menu.setAttribute("image",icon);
				}
				menu.setAttribute("contextmenu","bitsCacheContextmenuPopup");
				menu.setAttribute("doc_url",urlsdb[urlcnt].uid_url);
				var menupopup = document.createElement("menupopup");
				menupopup.setAttribute("doc_url",urlsdb[urlcnt].uid_url);
				menu.appendChild(menupopup);
				aEvent.target.appendChild(menu);
			}
		}else if(aEvent.target.hasAttribute("file_url") && aEvent.target.hasAttribute("doc_url")){  //この処理は使用しない
			var dir = this.Common.convertURLToFile(aEvent.target.getAttribute("file_url"));
			var doc_url = aEvent.target.getAttribute("doc_url");
			var temp_arr = [];
			var temp_entries = dir.directoryEntries;
			while(temp_entries.hasMoreElements()){
				var temp_entry = temp_entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				if(!temp_entry.isDirectory() || (temp_entry.isDirectory() && temp_entry.leafName.match(/^\./))) continue;
				temp_arr.push(temp_entry);
			}
			if(temp_arr.length>0) temp_arr.sort(function(a, b) { return(parseInt(b.leafName) - parseInt(a.leafName)); });
			var itemcnt;
			for(itemcnt=0;itemcnt<temp_arr.length;itemcnt++){
				var objs = null;
				var menu = document.createElement("menu");
				if(temp_arr[itemcnt].leafName.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
					var item_label = RegExp.$1+"/"+RegExp.$2+"/"+RegExp.$3+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
					var item_date = RegExp.$2+"/"+RegExp.$3+"/"+RegExp.$1+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
					if(doc_url){
						objs = this.Database.getObject({doc_url : doc_url, oid_date : item_date});
						item_label += " (" + (objs?objs.length:0) + ")";
					}
					menu.setAttribute("label",item_label);
				}else{
					menu.setAttribute("label",temp_arr[itemcnt].leafName);
				}
				menu.setAttribute("class","menu-iconic");
				menu.setAttribute("image","chrome://markingcollection/skin/defaultFavicon.png");
				var menupopup = document.createElement("menupopup");
				menupopup.setAttribute("oid_date",temp_arr[itemcnt].leafName);
				var info = this._getSaveCacheInfo(temp_arr[itemcnt]);
				if(info && info.URL) menupopup.setAttribute("doc_url",info.URL);
				menu.appendChild(menupopup);
				var contextmenu = document.getElementById("bitsCacheMenuPopupMenupopup");
				if(contextmenu && contextmenu.hasChildNodes()){
					var childNode = contextmenu.firstChild;
					while(childNode){
						menupopup.appendChild(childNode.cloneNode(true));
						childNode = childNode.nextSibling;
					}
				}
				if(objs){
					var menuseparator = document.createElement("menuseparator");
					menupopup.appendChild(menuseparator);
					var objcnt;
					for(objcnt=0;objcnt<objs.length;objcnt++){
						var menuitem = document.createElement("menuitem");
						bitsMenuTree._setMenuitemObjectAttribute(menuitem,objs[objcnt]);
						menuitem.addEventListener("command",this.commandTreeContextmenu,false);
						menupopup.appendChild(menuitem);
					}
				}
				aEvent.target.appendChild(menu);
			}
		}else if(aEvent.target.hasAttribute("doc_url") && !aEvent.target.hasAttribute("oid_date")){
			var doc_url = aEvent.target.getAttribute("doc_url");
			var histsdb = this._selectHistoryDB({uid_url:doc_url});
			if(!histsdb){
				aEvent.target.setAttribute("hidden","true");
				return;
			}
			var histcnt;
			for(histcnt=0;histcnt<histsdb.length;histcnt++){
				var objs = null;
				var menu = document.createElement("menu");
				if(histsdb[histcnt].hid_date.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
					var item_label = RegExp.$1+"/"+RegExp.$2+"/"+RegExp.$3+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
					var item_date = RegExp.$2+"/"+RegExp.$3+"/"+RegExp.$1+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
					if(doc_url){
						objs = this.Database.getObject({doc_url : doc_url, oid_date : item_date});
						item_label += " (" + (objs?objs.length:0) + ")";
					}
					menu.setAttribute("label",item_label);
				}else{
					menu.setAttribute("label",histsdb[histcnt].hid_date);
				}
				menu.setAttribute("class","menu-iconic");
				menu.setAttribute("image","chrome://markingcollection/skin/defaultFavicon.png");
				menu.setAttribute("doc_url",histsdb[histcnt].uid_url);
				menu.setAttribute("oid_date",histsdb[histcnt].hid_date);
				var menupopup = document.createElement("menupopup");
				menupopup.setAttribute("doc_url",histsdb[histcnt].uid_url);
				menupopup.setAttribute("oid_date",histsdb[histcnt].hid_date);
				menu.appendChild(menupopup);
				var contextmenu = document.getElementById("bitsCacheMenuPopupMenupopup");
				if(contextmenu && contextmenu.hasChildNodes()){
					var childNode = contextmenu.firstChild;
					while(childNode){
						menupopup.appendChild(childNode.cloneNode(true));
						childNode = childNode.nextSibling;
					}
				}
				if(objs){
					var menuseparator = document.createElement("menuseparator");
					menupopup.appendChild(menuseparator);
					var objcnt;
					for(objcnt=0;objcnt<objs.length;objcnt++){
						var menuitem = document.createElement("menuitem");
						bitsMenuTree._setMenuitemObjectAttribute(menuitem,objs[objcnt]);
						menuitem.addEventListener("command",this.commandTreeContextmenu,false);
						menupopup.appendChild(menuitem);
					}
				}
				aEvent.target.appendChild(menu);
			}
		}else{
		}

	},

/////////////////////////////////////////////////////////////////////
	popuphidingMainmenu : function(aEvent){
		if(!aEvent.target.nodeName || aEvent.target.nodeName != "menupopup") return;
		aEvent.stopPropagation();
		if(aEvent.target.id == "bitsCacheMenuPopup" || (!aEvent.target.hasAttribute("oid_date") && aEvent.target.hasAttribute("doc_url"))){
			while(aEvent.target.hasChildNodes()){
				aEvent.target.removeChild(aEvent.target.lastChild);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshowingTreeContextmenu : function(aEvent){
		if(!aEvent.target.nodeName || aEvent.target.nodeName != "popup") return;
		if(!this._cacheList || this.TREE.currentIndex<0 || this._cacheList.length<this.TREE.currentIndex || !this._cacheList[this.TREE.currentIndex]) return;
		var menuitem = this.CONTEXTMENU_OPENALL;
		var sellist = this.getSelection();
		if(sellist && sellist.length>1){
			if(menuitem) menuitem.setAttribute("hidden","true");
			return;
		}else{
			if(menuitem) menuitem.removeAttribute("hidden");
		}
		var cacheinfo = this._cacheList[this.TREE.currentIndex];
		var doc_url = cacheinfo.URL;
		var temp_arr = this._selectHistoryDB({uid_url:doc_url});
		var itemcnt;
		for(itemcnt=0;itemcnt<temp_arr.length;itemcnt++){
			var objs = null;
			var menu = document.createElement("menu");
			if(temp_arr[itemcnt].hid_date.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
				var item_label = RegExp.$1+"/"+RegExp.$2+"/"+RegExp.$3+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
				var item_date = RegExp.$2+"/"+RegExp.$3+"/"+RegExp.$1+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
				if(doc_url){
					objs = this.Database.getObject({doc_url : doc_url, oid_date : item_date});
					item_label += " (" + (objs?objs.length:0) + ")";
				}
				menu.setAttribute("label",item_label);
			}else{
				menu.setAttribute("label",temp_arr[itemcnt].hid_date);
			}
			menu.setAttribute("class","menu-iconic");
			menu.setAttribute("image","chrome://markingcollection/skin/defaultFavicon.png");
			var menupopup = document.createElement("menupopup");
			menupopup.setAttribute("oid_date",temp_arr[itemcnt].hid_date);
			menupopup.setAttribute("doc_url",doc_url);
			menu.appendChild(menupopup);
			var contextmenu = aEvent.target.ownerDocument.getElementById("bitsAutocacheTreeItemContextmenu");
			if(contextmenu && contextmenu.hasChildNodes()){
				var childNode = contextmenu.firstChild;
				while(childNode){
					menupopup.appendChild(childNode.cloneNode(true));
					childNode = childNode.nextSibling;
				}
			}
			if(objs){
				var menuseparator = document.createElement("menuseparator");
				menupopup.appendChild(menuseparator);
				var objcnt;
				for(objcnt=0;objcnt<objs.length;objcnt++){
					var menuitem = document.createElement("menuitem");
					bitsMenuTree._setMenuitemObjectAttribute(menuitem,objs[objcnt]);
					menuitem.removeAttribute("contextmenu");
					menuitem.addEventListener("command",this.commandTreeContextmenu,false);
					menupopup.appendChild(menuitem);
				}
			}
			aEvent.target.appendChild(menu);
		}
	},

/////////////////////////////////////////////////////////////////////
	popuphidingTreeContextmenu : function(aEvent){
		if(!aEvent.target.nodeName || aEvent.target.nodeName != "popup") return;
		while(aEvent.target.hasChildNodes()){
			if(aEvent.target.lastChild.nodeName == "menuseparator") break;
			aEvent.target.removeChild(aEvent.target.lastChild);
		}
	},

/////////////////////////////////////////////////////////////////////
	commandTreeContextmenu : function(aEvent){
		bitsAutocacheService._commandTreeContextmenu(aEvent);
	},

	_commandTreeContextmenu : function(aEvent){
		this.openCache(aEvent, aEvent.shiftKey);
	},

/////////////////////////////////////////////////////////////////////
	commandMainmenu : function(aEvent){
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_menutree : function(aEvent){
		bitsAutocacheService._popupshowing_menutree(aEvent);
	},
	_popupshowing_menutree : function(aEvent){
		this.OPEN_MENUTREE.setAttribute("hidden","true");
		var autocache_use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use","valid");
		if(autocache_use == "disabled") return;
		this.OPEN_MENUTREE.removeAttribute("hidden");

		if(!bitsMenuTree._explicitOriginalTarget){
			this.OPEN_MENUTREE.setAttribute("disabled","true");
			return;
		}
		var target = bitsMenuTree._explicitOriginalTarget;
		var dir = this.getURLCacheDirFromTimeStamp(target.getAttribute("doc_url"),target.getAttribute("oid_date"));
		if(!dir || !dir.exists()){
			var histsdb = this._selectHistoryDB({uid_url:target.getAttribute("doc_url"),hid_date:target.getAttribute("oid_date")});
			if(histsdb) dir = this.Common.convertURLToFile(histsdb[0].hid_path);
		}
		if(!dir || !dir.exists()){
			this.OPEN_MENUTREE.setAttribute("disabled","true");
		}else{
			this.OPEN_MENUTREE.removeAttribute("disabled");
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshowing : function(aEvent){
		bitsAutocacheService._popupshowing(aEvent);
	},
	_popupshowing : function(aEvent){
		var doc_url;
		var oid_date;
		this.OPEN1.setAttribute("hidden","true");
		this.OPEN2.setAttribute("hidden","true");
		this.OPEN3.setAttribute("hidden","true");
		var autocache_use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use","valid");
		if(autocache_use == "disabled") return;
		if(this.bitsItemView && this.bitsItemView.isChecked){
			this.OPEN2.removeAttribute("hidden");
			var object = this.bitsItemView.object;
			if(object){
				doc_url = object.doc_url;
				oid_date = object.oid_date;
			}
		}else{
			this.OPEN3.removeAttribute("hidden");
			var curRes = null;
			var curIdx = this.mcTreeHandler.TREE.currentIndex;
			if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)){
				this.OPEN1.removeAttribute("hidden");
				curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			}
			if(curRes){
				doc_url = this.DataSource.getProperty(curRes,"uri");
				oid_date = this.DataSource.getProperty(curRes,"date");
			}
		}
		var dir;
		if(doc_url && oid_date){
			dir = this.getURLCacheDirFromTimeStamp(doc_url,oid_date);
			if(!dir || !dir.exists()){
				var histsdb = this._selectHistoryDB({uid_url:doc_url,hid_date:oid_date});
				if(histsdb) dir = this.Common.convertURLToFile(histsdb[0].hid_path);
			}
		}
		if(!dir || !dir.exists()){
			this.OPEN1.setAttribute("disabled","true");
			this.OPEN2.setAttribute("disabled","true");
			this.OPEN3.setAttribute("disabled","true");
		}else{
			this.OPEN1.removeAttribute("disabled");
			this.OPEN2.removeAttribute("disabled");
			this.OPEN3.removeAttribute("disabled");
		}
	},

/////////////////////////////////////////////////////////////////////
	openCache : function(aEvent, aTabbed){
		this._openobject = null;
		var dir;
		var doc_url;
		var oid_date;
		var oid;
		var pfid;
		var dbtype;
		var style;
		var source;
		if(aEvent.target.id == "bitsItemTreePopupCacheOpen" || aEvent.target.id == "bitsItemTreePopupCacheOpenNewtab"){
			var object = this.bitsItemView.object;
			if(object){
				doc_url = object.doc_url;
				oid_date = object.oid_date;
				oid = object.oid;
				pfid = object.pfid;
				dbtype = object.dbtype;
			}
		}else if(
			aEvent.target.id == "mcPopupCacheOpen" ||
			aEvent.target.id == "mcPopupCacheOpenNewtab" ||
			aEvent.target.id == "mcPopupObjectCacheOpen" ||
			aEvent.target.id == "mcPopupObjectCacheOpenNewtab"
		){
			var curIdx = this.mcTreeHandler.TREE.currentIndex;
			var curRes = null;
			if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)) curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(curRes){
				doc_url = this.DataSource.getProperty(curRes,"uri");
				oid_date = this.DataSource.getProperty(curRes,"date");

				oid = this.DataSource.getProperty(curRes,"id");
				pfid = this.DataSource.getProperty(curRes,"pfid");
				dbtype = this.DataSource.getProperty(curRes,"dbtype");
			}
		}else if(aEvent.target.id == "bitsMenuTreeObjectContextmenuCacheOpen" || aEvent.target.id == "bitsMenuTreeObjectContextmenuCacheOpenNewtab"){
			var target = bitsMenuTree._explicitOriginalTarget;
			if(target){
				doc_url = target.getAttribute("doc_url");
				oid_date = target.getAttribute("oid_date");
				this._openobject = this.Database.newObject(undefined,target.getAttribute("dbtype"));
				if(this._openobject){
					var key;
					for(key in this._openobject){
						this._openobject[key] = target.getAttribute(key);
					}
					this._openobject.fid_style = target.getAttribute("fid_style");
					this._openobject.dbtype = target.getAttribute("dbtype");

					oid = this._openobject.oid;
					pfid = this._openobject.pfid;
					dbtype = this._openobject.dbtype;
				}
			}
		}else if(
			aEvent.target.id == "bitsCacheMenuPopupCacheOpen" || 
			aEvent.target.id == "bitsCacheMenuPopupCacheOpenNewtab" ||
			aEvent.target.id == "bitsAutocacheTreeContextmenuOpen" || 
			aEvent.target.id == "bitsAutocacheTreeContextmenuNewtab"
		){
			var target = aEvent.target.parentNode;
			if(target){
				doc_url = target.getAttribute("doc_url");
				oid_date = target.getAttribute("oid_date");
				this._openobject = this.Database.newObject(undefined,target.getAttribute("dbtype"));
				if(this._openobject){
					var key;
					for(key in this._openobject){
						this._openobject[key] = target.getAttribute(key);
					}
					this._openobject.fid_style = target.getAttribute("fid_style");
					this._openobject.dbtype = target.getAttribute("dbtype");

					oid = this._openobject.oid;
					pfid = this._openobject.pfid;
					dbtype = this._openobject.dbtype;
				}
			}
		}else{
			var target = aEvent.target;
			if(target){
				doc_url = target.getAttribute("doc_url");
				oid_date = target.getAttribute("oid_date");
				this._openobject = this.Database.newObject(undefined,target.getAttribute("dbtype"));
				if(this._openobject){
					var key;
					for(key in this._openobject){
						this._openobject[key] = target.getAttribute(key);
					}
					this._openobject.fid_style = target.getAttribute("fid_style");
					this._openobject.dbtype = target.getAttribute("dbtype");
					if(this.mcTreeViewModeService) this.mcTreeViewModeService.selectTreeObject(this._openobject.oid,this._openobject.dbtype,this._openobject.pfid);
					oid = this._openobject.oid;
					pfid = this._openobject.pfid;
					dbtype = this._openobject.dbtype;
				}
			}
		}
		if(doc_url && oid_date){
			dir = this.getURLCacheDirFromTimeStamp(doc_url,oid_date);
			if(!dir || !dir.exists()){
				if(oid_date && oid_date.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)) oid_date = RegExp.$3 + RegExp.$1 + RegExp.$2 + RegExp.$4 + RegExp.$5 + RegExp.$6;
				var histsdb = this._selectHistoryDB({uid_url:doc_url,hid_date:oid_date});
				if(histsdb) dir = this.Common.convertURLToFile(histsdb[0].hid_path);
			}
		}
		if(!dir || !dir.exists()) return;
		var doc = this.gBrowser.contentDocument;
		var cur_uri = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		var res_uri = this.Common.convertFilePathToURL(dir.path);
		var loadFlag = false;
		if(aTabbed) loadFlag = aTabbed;
		if(!aTabbed){
			if(this.gBrowser.browsers.length == 1 && res_uri != "" && cur_uri.indexOf(res_uri)<0){
				loadFlag = true;
			}else if(cur_uri == res_uri){
				loadFlag = false;
			}else{
				loadFlag = true;
				var i;
				for(i=0;i<this.gBrowser.browsers.length;i++){
					var doc = this.gBrowser.browsers[i].contentDocument;
					var cur_uri = this.Common.getURLStringFromDocument(doc);
					if(cur_uri.indexOf(res_uri)>=0){
						loadFlag = false;
						this.gBrowser.tabContainer.selectedIndex = i;
						break;
					}
				}
			}
			aTabbed = aEvent.shiftKey;
		}
		var info = this._getSaveCacheInfo(dir);
		if(loadFlag){
			if(info && info.INDEX){
				var indexFile = dir.clone();
				indexFile.append(info.INDEX);
				if(indexFile.exists()){
					var indexURLString = this.Common.convertFilePathToURL(indexFile.path);
					if(indexURLString){
						this._isOpenCache = indexURLString;
						var tab = this.Common.loadURL(indexURLString,aTabbed);
						if(tab && oid!=undefined && pfid!=undefined && dbtype!=undefined){
							try{
								var object = this.Database.getObject({oid:oid,pfid:pfid}, dbtype)[0];
								if(object){
									oid = object.oid;
									pfid = object.pfid;
									dbtype = object.dbtype;
									style = object.fid_style;
									if(!object.oid_type.match(/^image\/(.+)$/)) source = bitsMarker.id_key+object.dbtype+object.oid;
									tab.setAttribute("Wired-Marker:oid",oid);
									tab.setAttribute("Wired-Marker:pfid",pfid);
									tab.setAttribute("Wired-Marker:dbtype",dbtype);
									tab.setAttribute("Wired-Marker:style",style);
									if(source) tab.setAttribute("Wired-Marker:source",source);
								}
							}catch(e){}
						}

					}
				}
			}
		}else{
			//マーカーへスクロール
			var markerid;
			var oid;
			var style;
			var dbtype;
			if(this._openobject){
				oid = this._openobject.oid;
				style = this._openobject.fid_style;
				dbtype = this._openobject.dbtype;
				markerid = bitsMarker.id_key + this._openobject.dbtype + this._openobject.oid;
				this._openobject = null;
			}else if(this.bitsItemView && this.bitsItemView.isChecked){
				var object = this.bitsItemView.object;
				if(object){
					oid = object.oid;
					style = object.fid_style;
					dbtype = object.dbtype;
					markerid = bitsMarker.id_key + object.dbtype + object.oid;
				}
			}else if(this.mcTreeHandler){
				var curIdx = this.mcTreeHandler.TREE.currentIndex;
				var curRes = null;
				if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)) curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
				if(curRes){
					oid = this.DataSource.getProperty(curRes,"id");
					style = this.DataSource.getProperty(curRes,"style");
					dbtype = this.DataSource.getProperty(curRes,"dbtype");
					markerid = bitsMarker.id_key + dbtype + oid;
				}
			}
			if(markerid){ if(!this.Common.doTopElement(markerid,style,oid,dbtype)) this.Common.doTopElementIMG(oid,dbtype); }
			if(this.TREE && this.TREE.view && info && info.URL && this._cacheList2URL && this._cacheList2URL[info.URL] != undefined){
				this.TREE.currentIndex = this._cacheList2URL[info.URL];
				if(!this.TREE.view.selection.isSelected(this.TREE.currentIndex)) this.TREE.view.selection.select(this.TREE.currentIndex);
				this.TREE.treeBoxObject.ensureRowIsVisible(this.TREE.currentIndex);
			}
		}
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	openCacheAll : function(aEvent, aTabbed){
		var doc_url;
		if(aEvent.target.id == "bitsCacheContextmenuMenuitemCacheOpenAll"){
			var target = this._explicitOriginalTarget;
			if(target) doc_url = target.getAttribute("doc_url");
		}else if(aEvent.target.id == this.idCONTEXTMENU_OPENALL){
			if(!this._cacheList || this.TREE.currentIndex<0 || this._cacheList.length<this.TREE.currentIndex || !this._cacheList[this.TREE.currentIndex]) return;
			var cacheinfo = this._cacheList[this.TREE.currentIndex];
			if(cacheinfo && cacheinfo.URL) doc_url = cacheinfo.URL;
		}
		if(!doc_url) return;
		var dir_arr = [];
		var histdbs = this._selectHistoryDB({uid_url : doc_url});
		if(histdbs){
			var i;
			for(i=0;i<histdbs.length;i++){
				var dir = this.Common.convertURLToFile(histdbs[i].hid_path);
				if(dir.exists()) dir_arr.push(dir.clone());
			}
		}
		var i;
		for(i=0;i<dir_arr.length;i++){
			var dir = dir_arr[i].clone();
			var info = this._getSaveCacheInfo(dir);
			if(info && info.INDEX){
				var indexFile = dir.clone();
				indexFile.append(info.INDEX);
				if(indexFile.exists()){
					var indexURLString = this.Common.convertFilePathToURL(indexFile.path);
					if(indexURLString) this.Common.loadURL(indexURLString,true);
				}
			}
		}
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	pastCache : function(aEvent){
		var dir;
		if(aEvent.target.id == "bitsItemTreePopupCachePast"){
			var object = this.bitsItemView.object;
			if(object) dir = this.getURLCacheDir(object.doc_url);
		}else if(aEvent.target.id == "mcPopupCachePast"){
			var curIdx = this.mcTreeHandler.TREE.currentIndex;
			var curRes = null;
			if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)) curRes = this.mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(curRes) dir = this.getURLCacheDir(this.DataSource.getProperty(curRes,"uri"));
		}else if(aEvent.target.id == "bitsMenuTreeObjectContextmenuCachePast"){
			var target = bitsMenuTree._explicitOriginalTarget;
			if(target) dir = this.getURLCacheDir(target.getAttribute("doc_url"));
		}
		if(!dir || !dir.exists()) return;
		var dir_arr = [];
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
			dir_arr.push(entry.clone());
		}
		if(dir_arr.length>0) dir_arr.sort(function(a, b) { return(parseInt(b.leafName) - parseInt(a.leafName)); });
		var result = {
			accept : false,
			list   : dir_arr,
			dir    : dir,
		};
		window.openDialog("chrome://markingcollection/content/autocacheDialog.xul", "", "chrome,centerscreen,modal", result);
		if(result.accept){
			if(result.acceptdir){
				var dir = result.acceptdir.clone();
				if(!dir || !dir.exists()) return;
				var info = this._getSaveCacheInfo(dir);
				if(info && info.INDEX){
					var indexFile = dir.clone();
					indexFile.append(info.INDEX);
					if(indexFile.exists()){
						var indexURLString = this.Common.convertFilePathToURL(indexFile.path);
						if(indexURLString){
							this.Common.loadURL(indexURLString,true);
							this._isOpenCache = indexURLString;
						}
					}
				}
			}
		}
		this.disabledButton();
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	removeCache : function(aEvent){
		try{
			var doc_url;
			var oid_date;
			if(
				aEvent.target.id == "bitsCacheMenuPopupCacheRemove" ||
				aEvent.target.id == "bitsAutocacheTreeContextmenuRemove"
			){
				var target = aEvent.target.parentNode;
				if(!target || !target.hasAttribute("doc_url") || !target.hasAttribute("oid_date")) return;
				if(target) dir = this.getURLCacheDirFromTimeStamp(target.getAttribute("doc_url"),target.getAttribute("oid_date"));
				doc_url = target.getAttribute("doc_url");
				oid_date = target.getAttribute("oid_date");
			}
			if(!doc_url || !oid_date) return;
			var self = this;
			setTimeout(function(){
				try{
					if(!self.Common.confirm( self.STRING.getString("CONFIRM_DELETE") )) return;
					var histsdb = self._selectHistoryDB({uid_url:doc_url,hid_date:oid_date});
					if(!histsdb) return;
					var j;
					for(j=0;j<histsdb.length;j++){
						if(!self._deleteHistoryDB({uid:histsdb[j].uid,hid:histsdb[j].hid})) continue;
						var dir = self.Common.convertURLToFile(histsdb[j].hid_path);
						if(!dir || !dir.exists()) continue;
						var parent = dir.parent.clone();
						try{ dir.remove(true); }catch(e){}
						while(!self.Common.hasDirChilds(parent)){
							var n_parent = parent.parent.clone();
							try{ parent.remove(true); }catch(e){break;}
							parent = n_parent;
						}
					}
					histsdb = self._selectHistoryDB({uid_url:doc_url});
					if(!histsdb) self._deleteUrlDB({uid_url:doc_url});
					self.refresh();
				}catch(e){self._dump("bitsAutocacheService.removeCacheAll():"+ e);}
			},0);
		}catch(e){self._dump("bitsAutocacheService.removeCacheAll():"+ e);}
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	removeCacheAll : function(aEvent){
		try{
			var doc_urls = [];
			if(aEvent.target.id == "bitsCacheContextmenuMenuitemCacheRemoveAll"){
				var target = this._explicitOriginalTarget;
				if(target){
					var doc_url = target.getAttribute("doc_url");
					if(doc_url) doc_urls.push(doc_url);
				}
			}else if(aEvent.target.id == "bitsAutocacheTreeContextmenuCacheRemoveAll"){
				if(!this._cacheList || this.TREE.currentIndex<0 || this._cacheList.length<this.TREE.currentIndex || !this._cacheList[this.TREE.currentIndex]) return;
				var sellist = this.getSelection();
				var i;
				for(i=0;i<sellist.length;i++){
					var cacheinfo = this._cacheList[sellist[i]];
					if(cacheinfo && cacheinfo.URL) doc_urls.push(cacheinfo.URL);
				}
			}
			if(doc_urls.length==0) return;
			var self = this;
			setTimeout(function(){
				try{
					if(!self.Common.confirm( self.STRING.getString("CONFIRM_DELETE") )) return;
					self._removeCacheAll(doc_urls);
				}catch(e){self._dump("bitsAutocacheService.removeCacheAll():"+ e);}
			},0);
			aEvent.stopPropagation();
		}catch(e){
			this._dump("bitsAutocacheService.removeCacheAll():"+ e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_removeCacheAll : function(aURLs){
		var self = this;
		if(!aURLs || aURLs.length == 0){
			self.refresh();
			return;
		}
		var doc_url = aURLs.shift();
		var i,j;
		var histsdb = self._selectHistoryDB({uid_url:doc_url});
		if(histsdb){
			for(j=0;j<histsdb.length;j++){
				var dir = self.Common.convertURLToFile(histsdb[j].hid_path);
				if(!dir || !dir.exists()) continue;
				var parent = dir.parent.clone();
				try{ dir.remove(true); }catch(e){}
				while(!self.Common.hasDirChilds(parent)){
					var n_parent = parent.parent.clone();
					try{ parent.remove(true); }catch(e){break;}
					parent = n_parent;
				}
			}
			var rtn = self._deleteUrlDB({uid_url:doc_url});
		}
		setTimeout(function(){ self._removeCacheAll(aURLs); },0);
	},

/////////////////////////////////////////////////////////////////////
	disabledButton : function(aDoc){
		var self = this;
		var btn = self.BUTTON;
		if(!btn || btn.hasAttribute("hidden")) return;
		if(!aDoc) aDoc = self.gBrowser.contentDocument;
		if(self._disabledTimer) clearTimeout(self._disabledTimer);
		self._disabledTimer = setTimeout(function(){
			btn.setAttribute("disabled","true");
			var urlString = self.Common.getURLStringFromDocument(aDoc);
			if(!self.isCacheURL(urlString)){
				var dir = self.getNewestCacheTimeStamp(urlString);
				if(!dir) btn.removeAttribute("disabled");
			}
		},500);
	},

/////////////////////////////////////////////////////////////////////
	manuallyCache : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	toggleCacheView : function(aEvent){
		if(this.SPLITTER) this.SPLITTER.setAttribute("hidden","true");
		if(this.VBOX) this.VBOX.setAttribute("hidden","true");
		var btn = this.TOGGLE_BUTTON;
		if(!btn || btn.hasAttribute("hidden")) return;
		var self = this;
		setTimeout(function(){
			self._pref.view.disp = btn.hasAttribute("checked");
			if(!self._pref.view.disp) return;
			if(self.SPLITTER) self.SPLITTER.removeAttribute("hidden");
			if(self.VBOX) self.VBOX.removeAttribute("hidden");
		},0);
	},

/////////////////////////////////////////////////////////////////////
	createCache : function(aURLString, aForced, aRebuild){
		if(aForced == undefined) aForced = false;
		if(aRebuild == undefined) aRebuild = true;
		var use = nsPreferences.copyUnicharPref("wiredmarker.autocache.use", "valid");
		if(use == "disabled" && !aForced) return;
		if(aURLString){
			var urlString = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			if(aURLString != urlString) return;
		}else{
			aURLString = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		}
		var timeStamp = this.getURLTimeStamp(aURLString);
		var dir = this.getURLCacheDirFromTimeStamp(aURLString,timeStamp);
		if(!aForced && dir && dir.exists()) return false;
		var self = this;
		setTimeout(function(){
			var cache = new bitsAutocacheDocument();
			cache.exec(aForced);
			cache.done();
			cache = undefined;
			self.disabledButton();
			if(aRebuild) self.refresh(true);
		},100);
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowCount(){
		return (this._cacheList?this._cacheList.length:0);
	},
	getCellText : function(row,column){
		if(column.id == this.idTREE_ITITLE){
			return this._cacheList[row].TITLE;
		}else if(column.id == this.idTREE_IURL){
			return this._cacheList[row].URL;
		}else if(column.id == this.idTREE_IDATE){
			if(!this._cacheList) return null;
			if(this._cacheList[row].DATE.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
				return RegExp.$1+"/"+RegExp.$2+"/"+RegExp.$3+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
			}else{
				return this._cacheList[row].DATE;
			}
		}else if(column.id == this.idTREE_ICACHE){
			return this._cacheList[row].CACHE_NUM;
		}else if(column.id == this.idTREE_IMARKER){
			return this._cacheList[row].MARKER_NUM;
		}else if(column.id == this.idTREE_ICACHESIZE){
			return this.Common.formatFileSize(this._cacheList[row].CACHE_SIZE);
		}else{
			return null;
		}
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(){ return true; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,column){
		var icon;
		if(column.id != this.idTREE_IFAVICON) return icon;
		if(!this._cacheList) return icon;
		if(!this._cacheList[row]) return icon;
		var info = this._cacheList[row];
		var icon = null;
		if(info && info.URL) icon = this.Database.getFavicon(info.URL);
		if(!icon) icon = "chrome://markingcollection/skin/defaultFavicon.png";
		return icon;
	},
	getRowProperties: function(row,prop){},
	getCellProperties: function(row, column, prop) {
		if(column.id == this.idTREE_IFAVICON){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			prop.AppendElement(aserv.getAtom("ItemView"));
			if(this._cacheList[row]) prop.AppendElement(aserv.getAtom("ItemViewImage"));
		}
	},
	getColumnProperties: function(column, element, prop) {},
	cycleHeader : function(col){},
	setCellText : function(row,column,text){},
  getParentIndex: function(idx) { return -1; },
	canDrop : function(index, orient){ return false; },
	drop : function(row, orient){},
	selectRowFromURL : function(aURLString){
		var rtn = false;
		try{
			if(!aURLString || !this.TREE || !this.TREE.view) return rtn;
			aURLString = this.convertCacheURLToOriginalURL(aURLString);
			var row = this._cacheList2URL[aURLString];
			if(row != undefined){
				this.TREE.currentIndex = row;
				if(!this.TREE.view.selection.isSelected(this.TREE.currentIndex)) this.TREE.view.selection.select(this.TREE.currentIndex);
				this.TREE.focus();
				this.TREE.treeBoxObject.ensureRowIsVisible(this.TREE.currentIndex);
				rtn = true;
			}
		}catch(e){
			rtn = false;
			bitsAutocacheService._dump("bitsAutocacheDocument.selectRowFromURL():"+e);
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	refresh : function(aForced,aTimeout){
		if(!this._refreshFlag) return;
		var self = this;
		if(self._refreshTimer) clearTimeout(self._refreshTimer);
		self._refreshTimer = setTimeout(function(){ self._refresh(); },(aForced?0: (aTimeout!=undefined?aTimeout:250) ));
	},
	_refresh : function(){
		if(!this.TREE) return;
		var idx = this.TREE.currentIndex;
		var rows = this.getSelection();
		this.rebuild();
		try{this.TREE.currentIndex=idx;}catch(e){}
		if(!this._cacheList) return;
		try{
			var i;
			for(i=0;i<rows.length;i++){
				if(!this.TREE.view.selection.isSelected(rows[i])) this.TREE.view.selection.select(rows[i]);
			}
		}catch(e){}
		this.TREE.blur();
		this.TREE.focus();
	},

/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		if(!this.TREE) return;
		try{this.TREE.currentIndex = -1;}catch(e){}
		try{this.TREE.view.selection.clearSelection();}catch(e){}
		if(this._cacheList){
			this._cacheList.length = 0;
			this._cacheList = undefined;
			this._cacheList2URL = undefined;
		}
		this.TREE.removeAttribute("flex");
		try{
			var urlsdb = this._selectUrlDB();
			if(urlsdb){
				var i;
				var j;
				for(i=0;i<urlsdb.length;i++){
					var histsdb = this._selectHistoryDB({uid_url : urlsdb[i].uid_url});
					if(histsdb){
						var info = {
							URL        : urlsdb[i].uid_url,
							TITLE      : histsdb[0].hid_title,
							INDEX      : histsdb[0].hid_file,
							PATH       : histsdb[0].hid_path,
							DATE       : histsdb[0].hid_date,
							CACHE_NUM  : histsdb.length,
							CACHE_SIZE : 0,
							MARKER_NUM : 0
						};
						if(urlsdb[i].uid_url){
							var objcnt;
							for(objcnt=0;objcnt<histsdb.length;objcnt++){
								if(histsdb[objcnt].hid_date.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)){
									var item_date = RegExp.$2+"/"+RegExp.$3+"/"+RegExp.$1+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
									var objs = this.Database.getObject({doc_url : urlsdb[i].uid_url, oid_date : item_date});
									if(objs) info.MARKER_NUM += objs.length;
								}
								info.CACHE_SIZE += parseInt(histsdb[objcnt].hid_filesize);
							}
						}
						if(!this._cacheList) this._cacheList = [];
						this._cacheList.push(info);
					}
				}
			}
		}catch(e){
			this._dump("bitsAutocacheService.rebuild():"+e);
			this._cacheList = undefined;
			this._cacheList2URL = undefined;
		}
		if(this._cacheList){
			if(this.VSB.checked && this.VSM.value != ""){
				var regexp = new RegExp(this.VSM.value,"img");
				this._cacheList = this._cacheList.filter(
					function(element, index, array) {
						return regexp.test(element.TITLE) || regexp.test(element.URL);
					}
				);
			}
			var self = this;
			this._cacheList.sort(
				function(a,b){
					var direction = "";
					if(
						self.TREE_IFAVICON.hasAttribute("sortDirection") ||
						self.TREE_IURL.hasAttribute("sortDirection")
					){
						if(self.TREE_IFAVICON.hasAttribute("sortDirection")){
							direction = self.TREE_IFAVICON.getAttribute("sortDirection");
						}else if(self.TREE_IURL.hasAttribute("sortDirection")){
							direction = self.TREE_IURL.getAttribute("sortDirection");
						}
						if(direction == "ascending"){
							if(a.URL < b.URL) return -1;
							if(a.URL > b.URL) return 1;
						}else if(direction == "descending"){
							if(a.URL < b.URL) return 1;
							if(a.URL > b.URL) return -1;
						}
					}else if(self.TREE_ITITLE.hasAttribute("sortDirection")){
						direction = self.TREE_ITITLE.getAttribute("sortDirection");
						if(direction == "ascending"){
							if(a.TITLE < b.TITLE) return -1;
							if(a.TITLE > b.TITLE) return 1;
						}else if(direction == "descending"){
							if(a.TITLE < b.TITLE) return 1;
							if(a.TITLE > b.TITLE) return -1;
						}
					}else if(self.TREE_IDATE.hasAttribute("sortDirection")){
						direction = self.TREE_IDATE.getAttribute("sortDirection");
						if(direction == "ascending"){
							if(parseInt(a.DATE) < parseInt(b.DATE)) return -1;
							if(parseInt(a.DATE) > parseInt(b.DATE)) return 1;
						}else if(direction == "descending"){
							if(parseInt(a.DATE) < parseInt(b.DATE)) return 1;
							if(parseInt(a.DATE) > parseInt(b.DATE)) return -1;
						}
					}else if(self.TREE_ICACHE.hasAttribute("sortDirection")){
						direction = self.TREE_ICACHE.getAttribute("sortDirection");
						if(direction == "ascending"){
							if(parseInt(a.CACHE_NUM) < parseInt(b.CACHE_NUM)) return -1;
							if(parseInt(a.CACHE_NUM) > parseInt(b.CACHE_NUM)) return 1;
						}else if(direction == "descending"){
							if(parseInt(a.CACHE_NUM) < parseInt(b.CACHE_NUM)) return 1;
							if(parseInt(a.CACHE_NUM) > parseInt(b.CACHE_NUM)) return -1;
						}
					}else if(self.TREE_IMARKER.hasAttribute("sortDirection")){
						direction = self.TREE_IMARKER.getAttribute("sortDirection");
						if(direction == "ascending"){
							if(parseInt(a.MARKER_NUM) < parseInt(b.MARKER_NUM)) return -1;
							if(parseInt(a.MARKER_NUM) > parseInt(b.MARKER_NUM)) return 1;
						}else if(direction == "descending"){
							if(parseInt(a.MARKER_NUM) < parseInt(b.MARKER_NUM)) return 1;
							if(parseInt(a.MARKER_NUM) > parseInt(b.MARKER_NUM)) return -1;
						}
					}else if(self.TREE_ICACHESIZE.hasAttribute("sortDirection")){
						direction = self.TREE_ICACHESIZE.getAttribute("sortDirection");
						if(direction == "ascending"){
							if(parseInt(a.CACHE_SIZE) < parseInt(b.CACHE_SIZE)) return -1;
							if(parseInt(a.CACHE_SIZE) > parseInt(b.CACHE_SIZE)) return 1;
						}else if(direction == "descending"){
							if(parseInt(a.CACHE_SIZE) < parseInt(b.CACHE_SIZE)) return 1;
							if(parseInt(a.CACHE_SIZE) > parseInt(b.CACHE_SIZE)) return -1;
						}
					}else{
						if(parseInt(a.DATE) < parseInt(b.DATE)) return 1;
						if(parseInt(a.DATE) > parseInt(b.DATE)) return -1;
					}
					return 0;
				}
			);
			this.TREE.setAttribute("flex","1");
			if(!this._cacheList2URL) this._cacheList2URL = {};
			var i;
			for(i=0;i<this._cacheList.length;i++){
				if(!this._cacheList[i].URL) continue;
				this._cacheList2URL[this._cacheList[i].URL] = i;
			}
		}
		this.TREE.setAttribute("hidden",true);
		if(this.TREE.hasAttribute("flex")){
			var self = this;
			setTimeout(function(){
				if(!self.TREE) return;
				self.TREE.view = self;
				self.TREE.removeAttribute("hidden");
				self.VSB.removeAttribute("disabled");
				if(self.VSB.hasAttribute("checked")) self.VSM.removeAttribute("disabled");
			},0);
		}else{
			this.VSB.setAttribute("disabled",true);
			this.VSM.setAttribute("disabled",true);
		}
	},

/////////////////////////////////////////////////////////////////////
	getSelection : function(){
		if(!this.TREE || !this.TREE.view) return undefined;
		var ret = [];
		var rc;
		var i;
		for(rc=0;rc<this.TREE.view.selection.getRangeCount();rc++){
			var start = {}, end = {};
			this.TREE.view.selection.getRangeAt(rc, start, end);
			for(i=start.value;i<= end.value;i++){
				if(!this.TREE.view.selection.isSelected(i)) continue;
				ret.push(i);
			}
		}
		return ret;
	},

/////////////////////////////////////////////////////////////////////
	onSearchButtonCommand : function(aEvent){
		var self = this;
		var checked = this.VSB.hasAttribute("checked");
		if(checked){
			this.VSM.removeAttribute("disabled");
			setTimeout(function(){
				self.VSM.focus();
				self.refresh();
			},0);
		}else{
			this.VSM.blur();
			this.VSM.setAttribute("disabled","true");
			setTimeout(function(){
				self.refresh();
			},0);
		}
	},

/////////////////////////////////////////////////////////////////////
	onSearchKeyPress : function(aEvent){
		switch(aEvent.keyCode){
			case aEvent.DOM_VK_RETURN :
				this.refresh();
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onClick : function(aEvent){
		if(aEvent.button != 0) return;
		if(aEvent.altKey || aEvent.shiftKey || aEvent.ctrlKey) return;
		if(aEvent.target.id){
			if(aEvent.target.id != this.idTREE_IFAVICON)   this.TREE_IFAVICON.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_IURL)       this.TREE_IURL.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_ITITLE)     this.TREE_ITITLE.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_IDATE)      this.TREE_IDATE.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_ICACHE)     this.TREE_ICACHE.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_IMARKER)    this.TREE_IMARKER.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_ICACHESIZE) this.TREE_ICACHESIZE.removeAttribute("sortDirection");
			if(!aEvent.target.hasAttribute("sortDirection")){
				aEvent.target.setAttribute("sortDirection","ascending");
			}else if(aEvent.target.getAttribute("sortDirection") == "ascending"){
				aEvent.target.setAttribute("sortDirection","descending");
			}else{
				aEvent.target.removeAttribute("sortDirection");
			}
			this.refresh(true);
			return;
		}
	},

/////////////////////////////////////////////////////////////////////
	onDblClick : function(aEvent){
		if(aEvent.button != 0) return;
		if(aEvent.altKey) return;
		var row = {};
		var col = {};
		var obj = {};
		this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
		if(row.value<0){
			this.TREE.view.selection.clearSelection();
			return;
		}
		this.open(aEvent);
	},

	open : function(aEvent){
		if(this.bitsItemView && this.bitsItemView.isChecked){
			this.bitsItemView.TREE.currentIndex = -1;
			try{this.bitsItemView.TREE.view.selection.clearSelection();}catch(e){}
		}else if(this.mcTreeHandler){
			var curIdx = this.mcTreeHandler.TREE.currentIndex;
			if(curIdx>=0 && !this.mcTreeHandler.TREE.view.isContainer(curIdx)){
				this.mcTreeHandler.TREE.currentIndex = -1;
				try{this.mcTreeHandler.TREE.view.selection.clearSelection();}catch(e){}
			}
		}

		try{
			var cacheinfo = this._cacheList[this.TREE.currentIndex];
			var dir = this.getURLCacheDirFromTimeStamp(cacheinfo.URL,cacheinfo.DATE);
			if(!dir || !dir.exists()){
				var histsdb = this._selectHistoryDB({uid_url:cacheinfo.URL,hid_date:cacheinfo.DATE});
				if(histsdb) dir = this.Common.convertURLToFile(histsdb[0].hid_path);
			}
			if(!dir || !dir.exists()) return;
			var doc = this.gBrowser.contentDocument;
			var cur_uri = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			var res_uri = this.Common.convertFilePathToURL(dir.parent.path);
			var aTabbed = false;
			var loadFlag = false;
			if(aTabbed) loadFlag = aTabbed;
			if(!aTabbed){
				if(this.gBrowser.browsers.length == 1 && res_uri != "" && cur_uri.indexOf(res_uri)<0){
					loadFlag = true;
				}else if(cur_uri == res_uri){
					loadFlag = false;
				}else{
					loadFlag = true;
					var i;
					for(i=0;i<this.gBrowser.browsers.length;i++){
						var doc = this.gBrowser.browsers[i].contentDocument;
						var cur_uri = this.Common.getURLStringFromDocument(doc);
						if(cur_uri.indexOf(res_uri)>=0){
							if(cur_uri == res_uri) loadFlag = false;
							this.gBrowser.tabContainer.selectedIndex = i;
							break;
						}
					}
				}
				aTabbed = aEvent.shiftKey | aEvent.ctrlKey;
			}
			if(loadFlag){
				if(cacheinfo && cacheinfo.INDEX){
					var indexFile = dir.clone();
					indexFile.append(cacheinfo.INDEX);
					if(indexFile.exists()){
						var indexURLString = this.Common.convertFilePathToURL(indexFile.path);
						if(indexURLString){
							this.Common.loadURL(indexURLString,aTabbed);
							this._isOpenCache = indexURLString;
						}
					}
				}
			}
			aEvent.stopPropagation();
		}catch(e){
			this._dump("bitsAutocacheService.onDblClick():"+e);
		}
	},

	remove : function(aEvent){
		var sellist = this.getSelection();
		var self = this;
		setTimeout(function(){
			if(!self.Common.confirm( self.STRING.getString("CONFIRM_DELETE") )) return;
			if(sellist){
				var i,j;
				for(i=0;i<sellist.length;i++){
					var basedir = null;
					var cacheinfo = self._cacheList[sellist[i]];
					if(!cacheinfo || !cacheinfo.URL) continue;
					var histddb = self._selectHistoryDB({uid_url:cacheinfo.URL});
					if(histddb){
						for(j=0;j<histddb.length;j++){
							var histdir = self.Common.convertURLToFile(histddb[j].hid_path);
							if(!histdir || !histdir.exists()) continue;
							try{ histdir.remove(true); }catch(e){}
							var parent = histdir.parent.clone();
							while(!self.Common.hasDirChilds(parent)){
								var n_parent = parent.parent.clone();
								try{ parent.remove(true); }catch(e){break;}
								parent = n_parent;
							}
						}
					}
					self._deleteUrlDB({uid_url:cacheinfo.URL});
				}
			}
			self.refresh();
		},0);
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	onKeyPress : function(aEvent){
		switch(aEvent.keyCode){
			case aEvent.DOM_VK_RETURN :
				aEvent.preventDefault();
				this.open(aEvent);
				break;
			case aEvent.DOM_VK_DELETE :
				if(!(aEvent.ctrlKey || aEvent.shiftKey)){
					aEvent.preventDefault();
					this.remove(aEvent);
				}
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	onKeyDown : function(aEvent){
		switch(aEvent.keyCode){
			case aEvent.DOM_VK_A :
				if(aEvent.ctrlKey){
					aEvent.preventDefault();
					this.TREE.view.selection.selectAll();
				}
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
// 1 バイトに対して 2 つの 16 進数コードを返す。
/////////////////////////////////////////////////////////////////////
	_toHexString : function(charCode){
		return("0" + charCode.toString(16)).slice(-2);
	},

/////////////////////////////////////////////////////////////////////
	_string2CryptoHash : function(aString){
		if(aString == undefined || aString == "") return undefined;
		try{
			var str = aString;
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			var result = {};
			var data = converter.convertToByteArray(str, result);
			var ch = Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash);
			ch.init(ch.MD5);
			ch.update(data, data.length);
			var hash = ch.finish(false);
			var s = "";
			var i;
			for(i in hash){
				if(typeof hash[i] == "function") continue;
				s += this._toHexString(hash.charCodeAt(i));
			}
			var top = s.substr(0,2);
			var regexp = new RegExp(top+"$","mg");
			while(s.match(regexp)) s = s.replace(regexp,"");
			return s;
		}catch(ex){
			return undefined;
		}
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
			if(content.indexOf("%09")>=0){
				content = unescape(content);
			}else{
				content = this.Common.convertToUnicode(content,"UTF-8");
			}
			return content;
		}catch(ex){
			this._dump("bitsAutocacheService ERROR: readFile():" + ex);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	writeFile : function(aFile, aContent){
		if(aFile.exists()) aFile.remove(false);
		try {
			aFile.create(aFile.NORMAL_FILE_TYPE, 0666);
			var content = this.Common.convertFormUnicode(aContent,"UTF-8");
			var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(aFile, 2, 0x200, false);
			ostream.write(content, content.length);
			ostream.close();
		}catch(ex){
			this._dump("bitsAutocacheService ERROR: Failed to write file: " + aFile.path + "["+ ex + "]");
		}
	},

/////////////////////////////////////////////////////////////////////
// Database関連
/////////////////////////////////////////////////////////////////////
	_getFileDB : function(){
		var dbFile = this.Common.getExtensionDir().clone();
		dbFile.append(this._dbName);
		return dbFile;
	},

/////////////////////////////////////////////////////////////////////
	_connectDB : function(){
		var dbFile = this._getFileDB();
		if(!this._dbConn && dbFile) this._dbConn = this.Common.STORAGE.openDatabase(dbFile);
		this._createTableDB();
		return (this._dbConn?true:false);
	},

/////////////////////////////////////////////////////////////////////
	_disconnectDB : function(aVacuum){
		var dbFile = this._dbConn.databaseFile.clone();
		this._backupDB(dbFile);

		if(aVacuum == undefined) aVacuum = false;
		try{ if(aVacuum) this._vacuumDB(); }catch(ex){};
		this._dbConn = undefined;
	},

/////////////////////////////////////////////////////////////////////
	_vacuumDB : function(){
		try{
			this._dbConn.executeSimpleSQL("VACUUM");
		}catch(ex){
			this._dump("bitsAutocacheService.vacuumDB():"+ex);
		};
	},

/////////////////////////////////////////////////////////////////////
	_backupDB : function(aFile){
		try{
			var bDir = bitsObjectMng.Common.getExtensionDir();
			bDir.append("backup");
			var aBackupFile = bDir.clone();
			aBackupFile.append(aFile.leafName+".1");
			if(aBackupFile.exists() && aFile.exists()){
				if(aBackupFile.lastModifiedTime == aFile.lastModifiedTime) return;
			}
			for(var i=4;i>0;i--){
				var aFile1 = bDir.clone();
				aFile1.append(aFile.leafName+"."+i);
				if(!aFile1.exists()) continue;
				var aFile2 = bDir.clone();
				aFile2.append(aFile.leafName+"."+(i+1));
				if(aFile2.exists()) aFile2.remove(true);
				aFile1.moveTo(aFile2.parent ,aFile2.leafName);
			}
			if(aBackupFile.exists()) aBackupFile.remove(true);
			aFile.copyTo(aBackupFile.parent ,aBackupFile.leafName);
		}catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	_createTableDB : function(){
		var ourTransaction = false;
		try{
			var createTable = !this._dbConn.tableExists("om_url");
			if(!createTable) createTable = !this._dbConn.tableExists("om_history");
			if(!createTable) createTable = !this._dbConn.indexExists("om_url_idx_url");
			if(!createTable) createTable = !this._dbConn.indexExists("om_history_idx_file");
			if(!createTable) createTable = !this._dbConn.indexExists("om_history_idx_path");
			if(!createTable) createTable = !this._dbConn.indexExists("om_history_idx_date");
			if(createTable){
				if(this._dbConn.transactionInProgress){
					ourTransaction = true;
					this._dbConn.beginTransactionAs(this._dbConn.TRANSACTION_DEFERRED);
				}
				if(!this._dbConn.tableExists("om_url")){
					this._dbConn.executeSimpleSQL(
						"CREATE TABLE om_url (" +
						"  uid       INTEGER," +
						"  uid_url   TEXT NOT NULL," +
						"PRIMARY KEY (uid)"+
						")"
					);
				}
				if(!this._dbConn.tableExists("om_history")){
					this._dbConn.executeSimpleSQL(
						"CREATE TABLE om_history (" +
						"  uid          INTEGER," +
						"  hid          INTEGER," +
						"  hid_file     TEXT NOT NULL," +
						"  hid_path     TEXT NOT NULL," +
						"  hid_title    TEXT," +
						"  hid_date     TEXT NOT NULL," +
						"  hid_filesize INTEGER," +
						"PRIMARY KEY (uid,hid)"+
						")"
					);
				}
				try{if(!this._dbConn.indexExists("om_url_idx_url"))      this._dbConn.executeSimpleSQL("CREATE INDEX om_url_idx_url      ON om_url(uid_url);");     }catch(ex){}
				try{if(!this._dbConn.indexExists("om_history_idx_file")) this._dbConn.executeSimpleSQL("CREATE INDEX om_history_idx_file ON om_history(hid_file);");}catch(ex){}
				try{if(!this._dbConn.indexExists("om_history_idx_path")) this._dbConn.executeSimpleSQL("CREATE INDEX om_history_idx_path ON om_history(hid_path);");}catch(ex){}
				try{if(!this._dbConn.indexExists("om_history_idx_date")) this._dbConn.executeSimpleSQL("CREATE INDEX om_history_idx_date ON om_history(hid_date);");}catch(ex){}
			}
		}
		finally {
			if(this._dbConn.lastError) this._dump("bitsAutocacheService._createTableDB():"+this._dbConn.lastErrorString+" ("+this._dbConn.lastError+")");
			if(ourTransaction){
				this._dbConn.rollbackTransaction();
				ourTransaction = false;
			}
		}
		if(ourTransaction) this._dbConn.commitTransaction();
		if(createTable){
			if(!this._dbConn.tableExists("om_url")) return false;
			if(!this._dbConn.tableExists("om_history")) return false;
			if(!this._dbConn.indexExists("om_url_idx_url")) return false;
			return true;
		}else{
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	_setStatementValueDB : function(aStatement,aIndex,aValue,aType) {
		try{
			if(aType == undefined) aType = aStatement.VALUE_TYPE_TEXT;
			if(aValue == undefined){
				aStatement.bindNullParameter(aIndex);
			}else{
				switch(aType){
					case aStatement.VALUE_TYPE_INTEGER :
					case aStatement.VALUE_TYPE_FLOAT :
					case aStatement.VALUE_TYPE_TEXT :
						aStatement.bindUTF8StringParameter(aIndex,aValue);
						break;
					case aStatement.VALUE_TYPE_BLOB :
						aStatement.bindBlobParameter(aIndex,aValue,aValue.length);
						break;
					default :
						break;
				}
			}
		}catch(e){
			bitsObjectMng._dump("bitsAutocacheService._setStatementValueDB():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_selectDB : function(aSql,aPara){
		var ourTransaction = false;
		if(this._dbConn.transactionInProgress){
			ourTransaction = true;
			this._dbConn.beginTransactionAs(this._dbConn.TRANSACTION_DEFERRED);
		}
		var i;
		try{
			var statement = this._dbConn.createStatement(aSql);
			if(aPara){
				var i;
				for(i=0;i<aPara.length;i++){
					this._setStatementValueDB(statement,i,aPara[i]);
				}
			}
			var k=statement.columnCount;
			var columnNames = [];
			for(i=0;i<k;i++){
				columnNames.push(statement.getColumnName(i));
			}
		}catch(ex){
			this._dump("bitsAutocacheService._selectDB(1):"+ex);
			this._dump("bitsAutocacheService._selectDB():aSql="+aSql);
			return null;
		}
		var dataset = [];
		try{
			while(statement.executeStep()){
				var row = {};
				var utf8String;
				for(i=0;i<k;i++){
					utf8String = statement.getUTF8String(i);
					row[columnNames[i]] = utf8String ? utf8String : "";
				}
				dataset.push(row);
			}
			columnNames = undefined;
		}finally {
			if(this._dbConn.lastError > 0 && this._dbConn.lastError <= 100){
				this._dump("bitsAutocacheService._selectDB(3):"+this._dbConn.lastErrorString+" ("+this._dbConn.lastError+")\n\n"+aSql);
			}
			if(this._dbConn.lastError && this._dbConn.lastError != 101){
				this._dump("bitsAutocacheService._selectDB(2):"+this._dbConn.lastErrorString+" ("+this._dbConn.lastError+")\n\n"+aSql);
				dataset = null;
			}
			if(ourTransaction && this._dbConn.lastError && this._dbConn.lastError != 101){
				this._dbConn.rollbackTransaction();
				ourTransaction = false;
			}
			statement.reset();
		}
		if(ourTransaction) this._dbConn.commitTransaction();
		return dataset;
	},

/////////////////////////////////////////////////////////////////////
	_cmdDB : function(aSql,aPara){
		var rtn = true;
		var ourTransaction = false;
		if(this._dbConn.transactionInProgress){
			ourTransaction = true;
			this._dbConn.beginTransactionAs(this._dbConn.TRANSACTION_DEFERRED);
		}
		try{
			var statement = this._dbConn.createStatement(aSql);
			if(aPara){
				var i;
				for(i=0;i<aPara.length;i++){
					this._setStatementValueDB(statement,i,aPara[i]);
				}
			}
		}catch(ex){
			this._dump("bitsAutocacheService._cmdDB():"+ex);
			this._dump("bitsAutocacheService._cmdDB():aSql="+aSql);
			return false;
		}
		try{
			statement.execute();
		}finally {
			if(this._dbConn.lastError){
				this._dump("bitsAutocacheService._cmdDB():"+this._dbConn.lastErrorString+" ("+this._dbConn.lastError+")");
				this._dump("bitsAutocacheService._cmdDB():aSql="+aSql);
				rtn = false;
			}
			if(ourTransaction && this._dbConn.lastError){
				this._dbConn.rollbackTransaction();
				ourTransaction = false;
			}
			statement.reset();
		}
		if(ourTransaction) this._dbConn.commitTransaction();
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_uidExistsDB : function(aUID){
		var fSql = 'select count(uid) as uid_num from om_url where uid=?1';
		var fRtn = this._selectDB(fSql,[aUID]);
		return ((fRtn && fRtn[0].uid_num>0)?true:false);
	},

/////////////////////////////////////////////////////////////////////
	_urlExistsDB : function(aURL){
		var fSql = 'select count(uid_url) as uid_num from om_url where uid_url=?1';
		var fRtn = this._selectDB(fSql,[aURL]);
		return ((fRtn && fRtn[0].uid_num>0)?true:false);
	},

/////////////////////////////////////////////////////////////////////
	_hidExistsDB : function(aHID){
		var fSql = 'select count(hid) as hid_num from om_history where hid=?1';
		var fRtn = this._selectDB(fSql,[aHID]);
		return ((fRtn && fRtn[0].hid_num>0)?true:false);
	},

/////////////////////////////////////////////////////////////////////
	_uidIdentifyDB : function(aUID){
		var i = 0;
		while(this._uidExistsDB(aUID) && i < 100){
			aUID = this.Common.getTimeStamp(--i);
		}
		return aUID;
	},

/////////////////////////////////////////////////////////////////////
	_hidIdentifyDB : function(aHID){
		var i = 0;
		while(this._hidExistsDB(aHID) && i < 100){
			aHID = this.Common.getTimeStamp(--i);
		}
		return aHID;
	},

/////////////////////////////////////////////////////////////////////
	_insertInitDB : function(){
		var basedir = this.cachedir.clone();
		if(!basedir.exists() || !basedir.directoryEntries) return;
		var dir_arr = [];
		var entries = basedir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
			if(entry.leafName.match(/^[0-9]{4}$/)) continue; //変換済みのディレクトリはパス
			dir_arr.push(entry);
		}
		setTimeout(function(){ bitsAutocacheService._insertInitDB_exec(dir_arr); },100);
	},

	_insertInitDB_exec : function(aDirArray){
		if(!aDirArray || aDirArray.length == 0){
			this.refresh();
			return;
		}
		var entry = aDirArray.shift();
		var temp_arr = [];
		var temp_entries = entry.directoryEntries;
		while(temp_entries.hasMoreElements()){
			var temp_entry = temp_entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!temp_entry.isDirectory() || (temp_entry.isDirectory() && temp_entry.leafName.match(/^\./))) continue;
			temp_arr.push(temp_entry);
		}
		if(temp_arr.length>0){
			temp_arr.sort(function(a, b) { return(parseInt(a.leafName) - parseInt(b.leafName)); });
			var i;
			var info;
			for(i=0;i<temp_arr.length;i++){
				info = this._getSaveCacheInfo(temp_arr[i].clone());
				if(!info || !info.URL){
					info = undefined;
					continue;
				}
				info.DIR = entry.clone();
				info.DATE = temp_arr[0].leafName;
				break;
			}
			if(info && info.URL){
				info.URL = info.URL.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
				var urldbs = this._selectUrlDB({uid_url : info.URL});
				if(!urldbs){
					this._insertUrlDB({
						uid       : info.DATE,
						uid_url   : info.URL,
					});
					urldbs = this._selectUrlDB({uid_url : info.URL});
				}
				if(urldbs){
					var urldb = urldbs[0];
					for(i=0;i<temp_arr.length;i++){
						var temp_info = this._getSaveCacheInfo(temp_arr[i].clone());
						if(!temp_info || !temp_info.URL){
							temp_info = undefined;
							continue;
						}
						temp_info.DIR = entry.clone();
						temp_info.DATE = temp_arr[i].leafName;
						var rtn = this._insertHistoryDB({
							uid          : urldb.uid,
							hid          : temp_info.DATE,
							hid_file     : temp_info.INDEX,
							hid_path     : this.Common.convertFilePathToURL(temp_arr[i].path),
							hid_title    : temp_info.TITLE,
							hid_date     : temp_info.DATE,
							hid_filesize : this.Common.getFilesize(temp_arr[i]),
						});
					}
				}
				var histdbs = this._selectHistoryDB({
					uid_url : info.URL
				});
				if(histdbs){
					for(i=0;i<histdbs.length;i++){
						var dir = this.getURLCacheDir(histdbs[i].uid_url);
						if(!dir || !dir.exists()) continue;
						var approximateCacheTimeStamp = this.getApproximateCacheTimeStamp(histdbs[i].uid_url,histdbs[i].hid_date);
						if(approximateCacheTimeStamp){
							dir.append(approximateCacheTimeStamp);
							if(!dir || !dir.exists()) continue;
						}else{
							continue;
						}
						var newDir = this.getURLCacheDirFromTimeStamp(histdbs[i].uid_url,histdbs[i].hid_date);
						this._updateHistoryDB({
							uid      : histdbs[i].uid,
							hid      : histdbs[i].hid,
							hid_path : this.Common.convertFilePathToURL(newDir.path),
						});
						if(newDir.exists()){
							dir.remove(true);
							continue;
						}
						if(!newDir.parent.exists()) newDir.parent.create(newDir.DIRECTORY_TYPE, 0777);
						dir.moveTo(newDir.parent,newDir.leafName);
					}
				}
				var dir = this.getURLCacheDir(info.URL);
				if(dir && dir.exists()){
					var histnum = 0;
					var temp_entries = dir.directoryEntries;
					while(temp_entries.hasMoreElements()){
						var temp_entry = temp_entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
						if(!temp_entry.isDirectory() || (temp_entry.isDirectory() && temp_entry.leafName.match(/^\./))) continue;
						histnum++;
					}
					if(histnum == 0) dir.remove(true);
				}
			}
		}
		temp_arr = undefined;
		setTimeout(function(){ bitsAutocacheService._insertInitDB_exec(aDirArray); },100);
	},

/////////////////////////////////////////////////////////////////////
	_insertUrlDB : function(aUrlObject){
		try{
			if(!aUrlObject) return false;
			if(!aUrlObject.uid_url) return false;
			var rtn = true;
			if(aUrlObject.uid == undefined){
				aUrlObject.uid = this._uidIdentifyDB(this.Common.getTimeStamp());
			}else{
				if(this._uidExistsDB(aUrlObject.uid)) return false;
			}
			if(this._urlExistsDB(aUrlObject.uid_url)) return false;
			var columns = [];
			var values = [];
			var para = [];
			var index=0;
			var key;
			for(key in aUrlObject){
				if(!aUrlObject[key] || aUrlObject[key] == "") continue;
				columns.push(key);
				values.push('?'+(++index));
				para.push(aUrlObject[key]);
			}
			if(columns.length == 0) rtn = false;
			if(rtn){
				var aSql = "insert into om_url ("+ columns.join(",") +") values ("+ values.join(",") +")";
				rtn = this._cmdDB(aSql,para);
				if(!rtn) this._dump("bitsAutocacheService._insertUrlDB():aSql="+aSql);
			}
		}catch(ex){
			this._dump("bitsAutocacheService._insertUrlDB():"+ex);
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_selectUrlDB : function(aUrlObject){
		try{
			var para = [];
			var where = [];
			var key;
			var index=0;
			if(aUrlObject){
				for(key in aUrlObject){
					where.push("om_url."+key+"=?"+(++index));
					para.push(aUrlObject[key]);
				}
			}
			var oSql = 'select' +
								' om_url.uid' +
								',om_url.uid_url' +
								' from om_url';
			if(where.length>0) oSql += " where " + where.join(" and ");
			var oFld = this._selectDB(oSql,para);
			if(oFld && oFld.length>0)
				return oFld;
			else
				return null;
		}catch(ex){
			this._dump("bitsAutocacheService._selectUrlDB():"+ex);
			return null;
		}
	},

/////////////////////////////////////////////////////////////////////
	_updateUrlDB : function(aUrlObject){
		if(!aUrlObject) return false;
		if(!aUrlObject.uid && !aUrlObject.uid_url) return false;
		try{
			var rtn = true;
			var om_link = {};
			var values = [];
			var para = [];
			var index=0;
			var key;
			for(key in aUrlObject){
				if(aUrlObject[key] == undefined || key == "uid" || key == "uid_url") continue;
				values.push(key+'=?'+(++index));
				para.push(aUrlObject[key]);
			}
			if(rtn && values.length>0){
				var aSql = 'update om_url set '+ values.join(",");
				var where = [];
				if(aUrlObject.uid){
					where.push("uid=?"+(++index));
					para.push(aUrlObject.uid);
				}
				if(aUrlObject.uid_url){
					where.push("uid_url=?"+(++index));
					para.push(aUrlObject.uid_url);
				}
				if(where.length>0) aSql += " where " + where.join(" and ");
				rtn = this._cmdDB(aSql,para);
			}
			return rtn;
		}catch(ex){
			this._dump("bitsAutocacheService._updateUrlDB():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	_deleteUrlDB : function(aUrlObject){
		if(!aUrlObject) return false;
		if(!aUrlObject.uid && !aUrlObject.uid_url) return false;
		if(!aUrlObject.uid){
			var urldbs = this._selectUrlDB(aUrlObject);
			if(urldbs) aUrlObject.uid = urldbs[0].uid;
		}
		if(!aUrlObject.uid) return false;
		if(!this._deleteHistoryDB({uid:aUrlObject.uid})) return false;
		try{
			var para = [];
			var where = [];
			var key;
			var index=0;
			if(aUrlObject){
				for(key in aUrlObject){
					where.push("om_url."+key+"=?"+(++index));
					para.push(aUrlObject[key]);
				}
			}
			var oSql = 'delete from om_url';
			if(where.length>0) oSql += " where " + where.join(" and ");
			return this._cmdDB(oSql,para);
		}catch(ex){
			this._dump("bitsAutocacheService._deleteUrlDB():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	_insertHistoryDB : function(aHistObject){
		try{
			if(!aHistObject) return false;
			if(aHistObject.uid == undefined) return false;
			if(!this._uidExistsDB(aHistObject.uid)) return false;
			if(aHistObject.hid == undefined){
				aHistObject.hid = this._hidIdentifyDB(this.Common.getTimeStamp());
			}else{
				if(this._hidExistsDB(aHistObject.hid)) return false;
			}
			var columns = [];
			var values = [];
			var para = [];
			var index=0;
			var key;
			for(key in aHistObject){
				if(!aHistObject[key] || aHistObject[key] == "") continue;
				columns.push(key);
				values.push('?'+(++index));
				para.push(aHistObject[key]);
			}
			var rtn = (columns.length == 0)?false:true;
			if(rtn){
				var aSql = "insert into om_history ("+ columns.join(",") +") values ("+ values.join(",") +")";
				rtn = this._cmdDB(aSql,para);
				if(!rtn) this._dump("bitsAutocacheService._insertHistoryDB():aSql="+aSql);
			}
		}catch(ex){
			this._dump("bitsAutocacheService._insertHistoryDB():"+ex);
			rtn = false;
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_selectHistoryDB : function(aHistObject){
		try{
			var para = [];
			var where = [];
			var key;
			var index=0;
			if(aHistObject){
				if(aHistObject.hid_date && aHistObject.hid_date.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)) aHistObject.hid_date = RegExp.$3 + RegExp.$1 + RegExp.$2 + RegExp.$4 + RegExp.$5 + RegExp.$6;
				for(key in aHistObject){
					if(key == "uid_url"){
						where.push("om_url."+key+"=?"+(++index));
					}else{
						where.push("om_history."+key+"=?"+(++index));
					}
					para.push(aHistObject[key]);
				}
			}
			var oSql = 'select' +
				' om_url.uid' +
				',om_url.uid_url' +
				',om_history.hid' +
				',om_history.hid_file' +
				',om_history.hid_path' +
				',om_history.hid_title' +
				',om_history.hid_date' +
				',om_history.hid_filesize' +
				' from om_history' +
				' LEFT JOIN om_url ON om_url.uid = om_history.uid';
			if(where.length>0) oSql += " where " + where.join(" and ");
			oSql += ' order by om_history.hid_date desc';
			var oFld = this._selectDB(oSql,para);
			if(oFld && oFld.length>0)
				return oFld;
			else
				return null;
		}catch(ex){
			this._dump("bitsAutocacheService._selectHistoryDB():"+ex);
			return null;
		}
	},

/////////////////////////////////////////////////////////////////////
	_updateHistoryDB : function(aHistObject){
		if(!aHistObject) return false;
		if(!aHistObject.uid && !aHistObject.hid) return false;
		try{
			var rtn = true;
			var values = [];
			var para = [];
			var index=0;
			var key;
			for(key in aHistObject){
				if(aHistObject[key] == undefined || key == "uid" || key == "uid_url" || key == "hid") continue;
				values.push(key+'=?'+(++index));
				para.push(aHistObject[key]);
			}
			if(rtn && values.length>0){
				var aSql = 'update om_history set '+ values.join(",");
				var where = [];
				if(aHistObject.uid){
					where.push("uid=?"+(++index));
					para.push(aHistObject.uid);
				}
				if(aHistObject.hid){
					where.push("hid=?"+(++index));
					para.push(aHistObject.hid);
				}
				if(where.length>0) aSql += " where " + where.join(" and ");
				rtn = this._cmdDB(aSql,para);
			}
			return rtn;
		}catch(ex){
			this._dump("bitsAutocacheService._updateUrlDB():"+ex);
			return false;
		}
	},
/////////////////////////////////////////////////////////////////////
	_deleteHistoryDB : function(aHistObject){
		if(!aHistObject) return false;
		if(!aHistObject.uid && !aHistObject.hid) return false;
		try{
			var para = [];
			var where = [];
			var key;
			var index=0;
			if(aHistObject){
				for(key in aHistObject){
					where.push("om_history."+key+"=?"+(++index));
					para.push(aHistObject[key]);
				}
			}
			var oSql = 'delete from om_history';
			if(where.length>0) oSql += " where " + where.join(" and ");
			return this._cmdDB(oSql,para);
		}catch(ex){
			this._dump("bitsAutocacheService._deleteHistoryDB():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};

/////////////////////////////////////////////////////////////////////
function bitsAutocacheDocument(aAutocacheDir) {
	this.document = null;
	this._name = "";
	this.dataDirName = null;
	this.AutocacheDir = null;
	if(aAutocacheDir) this.AutocacheDir = aAutocacheDir;
	this._id = null;
	this._treeRes = null;
	this._url2autocache = [];
	this.oid = null;
	this.oldURL2newURL = [];
	this.scrollhref = "";
	this.scrollWin = [];
	this.AutocacheURL = [];
	this.item = this.Common.newItem(this.DataSource.identify(this.Common.getTimeStamp()));
	this.file2URL = [];
	this.httpTask = [];
	this.linkURLs = [];
	this.frameList = [];
	this.frameNumber = 0;
	this.fileNumber = 0;
	this.httpTask[this.item.id] = 0;
	this.basedir = bitsAutocacheService.cachedir;
	if(!this.basedir.exists()) this.basedir.create(this.basedir.DIRECTORY_TYPE, 0777);
};

bitsAutocacheDocument.prototype = {
	get SAVEMODE_FILEONLY()     { return 0x00 },
	get SAVEMODE_COMPLETE_DOM() { return 0x01 },
	get SAVEMODE_COMPLETE_TEXT(){ return 0x02 },

	get STRING() { return document.getElementById("bitsAutocacheString"); },

	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get XPath()      { return bitsObjectMng.XPath;      },
	get Database()   { return bitsObjectMng.Database;   },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

	get name() {
		return this._name;
	},
	set name(aName) {
		if(aName && aName != ""){
			this.dataDirName = aName + "_files";
		}else{
			this.dataDirName = null;
		}
		return this._name = aName;
	},

	get id() {
		return this._id;
	},
	set id(aID) {
		return this._id = aID;
	},

	get treeRes() { return this._treeRes; },
	set treeRes(aRes) { return this._treeRes = aRes; },

	get autocache() {
		var autocache = bitsMarkingCollection.getExtensionDir();
		if(!autocache.exists()) autocache.create(autocache.DIRECTORY_TYPE, 0777);
		autocache.append("autocache");
		if(!autocache.exists()) autocache.create(autocache.DIRECTORY_TYPE, 0777);
		return autocache;
	},

	get defaultdir() {
		return this.basedir.clone();
	},

	Autocachedir : function(aClass) {
		if(this.AutocacheDir) return this.AutocacheDir.clone();
		var dir;
		if(bitsAutocacheService.prefs.data.default || !bitsAutocacheService.prefs.data.localfile){
			dir = aClass.defaultdir;
		}else{
			dir = bitsAutocacheService.prefs.data.localfile.clone();
		}
		if(aClass.id){
			dir.append(aClass.id);
			if(!dir.exists()) try{ dir.create(dir.DIRECTORY_TYPE, 0777); }catch(ex){ alert("bitsAutocacheDocument.Autocachedir()"+ex);return undefined; }
		}
		return dir.clone();
	},

/////////////////////////////////////////////////////////////////////
	done : function(){},

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
	markingDocument : function(aDocument){
		try{
			var doc_url = this.Common.getURLStringFromDocument(aDocument);
			if(this.AutocacheURL[doc_url] == undefined) return;
			var dir_arr = [];
			var entries = this.AutocacheURL[doc_url].dir.directoryEntries;
			while(entries.hasMoreElements()){
				var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
				dir_arr.push(entry);
			}
			if(dir_arr.length == 0) return;
			dir_arr.sort(function(a,b){ return b.lastModifiedTime - a.lastModifiedTime; });
			while(dir_arr.length>0){
				var dir = dir_arr.shift();
				var url_file = dir.clone();
				url_file.append(".urlinfo");
				if(!url_file.exists()) continue;
				var oldURL2newURL = [];
				var newURL2oldURL = [];
				var url = this.readFile(url_file);
				var url_arr = url.split("\n");
				var urlcnt;
				for(urlcnt=0;urlcnt<url_arr.length;urlcnt++){
					var temp_arr = url_arr[urlcnt].split("\t");
					oldURL2newURL[temp_arr[0]] = temp_arr[1];
					newURL2oldURL[temp_arr[1]] = temp_arr[0];
				}
				if(oldURL2newURL[doc_url] == undefined) continue;
				var rtnObj = this.Database.getAllObjectFormURL(oldURL2newURL[doc_url],undefined,undefined,"text");
				if(!rtnObj) continue;
				var cnt;
				for(cnt=0;cnt<rtnObj.length;cnt++){
					var rObj = rtnObj[cnt];
					if(newURL2oldURL[rObj.con_url] == undefined) continue;
					var con_url = newURL2oldURL[rObj.con_url];
					var rtnContent = bitsMarker.xPathMarker(aDocument, {start:rObj.bgn_dom,end:rObj.end_dom,context:rObj.oid_txt,con_url:con_url}, { id:rObj.oid, dbtype:rObj.dbtype, pfid:rObj.pfid, style:rObj.fid_style });
				}
			}
		}catch(ex){
			throw new Error("bitsAutocacheDocument.markingDocument():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	exec : function(aForced){
		var self = this;
		return self._exec(self, aForced);
	},

/////////////////////////////////////////////////////////////////////
	_exec : function(aClass, aForced){
		if(!aForced) aForced = false;
		try{
			var doc = bitsAutocacheService.gBrowser.contentDocument;
			var urlString = bitsAutocacheService.Common.getURLStringFromDocument(doc);
			if(bitsAutocacheService.isCacheURL(urlString)) return false;
			var timeStamp = bitsAutocacheService.getURLTimeStamp(urlString);
			var dir = bitsAutocacheService.getURLCacheDirFromTimeStamp(urlString,timeStamp);
			if(!aForced && dir && dir.exists()) return false;
			if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0777);
			setTimeout(function(){
				try{
					aClass.frameList = aClass.flattenFrames(aClass, doc.defaultView);
					if(aClass.frameList){
						var marker_arr = [];
						var cnt;
						for(cnt=0;cnt<aClass.frameList.length;cnt++){
							var xPathSPAN = bitsAutocacheService.XPath.evaluate('//*[starts-with(@id,"'+bitsMarker.id_key+'")]', aClass.frameList[cnt].document);
							if(xPathSPAN){
								var keyreg = new RegExp("^"+bitsMarker.id_key);
								var xpathcnt;
								for(xpathcnt=0;xpathcnt<xPathSPAN.snapshotLength;xpathcnt++){
									var node = xPathSPAN.snapshotItem(xpathcnt);
									var id_attr = node.getAttribute("id");
									if(!id_attr.match(keyreg)) continue;
									marker_arr.push(id_attr);
									node = undefined;
								}
								xPathSPAN = undefined;
							}
						}
						for(cnt=0;cnt<marker_arr.length;cnt++){
							bitsMarker.unmarkerWindow(marker_arr[cnt]);
						}
						marker_arr.length = 0;
						marker_arr = undefined;
					}
				}catch(e){
					aClass._dump("bitsAutocacheDocument._exec():"+e);
				}
				aClass._createDocCache(aClass, doc, dir, false);
				var rtn = bitsMarkingCollection.marking(doc);
			},0);
			return true;
		}catch(ex){
			throw new Error("bitsAutocacheDocument._exec():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	_createDocCache : function(aClass, aDocument, aCacheDir, aLoadURL){
		var newFile;
		if(aLoadURL == undefined) aLoadURL = false;
		var fileKey = null;
		var fileName = bitsAutocacheService.Common.getFileName(aDocument.location.href);
		var splitFileName = bitsAutocacheService.Common.splitFileName(fileName);
		if(!splitFileName[0] || splitFileName[0] == ""){
			fileKey = "index";
		}else{
			fileKey = splitFileName[0];
		}
		if(fileKey.length>8) fileKey = fileKey.substr(0,8);
		fileKey = aClass.validateFileName(fileKey);
		try{
			if(aDocument.location){
				newFile = aClass.cacheDocumentInternal(aClass, aDocument, fileKey, aCacheDir);
				if(newFile){
					var urlString = bitsAutocacheService.Common.getURLStringFromDocument(aDocument);
					var info_file = aCacheDir.clone();
					info_file.append(".info");
					if(!info_file.exists()){
						var info = "URL\t"   + urlString + "\n";
						info += "INDEX\t" + newFile.leafName + "\n";
						info += "TITLE\t" + aDocument.title + "\n";
						bitsAutocacheService.writeFile(info_file,info);
					}
					var url_file = aCacheDir.clone();
					url_file.append(".urlinfo");
					if(url_file.exists()) url_file.remove(true);
					var url = "";
					var urlkey;
					var baseURL = bitsAutocacheService.Common.convertFilePathToURL(aCacheDir.path);
					var resolveURL;
					for(urlkey in aClass.oldURL2newURL){
						if(typeof aClass.oldURL2newURL[urlkey] == "function") continue;
						resolveURL = new String(aClass.oldURL2newURL[urlkey]);
						if(resolveURL.indexOf(baseURL)==0) resolveURL = resolveURL.substring(baseURL.length);
						url += urlkey + "\t" + resolveURL + "\n";
					}
					if(url != "") bitsAutocacheService.writeFile(url_file,url);
					var timeStamp = aCacheDir.leafName;
					var urlsdb = bitsAutocacheService._selectUrlDB({uid_url:urlString});
					if(!urlsdb){
						bitsAutocacheService._insertUrlDB({uid:timeStamp,uid_url:urlString});
						urlsdb = bitsAutocacheService._selectUrlDB({uid_url:urlString});
					}
					if(urlsdb){
						var rtn = bitsAutocacheService._insertHistoryDB({
							uid          : urlsdb[0].uid,
							hid          : timeStamp,
							hid_file     : newFile.leafName,
							hid_path     : this.Common.convertFilePathToURL(aCacheDir.path),
							hid_title    : aDocument.title?aDocument.title:urlString,
							hid_date     : timeStamp,
							hid_filesize : this.Common.getFilesize(aCacheDir),
						});
					}
				}
			}
		}catch(ex){
			throw new Error("bitsAutocacheDocument._createDocCache():"+ex);
		}
		return newFile;
	},

/////////////////////////////////////////////////////////////////////
	scroll : function(aClass, aEvent){
		if(aClass.scrollhref == "") return;
		if(aEvent.target.location.href != aClass.scrollhref) return;
		if(aClass.httpTask[aClass.item.id] > 0) return;
		aClass.scrollhref = "";
		bitsAutocacheService.gBrowser.removeEventListener("pageshow", function(aEvent){ aClass.scroll(aClass, aEvent); }, false);
		var frameList = aClass.flattenFrames(aClass, aEvent.target.defaultView);
		var i,j;
		for(i=0;i<aClass.scrollWin.length;i++){
			var val = aClass.scrollWin[i];
			if(val.scrollLeft == 0 && val.scrollTop == 0 && val.scrollBLeft == 0 && val.scrollBTop == 0) continue;
			for(j=0;j<frameList.length;j++){
				if(val.href != frameList[j].document.location.href) continue;
				if(val.scrollLeft != 0  || val.scrollTop != 0)  frameList[j].scrollTo(val.scrollLeft,val.scrollTop);
				if(val.scrollBLeft != 0 || val.scrollBTop != 0) frameList[j].scrollTo(val.scrollBLeft,val.scrollBTop);
			}
		}
		aClass.scrollWin.length = 0;
		aClass.scrollWin = [];
	},

/////////////////////////////////////////////////////////////////////
	flattenFrames : function(aClass, aWindow){
		if(!aWindow) return [];
		var ret = [aWindow];
		var i;
		for(i=0;i < aWindow.frames.length;i++){
			ret = ret.concat(aClass.flattenFrames(aClass, aWindow.frames[i]));
		}
		return ret;
	},

/////////////////////////////////////////////////////////////////////
	validateFileName : function(aFileName){
		var re = /[\/]+/g;
		if(navigator.appVersion.indexOf("Windows") != -1){
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
		}else if(navigator.appVersion.indexOf("Macintosh") != -1)
			re = /[\:\/]+/g;
		return aFileName.replace(re, "_");
	},

/////////////////////////////////////////////////////////////////////
	cacheDocumentInternal : function(aClass, aDocument, aFileKey, aCacheDir){
		if(!aDocument) return undefined;
		if(!aFileKey) return undefined;
		if(!aCacheDir) return undefined;
		if(!aDocument.location) return undefined;
		aClass.document = aDocument;
		aClass.name = aFileKey;
		aClass.AutocacheDir = aCacheDir.clone();
		aClass.frameList = aClass.flattenFrames(aClass, aDocument.defaultView);
		aClass.frameListHash = {};
		for(var cnt=0;cnt<aClass.frameList.length;cnt++){
			var url = aClass.frameList[cnt].document.location.href;
			aClass.frameListHash[url] = aClass.frameList[cnt];
		}
		var dataDir = aClass.AutocacheDir.clone();
		if(aClass.dataDirName) dataDir.append(aClass.dataDirName);
		if(!aDocument.body || !aDocument.contentType || !aDocument.contentType.match(/html|xml/i)){
			var captureType = (aDocument.contentType && aDocument.contentType.substring(0,5) == "image") ? "image" : "file";
			if(aClass.frameNumber == 0 ) aClass.item.type = captureType;
			var newLeafName = aClass.cacheFileInternal(aClass, aDocument.location.href, aFileKey, captureType);
			return newLeafName;
		}
		aClass.refURLObj = bitsAutocacheService.Common.convertURLToObject(aDocument.location.href);
		var tmpNodeList = [];
		tmpNodeList.unshift(aDocument.body.cloneNode(true));
		var rootNode = aDocument.getElementsByTagName("html")[0].cloneNode(false);
		try{
			var headNode = aDocument.getElementsByTagName("head")[0].cloneNode(true);
			rootNode.appendChild(headNode);
			rootNode.appendChild(aDocument.createTextNode("\n"));
		}catch(ex){}
		rootNode.appendChild(tmpNodeList[0]);
		rootNode.appendChild(aDocument.createTextNode("\n"));
		var n;
		for(n=0;n<tmpNodeList.length-1;n++){
			tmpNodeList[n].appendChild(aDocument.createTextNode("\n"));
			tmpNodeList[n].appendChild(tmpNodeList[n+1]);
			tmpNodeList[n].appendChild(aDocument.createTextNode("\n"));
		}
		aClass.processDOMRecursively(aClass, rootNode);
		var cssFileKey = bitsAutocacheService.Common.getTimeStamp();
		cssFileKey = "sp_" + cssFileKey.substr(-5,5);
		if(cssFileKey.length>8) cssFileKey = cssFileKey.substr(0,8);
		var myCSS = "";
		var myStyleSheets = aDocument.styleSheets;
		var i;
		for(i=0;i<myStyleSheets.length;i++){
			myCSS += aClass.processCSSRecursively(aClass, myStyleSheets[i]);
		}
		if(myCSS){
			var newLinkNode = aDocument.createElement("link");
			newLinkNode.setAttribute("media", "all");
			newLinkNode.setAttribute("href", (aClass.dataDirName ? aClass.dataDirName + "/" : "") + cssFileKey + ".css");
			newLinkNode.setAttribute("type", "text/css");
			newLinkNode.setAttribute("rel", "stylesheet");
			rootNode.firstChild.appendChild(aDocument.createTextNode("\n"));
			rootNode.firstChild.appendChild(newLinkNode);
			rootNode.firstChild.appendChild(aDocument.createTextNode("\n"));
			myCSS = myCSS.replace(/\*\|/g, "");
			if(aClass.dataDirName){
				var regexp = new RegExp(aClass.dataDirName+"/","img");
				if(regexp) myCSS = myCSS.replace(regexp, "");
			}
		}
		var myHTML;
		myHTML = aClass.surroundByTags(rootNode, rootNode.innerHTML);
		myHTML = aClass.doctypeToString(aDocument.doctype) + myHTML;
		myHTML = myHTML.replace(/\x00/g, " ");
		var characterSet = aDocument.characterSet;
		var myHTMLFile = aCacheDir.clone();
		myHTMLFile.append(aFileKey + ".html");
		if(!myHTMLFile.exists()) bitsAutocacheService.Common.writeFile(myHTMLFile, myHTML, characterSet);
		if(myCSS){
			if(!dataDir.exists()) dataDir.create(dataDir.DIRECTORY_TYPE, 0777);
			if(!dataDir.exists()){
				alert(dataDir.path);
				return undefined;
			}
			var myCSSFile = dataDir.clone();
			myCSSFile.append(cssFileKey + ".css");
			if(!myCSSFile.exists()) bitsAutocacheService.Common.writeFile(myCSSFile, myCSS, characterSet);
			if(!myCSSFile.exists()) alert(myCSSFile.path);
		}
		aClass.oldURL2newURL[aDocument.location.href] = bitsAutocacheService.Common.convertFilePathToURL(myHTMLFile.path);
		return myHTMLFile;
	},

/////////////////////////////////////////////////////////////////////
	cacheFileInternal : function(aClass, aFileURL, aFileKey, aCaptureType){
		if(!aFileKey) aFileKey = "file" + Math.random().toString();
		if(!aClass.refURLObj ) aClass.refURLObj = bitsAutocacheService.Common.convertURLToObject(aFileURL);
		if(aClass.frameNumber == 0){
			aClass.item.icon  = "chrome://markingcollection/skin/defaultFavicon.png";
			aClass.item.type  = aCaptureType;
			aClass.item.chars = "";
		}
		var newFileName = aClass.download(aClass, aFileURL);
		var myHTML;
		if(aCaptureType == "image"){
			myHTML = '<html><body><img src="' + newFileName + '"></body></html>';
		} else {
			myHTML = '<html><head><meta http-equiv="refresh" content="0;URL=./' + newFileName + '"></head><body></body></html>';
		}
		var myHTMLFile = aClass.Autocachedir(aClass).clone();
		myHTMLFile.append(aFileKey + ".html");
		if(!myHTMLFile.exists()) bitsAutocacheService.Common.writeFile(myHTMLFile, myHTML, "UTF-8");

		return myHTMLFile;
	},

/////////////////////////////////////////////////////////////////////
	surroundByTags : function(aNode, aContent){
		var tag = "<" + aNode.nodeName.toLowerCase();
		var i;
		for(i=0;i<aNode.attributes.length;i++){
			tag += ' ' + aNode.attributes[i].name + '="' + aNode.attributes[i].value + '"';
		}
		tag += ">\n";
		return tag + aContent + "</" + aNode.nodeName.toLowerCase() + ">\n";
	},

/////////////////////////////////////////////////////////////////////
	doctypeToString : function(aDoctype){
		if(!aDoctype) return "";
		var ret = "<!DOCTYPE " + aDoctype.name;
		if(aDoctype.publicId) ret += ' PUBLIC "' + aDoctype.publicId + '"';
		if(aDoctype.systemId) ret += ' "'        + aDoctype.systemId + '"';
		ret += ">\n";
		return ret;
	},

/////////////////////////////////////////////////////////////////////
	processDOMRecursively : function(aClass, rootNode){
		var curNode;
		for(curNode=rootNode.firstChild;curNode != null;curNode = curNode.nextSibling){
			if(curNode.nodeName == "#text" || curNode.nodeName == "#comment") continue;
			curNode = aClass.inspectNode(aClass, curNode);
			aClass.processDOMRecursively(aClass, curNode);
		}
	},

/////////////////////////////////////////////////////////////////////
	inspectNode : function(aClass, aNode){
		switch(aNode.nodeName.toLowerCase()){
			case "img" : 
			case "embed" : 
				if(aNode.hasAttribute("onclick")) aNode = aClass.normalizeJSLink(aClass, aNode, "onclick");
				var aFileName = aClass.download(aClass, aNode.src);
				if(aFileName) aNode.setAttribute("src", aFileName);
				break;
			case "object" : 
				var aFileName = aClass.download(aClass, aNode.data);
				if (aFileName) aNode.setAttribute("data", aFileName);
				break;
			case "body" : 
				var aFileName = aClass.download(aClass, aNode.background);
				if (aFileName) aNode.setAttribute("background", aFileName);
				break;
			case "table" : 
			case "tr" : 
			case "th" : 
			case "td" : 
				var aFileName = aClass.download(aClass, aNode.getAttribute("background"));
				if (aFileName) aNode.setAttribute("background", aFileName);
				break;
			case "input" : 
				if(aNode.type.toLowerCase() == "image"){
					var aFileName = aClass.download(aClass, aNode.src);
					if(aFileName) aNode.setAttribute("src", aFileName);
				}
				break;
			case "link" : 
				if(aNode.rel.toLowerCase() == "stylesheet" && aNode.href.indexOf("chrome") != 0){
					return aClass.removeNodeFromParent(aNode);
				}else if(aNode.rel.toLowerCase() == "shortcut icon" || aNode.rel.toLowerCase() == "icon"){
					var aFileName = aClass.download(aClass, aNode.href);
					if(aFileName) aNode.setAttribute("href", aFileName);
					if(aClass.frameNumber == 0 && !aClass.favicon) aClass.favicon = aFileName;
				}else{
					aNode.setAttribute("href", aNode.href);
				}
				break;
			case "base" : 
				aNode.removeAttribute("href");
				if(!aNode.hasAttribute("target")) return aClass.removeNodeFromParent(aNode);
				break;
			case "style" : 
				return aClass.removeNodeFromParent(aNode);
				break;
			case "script" : 
			case "noscript" : 
				return aClass.removeNodeFromParent(aNode);
				break;
			case "a" : 
				if(aNode.hasAttribute("href")){
					var href = aNode.getAttribute("href");
					if(href.match(/http:\/\/ad\.doubleclick\.net\//)){
						aNode.removeAttribute("href");
						aNode.innerHTML = "";
						break;
					}
				}
			case "area" : 
				if(aNode.hasAttribute("onclick")) aNode = aClass.normalizeJSLink(aClass, aNode, "onclick");
				if(!aNode.hasAttribute("href")) return aNode;
				if(aNode.target == "_blank") aNode.setAttribute("target", "_top");
				if(aNode.href.match(/^javascript:/i) ) aNode = aClass.normalizeJSLink(aClass, aNode, "href");
				if(aNode.getAttribute("href").charAt(0) == "#") return aNode;
				var ext = bitsAutocacheService.Common.splitFileName(bitsAutocacheService.Common.getFileName(aNode.href))[1].toLowerCase();
				var flag = false;
				switch(ext){
					case "jpg" : case "jpeg" : case "png" : case "gif" : case "tiff" : flag = true; break;
					case "mp3" : case "wav"  : case "ram" : case "rm"  : case "wma"  : flag = true; break;
					case "mpg" : case "mpeg" : case "avi" : case "mov" : case "wmv"  : flag = true; break;
					case "zip" : case "lzh"  : case "rar" : case "jar" : case "xpi"  : flag = true; break;
					default : aClass.linkURLs.push(aNode.href);
				}
				if(!flag && aNode.href.indexOf("file://") == 0 && !aNode.href.match(/\.html(?:#.*)?$/)) flag = true;
				if(flag){
					var aFileName = aClass.download(aClass, aNode.href);
					if(aFileName) aNode.setAttribute("href", aFileName);
				}else{
					aNode.setAttribute("href", aNode.href);
				}
				break;
			case "form" : 
				aNode.setAttribute("action", bitsAutocacheService.Common.resolveURL(aClass.refURLObj.spec, aNode.action));
				break;
			case "meta" : 
				break;
			case "frame"  : 
			case "iframe" : 
				var tmpRefURL = aClass.refURLObj;
				aClass.frameNumber++
				try{
					var src = aNode.src;
					var contentDocument;
					if(!contentDocument) contentDocument = aClass.frameList[aClass.frameNumber].document;
					if(!contentDocument){
						aNode.removeAttribute("src");
						break;
					}
					if(contentDocument.location.href.match(/http:\/\/ad\.doubleclick\.net\//)){
						aNode.removeAttribute("src");
						break;
					}
					var fileName = bitsAutocacheService.Common.getFileName(contentDocument.location.href);
					var splitFileName = bitsAutocacheService.Common.splitFileName(fileName);
					if(!splitFileName[0] || splitFileName[0] == "") splitFileName[0] = "index";
					splitFileName[0] = aClass.validateFileName(splitFileName[0]);
					var dataDir = aClass.AutocacheDir.clone();
					if(aClass.dataDirName) dataDir.append(aClass.dataDirName);
					if(!dataDir.exists()) dataDir.create(dataDir.DIRECTORY_TYPE, 0777);
					var newClass = new bitsAutocacheDocument(dataDir);
					newClass.id = null;
					var framedoc = contentDocument;
					var aCacheDir = dataDir.clone();
					splitFileName[0] = (splitFileName[0].length>8 ? splitFileName[0].substr(0,8) : splitFileName[0]);
					var newFile = newClass.cacheDocumentInternal(newClass, framedoc, splitFileName[0], aCacheDir);
					if(newFile) aNode.setAttribute("src", (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFile.leafName);
					var key;
					for(key in newClass.oldURL2newURL){
						if(typeof newClass.oldURL2newURL[key] == "function") continue;
						aClass.oldURL2newURL[key] = newClass.oldURL2newURL[key];
					}
					newClass.done();
					newClass = undefined;
				}catch(ex){
					aClass._dump("WiredMarker ERROR: Failed to get document in a frame.\n\n" + ex);
				}
				aClass.refURLObj = tmpRefURL;
				break;
			case "xmp" : 
				var pre = aNode.ownerDocument.createElement("pre");
				pre.appendChild(aNode.firstChild);
				aNode.parentNode.replaceChild(pre, aNode);
				break;
		}
		if(aNode.style && aNode.style.cssText){
			var newCSStext = aClass.inspectCSSText(aClass, aNode.style.cssText, aClass.refURLObj.spec);
			if(newCSStext) aNode.setAttribute("style", newCSStext);
		}
		return aNode;
	},

/////////////////////////////////////////////////////////////////////
	removeNodeFromParent : function(aNode){
		var newNode = aNode.ownerDocument.createTextNode("");
		aNode.parentNode.replaceChild(newNode, aNode);
		aNode = newNode;
		return aNode;
	},

/////////////////////////////////////////////////////////////////////
	processCSSRecursively : function(aClass, aCSS){
		var content = "";
		if(!aCSS) return "";
		if(aCSS.disabled) return "";
		var medium = aCSS.media.mediaText;
		if(medium != "" && medium.indexOf("screen") < 0 && medium.indexOf("all") < 0) return "";
		if(aCSS.href && aCSS.href.indexOf("chrome") == 0) return "";
		var flag = false;
		var i;
		for(i=0;i<aCSS.cssRules.length;i++){
			if(aCSS.cssRules[i].type == 1 || aCSS.cssRules[i].type == 4){
				if(!flag){
					content += "\n/* ::::: " + aCSS.href + " ::::: */\n\n";
					flag = true;
				}
				content += aClass.inspectCSSText(aClass, aCSS.cssRules[i].cssText, (aCSS.href?aCSS.href: bitsAutocacheService.Common.getURLStringFromDocument(aClass.document) )) + "\n";
			}else if(aCSS.cssRules[i].type == 3){
				content += aClass.processCSSRecursively(aClass, aCSS.cssRules[i].styleSheet);
			}
		}
		return content;
	},

/////////////////////////////////////////////////////////////////////
	inspectCSSText : function(aClass, aCSStext, aCSShref){
		if(!aCSStext) return "";
		var re = new RegExp(/ url\(([^\'\)\s]+)\)/);
		var i = 0;
		while(aCSStext.match(re)){
			if(++i > 10) break;
			var relURL = RegExp.$1;
			relURL = relURL.replace(/^\s*/g,"").replace(/\s*$/g,"").replace(/^(['"])(.+)\1$/,"$2");
			var imgURL  = bitsAutocacheService.Common.resolveURL(aCSShref, relURL);
			var imgFile = aClass.download(aClass, imgURL);
			aCSStext = aCSStext.replace(re, " url('" + imgFile + "')");
		}
		aCSStext = aCSStext.replace(/([^\{\}])(\r|\n)/g, "$1\\A");
		re = new RegExp(/ content: \"(.*?)\"; /);
		if(aCSStext.match(re)){
			var innerQuote = RegExp.$1;
			innerQuote = innerQuote.replace(/\"/g, '\\"');
			innerQuote = innerQuote.replace(/\\\" attr\(([^\)]+)\) \\\"/g, '" attr($1) "');
			aCSStext = aCSStext.replace(re, ' content: "' + innerQuote + '"; ');
		}
		if(aCSStext.match(/ (quotes|voice-family): \"/)) return "";
		if(aCSStext.indexOf(" background: ") >= 0){
			aCSStext = aCSStext.replace(/ -moz-background-[^:]+: -moz-[^;]+;/g, "");
			aCSStext = aCSStext.replace(/ scroll 0(?:pt|px|%);/g, ";");
		}
		if(aCSStext.indexOf(" background-position: 0") >= 0) aCSStext = aCSStext.replace(/ background-position: 0(?:pt|px|%);/, " background-position: 0 0;");
		return aCSStext;
	},

/////////////////////////////////////////////////////////////////////
	download : function(aClass, aURLSpec){
		if(!aURLSpec) return "";
		if(aURLSpec.indexOf("://") < 0) aURLSpec = bitsAutocacheService.Common.resolveURL(aClass.refURLObj.spec, aURLSpec);
		try{
			var aURL = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
			aURL.spec = aURLSpec;
		}catch(ex){
			return "";
		}
		var newFileName = aURL.fileName.toLowerCase();
		if(!newFileName) newFileName = "untitled";
		newFileName = bitsAutocacheService.Common.validateFileName(newFileName);
		var ret = bitsAutocacheService.Common.splitFileName(newFileName);
		if(ret.length == 2 && ret[0].length>8){
			ret[0] = aClass.fileNumber++;
			newFileName = ret.join(".");
		}
		if(aClass.file2URL[newFileName] == undefined){
		}
		else if(aClass.file2URL[newFileName] != aURLSpec){
			var seq = 1;
			var fileLR = bitsAutocacheService.Common.splitFileName(newFileName);
			if ( !fileLR[1] ) fileLR[1] = "dat";
			newFileName = fileLR[0] + "_" + aClass.leftZeroPad3(seq) + "." + fileLR[1];
			while(aClass.file2URL[newFileName] != undefined){
				if(aClass.file2URL[newFileName] == aURLSpec){
					return (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFileName;
				}
				newFileName = fileLR[0] + "_" + aClass.leftZeroPad3(++seq) + "." + fileLR[1];
			}
		}
		else{
			return (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFileName;
		}
		if(aURL.schemeIs("http") || aURL.schemeIs("https") || aURL.schemeIs("ftp")){
			var targetFile = aClass.AutocacheDir.clone();
			if(aClass.dataDirName) targetFile.append(aClass.dataDirName);
			if(!targetFile.exists()) targetFile.create(targetFile.DIRECTORY_TYPE, 0777);
			targetFile.append(newFileName);
			if(!targetFile.exists()){
				aClass.httpTask[aClass.item.id]++;
				try{
					var WBP = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
					WBP.persistFlags |= WBP.PERSIST_FLAGS_FROM_CACHE;
                                        
                                        /* TODO: Not enough arguments exception issue needs to be addressed */
                                        /* See: https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIWebBrowserPersist */
                                        /* See even: https://bugzilla.mozilla.org/show_bug.cgi?id=820522 */
                                        
                                        /* Dirty fix, might need to get replaced by a clean fix in case privacy information leak issues arise. */
                                        var privacyContext = null;
                                        
					WBP.saveURI(aURL, null, aClass.refURLObj, null, null, targetFile, privacyContext);
					var progressListener = {
						onLocationChange : function(webProgress, request, location){},
						onProgressChange : function(webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress){},
						onSecurityChange : function(webProgress, request, state){},
						onStateChange    : function(webProgress, request, stateFlags, status){
							if((WBP.currentState & WBP.PERSIST_STATE_FINISHED)){
								if(targetFile && targetFile.exists()){
									aClass.httpTask[aClass.item.id]--;
									var infoFile = bitsAutocacheService._getSaveCacheInfoFile(targetFile.parent);
									if(infoFile){
										var info = bitsAutocacheService._getSaveCacheInfo(infoFile.parent);
										if(info && info.URL){
											var histsdb = bitsAutocacheService._selectHistoryDB({uid_url:info.URL,hid_date:infoFile.parent.leafName});
											if(histsdb){
												histsdb[0].hid_filesize = targetFile.fileSize + parseInt(histsdb[0].hid_filesize);
												bitsAutocacheService._updateHistoryDB({
													uid          : histsdb[0].uid,
													hid          : histsdb[0].hid,
													hid_filesize : histsdb[0].hid_filesize,
												});
											}
										}
									}
									if(aClass.httpTask[aClass.item.id]<=0){
										bitsAutocacheService.refresh(false,1000);
									}else{
									}
								}else if(status != 0){
								}
							}
						},
						onStatusChange   : function(webProgress, request, status, message){},
					};
					WBP.progressListener = progressListener;
					aClass.file2URL[newFileName] = aURLSpec;
					aClass.oldURL2newURL[aURLSpec] = bitsAutocacheService.Common.convertFilePathToURL(targetFile.path);
					return (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFileName;
				}
				catch(ex) {
					dump("*** SCRAPPARTY_PERSIST_FAILURE: " + aURLSpec + "\n" + ex + "\n");
					aClass.httpTask[aClass.item.id]--;
					return "";
				}
			}else{
				aClass.oldURL2newURL[aURLSpec] = bitsAutocacheService.Common.convertFilePathToURL(targetFile.path);
				return (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFileName;
			}
		}
		else if(aURL.schemeIs("file")){
			var targetDir = aClass.AutocacheDir.clone();
			if(aClass.dataDirName) targetDir.append(aClass.dataDirName);
			if(!targetDir.exists()) targetDir.create(targetDir.DIRECTORY_TYPE, 0777);
			var targetFile = targetDir.clone();
			targetFile.append(newFileName);
			if(!targetFile.exists()){
				try {
					var orgFile = bitsAutocacheService.Common.convertURLToFile(aURLSpec);
					if(orgFile && orgFile.exists()){
						if(!orgFile.isFile()) return "";
						orgFile.copyTo(targetDir, newFileName);
						aClass.file2URL[newFileName] = aURLSpec;
						aClass.oldURL2newURL[aURLSpec] = bitsAutocacheService.Common.convertFilePathToURL(targetFile.path);
						return (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFileName;
					}else{
						return "";
					}
				}
				catch(ex) {
					aClass._dump("*** WIRED-MARKER_DOWNLOAD_FAILURE: " + aURLSpec + "\n" + ex + "\n");
					return "";
				}
			}else{
				aClass.oldURL2newURL[aURLSpec] = bitsAutocacheService.Common.convertFilePathToURL(targetFile.path);
				return (aClass.dataDirName ? aClass.dataDirName + "/" : "") + newFileName;
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	leftZeroPad3 : function(num){
		if(num<10){return "00"+num;}else if(num<100){return "0"+num;}else{return num;}
	},

/////////////////////////////////////////////////////////////////////
	normalizeJSLink : function(aClass, aNode, aAttr){
		var val = aNode.getAttribute(aAttr);
		if(!val.match(/\(\'([^\']+)\'/)) return aNode;
		val = RegExp.$1;
		if(val.indexOf("/") == -1 && val.indexOf(".") == -1) return aNode;
		val = bitsAutocacheService.Common.resolveURL(aClass.refURLObj.spec, val);
		if(aNode.nodeName.toLowerCase() == "img"){
			if(aNode.parentNode.nodeName.toLowerCase() == "a"){
				aNode.parentNode.setAttribute("href", val);
				aNode.removeAttribute("onclick");
			}else{
				val = "window.open('" + val + "');";
				aNode.setAttribute(aAttr, val);
			}
		}
		else{
			if(aNode.hasAttribute("href") && aNode.getAttribute("href").indexOf("http://") != 0){
				aNode.setAttribute("href", val);
				aNode.removeAttribute("onclick");
			}
		}
		return aNode;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};


