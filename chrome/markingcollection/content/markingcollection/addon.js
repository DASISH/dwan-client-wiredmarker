var bitsScrapPartyAddonService = {
	_addon : [],
	_addon_hash : [],
/////////////////////////////////////////////////////////////////////
	get STRING() { return document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get Database()   { return bitsObjectMng.Database;   },
	get XML()        { return bitsObjectMng.XML;        },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

/////////////////////////////////////////////////////////////////////
	init : function(){
		this.loadAddon();
	},

/////////////////////////////////////////////////////////////////////
	done : function(){

	},

/////////////////////////////////////////////////////////////////////
	getAddonDir : function(){
		var dir = bitsMarkingCollection.getExtInstDir().clone();
		if(dir) dir.append("addon");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	loadAddon : function(){
		try{
			var dir = bitsScrapPartyAddonService.getAddonDir().clone();
			if(!dir) return;
			var _addon = [];
			var _addon_hash = [];
			var entries = dir.directoryEntries;
			while(entries.hasMoreElements()){
				var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				var addon_file = {};
				if(entry.isFile() && entry.leafName.match(/^(.+)\.xml$/m)){
					addon_file.title = RegExp.$1;
					var xml = this.Common.convertToUnicode(this.Common.readFile(entry),"UTF-8");
					xml = xml.replace(/[\r\n]+/img,"");
					if(xml.match(/^.*<ADDON>.*<ID>(.*?)<\/ID>.*<\/ADDON>.*/img)){
						addon_file.id = RegExp.$1;
					}
					if(addon_file.id == undefined) continue;

					try{
						var parser = new DOMParser();
						var xmldoc = parser.parseFromString(xml, "text/xml"); //二重に起動した時に、帰って来なくなる。「nglayout.debug.disable_xul_cache」と関係ありそうだが詳細は不明
						parser = undefined;
						var elemADDON = xmldoc.getElementsByTagName("ADDON");
						if(elemADDON && elemADDON.length>0){
							var elems = elemADDON[0].getElementsByTagName("*");
							var i;
							for(i=0;i<elems.length;i++){
								var key = elems[i].nodeName.toLowerCase();
								addon_file[key] = {};
								if(key.match(/observer/)){
									//addon_file[key].value = eval(elems[i].textContent);
								}else{
									addon_file[key].value = elems[i].textContent;

//this._dump("loadAddon():"+key+"=["+addon_file[key].value+"]");

								}
								if(elems[i].attributes && elems[i].attributes.length>0){
									var attrs = {};
									var attributes = elems[i].attributes;
									var j;
									for(j=0;j<attributes.length;j++){
										attrs[attributes[j].name.toLowerCase()] = attributes[j].value;
									}
									addon_file[key].attrs = attrs;
								}
							}
						}
					}catch(ex2){
//						bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.loadAddon(2):"+ex2);
						continue;
					}
					addon_file.file = entry;
					_addon.push(addon_file);
					_addon_hash[addon_file.id.value] = addon_file;
				}
				addon_file = undefined;
			}

			bitsScrapPartyAddonService._addon = _addon;
			bitsScrapPartyAddonService._addon_hash = _addon_hash;
		}catch(ex){
			bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.loadAddon():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	existsAddon : function(aIsDispPopupMenu){
		bitsScrapPartyAddonService.loadAddon();
		if(aIsDispPopupMenu == true){
			var arr = [];
			try{
				var i;
				for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
					var addon = bitsScrapPartyAddonService._addon[i];
					if(addon.id && addon.attr_mod) arr.push(addon.attr_mod.value);
				}
			}catch(ex){
				bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.existsAddon():"+ex);
			}
			return (arr.length>0);
		}else{
			return (bitsScrapPartyAddonService._addon.length>0);
		}
	},

/////////////////////////////////////////////////////////////////////
	getAddonDBType : function(){
		try{
			var dbtype_arr = [];
			var i;
			for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
				if(bitsScrapPartyAddonService._addon[i].dbtype) dbtype_arr.push(bitsScrapPartyAddonService._addon[i].dbtype.value);
			}
			if(dbtype_arr.length>0){
				return dbtype_arr;
			}else{
				return undefined;
			}
		}catch(ex){
			bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.getAddonDBType():"+ex);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	getAddonInfo : function(){
		try{
			var info_arr = [];
			var i;
			for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
				var info = {};
				var key;
				for(key in bitsScrapPartyAddonService._addon[i]){
				if(typeof bitsScrapPartyAddonService._addon[i][key] == "function") continue;
					info[key] = bitsScrapPartyAddonService._addon[i][key];
				}
				info_arr.push(info);
			}
			if(info_arr.length>0){
				return info_arr;
			}else{
				return undefined;
			}
		}catch(ex){
			bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.getAddonInfo():"+ex);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	eventListener : function(aEvent, aType, aRes){
		try{
			if(!aRes && aEvent.rangeParent){
				if(aEvent.rangeParent.nodeName == "tree"){
					var tree = aEvent.rangeParent;
					if(tree.view.selection.count >= 1 && tree.currentIndex >= 0){
						aRes = tree.builderView.getResourceAtIndex(tree.currentIndex);
					}
				}
			}
			var folder_addon_id = "";
			if(aRes){
				if(this.DataSource.isContainer(aRes)){
					folder_addon_id = this.DataSource.getProperty(aRes, "addon_id");
				}else{
					var res = this.DataSource.findParentResource(aRes);
					if(res) folder_addon_id = this.DataSource.getProperty(res, "addon_id");
				}
				if(!folder_addon_id || folder_addon_id == ""){
					var dbtype = this.DataSource.getProperty(aRes, "dbtype");
					var addon_info = bitsMarkingCollection.dbinfo.getAddonInfo(dbtype);
					if(addon_info && addon_info.id && addon_info.id != "") folder_addon_id = addon_info.id
				}
			}

			if(folder_addon_id != ""){
				var addon = bitsScrapPartyAddonService._addon_hash[folder_addon_id];
				if(addon && addon.observer) addon.observer.value(aEvent, aType, aRes);
			}else{
			}

			var i;
			for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
				if(folder_addon_id == bitsScrapPartyAddonService._addon[i].id) continue;
				var addon = bitsScrapPartyAddonService._addon[i];
				if(addon && addon.observer) addon.observer.value(aEvent, aType, aRes);
			}


		}catch(ex){
			bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.eventListener():"+ex);
			aEvent.preventDefault();
		}
	},

/////////////////////////////////////////////////////////////////////
	builderViewObserver : {
		canDrop : function(index, orient, tree){
			var i;
			for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
				var addon = bitsScrapPartyAddonService._addon[i];
				if(addon && addon.builderviewobserver && addon.builderviewobserver.value && addon.builderviewobserver.value.canDrop) addon.builderviewobserver.value.canDrop(index, orient, tree);
			}
		},
		onDrop : function(row, orient, tree, XferDataSet, aState){
			var i;
			for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
				var addon = bitsScrapPartyAddonService._addon[i];
				if(addon && addon.builderviewobserver && addon.builderviewobserver.value && addon.builderviewobserver.value.onDrop) setTimeout(addon.builderviewobserver.value.onDrop, 0, row, orient, tree, XferDataSet, aState);
			}
		},
		onToggleOpenState     : function(row){},
		onCycleHeader         : function(){},
		onSelectionChanged    : function(){},
		onCycleCell           : function(aRow, pColID ){},
		isEditable            : function(){},
		onSetCellText         : function(){},
		onPerformAction       : function(){},
		onPerformActionOnRow  : function(){},
		onPerformActionOnCell : function(aAction, aRow, aColID ){},
	},

/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent,aRes){
		try{
			var i;
			for(i=0;i<bitsScrapPartyAddonService._addon.length;i++){
				var addon = bitsScrapPartyAddonService._addon[i];
				if(addon.id && addon.attr_mod) bitsScrapPartyAddonService.createMenu(aEvent.target, addon.id.value, aRes);
			}
		}catch(ex){
			bitsScrapPartyAddonService._dump("bitsScrapPartyAddonService.onPopupShowing():"+ex);
			aEvent.preventDefault();
		}

	},

