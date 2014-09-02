var bitsMetaCaptureDialogOutputTree = {

	_xmldoc  : null,
	xmlflash : null,

/////////////////////////////////////////////////////////////////////
// プロパティ
/////////////////////////////////////////////////////////////////////
	get DataSource(){ return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get STRING()     { return document.getElementById("bitsMetaCaptureString"); },

	get DIALOG()     { return document.getElementById("bitsMetaCaptureDialog"); },

	get TREE()       { return document.getElementById("bitsMetaCopyOutputTree"); },
	get ADD()        { return document.getElementById("bitsMetaCopyOutputTreeAdd"); },
	get DEL()        { return document.getElementById("bitsMetaCopyOutputTreeDel"); },
	get CHK_EDIT()   { return document.getElementById("bitsMetaCopyOutputEditCheckbox"); },
	get GRD_EDIT()   { return document.getElementById("bitsMetaCopyOutputEditGrid"); },
	get VBOX_EDIT()  { return document.getElementById("bitsMetaCopyOutputEditVBox"); },

	get TAG()        { return document.getElementById("bitsMetaCopyTagRxgexpTreeAddTagMenulist"); },
	get REGEXP()     { return document.getElementById("bitsMetaCopyTagRxgexpTreeAddRxgexpTextbox"); },
	get FORMAT()     { return document.getElementById("bitsMetaCopyTagRxgexpTreeAddFormatTextbox"); },

	get CHK_HA()     { return document.getElementById("bitsMetaCopyItemHyperAnchor"); },
	get CHK_TITLE()  { return document.getElementById("bitsMetaCopyItemTitle"); },
	get CHK_NOTE()   { return document.getElementById("bitsMetaCopyItemNote"); },
	get CHK_META()   { return document.getElementById("bitsMetaCopyItemMeta"); },
	get CHK_HASH()   { return document.getElementById("bitsMetaCopyHyperanchorInURLHash"); },

	get CHK_ANCHOR(){ return document.getElementById("bitsMetaCopyOutputItemAnchor"); },


	get GRP_HA()     { return document.getElementById("bitsMetaCopyItemHyperAnchorTagGroup"); },
	get GRP_TITLE()  { return document.getElementById("bitsMetaCopyItemTitleTagGroup"); },
	get GRP_NOTE()   { return document.getElementById("bitsMetaCopyItemNoteTagGroup"); },
	get GRP_META()   { return document.getElementById("bitsMetaCopyItemMetaTagGroup"); },
	get GRP_HASH()   { return document.getElementById("bitsMetaCopyHyperanchorGroupBox"); },

	get TXT_HA()     { return document.getElementById("bitsMetaCopyItemHyperAnchorText"); },
	get TXT_TITLE()  { return document.getElementById("bitsMetaCopyItemTitleText"); },
	get TXT_NOTE()   { return document.getElementById("bitsMetaCopyItemNoteText"); },
	get TXT_META()   { return document.getElementById("bitsMetaCopyItemMetaText"); },

	get SMP_HA()     { return document.getElementById("bitsMetaCopySampleHyperAnchor"); },
	get SMP_TITLE()  { return document.getElementById("bitsMetaCopySampleTitle"); },
	get SMP_NOTE()   { return document.getElementById("bitsMetaCopySampleNote"); },
	get SMP_META()   { return document.getElementById("bitsMetaCopySampleMeta"); },

	get FMT_OUTPUT(){ return document.getElementById("bitsMetaCopyOutputFormatTextbox"); },
	get REG_OUTPUT(){ return document.getElementById("bitsMetaCopyOutputRegExpTextbox"); },
	get REG_I()      { return document.getElementById("bitsMetaCopyOutputRegExpI"); },
	get REG_G()      { return document.getElementById("bitsMetaCopyOutputRegExpG"); },
	get REG_M()      { return document.getElementById("bitsMetaCopyOutputRegExpM"); },
	get REP_OUTPUT(){ return document.getElementById("bitsMetaCopyOutputReplaceTextbox"); },
	get SMP_OUTPUT(){ return document.getElementById("bitsMetaOutputSample"); },

	get xmldoc()     { return this._xmldoc; },
	set xmldoc(aVal){ this._xmldoc = aVal; this.rebuild(); },

/////////////////////////////////////////////////////////////////////
// メソッド
/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		var outputitems = null;
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]',this.xmldoc);
		if(!results || results.length == 0){
			outputitems = this.xmldoc.createElement("OUTPUT_ITEMS");
			this.xmldoc.documentElement.appendChild(outputitems);
		}else{
			outputitems = results[0];
			this.CHK_ANCHOR.checked = (results[0].getAttribute("checked")=="true"?true:false);
		}

		results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]/OUTPUT_ITEM',this.xmldoc);
		if(!results || results.length == 0){
			var outputitem = this.xmldoc.createElement("OUTPUT_ITEM");
			outputitem.setAttribute("format","");
			outputitems.appendChild(outputitem);
		}else{
			this.FMT_OUTPUT.value = results[0].getAttribute("format");
			this.REG_OUTPUT.value = results[0].getAttribute("regexp");
			this.REP_OUTPUT.value = results[0].getAttribute("replace");
			this.CHK_HASH.checked = (results[0].getAttribute("location_hash")=="true"?true:false);
			this.REG_I.checked = (results[0].getAttribute("regexp_i")=="true"?true:false);
			this.REG_G.checked = (results[0].getAttribute("regexp_g")=="true"?true:false);
			this.REG_M.checked = (results[0].getAttribute("regexp_m")=="true"?true:false);
		}

		this.rebuild();
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	regexpInput : function(aEvent){
		bitsMetaCaptureDialog.itemChecked();
	},

