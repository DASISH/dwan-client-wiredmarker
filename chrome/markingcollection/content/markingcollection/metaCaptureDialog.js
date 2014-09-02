var bitsMetaCaptureDialog = {

	_xmlfile : null,
	_xmldoc  : null,
	_outtext : null,
	_oid_property : null,
	_oid_title : null,

/////////////////////////////////////////////////////////////////////
// プロパティ
/////////////////////////////////////////////////////////////////////
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get bitsHyperAnchorDummy() { return window.opener.top.bitsHyperAnchorDummy; },

	get STRING()     { return document.getElementById("bitsMetaCaptureString"); },

	get DIALOG()     { return document.getElementById("bitsMetaCaptureDialog"); },

	get TREE()       { return document.getElementById("bitsMetaCopyTagRxgexpTree"); },
	get COL_USE()    { return document.getElementById("bitsMetaCopyTagRxgexpTreeUseCol"); },
	get ADD()        { return document.getElementById("bitsMetaCopyTagRxgexpTreeAdd"); },
	get DEL()        { return document.getElementById("bitsMetaCopyTagRxgexpTreeDel"); },
	get CHK_REGEXP_EDIT() { return document.getElementById("bitsMetaCopyTagRxgexpEdit"); },

	get TAG()        { return document.getElementById("bitsMetaCopyTagRxgexpTreeAddTagMenulist"); },
	get REGEXP()     { return document.getElementById("bitsMetaCopyTagRxgexpTreeAddRxgexpTextbox"); },
	get FORMAT()     { return document.getElementById("bitsMetaCopyTagRxgexpTreeAddFormatTextbox"); },

	get CHK_HA()     { return document.getElementById("bitsMetaCopyItemHyperAnchor"); },
	get CHK_TITLE()  { return document.getElementById("bitsMetaCopyItemTitle"); },
	get CHK_NOTE()   { return document.getElementById("bitsMetaCopyItemNote"); },
	get CHK_META()   { return document.getElementById("bitsMetaCopyItemMeta"); },
	get CHK_HASH()   { return document.getElementById("bitsMetaCopyHyperanchorInURLHash"); },

	get CHK_ANCHOR() { return document.getElementById("bitsMetaCopyOutputItemAnchor"); },

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

	get FMT_OUTPUT() { return document.getElementById("bitsMetaCopyOutputFormatTextbox"); },
	get REG_OUTPUT() { return document.getElementById("bitsMetaCopyOutputRegExpTextbox"); },
	get REG_I()      { return document.getElementById("bitsMetaCopyOutputRegExpI"); },
	get REG_G()      { return document.getElementById("bitsMetaCopyOutputRegExpG"); },
	get REG_M()      { return document.getElementById("bitsMetaCopyOutputRegExpM"); },
	get REP_OUTPUT() { return document.getElementById("bitsMetaCopyOutputReplaceTextbox"); },
	get SMP_OUTPUT() { return document.getElementById("bitsMetaOutputSample"); },

	get ROW_PMCID()  { return document.getElementById("bitsMetaCopyItemMedlinePMCIDRow"); },
	get ROW_PMID()   { return document.getElementById("bitsMetaCopyItemMedlinePMIDRow"); },
	get ROW_SO()     { return document.getElementById("bitsMetaCopyItemMedlineSORow"); },

	get xmldoc()     { return this._xmldoc; },

/////////////////////////////////////////////////////////////////////
// メソッド
/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		this._xmldoc = window.arguments[0].xmldoc;
		this._oid_property = window.arguments[0].oid_property;
		this._doc_title = window.arguments[0].doc_title;
		this._oid_title = window.arguments[0].oid_title;
		this._con_url = window.arguments[0].con_url;
		this.makeFormatText = window.arguments[0].makeFormatText;
		var elemNote = this._oid_property.getElementsByTagName("NOTE")[0];
		if(elemNote){
			this.CHK_NOTE.removeAttribute("disabled");
		}
		var elemMetas = this._oid_property.getElementsByTagName("METACAPTURE");
		if(elemMetas && elemMetas.length>0 && (elemMetas[0].getAttribute("content") || elemMetas[0].textContent)){
			this.CHK_META.removeAttribute("disabled");
			for(var i=0;i<elemMetas.length;i++){
				this.TAG.appendItem(elemMetas[i].getAttribute("tag"),elemMetas[i].getAttribute("tag"));
			}
			this.TAG.selectedIndex = 0;
		}
		var elemPMCID = this._oid_property.getElementsByTagName("PMCID")[0];
		if(elemPMCID){
			this.ROW_PMCID.removeAttribute("hidden");
		}else{
			this.ROW_PMCID.setAttribute("hidden","true");
		}
		var elemPMID = this._oid_property.getElementsByTagName("PMID")[0];
		if(elemPMID){
			this.ROW_PMID.removeAttribute("hidden");
		}else{
			this.ROW_PMID.setAttribute("hidden","true");
		}
		var elemSO = this._oid_property.getElementsByTagName("SO")[0];
		if(elemSO){
			this.ROW_SO.removeAttribute("hidden");
		}else{
			this.ROW_SO.setAttribute("hidden","true");
		}
		var copyitems = null;
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]',this.xmldoc);
		if(!results || results.length == 0){
			copyitems = this.xmldoc.createElement("COPY_ITEMS");
			this.xmldoc.documentElement.appendChild(copyitems);
		}else{
			copyitems = results[0];
		}
		results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="hyperanchor"]',this.xmldoc);
		if(!results || results.length == 0){
			var copyitem = this.xmldoc.createElement("COPY_ITEM");
			copyitem.setAttribute("name","hyperanchor");
			copyitems.appendChild(copyitem);
			this.GRP_HA.disabled = true;
			this.GRP_HA.value = "true";
		}else{
			this.CHK_HA.checked = (results[0].getAttribute("checked") == "true" ? true : false);
			this.GRP_HA.disabled = (!this.CHK_HA.disabled && this.CHK_HA.checked ? false : true);
			this.GRP_HA.value = (results[0].getAttribute("selected") != "" ? results[0].getAttribute("selected") : "true");
		}
		results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="title"]',this.xmldoc);
		if(!results || results.length == 0){
			var copyitem = this.xmldoc.createElement("COPY_ITEM");
			copyitem.setAttribute("name","title");
			copyitems.appendChild(copyitem);
			this.GRP_TITLE.disabled = true;
			this.GRP_TITLE.value = "true";
		}else{
			this.CHK_TITLE.checked = (results[0].getAttribute("checked") == "true" ? true : false);
			this.GRP_TITLE.disabled = (!this.CHK_TITLE.disabled && this.CHK_TITLE.checked ? false : true);
			this.GRP_TITLE.value = (results[0].getAttribute("selected") != "" ? results[0].getAttribute("selected") : "true");
		}
		results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="note"]',this.xmldoc);
		if(!results || results.length == 0){
			var copyitem = this.xmldoc.createElement("COPY_ITEM");
			copyitem.setAttribute("name","note");
			copyitems.appendChild(copyitem);
			this.GRP_NOTE.disabled = true;
			this.GRP_NOTE.value = "true";
		}else{
			this.CHK_NOTE.checked = (results[0].getAttribute("checked") == "true" ? true : false);
			this.GRP_NOTE.disabled = (!this.CHK_NOTE.disabled && this.CHK_NOTE.checked ? false : true);
			this.GRP_NOTE.value = (results[0].getAttribute("selected") != "" ? results[0].getAttribute("selected") : "true");
		}
		results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="meta"]',this.xmldoc);
		if(!results || results.length == 0){
			var copyitem = this.xmldoc.createElement("COPY_ITEM");
			copyitem.setAttribute("name","meta");
			copyitems.appendChild(copyitem);
			this.GRP_META.disabled = true;
			this.GRP_META.value = "true";
		}else{
			this.CHK_META.checked = (results[0].getAttribute("checked") == "true" ? true : false);
			this.GRP_META.disabled = (!this.CHK_META.disabled && this.CHK_META.checked ? false : true);
			this.GRP_META.value = (results[0].getAttribute("selected") != "" ? results[0].getAttribute("selected") : "true");
		}
		var outputitems = null;
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]',this.xmldoc);
		if(!results || results.length == 0){
			outputitems = this.xmldoc.createElement("OUTPUT_ITEMS");
			this.xmldoc.documentElement.appendChild(outputitems);
		}else{
			outputitems = results[0];
		}
		this.CHK_ANCHOR.checked = (outputitems.getAttribute("anchor_checked")=="true"?true:false);
		var elemHash = this._oid_property.getElementsByTagName("LOCATION_HASH")[0];
		if(elemHash && elemHash.textContent){
			this.CHK_HASH.checked = false;
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
			this.REG_I.checked = (results[0].getAttribute("regexp_i")=="true"?true:false);
			this.REG_G.checked = (results[0].getAttribute("regexp_g")=="true"?true:false);
			this.REG_M.checked = (results[0].getAttribute("regexp_m")=="true"?true:false);
		}
		bitsMetaCaptureDialogOutputTree.xmldoc = this._xmldoc;
		bitsMetaCaptureDialogOutputTree.xmlflash = window.arguments[0].xmlflash;
		this.rebuild();
		this.itemChecked();
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	accept : function(aEvent){
		window.arguments[0].accept = true;
		window.arguments[0].xmldoc = this.xmldoc;
		window.arguments[0].text = this._outtext;
		var s = new XMLSerializer();
		var xml = s.serializeToString(this.xmldoc);
		return true;
	},

