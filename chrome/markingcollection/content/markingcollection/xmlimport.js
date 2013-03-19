var mcXmlImportService = {
	_openurl : "",
	_doc     : null,
	_loaddoc : null,
	_url     : "",
	_fileid  : "",

	_isExportFile : false,

/////////////////////////////////////////////////////////////////////
	get STRING() { return document.getElementById("mcMainString"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get FileSearch() { return Components.classes['@mozilla.org/inspector/search;1?type=file'].getService(Components.interfaces.inIFileSearch); },


	get isExportFile(){ return this._isExportFile; },

/////////////////////////////////////////////////////////////////////
	init : function(){},

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
	getTemplateDir : function(){},

/////////////////////////////////////////////////////////////////////
	createMenu : function(aParentNode,aEntry){},

/////////////////////////////////////////////////////////////////////
	loadText : function(aURI){},

/////////////////////////////////////////////////////////////////////
	loadXMLDocument : function(aUri){
		var xmlDocument = window.top.bitsMarkingCollection.loadXMLDocument(aUri);
		return xmlDocument;
	},

/////////////////////////////////////////////////////////////////////
	loadFile : function(aParName, aIdx, aRow, aUri){
		this._isExportFile = false;
		var uri = aUri;
		var splitFileName = this.Common.splitFileName(uri);
		if(splitFileName[1].toLowerCase() == "zip"){
			var tmpDir = window.top.bitsMarkingCollection.getTmpDir().clone();
			tmpDir.append(this.STRING.getString("APP_TITLE"));
			tmpDir.createUnique(tmpDir.DIRECTORY_TYPE, 0777);
			var zipFile = this.Common.convertURLToFile(uri);
			try {
				var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"].createInstance(Components.interfaces.nsIZipReader);
				if(zipReader.init){
					zipReader.init(zipFile);
					zipReader.open();
				}else{
					zipReader.open(zipFile);
				}
			} catch (e) {
				mcXmlImportService._dump("mcXmlImportService.loadFile():"+e);
				zipReader.close();
				return false;
			}
			var entries = zipReader.findEntries("*/");
			while((entries.hasMoreElements?entries.hasMoreElements:entries.hasMore)()){
				try{
					var entry = entries.getNext();
					if(typeof entry != "string"){
						entry = entry.QueryInterface(Components.interfaces.nsIZipEntry);
						entry = entry.name;
					}
					var patharr = entry.split("/");
				}catch(e){
					continue;
				}
				var unzipDir = tmpDir.clone();
				while(patharr.length>0) unzipDir.append(patharr.shift());
				if(!unzipDir.exists()) unzipDir.create(unzipDir.DIRECTORY_TYPE, 0777);
			}
			if(zipReader.init){
				entries = zipReader.findEntries("*");
			}else{
				entries = zipReader.findEntries(null);
			}
			while((entries.hasMoreElements?entries.hasMoreElements:entries.hasMore)()){
				try{
					var entry = entries.getNext();
					if(typeof entry != "string"){
						entry = entry.QueryInterface(Components.interfaces.nsIZipEntry);
						entry = entry.name;
					}
					var patharr = entry.split("/");
				}catch(e){
					continue;
				}
				var unzipTarget = tmpDir.clone();
				while(patharr.length>0) unzipTarget.append(patharr.shift());
				if(unzipTarget.exists()) continue;
				try{ unzipTarget.create(unzipTarget.NORMAL_FILE_TYPE, 0777); } catch(e){}
				zipReader.extract(entry, unzipTarget);
			}
			var inXML = false;
			var rtn = false;
			entries = zipReader.findEntries("*.xml");
			while((entries.hasMoreElements?entries.hasMoreElements:entries.hasMore)()){
				try{
					var entry = entries.getNext();
					if(typeof entry != "string"){
						entry = entry.QueryInterface(Components.interfaces.nsIZipEntry);
						entry = entry.name;
					}
					var patharr = entry.split("/");
					inXML = true;
				}catch(e){
					continue;
				}
				var xmlTarget = tmpDir.clone();
				while(patharr.length>0) xmlTarget.append(patharr.shift());
				if(!xmlTarget.exists()) continue;
				if(!xmlTarget.isFile()){
					if(inXML){
						this.Common.alert(this.STRING.getString("ERROR_ZIP_ANALYSIS"));
						rtn = true;
					}
					continue;
				}
				var url = this.Common.convertFilePathToURL(xmlTarget.path);
				rtn |= this._loadFile(aParName, aIdx, aRow, url);
			}
			if(tmpDir.exists()) tmpDir.remove(true);
			zipReader.close();
			return rtn;
		}else{
			return this._loadFile(aParName, aIdx, aRow, aUri);
		}
	},

/////////////////////////////////////////////////////////////////////
	xmlEncode : function(aString){
		return aString.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	},

/////////////////////////////////////////////////////////////////////
	_loadFile : function(aParName, aIdx, aRow, aUri){
		var uri = aUri;
		var aRes = this.Common.RDF.GetResource(aParName);
		var import_pfid = this.DataSource.getProperty(aRes,"id");
		var dbtype = this.DataSource.getProperty(aRes,"dbtype");
		var xmldoc = this.loadXMLDocument(uri);
		if(!xmldoc) return false;
		var xmlfile = this.Common.convertURLToFile(uri);
		var saveDataDir = null;
		var elemLIST = xmldoc.getElementsByTagName("LIST");
		if(!elemLIST) return false;
		var cache_dirs = [];
		var cache_dir = xmlfile.parent.clone();
		cache_dir.append(window.top.bitsTreeExportService.appDataAddSTRING);
		if(cache_dir.exists()){
			var entries = cache_dir.directoryEntries;
			while(entries.hasMoreElements()){
				var pDir = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				if(!pDir.isDirectory()) continue;
				cache_dirs.push(pDir.clone());
			}
		}
		this._isExportFile = true;
		var prompts = this.Common.PROMPT;
		var title = this.STRING.getString("APP_DISP_TITLE");
		var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_YES +
		            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_NO +
		            prompts.BUTTON_POS_0_DEFAULT;
		var checkMsg = (cache_dirs.length>0 ? this.STRING.getString("CHECK_XML_IMPOER_CACHE_DOCUMENT") : null);
		var checkState = {value: false};
		var button = prompts.confirmEx(
									window,
									title,
									this.STRING.getString("CONFIRM_XML_IMPOER"),
									flags, "", "", "", checkMsg, checkState);
		if(button!=0) return false;
		if(checkState.value){
			var i;
			for(i=0;i<cache_dirs.length;i++){
				var copy_dir = window.top.bitsAutocacheService.cachedir.clone();
				copy_dir.append(cache_dirs[i].leafName);
				if(!copy_dir.exists()) copy_dir.create(copy_dir.DIRECTORY_TYPE, 0777);
				var entries = cache_dirs[i].directoryEntries;
				while(entries.hasMoreElements()){
					var pDir = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					if(!pDir.isDirectory()) continue;
					var chkdir = copy_dir.clone();
					chkdir.append(pDir.leafName);
					if(!chkdir.exists()) pDir.copyTo(copy_dir,pDir.leafName);
				}
			}
			window.top.bitsAutocacheService._insertInitDB();
		}
		var aTransaction = false;
		if(!aTransaction) this.Database.beginTransaction(dbtype);
		var dbid = parseInt(this.Database._oidIdentify(dbtype,this.Common.getTimeStamp(),aTransaction));
		var maxOrder = this.Database.getMaxOrderFormPID(import_pfid,dbtype,aTransaction);
		var attrs_folder = ["fid_title","fid_note","fid_style","fid_property","fid_dbtype"];
		var attrs_object = ["oid_type","doc_title","doc_url","con_url","bgn_dom","end_dom","oid_title","oid_note","oid_structure","oid_link","oid_mode","oid_txt","oid_date","oid_property","oid_dbtype"];
		var folders = [];
		var folders_name = [];
		var objects = [];
		var i,j,k;
		var listID;
		var listTitle;
		var listRes = this.DataSource.flattenResources(aRes,1,false);
		for(i=0;i<listRes.length;i++){
			if(listRes[i].Value == aRes.Value) continue;
			listTitle = this.DataSource.getProperty(listRes[i],"title");
			listTitle = listTitle.replace(/^\s*/img,"").replace(/\s*$/img,"");
			var chkid = import_pfid.toString() + "\t" + listTitle;
			if(!folders_name[chkid]) folders_name[chkid] = [];
			folders_name[chkid].push(listID);
		}
		var regexp_png = new RegExp("^data:image/\\w+;base64,");
		for(i=0;i<elemLIST.length;i++){
			elemLIST[i].setAttribute("id",import_pfid);
			var elemFOLDER = elemLIST[i].getElementsByTagName("*");
			for(j=0;j<elemFOLDER.length;j++){
				if(!(elemFOLDER[j].nodeName == "FOLDER" || elemFOLDER[j].nodeName == "OBJECT")) continue;
				var id = dbid.toString();
				elemFOLDER[j].setAttribute("id",id);
				var pfid = elemFOLDER[j].parentNode.getAttribute("id");
				if(elemFOLDER[j].nodeName == "FOLDER"){
					folders[id] = this.Database.newFolder(id,dbtype,aTransaction);
					folders[id].pfid = pfid;
					folders[id].pfid_order = ++maxOrder;
				}else if(elemFOLDER[j].nodeName == "OBJECT"){
					objects[id] = this.Database.newObject(id,dbtype,aTransaction);
					objects[id].pfid = pfid;
					objects[id].pfid_order = ++maxOrder;
				}
				dbid++;
			}
			for(j=0;j<attrs_folder.length;j++){
				var elemAttr = elemLIST[i].getElementsByTagName(attrs_folder[j].toUpperCase());
				for(k=0;k<elemAttr.length;k++){
					var id = elemAttr[k].parentNode.getAttribute("id");
					if(!folders[id]) continue;
					var textContent = elemAttr[k].textContent;
					if(!textContent || textContent == "") continue;
					if(attrs_folder[j] == "fid_note"){
						folders[id].fid_property = "<PROPERTY><NOTE>" + textContent + "</NOTE></PROPERTY>";
					}else if(attrs_folder[j] == "fid_title"){
						var chkid = folders[id].pfid.toString() + "\t" + textContent;
						if(!folders_name[chkid]) folders_name[chkid] = [];
						folders_name[chkid].push(id);
						folders[id].fid_title = textContent;
					}else{
						folders[id][attrs_folder[j]] = textContent;
					}
				}
			}
			for(j=0;j<attrs_object.length;j++){
				var elemAttr = elemLIST[i].getElementsByTagName(attrs_object[j].toUpperCase());
				for(k=0;k<elemAttr.length;k++){
					var id = elemAttr[k].parentNode.getAttribute("id");
					if(!objects[id]) continue;
					var textContent = elemAttr[k].textContent;
					if(!textContent || textContent == "") continue;
					if(attrs_object[j] == "oid_note"){
						var property = objects[id].oid_property.replace(/[\r\n\t]/mg," __BR__ ");
						if(property.match(/^(.*<NOTE>)(.*?)(<\/NOTE>.*)$/m)){
							property = RegExp.$1 + textContent + RegExp.$3;
						}else if(property.match(/^(<PROPERTY>)(.*<\/PROPERTY>)$/m)){
							property = RegExp.$1 + "<NOTE>" + textContent + "</NOTE>" + RegExp.$2;
						}else{
							property = "<PROPERTY><NOTE>" + textContent + "</NOTE></PROPERTY>";
						}
						objects[id].oid_property = property.replace(/ __BR__ /mg,"\n");
					}else if(attrs_object[j] == "oid_structure"){
						var property = objects[id].oid_property.replace(/[\r\n\t]/mg," __BR__ ");
						if(property.match(/^(.*<STRUCTURE>)(.*?)(<\/STRUCTURE>.*)$/m)){
							property = RegExp.$1 + textContent + RegExp.$3;
						}else if(property.match(/^(<PROPERTY>)(.*<\/PROPERTY>)$/m)){
							property = RegExp.$1 + "<STRUCTURE>" + textContent + "</STRUCTURE>" + RegExp.$2;
						}else{
							property = "<PROPERTY><STRUCTURE>" + textContent + "</STRUCTURE></PROPERTY>";
						}
						objects[id].oid_property = property.replace(/ __BR__ /mg,"\n");
					}else if(attrs_object[j] == "oid_link"){
						var property = objects[id].oid_property.replace(/[\r\n\t]/mg," __BR__ ");
						if(property.match(/^(.*<LINK>)(.*?)(<\/LINK>.*)$/m)){
							property = RegExp.$1 + textContent + RegExp.$3;
						}else if(property.match(/^(<PROPERTY>)(.*<\/PROPERTY>)$/m)){
							property = RegExp.$1 + "<LINK>" + textContent + "</LINK>" + RegExp.$2;
						}else{
							property = "<PROPERTY><LINK>" + textContent + "</LINK></PROPERTY>";
						}
						objects[id].oid_property = property.replace(/ __BR__ /mg,"\n");
					}else if((attrs_object[j] == "doc_url" || attrs_object[j] == "con_url") && regexp_png.test(textContent)){
							var blobFile = this.Database.getObjectBLOBFile(id,dbtype);
							objects[id][attrs_object[j]] = this.Common.convertFilePathToURL(blobFile.path);
					}else if(attrs_object[j] == "oid_property"){
						objects[id][attrs_object[j]] = textContent;
					}else{
						objects[id][attrs_object[j]] = textContent;
					}
				}
			}
		}
		var newAddRes;
		var key;
		for(key in folders){
			if(typeof folders[key] == "function") continue;
			var fid_dbtype = dbtype;
			var folder = folders[key];
			if(folder.fid_dbtype) delete folder.fid_dbtype;
			var chkid = folder.pfid.toString() + "\t" + folder.fid_title;
			if(folders_name[chkid] && folders_name[chkid].length>1){
				var cnt;
				var folders_name_arr = folders_name[chkid];
				for(cnt=0;cnt<folders_name_arr.length;cnt++){
					if(folders_name_arr[cnt] != folder.fid) continue;
					var chkid = folder.pfid.toString() + "\t" + folder.fid_title + " (" + (cnt+1).toString() + ")";
					while(folders_name[chkid]){
						cnt++;
						chkid = folder.pfid.toString() + "\t" + folder.fid_title + " (" + (cnt+1).toString() + ")";
					}
					folder.fid_title += " (" + (cnt+1).toString() + ")";
					folders_name[chkid] = [];
					folders_name[chkid].push(folder.fid);
					break;
				}
			}
			if(folder.fid_property){
				try{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(folder.fid_property, "text/xml");
					if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
					if(xmldoc){
						var elem = xmldoc.getElementsByTagName("DICTIONARY")[0];
						if(elem){
							var xmldic = parser.parseFromString("<DICTIONARY/>", "text/xml");
							if(xmldic && xmldic.documentElement.nodeName == "parsererror") xmldic = undefined;
							if(xmldic){
								var nodecnt;
								for(nodecnt=0;nodecnt<elem.childNodes.length;nodecnt++){
									xmldic.documentElement.appendChild(elem.childNodes[nodecnt].cloneNode(true));
								}
								window.top.bitsTreeProjectService._putDictionaryXML(folder.fid,fid_dbtype,xmldic);
								xmldic = undefined;
							}
							var parentNode = elem.parentNode;
							parentNode.removeChild(elem);
							parentNode.normalize();
						}
						var s = new XMLSerializer();
						folder.fid_property = s.serializeToString(xmldoc);
						s = undefined;
						xmldoc = undefined;
					}
					parser = undefined;
				}catch(e){
					mcXmlImportService._dump("mcXmlImportService.loadFile():"+e);
				}
			}
			var rtn = this.Database.addFolder(folder,fid_dbtype,aTransaction);
			if(rtn){
				var newItem = this.Common.newItem();
				newItem.id = folder.fid;
				newItem.about = this.DataSource.getAbout(folder.fid,folder.pfid,fid_dbtype);
				newItem.pfid = folder.pfid;
				newItem.title = folder.fid_title;
				newItem.type = "folder";
				newItem.style = folder.fid_style;
				newItem.cssrule = 'css_'+fid_dbtype+'_'+newItem.fid;
				newItem.dbtype = fid_dbtype;
				newItem.editmode = folder.fid_mode;
				var tarResName, tarRelIdx;
				if(folders[folder.pfid]){
					tarResName = this.DataSource.getID2About(folders[folder.pfid].fid,folders[folder.pfid].pfid,fid_dbtype);
				}else{
					tarResName = aParName;
				}
				try{
					var cont = this.DataSource.getContainer(tarResName, false);
					tarRelIdx  = cont.GetCount();
				}catch(ex){
					tarRelIdx = -1;
				}
				var newRes = this.DataSource.addItem(newItem, tarResName, tarRelIdx, fid_dbtype);
				if(newRes && newRes.Value){
					this.DataSource.createEmptySeq(newRes.Value);
					if(!newAddRes) newAddRes = newRes;
				}
			}
		}

		var tarResName;
		for(key in objects){
			if(typeof objects[key] == "function") continue;
			var oid_dbtype = dbtype;
			var object = objects[key];
			if(object.oid_dbtype) delete object.oid_dbtype;
			var rtn = this.Database.addObject(object,oid_dbtype,aTransaction);
			if(rtn && !(mcItemView && mcItemView.isChecked)){
				if(folders[object.pfid]){
					tarResName = this.DataSource.getID2About(folders[object.pfid].fid,folders[object.pfid].pfid,oid_dbtype);
				}else{
					tarResName = aParName;
				}
				this.DataSource.addItem(this.Database.makeObjectToItem(object),tarResName,-1,oid_dbtype);
			}
		}
		var regexp_png = new RegExp("^data:image/\\w+;base64,");
		var attr = "oid_img";
		for(i=0;i<elemLIST.length;i++){
			var elemAttr = elemLIST[i].getElementsByTagName(attr.toUpperCase());
			for(k=0;k<elemAttr.length;k++){
				var id = elemAttr[k].parentNode.getAttribute("id");
				var oid_dbtype = dbtype;
				var textContent = elemAttr[k].textContent;
				if(regexp_png.test(textContent)) this.Database.updateObjectBLOB(id,textContent,oid_dbtype,aTransaction);
			}
		}
		regexp_png = undefined;
		if(!aTransaction) this.Database.endTransaction(dbtype);

		this.DataSource.flush();
		mcTreeCssService.init();
		if(mcTreeHandler){
			var selectIdx;
			var resArr = [aRes];
			var parentRes = aRes;
			do{
				parentRes = this.DataSource.findParentResource(parentRes);
				if(parentRes) resArr.unshift(parentRes);
			}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
			for(var i=0;i<resArr.length;i++){
				selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
				if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
			}
			if(newAddRes){
				setTimeout(function(){
					var newIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newAddRes);
					if(newIdx>=0){
						mcTreeHandler.TREE.currentIndex = newIdx;
						if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
						mcTreeHandler.TREE.focus();
						mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(newIdx);
						if(mcPropertyView) mcPropertyView.dispProperty(mcTreeHandler.object);
						if(mcItemView && mcItemView.isChecked) mcItemView.onTreeClick();
					}
				},500);
			}
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
