var mcTreeTemplateFolder = {

	get STRING() { return document.getElementById("mcMainString"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()     { return window.top.bitsObjectMng.XML;           },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get DEFAULT_TEMPLATE(){
		var defname = mcTreeTemplateFolder.STRING.getString("MARKER_FOLDER");
		var note = mcTreeTemplateFolder.STRING.getString("TEMPLATE_MARKER_FOLDER_COMMENT");
		var tmpArr = [
			'<?xml version="1.0" encoding="utf-8"?>',
			'<!DOCTYPE TEMPLATE>',
			'<TEMPLATE>',
			'  <TITLE>'+defname+'</TITLE>',
			'  <NOTE>'+note+'</NOTE>',
			'  <FOLDER title="'+defname+'" style="" note="">',
			'    <FOLDER title="'+defname+'1" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_1") + '" note="" />',
			'    <FOLDER title="'+defname+'2" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_2") + '" note="" />',
			'    <FOLDER title="'+defname+'3" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_3") + '" note="" />',
			'    <FOLDER title="'+defname+'4" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_4") + '" note="" />',
			'    <FOLDER title="'+defname+'5" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_5") + '" note="" />',
			'    <FOLDER title="'+defname+'6" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_6") + '" note="" />',
			'    <FOLDER title="'+defname+'7" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_7") + '" note="" />',
			'    <FOLDER title="'+defname+'8" style="' + mcTreeTemplateFolder.STRING.getString("MARKER_CUSTOM_8") + '" note="" />',
			'  </FOLDER>',
			'</TEMPLATE>'
		];
		return tmpArr.join("\n");
	},

	init : function(){
		var file = this.getTemplateDir();
		var num = 0;
		var entries = file.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(!entry.isFile()) continue;
			num++;
		}
		if(num==0){
			var defname = this.STRING.getString("TEMPLATE_MARKER_TITLE");
			file.append(escape(defname));
			this.Common.writeFile(file, this.DEFAULT_TEMPLATE, "UTF-8");
		}
	},

	done : function(){},

	createFolder : function(aNode,aPfid,aRes){
		var title = aNode.getAttribute("title");
		var style = aNode.getAttribute("style");
		var dbtype = this.DataSource.getProperty(aRes,"dbtype");
		var newFolder = this.Database.newFolder(undefined,dbtype);
		newFolder.fid_title = title;
		newFolder.fid_style = style;
		newFolder.pfid = ""+aPfid;
		newFolder.fid_mode = ""+0;
		if(!this.Database.addFolder(newFolder,dbtype)) return null;
		var pfid = newFolder.fid;
		var newID = this.DataSource.identify(newFolder.fid);
		var newItem = this.Common.newItem();
		newItem.about = this.DataSource.ABOUT_ITEM + newID;
		newItem.id = newFolder.fid;
		newItem.pfid = newFolder.pfid;
		newItem.title = title;
		newItem.type = "folder";
		newItem.style = style;
		newItem.cssrule = 'css_'+dbtype+'_'+newID;
		newItem.editmode = newFolder.fid_mode;
		newItem.dbtype = dbtype;
		var tarResName = aRes.Value;
		var tarRelIdx;
		try{
			var cont = this.DataSource.getContainer(tarResName, false);
			tarRelIdx = cont.GetCount();
		}catch(ex){
			tarRelIdx = -1;
		}
		var newRes = this.DataSource.addItem(newItem, tarResName, tarRelIdx, dbtype);
		if(newRes && newRes.Value){
			this.DataSource.flush();
			this.DataSource.createEmptySeq(newRes.Value);
		}else{
			this.Database.removeFolder({fid:pfid},dbtype);
			return null;
		}
		var pfid_order=0;
		var childNodes = aNode.childNodes;
		for(var i=0;i<childNodes.length;i++){
			switch(childNodes[i].nodeName){
				case "FOLDER":
					var rtn = mcTreeTemplateFolder.createFolder(childNodes[i],pfid,newRes);
					if(rtn){
						pfid_order++;
						this.Database.updateFolder({fid:rtn.fid,pfid_order:pfid_order},dbtype);
					}else{
						this.Database.removeFolder({fid:pfid},dbtype);
						return null;
					}
					break;
				default:
					break;
			}
		}
		return {fid:pfid,res:newRes};
	},

	onCommand : function(aEvent,aIndex){
		setTimeout(function(){ mcTreeTemplateFolder._onCommand(aEvent,aIndex); },0);
	},

	_onCommand : function(aEvent,aIndex){
		var curIdx = aIndex;
		var curRes = null;
		if(curIdx>=0){
			if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			curRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(!mcTreeHandler.TREE.view.isContainerOpen(curIdx)) mcTreeHandler.TREE.view.toggleOpenState(curIdx);
		}else{
			return;
		}
		var pfid = this.DataSource.getProperty(curRes,"id");
		var dbtype = this.DataSource.getProperty(curRes,"dbtype");
		var rtn;
		var uri = this.Common.convertFilePathToURL(aEvent.target.id);
		var xmldoc = window.top.bitsMarkingCollection.loadXMLDocument(uri);
		if(xmldoc){
			var elem = xmldoc.getElementsByTagName("TEMPLATE");
			if(elem && elem.length>0){
				var contResList = this.DataSource.seqResources(curRes);
				var pfid_order=contResList.length;
				var childNodes = elem[0].childNodes;
				for(var i=0;i<childNodes.length;i++){
					switch(childNodes[i].nodeName){
						case "FOLDER":
							rtn = mcTreeTemplateFolder.createFolder(childNodes[i],pfid,curRes);
							if(rtn){
								pfid_order++;
								this.Database.updateFolder({fid:rtn.fid,pfid_order:pfid_order},dbtype);
							}else{
								return;
							}
							break;
						default:
							break;
					}
				}
			}
		}
		if(!rtn) return;
		mcTreeCssService.init();
		mcTreeHandler.TREE.builder.rebuild();
		var newRes = this.Common.RDF.GetResource(rtn.res.Value);
		var newIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		if(!mcTreeHandler.TREE.view.isContainerOpen(newIdx)) mcTreeHandler.TREE.view.toggleOpenState(newIdx);
		mcTreeHandler.TREE.view.selection.select(newIdx);
		mcTreeHandler.TREE.focus();
		var result = mcController.property(newRes);
		if(result){
			window.top.bitsMarkingCollection.reOrder(curRes);
		}else{
			mcTreeHandler.remove(undefined,undefined,true);
		}
		mcController.rebuildLocal();
		var selectIdx = newIdx;
		if(selectIdx>=0){
			mcTreeHandler.TREE.currentIndex = selectIdx;
			if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
			mcTreeHandler.TREE.focus();
			mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
			mcPropertyView.dispProperty(mcTreeHandler.object);
		}

	},

	createMenu : function(aParentNode,aEntry){
		if(aEntry.isFile()){
			var elemMenuitem = aParentNode.ownerDocument.createElement("menuitem");
			if(elemMenuitem){
				var label = unescape(aEntry.leafName);
				if(label.lastIndexOf(".xml")>=0) label = label.substr(0,label.lastIndexOf(".xml"));
				elemMenuitem.setAttribute("id",aEntry.path);
				elemMenuitem.setAttribute("label",label+"...");
				elemMenuitem.setAttribute("image","chrome://markingcollection/skin/add-template-folder.png");
				elemMenuitem.setAttribute("class","menuitem-iconic");
				aParentNode.appendChild(elemMenuitem);
			}
		}else if(aEntry.isDirectory()){
			var elemMenuSub = top.document.createElement("menu");
			var elemMenuSubpopup = top.document.createElement("menupopup");
			if(!elemMenuSub || !elemMenuSubpopup) return;
			elemMenuSub.setAttribute("label",unescape(aEntry.leafName));
			elemMenuSub.setAttribute("class","menu-iconic");
			elemMenuSub.setAttribute("image","chrome://markingcollection/skin/treefolder.png");
			elemMenuSubpopup.setAttribute("id",aEntry.path);
			elemMenuSub.appendChild(elemMenuSubpopup);
			aParentNode.appendChild(elemMenuSub);
			var entries = aEntry.directoryEntries;
			while(entries.hasMoreElements()){
				var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				mcTreeTemplateFolder.createMenu(elemMenuSubpopup,entry);
			}
		}
	},

	onPopupShowingMng : function(aEvent){
		var fileNum = 0;
		var dir  = mcTreeTemplateFolder.getTemplateDir();
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(unescape(entry.leafName) == this.STRING.getString("TEMPLATE_MARKER_TITLE")) continue;
			fileNum++;
		}
		if(fileNum==0){
			document.getElementById("mcPopupTemplateFolderRemove").setAttribute("disabled","true");
			document.getElementById("mcPopupFolderTemplateFolderRemove").setAttribute("disabled","true");
		}else{
			document.getElementById("mcPopupTemplateFolderRemove").removeAttribute("disabled");
			document.getElementById("mcPopupFolderTemplateFolderRemove").removeAttribute("disabled");
		}
	},

	onPopupShowing : function(aEvent){
		var dir  = mcTreeTemplateFolder.getTemplateDir();
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			mcTreeTemplateFolder.createMenu(aEvent.target,entry);
		}
	},

	onPopupHiding : function(aEvent){
		var elem = aEvent.target.lastChild;
		for(var i=aEvent.target.childNodes.length-1;i>=0;i--){
			if(aEvent.target.childNodes[i].nodeName == "menuseparator") break;
			aEvent.target.removeChild(aEvent.target.childNodes[i]);
		}
	},


	onClick : function(aEvent,aIndex){
		var curIdx = aIndex;
		var aRes = null;
		if(curIdx>=0){
			if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			aRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			var result = {};
			result.title = this.DataSource.getProperty(aRes,"title");
			result.note = this.DataSource.getProperty(aRes,"note");
			result.accept = true;
			window.openDialog("chrome://markingcollection/content/templatefolderproperty.xul", "", "chrome,centerscreen,modal", result);
			if(result.accept){
				var file  = mcTreeTemplateFolder.getTemplateDir();
				file.append(escape(result.title));
				if(file.exists()){
					var confirm_mng = mcTreeTemplateFolder.STRING.getString("CONFIRM_TEMPLATE_UPDATE");
					if(this.Common.confirm(confirm_mng)){
						file.remove(false);
					}else{
						mcTreeTemplateFolder.onClick(aEvent,aIndex);
						return;
					}
				}
				file.create(file.NORMAL_FILE_TYPE, 0666);
				ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
				ostream.init(file, 2, 0x200, false);
				result.title = result.title.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
				result.note = result.note.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
				var aContent = '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE TEMPLATE>\n<TEMPLATE>\n  <TITLE>'+result.title+'</TITLE>\n  <NOTE>'+result.note+'</NOTE>\n';
				this.Common.UNICODE.charset = "UTF-8";
				aContent = this.Common.UNICODE.ConvertFromUnicode(aContent);
				ostream.write(aContent, aContent.length);
				mcTreeTemplateFolder.createTemplate(aRes,ostream);
				aContent = "</TEMPLATE>\n";
				this.Common.UNICODE.charset = "UTF-8";
				aContent = this.Common.UNICODE.ConvertFromUnicode(aContent);
				ostream.write(aContent, aContent.length);
				ostream.close();
			}
		}else{
			return;
		}
	},

	onRemove : function(aEvent){
		var result = {
			accept : false,
			list   : [],
			title  : mcTreeTemplateFolder.STRING.getString("DEL_TEMPLATE_MARKER"),
		};
		var dir  = mcTreeTemplateFolder.getTemplateDir();
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(entry.isFile()){
				if(unescape(entry.leafName) == this.STRING.getString("TEMPLATE_MARKER_TITLE")) continue;
				result.list.push(entry);
			}else if(entry.isDirectory()){
			}
		}
		window.openDialog("chrome://markingcollection/content/removeDialog.xul", "", "chrome,centerscreen,modal", result);
		if(result.accept){
		}
	},

	getTemplateDir : function(){
		var dir  = window.top.bitsMarkingCollection.getExtensionDir().clone();
		dir.append("template");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

	createTemplate : function(aRes,aFile,aDepth){
		var ostream = aFile;
		var title = this.DataSource.getProperty(aRes,"title");
		var note = this.DataSource.getProperty(aRes,"note");
		var style = this.DataSource.getProperty(aRes,"style");
		if(aDepth == undefined) aDepth = 0;
		if(aFile == undefined){
			var file  = mcTreeTemplateFolder.getTemplateDir();
			file.append(escape(title));
			if(file.exists()){
				file.remove(false);
			}
			file.create(file.NORMAL_FILE_TYPE, 0666);
			ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
		}
		var aTab = "";
		for(var i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var contResList = this.DataSource.flattenResources(aRes, 1, false);
		title = title.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
		if(style) style = style.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
		if(note) note = note.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
		var aContent = aTab + '<FOLDER title="'+title+'" style="'+style+'" note="'+note+'"';
		if(contResList.length<=1) aContent += ' /';
		aContent += '>\n';
		this.Common.UNICODE.charset = "UTF-8";
		aContent = this.Common.UNICODE.ConvertFromUnicode(aContent);
		ostream.write(aContent, aContent.length);
		var contResList = this.DataSource.flattenResources(aRes, 1, false);
		if(contResList.length>1){
			for(var i=0;i<contResList.length;i++){
				if(contResList[i].Value == aRes.Value) continue;
				mcTreeTemplateFolder.createTemplate(contResList[i],ostream,aDepth+1);
			}
			aContent = aTab + '</FOLDER>\n';
			this.Common.UNICODE.charset = "UTF-8";
			aContent = this.Common.UNICODE.ConvertFromUnicode(aContent);
			ostream.write(aContent, aContent.length);
		}
		if(aFile == undefined){
			ostream.close();
		}
	},

};
