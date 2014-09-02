var mcTreeFolderFilterService = {
	item     : null,

	get KEYWORD() { return document.getElementById("mcTreeFolderFilterKeyword"); },
	get AVAILABLENESS() { return document.getElementById("mcTreeFolderFilterAvailableness"); },
	get INVALIDATION() { return document.getElementById("mcTreeFolderFilterInvalidation"); },
	get CASESENSITIVE() { return document.getElementById("mcTreeFolderFilterCasesensitive"); },

	get DataSource() { try{return window.opener.top.bitsObjectMng.DataSource;}catch(ex){return window.top.bitsObjectMng.DataSource;} },
	get Common()     { try{return window.opener.top.bitsObjectMng.Common;}catch(ex){return null;}     },
	get XPath()      { try{return window.opener.top.bitsObjectMng.XPath;}catch(ex){return null;}      },
	get Database()   { try{return window.opener.top.bitsObjectMng.Database;}catch(ex){return null;}   },
	get gBrowser()   { try{return window.opener.top.bitsObjectMng.getBrowser();}catch(ex){return null;}},

	init : function(){
		try {
			this.item = window.arguments[0];
		}catch(ex){
		}
		if(!this.item) return;
		try {
			document.title += " [" + this.item.title + "]";
			var i;
			var folder = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
			var folderArr = folder.split("\t");
			var folderHash = [];
			var folderCasesensitive = [];
			for(i=0;i<folderArr.length;i++){
				if(!folderArr[i].match(/^(\d+):(\d+):(.+)$/)) continue;
				folderHash[RegExp.$1] = RegExp.$3
				folderCasesensitive[RegExp.$1] = RegExp.$2
			}
			var keyword = nsPreferences.copyUnicharPref("wiredmarker.filter.keyword","");
			var keywordArr = keyword.split("\t");
			if(keywordArr.length>0){
				for(i=0;i<keywordArr.length&&i<10;i++){
					this.KEYWORD.appendItem(keywordArr[i],keywordArr[i]);
					if(folderHash[this.item.id] && folderHash[this.item.id] == keywordArr[i]) this.KEYWORD.selectedIndex = i;
				}
			}
			if(folderHash[this.item.id]){
				this.INVALIDATION.removeAttribute("selected");
				this.AVAILABLENESS.setAttribute("selected",true);
				this.KEYWORD.removeAttribute("disabled");
				this.CASESENSITIVE.removeAttribute("disabled");
				this.CASESENSITIVE.setAttribute("checked",folderCasesensitive[this.item.id]!=0);
			}else{
				this.AVAILABLENESS.removeAttribute("selected");
				this.INVALIDATION.setAttribute("selected",true);
				this.KEYWORD.setAttribute("disabled",true);
				this.CASESENSITIVE.setAttribute("disabled",true);
			}
		}catch(ex){
			this._dump(ex);
		}
		return;
	},

	done : function(){},

	accept : function(){
		var disabled = this.KEYWORD.getAttribute("disabled");
		var newVals = {
			keyword   : !disabled?this.KEYWORD.value:"",
		};
		var props;
		for(props in newVals){
			window.arguments[0][props] = newVals[props];
			window.arguments[0].accept = true;
			if(props != "keyword") continue;
			var i;
			var keyword = nsPreferences.copyUnicharPref("wiredmarker.filter.keyword","");
			var keywordArr = keyword.split("\t");
			var newArr = [];
			newArr.unshift(newVals[props]);
			for(i=0;i<keywordArr.length;i++){
				if(keywordArr[i] == newVals[props] || keywordArr[i] == "") continue;
				newArr.push(keywordArr[i]);
			}
			nsPreferences.setUnicharPref("wiredmarker.filter.keyword", newArr.join("\t"));
			var folder = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
			var folderArr = folder.split("\t");
			var folderHash = [];
			var folderCasesensitive = [];
			for(i=0;i<folderArr.length;i++){
				if(!folderArr[i].match(/^(\d+):(\d+):(.+)$/)) continue;
				folderHash[RegExp.$1] = RegExp.$3;
				folderCasesensitive[RegExp.$1] = RegExp.$2;
			}
			if(newVals[props] != ""){
				folderHash[this.item.id] = newVals[props];
				folderCasesensitive[this.item.id] = this.CASESENSITIVE.checked?1:0;
			}else{
				delete folderHash[this.item.id];
			}
			newArr = [];
			var key;
			for(key in folderHash){
				if(typeof folderHash[key] == "function") continue;
				newArr.push(key+":"+folderCasesensitive[key]+":"+folderHash[key]);
			}
			nsPreferences.setUnicharPref("wiredmarker.filter.folder", newArr.join("\t"));
		}
	},

	cancel : function(){
		if(window.arguments[0]) window.arguments[0].accept = false;
	},

	radio : function(aEvent){
		mcTreeFolderFilterService._dump(aEvent.target.id);
		if(this.AVAILABLENESS == aEvent.target){
			this.KEYWORD.removeAttribute("disabled");
			this.CASESENSITIVE.removeAttribute("disabled");
		}else{
			this.KEYWORD.setAttribute("disabled",true);
			this.CASESENSITIVE.setAttribute("disabled",true);
		}
	},

	checkbox : function(aEvent){},

	onCommand : function(aEvent){
		var rtn = false;
		var curIdx = mcTreeHandler.TREE.currentIndex;
		if(curIdx<0) return;
		if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
		var aRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
		var fid = window.top.bitsObjectMng.DataSource.getProperty(aRes,"id");
		var result = {};
		result.title = window.top.bitsObjectMng.DataSource.getProperty(aRes,"title");
		result.id = fid;
		result.keyword = "";
		result.accept = true;
		window.openDialog("chrome://markingcollection/content/treefolderfilter.xul", "", "chrome,centerscreen,modal", result);
		if(!result.accept) return;
		this._dump("result.keyword=["+result.keyword+"]")
		mcTreeViewModeService.rebuild();
	},

	isUseFilter : function(aRes){
		var fid = this.DataSource.getProperty(aRes,"id");
		var i;
		var folder = nsPreferences.copyUnicharPref("wiredmarker.filter.folder","");
		var folderArr = folder.split("\t");
		var folderHash = [];
		for(i=0;i<folderArr.length;i++){
			if(!folderArr[i].match(/^(\d+):(.+)$/)) continue;
			folderHash[RegExp.$1] = RegExp.$2
		}
		return (folderHash[fid] != undefined);
	},

	_dump : function(aString){
		try{ window.opener.top.bitsMarkingCollection._dump(aString); } catch(e){}
	},
};