/////////////////////////////////////////////////////////////////////
	itemChecked : function(aEvent){
		var checked = false;
		if(!checked && !this.CHK_HA.disabled && this.CHK_HA.checked) checked = true;
		if(!checked && !this.CHK_TITLE.disabled && this.CHK_TITLE.checked) checked = true;
		if(!checked && !this.CHK_NOTE.disabled && this.CHK_NOTE.checked) checked = true;
		if(!checked && !this.CHK_META.disabled && this.CHK_META.checked) checked = true;
		if(checked){
			this.DIALOG.removeAttribute("buttondisabledaccept");
		}else{
			this.DIALOG.setAttribute("buttondisabledaccept","true");
		}
		if(aEvent && aEvent.target == this.CHK_REGEXP_EDIT) this.rebuild();
		if(this.CHK_REGEXP_EDIT.checked){
			this.TAG.removeAttribute("hidden");
			this.REGEXP.removeAttribute("hidden");
			this.FORMAT.removeAttribute("hidden");
			this.ADD.removeAttribute("hidden");
			this.DEL.removeAttribute("hidden");
			this.COL_USE.removeAttribute("hidden");
			this.TREE.removeAttribute("disabled");
		}else{
			this.TAG.setAttribute("hidden","true");
			this.REGEXP.setAttribute("hidden","true");
			this.FORMAT.setAttribute("hidden","true");
			this.ADD.setAttribute("hidden","true");
			this.DEL.setAttribute("hidden","true");
			this.COL_USE.setAttribute("hidden","true");
			this.TREE.setAttribute("disabled","true");
		}
		if(!this.CHK_HA.disabled && this.CHK_HA.checked){
			this.GRP_HA.disabled = false;
		}else{
			this.GRP_HA.disabled = true;
		}
		if(!this.CHK_TITLE.disabled && this.CHK_TITLE.checked){
			this.GRP_TITLE.disabled = false;
		}else{
			this.GRP_TITLE.disabled = true;
		}
		if(!this.CHK_NOTE.disabled && this.CHK_NOTE.checked){
			this.GRP_NOTE.disabled = false;
		}else{
			this.GRP_NOTE.disabled = true;
		}
		if(!this.CHK_META.disabled && this.CHK_META.checked){
			this.GRP_META.disabled = false;
		}else{
			this.GRP_META.disabled = true;
		}
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="hyperanchor"]',this.xmldoc);
		results[0].setAttribute("checked",this.CHK_HA.checked);
		results[0].setAttribute("selected",this.GRP_HA.value);
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="title"]',this.xmldoc);
		results[0].setAttribute("checked",this.CHK_TITLE.checked);
		results[0].setAttribute("selected",this.GRP_TITLE.value);
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="note"]',this.xmldoc);
		results[0].setAttribute("checked",this.CHK_NOTE.checked);
		results[0].setAttribute("selected",this.GRP_NOTE.value);
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/COPY_ITEMS[1]/COPY_ITEM[@name="meta"]',this.xmldoc);
		results[0].setAttribute("checked",this.CHK_META.checked);
		results[0].setAttribute("selected",this.GRP_META.value);
		while(this.SMP_HA.hasChildNodes()){
			this.SMP_HA.removeChild(this.SMP_HA.lastChild);
		}
		while(this.SMP_TITLE.hasChildNodes()){
			this.SMP_TITLE.removeChild(this.SMP_TITLE.lastChild);
		}
		while(this.SMP_NOTE.hasChildNodes()){
			this.SMP_NOTE.removeChild(this.SMP_NOTE.lastChild);
		}
		while(this.SMP_META.hasChildNodes()){
			this.SMP_META.removeChild(this.SMP_META.lastChild);
		}
		if(checked){
			this._outtext = "";
			if(!this.CHK_HA.disabled && this.CHK_HA.checked){
				var value = this._con_url;
				var elem = this._oid_property.getElementsByTagName("HYPER_ANCHOR")[0];
				if(elem) value = elem.textContent;
				if(value && !this.GRP_HASH.hidden && this.CHK_HASH.checked){
					var hashReg = new RegExp("^(.+)(#"+this.bitsHyperAnchorDummy._anchor_title + ")");
					try{var textContent = this._oid_property.getElementsByTagName("LOCATION_HASH")[0].textContent;}catch(e){textContent="";}
					value = value.replace(hashReg,"$1#"+textContent+"$2");
				}
				if(this.GRP_HA.value == "true") value = '<HYPER_ANCHOR>' + value + '</HYPER_ANCHOR>';
				if(value){
					this.SMP_HA.appendChild(this.xmldoc.createTextNode(value));
					this._outtext += value + "\n";
				}
			}
			if(!this.CHK_TITLE.disabled && this.CHK_TITLE.checked){
				var value = "";
				if(this.GRP_TITLE.value == "true"){
					value += '<TITLE>' + this._oid_title + '</TITLE>';
				}else{
					value += this._oid_title;
				}
				if(value){
					this.SMP_TITLE.appendChild(this.xmldoc.createTextNode(value));
					this._outtext += value + "\n";
				}
			}
			if(!this.CHK_NOTE.disabled && this.CHK_NOTE.checked){
				var value = "";
				var elem = this._oid_property.getElementsByTagName("NOTE")[0];
				if(elem){
					if(this.GRP_NOTE.value == "true"){
						value += '<' + elem.nodeName + '>' + elem.textContent + '</' + elem.nodeName + '>';
					}else{
						value += elem.textContent;
					}
				}
				if(value){
					this.SMP_NOTE.appendChild(this.xmldoc.createTextNode(value));
					this._outtext += value + "\n";
				}
			}
			if(!this.CHK_META.disabled && this.CHK_META.checked){
				var value = "";
				var attrs = [];
				var attrs_hash = {};
				var regexps = this.XPath.evaluateArray('/METACAPTURE[1]/META_REGEXP_ITEMS[1]/META_REGEXP_ITEM[@use="true"]',this.xmldoc);
				for(var regcnt=0;regcnt<regexps.length;regcnt++){
					var temp_attrs = [];

					var nodeName = "tag";
					var nodeValue = regexps[regcnt].getAttribute(nodeName);
					if(nodeValue != null && nodeValue != "") temp_attrs.push('@'+nodeName+'="'+nodeValue+'"');

					var nodeName = "name";
					var nodeValue = regexps[regcnt].getAttribute(nodeName);
					if(nodeValue != null && nodeValue != "") temp_attrs.push('@'+nodeName+'="'+nodeValue+'"');

					if(temp_attrs.length == 0) continue;
					var attrs_key = temp_attrs.join(" and ");
					if(attrs_hash[attrs_key] == undefined){
						attrs.push(attrs_key);
						attrs_hash[attrs_key] = [];
					}
					var temp_attrs = {};
					var nodeName = "regexp";
					var nodeValue = regexps[regcnt].getAttribute(nodeName);
					if(nodeValue != null) temp_attrs[nodeName] = nodeValue;
					var nodeName = "format";
					var nodeValue = regexps[regcnt].getAttribute(nodeName);
					if(nodeValue != null) temp_attrs[nodeName] = nodeValue;
					attrs_hash[attrs_key].push(temp_attrs);
				}
				for(var regcnt=0;regcnt<attrs.length;regcnt++){
					var attrs_key = attrs[regcnt];
					if(attrs_key.indexOf('@tag="TITLE"')>=0){
						var textContent = this._doc_title;
						for(var rcnt=0;rcnt<attrs_hash[attrs_key].length;rcnt++){
							var regexp = attrs_hash[attrs_key][rcnt].regexp;
							var format = attrs_hash[attrs_key][rcnt].format;
							if(!regexp || regexp == "") continue;
							try{regexp = new RegExp(regexp);}catch(e){regexp=null;}
							if(!regexp) continue;
							if(!textContent.match(regexp)) continue;
							textContent = textContent.replace(regexp,format);
						}
						if(this.GRP_META.value == "true"){
							value += '<META>' + textContent + '</META>';
						}else{
							value += textContent;
						}
					}else{
						var nodes = this.XPath.evaluateArray("//METACAPTURE[" + attrs_key + "]",this._oid_property);
						for(var ncnt=0;ncnt<nodes.length;ncnt++){
							var elem = nodes[ncnt];
							var textContent = elem.getAttribute("content");
							if(textContent == null || textContent == "") textContent = elem.textContent;
							for(var rcnt=0;rcnt<attrs_hash[attrs_key].length;rcnt++){
								var regexp = attrs_hash[attrs_key][rcnt].regexp;
								var format = attrs_hash[attrs_key][rcnt].format;
								if(!regexp || regexp == "") continue;
								try{regexp = new RegExp(regexp);}catch(e){regexp=null;}
								if(!regexp) continue;
								if(!textContent.match(regexp)) continue;
								textContent = textContent.replace(regexp,format);
							}
							if(this.GRP_META.value == "true"){
								value += '<META>' + textContent + '</META>';
							}else{
								value += textContent;
							}
						}
					}
				}
				if(value){
					this.SMP_META.appendChild(this.xmldoc.createTextNode(value));
					this._outtext += value + "\n";
				}
			}
		}
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]',this.xmldoc);
		if(results && results.length){
			results[0].setAttribute("anchor_checked",this.CHK_ANCHOR.checked);
		}
		this.outputInput();
	},

