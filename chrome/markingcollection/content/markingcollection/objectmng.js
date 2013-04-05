var bitsObjectMng = {
	uri       : "",
	_index_arr : null,
/////////////////////////////////////////////////////////////////////
	get STRING(){ return document.getElementById("ObjectManagerOverlayString"); },
	get NS_OBJECTMANAGEMENT(){
		return "http://www.bits.cc/Wired-Marker/wiredmarker-rdf#"
	},
	get editmodeid(){
		return "bitsExtentionEditMode";
	},
	get isEdit(){
		var doc = bitsObjectMng.getBrowser().contentDocument;
		var elem_edit = doc.getElementById(bitsObjectMng.editmodeid);
		return elem_edit?true:false;
	},
	set isEdit(pValue){
		var doc = bitsObjectMng.getBrowser().contentDocument;
		var elem_edit = doc.getElementById(bitsObjectMng.editmodeid);
		if(!elem_edit){
			var elem_body = doc.body;
			elem_edit = doc.createElement("span");
			elem_edit.setAttribute("id",bitsObjectMng.editmodeid);
			elem_body.appendChild(elem_edit);
		}
		return;
	},
/////////////////////////////////////////////////////////////////////
	init : function(){
		bitsObjectMng.DataSource.init();
	},
/////////////////////////////////////////////////////////////////////
	done : function(){
		bitsObjectMng.DataSource.save(bitsObjectMng.getBrowser().contentDocument);
		bitsObjectMng.DataSource.done();
	},

/////////////////////////////////////////////////////////////////////
	load : function(event){
		bitsObjectMng.DataSource.load(event);
	},

/////////////////////////////////////////////////////////////////////
	save : function(event){
		bitsObjectMng.DataSource.save(event);
	},

/////////////////////////////////////////////////////////////////////
	saveload : function(event){
		bitsObjectMng.DataSource.saveload(event);
	},

/////////////////////////////////////////////////////////////////////
	getBrowser : function(){
		return gBrowser;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)){
			window.dump(bitsObjectMng.Common.convertFormUnicode(aString,"UTF-8")+"\n");
			var dumpString = new String(aString);
			var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
			                      .getService(Components.interfaces.nsIConsoleService);
			aConsoleService.logStringMessage(dumpString);
		}
	},

/////////////////////////////////////////////////////////////////////
	_dump2 : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)){
			var dumpString = new String(aString);
			var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
			aConsoleService.logStringMessage(dumpString);
			window.dump(aString+"\n");
		}
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	Common : {

		get RDF()     { return Components.classes['@mozilla.org/rdf/rdf-service;1'].getService(Components.interfaces.nsIRDFService); },
		get RDFC()    { return Components.classes['@mozilla.org/rdf/container;1'].getService(Components.interfaces.nsIRDFContainer); },
		get RDFCU()   { return Components.classes['@mozilla.org/rdf/container-utils;1'].getService(Components.interfaces.nsIRDFContainerUtils); },
		get DIR()     { return Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties); },
		get IO()      { return Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService); },
		get UNICODE(){ return Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].getService(Components.interfaces.nsIScriptableUnicodeConverter); },
		get WINDOW()  { return Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator); },
		get PROMPT()  { return Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService); },
		get PREF()    { return Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch); },
		get JSSSL()   { return Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader); },
		get ENV()     { return Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment); },
		get FAVICON(){ return Components.classes["@mozilla.org/browser/favicon-service;1"].getService(Components.interfaces.nsIFaviconService); },
		get MIME()    { return Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService); },
		get STORAGE(){ return Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService); },
		get DNS()     { return Components.classes['@mozilla.org/network/dns-service;1'].getService(Components.interfaces.nsIDNSService); },
		get FONT()    { return Components.classes['@mozilla.org/gfx/fontenumerator;1'].getService(Components.interfaces.nsIFontEnumerator); },

/////////////////////////////////////////////////////////////////////
		newItem : function(aID){
			return {
				id          : aID || "",
				type        : "",
				title       : "",
				chars       : "",
				comment     : "" ,
				icon        : "",
				source      : "",
				uri         : "",
				style       : "",
				cssrule     : "",
				editmode    : "",
				pfid        : "",
				pfid_order  : "",
				dbtype      : "",
				addon_id    : "",
				contextmenu : "",
				shortcut    : ""
			};
		},

/////////////////////////////////////////////////////////////////////
		getExtensionDir : function(){
			var dir;
			try{
				var isDefault = this.PREF.getBoolPref("objectmng.data.default");
				dir = this.PREF.getComplexValue("objectmng.data.path", Components.interfaces.nsIPrefLocalizedString).data;
				dir = this.convertPathToFile(dir);
			}catch(ex){
				isDefault = true;
			}
			if(isDefault){
				dir = this.DIR.get("ProfD", Components.interfaces.nsIFile);
				dir.append("ObjectManagement");
				if(!dir.exists()){
					dir = this.DIR.get("ProfD", Components.interfaces.nsIFile);
					dir.append(bitsObjectMng.STRING.getString("APP_TITLE"));
				}
			}
			if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
			return dir;
		},

/////////////////////////////////////////////////////////////////////
		getContentDir : function(){
			var dir = this.getExtensionDir().clone();
			dir.append("data");
			if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
			return dir;
		},

/////////////////////////////////////////////////////////////////////
		getUser : function(){
			try{
				var user = this.ENV.get("USER");
				if(!user || user == "") user = this.ENV.get("USERNAME");
			}catch(ex){}
			return user;
		},

/////////////////////////////////////////////////////////////////////
		getHostname : function(){
			try{
				var user = this.ENV.get("HOSTNAME");
				if(!user || user == "") user = this.ENV.get("COMPUTERNAME");
			}catch(ex){}
			return user;
		},

/////////////////////////////////////////////////////////////////////
		getLang : function(){
			var LANG = "Shift_jis";
			try{
				var lang = this.ENV.get("LANG");
				if(lang && lang != "" && lang.match(/^ja_JP\.(.+)$/)) LANG = RegExp.$1;
			}catch(ex){}
			return LANG;
		},

/////////////////////////////////////////////////////////////////////
		alert : function(aMsg,aTitle,aWindow){
			if(aTitle == undefined) aTitle = bitsObjectMng.STRING.getString("APP_DISP_TITLE");
			if(aWindow == undefined) aWindow = window;
			this.PROMPT.alert(aWindow, aTitle, aMsg);
		},

/////////////////////////////////////////////////////////////////////
		confirm : function(aMsg,aTitle,aFlag,aCheckMsg,aCheckState,aWindow){
			var prompts = this.PROMPT;
			if(aTitle == undefined) aTitle = bitsObjectMng.STRING.getString("APP_DISP_TITLE");
			if(aFlag == undefined) aFlag = prompts.STD_YES_NO_BUTTONS + prompts.BUTTON_POS_1_DEFAULT;
			if(aCheckState == undefined) aCheckState = {value: false};
			if(aWindow == undefined) aWindow = window;
			var button = prompts.confirmEx(aWindow, aTitle, aMsg, aFlag, "", "", "", aCheckMsg, aCheckState);
			return button==0?true:false;
		},

/////////////////////////////////////////////////////////////////////
		prompt : function(aMsg,aTitle,aInput,aCheckMsg,aCheckState,aWindow){
			var prompts = this.PROMPT;
			if(aTitle == undefined) aTitle = bitsObjectMng.STRING.getString("APP_DISP_TITLE");
			if(aInput == undefined) aInput = {value: ""};
			if(aCheckState == undefined) aCheckState = {value: false};
			if(aWindow == undefined) aWindow = window;
			var result = prompts.prompt(aWindow, aTitle, aMsg, aInput, aCheckMsg, aCheckState);
			if(result){
				return {input:aInput.value,check:aCheckState.value};
			}else{
				return undefined;
			}
		},

/////////////////////////////////////////////////////////////////////
		removeDirSafety : function(aDir, check){
			var file;
			var rtn = true;
			try{
				if(check && !aDir.leafName.match(/^\d{14}$/)) return;
				var fileEnum = aDir.directoryEntries;
				while(fileEnum.hasMoreElements()){
					file = fileEnum.getNext().QueryInterface(Components.interfaces.nsIFile);
					if(file.isFile()) file.remove(false);
				}
				file = aDir;
				if(aDir.isDirectory()) aDir.remove(false);
			}catch(ex){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to remove file '" + file.leafName + "'.\n" + ex);
				rtn = false;
			}
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		getElemOffsetHeight : function(elem,height){
			if(!elem) return 0;
			if(!height) height = 0;
			if(height < elem.offsetHeight) height = elem.offsetHeight;
			for(var i=0;i<elem.childNodes.length;i++){
				var c_elem = elem.childNodes[i];
				if(c_elem.firstChild){
					height = this.getElemOffsetHeight(c_elem,height);
				}else{
					if(height < c_elem.offsetHeight) height = c_elem.offsetHeight;
				}
			}
			return height;
		},

/////////////////////////////////////////////////////////////////////
		getElementById : function(pElemId){
			try {
				if(!pElemId || pElemId=="") return null;
				var DOC = [];
				if(gBrowser.contentWindow.frames){
					for(var wincnt=0;wincnt<gBrowser.contentWindow.frames.length;wincnt++){
						DOC.push(gBrowser.contentWindow.frames[wincnt].document);
					}
				}
				DOC.push(gBrowser.contentDocument);
				var elem = null;
				var i;
				var doc;
				for(i=0;i<DOC.length;i++){
					doc = DOC[i];
					if(!doc) continue;
					elem = doc.getElementById(pElemId);
					if(elem) break;
				}
				return elem;
			}catch(ex){
				this._dump("bitsObjectMng.Common.getElementById():"+ex);
			}
		},

/////////////////////////////////////////////////////////////////////
		changeNodeStyleFromID : function(aSource,aStyle,pPfid,aID,aDBType){
			if(!aID) return;
			for(var i=0;i<gBrowser.browsers.length;i++){
				var contentDocument = gBrowser.browsers[i].contentDocument;
				var contentWindow = gBrowser.browsers[i].contentWindow;
				var i;
				var DOC = [];
				if(contentWindow.frames){
					for(var wincnt=0;wincnt<contentWindow.frames.length;wincnt++){
						DOC.push(contentWindow.frames[wincnt].document);
					}
				}
				DOC.push(contentDocument);
				for(var j=0;j<DOC.length;j++){
					var doc = DOC[j];
					var xPathResult = bitsObjectMng.XPath.evaluate('//*[@id="'+aSource+'"]', doc);
					for(var k=0;k<xPathResult.snapshotLength;k++){
						var node = xPathResult.snapshotItem(k);
						if(aID && aDBType) node.setAttribute("id",bitsMarker.id_key+aDBType+aID);
						if(pPfid) node.setAttribute("pfid",pPfid);
						if(aDBType) node.setAttribute("dbtype",aDBType);
						if(aStyle){
							node.setAttribute("style",aStyle);
						}else{
							node.removeAttribute("style");
						}
						if(aStyle && xPathResult.snapshotLength>1){
							if(k==0){
								node.style.borderRight = "";
							}else if(k==(xPathResult.snapshotLength-1)){
								node.style.borderLeft = "";
							}else{
								node.style.borderLeft = "";
								node.style.borderRight = "";
							}
						}
					}
				}
				DOC = undefined;
			}
		},

/////////////////////////////////////////////////////////////////////
		doTopElement : function(pElemId,aStyle,aID,aDBType){
			if(!pElemId || pElemId=="") return false;
			var elem = this.getElementById(pElemId);
			var rtnObj = null;
			if(!elem && aID){
				var DOC = [];
				if(gBrowser.contentWindow.frames){
					for(var wincnt=0;wincnt<gBrowser.contentWindow.frames.length;wincnt++){
						DOC.push(gBrowser.contentWindow.frames[wincnt].document);
					}
				}
				DOC.push(gBrowser.contentDocument);
				rtnObj = bitsObjectMng.Database.getObjectFormID(aID,aDBType);
				if(rtnObj){
					for(var cnt=0;cnt<rtnObj.length;cnt++){
						var rObj = rtnObj[cnt];
						var doc = null;
						for(var i=0;i<DOC.length;i++){
							if(rObj.con_url == bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(DOC[i]))){
								doc = DOC[i];
								break;
							}
						}
						if(doc) bitsMarker.xPathMarker(doc,{start:rObj.bgn_dom,end:rObj.end_dom,context:rObj.oid_txt,con_url:rObj.con_url}, { id:rObj.oid, dbtype:rObj.dbtype, pfid:rObj.pfid, style:rObj.fid_style });
					}
				}
				elem = this.getElementById(pElemId);
			}
			if(!elem) return false;
			var xPathResult = bitsObjectMng.XPath.evaluate('//*[@id="'+elem.id+'"]', elem.ownerDocument);
			var k;
			var node;
			var y_offs = -1;
			var y_offs_temp;
			var y_offs_elem = null;
			for(k=0;k<xPathResult.snapshotLength;k++){
				node = xPathResult.snapshotItem(k);
				y_offs_temp = this.getPageOffsetTop(node);
				if(y_offs == -1 || y_offs > y_offs_temp){
					y_offs = y_offs_temp;
					y_offs_elem = node;
				}
			}
			if(y_offs_elem) elem = y_offs_elem;
			if(y_offs < 0) y_offs = this.getPageOffsetTop( elem );
			var height = this.getElemOffsetHeight( elem );
			if(height>0){
				y_offs -= 15;
			}else{
				if(elem.offsetHeight == 0) y_offs -= 15;
			}
			if(aStyle) this.changeNodeStyleFromID(pElemId,aStyle,(rtnObj && rtnObj.pdif)?rtnObj.pfid:undefined,aDBType);
			var doc = elem.ownerDocument;
			var win = doc.defaultView;
			win.scroll( win.pageXOffset, y_offs );
			return true;
		},

/////////////////////////////////////////////////////////////////////
		doTopElementIMG : function(aID,aDBType){
			try{
				if(!aID || aID=="") return false;
				var elem = null;
				var rtnObj = null;
				if(!elem && aID){
					var DOC = [];
					if(gBrowser.contentWindow.frames){
						for(var wincnt=0;wincnt<gBrowser.contentWindow.frames.length;wincnt++){
							DOC.push(gBrowser.contentWindow.frames[wincnt].document);
						}
					}
					DOC.push(gBrowser.contentDocument);
					var doc = null;
					rtnObj = bitsObjectMng.Database.getObjectFormID(aID,aDBType);
					if(rtnObj){
						var cnt;
						var i;
						var rObj;
						for(cnt=0;cnt<rtnObj.length;cnt++){
							rObj = rtnObj[cnt];
							for(i=0;i<DOC.length;i++){
								if(rObj.con_url == bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(DOC[i]))){
									doc = DOC[i];
									break;
								}
							}
							if(doc) break;
						}
					}
					if(doc){
						var aXPath = {};
						rObj.bgn_dom.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
						aXPath.startPath   = RegExp.$1;
						aXPath.startOffset = RegExp.$2;
						aXPath.startType   = RegExp.$3;
						rObj.end_dom.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
						aXPath.endPath   = RegExp.$1;
						aXPath.endOffset = RegExp.$2;
						aXPath.endType   = RegExp.$3;
						if(rObj.bgn_dom != rObj.end_dom){
							var startNode = bitsObjectMng.XPath.getCurrentNodeFromXPath(doc,aXPath.startPath,aXPath.startOffset,aXPath.startType);
							if(!startNode || !startNode.node) return false;
							var endNode = bitsObjectMng.XPath.getCurrentNodeFromXPath(doc,aXPath.endPath,aXPath.endOffset,aXPath.endType);
							if(!endNode || !endNode.node) return false;
							var range = doc.createRange();
							try{
								range.setStart(startNode.node, startNode.offset);
								range.setEnd(endNode.node, endNode.offset);
							}catch(e){
								bitsObjectMng._dump("bitsObjectMng.Common.doTopElementIMG():"+e);
								return false;
							}
							var nodeWalker = doc.createTreeWalker(range.commonAncestorContainer,NodeFilter.SHOW_ELEMENT,null,false);
							if(nodeWalker){
								var txtNode=nodeWalker.nextNode();
								for(;txtNode;txtNode = nodeWalker.nextNode()){
									if(!range) continue;
									if(this.rangeCompareNode(range,txtNode) == 0) continue;
									if(this.rangeCompareNode(range,txtNode) == 1) break;
									if(txtNode.nodeName != "IMG") continue;
									if(txtNode.src != rObj.oid_txt) continue;
									elem = txtNode;
									break;
								}
							}
						}else{
							var startNode = bitsObjectMng.XPath.getCurrentNodeFromXPath(doc,aXPath.startPath,aXPath.startOffset,aXPath.startType);
							if(!startNode || !startNode.node) return false;
							elem = startNode.node;
						}
					}
				}
				if(!elem) return false;
				var y_offs = this.getPageOffsetTop( elem );
				var height = elem.offsetHeight;
				if(height>0){
					y_offs -= 15;
				}else{
					if(elem.offsetHeight == 0) y_offs -= 15;
				}
				var doc = elem.ownerDocument;
				var win;
				if(doc) win = doc.defaultView;
				if(win) win.scroll( win.pageXOffset, y_offs );
				return true;
			}catch(ex){
				this._dump("bitsObjectMng.Common.doTopElementIMG():"+ex);
			}
		},

/////////////////////////////////////////////////////////////////////
		pageshow : function(aDoc){
			var tab = gBrowser.selectedTab;
			if(!tab || !tab.hasAttribute("Wired-Marker:oid") || !tab.hasAttribute("Wired-Marker:pfid") || !tab.hasAttribute("Wired-Marker:dbtype")) return;

			var oid = tab.getAttribute("Wired-Marker:oid");
			var pfid = tab.getAttribute("Wired-Marker:pfid");
			var source = tab.getAttribute("Wired-Marker:source");
			var dbtype = tab.getAttribute("Wired-Marker:dbtype");
			var style = tab.getAttribute("Wired-Marker:style");

			var aObject = bitsObjectMng.Database.getObject({oid:oid,pfid:pfid}, dbtype)[0];
			if(aObject){
				if(aObject.doc_url != aObject.con_url && aObject.doc_url == bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(aDoc))){
					var frame_name;
					var frame_id;
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(aObject.oid_property,"text/xml");
					if(xmldoc){
						try{frame_name = xmldoc.getElementsByTagName("FRAME_NAME")[0].textContent;}catch(e){}
					}
					if(frame_name){
						var win = aDoc.defaultView;
						if(win.frames != null){
							var loadFlag = false;
							var i;
							for(i=0;i<win.frames.length;i++){
								if(win.frames[i].name != frame_name) continue;
								if(bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(win.frames[i].document)) == aObject.con_url) break;
								win.frames[i].document.location = aObject.con_url;
								loadFlag = true;
								break;
							}
							if(!loadFlag && frame_id){
								var nodes = bitsObjectMng.XPath.evaluate('//*[@id="'+frame_id+'"]',doc);
								if(nodes && nodes.snapshotLength == 1){
									frame_name = nodes.snapshotItem(0).name;
									for(i=0;i<win.frames.length;i++){
										if(win.frames[i].name != frame_name) continue;
										if(bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(win.frames[i].document)) == aObject.con_url) break;
										win.frames[i].document.location = aObject.con_url;
										loadFlag = true;
										break;
									}
								}
							}
							if(loadFlag){
								var tab = gBrowser.selectedTab;
								if(tab){
									tab.setAttribute("Wired-Marker:oid",id);
									tab.setAttribute("Wired-Marker:pfid",pfid);
									tab.setAttribute("Wired-Marker:dbtype",dbtype);
									tab.setAttribute("Wired-Marker:style",style);
									if(source) tab.setAttribute("Wired-Marker:source",source);
								}
								return;
							}
						}
					}
				}
			}
			var rtn = false;
			if(source){
				rtn = this.doTopElement(source,style,oid,dbtype);
			}else{
				rtn = this.doTopElementIMG(oid,dbtype)
			}
//bitsObjectMng._dump("pageshow():rtn=["+rtn+"]");
			if(rtn){
				tab.removeAttribute("Wired-Marker:oid");
				tab.removeAttribute("Wired-Marker:pfid");
				tab.removeAttribute("Wired-Marker:source");
				tab.removeAttribute("Wired-Marker:dbtype");
				tab.removeAttribute("Wired-Marker:style");
				var self = this;
				setTimeout(function(){
					if(source){
						rtn = self.doTopElement(source,style,oid,dbtype);
					}else{
						rtn = self.doTopElementIMG(oid,dbtype)
					}
				},2000);
			}
		},

