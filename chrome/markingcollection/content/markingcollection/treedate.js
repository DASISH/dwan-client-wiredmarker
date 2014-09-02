var bitsTreeDate = {
	_init        : false,
	_xmlfilename : 'treedate.xml',
	_xmlfolder   : null,
	_xmlfile     : null,
	_xmldoc      : null,
	_namespace   : 'http://www.bits.cc/Wired-Marker/',
	_ns_alias    : 'WM',

	_refresh_timer : null,

	get APPCONT()  { return document.getElementById("appcontent"); },
	get TREE()     { return document.getElementById("bitsTreeDate"); },

	get idTREE_IDATE()     { return "bitsTreeDateTreecolDate"; },
	get idTREE_TAB()       { return "mcTreeTabDate"; },
	get idTREE_TABS()      { return "mcTreeTabs"; },

	get TREE_IDATE()       { return document.getElementById(this.idTREE_IDATE); },
	get TREE_TABS()        { return document.getElementById(this.idTREE_TABS); },

	get POPUP()            { return document.getElementById("mcPopupDateFolder"); },

	get SIDEBAR_BOX()      { return document.getElementById("bitsSidebarBox"); },
	get SIDEBAR_TREEVBOX(){ return document.getElementById("mcTreeVBox"); },
	get SIDEBAR_TREETBOX(){ return document.getElementById("mcTreeTabbox"); },
	get SIDEBAR_TREE()     { return document.getElementById("mcTree"); },

	get SIDEBAR()     { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_DOC(){try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},

	get BROADCASTER(){ return window.top.document.getElementById("viewMarkingCollection"); },

	get STRING()     { return window.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},
	get dbinfo()     { return window.top.bitsMarkingCollection.dbinfo; },
	get localfolder(){ return window.top.bitsMarkingCollection.localfolder; },

	get object(){return (this.TREE.currentIndex>=0 ? this.getRowObject(this.TREE.currentIndex) : undefined);},

	get xmldoc()   { return this._xmldoc; },
	get xmlfile()  { return this._xmlfile; },
	get namespace(){ return this._namespace; },
	get ns_alias(){ return this._ns_alias; },

	get isChecked(){ return (this.SIDEBAR_TREETBOX.hidden == false && this.TREE_TABS.selectedItem.id == this.idTREE_TAB)?true:false; },

/////////////////////////////////////////////////////////////////////
	progressListener : {
		QueryInterface : function(aIID){
			if(aIID.equals(Components.interfaces.nsIWebProgressListener) || aIID.equals(Components.interfaces.nsISupportsWeakReference) || aIID.equals(Components.interfaces.nsISupports)) return this;
			throw Components.results.NS_NOINTERFACE;
		},
		onLocationChange : function(webProgress, aRequest, aURI){
			if(webProgress.isLoadingDocument) return;
			bitsTreeDate.pageshow(webProgress.DOMWindow.document);
		},
		onStateChange : function(webProgress, request, stateFlags, status){
			if(webProgress.isLoadingDocument) return;
			bitsTreeDate.pageshow(webProgress.DOMWindow.document);
		},
		onProgressChange : function(){},
		onStatusChange : function(){},
		onSecurityChange : function(){},
		onLinkIconAvailable : function(){}
	},

/////////////////////////////////////////////////////////////////////
	loadxml : function(){
		try{
			var extensionDir = this.Common.getExtensionDir().clone();
			if(extensionDir){
				this._xmlfolder = extensionDir;
				this._xmlfile = extensionDir.clone();
				this._xmlfile.append(this._xmlfilename);
				if(!this._xmlfile.exists()){
					var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
					aContent += '<!DOCTYPE TREEDATES>\n';
					aContent += '<TREEDATES xmlns:WM="'+this.namespace+'"/>\n';
					this.Common.writeFile(this._xmlfile,aContent,"UTF-8");
				}
				if(this._xmlfile.exists()){
					function _loadXMLDocument(pUri){
						if(pUri == undefined) return undefined;
						var xmlDocument = window.top.bitsMarkingCollection.loadXMLDocument(pUri);
						if(xmlDocument){
							return xmlDocument.documentElement;
						}else{
							return undefined;
						}
					}
					function _createXMLDocument(aXMLFile){
						if(!aXMLFile) return undefined;
						try{
							return _loadXMLDocument(bitsTreeDate.Common.IO.newFileURI(aXMLFile).spec);
						}catch(ex){
							bitsTreeDate._dump("bitsTreeDate._createXMLDocument():"+ ex);
							return undefined;
						}
					}
					this._xmldoc = _createXMLDocument(this._xmlfile);
					if(this._xmldoc){
						var nodes =  this.evaluateArray('//TREEDATE[@dbtype]');
						for(var i=nodes.length-1;i>=0;i--){
							nodes[i].parentNode.removeChild(nodes[i]);
						}
					}
				}
			}
		}catch(e){
			this._dump("bitsTreeDate.loadxml():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	xmlflash : function(aTimeout){
		try{
			if(!aTimeout) aTimeout = 0;
			var self = this;
			setTimeout(function(){ self._xmlflash(); },aTimeout);
		}catch(e){
			this._dump("bitsTreeDate.xmlflash():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	_xmlflash : function(aTimeout){
		try{
			if(!this.xmldoc || !this.xmlfile) return;
			var s = new XMLSerializer();
			var xml = s.serializeToString(this.xmldoc);
			this.Common.writeFile(this.xmlfile, xml+"\n","UTF-8");
		}catch(e){
			this._dump("bitsTreeDate._xmlflash():"+e);
		}
	},

/////////////////////////////////////////////////////////////////////
	evaluateArray : function(aExpr){
		return this.XPath.evaluateArray(aExpr,this.xmldoc);
	},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		try{
			if(!this._init){
				var itemview_disp = nsPreferences.getBoolPref("wiredmarker.itemview.disp");
				if(itemview_disp == undefined) itemview_disp = true;
				if(!itemview_disp){
					this.SIDEBAR_TREETBOX.hidden = true;
					this.SIDEBAR_TREEVBOX.appendChild(this.SIDEBAR_TREE);
				}
				if(this.SIDEBAR_TREE.builderView) this.SIDEBAR_TREE.builderView.addObserver(mcTreeDNDHandler.builderObserver);
				this.loadxml();
				this._init = true;
				this.rebuild();
			}
		}catch(e){
			alert(e);
		}
	},

/////////////////////////////////////////////////////////////////////
	disp : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		if(this.SIDEBAR_TREE.builderView) this.SIDEBAR_TREE.builderView.removeObserver(mcTreeDNDHandler.builderObserver);
		this._init = false;
	},

/////////////////////////////////////////////////////////////////////
	treeDispChange : function(){},

/////////////////////////////////////////////////////////////////////
	onChangeListStyle : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onViewTypePopupCommand : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onSearchButtonCommand : function(aEvent){},

/////////////////////////////////////////////////////////////////////
// TREE 表示制御関連
/////////////////////////////////////////////////////////////////////
	get rowCount(){
		return (this.itemObjects?this.itemObjects.length:0);
	},
	getRowObject : function(row){
		return (row>=0 && this.itemObjects && this.itemObjects.length>row ? this.itemObjects[row] : undefined);
	},
	getCellText : function(row,column){
		if(!this.itemObjects || !this.itemObjects[row]) return null;
		return this.itemObjects[row].text;
	},
	setTree: function(treebox){ this.treebox = treebox; },
	isContainer: function(row){
		try{
			return this.itemObjects[row].container;
		}catch(e){
			return false;
		}
	},
	isContainerOpen: function(row){
		return this.itemObjects[row].open;
	},
	isContainerEmpty: function(row){
		return this.itemObjects[row].empty;
	},
	toggleOpenState: function(row){
		this.itemObjects[row].open = !this.itemObjects[row].open;
		var elems =  this.evaluateArray('//TREEDATE[@id="'+this.itemObjects[row].id+'"]');
		if(elems && elems.length){
			elems[0].setAttribute('open',this.itemObjects[row].open);
			this.xmlflash();
		}
		if(this.itemObjects[row].open){
			var splice_pos = row;
			var len = this.itemObjects[row].childlen.length;
			for(var i=0;i<len;i++){
				splice_pos++;
				this.itemObjects.splice(splice_pos,0,this.itemObjects[row].childlen[i]);
				if(this.itemObjects[row].childlen[i].open){
					for(var j=0;j<this.itemObjects[row].childlen[i].childlen.length;j++){
						splice_pos++
						this.itemObjects.splice(splice_pos,0,this.itemObjects[row].childlen[i].childlen[j]);
						if(this.itemObjects[row].childlen[i].childlen[j].open){
							for(var k=0;k<this.itemObjects[row].childlen[i].childlen[j].childlen.length;k++){
								splice_pos++
								this.itemObjects.splice(splice_pos,0,this.itemObjects[row].childlen[i].childlen[j].childlen[k]);
							}
						}
					}
				}
			}
		}else{
			var len = 0;
			for(var i=row+1;i<this.itemObjects.length;i++){
				if(this.itemObjects[row].level >= this.itemObjects[i].level) break;
				len++;
			}
			var remove_arr = this.itemObjects.splice(row+1, len);
		}
		this.TREE.view = this;
	},
  getParentIndex: function(row){
		try{
			return this.itemObjects[row].parentIndex;
		}catch(e){
			return -1;
		}
	},
	hasNextSibling: function(row,afterRow){
this._dump("hasNextSibling("+row+","+afterRow+")");
		return this.itemObjects[row].hasNext;
	},
	isSeparator: function(row){ return false; },
	isSorted: function(){ return true; },
	getLevel: function(row){
		try{
			return this.itemObjects[row].level;
		}catch(e){
			return -1;
		}
	},
	getImageSrc: function(row,column){
		if(!this.itemObjects) return undefined;
		if(!this.itemObjects[row]) return undefined;
		return this.itemObjects[row].icon;
	},
	getRowProperties: function(row,prop){},
	getCellProperties: function(row, column, prop){
		if(row<this.itemObjects.length){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			prop.AppendElement(aserv.getAtom("folder"));
		}
	},
	getColumnProperties: function(column, element, prop){},
	cycleHeader : function(col){},
	isEditable : function(row,column){ return column.editable; },
	setCellText : function(row,column,text){},
	setCellValue : function(row,column,text){},
	canDrop : function(index, orient){ return false; },
	onDrop : function(row, orient){},
	drop : function(row, orient){},

/////////////////////////////////////////////////////////////////////
// Drag & Drop Old Callback functions
/////////////////////////////////////////////////////////////////////
	onOldDraggesture: function(aEvent){
		aEvent.stopPropagation();
	},
	onOldDragover: function(aEvent){
		aEvent.stopPropagation();
	},
	onOldDragdrop: function(aEvent){
		aEvent.stopPropagation();
	},
	onOldDragexit: function(aEvent){
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
// Drag & Drop New Callback functions
/////////////////////////////////////////////////////////////////////
	onDragEvents: function(aEvent){},

	onDragStart : function(event){},

	onDropEvents: function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onBrowserMousedown : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	capture : function(aXferString, aRow, aOrient){},

/////////////////////////////////////////////////////////////////////
	getObjectFromID : function(aID){
		if(this.itemObjects){
			var objects = this.itemObjects.filter(
				function(element, index, array) {
					return element.id == (aID=='0'?'all':aID);
				}
			);
			if(objects && objects.length>0) return objects[0];
		}
		return undefined;
	},

/////////////////////////////////////////////////////////////////////
	refresh : function(){
		if(this._refresh_timer) clearTimeout(this._refresh_timer);
		this._refresh_timer = setTimeout(function(){ bitsTreeDate._refresh(); },100);
	},

	_refresh : function(){
		var idx = this.TREE.currentIndex;
		var rows = this.getSelection();
		this.rebuild();
		try{this.TREE.currentIndex=idx;}catch(e){}
		if(!this.itemObjects) return;
		try{
			var i;
			for(i=0;i<rows.length;i++){
				if(!this.TREE.view.selection.isSelected(rows[i])) this.TREE.view.selection.select(rows[i]);
			}
		}catch(e){}
		bitsItemView.refresh();
	},

	rebuild : function(){
		if(!this._init) return;
		try{this.TREE.currentIndex = -1;}catch(e){}
		try{this.TREE.view.selection.clearSelection();}catch(e){}
		if(this.itemObjects){
			this.itemObjects.length = 0;
		}else{
			this.itemObjects = [];
		}
		var flash_flag = false;
		var elem_id = 'all';
		var obj_db = {
			id : elem_id,
			text : 'All',
			container : true,
			open : true,
			empty : false,
			level : 0,
			parentIndex : -1,
			hasNext : false,
			childlen : []
		};
		var elems =  this.evaluateArray('//TREEDATE[@id="'+elem_id+'"]');
		if(elems && elems.length){
			obj_db.open = (elems[0].getAttribute("open")==="true");
		}else{
			var elem = this.xmldoc.ownerDocument.createElement('TREEDATE');
			elem.setAttribute('id',elem_id);
			elem.setAttribute('open',true);
			this.xmldoc.appendChild(elem);
			flash_flag = true;
		}
		this.itemObjects.push(obj_db);
		var dbtype_pos = this.itemObjects.length-1;
		var objects_year = this.Database.getObjectYear();
		if(objects_year){
			for(var i=0;i<objects_year.length;i++){
				var objects_month = this.Database.getObjectMonthFromYear(objects_year[i]);
				var elem_id = objects_year[i];
				var obj_year = {
					id : elem_id,
					text : objects_year[i],
					date : {
						year : objects_year[i]
					},
					container : true,
					open : false,
					empty : false,
					level : 1,
					parentIndex : dbtype_pos,
					hasNext : (i<objects_year.length-1)?true:false,
					childlen : []
				};
				var elems =  this.evaluateArray('//TREEDATE[@id="'+elem_id+'"]');
				if(elems && elems.length){
					obj_year.open = (elems[0].getAttribute("open")==="true");
				}else{
					var elem = this.xmldoc.ownerDocument.createElement('TREEDATE');
					elem.setAttribute('id',elem_id);
					elem.setAttribute('open',false);
					this.xmldoc.appendChild(elem);
					flash_flag = true;
				}
				if(obj_db.open) this.itemObjects.push(obj_year);
				var len = this.itemObjects.length-1;
				for(var j=0;j<objects_month.length;j++){
					var month_text = (new Date(objects_year[i],objects_month[j]-1,1)).toDateString().replace(/^\w+\s+(\w+)\s+\d+\s+\d+$/,"$1").toUpperCase();
					var elem_id = objects_year[i]+objects_month[j];
					var obj_month = {
						id : elem_id,
						text : month_text,
						date : {
							year  : objects_year[i],
							month : objects_month[j]
						},
						container : true,
						open : false,
						empty : false,
						level : 2,
						parentIndex : i,
						hasNext : (j<objects_month.length-1)?true:false,
						childlen : []
					};
					var elems =  this.evaluateArray('//TREEDATE[@id="'+elem_id+'"]');
					if(elems && elems.length){
						obj_month.open = (elems[0].getAttribute("open")==="true");
					}else{
						var elem = this.xmldoc.ownerDocument.createElement('TREEDATE');
						elem.setAttribute('id',elem_id);
						elem.setAttribute('open',false);
						this.xmldoc.appendChild(elem);
						flash_flag = true;
					}
				if(obj_db.open && obj_year.open) this.itemObjects.push(obj_month);
					var objects_day = this.Database.getObjectDayFromYearMonth(objects_year[i],objects_month[j]);
					if(objects_day){
						for(var k=0;k<objects_day.length;k++){
							var dat_text = objects_day[k];
							var elem_id = objects_year[i]+objects_month[j]+objects_day[k];
							var obj_day = {
								id : elem_id,
								text : dat_text,
								date : {
									year  : objects_year[i],
									month : objects_month[j],
									day   : objects_day[k]
								},
								container : true,
								open : false,
								empty : true,
								level : 3,
								parentIndex : j,
								hasNext : (k<objects_day.length-1)?true:false,
								childlen : []
							};
							var elems =  this.evaluateArray('//TREEDATE[@id="'+elem_id+'"]');
							if(elems && elems.length){
								obj_day.open = (elems[0].getAttribute("open")==="true");
							}else{
								var elem = this.xmldoc.ownerDocument.createElement('TREEDATE');
								elem.setAttribute('id',elem_id);
								elem.setAttribute('open',false);
								this.xmldoc.appendChild(elem);
								flash_flag = true;
							}
							obj_month.childlen.push(obj_day);
							if(obj_db.open && obj_year.open && obj_month.open) this.itemObjects.push(obj_day);
						}
					}
					obj_year.childlen.push(obj_month);
				}
				this.itemObjects[dbtype_pos].childlen.push(obj_year);
			}
		}
		if(flash_flag) this.xmlflash();
		this.TREE.view = this;
	},

/////////////////////////////////////////////////////////////////////
// TREE イベント関連
/////////////////////////////////////////////////////////////////////
	onMousedown : function(aEvent){
		this.TREE.removeAttribute("contextmenu");
		if(aEvent.button == 2){	//右クリック
			var row = {};
			var col = {};
			var obj = {};
			this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
			if(row.value>=0) this.TREE.setAttribute("contextmenu",this.POPUP.id);
		}
	},

	onMousemove : function(aEvent){},

	onMouseout : function(aEvent){},

	onClick : function(aEvent){
		var row = {};
		var col = {};
		var obj = {};
		this.TREE.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
		if(row.value<0){
			this.TREE.view.selection.clearSelection();
			return;
		}
		if(this.itemObjects && this.itemObjects[row.value]){
			var viewmode = mcTreeViewModeService.viewmode;
			var param = {
				viewmode : viewmode,
				dbtype : this.itemObjects[row.value].dbtype,
				where    : []
			};
			if(window.top.bitsMarkingCollection._uncategorized.use){
				param.res = this.Common.RDF.GetResource(this.DataSource.getID2About("0",undefined,window.top.bitsMarkingCollection._uncategorized.dbtype));
			}
			if(this.itemObjects[row.value].date){
				param.where.push({
					key : "substr(om_object.oid_date,7,4)",
					val : this.itemObjects[row.value].date.year
				});
				if(this.itemObjects[row.value].date.month){
					param.where.push({
						key : "substr(om_object.oid_date,1,2)",
						val : this.itemObjects[row.value].date.month
					});
					if(this.itemObjects[row.value].date.day){
						param.where.push({
							key : "substr(om_object.oid_date,4,2)",
							val : this.itemObjects[row.value].date.day
						});
					}
				}
			}
			bitsItemView.onTreeDateClick(param);
			bitsItemView.TREE.currentIndex = 0;
			try{
				if(!bitsItemView.TREE.view.selection.isSelected(bitsItemView.TREE.currentIndex)) bitsItemView.TREE.view.selection.select(bitsItemView.TREE.currentIndex);
				if(bitsItemView.itemObjects && bitsItemView.itemObjects[bitsItemView.TREE.currentIndex]){
					var objs = bitsItemView.Database.getObject({oid:bitsItemView.itemObjects[bitsItemView.TREE.currentIndex].oid}, bitsItemView.itemObjects[bitsItemView.TREE.currentIndex].dbtype);
					if(objs && objs.length>0) mcPropertyView.dispProperty(objs[0]);
				}
			}catch(e){
				this._dump("bitsTreeDate.onClick():"+e);
				setTimeout(function(){
					if(bitsItemView.TREE.view && !bitsItemView.TREE.view.selection.isSelected(bitsItemView.TREE.currentIndex)) bitsItemView.TREE.view.selection.select(bitsItemView.TREE.currentIndex);
					if(bitsItemView.itemObjects && bitsItemView.itemObjects[bitsItemView.TREE.currentIndex]){
						var objs = bitsItemView.Database.getObject({oid:bitsItemView.itemObjects[bitsItemView.TREE.currentIndex].oid}, bitsItemView.itemObjects[bitsItemView.TREE.currentIndex].dbtype);
						if(objs && objs.length>0) mcPropertyView.dispProperty(objs[0]);
					}
				},1000);
			}
		}

		//おまじない
		this.TREE.blur();
		this.TREE.focus();
	},

	onDblClick : function(aEvent){},

	onKeyPress : function(aEvent){},

	onKeyDown : function(aEvent){},

	onSelectTab : function(aObject){
		if(!this._init) return;
		if(bitsItemView.TREE_IFOLDER.hidden) bitsItemView.TREE_IFOLDER.hidden = false;
		if(bitsItemView.TREE_IFOLDERSTYLE.hidden) bitsItemView.TREE_IFOLDERSTYLE.hidden = false;
		var dbtype = undefined;
		if(this.itemObjects && aObject){
			dbtype = aObject.dbtype;
			delete aObject.dbtype;
			var objects = this.Database.getObject(aObject, dbtype);
			if(objects && objects.length>0){
				var year = objects[0].oid_date.substr(6,4);
				var month = objects[0].oid_date.substr(0,2);
				var day = objects[0].oid_date.substr(3,2);
				var len = this.itemObjects.length;
				var exists = false;
				var target_id = year+month+day;
				var id = year+month+day;
				var selectIdx = -1;
				for(var i=0;i<len;i++){
					if(this.itemObjects[i].id != id) continue;
					exists = true;
					selectIdx = i;
					break;
				}
				if(!exists){
					id = year+month;
					for(var i=0;i<len;i++){
						if(this.itemObjects[i].id != id) continue;
						exists = true;
						selectIdx = i;
						break;
					}
				}
				if(!exists){
					id = year;
					for(var i=0;i<len;i++){
						if(this.itemObjects[i].id != id) continue;
						exists = true;
						selectIdx = i;
						break;
					}
				}
				if(selectIdx>=0){
					if(this.isContainer(selectIdx) && !this.isContainerOpen(selectIdx)) this.toggleOpenState(selectIdx);
					if(target_id != id){
						aObject.dbtype = dbtype;
						setTimeout(function(){ bitsTreeDate.onSelectTab(aObject); },100);
						return;
					}else{
						this.TREE.currentIndex = selectIdx;
						if(!this.TREE.view.selection.isSelected(this.TREE.currentIndex)) this.TREE.view.selection.select(this.TREE.currentIndex);
					}
				}
			}
		}
		var idx = this.TREE.currentIndex;
		var rows = this.getSelection();
		if(rows && rows.length && rows[0]<this.rowCount){
			var row = {value:rows[0]};
			var viewmode = mcTreeViewModeService.viewmode;
			var param = {
				viewmode : viewmode,
				dbtype   : this.itemObjects[row.value].dbtype,
				where    : [],
			};
			if(window.top.bitsMarkingCollection._uncategorized.use){
				param.res = this.Common.RDF.GetResource(this.DataSource.getID2About("0",undefined,window.top.bitsMarkingCollection._uncategorized.dbtype));
			}
			if(this.itemObjects && this.itemObjects[row.value]){
				if(this.itemObjects[row.value].date){
					param.where.push({
						key : "substr(om_object.oid_date,7,4)",
						val : this.itemObjects[row.value].date.year
					});
					if(this.itemObjects[row.value].date.month){
						param.where.push({
							key : "substr(om_object.oid_date,1,2)",
							val : this.itemObjects[row.value].date.month
						});
						if(this.itemObjects[row.value].date.day){
							param.where.push({
								key : "substr(om_object.oid_date,4,2)",
								val : this.itemObjects[row.value].date.day
							});
						}
					}
				}
			}
			bitsItemView.onTreeDateClick(param);
		}else{
			bitsItemView.onTreeDateClick();
		}
		if(aObject && aObject.oid){
			setTimeout(function(){ mcItemView.setSelection(aObject.oid,dbtype); },0);
		}else{
			setTimeout(function(){
				if(!bitsItemView.TREE.view) return;
				bitsItemView.TREE.currentIndex = 0;
				if(!bitsItemView.TREE.view.selection.isSelected(bitsItemView.TREE.currentIndex)) bitsItemView.TREE.view.selection.select(bitsItemView.TREE.currentIndex);
				if(bitsItemView.itemObjects && bitsItemView.itemObjects[bitsItemView.TREE.currentIndex]){
					var objs = bitsItemView.Database.getObject({oid:bitsItemView.itemObjects[bitsItemView.TREE.currentIndex].oid}, bitsItemView.itemObjects[bitsItemView.TREE.currentIndex].dbtype);
					if(objs && objs.length>0) mcPropertyView.dispProperty(objs[0]);
				}
			},0);
		}
	},

	onSelectTabs : function(aEvent){
		if(!this._init) return;
		mcPropertyView.dispProperty();
		if(aEvent.target.selectedItem.id == this.idTREE_TAB){
			this.onSelectTab();
		}else{
			mcItemView.onTreeClick();
			mcPropertyView.dispProperty(mcTreeHandler.object);
		}
	},

/////////////////////////////////////////////////////////////////////
// TREE 関連
/////////////////////////////////////////////////////////////////////
	copy : function(aMode){},

	open : function(tabbed){},

	confirmRemovingFor : function(){},

	setSelection : function(aOID,aDBTYPE){},

	getSelection : function(){
		if(!this.TREE || !this.TREE.view) return undefined;
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

	validateMultipleSelection : function(aIdxList){},

	mergeObject : function(aFolder){},

	copyObject : function(aFolder){},

	moveObject : function(aFolder,aModShift){},

	remove : function(aEvent){},

	pageshow : function(aDoc){},

	getElemOffsetHeight : function(elem,height){},

	getElementById : function(pElemId){},

	doTopElement : function(pElemId,aStyle,aID,aDBType){},

	doTopElementIMG : function(aID,aDBType){},

	changeNodeStyleFromID : function(aID,aStyle,pPfid){},

	property : function(){},

////////////////////////////////////////////////////////////////////
// TREE ドラッグイベント関連
/////////////////////////////////////////////////////////////////////
	getModifiers : function(aEvent){},

	dragDropObserver : {
		onDragStart : function(event, transferData, action){},
		getSupportedFlavours : function(){},
		onDragOver : function(event, flavour, session){},
		onDragExit : function(event, session){},
		onDrop     : function(event, transferData, session){}
	},

/////////////////////////////////////////////////////////////////////
// Popup イベント関連
/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent){},

	onPopupHiding : function(aEvent){},

	onPopupCommand : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	onSearchKeyPress : function(aEvent){},


/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
