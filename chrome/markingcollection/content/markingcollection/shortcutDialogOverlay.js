var bitsShortcutDialogOverlay = {
	_init : false,
	_opener : null,
	_changed : false,
	_app_version : 2,

	get TAB_PANELS() { return document.getElementById("mcSettingTabPanels"); },
	get idPANEL()  { return 'mcShortcutTabPanel'; },

	get TREE()     { return document.getElementById("bitsShortcutTree"); },
	get ADD()      { return document.getElementById("bitsShortcutAdd"); },
	get EDIT()     { return document.getElementById("bitsShortcutEdit"); },
	get DEL()      { return document.getElementById("bitsShortcutDel"); },
	get DISP()     { return document.getElementById("bitsShortcutDisp"); },

	get idTITLE()    { return 'bitsShortcutTitleCol'; },
	get idKEY()      { return 'bitsShortcutKeyCol'; },
	get idSHIFT()    { return 'bitsShortcutShiftCol'; },
	get idALT()      { return 'bitsShortcutAltCol'; },
	get idACCEL()    { return 'bitsShortcutAccelCol'; },
	get idDISABLED() { return 'bitsShortcutDisabledCol'; },
	get idPRIORITY() { return 'bitsShortcutPriorityCol'; },

	get STRING()     { return this._opener.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return this._opener.top.bitsObjectMng.DataSource; },
	get Common()     { return this._opener.top.bitsObjectMng.Common;     },
	get XPath()      { return this._opener.top.bitsObjectMng.XPath;      },
	get Database()   { return this._opener.top.bitsObjectMng.Database;   },
	get XML()        { return this._opener.top.bitsObjectMng.XML;   },
	get gBrowser()   { return this._opener.top.bitsObjectMng.getBrowser();},
	get bitsMarkingCollection() { return this._opener.top.bitsMarkingCollection;},


	get bitsShortcutService(){ return this._opener.top.bitsShortcutService; },
	get xmldoc()             { return this.bitsShortcutService.xmldoc; },
	get namespace()          { return this.bitsShortcutService.namespace; },
	get evaluateArray()      { return this.bitsShortcutService.evaluateArray; },
	get confirmRemovingFor() { return this.bitsShortcutService.confirmRemovingFor; },
	get check_img() { return "chrome://markingcollection/skin/cbox-check.gif"; },

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(!this._init){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			this._opener = wm.getMostRecentWindow("navigator:browser");

			var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
			if(osString == "Darwin"){
				document.getElementById(this.idALT).setAttribute('label','Option');
				document.getElementById(this.idACCEL).setAttribute('label','Command');
			}

			this.DISP.checked = nsPreferences.getBoolPref("wiredmarker.shortcut.tree_disp", true);

			this.TAB_PANELS.addEventListener("select", this.tabselect, false);

			var db_hash = {};
			var dbinfo = this.bitsMarkingCollection.dbinfo.getAllDBInfo();
			if(dbinfo){
				var i;
				for(i=0;i<dbinfo.length;i++){
					db_hash[""+dbinfo[i].database_dbtype] = dbinfo[i];
				}
			}
			var elemSCs =  this.evaluateArray('//SHORTCUT[@fid and @dbtype]');
			var sccnt;
			for(sccnt=elemSCs.length-1;sccnt>=0;sccnt--){
				var fid = elemSCs[sccnt].getAttribute('fid');
				var dbtype = elemSCs[sccnt].getAttribute('dbtype');
				if(dbtype){
					if(!db_hash[dbtype] && elemSCs[sccnt].getAttributeNS(this.namespace,'hidden') == 'false'){
						elemSCs[sccnt].setAttributeNS(this.namespace,'hidden','true');
						this._changed = true;
					}else if(db_hash[dbtype] && elemSCs[sccnt].getAttributeNS(this.namespace,'hidden') == 'true'){
						elemSCs[sccnt].setAttributeNS(this.namespace,'hidden','false');
						this._changed = true;
					}
				}
				if(fid && dbtype && db_hash[dbtype] && !this.Database._fidExists(dbtype,fid)){
					elemSCs[sccnt].parentNode.removeChild(elemSCs[sccnt]);
					this._changed = true;
				}
			}
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			this._app_version = parseFloat(info.version);
			if(this._app_version<3.1){
				this.TREE.addEventListener("draggesture", bitsShortcutDialogOverlay.onOldDraggesture, false);
				this.TREE.addEventListener("dragover", bitsShortcutDialogOverlay.onOldDragover, false);
				this.TREE.addEventListener("dragdrop", bitsShortcutDialogOverlay.onOldDragdrop, false);
				this.TREE.addEventListener("dragexit", bitsShortcutDialogOverlay.onOldDragexit, false);
			}else{
				this.TREE.addEventListener("dragstart", bitsShortcutDialogOverlay.onDragEvents, false);
				this.TREE.addEventListener("drag", bitsShortcutDialogOverlay.onDragEvents, false);
				this.TREE.addEventListener("dragend", bitsShortcutDialogOverlay.onDragEvents, false);

				this.TREE.addEventListener("dragenter", bitsShortcutDialogOverlay.onDropEvents, false);
				this.TREE.addEventListener("dragover", bitsShortcutDialogOverlay.onDropEvents, false);
				this.TREE.addEventListener("dragleave", bitsShortcutDialogOverlay.onDropEvents, false);
				this.TREE.addEventListener("drop", bitsShortcutDialogOverlay.onDropEvents, false);
			}
			this.rebuild();
			this._init = true;
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		this.TAB_PANELS.removeEventListener("select", this.tabselect, false);
		if(this._app_version<3.1){
			this.TREE.removeEventListener("draggesture", bitsShortcutDialogOverlay.onOldDraggesture, false);
			this.TREE.removeEventListener("dragover", bitsShortcutDialogOverlay.onOldDragover, false);
			this.TREE.removeEventListener("dragdrop", bitsShortcutDialogOverlay.onOldDragdrop, false);
			this.TREE.removeEventListener("dragexit", bitsShortcutDialogOverlay.onOldDragexit, false);
		}else{
			this.TREE.removeEventListener("dragstart", bitsShortcutDialogOverlay.onDragEvents, false);
			this.TREE.removeEventListener("drag", bitsShortcutDialogOverlay.onDragEvents, false);
			this.TREE.removeEventListener("dragend", bitsShortcutDialogOverlay.onDragEvents, false);

			this.TREE.removeEventListener("dragenter", bitsShortcutDialogOverlay.onDropEvents, false);
			this.TREE.removeEventListener("dragover", bitsShortcutDialogOverlay.onDropEvents, false);
			this.TREE.removeEventListener("dragleave", bitsShortcutDialogOverlay.onDropEvents, false);
			this.TREE.removeEventListener("drop", bitsShortcutDialogOverlay.onDropEvents, false);
		}
		if(this._changed) this.bitsShortcutService.xmlflash(100);
	},

/////////////////////////////////////////////////////////////////////
	tabselect : function(aEvent){
		setTimeout(function(){bitsShortcutDialogOverlay._tabselect(aEvent);},0);
	},

	_tabselect : function(aEvent){
		if(this.TAB_PANELS.selectedPanel.id != this.idPANEL) return;
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	getTreeNodes : function(aExpr){
		aExpr = (aExpr?' and ' + aExpr:'');
		return this.evaluateArray('//SHORTCUT[@WM:hidden="false"' + aExpr + ']');
	},
	get rowCount(){
		var results = this.getTreeNodes();
		return results.length;
	},
	getCellText : function(row,column){
		var results = this.getTreeNodes();
		if(!results[row]) return null;
		if(column.id == this.idTITLE){
			return results[row].getAttributeNS(this.namespace,"title");
		}else if(column.id == this.idKEY){
			return results[row].getAttribute("key");
		}else if(column.id == this.idPRIORITY){
			return row+1;
		}else{
			return null;
		}
	},
	getCellValue : function(row,column){
		var results = this.getTreeNodes();
		if(!results[row]) return null;
		if(column.id == this.idSHIFT){
			return (results[row].getAttribute('shift') == 'true' ? true : false);
		}else if(column.id == this.idALT){
			return (results[row].getAttribute('alt') == 'true' ? true : false);
		}else if(column.id == this.idACCEL){
			return (results[row].getAttribute('accel') == 'true' ? true : false);
		}else if(column.id == this.idDISABLED){
			return (results[row].getAttributeNS(this.namespace,'disabled') == 'true' ? true : false);
		}
		return null;
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(){ return true; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,column){
		return null;
	},
	getRowProperties: function(row,prop){
		var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
		var results = this.getTreeNodes();
		if(!results[row]) return;
		if(results[row].getAttributeNS(this.namespace,'disabled') == 'true') prop.AppendElement(aserv.getAtom("disabled"));
	},
	getCellProperties: function(row, column, prop){
		var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
		var results = this.getTreeNodes();
		if(!results[row]) return;
		if(results[row].getAttributeNS(this.namespace,'disabled') == 'true') prop.AppendElement(aserv.getAtom("disabled"));
	},
	getColumnProperties: function(column, element, prop){},
	cycleHeader : function(col){},
	setCellText : function(row,column,text){},
  getParentIndex: function(idx) { return -1; },
	canDrop : function(index, orient){
		return true;
	},
	onDrop : function(row, orient){},
	drop : function(row, orient){
		if(orient>0) row++;
		if(row>=this.rowCount) row = this.rowCount-1;
		var results = this.getTreeNodes();
		var dropnode = results[row];
		if(!dropnode) return;
		var dragnode = results[this.TREE.currentIndex];
		if(!dragnode) return;
		if(dropnode == dragnode) return;
		if(row==this.rowCount-1 && orient>0){
			dropnode.parentNode.appendChild(dragnode);
			this.TREE.currentIndex = row;
		}else{
			dropnode.parentNode.insertBefore(dragnode,dropnode);
			this.TREE.currentIndex = row;
		}
		if(!this.TREE.view.selection.isSelected(this.TREE.currentIndex)) this.TREE.view.selection.select(this.TREE.currentIndex);
		this.rebuild();
		this._changed = true;
	},
	dragDropObserver :{
		onDragStart : function(event, transferData, action){
			try{
				var row = bitsShortcutDialogOverlay.TREE.currentIndex;
				var results = bitsShortcutDialogOverlay.getTreeNodes();
				if(!results[row]) return null;
				var id = results[row].getAttribute("id");
				transferData.data = new TransferData();
				transferData.data.addDataForFlavour("moz/rdfitem", id);
			}catch(ex){
				bitsShortcutDialogOverlay._dump("dragDropObserver.onDragStart():"+ex);
			}
		},
		getSupportedFlavours : function(){
			var flavours = new FlavourSet();
			flavours.appendFlavour("moz/rdfitem");
			return flavours;
		},
		onDragOver : function(event, flavour, session){},
		onDragExit : function(event, session){},
		onDrop     : function(event, transferData, session){},
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop Old Callback functions
/////////////////////////////////////////////////////////////////////
	onOldDraggesture: function(aEvent){
		nsDragAndDrop.startDrag(aEvent,bitsShortcutDialogOverlay.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragover: function(aEvent){
		nsDragAndDrop.dragOver(aEvent,bitsShortcutDialogOverlay.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragdrop: function(aEvent){
		nsDragAndDrop.drop(aEvent,bitsShortcutDialogOverlay.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragexit: function(aEvent){
		nsDragAndDrop.dragExit(aEvent,bitsShortcutDialogOverlay.dragDropObserver);
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop New Callback functions
/////////////////////////////////////////////////////////////////////
	onDragEvents: function(aEvent){
		switch (aEvent.type) {
			case "dragstart":
				try{
					var row = bitsShortcutDialogOverlay.TREE.currentIndex;
					var results = bitsShortcutDialogOverlay.getTreeNodes();
					if(!results[row]) return null;
					var id = results[row].getAttribute("id");
					var transferData = aEvent.dataTransfer;
					transferData.setData("moz/rdfitem", id);
				}catch(ex){
					bitsShortcutDialogOverlay._dump("bitsShortcutDialogOverlay.onDragEvents().dragstart:"+ex);
				}
				break;
			case "drag":
			break;
			case "dragend":
			break;
		}
	},

	onDropEvents: function(aEvent){
		switch (aEvent.type) {
			case "dragenter":
			case "dragover":
				aEvent.preventDefault();
				break;
			case "drop":
				aEvent.preventDefault();
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		this.TREE.view = bitsShortcutDialogOverlay;
	},

/////////////////////////////////////////////////////////////////////
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onClick : function(aEvent){
		if(this.TREE.view.selection.count == 0){
			this.EDIT.setAttribute("disabled","true");
			this.DEL.setAttribute("disabled","true");
			return false;
		}
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false){
			this.EDIT.setAttribute("disabled","true");
			this.DEL.setAttribute("disabled","true");
			return false;
		}
		var results = this.getTreeNodes();
		if(!results[idxList[0]]){
			this.EDIT.setAttribute("disabled","true");
			this.DEL.setAttribute("disabled","true");
			return false;
		}
		this.EDIT.removeAttribute("disabled");
		if(idxList.length==1 && results[idxList[0]].getAttributeNS(this.namespace,"removed")=='false'){
			this.DEL.setAttribute("disabled","true");
		}else{
			this.DEL.removeAttribute("disabled");
		}
	},

	onDblClick : function(aEvent){
		var row = this.TREE.currentIndex;
		var results = this.getTreeNodes();
		if(!results[row]) return false;
		var disabled = (results[row].getAttributeNS(this.namespace,"disabled")=='true'?true:false);
		results[row].setAttributeNS(this.namespace,"disabled",(disabled?'false':'true'));
		this.rebuild();
		this._changed = true;
	},

	onAdd : function(aEvent){},

	onEdit : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		var row = this.TREE.currentIndex;
		var results = this.getTreeNodes();
		if(!results[row]) return false;
		var result = {
			accept  : false,
			title   : results[row].getAttributeNS(this.namespace,"title"),
			key     : results[row].getAttribute("key"),
			shift   : (results[row].getAttribute('shift') == 'true' ? true : false),
			alt     : (results[row].getAttribute('alt')   == 'true' ? true : false),
			accel   : (results[row].getAttribute('accel') == 'true' ? true : false),
			removed : (results[row].getAttributeNS(this.namespace,"removed")=='true'?true:false)
		};
		window.openDialog("chrome://markingcollection/content/shortcutProperty.xul", "", "chrome,centerscreen,modal", result);
		if(!result.accept) return false;
		delete result.accept;
		results[row].setAttributeNS(this.namespace,"title",result.title);
		results[row].setAttribute("key",result.key)
		results[row].setAttribute("shift",result.shift)
		results[row].setAttribute("alt",result.alt)
		results[row].setAttribute("accel",result.accel)
		this.rebuild();
		this._changed = true;
		return true;
	},

	onDel : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		if(!this.confirmRemovingFor()) return false;
		var results = this.getTreeNodes();
		var i;
		for(i=idxList.length-1;i>=0;i--){
			var row = idxList[i];
			if(!results[row]) continue;
			if(results[row].getAttributeNS(this.namespace,"removed")=='false') continue;
			this.xmldoc.removeChild(results[row]);
		}
		this.rebuild();
		this._changed = true;
		this.onClick(aEvent);
	},

	onDispTree : function(aEvent){
		nsPreferences.setBoolPref("wiredmarker.shortcut.tree_disp", this.DISP.checked);
	},
/////////////////////////////////////////////////////////////////////
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
			alert(this.STRING.getString("ERROR_MULTIPLE_SELECTION"));
			return false;
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		this._opener.top.bitsMarkingCollection._dump(aString);
	},
};
