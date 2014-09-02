var mcDatabaseDialog = {

	_xmlfile : null,
	_xmldoc  : null,
	_dbdir   : null,
	_app_version : 2,

/////////////////////////////////////////////////////////////////////
// プロパティ
/////////////////////////////////////////////////////////////////////
	get BrowserWindow() { return Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser"); },
	get Common()     { return mcDatabaseDialog.BrowserWindow.bitsObjectMng.Common;     },
	get XPath()      { return mcDatabaseDialog.BrowserWindow.bitsObjectMng.XPath;      },
	get Database()   { return mcDatabaseDialog.BrowserWindow.bitsObjectMng.Database;   },
		
	/*
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},
	*/

	get STRING()     { return document.getElementById("mcSettingString"); },

	get TREE()       { return document.getElementById("mcDatabaseTree"); },
	get MENU_ADD()   { return document.getElementById("mcDatabaseAdd"); },
	get MENU_SET()   { return document.getElementById("mcDatabaseSet"); },
	get MENU_DEL()   { return document.getElementById("mcDatabaseDel"); },
	get MENU_DIS()   { return document.getElementById("mcDatabaseDis"); },
	get CHK_UNUSED() { return document.getElementById("mcDatabaseStartupAllDBUnused"); },

	get PANEL()      { return document.getElementById("mcDatabaseTabPanel"); },

	get alldbunused(){ return nsPreferences.getBoolPref("wiredmarker.startup.alldbunused", false); },
	set alldbunused(aVal){
		var val = (aVal?true:false);
		nsPreferences.setBoolPref("wiredmarker.startup.alldbunused", val);
	},

/////////////////////////////////////////////////////////////////////
// メソッド
/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		try{
			var xmlfile = mcDatabaseDialog.Common.getExtensionDir().clone();
			xmlfile.append("db.xml");
			if(xmlfile.exists()){
				this._xmlfile = xmlfile;
				function _loadXMLDocument(pUri){
					if(pUri == undefined) return undefined;
					//var xmlDocument = window.opener.top.bitsMarkingCollection.loadXMLDocument(pUri);
					var xmlDocument = mcDatabaseDialog.BrowserWindow.bitsMarkingCollection.loadXMLDocument(pUri);
					
					return xmlDocument;
				}
				function _createXMLDocument(aXMLFile){
					if(!aXMLFile) return undefined;
					try{
						return _loadXMLDocument(mcDatabaseDialog.Common.IO.newFileURI(aXMLFile).spec);
					}catch(ex){
						mcDatabaseDialog._dump("mcDatabaseDialog._createXMLDocument():"+ ex);
						return undefined;
					}
				}
				this._xmldoc = _createXMLDocument(xmlfile);
			}
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			this._app_version = parseFloat(info.version);
		}catch(e){}
		if(!this._xmldoc) return;
		this.CHK_UNUSED.checked = this.alldbunused;
		this.rebuild();
		this.TREE.addEventListener("click", this.onClick, false);
		this.TREE.addEventListener("dblclick", this.onDblClick, false);
		this.PANEL.addEventListener("command", this.eventListener, false);
		if(this._app_version<3.1){
			this.TREE.addEventListener("draggesture", mcDatabaseDialog.onOldDraggesture, false);
			this.TREE.addEventListener("dragover", mcDatabaseDialog.onOldDragover, false);
			this.TREE.addEventListener("dragdrop", mcDatabaseDialog.onOldDragdrop, false);
			this.TREE.addEventListener("dragexit", mcDatabaseDialog.onOldDragexit, false);
		}else{
			this.TREE.addEventListener("dragstart", mcDatabaseDialog.onDragEvents, false);
			this.TREE.addEventListener("drag", mcDatabaseDialog.onDragEvents, false);
			this.TREE.addEventListener("dragend", mcDatabaseDialog.onDragEvents, false);
			this.TREE.addEventListener("dragenter", mcDatabaseDialog.onDropEvents, false);
			this.TREE.addEventListener("dragover", mcDatabaseDialog.onDropEvents, false);
			this.TREE.addEventListener("dragleave", mcDatabaseDialog.onDropEvents, false);
			this.TREE.addEventListener("drop", mcDatabaseDialog.onDropEvents, false);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		if(this._app_version<3.1){
			this.TREE.removeEventListener("draggesture", mcDatabaseDialog.onOldDraggesture, false);
			this.TREE.removeEventListener("dragover", mcDatabaseDialog.onOldDragover, false);
			this.TREE.removeEventListener("dragdrop", mcDatabaseDialog.onOldDragdrop, false);
			this.TREE.removeEventListener("dragexit", mcDatabaseDialog.onOldDragexit, false);
		}else{
			this.TREE.removeEventListener("dragstart", mcDatabaseDialog.onDragEvents, false);
			this.TREE.removeEventListener("drag", mcDatabaseDialog.onDragEvents, false);
			this.TREE.removeEventListener("dragend", mcDatabaseDialog.onDragEvents, false);

			this.TREE.removeEventListener("dragenter", mcDatabaseDialog.onDropEvents, false);
			this.TREE.removeEventListener("dragover", mcDatabaseDialog.onDropEvents, false);
			this.TREE.removeEventListener("dragleave", mcDatabaseDialog.onDropEvents, false);
			this.TREE.removeEventListener("drop", mcDatabaseDialog.onDropEvents, false);
		}
		this._xmldoc = undefined;
		this._xmlfile = undefined;
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowCount(){
		var count = 0;
		var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE[@hidden="false"]', this._xmldoc);
		if(xPathResult) count = xPathResult.snapshotLength;
		xPathResult = undefined;
		return count;
	},
	getCellText : function(row,column){
		var celltext = "";
		var dbNode = this.getNodeFromXML(row);
		var dataNode = dbNode.getElementsByTagName(column.id)[0];
		if(dataNode) celltext = dataNode.textContent;
		if(column.id == "DATABASE_DEFAULT") celltext = "";
		if(column.id == "DATABASE_STATUS"){
			var disabled = dbNode.getAttribute("disabled");
			if(!disabled || disabled == "false"){
				celltext = this.STRING.getString("MSG_DATABASE_USE");
			}
		}
		return celltext;
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(){ return false; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,column){
		if(column.id == "DATABASE_DEFAULT"){
			var dbNode = this.getNodeFromXML(row);
			var db_default = dbNode.getAttribute("db_default");
			return db_default == "true" ? "chrome://markingcollection/skin/radio-check.gif" : null;
		}else if(column.id == "DATABASE_TITLE"){
			var dbNode = this.getNodeFromXML(row);
			var dataNode = dbNode.getElementsByTagName("DATABASE_ICON")[0];
			return dataNode?dataNode.textContent:null;
		}else{
			return null;
		}
	},
	getRowProperties: function(row,props){},
	getCellProperties: function(row, column, prop) {
		if(column.id == "DATABASE_TITLE"){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
//			prop.Clear();
			prop.AppendElement(aserv.getAtom("Name"));
		}
	},
	getColumnProperties: function(column, element, prop) {},
	cycleHeader : function(col){},
	setCellText : function(row,column,text){},
	canDrop : function(row, orient){return true;},
  getParentIndex: function(idx) { return -1; },
	drop : function(row, orient){
//		mcDatabaseDialog._dump("drop():row=["+row+"]:orient=["+orient+"]");
		mcDatabaseDialog._drop(row, orient);
	},
	_drop : function(row, orient){
		if(orient>0) row++;
		if(row>=this.rowCount) row = this.rowCount-1;
		var dropnode = this.getNodeFromXML(row);
		if(!dropnode) return;
		var dragnode = this.getNodeFromXML();
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
		this.saveXML();
		this.rebuild();
	},

	dragDropObserver :{
		onDragStart : function(event, transferData, action){
//			mcDatabaseDialog._dump("dragDropObserver.onDragStart()");

			try{
				var id = mcDatabaseDialog.getIdFromXML();
				transferData.data = new TransferData();
				transferData.data.addDataForFlavour("moz/rdfitem", id);
			}catch(ex){
				mcDatabaseDialog._dump("dragDropObserver.onDragStart():"+ex);
			}


		},
		getSupportedFlavours : function(){
//			mcDatabaseDialog._dump("dragDropObserver.getSupportedFlavours()");
			var flavours = new FlavourSet();
			flavours.appendFlavour("moz/rdfitem");
//			flavours.appendFlavour("text/x-moz-url");
//			flavours.appendFlavour("text/html");
//			flavours.appendFlavour("text/xml");
//			flavours.appendFlavour("application/x-moz-url");
//			flavours.appendFlavour("application/x-moz-file","nsIFile");
//			flavours.appendFlavour("text/unicode");
			return flavours;
		},
		onDragOver : function(event, flavour, session){
//			mcDatabaseDialog._dump("dragDropObserver.onDragOver():flavour=["+flavour.contentType+"]");
			return;
			var row = {};
			var col = {};
			var obj = {};
			mcTreeHandler.TREE.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, obj);


			var aRow = row.value;
			if(aRow == undefined) return;
			if(aRow < 0) return;
			return;


			if(!mcTreeHandler.TREE.view.isContainer(aRow)) return;
			var isContainerOpen = mcTreeHandler.TREE.view.isContainerOpen(aRow);
			if(isContainerOpen) return;
			mcTreeDNDHandler.folderAutoOpenRow = aRow;
		},
		onDragExit : function(event, session){
//			mcDatabaseDialog._dump("dragDropObserver.onDragExit()");
			return;
			mcTreeDNDHandler.folderAutoOpenRow = -1;
			_dump("dragDropObserver.onDragExit()");
		},
		onDrop     : function(event, transferData, session){
//			mcDatabaseDialog._dump("dragDropObserver.onDrop()");
		},
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop Old Callback functions
/////////////////////////////////////////////////////////////////////
	onOldDraggesture: function(aEvent){
		nsDragAndDrop.startDrag(aEvent,mcDatabaseDialog.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragover: function(aEvent){
		nsDragAndDrop.dragOver(aEvent,mcDatabaseDialog.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragdrop: function(aEvent){
		nsDragAndDrop.drop(aEvent,mcDatabaseDialog.dragDropObserver);
		aEvent.stopPropagation();
	},
	onOldDragexit: function(aEvent){
		nsDragAndDrop.dragExit(aEvent,mcDatabaseDialog.dragDropObserver);
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop New Callback functions
/////////////////////////////////////////////////////////////////////
	onDragEvents: function(aEvent){
		switch (aEvent.type) {
			case "dragstart":
				try{
					var id = mcDatabaseDialog.getIdFromXML();
					var transferData = aEvent.dataTransfer;
					transferData.setData("moz/rdfitem", id);
				}catch(ex){
					mcDatabaseDialog._dump("mcDatabaseDialog.onDragEvents().dragstart:"+ex);
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
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onClick: function(aEvent){
		if(aEvent && aEvent.button != 0){
			aEvent.stopPropagation();
			return;
		}
		mcDatabaseDialog._onClick(aEvent);
	},
	_onClick: function(aEvent){
//		this._dump("_onClick():this.TREE.view.selection.count="+this.TREE.view.selection.count);
//		this._dump("_onClick():this.TREE.currentIndex="+this.TREE.currentIndex);

		var disabled = (this.TREE.view.selection.count<=0 || this.TREE.currentIndex < 0 || this.TREE.currentIndex >= this.TREE.view.rowCount) ? 3 : 0;
		if(!disabled){
			var id = this.getIdFromXML();
			if(id && id == "local") disabled |= 2;
//			var db_default = this.getDefaultFromXML();
//			if(db_default) disabled |= 2;
		}
		this.disabledMenu(disabled);
	},

	onDblClick: function(aEvent){
		if(aEvent && aEvent.button != 0){
			aEvent.stopPropagation();
			return;
		}
		mcDatabaseDialog._onDblClick(aEvent);
	},
	_onDblClick: function(aEvent){
		if(this.MENU_DIS.disabled) return;
		this._onCommandDis(aEvent);
	},

/////////////////////////////////////////////////////////////////////
// MENU イベント関連
/////////////////////////////////////////////////////////////////////
	eventListener : function(aEvent){
//mcDatabaseDialog._dump("onCommand():aEvent="+aEvent.type);
//mcDatabaseDialog._dump("onCommand():aEvent="+aEvent.target.id);
		switch(aEvent.type){
			case "command" :
				mcDatabaseDialog.onCommand(aEvent);
				break;
			default :
				break;
		}
	},

	onCommand : function(aEvent){
		if(aEvent.target && aEvent.target.id){
			switch(aEvent.target.id){
				case "mcDatabaseAdd":
					this._onCommandAdd(aEvent);
					break;
				case "mcDatabaseSet":
					this._onCommandSet(aEvent);
					break;
				case "mcDatabaseDel":
					this._onCommandDel(aEvent);
					break;
				case "mcDatabaseDis":
					this._onCommandDis(aEvent);
					break;
				case "mcDatabaseStartupAllDBUnused":
					this._onCommandStartupAllDBUnused(aEvent);
					break;
				default:
					break;
			}
		}
	},
	_onCommandAdd : function(aEvent){
//		this._dump("_onCommandAdd():this.TREE.view.selection.count="+this.TREE.view.selection.count);
//		this._dump("_onCommandAdd():this.TREE.currentIndex="+this.TREE.currentIndex);

		if(!this._dbdir) this._dbdir = this._xmlfile.parent.clone();

		var dbfile = null;
		var appname = this.STRING.getString("APP_TITLE").toLowerCase();
		var filename = "";
		var cnt;
		for(cnt=0;;cnt++){
			dbfile = this._dbdir.clone();
			filename = appname;
			if(cnt) filename += "(" + cnt + ")";
			dbfile.append(filename + ".sqlite");
			if(!dbfile.exists()) break;
		}
		var dbfileURL = this.getNewDataFile(filename);
		if(!dbfileURL) return;
		_dump('_onCommandAdd');
//		this._dump("_onCommandAdd():dbfileURL="+dbfileURL.spec);
//		this._dump("_onCommandAdd():dbfileURL="+dbfileURL);

		setTimeout(function(){ mcDatabaseDialog.checkUseDataFile(dbfileURL); },0);

	},

	_onCommandSet : function(aEvent){
//		this._dump("_onCommandSet():this.TREE.view.selection.count="+this.TREE.view.selection.count);
//		this._dump("_onCommandSet():this.TREE.currentIndex="+this.TREE.currentIndex);
		this.openSetting();
	},

	_onCommandDel : function(aEvent){

		var disabled = this.MENU_DEL.getAttribute("disabled");
		if(disabled == "true") return;

//		this._dump("_onCommandDel():this.TREE.view.selection.count="+this.TREE.view.selection.count);
//		this._dump("_onCommandDel():this.TREE.currentIndex="+this.TREE.currentIndex);

		var dbNode = this.getNodeFromXML();

		var dbtype = null;
		try{ dbtype = dbNode.getElementsByTagName("DATABASE_DBTYPE")[0].textContent; }catch(ex){}
		if(dbtype){
			this.Database.done(dbtype);
		}

//		if(dbNode.nextSibling.nodeName == "#text")     dbNode.parentNode.removeChild(dbNode.nextSibling);
//		if(dbNode.previousSibling.nodeName == "#text") dbNode.parentNode.removeChild(dbNode.previousSibling);
//		dbNode.parentNode.removeChild(dbNode);

		dbNode.setAttribute("disabled",true);
		dbNode.setAttribute("hidden",true);
		dbNode.setAttribute("db_contextmenu",false);

		this.saveXML();

		this.rebuild();
		if(this.TREE.currentIndex >= this.TREE.view.rowCount){
			this.TREE.currentIndex = (this.TREE.view.rowCount>0?this.TREE.view.rowCount-1:-1);
			if(this.TREE.currentIndex<0){
				this.TREE.view.selection.clearSelection();
			}else{
				this.TREE.view.selection.select(this.TREE.currentIndex);
			}
		}
		this._onClick();
	},

	_onCommandDis : function(aEvent){
//		this._dump("_onCommandDis():this.TREE.view.selection.count="+this.TREE.view.selection.count);
//		this._dump("_onCommandDis():this.TREE.currentIndex="+this.TREE.currentIndex);

		var dbNode = this.getNodeFromXML();
		var disabled = dbNode.getAttribute("disabled");
		if(!disabled || disabled == "false"){
			dbNode.setAttribute("disabled",true);
			dbNode.setAttribute("db_contextmenu",false);
		}else{
			dbNode.removeAttribute("disabled");
			dbNode.setAttribute("db_contextmenu",true);
		}

		this.saveXML();

		this.rebuild();
	},

	_onCommandStartupAllDBUnused : function(aEvent){
		this.alldbunused = this.CHK_UNUSED.checked;
	},

/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		this.TREE.view = mcDatabaseDialog;
	},

/////////////////////////////////////////////////////////////////////
	getRootNodeFromXML : function(){
		var xPathResult = this.XPath.evaluate('/DATABASES[1]', this._xmldoc);
		if(!xPathResult) return undefined;
		return xPathResult.snapshotItem(0);
	},

/////////////////////////////////////////////////////////////////////
	getNodeFromXML : function(aRow){
		if(aRow == undefined) aRow = this.TREE.currentIndex;
		var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE[@hidden="false"]', this._xmldoc);
		if(xPathResult && xPathResult.snapshotLength>0){
			return xPathResult.snapshotItem(aRow);
		}else{
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	getIdFromXML : function(){
		var dbNode = this.getNodeFromXML();
		return dbNode.getAttribute("id");
	},

/////////////////////////////////////////////////////////////////////
	getDefaultFromXML : function(){
		var dbNode = this.getNodeFromXML();
		return dbNode.getAttribute("db_default")=="true"?true:false;
	},

/////////////////////////////////////////////////////////////////////
	disabledMenu : function(aDisabled){
		if(aDisabled & 1){
			this.MENU_SET.setAttribute("disabled", true);
			this.MENU_DIS.setAttribute("disabled", true);
		}else{
			this.MENU_SET.removeAttribute("disabled");
			this.MENU_DIS.removeAttribute("disabled");
		}

		if(aDisabled & 2){
			this.MENU_DEL.setAttribute("disabled", true);
		}else{
			this.MENU_DEL.removeAttribute("disabled");
		}
	},

/////////////////////////////////////////////////////////////////////
	getNewDataFile : function (aTitle){
		var result = null;
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var pickerMode;
		
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var check = {value: false};
		var flags = prompts.BUTTON_TITLE_YES * prompts.BUTTON_POS_0 + prompts.BUTTON_TITLE_IS_STRING  * prompts.BUTTON_POS_1 + prompts.BUTTON_TITLE_NO * prompts.BUTTON_POS_2;
		var button = prompts.confirmEx(window, this.STRING.getString("MSG_ADD_DATAFILE"), this.STRING.getString("CONFIRM_NEW_DATAFILE"), flags, "Button 0", this.STRING.getString("MSG_EXISTING_DATABASE"), "Button 2", null, check);
		if(button == 0){
			pickerMode = picker.modeSave;
		}else if(button == 1){
			pickerMode = picker.modeOpen;
		}else{
			return;
		}
		try{
			picker.init(window, "Selected File", pickerMode);
			if(aTitle && pickerMode != picker.modeOpen) picker.defaultString  = aTitle + ".sqlite";
			picker.defaultExtension = ".sqlite";
			picker.displayDirectory = (this._dbdir?this._dbdir:this._xmlfile.parent);
			picker.appendFilter(this.STRING.getString("MSG_DATAFILE") + " (*.sqlite)","*.sqlite");
			picker.appendFilter("All Files (*.*)","*.sqlite");
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				result = picker.fileURL;
			}else if(showResult == picker.returnReplace){
				if(picker.file.exists()) picker.file.remove(false);
				result = picker.fileURL;
			}
		}catch(e){
			result = null;
			this.Common.alert(e);
		}
		if(result && !result.file){
			result = result.QueryInterface(Components.interfaces.nsIURL);
			result = result.QueryInterface(Components.interfaces.nsIFileURL);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	checkUseDataFile : function (aURL){
		_dump("checkUseDataFile:START");
		try{
		if(!aURL) return;
		var msg  = this.STRING.getString("MSG_DATAFILE") +  "[" + this.Common.splitFileName(aURL.file.leafName)[0] + "]\n\n";
		msg += this.STRING.getString("ERROR_ADD_DATAFILE_3");

		var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE[@hidden="false"]/DATABASE_FILE', this._xmldoc);
		if(xPathResult){
			_dump("checkUseDataFile:1");
			var ncnt;
			for(ncnt=0;ncnt<xPathResult.snapshotLength;ncnt++){
				var node = xPathResult.snapshotItem(ncnt);
				if(!node || node.textContent != aURL.spec) continue;

				var nameNode = node.parentNode.getElementsByTagName("DATABASE_TITLE")[0];
				if(nameNode){
					msg  = this.STRING.getString("MSG_DATAFILE") +  "[" + this.Common.splitFileName(aURL.file.leafName)[0] + "]\n";
					msg += this.STRING.getString("MSG_USE_TITLE") +  "[" + nameNode.textContent + "]\n\n";
					msg += this.STRING.getString("ERROR_ADD_DATAFILE_3");
				}

				aURL = undefined;
				break;
			}
		}
		if(!aURL){
			_dump("checkUseDataFile:2");
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			var check = {value: false};
			var flags = prompts.BUTTON_TITLE_YES * prompts.BUTTON_POS_0 + prompts.BUTTON_TITLE_NO  * prompts.BUTTON_POS_1;
			var button = prompts.confirmEx(window, this.STRING.getString("MSG_ADD_DATAFILE"), msg, flags, "Button 0", "Button 1", "Button 2", null, check);
			if(button == 0) setTimeout(function(){ mcDatabaseDialog._onCommandAdd(); },0);
		}else{
			_dump("checkUseDataFile:3");
			var timeStamp = this.Common.getTimeStamp();
			var newNode = true;
			var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE[@hidden="true"]/DATABASE_FILE', this._xmldoc);
			if(xPathResult){
				var ncnt;
				for(ncnt=0;ncnt<xPathResult.snapshotLength;ncnt++){
					var node = xPathResult.snapshotItem(ncnt);
					if(node && node.textContent == aURL.spec) break;
				}
				if(ncnt<xPathResult.snapshotLength){
					var lastNode = null;
					var xPathResultT = this.XPath.evaluate('/DATABASES[1]/DATABASE[@hidden="false"]', this._xmldoc);
					if(xPathResultT && xPathResultT.snapshotLength>0) lastNode = xPathResultT.snapshotItem(xPathResultT.snapshotLength-1);

					var node = xPathResult.snapshotItem(ncnt);
					var cloneNode = node.parentNode.cloneNode(true);
					node.parentNode.parentNode.removeChild(node.parentNode);

					cloneNode.setAttribute("disabled","true");
					cloneNode.setAttribute("hidden","false");
					cloneNode.setAttribute("db_order",timeStamp);

					if(lastNode){
						var nextSibling = lastNode.nextSibling;
						while(nextSibling && nextSibling.nodeType != 1){
							nextSibling = nextSibling.nextSibling;
						}
						if(nextSibling){
							lastNode.parentNode.insertBefore(cloneNode,nextSibling);
						}else{
							lastNode.parentNode.appendChild(cloneNode);
						}
					}
					newNode = false;
				}
			}
			if(newNode){
				_dump("checkUseDataFile:4");
				var dbid = "local"+timeStamp;
				var rootNode = this.getRootNodeFromXML();

				var dbNode = this._xmldoc.createElement("DATABASE");
				dbNode.setAttribute("id",dbid);
				dbNode.setAttribute("disabled","true");
				dbNode.setAttribute("hidden","false");
				dbNode.setAttribute("db_order",timeStamp);
				rootNode.appendChild(dbNode)

				textNode = this._xmldoc.createTextNode("\n");
				rootNode.appendChild(textNode);

				var dbinfo = {
					title   : this.Common.splitFileName(aURL.file.leafName)[0],
					dbtype  : dbid,
					file    : aURL.spec,
					icon    : "chrome://markingcollection/skin/database.png",
					comment : null,
				};

				textNode = this._xmldoc.createTextNode("\n    ");
				dbNode.appendChild(textNode);

				var childNode = this._xmldoc.createElement("DATABASE_TITLE");
				textNode = this._xmldoc.createTextNode(dbinfo.title);
				childNode.appendChild(textNode);
				dbNode.appendChild(childNode);

				textNode = this._xmldoc.createTextNode("\n    ");
				dbNode.appendChild(textNode);

				childNode = this._xmldoc.createElement("DATABASE_DBTYPE");
				textNode = this._xmldoc.createTextNode(dbinfo.dbtype);
				childNode.appendChild(textNode);
				dbNode.appendChild(childNode);

				textNode = this._xmldoc.createTextNode("\n    ");
				dbNode.appendChild(textNode);

				childNode = this._xmldoc.createElement("DATABASE_FILE");
				textNode = this._xmldoc.createTextNode(dbinfo.file);
				childNode.appendChild(textNode);
				dbNode.appendChild(childNode);

				textNode = this._xmldoc.createTextNode("\n    ");
				dbNode.appendChild(textNode);

				childNode = this._xmldoc.createElement("DATABASE_ICON");
				textNode = this._xmldoc.createTextNode(dbinfo.icon);
				childNode.appendChild(textNode);
				dbNode.appendChild(childNode);

				textNode = this._xmldoc.createTextNode("\n  ");
				dbNode.appendChild(textNode);
			}
			this.rebuild();
			this.TREE.view.selection.select(this.TREE.view.rowCount-1);
			this._onClick();
			this._dbdir = aURL.file.parent.clone();
			setTimeout(function(){ mcDatabaseDialog.openSetting(dbinfo); },0);
		}
		}catch(e){
			alert(e);	
		}
		_dump("checkUseDataFile:END");
	},

/////////////////////////////////////////////////////////////////////
	openSetting : function (aDbinfo){
		
		try{
		
		var result = {};
		var newInfo = (aDbinfo?true:false);
		if(!aDbinfo){
			aDbinfo = {
				title   : null,
				dbtype  : null,
				file    : null,
				icon    : null,
				comment : null,
			};
			var dbNode = this.getNodeFromXML();
			try{ aDbinfo.title   = dbNode.getElementsByTagName("DATABASE_TITLE")[0].textContent; }catch(ex){this.Common.alert(ex)}
			try{ aDbinfo.dbtype  = dbNode.getElementsByTagName("DATABASE_DBTYPE")[0].textContent; }catch(ex){}
			try{ aDbinfo.file    = dbNode.getElementsByTagName("DATABASE_FILE")[0].textContent; }catch(ex){}
			try{ aDbinfo.icon    = dbNode.getElementsByTagName("DATABASE_ICON")[0].textContent; }catch(ex){}
			try{ aDbinfo.comment = dbNode.getElementsByTagName("DATABASE_COMMENT")[0].textContent; }catch(ex){}
			try{ aDbinfo.use     = (dbNode.getAttribute("disabled")=="true"?false:true); }catch(ex){}
			try{ aDbinfo.contextmenu = (dbNode.getAttribute("db_contextmenu")=="true"?true:false); }catch(ex){}
			try{ aDbinfo.default     = (dbNode.getAttribute("db_default")=="true"?true:false); }catch(ex){}
		}
		if(aDbinfo){
			var key;
			for(key in aDbinfo){
				result[key] = aDbinfo[key];
			}
		}
		result.accept = false;
		window.openDialog("chrome://markingcollection/content/databasePropDialog.xul", "", "chrome,centerscreen,modal", result);
		if(result.accept){
			var dbNode = this.getNodeFromXML();
			var key;
			for(key in result){
				if(aDbinfo[key] == result[key]) continue;
				if(key == "accept") continue;
				if(key == "default" && result[key]){
					var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE', this._xmldoc);
					if(xPathResult){
						var ncnt;
						for(ncnt=0;ncnt<xPathResult.snapshotLength;ncnt++){
							var node = xPathResult.snapshotItem(ncnt);
							if(!node) continue;
							node.removeAttribute("db_default");
						}
					}
					var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE/DATABASE_ICON', this._xmldoc);
					if(xPathResult){
						var ncnt;
						for(ncnt=0;ncnt<xPathResult.snapshotLength;ncnt++){
							var node = xPathResult.snapshotItem(ncnt);
							if(!node) continue;
							node.textContent = "chrome://markingcollection/skin/database.png";
						}
					}
					dbNode.setAttribute("db_default",result[key]);
					try{ dbNode.getElementsByTagName("DATABASE_ICON")[0].textContent = "chrome://markingcollection/skin/localfolder.png"; }catch(ex){}
					if(result[key]){
						result.use = true;
						dbNode.removeAttribute("disabled");
					}
					continue;
				}
				if(key == "contextmenu"){
					dbNode.setAttribute("db_contextmenu",result[key]);
					continue;
				}
				if(key == "use"){
					if(result[key]){
						dbNode.removeAttribute("disabled");
					}else{
						dbNode.setAttribute("disabled",true);
					}
					continue;
				}

				var tag = "DATABASE_" + key.toUpperCase();
				var node = dbNode.getElementsByTagName(tag)[0];
				if(result[key] && !node){

					var textNode = this._xmldoc.createTextNode("  ");
					dbNode.appendChild(textNode);

					node = this._xmldoc.createElement(tag);
					textNode = this._xmldoc.createTextNode(result[key]);
					node.appendChild(textNode);
					dbNode.appendChild(node);

					textNode = this._xmldoc.createTextNode("\n  ");
					dbNode.appendChild(textNode);

				}
				if(!result[key] && node){
					if(node.nextSibling .nodeName == "#text")    node.parentNode.removeChild(node.nextSibling );
					if(node.previousSibling.nodeName == "#text") node.parentNode.removeChild(node.previousSibling);
					node.parentNode.removeChild(node);
				}
				if(result[key] && node){
					var textNode = this._xmldoc.createTextNode(result[key]);
					node.replaceChild(textNode,node.firstChild);
				}
			}
			this.saveXML();
		}else{
			if(newInfo) this._onCommandDel();
		}

		this.rebuild();
		this._onClick();
		
		}catch(e){
			alert(e);
		}

	},

/////////////////////////////////////////////////////////////////////
	saveXML : function(){
		var xPathResult = this.XPath.evaluate('/DATABASES[1]/DATABASE', this._xmldoc);
		if(xPathResult){
			var ncnt;
			var db_order=0;
			for(ncnt=0;ncnt<xPathResult.snapshotLength;ncnt++){
				var node = xPathResult.snapshotItem(ncnt);
				if(!node) continue;
				node.setAttribute("db_order",++db_order);
				while(node.previousSibling && node.previousSibling.nodeName == "#text"){
					node.previousSibling.parentNode.removeChild(node.previousSibling);
				}
				while(node.nextSibling && node.nextSibling.nodeName == "#text"){
					node.nextSibling.parentNode.removeChild(node.nextSibling);
				}
				var textNode = this._xmldoc.createTextNode("\n  ");
				node.parentNode.insertBefore(textNode,node);

				textNode = this._xmldoc.createTextNode("\n");
				if(node.nextSibling){
					node.parentNode.insertBefore(textNode,node.nextSibling);
				}else{
					node.parentNode.appendChild(textNode);
				}
			}
		}
		var s = new XMLSerializer();
		var xml = s.serializeToString(this._xmldoc);
		this.Common.writeFile(this._xmlfile, xml+"\n", "UTF-8");
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(mcDatabaseDialog.Common.convertFormUnicode(aString,"Shift_jis")+"\n");
	},
};
