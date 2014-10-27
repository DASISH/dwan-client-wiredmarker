var bitsItemView = {
	_init : false,
	_pref : {},
	_app_version : 2,
	_canDrop : false,
	_refreshFlag : true,
	_getImageFromURL : {},

	_refresh_timer : null,

	modAlt   : false,
	modShift : false,
	modCtrl  : false,
	modMeta  : false,

	get POS_DEFAULT()     { return this.POS_TREE_BOTTOM; },
	get POS_TREE_BOTTOM() { return "tree_bottom"; },
	get POS_TREE_RIGHT()  { return "tree_right"; },

	get BUTTON() {
		try{
			return window.top.bitsMarkingCollection._contentWindow.document.getElementById("mcToolbarItemTreeButton");
		}catch(e){ return undefined; }
	},
	get APPCONT()  { return document.getElementById("appcontent"); },
	get idTREE()   { return "bitsItemTree"; },
	get TREE()     { return document.getElementById(this.idTREE); },
	get SPLITTER() { return document.getElementById("bitsBrowserLeftSplitter"); },
	get TNBOX()    { return document.getElementById("bitsItemTNBox"); },
	get VBOX()     { return document.getElementById("bitsBrowserLeftVBox"); },

	get VTTB()     { return document.getElementById("bitsItemViewTypeToolbarbutton"); },
	get VTLM()     { return document.getElementById("bitsItemViewTypeLargeMenuitem"); },
	get VTMM()     { return document.getElementById("bitsItemViewTypeMiddleMenuitem"); },
	get VTSM()     { return document.getElementById("bitsItemViewTypeSmallMenuitem"); },
	get VSB()      { return document.getElementById("bitsItemViewSearchButton"); },
	get VSM()      { return document.getElementById("bitsItemViewSearchMenu"); },

	get idTREE_IFAVICON()  { return "bitsItemTreeIFavicon"; },
	get idTREE_IURL()      { return "bitsItemTreeIUrl"; },
	get idTREE_IDOCTITLE() { return "bitsItemTreeIDocTitle"; },
	get idTREE_ITITLE()    { return "bitsItemTreeITitle"; },
	get idTREE_IDATE()     { return "bitsItemTreeIDate"; },
	get idTREE_INOTE()     { return "bitsItemTreeINote"; },
	get idTREE_IFOLDER()   { return "bitsItemTreeIFolder"; },
	get idTREE_IFOLDERSTYLE(){ return "bitsItemTreeIFolderStyle"; },
	get TREE_IFAVICON()    { return document.getElementById(this.idTREE_IFAVICON); },
	get TREE_IURL()        { return document.getElementById(this.idTREE_IURL); },
	get TREE_IDOCTITLE()   { return document.getElementById(this.idTREE_IDOCTITLE); },
	get TREE_ITITLE()      { return document.getElementById(this.idTREE_ITITLE); },
	get TREE_IDATE()       { return document.getElementById(this.idTREE_IDATE); },
	get TREE_INOTE()       { return document.getElementById(this.idTREE_INOTE); },
	get TREE_IFOLDER()     { return document.getElementById(this.idTREE_IFOLDER); },
	get TREE_IFOLDERSTYLE(){ return document.getElementById(this.idTREE_IFOLDERSTYLE); },

	get idPOPUP_OPEN()    { return "bitsItemTreePopupOpen"; },
	get idPOPUP_OPENN()   { return "bitsItemTreePopupOpenNewTab"; },
	get idPOPUP_REMOVE()  { return "bitsItemTreePopupRemove"; },
	get idPOPUP_PROPERTY(){ return "bitsItemTreePopupProperty"; },

	get idPOPUP_COPY()        { return "bitsItemTreePopupHyperAnchorCopyToClipboard"; },
	get idPOPUP_COPYTITLE()   { return "bitsItemTreePopupHyperAnchorCopyTitleToClipboard"; },
	get idPOPUP_COPYNOTE()    { return "bitsItemTreePopupHyperAnchorCopyNoteToClipboard"; },
	get idPOPUP_COPYMETA()    { return "bitsItemTreePopupHyperAnchorCopyMetaToClipboard"; },
	get idPOPUP_COPYFORMAT()  { return "bitsItemTreePopupHyperAnchorCopyFormatToClipboard"; },
	get idPOPUP_COPYSETTING() { return "bitsItemTreePopupHyperAnchorCopyFormatSetting"; },

	get POPUP()         { return document.getElementById("bitsItemTreePopup"); },
	get POPUP_OPEN()    { return document.getElementById(this.idPOPUP_OPEN); },
	get POPUP_OPENN()   { return document.getElementById(this.idPOPUP_OPENN); },
	get POPUP_REMOVE()  { return document.getElementById(this.idPOPUP_REMOVE); },
	get POPUP_PROPERTY(){ return document.getElementById(this.idPOPUP_PROPERTY); },

	get SIDEBAR_BOX()   { return document.getElementById("bitsSidebarBox"); },

	get SIDEBAR()     { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},

	get idBUTTON_LISTSTYLE()    { return "mcToolbarListStyleButton"; },
	get idITEM_LISTSTYLE_RL()   { return "mcToolbarListStyleRLItem"; },
	get idITEM_LISTSTYLE_TB()   { return "mcToolbarListStyleTBItem"; },
	get idITEM_LISTSTYLE_NONE() { return "mcToolbarListStyleNoneItem"; },
	get BUTTON_LISTSTYLE()    {try{return this.SIDEBAR_DOC.getElementById(this.idBUTTON_LISTSTYLE);}catch(e){return undefined;}},
	get ITEM_LISTSTYLE_RL()   {try{return this.SIDEBAR_DOC.getElementById(this.idITEM_LISTSTYLE_RL);}catch(e){return undefined;}},
	get ITEM_LISTSTYLE_TB()   {try{return this.SIDEBAR_DOC.getElementById(this.idITEM_LISTSTYLE_TB);}catch(e){return undefined;}},
	get ITEM_LISTSTYLE_NONE() {try{return this.SIDEBAR_DOC.getElementById(this.idITEM_LISTSTYLE_NONE);}catch(e){return undefined;}},


	get BROADCASTER() { return window.top.document.getElementById("viewMarkingCollection"); },

	get STRING()     { return window.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get isChecked() {
		return this._pref.disp;
	},

	get position() {
		return this._pref.position;
	},

	set position(aPos) {
		this._pref.position = aPos;
		if(this._pref.position == this.POS_TREE_RIGHT){
			this.SIDEBAR_BOX.setAttribute("orient","horizontal");
			this.SPLITTER.setAttribute("orient","horizontal");
			this.VBOX.setAttribute("persist","width");
			try{this.BUTTON_LISTSTYLE.setAttribute("image",this.ITEM_LISTSTYLE_RL.getAttribute("image"));}catch(e){}
		}else if(this._pref.position == this.POS_TREE_BOTTOM){
			this.SIDEBAR_BOX.setAttribute("orient","vertical");
			this.SPLITTER.setAttribute("orient","vertical");
			this.VBOX.setAttribute("persist","height");
			try{this.BUTTON_LISTSTYLE.setAttribute("image",this.ITEM_LISTSTYLE_TB.getAttribute("image"));}catch(e){}
		}else{
			try{this.BUTTON_LISTSTYLE.setAttribute("image",this.ITEM_LISTSTYLE_NONE.getAttribute("image"));}catch(e){}
		}
	},

	get confirmDelete() {
		return this._pref.confirmDelete;
	},

	get object() {
		return (this.TREE.currentIndex>=0 ? this.getRowObject(this.TREE.currentIndex) : undefined);
	},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(!this._init){
			var disp = nsPreferences.getBoolPref("wiredmarker.itemview.disp");
			if(disp == undefined) nsPreferences.setBoolPref("wiredmarker.itemview.disp",true);
			if(this.APPCONT){
				this.APPCONT.parentNode.insertBefore(this.VBOX,this.APPCONT)
				this.APPCONT.parentNode.insertBefore(this.SPLITTER,this.APPCONT)
			}
			this._pref = {
				disp          : nsPreferences.getBoolPref("wiredmarker.itemview.disp", false),
				position      : nsPreferences.copyUnicharPref("wiredmarker.itemview.position", this.POS_DEFAULT),
				confirmDelete : nsPreferences.getBoolPref("wiredmarker.confirmDelete", true),
			};
			this.position = this._pref.position;
			if(!this._pref.disp) try{this.BUTTON_LISTSTYLE.setAttribute("image",this.ITEM_LISTSTYLE_NONE.getAttribute("image"));}catch(e){}
			this.gBrowser.addEventListener("mousedown", this.onBrowserMousedown, false);
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			this._app_version = parseFloat(info.version);
			this.VTTB.setAttribute("disabled","true");
			if(this._app_version<3.1){
				this.TREE.addEventListener("draggesture", bitsItemView.onOldDraggesture, false);
				this.TREE.addEventListener("dragover", bitsItemView.onOldDragover, false);
				this.TREE.addEventListener("dragdrop", bitsItemView.onOldDragdrop, false);
				this.TREE.addEventListener("dragexit", bitsItemView.onOldDragexit, false);
			}else{
				this.TREE.addEventListener("dragstart", bitsItemView.onDragEvents, false);
				this.TREE.addEventListener("drag", bitsItemView.onDragEvents, false);
				this.TREE.addEventListener("dragend", bitsItemView.onDragEvents, false);

				this.TREE.addEventListener("dragenter", bitsItemView.onDropEvents, false);
				this.TREE.addEventListener("dragover", bitsItemView.onDropEvents, false);
				this.TREE.addEventListener("dragleave", bitsItemView.onDropEvents, false);
				this.TREE.addEventListener("drop", bitsItemView.onDropEvents, false);
			}
			this._init = true;
		}
		if(this.BUTTON) this.BUTTON.setAttribute("checked",this._pref.disp);
		var sidebar = window.top.document.getElementById("sidebar");
		if(sidebar && this.position == this.POS_TREE_RIGHT) sidebar.setAttribute("style","min-width:14em; width:18em;");
	},

/////////////////////////////////////////////////////////////////////
	disp : function(aEvent){
		this.treeDispChange();
		this.rebuild();
		this.SPLITTER.setAttribute("hidden",!this._pref.disp);
		this.VBOX.setAttribute("hidden",!this._pref.disp);
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		this.SPLITTER.setAttribute("hidden",true);
		this.VBOX.setAttribute("hidden",true);
		try{this.TREE.treeBoxObject.clearStyleAndImageCaches();}catch(e){};
		this.gBrowser.removeEventListener("mousedown", this.onBrowserMousedown, false);
		if(this._app_version<3.1){
			this.TREE.removeEventListener("draggesture", bitsItemView.onOldDraggesture, false);
			this.TREE.removeEventListener("dragover", bitsItemView.onOldDragover, false);
			this.TREE.removeEventListener("dragdrop", bitsItemView.onOldDragdrop, false);
			this.TREE.removeEventListener("dragexit", bitsItemView.onOldDragexit, false);
		}else{
			this.TREE.removeEventListener("dragstart", bitsItemView.onDragEvents, false);
			this.TREE.removeEventListener("drag", bitsItemView.onDragEvents, false);
			this.TREE.removeEventListener("dragend", bitsItemView.onDragEvents, false);
			this.TREE.removeEventListener("dragenter", bitsItemView.onDropEvents, false);
			this.TREE.removeEventListener("dragover", bitsItemView.onDropEvents, false);
			this.TREE.removeEventListener("dragleave", bitsItemView.onDropEvents, false);
			this.TREE.removeEventListener("drop", bitsItemView.onDropEvents, false);
		}
		var sidebar = window.top.document.getElementById("sidebar");
		if(sidebar && this.position == this.POS_TREE_RIGHT) sidebar.setAttribute("style","min-width:14em; width:18em; max-width:36em;");
	},

/////////////////////////////////////////////////////////////////////
	treeDispChange : function(){
		try{var mcTreeRule = window.top.bitsMarkingCollection._contentWindow.document.getElementById("mcTreeRule");}catch(e){}
		if(!mcTreeRule) return;
		if(this._pref.disp){
			mcTreeRule.setAttribute("iscontainer", true);
		}else{
			mcTreeRule.removeAttribute("iscontainer");
		}
	},

/////////////////////////////////////////////////////////////////////
	onChangeListStyle : function(aEvent){
		var reboot = false;
		if(aEvent.target.id == this.idITEM_LISTSTYLE_RL){
			if(!this._pref.disp || this.position != this.POS_TREE_RIGHT){
				nsPreferences.setBoolPref("wiredmarker.itemview.disp", true);
				nsPreferences.setUnicharPref("wiredmarker.itemview.position", this.POS_TREE_RIGHT);
				reboot = true;
			}
		}else if(aEvent.target.id == this.idITEM_LISTSTYLE_TB){
			if(!this._pref.disp || this.position != this.POS_TREE_BOTTOM){
				nsPreferences.setBoolPref("wiredmarker.itemview.disp", true);
				nsPreferences.setUnicharPref("wiredmarker.itemview.position", this.POS_TREE_BOTTOM);
				reboot = true;
			}
		}else if(aEvent.target.id == this.idITEM_LISTSTYLE_NONE){
			if(this._pref.disp){
				nsPreferences.setBoolPref("wiredmarker.itemview.disp", false);
				nsPreferences.setUnicharPref("wiredmarker.itemview.position", this.POS_TREE_BOTTOM);
				reboot = true;
			}
		}
		if(reboot){
			if(this.Common.confirm(this.STRING.getString("CONFIRM_SETTING_CHANGE_RESTART_APP"))){
				window.top.bitsMarkingCollection.reboot();
				return;
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	onViewTypePopupCommand : function(aEvent){
		var xmldoc = null;
		var iconsize = null;
		var viewtype = "small";
		var viewtype_C = "small";
		if(this._info){
			var viewmode = this._info.viewmode;
			var fid = this._info.fid;
			var dbtype = this._info.dbtype;
			if(fid && this.dbtype){
				var folders = this.Database.getFolderFormID(fid, dbtype);
				if(folders && folders.length>0 && folders[0].fid_property){
					var parser = new DOMParser();
					xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
					parser = undefined;
					iconsize = xmldoc.getElementsByTagName("ICON_SIZE")[0];
					if(iconsize) viewtype = iconsize.textContent
				}
			}
		}
		switch(aEvent.target.id){
			case "bitsItemViewTypeLargeMenuitem":
				viewtype_C = "large";
				break;
			case "bitsItemViewTypeMiddleMenuitem":
				viewtype_C = "middle";
				break;
			case "bitsItemViewTypeSmallMenuitem":
				viewtype_C = "small";
				break;
		}
		if(viewtype != viewtype_C){
			if(!xmldoc){
				var parser = new DOMParser();
				xmldoc = parser.parseFromString("<PROPERTY/>", "text/xml");
				parser = undefined;
			}
			if(iconsize){
				while(iconsize.hasChildNodes()){ iconsize.removeChild(iconsize.lastChild); }
			}else{
				iconsize = xmldoc.createElement("ICON_SIZE");
				xmldoc.documentElement.appendChild(iconsize);
			}
			iconsize.appendChild(xmldoc.createTextNode(viewtype_C));
			var s = new XMLSerializer();
			folders[0].fid_property = s.serializeToString(xmldoc);
			s = undefined;
			var dbtype = folders[0].dbtype;
			delete folders[0].dbtype;
			var changed = this.Database.updateFolder(folders[0],dbtype);
			this.refresh();
		}
	},

/////////////////////////////////////////////////////////////////////
	onSearchButtonCommand : function(aEvent){
		var checked = this.VSB.getAttribute("checked");
		if(!checked || checked == "false"){
			this.VSB.setAttribute("checked","true");
			this.VSM.removeAttribute("disabled");
			setTimeout(function(){
				bitsItemView.VSM.focus();
				bitsItemView.refresh();
			},0);
		}else{
			this.VSB.removeAttribute("checked");
			this.VSM.blur();
			this.VSM.setAttribute("disabled","true");
			setTimeout(function(){
					bitsItemView.refresh();
				},0);
		}
	},

/////////////////////////////////////////////////////////////////////
	onButtonClick : function(aEvent){
		this._pref.disp = this.isChecked;
		if(!this._pref.disp){
			this._pref.disp = true;
		}else{
			this._pref.disp = false;
		}
		if(this.BUTTON) this.BUTTON.setAttribute("checked",this._pref.disp);
		this.SPLITTER.setAttribute("hidden",!this._pref.disp);
		this.VBOX.setAttribute("hidden",!this._pref.disp);
		this.treeDispChange();
		window.top.bitsMarkingCollection._contentWindow.mcTreeRdfRebuildItem.init();
		window.top.bitsMarkingCollection._contentWindow.mcTreeHandler.TREE.builder.rebuild();
		this.onTreeClick();
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	onTreeClick : function(aInfo){
		if(!this._pref.disp) return;
		if(this._app_version<=2){
			this.VTTB.setAttribute("disabled","true");
		}else if(aInfo){
			this.VTTB.removeAttribute("disabled");
		}
		if(bitsSearchAcross.getIndex() == mcTreeHandler.TREE.currentIndex){
			this.TREE_IFOLDER.hidden = false;
			this.TREE_IFOLDERSTYLE.hidden = false;
		}else{
			this.TREE_IFOLDER.hidden = true;
			this.TREE_IFOLDERSTYLE.hidden = true;
		}
		this._info = aInfo;
		this.rebuild(aInfo);
	},

/////////////////////////////////////////////////////////////////////
	onTreeDateClick : function(aInfo){
		if(!this._pref.disp) return;
		if(this._app_version<=2){
			this.VTTB.setAttribute("disabled","true");
		}else if(aInfo){
			this.VTTB.removeAttribute("disabled");
		}
		this._info = aInfo;
		this.rebuild(aInfo);
	},


/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowCount(){
		return (this.itemObjects?this.itemObjects.length:0);
	},
	getRowObject : function(row){
		return (row>=0 && this.itemObjects && this.itemObjects.length>row ? this.itemObjects[row] : undefined);
	},
	getCellText : function(row,column){
		if(!this.itemObjects || !this.itemObjects[row]) return null;
		if(column.id == this.idTREE_ITITLE){
			return this.itemObjects[row].oid_title;
		}else if(column.id == this.idTREE_IURL){
			return this.itemObjects[row].doc_url;
		}else if(column.id == this.idTREE_IDOCTITLE){
			return this.itemObjects[row].doc_title;
		}else if(column.id == this.idTREE_IDATE){
			if(!this.itemObjects) return null;
			if(this.itemObjects[row].oid_date.match(/^(\d{2}\/\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})$/)){
				return RegExp.$2 + "/" + RegExp.$1 + " "  + RegExp.$3;
			}else{
				return this.itemObjects[row].oid_date;
			}
		}else if(column.id == this.idTREE_INOTE){
			if(this.itemObjects[row].oid_note == undefined && this.itemObjects[row].oid_property && this.itemObjects[row].oid_property != ""){
				var domParser = new DOMParser();
				var xmldoc = domParser.parseFromString(this.itemObjects[row].oid_property, "text/xml");
				if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
				if(xmldoc){
					var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
					if(xmlnode) this.itemObjects[row].oid_note = xmlnode.textContent;
				}
				if(this.itemObjects[row].oid_note == undefined) this.itemObjects[row].oid_note = "";
				if(this.itemObjects[row].oid_note != ""){
					var oid_note = this.itemObjects[row].oid_note;
					oid_note = oid_note.replace(/[\r\n]+/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
					this.itemObjects[row].oid_note = oid_note;
				}
			}
			return this.itemObjects[row].oid_note;
		}else if(column.id == this.idTREE_IFOLDER){
			if(this.itemObjects[row].pfid == "0" && this.itemObjects[row].dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype){
				return window.top.bitsMarkingCollection._uncategorized.title;
			}else{
				return this.itemObjects[row].fid_title;
			}
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
		if(!this.itemObjects) return icon;
		if(!this.itemObjects[row]) return icon;
		if(column.id != this.idTREE_IFAVICON) return icon;
		var aObject = this.itemObjects[row];
		if(aObject.oid_type.match(/^image\/(.+)$/)){
			if(this._app_version>2){
				var blobFile = this.Database.getObjectBLOBFile(aObject.oid,(aObject.dbtype?aObject.dbtype:this.dbtype));
				if(blobFile.exists()){
					if(blobFile.fileSize>0){
						var url = this.Common.convertFilePathToURL(blobFile.path);
						if(url) icon = url;
					}else if(aObject.oid_txt && this._getImageFromURL[aObject.oid_txt] == undefined){
						var self = this;
						this._getImageFromURL[aObject.oid_txt] = setTimeout(function(){
							if(self.Common.getImageFromURL(aObject.oid_txt, blobFile)){
								var box = self.TREE.boxObject;
								box.invalidateCell(row,column);
							}
						},100);
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
			}else{
				if(aObject.oid_property.match(/^.*<ICON>(.+?)<\/ICON>.*$/m)){
					icon = RegExp.$1;
				}
			}
			if(icon && icon != ""){
				var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
				url.spec = icon;
				if(url.scheme == "file"){
					var file = bitsObjectMng.Common.convertURLToFile(icon)
					if(!file.exists()) icon = undefined;
				}else if(url.scheme == "chrome"){
					var val = this.Database.existsIcon(url);
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
		return icon;
	},
	getRowProperties: function(row,prop){},
	getCellProperties: function(row, column, prop) {                     
            
		if(column.id == this.idTREE_IFAVICON){
                    if(prop) {
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			prop.AppendElement(aserv.getAtom("ItemView"));
                    } else {
                        return "ItemView";
                    }
			if(this.itemObjects && this.itemObjects[row]){
				var aObject = this.itemObjects[row];
				prop.AppendElement(aserv.getAtom("ItemViewImage"));
			}
		}else if(column.id == this.idTREE_IFOLDER){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			prop.AppendElement(aserv.getAtom("ItemView"));
			prop.AppendElement(aserv.getAtom("ItemViewImage"));
			prop.AppendElement(aserv.getAtom("folder"));
		}else if(column.id == this.idTREE_IFOLDERSTYLE){
			if(this.itemObjects && this.itemObjects[row]){
				var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
				prop.AppendElement(aserv.getAtom('css_'+this.itemObjects[row].dbtype+'_'+this.itemObjects[row].pfid));
			}
		}
	},
	getColumnProperties: function(column, element, prop) {},
	cycleHeader : function(col){},
	isEditable : function(row,column){
		return column.editable;
	},
	setCellText : function(row,column,text){
		if(column.id == this.idTREE_INOTE){
			text = text.replace(/\t/g,"        ");
			text = this.Common.exceptCode(text);
			text = text.replace(/[\r\n]+/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
			if(this.itemObjects[row].oid_note == text) return;
			if(this.itemObjects[row].oid_property == undefined || this.itemObjects[row].oid_property == "") this.itemObjects[row].oid_property == "<PROPERTY/>";
			var domParser = new DOMParser();
			var xmldoc = domParser.parseFromString(this.itemObjects[row].oid_property, "text/xml");
			if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
				if(!xmlnode){
					xmlnode = xmldoc.createElement("NOTE");
					xmldoc.documentElement.appendChild(xmlnode);
				}
				while(xmlnode.hasChildNodes()){ xmlnode.removeChild(xmlnode.lastChild); }
				if(text != ""){
					xmlnode.appendChild(xmldoc.createTextNode(text));
				}else{
					xmlnode.parentNode.removeChild(xmlnode);
				}
				var s = new XMLSerializer();
				this.itemObjects[row].oid_property = s.serializeToString(xmldoc);
				s = undefined;
				var itemObject = {};
				for(var key in this.itemObjects[row]){
					itemObject[key] = this.itemObjects[row][key];
				}
				delete itemObject.oid_note;
				delete itemObject.fid_style;
				delete itemObject.fid_title;
				delete itemObject.folder_order;
				delete itemObject.dbtype;
				if(this.Database.updateObject(itemObject,this.dbtype)) this.itemObjects[row].oid_note = text;
				xmldoc = undefined;
			}
			domParser = undefined;
		}
	},
	setCellValue : function(row,column,text){},
  getParentIndex: function(idx) { return -1; },
	canDrop : function(index, orient){
		return this._canDrop;
	},
	onDrop : function(row, orient){},
	drop : function(row, orient){
		if(!this._info) return;
		if(!this._canDrop) return;
		try{
			var XferDataSet  = nsTransferable.get(mcTreeDNDHandler.dragDropObserver.getSupportedFlavours(),nsDragAndDrop.getDragData,true);
			var XferData     = XferDataSet.first.first;
			var doraggedData = XferData.data;
			var XferDataType = XferData.flavour.contentType;
		}catch(ex){}
		if(XferDataType == "application/x-moz-file" && XferData){
			if(XferData.data instanceof Components.interfaces.nsIFile){
				var urlString = this.Common.convertFilePathToURL(XferData.data.path);
				this.capture(urlString, row, orient);
			}
		}else if(XferDataType == "wired-marker/object" && XferData){
		}else if(XferData && XferData.data){
			if(
				bitsItemView.originalTarget &&
				bitsItemView.originalTarget.nodeName == "IMG" &&
				bitsItemView.originalTarget.hasAttribute('oid') &&
				bitsItemView.originalTarget.hasAttribute('dbtype') &&
				bitsItemView.originalTarget.hasAttribute('pfid')){
				var oid = bitsItemView.originalTarget.getAttribute('oid');
				var dbtype = bitsItemView.originalTarget.getAttribute('dbtype');
				var pfid = bitsItemView.originalTarget.getAttribute('pfid');
				var dstRes = mcTreeHandler.resource;
				if(dstRes){
					var dst_fid = mcTreeDNDHandler.DataSource.getProperty(dstRes,"id");
					var dst_dbtype = mcTreeDNDHandler.DataSource.getProperty(dstRes,"dbtype");
					if(dst_fid == pfid && dst_dbtype == dbtype) return;
					var srcObjects = bitsItemView.Database.getObject({oid:oid}, dbtype);
					var mergeRtn = window.top.bitsTreeListService.mergeObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0]);
					if(mergeRtn) return;
					var rtnObj = null;
					if(dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || mcTreeDNDHandler.modShift){
						rtnObj = window.top.bitsTreeListService.moveObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0],true);
					}else{
						rtnObj = window.top.bitsTreeListService.copyObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0]);
					}
					setTimeout(function(){
						var viewmode = mcTreeViewModeService.viewmode;
						mcItemView._bitsItemView.onTreeClick({viewmode:viewmode,fid:dst_fid,dbtype:dst_dbtype,res:dstRes});
						window.top.bitsTreeListService.reload(bitsItemView.originalTarget.ownerDocument);
						bitsItemView.originalTarget = null;
					},0);
				}
			}else{
				this.capture(XferData.data, row, orient);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop Old Callback functions
/////////////////////////////////////////////////////////////////////
	onOldDraggesture: function(aEvent){
		bitsItemView.getModifiers(aEvent);
		nsDragAndDrop.startDrag(aEvent,bitsItemView.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragover: function(aEvent){
		nsDragAndDrop.dragOver(aEvent,bitsItemView.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragdrop: function(aEvent){
		nsDragAndDrop.drop(aEvent,bitsItemView.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragexit: function(aEvent){
		nsDragAndDrop.dragExit(aEvent,bitsItemView.dragDropObserver);
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop New Callback functions
/////////////////////////////////////////////////////////////////////
	onDragEvents: function(aEvent){
		switch(aEvent.type){
			case "dragstart":
				bitsItemView.onDragStart(aEvent);
				break;
			case "drag":
			break;
			case "dragend":
			break;
		}
	},

	onDragStart : function(aEvent){
		try{
			if(aEvent.originalTarget.localName != "treechildren") return;
			bitsItemView.getModifiers(aEvent);
			var idxList = bitsItemView.getSelection();
			if(idxList.length>0){
				var transferData = aEvent.dataTransfer;
				var rc = [];
				var i;
				for(i=0;i<idxList.length;i++){
					var oid = bitsItemView.itemObjects[idxList[i]].oid;
					var dbtype = bitsItemView.itemObjects[idxList[i]].dbtype;
					rc.push(oid+"\t"+dbtype);
				}
				if(rc.length>0){
					var data = rc.join("\n");
					transferData.setData("wired-marker/object", data);
				}
			}
		}catch(ex){
			bitsItemView._dump("bitsItemView.onDragStart():"+ex);
		}
	},

	onDropEvents: function(aEvent){
		switch(aEvent.type){
			case "dragenter":
			case "dragover":
				aEvent.preventDefault();
				break;
			case "drop":
				aEvent.preventDefault();
				var data = null;
				var supportedTypes = ["text/x-moz-url", "text/url-list", "text/plain", "application/x-moz-file"];
				var types = aEvent.dataTransfer.types;
				types = supportedTypes.filter(function(value){ return types.contains(value);});
				if(types.length){
					data = aEvent.dataTransfer.getData(types[0]);
					if(!data) data = aEvent.dataTransfer.mozGetDataAt(types[0],0);
				}
				if(data){
					if(types[0] == "application/x-moz-file" && data instanceof Components.interfaces.nsIFile){
						var urlString = bitsItemView.Common.convertFilePathToURL(data.path);
						bitsItemView.capture(urlString);
					}else{
						if(
							bitsItemView.originalTarget &&
							bitsItemView.originalTarget.nodeName == "IMG" &&
							bitsItemView.originalTarget.hasAttribute('oid') &&
							bitsItemView.originalTarget.hasAttribute('dbtype') &&
							bitsItemView.originalTarget.hasAttribute('pfid')){
							var oid = bitsItemView.originalTarget.getAttribute('oid');
							var dbtype = bitsItemView.originalTarget.getAttribute('dbtype');
							var pfid = bitsItemView.originalTarget.getAttribute('pfid');
							var dstRes = mcTreeHandler.resource;
							if(dstRes){
								var dst_fid = mcTreeDNDHandler.DataSource.getProperty(dstRes,"id");
								var dst_dbtype = mcTreeDNDHandler.DataSource.getProperty(dstRes,"dbtype");
								if(dst_fid == pfid && dst_dbtype == dbtype) return;
								var srcObjects = bitsItemView.Database.getObject({oid:oid}, dbtype);
								var mergeRtn = window.top.bitsTreeListService.mergeObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0]);
								if(mergeRtn) return;
								var rtnObj = null;
								if(dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || mcTreeDNDHandler.modShift){
									rtnObj = window.top.bitsTreeListService.moveObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0],true);
								}else{
									rtnObj = window.top.bitsTreeListService.copyObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0]);
								}
								setTimeout(function(){
									var viewmode = mcTreeViewModeService.viewmode;
									mcItemView._bitsItemView.onTreeClick({viewmode:viewmode,fid:dst_fid,dbtype:dst_dbtype,res:dstRes});
									window.top.bitsTreeListService.reload(bitsItemView.originalTarget.ownerDocument);
									bitsItemView.originalTarget = null;
								},0);
							}
						}else{
							bitsItemView.capture(data);
						}
					}
				}
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	onBrowserMousedown : function(aEvent){
		try{ bitsItemView.rangeParent = aEvent.rangeParent; }catch(ex){}
		try{ bitsItemView.originalTarget = aEvent.originalTarget; }catch(ex){}
	},

/////////////////////////////////////////////////////////////////////
	capture : function(aXferString, aRow, aOrient){
		var aXferStringArr = aXferString.split("\n");
		var url = aXferStringArr[0];
		var url_title = aXferStringArr[1];
		if(!url_title || url == url_title) url_title = "";
		if(!this._info) return;
		var fid;
		var dbtype;
		var fid_style;
		if(!this._info.res){
			return;
		}else{
			fid = this.DataSource.getProperty(this._info.res, "id");
			dbtype = this.DataSource.getProperty(this._info.res, "dbtype");
			fid_style = this.DataSource.getProperty(this._info.res, "style");
		}
		var win = this.Common.getFocusedWindow();
		var sel = win.getSelection();
		var isSelected = false;
		try{
			isSelected = ( sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset ) ? false : true;
			if(isSelected && aXferStringArr.length != 1) isSelected = false;
			if(isSelected && win.document.contentType == "application/pdf") isSelected = false;
		}catch(e){}
		var newResArr;
		if(isSelected){
			newResArr =  window.top.bitsMarkingCollection.addSelectedText({fid:fid,fid_style:fid_style,dbtype:dbtype},aOrient,aRow);
		}else{
			if(url.indexOf("http://")  == 0 ||
				 url.indexOf("https://") == 0 ||
				 url.indexOf("ftp://")   == 0 ||
				 url.indexOf("file://")  == 0){
				if(this.originalTarget){
					//既にTargetが設定されている場合、カレントのドキュメントのものかをチェック
					if(this.originalTarget.ownerDocument != this.gBrowser.contentDocument){
						var win = this.gBrowser.contentWindow;
						if(win.frames != null){
							var i;
							for(i=0;i<win.frames.length;i++){
								if(this.originalTarget.ownerDocument == win.frames[i].document) break;
							}
							if(i>=win.frames.length) this.originalTarget=null;
						}else{
							this.originalTarget=null;
						}
					}
				}
				var tmpOriginalTarget = this.originalTarget;
				while(tmpOriginalTarget && (tmpOriginalTarget.nodeName != "A" && tmpOriginalTarget.nodeName != "IMG")){
					tmpOriginalTarget = tmpOriginalTarget.parentNode;
				}
				if(tmpOriginalTarget) this.originalTarget = tmpOriginalTarget;
				newResArr = window.top.bitsMarkingCollection.addURLText({fid:fid,fid_style:fid_style,dbtype:dbtype},aOrient, aRow, aXferString, this.originalTarget);
			}else{
				isSelected = false;
				try{
					isSelected = ( sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset ) ? false : true;
					if(isSelected && win.document.contentType == "application/pdf") isSelected = false;
				}catch(ex){}
				if(isSelected){
					newResArr =  window.top.bitsMarkingCollection.addSelectedText({fid:fid,fid_style:fid_style,dbtype:dbtype},aOrient,aRow);
				}else{
					setTimeout(function(){
						var rtn = window.top.bitsMarkingCollection.addPDFText({fid:fid,fid_style:fid_style,dbtype:dbtype},aOrient, aRow, aXferString);
						if(!rtn) window.top.bitsMarkingCollection.Common.alert(mcMainService.STRING.getString("ERROR_INVALID_URL") + "\n" + aXferStringArr);
					},0);
				}
			}
		}
		return {isSelected : isSelected, resArr : newResArr};
	},

/////////////////////////////////////////////////////////////////////
	refresh : function(){
		if(this._refresh_timer) clearTimeout(this._refresh_timer);
		this._refresh_timer = setTimeout(function(){ bitsItemView._refresh(); },100);
	},
	_refresh : function(){
		if(!this._refreshFlag) return;
		var idx = this.TREE.currentIndex;
		var rows = this.getSelection();
		this.rebuild(this._info);
		try{this.TREE.currentIndex=idx;}catch(e){}
		if(!this.itemObjects) return;
		try{
			var i;
			for(i=0;i<rows.length;i++){
				if(!this.TREE.view.selection.isSelected(rows[i])) this.TREE.view.selection.select(rows[i]);
			}
			if(this.itemObjects[idx]){
				var objs = this.Database.getObject({oid:this.itemObjects[idx].oid}, this.itemObjects[idx].dbtype);
				if(objs && objs.length>0) mcPropertyView.dispProperty(objs[0]);
			}
		}catch(e){}
		window.top.bitsAutocacheService.refresh();
	},

	rebuild : function(aInfo){
		try{this.TREE.currentIndex = -1;}catch(e){}
		try{this.TREE.view.selection.clearSelection();}catch(e){}
		if(this.itemObjects){
			this.itemObjects.length = 0;
			this.itemObjects = undefined;
		}
		this.TREE.removeAttribute("flex");
		var folderFilterHash = {};
		var tmpFolderFilter = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
		var tmpFolderFilterArr = tmpFolderFilter.split("\t");
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
		if(aInfo){
			var viewmode = aInfo.viewmode;
			var fid = (aInfo.fid?parseInt(aInfo.fid):undefined);
			this.dbtype = aInfo.dbtype;
			var viewtype = "small";
			if(fid != undefined && !isNaN(fid)){
				var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
				if(parseInt(info.version)>2){
					var folders = this.Database.getFolderFormID(fid, this.dbtype);
					if(folders && folders.length>0 && folders[0].fid_property){
						var parser = new DOMParser();
						var xmldoc = parser.parseFromString(folders[0].fid_property, "text/xml");
						parser = undefined;
						var iconsize = xmldoc.getElementsByTagName("ICON_SIZE")[0];
						if(iconsize) viewtype = iconsize.textContent
					}
				}
			}
			this.TREE.treeBoxObject.clearStyleAndImageCaches();
			if(viewtype == "large"){
				this.TREE_IFAVICON.setAttribute("style","min-width:77px;max-width:77px;");
				this.TREE.setAttribute("class","plain bitsItemTree-largeicon");
				this.VTTB.setAttribute("label","Large ");
				this.VTMM.removeAttribute("checked");
				this.VTSM.removeAttribute("checked");
				this.VTLM.setAttribute("checked","true");
			}else if(viewtype == "middle"){
				this.TREE_IFAVICON.setAttribute("style","min-width:43px;max-width:43px;");
				this.TREE.setAttribute("class","plain bitsItemTree-middleicon");
				this.VTTB.setAttribute("label","Middle ");
				this.VTLM.removeAttribute("checked");
				this.VTSM.removeAttribute("checked");
				this.VTMM.setAttribute("checked","true");
			}else{
				this.TREE_IFAVICON.setAttribute("style","min-width:25px;max-width:25px;");
				this.TREE.setAttribute("class","plain");
				this.VTTB.setAttribute("label","Small ");
				this.VTLM.removeAttribute("checked");
				this.VTMM.removeAttribute("checked");
				this.VTSM.setAttribute("checked","true");
			}
			if(fid != undefined && !isNaN(fid)){
				if(viewmode == "all"){
					this.itemObjects = this.Database.getObject({pfid:fid}, this.dbtype);
				}else{
					var doc_url = window.top.bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(this.gBrowser.contentDocument));
					this.itemObjects = this.Database.getObject({pfid:fid,doc_url:doc_url}, this.dbtype);
				}
			}else if(isNaN(fid) && aInfo.fid == bitsSearchAcross.id){
				fid = aInfo.fid;
				var findRegExp = new RegExp(bitsSearchAcross.value,"img");
				if(viewmode == "all"){
					this.itemObjects = this.Database.findObject(findRegExp);
				}else{
					var doc_url = window.top.bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(this.gBrowser.contentDocument));
					this.itemObjects = this.Database.findObject(findRegExp,undefined,{doc_url:doc_url});
				}
			}else if(aInfo.where){
				var param = {};
				for(var i=0;i<aInfo.where.length;i++){
					param[aInfo.where[i].key] = aInfo.where[i].val;
				}
				if(viewmode != "all") param.doc_url = window.top.bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(this.gBrowser.contentDocument));
				this.itemObjects = this.Database.getObject(param, this.dbtype);
			}
			this.TREE.setAttribute("flex","1");
			if(this.itemObjects && folderFilterHash[fid]){
				this.itemObjects = this.itemObjects.filter(
					function(element, index, array) {
						return folderFilterHash[fid].test(element.oid_title);
					}
				);
			}
			if(this.itemObjects && this.VSB.checked && this.VSM.value != ""){
				if(this.TREE_INOTE.hidden){
					this.itemObjects = this.itemObjects.filter(
						function(element, index, array) {
							return (new RegExp(bitsItemView.VSM.value,"img")).test(element.oid_title);
						}
					);
				}else{
					var domParser = new DOMParser();
					this.itemObjects = this.itemObjects.filter(
						function(element, index, array) {
							if(element.oid_note == undefined && element.oid_property && element.oid_property != ""){
								var xmldoc = domParser.parseFromString(element.oid_property, "text/xml");
								if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
								if(xmldoc){
									var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
									if(xmlnode) element.oid_note = xmlnode.textContent;
								}
								if(element.oid_note == undefined) element.oid_note = "";
								if(element.oid_note != ""){
									var oid_note = element.oid_note;
									oid_note = oid_note.replace(/[\r\n]+/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
									element.oid_note = oid_note;
								}
							}
							var value = bitsItemView.VSM.value;
							return (new RegExp(value,"img")).test(element.oid_title) || (new RegExp(value,"img")).test(element.oid_note);
						}
					);
					domParser = undefined;
				}
			}
			if(this.itemObjects){
				var self = this;
				this.itemObjects.sort(
					function(a,b){
						var direction = "";
						if(bitsTreeDate.isChecked){
							var a_date = Date.parse(a.oid_date);
							var b_date = Date.parse(b.oid_date);
							if(a_date < b_date) return -1;
							if(a_date > b_date) return 1;
							var a_order = (a.folder_order?parseInt(a.folder_order):0);
							var b_order = (b.folder_order?parseInt(b.folder_order):0);
							if(a_order < b_order) return -1;
							if(a_order > b_order) return 1;
							return 0;
						}else if(
							self.TREE_IFAVICON.hasAttribute("sortDirection") ||
							self.TREE_IURL.hasAttribute("sortDirection")
						){
							if(self.TREE_IFAVICON.hasAttribute("sortDirection")){
								direction = self.TREE_IFAVICON.getAttribute("sortDirection");
							}else if(self.TREE_IURL.hasAttribute("sortDirection")){
								direction = self.TREE_IURL.getAttribute("sortDirection");
							}
							if(direction == "ascending"){
								if(a.doc_url < b.doc_url) return -1;
								if(a.doc_url > b.doc_url) return 1;
							}else if(direction == "descending"){
								if(a.doc_url < b.doc_url) return 1;
								if(a.doc_url > b.doc_url) return -1;
							}
						}else if(self.TREE_IDOCTITLE.hasAttribute("sortDirection")){
							direction = self.TREE_IDOCTITLE.getAttribute("sortDirection");
							if(direction == "ascending"){
								if(a.doc_title < b.doc_title) return -1;
								if(a.doc_title > b.doc_title) return 1;
							}else if(direction == "descending"){
								if(a.doc_title < b.doc_title) return 1;
								if(a.doc_title > b.doc_title) return -1;
							}
						}else if(self.TREE_ITITLE.hasAttribute("sortDirection")){
							direction = self.TREE_ITITLE.getAttribute("sortDirection");
							if(direction == "ascending"){
								if(a.oid_title < b.oid_title) return -1;
								if(a.oid_title > b.oid_title) return 1;
							}else if(direction == "descending"){
								if(a.oid_title < b.oid_title) return 1;
								if(a.oid_title > b.oid_title) return -1;
							}
						}else if(self.TREE_IDATE.hasAttribute("sortDirection")){
							direction = self.TREE_IDATE.getAttribute("sortDirection");
							var a_date = Date.parse(a.oid_date);
							var b_date = Date.parse(b.oid_date);
							if(direction == "ascending"){
								if(a_date < b_date) return -1;
								if(a_date > b_date) return 1;
							}else if(direction == "descending"){
								if(a_date < b_date) return 1;
								if(a_date > b_date) return -1;
							}
						}
						return 0;
					}
				);
			}
		}else if(this._info){
			var viewmode = this._info.viewmode;
			var fid = (this._info.fid?parseInt(this._info.fid):undefined);
			if(fid && this._info.dbtype){
				this.TREE.setAttribute("flex","1");
			}
		}
		if(this.TREE.hasAttribute("flex")){
			var self = this;
			self.TREE.view = self;
			self.TREE.removeAttribute("hidden");
			if(this._app_version>2) self.VTTB.removeAttribute("disabled");
			self.VSB.removeAttribute("disabled");
			if(self.VSB.hasAttribute("checked")) self.VSM.removeAttribute("disabled");
		}else{
			this.VTTB.setAttribute("disabled",true);
			this.VSB.setAttribute("disabled",true);
			this.VSM.setAttribute("disabled",true);
			this.TREE.setAttribute("hidden",true);
		}
	},

/////////////////////////////////////////////////////////////////////
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onMousedown : function(aEvent){
		mcTreeImageTooltip.onMousedown(aEvent);
		if(aEvent.button == 2){ //右クリック
			var row = {};
			var col = {};
			var obj = {};
			this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
			if(row.value>=0){
				this.POPUP.removeAttribute("hidden");
			}else{
				this.POPUP.setAttribute("hidden","true");
			}
			return;
		}
	},

	onMousemove : function(aEvent){
		var param = {
			tree : bitsItemView.TREE
		};
		try {
			var row = {};
			var col = {};
			var childElt = {};
			param.tree.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, childElt);
			if(row.value == undefined || col.value == undefined){
			}else{
				param.row = row;
				param.col = col;
				param.childElt = childElt;
				if(mcTreeImageTooltip.tooltipRow != row.value){
					if(row.value>=0) param.obj = bitsItemView.itemObjects[row.value];
				}
			}
		}catch(e){}
		mcTreeImageTooltip.onMousemove(aEvent,param);
	},

	onMouseout : function(aEvent){
		mcTreeImageTooltip.onMouseout(aEvent);
	},

	onClick : function(aEvent){
		if(aEvent.button != 0) return;
		if(aEvent.altKey || aEvent.shiftKey || aEvent.ctrlKey) return;
		if(aEvent.target.id){
			if(aEvent.target.id == this.idTREE) return;
			if(aEvent.target.id != this.idTREE_IFAVICON)  this.TREE_IFAVICON.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_IURL)      this.TREE_IURL.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_IDOCTITLE) this.TREE_IDOCTITLE.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_ITITLE)    this.TREE_ITITLE.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_IDATE)     this.TREE_IDATE.removeAttribute("sortDirection");
			if(aEvent.target.id != this.idTREE_INOTE)     this.TREE_INOTE.removeAttribute("sortDirection");
			if(!aEvent.target.hasAttribute("sortDirection")){
				aEvent.target.setAttribute("sortDirection","ascending");
			}else if(aEvent.target.getAttribute("sortDirection") == "ascending"){
				aEvent.target.setAttribute("sortDirection","descending");
			}else{
				aEvent.target.removeAttribute("sortDirection");
			}
			this.refresh();
			return;
		}
		var row = {};
		var col = {};
		var obj = {};
		this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
//		try{ if(col.value.id == this.idTREE_INOTE) return; }catch(e){}
		if(row.value<0){
			this.TREE.view.selection.clearSelection();
			return;
		}
		if(this.itemObjects && this.itemObjects[row.value]){
			var objs = this.Database.getObject({oid:this.itemObjects[row.value].oid}, this.itemObjects[row.value].dbtype);
			if(objs && objs.length>0) mcPropertyView.dispProperty(objs[0]);
		}
		//おまじない
		this.TREE.blur();
		this.TREE.focus();
		return;
		this.open();
	},

	onDblClick : function(aEvent){
		if(aEvent.button != 0) return;
		if(aEvent.altKey || aEvent.shiftKey || aEvent.ctrlKey) return;
		if(aEvent.target.id == this.idTREE_ITITLE){
			return;
		}else if(aEvent.target.id == this.idTREE_IDATE){
			return;
		}
		var row = {};
		var col = {};
		var obj = {};
		this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
		try{ if(col.value.id == this.idTREE_INOTE) return; }catch(e){}
		if(row.value<0){
			this.TREE.view.selection.clearSelection();
			return;
		}
		this.open();
	},

	onKeyPress : function(aEvent){
		switch(aEvent.keyCode){
			case aEvent.DOM_VK_RETURN :
				aEvent.preventDefault();
				this.open(aEvent.ctrlKey);
				break;
			case aEvent.DOM_VK_DELETE :
				if(!(aEvent.ctrlKey || aEvent.shiftKey)){
					aEvent.preventDefault();
					this.remove(aEvent);
				}
				break;
			case aEvent.DOM_VK_F2 :
				aEvent.preventDefault();
				this.property();
				break;
			default:
				break;
		}
	},

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
// TREE 関連
/////////////////////////////////////////////////////////////////////
	copy : function(aMode){
		if(this.TREE.currentIndex<0) return;
		var row = this.TREE.currentIndex;
		if(!this.itemObjects[row]) return;
		var aObject = this.itemObjects[row];
		if(!aMode) aMode = 'copy';
		window.top.bitsMetaCapture.copyToClipBoard(aObject.oid,aObject.dbtype,aMode);
	},

	open : function(tabbed){
		if(this.TREE.currentIndex<0) return;
		var row = this.TREE.currentIndex;
		if(!this.itemObjects[row]) return;
		var aObject = this.itemObjects[row];
		this.Common.loadFromObject(aObject,tabbed);
	},

	confirmRemovingFor : function(){
		try{
			if(this.confirmDelete){
				return this.Common.confirm( this.STRING.getString("CONFIRM_DELETE") );
			}
			return true;
		}catch(e){
			return false;
		}
	},

	setSelection : function(aOID,aDBTYPE){
		try{this.TREE.view.selection.clearSelection();}catch(e){}
		if(!this.itemObjects) return;
		try{
			var row;
			for(row=0;row<this.itemObjects.length;row++){
				if(this.itemObjects[row].oid != aOID || this.itemObjects[row].dbtype != aDBTYPE) continue;
				this.TREE.currentIndex = row;
				if(this.TREE.view && !this.TREE.view.selection.isSelected(this.TREE.currentIndex)) this.TREE.view.selection.select(this.TREE.currentIndex);
				this.TREE.treeBoxObject.ensureRowIsVisible(this.TREE.currentIndex);
				this.TREE.focus();
				mcPropertyView.dispProperty(this.itemObjects[row]);
				break;
			}
		}catch(e){
			this._dump("bitsItemView.setSelection():"+e);
		}
	},

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

	validateMultipleSelection : function(aIdxList){
		if(aIdxList.length != this.TREE.view.selection.count){
			this.Common.alert(this.STRING.getString("ERROR_MULTIPLE_SELECTION"));
			return false;
		}
		return true;
	},

	mergeObject : function(aFolder){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		window.top.bitsScrapPartyMergeService._isCancel = false;
		window.top.bitsScrapPartyMergeService._isSameprocessing = false;
		window.top.bitsScrapPartyMergeService._isMergeMode = 0;
		window.top.bitsScrapPartyMergeService._isConfirm = false;
		var mergeRtn = 0;
		var i;
		var mergeFlag = false;
		for(i=0;i<idxList.length;i++){
			var row = idxList[i];
			if(!this.itemObjects[row]) continue;
			var aObject = this.itemObjects[row];
			var dstObjects = this.Database.getObject({pfid:aFolder.fid,oid_title:aObject.oid_title}, aFolder.dbtype);
			if(!dstObjects || dstObjects.length == 0) continue;
			mergeFlag = true;
			break;
		}
		if(!mergeFlag) return mergeRtn;
		for(i=0;i<idxList.length;i++){
			var row = idxList[i];
			if(!this.itemObjects[row]) continue;
			var aObject = this.itemObjects[row];
			mergeRtn |= window.top.bitsScrapPartyMergeService._merge(aObject,aFolder);
			if(window.top.bitsScrapPartyMergeService.cancel) return -1;
		}
		return mergeRtn;
	},

	copyObject : function(aFolder){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		var pfid = aFolder.fid;
		var pdbtype = aFolder.dbtype;
		var pfid_order = this.Database.getMaxOrderFormPID(aFolder.fid,aFolder.dbtype);
		var exists = false;
		var i;
		for(i=0;i<idxList.length;i++){
			var row = idxList[i];
			if(!this.itemObjects[row]) continue;
			var aObject = this.itemObjects[row];
			var rtn = this.Database.existsObject({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype);
			if(rtn){
				exists = rtn;
				continue;
			}
			if(aObject.dbtype == aFolder.dbtype){
				rtn = this.Database.addLink({oid:aObject.oid,pfid:aFolder.fid,pfid_order:++pfid_order},aFolder.dbtype);
			}else{
				var objs = this.Database.getObjectWithProperty({oid:aObject.oid,pfid:aObject.pfid},aObject.dbtype);
				var blobs =this.Database.getObjectBLOB(aObject.oid,aObject.dbtype);
				if(objs && objs.length>0) aObject = objs[0];
				var addObj = this.Database.newObject(aObject.oid,aFolder.dbtype);
				var key;
				for(key in aObject){
					if(key == "oid") continue;
					addObj[key] = aObject[key];
				}
				addObj.pfid = aFolder.fid;
				delete addObj.dbtype;
				delete addObj.fid_style;
				rtn = this.Database.addObject(addObj,aFolder.dbtype);
				if(rtn){
					if(blobs && blobs.length>0){
						this.Database.updateObjectBLOB(addObj.oid,blobs[0],aFolder.dbtype);
					}
				}
			}
		}
		if(exists){
			this.Common.alert(mcMainService.STRING.getString("ALERT_COPYOBJECT_EXISTS"));
		}
		return true;
	},

	moveObject : function(aFolder,aModShift){
		try{
			if(aModShift == undefined) aModShift = false;
			if(this.TREE.view.selection.count == 0) return false;
			var idxList = this.getSelection();
			if(this.validateMultipleSelection(idxList) == false) return false;
			var update = false;
			var i;
			for(i=0;i<idxList.length;i++){
				var row = idxList[i];
				if(!this.itemObjects[row]) continue;
				var aObject = this.itemObjects[row];
				if(update == false && aObject.dbtype == aFolder.dbtype && this.Database.existsObject({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype)){
					if(this.Common.confirm(this.STRING.getString("CONFIRM_COPYOBJECT_OVERWRITE"))){
						update = true;
					}else{
						return false;
					}
				}
				if(update && aObject.dbtype == aFolder.dbtype && this.Database.existsObject({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype)){
					rtn = this.Database.removeLink({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype);
				}
			}
			var rtn;
			for(i=0;i<idxList.length;i++){
				var row = idxList[i];
				if(!this.itemObjects[row]) continue;
				rtn = this._moveObject(aFolder,this.itemObjects[row],aModShift);
			}
			this.refresh();
			return true;
		}catch(e){
			this._dump("bitsItemView.moveObject():"+e);
			return false;
		}
	},

	_moveObject : function(aFolder,aObject,aModShift){
		var rtn;
		var pfid_order = this.Database.getMaxOrderFormPID(aFolder.fid,aFolder.dbtype);
		var old_source = bitsMarker.id_key+aObject.dbtype+aObject.oid;
		var new_source = bitsMarker.id_key;
		if(aObject.dbtype == aFolder.dbtype){
			rtn = this.Database.updateObject({oid:aObject.oid,pfid:aFolder.fid,pfid_old:aObject.pfid,pfid_order:++pfid_order},aFolder.dbtype);
			new_source += aFolder.dbtype+aObject.oid;
		}else{
			var objs = this.Database.getObjectWithProperty({oid:aObject.oid,pfid:aObject.pfid},aObject.dbtype);
			var blobs =this.Database.getObjectBLOB(aObject.oid,aObject.dbtype);
			if(objs && objs.length>0) aObject = objs[0];
			var addObj = this.Database.newObject(aObject.oid,aFolder.dbtype);
			var key;
			for(key in aObject){
				if(key == "oid") continue;
				addObj[key] = aObject[key];
			}
			addObj.pfid = aFolder.fid;
			addObj.pfid_order = ++pfid_order;
			delete addObj.dbtype;
			delete addObj.fid_style;
			rtn = this.Database.addObject(addObj,aFolder.dbtype);
			if(rtn && blobs && blobs.length>0) this.Database.updateObjectBLOB(addObj.oid,blobs[0],aFolder.dbtype);
			if(rtn && aModShift) rtn = this.Database.removeObject(aObject,aObject.dbtype);
			new_source += aFolder.dbtype+addObj.oid;
		}
		var i;
		for(i=0;i<this.gBrowser.browsers.length;i++){
			var contentDocument = this.gBrowser.browsers[i].contentDocument;
			var contentWindow = this.gBrowser.browsers[i].contentWindow;
			var DOC = [];
			if(contentWindow.frames){
				var wincnt;
				for(wincnt=0;wincnt<contentWindow.frames.length;wincnt++){
					DOC.push(contentWindow.frames[wincnt].document);
				}
			}
			DOC.push(contentDocument);
			var j;
			for(j=0;j<DOC.length;j++){
				var doc = DOC[j];
				var xPathResult = this.XPath.evaluate('//*[@id="'+old_source+'"]', doc);
				var k;
				for(k=xPathResult.snapshotLength-1;k>=0;k--){
					var node = xPathResult.snapshotItem(k);
					node.setAttribute("pfid", aFolder.fid);
					node.setAttribute("style",aFolder.fid_style);
					node.setAttribute("dbtype",aFolder.dbtype);
					node.setAttribute("id",new_source);
				}
			}
			DOC = undefined;
		}
		return rtn;
	},

	remove : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		if(!this.confirmRemovingFor()) return false;
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 0);
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		var i;
		for(i=0;i<idxList.length;i++){
			var row = idxList[i];
			if(!this.itemObjects[row]) continue;
			var aObject = this.itemObjects[row];
			var match_exp = new RegExp("^"+bitsMarker.id_key+".+$","m");
			var source;
			if(!aObject.oid_type.match(/^image\/(.+)$/)) source = bitsMarker.id_key+aObject.dbtype+aObject.oid;
			if(source) bitsMarker.unmarkerWindow(source);
			var id = aObject.oid;
			var dbtype = aObject.dbtype;
			var pfid = aObject.pfid;
			this.Database.removeObject({oid:id,pfid:pfid},dbtype,false);
		}
		this.refresh();
		mcPropertyView.dispProperty();
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1);
		return true;
	},

	pageshow : function(aDoc){

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
		if(result.accept) this.refresh();
		return result.accept;
	},

////////////////////////////////////////////////////////////////////
// TREE ドラッグイベント関連
/////////////////////////////////////////////////////////////////////
	getModifiers : function(aEvent){
		this.modAlt   = aEvent.altKey;
		this.modShift = aEvent.shiftKey;
		this.modCtrl  = aEvent.ctrlKey;
		this.modMeta  = aEvent.metaKey;
	},

	dragDropObserver : {
		onDragStart : function(event, transferData, action){
			try{
				if(event.originalTarget.localName != "treechildren") return;
				var idxList = bitsItemView.getSelection();
				if(idxList.length>0){
					transferData.data = new TransferData();
					var rc = [];
					var i;
					for(i=0;i<idxList.length;i++){
						var oid = bitsItemView.itemObjects[idxList[i]].oid;
						var dbtype = bitsItemView.itemObjects[idxList[i]].dbtype;
						rc.push(oid+"\t"+dbtype);
					}
					if(rc.length>0){
						var data = rc.join("\n");
						transferData.data.addDataForFlavour("wired-marker/object", data);
					}
				}
			}catch(ex){
				bitsItemView._dump("dragDropObserver.onDragStart():"+ex);
			}
		},
		getSupportedFlavours : function(){
			bitsItemView._canDrop = false;
			var flavours = new FlavourSet();
			flavours.appendFlavour("text/x-moz-url");
			flavours.appendFlavour("text/html");
			flavours.appendFlavour("text/xml");
			flavours.appendFlavour("application/x-moz-url");
			flavours.appendFlavour("application/x-moz-file","nsIFile");
			flavours.appendFlavour("text/unicode");
			return flavours;
		},
		onDragOver : function(event, flavour, session){},
		onDragExit : function(event, session){},
		onDrop     : function(event, transferData, session){
			bitsItemView._canDrop = true;
		},
	},

/////////////////////////////////////////////////////////////////////
// Popup イベント関連
/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent){},

	onPopupHiding : function(aEvent){},

	onPopupCommand : function(aEvent){
		switch(aEvent.target.id){
			case this.idPOPUP_OPEN:
				this.open();
				break;
			case this.idPOPUP_OPENN:
				this.open(true);
				break;
			case this.idPOPUP_REMOVE:
				this.remove(aEvent);
				break;
			case this.idPOPUP_PROPERTY:
				this.property();
				break;
			case this.idPOPUP_COPY:
				this.copy();
				break;
			case this.idPOPUP_COPYTITLE:
				this.copy('title');
				break;
			case this.idPOPUP_COPYNOTE:
				this.copy('note');
				break;
			case this.idPOPUP_COPYMETA:
				this.copy('pagetitle');
				break;
			case this.idPOPUP_COPYFORMAT:
				this.copy('format');
				break;
			case this.idPOPUP_COPYSETTING:
				this.copy('setting');
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	onSearchKeyPress : function(aEvent){
		switch ( aEvent.keyCode ){
			case aEvent.DOM_VK_RETURN : 
				this.refresh();
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
