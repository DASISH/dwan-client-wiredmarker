var bitsShortcutService = {
	_xmlfilename : 'shortcut.xml',
	_xmlfolder : null,
	_xmlfile : null,
	_xmldoc : null,
	_shortcut_keyset_id  : 'bits_keyset_',
	_shortcut_keyset_number  : null,
	_shortcut_id  : 'bits_key_',
	_shortcut_app_key : 'X',
	_shortcut_app_id  : 'openMarkingCollection',
	_namespace    : 'http://www.bits.cc/Wired-Marker/',
	_ns_alias     : 'WM',

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

	get KEYSET() { return window.top.document.getElementById("mainKeyset"); },

	get xmldoc()        { return this._xmldoc; },
	get xmlfile()       { return this._xmlfile; },
	get namespace()     { return this._namespace; },
	get ns_alias()      { return this._ns_alias; },
	get confirmDelete() { return true; },
	get shortcut_app_id() { return this._shortcut_id+this._shortcut_app_id; },

/////////////////////////////////////////////////////////////////////
	init : function(){
		try{
			var extensionDir = this.Common.getExtensionDir().clone();
			if(extensionDir){
				this._xmlfolder = extensionDir;
				this._xmlfile = extensionDir.clone();
				this._xmlfile.append(this._xmlfilename);
				var defaultMode = this.Database._defaultMode;
				if(!this._xmlfile.exists()){
					var title = this.STRING.getString("APP_SHORTCUT_TITLE");
					var order = 0;
					order++;
					var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
					aContent += '<!DOCTYPE SHORTCUTS>\n<SHORTCUTS xmlns:WM="'+this.namespace+'">\n';
					aContent += '  <SHORTCUT id="'+this.shortcut_app_id+'" command="viewMarkingCollection" key="'+this._shortcut_app_key+'" shift="false" alt="true" access="false" '+this.ns_alias+':title="'+title+'" '+this.ns_alias+':disabled="false" '+this.ns_alias+':hidden="false" '+this.ns_alias+':removed="false"/>\n';
					aContent += '</SHORTCUTS>\n';
					this.Common.writeFile(this._xmlfile,aContent,"UTF-8");
				}
				if(this._xmlfile.exists()){
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
							return _loadXMLDocument(bitsShortcutService.Common.IO.newFileURI(aXMLFile).spec);
						}catch(ex){
							bitsShortcutService._dump("bitsMarkingCollection._createXMLDocument():"+ ex);
							return undefined;
						}
					}
					this._xmldoc = _createXMLDocument(this._xmlfile);
				}
			}
			this.gBrowser.addEventListener("keypress", this.onkeypress, false);
		}catch(e){
			this._dump("bitsShortcutService.init():"+e);
		}
		if(this.xmldoc && this.KEYSET){
			this._removeKeys();
			this._appendKeys();
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(){
		try{
			this.gBrowser.removeEventListener("keypress", this.onkeypress, false);
		}catch(e){
			this._dump("bitsShortcutService.done():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	onkeypress : function(aEvent){
		bitsShortcutService._onkeypress(aEvent);
	},

/////////////////////////////////////////////////////////////////////
	_onkeypress : function(aEvent){
		try{
			var win = this.Common.getFocusedWindow();
			var sel = win.getSelection();
			var isSelected = false;
			try{ isSelected = ( sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset ) ? false : true; }catch(e){}
			if(!isSelected) return;
		}catch(e){
			return;
		}
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var result = {
			key     : ""+String.fromCharCode(aEvent.charCode).toUpperCase(),
			shift   : aEvent.shiftKey,
			alt     : aEvent.altKey,
			accel   : (osString == "Darwin" ? aEvent.metaKey: aEvent.ctrlKey)
		};
		if(!result.key) return;
		var elemSCs =  this.evaluateArray('//SHORTCUT[@WM:hidden="false" and @WM:disabled="false" and @WM:removed="true" and @key="'+result.key+'" and @shift="'+result.shift+'" and @alt="'+result.alt+'" and @accel="'+result.accel+'"]');
		if(!elemSCs || elemSCs.length<=0) return;
		var param = {
			target : elemSCs[0]
		};
		this.oncommand(param);
		aEvent.preventDefault();
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	oncommand : function(aEvent){
		var win = this.Common.getFocusedWindow();
		var sel = win.getSelection();
		var isSelected = false;
		try{ isSelected = ( sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset ) ? false : true; }catch(e){}
		var fid = aEvent.target.getAttribute("fid");
		var fid_style = aEvent.target.getAttribute("style");
		var dbtype = aEvent.target.getAttribute("dbtype");
		if(fid != "" && dbtype != "" && isSelected){
			var newResArr =  bitsMarkingCollection.addSelectedText({fid:fid,fid_style:fid_style,dbtype:dbtype},-1);
			if(!newResArr) return;
			var mcTreeHandler = this.mcTreeHandler;
			var mcController = this.mcController;
			if(mcTreeHandler && mcController){
				mcController.rebuildLocal();
				var XferData = {};
				XferData.data = "";
				XferData.flavour = {};
				XferData.flavour.contentType = "text/x-moz-url";
				var XferDataSet = {};
				XferDataSet.first = {};
				XferDataSet.first.first = XferData;
				var row = mcTreeHandler.TREE.builderView.getIndexOfResource(newResArr[0]);
				if(row<0){
					var folderRes = bitsContextMenu.DataSource.findParentResource(newResArr[0]);
					row = mcTreeHandler.TREE.builderView.getIndexOfResource(folderRes);
				}
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	evaluateArray : function(aExpr) {
		return this.XPath.evaluateArray(aExpr,this.xmldoc);
	},

/////////////////////////////////////////////////////////////////////
	confirmRemovingFor : function(){
		try{
			if(bitsShortcutService.confirmDelete) return this.Common.confirm( this.STRING.getString("CONFIRM_DELETE") );
			return true;
		}catch(e){
			alert(e);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	getShortcut : function(aID,aDBType){
		var elemSCs =  this.evaluateArray('//SHORTCUT[@fid="'+aID+'" and @dbtype="'+aDBType+'"]');
		if(!elemSCs || elemSCs.length<=0) return undefined;
		var rtn = {};
		var attrs = elemSCs[0].attributes;
		for(var i=attrs.length-1;i>=0;i--){
			if(attrs[i].name == "WM:disabled"){
				rtn.disabled = (attrs[i].value=='true'?true:false);
			}else if(attrs[i].name.indexOf(this.ns_alias)==0){
				continue;
			}else if(attrs[i].value == 'true'){
				rtn[attrs[i].name] = true;
			}else if(attrs[i].value == 'false'){
				rtn[attrs[i].name] = false;
			}else{
				rtn[attrs[i].name] = attrs[i].value;
			}
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	setShortcut : function(aID,aDBType,aAttr){
		if(!aID||!aDBType||!aAttr) return;
		var elemSC;
		var elemSCs =  this.evaluateArray('//SHORTCUT[@fid="'+aID+'" and @dbtype="'+aDBType+'"]');
		if(!elemSCs || elemSCs.length<=0){
			elemSC = this.xmldoc.ownerDocument.createElement('SHORTCUT');
			elemSC.setAttributeNS(this.namespace,'disabled','false');
			elemSC.setAttributeNS(this.namespace,'hidden','false');
			elemSC.setAttributeNS(this.namespace,'removed','true');
			elemSC.setAttribute('id',this._shortcut_id+aID+'_'+aDBType);
			elemSC.setAttribute('fid',aID);
			elemSC.setAttribute('dbtype',aDBType);
			this.xmldoc.appendChild(elemSC);
		}else{
			elemSC = elemSCs[0];
		}
		if(!aAttr.key){
			elemSC.parentNode.removeChild(elemSC);
		}else{
			for(var key in aAttr){
				if(key == "disabled" || key == "title"){
					elemSC.setAttributeNS(this.namespace,key,aAttr[key]);
				}else{
					elemSC.setAttribute(key,aAttr[key]);
				}
			}
		}
		this._xmlflash();
	},

/////////////////////////////////////////////////////////////////////
	getAcceltext : function(aID,aDBType){
		return this._getAcceltext(this._shortcut_id+aID+'_'+aDBType);
	},

/////////////////////////////////////////////////////////////////////
	_getAcceltext : function(aID){
		var elemSCs =  this.evaluateArray('//SHORTCUT[@WM:hidden="false" and @WM:disabled="false" and @id="'+aID+'"]');
		if(!elemSCs || elemSCs.length<=0) return "";
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var acceltext = [];
		var sccnt=0;
		if(elemSCs[sccnt].getAttribute('accel') == 'true'){
			if(osString == "Darwin"){
				acceltext.push('Command');
			}else{
				acceltext.push('Ctrl');
			}
		}
		if(elemSCs[sccnt].getAttribute('shift') == 'true') acceltext.push('Shift');
		if(elemSCs[sccnt].getAttribute('alt') == 'true'){
			if(osString == "Darwin"){
				acceltext.push('Option');
			}else{
				acceltext.push('Alt');
			}
		}
		acceltext.push(elemSCs[sccnt].getAttribute('key'));
		return acceltext.join("+");
	},

/////////////////////////////////////////////////////////////////////
	_appendKeys : function(){
		if(!this.xmldoc || this._shortcut_keyset_number) return;
		var elemSCs =  this.evaluateArray('//SHORTCUT[@WM:hidden="false" and @WM:disabled="false"]');
		if(!elemSCs || elemSCs.length<=0){
			var acceltext = "";
			var menuitem1 = document.getElementById("bitsExecMenu");
			if(menuitem1) menuitem1.setAttribute("acceltext",acceltext);
			var menuitem2 = document.getElementById("viewSidebarMenu_bitsExecMenu");
			if(menuitem2) menuitem2.setAttribute("acceltext",acceltext);
			return;
		}
		this._shortcut_keyset_number = this.Common.getTimeStamp();
		var elemKeyset = document.documentElement.appendChild(document.createElement('keyset'));
		elemKeyset.setAttribute("id",this._shortcut_keyset_id+this._shortcut_keyset_number);
		var db_hash = {};
		var dbinfo = bitsMarkingCollection.dbinfo.getAllDBInfo();
		if(dbinfo){
			var i;
			for(i=0;i<dbinfo.length;i++){
				db_hash[""+dbinfo[i].database_dbtype] = dbinfo[i];
			}
		}
		var sccnt=0;
		for(sccnt=0;sccnt<elemSCs.length;sccnt++){
			elemSCs[sccnt].removeAttribute('meta');
			elemSCs[sccnt].removeAttribute('control');
			if(!elemSCs[sccnt].hasAttributes()) continue;
			var key = elemSCs[sccnt].getAttribute('key');
			if(!key || key == '') continue;
			var id = elemSCs[sccnt].getAttribute('id');
			if(!id || id == '') continue;
			if(id != this.shortcut_app_id) continue;
			var dbtype = elemSCs[sccnt].getAttribute('dbtype');
			if(dbtype && dbtype != ''){
				if(!db_hash[dbtype]) continue;
			}
			var elemKey = document.createElement("key");
			elemKey.setAttribute('id',id);
			var fid = elemSCs[sccnt].getAttribute('fid');
			if(fid && fid != '') elemKey.setAttribute('fid',fid);
			if(dbtype && dbtype != '') elemKey.setAttribute('dbtype',dbtype);
			if(elemKey.hasAttribute('fid') && elemKey.hasAttribute('dbtype')){
				elemKey.setAttribute('oncommand','bitsShortcutService.oncommand(event);');
			}
			var command = elemSCs[sccnt].getAttribute('command');
			if(command && command != '') elemKey.setAttribute('command',command);
			if(key && key != '') elemKey.setAttribute('key',key);
			var modifiers = [];
			if(elemSCs[sccnt].getAttribute('accel') == 'true') modifiers.push('accel');
			if(elemSCs[sccnt].getAttribute('shift') == 'true') modifiers.push('shift');
			if(elemSCs[sccnt].getAttribute('alt') == 'true') modifiers.push('alt');
			if(modifiers.length>0) elemKey.setAttribute('modifiers',modifiers.join(","));
			elemKeyset.appendChild(elemKey);
		}
		var elemKey = document.getElementById(this.shortcut_app_id);
		if(elemKey){
			var acceltext = this._getAcceltext(this.shortcut_app_id);
			var menuitem1 = document.getElementById("bitsExecMenu");
			if(menuitem1) menuitem1.setAttribute("acceltext",acceltext);
			var menuitem2 = document.getElementById("viewSidebarMenu_bitsExecMenu");
			if(menuitem2) menuitem2.setAttribute("acceltext",acceltext);
		}else{
			var acceltext = "";
			var menuitem1 = document.getElementById("bitsExecMenu");
			if(menuitem1) menuitem1.setAttribute("acceltext",acceltext);
			var menuitem2 = document.getElementById("viewSidebarMenu_bitsExecMenu");
			if(menuitem2) menuitem2.setAttribute("acceltext",acceltext);
		}
	},

/////////////////////////////////////////////////////////////////////
	_removeKeys : function(){
		if(!this.xmldoc || !this._shortcut_keyset_number) return;
		var elemKeyset = document.getElementById(this._shortcut_keyset_id+this._shortcut_keyset_number);
		if(!elemKeyset) return;
		var childNodes = elemKeyset.childNodes;
		var cnt;
		for(cnt=childNodes.length-1;cnt>=0;cnt--){
			elemKeyset.removeChild(childNodes[cnt]);
		}
		elemKeyset.parentNode.removeChild(elemKeyset);
		this._shortcut_keyset_number = null;
	},

/////////////////////////////////////////////////////////////////////
	xmlflash : function(aTimeout){
		try{
			if(!aTimeout) aTimeout = 0;
			var self = this;
			setTimeout(function(){ self._xmlflash(); },aTimeout);
		}catch(e){
			this._dump("bitsShortcutService.xmlflash():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_xmlflash : function(aTimeout){
		try{
			if(!this.xmldoc || !this.xmlfile) return;
			var s = new XMLSerializer();
			var xml = s.serializeToString(this.xmldoc);
			this.Common.writeFile(this.xmlfile, xml+"\n","UTF-8");
			this._removeKeys();
			this._appendKeys();
			if(this.mcTreeViewModeService) this.mcTreeViewModeService.showShortcutKey();
		}catch(e){
			this._dump("bitsShortcutService._xmlflash():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};


