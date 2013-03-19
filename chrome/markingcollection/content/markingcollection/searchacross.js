var bitsSearchAcross = {
	_id : 'searchacross',
	_timer : null,
	_value : "",

	get id(){return this._id;},
	get value(){return this._value;},

	get STRING() { return document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get TEXTBOX()    { return document.getElementById("bitsSearchAcrossTextbox"); },

	get SIDEBAR_TREETABBOX(){ return document.getElementById("mcTreeTabbox"); },
	get SIDEBAR_TREETABPANEL(){ return document.getElementById("mcTreeTabCustom"); },

/////////////////////////////////////////////////////////////////////
	init : function(){
		var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		this.app_version = parseInt(info.version);
	},

/////////////////////////////////////////////////////////////////////
	done : function(){},

/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
		mcTreeHandler.TREE.focus();
		mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(mcTreeHandler.TREE.currentIndex);
		mcPropertyView.dispProperty();
		if(mcItemView.isChecked){
			mcItemView.onTreeClick();
		}else{
			var objects;
			var viewmode = mcTreeViewModeService.viewmode;
			var findRegExp = new RegExp(this.value,"img");
			if(viewmode == "all"){
				objects = this.Database.findObject(findRegExp);
			}else{
				var doc_url = window.top.bitsAutocacheService.convertCacheURLToOriginalURL(this.Common.getURLStringFromDocument(this.gBrowser.contentDocument));
				objects = this.Database.findObject(findRegExp,undefined,{doc_url:doc_url});
			}
			if(objects){
				for(var i=0;i<objects.length;i++){
					var about = this.DataSource.ABOUT_ITEM+this.Database._seqIdentify(objects[i].oid);
					this.addItem(this.Database.makeObjectToItem(objects[i],about),false);
				}
				this.DataSource.flush();
				mcTreeHandler.TREE.builder.rebuild();
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	search : function(aString){
		if(aString == undefined && this._value=="") return;
		var currentIndex = mcTreeHandler.TREE.currentIndex;
		var isSelected = (currentIndex>=0?mcTreeHandler.TREE.view.selection.isSelected(currentIndex):false);
		var curRes = mcTreeHandler.resource;
		var object = null;
		if(aString != undefined){
			this._value = (new String(aString)).replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/\s{2,}/g," ").replace(/^\s*/g,"").replace(/\s*$/g,"");
			this.removeItem();
		}else if(!this.removeItem()){
			return;
		}
		if(this.value.length > 0){
			var newRes = this.createSearchFolder(this.value);
			mcTreeHandler.TREE.builder.rebuild();
			var newIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
			if(aString != undefined){
				this.SIDEBAR_TREETABBOX.selectedTab = this.SIDEBAR_TREETABPANEL;
				mcTreeHandler.TREE.currentIndex = newIdx;
				if(newIdx>=0){
					this.rebuild();
					mcTreeHandler.TREE.currentIndex = newIdx;
					if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
				}
			}else if(mcItemView.isChecked){
				if(curRes) currentIndex = mcTreeHandler.TREE.builderView.getIndexOfResource(curRes);
				if((currentIndex<0 || currentIndex == newIdx) && newIdx>=0){
					mcTreeHandler.TREE.currentIndex = newIdx;
					this.rebuild();
				}else if(currentIndex>=0){
					mcTreeHandler.TREE.currentIndex = currentIndex;
					if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
					mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(mcTreeHandler.TREE.currentIndex);
					var curIdx=mcItemView.TREE.currentIndex;
					mcItemView.onTreeClick();
					var object = null;
					if(curIdx>=0){
						mcItemView.TREE.currentIndex = curIdx;
						if(!mcItemView.TREE.view.selection.isSelected(mcItemView.TREE.currentIndex)) mcItemView.TREE.view.selection.select(mcItemView.TREE.currentIndex);
						mcItemView.TREE.treeBoxObject.ensureRowIsVisible(mcItemView.TREE.currentIndex);
						object = mcItemView.object;
					}else{
						object = mcTreeHandler.object;
					}
				}
			}else{
				this.rebuild();
				currentIndex = -1;
				if(curRes) currentIndex = mcTreeHandler.TREE.builderView.getIndexOfResource(curRes);
				mcTreeHandler.TREE.currentIndex = currentIndex;
				if(mcTreeHandler.TREE.currentIndex>=0){
					if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
					mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(mcTreeHandler.TREE.currentIndex);
					object = mcTreeHandler.object;
				}
			}
		}else{
			mcTreeHandler.TREE.builder.rebuild();
			currentIndex = -1;
			if(curRes) currentIndex = mcTreeHandler.TREE.builderView.getIndexOfResource(curRes);
			mcTreeHandler.TREE.currentIndex = currentIndex;
			var object = null;
			if(currentIndex>=0){
				if(isSelected && !mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
				mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(mcTreeHandler.TREE.currentIndex);
				if(mcItemView.isChecked){
					var curIdx=mcItemView.TREE.currentIndex;
					mcItemView.onTreeClick();
					if(curIdx>=0){
						mcItemView.TREE.currentIndex = curIdx;
						if(!mcItemView.TREE.view.selection.isSelected(mcItemView.TREE.currentIndex)) mcItemView.TREE.view.selection.select(mcItemView.TREE.currentIndex);
						mcItemView.TREE.treeBoxObject.ensureRowIsVisible(mcItemView.TREE.currentIndex);
						object = mcItemView.object;
					}else{
						object = mcTreeHandler.object;
					}
				}else{
					object = mcTreeHandler.object;
				}
			}
		}
		if(object){
			mcPropertyView.dispProperty(object);
		}else{
			mcPropertyView.dispProperty();
		}
	},

/////////////////////////////////////////////////////////////////////
	createSearchFolder : function(aString){
		var newItem = this.Common.newItem(this.id);
		newItem.title = "Search ["+aString+"]";
		newItem.type = "folder";
		newItem.editmode = "false";
		var newRes = this.addItem(newItem);
		var idx = mcTreeHandler.TREE.builderView.getIndexOfResource(newRes);
		if(idx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(idx)) mcTreeHandler.TREE.view.toggleOpenState(idx);
		return newRes;
	},

/////////////////////////////////////////////////////////////////////
	getAbout : function(){
		return this.DataSource.ABOUT_ITEM + this.id;
	},

/////////////////////////////////////////////////////////////////////
	getResource : function(){
		return this.Common.RDF.GetResource(this.getAbout());
	},

/////////////////////////////////////////////////////////////////////
	getIndex : function(){
		return mcTreeHandler.TREE.builderView.getIndexOfResource(this.getResource());
	},

/////////////////////////////////////////////////////////////////////
	removeItem : function(){
		var idx = -1;
		var curRes = this.getResource();
		if(curRes) idx = mcTreeHandler.TREE.builderView.getIndexOfResource(curRes);
		if(idx<0) return false;
		try{
			var names = this.DataSource.data.ArcLabelsOut(curRes);
			while(names.hasMoreElements()){
				try{
					var name  = names.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
					var value = this.DataSource.data.GetTarget(curRes, name, true);
					this.DataSource.data.Unassert(curRes, name, value);
				}catch(e){}
			}
		}catch(e){}
		var cont = this.DataSource.getContainer(this.DataSource.ABOUT_ROOT, false);
		cont.RemoveElement(curRes,true);
		this.DataSource.flush();
		return true;
	},

/////////////////////////////////////////////////////////////////////
	addItem : function(aOMitem,aFlash){
		if(aFlash == undefined) aFlash = true;
		for(var key in aOMitem){
			if(typeof(aOMitem[key]) == "string") aOMitem[key] = this.DataSource.sanitize(aOMitem[key]);
		}
		try{
			var cont;
			if(aOMitem.type == "folder"){
				cont = this.DataSource.getContainer(this.DataSource.ABOUT_ROOT, false);
			}else{
				cont = this.DataSource.getContainer(this.getAbout(), false);
			}
			var newRes;
			if(aOMitem.type == "folder"){
				newRes = this.getResource();
			}else{
				if(aOMitem.about){
					newRes = this.Common.RDF.GetResource(aOMitem.about);
				}else{
					newRes = this.Common.RDF.GetResource(this.DataSource.ABOUT_ITEM + aOMitem.id);
					aOMitem.id = aOMitem.oid;
					delete aOMitem.oid;
				}
			}
			for(var key in aOMitem){
				if(aOMitem[key] != undefined) this.DataSource.data.Assert(newRes, this.Common.RDF.GetResource(window.top.bitsObjectMng.NS_OBJECTMANAGEMENT + key), this.Common.RDF.GetLiteral(aOMitem[key]), true);
			}
			if(aOMitem.type == "folder"){
				cont.InsertElementAt(newRes, 1, true);
			}else{
				cont.AppendElement(newRes);
			}
			if(aOMitem.type == "folder") this.Common.RDFCU.MakeSeq(this.DataSource.data, this.Common.RDF.GetResource(newRes.Value));
			if(aFlash) this.DataSource.flush();
			return newRes;
		}catch(e){
			this._dump("bitsSearchAcross.addItem():" + e);
			return null;
		}
	},

/////////////////////////////////////////////////////////////////////
	onSearchButtonCommand : function(aEvent){
	},

/////////////////////////////////////////////////////////////////////
	onSearchKeyInput : function(aEvent){
		var value = aEvent.target.value;
		if(this._timer) clearTimeout(this._timer);
		this._timer = setTimeout(function(){ bitsSearchAcross.search(value); },2000);
	},

/////////////////////////////////////////////////////////////////////
	onSearchKeyPress : function(aEvent){
		switch(aEvent.keyCode){
			case aEvent.DOM_VK_RETURN :
				if(this._timer) clearTimeout(this._timer);
				this.search(aEvent.target.value);
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
