var mcTreeHandler = {

	get TREE(){ return document.getElementById("mcTree"); },
	get TREE_POPUP(){ return document.getElementById("mcToolbarRootFolderButton"); },
	get POPUP()    { return document.getElementById("mcPopup"); },
	get POPUP_FOLDER(){ return document.getElementById("mcPopupFolder"); },
	get POPUP_OBJECT(){ return document.getElementById("mcPopupObject"); },

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get resource(){
		try{
			if(this.TREE.view.selection.count < 1 || this.TREE.currentIndex < 0)
				return null;
			else
				return this.TREE.builderView.getResourceAtIndex(this.TREE.currentIndex);
		}catch(ex){
			_dump(ex);
			return null;
		}
	},

	get object(){
		var rValue;
		var obj = null;
		var res = this.resource;
		if(res){
			var id = this.DataSource.getProperty(res,"id");
			var dbtype = this.DataSource.getProperty(res,"dbtype");
			var rValue;
			if(this.DataSource.isContainer(res)){
				rValue = this.Database.getFolderFormID(id,dbtype);
				if(!rValue){
					rValue = [];
					rValue[0] = {
						fid       : id,
						fid_title : this.DataSource.getProperty(res,"title"),
						dbtype    : dbtype,
						fid_mode  : this.DataSource.getProperty(res,"editmode")
					};
				}
			}else{
				rValue = mcTreeHandler.Database.getObjectFormID(id,dbtype);
			}
		}
		if(rValue && rValue.length>0) obj = rValue[0];
		return obj;
	},

	autoCollapse : false,
	progressWindow : null,

	init : function(isContainer){
		try{
			this.TREE.setAttribute("ref",this.DataSource.ABOUT_ROOT);
			this.TREE.database.AddDataSource(this.DataSource.data);
			this.autoCollapse = nsPreferences.getBoolPref("wiredmarker.tree.autoCollapse", false);
			if(isContainer) document.getElementById("mcTreeRule").setAttribute("iscontainer", true);
			this.TREE.builder.rebuild();

			this.TREE_POPUP.setAttribute("ref",this.DataSource.ABOUT_ROOT);
			this.TREE_POPUP.database.AddDataSource(this.DataSource.data);
			this.TREE_POPUP.builder.rebuild();
		}catch(ex){
		}
	},

	done : function(){
		this.DataSource.flush();
		var dsEnum = this.TREE.database.GetDataSources();
		while(dsEnum.hasMoreElements()){
			var ds = dsEnum.getNext().QueryInterface(Components.interfaces.nsIRDFDataSource);
			this.TREE.database.RemoveDataSource(ds);
		}
	},

	pageshow : function(){
		try{
			var selectIdx = mcTreeHandler.TREE.currentIndex;
			mcTreeHandler.TREE.builder.rebuild();
			if(selectIdx>=0){
				mcTreeHandler.TREE.currentIndex = selectIdx;
				if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
				mcTreeHandler.TREE.focus();
			}
		}catch(ex){}
	},

	onPopuphidden : function(aEvent){
		var self = mcTreeHandler;
		var resource = self.resource;
		if(resource){
			var contextmenu = self.DataSource.getProperty(resource,"contextmenu");
			var menu = document.getElementById(contextmenu);
			if(menu) menu.setAttribute("hidden","true");
		}
	},

	onMousedown : function(aEvent){
		mcTreeImageTooltip.onMousedown(aEvent);
		mcItemView.onTreeClick(aEvent);
		if(aEvent.button == 2){
			if(bitsSearchAcross.getIndex() == mcTreeHandler.TREE.currentIndex){
				mcTreeHandler.TREE.removeAttribute("contextmenu");
				return;
			}
			var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
			if(contextmenu_mode == "legacy"){
				mcTreeHandler.TREE.setAttribute("contextmenu",this.POPUP.id);
				this.POPUP.removeEventListener("popuphidden",mcTreeHandler.onPopuphidden,false);
				var resource = this.resource;
				if(resource){
					var contextmenu = this.DataSource.getProperty(resource,"contextmenu");
					if(contextmenu != undefined && contextmenu != ""){
						var menu = document.getElementById(contextmenu);
						if(menu) menu.removeAttribute("hidden");
						this.POPUP.addEventListener("popuphidden",mcTreeHandler.onPopuphidden,false);
					}
				}
			}else{
				var resource = this.resource;
				if(this.DataSource.isContainer(resource)){
					mcTreeHandler.TREE.setAttribute("contextmenu",this.POPUP_FOLDER.id);
					this.POPUP_FOLDER.removeEventListener("popuphidden",mcTreeHandler.onPopuphidden,false);
					if(resource){
						var contextmenu = this.DataSource.getProperty(resource,"contextmenu");
						if(contextmenu != undefined && contextmenu != ""){
							var menu = document.getElementById(contextmenu);
							if(menu) menu.removeAttribute("hidden");
							this.POPUP_FOLDER.addEventListener("popuphidden",mcTreeHandler.onPopuphidden,false);
						}
					}
				}else{
					mcTreeHandler.TREE.setAttribute("contextmenu",this.POPUP_OBJECT.id);
					this.POPUP_OBJECT.removeEventListener("popuphidden",mcTreeHandler.onPopuphidden,false);
					if(resource){
						var contextmenu = this.DataSource.getProperty(resource,"contextmenu");
						if(contextmenu != undefined && contextmenu != ""){
							var menu = document.getElementById(contextmenu);
							if(menu) menu.removeAttribute("hidden");
							this.POPUP_OBJECT.addEventListener("popuphidden",mcTreeHandler.onPopuphidden,false);
						}
					}
				}
			}
		}else{
			mcTreeHandler.TREE.removeAttribute("contextmenu");
		}
	},

	onMouseup : function(aEvent){},

	onMousemove : function(aEvent){
		var param = {
			tree : mcTreeHandler.TREE
		};
		try{
			var row = {};
			var col = {};
			var childElt = {};
			param.tree.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, childElt);
			if(!row.value || !col.value || !childElt.value || childElt.value != "text"){
			}else{
				param.row = row;
				param.col = col;
				param.childElt = childElt;
				if(mcTreeImageTooltip.tooltipRow != row.value){
					var curRes = param.tree.builderView.getResourceAtIndex(row.value);
					var id = this.DataSource.getProperty(curRes,"id");
					var dbtype = this.DataSource.getProperty(curRes,"dbtype");
					var rtnObj = this.Database.getObject({oid:id},dbtype);
					if(rtnObj) param.obj = rtnObj[0];
				}
			}
		}catch(e){}
		mcTreeImageTooltip.onMousemove(aEvent,param);
	},

	onMouseout : function(aEvent){
		mcTreeImageTooltip.onMouseout(aEvent);
	},

	onClick : function(aEvent, aType){
		var curIdx = this.TREE.currentIndex;
		if(bitsSearchAcross.getIndex() == curIdx){
			mcPropertyView.dispProperty();
			return;
		}
		if(curIdx>=0) mcPropertyView.dispProperty(mcTreeHandler.object);
		var res = (mcTreeHandler.TREE.view.selection.count >= 1 && mcTreeHandler.TREE.currentIndex >= 0) ? mcTreeHandler.resource : null;
		if(aEvent.button == 2){
			window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, res);
			aEvent.stopPropagation();
			return;
		}
		if(aEvent.button != 0 && aEvent.button != 1){
			window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, res);
			aEvent.stopPropagation();
			return;
		}
		var row = {};
		var col = {};
		var obj = {};
		this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
		if(!obj.value || obj.value == "twisty") return;
		if(this.TREE.view.isContainer(curIdx)){
			var curRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			var source = this.DataSource.getProperty(curRes,"source");
			if(source != "") mcController.open(this.resource, aEvent.button == 1 || aEvent.ctrlKey || aEvent.shiftKey);
		}else{
			if(aType < 2 && aEvent.button != 1) return;
			mcController.open(this.resource, aEvent.button == 1 || aEvent.ctrlKey || aEvent.shiftKey);
		}
		window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, res);
	},

	onKeyDown : function(aEvent){},

	onKeyUp : function(aEvent){},

	onKeyPress : function(aEvent){
		switch(aEvent.keyCode){
			case aEvent.DOM_VK_RETURN : 
				if(this.TREE.view.isContainer(this.TREE.currentIndex)) return;
				mcController.open(this.resource, aEvent.ctrlKey || aEvent.shiftKey);
				break;
			case aEvent.DOM_VK_DELETE :
				if(bitsSearchAcross.getIndex() == mcTreeHandler.TREE.currentIndex) return;
				if(!(aEvent.ctrlKey || aEvent.shiftKey)){
					aEvent.preventDefault();
					var res = mcTreeHandler.resource;
					if(!res) return;
					var id   = this.DataSource.getProperty(res,"id");
					var type = this.DataSource.getProperty(res,"type");
					if(type == "localfolder") return;
					if(type == window.top.bitsMarkingCollection._uncategorized.dbtype) return;
					var refRootfolder = nsPreferences.copyUnicharPref("wiredmarker.rootfolder","");
					if(refRootfolder == id) return;
					this.remove(aEvent);
				}
				break;
			case aEvent.DOM_VK_F2 :
				mcController.property(this.resource);
				break;
			default:
				break;
		}
	},

	onDblClick : function(aEvent){
		if(aEvent.originalTarget.localName != "treechildren" || aEvent.button != 0) return;
		if(this.TREE.view.isContainer(this.TREE.currentIndex)) return;
		if(aEvent.button == 2){
			aEvent.stopPropagation();
			return;
		}
		mcController.open(this.resource, aEvent.ctrlKey || aEvent.shiftKey);
		return;
	},

	existsFolderTitle : function(aRes,aTitle){
		var i;
		var len;
		var contResList = this.DataSource.flattenResources(aRes, 1, false);
		for(i=0,len=contResList.length;i<len;i++){
			if(aRes.Value==contResList[i].Value) continue;
			if(this.DataSource.getProperty(contResList[i],"title")==aTitle) return true;
		}
		return false;
	},

	create : function(pIdx){
		var curIdx = pIdx;
		var curRes = null;
		if(pIdx>=0){
			if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			curRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(!mcTreeHandler.TREE.view.isContainerOpen(curIdx)) mcTreeHandler.TREE.view.toggleOpenState(curIdx);
		}else{
			curRes = this.Common.RDF.GetResource(mcTreeHandler.TREE.ref);
		}
		var title = this.DataSource.getProperty(curRes,"title");
		var style = this.DataSource.getProperty(curRes,"style");
		var editmode = "0";
		if(title != ""){
			title = "New Folder ["+title+"]";
		}else{
			title = "New Folder";
		}
		if(editmode == "") editmode = "0";
		if(!style || style==""){
			var styleIdx = nsPreferences.getIntPref("wiredmarker.folderstyleindex",1);
			if(styleIdx>8) styleIdx = 1;
			style = bitsMarker.PRESET_STYLES[styleIdx];
			nsPreferences.setIntPref("wiredmarker.folderstyleindex",styleIdx);
		}
		if(this.existsFolderTitle(curRes,title)){
			var newTitle;
			var cnt=1;
			do{
				newTitle = title+"("+(++cnt)+")";
			}while(this.existsFolderTitle(curRes,newTitle));
			title = newTitle;
		}
		var newRes = mcMainService.createGroupFolder(title,curRes.Value,undefined,style,"",editmode);
		mcController.rebuildLocal();
		window.top.bitsMarkingCollection.reOrder(curRes);
		var newIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		mcTreeHandler.TREE.view.selection.select(newIdx);
		mcTreeHandler.TREE.focus();
		var result = mcController.property(newRes);
		if(result){
			window.top.bitsMarkingCollection.reOrder(curRes);
		}else{
			mcTreeHandler.remove(undefined,undefined,true);
		}
		var newIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		mcController.rebuildLocal();
		var selectIdx = newIdx;
		if(selectIdx<0) selectIdx = pIdx;
		mcTreeHandler.TREE.currentIndex = selectIdx;
		if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
		mcTreeHandler.TREE.focus();
		mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
		mcPropertyView.dispProperty(mcTreeHandler.object);
	},

	removeFolder : function(aEvent){
		if(!mcController.confirmRemovingFor(this.resource)) return false;
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 0, this.resource);
		var aMode = this.DataSource.getProperty(this.resource,"dbtype");
		if(!this.Database.beginTransaction(aMode)) return false;
		var curIdx = this.TREE.currentIndex;
		var curRes = this.TREE.builderView.getResourceAtIndex(curIdx);
		this._removeFolder(curRes);
		this.Database.endTransaction(aMode);
		mcController.rebuildLocal();
		mcItemView.onTreeClick();
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, this.resource);
	},

	_removeFolder : function(aRes){
		if(!aRes) return [];
		var curRes = aRes;
		try{
			this._removeAll(curRes);
			var delObj = [];
			var foldResList = this.DataSource.flattenResources(curRes, 1, true);
			for(i=foldResList.length-1;i>=0;i--){
				var pRes = this.DataSource.findParentResource(foldResList[i]);
				if(!this.DataSource.data.ArcLabelsOut(foldResList[i]).hasMoreElements() || this.Common.RDFCU.indexOf(this.DataSource.data, pRes, foldResList[i]) < 0) continue;
				delObj.push({
					id   : this.DataSource.getProperty(foldResList[i],"id"),
					dbtype : this.DataSource.getProperty(foldResList[i],"dbtype")
				});
				this.Common.RDFC.Init(this.DataSource.data, pRes);
				this.Common.RDFC.RemoveElement(foldResList[i], true);
			}
			var rmIDs = [];
			var addIDs = [];
			var depth = 0;
			do{
				addIDs = this.DataSource.cleanUpIsolation();
				rmIDs = rmIDs.concat(addIDs);
			}while(addIDs.length > 0 && ++depth < 100);
			this.DataSource.flush();
			for(var i=0;i<delObj.length;i++){
				this.Database.removeFolder(delObj[i].id,delObj[i].dbtype,false);
			}
		}catch(e){
			_dump("mcTreeHandler._removeFolder():"+e);
		}
	},

	removeAllFolder : function(aEvent){
		if(!mcController.confirmRemovingFor(this.resource)) return false;
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 0, this.resource);
		var aMode = this.DataSource.getProperty(this.resource,"dbtype");
		if(!this.Database.beginTransaction(aMode)) return false;
		var curRes = this.TREE.builderView.getResourceAtIndex(this.TREE.currentIndex);
		try{
			var delObj = [];
			var foldResList = this.DataSource.flattenResources(curRes, 1, false);
			var i,j;
			for(i=foldResList.length-1;i>=0;i--){
				if(foldResList[i].Value == curRes.Value) continue;
				this._removeAll(foldResList[i]);
			}
			var foldResList = this.DataSource.flattenResources(curRes, 1, true);
			for(i=foldResList.length-1;i>=0;i--){
				if(foldResList[i].Value == curRes.Value) continue;
				var pRes = this.DataSource.findParentResource(foldResList[i]);
				if(!this.DataSource.data.ArcLabelsOut(foldResList[i]).hasMoreElements() || this.Common.RDFCU.indexOf(this.DataSource.data, pRes, foldResList[i]) < 0) continue;
				delObj.push({
					id   : this.DataSource.getProperty(foldResList[i],"id"),
					dbtype : this.DataSource.getProperty(foldResList[i],"dbtype")
				});
				this.Common.RDFC.Init(this.DataSource.data, pRes);
				this.Common.RDFC.RemoveElement(foldResList[i], true);
			}
			var rmIDs = [];
			var addIDs = [];
			var depth = 0;
			do{
				addIDs = this.DataSource.cleanUpIsolation();
				rmIDs = rmIDs.concat(addIDs);
			}while(addIDs.length > 0 && ++depth < 100);
			this.DataSource.flush();
			for(var i=0;i<delObj.length;i++){
				this.Database.removeFolder(delObj[i].id,delObj[i].dbtype,false);
			}
		}catch(e){
			_dump("mcTreeHandler.removeAllFolder():"+e);
		}
		this.Database.endTransaction(aMode);
		mcController.rebuildLocal();
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, this.resource);
	},

	removeAll : function(aEvent){
		if(!mcController.confirmRemovingFor(this.resource)) return false;
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 0, this.resource);
		var aMode = this.DataSource.getProperty(this.resource,"dbtype");
		if(!this.Database.beginTransaction(aMode)) return false;
		var curRes = this.TREE.builderView.getResourceAtIndex(this.TREE.currentIndex);
		this._removeAll(curRes);
		this.Database.endTransaction(aMode);
		mcController.rebuildLocal();
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, this.resource);
	},

	_removeAll : function(aRes){
		if(!aRes) return false;
		var curRes = aRes;
		try{
			var delObj = [];
			var foldResList = this.DataSource.flattenResources(curRes, 1, true);
			var i,j;
			for(i=foldResList.length-1;i>=0;i--){
				var pfid = this.DataSource.getProperty(foldResList[i],"id");
				var contResList = this.DataSource.flattenResources(foldResList[i], 2, false);
				this.Common.RDFC.Init(this.DataSource.data, foldResList[i]);
				for(j=0;j<contResList.length;j++){
					if(!this.DataSource.data.ArcLabelsOut(contResList[j]).hasMoreElements() || this.Common.RDFCU.indexOf(this.DataSource.data, foldResList[i], contResList[j]) < 0) continue;
					delObj.push({
						pfid : pfid,
						id  : this.DataSource.getProperty(contResList[j],"id"),
						dbtype : this.DataSource.getProperty(contResList[j],"dbtype"),
						source : this.DataSource.getProperty(contResList[j],"source")
					});
					this.Common.RDFC.RemoveElement(contResList[j], true);
				}
			}
			var rmIDs = [];
			var addIDs = [];
			var depth = 0;
			do{
				addIDs = this.DataSource.cleanUpIsolation();
				rmIDs = rmIDs.concat(addIDs);
			}while(addIDs.length > 0 && ++depth < 100);
			this.DataSource.flush();
			var match_exp = new RegExp("^"+bitsMarker.id_key+".+$","m");
			for(var i=0;i<delObj.length;i++){
				this.Database.removeObject({oid:delObj[i].id,pfid:delObj[i].pfid},delObj[i].dbtype,false);
				if(delObj[i].source.match(match_exp)) bitsMarker.unmarkerWindow(delObj[i].source);
			}
		}catch(e){
			_dump("mcTreeHandler.removeAll():"+e);
			return false;
		}
		return true;
	},

	remove : function(aEvent,pRes,pConfirm,aTransaction){
		if(pConfirm == undefined) pConfirm = false;
		if(aTransaction == undefined) aTransaction = true;
		if(pRes == undefined && this.TREE.view.selection.count == 0) return false;
		if(!pConfirm) if(!mcController.confirmRemovingFor(this.resource)) return false;
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 0, this.resource);
		var resList = [];
		var parList = [];
		if(this.TREE.view.selection.count > 1){
			var idxList = this.getSelection(false, 2);
			if(idxList.length < 1) return false;
			if(this.validateMultipleSelection(idxList) == false) return false;
			var i;
			for(i=0;i<idxList.length;i++){
				resList.push(this.TREE.builderView.getResourceAtIndex(idxList[i]));
				parList.push(this.getParentResource(idxList[i]));
			}
		}else{
			var curRes;
			var parRes;
			if(pRes == undefined){
				var curIdx = this.TREE.currentIndex;
				curRes = this.TREE.builderView.getResourceAtIndex(curIdx);
				parRes = this.getParentResource(curIdx);
			}else{
				curRes = pRes;
				parRes = this.DataSource.findParentResource(pRes);
			}
			resList.push(curRes);
			parList.push(parRes);
			var match_exp = new RegExp("^"+bitsMarker.id_key+".+$","m");
			var source = this.DataSource.getProperty(curRes,"source");
			if(source.match(match_exp)) bitsMarker.unmarkerWindow(source);
			var id = this.DataSource.getProperty(curRes,"id");
			var dbtype = this.DataSource.getProperty(curRes,"dbtype");
			var pfid = this.DataSource.getProperty(curRes,"pfid");
			var about = this.DataSource.getID2About(id,pfid,dbtype);
			if(curRes.Value != about){
				var res = mcTreeDNDHandler.Common.RDF.GetResource(about);
				resList.push(res);
				parList.push(this.DataSource.findParentResource(res));
				var source = this.DataSource.getProperty(res,"source");
				if(source.match(match_exp)) bitsMarker.unmarkerWindow(source);
			}
			if(aTransaction) if(!this.Database.beginTransaction(dbtype)) return false;
			if(this.DataSource.isContainer(curRes)){
				this.Database.removeFolder(id,dbtype,false);
			}else{
				this.Database.removeObject({oid:id,pfid:pfid},dbtype,false);
			}
			if(aTransaction) this.Database.endTransaction(dbtype);
		}
		var rmIDs = mcController.removeInternal(resList, parList, false);
		if(aTransaction) mcPropertyView.dispProperty(mcTreeHandler.object);
		this.isEdit = true;
		if(aEvent) window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, this.resource);
		return true;
	},

	replacedURL : function(aEvent){
		var curIdx = this.TREE.currentIndex;
		var curRes = this.TREE.builderView.getResourceAtIndex(curIdx);
		var parRes = this.getParentResource(curIdx);
		var id = this.DataSource.getProperty(curRes,"id");
		var dbtype = this.DataSource.getProperty(curRes,"dbtype");
		if(!this.DataSource.isContainer(curRes)) return;
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
		var prompts = this.Common.PROMPT;
		var flags = prompts.STD_YES_NO_BUTTONS + prompts.BUTTON_POS_1_DEFAULT;
		var button = prompts.confirmEx(window, mcMainService.STRING.getString("CONFIRM_REPLACED_TITLE"), mcMainService.STRING.getString("CONFIRM_REPLACED_TARGET"), flags, "", "", "", null, {});
		var contResList = [];
		if(button==0){
			var folderList = this.DataSource.flattenResources(curRes, 1, true);
			for(var i=0;i<folderList.length;i++){
				var fid = this.DataSource.getProperty(folderList[i],"id");
				var rtn = this.Database.getObject({pfid : fid},dbtype);
				if(!rtn) continue;
				if(folderFilterHash[fid]) rtn = rtn.filter(function(element, index, array){ return folderFilterHash[fid].test(element.oid_title); });
				contResList = contResList.concat(rtn);
			}
		}else{
			var rtn = this.Database.getObject({pfid : id},dbtype);
			if(rtn){
				if(folderFilterHash[fid]) rtn = rtn.filter(function(element, index, array){ return folderFilterHash[fid].test(element.oid_title); });
				contResList = contResList.concat(rtn);
			}
		}
		if(contResList.length == 0){
			this.Common.alert(mcMainService.STRING.getString("ALERT_REPLACED_URL"), mcMainService.STRING.getString("CONFIRM_REPLACED_TITLE"));
			return;
		}
		var result = {};
		result.res = curRes;
		result.list = contResList;
		result.accept = false;
		result.objArr = null;
		result.callback = this._replacedURL_CB;
		if(this._replacedURL_window && !this._replacedURL_window.closed) this._replacedURL_window.close();
		this._replacedURL_window = window.openDialog("chrome://markingcollection/content/replacedURL.xul", "", "chrome,centerscreen,alwaysRaised=yes,dependent=yes", result);
	},

	_replacedURL_CB : function(aResult){
		var self = mcTreeHandler;
		if(aResult.accept){
			if(!self.progressWindow){
				var x = screen.width;
				var y = screen.height;
				self.progressWindow = window.openDialog(
					"chrome://markingcollection/content/progress.xul",
					"myProgress", "chrome,centerscreen,alwaysRaised,dependent=yes,left="+x+",top="+y, 
					{status: mcMainService.STRING.getString("MSG_REPLACED_URL") + "..."});
			}
			if(self.progressWindow && !self.progressWindow.closed){
				if(aResult.objArr.length>0){
					if(self.progressWindow.setStatus) self.progressWindow.setStatus(mcMainService.STRING.getString("MSG_REPLACED_URL") + "... [ "+ aResult.objArr.length + " ]");
					self.progressWindow.focus();
					setTimeout(function(){ mcTreeHandler._replacedURL(aResult.objArr); },0);
				}else{
					if(self.progressWindow && !self.progressWindow.closed) self.progressWindow.close();
					self.progressWindow = null;
				}
			}
		}
		if(self._replacedURL_window && !self._replacedURL_window.closed) self._replacedURL_window.close();
		self._replacedURL_window = null;
	},

	_replacedURL : function(aObjArr){
		if(this.progressWindow && !this.progressWindow.closed){
			if(aObjArr.length>0){
				if(this.progressWindow.setStatus) this.progressWindow.setStatus(mcMainService.STRING.getString("MSG_REPLACED_URL") + "... [ "+ aObjArr.length + " ]");
				this.progressWindow.focus();
			}else{
				if(this.progressWindow && !this.progressWindow.closed) this.progressWindow.close();
				this.progressWindow = null;
			}
		}
		if(aObjArr.length <= 0){
			mcTreeViewModeService.rebuild();
			return;
		}

		var obj = aObjArr.shift();
		var dbtype = obj.dbtype;
		delete obj.dbtype;
		if(obj.fid_style != undefined) delete obj.fid_style;
		if(obj.fid_title != undefined) delete obj.fid_title;
		if(obj.folder_order != undefined) delete obj.folder_order;
		var rtn = this.Database.updateObject(obj,dbtype);

		setTimeout(function(){ mcTreeHandler._replacedURL(aObjArr); },0);
	},

	getParentResource : function(aIdx){
		var parIdx = this.TREE.builderView.getParentIndex(aIdx);
		if(parIdx == -1)
			return this.TREE.resource;
		else
			return this.TREE.builderView.getResourceAtIndex(parIdx);
	},

	getSelection : function(idx2res, rule){
		var ret = [];
		var rc;
		var i;
		for(rc=0;rc<this.TREE.view.selection.getRangeCount();rc++){
			var start = {}, end = {};
			this.TREE.view.selection.getRangeAt(rc, start, end);
			for(i=start.value;i<= end.value;i++){
				if(rule == 1 && !this.TREE.view.isContainer(i)) continue;
				if(rule == 2 && this.TREE.view.isContainer(i)) continue;
				ret.push(idx2res ? this.TREE.builderView.getResourceAtIndex(i) : i);
			}
		}
		return ret;
	},

	validateMultipleSelection : function(aIdxList){
		if(aIdxList.length != this.TREE.view.selection.count){
			this.Common.alert(mcMainService.STRING.getString("ERROR_MULTIPLE_SELECTION"));
			return false;
		}
		return true;
	},

	toggleFolder : function(aIdx){
		if(!aIdx) aIdx = this.TREE.currentIndex;
		this.TREE.view.toggleOpenState(aIdx);
		if(this.autoCollapse) this.collapseFoldersBut(aIdx);
	},

	toggleAllFolders : function(forceClose){
		var willOpen = true;
		var i;
		for(i=0;i<this.TREE.view.rowCount;i++){
			if(!this.TREE.view.isContainer(i)) continue;
			if(this.TREE.view.isContainerOpen(i)){ willOpen = false; break; }
		}
		if(forceClose) willOpen = false;
		if(willOpen){
			for(i=0;i<this.TREE.view.rowCount;i++){
				if(this.TREE.view.isContainer(i) && !this.TREE.view.isContainerOpen(i)) this.TREE.view.toggleOpenState(i);
			}
		}else{
			for(i=this.TREE.view.rowCount-1;i>=0;i--){
				if(this.TREE.view.isContainer(i) && this.TREE.view.isContainerOpen(i)) this.TREE.view.toggleOpenState(i);
			}
		}
	},

	openAllFolders : function(){
		var i;
		for(i=0;i<this.TREE.view.rowCount;i++){
			if(this.TREE.view.isContainer(i) && !this.TREE.view.isContainerOpen(i)) this.TREE.view.toggleOpenState(i);
		}
	},

	collapseFoldersBut : function(curIdx){
		var ascIdxList = {};
		ascIdxList[curIdx] = true;
		while(curIdx >= 0){
			curIdx = this.TREE.builderView.getParentIndex(curIdx);
			ascIdxList[curIdx] = true;
		}
		var i;
		for(i=this.TREE.view.rowCount-1;i>=0;i--){
			if(!ascIdxList[i] && this.TREE.view.isContainer(i) && this.TREE.view.isContainerOpen(i)){
				this.TREE.view.toggleOpenState(i);
			}
		}
	},

};