/////////////////////////////////////////////////////////////////////
		loadFromObject : function(aObject, tabbed){
			var doc = gBrowser.contentDocument;
			var source;
			if(!aObject.oid_type.match(/^image\/(.+)$/)) source = bitsMarker.id_key+aObject.dbtype+aObject.oid;
			var id = aObject.oid;
			var pfid = aObject.pfid;
			var style = aObject.fid_style;
			var cur_uri = this.getURLStringFromDocument(doc);
			var res_uri = aObject.doc_url;
			var dbtype = aObject.dbtype;
			var location_hash = "";
			var logical_page = "";
			var physical_page = "";
			if(aObject && aObject.oid_property){
				try{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(aObject.oid_property,"text/xml");
					parser = undefined;
					if(xmldoc){
						var xmlnode = xmldoc.getElementsByTagName("LOCATION_HASH")[0];
						if(xmlnode) location_hash = xmlnode.textContent;
						if(aObject.oid_type.match(/^application\/pdf$/)){
							var xmlnode = xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
							if(xmlnode) logical_page = xmlnode.textContent;
							var xmlnode = xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
							if(xmlnode) physical_page = xmlnode.textContent;
						}
						xmldoc = undefined;
					}
				}catch(e){
					location_hash = "";
				}
			}
			var loadFlag = false;
			if(tabbed) loadFlag = tabbed;
			if(!tabbed){
				if(gBrowser.browsers.length == 1 && res_uri != "" && cur_uri != res_uri){
					loadFlag = true;
				}else if(cur_uri == res_uri){
					loadFlag = false;
					if(location_hash) doc.location.hash = location_hash;
				}else{
					loadFlag = true;
					var i;
					for(i=0;i<gBrowser.browsers.length;i++){
						var doc = gBrowser.browsers[i].contentDocument;
						var cur_uri = bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(doc));
						if(cur_uri == res_uri){
							loadFlag = false;
							gBrowser.tabContainer.selectedIndex = i;
							if(location_hash) doc.location.hash = location_hash;
							break;
						}
					}
				}
			}
			var pdf_hash = "";
			if(aObject.oid_type.match(/^application\/pdf$/)){
				if(logical_page != "" || physical_page != "") pdf_hash = "page="+logical_page; //+'&search="'+aObject.oid_title+'"';
				if(!loadFlag && pdf_hash != ""){
					var doc = gBrowser.contentDocument;
					doc.location.hash = pdf_hash;
					gBrowser.reload(true);
					return;
				}
			}
			var source_elem = this.getElementById(source);
//bitsObjectMng._dump("loadFromObject(1):loadFlag=["+loadFlag+"]");
//bitsObjectMng._dump("loadFromObject(1):source_elem=["+source_elem+"]");
			if(loadFlag){
				if(location_hash){
					res_uri += "#" + location_hash;
				}else if(pdf_hash){
					res_uri += "#" + pdf_hash;
				}
				var tab = this.loadURL(res_uri,tabbed);
				if(tab){
					tab.setAttribute("Wired-Marker:oid",id);
					tab.setAttribute("Wired-Marker:pfid",pfid);
					tab.setAttribute("Wired-Marker:dbtype",dbtype);
					tab.setAttribute("Wired-Marker:style",style);
					if(source) tab.setAttribute("Wired-Marker:source",source);
				}
				return;
			}
			var rtn = false;
			if(!source_elem){
				if(source && source != ""){
					rtn = this.doTopElement(source,style,id,dbtype);
				}else{
					rtn = this.doTopElementIMG(id,dbtype);
				}
			}
//bitsObjectMng._dump("loadFromObject(1):rtn=["+rtn+"]");
			if(!rtn){
				try{
					if(aObject){
						if(aObject.doc_url != aObject.con_url && aObject.doc_url == bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(doc))){
							var frame_name;
							var frame_id;
							var xmldoc;
							var parser = new DOMParser();
							if(aObject.oid_property) xmldoc = parser.parseFromString(aObject.oid_property,"text/xml");
							parser = undefined;
							if(xmldoc){
								try{
									var xmlnode = xmldoc.getElementsByTagName("FRAME_NAME")[0];
									if(xmlnode) frame_name = xmlnode.textContent;
									var xmlnode = xmldoc.getElementsByTagName("FRAME_ID")[0];
									if(xmlnode) frame_id = xmlnode.textContent;
								}catch(e){}
							}
//bitsObjectMng._dump("loadFromObject():frame_name=["+frame_name+"]");
//bitsObjectMng._dump("loadFromObject():frame_id=["+frame_id+"]");
							if(frame_name){
								var win = doc.defaultView;
								if(win.frames != null){
									var loadFlag = false;
									var i;
									for(i=0;i<win.frames.length;i++){
										if(win.frames[i].name != frame_name) continue;
										if(bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(win.frames[i].document)) == aObject.con_url) break;
										win.frames[i].document.location = aObject.con_url;
										loadFlag = true;
										break;
									}
//bitsObjectMng._dump("loadFromObject(2):loadFlag=["+loadFlag+"]");
									if(!loadFlag && frame_id){
										var nodes = bitsObjectMng.XPath.evaluate('//*[@id="'+frame_id+'"]',doc);
//bitsObjectMng._dump("loadFromObject(2):nodes=["+nodes+"]["+(nodes?nodes.snapshotLength:0)+"]");
										if(nodes && nodes.snapshotLength == 1){
											frame_name = nodes.snapshotItem(0).name;
//bitsObjectMng._dump("loadFromObject():frame_name=["+frame_name+"]");
											for(i=0;i<win.frames.length;i++){
//bitsObjectMng._dump("loadFromObject():win.frames["+i+"].name=["+win.frames[i].name+"]");
												if(win.frames[i].name != frame_name) continue;
												if(bitsAutocacheService.convertCacheURLToOriginalURL(this.getURLStringFromDocument(win.frames[i].document)) == aObject.con_url) break;
												win.frames[i].document.location = aObject.con_url;
												loadFlag = true;
												break;
											}
										}
									}
//bitsObjectMng._dump("loadFromObject(3):loadFlag=["+loadFlag+"]");
									if(loadFlag){
										var tab = gBrowser.selectedTab;
										if(tab){
											tab.setAttribute("Wired-Marker:oid",id);
											tab.setAttribute("Wired-Marker:pfid",pfid);
											tab.setAttribute("Wired-Marker:dbtype",dbtype);
											tab.setAttribute("Wired-Marker:style",style);
											if(source) tab.setAttribute("Wired-Marker:source",source);
										}
										return;
									}
								}
							}
						}
					}
				}catch(e){}
				if(source && source != ""){
					this.doTopElement(source,style,id,dbtype);
				}else{
					this.doTopElementIMG(id,dbtype);
				}
			}
		},

/////////////////////////////////////////////////////////////////////
		loadURL : function(aURL, tabbed){
			var win = this.WINDOW.getMostRecentWindow("navigator:browser");
			var browser = win.document.getElementById("content");
			if(tabbed) browser.selectedTab = browser.addTab('about:blank');
			browser.loadURI(aURL);
			return browser.selectedTab;
		},

/////////////////////////////////////////////////////////////////////
		getTimeStamp : function(advance){
			var dd = new Date;
			if(advance) dd.setTime(dd.getTime() + 100000 * advance);
			var y = dd.getFullYear();
			var m = dd.getMonth() + 1; if(m < 10) m = "0" + m;
			var d = dd.getDate();      if(d < 10) d = "0" + d;
			var h = dd.getHours();     if(h < 10) h = "0" + h;
			var i = dd.getMinutes();   if(i < 10) i = "0" + i;
			var s = dd.getSeconds();   if(s < 10) s = "0" + s;
			return y.toString() + m.toString() + d.toString() + h.toString() + i.toString() + s.toString();
		},

/////////////////////////////////////////////////////////////////////
		getFormatDate : function(){
			var dd = new Date;
			var y = dd.getFullYear();
			var m = dd.getMonth() + 1; if(m < 10) m = "0" + m;
			var d = dd.getDate();      if(d < 10) d = "0" + d;
			var h = dd.getHours();     if(h < 10) h = "0" + h;
			var i = dd.getMinutes();   if(i < 10) i = "0" + i;
			var s = dd.getSeconds();   if(s < 10) s = "0" + s;
			return  m.toString() + "/" + d.toString() + "/" + y.toString() + " " + h.toString() + ":" + i.toString() + ":" + s.toString();
		},

/////////////////////////////////////////////////////////////////////
		formatFileSize : function(aBytes){
			if(aBytes > 1000 * 1000){
				return this.divideBy100( Math.round( aBytes / 1024 / 1024 * 100 ) ) + " MB";
			}else if( aBytes == 0 ){
				return "0 KB";
			}else{
				var kbytes = Math.round( aBytes / 1024 );
				return (kbytes == 0 ? 1 : kbytes) + " KB";
			}
		},

/////////////////////////////////////////////////////////////////////
		divideBy100 : function(aInt){
			if(aInt % 100 == 0){
				return aInt / 100 + ".00";
			}else if(aInt % 10 == 0){
				return aInt / 100 + "0";
			}else{
				return aInt / 100;
			}
		},

/////////////////////////////////////////////////////////////////////
		getRootHref : function(aURLSpec){
			var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
			url.spec = aURLSpec;
			return url.scheme + "://" + url.host + "/";
		},

/////////////////////////////////////////////////////////////////////
		getBaseHref : function(sURI){
			try{
				var pos, base;
				base = ((pos = sURI.indexOf("?"))     != -1) ? sURI.substring(0, pos)   : sURI;
				base = ((pos = base.indexOf("#"))     != -1) ? base.substring(0, pos)   : base;
				base = ((pos = base.lastIndexOf("/")) != -1) ? base.substring(0, ++pos) : base;
				return base;
			}catch(e){
				bitsObjectMng._dump(bitsObjectMng.Common.getBaseHref.caller);
				throw new Error("bitsObjectMng.Common.getBaseHref():"+e);
			}
		},

/////////////////////////////////////////////////////////////////////
		getFileName : function(aURI){
			var pos, name;
			name = ((pos = aURI.indexOf("?"))     != -1) ? aURI.substring(0, pos) : aURI;
			name = ((pos = name.indexOf("#"))     != -1) ? name.substring(0, pos) : name;
			name = ((pos = name.lastIndexOf("/")) != -1) ? name.substring(++pos)  : name;
			return name;
		},

/////////////////////////////////////////////////////////////////////
		getFilesize : function(aFile){
			if(!aFile) return 0;
			if(aFile.isDirectory()){
				var size = 0;
				var entries = aFile.directoryEntries;
				while(entries.hasMoreElements()){
					var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					if(!entry.isDirectory()){
						size += this.getFilesize(entry);
					}else if(entry.isDirectory() && !entry.leafName.match(/^\./)){
						size += this.getFilesize(entry);
					}
				}
				return size;
			}else{
				return aFile.fileSize;
			}
		},

/////////////////////////////////////////////////////////////////////
		hasDirChilds : function(aDir){
			if(!aDir) return 0;
			if(aDir.isDirectory()){
				var size = 0;
				var entries = aDir.directoryEntries;
				while(entries.hasMoreElements()){
					var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					if(!entry.isDirectory()){
						return true;
					}else if(entry.isDirectory() && !entry.leafName.match(/^\./)){
						return true;
					}
				}
				return false;
			}else{
				return true;
			}
		},