/////////////////////////////////////////////////////////////////////
	outputInput : function(aEvent){
		if(this.FMT_OUTPUT.value.length){
			this.ADD.removeAttribute("disabled");
		}else{
			this.ADD.setAttribute("disabled","true");
		}
		bitsMetaCaptureDialog.itemChecked();
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowItems(){
		return this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]/OUTPUT_ITEM',this.xmldoc);
	},
	get rowCount(){
		var results = this.rowItems;
		return results.length;
	},
	getCellText : function(row,column){
		var results = this.rowItems;
		if(!results[row]) return null;
		if(column.id == "bitsMetaCopyOutputTreeFormatCol"){
			return results[row].getAttribute("format");
		}else if(column.id == "bitsMetaCopyOutputTreeRxgexpCol"){
			return results[row].getAttribute("regexp");
		}else if(column.id == "bitsMetaCopyOutputTreeRxgexpFlagCol"){
			var text = "";
			text += (results[row].getAttribute("location_hash")=="true"?"#":"");
			text += (results[row].getAttribute("regexp_i")=="true"?"i":"");
			text += (results[row].getAttribute("regexp_g")=="true"?"g":"");
			text += (results[row].getAttribute("regexp_m")=="true"?"m":"");
			return text;
		}else if(column.id == "bitsMetaCopyOutputTreeReplaceCol"){
			return results[row].getAttribute("replace");
		}else{
			return null;
		}
	},
	getCellValue : function(row,column){
		var results = this.rowItems;
		if(!results[row]) return false;
		if(column.id == "bitsMetaCopyTagRxgexpTreeUseCol"){
			return (results[row].getAttribute("use") == "true" ? true : false);
		}
		return true;
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isEditable: function(row,column){
		if(column.id == "bitsMetaCopyTagRxgexpTreeUseCol"){
			return true;
		}else{
			return false;
		}
	},
	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(){ return true; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,column){ return null; },
	getRowProperties: function(row,prop){},
	getCellProperties: function(row, column, prop){},
	getColumnProperties: function(column, element, prop){},
	cycleHeader : function(col){},
	setCellText : function(row,column,text){},
	setCellValue : function(row,column,value){
		var results = this.rowItems;
		if(!results[row]) return;
		if(column.id == "bitsMetaCopyTagRxgexpTreeUseCol"){
			results[row].setAttribute("use",value);
			this.itemChecked();
		}
	},
  getParentIndex: function(idx){ return -1; },
	canDrop : function(index, orient){
		return false;
	},
	onDrop : function(row, orient){
		bitsMetaCaptureDialog._dump("onDrop()");
	},
	drop : function(row, orient){
		bitsMetaCaptureDialog._dump("drop()");
	},


/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		this.TREE.view = bitsMetaCaptureDialogOutputTree;
		if(this.rowCount > 0 && this.TREE.view.selection.count == 0){
			this.TREE.view.selection.select(0);
			var results = this.rowItems;
			for(var i=0;i<results.length;i++){
				if(results[i].getAttribute("selected") != "true") continue;
				this.TREE.view.selection.select(i);
				this.TREE.treeBoxObject.ensureRowIsVisible(i);
				break;
			}
			this.onClick();
		}
	},