var mcController = {
	_pageshow_elem_id : "",
	_pageshow_elem_dbtype : "",
	_pageshow_id      : "",

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get isTreeContext(){
		return document.popupNode.nodeName == "treechildren";
	},

	onPopupShowing : function(aEvent){
		if(aEvent.originalTarget.localName != "popup") return;
		var res = mcTreeHandler.resource;
		if(!res){ aEvent.preventDefault(); return; }
		var viewmode = mcTreeViewModeService.viewmode;
		var id   = this.DataSource.getProperty(res,"id");
		var type   = this.DataSource.getProperty(res,"type");
		var title  = this.DataSource.getProperty(res,"title");
		var source = this.DataSource.getProperty(res,"source");
		var dbtype = this.DataSource.getProperty(res,"dbtype");
		if(type == window.top.bitsMarkingCollection._uncategorized.dbtype) type= 'localfolder';
		var hidePopupRemoveFolder = false;
		var contFolderList = [];
		var contItemList = [];
		var existsObject = false;
		if(type.indexOf("folder")>=0){
			contFolderList = this.DataSource.flattenResources(res, 1, false);
			contItemList = this.DataSource.flattenResources(res, 2, true);
			var folderList = this.DataSource.flattenResources(res, 1, true);
			for(var i=0;i<folderList.length;i++){
				var fid = this.DataSource.getProperty(folderList[i],"id");
				if(!this.Database.existsObject({pfid : fid},dbtype)) continue;
				existsObject = true;
				break;
			}
			var refRootfolder = nsPreferences.copyUnicharPref("wiredmarker.rootfolder","");
			if(refRootfolder == id) hidePopupRemoveFolder = true;
		}
		var contextmenu_type = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.type","");
		try{
			document.getElementById("mcPopupOpen").hidden              =  type.indexOf("folder")>=0;
			document.getElementById("mcPopupOpenNewTab").hidden        =  type.indexOf("folder")>=0;
			document.getElementById("mcPopupOpenAllItems").hidden      =  true;
			document.getElementById("mcPopupOpenSeparator").hidden     =  (document.getElementById("mcPopupOpen").hidden && document.getElementById("mcPopupOpenAllItems").hidden);
			document.getElementById("mcPopupCreates").hidden           =  type.indexOf("folder")<0;
			document.getElementById("mcPopupRemoveContents").hidden    =  type.indexOf("folder")>=0 ;
			document.getElementById("mcPopupRemoves").hidden           =  type=="item" || (contFolderList.length<=1 && type=="localfolder");
			document.getElementById("mcPopupRemoveAllFolder").hidden   =  type=="item" || contFolderList.length<=1;
			document.getElementById("mcPopupRemoveFolder").hidden      =  type!="folder" || hidePopupRemoveFolder;
			document.getElementById("mcPopupRemoveAllContents").hidden =  contItemList.length==0;
			document.getElementById("mcPopupEditReplacedURL").hidden   =  type.indexOf("folder")<0 || !existsObject || contextmenu_type == "simple";
			document.getElementById("mcPopupViewMenu").hidden          =  type.indexOf("folder")<0;
			document.getElementById("mcPopupRootFolder").hidden        =  true;
			document.getElementById("mcPopupFilter").hidden            =  type.indexOf("folder")<0 || contextmenu_type == "simple";
			document.getElementById("mcPopupFilterSeparator").hidden   =  !document.getElementById("mcPopupRootFolder").hidden || document.getElementById("mcPopupFilter").hidden || contextmenu_type == "simple";
			document.getElementById("mcPopupExport").hidden            =  type.indexOf("folder")<0;
			document.getElementById("mcPopupTemplateFolder").hidden    =  type!="folder";
			document.getElementById("mcPopupImportTag").hidden         =  type!="folder" || contextmenu_type == "simple";
			document.getElementById("mcPopupFolderAutoOpenSeparator").hidden =  !document.getElementById("mcPopupRootFolder").hidden || mcItemView.isChecked;
			document.getElementById("mcPopupFolderAutoOpenSeparator").hidden = type!="folder" || mcItemView.isChecked;;
			document.getElementById("mcPopupFolderAutoOpen").hidden    =  type!="folder" || mcItemView.isChecked;
			document.getElementById("mcPopupAddonMenu").hidden = !(type.indexOf("folder")==0 && window.top.bitsScrapPartyAddonService.existsAddon(true) && contFolderList.length<=1 && !existsObject) || contextmenu_type == "simple";
			document.getElementById("mcPopupHyperAnchorCopyToClipboard").hidden =  type.indexOf("folder")>=0;
			document.getElementById("mcPopupHyperAnchorCopyFormatSetting").hidden =  type.indexOf("folder")>=0;
			document.getElementById("mcPopupHyperAnchorCopyFormatToClipboard").hidden =  type.indexOf("folder")>=0;
			if(!document.getElementById("mcPopupRootFolder").hidden){
				var index = mcTreeHandler.TREE.currentIndex;
				var res = mcTreeHandler.TREE.builderView.getResourceAtIndex(index);
				var baseID = this.DataSource.getProperty(res, "id");
				var rootfolder = nsPreferences.copyUnicharPref("wiredmarker.rootfolder","");
				if(baseID == rootfolder){
					document.getElementById("mcPopupRootFolder").setAttribute("checked",true);
				}else{
					document.getElementById("mcPopupRootFolder").removeAttribute("checked");
				}
			}
			if(!document.getElementById("mcPopupFilter").hidden){
				if(mcTreeFolderFilterService.isUseFilter(res))
					document.getElementById("mcPopupFilter").setAttribute("checked",true);
				else
					document.getElementById("mcPopupFilter").removeAttribute("checked");
			}
			if(!document.getElementById("mcPopupFolderAutoOpen").hidden){
				var folderautoopen = nsPreferences.getBoolPref("wiredmarker.folderautoopen", true);
				if(folderautoopen){
					document.getElementById("mcPopupFolderAutoOpen").removeAttribute("checked");
				}else{
					document.getElementById("mcPopupFolderAutoOpen").setAttribute("checked",true);
				}
			}
			document.getElementById("mcPopupFolderRemoveAllContents").hidden =  contItemList.length==0;
			document.getElementById("mcPopupFolderRemoveFolder").hidden      =  type!="folder" || hidePopupRemoveFolder;
			window.top.bitsScrapPartyAddonService.eventListener(aEvent ,1, res);
		}catch(ex){_dump(ex)}
	},

	onPopupHiding : function(aEvent){
		if(aEvent.originalTarget.localName != "popup") return;
		var res = mcTreeHandler.resource;
		if(!res){ aEvent.preventDefault(); return; }
		try{
			window.top.bitsScrapPartyAddonService.eventListener(aEvent ,1, res);
		}catch(ex){_dump(ex)}
	},

	copy : function(aMode){
		var aRes = mcTreeHandler.resource;
		if(!aRes) return;
		if(!aMode) aMode = 'copy';
		var id = this.DataSource.getProperty(aRes, "id");
		if(!id) return;
		switch(this.DataSource.getProperty(aRes, "type")){
			case "folder" :
			case "item" :
				var id = this.DataSource.getProperty(aRes,"id");
				var dbtype = this.DataSource.getProperty(aRes, "dbtype");
				window.top.bitsMetaCapture.copyToClipBoard(id,dbtype,aMode);
				break;
			default :
				break;
		}
	},

	open : function(aRes, tabbed){
		if(!aRes) aRes = mcTreeHandler.resource;
		if(!aRes) return;
		var id = this.DataSource.getProperty(aRes, "id");
		if(!id) return;
		switch(this.DataSource.getProperty(aRes, "type")){
			case "folder" :
			case "item" :
				var id = this.DataSource.getProperty(aRes,"id");
				var pfid = this.DataSource.getProperty(aRes,"pfid");
				var dbtype = this.DataSource.getProperty(aRes, "dbtype");
				var aObject = this.Database.getObject({oid:id,pfid:pfid},dbtype)[0];
				this.Common.loadFromObject(aObject,tabbed);
				break;
			default :
				this.Common.loadURL(mcMainService.baseURL + "data/" + id + "/index.html", tabbed || mcMainService.prefs.tabsOpen);
		}
	},

	openAllInTabs : function(aRes){
		if(!aRes) aRes = mcTreeHandler.resource;
		if(!aRes) return;
		var resList = this.DataSource.flattenResources(aRes, 2, true);
		resList.forEach(
			function(res){
				var uri  = window.top.bitsObjectMng.DataSource.getProperty(res, "uri");
				window.top.bitsObjectMng.Common.loadURL(uri, true); 
			}
		);
	},

	property : function(aRes){
		if(!aRes) aRes = mcTreeHandler.resource;
		if(!aRes) return;
		var id = this.DataSource.getProperty(aRes, "id");
		if(!id) return;
		var result = {};
		var regexp = new RegExp("^"+this.DataSource.ABOUT_ITEM+"(\\d+)$");
		aRes.Value.match(regexp);
		id = RegExp.$1;
		var old_style  = this.DataSource.getProperty(aRes, "style");
		window.openDialog("chrome://markingcollection/content/property.xul", "", "chrome,centerscreen,modal", id, result);
		if(result.accept){
			try{
				this.DataSource.flush();
				this.rebuildLocal();
				if(this.DataSource.isContainer(aRes)){
					var fid    = this.DataSource.getProperty(aRes, "id");
					var dbtype = this.DataSource.getProperty(aRes, "dbtype");
					var style  = this.DataSource.getProperty(aRes, "style");
					var title  = this.DataSource.getProperty(aRes, "title");
					if(fid == "0" && dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype){
						nsPreferences.setUnicharPref("wiredmarker.uncategorized.style", style);
						nsPreferences.setUnicharPref("wiredmarker.uncategorized.title", title);
					}else{
						if(this.Database.updateFolder({fid:fid,fid_style:style},dbtype)) this.DataSource.setProperty(aRes,"style",style);
					}
					var doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
					var contResList = this.Database.getObject({pfid:fid,doc_url:doc_url}, dbtype);
					if(contResList){
						var i;
						for(i=0;i<contResList.length;i++){
							var source = bitsMarker.id_key+contResList[i].dbtype+contResList[i].oid;
							mcTreeDNDHandler.Common.changeNodeStyleFromID(source,style,fid,contResList[i].oid,contResList[i].dbtype);
						}
					}
					this.DataSource.flush();
					mcTreeCssService.init();
					this.rebuildLocal();
					mcPropertyView.dispProperty(mcTreeHandler.object);
					if(mcItemView.isChecked) mcItemView.onTreeClick();
				}else{
					mcPropertyView.dispProperty(mcTreeHandler.object);
				}
			}catch(ex){_dump("property():["+ex+"]");}
		}
		return result.accept;
	},

	removeInternal : function(aResList, aParResList, aBypassConfirm){
		var rmIDs = [];
		for(var i=0;i<aResList.length;i++){
			var id = this.DataSource.getProperty(aResList[i],"id");
			var dbtype = this.DataSource.getProperty(aResList[i],"dbtype");
			var pfid = this.DataSource.getProperty(aResList[i],"pfid");
			if(!this.DataSource.exists(aResList[i]) || this.DataSource.getRelativeIndex(aParResList[i], aResList[i]) < 0){
				_dump("ERROR: Failed to remove resource.\n" + aResList[i].Value);
				continue;
			}
			rmIDs = rmIDs.concat(this.DataSource.deleteItemDescending(aResList[i], aParResList[i]));
			this.DataSource.setID2About(id,pfid,undefined,dbtype);
		}
		this.DataSource.flush();
		return rmIDs;
	},

	confirmRemovingFor : function(aRes){
		try{
			if(this.DataSource.isContainer(aRes) || mcMainService.prefs.confirmDelete){
				return this.Common.confirm( mcMainService.STRING.getString("CONFIRM_DELETE"));
			}
			return true;
		}catch(e){
			return false;
		}
	},

	rebuildLocal : function(){
		var currentIndex = mcTreeHandler.TREE.currentIndex;
		mcTreeHandler.TREE.builder.rebuild();
		if(currentIndex>=0){
			mcTreeHandler.TREE.currentIndex = currentIndex;
			if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
			mcTreeHandler.TREE.focus();
			mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(currentIndex);
			mcPropertyView.dispProperty(mcTreeHandler.object);
		}
	},

};