/////////////////////////////////////////////////////////////////////
	onPopupHiding : function(aEvent){
		var i;
		var elem = aEvent.target.lastChild;
		for(i=aEvent.target.childNodes.length-1;i>=0;i--){
			aEvent.target.removeChild(aEvent.target.childNodes[i]);
		}
	},

/////////////////////////////////////////////////////////////////////
	onCommand : function(aEvent,aRes){

		var res = aRes;
		if(!res){ aEvent.preventDefault(); return; }
		var fid   = this.DataSource.getProperty(res,"id");
		var type   = this.DataSource.getProperty(res,"type");
		var title  = this.DataSource.getProperty(res,"title");
		var dbtype = this.DataSource.getProperty(res,"dbtype");

		var addon_file = bitsScrapPartyAddonService._addon_hash[aEvent.target.id];
		var label = aEvent.target.label;
		if(!this.Common.confirm("[ "+label+" ]"+ this.STRING.getString("CONFIRM_ADDON_FOLDER_ATTR_CHANGE"))){return;}


		if(addon_file.icon) this.DataSource.setProperty(res,"icon",addon_file.icon.value);


		var property_arr = [];
		if(addon_file.id) property_arr.push("<ID>"+addon_file.id.value+"</ID>");
		if(addon_file.title) property_arr.push("<TITLE>"+addon_file.title.value+"</TITLE>");
		if(addon_file.icon) property_arr.push("<ICON>"+addon_file.icon.value+"</ICON>");

		if(property_arr.length>0){
			var rtnFolder = this.Database.getFolderFormID(fid,dbtype);
			if(rtnFolder && rtnFolder.length && rtnFolder.length>0){
				this.Database.removeFolder(fid,dbtype);

				var fid_property = rtnFolder[0].fid_property;
				if(!fid_property || fid_property == "") fid_property = "<PROPERTY></PROPERTY>";
				try{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(fid_property, "text/xml");
					parser = undefined;
				}catch(ex){}
				if(xmldoc){
					fid_property = "";
					var parentNode = null;
					var xPathResult = bitsObjectMng.XPath.evaluate('/PROPERTY[1]', xmldoc);
					if(xPathResult && xPathResult.snapshotLength>0){
						parentNode = xPathResult.snapshotItem(0);
						var addon_node = parentNode.getElementsByTagName("ADDON")[0];
						if(addon_node) parentNode.removeChild(addon_node);
					}
					xPathResult = undefined;

					var addon_node = xmldoc.createElement("ADDON");
					if(addon_node){
						parentNode.appendChild(addon_node);
						if(addon_file.id){
							var node = xmldoc.createElement("ID");
							if(node){
								node.textContent = addon_file.id.value;
								addon_node.appendChild(node);
							}
						}
						if(addon_file.title){
							var node = xmldoc.createElement("TITLE");
							if(node){
								node.textContent = addon_file.title.value;
								addon_node.appendChild(node);
							}
						}
						if(addon_file.icon){
							var node = xmldoc.createElement("ICON");
							if(node){
								node.textContent = addon_file.icon.value;
								addon_node.appendChild(node);
							}
						}
					}
					var s = new XMLSerializer();
					fid_property = s.serializeToString(xmldoc);
					s = undefined;

				}else{ //念のため
					fid_property = "<PROPERTY><ADDON>" + property_arr.join("") + "</ADDON></PROPERTY>";
				}


				rtnFolder[0].fid_property = fid_property;
				if(rtnFolder[0].dbtype) delete rtnFolder[0].dbtype;
				this.Database.addFolder(rtnFolder[0],dbtype,false);
				bitsMarkingCollection.checkFolderNameRepetition(dbtype);
				var newFlds = this.Database.getFolderFormID(fid,dbtype);
				if(newFlds){
					this.DataSource.setProperty(res,"title",newFlds[0].fid_title);
					this.DataSource.setProperty(res,"dbtype",dbtype);
					if(addon_file.id) this.DataSource.setProperty(res,"addon_id",addon_file.id.value);
					this.DataSource.flush();
				}
			}
		}
		return;
	},

