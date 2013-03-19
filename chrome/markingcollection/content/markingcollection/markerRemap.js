var bitsMarkerRemap = {
	_object : null,
	_resource : null,
	_marker_exp : new RegExp("^"+bitsMarker.id_key+"\\D+\\d+$",""),

	get STRING()     { return document.getElementById("bitsMarkerRemapString"); },
	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get XPath()      { return bitsObjectMng.XPath;      },
	get Database()   { return bitsObjectMng.Database;   },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get CONTENT() { return window.top.document.getElementById("content"); },

	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get mcTreeHandler() {try{return this.SIDEBAR_WIN.mcTreeHandler;}catch(e){return undefined;}},
	get mcMainService() {try{return this.SIDEBAR_WIN.mcMainService;}catch(e){return undefined;}},
	get mcController() {try{return this.SIDEBAR_WIN.mcController;}catch(e){return undefined;}},
	get mcPropertyView() {try{return this.SIDEBAR_WIN.mcPropertyView;}catch(e){return undefined;}},
	get mcTreeViewModeService() {try{return this.SIDEBAR_WIN.mcTreeViewModeService;}catch(e){return undefined;}},
	get bitsItemView() {try{return this.SIDEBAR_WIN.bitsItemView;}catch(e){return undefined;}},

	get TREE_POPUP(){try{return this.SIDEBAR_DOC.getElementById("mcPopup");}catch(e){return undefined;}},
	get TREE_MENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupRemap");}catch(e){return undefined;}},

	get TREEOBJ_POPUP(){try{return this.SIDEBAR_DOC.getElementById("mcPopupObject");}catch(e){return undefined;}},
	get TREEOBJ_MENU(){try{return this.SIDEBAR_DOC.getElementById("mcPopupObjectRemap");}catch(e){return undefined;}},

	get ITEMTREE_POPUP(){try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopup");}catch(e){return undefined;}},
	get ITEMTREE_MENU(){try{return this.SIDEBAR_DOC.getElementById("bitsItemTreePopupRemap");}catch(e){return undefined;}},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){
		try{this.TREE_POPUP.addEventListener("popupshowing",this.popupshowing_tree, false);}catch(e){}
		try{this.TREEOBJ_POPUP.addEventListener("popupshowing",this.popupshowing_treeobj, false);}catch(e){}
		try{this.ITEMTREE_POPUP.addEventListener("popupshowing",this.popupshowing_itemview, false);}catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){
		try{this.TREE_POPUP.removeEventListener("popupshowing",this.popupshowing_tree, false);}catch(e){}
		try{this.TREEOBJ_POPUP.removeEventListener("popupshowing",this.popupshowing_treeobj, false);}catch(e){}
		try{this.ITEMTREE_POPUP.removeEventListener("popupshowing",this.popupshowing_itemview, false);}catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_tree : function(aEvent){
		bitsMarkerRemap._popupshowing_tree(aEvent);
	},
	_popupshowing_tree : function(aEvent){
		this._object = null;
		this.TREE_MENU.hidden = true;
		this._resource = this.mcTreeHandler.resource;
		if(!this._resource) return;
		if(this.DataSource.getProperty(this._resource, "type") != "item") return;
		var object = this.getObjectFromResource(this._resource);
		if(!object) return;
		this.TREE_MENU.hidden = !this.isDispContextmenu(object);
		if(!this.TREE_MENU.hidden){
			this._object = object;
			var parentRes = this.DataSource.findParentResource(this._resource);
			this._object.fid_title = this.DataSource.getProperty(parentRes, "title");
			this._object.fid_style = this.DataSource.getProperty(parentRes, "style");
			this._object.pfid_order = this.DataSource.getProperty(this._resource, "pfid_order");
			if(this._object.pfid_order == "") this._object.pfid_order = 0;
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_treeobj : function(aEvent){
		bitsMarkerRemap._popupshowing_treeobj(aEvent);
	},
	_popupshowing_treeobj : function(aEvent){
		this._object = null;
		this.TREEOBJ_MENU.hidden = true;
		this._resource = this.mcTreeHandler.resource;
		if(!this._resource) return;
		if(this.DataSource.getProperty(this._resource, "type") != "item") return;
		var object = this.getObjectFromResource(this._resource);
		if(!object) return;
		this.TREEOBJ_MENU.hidden = !this.isDispContextmenu(object);
		if(!this.TREEOBJ_MENU.hidden){
			this._object = object;
			var parentRes = this.DataSource.findParentResource(this._resource);
			this._object.fid_title = this.DataSource.getProperty(parentRes, "title");
			this._object.fid_style = this.DataSource.getProperty(parentRes, "style");
			this._object.pfid_order = this.DataSource.getProperty(this._resource, "pfid_order");
			if(this._object.pfid_order == "") this._object.pfid_order = 0;
		}
	},

/////////////////////////////////////////////////////////////////////
	popupshowing_itemview : function(aEvent){
		bitsMarkerRemap._popupshowing_itemview(aEvent);
	},
	_popupshowing_itemview : function(aEvent){
		this._object = null;
		this._resource = null;
		var parentRes = this.mcTreeHandler.resource;
		this.ITEMTREE_MENU.hidden = true;
		var object = this.bitsItemView.object;
		if(!object) return;
		this.ITEMTREE_MENU.hidden = !this.isDispContextmenu(object);
		if(!this.ITEMTREE_MENU.hidden){
			this._object = {};
			for(var key in object){
				this._object[key] = object[key];
			}
			if(this._object.dbtype == bitsMarkingCollection._uncategorized.dbtype && this._object.pfid == 0){
				if(!this._object.fid_title) this._object.fid_title = bitsMarkingCollection._uncategorized.title;
				if(!this._object.fid_style) this._object.fid_style = bitsMarkingCollection._uncategorized.style;
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	getObjectFromResource : function(aRes){
		var oid = this.DataSource.getProperty(aRes, "id");
		var pfid = this.DataSource.getProperty(aRes, "pfid");
		var dbtype = this.DataSource.getProperty(aRes, "dbtype");
		var objects = this.Database.getObject({oid:oid,pfid:pfid}, dbtype);
		if(!objects || objects.length == 0)
			return null;
		else
			return objects[0];
	},

/////////////////////////////////////////////////////////////////////
	isDispContextmenu : function(aObject){
		if(aObject.oid_type != "text") return false;
		var marker_id = bitsMarker.id_key+aObject.dbtype+aObject.oid;
		var exists_doc = false;
		var marker_num = 0;
		for(var i=0;i<this.gBrowser.browsers.length;i++){
			var contentDocument = this.gBrowser.browsers[i].contentDocument;
			var cur_uri = this.Common.getURLStringFromDocument(contentDocument);
			if(cur_uri.indexOf(aObject.con_url)==0){
				exists_doc = !this.gBrowser.browsers[i].webProgress.isLoadingDocument;
				var nodesSnapshot = this.XPath.evaluate('//*[@id="'+marker_id+'"]',contentDocument);
				if(nodesSnapshot && nodesSnapshot.snapshotLength>0) marker_num += nodesSnapshot.snapshotLength;
			}
		}
		return (exists_doc && marker_num==0)?true:false;
	},

/////////////////////////////////////////////////////////////////////
	reMap : function(aEvent){
		if(!this._object) return;
		var findtext = this._object.oid_txt;
		var doc = this.gBrowser.contentDocument;
		var sel = doc.defaultView.getSelection();
		sel.removeAllRanges();
		var findRange = this._getFindRange();
		findRange.caseSensitive = true;
		var docRange = doc.createRange();
		docRange.selectNode(doc.body);
		var startRange = docRange.cloneRange();
		var stopRange = docRange.cloneRange();
		startRange.collapse(true);
		stopRange.collapse(false);
		var ranges = [];
		var result;
		while((result = findRange.Find(findtext, docRange, startRange, stopRange))){
			if(result.endContainer != null &&
				 result.startContainer != null &&
				 result.endContainer.nodeType == Node.TEXT_NODE &&
				 result.startContainer.nodeType == Node.TEXT_NODE &&
				 !this._isNodeInputNodeOrChildOf(result.startContainer) &&
				 !this._isNodeInputNodeOrChildOf(result.endContainer)) {
				if(!((result.startContainer.parentNode && this._marker_exp.test(result.startContainer.parentNode.id)) || (result.endContainer.parentNode && this._marker_exp.test(result.endContainer.parentNode.id)))){
					var obj = {
						startContainer : result.startContainer,
						startOffset    : result.startOffset,
						endContainer   : result.endContainer,
						endOffset      : result.endOffset,
						collapsed      : result.collapsed,
						commonAncestorContainer : result.commonAncestorContainer
					};
					ranges.push(obj);
					sel.addRange(result);
				}
			}
			startRange = result;
			startRange.collapse(false);
		}

		var map = false;
		if(ranges.length==0){
			this.Common.alert(this.STRING.getString("ALERT_FIND_RESULT")+"\n[ "+findtext+" ]");
		}else if(ranges.length==1){
			map = true;
		}else{
			map = this.Common.confirm(this.STRING.getString("CONFIRM_FIND_RESULTS")+" [ "+ranges.length+" ]");
		}
		if(map){
			var style = this._object.fid_style;
			var dbtype = this._object.dbtype;
			var pfid_order = this._object.pfid_order;
			var connect = this.Database._dbConn[dbtype];
			connect.executeSimpleSQL('update om_link set pfid_order=pfid_order+'+ranges.length+' where pfid_order>'+pfid_order);
			var aParName = null;
			var curRelIdx = -1;
			if(!this.bitsItemView || !this.bitsItemView.isChecked){
				var f_pfid = undefined;
				var rtnFolder = this.Database.getFolder({fid:this._object.pfid},dbtype);
				if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
				rtnFolder = undefined;
				aParName = this.DataSource.getID2About(this._object.pfid,f_pfid,dbtype);
				curRelIdx = this.DataSource.getRelativeIndex(this.Common.RDF.GetResource(aParName), this._resource);
			}
			sel.removeAllRanges();
			var parser = new DOMParser();
			var xmlSerializer = new XMLSerializer();
			for(var i=0;i<ranges.length;i++){
				var range = doc.createRange();
				range.setStart(ranges[i].startContainer, ranges[i].startOffset);
				range.setEnd(ranges[i].endContainer, ranges[i].endOffset);
				var startContainer = range.startContainer;
				var startOffset = range.startOffset;
				var endContainer = range.endContainer;
				var endOffset = range.endOffset;
				var stXPath = this.XPath.getOffsetFromParentNode(startContainer,startOffset);
				var enXPath = this.XPath.getOffsetFromParentNode(endContainer,endOffset);
				try{
					var hyperAnchor =  bitsHyperAnchor._getAnchorURL({node:startContainer,offset:startOffset,style:style,prefix:"b",contents:range.toString()},{node:endContainer,offset:endOffset,prefix:"e",contents:range.toString()});
				}catch(ex3){
					try{
						var hyperAnchor =  bitsHyperAnchorDummy._getAnchorURL({node:startContainer,offset:startOffset,style:style,prefix:"b",contents:range.toString()},{node:endContainer,offset:endOffset,prefix:"e",contents:range.toString()});
					}catch(ex3){
						hyperAnchor = null;
					}
				}
				hyperAnchor = bitsAutocacheService.convertCacheURLToOriginalURL(hyperAnchor);
				var rObj = this.Database.newObject();
				for(var key in rObj){
					if(key == "oid") continue;
					if(this._object[key] != undefined) rObj[key] = this._object[key];
				}
				rObj.bgn_dom = stXPath.xpath + "("+stXPath.offset+")" + "("+stXPath.type+")";
				rObj.end_dom = enXPath.xpath + "("+enXPath.offset+")" + "("+enXPath.type+")";
				if(!rObj.oid_property || rObj.oid_property == "") rObj.oid_property = "<PROPERTY></PROPERTY>";
				var xmldoc = parser.parseFromString(rObj.oid_property,"text/xml");
				if(xmldoc){
					if(xmldoc.documentElement){
						if(hyperAnchor){
							var xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
							if(!xmlnode) xmlnode = xmldoc.createElement("HYPER_ANCHOR");
							if(xmlnode){
								while(xmlnode.hasChildNodes()){ xmlnode.removeChild(xmlnode.lastChild); }
								xmlnode.appendChild(xmldoc.createTextNode(hyperAnchor));
								xmldoc.documentElement.appendChild(xmlnode);
							}
						}else{
							var xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
							if(xmlnode) xmlnode.parentNode.removeChild(xmlnode);
						}
					}
					rObj.oid_property = xmlSerializer.serializeToString(xmldoc);
					xmldoc = undefined;
				}
				rObj.pfid_order = ++pfid_order;
				var rtn = this.Database.addObject(rObj,dbtype);
				if(!rtn) rObj = undefined;
				if(!rObj) continue;
				var con_doc = stXPath.node.ownerDocument;
				var rtnContent = bitsMarker.xPathMarker(
					con_doc,
					{
						start   : rObj.bgn_dom,
						end     : rObj.end_dom,
						context : this.Common.exceptCode(rObj.oid_txt.replace(/\s+$/mg,"").replace(/^\s+/mg,"")),
						con_url : this.Common.getURLStringFromDocument(con_doc)
					},
					{
						id     : rObj.oid,
						dbtype : dbtype,
						pfid   : rObj.pfid,
						style  : style
					}
				);
				if(rtnContent){
					if(this.bitsItemView && this.bitsItemView.isChecked) continue;
					this.DataSource.addItem(this.Database.makeObjectToItem(rObj), aParName, ++curRelIdx, dbtype);
					this.mcTreeHandler.TREE.builder.rebuild();
				}
			}
			parser = undefined;
			xmlSerializer = undefined;
			if(this.Database.removeObject(this._object,dbtype)){
				if(this._resource){
					this.DataSource.deleteItem(this._resource);
					this.DataSource.flush();
					this.mcTreeHandler.TREE.builder.rebuild();
				}
				var records = [];
				var statement = connect.createStatement('select oid,pfid from om_link order by pfid_order');
				var columnNames = [];
				var i;
				var k=statement.columnCount
				var col_name;
				for(i=0;i<k;i++){
					columnNames.push(statement.getColumnName(i));
				}
				try{
					while(statement.executeStep()){
						var row = {};
						for(i=0;i<k;i++){
							if(statement.getIsNull(i)){
								row[columnNames[i]] = null;
							}else{
								row[columnNames[i]] = statement.getUTF8String(i);
							}
						}
						records.push(row);
					}
				}
				finally {
					statement.reset();
					statement = undefined;
				}
				if(records.length>0){
					var result = true;
					connect.beginTransaction();
					try{
						var sql = 'update om_link set pfid_order=?1 where oid=?2 and pfid=?3';
						var statement = connect.createStatement(sql);
						for(i=0,k=records.length;i<k;i++){
							var pfid_order = i+1;
							this.Database._setStatementValue(statement,0,pfid_order);
							this.Database._setStatementValue(statement,1,records[i].oid);
							this.Database._setStatementValue(statement,2,records[i].pfid);
							statement.execute();
							statement.reset();
						}
						statement = undefined;
					}catch(e){
						this._dump(e);
						result = false;
					}finally {
						if(connect.lastError){
							this._dump(connect.lastErrorString+" ("+connect.lastError+")");
							this._dump("sql="+sql);
							result = false;
						}
					}
					if(result){
						connect.commitTransaction();
					}else{
						connect.rollbackTransaction();
					}
				}
			}
			this.Common.alert(this.STRING.getString("ALERT_MAP_RESULT"));
		}
		sel.removeAllRanges();
	},

/////////////////////////////////////////////////////////////////////
	_getFindRange : function(){
		var findRange = Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance();
		if(!findRange || !(findRange instanceof Components.interfaces.nsIFind)) return undefined;
		findRange.caseSensitive = false;
		findRange.findBackwards = false;
		return findRange;
	},

/////////////////////////////////////////////////////////////////////
	_isWordCharacter : function(ch){
		if(ch == null ||  typeof ch != "string" || ch.length != 1) return false;
		var code = ch.charCodeAt(0);
		return code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 138 && code <= 142 || code >= 154 && code <= 159 || code >= 192 && code <= 255;
	},

/////////////////////////////////////////////////////////////////////
	_isNodeInputNodeOrChildOf : function(node){
		if(node.nodeName.toUpperCase() == "INPUT") return true;
		if(node.parentNode != null) return this._isNodeInputNodeOrChildOf(node.parentNode);
		return false;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
}
