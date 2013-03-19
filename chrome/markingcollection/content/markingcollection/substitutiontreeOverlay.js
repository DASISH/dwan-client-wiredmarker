var bitsSubstitutionTreeOverlay = {
	_init : false,
	_pref : {},
	_app_version : 0,
	_changed : false,

	get POS_DEFAULT()     { return this.POS_TREE_RIGHT; },
	get POS_TREE_BOTTOM() { return "tree_bottom"; },
	get POS_TREE_RIGHT()  { return "tree_right"; },

	get BUTTON() {
		try{
			return bitsMarkingCollection._contentWindow.document.getElementById("mcToolbarItemTreeButton");
		}catch(e){ return undefined; }
	},

	get TREE()     { return document.getElementById("bitsSubstitutionTree"); },
	get ADD()      { return document.getElementById("bitsSubstitutionTreeAdd"); },
	get EDIT()     { return document.getElementById("bitsSubstitutionTreeEdit"); },
	get DEL()      { return document.getElementById("bitsSubstitutionTreeDel"); },

	get STRING()     { return window.opener.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},


	get bitsSubstitutionTree(){ return window.opener.top.bitsSubstitutionTree; },
	get xmldoc()              { return this.bitsSubstitutionTree.xmldoc; },
	get confirmRemovingFor()  { return this.bitsSubstitutionTree._confirmRemovingFor; },

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(!this._init){
			this.rebuild();
			this._init = true;
		}
	},

/////////////////////////////////////////////////////////////////////
	disp : function(aEvent){
		this.treeDispChange();
		this.rebuild();
		this.SPLITTER.setAttribute("hidden",!this._pref.disp);
		this.VBOX.setAttribute("hidden",!this._pref.disp);
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		if(this._changed) this.bitsSubstitutionTree.xmlflash();
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowCount(){
		var results = this.XPath.evaluateArray('//item',this.xmldoc);
		return results.length;
	},
	getCellText : function(row,column){
		var results = this.XPath.evaluateArray('//item',this.xmldoc);
		if(!results[row]) return null;
		if(column.id == "bitsSubstitutionTreeSrcCol"){
			return results[row].getAttribute("src");
		}else if(column.id == "bitsSubstitutionTreeAltCol"){
			return results[row].getAttribute("alt");
		}else{
			return null;
		}
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(){ return true; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,column){ return null; },
	getRowProperties: function(row,prop){
	},
	getCellProperties: function(row, column, prop) {
	},
	getColumnProperties: function(column, element, prop) {},
	cycleHeader : function(col){},
	setCellText : function(row,column,text){},
  getParentIndex: function(idx) { return -1; },
	canDrop : function(index, orient){
		return false;
	},
	onDrop : function(row, orient){},
	drop : function(row, orient){},


/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		this.TREE.view = bitsSubstitutionTreeOverlay;
	},

/////////////////////////////////////////////////////////////////////
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onClick : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		this.EDIT.removeAttribute("disabled");
		this.DEL.removeAttribute("disabled");
	},

	onDblClick : function(aEvent){
		this.onEdit(aEvent);
	},

	onAdd : function(aEvent){
		var src = {value: ""};
		var alt = {value: ""};
		var check = {value: false};
		var result = false;
		do{
			result = this.Common.PROMPT.prompt(window, this.STRING.getString("MSG_SUBSTITUTION_ADD"), this.STRING.getString("MSG_SUBSTITUTION_INPUT_FILENAME"), src, null, check);
			if(!result) return;
			src.value = src.value.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
		}while(src.value == "");
		var src_results = this.XPath.evaluateArray('//item[@src="'+src.value+'"]',this.xmldoc);
		if(src_results.length){
			alert(this.STRING.getString("ALERT_REGISTERED"));
			return;
		}
		result = this.Common.PROMPT.prompt(window, this.STRING.getString("MSG_SUBSTITUTION_ADD"), this.STRING.getString("MSG_SUBSTITUTION_FILENAME") + ":["+src.value+"]\n" + this.STRING.getString("MSG_SUBSTITUTION_INPUT_SUBSTITUTE_TEXT"), alt, null, check);
		if(!result) return;
		var node = this.xmldoc.createElement("item");
		node.setAttribute("src",src.value);
		node.setAttribute("alt",alt.value);
		this.xmldoc.documentElement.appendChild(node);
		this.rebuild();
		this._changed = true;
	},

	onEdit : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		var src = {value: ""};
		var alt = {value: ""};
		var check = {value: false};
		var result = false;
		var results = this.XPath.evaluateArray('//item',this.xmldoc);
		var i;
		for(i=0;i<idxList.length;i++){
			var row = idxList[i];
			if(!results[row]) continue;
			var org_src = results[row].getAttribute("src");
			src.value = org_src;
			alt.value = results[row].getAttribute("alt");
			do{
				result = this.Common.PROMPT.prompt(window, this.STRING.getString("MSG_SUBSTITUTION_EDIT"), this.STRING.getString("MSG_SUBSTITUTION_INPUT_FILENAME"), src, null, check);
				if(!result) return;
				src.value = src.value.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
				if(src.value != org_src){
					var src_results = this.XPath.evaluateArray('//item[@src="'+src.value+'"]',this.xmldoc);
					if(src_results.length){
						alert(this.STRING.getString("ALERT_REGISTERED"));
						return;
					}
				}
			}while(src.value == "");
			result = this.Common.PROMPT.prompt(window, this.STRING.getString("MSG_SUBSTITUTION_EDIT"), this.STRING.getString("MSG_SUBSTITUTION_FILENAME") + ":["+src.value+"]\n" + this.STRING.getString("MSG_SUBSTITUTION_INPUT_SUBSTITUTE_TEXT"), alt, null, check);
			if(!result) return;
			results[row].setAttribute("src",src.value);
			results[row].setAttribute("alt",alt.value);
		}
		this._changed = true;
	},

	onDel : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		if(!this.confirmRemovingFor()) return false;
		var results = this.XPath.evaluateArray('//item',this.xmldoc);
		var i;
		for(i=idxList.length-1;i>=0;i--){
			var row = idxList[i];
			if(!results[row]) continue;
			this.xmldoc.documentElement.removeChild(results[row]);
		}
		this.rebuild();
		this._changed = true;
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
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(this.Common.convertFormUnicode(aString,"Shift_jis")+"\n");
	},
};