var mcMainService = {

	get STRING(){ return document.getElementById("mcMainString"); },

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()    { return window.top.bitsObjectMng.Common;     },
	get XPath()     { return window.top.bitsObjectMng.XPath;      },
	get Database()  { return window.top.bitsObjectMng.Database;   },
	get gBrowser()  { return window.top.bitsObjectMng.getBrowser();},

	baseURL : "",
	prefs   : {},
	_init   : false,

	init : function(aEvent){
		try{
			if(!window.top.bitsObjectMng){
				setTimeout(function(){ mcMainService.init(aEvent); },1000);
				return;
			}
		}catch(ex){
			setTimeout(function(){ mcMainService.init(aEvent); },1000);
			return;
		}
		try{
			window.top.bitsMarkingCollection._contentWindow = document.defaultView;
			this.initPrefs();
			this.DataSource.init();
			mcTreeHandler.init(false);
			mcTreeDNDHandler.init();
			mcTreeMultiDocumentService.init();
			mcItemView.init();
			mcTreeRootFolder.init();
			mcTreeViewModeService.init();
			mcTreeCssService.init();
			bitsTreeDate.init(aEvent);
			mcTreeTemplateFolder.init();
			mcTreeImageTooltip.init();
			mcTreeFavoriteFolder.init();
			try{
				this.gBrowser.addEventListener("pageshow", mcTreeHandler.pageshow, false);
				window.top.addEventListener("focus", mcDatabaseUpdate.rebuild, false);
			}catch(ex2){
				_dump2("mcMainService.init():"+ex2);
			}
			this.Common.addPrefListener(mcDatabaseObserver);
			var clone = top.document.getElementById("mciconimage");
			if(!clone){
				var sidebartitle = top.document.getElementById("sidebar-title");
				var sidebarthrobber = top.document.getElementById("sidebar-throbber");
				clone = sidebarthrobber.cloneNode(false);
				clone.setAttribute("src","chrome://markingcollection/skin/icon_16.gif");
				clone.setAttribute("id","mciconimage");
				clone.setAttribute("crop","end");
				sidebartitle.parentNode.insertBefore(clone,sidebartitle);
			}
			var viewmode = mcTreeViewModeService.viewmode;
			if(viewmode == "each") mcTreeHandler.openAllFolders();
			if(window.top.bitsScrapPartyAddonService && window.top.bitsScrapPartyAddonService.existsAddon()){
				var addon_info_arr = window.top.bitsScrapPartyAddonService.getAddonInfo();
				if(addon_info_arr && addon_info_arr.length > 0){
					var i;
					for(i=0;i<addon_info_arr.length;i++){
						if(!addon_info_arr[i].side_toolbar) continue;
						if(!addon_info_arr[i].side_toolbar.attrs.xul) continue;
						try{
							var xul = document.getElementsByTagName(addon_info_arr[i].side_toolbar.attrs.xul)[0].cloneNode(false);
							delete addon_info_arr[i].side_toolbar.attrs.xul;
							var j;
							for(j=xul.attributes.length-1;j>=0;j--){
								xul.removeAttribute(xul.attributes[j].name);
							}
							var event_attr = [];
							var key;
							for(key in addon_info_arr[i].side_toolbar.attrs){
								if(key.match(/^on([A-Za-z]+)$/)){
									event_attr[RegExp.$1] = addon_info_arr[i].side_toolbar.attrs[key];
								}else{
									xul.setAttribute(key,addon_info_arr[i].side_toolbar.attrs[key]);
								}
							}
							var pxul = document.getElementById("mcToolbarAddonHBox");
							pxul.appendChild(xul);
							for(key in event_attr){
								//xul.addEventListener(key,eval(event_attr[key]),false);
							}
						}catch(ex_xul){
							continue;
						}
					}
				}
				try{window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, undefined);}catch(ex){_dump2(ex)}
			}
			try{if(nsPreferences.getBoolPref("wiredmarker.debug", false)) document.getElementById("mcToolbarMenuButton").removeAttribute("hidden");}catch(e){}
			try{
				mcTreeViewModeService.rebuild();
			}catch(ex2){
				_dump2("mcMainService.init():"+ex2);
			}
			mcDatabaseUpdate.init();
			mcItemView.disp();
		}catch(ex){
			this.Common.alert("mcMainService.init():"+ex);
		}
	},

	initPrefs : function(){
		this.prefs.confirmDelete    = window.top.bitsObjectMng.Common.getBoolPref("wiredmarker.confirmDelete",     true);
		this.prefs.tabsOpen         = window.top.bitsObjectMng.Common.getBoolPref("wiredmarker.tabs.open",         false);
		this.prefs.tabsOpenSource   = window.top.bitsObjectMng.Common.getBoolPref("wiredmarker.tabs.openSource",   false);
	},

	refresh : function(){
		mcTreeHandler.done();
		mcTreeDNDHandler.quit();
		this.init();
	},

	done : function(aEvent){
		try{
			mcItemView.done();
			mcTreeRdfRebuildItem.done();
			this.Common.removePrefListener(mcDatabaseObserver);
			this.gBrowser.removeEventListener("pageshow", mcTreeHandler.pageshow, false);
			window.top.removeEventListener("focus", mcDatabaseUpdate.rebuild, false);
			var mciconimage = top.document.getElementById("mciconimage");
			if(mciconimage) mciconimage.parentNode.removeChild(mciconimage);
			mcTreeHandler.done();
			mcTreeDNDHandler.quit();
			mcTreeViewModeService.done();
			mcTreeTemplateFolder.done();
			mcTreeImageTooltip.done();
			try{
				window.top.bitsScrapPartyAddonService.eventListener(aEvent, 1, undefined);
			}catch(ex2){_dump(ex)}
			window.top.bitsObjectMng.DataSource.done();
		}catch(ex){this.Common.alert('done():'+ex);}
		try{ window.top.bitsMarkingCollection._contentWindow = null; }catch(e){}
	},

	locate : function(aRes){
		if(aRes.Value == window.top.bitsObjectMng.DataSource.ABOUT_ROOT) return;
		var resList = [aRes];
		var i;
		for(i=0;i<32;i++){
			aRes = window.top.bitsObjectMng.DataSource.findParentResource(aRes);
			if(aRes.Value == window.top.bitsObjectMng.DataSource.ABOUT_ROOT) break;
			resList.unshift(aRes);
		}
		for(i=0;i<resList.length;i++){
			var idx = mcTreeHandler.TREE.builderView.getIndexOfResource(resList[i]);
			if(!mcTreeHandler.TREE.view.isContainerOpen(idx)) mcTreeHandler.TREE.view.toggleOpenState(idx);
		}
		mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(idx);
		mcTreeHandler.TREE.view.selection.select(idx);
		mcTreeHandler.TREE.focus();
		mcPropertyView.dispProperty(mcTreeHandler.object);
	},

	createGroupFolder : function(pTitle,pTarResName,pGroup,pStyle,pSource,pEditMode,pIndex){
		var tarRes = this.Common.RDF.GetResource(pTarResName);
		var pPID = this.DataSource.getProperty(tarRes,"id");
		var dbtype = this.DataSource.getProperty(tarRes,"dbtype");
		var folder = this.Database.getFolderFormID(pPID,dbtype);
		var newFolder = this.Database.newFolder();
		newFolder.fid_title = pTitle;
		newFolder.fid_style = pStyle;
		newFolder.pfid = ""+pPID;
		newFolder.fid_mode = ""+pEditMode;
		if(!this.Database.addFolder(newFolder,dbtype)) return null;
		var newItem = this.Common.newItem();
		newItem.id = newFolder.fid;
		newItem.about = this.DataSource.getAbout(newFolder.fid,newFolder.pfid,dbtype);
		newItem.pfid = pPID;
		newItem.title = pTitle;
		newItem.type = "folder";
		newItem.style = pStyle;
		newItem.source = pSource;
		newItem.cssrule = 'css_'+dbtype+'_'+newFolder.fid;
		newItem.dbtype = dbtype;
		if(pIndex) newItem.index = pIndex;
		if(pEditMode){
			newItem.editmode = pEditMode;
		}else{
			newItem.editmode = "false";
		}
//0.299*R + 0.587*G + 0.114*B
		var tarResName, tarRelIdx;
		tarResName = pTarResName;
		try{
			var cont = window.top.bitsObjectMng.DataSource.getContainer(tarResName, false);
			tarRelIdx  = cont.GetCount();
		}catch(ex){
			tarRelIdx = -1;
		}
		var newRes = window.top.bitsObjectMng.DataSource.addItem(newItem, tarResName, tarRelIdx, dbtype);
		if(newRes && newRes.Value){
			window.top.bitsObjectMng.DataSource.flush();
			window.top.bitsObjectMng.DataSource.createEmptySeq(newRes.Value);
		}
		return newRes;
	},

	openPrefWindow : function(){
		window.top.bitsMarkingCollection.openPrefWindow();
	},
};

