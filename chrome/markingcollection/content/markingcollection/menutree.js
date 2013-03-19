// メニュー用階層表示
var bitsMenuTree = {

	_app_version : 0,

	get STRING()     { return window.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get mcTreeHandler() {try{return this.SIDEBAR_WIN.mcTreeHandler;}catch(e){return undefined;}},
	get mcMainService() {try{return this.SIDEBAR_WIN.mcMainService;}catch(e){return undefined;}},
	get mcController() {try{return this.SIDEBAR_WIN.mcController;}catch(e){return undefined;}},
	get mcPropertyView() {try{return this.SIDEBAR_WIN.mcPropertyView;}catch(e){return undefined;}},
	get mcTreeViewModeService() {try{return this.SIDEBAR_WIN.mcTreeViewModeService;}catch(e){return undefined;}},
	get bitsItemView() {try{return this.SIDEBAR_WIN.bitsItemView;}catch(e){return undefined;}},

	get _id_extensionsMenupopup() { return "bitsExtensionsMenuPopup"; },
	get _id_favoritefolderMenuseparator() { return "bitsFavoriteFolderMenuseparator"; },
	get _id_menutreeFolderContextmenu() { return "bitsMenuTreeFolderContextmenu"; },
	get _id_menutreeObjectContextmenu() { return "bitsMenuTreeObjectContextmenu"; },
	get _extensionsMenupopup()    { return window.top.document.getElementById(this._id_extensionsMenupopup); },

	get idMENU_FOLDER_ADD_FAVORITE(){ return "bitsFavoriteFolderAddMenuitem"; },
	get idMENU_FOLDER_REMOVE()      { return "bitsMenuTreeFolderRemoveMenuitem"; },
	get idMENU_FOLDER_PROPERTY()    { return "bitsMenuTreeFolderPropertyMenuitem"; },

	get MENU_FOLDER_ADD_FAVORITE(){ return document.getElementById(this.idMENU_FOLDER_ADD_FAVORITE); },
	get MENU_FOLDER_REMOVE()      { return document.getElementById(this.idMENU_FOLDER_REMOVE); },
	get MENU_FOLDER_PROPERTY()    { return document.getElementById(this.idMENU_FOLDER_PROPERTY); },

	get idMENU_OBJECT_OPEN()    { return "bitsMenuTreeObjectOpenMenuitem"; },
	get idMENU_OBJECT_OPENN()   { return "bitsMenuTreeObjectOpenNewTabMenuitem"; },
	get idMENU_OBJECT_REMOVE()  { return "bitsMenuTreeObjectRemoveMenuitem"; },
	get idMENU_OBJECT_PROPERTY(){ return "bitsMenuTreeObjectPropertyMenuitem"; },

	get MENU_OBJECT_OPEN()    { return document.getElementById(this.idMENU_OBJECT_OPEN); },
	get MENU_OBJECT_OPENN()   { return document.getElementById(this.idMENU_OBJECT_OPENN); },
	get MENU_OBJECT_REMOVE()  { return document.getElementById(this.idMENU_OBJECT_REMOVE); },
	get MENU_OBJECT_PROPERTY(){ return document.getElementById(this.idMENU_OBJECT_PROPERTY); },

	get POPUP(){ return document.getElementById(this._id_menutreeObjectContextmenu); },

	get confirmDelete() { return true; },

/////////////////////////////////////////////////////////////////////
	init : function(){
		var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		this._app_version = parseInt(info.version);
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	done : function(){
	},

/////////////////////////////////////////////////////////////////////
	popupshowing : function(event){
		try{
			if(!event.target.nodeName || event.target.nodeName != "menupopup") return;
			var elemMenupopup = event.target;
			var p_fid = elemMenupopup.getAttribute("fid");
			var p_dbtype = elemMenupopup.getAttribute("dbtype");
			if(!p_fid || !p_dbtype){
				p_fid = nsPreferences.copyUnicharPref("wiredmarker.rootfolder");
				p_dbtype = nsPreferences.copyUnicharPref("wiredmarker.rootfolder_dbtype");
			}
			if(elemMenupopup.id == bitsMenuTree._id_extensionsMenupopup && (!p_fid || !p_dbtype)){
				var dbinfo = window.top.bitsMarkingCollection.dbinfo.getAllDBInfo();
				if(dbinfo){
					if(dbinfo.length > 1){
						var i;
						for(i=0;i<dbinfo.length;i++){
							bitsMenuTree._popupshowingIndexContextMenu(
								elemMenupopup,
								[
									{
										fid       : "0",
										dbtype    : dbinfo[i].database_dbtype,
										fid_title : dbinfo[i].database_title,
										icon      : dbinfo[i].database_icon,
									}
								]);
						}
						return;
					}else{
						p_fid = "0";
						p_dbtype = dbinfo[0].database_dbtype;
					}
				}
			}
			if(!elemMenupopup.id || elemMenupopup.id == bitsMenuTree._id_extensionsMenupopup){
				var foldres = bitsMenuTree.Database.getFolderFormPID(p_fid,p_dbtype);
				if(foldres){
					foldres.sort(function(a,b){ return a.pfid_order - b.pfid_order; });
				}else{
					foldres = [];
				}
				var objects = bitsMenuTree.Database.getObjectFormPID(p_fid,p_dbtype);
				if(objects){
					objects.sort(function(a,b){ return a.pfid_order - b.pfid_order; });
				}else{
					objects = [];
				}
				bitsMenuTree._popupshowingIndexContextMenu(elemMenupopup,[].concat(foldres,objects));
			}
		}catch(e){
			bitsMenuTree._dump("bitsMenuTree.popupshowing():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_removeChild : function(aNode){
		var i;
		for(i=aNode.childNodes.length-1;i>=0;i--){
			this._removeChild(aNode.childNodes[i]);
			aNode.removeChild(aNode.childNodes[i]);
		}
	},

/////////////////////////////////////////////////////////////////////
	popuphiding : function(event){
		if(!event.target.nodeName || event.target.nodeName != "menupopup") return;
		var elemMenupopup = event.target;
		setTimeout(function(){
			var i;
			if(elemMenupopup.id == bitsMenuTree._id_extensionsMenupopup){
				for(i=elemMenupopup.childNodes.length-1;i>=0;i--){
					if(elemMenupopup.childNodes[i].id == bitsMenuTree._id_favoritefolderMenuseparator) break;
					bitsMenuTree._removeChild(elemMenupopup.childNodes[i]);
					elemMenupopup.removeChild(elemMenupopup.childNodes[i]);
				}
			}else if(!elemMenupopup.id){
				for(i=elemMenupopup.childNodes.length-1;i>=0;i--){
					bitsMenuTree._removeChild(elemMenupopup.childNodes[i]);
					elemMenupopup.removeChild(elemMenupopup.childNodes[i]);
				}
			}
		},0);
	},

/////////////////////////////////////////////////////////////////////
	onMousedown : function(aEvent){
		if(bitsMenuTree._app_version<=2) return;
		bitsImageTooltip.onMousedown(aEvent);
	},

/////////////////////////////////////////////////////////////////////
	onMousemove : function(aEvent){
		if(bitsMenuTree._app_version<=2) return;
		var param = {
			menuitem : aEvent.target
		};
		try {
			var oid = param.menuitem.getAttribute("oid");
			var dbtype = param.menuitem.getAttribute("dbtype");
			if(!oid || !dbtype) return;
			var objs = bitsMenuTree.Database.getObject({oid:oid},dbtype);
			if(objs && objs.length>0) param.obj = objs[0];
		}catch(e){}

		bitsImageTooltip.onMousemove(aEvent,param);
	},

/////////////////////////////////////////////////////////////////////
	onMouseout : function(aEvent){
		if(bitsMenuTree._app_version<=2) return;
		bitsImageTooltip.onMouseout(aEvent);
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	commandIndexContextMenu : function(event){},

/////////////////////////////////////////////////////////////////////
	_popupshowingIndexContextMenu : function(elemMenupopup,foldres){
		if(!foldres || foldres.length==0){
			if(elemMenupopup.id != this._id_extensionsMenupopup) elemMenupopup.parentNode.removeChild(elemMenupopup);
			return;
		}
		var parser = new DOMParser();
		if(foldres && foldres.length>0){
			var j;
			for(j=0;j<foldres.length;j++){
				if(!foldres[j]) continue;
				if(foldres[j].fid && foldres[j].dbtype){
					if(!foldres[j].fid_title) continue;
					var tmp_foldres = bitsMenuTree.Database.getFolderFormPID(foldres[j].fid,foldres[j].dbtype);
					if(!tmp_foldres) tmp_foldres = [];
					if(tmp_foldres.length == 0){
						var tmp_objects = bitsMenuTree.Database.getObjectFormPID(foldres[j].fid,foldres[j].dbtype);
						if(!tmp_objects) tmp_objects = [];
						tmp_foldres = tmp_foldres.concat(tmp_objects);
					}
					var elemMenuSub = top.document.createElement("menu");
					if(!elemMenuSub) continue;
					var key;
					for(key in foldres[j]){
						elemMenuSub.setAttribute(key,foldres[j][key]);
					}
					elemMenuSub.setAttribute("label",foldres[j].fid_title);
					elemMenuSub.setAttribute("class","menu-iconic");
					elemMenuSub.setAttribute("image","chrome://markingcollection/skin/folder.png");
					if(foldres[j].fid != "0") elemMenuSub.setAttribute("contextmenu",this._id_menutreeFolderContextmenu);
					if(foldres[j].icon){
						elemMenuSub.setAttribute("image",foldres[j].icon);
					}else if(foldres[j].fid_property){
						var xmldoc = parser.parseFromString(foldres[j].fid_property, "text/xml");
						if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
						if(xmldoc){
							var elems = xmldoc.getElementsByTagName("ICON");
							if(elems && elems.length>0) elemMenuSub.setAttribute("image",elems[0].textContent);
							elems = undefined;
							xmldoc = undefined;
						}
					}
					if(tmp_foldres.length==0) elemMenuSub.setAttribute("disabled","true");
					var elemMenuSubpopup = top.document.createElement("menupopup");
					if(elemMenuSubpopup){
						for(var key in foldres[j]){
							elemMenuSubpopup.setAttribute(key,foldres[j][key]);
						}
						elemMenuSub.appendChild(elemMenuSubpopup);
					}
					elemMenupopup.appendChild(elemMenuSub);
				}else{
					var elemMenuitem = top.document.createElement("menuitem");
					if(!elemMenuitem) continue;
					this._setMenuitemObjectAttribute(elemMenuitem,foldres[j]);
					elemMenuitem.setAttribute("contextmenu",this._id_menutreeObjectContextmenu);
					elemMenuitem.addEventListener("command",bitsMenuTree.onCommand,false);
					elemMenupopup.appendChild(elemMenuitem);
				}
			}
		}
		parser = undefined;
	},

/////////////////////////////////////////////////////////////////////
	_setMenuitemObjectAttribute : function(aMenuitem,aObject){
		for(var key in aObject){
			aMenuitem.setAttribute(key,aObject[key]);
		}
		aMenuitem.setAttribute("label",aObject.oid_title);
		aMenuitem.setAttribute("class","menuitem-iconic");
		aMenuitem.addEventListener("mousedown",bitsMenuTree.onMousedown,false);
		aMenuitem.addEventListener("mousemove",bitsMenuTree.onMousemove,false);
		aMenuitem.addEventListener("mouseout" ,bitsMenuTree.onMouseout,false);
		var icon = null;
		if(aObject.oid_type.match(/^image\/(.+)$/)){
			if(this._app_version>2){
				var blobFile = this.Database.getObjectBLOBFile(aObject.oid,aObject.dbtype);
				if(blobFile.exists()){
					if(blobFile.fileSize>0){
						var url = this.Common.convertFilePathToURL(blobFile.path);
						if(url) icon = url;
					}else if(aObject.oid_txt){
						if(this.Common.getImageFromURL(aObject.oid_txt, blobFile)){
							if(blobFile.exists() && blobFile.fileSize>0){
								var url = this.Common.convertFilePathToURL(blobFile.path);
								if(url) icon = url;
							}
						}
					}
				}
			}
		}else if(aObject.oid_type == "url"){
			icon = this.Database.getFavicon(aObject.oid_txt,aObject.dbtype);
			if(!icon) icon = this.Database.getFavicon(aObject.doc_url,aObject.dbtype);
		}else{
			var xmldoc;
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("ICON")[0];
				if(xmlnode) icon = xmlnode.textContent;
			}else if(aObject.oid_property.match(/^.*<ICON>(.+?)<\/ICON>.*$/m)){
				icon = RegExp.$1;
			}
			if(icon && icon != ""){
				var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
				url.spec = icon;
				if(url.scheme == "file"){
					var file = this.Common.convertURLToFile(icon)
					if(!file.exists()) icon = undefined;
				}else if(url.scheme == "chrome"){
					var val = this.existsIcon(url);
					if(!val) icon = undefined;
				}
			}
		}
		if(!icon) icon = this.Database.getFavicon(aObject.doc_url,aObject.dbtype);
		if(!icon){
			if(aObject.oid_type.match(/^image\//)){
				icon = "chrome://markingcollection/skin/image.png";
			}else{
				icon = "chrome://markingcollection/skin/defaultFavicon.png";
			}
		}
		aMenuitem.setAttribute("image",icon);
	},

/////////////////////////////////////////////////////////////////////
	onPopupFShowing : function(aEvent){
		if(aEvent.target.id != this._id_menutreeFolderContextmenu && aEvent.target.id != this._id_menutreeObjectContextmenu) return;
		this._explicitOriginalTarget = aEvent.explicitOriginalTarget;
	},

	onPopupCommand : function(aEvent){
		switch(aEvent.target.id){
			case this.idMENU_OBJECT_OPEN:
				this.open();
				break;
			case this.idMENU_OBJECT_OPENN:
				this.open(true);
				break;
			case this.idMENU_FOLDER_REMOVE:
			case this.idMENU_OBJECT_REMOVE:
				this.remove(aEvent);
				break;
			case this.idMENU_OBJECT_PROPERTY:
				this.property();
				break;
			case this.idMENU_FOLDER_ADD_FAVORITE:
				var target = this._explicitOriginalTarget;
				if(target){
					var fid = target.getAttribute("fid");
					var dbtype = target.getAttribute("dbtype");
					var title = target.getAttribute("fid_title");
					bitsFavoriteFolder.AddFavoriteFolder({fid:fid,dbtype:dbtype,title:title});
				}
				break;
			case this.idMENU_FOLDER_PROPERTY:
				break;
			default:
				this._explicitOriginalTarget = null;
				break;
		}
	},

	onCommand : function(aEvent){
		bitsMenuTree._explicitOriginalTarget = aEvent.target;
		bitsMenuTree.open();
	},

/////////////////////////////////////////////////////////////////////
// TREE 関連
/////////////////////////////////////////////////////////////////////
	open : function(tabbed){
		if(!this._explicitOriginalTarget) return;
		var target = this._explicitOriginalTarget;
		var aObject = {};
		aObject.oid = target.getAttribute("oid");
		aObject.dbtype = target.getAttribute("dbtype");
		aObject.fid_style = target.getAttribute("fid_style");
		aObject.doc_url = target.getAttribute("doc_url");
		aObject.oid_type = target.getAttribute("oid_type");

		aObject = this.Database.getObject({oid:aObject.oid}, aObject.dbtype);
		if(aObject && aObject.length){
			aObject = aObject[0];
			aObject.dbtype = target.getAttribute("dbtype");
		}else{
			return;
		}
		this.Common.loadFromObject(aObject,tabbed);
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

	getSelection : function(){
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

	validateMultipleSelection : function(aIdxList){
		if(aIdxList.length != this.TREE.view.selection.count){
			this.Common.alert(this.STRING.getString("ERROR_MULTIPLE_SELECTION"));
			return false;
		}
		return true;
	},

	remove : function(aEvent){
		if(!this._explicitOriginalTarget) return;
		if(!this._explicitOriginalTarget.hasAttribute("dbtype")) return;
		if(!this._confirmRemovingFor()) return;
		if(this._explicitOriginalTarget.hasAttribute("oid")){
			var aObject = {};
			var target = this._explicitOriginalTarget;
			aObject.oid = target.getAttribute("oid");
			aObject.dbtype = target.getAttribute("dbtype");
			aObject.pfid = target.getAttribute("pfid");
			aObject.oid_type = target.getAttribute("oid_type");
			this._removeObject(aObject);
		}else if(this._explicitOriginalTarget.hasAttribute("fid")){
			var aFolder = {};
			var target = this._explicitOriginalTarget;
			aFolder.fid = target.getAttribute("fid");
			aFolder.dbtype = target.getAttribute("dbtype");
			this._removeFolder(aFolder);
		}
		if(this.bitsItemView && this.bitsItemView.isChecked){
			if(this._explicitOriginalTarget.hasAttribute("fid")){
				if(this.mcTreeViewModeService) this.mcTreeViewModeService.rebuild();
				this.bitsItemView.rebuild();
			}else if(this._explicitOriginalTarget.hasAttribute("oid")){
				this.bitsItemView.refresh();
			}
		}else{
			if(this.mcTreeViewModeService) this.mcTreeViewModeService.rebuild();
		}
		return true;
	},

	_removeObject : function(aObject){
		var match_exp = new RegExp("^"+bitsMarker.id_key+".+$","m");
		var source;
		if(!aObject.oid_type.match(/^image\/(.+)$/)) source = bitsMarker.id_key+aObject.dbtype+aObject.oid;
		if(source) bitsMarker.unmarkerWindow(source);
		this.Database.removeObject({oid:aObject.oid,pfid:aObject.pfid},aObject.dbtype,false);
	},

	_removeFolder : function(aFolder){
		var i;
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			for(i=0;i<Foldres.length;i++){
				this._removeFolder(Foldres[i]);
			}
		}
		var Objects = this.Database.getObjectFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Objects){
			for(i=0;i<Objects.length;i++){
				this._removeObject(Objects[i]);
			}
		}
		this.Database.removeFolder(aFolder.fid,aFolder.dbtype,false);
	},

	property : function(){
		if(this.TREE.currentIndex<0) return;
		var row = this.TREE.currentIndex;
		if(!this.itemObjects[row]) return;
		var aObject = this.itemObjects[row];
		var id = aObject.oid;
		var style = aObject.fid_style;
		var dbtype = aObject.dbtype;
		var result = {
			id       : aObject.oid,
			title    : aObject.oid_title,
			property : aObject.oid_property,
			style    : aObject.fid_style,
			dbtype   : aObject.dbtype,
		};
		window.openDialog("chrome://markingcollection/content/property.xul", "", "chrome,centerscreen,modal", id, result);
		if(result.accept){
			this.refresh();
		}
		return result.accept;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
