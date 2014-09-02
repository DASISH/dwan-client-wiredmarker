var bitsTreeProjectDicMngService = {

	_treeid  : "mcDicMngTree",
	_checkid : "treecheckbox",
	_termid  : "treeterm",
	_dateid  : "treedate",
	_deleteid : "treedelete",
	_dataArray : null,
	_dataArrayOrg : null,
	_resource : null,
	_xmldoc : null,
	_keyword : null,

	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get DIALOG() { return document.getElementById("mcDicMngDialog"); },
	get TREE() { return document.getElementById(this._treeid); },
	get VSB()  { return document.getElementById("mcDicMngSearchButton");},
	get VSM()  { return document.getElementById("mcDicMngSearchTextbox");},
	get VSC_CASE(){ return document.getElementById("mcDicMngSearchCaseSensitiveCheckbox");},
	get DEL()  { return document.getElementById("mcDicMngItemDel");},
	get DECK() { return document.getElementById("mcDicMngDeck");},
	get DECK0(){ return document.getElementById("mcDicMngDeck0");},
	get DECK1(){ return document.getElementById("mcDicMngDeck1");},
	get TOOLBAR(){ return document.getElementById("mcDicMngToolbar");},
	get TERM() { return document.getElementById("mcDicTermTextbox");},
	get OKBTN() { return document.getElementById("mcDicMngOKButton");},

	get TREE_EXCEPTION() { return document.getElementById(this._checkid); },
	get TREE_DELETE() { return document.getElementById(this._deleteid); },

	init : function(aEvent){
		if(window.arguments[0]) this._xmldoc = window.arguments[0].xmldoc;
		if(!this._xmldoc) return;
		var title = window.arguments[0].fid_title;
		var fid = window.arguments[0].fid;
		var dbtype = window.arguments[0].dbtype;
		document.title = title;
		this.DIALOG.setAttribute("wait-cursor","true");
		var self = this;
		setTimeout(function(){
			/* TERMSエレメント取得 */
			var terms;
			var elems = self._xmldoc.documentElement.getElementsByTagName("TERMS");
			if(elems && elems.length > 0){
				terms = elems[0];
			}else{
				terms = self._xmldoc.createElement("TERMS");
				if(terms) self._xmldoc.documentElement.appendChild(terms);
			}
			if(terms){
				var i;
				var termhash = {};
				var elems = terms.getElementsByTagName("TERM");
				if(elems.length>0) self._dataArrayOrg = [];
				for(i=0;i<elems.length;i++){
					if(!elems[i].textContent) continue;
					self._dataArrayOrg.push(elems[i]);
				}
			}
			self.rebuild();
			self.DIALOG.removeAttribute("wait-cursor");
			self.OKBTN.focus();
		},100);
	},

	accept : function(aEvent){
		if(window.arguments[0]) window.arguments[0].accept = true;
		return true;
	},

	cancel : function(aEvent){
		if(window.arguments[0]) window.arguments[0].accept = false;
		return true;
	},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowCount(){
		return (this._dataArray?this._dataArray.length:0);
	},
	getCellText : function(row,column){
		if(column.id == this._checkid){
			return this._dataArray[row].hasAttribute("exception");
		}else if(column.id == this._termid){
			return this._dataArray[row].textContent;
		}else if(column.id == this._dateid){
			var date = this._dataArray[row].getAttribute("date");
			if(date && date.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)) date = RegExp.$3 + "/" + RegExp.$1 + "/" + RegExp.$2 + " " + RegExp.$4 + ":" + RegExp.$5 + ":" + RegExp.$6;
			return date;
		}else{
		}
		return null;
	},
	getCellValue : function(row,column){
		if(column.id == this._checkid){
			return this._dataArray[row].hasAttribute("exception");
		}else if(column.id == this._deleteid){
			return this._dataArray[row].hasAttribute("delete");
		}
		return true;
	},
	setCellValue : function(row,column,value){
		if(column.id == this._checkid){
			if(value=="true"){
				this._dataArray[row].setAttribute("exception","true");
			}else{
				this._dataArray[row].removeAttribute("exception");
			}
		}else if(column.id == this._deleteid){
			if(value=="true"){
				this._dataArray[row].setAttribute("delete","true");
			}else{
				this._dataArray[row].removeAttribute("delete");
			}
		}
		var box = this.TREE.boxObject;
		if(box) box.invalidateRow(row);
		return;
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(){ return true; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,column){
		var icon;
		return icon;
	},
	getRowProperties: function(row,prop){
		if(this._dataArray[row].hasAttribute("delete")){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			prop.AppendElement(aserv.getAtom("delete"));
		}else if(this._dataArray[row].hasAttribute("exception")){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			prop.AppendElement(aserv.getAtom("exception"));
		}
	},
	getCellProperties: function(row, column, prop) {},
	getColumnProperties: function(column, element, prop) {},
	cycleHeader : function(col){},
	setCellText : function(row,column,text){
		text = text.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
		var caseSensitive_exp = new RegExp("[A-Z]{2,}","");
		if(!caseSensitive_exp.test(text)) text = text.toLowerCase();
		if(column.id == this._termid){
			this._dataArray[row].textContent = text;
			this._dataArray[row].setAttribute("date",this.Common.getFormatDate());
		}
	},
  getParentIndex: function(idx) { return -1; },
	isEditable : function(row,column){
		if(
			column.id == this._checkid ||
			column.id == this._termid  ||
			column.id == this._deleteid
		){
			return true;
		}else{
			return false;
		}
	},
	isSelectable : function(row,column){
		return true;
	},

	canDrop : function(index, orient){
		bitsTreeProjectDicMngService._dump("canDrop():["+index+"]["+orient+"]");
		return true;
	},
	onDrop : function(row, orient){
		bitsTreeProjectDicMngService._dump("onDrop()");
	},
	drop : function(row, orient){
		bitsTreeProjectDicMngService._dump("drop()");
	},
	getSelectIndex : function(){
		var indexlist = [];
		var i,c;
		var rangeCount = this.TREE.view.selection.getRangeCount();
		for(i=0;i<rangeCount;i++){
			var start = {};
			var end = {};
			this.TREE.view.selection.getRangeAt(i, start, end);
			for(c=start.value;c<=end.value;c++){
				indexlist.push(c);
			}
		}
		return indexlist;
	},

/////////////////////////////////////////////////////////////////////
	refresh : function(){
		var index = this.TREE.currentIndex;
		var box = this.TREE.boxObject;
		box.QueryInterface(Components.interfaces.nsITreeBoxObject);
		var fvRow = box.getFirstVisibleRow();
		this.rebuild();
		box.scrollToRow(fvRow);
		this.TREE.currentIndex = index;
	},

	rebuild : function(){
		if(!this.TREE) return;
		try{this._dataArray = this._dataArrayOrg.concat([]);}catch(e){ this._dataArray = null; }
		if(this._dataArray){
			if(this.VSB.checked && this.VSM.value != ""){
				var flag = "i";
				if(this.VSC_CASE.checked) flag = "";
				var regexp = new RegExp(this.VSM.value,flag);
				this._dataArray = this._dataArray.filter(
					function(element, index, array) {
						return regexp.test(element.textContent);
					}
				);
			}
			if(this.TREE_EXCEPTION.hidden){
				this._dataArray = this._dataArray.filter(
					function(element, index, array) {
						return !element.hasAttribute("exception");
					}
				);
			}
			if(this.TREE_DELETE && this.TREE_DELETE.hidden){
				this._dataArray = this._dataArray.filter(
					function(element, index, array) {
						return !element.hasAttribute("delete");
					}
				);
			}
			if(document.getElementById(this._checkid).hasAttribute("sortDirection")){
				var direction = document.getElementById(this._checkid).getAttribute("sortDirection");
				this._dataArray.sort(
					function(a,b){
						if(direction == "ascending"){
							if( a.hasAttribute("exception") && !b.hasAttribute("exception")) return -1;
							if(!a.hasAttribute("exception") &&  b.hasAttribute("exception")) return 1;
						}else if(direction == "descending"){
							if( a.hasAttribute("exception") && !b.hasAttribute("exception")) return 1;
							if(!a.hasAttribute("exception") &&  b.hasAttribute("exception")) return -1;
						}
						return 0;
					}
				);
			}else if(document.getElementById(this._termid).hasAttribute("sortDirection")){
				var direction = document.getElementById(this._termid).getAttribute("sortDirection");
				this._dataArray.sort(
					function(a,b){
						var a_term = a.textContent.toLowerCase();
						var b_term = b.textContent.toLowerCase();
						if(direction == "ascending"){
							if(a_term < b_term) return -1;
							if(a_term > b_term) return 1;
						}else if(direction == "descending"){
							if(a_term < b_term) return 1;
							if(a_term > b_term) return -1;
						}
						return 0;
					}
				);
			}else if(document.getElementById(this._dateid).hasAttribute("sortDirection")){
				var direction = document.getElementById(this._dateid).getAttribute("sortDirection");
				this._dataArray.sort(
					function(a,b){
						var a_term = a.getAttribute("date");
						var b_term = b.getAttribute("date");
						if(direction == "ascending"){
							if(a_term < b_term) return -1;
							if(a_term > b_term) return 1;
						}else if(direction == "descending"){
							if(a_term < b_term) return 1;
							if(a_term > b_term) return -1;
						}
						return 0;
					}
				);
			}else if(this.TREE_DELETE && this.TREE_DELETE.hasAttribute("sortDirection")){
				var direction = this.TREE_DELETE.getAttribute("sortDirection");
				this._dataArray.sort(
					function(a,b){
						if(direction == "ascending"){
							if( a.hasAttribute("delete") && !b.hasAttribute("delete")) return -1;
							if(!a.hasAttribute("delete") &&  b.hasAttribute("delete")) return 1;
						}else if(direction == "descending"){
							if( a.hasAttribute("delete") && !b.hasAttribute("delete")) return 1;
							if(!a.hasAttribute("delete") &&  b.hasAttribute("delete")) return -1;
						}
						return 0;
					}
				);
			}else{
				this._dataArray.sort(
					function(a,b){
						var a_term = a.textContent.toLowerCase();
						var b_term = b.textContent.toLowerCase();
						if(a_term > b_term){
							return 1;
						}else if(a_term < b_term){
							return -1;
						}
						return 0;
					}
				);
			}
		}
		this.TREE.view = this;
	},

/////////////////////////////////////////////////////////////////////
	onclick : function(aEvent){
		if(aEvent.button != 0) return;
		if(aEvent.altKey || aEvent.shiftKey || aEvent.ctrlKey) return;
		if(aEvent.target.id && aEvent.target.id.match(/^tree/)){
			if(aEvent.target.id != this._checkid)  document.getElementById(this._checkid).removeAttribute("sortDirection");
			if(aEvent.target.id != this._termid)   document.getElementById(this._termid).removeAttribute("sortDirection");
			if(aEvent.target.id != this._dateid)   document.getElementById(this._dateid).removeAttribute("sortDirection");
			if(aEvent.target.id != this._deleteid) this.TREE_DELETE.removeAttribute("sortDirection");
			if(!aEvent.target.hasAttribute("sortDirection")){
				aEvent.target.setAttribute("sortDirection","ascending");
			}else if(aEvent.target.getAttribute("sortDirection") == "ascending"){
				aEvent.target.setAttribute("sortDirection","descending");
			}else{
				aEvent.target.removeAttribute("sortDirection");
			}
			this.DIALOG.setAttribute("wait-cursor","true");
			var self = this;
			setTimeout(function(){
				self.rebuild();
				self.DIALOG.removeAttribute("wait-cursor");
			},100);
			return;
		}
		var self = this;
		var exception_hidden = self.TREE_EXCEPTION.hidden;
		var delete_hidden = (self.TREE_DELETE ? self.TREE_DELETE.hidden : true);
		setTimeout(function(){
			if((self.TREE_DELETE ? self.TREE_DELETE.hidden : true) == delete_hidden && self.TREE_EXCEPTION.hidden == exception_hidden) return;
			self.DIALOG.setAttribute("wait-cursor","true");
			setTimeout(function(){
				self.rebuild();
				self.DIALOG.removeAttribute("wait-cursor");
			},100);
		},0);
		try {
			var row = {};
			var col = {};
			var childElt = {};
			this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, childElt);
			if(row.value == undefined || col.value == undefined) return;
		} catch(e){
			bitsTreeProjectDicMngService._dump("bitsTreeProjectDicMngService.onclick():["+e+"]");
		}
	},