var mcTreeDNDHandler = {

	row    : 0,
	orient : 0,
	modAlt   : false,
	modShift : false,
	modCtrl  : false,
	modMeta  : false,
	_dataTransfer : null, //3.1以降

	folderAutoOpenRow : -1,

	rangeParent : null,
	originalTarget : null,

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	onDragDrop : function(aEvent){
		mcTreeDNDHandler.getModifiers(aEvent);
		this.nsDragAndDrop_drop(aEvent,mcTreeDNDHandler.dragDropObserver);
		aEvent.stopPropagation();
	},

	nsDragAndDrop_drop : function (aEvent, aDragDropObserver){
		if(!("onDrop" in aDragDropObserver)) return;
		if(!nsDragAndDrop.checkCanDrop(aEvent, aDragDropObserver)) return;
		if(nsDragAndDrop.mDragSession.canDrop){
			var flavourSet = aDragDropObserver.getSupportedFlavours();
			var transferData = mcTreeDNDHandler.nsTransferable_get(flavourSet, nsDragAndDrop.getDragData, true);
			var multiple = "canHandleMultipleItems" in aDragDropObserver && aDragDropObserver.canHandleMultipleItems;
			var dropData = multiple ? transferData : transferData.first.first;
			aDragDropObserver.onDrop(aEvent, dropData, nsDragAndDrop.mDragSession);
		}
		aEvent.stopPropagation();
	},

	nsTransferable_get: function (aFlavourSet, aRetrievalFunc, aAnyFlag){
		if(!aRetrievalFunc) throw "No data retrieval handler provided!";
		var supportsArray = aRetrievalFunc(aFlavourSet);
		var dataArray = [];
		var count = supportsArray.Count();
		for(var i=0;i<count;i++){
			var trans = supportsArray.GetElementAt(i);
			if(!trans) continue;
			trans = trans.QueryInterface(Components.interfaces.nsITransferable);
			var data = {};
			var length = {};
			var currData = null;
			if(aAnyFlag){ 
				var flavour = {};
				try{
					trans.getAnyTransferData(flavour, data, length);
					if(data && flavour){
						var selectedFlavour = aFlavourSet.flavourTable[flavour.value];
						if(selectedFlavour) dataArray[i] = FlavourToXfer(data.value, length.value, selectedFlavour);
					}
				}catch(ex){
					_dump2("nsTransferable_get("+i+"):"+ex);
					continue;
				}
			}else{
				var firstFlavour = aFlavourSet.flavours[0];
				trans.getTransferData(firstFlavour, data, length);
				if(data && firstFlavour) dataArray[i] = FlavourToXfer(data.value, length.value, firstFlavour);
			}
		}
    return new TransferDataSet(dataArray);
	},

	dragDropObserver : {
		onDragStart : function(event, transferData, action){
			try{mcTreeImageTooltip.hidePopup()}catch(ex){}
			try{
				if(event.originalTarget.localName != "treechildren") return;
				var curIdx = mcTreeHandler.TREE.currentIndex;
				var res = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
				var source = mcTreeDNDHandler.DataSource.getProperty(res,"source");
				var editmode = mcTreeDNDHandler.DataSource.getProperty(res,"editmode");
				var curPar = mcTreeHandler.getParentResource(curIdx);
				var p_source = window.top.bitsObjectMng.DataSource.getProperty(curPar,"source");
				transferData.data = new TransferData();
				transferData.data.addDataForFlavour("moz/rdfitem", res.Value);
			}catch(ex){
				_dump("dragDropObserver.onDragStart():"+ex);
			}
		},
		getSupportedFlavours : function(){
			var flavours = new FlavourSet();
			flavours.appendFlavour("moz/rdfitem");
			flavours.appendFlavour("text/x-moz-url");
			flavours.appendFlavour("text/html");
			flavours.appendFlavour("text/xml");
			flavours.appendFlavour("application/x-moz-url");
			flavours.appendFlavour("application/x-moz-file","nsIFile");
			flavours.appendFlavour("text/unicode");
			flavours.appendFlavour("wired-marker/folder");
			flavours.appendFlavour("wired-marker/object");
			return flavours;
		},
		onDragOver : function(event, flavour, session){},
		onDragExit : function(event, session){},
		onDrop     : function(event, transferData, session){},
	},

	builderObserver : {
		canDrop : function(index, orient){
			var XferDataSet  = null;
			var XferData     = null;
			var doraggedData = null;
			var XferDataType = null;
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			var app_version = parseFloat(info.version);
			if(app_version<3.1){
				try{
					XferDataSet  = nsTransferable.get(mcTreeDNDHandler.dragDropObserver.getSupportedFlavours(),nsDragAndDrop.getDragData,true);
					XferData     = XferDataSet.first.first;
					doraggedData = XferData.data;
					XferDataType = XferData.flavour.contentType;
				}catch(ex){}
			}else{
				try{
					if(mcTreeDNDHandler._dataTransfer){
						var dataTransfer = mcTreeDNDHandler._dataTransfer;
						XferData = {};
						var supportedTypes = ["moz/rdfitem", "wired-marker/object", "text/x-moz-url", "text/url-list", "text/plain", "application/x-moz-file"];
						var types = dataTransfer.types;
						types = supportedTypes.filter(function(value){ return types.contains(value);});
						if(types.length){
							XferData.data = dataTransfer.getData(types[0]);
							XferData.flavour = {contentType : types[0]};
							if(!XferData.data) XferData.data = dataTransfer.mozGetDataAt(types[0],0);
						}
						if(XferData.data){
							doraggedData = XferData.data;
							XferDataType = XferData.flavour.contentType;
						}
					}
				}catch(ex){
					XferData     = undefined;
					doraggedData = undefined;
					XferDataType = undefined;
				}
			}
			try{
				var res = ( index == -1) ? [mcTreeHandler.TREE.ref, 0] : mcTreeDNDHandler.getTarget(index, orient);
				var curRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(index);
				var editmode = window.top.bitsObjectMng.DataSource.getProperty(curRes,"editmode");
				var dbtype = window.top.bitsObjectMng.DataSource.getProperty(curRes,"dbtype");
				if(dbtype == "") return false;
				if(res[0] == mcTreeHandler.TREE.ref && !(editmode & 0x1000)) return false;
				if(mcTreeHandler.TREE.currentIndex>=0 && XferDataType == "moz/rdfitem"){
					var srcRes = mcTreeHandler.resource;
					var d_editmode = window.top.bitsObjectMng.DataSource.getProperty(srcRes,"editmode");
					if(res[0] != mcTreeHandler.TREE.ref && (d_editmode & 0x1000)) return false;
					if(res[0] != mcTreeHandler.TREE.ref && ((editmode & 0x1000) && (d_editmode & 0x1000))) return false;
				}else{
					if(editmode & 0x1000){
						if(XferDataType == "text/x-moz-url" || XferDataType == "application/x-moz-file"){
							var url;
							var aFile;
							if(XferDataType == "text/x-moz-url"){
								url = doraggedData.split("\n")[0];
								aFile = mcTreeHandler.Common.convertURLToFile(url);
							}else if(XferDataType == "application/x-moz-file"){
								aFile = doraggedData;
								url = mcTreeDNDHandler.Common.convertFilePathToURL(aFile.path);
							}
							if(!aFile || !aFile.exists() || !url) return false;
							var splitFileName = mcTreeHandler.Common.splitFileName(url);
							if(splitFileName[1].toLowerCase() != "xml" && splitFileName[1].toLowerCase() != "zip") return false;
						}else{
							return false;
						}
					}else if(index>0 && orient<0){
						var prevRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(index-1);
						var prevEditmode = window.top.bitsObjectMng.DataSource.getProperty(prevRes,"editmode");
						if(prevEditmode & 0x1000) return false;
					}
				}
				if(index != -1 && !mcTreeHandler.TREE.view.isContainer(index) && orient == 0) return false;
				window.top.bitsScrapPartyAddonService.builderViewObserver.canDrop(index, orient, mcTreeHandler.TREE);
				return true;
			}catch(ex){
				return false;
			}
		},
		onDrop : function(row, orient){
			var XferDataSet  = null;
			var XferData     = null;
			var doraggedData = null;
			var XferDataType = null;
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			var app_version = parseFloat(info.version);
			if(app_version<3.1){
				try{
					XferDataSet  = nsTransferable.get(mcTreeDNDHandler.dragDropObserver.getSupportedFlavours(),nsDragAndDrop.getDragData,true);
					XferData     = XferDataSet.first.first;
					doraggedData = XferData.data;
					XferDataType = XferData.flavour.contentType;
				}catch(ex){}
			}else{
				try{
					if(mcTreeDNDHandler._dataTransfer){
						var dataTransfer = mcTreeDNDHandler._dataTransfer;
						XferData = {};
						var supportedTypes = ["moz/rdfitem", "wired-marker/object", "text/x-moz-url", "text/url-list", "text/plain", "application/x-moz-file"];
						var types = dataTransfer.types;
						types = supportedTypes.filter(function(value){ return types.contains(value); });
						if(types.length){
							XferData.data = dataTransfer.getData(types[0]);
							XferData.flavour = {contentType : types[0]};
							if(!XferData.data) XferData.data = dataTransfer.mozGetDataAt(types[0],0);
						}
						if(XferData.data){
							doraggedData = XferData.data;
							XferDataType = XferData.flavour.contentType;
						}
					}
				}catch(ex){}
			}
			var state;
//			try{
				if(XferDataType == "moz/rdfitem"){
					if(mcTreeHandler.TREE.currentIndex>=0 && mcTreeHandler.TREE.currentIndex != row && window.top.bitsScrapPartyMergeService){
						var srcRes = mcTreeHandler.resource;
						var dstRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(row);
						var param = {
							tree     : mcTreeHandler.TREE,
							srcRes   : srcRes,
							dstRes   : dstRes,
							modCtrl  : mcTreeDNDHandler.modCtrl,
							modAlt   : mcTreeDNDHandler.modAlt,
							modShift : mcTreeDNDHandler.modShift,
							modMeta  : mcTreeDNDHandler.modMeta
						};
						var mergeRtn = window.top.bitsScrapPartyMergeService.mergeResource(param);
						if(mergeRtn){
							window.top.bitsScrapPartyAddonService.builderViewObserver.onDrop(row, orient, mcTreeHandler.TREE, XferDataSet);
							return;
						}
						if(window.top.bitsScrapPartyMergeService.cancel){
							window.top.bitsScrapPartyAddonService.builderViewObserver.onDrop(row, orient, mcTreeHandler.TREE, XferDataSet);
							mcTreeViewModeService.rebuild();
							return;
						}
						var src_dbtype = mcTreeDNDHandler.DataSource.getProperty(srcRes,"dbtype");
						var dst_dbtype = mcTreeDNDHandler.DataSource.getProperty(dstRes,"dbtype");
						if(src_dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || dst_dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || mcTreeDNDHandler.modShift){
							mcTreeDNDHandler.modShift = true;
							mcTreeDNDHandler.move(row, orient);
						}else{
							if(mcTreeDNDHandler.modCtrl || mcTreeDNDHandler.modMeta){
								mcTreeDNDHandler.copy(row, orient);
							}else{
								mcTreeDNDHandler.move(row, orient);
							}
						}
					}else{
						if(mcTreeDNDHandler.modCtrl || mcTreeDNDHandler.modMeta){
							mcTreeDNDHandler.copy(row, orient);
						}else{
							mcTreeDNDHandler.move(row, orient);
						}
					}
				}else if(XferDataType == "wired-marker/object" && XferData){
					var dstRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(row);
					var type = mcTreeHandler.DataSource.getProperty(dstRes, "type");
					if(!(type & 0x1000) && mcTreeHandler.TREE.currentIndex>=0 && mcTreeHandler.TREE.currentIndex != row && window.top.bitsScrapPartyMergeService){
						var srcRes = mcTreeHandler.resource;
						var mergeRtn = mcItemView.mergeObject(srcRes,dstRes);
						if(mergeRtn) return;
						var src_dbtype = mcTreeDNDHandler.DataSource.getProperty(srcRes,"dbtype");
						if(!src_dbtype || src_dbtype == ""){
							if(mcItemView.isChecked){
								var object = mcItemView.object;
								if(object.dbtype) src_dbtype = object.dbtype;
							}
						}
						if(!src_dbtype || src_dbtype == "") return;
						var dst_dbtype = mcTreeDNDHandler.DataSource.getProperty(dstRes,"dbtype");
						if(src_dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || dst_dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || mcTreeDNDHandler.modShift){
							mcItemView.moveObject(dstRes,true);
						}else{
							if(mcItemView.modCtrl || mcItemView.modMeta){
								mcItemView.copyObject(dstRes);
							}else{
								mcItemView.moveObject(dstRes,mcItemView.modShift);
							}
						}
					}
				}else if(XferDataType == "application/x-moz-file" && XferData){
					if(XferData.data instanceof Components.interfaces.nsIFile){
						var urlString = mcTreeDNDHandler.Common.convertFilePathToURL(XferData.data.path);
						state = mcTreeDNDHandler.capture(urlString, row, orient);
					}
				}else if(XferData && XferData.data){
					if(
						mcTreeDNDHandler.originalTarget &&
						mcTreeDNDHandler.originalTarget.nodeName == "IMG" &&
						mcTreeDNDHandler.originalTarget.hasAttribute('oid') &&
						mcTreeDNDHandler.originalTarget.hasAttribute('dbtype') &&
						mcTreeDNDHandler.originalTarget.hasAttribute('pfid')){
						var oid = mcTreeDNDHandler.originalTarget.getAttribute('oid');
						var dbtype = mcTreeDNDHandler.originalTarget.getAttribute('dbtype');
						var pfid = mcTreeDNDHandler.originalTarget.getAttribute('pfid');
						var dstRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(row);
						var dst_fid = mcTreeDNDHandler.DataSource.getProperty(dstRes,"id");
						var dst_dbtype = mcTreeDNDHandler.DataSource.getProperty(dstRes,"dbtype");
						var dst_style = mcTreeDNDHandler.DataSource.getProperty(dstRes,"style");
						if(dst_fid == pfid && dst_dbtype == dbtype) return;
						var srcObjects = mcTreeDNDHandler.Database.getObject({oid:oid,pfid:pfid}, dbtype);
						var mergeRtn = window.top.bitsTreeListService.mergeObject({fid:dst_fid,dbtype:dst_dbtype},srcObjects[0]);
						if(mergeRtn) return;
						var rtnObj = null;
						if(dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || mcTreeDNDHandler.modShift){
							rtnObj = window.top.bitsTreeListService.moveObject({fid:dst_fid,dbtype:dst_dbtype,fid_style:dst_style},srcObjects[0],true);
						}else{
							rtnObj = window.top.bitsTreeListService.copyObject({fid:dst_fid,dbtype:dst_dbtype,fid_style:dst_style},srcObjects[0]);
						}
						if(rtnObj){
							setTimeout(function(){
								try{
									mcTreeHandler.TREE.currentIndex = row;
									if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
									mcPropertyView.dispProperty(mcTreeHandler.object);
									var viewmode = mcTreeViewModeService.viewmode;
									if(mcItemView.isChecked){
										mcItemView._bitsItemView.onTreeClick({viewmode:viewmode,fid:dst_fid,dbtype:dst_dbtype,res:dstRes});
									}else{
										var f_pfid = undefined;
										var rtnFolder = mcTreeDNDHandler.Database.getFolder({fid:pfid},dbtype);
										if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
										rtnFolder = undefined;
										if(dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || mcTreeDNDHandler.modShift){
											var srcPRes = mcTreeDNDHandler.Common.RDF.GetResource(mcTreeDNDHandler.DataSource.getID2About(pfid,f_pfid,dbtype));
											var srcAbout = mcTreeDNDHandler.DataSource.getID2About(oid,pfid,dbtype);
											var srcRes = mcTreeDNDHandler.Common.RDF.GetResource(srcAbout);
											if(mcTreeDNDHandler.DataSource.moveItem(srcRes, srcPRes, dstRes, -1)){
												mcTreeDNDHandler.DataSource.setProperty(srcRes, "dbtype", dst_dbtype);
												mcTreeDNDHandler.DataSource.setProperty(srcRes, "pfid", dst_fid);
												mcTreeDNDHandler.DataSource.setProperty(srcRes, "id", rtnObj.oid);
												mcTreeDNDHandler.DataSource.setID2About(oid,pfid,undefined,dbtype);
												mcTreeDNDHandler.DataSource.setID2About(rtnObj.oid,dst_fid,srcRes.Value,dst_dbtype);
												mcTreeDNDHandler.changeNodeStyle(srcRes);
											}
										}else{
											mcTreeDNDHandler.DataSource.addItem(mcTreeDNDHandler.Database.makeObjectToItem(rtnObj),dstRes.Value,-1,dst_dbtype);
										}
										mcTreeDNDHandler.DataSource.flush();
										mcTreeCssService.init();
										mcController.rebuildLocal();
									}
									window.top.bitsTreeListService.reload(mcTreeDNDHandler.originalTarget.ownerDocument);
									mcTreeDNDHandler.originalTarget = null;
								}catch(e){
									_dump2(e);
								}
							},0);
						}
					}else{
						state = mcTreeDNDHandler.capture(XferData.data, row, orient);
					}
				}
//			}catch(ex){_dump2("onDrop():"+ex);}
			mcController.rebuildLocal();
			window.top.bitsScrapPartyAddonService.builderViewObserver.onDrop(row, orient, mcTreeHandler.TREE, XferDataSet, state);
		},
		onToggleOpenState     : function(aRow){},
		onCycleHeader         : function(){},
		onSelectionChanged    : function(){},
		onCycleCell           : function(aRow, pColID){},
		isEditable            : function(){},
		onSetCellText         : function(){},
		onPerformAction       : function(){},
		onPerformActionOnRow  : function(){},
		onPerformActionOnCell : function(aAction, aRow, aColID){},
	},

	getModifiers : function(aEvent){
		this.modAlt   = aEvent.altKey;
		this.modShift = aEvent.shiftKey;
		this.modCtrl  = aEvent.ctrlKey;
		this.modMeta  = aEvent.metaKey;
	},

	setDataTransfer : function(aEvent){
		try{if(aEvent.dataTransfer) this._dataTransfer = aEvent.dataTransfer;}catch(e){}
	},

	onMousedown : function(aEvent){
		try{ mcTreeDNDHandler.rangeParent = aEvent.rangeParent; }catch(ex){}
		try{ mcTreeDNDHandler.originalTarget = aEvent.originalTarget; }catch(ex){}
	},

	init : function(){
		this.gBrowser.addEventListener("mousedown", this.onMousedown, false);
	},

	quit : function(){
		try{ this.gBrowser.removeEventListener("mousedown", this.onMousedown, false); }catch(ex){}
	},

	move : function(aRow, aOrient){
		this.row = aRow;
		this.orient = aOrient;
		this.rowRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(aRow);
		(mcTreeHandler.TREE.view.selection.count == 1) ? this.moveSingle() : this.moveMultiple();
	},

	moveSingle : function(){
		var curIdx = mcTreeHandler.TREE.currentIndex;
		var curRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);

		var id = this.DataSource.getProperty(curRes,"id");
		var dbtype = this.DataSource.getProperty(curRes,"dbtype");
		var pfid = this.DataSource.getProperty(curRes,"pfid");
		var about = this.DataSource.getID2About(id,pfid,dbtype);
		var curRes = mcTreeDNDHandler.Common.RDF.GetResource(about);
		var curPar = this.DataSource.findParentResource(curRes);
		var tarRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(this.row);
		var tarPar = ( this.orient == 0) ? tarRes : mcTreeHandler.getParentResource(this.row);
		this.moveAfterChecking(curRes, curPar, tarRes, tarPar);
		window.top.bitsObjectMng.DataSource.flush();
	},

	moveMultiple : function(){
		var idxList = mcTreeHandler.getSelection(false, 2);
		if(mcTreeHandler.validateMultipleSelection(idxList) == false) return;
		var i = 0;
		var curResList = []; var curParList = [];
		var tarResList = []; var tarParList = [];
		for(i=0;i<idxList.length;i++){
			curResList.push( mcTreeHandler.TREE.builderView.getResourceAtIndex(idxList[i]));
			curParList.push( mcTreeHandler.getParentResource(idxList[i]));
			tarResList.push( mcTreeHandler.TREE.builderView.getResourceAtIndex(this.row));
			tarParList.push( ( this.orient == 0) ? tarResList[i] : mcTreeHandler.getParentResource(this.row));
		}
		if(this.orient == 1){
			for(i=idxList.length-1;i>=0;i--){
				this.moveAfterChecking(curResList[i], curParList[i], tarResList[i], tarParList[i]);
			}
		}else{
			for(i=0;i<idxList.length;i++){
				this.moveAfterChecking(curResList[i], curParList[i], tarResList[i], tarParList[i]);
			}
		}
		window.top.bitsObjectMng.DataSource.flush();
	},

	moveAfterChecking : function(curRes, curPar, tarRes, tarPar){
		var curAbsIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(curRes);
		var curRelIdx = this.DataSource.getRelativeIndex(curPar, curRes);
		var tarRelIdx = this.DataSource.getRelativeIndex(tarPar, tarRes);
		if(this.orient == 0){
			if(curAbsIdx == this.row) return;
		}else{
			if(this.orient == 1) tarRelIdx++;
			if(curPar.Value == tarPar.Value && tarRelIdx > curRelIdx) tarRelIdx--;
			if(this.orient == 1 &&
				 mcTreeHandler.TREE.view.isContainer(this.row) &&
				 mcTreeHandler.TREE.view.isContainerOpen(this.row) &&
				 mcTreeHandler.TREE.view.isContainerEmpty(this.row) == false){
				if(curAbsIdx == this.row) return;
				tarPar = tarRes;
				tarRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(this.row + 1);
				tarRelIdx = 1;
			}
			if(curPar.Value == tarPar.Value && curRelIdx == tarRelIdx) return;
		}
		if(curAbsIdx>=0 && mcTreeHandler.TREE.view.isContainer(curAbsIdx)){
			var tmpIdx = this.row;
			var tmpRes = tarRes;
			while(tmpRes.Value != mcTreeHandler.TREE.ref && tmpIdx != -1){
				tmpRes = mcTreeHandler.getParentResource(tmpIdx);
				tmpIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(tmpRes);
				if(tmpRes.Value == curRes.Value) return;
			}
		}
		var rtn = false;
		var tar_pfid = this.DataSource.getProperty(tarPar, "id");
		var tar_dbtype = this.DataSource.getProperty(tarPar, "dbtype");
		var cur_dbtype = this.DataSource.getProperty(curRes, "dbtype");
		var cur_pfid = this.DataSource.getProperty(curRes, "pfid");
		var rtnFolder = null;
		var rtnObject = null;
		var pfid_order = 0;
		if(this.DataSource.isContainer(this.rowRes)){
			var tmp_fid = this.DataSource.getProperty(this.rowRes, "id");
			rtnFolder = this.Database.getFolderFormID(tmp_fid,tar_dbtype);
			if(rtnFolder && rtnFolder.length) pfid_order = rtnFolder[0].pfid_order;
		}else{
			var tmp_oid = this.DataSource.getProperty(this.rowRes, "id");
			rtnObject = this.Database.getObject({oid:tmp_oid,pfid:tar_pfid},tar_dbtype);
			if(rtnObject && rtnObject.length) pfid_order = rtnObject[0].pfid_order;
		}
		if(this.orient>=0) pfid_order = parseFloat(parseFloat(pfid_order) + parseFloat(this.orient));
		if(curAbsIdx>=0 && mcTreeHandler.TREE.view.isContainer(curAbsIdx)){
			var fid = this.DataSource.getProperty(curRes, "id");
			if(cur_dbtype == tar_dbtype){
				rtn = this.Database.updateFolder({fid:fid,pfid:tar_pfid,pfid_order:pfid_order},tar_dbtype);
				if(rtn){
					this.DataSource.setProperty(curRes, "pfid", tar_pfid);
					this.DataSource.setProperty(curRes, "pfid_order", pfid_order);
					this.DataSource.setID2About(fid,cur_pfid,undefined,cur_dbtype);
					this.DataSource.setID2About(fid,tar_pfid,curRes.Value,tar_dbtype);
				}
			}else{
				this.moveFolder(curRes, curPar, tarPar, tarRelIdx);
				return;
			}
		}else{
			var oid = this.DataSource.getProperty(curRes, "id");
			if(tar_pfid != cur_pfid){
				rtn = !this.Database.existsObject({oid:oid,pfid:tar_pfid},tar_dbtype);
			}else{
				rtn = true;
			}
			if(!rtn){
				rtn = this.Common.confirm(mcMainService.STRING.getString("CONFIRM_COPYOBJECT_OVERWRITE"));
				if(rtn){
					var contResList = this.DataSource.flattenResources(tarPar, 2, false);
					var i;
					for(i=0;i<contResList.length;i++){
						if(contResList[i].Value == curRes.Value) continue;
						var del_oid = this.DataSource.getProperty(contResList[i], "id");
						if(del_oid != oid) continue;
						mcTreeHandler.remove(undefined,contResList[i],true,false);
					}
				}
			}
			if(rtn){
				if(cur_dbtype == tar_dbtype){
					if(cur_pfid != tar_pfid){
						rtn = this.Database.updateObject({oid:oid,pfid:tar_pfid,pfid_old:cur_pfid,pfid_order:pfid_order},tar_dbtype);
						if(rtn){
							this.DataSource.setProperty(curRes, "pfid", tar_pfid);
							this.DataSource.setProperty(curRes, "pfid_order", pfid_order);
							this.DataSource.setID2About(oid,cur_pfid,undefined,cur_dbtype);
							this.DataSource.setID2About(oid,tar_pfid,curRes.Value,tar_dbtype);
						}
					}
				}else{
					this.moveObject(curRes, curPar, tarPar, tarRelIdx);
					return;
				}
			}
		}
		if(rtn){
			rtn = this.DataSource.moveItem(curRes, curPar, tarPar, tarRelIdx);
			if(rtn){
				if(this.DataSource.isContainer(this.Common.RDF.GetResource(curRes.Value))){
				}else{
					mcTreeDNDHandler.changeNodeStyle(curRes);
				}
				window.top.bitsMarkingCollection.reOrder(tarPar);
				var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(this.Common.RDF.GetResource(curRes.Value));
				if(selectIdx>=0){
					mcTreeHandler.TREE.currentIndex = selectIdx;
					if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
					mcTreeHandler.TREE.focus();
					mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
					mcPropertyView.dispProperty(mcTreeHandler.object);
				}
			}else{
				mcTreeViewModeService.rebuild();
			}
		}
	},

	moveFolder : function(curRes, curPar, tarPar, tarRelIdx){
		var rtn = false;
		var modShift = this.modShift;
		var tar_dbtype = this.DataSource.getProperty(tarPar, "dbtype");
		var cur_dbtype = this.DataSource.getProperty(curPar, "dbtype");
		var aTransaction = true;
		if(!aTransaction){
			this.Database.beginTransaction(tar_dbtype);
			this.Database.beginTransaction(cur_dbtype);
		}
		var addPar;
		var moveRes = null;
		var moveFids = [];
		var fid2newfid = [];
		var moveID = parseInt(this.DataSource.identify(this.Common.getTimeStamp()));
		var i,j;
		var fldResList = this.DataSource.flattenResources(curRes, 1, true);
		for(i=0;i<fldResList.length;i++){
			addParAbout = null;
			var tmp_fid = this.DataSource.getProperty(fldResList[i], "id");
			if(this.Database._idExists(tar_dbtype,tmp_fid,aTransaction)){
				fid2newfid[""+tmp_fid] = ""+moveID;
				moveID = parseInt(moveID)+1;
			}else{
				fid2newfid[""+tmp_fid] = ""+tmp_fid;
			}
			var tmp_dbtype = this.DataSource.getProperty(fldResList[i], "dbtype");
			var moveFolder = this.Database.getFolderFormID(tmp_fid, tmp_dbtype, aTransaction);
			if(!moveFolder || moveFolder.length==0) break;
			moveFolder = moveFolder[0];
			delete moveFolder.dbtype;
			if(fid2newfid[""+moveFolder.fid]) moveFolder.fid = fid2newfid[""+moveFolder.fid];
			moveFids.push(moveFolder);
			if(curRes.Value == fldResList[i].Value){
				moveFolder.pfid = this.DataSource.getProperty(tarPar, "id");
				addParAbout = tarPar.Value;
			}else if(fid2newfid[""+moveFolder.pfid]){
				moveFolder.pfid = fid2newfid[""+moveFolder.pfid];
			}
			rtn = this.Database.addFolder(moveFolder, tar_dbtype, aTransaction);
			if(rtn){
				if(!addParAbout){
					var fid = moveFolder.pfid;
					var f_pfid = undefined;
					var rtnFolder = this.Database.getFolder({fid:moveFolder.pfid},tar_dbtype);
					if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
					rtnFolder = undefined;
					addParAbout = this.DataSource.getID2About(moveFolder.pfid,f_pfid,tar_dbtype);
				}
				var newItem = this.Common.newItem();
				newItem.id = moveFolder.fid;
				newItem.about = this.DataSource.getAbout(moveFolder.fid,moveFolder.pfid,tar_dbtype);
				newItem.pfid = moveFolder.pfid;
				newItem.title = moveFolder.fid_title;
				newItem.type = "folder";
				newItem.style = moveFolder.fid_style;
				newItem.source = "";
				newItem.cssrule = 'css_'+tar_dbtype+'_'+moveFolder.fid;
				newItem.dbtype = tar_dbtype;
				newItem.editmode = moveFolder.fid_mode;
				newItem.icon = this.DataSource.getProperty(fldResList[i], "icon");
				newItem.addon_id = this.DataSource.getProperty(fldResList[i], "addon_id");
				var tarRelIdx = -1;
				try{
					var cont = this.DataSource.getContainer(addParAbout, false);
					tarRelIdx = cont.GetCount();
				}catch(ex){}
				var newRes = this.DataSource.addItem(newItem, addParAbout, tarRelIdx, tar_dbtype);
				if(newRes && newRes.Value){
					this.DataSource.createEmptySeq(newRes.Value);
					if(!moveRes) moveRes = newRes;
				}
			}else{//失敗した場合
				if(moveRes) mcTreeHandler._removeFolder(moveRes);
				break;
			}
		}
		if(mcItemView.isChecked){
			var objResList = [];
			if(rtn){
				var tmp_fid = this.DataSource.getProperty(curRes, "id");
				var tmp_dbtype = this.DataSource.getProperty(curRes, "dbtype");
				objResList = window.top.bitsTreeExportService._getAllObject({fid:tmp_fid,dbtype:tmp_dbtype});
				for(i=0;i<objResList.length;i++){
					var moveObject = objResList[i];
					var folder = {
						fid    : fid2newfid[""+moveObject.pfid],
						dbtype : tar_dbtype
					};
					rtn = bitsItemView._moveObject(folder,moveObject,modShift);
					if(!rtn){
						if(moveRes) mcTreeHandler._removeFolder(moveRes);
						break;
					}
				}
			}
		}else{
			var objResList = this.DataSource.flattenResources(curRes, 2, true);
			if(rtn){
				for(i=0;i<objResList.length;i++){
					var tmp_oid = this.DataSource.getProperty(objResList[i], "id");
					var tmp_dbtype = this.DataSource.getProperty(objResList[i], "dbtype");
					var moveObject = null;
					var moveObjects = this.Database.getObjectFormID(tmp_oid, tmp_dbtype, aTransaction);
					if(!moveObjects || moveObjects.length==0) break;
					for(j=0;j<moveObjects.length;j++){
						if(fid2newfid[""+moveObjects[j].pfid] == undefined) continue;
						moveObject = moveObjects[j];
					}
					if(!moveObject) continue;
					delete moveObject.dbtype;
					delete moveObject.fid_style;
					delete moveObject.fid_title;
					delete moveObject.folder_order;
					if(this.Database._idExists(tar_dbtype,moveObject.oid,aTransaction)){
						moveObject.oid = ""+moveID;
						moveID = parseInt(moveID)+1;
					}
					if(fid2newfid[""+moveObject.pfid]) moveObject.pfid = fid2newfid[""+moveObject.pfid];
					rtn = this.Database.addObject(moveObject, tar_dbtype, aTransaction);
					if(rtn){
						var objAddParAbout = null;
						if(!objAddParAbout){
							var fid = moveFolder.pfid;
							var f_pfid = undefined;
							var rtnFolder = this.Database.getFolder({fid:moveObject.pfid},tar_dbtype);
							if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
							rtnFolder = undefined;
							objAddParAbout = this.DataSource.getID2About(moveObject.pfid,f_pfid,tar_dbtype);
						}
						var newItem = this.Common.newItem();
						newItem.id = moveObject.oid;
						newItem.about = this.DataSource.getAbout(moveObject.oid,moveObject.pfid,tar_dbtype);
						newItem.pfid = moveObject.pfid;
						newItem.type = "item";
						newItem.source = this.DataSource.getProperty(objResList[i], "source");
						newItem.title = moveObject.oid_title;
						newItem.editmode = moveObject.oid_mode;
						newItem.uri = moveObject.doc_url;
						newItem.dbtype = tar_dbtype;
						newItem.icon = this.DataSource.getProperty(objResList[i], "icon");
						var tarRelIdx = -1;
						try{
							var cont = this.DataSource.getContainer(objAddParAbout, false);
							tarRelIdx  = cont.GetCount();
						}catch(ex){}
						var newRes = this.DataSource.addItem(newItem, objAddParAbout, tarRelIdx, tar_dbtype);
					}else{//失敗した場合
						if(moveRes) mcTreeHandler._removeFolder(moveRes);
						break;
					}
				}
			}
			if(rtn && modShift){
				rtn = true;
				if(rtn){
					//Shiftキーが押されている場合、移動元のDBからデータを削除
					for(i=objResList.length-1;i>=0;i--){
						var tmp_oid = this.DataSource.getProperty(objResList[i], "id");
						var tmp_dbtype = this.DataSource.getProperty(objResList[i], "dbtype");
						var tmp_pfid = this.DataSource.getProperty(objResList[i], "pfid");
						rtn = this.Database.removeObject({oid:tmp_oid,pfid:tmp_pfid},tmp_dbtype, aTransaction);
						if(!rtn) break;
						this.DataSource.deleteItem(objResList[i]);
						this.DataSource.setID2About(tmp_oid,tmp_pfid,undefined,tmp_dbtype);
					}
					if(rtn){
						for(i=fldResList.length-1;i>=0;i--){
							var tmp_fid = this.DataSource.getProperty(fldResList[i], "id");
							var tmp_dbtype = this.DataSource.getProperty(fldResList[i], "dbtype");
							var tmp_pfid = this.DataSource.getProperty(fldResList[i], "pfid");
							rtn = this.Database.removeFolder(tmp_fid,tmp_dbtype, aTransaction);
							if(!rtn) break;
							this.DataSource.deleteItem(fldResList[i]);
							this.DataSource.setID2About(tmp_fid,tmp_pfid,undefined,tmp_dbtype);
						}
					}
				}
			}
		}
		if(!aTransaction){
			this.Database.endTransaction(tar_dbtype);
			this.Database.endTransaction(cur_dbtype);
		}
		if(tarPar) window.top.bitsMarkingCollection.reOrder(tarPar);
		this.DataSource.flush();
		mcTreeCssService.init();
		mcController.rebuildLocal();
	},

	moveObject : function(curRes, curPar, tarPar, tarRelIdx){
		var rtn = false;
		var modShift = this.modShift;
		var tar_fid = this.DataSource.getProperty(tarPar, "id");
		var tar_dbtype = this.DataSource.getProperty(tarPar, "dbtype");
		var moveRes = null;
		var moveFids = [];
		var moveID = parseInt(this.DataSource.identify(this.Common.getTimeStamp()));
		var i;
		var cur_oid = this.DataSource.getProperty(curRes, "id");
		var cur_dbtype = this.DataSource.getProperty(curRes, "dbtype");
		var cur_pfid = this.DataSource.getProperty(curRes, "pfid");
		var moveObject = this.Database.getObjectWithProperty({oid:cur_oid,pfid:cur_pfid}, cur_dbtype);
		if(!moveObject || moveObject.length==0){
			this.DataSource.flush();
			mcTreeCssService.init();
			mcController.rebuildLocal();
			return;
		}
		var blob = this.Database.getObjectBLOB(cur_oid,cur_dbtype);
		moveObject = moveObject[0];
		delete moveObject.dbtype;
		delete moveObject.fid_style;
		if(!modShift){
			moveObject.oid = ""+moveID;
			moveID = parseInt(moveID)+1;
			moveObject.pfid = this.DataSource.getProperty(tarPar, "id");
		}
		if(cur_dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype || tar_dbtype == window.top.bitsMarkingCollection._uncategorized.dbtype){
			moveObject.pfid = tar_fid;
		}
		rtn = this.Database.addObject(moveObject, tar_dbtype);
		if(rtn){
			if(blob) this.Database.updateObjectBLOB(moveObject.oid,blob[0],tar_dbtype);
			if(!modShift){
				var newItem = this.Common.newItem();
				newItem.id = moveObject.oid;
				newItem.about = this.DataSource.getAbout(moveObject.oid,moveObject.pfid,tar_dbtype);
				newItem.pfid = moveObject.pfid;
				newItem.type = "item";
				newItem.source = this.DataSource.getProperty(curRes, "source");
				newItem.title = moveObject.oid_title;
				newItem.editmode = moveObject.oid_mode;
				newItem.uri = moveObject.doc_url;
				newItem.dbtype = tar_dbtype;
				newItem.icon = this.DataSource.getProperty(curRes, "icon");
				var tarRelIdx = -1;
				try{
					var cont = this.DataSource.getContainer(tarPar.Value, false);
					tarRelIdx  = cont.GetCount();
				}catch(ex){}
				var newRes = this.DataSource.addItem(newItem, tarPar.Value, tarRelIdx, tar_dbtype);
			}
		}
		if(rtn && modShift){
			var f_pfid = undefined;
			var rtnFolder = this.Database.getFolder({fid:cur_pfid},cur_dbtype);
			if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
			rtnFolder = undefined;
			var curPar = this.Common.RDF.GetResource(this.DataSource.getID2About(cur_pfid,f_pfid,cur_dbtype));
			var contResList = this.DataSource.flattenResources(curPar, 2, false);
			var i;
			for(var i=0;i<contResList.length;i++){
				if(contResList[i].Value == curRes.Value) continue;
				var oid = this.DataSource.getProperty(contResList[i], "id");
				if(oid != cur_oid) continue;
				curRes = contResList[i];
				break;
			}
			rtn = this.DataSource.moveItem(curRes, curPar, tarPar, tarRelIdx);
			if(rtn) rtn = this.Database.removeObject({oid:cur_oid,pfid:cur_pfid},cur_dbtype);
			if(rtn){
				this.DataSource.setProperty(curRes, "dbtype", tar_dbtype);
				this.DataSource.setProperty(curRes, "pfid", tar_fid);
				this.DataSource.setProperty(curRes, "id", moveObject.oid);
				this.DataSource.setID2About(cur_oid,cur_pfid,undefined,cur_dbtype);
				this.DataSource.setID2About(moveObject.oid,tar_fid,curRes.Value,tar_dbtype);
			}
			mcTreeDNDHandler.changeNodeStyle(curRes);
		}
		if(tarPar) window.top.bitsMarkingCollection.reOrder(tarPar);
		this.DataSource.flush();
		mcTreeCssService.init();
		mcController.rebuildLocal();
	},

	copy : function(aRow, aOrient){
		this.row = aRow;
		this.orient = aOrient;
		this.rowRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(aRow);
		(mcTreeHandler.TREE.view.selection.count == 1) ? this.copySingle() : this.copyMultiple();
	},

	copySingle : function(){
		var curIdx = mcTreeHandler.TREE.currentIndex;
		var curRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
		var curPar = mcTreeHandler.getParentResource(curIdx);
		var tarRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(this.row);
		var tarPar = ( this.orient == 0) ? tarRes : mcTreeHandler.getParentResource(this.row);
		this.copyAfterChecking(curRes, curPar, tarRes, tarPar);
		this.DataSource.flush();
		mcController.rebuildLocal();
	},

	copyMultiple : function(){
		var idxList = mcTreeHandler.getSelection(false, 2);
		if(mcTreeHandler.validateMultipleSelection(idxList) == false) return;
		var i = 0;
		var curResList = []; var curParList = [];
		var tarResList = []; var tarParList = [];
		for(i=0;i<idxList.length;i++){
			curResList.push( mcTreeHandler.TREE.builderView.getResourceAtIndex(idxList[i]));
			curParList.push( mcTreeHandler.getParentResource(idxList[i]));
			tarResList.push( mcTreeHandler.TREE.builderView.getResourceAtIndex(this.row));
			tarParList.push( ( this.orient == 0) ? tarResList[i] : mcTreeHandler.getParentResource(this.row));
		}
		if(this.orient == 1){
			for(i=idxList.length-1;i>=0;i--){
				this.copyAfterChecking(curResList[i], curParList[i], tarResList[i], tarParList[i]);
			}
		}else{
			for(i=0;i<idxList.length;i++){
				this.copyAfterChecking(curResList[i], curParList[i], tarResList[i], tarParList[i]);
			}
		}
		this.DataSource.flush();
		mcController.rebuildLocal();
	},

	copyAfterChecking : function(curRes, curPar, tarRes, tarPar){
		var curAbsIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(curRes);
		var curRelIdx = window.top.bitsObjectMng.DataSource.getRelativeIndex(curPar, curRes);
		var tarRelIdx = window.top.bitsObjectMng.DataSource.getRelativeIndex(tarPar, tarRes);
		var tar_dbtype = this.DataSource.getProperty(tarPar, "dbtype");
		var cur_dbtype = this.DataSource.getProperty(curPar, "dbtype");
		if(cur_dbtype != tar_dbtype){
			if(mcTreeHandler.TREE.view.isContainer(curAbsIdx)){
				this.moveFolder(curRes, curPar, tarPar, tarRelIdx);
			}else{
				this.moveObject(curRes, curPar, tarPar, tarRelIdx);
			}
			return;
		}
		if(mcTreeHandler.TREE.view.isContainer(curAbsIdx)) return;
		if(this.orient == 0){
			if(curAbsIdx == this.row) return;
		}else{
			if(this.orient == 1) tarRelIdx++;
			if(curPar.Value == tarPar.Value && tarRelIdx > curRelIdx) tarRelIdx--;
			if(this.orient == 1 &&
				 mcTreeHandler.TREE.view.isContainer(this.row) &&
				 mcTreeHandler.TREE.view.isContainerOpen(this.row) &&
				 mcTreeHandler.TREE.view.isContainerEmpty(this.row) == false){
				if(curAbsIdx == this.row) return;
				tarPar = tarRes;
				tarRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(this.row + 1);
				tarRelIdx = 1;
			}
			if(curPar.Value == tarPar.Value && curRelIdx == tarRelIdx) return;
		}
		if(mcTreeHandler.TREE.view.isContainer(curAbsIdx)){
			var tmpIdx = this.row;
			var tmpRes = tarRes;
			while(tmpRes.Value != mcTreeHandler.TREE.ref && tmpIdx != -1){
				tmpRes = mcTreeHandler.getParentResource(tmpIdx);
				tmpIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(tmpRes);
				if(tmpRes.Value == curRes.Value) return;
			}
		}
		var rtn = false;
		var pfid = this.DataSource.getProperty(tarPar, "id");
		var dbtype = this.DataSource.getProperty(tarPar, "dbtype");
		var oid = this.DataSource.getProperty(curRes, "id");
		rtn = this.Database.existsObject({oid:oid,pfid:pfid},dbtype);
		if(rtn){
			this.Common.alert(mcMainService.STRING.getString("ALERT_COPYOBJECT_EXISTS"));
			return;
		}
		var newDCitem = this.Common.newItem();
		newDCitem.id = oid;
		newDCitem.about = this.DataSource.getAbout(oid,pfid,this.DataSource.getProperty(curRes, "dbtype"));
		newDCitem.pfid     = pfid;
		newDCitem.type     = this.DataSource.getProperty(curRes, "type");
		newDCitem.source   = this.DataSource.getProperty(curRes, "source");
		newDCitem.title    = this.DataSource.getProperty(curRes, "title");
		newDCitem.editmode = this.DataSource.getProperty(curRes, "editmode");
		newDCitem.uri      = this.DataSource.getProperty(curRes, "uri");
		newDCitem.source   = this.DataSource.getProperty(curRes, "source");
		newDCitem.dbtype   = this.DataSource.getProperty(curRes, "dbtype");
		var pfid_order = 0;
		if(this.DataSource.isContainer(this.rowRes)){
			var tmp_fid = this.DataSource.getProperty(this.rowRes, "id");
			var rtnFolder = mcTreeDNDHandler.Database.getFolderFormID(tmp_fid,newDCitem.dbtype);
			if(rtnFolder && rtnFolder.length) pfid_order = rtnFolder[0].pfid_order;
		}else{
			var tmp_oid = this.DataSource.getProperty(this.rowRes, "id");
			var rtnObject = mcTreeDNDHandler.Database.getObject({oid:tmp_oid,pfid:pfid},newDCitem.dbtype);
			if(rtnObject && rtnObject.length) pfid_order = rtnObject[0].pfid_order;
		}
		if(this.orient>=0) pfid_order = parseFloat(parseFloat(pfid_order) + parseFloat(this.orient));
		rtn = mcTreeDNDHandler.Database.addLink({oid:oid,pfid:pfid,pfid_order:pfid_order},newDCitem.dbtype);
		if(rtn){
			var newRes = this.DataSource.addItem(newDCitem,tarPar.Value,tarRelIdx,newDCitem.dbtype);
			if(newRes){
				this.DataSource.setProperty(newRes, "id", oid); //Treeに追加後、idを変更する。
				this.DataSource.flush();
			}
			var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
			if(selectIdx>=0){
				mcTreeHandler.TREE.currentIndex = selectIdx;
				if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
				mcTreeHandler.TREE.focus();
				mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
				mcPropertyView.dispProperty(mcTreeHandler.object);
			}
		}else{
			mcTreeViewModeService.rebuild();
		}
	},

	capture : function(aXferString, aRow, aOrient){
		var aXferStringArr = aXferString.split("\n");
		var url = aXferStringArr[0];
		var url_title = aXferStringArr[1];
		if(!url_title || url == url_title) url_title = "";
		var basedir = window.top.bitsTreeListService.getBaseDir();
		var res_uri = this.Common.convertFilePathToURL(basedir.path);
		if(url.indexOf(res_uri)>=0) return;
		if(this.originalTarget && this.originalTarget.nodeName == "IMG" && this.originalTarget.hasAttribute('oid') && this.originalTarget.hasAttribute('dbtype')) return;
		var win = window.top.bitsObjectMng.Common.getFocusedWindow();
		var sel = win.getSelection();
		var isSelected = false;
		try{
			isSelected = ( sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset) ? false : true;
			if(isSelected && aXferStringArr.length != 1) isSelected = false;
			if(isSelected && win.document.contentType == "application/pdf") isSelected = false;
		}catch(ex){}
		var isEntire = (url == top.window._content.location.href);
		var res = ( aRow == -1) ? [mcTreeHandler.TREE.ref, 0] : this.getTarget(aRow, aOrient);
		var newResArr;
		if(this.modAlt && isEntire){
		}else if(isSelected){
			newResArr = window.top.bitsMarkingCollection.addSelectedText(res[0], res[1], aRow);
		}else{
			if(url.indexOf("http://")  == 0 ||
				 url.indexOf("https://") == 0 ||
				 url.indexOf("ftp://")   == 0 ||
				 url.indexOf("file://")  == 0){
				var importFlag = false;
				var splitFileName = this.Common.splitFileName(url);
				if(splitFileName[1].toLowerCase() == "xml" || splitFileName[1].toLowerCase() == "zip") importFlag = mcXmlImportService.loadFile(res[0], res[1], aRow, url);
				if(!importFlag && !mcXmlImportService.isExportFile){
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
					newResArr = window.top.bitsMarkingCollection.addURLText(res[0], res[1], aRow, aXferString, this.originalTarget);
				}
			}else{
				isSelected = false;
				try{ isSelected = ( sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset) ? false : true; }catch(ex){}
				if(isSelected && win.document.contentType == "application/pdf") isSelected = false;
				if(isSelected){
					newResArr = window.top.bitsMarkingCollection.addSelectedText(res[0], res[1], aRow);
				}else{
					setTimeout(function(){
						var rtn = window.top.bitsMarkingCollection.addPDFText(res[0], res[1], aRow, aXferString);
						if(!rtn) window.top.bitsMarkingCollection.Common.alert(mcMainService.STRING.getString("ERROR_INVALID_URL") + "\n" + url);
					},0);
				}
			}
		}
		return {isSelected : isSelected, resArr : newResArr};
	},

	loadHTML : function(aEvent){
		var doc = window.top.bitsMarkingCollection.BROWSER.contentDocument;
		var url = mcTreeDNDHandler.Common.getURLStringFromDocument(doc);
		var title = doc.title;
		var icon = "";
		var links = doc.getElementsByTagName("link");
		if(links && links.length>0){
			for(var i=0;i<links.length;i++){
				if(links[i].rel.toLowerCase() == "shortcut icon" || links[i].rel.toLowerCase() == "icon"){
					icon = links[i].href;
					break;
				}
			}
		}
		if(icon == "" && (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)){
			var root = mcTreeDNDHandler.Common.getRootHref(url);
			root += "/favicon.ico";
			var xmlhttp = new XMLHttpRequest();
			if(xmlhttp){
				xmlhttp.open("GET",root,false);
				xmlhttp.send(null);
				if(xmlhttp.status == 200) icon = root;
			}
		}
		if(title) mcTreeDNDHandler.DataSource.setProperty(mcTreeDNDHandler._oRes,"title",title);
		if(icon) mcTreeDNDHandler.DataSource.setProperty(mcTreeDNDHandler._oRes,"icon",icon);
		if(title || icon){
			mcTreeDNDHandler.DataSource.flush();
			mcTreeHandler.TREE.builder.rebuild();
			var dbtype = mcTreeDNDHandler.DataSource.getProperty(mcTreeDNDHandler._oRes,"dbtype");
			var oid_property = "";
			var obj = mcTreeDNDHandler.Database.getObjectFormID(mcTreeDNDHandler._oID,dbtype);
			if(obj && obj.length>0) oid_property = obj[0].oid_property;
			if(icon) oid_property += "<ICON>"+icon+"</ICON>";
			mcTreeDNDHandler.Database.updateObject({oid:mcTreeDNDHandler._oID,oid_title:title,oid_property:oid_property},dbtype);
		}
		window.top.bitsMarkingCollection.BROWSER.removeEventListener("load", mcTreeDNDHandler.loadHTML, true);
		window.top.bitsMarkingCollection.BROWSER.loadURI("about:blank");
		if(title || icon) mcTreeViewModeService.rebuild();
	},

	getIconFromURL : function(aUrl,aRes){
		var uri = aUrl;
		var xmlhttp = null;
		xmlhttp = new XMLHttpRequest();
		if(xmlhttp){
			xmlhttp.onreadystatechange = function (){
				if(xmlhttp.readyState == 4){
					if(xmlhttp.status == 200){
						var contentType = xmlhttp.getResponseHeader("Content-Type");
						var id = mcTreeDNDHandler.DataSource.getProperty(aRes,"id");
						var dbtype = mcTreeDNDHandler.DataSource.getProperty(aRes,"id");
						var type = "url";
						var ext = "txt";
						if(contentType.match(/^image\/(\S+)/)){
							type = "image";
							ext = RegExp.$1;
						}else if(contentType.match(/^text\/(\S+)/)){
							ext = RegExp.$1;
							ext = ext.replace(/[^A-Za-z0-9]+$/mg,"");
						}
						mcTreeDNDHandler.Database.updateObject({oid:id,oid_txt:ext},dbtype);
						var bytes = [];
						var filestream = xmlhttp.responseText;
						for(var i=0; i<filestream.length;i++){
							bytes[i] = filestream.charCodeAt(i) & 0xff;
						}
						var file = window.top.bitsMarkingCollection.getExtensionDir().clone();
						file.append("data");
						if(!file.exists()) file.create(file.DIRECTORY_TYPE, 0700);
						file.append(id+"."+ext);
						if(type == "image"){
							if(file.exists()) file.remove(false);
							file.create(file.NORMAL_FILE_TYPE, 0666);
							var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
							ostream.init(file, 2, 0x200, false);
							ostream.write(String.fromCharCode.apply(String, bytes), bytes.length);
							ostream.close();
							mcTreeDNDHandler.DataSource.setProperty(aRes,"icon",mcTreeDNDHandler.Common.convertFilePathToURL(file.path));
							mcTreeDNDHandler.DataSource.flush();
							mcTreeHandler.TREE.builder.rebuild();
							mcTreeDNDHandler.Database.updateObjectBLOB(id,bytes,dbtype);
						}
					}else{
						_dump("mcTreeDNDHandler.getIconFromURL():status=["+xmlhttp.status+"]");
					}
				}
			};
			xmlhttp.open("GET", uri , true);
			xmlhttp.overrideMimeType('text/plain; charset=x-user-defined');
			xmlhttp.send(null);
		}
	},

	parseHTML : function(text){
		try{
			var createHTMLDocument = function(){
					var xsl = (new DOMParser()).parseFromString(
							['<?xml version="1.0"?>',
							 '<stylesheet version="1.0" xmlns="http://www.w3.org/1999/XSL/Transform">',
							 '<output method="html"/>',
							 '</stylesheet>'].join("\n"), "text/xml");
					var xsltp = new XSLTProcessor();
					xsltp.importStylesheet(xsl);
					var doc = xsltp.transformToDocument(document.implementation.createDocument("", "", null));
					return doc;
			};
			var doc = createHTMLDocument();
			var range = doc.createRange();
			doc.appendChild(doc.createElement("html"));
			range.selectNodeContents(doc.documentElement);
			doc.documentElement.appendChild(range.createContextualFragment(text));
			return doc;
		}catch(ex){
			_dump("mcTreeDNDHandler.parseHTML():"+ex);
			return null;
		}
	},

	changeNodeStyle : function(pRes){
		var id = this.DataSource.getProperty(pRes, "id");
		var pfid = this.DataSource.getProperty(pRes, "pfid");
		var dbtype = this.DataSource.getProperty(pRes, "dbtype");
		var source  = this.DataSource.getProperty(pRes, "source");
		if(!source) source = bitsMarker.id_key+dbtype+id;
		var parentRes = this.DataSource.findParentResource(pRes);
		var style = this.DataSource.getProperty(parentRes, "style");
		this.Common.changeNodeStyleFromID(source,style,pfid,id,dbtype);
		this.DataSource.setProperty(pRes, "source", bitsMarker.id_key+dbtype+id);
	},

	getTarget : function(aRow, aOrient){
		var tarRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(aRow);
		var tarPar = ( aOrient == 0) ? tarRes : mcTreeHandler.getParentResource(aRow);
		var tarRelIdx = window.top.bitsObjectMng.DataSource.getRelativeIndex(tarPar, tarRes);
		if(aOrient == 1) tarRelIdx++;
		if(aOrient == 1 &&
			 mcTreeHandler.TREE.view.isContainer(aRow) &&
			 mcTreeHandler.TREE.view.isContainerOpen(aRow) &&
			 mcTreeHandler.TREE.view.isContainerEmpty(aRow) == false){
			tarPar = tarRes;
			tarRelIdx = 1;
		}
		return [tarPar.Value, tarRelIdx];
	},

};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var mcTreeCssService = {

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser(){ return window.top.bitsObjectMng.getBrowser();},

	init : function(){
		try{
			if(document.styleSheets.length <= 1) return;
			mcTreeHandler.TREE.treeBoxObject.clearStyleAndImageCaches();
			var styleSheet = document.styleSheets[1];
			for(var i=styleSheet.cssRules.length-1;i>=0;i--){
				styleSheet.deleteRule(i);
			}
			var useid = {};
			var i;
			var listRes = this.DataSource.flattenResources(this.Common.RDF.GetResource(this.DataSource.ABOUT_ROOT),1,true);
			for(i=0;i<listRes.length;i++){
				if(listRes[i].Value == this.DataSource.ABOUT_ROOT) continue;
				var id = this.DataSource.getProperty(listRes[i],"id");
				var dbtype = this.DataSource.getProperty(listRes[i],"dbtype");
				var style = this.DataSource.getProperty(listRes[i],"style");
				var style_id = 'css_'+dbtype+'_'+id;
				this.DataSource.setProperty(listRes[i],"cssrule",style_id);
				if(useid[style_id]) continue;
				useid[style_id] = style;
				styleSheet.insertRule("treechildren::-moz-tree-cell("+style_id+"){ "+style+" }",styleSheet.cssRules.length);
				styleSheet.insertRule("treechildren::-moz-tree-cell-text("+style_id+"){ "+style+" }",styleSheet.cssRules.length);
			}
			listRes = undefined;
			window.top.bitsContextMenu.rebuildCSS();
		}catch(ex){
			_dump("mcTreeCssService.init():"+ex);
		}
	},
};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var mcTreeMultiDocumentService = {
	get BUTTON(){ return document.getElementById("mcToolbarMultiDocumentButton"); },

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	init : function(){
		var multidocument = nsPreferences.getBoolPref("wiredmarker.multidocument", false);
		if(this.BUTTON) this.BUTTON.setAttribute("checked",multidocument);
	},

	onClick : function(aEvent){
		var multidocument = this.BUTTON.getAttribute("checked");
		if(!multidocument || multidocument == "false"){
			multidocument = true;
		}else{
			multidocument = false;
		}
		this.BUTTON.setAttribute("checked",multidocument);
		nsPreferences.setBoolPref("wiredmarker.multidocument",multidocument);
		mcPropertyView.dispProperty(mcTreeHandler.object);
		aEvent.stopPropagation();
	},
};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var mcTreeViewModeService = {
	_select : false,
	_openlist : [],
	dbupdateTimer : null,

	get BUTTON(){ return document.getElementById("mcToolbarViewModeButton"); },
	get SINGLE(){ return document.getElementById("mcToolbarViewModeItemSingle"); },
	get ALL()    { return document.getElementById("mcToolbarViewModeItemAll"); },
	get EACH()   { return document.getElementById("mcToolbarViewModeItemEach"); },
	get TITLE()  { return window.top.document.getElementById("sidebar-title"); },
	get PROGRESS(){ return document.getElementById("mcToolbarProgressmeter"); },

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get viewmode(){
		var viewmode = "all";
		if(mcTreeViewModeService.EACH && mcTreeViewModeService.EACH.getAttribute("checked")){
			viewmode = "each";
		}else if(mcTreeViewModeService.SINGLE && mcTreeViewModeService.SINGLE.getAttribute("checked")){
			viewmode = "single";
		}else if(!mcTreeViewModeService.ALL){
			viewmode = nsPreferences.copyUnicharPref("wiredmarker.viewmode","all");
		}
		return viewmode;
	},

	init : function(){
		var viewmode = nsPreferences.copyUnicharPref("wiredmarker.viewmode","all");
		switch(viewmode){
			case "each" :
				this.EACH.setAttribute("checked",true);
				break;
			case "single" :
				this.SINGLE.setAttribute("checked",true);
				break;
			default :
				this.ALL.setAttribute("checked",true);
				break;
		}
		this.gBrowser.addEventListener("pageshow", this.pageshow, false);
		this.gBrowser.addEventListener("select",   this.select,   false);
		this.gBrowser.addEventListener("click",    this.click,    false);
		if(this.dbupdateTimer) clearTimeout(this.dbupdateTimer);
	},

	done : function(){
		this.gBrowser.removeEventListener("pageshow", this.pageshow, false);
		this.gBrowser.removeEventListener("select",   this.select,   false);
		this.gBrowser.removeEventListener("click",    this.click,    false);
		var viewmode = this.viewmode;
		if(viewmode == "each") viewmode = "all";
		nsPreferences.setUnicharPref("wiredmarker.viewmode", viewmode);
		if(this.dbupdateTimer) clearTimeout(this.dbupdateTimer);
	},

	pageshow : function(aEvent){
		try{
			if(mcTreeViewModeService.gBrowser.contentDocument == aEvent.target){
				var pageshow_url = mcTreeViewModeService.Common.getURLStringFromDocument(aEvent.target);
				if(mcTreeViewModeService._openlist[pageshow_url]==undefined && mcTreeViewModeService.viewmode == "single"){
					mcTreeViewModeService.rebuild();
				}
			}
		}catch(e){}
	},

	select : function(aEvent){
		try{
			if(!mcTreeViewModeService) return;
			if(!mcTreeViewModeService._select){
				mcTreeViewModeService._select = true;
				return;
			}
			var url = mcTreeViewModeService.Common.getURLStringFromDocument(mcTreeViewModeService.gBrowser.contentDocument);
			if(url.indexOf("chrome:") < 0 && url.indexOf("about:") < 0 && mcTreeViewModeService._openlist[url]==undefined){
				if(mcTreeViewModeService.viewmode == "single") mcTreeViewModeService.rebuild();
			}
			mcTreeViewModeService._select = false;
		}catch(ex){}
	},

	dbupdate : function(){
		if(mcTreeViewModeService.dbupdateTimer) clearTimeout(mcTreeViewModeService.dbupdateTimer);
		var rtnUpdate = false;
		if(!rtnUpdate) rtnUpdate = mcTreeViewModeService.Database._updateCheck(mcTreeViewModeService.Database._defaultMode);
		if(rtnUpdate) mcTreeViewModeService.rebuild();
		mcTreeViewModeService.dbupdateTimer = setTimeout(mcTreeViewModeService.dbupdate,1000)
	},

	click : function(aEvent){
		var parent = aEvent.rangeParent;
		var offset = aEvent.rangeOffset;
		try{ if(!bitsMarker) return; }catch(ex){ return; }
		var match_exp = new RegExp("^"+bitsMarker.id_key+"\\D+(\\d+)$","m");
		var click_oid = "";
		while(parent){
			if(parent.id && parent.id.match(match_exp)){
				var dbtype = parent.getAttribute("dbtype");
				match_exp = new RegExp("^"+bitsMarker.id_key+dbtype+"(\\d+)$","m");
				if(match_exp.test(parent.id)){
					click_oid = RegExp.$1;
					break;
				}
			}
			parent = parent.parentNode;
		}
		if(!parent || click_oid == "") return;
		mcTreeViewModeService.selectTreeObject(click_oid,parent.getAttribute("dbtype"),parent.getAttribute("pfid"));
	},

	selectTreeObject : function(aOID,aDBTYPE,aPFID){
		var click_oid = aOID;
		var click_dbtype = aDBTYPE;
		var click_pfid = aPFID;
		if(mcItemView.isChecked){
			var f_pfid = undefined;
			var rtnFolder = this.Database.getFolder({fid:click_pfid},click_dbtype);
			if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
			rtnFolder = undefined;
			var About = this.DataSource.getID2About(click_pfid,f_pfid,click_dbtype);
			try{
				var searchRes = this.Common.RDF.GetResource(About);
				if(searchRes){
					var resArr = [];
					var parentRes = searchRes;
					do{
						parentRes = this.DataSource.findParentResource(parentRes);
						if(parentRes) resArr.push(parentRes);
					}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
					for(var i=resArr.length-1;i>=0;i--){
						var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
						if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
					}
					var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(searchRes);
					if(selectIdx>=0){
						mcTreeHandler.TREE.currentIndex = selectIdx;
						if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
						mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
						if(bitsTreeDate && bitsTreeDate.isChecked){
							bitsTreeDate.onSelect({
								oid    : click_oid,
								dbtype : click_dbtype
							});
						}else{
							mcItemView.onTreeClick();
						}
						setTimeout(function(){ mcItemView.setSelection(click_oid,click_dbtype); },0);
					}
				}
			}catch(e){}
		}else{
			var searchIdx = -1;
			var searchRes = null;
			var searchRes1 = null;
			var listRes2 = this.DataSource.flattenResources(this.Common.RDF.GetResource(this.DataSource.ABOUT_ROOT),2,true);
			for(var j=0;j<listRes2.length;j++){
				var id = this.DataSource.getProperty(listRes2[j],"id");
				if(id == click_oid){
					if(!searchRes1) searchRes1 = listRes2[j];
					searchIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(listRes2[j]);
					if((mcTreeHandler.TREE.currentIndex > -1 && mcTreeHandler.TREE.currentIndex < searchIdx) || searchIdx < 0){
						searchRes = listRes2[j];
						break;
					}
				}
			}
			if(!searchRes && searchRes1) searchRes = searchRes1;
			if(searchRes){
				var resArr = [];
				var parentRes = searchRes;
				do{
					parentRes = this.DataSource.findParentResource(parentRes);
					if(parentRes) resArr.push(parentRes);
				}while(parentRes && parentRes.Value != this.DataSource.ABOUT_ROOT);
				var i;
				for(i=resArr.length-1;i>=0;i--){
					var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
					if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
				}
				var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(searchRes);
				if(selectIdx>=0){
					mcTreeHandler.TREE.currentIndex = selectIdx;
					if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
					mcTreeHandler.TREE.focus();
					mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(selectIdx);
					mcPropertyView.dispProperty(mcTreeHandler.object);
				}
			}
		}
		var doc = this.gBrowser.contentDocument;
		var selection = doc.defaultView.getSelection();
		if(selection){
			if(selection.rangeCount){
				var range = selection.getRangeAt(0);
				if(range.startContainer != range.endContainer || range.startOffset != range.endOffset){
					doc.defaultView.focus();
				}
			}
		}
	},

	changeTitle : function(){
		var label = "";
		var viewmode = mcTreeViewModeService.viewmode;
		switch(viewmode){
			case "each" :
				label = this.EACH.getAttribute("label");
				break;
			case "single" :
				label = this.SINGLE.getAttribute("label");
				break;
			default :
				label = this.ALL.getAttribute("label");
				break;
		}
		var rootfolder = nsPreferences.copyUnicharPref("wiredmarker.rootfolder","");
		var title = "";
		var foldres;
		if(rootfolder && rootfolder != "") foldres = this.Database.getFolderFormID(rootfolder);
		if(foldres) title = foldres[0].fid_title;
		if(title == "") title = mcMainService.STRING.getString("DEFAULT_FOLDER");
		var button_title = mcMainService.STRING.getString("APP_DISP_TITLE");
		this.TITLE.setAttribute("value",button_title + " [ " + title + " ]");
		this.BUTTON.setAttribute("label",label+" ");
	},

	onClick : function(aEvent){
		var viewmode = aEvent.target.value;
		if(mcTreeViewModeService.dbupdateTimer) clearTimeout(mcTreeViewModeService.dbupdateTimer);
		if(viewmode == "each") mcTreeHandler.TREE.setAttribute("ref",this.DataSource.ABOUT_ROOT); //暫定処理
		this.rebuild();
		if(viewmode == "each") mcTreeHandler.openAllFolders();
		aEvent.stopPropagation();
	},

	rebuild : function(){
		try{
			var currentTreeIndex = mcTreeHandler.TREE.currentIndex;
			var currentTreeRes = null;
			if(currentTreeIndex>=0) currentTreeRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(currentTreeIndex);
			var firstVisibleRow = mcTreeHandler.TREE.treeBoxObject.getFirstVisibleRow();
			var lastVisibleRow = mcTreeHandler.TREE.treeBoxObject.getLastVisibleRow();
			this.changeTitle();
			var resEnum = this.DataSource.data.GetAllResources();
			while(resEnum.hasMoreElements()){
				var aRes = resEnum.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
				if(aRes.Value != this.DataSource.ABOUT_ROOT) this.DataSource.removeResource(aRes);
			}
			var dsEnum = mcTreeHandler.TREE.database.GetDataSources();
			while(dsEnum.hasMoreElements()){
				var ds = dsEnum.getNext().QueryInterface(Components.interfaces.nsIRDFDataSource);
				mcTreeHandler.TREE.database.RemoveDataSource(ds);
			}
			mcTreeHandler.TREE.treeBoxObject.clearStyleAndImageCaches();
			mcTreeHandler.TREE.builder.rebuild();
			if(mcTreeViewModeService.viewmode == "each"){
				window.top.bitsMarkingCollection.rebuildRdf(mcTreeViewModeService.rebuildCallback);
			}else{
				try{
					window.top.bitsMarkingCollection.rebuildRdf();
				}catch(ex){
					_dump("mcTreeViewModeService.rebuild(1):"+ ex);
				}
				this.DataSource.refresh();
				mcTreeCssService.init();
				mcTreeHandler.TREE.database.AddDataSource(this.DataSource.data);
				mcTreeHandler.TREE.builder.rebuild();
				mcTreeRootFolder.rebuild();
				if(currentTreeIndex<0) currentTreeIndex = 0;
				try{var selectRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(currentTreeIndex);}catch(ex2){selectRes=null;}
				if(!selectRes) currentTreeIndex = 0;
				if(firstVisibleRow<= currentTreeIndex && currentTreeIndex <= lastVisibleRow && currentTreeRes){
					var idx = mcTreeHandler.TREE.builderView.getIndexOfResource(currentTreeRes);
					if(idx>=0) mcTreeHandler.TREE.currentIndex = idx;
				}
				if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
				mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(currentTreeIndex);
				if(firstVisibleRow>=0) mcTreeHandler.TREE.treeBoxObject.scrollToRow(firstVisibleRow);
				mcPropertyView.dispProperty(mcTreeHandler.object);
				this.showShortcutKey();
				setTimeout(function(){ mcTreeRdfRebuildItem.init(); },0);
				return;
			}
		}catch(ex){
			_dump("mcTreeViewModeService.rebuild():"+ ex);
		}
	},

	showShortcutKey : function(){
		var elem = document.getElementById("mcTreeColShortcut");
		var show_shortcut = nsPreferences.getBoolPref("wiredmarker.shortcut.tree_disp", true);
		if(show_shortcut){
			if(elem) elem.removeAttribute("hidden");
			var resAllFolder = this.DataSource.flattenResources(this.Common.RDF.GetResource(this.DataSource.ABOUT_ROOT), 1, true);
			var rcnt;
			for(rcnt=0;rcnt<resAllFolder.length;rcnt++){
				var fRes = resAllFolder[rcnt];
				if(fRes.Value == this.DataSource.ABOUT_ROOT) continue;
				var fid = this.DataSource.getProperty(fRes, "id");
				var dbtype = this.DataSource.getProperty(fRes, "dbtype");
				var type = this.DataSource.getProperty(fRes, "type");
				if(!fid || !dbtype || type=="localfolder") continue;
				var acceltext = window.top.bitsShortcutService.getAcceltext(fid,dbtype);
				if(!acceltext) acceltext = "";
				this.DataSource.setProperty(fRes, "shortcut", acceltext);
			}
			this.DataSource.flush();
		}else{
			if(elem) elem.setAttribute("hidden","true");
		}
	},

	rebuildCallback : function(aStatus){
		switch(aStatus.status){
			case 0:
				mcTreeViewModeService.PROGRESS.setAttribute("value","0%");
				mcTreeViewModeService.PROGRESS.removeAttribute("hidden");
				break;
			case 1:
			case 2:
			case 3:
				mcTreeViewModeService.PROGRESS.removeAttribute("hidden");
				mcTreeViewModeService.PROGRESS.setAttribute("value",aStatus.value+"%");
				break;
			case 4:
				var dsEnum = mcTreeHandler.TREE.database.GetDataSources();
				while(dsEnum.hasMoreElements()){
					var ds = dsEnum.getNext().QueryInterface(Components.interfaces.nsIRDFDataSource);
					mcTreeHandler.TREE.database.RemoveDataSource(ds);
				}
				mcTreeViewModeService.DataSource.refresh();
				mcTreeHandler.TREE.database.AddDataSource(mcTreeViewModeService.DataSource.data);
				mcTreeCssService.init();
				mcTreeHandler.TREE.builder.rebuild();
				mcTreeRootFolder.rebuild();
				mcPropertyView.dispProperty(mcTreeHandler.object);
				mcTreeHandler.openAllFolders();
				mcTreeViewModeService.PROGRESS.setAttribute("hidden","true");
				break;
			default:
				break;
		}
	},
};

