/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var mcTreeFavoriteFolder = {
	get idMENU()        { return "mcToolbarFavoriteFolderButton"; },
	get idMENU_SELECT(){ return "bitsFavoriteFolderSelectMenuitem"; },
	get idMENU_POPUP()  { return "mcToolbarFavoriteFolderPopup"; },
	get idMENU_ALL()    { return "bitsFavoriteFolderAllMenuitem"; },
	get MENU()          { return document.getElementById(this.idMENU); },
	get MENU_SELECT()   { return document.getElementById(this.idMENU_SELECT); },
	get MENU_POPUP()    { return document.getElementById(this.idMENU_POPUP); },
	get MENU_ALL()      { return document.getElementById(this.idMENU_ALL); },
	get TITLE()         { return window.top.document.getElementById("sidebar-title"); },

	get STRING()     { return window.top.document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	baseURL  : "",
	shouldRebuild : false,

	init : function(){
		this.MENU.setAttribute("datasources",window.top.bitsFavoriteFolder.xmlurl);
	},

	done : function(){},

	rebuild : function(){},

	onPopupShowing : function(aEvent, aPopupRoot){
		var res = mcTreeHandler.resource;
		try{
			if(!res){
				mcTreeFavoriteFolder.MENU_SELECT.setAttribute("disabled","true");
			}else{
				var editmode = this.DataSource.getProperty(res, "editmode");
				if((editmode & 0x1000)||(editmode == 4)){
					mcTreeFavoriteFolder.MENU_SELECT.setAttribute("disabled","true");
				}else{
					mcTreeFavoriteFolder.MENU_SELECT.removeAttribute("disabled");
				}
			}
		}catch(e){
			mcTreeFavoriteFolder.MENU_SELECT.setAttribute("disabled","true");
		}
		var r_fid = nsPreferences.copyUnicharPref("wiredmarker.rootfolder");
		var r_dbtype = nsPreferences.copyUnicharPref("wiredmarker.rootfolder_dbtype");
		if(!r_fid || !r_dbtype){
			this.MENU_ALL.setAttribute("disabled","true");
		}else{
			this.MENU_ALL.removeAttribute("disabled");
		}
		var results = this.XPath.evaluateArray('//folder[@fid and @dbtype]',window.top.bitsFavoriteFolder.xmldoc);
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
						elemMenuitem.setAttribute("contextmenu","mcPopupFavorite");
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
							mcTreeFavoriteFolder._explicitOriginalTarget = aEvent.target;
							mcTreeFavoriteFolder.removeFavoriteFolder(aEvent);
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
		var i;
		for(i=this.MENU_POPUP.childNodes.length-1;i>=0;i--){
			var elem = this.MENU_POPUP.childNodes[i];
			if(elem.id) continue;
			this.MENU_POPUP.removeChild(elem);
		}
	},

	onClick : function(aEvent){
		window.top.bitsFavoriteFolder.onClick(aEvent);
	},

	onPopupFShowing : function(aEvent){
		this._explicitOriginalTarget = aEvent.explicitOriginalTarget;
	},

	removeFavoriteFolder : function(aEvent){
		var xmldoc = window.top.bitsFavoriteFolder.xmldoc;
		if(!xmldoc || !this._explicitOriginalTarget) return;
		if(!window.top.bitsFavoriteFolder._confirmRemovingFor()) return;
		var fid = this._explicitOriginalTarget.getAttribute("fid");
		var dbtype = this._explicitOriginalTarget.getAttribute("dbtype");
		var results = this.XPath.evaluateArray('//folder[@fid="'+fid+'" and @dbtype="'+dbtype+'"]',xmldoc);
		if(results.length){
			var i;
			for(i=results.length-1;i>=0;i--){
				results[i].parentNode.removeChild(results[i]);
			}
			window.top.bitsFavoriteFolder.xmlflash();
		}
		this._explicitOriginalTarget = undefined;
	},
};