/////////////////////////////////////////////////////////////////////
	onSelectTree : function(aEvent){
		if(this.DEL.hasAttribute("disabled")) this.DEL.removeAttribute("disabled");
	},

/////////////////////////////////////////////////////////////////////
	onTreeKeyPress : function(aEvent){
		switch ( aEvent.keyCode ){
			case aEvent.DOM_VK_RETURN :
			case aEvent.DOM_VK_ESCAPE :
				if(this.TREE.editingRow>=0){
					aEvent.preventDefault();
					aEvent.stopPropagation();
				}
				break;
			case aEvent.DOM_VK_F2 :
				if(this.TREE.currentIndex<0) return;
				this.TREE.startEditing(this.TREE.currentIndex,this.TREE.columns.getNamedColumn(this._termid));
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	onTreeKeyDown : function(aEvent){
		switch ( aEvent.keyCode ){
			case aEvent.DOM_VK_A :
				if(aEvent.ctrlKey){
					this.TREE.view.selection.selectAll();
					aEvent.preventDefault();
					aEvent.stopPropagation();
				}
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	onItemAddCommand : function(aEvent){
		this.DECK.selectedIndex = 1;
		this.TOOLBAR.hidden = true;
		this.TREE.hidden = true;
		this.TERM.focus();
		window.sizeToContent();
	},

/////////////////////////////////////////////////////////////////////
	onItemAddOK : function(aEvent){
		var self = this;
//		var result = this.Common.prompt("Input new Term");
		var result = {
			input : this.TERM.value
		};
		if(result && result.input){
			var terms;
			var elems = this._xmldoc.documentElement.getElementsByTagName("TERMS");
			if(elems && elems.length > 0){
				terms = elems[0];
			}else{
				terms = this._xmldoc.createElement("TERMS");
				if(terms) this._xmldoc.documentElement.appendChild(terms);
			}
			if(terms){
				result.input = result.input.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
				var caseSensitive_exp = new RegExp("[A-Z]{2,}","");
				if(!caseSensitive_exp.test(result.input)) result.input = result.input.toLowerCase();
				var term = this._xmldoc.createElement("TERM");
				var text = this._xmldoc.createTextNode(result.input);
				if(term && text){
					term.setAttribute("date",this.Common.getFormatDate());
					term.appendChild(text);
					terms.appendChild(term);
					if(!this._dataArrayOrg) this._dataArrayOrg = [];
					this._dataArrayOrg.push(term);
					this.DIALOG.setAttribute("wait-cursor","true");
					setTimeout(function(){
							self.rebuild();
							self.DIALOG.removeAttribute("wait-cursor");
						},100);
				}
			}
		}
		this.onItemAddCancel(aEvent);
	},

/////////////////////////////////////////////////////////////////////
	onItemAddCancel : function(aEvent){
		this.DECK.selectedIndex = 0;
		this.TOOLBAR.hidden = false;
		this.TREE.hidden = false;
		window.sizeToContent();
	},

/////////////////////////////////////////////////////////////////////
	onItemDelCommand : function(aEvent){
		var indexlist = this.getSelectIndex();
		if(!indexlist || indexlist.length == 0) return;
		indexlist.sort(function(a,b){ return (parseInt(a)-parseInt(b));});
		var box = this.TREE.boxObject;
		var i;
		for(i=indexlist.length-1;i>=0;i--){
			var elem = this._dataArray[indexlist[i]];
			if(elem) elem.setAttribute("exception","true")
			if(box) box.invalidateRow(indexlist[i]);
		}
		if(!this.TREE_EXCEPTION.hidden) return;
		var self = this;
		self.DIALOG.setAttribute("wait-cursor","true");
		setTimeout(function(){
			self.rebuild();
			self.DIALOG.removeAttribute("wait-cursor");
		},100);
	},

/////////////////////////////////////////////////////////////////////
	onSearchButtonCommand : function(aEvent){
		var self = this;
		var checked = this.VSB.hasAttribute("checked");
		if(checked){
			this.VSM.removeAttribute("disabled");
			this.VSC_CASE.removeAttribute("disabled");
			if(!this.VSM.value){
				setTimeout(function(){
						self.VSM.focus();
					},0);
			}else{
				this._keyword = this.VSM.value;
				this.DIALOG.setAttribute("wait-cursor","true");
				setTimeout(function(){
						self.VSM.focus();
						self.rebuild();
						self.DIALOG.removeAttribute("wait-cursor");
					},100);
			}
		}else{
			this.VSM.blur();
			this.VSM.setAttribute("disabled","true");
			this.VSC_CASE.setAttribute("disabled","true");
			if(!this._keyword) return;
			this._keyword = null;
			this.DIALOG.setAttribute("wait-cursor","true");
			setTimeout(function(){
					self.rebuild();
					self.DIALOG.removeAttribute("wait-cursor");
				},100);
		}
	},

/////////////////////////////////////////////////////////////////////
	onSearchKeyPress : function(aEvent){
		var self = this;
		switch ( aEvent.keyCode ){
			case aEvent.DOM_VK_RETURN :
				this._keyword = this.VSM.value;
				this.DIALOG.setAttribute("wait-cursor","true");
				setTimeout(function(){
						self.rebuild();
						self.DIALOG.removeAttribute("wait-cursor");
					},100);
				aEvent.preventDefault();
				aEvent.stopPropagation();
				break;
			default:
				break;
		}
	},
/////////////////////////////////////////////////////////////////////
	onSearchInput : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.opener.top.bitsMarkingCollection._dump(aString);
	},
};