/////////////////////////////////////////////////////////////////////
	createMenu : function(aParentNode,aID,aRes){

		var elemMenuitem = document.createElement("menuitem");
		if(elemMenuitem){
			var addon_file = bitsScrapPartyAddonService._addon_hash[aID];

//this._dump("createMenu():addon_file=["+addon_file+"]");

			var label = (addon_file.menu_title?addon_file.menu_title.value:addon_file.title.value);
			var res = aRes;
			var fid = this.DataSource.getProperty(res, "id");
			var dbtype = this.DataSource.getProperty(res, "dbtype");
			var folder_addon_id = this.DataSource.getProperty(res, "addon_id");

			elemMenuitem.setAttribute("id",aID);
			elemMenuitem.setAttribute("label",label);
			if(addon_file.icon.value != ""){
				elemMenuitem.setAttribute("image",addon_file.icon.value);
			}else{
				elemMenuitem.setAttribute("image","chrome://markingcollection/skin/extensions_16.png");
			}
			elemMenuitem.setAttribute("class","menuitem-iconic");

			if(addon_file.id.value == folder_addon_id){
				elemMenuitem.setAttribute("disabled","true");
			}else{
				elemMenuitem.removeAttribute("disabled");
			}

			aParentNode.appendChild(elemMenuitem);
		}

	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