/////////////////////////////////////////////////////////////////////
	outputInput : function(aEvent){
		var output = this.FMT_OUTPUT.value;
		var flag = "";
		flag += (this.REG_I.checked?'i':'');
		flag += (this.REG_G.checked?'g':'');
		flag += (this.REG_M.checked?'m':'');
		try{var regexp = (this.REG_OUTPUT.value?new RegExp(this.REG_OUTPUT.value,flag):null);}catch(e){this._dump(e);}
		var replace_text = this.REP_OUTPUT.value;
		var replacement_key = null;
		replacement_key = new RegExp(this.TXT_HA.value,'g');
		output = output.replace(replacement_key,this.SMP_HA.textContent);
		replacement_key = new RegExp(this.TXT_TITLE.value,'g');
		output = output.replace(replacement_key,this.SMP_TITLE.textContent);
		replacement_key = new RegExp(this.TXT_NOTE.value,'g');
		output = output.replace(replacement_key,this.SMP_NOTE.textContent);
		replacement_key = new RegExp(this.TXT_META.value,'g');
		output = output.replace(replacement_key,this.SMP_META.textContent);
		while(this.SMP_OUTPUT.hasChildNodes()){
			this.SMP_OUTPUT.removeChild(this.SMP_OUTPUT.lastChild);
		}
		if(regexp && output.match(regexp)){
			output = output.replace(regexp,replace_text);
		}
		if(this.CHK_ANCHOR.checked) output = '<a href="'+this.SMP_HA.textContent+'">'+output+'</a>';
		output = this.makeFormatText(this.xmldoc,{
			oid_property : this._oid_property,
			doc_title    : this._doc_title,
			oid_title    : this._oid_title,
			con_url      : this._con_url
		});
		var output_arr = output.split("\n");
		for(var i=0;i<output_arr.length;i++){
			var label = this.SMP_OUTPUT.ownerDocument.createElement("label");
			label.appendChild(this.SMP_OUTPUT.ownerDocument.createTextNode(output_arr[i]));
			this.SMP_OUTPUT.appendChild(label);
		}
		this._outtext = output;
	},