/////////////////////////////////////////////////////////////////////
		copyDirChilds : function(aSrcDir,aDistDir){
			try{
				if(!aSrcDir || !aDistDir || !aSrcDir.exists()) return false;
				if(!aDistDir.exists()) aDistDir.create(aDistDir.DIRECTORY_TYPE, 0777);
				if(aSrcDir.isDirectory()){
					var size = 0;
					var entries = aSrcDir.directoryEntries;
					while(entries.hasMoreElements()){
						var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
						if(!entry.isDirectory()){
							var target = aDistDir.clone();
							target.append(entry.leafName);
							if(target.exists()) target.remove(true);
							try{
								var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
								istream.init(entry, -1, -1, false);
								var bstream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
								bstream.setInputStream(istream);
								var bytes = bstream.readBytes(bstream.available());
								var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
								stream.init(target, 0x04 | 0x08 | 0x20, 664, 0); // write, create, truncate
								stream.write(bytes, bytes.length);
								if(stream instanceof Components.interfaces.nsISafeOutputStream){
									stream.finish();
								}else{
									stream.close();
								}
							}catch(e){
								bitsObjectMng._dump("bitsObjectMng.Common.copyDirChilds():entry=["+entry.path+"]");
								bitsObjectMng._dump("bitsObjectMng.Common.copyDirChilds():target=["+target.path+"]["+ target.path.length +"]");
								bitsObjectMng._dump("bitsObjectMng.Common.copyDirChilds():"+e);
							}
						}else if(entry.isDirectory() && !entry.leafName.match(/^\./)){
							var cloneDir = aDistDir.clone();
							cloneDir.append(entry.leafName);
							if(!this.copyDirChilds(entry.clone(),cloneDir)) return false;
						}
					}
				}else{
					aSrcDir.copyTo(aDistDir,aSrcDir.leafName);
				}
				return true;
			}catch(e){
				throw new Error("bitsObjectMng.Common.copyDirChilds():"+e);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		splitFileName : function(aFileName){
			var pos = aFileName.lastIndexOf(".");
			var ret = [];
			if(pos != -1){
				ret[0] = aFileName.substring(0, pos);
				ret[1] = aFileName.substring(pos + 1, aFileName.length);
			}else{
				ret[0] = aFileName;
				ret[1] = "";
			}
			return ret;
		},

/////////////////////////////////////////////////////////////////////
		validateFileName : function(aFileName){
			aFileName = aFileName.replace(/[\"\?!~`]+/g, "");
			aFileName = aFileName.replace(/[\*\&]+/g, "+");
			aFileName = aFileName.replace(/[\\\/\|\:;]+/g, "-");
			aFileName = aFileName.replace(/[\<]+/g, "(");
			aFileName = aFileName.replace(/[\>]+/g, ")");
			aFileName = aFileName.replace(/[\s]+/g, "_");
			aFileName = aFileName.replace(/[%]+/g, "@");
			return aFileName;
		},

/////////////////////////////////////////////////////////////////////
		resolveURL : function(aBaseURL, aRelURL){
			try{
				var baseURLObj = this.convertURLToObject(aBaseURL);
				return baseURLObj.resolve(aRelURL);
			}catch(ex){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to resolve URL.[" + aBaseURL + "][" + aRelURL + "]");
				return aRelURL;
			}
		},

/////////////////////////////////////////////////////////////////////
		crop : function(aString, aMaxLength){
			return aString.length > aMaxLength ? aString.substring(0, aMaxLength) + "..." : aString;
		},

/////////////////////////////////////////////////////////////////////
		readFile : function(aFile){
			try{
				var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(aFile, 1, 0, false);
				var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
				sstream.init(istream);
				var content = sstream.read(sstream.available());
				sstream.close();
				istream.close();
				return content;
			}catch(ex){
				bitsObjectMng._dump("ObjectManagement ERROR: readFile():" + ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		writeFile : function(aFile, aContent, aChars){
			if(aFile.exists()) aFile.remove(false);
			try{
				aFile.create(aFile.NORMAL_FILE_TYPE, 0666);
				this.UNICODE.charset = aChars;
				aContent = this.UNICODE.ConvertFromUnicode(aContent);
				var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
				ostream.init(aFile, 2, 0x200, false);
				ostream.write(aContent, aContent.length);
				ostream.close();
			}catch(ex){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to write file: " + aFile.path + "["+ ex + "]");
			}
		},

/////////////////////////////////////////////////////////////////////
		writeIndexDat : function(aItem, aFile){
			if(!aFile){
				aFile = this.getContentDir(aItem.id).clone();
				aFile.append("index.dat");
			}
			var content = "";
			for(var prop in aItem){
				content += prop + "\t" + aItem[prop] + "\n";
			}
			this.writeFile(aFile, content, "UTF-8");
		},

/////////////////////////////////////////////////////////////////////
		saveUriToFile : function(aURISpec, aFile){
			if(aFile.exists()) return;
			var uri = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
			uri.spec = aURISpec;
			var WBP = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
			WBP.saveURI(uri, null, null, null, null, aFile);
		},

/////////////////////////////////////////////////////////////////////
		saveDataUrlToFile : function(aDataURL, aFile){
			var io = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			var source = io.newURI(aDataURL, "UTF8", null);
			var WBP = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
			WBP.persistFlags = WBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
			WBP.persistFlags |= WBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
			var progressListener = {
				onLocationChange : function(webProgress, request, location){},
				onProgressChange : function(webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress){},
				onSecurityChange : function(webProgress, request, state){},
				onStateChange    : function(webProgress, request, stateFlags, status){
					if((WBP.currentState & WBP.PERSIST_STATE_FINISHED)){
						if(aFile && aFile.exists()){
						}else if(status != 0){
						}
					}
				},
				onStatusChange   : function(webProgress, request, status, message){},
			};
			WBP.progressListener = progressListener;
			WBP.saveURI(source, null, null, null, null, aFile);
		},

/////////////////////////////////////////////////////////////////////
		getImageFromURL : function(aUrl, aFile){
			if(aUrl == undefined || aFile == undefined || aUrl == "") return false;
			try{
				var ioserv = this.IO;
				var channel = ioserv.newChannel(aUrl, 0, null);
				var stream = channel.open();
				if(channel instanceof Components.interfaces.nsIHttpChannel && channel.responseStatus >= 300 && channel.responseStatus <= 302){
					var Location = channel.getResponseHeader("Location");
					channel = ioserv.newChannel(Location, 0, null);
					stream = channel.open();
				}
				if(channel instanceof Components.interfaces.nsIHttpChannel && (channel.responseStatus != 200 || !channel.contentType.match(/^image\//))){
					if(aFile.exists()) aFile.remove(true);
					return false;
				}else if(!(channel instanceof Components.interfaces.nsIHttpChannel)){
					return false;
				}
				var bistream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
				bistream.setInputStream(stream);
				if(!aFile.exists()) aFile.create(aFile.NORMAL_FILE_TYPE, 0664);
				var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
				ostream.init(aFile, 0x04 | 0x08 | 0x20, 664, 0); // write, create, truncate
				var bostream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);
				bostream.setOutputStream(ostream);
				var size = 0;
				while(size = bistream.available()){
					bostream.writeBytes(bistream.readBytes(size), size);
				}
				ostream.close();
				return true;
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.Database.getImageFromURL():aUrl=["+aUrl+"]");
				bitsObjectMng._dump("bitsObjectMng.Database.getImageFromURL():"+e);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		convertFormUnicode : function(aString, aCharset){
			if(!aString) return "";
			try{
				this.UNICODE.charset = aCharset;
				aString = this.UNICODE.ConvertFromUnicode(aString);
			}catch(ex){}
			return aString;
		},

/////////////////////////////////////////////////////////////////////
		convertToUnicode : function(aString, aCharset){
			if(!aString) return "";
			try{
				this.UNICODE.charset = aCharset;
				aString = this.UNICODE.ConvertToUnicode(aString);
			}catch(ex){}
			return aString;
		},

/////////////////////////////////////////////////////////////////////
		exceptCode : function(aString,rString){
			if(rString == undefined) rString = " ";
			var replaceString = new String(aString);
			replaceString = replaceString.replace(/[\cA\cB\cC\cD\cE\cF\cG\cH\cI\cJ\cK\cL\cM\cN\cO\cP\cQ\cR\cS\cT\cU\cV\cW\cX\cY\cZ\c[\c\\\c]\c^\c_]/mg,rString);
			replaceString = replaceString.replace(/[\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f]/mg,rString);
			replaceString = replaceString.replace(/[\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/mg,rString);
			replaceString = replaceString.replace(/[\x7f]/mg,rString);
			return replaceString;
		},

/////////////////////////////////////////////////////////////////////
		convertPathToFile : function(aPath){
			var aFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			aFile.initWithPath(aPath);
			return aFile;
		},

/////////////////////////////////////////////////////////////////////
		convertFilePathToURL : function(aFilePath){
			var tmpFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			tmpFile.initWithPath(aFilePath);
			return this.IO.newFileURI(tmpFile).spec;
		},

/////////////////////////////////////////////////////////////////////
		convertURLToObject : function(aURLString){
			var aURI = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
			aURI.spec = aURLString;
			return aURI;
		},

/////////////////////////////////////////////////////////////////////
		convertURLToFile : function(aURLString){
			var aURL = this.convertURLToObject(aURLString);
			if(!aURL.schemeIs("file")) return undefined;
			try{
				var fileHandler = this.IO.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
				return fileHandler.getFileFromURLSpec(aURLString);
			}catch(ex){
				return undefined;
			}
		},

/////////////////////////////////////////////////////////////////////
		getURLStringFromDocument : function(aDocument){
			if(!aDocument || !aDocument.location) return "";
			var location = aDocument.location;
			try{
				return location.protocol + "//" + location.host +location.pathname + location.search;
			}catch(ex){
				return location.href;
			}
		},

/////////////////////////////////////////////////////////////////////
		getURLHashStringFromDocument : function(aDocument){
			if(!aDocument || !aDocument.location) return "";
			var location = aDocument.location;
			try{
				var hash = location.toString();
				var hash_index = hash.indexOf("#");
				if(hash_index>=0){
					return hash.substr(hash_index).replace(/#hyperanchor.*$/g,"").replace(/^#/,"");
				}else{
					return "";
				}
			}catch(ex){
				return "";
			}
		},

/////////////////////////////////////////////////////////////////////
		getChromeImageURI : function(aURI){
			try{
				var channel = this.IO.newChannelFromURI(aURI);
				var stream  = channel.open();
				var bstream = Components.classes['@mozilla.org/binaryinputstream;1'].createInstance(Components.interfaces.nsIBinaryInputStream);
				bstream.setInputStream(stream);
				var len = stream.available();
				var bytes = bstream.readByteArray(len);
				bstream.close();
				stream.close();
				var mime = this.MIME.getTypeFromURI(aURI);
				var images = String.fromCharCode.apply(String, bytes);
				var image_b64 = btoa(images);
				var dataUri = 'data:' + mime +';base64,' + image_b64;
				return dataUri;
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.Common.getChromeImageURI():"+e);
			}
		  return null;
		},

/////////////////////////////////////////////////////////////////////
		getFocusedWindow : function(){
			var win = document.commandDispatcher.focusedWindow;
			if(!win || win == window || win instanceof Components.interfaces.nsIDOMChromeWindow) win = window._content;
			return win;
		},

/////////////////////////////////////////////////////////////////////
		getDefaultIcon : function(type){
			switch(type){
				case "folder" : return "chrome://objectmng/skin/treefolder.png"; break;
				default       : return "chrome://objectmng/skin/treeitem.png";   break;
			}
		},

/////////////////////////////////////////////////////////////////////
		getBoolPref : function(aName, aDefVal){
			try{
				return this.PREF.getBoolPref(aName);
			}catch(ex){
				return aDefVal;
			}
		},

/////////////////////////////////////////////////////////////////////
		getElementStyle : function(elem){
			var style = {};
			if(elem){
				var resource_exp = new RegExp("^resource:");
				var rules = Components.classes["@mozilla.org/inspector/dom-utils;1"].getService(Components.interfaces["inIDOMUtils"]).getCSSStyleRules(elem);
				var i;
				var j;
				var propertyName;
				var priority;
				var value;
				for(i=0;i<rules.Count();i++) {
					var rule = rules.GetElementAt(i);
					if(rule instanceof CSSStyleRule && (!rule.parentStyleSheet.href || !resource_exp.test(rule.parentStyleSheet.href))){
						for(j=0;j<rule.style.length;j++){
							propertyName = rule.style.item(j);
							if(propertyName == '') continue;
							priority = rule.style.getPropertyPriority(propertyName);
							value = rule.style.getPropertyValue(propertyName);
							if(!style[propertyName] || !style[propertyName].priority){
								style[propertyName] = {};
								style[propertyName].value = value;
								style[propertyName].priority = priority;
							}
						}
					}
				}
				if(elem.style){
					for(j=0;j<elem.style.length;j++){
						propertyName = elem.style.item(j);
						if(propertyName == '') continue;
						priority = elem.style.getPropertyPriority(propertyName);
						value = elem.style.getPropertyValue(propertyName);
						if(!style[propertyName] || !style[propertyName].priority){
							style[propertyName] = {};
							style[propertyName].value = value;
							style[propertyName].priority = priority;
						}
					}
				}
			}
			return style;
		},

/////////////////////////////////////////////////////////////////////
		getPageOffsetTop : function(elem){
			if(!elem) return 0;
			var top = elem.offsetTop;
			var tempElem;
			var offsetHeight;
			var scrollHeight;
			var style;
			var scrollTop;
			while(elem && elem.offsetParent != null){
				if(elem && elem.parentNode && elem.offsetParent != elem.parentNode){
					tempElem = elem;
					while(tempElem && tempElem.parentNode && elem.offsetParent != tempElem.parentNode){
						offsetHeight = tempElem.parentNode.offsetHeight;
						scrollHeight = tempElem.parentNode.scrollHeight;
						if(offsetHeight != scrollHeight){
							style = this.getElementStyle(tempElem.parentNode);
							if(!style['height']) offsetHeight = scrollHeight;
						}
						if(offsetHeight != scrollHeight){
							scrollTop = elem.offsetTop - tempElem.parentNode.offsetTop;
							if(scrollTop>15) scrollTop -= 15;
							if(scrollTop>0){
								tempElem.parentNode.scrollTop = scrollTop;
								if(tempElem.parentNode.scrollTop>0) top = tempElem.parentNode.offsetTop;
							}
							elem = tempElem.parentNode;
							break;
						}
						tempElem = tempElem.parentNode;
					}
				}
				if(elem.offsetParent.offsetHeight != elem.offsetParent.scrollHeight) elem.offsetParent.scrollTop = top - (top>15?15:0);
				elem = elem.offsetParent;
				if(elem) top += elem.offsetTop;
			}
			return top;
		},

/////////////////////////////////////////////////////////////////////
		addPrefListener : function(aObserver){
			try{
				var pbi = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranchInternal);
				pbi.addObserver(aObserver.domain, aObserver, false);
			}catch(e){}
		},

/////////////////////////////////////////////////////////////////////
		removePrefListener : function(aObserver){
			try{
				var pbi = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranchInternal);
				pbi.removeObserver(aObserver.domain, aObserver);
			}catch(e){}
		},

/////////////////////////////////////////////////////////////////////
		escapeComment : function(aStr){
			if(aStr.length > 10000) this.alert("NOTICE: Too long comment makes ObjectManagement slow.");
			return aStr.replace(/\r|\n|\t/g, " __BR__ ");
		},

/////////////////////////////////////////////////////////////////////
		openManageWindow : function(aRes, aModEltID){
			window.openDialog("chrome://objectmng/content/manage.xul", "ObjectManagement:Manage", "chrome,centerscreen,all,resizable,dialog=no", aRes, aModEltID);
		},

/////////////////////////////////////////////////////////////////////
		rangeCompareNode : function(aRange, aNode){
			if(!aRange || !aNode || !aRange.compareBoundryPoints) return -1;
			var nodeRange = aNode.ownerDocument.createRange();
			try{
				nodeRange.selectNode(aNode);
			}catch(e){
				nodeRange.selectNodeContents(aNode);
			}
			var nodeIsBefore = aRange.compareBoundryPoints(Range.START_TO_START, nodeRange) == 1;
			var nodeIsAfter = aRange.compareBoundryPoints(Range.END_TO_END, nodeRange) == -1;

			if(nodeIsBefore && !nodeIsAfter) return 0;
			if(!nodeIsBefore && nodeIsAfter) return 1;
			if(nodeIsBefore && nodeIsAfter)  return 2;
			return 3;
		},

/////////////////////////////////////////////////////////////////////
		rangeIntersectsNode : function(aRange, aNode){
			if(!aRange || !aNode || !aRange.compareBoundryPoints) return false;
			var nodeRange = aNode.ownerDocument.createRange();
			try{
				nodeRange.selectNode(aNode);
			}catch(e){
				nodeRange.selectNodeContents(aNode);
			}
			return aRange.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 && aRange.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
		},

/////////////////////////////////////////////////////////////////////
		getHostName: function(){
			var DNSService=this.DNS;
			return DNSService.myHostName;
		},

/////////////////////////////////////////////////////////////////////
		getIPAddress: function(){
			try{
				var DNSService=this.DNS;
				var DNSRecord=DNSService.resolve(DNSService.myHostName, true);
				var allIP = [];
				var i;
				for(i=0;DNSRecord.hasMore();i++) allIP[i]=DNSRecord.getNextAddrAsString();
				return (allIP.length>0?allIP:undefined);
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.Common.getIPAddress():"+e);
				return undefined;
			}
		},
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	DataSource : {
		initflag : false,
		inittime : "",
		data : null,
		file : null,
		unshifting : false,
		ABOUT_ROOT : "urn:wiredmarker:root",
		ABOUT_ITEM : "urn:wiredmarker:item",
		id2about : {},

/////////////////////////////////////////////////////////////////////
		get filename(){
			if(this.inittime == "") this.inittime = bitsObjectMng.Common.getTimeStamp();
			return "wiredmarker_"+this.inittime+".rdf";
		},
/////////////////////////////////////////////////////////////////////
		init : function(aQuietWarning){
			if(this.initflag) return;
			this.initflag = true;
			try{
				this.file = bitsObjectMng.Common.getExtensionDir().clone();
				this.file.append(this.filename);
				if(!this.file.exists()){
					this.initRdf();
				}else{
					this.data = null;
					var fileURL = bitsObjectMng.Common.IO.newFileURI(this.file).spec;
					this.data = bitsObjectMng.Common.RDF.GetDataSourceBlocking(fileURL);
				}
			}catch(e){
				if(!aQuietWarning) bitsObjectMng._dump("ObjectManagement ERROR: Failed to initialize datasource.\n\n" + e);
				this.initflag = false;
			}
			this.unshifting = bitsObjectMng.Common.getBoolPref("objectmng.tree.unshift", false);
		},

		
/////////////////////////////////////////////////////////////////////
		done : function(){
			if(this.file.exists()) this.file.remove(true);
			this.initflag = false;
		},

/////////////////////////////////////////////////////////////////////
		initRdf : function(){
			try{
				this.file = bitsObjectMng.Common.getExtensionDir().clone();
				this.file.append(this.filename);
				if(this.file.exists()) this.file.remove(true);
				this.file.create(this.file.NORMAL_FILE_TYPE, 0666);
				var content = '<?xml version="1.0"?>\n<RDF:RDF xmlns:NC="http://home.netscape.com/NC-rdf#" xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/>\n';
				bitsObjectMng.Common.writeFile(this.file,content,"UTF-8");
				var fileURL = bitsObjectMng.Common.IO.newFileURI(this.file).spec;
				this.data = bitsObjectMng.Common.RDF.GetDataSourceBlocking(fileURL);
				this.createEmptySeq(this.ABOUT_ROOT);
				this.flush();
			}catch(e){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to initialize datasource.(rdf)\n\n" + e);
			}
			this.unshifting = bitsObjectMng.Common.getBoolPref("objectmng.tree.unshift", false);
		},

/////////////////////////////////////////////////////////////////////
		flush : function(){
			this.data.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource).Flush();
		},

/////////////////////////////////////////////////////////////////////
		refresh : function(){
			this.data.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource).Refresh(true);
		},

/////////////////////////////////////////////////////////////////////
		sanitize : function(aVal){
			if(!aVal || typeof(aVal) != "string") return "";
			return aVal.replace(/[\x00-\x1F\x7F]/g, " ");
		},

/////////////////////////////////////////////////////////////////////
		validateURI : function(aURI){
			if(aURI == this.ABOUT_ROOT || aURI.match(/^urn:wiredmarker:item\d{14}$/)){
				return true;
			}else{
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		addItem : function(aOMitem, aParName, aIdx, aMode){
			var about = "";
			if(aOMitem.about){
				about = aOMitem.about;
				delete aOMitem.about;
			}else{
				about = this.ABOUT_ITEM + aOMitem.id;
			}
			if(!this.validateURI(about)) return;
			this.setID2About(aOMitem.id,aOMitem.pfid,about,aMode);
			for(var key in aOMitem){
				if(typeof(aOMitem[key]) == "string") aOMitem[key] = this.sanitize(aOMitem[key]);
			}
			try{
				var cont = this.getContainer(aParName, false);
				if(!cont){
					cont = this.getContainer(this.ABOUT_ROOT, false);
					aIdx = 0;
				}
				var newRes = bitsObjectMng.Common.RDF.GetResource(about);
				for(var key in aOMitem){
					if(aOMitem[key] != undefined) this.data.Assert(newRes, bitsObjectMng.Common.RDF.GetResource(bitsObjectMng.NS_OBJECTMANAGEMENT + key), bitsObjectMng.Common.RDF.GetLiteral(aOMitem[key]), true);
				}
				if(this.unshifting && (aIdx == 0 || aIdx == -1)) aIdx = 1;
				if(0 < aIdx && aIdx < cont.GetCount()){
					cont.InsertElementAt(newRes, aIdx, true);
				}else{
					cont.AppendElement(newRes);
				}
				this.flush();
				return newRes;
			}catch(e){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to add resource to datasource.\n\n" + e);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		moveItem : function(curRes, curPar, tarPar, tarRelIdx){
			try{
				bitsObjectMng.Common.RDFC.Init(this.data, curPar);
				bitsObjectMng.Common.RDFC.RemoveElement(curRes, true);
			}catch(e){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to move element at datasource (1).\n\n" + e);
				return false;
			}
			if(this.unshifting){
				if(tarRelIdx == 0 || tarRelIdx == -1) tarRelIdx = 1;
			}
			try{
				bitsObjectMng.Common.RDFC.Init(this.data, tarPar);
				if(tarRelIdx > 0){
					bitsObjectMng.Common.RDFC.InsertElementAt(curRes, tarRelIdx, true);
				}else{
					bitsObjectMng.Common.RDFC.AppendElement(curRes);
				}
				return true;
			}catch(e){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to move element at datasource (2).\n\n" + e);
				bitsObjectMng.Common.RDFC.Init(this.data, bitsObjectMng.Common.RDF.GetResource(this.ABOUT_ROOT));
				bitsObjectMng.Common.RDFC.AppendElement(curRes, true);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		createEmptySeq : function(aResName){
			if(!this.validateURI(aResName)) return;
			bitsObjectMng.Common.RDFCU.MakeSeq(this.data, bitsObjectMng.Common.RDF.GetResource(aResName));
		},

/////////////////////////////////////////////////////////////////////
		deleteItem : function(aRes){
			var aParRes = this.findParentResource(aRes);
			return this.deleteItemDescending(aRes,aParRes);
		},

/////////////////////////////////////////////////////////////////////
		deleteItemDescending : function(aRes, aParRes){
			try{
				bitsObjectMng.Common.RDFC.Init(this.data, aParRes);
				bitsObjectMng.Common.RDFC.RemoveElement(aRes, true);
				var rmIDs = [];
				var addIDs = [];
				var depth = 0;
				do{
					addIDs = this.cleanUpIsolation();
					rmIDs = rmIDs.concat(addIDs);
				}while(addIDs.length > 0 && ++depth < 100);
				return rmIDs;
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.DataSource.deleteItemDescending():"+e);
				return [];
			}
		},

/////////////////////////////////////////////////////////////////////
		cleanUpIsolation : function(){
			var rmIDs = [];
			try{
				var resEnum = this.data.GetAllResources();
				while(resEnum.hasMoreElements()){
					var aRes = resEnum.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
					if(aRes.Value != this.ABOUT_ROOT && !this.data.ArcLabelsIn(aRes).hasMoreElements()){
						rmIDs.push(this.removeResource(aRes));
					}
				}
			}catch(e){
				bitsObjectMng._dump("ObjectManagement ERROR: Failed to clean up datasource.\n" + e);
			}
			return rmIDs;
		},

/////////////////////////////////////////////////////////////////////
		removeResource : function(aRes){
			var names = this.data.ArcLabelsOut(aRes);
			var rmID = this.getProperty(aRes, "id");
			while(names.hasMoreElements()){
				try{
					var name  = names.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
					var value = this.data.GetTarget(aRes, name, true);
					this.data.Unassert(aRes, name, value);
				}catch(e){}
			}
			return rmID;
		},

/////////////////////////////////////////////////////////////////////
		getContainer : function(aResURI, force){
			var cont = Components.classes['@mozilla.org/rdf/container;1'].createInstance(Components.interfaces.nsIRDFContainer);
			try{
				cont.Init(this.data, bitsObjectMng.Common.RDF.GetResource(aResURI));
			}catch(e){
				if(force){
					if(!this.validateURI(aResURI)) return null;
					return bitsObjectMng.Common.RDFCU.MakeSeq(this.data, bitsObjectMng.Common.RDF.GetResource(aResURI));
				}else{
					return null;
				}
			}
			return cont;
		},

/////////////////////////////////////////////////////////////////////
		clearContainer : function(aResURI){
			var cont = this.getContainer(aResURI, true);
			while(cont.GetCount()){
				cont.RemoveElementAt(1,true);
			}
		},

/////////////////////////////////////////////////////////////////////
		removeFromContainer : function(aResURI, aRes){
			var cont = this.getContainer(aResURI, true);
			if(cont) cont.RemoveElement(aRes, true);
		},

/////////////////////////////////////////////////////////////////////
		getProperty : function(aRes, aProp){
			try{
				if(aRes.Value == this.ABOUT_ROOT) return "";
				var retVal = this.data.GetTarget(aRes, bitsObjectMng.Common.RDF.GetResource(bitsObjectMng.NS_OBJECTMANAGEMENT + aProp), true);
				return (retVal?retVal.QueryInterface(Components.interfaces.nsIRDFLiteral).Value:undefined);
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.DataSource.getProperty():"+bitsObjectMng.DataSource.getProperty.caller);
				bitsObjectMng._dump("bitsObjectMng.DataSource.getProperty("+aRes+","+(aRes?aRes.Value:undefined)+","+aProp+"):["+e+"]");
				return "";
			}
		},

/////////////////////////////////////////////////////////////////////
		setProperty : function(aRes, aProp, newVal){
			try{
				newVal = this.sanitize(newVal);
				var aPropRes = bitsObjectMng.Common.RDF.GetResource(bitsObjectMng.NS_OBJECTMANAGEMENT + aProp);
				var oldVal = this.data.GetTarget(aRes, aPropRes, true);
				oldVal = oldVal.QueryInterface(Components.interfaces.nsIRDFLiteral);
				newVal = bitsObjectMng.Common.RDF.GetLiteral(newVal);
				this.data.Change(aRes, aPropRes, oldVal, newVal);
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.DataSource.setProperty("+aRes+","+aRes.Value+","+aProp+","+newVal+"):["+e+"]");
			}
		},

/////////////////////////////////////////////////////////////////////
		exists : function(aRes){
			try{
				if(typeof(aRes) == "string") aRes = bitsObjectMng.Common.RDF.GetResource(this.ABOUT_ITEM + aRes);
				return this.data.ArcLabelsOut(aRes).hasMoreElements();
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.DataSource.exists("+aRes+"):["+e+"]");
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		isContainer : function(aRes){
			try{
				return bitsObjectMng.Common.RDFCU.IsContainer(this.data, aRes);
			}catch(e){
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		identify : function(aID){
			var i = 0;
			while(this.exists(aID) && i < 100){
				aID = bitsObjectMng.Common.getTimeStamp(--i);
			}
			return aID;
		},

/////////////////////////////////////////////////////////////////////
		getRelativeIndex : function(aParRes, aRes){
			return bitsObjectMng.Common.RDFCU.indexOf(this.data, aParRes, aRes);
		},

/////////////////////////////////////////////////////////////////////
		seqResources : function(aContRes, aRecursive){
			if(!aRecursive || aRecursive == undefined) aRecursive = false;
			var resList = [];

			bitsObjectMng.Common.RDFC.Init(this.data, aContRes);
			var resEnum = bitsObjectMng.Common.RDFC.GetElements();
			while(resEnum.hasMoreElements()){
				var res = resEnum.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
				resList.push(res);
				if(this.isContainer(res) && aRecursive) resList = resList.concat(this.seqResources(res, aRecursive));
			}
			return resList;
		},

/////////////////////////////////////////////////////////////////////
		flattenResources : function(aContRes, aRule, aRecursive){
			var resList = [];
			if(aRule != 2) resList.push(aContRes);
			bitsObjectMng.Common.RDFC.Init(this.data, aContRes);
			var resEnum = bitsObjectMng.Common.RDFC.GetElements();
			while(resEnum.hasMoreElements()){
				var res = resEnum.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
				if(this.isContainer(res)){
					if(aRecursive)
						resList = resList.concat(this.flattenResources(res, aRule, aRecursive));
					else
						if(aRule != 2) resList.push(res);
				}else{
					if(aRule != 1) resList.push(res);
				}
			}
			return resList;
		},

/////////////////////////////////////////////////////////////////////
		findParentResource : function(aRes){
			var resEnum = this.data.GetAllResources();
			while(resEnum.hasMoreElements()){
				var res = resEnum.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
				if(!this.isContainer(res)) continue;
				if(bitsObjectMng.Common.RDFCU.indexOf(this.data, res, aRes) != -1) return res;
			}
		},

/////////////////////////////////////////////////////////////////////
		setID2About : function(aID,aPFID,aAbout,aMode){
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			if(aAbout == undefined && this.id2about[aMode] == undefined) return;
			if(this.id2about[aMode] == undefined){
				if(aAbout == undefined) return;
				this.id2about[aMode] = {};
			}
			if(aPFID == undefined) aPFID = "";
			if(this.id2about[aMode][aPFID] == undefined){
				if(aAbout == undefined) return;
				this.id2about[aMode][aPFID] = {};
			}
			this.id2about[aMode][aPFID][aID] = aAbout;
		},

/////////////////////////////////////////////////////////////////////
		getID2About : function(aID,aPFID,aMode){
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			if(this.id2about[aMode] == undefined) return undefined;
			if(aPFID == undefined) aPFID = "";
			if(this.id2about[aMode][aPFID] == undefined) return undefined;
			return (this.id2about[aMode][aPFID][aID]?this.id2about[aMode][aPFID][aID]:undefined);
		},

/////////////////////////////////////////////////////////////////////
		getAbout : function(aID,aPFID,aMode){
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			var about = this.ABOUT_ITEM+bitsObjectMng.Database._seqIdentify(aID);
			this.setID2About(aID,aPFID,about,aMode);
			return about;
		},

/////////////////////////////////////////////////////////////////////
		load : function(aLoadDoc){
			return true;
		},

/////////////////////////////////////////////////////////////////////
		save : function(aSaveDoc){
			return true;
		},

/////////////////////////////////////////////////////////////////////
		saveload : function(event){
			if(!bitsObjectMng.DataSource.save(event)) bitsObjectMng.DataSource.load(event);
		},

/////////////////////////////////////////////////////////////////////


	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	XML : {
		_xmldoc : null,

/////////////////////////////////////////////////////////////////////
		get serializer(){
			if(!this._xmldoc) return "";
			var serializer = new XMLSerializer();
			return serializer.serializeToString(this._xmldoc);
		},

/////////////////////////////////////////////////////////////////////
		createDocument : function(pUri){
			if(this._xmldoc) this._xmldoc = null;
			try{
				var IO = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
				var fileHandler = IO.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
				var aFile = fileHandler.getFileFromURLSpec(pUri);
				var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(aFile, 1, 0, false);
				var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
				sstream.init(istream);
				var fileContents = sstream.read(sstream.available());
				sstream.close();
				istream.close();
				var domParser = new DOMParser();
				var xmlDocument = domParser.parseFromString(fileContents, "text/xml");
				if(xmlDocument && xmlDocument.documentElement.nodeName == "parsererror") xmlDocument = undefined;
				return xmlDocument;
			}catch(e){
				mcDatabaseDialog._dump("XML.createDocument("+pUri+"):"+ e);
				return undefined;
			}
		},

/////////////////////////////////////////////////////////////////////
		parseFromString : function(aString){
			if(this._xmldoc) this._xmldoc = null;
			var parser = new DOMParser(); 
			var xmlDocument = parser.parseFromString(aString,"text/xml"); 
			if(xmlDocument && xmlDocument.documentElement.nodeName == "parsererror") xmlDocument = undefined;
			this._xmldoc = xmlDocument;
			return xmlDocument;
		},

/////////////////////////////////////////////////////////////////////
		updateItem : function (pParentNodeName,pItemNodeName,pItemNodeValue){
			if(!this._xmldoc) return null;
			var elemParentNode = this._xmldoc.getElementsByTagName(pParentNodeName);
			if(!elemParentNode || elemParentNode.length == 0){
				elemParentNode = this._xmldoc.createElement(pParentNodeName);
				if(elemParentNode) this._xmldoc.appendChild(elemParentNode);
			}else{
				elemParentNode = elemParentNode[0];
			}
			if(elemParentNode){
				var elemItemNode = elemParentNode.getElementsByTagName(pItemNodeName);
				if(!elemItemNode || elemItemNode.length == 0){
					elemItemNode = this._xmldoc.createElement(pItemNodeName);
					if(elemItemNode) elemParentNode.appendChild(elemItemNode);
				}else{
					elemItemNode = elemItemNode[0];
					if(elemItemNode && elemItemNode.hasChildNodes()){
						var childNode = elemItemNode.lastChild;
						while(childNode){
							var previousSibling = childNode.previousSibling;
							elemItemNode.removeChild(childNode);
							childNode = previousSibling;
						}
					}
				}
				if(elemItemNode){
					if(pItemNodeValue && pItemNodeValue != ""){
						var elemTextNode = this._xmldoc.createTextNode(pItemNodeValue);
						if(elemTextNode) elemItemNode.appendChild(elemTextNode);
					}
				}
			}
			this._xmldoc.normalize();
			if(bitsMarkingCollection._app_version <7) this._xmldoc.normalizeDocument();
			return elemItemNode;
		},

/////////////////////////////////////////////////////////////////////
		getItem : function (pParentNodeName,pItemNodeName){
			var rtnTextValue = null;
			if(!this._xmldoc) return rtnTextValue;
			this._xmldoc.normalize();
			if(bitsMarkingCollection._app_version <7) this._xmldoc.normalizeDocument();
			var elemParentNode = this._xmldoc.getElementsByTagName(pParentNodeName);
			if(!elemParentNode || elemParentNode.length == 0) return rtnTextValue;
			var elemItemNode = null;
			if(pItemNodeName){
				elemItemNode = elemParentNode[0].getElementsByTagName(pItemNodeName);
				if(!elemItemNode || elemItemNode.length == 0) return rtnTextValue;
				rtnTextValue = elemItemNode;
			}else{
				rtnTextValue = elemParentNode;
			}
			return rtnTextValue;
		},

/////////////////////////////////////////////////////////////////////
		removeItem : function (pParentNodeName,pItemNodeName){
			if(!this._xmldoc) return;
			this._xmldoc.normalize();
			if(bitsMarkingCollection._app_version <7) this._xmldoc.normalizeDocument();
			var elemParentNode = this._xmldoc.getElementsByTagName(pParentNodeName);
			if(!elemParentNode || elemParentNode.length == 0) return;
			elemParentNode = elemParentNode[0];
			var elemItemNode = elemParentNode.getElementsByTagName(pItemNodeName);
			if(!elemItemNode || elemItemNode.length == 0) return;
			elemItemNode = elemItemNode[0];
			elemParentNode.appendChild(elemItemNode);
			return;
		},

/////////////////////////////////////////////////////////////////////
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	XPath : {

		xpe : new XPathEvaluator(),

/////////////////////////////////////////////////////////////////////
		getOffsetFromParentNode : function(aNode,aOffset){
			var xPathNode = aNode;
			var xPathText = "";
			var tmpOffset = aOffset;
			var tmpEffectOffset = 0;
			if(this._isTextNode(xPathNode)) xPathNode = xPathNode.parentNode;
			if(xPathNode && xPathNode.id && xPathNode.id.indexOf("bits_") == 0) xPathNode = xPathNode.parentNode;
			tmpEffectOffset = 0;
			while(xPathNode && xPathNode.id && xPathNode.id.indexOf("bits_") == 0) xPathNode = xPathNode.parentNode;
			while(xPathNode){
				xPathText = this.createXPath(xPathNode);
				if(xPathText.indexOf("bits_") < 0) break;
				xPathNode = xPathNode.parentNode;
			}
			while(xPathText.match(/^(.*)?\/([A-Z]+)\[(\d+)\]$/)){
				var rpath = RegExp.$1;
				var rnode = RegExp.$2;
				var rcnt = RegExp.$3;
				for(;rcnt>0;rcnt--){
					var rnode_xpath = this.evaluate(rpath+'/'+rnode+'['+rcnt+']',xPathNode.ownerDocument);
					if(rnode_xpath){
						for(r2cnt=0;r2cnt<rnode_xpath.snapshotLength;r2cnt++){
							var r2node = rnode_xpath.snapshotItem(r2cnt);
							if(r2node && r2node.id && r2node.id.indexOf("bits_") == 0){
								xPathNode = r2node.parentNode;
								rpath = this.createXPath(xPathNode);
								rcnt = 0;
								break;
							}
						}
					}
				}
				xPathText = rpath;
			}
			if(xPathNode){
				xPathText = this.createXPath(xPathNode);
				if(this._isTextNode(aNode)){
					var nodeWalker = xPathNode.ownerDocument.createTreeWalker(xPathNode,NodeFilter.SHOW_TEXT,null,false);
					var txtNode=nodeWalker.nextNode();
					if(txtNode){
						for(;txtNode && txtNode != aNode;txtNode = nodeWalker.nextNode()){
							tmpOffset += txtNode.nodeValue.length;
						}
						if(txtNode == aNode){
							var xContext = txtNode.nodeValue;
							if(txtNode.nodeValue.length>xContext.length) tmpOffset -= (txtNode.nodeValue.length-xContext.length);
						}
					}else{
						tmpOffset = 0;
					}
				}else{
					var nodeWalker = xPathNode.ownerDocument.createTreeWalker(aNode,NodeFilter.SHOW_TEXT,null,false);
					var aTxtNode=nodeWalker.nextNode();
					if(aTxtNode){
						var nodeWalker = xPathNode.ownerDocument.createTreeWalker(xPathNode,NodeFilter.SHOW_TEXT,null,false);
						var txtNode=nodeWalker.nextNode();
						if(txtNode){
							for(;txtNode && txtNode != aTxtNode;txtNode = nodeWalker.nextNode()){
								tmpOffset += txtNode.nodeValue.length;
							}
							if(txtNode == aNode){
								var xContext = txtNode.nodeValue;
								if(txtNode.nodeValue.length>xContext.length) tmpOffset -= (txtNode.nodeValue.length-xContext.length);
							}
						}else{
							tmpOffset = 0;
						}
					}
				}
			}
			tmpOffset -= tmpEffectOffset;
			return {
				node   : xPathNode,
				xpath  : xPathText,
				offset : tmpOffset,
				type   : aNode.nodeType,
			};
		},

/////////////////////////////////////////////////////////////////////
		getCurrentNodeFromXPath : function(aDoc,aXPath,aOffset,aType){
			try{
				var rtnNode = null;
				var tmpOffset = aOffset;
				try{var evaluateNode = this.evaluate(aXPath,aDoc).snapshotItem(0);}catch(e){bitsObjectMng._dump("bitsObjectMng.XPath.getCurrentNodeFromXPath():"+e);}
				if(evaluateNode && aType == 3){
					var nodeWalker = aDoc.createTreeWalker(evaluateNode,NodeFilter.SHOW_TEXT,null,false);
					var txtNode=nodeWalker.nextNode();
					if(txtNode){
						for(;txtNode;txtNode = nodeWalker.nextNode()){
							if(tmpOffset - txtNode.nodeValue.length<0 || (tmpOffset>0 && (tmpOffset - txtNode.nodeValue.length)==0)){
								rtnNode = txtNode;
								break;
							}
							tmpOffset -= txtNode.nodeValue.length;
							nodeWalker.currentNode = txtNode;
						}
					}else{
						rtnNode = evaluateNode;
					}
				}else{
					rtnNode = evaluateNode;
				}
				return { node: rtnNode, offset : tmpOffset};
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.XPath.getCurrentNodeFromXPath():"+ex);
				return undefined;
			}
		},

/////////////////////////////////////////////////////////////////////
		_isTextNode : function(aNode){ 
			return aNode.nodeType == aNode.TEXT_NODE;
		},

/////////////////////////////////////////////////////////////////////
		getDocument : function(aNode){
			return (aNode.ownerDocument == null ? aNode : aNode.ownerDocument);
		},

/////////////////////////////////////////////////////////////////////
		getDocumentElement : function(aNode){
			return (aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
		},

/////////////////////////////////////////////////////////////////////
		createNSResolver : function(aNode){
			return this.xpe.createNSResolver(this.getDocumentElement(aNode));
		},

/////////////////////////////////////////////////////////////////////
		evaluateArray : function(aExpr, aNode){
			var found = [];
			try{
				var result = this.xpe.evaluate(aExpr, aNode, this.createNSResolver(aNode), 0, null);
				var res;
				while(res = result.iterateNext()) found.push(res);
			}catch(e){}
			return found;
		},

/////////////////////////////////////////////////////////////////////
		evaluate : function(aExpr, aNode){
			var rtn = this.xpe.evaluate(aExpr, aNode, this.createNSResolver(aNode), XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			if(rtn.snapshotLength == 0) rtn = this.getDocument(aNode).evaluate(aExpr, aNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		isPMC : function(aNode){
			if(!aNode || !aNode.ownerDocument) return false;
			if(aNode.ownerDocument.URL.match(/^http:\/\/www\.pubmedcentral\.nih\.gov\//)) return true;
			if(aNode.ownerDocument.URL.match(/^http:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\//)) return true;
			return false;
		},

/////////////////////////////////////////////////////////////////////
		isUseNodeId : function(aNode){
			if(!aNode.id || aNode.id.match(/^bits_/)) return false;
			if(aNode.ownerDocument && aNode.ownerDocument.URL.match(/^https:\/\/mail\.google\.com\//)) return false;
			var id_check = this.isPMC(aNode);
			if(id_check && aNode.id.match(/^[A-Za-z_]+\d+[a-z]*$/)) return false;
			var id_nodes = this.evaluate('//*[@id="'+aNode.id+'"]', aNode);
			if(id_nodes.snapshotLength>1) return false;
			return true;
		},

/////////////////////////////////////////////////////////////////////
		createXPath : function(aNode){
			var nodeName = (aNode.nodeType == Node.ELEMENT_NODE) ? aNode.localName.toLowerCase() : (aNode.nodeType == Node.TEXT_NODE) ? 'text()' : (aNode.nodeType == Node.COMMENT_NODE) ? 'comment()' : '*';
			if(this.isUseNodeId(aNode)) return '//'+nodeName+'[@id="'+aNode.id+'"]';
			var path = [];
			var node = aNode;
			var i;
			var j;
			var tarNode;
			var tarNodeName;
			var ancestorNodes = []
			var nodes = this.evaluate('ancestor::*', node);
			var len = nodes.snapshotLength;
			for(i=0;i<len;i++){ ancestorNodes.push(nodes.snapshotItem(i)); }
			for(i=ancestorNodes.length-1;i>=0;i--){
				tarNode = ancestorNodes[i];
				if(tarNode.id && this.isUseNodeId(tarNode)) break;
				nodes = this.evaluate('preceding-sibling::*[@id]', tarNode);
				tarNode = null;
				len = nodes.snapshotLength;
				for(j=len-1;j>=0;j--){
					tarNode = nodes.snapshotItem(j);
					if(this.isUseNodeId(tarNode)) break;
					tarNode = null;
				}
				if(tarNode) break;
			}
			if(tarNode){
				tarNodeName = '//'+tarNode.localName.toLowerCase()+'[@id="'+tarNode.id+'"]';
			}else{
				tarNode = this.getDocumentElement(node);
				tarNodeName = '/'+tarNode.localName.toLowerCase()+'[1]';
			}
			while(tarNode.parentNode != node.parentNode){
				nodes = this.evaluate('preceding-sibling::'+nodeName, node);
				path.unshift(nodeName+'['+(nodes.snapshotLength+1)+']');
				node = node.parentNode;
				nodeName = node.localName.toLowerCase();
			}
			if(tarNode != node){
				var axis = 'following-sibling::';
				nodes = this.evaluate(axis+nodeName, tarNode);
				len = nodes.snapshotLength;
				for(i=0;i<len&&nodes.snapshotItem(i)!=node;i++){}
				path.unshift(axis+nodeName+'['+(i+1)+']');
			}
			path.unshift(tarNodeName);
			return path.join('/');
		},
	},

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
	Database : {
		_dbConn : [],

		_lastModifiedTime : [],
		_checktimer : null,
		_Listener : [],

		_defaultMode    : "local",
		_sharedMode     : "shared",
		_repositoryMode : "repository",

		_seq    : [],
		_seqmin : "",

		_version : "1.0",

/////////////////////////////////////////////////////////////////////
		get version(){
			return this._version;
		},
		getVersion : function(aMode){
			if(!aMode) return undefined;
			if(!this._dbConn[aMode]) return undefined;
			if(!this._dbConn[aMode].tableExists("om_version")) return undefined;
			var lSql = 'select max(version) as version from om_version';
			var lFld = [];
			var statement = this._dbConn[aMode].createStatement(lSql);
			if(!this.beginTransaction(aMode)) return null;
			while(statement.executeStep()){
				var row = {};
				for(var j=0,k=statement.columnCount;j<k;j++){
					row[statement.getColumnName(j)] = statement.getUTF8String(j);
					if(row[statement.getColumnName(j)] == "null") row[statement.getColumnName(j)] = "";
				}
				lFld.push(row);
			}
			this.endTransaction(aMode);
			statement.reset();
			statement = undefined;
			return (lFld && lFld.length>0 ? lFld[0].version : undefined);
		},

		_updateOidProperty : function (obj,aMode){
			if(obj.oid_property == undefined) return undefined;
			try{
				var parser = new DOMParser();
				try{var xmldoc = parser.parseFromString(obj.oid_property, "text/xml");}catch(e){
					bitsObjectMng._dump("bitsObjectMng.Database._updateOidProperty():"+e);
				}
				parser = undefined;
				if(xmldoc && xmldoc.documentElement.nodeName == "parsererror"){
					obj.oid_property = undefined;
					xmldoc = undefined;
					return undefined;
				}
				if(xmldoc){
					var xmlnode = xmldoc.getElementsByTagName("ARTICLE_INFO")[0];
					if(xmlnode){
						var domParser = new DOMParser();
						var xmlDocument = domParser.parseFromString("<ARTICLE_INFO></ARTICLE_INFO>", "text/xml");
						domParser = undefined;
						if(xmlDocument){
							for(var dcnt=0;dcnt<xmlnode.childNodes.length;dcnt++){
								xmlDocument.documentElement.appendChild(xmlnode.childNodes[dcnt].cloneNode(true));
							}
							var removeElem = false;
							for(var dcnt=xmlnode.childNodes.length-1;dcnt>=0;dcnt--){
								var nodeName = xmlnode.childNodes[dcnt].nodeName;
								if(nodeName == "DOC_INFO"){
									var xmlnode2 = xmlnode.childNodes[dcnt];
									for(var dcnt2=xmlnode2.childNodes.length-1;dcnt2>=0;dcnt2--){
										if(xmlnode2.childNodes[dcnt2].nodeName == "PMID" || xmlnode2.childNodes[dcnt2].nodeName == "TI") continue;
										xmlnode2.removeChild(xmlnode2.childNodes[dcnt2]);
										removeElem = true;
									}
									continue;
								}
								if(nodeName == "DOC_MEDLINE_INFO"){
									var xmlnode2 = xmlnode.childNodes[dcnt];
									for(var dcnt2=xmlnode2.childNodes.length-1;dcnt2>=0;dcnt2--){
										if(xmlnode2.childNodes[dcnt2].nodeName == "AU" || xmlnode2.childNodes[dcnt2].nodeName == "TA" || xmlnode2.childNodes[dcnt2].nodeName == "DP") continue;
										xmlnode2.removeChild(xmlnode2.childNodes[dcnt2]);
										removeElem = true;
									}
									continue;
								}
								if(nodeName == "SECTIONS"){
									var xmlnodes = xmlnode.childNodes[dcnt].getElementsByTagName("SECTION");
									for(var dcnts=0;dcnts<xmlnodes.length;dcnts++){
										var xmlnode2 = xmlnodes[dcnts];
										for(var dcnt2=xmlnode2.childNodes.length-1;dcnt2>=0;dcnt2--){
											if(xmlnode2.childNodes[dcnt2].nodeName == "TITLE") continue;
											xmlnode2.removeChild(xmlnode2.childNodes[dcnt2]);
											removeElem = true;
										}
									}
									continue;
								}
								xmlnode.removeChild(xmlnode.childNodes[dcnt]);
								removeElem = true;
							}
							if(removeElem){
								var s = new XMLSerializer();
								var xml = s.serializeToString(xmlDocument);
								s = undefined;
								var pFile = this.getObjectPropertyDir(obj.oid,aMode);
								pFile.append("article_info.xml");
								bitsObjectMng.Common.writeFile(pFile,xml,'UTF-8');
							}
							xmlDocument = undefined;
						}
						xmlnode = undefined;
					}else{
						var pFile = this.getObjectPropertyDir(obj.oid,aMode);
						pFile.append("article_info.xml");
						if(pFile.exists()) pFile.remove(true);
					}
					var s = new XMLSerializer();
					obj.oid_property = s.serializeToString(xmldoc);
					s = undefined;
				}
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database._convert():"+ex);
			}
			return obj.oid_property;
		},

		_getStatementValue : function(aStatement,aIndex){
			try{
				var rtn = {};
				rtn.name = aStatement.getColumnName(aIndex);
				rtn.type = aStatement.getTypeOfIndex(aIndex);
				switch(rtn.type){
					case aStatement.VALUE_TYPE_INTEGER :
					case aStatement.VALUE_TYPE_FLOAT :
					case aStatement.VALUE_TYPE_TEXT :
						rtn.value = aStatement.getUTF8String(aIndex);
						break;
					case aStatement.VALUE_TYPE_BLOB :
						var array = {};
						var size = {};
						aStatement.getBlob(aIndex,size,array);
						rtn.value = array.value;
						break;
					default :
						break;
				}
				return rtn;
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.Database._getStatementValue():"+e);
				return undefined;
			}
		},

		_setStatementValue : function(aStatement,aIndex,aValue,aType){
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
				bitsObjectMng._dump("bitsObjectMng.Database._setStatementValue():"+e);
			}
		},

		_convert : function(aMode,aTable){
			var type = {};
			var statement = this._dbConn[aMode].createStatement("PRAGMA TABLE_INFO("+aTable+")");
			try{
				var columnCount = statement.columnCount;
				while (statement.executeStep()){
					var pname;
					var ptype;
					for(var index=0;index<columnCount;index++){
						switch(statement.getColumnName(index)){
							case "name":
								pname = statement.getUTF8String(index);
								break;
							case "type":
								ptype = statement.getUTF8String(index);
								switch(ptype){
									case "TEXT":
										type[pname] = statement.VALUE_TYPE_TEXT;
										break;
									case "NUMERIC":
										type[pname] = statement.VALUE_TYPE_FLOAT;
										break;
									case "INTEGER":
										type[pname] = statement.VALUE_TYPE_INTEGER;
										break;
									case "BLOB":
										type[pname] = statement.VALUE_TYPE_BLOB;
										break;
								}
								break;
							default:
								break;
						}
					}
				}
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.Database._convert():"+e);
			} finally {
				statement.reset();
			}
			statement = undefined;

			var pos = 0;
			var rows = [];
			var statement = this._dbConn[aMode].createStatement("select * from "+aTable);
			try{
				var columnCount = statement.columnCount;
				while (statement.executeStep()){
					var obj = {};
					for(pos=0;pos<columnCount;pos++){
						var rtn = this._getStatementValue(statement,pos);
						if(!rtn) continue;
						if(rtn.value != undefined) obj[rtn.name] = (rtn.type==statement.VALUE_TYPE_TEXT?unescape(rtn.value):rtn.value);
					}
					rows.push(obj);
					obj = undefined;
				}
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.Database._convert():"+e);
			} finally {
				statement.reset();
			}
			statement = undefined;

			if((type.fid != undefined || type.oid != undefined) && rows.length>0){
				var sql = "update "+aTable+" set ";
				var column = [];
				var names = [];
				var obj = rows[0];
				var index = 0;
				for(var name in type){
					if(type.fid != undefined && name == "fid") continue;
					if(type.oid != undefined && name == "oid") continue;
					if(type[name] != 3) continue;
					index++;
					column.push(name + "=?" + index);
					names.push(name);
				}
				sql += column.join(",");
				if(type.fid != undefined){
					sql += " where fid=?" + (++index);
				}else if(type.oid != undefined){
					sql += " where oid=?" + (++index);
				}
				statement = this._dbConn[aMode].createStatement(sql);
				for(pos=0;pos<rows.length;pos++){
					var statement_c = statement.clone();
					var obj = rows[pos]
					if(obj.oid_property) obj.oid_property = this._updateOidProperty(obj,aMode);
					for(index=0;index<names.length;index++){
						this._setStatementValue(statement_c,index,obj[names[index]],type[names[index]]);
					}
					if(type.fid != undefined){
						this._setStatementValue(statement_c,index,obj.fid,type.fid);
					}else if(type.oid != undefined){
						this._setStatementValue(statement_c,index,obj.oid,type.oid);
					}
					try{
						statement_c.execute();
					}catch(e){
						bitsObjectMng._dump("bitsObjectMng.Database._convert():"+e);
					} finally {
						statement_c.reset();
					}
					statement_c = undefined;
				}
				statement = undefined;
			}
			return true;
		},

		_convertExec : function(aMode,aTable,type,rows,names,statement,progressWindow,offset){
			var LIMIT = 10;
			if(!progressWindow){
				var x = screen.width;
				var y = screen.height;
				progressWindow = window.openDialog(
					"chrome://markingcollection/content/progress.xul",
					"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
					{status: bitsObjectMng.STRING.getString("CONVERT_DATABASE") + "..."});
				setTimeout(function(){bitsObjectMng.Database._convertExec(aMode,aTable,undefined,undefined,undefined,undefined,progressWindow);},0);
				return;
			}
			if(!type || !rows){
				if(offset == undefined) offset = 0;
				var ourTransaction = false;
				if(this._dbConn[aMode].transactionInProgress){
					this._dbConn[aMode].beginTransactionAs(this._dbConn[aMode].TRANSACTION_DEFERRED);
				}
				type = {};
				var statement = this._dbConn[aMode].createStatement("PRAGMA TABLE_INFO("+aTable+")");
				try{
					var columnCount = statement.columnCount;
					while (statement.executeStep()){
						var pname;
						var ptype;
						for(var index=0;index<columnCount;index++){
							switch(statement.getColumnName(index)){
								case "name":
									pname = statement.getUTF8String(index);
									break;
								case "type":
									ptype = statement.getUTF8String(index);
									switch(ptype){
										case "TEXT":
											type[pname] = statement.VALUE_TYPE_TEXT;
											break;
										case "NUMERIC":
											type[pname] = statement.VALUE_TYPE_FLOAT;
											break;
										case "INTEGER":
											type[pname] = statement.VALUE_TYPE_INTEGER;
											break;
										case "BLOB":
											type[pname] = statement.VALUE_TYPE_BLOB;
											break;
									}
									break;
								default:
									break;
							}
						}
					}
				}catch(e){
					bitsObjectMng._dump("bitsObjectMng.Database._convert():"+e);
				} finally {
					statement.reset();
				}
				statement = undefined;

				var pos = 0;
				rows = [];
				var selectFld = "*";
				if(aTable == "om_object") selectFld = "oid,doc_title,doc_url,con_url,bgn_dom,end_dom,oid_title,oid_property,oid_mode,oid_type,oid_txt,oid_date";
				var statement = this._dbConn[aMode].createStatement("select "+ selectFld + " from "+aTable + " limit " + LIMIT + " offset " + offset);
				try{
					var columnCount = statement.columnCount;
					while (statement.executeStep()){
						var obj = {};
						for(pos=0;pos<columnCount;pos++){
							var rtn = this._getStatementValue(statement,pos);
							if(!rtn) continue;
							if(rtn.value != undefined) obj[rtn.name] = (rtn.type==statement.VALUE_TYPE_TEXT?unescape(rtn.value):rtn.value);
						}
						rows.push(obj);
						obj = undefined;
					}
				}catch(e){
					bitsObjectMng._dump("bitsObjectMng.Database._convert():"+e);
				} finally {
					statement.reset();
				}
				statement = undefined;
			}
			if((type.fid != undefined || type.oid != undefined) && rows.length>0){
				if(!statement){
					var sql = "update "+aTable+" set ";
					var column = [];
					names = [];
					var obj = rows[0];
					var index = 0;
					for(var name in type){
						if(type.fid != undefined && name == "fid") continue;
						if(type.oid != undefined && name == "oid") continue;
						if(type[name] != 3) continue;
						index++;
						column.push(name + "=?" + index);
						names.push(name);
					}
					sql += column.join(",");
					if(type.fid != undefined){
						sql += " where fid=?" + (++index);
					}else if(type.oid != undefined){
						sql += " where oid=?" + (++index);
					}
					statement = this._dbConn[aMode].createStatement(sql);
				}
				if(rows.length>0){
					var cnt;
					for(cnt=0;cnt<1 && rows.length>0;cnt++){
						var pos = rows.length;
						var obj = rows.shift();
						var statement_c = statement.clone();
						if(obj.oid_property) obj.oid_property = this._updateOidProperty(obj,aMode);
						for(index=0;index<names.length;index++){
							this._setStatementValue(statement_c,index,obj[names[index]],type[names[index]]);
						}
						if(type.fid != undefined){
							this._setStatementValue(statement_c,index,obj.fid,type.fid);
						}else if(type.oid != undefined){
							this._setStatementValue(statement_c,index,obj.oid,type.oid);
						}
						try{
							statement_c.execute();
						}catch(e){
							bitsObjectMng._dump("bitsObjectMng.Database._convert():"+e);
							for(index=0;index<names.length;index++){
								bitsObjectMng._dump2("bitsObjectMng.Database._convert():["+index+"]["+type[names[index]]+"]["+names[index]+"]["+obj[names[index]]+"]");
							}
						} finally {
							statement_c.reset();
						}
						statement_c = undefined;
					}
					if(rows.length == 0){
						offset += LIMIT;
						rows = undefined;
					}
					setTimeout(function(){bitsObjectMng.Database._convertExec(aMode,aTable,type,rows,names,statement,progressWindow,offset);},0);
				}
			}else if(rows.length==0){
				type = undefined;
				rows = undefined;
				statement = undefined;

				if(!this._dbConn[aMode].tableExists("om_version")) this._dbConn[aMode].executeSimpleSQL("CREATE TABLE om_version (version NUMERIC NOT NULL)");
				this._dbConn[aMode].executeSimpleSQL("insert into om_version (version) values ('"+this.version+"')");
				if(this._dbConn[aMode].transactionInProgress) this._dbConn[aMode].commitTransaction();

				if(progressWindow && !progressWindow.closed) progressWindow.close();
				progressWindow = undefined;
				bitsObjectMng.Common.alert(bitsObjectMng.STRING.getString("CONVERT_END_DATABASE"));
				var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(Components.interfaces.nsIAppStartup);
				var quitSeverity = appStartup.eAttemptQuit;
				appStartup.quit(quitSeverity | appStartup.eRestart);
				return;
			}
			if(progressWindow && !progressWindow.closed){
				if(progressWindow.setStatus) progressWindow.setStatus(bitsObjectMng.STRING.getString("CONVERT_DATABASE") + "... [ "+ (offset+ (rows?(LIMIT-rows.length):0)) + " ]");
				progressWindow.focus();
			}
			return true;
		},

		convert : function(aMode){
			if(!aMode) return undefined;
			if(!this._dbConn[aMode]) return undefined;
			var version = this.getVersion(aMode);
			if(parseFloat(version?version:0)>=parseFloat(this.version)) return;
			var dbFile = this._dbConn[aMode].databaseFile.clone();
			var aBackupFile = dbFile.parent.clone();
			aBackupFile.append(dbFile.leafName+".old");
			var bgcnt=0;
			while(aBackupFile.exists()){
				aBackupFile = dbFile.parent.clone();
				aBackupFile.append(dbFile.leafName+".old."+(++bgcnt));
			}
			dbFile.copyTo(aBackupFile.parent ,aBackupFile.leafName);
			var x = screen.width;
			var y = screen.height;
			progressWindow = window.openDialog(
				"chrome://markingcollection/content/progress.xul",
				"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
				{status: bitsObjectMng.STRING.getString("CONVERT_DATABASE") + "..."});
			setTimeout(function(){
				var ourTransaction = false;
				if (bitsObjectMng.Database._dbConn[aMode].transactionInProgress){
					ourTransaction = true;
					bitsObjectMng.Database._dbConn[aMode].beginTransactionAs(bitsObjectMng.Database._dbConn[aMode].TRANSACTION_DEFERRED);
				}
				if(!bitsObjectMng.Database._convert(aMode,"om_folder")) return;
				if(ourTransaction) bitsObjectMng.Database._dbConn[aMode].commitTransaction();
				setTimeout(function(){bitsObjectMng.Database._convertExec(aMode,"om_object",undefined,undefined,undefined,undefined,progressWindow);},0);
			},0);
		},

/////////////////////////////////////////////////////////////////////
		init : function(aMode,aDBFile){
			try{
				if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
				bitsObjectMng.Database.connect(aMode,aDBFile);
				if(bitsObjectMng.Database._dbConn[aMode]){
					bitsObjectMng.Database._createTable(aMode);
					bitsObjectMng.Database._updateLastModifiedTime(aMode);
					bitsObjectMng.Database._startUpdateCheck(aMode);
				}else{
					bitsObjectMng.Database._lastModifiedTime[aMode] = 0;
				}
			}catch(e){bitsObjectMng._dump("bitsObjectMng.Database.init("+aMode+"):"+e)}
			return bitsObjectMng.Database._dbConn[aMode];
		},
/////////////////////////////////////////////////////////////////////
		done : function(aMode,aVacuum){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(this._dbConn[aMode]){
				var dbFile = this._dbConn[aMode].databaseFile.clone();
				this.disconnect(aMode,aVacuum);
				this.backup(dbFile);
				this._lastModifiedTime[aMode] = 0;
				this._stopUpdateCheck(aMode);
				delete this._dbConn[aMode];
			}
		},

/////////////////////////////////////////////////////////////////////
		backup : function(aFile){
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
		_updateLastModifiedTime : function(aMode){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(this._dbConn[aMode]){
				var aFile = this._dbConn[aMode].databaseFile.clone();
				if(aFile && aFile.exists()){
					this._lastModifiedTime[aMode] = aFile.lastModifiedTime;
				}else{
					this._lastModifiedTime[aMode] = 0;
				}
			}else{
				this._lastModifiedTime[aMode] = 0;
			}
		},

/////////////////////////////////////////////////////////////////////
		_startUpdateCheck : function(aMode){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			this._stopUpdateCheck(aMode);
		},

/////////////////////////////////////////////////////////////////////
		_stopUpdateCheck : function(aMode){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(this._checktimer){
				clearInterval(this._checktimer);
				this._checktimer = null;
			}
		},

/////////////////////////////////////////////////////////////////////
		_updateCheck : function(aMode){
			if(aMode == undefined || aMode == ""){
				var mode;
				for(mode in this._dbConn){
					if(typeof this._dbConn[mode] == "function") continue;
					var tmpRtn = bitsObjectMng.Database._updateCheck(mode);
					if(tmpRtn) return true;
				}
				return false;
			}
			var rtn = false;
			if(bitsObjectMng.Database._dbConn[aMode]){
				var aFile = bitsObjectMng.Database._getConnectFile(aMode);
				if(bitsObjectMng.Database._lastModifiedTime[aMode] != aFile.lastModifiedTime){
					if(!bitsObjectMng.Database.lockDB(aMode)) return false;
					bitsObjectMng.Database._updateLastModifiedTime(aMode);
					rtn = true;
					bitsObjectMng.Database.unlockDB(aMode);
				}
			}
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		addEventListener : function(aType,aFunc,aBool,aMode){
			if(!aType || !aFunc) return;
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			aType = aType.toLowerCase();
			aMode = aMode.toLowerCase();
			if(!this._Listener) this._Listener = [];
			if(!this._Listener[aMode]) this._Listener[aMode] = [];
			if(!this._Listener[aMode][aType]) this._Listener[aMode][aType] = [];
			if(!this._Listener[aMode][aType][aFunc]) this._Listener[aMode][aType][aFunc] = aFunc;
		},

/////////////////////////////////////////////////////////////////////
		removeEventListener : function(aType,aFunc,aBool,aMode){
			if(!aType || !aFunc) return;
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			aType = aType.toLowerCase();
			aMode = aMode.toLowerCase();
			if(!this._Listener) return;
			if(!this._Listener[aMode]) return;
			if(!this._Listener[aMode][aType]) return;
			if(this._Listener[aMode][aType][aFunc]) this._Listener[aMode][aType][aFunc] = undefined;
		},

/////////////////////////////////////////////////////////////////////
		_execEventListener : function(aType,aBool,aMode){
			if(!aType) return;
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			aType = aType.toLowerCase();
			aMode = aMode.toLowerCase();
			if(!this._Listener) return;
			if(!this._Listener[aMode]) return;
			if(!this._Listener[aMode][aType]) return;
			var key;
			for(key in this._Listener[aMode][aType]){
				var func = this._Listener[aMode][aType][key];
				if(func) (func)();
			}
		},

/////////////////////////////////////////////////////////////////////
		_getConnectFile : function(aMode){
			var dbFile = null;
			if(typeof(aMode) == "string"){
				if(aMode == this._defaultMode){
					dbFile = bitsObjectMng.Common.getExtensionDir().clone();
					var olddb = dbFile.clone();
					olddb.append("objectmng.sqlite");
					if(olddb.exists()) olddb.moveTo(dbFile,aMode+".sqlite");
					dbFile.append(aMode+".sqlite");
				}else{
					var dbpath = nsPreferences.copyUnicharPref("wiredmarker.dbpath."+aMode,"");
					if(dbpath == ""){
						var dir = bitsObjectMng.Common.getExtensionDir().clone();
						if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0770);
						dbpath = dir.path;
					}
					if(dbpath != ""){
						dbFile = bitsObjectMng.Common.convertPathToFile(dbpath);
						if(!dbFile.exists()) dbFile.create(dir.DIRECTORY_TYPE, 0777);
						dbFile.append(aMode+".sqlite");
					}
				}
			}
			return dbFile;
		},

/////////////////////////////////////////////////////////////////////
		connect : function(aMode,aDBFile){
			var dbFile = undefined;
			if(aDBFile != undefined){
				dbFile = aDBFile;
			}else{
				dbFile = bitsObjectMng.Database._getConnectFile(aMode);
			}
			if(!this._dbConn[aMode] && dbFile){
				try{
					this._dbConn[aMode] = bitsObjectMng.Common.STORAGE.openDatabase(dbFile);
				}catch(e){
					bitsObjectMng._dump("bitsObjectMng.Database.connect("+aMode+","+dbFile.path+"):"+e)
					this._dbConn[aMode] = undefined;
				}
			}
			return (this._dbConn[aMode] != undefined);
		},
/////////////////////////////////////////////////////////////////////
		disconnect : function(aMode,aVacuum){
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			if(aVacuum == undefined) aVacuum = false;
			try{
				if(aVacuum) this.vacuum(aMode);
			}catch(ex){};
			this._dbConn[aMode] = undefined;
		},

/////////////////////////////////////////////////////////////////////
		vacuum : function(aMode){
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			try{
				this._dbConn[aMode].executeSimpleSQL("VACUUM");
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.vacuum():"+ex);
			};
		},

/////////////////////////////////////////////////////////////////////
		getDatabaseFile : function(aMode){
			if(aMode == undefined || aMode == "") aMode = bitsObjectMng.Database._defaultMode;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			return this._dbConn[aMode].databaseFile;
		},

/////////////////////////////////////////////////////////////////////
		attach : function(aAttachMode,aMode){
			if(!aAttachMode) return false;
			if(this._dbConn[aAttachMode] == undefined) this.init(aAttachMode);
			if(!this._dbConn[aAttachMode]) return false;
			var path = this._dbConn[aAttachMode].databaseFile.path;
			var sql = 'ATTACH DATABASE "'+ path + '" AS "' + aAttachMode + '"';
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			try{
				this._dbConn[aMode].executeSimpleSQL(sql);
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.attach():"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.attach():"+sql);
				return false;
			}
			return true;
		},

/////////////////////////////////////////////////////////////////////
		_createTable : function(aMode){
			var ourTransaction = false;
			try{
				var createTable = !this._dbConn[aMode].tableExists("om_object");
				if(!createTable) createTable = !this._dbConn[aMode].tableExists("om_link");
				if(!createTable) createTable = !this._dbConn[aMode].tableExists("om_folder");
				if(!createTable) createTable = !this._dbConn[aMode].tableExists("om_favicon");

				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_object_index_url");
				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_object_index_type");
				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_object_index_oid");
				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_object_index_con_url");
				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_object_index_oid_date");

				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_link_index_pfid");
				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_link_index_oid");

				if(!createTable) createTable = !this._dbConn[aMode].indexExists("om_folder_index_pfid");

				if(createTable){
					if(!this.beginTransaction(aMode)) return;
					if(!this._dbConn[aMode].tableExists("om_object")){
						this._dbConn[aMode].executeSimpleSQL(
							"CREATE TABLE om_object (" +
							"  oid          INTEGER," +
							"  doc_title    TEXT NOT NULL," +
							"  doc_url      TEXT NOT NULL," +
							"  con_url      TEXT NOT NULL," +
							"  bgn_dom      TEXT," +
							"  end_dom      TEXT," +
							"  oid_title    TEXT," +
							"  oid_property TEXT," +
							"  oid_mode     INTEGER DEFAULT 0," +
							"  oid_type     TEXT NOT NULL," +
							"  oid_txt      TEXT," +
							"  oid_img      BLOB DEFAULT NULL,"+
							"  oid_date     TEXT," +
							"PRIMARY KEY (oid)"+
							")"
						);
						if(!this._dbConn[aMode].tableExists("om_version")){
							this._dbConn[aMode].executeSimpleSQL(
								"CREATE TABLE om_version (" +
								"  version      NUMERIC NOT NULL" +
								")"
							);
							this._dbConn[aMode].executeSimpleSQL("insert into om_version (version) values ('"+this.version+"')");
						}
					}
					if(!this._dbConn[aMode].tableExists("om_link")){
						this._dbConn[aMode].executeSimpleSQL(
							"CREATE TABLE om_link (" +
							"  oid        INTEGER," +
							"  pfid       INTEGER," +
							"  pfid_order INTEGER," +
							"PRIMARY KEY (oid,pfid)"+
							")"
						);
					}
					if(!this._dbConn[aMode].tableExists("om_folder")){
						this._dbConn[aMode].executeSimpleSQL(
							"CREATE TABLE om_folder (" +
							"  fid          INTEGER," +
							"  pfid         INTEGER NOT NULL," +
							"  pfid_order   INTEGER NOT NULL," +
							"  fid_title    TEXT," +
							"  fid_property TEXT," +
							"  fid_mode     INTEGER DEFAULT 0," +
							"  fid_style    TEXT," +
							"PRIMARY KEY (fid)"+
							")"
						);
					}
					if(!this._dbConn[aMode].tableExists("om_favicon")){
						this._dbConn[aMode].executeSimpleSQL(
							"CREATE TABLE om_favicon (" +
							"  favicon_url  TEXT NOT NULL," +
							"  favicon_mime TEXT NOT NULL," +
							"  favicon_img  BLOB DEFAULT NULL,"+
							"PRIMARY KEY (favicon_url)"+
							")"
						);
					}
					try{if(!this._dbConn[aMode].indexExists("om_object_index_url"))      this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_object_index_url  ON om_object(doc_url);");}catch(ex){}
					try{if(!this._dbConn[aMode].indexExists("om_object_index_type"))     this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_object_index_type ON om_object(oid_type);");}catch(ex){}
					try{if(!this._dbConn[aMode].indexExists("om_object_index_oid"))      this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_object_index_oid  ON om_object(oid);");}catch(ex){}
					try{if(!this._dbConn[aMode].indexExists("om_object_index_con_url"))  this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_object_index_con_url ON om_object(con_url);");}catch(ex){}
					try{if(!this._dbConn[aMode].indexExists("om_object_index_oid_date")) this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_object_index_oid_date ON om_object(oid_date);");}catch(ex){}

					try{if(!this._dbConn[aMode].indexExists("om_link_index_pfid")) this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_link_index_pfid ON om_link(pfid);");}catch(ex){}
					try{if(!this._dbConn[aMode].indexExists("om_link_index_oid"))  this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_link_index_oid  ON om_link(oid);");}catch(ex){}

					try{if(!this._dbConn[aMode].indexExists("om_folder_index_pfid")) this._dbConn[aMode].executeSimpleSQL("CREATE INDEX om_folder_index_pfid ON om_folder(pfid);");}catch(ex){}

					this.endTransaction(aMode);
				}
			}
			finally {
				if(this._dbConn[aMode].lastError) bitsObjectMng._dump("_createTable():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")");
				if(ourTransaction){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
			}
			if(ourTransaction) this._dbConn[aMode].commitTransaction();
		},

/////////////////////////////////////////////////////////////////////
		lockDB : function(aMode){
			return true;
		},

/////////////////////////////////////////////////////////////////////
		unlockDB : function(aMode){
			return true;
		},

/////////////////////////////////////////////////////////////////////
		beginTransaction : function(aMode){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return false;
			try{
				if(bitsObjectMng.Database.lockDB(aMode)){
					this._dbConn[aMode].executeSimpleSQL("BEGIN TRANSACTION");
					return true;
				}else{
					return false;
				}
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.beginTransaction("+aMode+"):"+ex);
				bitsObjectMng.Database.unlockDB(aMode)
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		endTransaction : function(aMode){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return null;
			try{
				this._dbConn[aMode].executeSimpleSQL("END TRANSACTION");
				bitsObjectMng.Database.unlockDB(aMode)
				return true;
			}catch(ex){
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		select : function(aMode,aSql,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return null;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			var i;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
				var k=statement.columnCount;
				var columnNames = [];
				for(i=0;i<k;i++){
					columnNames.push(statement.getColumnName(i));
				}
			}catch(ex){
				bitsObjectMng._dump("select(1):"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.select():aSql="+aSql);
				return null;
			}
			var dataset = [];
			try{
				while(statement.executeStep()){
					var row = [];
					var utf8String;
					for(i=0;i<k;i++){
						utf8String = statement.getUTF8String(i);
						row[columnNames[i]] = utf8String ? utf8String : "";
					}
					dataset.push(row);
				}
				columnNames = undefined;
			}
			finally {
				if(this._dbConn[aMode].lastError > 0 && this._dbConn[aMode].lastError <= 100){
					bitsObjectMng._dump("select(3):"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
				}
				if(this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					bitsObjectMng._dump("select(2):"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
					dataset = null;
				}
				if(ourTransaction && this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(aTransaction) this.endTransaction(aMode);
			return dataset;
		},

/////////////////////////////////////////////////////////////////////
		selectB : function(aMode,aSql,aPara,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return null;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			var i;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
				if(aPara){
					var i;
					for(i=0;i<aPara.length;i++){
						this._setStatementValue(statement,i,aPara[i]);
					}
				}
				var k=statement.columnCount;
				var columnNames = [];
				for(i=0;i<k;i++){
					columnNames.push(statement.getColumnName(i));
				}
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.selectB(1):"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.selectB():aSql="+aSql);
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
			}
			finally {
				if(this._dbConn[aMode].lastError > 0 && this._dbConn[aMode].lastError <= 100){
					bitsObjectMng._dump("selectB(3):"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
				}
				if(this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					bitsObjectMng._dump("selectB(2):"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
					dataset = null;
				}
				if(ourTransaction && this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(aTransaction) this.endTransaction(aMode);
			return dataset;
		},

/////////////////////////////////////////////////////////////////////
		selectBF : function(aMode,aSql,aPara,aFindRegExp,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return null;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			var i;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
				if(aPara){
					var i;
					for(i=0;i<aPara.length;i++){
						this._setStatementValue(statement,i,aPara[i]);
					}
				}
				var k=statement.columnCount;
				var columnNames = [];
				for(i=0;i<k;i++){
					columnNames.push(statement.getColumnName(i));
				}
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.selectBF(1):"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.selectBF():aSql="+aSql);
				return null;
			}
			var dataset = [];
			try{
				while(statement.executeStep()){
					var arr = [];
					var row = {};
					var utf8String;
					for(i=0;i<k;i++){
						utf8String = statement.getUTF8String(i);
						row[columnNames[i]] = utf8String ? utf8String : "";
						arr.push(utf8String ? utf8String : "");
					}
					if(arr.join("\n").match(aFindRegExp)) dataset.push(row);
				}
				columnNames = undefined;
			}
			finally {
				if(this._dbConn[aMode].lastError > 0 && this._dbConn[aMode].lastError <= 100){
					bitsObjectMng._dump("selectBF(3):"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
				}
				if(this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					bitsObjectMng._dump("selectBF(2):"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
					dataset = null;
				}
				if(ourTransaction && this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(aTransaction) this.endTransaction(aMode);
			return dataset;
		},

/////////////////////////////////////////////////////////////////////
		selectCount : function(aMode,aSql,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return null;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
			}catch(ex){
				bitsObjectMng._dump("selectCount():"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.selectCount():aSql="+aSql);
				return null;
			}
			var rtnCount = 0;
			try{
				if(statement.executeStep()) rtnCount = statement.getInt32(0);
			}
			finally {
				if(this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 100){
					bitsObjectMng._dump("selectCount():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
					dataset = 0;
				}
				if(ourTransaction && this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(aTransaction) this.endTransaction(aMode);
			return rtnCount;
		},

/////////////////////////////////////////////////////////////////////
		selectCountB : function(aMode,aSql,aPara,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return null;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
				if(aPara){
					var i;
					for(i=0;i<aPara.length;i++){
						this._setStatementValue(statement,i,aPara[i]);
					}
				}
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.selectCountB():"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.selectCountB():aSql="+aSql);
				return null;
			}
			var rtnCount = 0;
			try{
				if(statement.executeStep()) rtnCount = statement.getInt32(0);
			}
			finally {
				if(this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 100){
					bitsObjectMng._dump("selectCountB():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")\n\n"+aSql);
					dataset = 0;
				}
				if(ourTransaction && this._dbConn[aMode].lastError && this._dbConn[aMode].lastError != 101){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(aTransaction) this.endTransaction(aMode);
			return rtnCount;
		},

/////////////////////////////////////////////////////////////////////
		cmd : function(aMode,aSql,aTransaction){
			var rtn = true;
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return false;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
			}catch(ex){
				bitsObjectMng._dump("cmd():"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.cmd():aSql="+aSql);
				return false;
			}
			try{
				statement.execute();
			}
			finally {
				if(this._dbConn[aMode].lastError){
					bitsObjectMng._dump("cmd():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")");
					bitsObjectMng._dump("bitsObjectMng.Database.cmd():aSql="+aSql);
					rtn = false;
				}
				if(ourTransaction && this._dbConn[aMode].lastError){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(ourTransaction) this._dbConn[aMode].commitTransaction();
			if(aTransaction) this.endTransaction(aMode);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		cmdB : function(aMode,aSql,aPara,aTransaction){
			var rtn = true;
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return false;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			try{
				var statement = this._dbConn[aMode].createStatement(aSql);
				if(aPara){
					var i;
					for(i=0;i<aPara.length;i++){
						this._setStatementValue(statement,i,aPara[i]);
					}
				}
			}catch(ex){
				bitsObjectMng._dump("bitsObjectMng.Database.cmdB():"+ex);
				bitsObjectMng._dump("bitsObjectMng.Database.cmdB():aSql="+aSql);
				return false;
			}
			try{
				statement.execute();
			}
			finally {
				if(this._dbConn[aMode].lastError){
					bitsObjectMng._dump("bitsObjectMng.Database.cmdB():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")");
					bitsObjectMng._dump("bitsObjectMng.Database.cmdB():aSql="+aSql);
					rtn = false;
				}
				if(ourTransaction && this._dbConn[aMode].lastError){
					this._dbConn[aMode].rollbackTransaction();
					ourTransaction = false;
				}
				statement.reset();
			}
			if(ourTransaction) this._dbConn[aMode].commitTransaction();
			if(aTransaction) this.endTransaction(aMode);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		cmdArray : function(aMode,aSql,aTransaction){
			var rtn = true;
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return false;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			var cnt;
			for(cnt=0;cnt<aSql.length;cnt++){
				try{
					var statement = this._dbConn[aMode].createStatement(aSql[cnt]);
				}catch(ex){
					bitsObjectMng._dump("bitsObjectMng.Database.cmdArray():"+ex);
					bitsObjectMng._dump("bitsObjectMng.Database.cmdArray():aSql="+aSql[cnt]);
					return false;
				}
				try{
					statement.execute();
				}
				finally {
					if(this._dbConn[aMode].lastError){
						bitsObjectMng._dump("bitsObjectMng.Database.cmdArray():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")");
						rtn = false;
					}
					if(ourTransaction && !rtn){
						this._dbConn[aMode].rollbackTransaction();
						ourTransaction = false;
					}
					statement.reset();
					if(!rtn) break;
				}
			}
			if(ourTransaction) this._dbConn[aMode].commitTransaction();
			if(aTransaction) this.endTransaction(aMode);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		cmdArrayB : function(aMode,aSql,aPara,aTransaction){
			var rtn = true;
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			if(this._dbConn[aMode] == undefined) this.init(aMode);
			if(this._dbConn[aMode] == undefined) return false;
			var ourTransaction = false;
			if(aTransaction) if(!this.beginTransaction(aMode)) return null;
			var cnt;
			for(cnt=0;cnt<aSql.length;cnt++){
				try{
					var statement = this._dbConn[aMode].createStatement(aSql[cnt]);
					if(aPara){
						var i;
						for(i=0;i<aPara[cnt].length;i++){
							this._setStatementValue(statement,i,aPara[cnt][i]);
						}
					}
				}catch(ex){
					bitsObjectMng._dump("bitsObjectMng.Database.cmdArrayB():"+ex);
					bitsObjectMng._dump("bitsObjectMng.Database.cmdArrayB():aSql="+aSql[cnt]);
					if(this._dbConn[aMode].lastError) bitsObjectMng._dump("bitsObjectMng.Database.cmdArrayB():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")");
					return false;
				}
				try{
					statement.execute();
				}
				finally {
					if(this._dbConn[aMode].lastError){
						bitsObjectMng._dump("bitsObjectMng.Database.cmdArrayB():"+this._dbConn[aMode].lastErrorString+" ("+this._dbConn[aMode].lastError+")");
						rtn = false;
					}
					if(ourTransaction && !rtn){
						this._dbConn[aMode].rollbackTransaction();
						ourTransaction = false;
					}
					statement.reset();
					if(!rtn) break;
				}
			}
			if(ourTransaction) this._dbConn[aMode].commitTransaction();
			if(aTransaction) this.endTransaction(aMode);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		newObject : function(aID,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				if(aID == undefined){
					aID = this._oidIdentify(aMode,bitsObjectMng.Common.getTimeStamp(),aTransaction);
				}else{
					aID = this._oidIdentify(aMode,aID,aTransaction);
				}
				return {
					oid          : ""+aID,
					pfid         : ""+0 ,
					doc_title    : "",
					doc_url      : "",
					con_url      : "",
					bgn_dom      : "" ,
					end_dom      : "",
					oid_title    : "",
					oid_property : "" ,
					oid_mode     : ""+0,
					oid_type     : "" ,
					oid_txt      : "",
					oid_img      : null,
					oid_date     : "",
				};
			}catch(ex){
				bitsObjectMng._dump("Database.newObject():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		newFolder : function(aID,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				if(aID == undefined){
					aID = this._fidIdentify(aMode,bitsObjectMng.Common.getTimeStamp(),aTransaction);
				}else{
					aID = this._fidIdentify(aMode,aID,aTransaction);
				}
				return {
					fid          : ""+aID,
					pfid         : ""+0 ,
					pfid_order   : ""+0,
					fid_title    : ""+0,
					fid_property : "" ,
					fid_mode     : ""+0,
					fid_style    : "",
				};
			}catch(ex){
				bitsObjectMng._dump("Database.newFolder():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		existsObject : function(aObject,aMode){
			try{
				if(!aObject) return false;
				if(aMode == undefined || aMode == ""){
					var rtn = false;
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmp = bitsObjectMng.Database.existsObject(aObject,mode);
						if(tmp) rtn = tmp;
					}
					return rtn;
				}
				var para = [];
				var where = [];
				var key;
				var index=0;
				for(key in aObject){
					if(key == "pfid" || key == "pfid_order"){
						where.push("om_link."+key+"=?"+(++index));
					}else{
						where.push("om_object."+key+"=?"+(++index));
					}
					para.push(aObject[key]);
				}
				var oSql = 'select' +
									' count(om_object.oid) as num' +
									' from om_object' +
									' LEFT JOIN om_link ON om_link.oid = om_object.oid';
				if(where.length>0) oSql += " where " + where.join(" and ");
				var oFld = this.selectB(aMode,oSql,para);
				if(oFld && oFld.length>0){
					return (parseInt(oFld[0].num)>0?true:false);
				}else{
					return false;
				}
			}catch(ex){
				bitsObjectMng._dump("existsObject():"+ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		isOpenDB : function(aMode){
			return(this._dbConn[aMode] != undefined);
		},

/////////////////////////////////////////////////////////////////////
		_idExists : function(aMode,aID,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			var oSql = 'select count(oid) from om_object where oid="'+aID+'"';
			var oRtn = this.selectCount(aMode,oSql,aTransaction);
			if(oRtn>0) return true;
			var fSql = 'select count(fid) from om_folder where fid="'+aID+'"';
			var fRtn = this.selectCount(aMode,fSql,aTransaction);
			return (fRtn>0);
		},

/////////////////////////////////////////////////////////////////////
		_oidExists : function(aMode,aID,aTransaction){
			if(aTransaction == undefined) aTransaction = true;
			return this._idExists(aMode,aID,aTransaction);
		},

/////////////////////////////////////////////////////////////////////
		_oidIdentify : function(aMode,aID,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			var i = 0;
			while(this._oidExists(aMode,aID,aTransaction) && i < 100){
				aID = bitsObjectMng.Common.getTimeStamp(--i);
			}
			return aID;
		},

/////////////////////////////////////////////////////////////////////
		_oidCount : function(aMode,aID,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			var aSql = 'select count(oid) from om_link where oid="'+aID+'"';
			var rtn = this.selectCount(aMode,aSql,aTransaction);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		_linkExists : function(aMode, aLink, aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			var oSql = 'select count(oid) from om_link where oid="'+aLink.oid+'" and pfid="'+aLink.pfid+'"';
			var oRtn = this.selectCount(aMode,oSql,aTransaction);
			return (oRtn>0);
		},

/////////////////////////////////////////////////////////////////////
		_fidExists : function(aMode,aID,aTransaction){
			if(aTransaction == undefined) aTransaction = true;
			return this._idExists(aMode,aID,aTransaction);
		},

/////////////////////////////////////////////////////////////////////
		_fidCount : function(aMode,aID){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			var aSql = 'select count(fid) from om_folder';
			if(aID != undefined) aSql += ' where fid="'+aID+'"'
			var rtn = this.selectCount(aMode,aSql);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		_fidIdentify : function(aMode,aID,aTransaction){
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			if(aTransaction == undefined) aTransaction = true;
			var i = 0;
			while(this._fidExists(aMode,aID,aTransaction) && i < 100){
				aID = bitsObjectMng.Common.getTimeStamp(--i);
			}
			return aID;
		},

/////////////////////////////////////////////////////////////////////
		getCountFromPID : function(aPID,aMode){
			if(!aPID) return -1;
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			var aSql = 'select count(pfid) as num from om_folder where pfid='+aPID+' union select count(pfid) as num from om_link where pfid='+aPID;
			var rtn = this.selectCount(aMode,aSql);
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		addObject : function(aObject,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var rtn = true;
				if(aObject.oid == undefined || aObject.pfid == undefined){
					rtn = false;
				}
				if(rtn && aObject.pfid != "0"){
					rtn = this._fidExists(aMode,aObject.pfid,aTransaction);
					if(!rtn) bitsObjectMng._dump("bitsObjectMng.Database.addObject():aObject.pfid="+aObject.pfid);
				}
				if(aObject.style) delete aObject.style;
				if(aObject.cssstyle) delete aObject.cssstyle;
				if(aObject.oid_property) aObject.oid_property = this._updateOidProperty(aObject,aMode);
				if(rtn){
					var lcolumns = [];
					var lvalues = [];
					var lpara = [];
					var lindex = 0;
					var columns = [];
					var values = [];
					var para = [];
					var index = 0;
					var key;
					for(key in aObject){
						if(!aObject[key] || aObject[key] == "") continue;
						if(key == "pfid" || key == "pfid_order"){
							lcolumns.push(key);
							lvalues.push('?'+(++lindex));
							lpara.push(aObject[key]);
							continue;
						}
						if(key == "oid"){
							lcolumns.push(key);
							lvalues.push('?'+(++lindex));
							lpara.push(aObject[key]);
						}
						columns.push(key);
						values.push('?'+(++index));
						para.push(aObject[key]);
					}
					if(columns.length == 0) rtn = false;
					if(rtn){
						var sqlArr = [];
						var sqlPara = [];
						var aSql1 = "insert into om_link ("+ lcolumns.join(",") +") values ("+ lvalues.join(",") +")";
						var aSql2 = "insert into om_object ("+ columns.join(",") +") values ("+ values.join(",") +")";
                                                //alert("INSERT "+aObject.note);
                                                
                                                annotationProxy.putAnnotation(aObject);
						sqlArr.push(aSql1);
						sqlArr.push(aSql2);
						sqlPara.push(lpara);
						sqlPara.push(para);
						rtn = this.cmdArrayB(aMode,sqlArr,sqlPara,aTransaction);
						if(!rtn){
							bitsObjectMng._dump("bitsObjectMng.Database.addObject():aSql1="+aSql1);
							bitsObjectMng._dump("bitsObjectMng.Database.addObject():aSql2="+aSql2);
						}
					}
				}
				if(!rtn) rtn = this._oidExists(aMode,aObject.oid,aTransaction);
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tINSERT\tOBJECT");
			}catch(ex){
				bitsObjectMng._dump("Database.addObject():"+ex);
			}
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		addLink : function(aLink,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var rtn = true;
				if(!aLink || aLink.oid == undefined || aLink.pfid == undefined){
					rtn = false;
				}
				if(rtn){
					rtn = !this._linkExists(aMode, aLink, aTransaction);
					if(!rtn) bitsObjectMng._dump("bitsObjectMng.Database.addLink():_linkExists=["+ !rtn + "]");
				}
				if(rtn){
					rtn = this._fidExists(aMode,aLink.pfid,aTransaction);
					if(!rtn) bitsObjectMng._dump("bitsObjectMng.Database.addLink():aLink.pfid="+aLink.pfid);
				}
				if(rtn){
					rtn = this._oidExists(aMode,aLink.oid,aTransaction);
					if(!rtn) bitsObjectMng._dump("bitsObjectMng.Database.addLink():aLink.oid="+aLink.oid);
				}
				if(rtn){
					var columns = [];
					var values = [];
					var para = [];
					var index=0;
					for(var key in aLink){
						if(!aLink[key] || aLink[key] == "") continue;
						columns.push(key);
						values.push('?'+(++index));
						para.push(aLink[key]);
					}
					if(columns.length == 0) rtn = false;
					if(rtn){
						var aSql = "insert into om_link ("+ columns.join(",") +") values ("+ values.join(",") +")";
						rtn = this.cmdB(aMode,aSql,para,aTransaction);
					}
					if(!rtn){
						bitsObjectMng._dump("bitsObjectMng.Database.addLink():aSql="+aSql);
					}
				}
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tINSERT\tLINK");
			}catch(ex){
				bitsObjectMng._dump("Database.addLink():"+ex);
			}
			return rtn;
		},

/////////////////////////////////////////////////////////////////////
		addFolder : function(aFolder,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var columns = [];
				var values = [];
				var para = [];
				var index=0;
				for(var key in aFolder){
					if(!aFolder[key] || aFolder[key] == "") continue;
					columns.push(key);
					values.push('?'+(++index));
					para.push(aFolder[key]);
				}
				if(columns.length == 0) return false;
				var aSql = "insert into om_folder ("+ columns.join(",") +") values ("+ values.join(",") +")";
				var rtn = this.cmdB(aMode,aSql,para,aTransaction);
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tINSERT\tFOLDER");
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.addFolder():"+ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		getAllObjectFormDocument : function(aDocument,aMode,aNoMode,aType){
			try{
				if(!aDocument) return null;
				var doc_url = bitsObjectMng.Common.getURLStringFromDocument(aDocument);
				if(doc_url == "") return null;
				var statement = undefined;
				var oFld = this.getAllObjectFormURL(doc_url, aMode, aNoMode,aType);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("Database.getAllObjectFormDocument():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getAllObjectFormURL : function(aURL, aMode, aNoMode, aType){
			try{
				if(!aURL) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(mode == aNoMode) continue;
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getAllObjectFormURL(aURL, mode, undefined, aType);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var doc_url = aURL;
				if(doc_url == "") return null;
				var obj = {doc_url:doc_url};
				if(aType) obj.oid_type = aType;
				var rtnFld = this.getObject(obj,aMode);
				if(rtnFld && rtnFld.length>0)
					return rtnFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("Database.getAllObjectFormURL():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getAllObjectFormContentURL : function(aContentURL, aMode){
			try{
				if(!aContentURL) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getAllObjectFormContentURL(aContentURL, mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var con_url = aContentURL;
				if(!con_url || con_url == "") return null;
				var obj = {con_url:con_url};
				var rtnFld = this.getObject(obj,aMode);
				if(rtnFld && rtnFld.length>0)
					return rtnFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("Database.getAllObjectFormContentURL():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getAllObjectFormPIDandURL : function(aPID,aURL,aMode){
			try{
				if(!aPID || !aURL) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getAllObjectFormPIDandURL(aPID,aURL,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var oFld = this.getObject({pfid:aPID,doc_url:aURL},aMode);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("Database.getAllObjectFormPIDandURL():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectFormURL : function(aURL,aMode,aTransaction){
			try{
				if(!aURL) return null;
				if(aTransaction == undefined) aTransaction = true;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectFormURL(aURL,mode,false);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var oFld = this.getObject({doc_url:aURL},aMode);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("Database.getObjectFormURL():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObject : function(aObject,aMode,aLimit){
			try{
				if(!aObject) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var modeArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						modeArr.push(mode);
						var tmpArr = bitsObjectMng.Database.getObject(aObject,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0){
						var modeHash = {};
						for(var i=0;i<modeArr.length;i++){
							modeHash[modeArr[i]] = i;
						}
						rtnArr.sort(function(a,b){
							var a_order = parseInt(a.oid);
							var b_order = parseInt(b.oid);
							if(a_order < b_order) return -1;
							if(a_order > b_order) return 1;
							if(modeHash[a.dbtype] < modeHash[b.dbtype]) return -1;
							if(modeHash[a.dbtype] > modeHash[b.dbtype]) return 1;
							return 0;
						});
						return rtnArr;
					}else{
						return null;
					}
				}
				var para = [];
				var where = [];
				var key;
				var index=0;
				for(key in aObject){
					if(key.indexOf("substr") == 0){
						where.push(key+"=?"+(++index));
						para.push(aObject[key]);
					}else if(key == "pfid" || key == "pfid_order"){
						if((aObject[key]+"").toLowerCase() == "null"){
							where.push("om_link."+key+" is null");
						}else{
							where.push("om_link."+key+"=?"+(++index));
							para.push(aObject[key]);
						}
					}else{
						if((aObject[key]+"").toLowerCase() == "null"){
							where.push("om_object."+key+" is null");
						}else{
							where.push("om_object."+key+"=?"+(++index));
							para.push(aObject[key]);
						}
					}
				}
				var oSql = 'select' +
									' om_link.pfid' +
									',om_link.pfid_order' +
									',om_object.oid' +
									',om_object.doc_title' +
									',om_object.doc_url' +
									',om_object.con_url' +
									',om_object.bgn_dom' +
									',om_object.end_dom' +
									',om_object.oid_title' +
									',om_object.oid_property' +
									',om_object.oid_mode' +
									',om_object.oid_type' +
									',om_object.oid_txt' +
									',om_object.oid_date' +
									',"'+aMode+'" as dbtype' +
									',om_folder.fid_style' +
									',om_folder.fid_title' +
									',om_folder.pfid_order as folder_order' +
									' from om_object' +
									' LEFT JOIN om_link ON om_link.oid = om_object.oid' +
									' LEFT JOIN om_folder ON om_folder.fid = om_link.pfid';
				if(where.length>0) oSql += " where " + where.join(" and ");
				oSql += ' order by om_link.pfid_order';
				if(aLimit && parseInt(aLimit)>0) oSql += ' LIMIT ' + parseInt(aLimit);
				var oFld = this.selectB(aMode,oSql,para);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObject():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectMaxYear : function(aMode){
			try{
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectMaxYear(mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0){
						rtnArr.sort();
						return [rtnArr.pop()];
					}else{
						return null;
					}
				}
				var oSql = 'select max(substr(oid_date,7,4)) as year from om_object';
				var oFld = this.selectB(aMode,oSql);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectMaxYear():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectMinYear : function(aMode){
			try{
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectMinYear(mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0){
						rtnArr.sort();
						return [rtnArr.shift()];
					}else{
						return null;
					}
				}
				var oSql = 'select min(substr(oid_date,7,4)) as year from om_object';
				var oFld = this.selectB(aMode,oSql);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectMinYear():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectYear : function(aMode){
			try{
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectYear(mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0){
						var hash = {};
						for(var i=0;i<rtnArr.length;i++){
							hash[rtnArr[i]] = rtnArr[i];
						}
						rtnArr.length = 0;
						for(var key in hash){
							rtnArr.push(key);
						}
						rtnArr.sort();
						return rtnArr;
					}else{
						return null;
					}
				}
				var oSql = 'select substr(oid_date,7,4) as year from om_object group by year order by year';
				var oFld = this.selectB(aMode,oSql);
				if(oFld && oFld.length>0){
					for(var i=0;i<oFld.length;i++){
						oFld[i] = oFld[i].year;
					}
					return oFld;
				}else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectMinYear():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectMonthFromYear : function(aYear,aMode){
			try{
				if(!aYear) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectMonthFromYear(aYear,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0){
						var hash = {};
						for(var i=0;i<rtnArr.length;i++){
							hash[rtnArr[i]] = rtnArr[i];
						}
						rtnArr.length = 0;
						for(var key in hash){
							rtnArr.push(key);
						}
						rtnArr.sort();
						return rtnArr;
					}else{
						return null;
					}
				}
				var oSql = 'select substr(oid_date,1,2) as month from om_object where substr(oid_date,7,4)=?1 group by month order by month';
				var oFld = this.selectB(aMode,oSql,[aYear]);
				if(oFld && oFld.length>0){
					for(var i=0;i<oFld.length;i++){
						oFld[i] = oFld[i].month;
					}
					return oFld;
				}else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectMonthFromYear():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectDayFromYearMonth : function(aYear,aMonth,aMode){
			try{
				if(!aYear) return null;
				if(!aMonth) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectDayFromYearMonth(aYear,aMonth,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0){
						var hash = {};
						for(var i=0;i<rtnArr.length;i++){
							hash[rtnArr[i]] = rtnArr[i];
						}
						rtnArr.length = 0;
						for(var key in hash){
							rtnArr.push(key);
						}
						rtnArr.sort();
						return rtnArr;
					}else{
						return null;
					}
				}
				var oSql = 'select substr(oid_date,4,2) as day from om_object where substr(oid_date,7,4)=?1 and substr(oid_date,1,2)=?2 group by day order by day';
				var oFld = this.selectB(aMode,oSql,[aYear,aMonth]);
				if(oFld && oFld.length>0){
					for(var i=0;i<oFld.length;i++){
						oFld[i] = oFld[i].day;
					}
					return oFld;
				}else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectDayFromYearMonth():"+ex);
				return null;
			}
		},


/////////////////////////////////////////////////////////////////////
		findObject : function(aFindRegExp,aMode,aObject){
			try{
				if(!aFindRegExp && !aObject) return null;
				if(!aFindRegExp && aObject) return this.getObject(aObject,aMode);
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.findObject(aFindRegExp,mode,aObject);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var para = [];
				var where = [];
				var key;
				var index=0;
				if(aObject){
					for(key in aObject){
						if(key == "pfid" || key == "pfid_order"){
							where.push("om_link."+key+"=?"+(++index));
						}else{
							where.push("om_object."+key+"=?"+(++index));
						}
						para.push(aObject[key]);
					}
				}
				var oSql = 'select' +
									' om_link.pfid' +
									',om_link.pfid_order' +
									',om_object.oid' +
									',om_object.doc_title' +
									',om_object.doc_url' +
									',om_object.con_url' +
									',om_object.bgn_dom' +
									',om_object.end_dom' +
									',om_object.oid_title' +
									',om_object.oid_property' +
									',om_object.oid_mode' +
									',om_object.oid_type' +
									',om_object.oid_txt' +
									',om_object.oid_date' +
									',"'+aMode+'" as dbtype' +
									',om_folder.fid_style' +
									',om_folder.fid_title' +
									',om_folder.pfid_order as folder_order' +
									' from om_object' +
									' LEFT JOIN om_link ON om_link.oid = om_object.oid' +
									' LEFT JOIN om_folder ON om_folder.fid = om_link.pfid';
				if(where.length>0) oSql += " where " + where.join(" and ");
				oSql += ' order by om_link.pfid_order';
				var oFld = this.selectBF(aMode,oSql,para,aFindRegExp);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("findObject():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectWithProperty : function(aObject,aMode){
			try{
				if(!aObject) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectWithProperty(aObject,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var para = [];
				var where = [];
				var key;
				var index=0;
				for(key in aObject){
					if(key == "pfid" || key == "pfid_order"){
						where.push("om_link."+key+"=?"+(++index));
					}else{
						where.push("om_object."+key+"=?"+(++index));
					}
					para.push(aObject[key]);
				}
				var oSql = 'select' +
									' om_link.pfid' +
									',om_link.pfid_order' +
									',om_object.oid' +
									',om_object.doc_title' +
									',om_object.doc_url' +
									',om_object.con_url' +
									',om_object.bgn_dom' +
									',om_object.end_dom' +
									',om_object.oid_title' +
									',om_object.oid_property' +
									',om_object.oid_mode' +
									',om_object.oid_type' +
									',om_object.oid_txt' +
									',om_object.oid_date' +
									',"'+aMode+'" as dbtype' +
									',om_folder.fid_style' +
									' from om_object' +
									' LEFT JOIN om_link ON om_link.oid = om_object.oid' +
									' LEFT JOIN om_folder ON om_folder.fid = om_link.pfid';
				if(where.length>0) oSql += " where " + where.join(" and ");
				oSql += ' order by om_link.pfid_order';
				var oFld = this.selectB(aMode,oSql,para);
				if(oFld && oFld.length>0){
					var domParser = new DOMParser();
					var xmlSerializer = new XMLSerializer();
					for(var i=0;i<oFld.length;i++){
						if(!oFld[i].oid_property || oFld[i].oid_property == "") continue;
						var dir = this.getObjectPropertyDir(oFld[i].oid,aMode);
						if(!dir || !dir.exists()) continue;
						var entries = dir.directoryEntries;
						while(entries.hasMoreElements()){
							var pFile = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
							var xml = bitsObjectMng.Common.readFile(pFile);
							var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
							converter.charset = "UTF-8";
							xml = converter.ConvertToUnicode(xml);
							var xmldoc2 = domParser.parseFromString(xml, "text/xml");
							if(xmldoc2 && xmldoc2.documentElement.nodeName == "parsererror") xmldoc2 = undefined;
							if(!xmldoc2 || !xmldoc2.documentElement) continue;
							var xmldoc = domParser.parseFromString(oFld[i].oid_property, "text/xml");
							if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
							if(!xmldoc) continue;
							var xmlnode = xmldoc.getElementsByTagName(xmldoc2.documentElement.nodeName)[0];
							if(xmlnode){
								while(xmlnode.hasChildNodes()){
									xmlnode.removeChild(xmlnode.firstChild);
								}
							}else{
								xmlnode = xmldoc.createElement(xmldoc2.documentElement.nodeName);
								xmldoc.documentElement.appendChild(xmlnode);
							}
							if(!xmlnode) continue;
							var xmlnode2 = xmldoc2.documentElement;
							for(var dcnt=0;dcnt<xmlnode2.childNodes.length;dcnt++){
								xmlnode.appendChild(xmlnode2.childNodes[dcnt].cloneNode(true));
							}
							xmlnode2 = undefined;
							xmldoc2 = undefined;
							oFld[i].oid_property = xmlSerializer.serializeToString(xmldoc);
							xmlnode = undefined;
							xmldoc = undefined;
						}
					}
					xmlSerializer = undefined;
					domParser = undefined;
					return oFld;
				}else{
					return null;
				}
			}catch(ex){
				bitsObjectMng._dump("getObject():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectFormID : function(aID,aMode){
			try{
				if(!aID) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					for(var mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectFormID(aID,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var oFld = this.getObject({oid:aID},aMode);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectFormID():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectFormPID : function(aFID,aMode,aLimit){
			try{
				if(!aFID) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getObjectFormID(aID,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var lFld = this.getObject({pfid:aFID},aMode,aLimit);
				if(lFld && lFld.length>0)
					return lFld;
				else
					return null;
			}catch(ex){
				if(statement){
					this.endTransaction(aMode);
					statement.reset();
					statement = undefined;
				}
				bitsObjectMng._dump("getObjectFormPID():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getObjectDir : function(aID,aMode){
			var dir = bitsObjectMng.Common.getContentDir();
			var dir_new = dir.clone();
			dir.append(aID);
			dir_new.append(aMode);
			dir_new.append(aID);
			if(dir.exists()) return dir;
			return dir_new;
		},

/////////////////////////////////////////////////////////////////////
		getObjectBLOBFile : function(aID,aMode){
			var blobFile = this.getObjectDir(aID,aMode);
			blobFile.append("oid_img");
			return blobFile;
		},

/////////////////////////////////////////////////////////////////////
		getObjectPropertyDir : function(aID,aMode){
			var pDir = this.getObjectDir(aID,aMode);
			pDir.append("oid_property");
			return pDir;
		},

/////////////////////////////////////////////////////////////////////
		getObjectBLOB : function(aID,aMode,aTransaction){
			try{
				if(!aID) return null;
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var oFld = [];
				var imgFile = this.getObjectBLOBFile(aID,aMode);
				if(imgFile.exists()){
					var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
					istream.init(imgFile, -1, -1, false);
					var bstream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
					bstream.setInputStream(istream);
					var bytes = bstream.readByteArray(bstream.available());
					istream.close();
					oFld.push(bytes);
					return oFld;
				}
				var oSql = 'select oid_img from om_object where oid=?1';
				if(aTransaction) if(!this.beginTransaction(aMode)) return null;
				var statement = this._dbConn[aMode].createStatement(oSql);
				statement.bindUTF8StringParameter(0,aID);
				while(statement.executeStep()){
					var array = {};
					var size = {};
					statement.getBlob(0,size,array);
					oFld.push(array.value);
				}
				statement.reset();
				statement = undefined;
				if(aTransaction) this.endTransaction(aMode);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getObjectBLOB():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getAllObject : function(aMode){
			try{
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getAllObject(mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var rtnFld = this.getObject({},aMode);
				if(rtnFld && rtnFld.length>0)
					return rtnFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getAllObject():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getURL : function(aMode){
			try{
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getURL(mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var oSql = 'select doc_url from om_object group by doc_url';
				var oFld = this.select(aMode,oSql);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getURL():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getAllFolder : function(aMode,aTransaction){
			try{
				if(aTransaction == undefined) aTransaction = true;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getAllFolder(mode,false);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var fSql = 'select *,"'+aMode+'" as dbtype from om_folder';
				var fFld = [];
				if(aTransaction) if(!this.beginTransaction(aMode)) return null;
				var statement = this._dbConn[aMode].createStatement(fSql);
				while(statement.executeStep()){
					var row = [];
					var j,k
					for(j=0,k=statement.columnCount;j<k;j++){
						row[statement.getColumnName(j)] = statement.getUTF8String(j);
						if(row[statement.getColumnName(j)] == "null") row[statement.getColumnName(j)] = "";
					}
					fFld.push(row);
				}
				statement.reset();
				statement = undefined;
				if(aTransaction) this.endTransaction(aMode);
				if(fFld && fFld.length>0)
					return fFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getAllFolder():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getFolderFormID : function(aID,aMode,aNoMode,aTransaction){
			try{
				if(!aID) return null;
				if(aTransaction == undefined) aTransaction = true;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(mode == aNoMode) continue;
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getFolderFormID(aID,mode,undefined,aTransaction);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var fSql = 'select *,"'+aMode+'" as dbtype from om_folder where fid =?1';
				var fFld = this.selectB(aMode,fSql,[aID],aTransaction);
				if(fFld && fFld.length>0)
					return fFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getFolderFormID():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getFolderFormPID : function(aPID,aMode,aTransaction){
			try{
				if(!aPID) return null;
				if(aTransaction == undefined) aTransaction = true;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getFolderFormPID(aPID,mode,aTransaction);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var fSql = 'select *,"'+aMode+'" as dbtype from om_folder where pfid = ?1';
				var fFld = this.selectB(aMode,fSql,[aPID],aTransaction);
				if(fFld && fFld.length>0)
					return fFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getFolderFormPID():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getFolderFormTitle : function(aTitle,aMode,aTransaction){
			try{
				if(!aTitle) return null;
				if(aTransaction == undefined) aTransaction = true;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getFolderFormTitle(aTitle,mode,aTransaction);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var fSql = 'select *,"'+aMode+'" as dbtype from om_folder where fid_title =?1';
				var fFld = this.selectB(aMode,fSql,[aTitle],aTransaction);
				if(fFld && fFld.length>0)
					return fFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getFolderFormTitle():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getFolder : function(aFolder,aMode){
			try{
				if(!aFolder) return null;
				if(aMode == undefined || aMode == ""){
					var rtnArr = [];
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpArr = bitsObjectMng.Database.getFolder(aFolder,mode);
						if(tmpArr) rtnArr = rtnArr.concat(tmpArr);
					}
					if(rtnArr && rtnArr.length>0)
						return rtnArr;
					else
						return null;
				}
				var para = [];
				var where = [];
				var key;
				var index=0;
				for(key in aFolder){
					where.push("om_folder."+key+"=?"+(++index));
					para.push(aFolder[key]);
				}
				var oSql = 'select' +
									' om_folder.*' +
									',"'+aMode+'" as dbtype' +
									' from om_folder';
				if(where.length>0) oSql += " where " + where.join(" and ");
				oSql += ' order by om_folder.pfid_order';
				var oFld = this.selectB(aMode,oSql,para);
				if(oFld && oFld.length>0)
					return oFld;
				else
					return null;
			}catch(ex){
				bitsObjectMng._dump("getFolder():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getMaxOrderFormPID : function(aPID,aMode,aTransaction){
			try{
				if(!aPID) return null;
				if(aTransaction == undefined) aTransaction = true;
				if(aMode == undefined || aMode == ""){
					var rtnValue = 0;
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpValue = bitsObjectMng.Database.getMaxOrderFormPID(aPID,mode,aTransaction);
						if(tmpValue && tmpValue>rtnValue) rtnValue = tmpValue;
					}
					return rtnValue;
				}
				var oSql = 'select max(pfid_order) as max_order from (select pfid_order FROM om_link where pfid=' + aPID +' union select pfid_order from om_folder where pfid=' + aPID +')';
				var rtn = this.selectCount(aMode,oSql,aTransaction);
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.getMaxOrderFormPID():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getMaxObjectOrderFormPID : function(aPID,aMode){
			try{
				if(!aPID) return null;
				if(aMode == undefined || aMode == ""){
					var rtnValue = 0;
					var mode;
					for(mode in this._dbConn){
						if(typeof this._dbConn[mode] == "function") continue;
						var tmpValue = bitsObjectMng.Database.getMaxObjectOrderFormPID(aPID,mode);
						if(tmpValue && tmpValue>rtnValue) rtnValue = tmpValue;
					}
					return rtnValue;
				}
				var oSql = 'select max(pfid_order) as max_order FROM om_link where pfid=' + aPID;
				var rtn = this.selectCount(aMode,oSql);
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.getMaxObjectOrderFormPID():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		getFavicon : function(aURL,aMode){
			try{
				if(!aURL) return undefined;
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				var image_data;
				var mime;
				var array = {};
				var size = {};
				try{
					var pageURI = bitsObjectMng.Common.convertURLToObject(aURL);
					var faviconURI = bitsObjectMng.Common.FAVICON.getFaviconForPage(pageURI);
				}catch(ex2){}
				if(!faviconURI) return null;
				if(array.value==undefined){
					var mimeType = {};
					var dataLen  = {};
					var dataArr = bitsObjectMng.Common.FAVICON.getFaviconData(faviconURI,mimeType,dataLen);
					mime = mimeType.value;
					size.value = dataLen.value;
					if(size.value>0){
						array.value = dataArr;
					}
				}
				if(array.value){
					var images = String.fromCharCode.apply(String, array.value);
					image_data = 'data:' + mime + ';base64,' + btoa(images);
				}
				return image_data;
			}catch(ex){
				bitsObjectMng._dump("getFavicon():"+ex);
				return null;
			}
		},

/////////////////////////////////////////////////////////////////////
		removeObject : function(aObject,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				if(aTransaction) if(!this.beginTransaction(aMode)) return false;
				var rtn = false;
				if(aObject && aObject.oid){
					rtn = this.removeLink(aObject,aMode,false);
					if(rtn && this._oidCount(aMode,aObject.oid,false) == 0){
						var aSql = "delete from om_object";
						aSql += ' where oid="'+ aObject.oid +'"';
						rtn = this.cmd(aMode,aSql,false);
					}
				}
				if(!rtn){
					bitsObjectMng._dump("bitsObjectMng.Database.removeObject():rtn=["+rtn+"]");
				}

				if(rtn){
					var dDir = this.getObjectDir(aObject.oid,aMode);
					if(dDir.exists()) dDir.remove(true);
					dDir = undefined;
				}
				if(aTransaction) this.endTransaction(aMode);
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tDELETE\tOBJECT");
				return rtn;
			}catch(ex){
				if(aTransaction) this.endTransaction(aMode);
				bitsObjectMng._dump("Database.removeObject():"+ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		removeLink : function(aObject,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var aSql = "delete from om_link";
				if(aObject){
					if(aObject.oid && aObject.pfid){
						aSql += ' where oid='+ aObject.oid +' and pfid='+ aObject.pfid;
					}else if(aObject.oid){
						aSql += ' where oid='+ aObject.oid;
					}
				}
				var rtn = this.cmd(aMode,aSql,aTransaction);
				if(!rtn) bitsObjectMng.Common.alert("removeLink()!!");
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.removeLink():"+ex);
				bitsObjectMng._dump("Database.removeLink():"+aSql);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		removeFolder : function(aID,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				if(aTransaction) if(!this.beginTransaction(aMode)) return null;
				var lSql = 'select oid from om_link';
				if(aID) lSql += ' where pfid="'+ aID +'"';
				var lFld = [];
				var statement = this._dbConn[aMode].createStatement(lSql);
				while(statement.executeStep()){
					var row = [];
					for(var j=0,k=statement.columnCount;j<k;j++){
						row[statement.getColumnName(j)] = statement.getUTF8String(j);
						if(row[statement.getColumnName(j)] == "null") row[statement.getColumnName(j)] = "";
					}
					lFld.push(row);
				}
				statement.reset();
				statement = undefined;
				if(lFld && lFld.length>0){
					var oSql = 'delete from om_object where oid=?1';
					for(var i=0;i<lFld.length;i++){
						try{
							statement = this._dbConn[aMode].createStatement(oSql);
							statement.bindUTF8StringParameter(0,lFld[i].oid);
							statement.execute();
							statement.reset();
						}catch(ex2){
							bitsObjectMng._dump("bitsObjectMng.Database.removeFolder():"+ex2);
							bitsObjectMng._dump("bitsObjectMng.Database.removeFolder():lFld["+i+"].oid=["+lFld[i].oid+"]");
						}
					}
					statement = undefined;
					lSql = 'delete from om_link';
					if(aID) lSql += ' where pfid="'+ aID +'"';
					statement = this._dbConn[aMode].createStatement(lSql);
					statement.execute();
					statement.reset();
					statement = undefined;
				}
				var fSql = 'select fid from om_folder';
				if(aID) fSql += ' where pfid="'+ aID +'"';
				var fFld = [];
				var statement = this._dbConn[aMode].createStatement(fSql);
				while(statement.executeStep()){
					var row = [];
					for(var j=0,k=statement.columnCount;j<k;j++){
						row[statement.getColumnName(j)] = statement.getUTF8String(j);
						if(row[statement.getColumnName(j)] == "null") row[statement.getColumnName(j)] = "";
					}
					fFld.push(row);
				}
				statement.reset();
				statement = undefined;
				if(fFld && fFld.length>0){
					for(var i=0;i<fFld.length;i++){
						bitsObjectMng.Database.removeFolder(fFld[i].fid,aMode,false);
					}
				}
				var aSql = "delete from om_folder";
				if(aID) aSql += ' where fid="'+ aID +'"';
				var rtn = this.cmd(aMode,aSql,false);
				if(aTransaction) this.endTransaction(aMode);
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tDELETE\tFOLDER");
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.removeFolder():"+ex);
				if(aSql) bitsObjectMng._dump("Database.removeFolder():"+aSql);
				if(aTransaction) this.endTransaction(aMode);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		updateObject : function(aObject,aMode){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				var rtn = true;
				var om_link = {};
				var values = [];
				var para = [];
				var index=0;
				if(aObject.style) delete aObject.style;
				if(aObject.cssstyle) delete aObject.cssstyle;
				if(aObject.oid_property) aObject.oid_property = this._updateOidProperty(aObject,aMode);
				var key;
				for(key in aObject){
					if(aObject[key] == undefined || key == "oid") continue;
					if(key == "pfid" || key == "pfid_new"){
						om_link.pfid = aObject[key];
						continue;
					}
					if(key == "pfid_old"){
						om_link.pfid_old = aObject[key];
						continue;
					}
					if(key == "pfid_order"){
						om_link.pfid_order = aObject[key];
						continue;
					}
					values.push(key+'=?'+(++index));
					para.push(aObject[key]);
				}
				if(!aObject.oid || aObject.oid == "") rtn = false;
				if(rtn && om_link.pfid != undefined && om_link.pfid_old != undefined){
					if(rtn){
						if(om_link.pfid != om_link.pfid_old) rtn = !this._linkExists(aMode, {oid:aObject.oid, pfid:om_link.pfid});
						if(!rtn) bitsObjectMng._dump("bitsObjectMng.Database.updateObject():_linkExists=["+ !rtn + "]");
					}
					if(rtn){
						var aSql = 'update om_link set pfid="'+ om_link.pfid +'" where oid="'+ aObject.oid +'" and pfid="'+ om_link.pfid_old +'"';
						rtn = this.cmd(aMode,aSql);
					}
				}
				if(rtn && om_link.pfid != undefined && om_link.pfid_order != undefined){
					var aSql = 'update om_link set pfid_order="'+ om_link.pfid_order +'" where oid="'+ aObject.oid +'" and pfid="'+ om_link.pfid +'"';
					rtn = this.cmd(aMode,aSql);
				}
				if(rtn && values.length>0){
					var aSql = 'update om_object set '+ values.join(",") +' where oid="'+ aObject.oid +'"';
                                        //alert("UPDATE oid: "+aObject.oid);
                                        annotationProxy.updateAnnotation(aObject);
					rtn = this.cmdB(aMode,aSql,para);
				}
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tUPDATE\tOBJECT");
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.updateObject():"+ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		updateObjectBLOB : function(aOID,aArray,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var rtn = true;
				var om_link = {};
				var values = [];
				if(!aOID || !aArray) return false;
				var imgFile = this.getObjectBLOBFile(aOID,aMode);
				if(!imgFile.exists()) imgFile.create(imgFile.NORMAL_FILE_TYPE, 0664);
				var regexp = new RegExp("^data:image/\\w+?;base64,");
				if(typeof aArray == "object" && aArray.length != undefined){
					var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
					ostream.init(imgFile, 0x04 | 0x08 | 0x20, 664, 0); // write, create, truncate
					var bstream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);
					bstream.setOutputStream(ostream);
					bstream.writeByteArray(aArray, aArray.length);
					ostream.close();
				}else if(typeof aArray == "string" && regexp.test(aArray)){
					bitsObjectMng.Common.saveDataUrlToFile(aArray,imgFile);
				}else{
					return false;
				}
				if(aTransaction) if(!this.beginTransaction(aMode)) return null;
				var statement = this._dbConn[aMode].createStatement('update om_object set oid_img=?1 where oid = ?2');
				statement.bindNullParameter(0);
				statement.bindUTF8StringParameter(1,aOID);
				statement.execute();
				statement.reset();
				if(aTransaction) this.endTransaction(aMode);
				statement = undefined;
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("Database.updateObjectBLOB():"+ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		updateFolder : function(aFolder,aMode,aTransaction){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				if(aTransaction == undefined) aTransaction = true;
				var values = [];
				var para = [];
				var index=0;
				var key;
				for(key in aFolder){
					if(aFolder[key] == undefined || key == "fid") continue;
					values.push(key+'=?'+(++index));
					para.push(aFolder[key]);
				}
				if(values.length == 0 || !aFolder.fid|| aFolder.fid == "") return false;
				var aSql = 'update om_folder set ' + values.join(",") + ' where fid="'+ aFolder.fid +'"';
				var rtn = this.cmdB(aMode,aSql,para,aTransaction);
				if(rtn) nsPreferences.setUnicharPref("wiredmarker.last_update", bitsObjectMng.Common.getTimeStamp()+"\t"+aMode+"\t"+bitsObjectMng.DataSource.inittime + "\tUPDATE\tFOLDER");
				return rtn;
			}catch(ex){
				bitsObjectMng._dump("ERROR!!:Database.updateFolder():"+ex);
				return false;
			}
		},

/////////////////////////////////////////////////////////////////////
		initSeq : function (){
			this._seqmin = bitsObjectMng.Common.getTimeStamp();
			this._seq = [];
		},

/////////////////////////////////////////////////////////////////////
		_seqIdentify : function (aID,aMode){
			if(aID == undefined) aID = bitsObjectMng.Common.getTimeStamp();
			if(aMode == undefined || aMode == "") aMode = this._defaultMode;
			var i = 0;
			while(this._seq[aID] && i < 100){
				aID = ""+parseInt(this._seqmin)-1;
			}
			this._seq[aID] = aID.toString();
			if(parseInt(aID) < parseInt(this._seqmin)) this._seqmin = this._seq[aID];
			return this._seq[aID];
		},

/////////////////////////////////////////////////////////////////////
		makeObjectToItem : function(aObject,aAbout){
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			var app_version = parseInt(info.version);
			var xmldoc = null;
			if(aObject.oid_property && aObject.oid_property != ""){
				try{
					var parser = new DOMParser();
					xmldoc = parser.parseFromString(aObject.oid_property, "text/xml");
					parser = undefined;
				}catch(ex){}
				if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
			}
			var newItem = bitsObjectMng.Common.newItem();
			newItem.about = (aAbout?aAbout:bitsObjectMng.DataSource.getAbout(aObject.oid,aObject.pfid,aObject.dbtype));
			newItem.id = aObject.oid;
			newItem.type = "item";
			newItem.title = aObject.oid_title;
			newItem.comment = "";
			newItem.uri = aObject.doc_url;
			newItem.date = aObject.oid_date;
			if(aObject.oid_type.match(/^image\/(.+)$/)){
				if(app_version>2){
					var blobFile = this.getObjectBLOBFile(aObject.oid,aObject.dbtype);
					if(blobFile.exists()){
						if(blobFile.fileSize>0){
							var url = bitsObjectMng.Common.convertFilePathToURL(blobFile.path);
							if(url) newItem.icon = url;
						}else if(aObject.oid_txt){
							if(bitsObjectMng.Common.getImageFromURL(aObject.oid_txt, blobFile)){
								if(blobFile.exists() && blobFile.fileSize>0){
									var url = bitsObjectMng.Common.convertFilePathToURL(blobFile.path);
									if(url) newItem.icon = url;
								}
							}
						}
					}
				}
			}else if(aObject.oid_type == "url"){
				newItem.icon = this.getFavicon(aObject.oid_txt,aObject.dbtype);
				if(!newItem.icon) newItem.icon = this.getFavicon(aObject.doc_url,aObject.dbtype);
			}else{
				var icon;
				if(xmldoc){
					var xmlnode = xmldoc.getElementsByTagName("ICON")[0];
					if(xmlnode) icon = xmlnode.textContent;
				}else{
					if(aObject.oid_property.match(/^.*<ICON>(.+?)<\/ICON>.*$/m)){
						icon = RegExp.$1;
					}
				}
				if(icon != undefined && icon != ""){
					var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
					url.spec = icon;
					if(url.scheme == "file"){
						var file = bitsObjectMng.Common.convertURLToFile(icon)
						if(!file.exists()) icon = undefined;
					}else if(url.scheme == "chrome"){
						var val = this.existsIcon(url);
						if(!val) icon = undefined;
					}
				}
				if(icon != undefined && icon != "") newItem.icon = icon;
			}
			if(!newItem.icon){
				try{
					newItem.icon = this.getFavicon(aObject.doc_url,aObject.dbtype);
					if(newItem.icon == undefined) delete newItem.icon;
				}catch(ex){}
			}
			if(!newItem.icon){
				if(aObject.oid_type.match(/^image\//)){
					newItem.icon = "chrome://markingcollection/skin/image.png";
				}else{
					newItem.icon = "chrome://markingcollection/skin/defaultFavicon.png";
				}
			}
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("TREE_TITLE")[0];
				if(xmlnode) newItem.title = xmlnode.textContent;
			}else if(aObject.oid_property){
				if(aObject.oid_property.match(/^.*<TREE_TITLE>(.+?)<\/TREE_TITLE>.*$/m)){
					newItem.title = RegExp.$1;
				}
			}
			if(!aObject.oid_type.match(/^image\/(.+)$/)){
				newItem.source = bitsMarker.id_key+aObject.dbtype+aObject.oid;
			}
			newItem.editmode = aObject.oid_mode;
			newItem.pfid = aObject.pfid;
			newItem.pfid_order = aObject.pfid_order;
			newItem.dbtype = aObject.dbtype;
			newItem.list = null;
			return newItem;
		},

/////////////////////////////////////////////////////////////////////
		existsIcon : function(aURI){
			var rtn = false;
			try{
				const IOService = bitsObjectMng.Common.IO;
				var channel = IOService.newChannelFromURI(aURI);
				var stream  = channel.open();
				var bstream = Components.classes['@mozilla.org/binaryinputstream;1'].createInstance(Components.interfaces.nsIBinaryInputStream);
				bstream.setInputStream(stream);
				if(bstream.available()>0) rtn = true;
				bstream.close();
				stream.close();
			}
		  catch(e){}
		  return rtn;
		},

/////////////////////////////////////////////////////////////////////
		makeRdf : function (aID,aRecursive,aNewID,aPfid2Folder,aFid2Folder,aPfid2Object,aFile,aMode){
			try{
				if(aMode == undefined || aMode == "") aMode = this._defaultMode;
				var baseID = aID;
				var results = [];
				var dirArray = [];
				var fileArray = [];
				var folders = null;
				if(aID == undefined){
					baseID = "0";
					folders = aPfid2Folder[baseID];
				}else{
					folders = aFid2Folder[baseID];
				}
				if(folders){
					var folderFilterHash;
					var tmpFolderFilter = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
					var tmpFolderFilterArr = tmpFolderFilter.split("\t");
					var i;
					for(i=0;i<tmpFolderFilterArr.length;i++){
						if(!tmpFolderFilterArr[i].match(/^(\d+):(\d+):(.+)$/)) continue;
						if(!folderFilterHash) folderFilterHash = {};
						var filter_fid = RegExp.$1;
						var filter_casesensitive = RegExp.$2;
						var filter_keyword = RegExp.$3;
						folderFilterHash[filter_fid] = new RegExp(filter_keyword,(filter_casesensitive==1)?"mg":"img");
					}
					tmpFolderFilterArr = undefined;
					tmpFolderFilter = undefined;
					var icon;
					var i;
					for(i=0;i<folders.length;i++){
						var newItem = bitsObjectMng.Common.newItem();
						newItem.about = bitsObjectMng.DataSource.getAbout(folders[i].fid,folders[i].pfid,aMode);
						newItem.id = folders[i].fid;
						newItem.pfid = folders[i].pfid;
						newItem.type = "folder";
						newItem.title = folders[i].fid_title;
						newItem.comment = "";
						newItem.style = folders[i].fid_style;
						newItem.editmode = folders[i].fid_mode;
						newItem.pfid_order = folders[i].pfid_order;
						newItem.cssrule = 'css_'+aMode+'_'+folders[i].fid;
						newItem.dbtype = folders[i].dbtype;
						newItem.Folder = "true";
						newItem.list = null;
						newItem.addon_id = "";
						newItem.contextmenu = "";
						newItem.shortcut = "";
						bitsObjectMng.DataSource.setID2About(folders[i].fid,folders[i].pfid,newItem.about,aMode);
						var xmldoc = null;
						if(folders[i].fid_property && folders[i].fid_property != ""){
							try{
								var parser = new DOMParser();
								xmldoc = parser.parseFromString(folders[i].fid_property, "text/xml");
								parser = undefined;
							}catch(ex){}
							if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
						}
						icon = undefined;
						if(folderFilterHash && folderFilterHash[folders[i].fid]) icon = "chrome://markingcollection/skin/filter.png";
						if(!icon){
							if(xmldoc){
								var xPathResult = bitsObjectMng.XPath.evaluate('/PROPERTY[1]/ADDON[1]/ICON[1]', xmldoc);
								if(xPathResult && xPathResult.snapshotLength>0){
									icon = xPathResult.snapshotItem(0).textContent;
								}else{
									var xmlnode = xmldoc.getElementsByTagName("ICON")[0];
									if(xmlnode) icon = xmlnode.textContent;
								}
								xPathResult = undefined;
								var xPathResult = bitsObjectMng.XPath.evaluate('/PROPERTY[1]/ADDON[1]/ID[1]', xmldoc);
								if(xPathResult && xPathResult.snapshotLength>0){
									if(newItem.addon_id != "") newItem.addon_id += "\n";
									newItem.addon_id = xPathResult.snapshotItem(0).textContent;
								}
								xPathResult = undefined;
							}else if(folders[i].fid_property){
								if(folders[i].fid_property.match(/^.*<ICON>(.+?)<\/ICON>.*$/m)){
									icon = RegExp.$1;
								}
							}
						}
						if(icon != undefined && icon != ""){
							var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
							url.spec = icon;
							if(url.scheme == "file"){
								var file = bitsObjectMng.Common.convertURLToFile(icon)
								if(!file.exists()) icon = undefined;
							}else if(url.scheme == "chrome"){
								var val = this.existsIcon(url);
								if(!val) icon = undefined;
							}
						}
						if(icon != undefined && icon != "") newItem.icon = icon;
						var contextmenu;
						contextmenu = undefined;
						if(xmldoc){
							var xPathResult = bitsObjectMng.XPath.evaluate('/PROPERTY[1]/CONTEXTMENU[1]', xmldoc);
							if(xPathResult && xPathResult.snapshotLength>0){
								contextmenu = xPathResult.snapshotItem(0).textContent;
							}else{
								var xmlnode = xmldoc.getElementsByTagName("CONTEXTMENU")[0];
								if(xmlnode) contextmenu = xmlnode.textContent;
							}
							xPathResult = undefined;
						}else if(folders[i].fid_property){
							if(folders[i].fid_property.match(/^.*<CONTEXTMENU>(.+?)<\/CONTEXTMENU>.*$/m)){
								contextmenu = RegExp.$1;
							}
						}
						if(contextmenu != undefined && contextmenu != "") newItem.contextmenu = contextmenu;
						dirArray.push(newItem);
					}
					folders = undefined
				}else{
					return null;
				}
				if(dirArray.length>0){
					var cnt;
					for(cnt=0;cnt<dirArray.length;cnt++){
						var result = [];
						if(aRecursive){
							var folders = aPfid2Folder[dirArray[cnt].id];
							if(folders){
								var i;
								for(i=0;i<folders.length;i++){
									var rtn = this.makeRdf(folders[i].fid,aRecursive,aNewID,aPfid2Folder,aFid2Folder,aPfid2Object,undefined,aMode);
									if(!rtn || !rtn.list) continue;
									result = result.concat(rtn.list);
								}
							}
						}
						var objects = aPfid2Object[dirArray[cnt].id];
						if(objects){
							var i;
							for(i=0;i<objects.length;i++){
								var newItem = this.makeObjectToItem(objects[i]);
								fileArray.push(newItem);
							}
							objects = undefined
						}
						if(fileArray.length>0) result = result.concat(fileArray);
						dirArray[cnt].list = result;
						results.push(dirArray[cnt]);
						result = null;
						fileArray = [];
					}
				}
				dirArray = null;
				fileArray = null;
				if(aFile != undefined){
					var out_txt = "";
					var out_txt_utf8 = "";
					out_txt += '<?xml version="1.0"?>\n';
					out_txt += '<RDF:RDF xmlns:NS1="' + bitsObjectMng.NS_OBJECTMANAGEMENT + '"\n';
					out_txt += '         xmlns:NC="http://home.netscape.com/NC-rdf#"\n';
					out_txt += '         xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n';
					out_txt += '  <RDF:Seq RDF:about="'+ bitsObjectMng.DataSource.ABOUT_ROOT +'">\n';
					if(results){
						var cnt;
						for(cnt=0;cnt<results.length;cnt++){
							out_txt += '    <RDF:li RDF:resource="'+ results[cnt].about +'"/>\n';
						}
					}
					out_txt += '  </RDF:Seq>\n';
					out_txt += this._outputRDF(results);
					out_txt += '</RDF:RDF>\n';
					bitsObjectMng.Common.writeFile(aFile,out_txt,"UTF-8");
				}
				return {list:results, id:baseID };
			}catch(e){
				bitsObjectMng._dump("bitsObjectMng.makeRdf()"+e);
				return undefined;
			}
		},

/////////////////////////////////////////////////////////////////////
		_outputRDF : function(pArray){
			var cnt;
			var seq;
			var key;
			var out_txt = "";
			for(cnt=0;cnt<pArray.length;cnt++){
				if(pArray[cnt].list){
					out_txt += '  <RDF:Seq RDF:about="'+ pArray[cnt].about +'">\n';
					if(pArray[cnt].list){
						pArray[cnt].list.sort(
							function(a,b){
								var len = parseInt(a.pfid_order)-parseInt(b.pfid_order);
								return len;
							}
						);
						for(seq=0;seq<pArray[cnt].list.length;seq++){
							out_txt += '    <RDF:li RDF:resource="'+ pArray[cnt].list[seq].about +'"/>\n';
						}
					}
					out_txt += '  </RDF:Seq>\n';
				}
				if(pArray[cnt].id != "0"){
					out_txt += '  <RDF:Description RDF:about="' + pArray[cnt].about +'"';
					for(key in pArray[cnt]){
						if(key == "list") continue;
						if(key == "about") continue;
						if(pArray[cnt][key] == undefined) continue;
						if(typeof pArray[cnt][key] == "function") continue;
						pArray[cnt][key] = pArray[cnt][key].replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
						if(pArray[cnt][key] != undefined) out_txt += '\n                   NS1:'+key+'="'+pArray[cnt][key]+'"';
					}
					out_txt += '/>\n';
				}
				if(pArray[cnt].list){
					out_txt += this._outputRDF(pArray[cnt].list);
				}
			}
			return out_txt;
		},

/////////////////////////////////////////////////////////////////////
	},

};