/////////////////////////////////////////////////////////////////////
var mcTreeImageTooltip = {
	get tooltipRow(){ return window.top.bitsImageTooltip.tooltipRow;   },

	init : function(){
		window.top.bitsImageTooltip.init();
	},

	done : function(){
		window.top.bitsImageTooltip.done();
	},

	onMousedown : function(aEvent){
		window.top.bitsImageTooltip.onMousedown(aEvent);
	},

	onMouseout : function(aEvent){
		window.top.bitsImageTooltip.onMouseout(aEvent);
	},

	hidePopup : function(){
		window.top.bitsImageTooltip.hidePopup();
	},

	onMousemove : function(aEvent,aParam){
		window.top.bitsImageTooltip.onMousemove(aEvent,aParam);
	},
};

/////////////////////////////////////////////////////////////////////
var mcTreeRdfRebuildItem = {
	_init      : false,
	timerid    : null,
	rdfdoc     : null,
	nsResolver : null,
	xmlNode    : null,

	progressWindow : null,

	folderFilterHash : {},

	resOpenFolder : [],
	resLoadFolder : [],
	resAllFolder  : [],
	itemObjects   : [],
	viewmode      : "",

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get uriRDF(){ return "http://www.w3.org/1999/02/22-rdf-syntax-ns#"; },
	get uriNS1(){ return "http://www.bits.cc/Wired-Marker/wiredmarker-rdf#"; },

	init : function(){
		try{
			this.unsetTreeEvent();
			if(mcItemView.isChecked){
				this.setTreeEvent();
				if(bitsTreeDate.isChecked){
					bitsTreeDate.onSelectTab();
				}else{
					mcItemView.onTreeClick();
				}
				return;;
			}
			this._init = true;
			if(this.timerid) clearTimeout(this.timerid);
			this.timerid = null;
			this.viewmode = mcTreeViewModeService.viewmode;
			this.doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			if(this.progressWindow && !this.progressWindow.closed) this.progressWindow.close();
			this.progressWindow = null;
			if(!this.progressWindow){
				var x = screen.width;
				var y = screen.height;
			}
			var i;
			this.rdfdoc = null;
			this.nsResolver = null;
			this.xmlNode = null;
			var aRdfFile = this.DataSource.file.clone();
			var rdf = this.Common.convertToUnicode(this.Common.readFile(aRdfFile),"UTF-8");
			if(rdf && rdf != ""){
				var parser = new DOMParser();
				this.rdfdoc = parser.parseFromString(rdf, "text/xml");
				parser = undefined;
				if(this.rdfdoc) this.nsResolver = this.rdfdoc.createNSResolver( this.rdfdoc.ownerDocument == null ? this.rdfdoc.documentElement : this.rdfdoc.ownerDocument.documentElement);
				rdf = undefined;
			}
			this.resOpenFolder.length = 0;
			this.resLoadFolder = [];
			this.resAllFolder.length = 0;
			this.itemObjects.length = 0;
			if(mcTreeHandler.TREE.view){
				for(i=0;i<mcTreeHandler.TREE.view.rowCount;i++){
					if(mcTreeHandler.TREE.view.isContainer(i) && mcTreeHandler.TREE.view.isContainerOpen(i)){
						var res = mcTreeHandler.TREE.builderView.getResourceAtIndex(i);
						this.resOpenFolder.push(res);
					}
				}
			}
			this.resAllFolder = this.DataSource.flattenResources(this.Common.RDF.GetResource(this.DataSource.ABOUT_ROOT), 1, true);
			this.timerid = setTimeout(function(){ mcTreeRdfRebuildItem.exec(); }, 0);
			this.folderFilterHash = {};
			var tmpFolderFilter = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
			var tmpFolderFilterArr = tmpFolderFilter.split("\t");
			var i;
			for(i=0;i<tmpFolderFilterArr.length;i++){
				if(!tmpFolderFilterArr[i].match(/^(\d+):(\d+):(.+)$/)) continue;
				var filter_fid = RegExp.$1;
				var filter_casesensitive = RegExp.$2;
				var filter_keyword = RegExp.$3;
				this.folderFilterHash[filter_fid] = new RegExp(filter_keyword,(filter_casesensitive==1)?"mg":"img");
			}
			tmpFolderFilterArr = undefined;
			tmpFolderFilter = undefined;
			if(this.progressWindow && !this.progressWindow.closed){
				if(this.resOpenFolder.length>0 || this.resAllFolder.length>0){
					if(this.progressWindow.setStatus) this.progressWindow.setStatus(mcMainService.STRING.getString("MSG_LOADING_SCRAP") + "... [ "+ (this.resOpenFolder.length + this.resAllFolder.length) + " ]");
				}else{
					if(this.progressWindow && !this.progressWindow.closed) this.progressWindow.close();
					this.progressWindow = null;
				}
			}
		}catch(e){
			_dump("mcTreeRdfRebuildItem.init():"+e);
		}
	},

	exec : function(){
		try{
			var fRes = null;
			if(this.resOpenFolder.length>0){
				fRes = this.resOpenFolder.shift();
			}else if(this.resAllFolder.length>0){
				fRes = this.resAllFolder.shift();
			}
			if(this.progressWindow && !this.progressWindow.closed){
				if(fRes){
					var title = this.DataSource.getProperty(fRes, "title");
					if(this.progressWindow.setStatus) this.progressWindow.setStatus(mcMainService.STRING.getString("MSG_LOADING_SCRAP") + "... [ "+ (this.resOpenFolder.length + this.resAllFolder.length + 1) + " ]");
				}
			}
			if(!fRes){
				this.done();
				return;
			}
			if(this.itemObjects) this.itemObjects.length = 0;
			this.itemObjects = [];
			if(this.resLoadFolder[fRes.Value] == undefined){
				var j;
				var fid = this.DataSource.getProperty(fRes, "id");
				var dbtype = this.DataSource.getProperty(fRes, "dbtype");
				if(fid && dbtype){
					if(this.viewmode == "all"){
						this.itemObjects = this.Database.getObjectFormPID(fid, dbtype);
					}else{
						this.itemObjects = this.Database.getObject({pfid:fid,doc_url:this.doc_url}, dbtype);
					}
				}
				if(this.itemObjects && this.itemObjects.length>0 && this.folderFilterHash[fid]){
					var newObj = [];
					for(j=0;j<this.itemObjects.length;j++){
						var obj = this.itemObjects[j];
						if(this.folderFilterHash[obj.pfid] && !obj.oid_title.match(this.folderFilterHash[obj.pfid])) continue;
						newObj.push(obj);
					}
					this.itemObjects = newObj;
				}
				if(this.itemObjects && this.itemObjects.length>0){
					this.xmlNode = null;
					if(this.rdfdoc && this.nsResolver){
						var xPathXML = this.rdfdoc.evaluate('//RDF:Seq[@RDF:about="'+ fRes.Value + '"]', this.rdfdoc, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE , null);
						if(xPathXML && xPathXML.singleNodeValue) this.xmlNode = xPathXML.singleNodeValue;
					}
					if(this.xmlNode){
						this.timerid = setTimeout(function(){ mcTreeRdfRebuildItem.execItem(fRes); }, 0);
						return;
					}
				}else{
					if(!this.itemObjects) this.itemObjects = [];
				}
				this.resLoadFolder[fRes.Value] = "";
			}
			this.timerid = setTimeout(function(){ mcTreeRdfRebuildItem.exec(); }, 0);
		}catch(e){
			_dump("mcTreeRdfRebuildItem.exec():"+e);
		}
	},

	execItem : function(fRes){
		try{
			if(!this.itemObjects || this.itemObjects.length==0){
				if(this.DataSource.file.exists()){
					var s = new XMLSerializer();
					var rdfstr = s.serializeToString(this.rdfdoc);
					this.Common.writeFile(this.DataSource.file.clone(), rdfstr+"\n","UTF-8");
					this.DataSource.refresh();
				}else{
					this.done();
					return;
				}
				this.resLoadFolder[fRes.Value] = "";
				this.timerid = setTimeout(function(){ mcTreeRdfRebuildItem.exec(); }, 0);
				return;
			}
			var EXECNUM = 10;
			var i;
			for(i=0;i<EXECNUM && this.itemObjects.length>0;i++){
				var item = this.Database.makeObjectToItem(this.itemObjects.shift());
				var itemKey;
				var xmlItem = this.rdfdoc.createElementNS(this.uriRDF, "RDF:Description");
				for(itemKey in item){
					if(itemKey == "about"){
						xmlItem.setAttributeNS(this.uriRDF, "RDF:"+itemKey, item[itemKey]);
					}else if(itemKey == "list"){
						continue;
					}else{
						xmlItem.setAttributeNS(this.uriNS1, "NS1:"+itemKey, item[itemKey]);
					}
				}
				this.xmlNode.appendChild(this.rdfdoc.createTextNode("  "));
				var xmlList = this.rdfdoc.createElementNS(this.uriRDF, "RDF:li");
				xmlList.setAttributeNS(this.uriRDF, "RDF:resource", item.about);
				this.xmlNode.appendChild(xmlList);
				this.xmlNode.appendChild(this.rdfdoc.createTextNode("\n  "));
				this.rdfdoc.documentElement.appendChild(this.rdfdoc.createTextNode("  "));
				this.rdfdoc.documentElement.appendChild(xmlItem);
				this.rdfdoc.documentElement.appendChild(this.rdfdoc.createTextNode("\n"));
			}
			this.timerid = setTimeout(function(){ mcTreeRdfRebuildItem.execItem(fRes); }, 0);
		}catch(e){
			_dump("mcTreeRdfRebuildItem.execItem():"+e);
		}
	},

	done : function(){
		try{
			if(this.DataSource.file.exists()){
				var box = mcTreeHandler.TREE.boxObject;
				box.QueryInterface(Components.interfaces.nsITreeBoxObject);
				var fvRow = box.getFirstVisibleRow();
				try{
					var fvRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(fvRow);
					var resEnum = this.DataSource.data.GetAllResources();
					while(resEnum.hasMoreElements()){
						var aRes = resEnum.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
						if(aRes.Value != this.DataSource.ABOUT_ROOT) this.DataSource.removeResource(aRes);
					}
					var dsEnum = mcTreeHandler.TREE.database.GetDataSources();
					while(dsEnum.hasMoreElements()){
						var ds = dsEnum.getNext().QueryInterface(Components.interfaces.nsIRDFDataSource);
						mcTreeHandler.TREE.database.RemoveDataSource(ds);
					}
					mcTreeHandler.TREE.treeBoxObject.clearStyleAndImageCaches();
					mcTreeHandler.TREE.builder.rebuild();
					var s = new XMLSerializer();
					var rdfstr = s.serializeToString(this.rdfdoc);
					this.Common.writeFile(this.DataSource.file.clone(), rdfstr+"\n","UTF-8");
					this.DataSource.refresh();
					mcTreeCssService.init();
					mcTreeHandler.TREE.database.AddDataSource(this.DataSource.data);
					mcTreeHandler.TREE.builder.rebuild();
					mcTreeRootFolder.rebuild();
					fvRow = mcTreeHandler.TREE.builderView.getIndexOfResource(this.Common.RDF.GetResource(fvRes.Value));
					box.scrollToRow(fvRow);
				}catch(e){}
				this.setTreeEvent();
			}
		}catch(ex){
			_dump("mcTreeRdfRebuildItem.done():"+ex);
		}
		if(this.progressWindow && !this.progressWindow.closed) this.progressWindow.close();
		this.progressWindow = null;
		if(this.timerid) clearTimeout(this.timerid);
		this.timerid = null;
		this.rdfdoc = null;
		this.nsResolver = null;
		this.xmlNode = null;
		this.resOpenFolder.length = 0;
		this.resLoadFolder = [];
		this.resAllFolder.length = 0;
		this.itemObjects.length = 0;
	},

	setTreeEvent : function(){
		mcTreeHandler.TREE.onmousedown=function(e){ mcTreeHandler.onMousedown(e); }
		mcTreeHandler.TREE.onmouseup=function(e){ mcTreeHandler.onMouseup(e); }
		mcTreeHandler.TREE.onmousemove=function(e){ mcTreeHandler.onMousemove(e); }
		mcTreeHandler.TREE.onmouseout=function(e){ mcTreeHandler.onMouseout(e); }
		mcTreeHandler.TREE.ondblclick=function(e){ mcTreeHandler.onDblClick(e); }
		mcTreeHandler.TREE.onkeydown=function(e){ mcTreeHandler.onKeyDown(e); }
		mcTreeHandler.TREE.onkeyup=function(e){ mcTreeHandler.onKeyUp(e); }
		mcTreeHandler.TREE.onkeypress=function(e){ mcTreeHandler.onKeyPress(e); }
		mcTreeHandler.TREE.onclick=function(e){ mcTreeRdfRebuildItem.onclick(e); }
		var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		var app_version = parseFloat(info.version);
		if(app_version<3.1){
			mcTreeHandler.TREE.addEventListener("draggesture",mcTreeRdfRebuildItem.onOldDraggesture,false);
			mcTreeHandler.TREE.addEventListener("dragover",mcTreeRdfRebuildItem.onOldDragover,false);
			mcTreeHandler.TREE.addEventListener("dragdrop",mcTreeRdfRebuildItem.onOldDragdrop,false);
			mcTreeHandler.TREE.addEventListener("dragexit",mcTreeRdfRebuildItem.onOldDragexit,false);
		}else{
			mcTreeHandler.TREE.addEventListener("dragstart", mcTreeRdfRebuildItem.onDragEvents, false);
			mcTreeHandler.TREE.addEventListener("drag", mcTreeRdfRebuildItem.onDragEvents, false);
			mcTreeHandler.TREE.addEventListener("dragend", mcTreeRdfRebuildItem.onDragEvents, false);
			mcTreeHandler.TREE.addEventListener("dragenter", mcTreeRdfRebuildItem.onDropEvents, false);
			mcTreeHandler.TREE.addEventListener("dragover", mcTreeRdfRebuildItem.onDropEvents, false);
			mcTreeHandler.TREE.addEventListener("dragleave", mcTreeRdfRebuildItem.onDropEvents, false);
			mcTreeHandler.TREE.addEventListener("drop", mcTreeRdfRebuildItem.onDropEvents, false);
		}
	},

	unsetTreeEvent : function(){
		mcTreeHandler.TREE.onmousedown=null;
		mcTreeHandler.TREE.onmouseup=null;
		mcTreeHandler.TREE.onmousemove=null;
		mcTreeHandler.TREE.onmouseout=null;
		mcTreeHandler.TREE.ondblclick=null;
		mcTreeHandler.TREE.onkeydown=null;
		mcTreeHandler.TREE.onkeyup=null;
		mcTreeHandler.TREE.onkeypress=null;
		mcTreeHandler.TREE.onclick=null;
		var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		var app_version = parseFloat(info.version);
		if(app_version<3.1){
			mcTreeHandler.TREE.removeEventListener("draggesture",mcTreeRdfRebuildItem.onOldDraggesture,false);
			mcTreeHandler.TREE.removeEventListener("dragover",mcTreeRdfRebuildItem.onOldDragover,false);
			mcTreeHandler.TREE.removeEventListener("dragdrop",mcTreeRdfRebuildItem.onOldDragdrop,false);
			mcTreeHandler.TREE.removeEventListener("dragexit",mcTreeRdfRebuildItem.onOldDragexit,false);
		}else{
			mcTreeHandler.TREE.removeEventListener("dragstart", mcTreeRdfRebuildItem.onDragEvents, false);
			mcTreeHandler.TREE.removeEventListener("drag", mcTreeRdfRebuildItem.onDragEvents, false);
			mcTreeHandler.TREE.removeEventListener("dragend", mcTreeRdfRebuildItem.onDragEvents, false);
			mcTreeHandler.TREE.removeEventListener("dragenter", mcTreeRdfRebuildItem.onDropEvents, false);
			mcTreeHandler.TREE.removeEventListener("dragover", mcTreeRdfRebuildItem.onDropEvents, false);
			mcTreeHandler.TREE.removeEventListener("dragleave", mcTreeRdfRebuildItem.onDropEvents, false);
			mcTreeHandler.TREE.removeEventListener("drop", mcTreeRdfRebuildItem.onDropEvents, false);
		}
	},
	
	onclick : function(e){
		mcTreeHandler.onClick(e, 2);
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop Old Callback functions
/////////////////////////////////////////////////////////////////////
	onOldDraggesture : function(e){
		mcTreeDNDHandler.getModifiers(e);
		nsDragAndDrop.startDrag(e,mcTreeDNDHandler.dragDropObserver);
		e.stopPropagation();
	},
	onOldDragover : function(e){
		nsDragAndDrop.dragOver(e,mcTreeDNDHandler.dragDropObserver);
		e.stopPropagation();
	},
	onOldDragdrop : function(e){
		mcTreeDNDHandler.setDataTransfer(e);
		nsDragAndDrop.drop(e,mcTreeDNDHandler.dragDropObserver);
		e.stopPropagation();
	},
	onOldDragexit : function(e){
		nsDragAndDrop.dragExit(e,mcTreeDNDHandler.dragDropObserver);
		e.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop New Callback functions
/////////////////////////////////////////////////////////////////////
	onDragEvents: function(aEvent){
		switch(aEvent.type){
			case "dragstart":
				mcTreeRdfRebuildItem.onDragStart(aEvent);
				break;
			case "drag":
			break;
			case "dragend":
			break;
		}
	},

	onDragStart : function(aEvent){
		try{mcTreeImageTooltip.hidePopup()}catch(ex){}
		try{
			if(aEvent.originalTarget.localName != "treechildren") return;
			mcTreeDNDHandler.getModifiers(aEvent);
			var curIdx = mcTreeHandler.TREE.currentIndex;
			var res = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			var curPar = mcTreeHandler.getParentResource(curIdx);
			var p_source = window.top.bitsObjectMng.DataSource.getProperty(curPar,"source");
			var transferData = aEvent.dataTransfer;
			transferData.setData("moz/rdfitem", res.Value);
		}catch(ex){
			_dump("mcTreeRdfRebuildItem.onDragStart():"+ex);
		}
	},

	onDropEvents: function(aEvent){
		switch(aEvent.type){
			case "dragenter":
			case "dragover":
				aEvent.preventDefault();
				break;
			case "drop":
				mcTreeDNDHandler.setDataTransfer(aEvent);
				aEvent.preventDefault();
				break;
		}
	},

};

/////////////////////////////////////////////////////////////////////
var mcItemView = {
	get _bitsItemView(){ return bitsItemView; },
	get _bitsItemViewToolbar(){ return document.getElementById("bitsItemViewToolbar"); },
	get modAlt(){ return this._bitsItemView.modAlt; },
	get modShift(){ return this._bitsItemView.modShift; },
	get modCtrl(){ return this._bitsItemView.modCtrl; },
	get modMeta(){ return this._bitsItemView.modMeta; },
	get isChecked(){ return this._bitsItemView.isChecked; },
	get object(){ return this._bitsItemView.object; },
	get TREE(){ return this._bitsItemView.TREE; },
	get POPUP(){ return document.getElementById("mcPopupFolder"); },
	get CONTEXTMENU(){ return document.getElementById("mcPopupFolderItemViewMenu"); },
	get FAVICON_POPUP(){ return document.getElementById("mcPopupFolderItemViewFaviconMenupopup"); },
	get ITEM_POPUP(){ return document.getElementById("mcPopupFolderItemViewItemMenupopup"); },
	get idMENUITEM(){ return "mcPopupFolderItem_"; },
	init : function(aEvent){
		this._bitsItemView.init(aEvent);
		if(this._bitsItemView.isChecked){
			this.CONTEXTMENU.removeAttribute("hidden");
			if(this._bitsItemViewToolbar && mcTreeViewModeService.BUTTON) this._bitsItemViewToolbar.appendChild(mcTreeViewModeService.BUTTON);
			this.initMenu(aEvent);
			var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
			if(contextmenu_mode != "legacy"){
				this.POPUP.addEventListener("popupshowing", this.popupMenu, false);
				this.FAVICON_POPUP.addEventListener("command", this.commandMenuFavicon, false);
				this.ITEM_POPUP.addEventListener("command", this.commandMenuItem, false);
			}
		}else{
			this.CONTEXTMENU.setAttribute("hidden","true");
		}
	},
	initMenu : function(aEvent){
		var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
		if(contextmenu_mode == "legacy"){
			if(this._bitsItemView.VTTB) this._bitsItemView.VTTB.removeAttribute("hidden");
		}else{
			if(this._bitsItemView.VTTB) this._bitsItemView.VTTB.setAttribute("hidden","true");
			if(this._bitsItemView.VTTB && this.FAVICON_POPUP && !this.FAVICON_POPUP.hasChildNodes()){
				var menuitems = this._bitsItemView.VTTB.getElementsByTagName("menuitem");
				for(var i=0;i<menuitems.length;i++){
					var menuitem = document.createElement("menuitem");
					menuitem.setAttribute("type","radio");
					menuitem.setAttribute("label",menuitems[i].getAttribute("label"));
					menuitem.setAttribute("id",this.idMENUITEM + menuitems[i].id);
					menuitem.setAttribute("target_id",menuitems[i].id);
					this.FAVICON_POPUP.appendChild(menuitem);
				}
			}
			if(this._bitsItemView.TREE && this.ITEM_POPUP && !this.ITEM_POPUP.hasChildNodes()){
				var treecols = this._bitsItemView.TREE.getElementsByTagName("treecol");
				for(var i=0;i<treecols.length;i++){
					if(treecols[i].hasAttribute("ignoreincolumnpicker") && treecols[i].getAttribute("ignoreincolumnpicker") == "true") continue;
					var menuitem = document.createElement("menuitem");
					menuitem.setAttribute("type","checkbox");
					menuitem.setAttribute("label",treecols[i].getAttribute("label"));
					menuitem.setAttribute("id",this.idMENUITEM + treecols[i].id);
					menuitem.setAttribute("target_id",treecols[i].id);
					this.ITEM_POPUP.appendChild(menuitem);
				}
			}
		}
	},
	getElementById : function(id){
		return document.getElementById(this.idMENUITEM + id);
	},
	popupMenu : function(aEvent){
		mcItemView._popupMenu(aEvent);
	},
	_popupMenu : function(aEvent){
		if(this._bitsItemView.VTTB && this.FAVICON_POPUP && this.FAVICON_POPUP.hasChildNodes()){
			var menuitems = this._bitsItemView.VTTB.getElementsByTagName("menuitem");
			for(var i=0;i<menuitems.length;i++){
				if(!menuitems[i].hasAttribute("checked") || menuitems[i].getAttribute("checked") == "false") continue;
				try{
					this.getElementById(menuitems[i].id).setAttribute("checked","true");
				}catch(e){}
				break;
			}
		}
		if(this._bitsItemView.TREE && this.ITEM_POPUP && this.ITEM_POPUP.hasChildNodes()){
			var treecols = this._bitsItemView.TREE.getElementsByTagName("treecol");
			for(var i=0;i<treecols.length;i++){
				try{
					if(treecols[i].hasAttribute("hidden") && treecols[i].getAttribute("hidden") == "true"){
						this.getElementById(treecols[i].id).removeAttribute("checked");
					}else{
						this.getElementById(treecols[i].id).setAttribute("checked","true");
					}
				}catch(e){}
			}
		}
	},
	commandMenuFavicon : function(aEvent){
		mcItemView._commandMenuFavicon(aEvent);
	},
	_commandMenuFavicon : function(aEvent){
		if(!aEvent.target.id.match(new RegExp("^"+this.idMENUITEM+"(.+$)"))) return;
		var id = aEvent.target.getAttribute("target_id");
		var menuitem = this._bitsItemView.VTTB.ownerDocument.getElementById(id);
		if(menuitem){
			menuitem.setAttribute("checked","true");
			this._bitsItemView.onViewTypePopupCommand({target : menuitem });
		}
	},
	commandMenuItem : function(aEvent){
		mcItemView._commandMenuItem(aEvent);
	},
	_commandMenuItem : function(aEvent){
		if(!aEvent.target.id.match(new RegExp("^"+this.idMENUITEM+"(.+$)"))) return;
		var id = aEvent.target.getAttribute("target_id");
		var treecol = this._bitsItemView.TREE.ownerDocument.getElementById(id);
		if(treecol){
			if(aEvent.target.hasAttribute("checked")){
				treecol.removeAttribute("hidden");
			}else{
				treecol.setAttribute("hidden","true");
			}
		}
	},
	done : function(aEvent){
		this._bitsItemView.done(aEvent);
		if(this._bitsItemView.isChecked){
			var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
			if(contextmenu_mode != "legacy"){
				this.POPUP.removeEventListener("popupshowing", this.popupMenu, false);
				this.FAVICON_POPUP.removeEventListener("command", this.commandMenuFavicon, false);
				this.ITEM_POPUP.removeEventListener("command", this.commandMenuItem, false);
			}
		}
	},
	disp : function(){
		this._bitsItemView.disp();
	},
	onButtonClick : function(aEvent){
		this._bitsItemView.onButtonClick(aEvent);
	},
	onTreeClick : function(aEvent){
		var aRes = mcTreeHandler.resource;
		if(aRes){
			var fid = mcTreeHandler.DataSource.getProperty(aRes, "id");
			var dbtype = mcTreeHandler.DataSource.getProperty(aRes, "dbtype");
			var viewmode = mcTreeViewModeService.viewmode;
			this._bitsItemView.onTreeClick({viewmode:viewmode,fid:fid,dbtype:dbtype,res:aRes});
		}else{
			this._bitsItemView.onTreeClick();
		}
	},
	setSelection : function(aOID,aDBTYPE){
		this._bitsItemView.setSelection(aOID,aDBTYPE);
	},
	mergeObject : function(srcRes,dstRes){
		var src_title;
		var dst_title;
		if(srcRes) src_title = mcTreeHandler.DataSource.getProperty(srcRes, "title");
		if(dstRes) dst_title = mcTreeHandler.DataSource.getProperty(dstRes, "title");
		if(src_title != dst_title) return 0;
		var fid = mcTreeHandler.DataSource.getProperty(dstRes, "id");
		var dbtype = mcTreeHandler.DataSource.getProperty(dstRes, "dbtype");
		return this._bitsItemView.mergeObject({fid:fid,dbtype:dbtype});
	},
	copyObject : function(aRes){
		var fid = mcTreeHandler.DataSource.getProperty(aRes, "id");
		var dbtype = mcTreeHandler.DataSource.getProperty(aRes, "dbtype");
		var style = mcTreeHandler.DataSource.getProperty(aRes, "style");
		this._bitsItemView.copyObject({fid:fid,dbtype:dbtype,fid_style:style});

	},
	moveObject : function(aRes,aModShift){
		var srcRes = mcTreeHandler.resource;
		var fid = mcTreeHandler.DataSource.getProperty(aRes, "id");
		var dbtype = mcTreeHandler.DataSource.getProperty(aRes, "dbtype");
		var style = mcTreeHandler.DataSource.getProperty(aRes, "style");
		var rtn = this._bitsItemView.moveObject({fid:fid,dbtype:dbtype,fid_style:style},aModShift);
		if(srcRes){
			setTimeout(function(){
					var fid = mcTreeHandler.DataSource.getProperty(srcRes, "id");
					var dbtype = mcTreeHandler.DataSource.getProperty(srcRes, "dbtype");
					var viewmode = mcTreeViewModeService.viewmode;
					mcItemView._bitsItemView.onTreeClick({viewmode:viewmode,fid:fid,dbtype:dbtype,res:srcRes});
				},0);
		}

	},
	refresh : function(){
		this._bitsItemView.refresh();
	}
};


/////////////////////////////////////////////////////////////////////
var mcDatabaseUpdate = {
	_rebuild_time : 0,
	_rebuild : false,

	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	init : function(aEvent){
		mcDatabaseUpdate._rebuild_time = parseInt(window.top.bitsObjectMng.Common.getTimeStamp());
		mcDatabaseUpdate._rebuild = false;
	},

	rebuild : function(aEvent){
		if(!mcDatabaseUpdate._rebuild) return;
		mcTreeViewModeService.rebuild();
//		mcDatabaseUpdate.gBrowser.reload();
		mcDatabaseUpdate._rebuild = false;
	},
};

/////////////////////////////////////////////////////////////////////
var mcDatabaseObserver = {
	timerid : null,
	domain  : 'wiredmarker', //"objectmng.xxx"という名前の設定が変更された場合全てで処理を行う
	observe : function(aSubject, aTopic, aPrefstring){
		try{
			if(aTopic == 'nsPref:changed'){
				switch(aPrefstring){
					case "wiredmarker.last_update":
						var inittime = window.top.bitsObjectMng.DataSource.inittime;
						var value = nsPreferences.copyUnicharPref(aPrefstring,"");
						var arr = value.split("\t");
						if(inittime != arr[2]){
							if(mcDatabaseObserver.timerid) clearTimeout(mcDatabaseObserver.timerid);
							mcDatabaseObserver.timerid = setTimeout(function(){ mcDatabaseObserver.timerid=null; mcDatabaseUpdate._rebuild = true; }, 1000);
						}
						window.top.bitsAutocacheService.refresh();
						bitsTreeDate.refresh();
						window.top.bitsTreeListService.reload();
						setTimeout(function(){ bitsSearchAcross.search(); },1000);
						break;
					case "wiredmarker.rebuild_addon_msg":
						setTimeout(
							function(){
								if(!mcDatabaseUpdate._rebuild){
									mcDatabaseUpdate._rebuild = true;
									mcDatabaseUpdate.rebuild();
								}
								if(mcItemView.isChecked) mcItemView.refresh();
							},0);
						window.top.bitsAutocacheService.refresh();
						break;
					case "wiredmarker.shortcut.tree_disp":
						mcTreeViewModeService.showShortcutKey();
						break;
					case "wiredmarker.contextmenu.mode":
						mcItemView.initMenu();
						break;
					default:
						break;
				}
			}
		}catch(ex){
			window.top.bitsObjectMng.Common.alert("mcDatabaseObserver:"+ex);
		}
	}
};

/////////////////////////////////////////////////////////////////////
function showConsole(){
	window.open("chrome://global/content/console.xul", "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
}

/////////////////////////////////////////////////////////////////////
// JavaScript コンソールにテキストを表示する
/////////////////////////////////////////////////////////////////////
function _dump(aString){
	if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
}
function _dump2(aString){
	if(!nsPreferences.getBoolPref("wiredmarker.debug", false)) return;
	var dumpString = new String(aString);
	var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	aConsoleService.logStringMessage(dumpString);
	window.dump(aString+"\n");
}
