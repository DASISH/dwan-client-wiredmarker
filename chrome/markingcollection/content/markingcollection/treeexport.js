var bitsTreeExportService = {
	_openurl : "",
	_doc     : null,
	_loaddoc : null,
	_url     : "",
	_fileid  : "",
	_savehtml : [],
	appDataDir  : null,
	appDataURL  : "",
	appDataSTRING : "",
	appDataURLExp : null,
	zipApp : null,
	zipAppScript : null,

/////////////////////////////////////////////////////////////////////
	get STRING() { return document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get xmldoc(){ return this._xmldoc; },

	get appDataAddSTRING(){ return ".cache_files"; },

/////////////////////////////////////////////////////////////////////
	init : function(){
		try{
			this.appDataDir = window.top.bitsMarkingCollection.getExtensionDir().clone();
			this.appDataURL = this.Common.convertFilePathToURL(this.appDataDir.path);
			this.appDataURL = this.appDataURL.replace(/\/$/mg,"");
			this.appDataSTRING = "";
			this.appDataURLExp = new RegExp("^"+this.appDataURL);
			var paths;
			var zipapp;
			var env_path = this.Common.ENV.get("PATH");
			if(navigator.platform == "Win32"){
//				paths = env_path.split(';');
//				zipapp = "CScript.exe";
			}else{
				paths = env_path.split(':');
				zipapp = "zip";
			}
			if(paths){
				var i;
				for(i=0;i<paths.length;i++) {
					try {
					  var zfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						zfile.initWithPath(paths[i]);
						zfile.append(zipapp);
						if(zfile.exists()){
							this.zipApp = zfile.clone();
							if(navigator.platform == "Win32"){
								var zipAppScript = window.top.bitsMarkingCollection.getExtInstDir().clone();
								if(zipAppScript){
									zipAppScript.append("bin");
									zipAppScript.append("makeZIP.vbs");
									if(zipAppScript.exists()) this.zipAppScript = zipAppScript.clone();
									zipAppScript = undefined;
								}
							}
							break;
						}
					}
					catch(ex2) {}
					zfile = undefined;
				}
			}
		}catch(ex){
			this._dump("bitsTreeExportService.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(){},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	click : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	blur : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onPopupHiding : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onCommand : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	validateFileName : function(aFileName){
		var re = /[\/]+/g;
		if (navigator.appVersion.indexOf("Windows") != -1) {
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
		}else if (navigator.appVersion.indexOf("Macintosh") != -1)
			re = /[\:\/]+/g;
		return aFileName.replace(re, "_");
	},

/////////////////////////////////////////////////////////////////////
	getSaveFile : function (aTitle){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = null;
		try{
			picker.init(window, "Selected Save File ["+aTitle+"]", picker.modeSave);
			if(aTitle) picker.defaultString  = aTitle + ".xml";
			picker.defaultExtension = ".xml";
			picker.appendFilter("XML (*.xml)","*.xml");
			picker.appendFilter("All Files (*.*)","*.xml");
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				result = picker.file;
			}else if(showResult == picker.returnReplace){
				if(picker.file.exists()) picker.file.remove(false);
				result = picker.file;
			}
		}catch(e){
			result = null;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getSaveFolder : function (aTitle){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = null;
		try{
			picker.init(window, "Selected Exports Folder ["+aTitle+"]", picker.modeGetFolder);
			if(aTitle) picker.defaultString  = aTitle;
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				result = picker.file;
			}else if(showResult == picker.returnReplace){
				if(picker.file.exists()) picker.file.remove(false);
				result = picker.file;
			}
		}catch(e){
			result = null;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	getTemplateDir : function(){},

/////////////////////////////////////////////////////////////////////
	createMenu : function(aParentNode,aEntry){},

/////////////////////////////////////////////////////////////////////
	loadText : function(aURI){},

/////////////////////////////////////////////////////////////////////
	_getZipEntry : function(aZipEntry){
		return escape(aZipEntry);
	},

/////////////////////////////////////////////////////////////////////
	addEntryDirectory : function(aZipWriter,aDir,aParentPath){
		var entries = aDir.directoryEntries;
		while(entries.hasMoreElements()){
			var pDir = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!pDir.isDirectory()) continue;
			var entryName = (aParentPath?aParentPath+"/":"") + pDir.leafName;
			if(!aZipWriter.hasEntry(this._getZipEntry(entryName))) aZipWriter.addEntryDirectory(this._getZipEntry(entryName), pDir.lastModifiedTime, false);
			this.addEntryDirectory(aZipWriter, pDir, entryName);
		}
	},

/////////////////////////////////////////////////////////////////////
	addEntryFile : function(aZipWriter,aDir,aParentPath){
		var entries = aDir.directoryEntries;
		while(entries.hasMoreElements()){
			var pDir = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			var entryName = (aParentPath?aParentPath+"/":"") + pDir.leafName;
			if(pDir.isDirectory()){
				this.addEntryFile(aZipWriter, pDir, entryName);
			}else{
				if(!aZipWriter.hasEntry(this._getZipEntry(entryName))) aZipWriter.addEntryFile(this._getZipEntry(entryName), Components.interfaces.nsIZipWriter.COMPRESSION_FASTEST, pDir, false);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	saveFile : function(aEvent){
		try{
			aEvent.preventDefault();
			aEvent.stopPropagation();
			this._savehtml.length = 0;
			this._savehtml = [];
			var contentWindow = null;
			var mcTreeHandler = null;
			if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
			if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
			if(!mcTreeHandler) return;
			var curIdx = mcTreeHandler.TREE.currentIndex;
			if(curIdx<0) return;
			var aRes = null;
			if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			aRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			var fid = this.DataSource.getProperty(aRes,"id");
			var dbtype = this.DataSource.getProperty(aRes,"dbtype");
			if(fid != "0"){
				var foldres = this.Database.getFolderFormID(fid,dbtype);
				if(foldres) this._saveFile(foldres[0]);
			}else{
				this._saveFile({fid:fid,dbtype:dbtype,fid_title:this.DataSource.getProperty(aRes,"title"),fid_property:""});
			}
		}catch(ex){
			this.Common.alert("bitsTreeExportService.saveFile():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	createXMLDoc : function(aContent){
		var parser = new DOMParser();
		this._xmldoc = parser.parseFromString(aContent, "text/xml");
		parser = undefined;
	},

/////////////////////////////////////////////////////////////////////
	xmlSerializer : function(){
		var s = new XMLSerializer();
		var aContent = s.serializeToString(this.xmldoc);
		s = undefined;
		return aContent;
	},

/////////////////////////////////////////////////////////////////////
	_saveFile : function(aFolder){
		try{
			var prompts = this.Common.PROMPT;
			var title = this.STRING.getString("APP_DISP_TITLE");
			var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_YES +
			            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_NO +
			            prompts.BUTTON_POS_0_DEFAULT;
			var checkMsg = this.STRING.getString("CHECK_EXPORT_IN_CACHE_DOCUMENT");
			var checkState = {value: false};
			var button = prompts.confirmEx(
										window,
										title,
										this.STRING.getString("CONFIRM_EXPORT"),
										flags, "", "", "", checkMsg, checkState);
			if(button!=0) return;
			var cache_export = checkState.value;
			var saveFolder = this.getSaveFolder(aFolder.fid_title);
			if(!saveFolder) return;
			var tmpDir = window.top.bitsMarkingCollection.getTmpDir().clone();
			tmpDir.append(this.STRING.getString("APP_TITLE"));
			tmpDir.createUnique(tmpDir.DIRECTORY_TYPE, 0777);
			tmpDir.append(this._getZipEntry(this.validateFileName(aFolder.fid_title)));
			if(tmpDir.exists()) tmpDir.remove(true);
			if(!tmpDir.exists()) tmpDir.create(tmpDir.DIRECTORY_TYPE, 0777);
			var file = tmpDir.clone();
			file.append(this._getZipEntry(this.validateFileName(aFolder.fid_title))+".xml");
			var leafName = unescape(file.leafName);
			var filename = this.Common.splitFileName(leafName)[0];
			this.appDataSTRING = this.appDataAddSTRING;
			var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
			var aURL = this.Common.convertURLToObject("chrome://markingcollection/content/treeexport.xsl");
			var stylesheet = bitsTreeListService.loadText(aURL);
			if(stylesheet && stylesheet != ""){
				var type = "xsl";
				aContent += '<?xml-stylesheet type="text/'+type+'" href="#treeexport"?>\n';
			}
			aContent += '<!DOCTYPE LIST';
			aContent += '[\n';
			aContent += '  <!ATTLIST xsl:stylesheet id ID #REQUIRED>\n';
			aContent += ']';
			aContent += '>\n<LIST title="'+ this.xmlEncode(aFolder.fid_title) +'">\n';
			if(stylesheet && stylesheet != "") aContent += stylesheet+'\n';
			aContent += "</LIST>\n";
			this.createXMLDoc(aContent);
			bitsTreeExportService.createID2OBJ(aFolder);
			bitsTreeExportService.createXML(aFolder,this.xmldoc.documentElement);
			if(cache_export){
				var urlhash = {};
				var oid;
				for(oid in this.id2obj){
					if(urlhash[this.id2obj[oid].uri]) continue;
					urlhash[this.id2obj[oid].uri] = true;
					var histdbs = window.top.bitsAutocacheService._selectHistoryDB({uid_url:this.id2obj[oid].uri});
					if(!histdbs) continue;
					var histcnt;
					for(histcnt=0;histcnt<histdbs.length;histcnt++){
						var cacheDir = window.top.bitsAutocacheService.getURLCacheDirFromTimeStamp(histdbs[histcnt].uid_url,histdbs[histcnt].hid_date);
						if(!cacheDir || !cacheDir.exists()) continue;
						this._savehtml.push(cacheDir.clone());
					}
				}
				urlhash = undefined;
			}
			aContent = this.xmlSerializer();
			this.Common.writeFile(file, aContent, "UTF-8");
			try{
				var nsIZipWriter = Components.interfaces.nsIZipWriter;
				var zipWriter = Components.classes["@mozilla.org/zipwriter;1"].createInstance(nsIZipWriter);
			}catch(e){}
			var zipFile;
			if(zipWriter){
				var parent = tmpDir.parent.clone();
				zipFile = saveFolder.clone();
				zipFile.append(filename+".zip");
				if(zipFile.exists()){
					var filecnt;
					for(filecnt=1;;filecnt++){
						zipFile = saveFolder.clone();
						zipFile.append(filename+"("+filecnt+")"+".zip");
						if(!zipFile.exists()) break;
					}
				}
				if(!zipFile.exists()) zipFile.create(zipFile.NORMAL_FILE_TYPE, 0664);
				zipWriter.open(zipFile, 0x04 | 0x08 | 0x20);
				this.addEntryDirectory(zipWriter, parent);
				this.addEntryFile(zipWriter, parent);
			}
			var savePath = null;
			if(this._savehtml.length>0){
				var i;
				if(zipWriter){
					for(i=0;i<this._savehtml.length;i++){
						var cachedir = this._savehtml[i].clone();
						if(!cachedir.exists()) continue;
						var parentPath = tmpDir.leafName + "/" + this.appDataSTRING + "/" + cachedir.parent.leafName + "/" + cachedir.leafName;
						this.addEntryDirectory(zipWriter,cachedir,parentPath);
						this.addEntryFile(zipWriter,cachedir,parentPath);
					}
				}else{
					savePath = file.parent.clone();
					savePath.append(this.appDataSTRING);
					if(savePath.exists()) savePath.remove(true);
					savePath.create(savePath.DIRECTORY_TYPE, 0777);
					for(i=0;i<this._savehtml.length;i++){
						var cachedir = this._savehtml[i].clone();
						if(!cachedir.exists()) continue;
						var sevaCachePath = savePath.clone();
						sevaCachePath.append(cachedir.parent.leafName);
						if(!sevaCachePath.exists()) sevaCachePath.create(sevaCachePath.DIRECTORY_TYPE, 0777);
						var copypath = sevaCachePath.clone();
						copypath.append(cachedir.leafName);
						if(copypath.exists()) copypath.remove(true);
						try{
							cachedir.copyTo(sevaCachePath,cachedir.leafName);
						}catch(e){
							this._dump("bitsTreeExportService.saveFile():"+e);
							if(!copypath.exists()) copypath.create(copypath.DIRECTORY_TYPE, 0777);
							this.Common.copyDirChilds(cachedir,copypath);
						}
					}
				}
			}
			var zipFile;
			if(zipWriter){
				var parent = tmpDir.parent.clone();
				zipWriter.close();
				if(parent.exists()) parent.remove(true);
			}else if(this.zipApp){
				try{
					var LANG = this.Common.getLang();
					var args = [];
					if(this.zipAppScript) args.push(this.Common.convertFormUnicode(this.zipAppScript.path,LANG));
					if(navigator.platform == "Win32") args.push("//Nologo");
					zipFile = saveFolder.clone();
					zipFile.append(filename+".zip");
					if(zipFile.exists()){
						var filecnt;
						for(filecnt=1;;filecnt++){
							zipFile = saveFolder.clone();
							zipFile.append(filename+"("+filecnt+")"+".zip");
							if(!zipFile.exists()) break;
						}
					}
					args.push(this.Common.convertFormUnicode(zipFile.path,LANG));
					if(navigator.platform == "Win32"){
						args.push(this.Common.convertFormUnicode(tmpDir.path,LANG));
					}else{
						args.push("-r");
						args.push(this.Common.convertFormUnicode(tmpDir.path,LANG));
					}
					var proc = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
					proc.init(this.zipApp);
					proc.run(true, args, args.length);
					if(tmpDir.parent.exists()) tmpDir.parent.remove(true);
				}catch(ex2){
					this.Common.alert("bitsTreeExportService._saveFile():"+ex2);
					if(zipFile && zipFile.exists()) zipFile.remove(true);
					var parent = tmpDir.parent.clone();
					zipFile = saveFolder.clone();
					zipFile.append(tmpDir.leafName);
					if(zipFile.exists()){
						var filecnt;
						for(filecnt=1;;filecnt++){
							zipFile = saveFolder.clone();
							zipFile.append(tmpDir.leafName+"("+filecnt+")");
							if(!zipFile.exists()) break;
						}
					}
					tmpDir.moveTo(saveFolder,zipFile.leafName);
					if(parent.exists()) parent.remove(true);
				}
			}else{
				var parent = tmpDir.parent.clone();
				zipFile = saveFolder.clone();
				zipFile.append(unescape(tmpDir.leafName));
				if(zipFile.exists()){
					var filecnt;
					for(filecnt=1;;filecnt++){
						zipFile = saveFolder.clone();
						zipFile.append(unescape(tmpDir.leafName)+"("+filecnt+")");
						if(!zipFile.exists()) break;
					}
				}
				tmpDir.moveTo(saveFolder,zipFile.leafName);
				if(parent.exists()) parent.remove(true);
			}
			var msg = this.STRING.getString("SUCCEEDED_EXPORT") + "\n";
			if(zipFile && zipFile.exists()){
				msg += zipFile.path;
			}else{
				msg += saveFolder.path;
			}
			var prompts = this.Common.PROMPT;
			var flags = prompts.BUTTON_TITLE_OK + prompts.BUTTON_POS_0_DEFAULT;
			var button = prompts.confirmEx(window, bitsTreeExportService.STRING.getString("APP_TITLE"), msg, flags, "", "", "", null, {});
		}catch(ex){
			this.Common.alert("bitsTreeExportService._saveFile():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	getBaseDir : function(){
		var dir  = window.top.bitsMarkingCollection.getExtensionDir().clone();
		dir.append("treelist");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getTreeListDir : function(){
		var dir  = this.getBaseDir().clone();
		dir.append(this._fileid);
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	xmlEncode : function(aString){
		return aString.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	},

/////////////////////////////////////////////////////////////////////
	_getAllObject : function(aFolder){
		var rtn = [];
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			var aocnt;
			for(aocnt=0;aocnt<Foldres.length;aocnt++){
				rtn = rtn.concat(this._getAllObject(Foldres[aocnt]));
			}
		}
		var Objects = this.Database.getObjectFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Objects) rtn = rtn.concat(Objects);
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_getAllFolder : function(aFolder){
		var rtn = [];
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			var aocnt;
			for(aocnt=0;aocnt<Foldres.length;aocnt++){
				rtn.push(Foldres[aocnt]);
				rtn = rtn.concat(this._getAllFolder(Foldres[aocnt]));
			}
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_getAllChild : function(aFolder){
		var rtn = [];
		var Foldres = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Foldres){
			Foldres.sort(function(a,b){ return a.pfid_order - b.pfid_order; });
			rtn = rtn.concat(Foldres);
		}
		var Objects = this.Database.getObjectFormPID(aFolder.fid,aFolder.dbtype,false);
		if(Objects){
			Objects.sort(function(a,b){ return a.pfid_order - b.pfid_order; });
			rtn = rtn.concat(Objects);
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	createID2OBJ : function(aFolder){
		var id2obj = {};
		var fid2style = {};
		var contResList = this._getAllObject(aFolder);
		if(contResList.length>0){
			var ocnt;
			for(ocnt=0;ocnt<contResList.length;ocnt++){
				var oid = contResList[ocnt].oid;
				if(id2obj[oid] != undefined) continue;
				var dbtype = contResList[ocnt].dbtype;
				var objects = this.Database.getObjectWithProperty({oid:oid},dbtype);
				if(!objects) continue;
				id2obj[oid] = {};
				var i=0;
				if(objects[i].oid_type.match(/^image\/(.+)$/)){
					var blob = this.Database.getObjectBLOB(objects[i].oid,dbtype);
					if(blob && blob.length>0 && blob[0].length>0){
						var images = String.fromCharCode.apply(String, blob[0]);
						var image_b64 = btoa(images); // base64 encoding
						image_b64 = 'data:' + objects[i].oid_type + ';base64,' + image_b64;
						id2obj[oid].img  = image_b64;
						/* システムで管理しているイメージの場合 */
						var blobFile = this.Database.getObjectBLOBFile(objects[i].oid,dbtype);
						var blobUrl = this.Common.convertFilePathToURL(blobFile.path);
						if(objects[i].doc_url == blobUrl) objects[i].doc_url = image_b64;
						if(objects[i].con_url == blobUrl) objects[i].con_url = image_b64;
					}
				}
				id2obj[oid].text = objects[i].oid_txt;
				id2obj[oid].uri = objects[i].doc_url;
				id2obj[oid].uri_title = objects[i].doc_title;
				id2obj[oid].con_url = objects[i].con_url;
				id2obj[oid].type = objects[i].oid_type;
				id2obj[oid].st = objects[i].bgn_dom;
				id2obj[oid].en = objects[i].end_dom;
				if(objects[i].oid_property && objects[i].oid_property != "") id2obj[oid].property = objects[i].oid_property;
				id2obj[oid].dbtype = objects[i].dbtype;
				id2obj[oid].date = objects[i].oid_date;
				id2obj[oid].mode = objects[i].oid_mode;
				if(fid2style[objects[i].pfid] == undefined){
					var folders = this.Database.getFolderFormID(objects[i].pfid,dbtype);
					if(folders && folders.length>0) fid2style[objects[i].pfid] = folders[0].fid_style.replace(/([:;\(,])\s+/mg,"$1");
				}
				if(fid2style[objects[i].pfid] != undefined) id2obj[oid].style = fid2style[objects[i].pfid];
			}
		}
		contResList = undefined;
		this.id2obj = id2obj;
	},

/////////////////////////////////////////////////////////////////////
	createTextNode : function(aString,aParentNode){
		if(aString && aString != ""){
			var elemS = this.xmldoc.createTextNode(aString);
			if(elemS) aParentNode.appendChild(elemS);
		}
	},

/////////////////////////////////////////////////////////////////////
	createElement : function(aTagName,aString,aParentNode,aTab){
		if(!aTagName || !aParentNode) return;
		if(aTab && aTab != ""){
			var elemT = this.xmldoc.createTextNode(aTab);
			if(elemT) aParentNode.appendChild(elemT);
		}
		var elem = this.xmldoc.createElement(aTagName);
		if(elem){
			if(aString){
				if(aString != ""){
					var elemS = this.xmldoc.createTextNode(aString);
					if(elemS) elem.appendChild(elemS);
				}
			}else{
				var elemR = this.xmldoc.createTextNode("\n");
				if(elemR) elem.appendChild(elemR);
			}
			aParentNode.appendChild(elem)
			var elemR = this.xmldoc.createTextNode("\n");
			if(elemR) aParentNode.appendChild(elemR);
		}
		return elem;
	},

/////////////////////////////////////////////////////////////////////
	createXML : function(aFolder,aParentNode,aDepth){
		if(aDepth == undefined) aDepth = 0;
		var aTab = "";
		var i;
		for(i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var fNode = this.createElement("FOLDER",undefined,aParentNode,aTab);
		this.createElement("FID_TITLE",aFolder.fid_title,fNode,aTab+"  ");
		var fid_note = aFolder.fid_property;
		if(fid_note && fid_note != ""){
			var parser = new DOMParser();
			var xmldoc = parser.parseFromString(fid_note, "text/xml");
			parser = undefined;
			if(xmldoc){
				var elem = xmldoc.getElementsByTagName("NOTE")[0];
				if(!elem) this.createElement("FID_NOTE",fid_note,fNode,aTab+"  ");
				xmldoc = undefined;
			}
		}
		if(aFolder.fid_mode) this.createElement("FID_MODE",aFolder.fid_mode,fNode,aTab+"  ");
		if(aFolder.fid_property && aFolder.fid_property != ""){
			var fid_property = aFolder.fid_property;
			var xmldic = bitsTreeProjectService._getDictionaryXML(aFolder.fid,aFolder.dbtype);
			if(xmldic){
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(fid_property, "text/xml");
				if(xmldoc && xmldoc.documentElement.nodeName == "parsererror"){
					xmldoc = undefined;
					xmldoc = parser.parseFromString("<PROPERTY/>", "text/xml");
					if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
				}
				parser = undefined;
				if(xmldoc){
					var clone = xmldic.documentElement.cloneNode(true);
					xmldoc.documentElement.appendChild(clone);
					var s = new XMLSerializer();
					fid_property = s.serializeToString(xmldoc);
					s = undefined;
				}
			}
			this.createElement("FID_PROPERTY",fid_property,fNode,aTab+"  ");
		}
		if(aFolder.fid_style && aFolder.fid_style != "") this.createElement("FID_STYLE",aFolder.fid_style,fNode,aTab+"  ");
		if(aFolder.dbtype && aFolder.dbtype != "") this.createElement("FID_DBTYPE",aFolder.dbtype,fNode,aTab+"  ");
		var contResList = this._getAllChild(aFolder);
		var i;
		for(i=0;i<contResList.length;i++){
			if(contResList[i].fid != undefined){
				bitsTreeExportService.createXML(contResList[i],fNode,aDepth+1);
			}else{
				bitsTreeExportService.createXMLObject(contResList[i],fNode,aDepth);
			}
		}
		this.createTextNode(aTab,fNode);
	},

/////////////////////////////////////////////////////////////////////
	createXMLObject : function(aObject,aParentNode,aDepth){
		var id2obj = this.id2obj;
		if(aDepth == undefined) aDepth = 0;
		var aTab = "";
		for(var i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var oid = aObject.oid;
		var alink = "";
		var structure = "";
		var hyperAnchor = "";
		var disp_image_size_x = "";
		var disp_image_size_y = "";
		var disp_image_size = "";
		var out_property = [];
		var xmldoc;
		var structureElem;
		if(aObject.oid_property && aObject.oid_property != ""){
			try{
				var parser = new DOMParser();
				xmldoc = parser.parseFromString(aObject.oid_property, "text/xml");
				parser = undefined;
			}catch(ex){}
			if(xmldoc && xmldoc.documentElement.nodeName == "parsererror"){
				id2obj[oid].property = "";
				xmldoc = undefined;
			}
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("LINK")[0];
				if(xmlnode) alink = xmlnode.textContent;
				/* STRUCTURE内のデータはxhtmlで格納されている為、そのまま出力する */
				xmlnode = xmldoc.getElementsByTagName("STRUCTURE")[0];
				if(xmlnode && xmlnode.hasChildNodes()){
					structureElem = xmlnode.cloneNode(true);
				}
				xmlnode = xmldoc.getElementsByTagName("IMG_LIST_DISP_SIZE")[0];
				if(xmlnode){
					disp_image_size = xmlnode.textContent;
					if(disp_image_size.match(/^(\d+),(\d+)$/mg)){
						disp_image_size_x = RegExp.$1;
						disp_image_size_y = RegExp.$2;
					}
				}
				xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
				if(xmlnode){
					out_property["NOTE"] = {};
					out_property["NOTE"].type  = "text";
					out_property["NOTE"].value = xmlnode.textContent;
				}
				xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
				if(xmlnode) hyperAnchor = xmlnode.textContent;
			}
		}
		var oNode = this.createElement("OBJECT",undefined,aParentNode,aTab+"  ");
		this.createElement("OID_TITLE",aObject.oid_title,oNode,aTab+"    ");
		if(out_property["NOTE"]) this.createElement("OID_NOTE",out_property["NOTE"].value,oNode,aTab+"    ");
		var tag;
		for(tag in out_property){
			if(typeof out_property[tag] == "function") continue;
			this.createElement("OID_PROPERTY_"+ tag,out_property[tag].value,oNode,aTab+"    ");
		}
		if(disp_image_size_x && disp_image_size_y){
			this.createElement("OID_IMG_DISP_WIDTH",disp_image_size_x,oNode,aTab+"    ");
			this.createElement("OID_IMG_DISP_HEIGHT",disp_image_size_x,oNode,aTab+"    ");
		}
		if(id2obj[oid].img) this.createElement("OID_IMG",id2obj[oid].img,oNode,aTab+"    ");
		if(id2obj[oid].uri) this.createElement("DOC_URL",id2obj[oid].uri,oNode,aTab+"    ");
		if(id2obj[oid].uri_title) this.createElement("DOC_TITLE",id2obj[oid].uri_title,oNode,aTab+"    ");
		if(id2obj[oid].st) this.createElement("BGN_DOM",id2obj[oid].st,oNode,aTab+"    ");
		if(id2obj[oid].en) this.createElement("END_DOM",id2obj[oid].en,oNode,aTab+"    ");
		if(id2obj[oid].con_url) this.createElement("CON_URL",id2obj[oid].con_url,oNode,aTab+"    ");
		if(id2obj[oid].type) this.createElement("OID_TYPE",id2obj[oid].type,oNode,aTab+"    ");
		if(id2obj[oid].date) this.createElement("OID_DATE",id2obj[oid].date,oNode,aTab+"    ");
		if(id2obj[oid].mode) this.createElement("OID_MODE",id2obj[oid].mode,oNode,aTab+"    ");
		if(alink != "") this.createElement("OID_LINK",alink,oNode,aTab+"    ");
		if(structureElem){
			var elem = this.createElement("OID_STRUCTURE","",oNode,aTab+"    ");
			var i;
			for(i=0;i<structureElem.childNodes.length;i++){
				elem.appendChild(structureElem.childNodes[i].cloneNode(true));
			}
		}
		if(id2obj[oid].text) this.createElement("OID_TXT",id2obj[oid].text,oNode,aTab+"    ");
		if(id2obj[oid].property) this.createElement("OID_PROPERTY",id2obj[oid].property,oNode,aTab+"    ");
		if(id2obj[oid].dbtype) this.createElement("OID_DBTYPE",id2obj[oid].dbtype,oNode,aTab+"    ");
		if(hyperAnchor != ""){
			this.createElement("HYPER_ANCHOR",hyperAnchor,oNode,aTab+"    ");
		}else if(id2obj[oid].con_url && id2obj[oid].st){
			var text = id2obj[oid].con_url + '#hyperanchor:' + this.xmlEncode(id2obj[oid].st);
			if(id2obj[oid].en) text += "&" + this.xmlEncode(id2obj[oid].en);
			if(id2obj[oid].style) text += "&" + this.xmlEncode(id2obj[oid].style);
			this.createElement("HYPER_ANCHOR",text,oNode,aTab+"    ");
		}
		this.createTextNode(aTab+"  ",oNode);
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