/////////////////////////////////////////////////////////////////////
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onClick : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		this.DEL.removeAttribute("disabled");
		var row = idxList[0];
		var results = this.rowItems;
		var format = results[row].getAttribute("format");
		format = format.replace(/\\n/g,"\n");
		this.FMT_OUTPUT.value = format;
		this.REG_OUTPUT.value = results[row].getAttribute("regexp");
		this.REP_OUTPUT.value = results[row].getAttribute("replace");
		this.CHK_HASH.checked = (results[row].getAttribute("location_hash")=="true"?true:false);
		this.REG_I.checked = (results[row].getAttribute("regexp_i")=="true"?true:false);
		this.REG_G.checked = (results[row].getAttribute("regexp_g")=="true"?true:false);
		this.REG_M.checked = (results[row].getAttribute("regexp_m")=="true"?true:false);
		var selnodes = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]/OUTPUT_ITEM[@selected="true"]',this.xmldoc);
		for(var i=0;i<selnodes.length;i++){
			selnodes[i].removeAttribute("selected");
		}
		results[row].setAttribute("selected","true")
		this.outputInput();
	},

	onEdit : function(aEvent){
		if(this.CHK_EDIT.checked){
			this.GRD_EDIT.removeAttribute("hidden");
			this.VBOX_EDIT.removeAttribute("hidden");
		}else{
			this.GRD_EDIT.setAttribute("hidden","true");
			this.VBOX_EDIT.setAttribute("hidden","true");
		}
	},

	onAdd : function(aEvent){
		var selnodes = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]/OUTPUT_ITEM[@selected="true"]',this.xmldoc);
		for(var i=0;i<selnodes.length;i++){
			selnodes[i].removeAttribute("selected");
		}
		var elemOutputItems = null;
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]',this.xmldoc);
		if(!results || results.length == 0){
			elemOutputItems = this.xmldoc.createElement("OUTPUT_ITEMS");
			this.xmldoc.documentElement.appendChild(elemOutputItems);
		}else{
			elemOutputItems = results[0];
		}
		var format = this.FMT_OUTPUT.value;
		format = format.replace(/\x0D\x0A|\x0D|\x0A/g,"\\n");
		var node = this.xmldoc.createElement("OUTPUT_ITEM");
		node.setAttribute("format",format);
		node.setAttribute("regexp",this.REG_OUTPUT.value);
		node.setAttribute("replace",this.REP_OUTPUT.value);
		node.setAttribute("location_hash",this.CHK_HASH.checked);
		node.setAttribute("regexp_i",this.REG_I.checked);
		node.setAttribute("regexp_g",this.REG_G.checked);
		node.setAttribute("regexp_m",this.REG_M.checked);
		node.setAttribute("selected","true");
		elemOutputItems.appendChild(node);
		if(this.xmlflash) this.xmlflash();
		this.TREE.view.selection.clearSelection();
		this.rebuild();
	},

	onDel : function(aEvent){
		if(this.TREE.view.selection.count == 0) return false;
		var idxList = this.getSelection();
		if(this.validateMultipleSelection(idxList) == false) return false;
		if(!this.confirmRemovingFor()) return false;
		var results = this.rowItems;
		var i;
		for(i=idxList.length-1;i>=0;i--){
			var row = idxList[i];
			if(!results[row]) continue;
			results[row].parentNode.removeChild(results[row]);
		}
		if(this.xmlflash) this.xmlflash();
		if(this.rowCount == 0) this.TREE.view.selection.clearSelection();
		this.rebuild();
		var idxList = this.getSelection();
		if(this.rowCount == 0 || idxList.length == 0 || this.validateMultipleSelection(idxList) == false){
			this.DEL.setAttribute("disabled","true");
		}else{
			this.DEL.removeAttribute("disabled");
		}
		this._changed = true;
		this.TREE.focus();
	},

	confirmRemovingFor : function(){
		try{
			return this.Common.confirm( this.STRING.getString("CONFIRM_DELETE") );
			return true;
		}catch(e){
			return false;
		}
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
		window.opener.top.bitsMarkingCollection._dump(aString);
	},
};