/////////////////////////////////////////////////////////////////////
	regexpInput : function(aEvent){
		var regexp = this.REGEXP.value;
		regexp = regexp.replace(/^\s*/g,"").replace(/\s*$/g,"");

		var format = this.FORMAT.value;
		format = format.replace(/^\s*/g,"").replace(/\s*$/g,"");

		if(regexp.length>0 && format.length>0){
			this.ADD.removeAttribute("disabled");
		}else{
			this.ADD.setAttribute("disabled","true");
		}
		this.ADD.removeAttribute("disabled");
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowItems(){
		if(this.CHK_REGEXP_EDIT.checked){
			return this.XPath.evaluateArray('/METACAPTURE[1]/META_REGEXP_ITEMS[1]/META_REGEXP_ITEM',this.xmldoc);
		}else{
			return this.XPath.evaluateArray('/METACAPTURE[1]/META_REGEXP_ITEMS[1]/META_REGEXP_ITEM[@use="true"]',this.xmldoc);
		}
	},
	get rowCount(){
		var results = this.rowItems;
		return results.length;
	},
	getCellText : function(row,column){
		var results = this.rowItems;
		if(!results[row]) return null;
		if(column.id == "bitsMetaCopyTagRxgexpTreeTagCol"){
			return results[row].getAttribute("tag");
		}else if(column.id == "bitsMetaCopyTagRxgexpTreeNameCol"){
			return results[row].getAttribute("name");
		}else if(column.id == "bitsMetaCopyTagRxgexpTreeRxgexpCol"){
			return results[row].getAttribute("regexp");
		}else if(column.id == "bitsMetaCopyTagRxgexpTreeFormatCol"){
			return results[row].getAttribute("format");
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
	getRowProperties: function(row,prop){
	},
	getCellProperties: function(row, column, prop) {
	},
	getColumnProperties: function(column, element, prop) {},
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
  getParentIndex: function(idx) { return -1; },
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
		this.TREE.view = bitsMetaCaptureDialog;
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
		this.REGEXP.value = results[row].getAttribute("regexp");
		this.FORMAT.value = results[row].getAttribute("format");

	},

	onAdd : function(aEvent){
		var elemRegexpItems = null;
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/META_REGEXP_ITEMS[1]',this.xmldoc);
		if(!results || results.length == 0){
			elemRegexpItems = this.xmldoc.createElement("META_REGEXP_ITEMS");
			this.xmldoc.documentElement.appendChild(elemRegexpItems);
		}else{
			elemRegexpItems = results[0];
		}
		var node = this.xmldoc.createElement("META_REGEXP_ITEM");
		node.setAttribute("tag",this.TAG.value);
		var regexp = this.REGEXP.value;
		regexp = regexp.replace(/^\s*/g,"").replace(/\s*$/g,"");
		node.setAttribute("regexp",regexp);
		var format = this.FORMAT.value;
		format = format.replace(/^\s*/g,"").replace(/\s*$/g,"");
		node.setAttribute("format",format);
		elemRegexpItems.appendChild(node);
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
