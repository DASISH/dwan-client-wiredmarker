var bitsFavoriteFolder = {
	_xmlfile : null,
	_xmldoc  : null,

	get idMENU()        { return "bitsFavoriteFolderMenu"; },
	get idMENU_ALL()    { return "bitsFavoriteFolderAllMenuitem"; },
	get idMENU_SELECT(){ return "bitsFavoriteFolderSelectMenuitem"; },

	get idCMENU()       { return "bitsFavoriteFolderContextmenu"; },

	get MENU()          { return document.getElementById(this.idMENU); },
	get MENU_ALL()      { return document.getElementById(this.idMENU_ALL); },

	get CMENU()         { return document.getElementById(this.idCMENU); },

	get TITLE()         { return window.top.document.getElementById("sidebar-title"); },

	get STRING()     { return window.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get xmldoc()     { return this._xmldoc; },
	get xmlurl()     { return (this._xmlfile?this.Common.convertFilePathToURL(this._xmlfile.path):""); },

	get confirmDelete(){ return true; },

	baseURL  : "",
	shouldRebuild : false,

	init : function(){
		var extensionDir = this.Common.getExtensionDir().clone();
		if(extensionDir){
			this._xmlfile = extensionDir.clone();
			this._xmlfile.append("favoritefolder.xml");
			if(!this._xmlfile.exists()){
				var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
				aContent += '<!DOCTYPE folders>\n<folders/>\n';
				this.Common.writeFile(this._xmlfile,aContent,"UTF-8");
			}
			function _loadXMLDocument(pUri){
				if(pUri == undefined) return undefined;
				var xmlDocument = window.top.bitsMarkingCollection.loadXMLDocument(pUri);
				if(xmlDocument){
					return xmlDocument;
				}else{
					return undefined;
				}
			}
			function _createXMLDocument(aXMLFile){
				if(!aXMLFile) return undefined;
				try{
					return _loadXMLDocument(bitsFavoriteFolder.Common.IO.newFileURI(aXMLFile).spec);
				}catch(ex){
					bitsFavoriteFolder._dump("bitsFavoriteFolder._createXMLDocument():"+ ex);
					return undefined;
				}
			}
			this._xmldoc = _createXMLDocument(this._xmlfile);
		}
		this.MENU.setAttribute("datasources",this.xmlurl);

	},

	done : function(){},

	rebuild : function(){},

	xmlflash : function(){
		var s = new XMLSerializer();
		var xml = s.serializeToString(this.xmldoc);
		this.Common.writeFile(this._xmlfile, xml+"\n","UTF-8");

		this.MENU.removeAttribute("datasources");
		setTimeout(function(){bitsFavoriteFolder.MENU.setAttribute("datasources",bitsFavoriteFolder.xmlurl);},0);

		var contentWindow;
		var mcTreeFavoriteFolder;
		if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
		if(contentWindow && contentWindow.mcTreeFavoriteFolder) mcTreeFavoriteFolder = contentWindow.mcTreeFavoriteFolder;

		if(mcTreeFavoriteFolder){
			mcTreeFavoriteFolder.MENU.removeAttribute("datasources");
			setTimeout(function(){mcTreeFavoriteFolder.MENU.setAttribute("datasources",bitsFavoriteFolder.xmlurl);},0);
		}
	},

	AddFavoriteFolder : function(aFolder){
		var results = this.XPath.evaluateArray('//folder[@fid="'+aFolder.fid+'" and @dbtype="'+aFolder.dbtype+'"]',this.xmldoc);
		if(results.length){
			if(!this.Common.confirm(this.STRING.getString("CONFIRM_REGISTERED_FAVORITE_FOLDER"))) return;
		}

		if(this.xmldoc){
			var node = this.xmldoc.createElement("folder");
			node.setAttribute("title",aFolder.title);
			node.setAttribute("dbtype",aFolder.dbtype);
			node.setAttribute("fid",aFolder.fid);
			this.xmldoc.documentElement.appendChild(node);

			this.xmlflash();

		}
	},

	onPopupShowing : function(aEvent, aPopupRoot){
		var r_fid = nsPreferences.copyUnicharPref("wiredmarker.rootfolder");
		var r_dbtype = nsPreferences.copyUnicharPref("wiredmarker.rootfolder_dbtype");
		if(!r_fid || !r_dbtype){
			this.MENU_ALL.setAttribute("disabled","true");
		}else{
			this.MENU_ALL.removeAttribute("disabled");
		}

		var results = this.XPath.evaluateArray('//folder[@fid and @dbtype]',this.xmldoc);
		if(results.length){
			var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
			var parser = new DOMParser();
			var i;
			for(i=0;i<results.length;i++){
				try{
					var attr = results[i].attributes;
					var j;
					if(osString != "Darwin"){
						var elemMenuitem = top.document.createElement("menuitem");
						for(j=0;j<attr.length;j++){
							elemMenuitem.setAttribute(attr[j].name,attr[j].value);
						}
						elemMenuitem.setAttribute("label",results[i].getAttribute("title"));
						elemMenuitem.setAttribute("contextmenu","bitsFavoriteFolderContextmenu");
						elemMenuitem.setAttribute("class","menuitem-iconic");
						elemMenuitem.setAttribute("image","chrome://markingcollection/skin/folder.png");
						var folders = this.Database.getFolderFormID(results[i].getAttribute("fid"),results[i].getAttribute("dbtype"));
						if(folders && folders[0].fid_property){
							var xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
							if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
							if(xmldoc){
								var elems = xmldoc.getElementsByTagName("ICON");
								if(elems && elems.length>0) elemMenuitem.setAttribute("image",elems[0].textContent);
								elems = undefined;
								xmldoc = undefined;
							}
						}
						aPopupRoot.appendChild(elemMenuitem);
					}else{
						var elemMenu = top.document.createElement("menu");
						for(j=0;j<attr.length;j++){
							elemMenu.setAttribute(attr[j].name,attr[j].value);
						}
						elemMenu.setAttribute("label",results[i].getAttribute("title"));
						elemMenu.setAttribute("class","menu-iconic");
						elemMenu.setAttribute("image","chrome://markingcollection/skin/folder.png");
						var folders = this.Database.getFolderFormID(results[i].getAttribute("fid"),results[i].getAttribute("dbtype"));
						if(folders && folders[0].fid_property){
							var xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
							if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
							if(xmldoc){
								var elems = xmldoc.getElementsByTagName("ICON");
								if(elems && elems.length>0) elemMenu.setAttribute("image",elems[0].textContent);
								elems = undefined;
								xmldoc = undefined;
							}
						}
						var elemMenupopup = top.document.createElement("menupopup");
						elemMenu.appendChild(elemMenupopup);
						elemMenupopup.addEventListener("popupshowing", function(aEvent){aEvent.stopPropagation();}, false);
						elemMenupopup.addEventListener("popuphiding", function(aEvent){aEvent.stopPropagation();}, false);
						var elemMenuitemSel = top.document.createElement("menuitem");
						elemMenuitemSel.setAttribute("label",this.STRING.getString("FAVORITEFOLDER_SELECT"));
						for(j=0;j<attr.length;j++){
							elemMenuitemSel.setAttribute(attr[j].name,attr[j].value);
						}
						elemMenuitemSel.setAttribute("class","menuitem-iconic");
						elemMenuitemSel.setAttribute("image","chrome://markingcollection/skin/folder.png");
						var folders = this.Database.getFolderFormID(results[i].getAttribute("fid"),results[i].getAttribute("dbtype"));
						if(folders && folders[0].fid_property){
							var xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
							if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
							if(xmldoc){
								var elems = xmldoc.getElementsByTagName("ICON");
								if(elems && elems.length>0) elemMenuitemSel.setAttribute("image",elems[0].textContent);
								elems = undefined;
								xmldoc = undefined;
							}
						}
						elemMenupopup.appendChild(elemMenuitemSel);
						var elemMenuitemDel = top.document.createElement("menuitem");
						elemMenuitemDel.setAttribute("label",this.STRING.getString("FAVORITEFOLDER_DELETE"));
						for(j=0;j<attr.length;j++){
							elemMenuitemDel.setAttribute(attr[j].name,attr[j].value);
						}
						elemMenuitemDel.setAttribute("class","menuitem-iconic");
						elemMenuitemDel.setAttribute("image","chrome://markingcollection/skin/menu_remove.png");
						var folders = this.Database.getFolderFormID(results[i].getAttribute("fid"),results[i].getAttribute("dbtype"));
						if(folders && folders[0].fid_property){
							var xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
							if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
							if(xmldoc){
								var elems = xmldoc.getElementsByTagName("ICON");
								if(elems && elems.length>0) elemMenuitemDel.setAttribute("image",elems[0].textContent);
								elems = undefined;
								xmldoc = undefined;
							}
						}
						elemMenuitemDel.addEventListener("command", function(aEvent){
							aEvent.stopPropagation();
							bitsFavoriteFolder._explicitOriginalTarget = aEvent.target;
							bitsFavoriteFolder.removeFavoriteFolder(aEvent);
						}, false);
						elemMenupopup.appendChild(elemMenuitemDel);
						aPopupRoot.appendChild(elemMenu);
					}
				}catch(e){}
			}
			parser = undefined;
		}

	},

	onPopupHiding : function(aEvent, aPopupRoot){
		setTimeout(function(){
				var i;
				for(i=aPopupRoot.childNodes.length-1;i>=0;i--){
					if(aPopupRoot.childNodes[i].id == "bitsFavoriteFolderAllMenuseparator") break;
					aPopupRoot.removeChild(aPopupRoot.childNodes[i]);
				}
			},0);

	},

	onClick : function(aEvent){
		var contentWindow;
		var mcTreeHandler;
		var mcItemView;
		var mcTreeViewModeService;

		if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
		if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
		if(contentWindow && contentWindow.mcItemView) mcItemView = contentWindow.mcItemView;
		if(contentWindow && contentWindow.mcTreeViewModeService) mcTreeViewModeService = contentWindow.mcTreeViewModeService;


		if(aEvent.target.id == bitsFavoriteFolder.idMENU_ALL){
			this.Common.PREF.clearUserPref("wiredmarker.rootfolder");
			this.Common.PREF.clearUserPref("wiredmarker.rootfolder_dbtype");
			if(mcTreeViewModeService) mcTreeViewModeService.rebuild();
			return;

		}else if(aEvent.target.id == bitsFavoriteFolder.idMENU_SELECT){
			try{var res = mcTreeHandler.resource;}catch(e){}
			if(!res) return;

			var fid = this.DataSource.getProperty(res, "id");
			var dbtype = this.DataSource.getProperty(res, "dbtype");
			var title = this.DataSource.getProperty(res, "title");

			this.AddFavoriteFolder({fid:fid,dbtype:dbtype,title:title});



		}else{
			var fid = aEvent.target.getAttribute("fid");
			var dbtype = aEvent.target.getAttribute("dbtype");

			nsPreferences.setUnicharPref("wiredmarker.rootfolder", fid);
			nsPreferences.setUnicharPref("wiredmarker.rootfolder_dbtype", dbtype);
			if(mcTreeViewModeService) mcTreeViewModeService.rebuild();
			return;

		}
		aEvent.stopPropagation();
	},

	onPopupFShowing : function(aEvent){
		if(aEvent.explicitOriginalTarget.id == this.idMENU_ALL){
			setTimeout(function(){aEvent.target.hidePopup();},0);
			return;
		}

		this._explicitOriginalTarget = aEvent.explicitOriginalTarget;

	},

	_confirmRemovingFor : function(){
		try{
			if(this.confirmDelete){
				return this.Common.confirm( this.STRING.getString("CONFIRM_DELETE") );
			}
			return true;
		}catch(e){
			return false;
		}
	},

	removeFavoriteFolder : function(aEvent){
		if(!this.xmldoc || !this._explicitOriginalTarget) return;
		if(!this._confirmRemovingFor()) return;

		var fid = this._explicitOriginalTarget.getAttribute("fid");
		var dbtype = this._explicitOriginalTarget.getAttribute("dbtype");

		var results = this.XPath.evaluateArray('//folder[@fid="'+fid+'" and @dbtype="'+dbtype+'"]',this.xmldoc);
		if(results.length){
			var i;
			for(i=results.length-1;i>=0;i--){
				results[i].parentNode.removeChild(results[i]);
			}
			this.xmlflash();
		}
		this._explicitOriginalTarget = undefined;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};

