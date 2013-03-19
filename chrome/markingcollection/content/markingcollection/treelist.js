var bitsTreeListService = {
	_openurl : "",
	_doc     : null,
	_loaddoc : null,
	_url     : "",
	_fileid  : "",
	_click_oid : "",
	_click_dbtype : "",
	_timerid : null,
	_reload_timer : null,
	_listview_drag : 'chrome://markingcollection/content/listview_drag.xsl',

/////////////////////////////////////////////////////////////////////
	get CLASS_POPUP() { return window.top.document.getElementById("bitsTreeListContextmenu"); },

/////////////////////////////////////////////////////////////////////
	get STRING() { return document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get XPath()      { return bitsObjectMng.XPath;      },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get mcTreeHandler() {try{return this.SIDEBAR_WIN.mcTreeHandler;}catch(e){return undefined;}},
	get mcPropertyView() {try{return this.SIDEBAR_WIN.mcPropertyView;}catch(e){return undefined;}},
	get bitsTreeDate() {try{return this.SIDEBAR_WIN.bitsTreeDate;}catch(e){return undefined;}},

/////////////////////////////////////////////////////////////////////
	init : function(){
		this.gBrowser.addEventListener("pageshow", this.load, true);
		this.gBrowser.addEventListener("pagehide", this.unload, true);
		if(this._fileid == "") this._fileid = this.Common.getTimeStamp();
		if(this.gBrowser.browsers.length>0){
			var i;
			for(i=0;i<this.gBrowser.browsers.length;i++){
				var doc = this.gBrowser.browsers[i].contentDocument;
				doc.defaultView.addEventListener("click", bitsTreeListService.click, false);
			}
		}
		//古いリスト表示用のStyleSheetを削除
		try{
			var sendDir  = this.getTemplateDir();
			var dir = this.getDefaultTemplateDir();
			if(dir.exists()){
				var entries = dir.directoryEntries;
				while(entries.hasMoreElements()){
					var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					if(!entry.isFile()) continue;
					var sendFile = sendDir.clone();
					sendFile.append(entry.leafName);
					if(sendFile.exists() && sendFile.lastModifiedTime > entry.lastModifiedTime) continue;
					if(sendFile.exists()) sendFile.remove(false);
				}
			}
		}catch(ex){
			this._dump("bitsTreeListService.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(){
		try{
			var cur_uri = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			var basedir = this.getBaseDir();
			var res_uri = this.Common.convertFilePathToURL(basedir.path);
			this.gBrowser.removeEventListener("pageshow", this.load, true);
			this.gBrowser.removeEventListener("pagehide", this.unload, true);
			if(this.gBrowser.browsers.length>0){
				var i;
				for(i=0;i<this.gBrowser.browsers.length;i++){
					var doc = this.gBrowser.browsers[i].contentDocument;
					if(!doc) continue;
					try{ doc.defaultView.removeEventListener("click", bitsTreeListService.click, false); }catch(e){}
					if(this._click_oid){
						var elemid = "divIMG"+this._click_oid;
						var divElem = doc.getElementById(elemid);
						if(divElem){
							divElem.style.display = "none";
							divElem.parentNode.removeChild(divElem);
						}
					}
					var cur_uri = this.Common.getURLStringFromDocument(doc);
					if(cur_uri.indexOf(res_uri)>=0) this.gBrowser.removeTab(this.gBrowser.tabContainer.getItemAtIndex(i));
				}
			}
		}catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	load : function(aEvent){
		var url = bitsTreeListService.Common.getURLStringFromDocument(aEvent.target);
		if(url.indexOf(bitsTreeListService._openurl) < 0) return;
		aEvent.target.defaultView.addEventListener("click", bitsTreeListService.click, false);
	},

/////////////////////////////////////////////////////////////////////
	unload : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	removeClass : function(aEvent){
		if(!this._classEditNode) return;
		var fid = this._classEditNode.getAttribute("fid");
		var oid = this._classEditNode.getAttribute("oid");
		var dbtype = this._classEditNode.getAttribute("dbtype");
		if(fid && fid == '') fid = undefined;
		if(oid && oid == '') oid = undefined;
		if(dbtype && dbtype == '') dbtype = undefined;
		if(!fid || !oid || !dbtype) return;

		var contentWindow = null;
		var bitsItemView = null;
		var mcTreeDNDHandler = null;
		var mcTreeCssService = null;
		var mcController = null;
		if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
		if(contentWindow && contentWindow.bitsItemView) bitsItemView = contentWindow.bitsItemView;
		if(contentWindow && contentWindow.mcTreeDNDHandler) mcTreeDNDHandler = contentWindow.mcTreeDNDHandler;
		if(contentWindow && contentWindow.mcTreeCssService) mcTreeCssService = contentWindow.mcTreeCssService;
		if(contentWindow && contentWindow.mcController) mcController = contentWindow.mcController;

		var rtn = this.Database.removeLink({oid:oid,pfid:fid},dbtype);
		var rtnObj = this.Database.getObject({oid:oid},dbtype);
		if(rtnObj && rtnObj.length == 1 && !rtnObj[0].pfid){
			var aObject = undefined;
			var objs = this.Database.getObjectWithProperty({oid:oid},dbtype);
			if(objs && objs.length>0) aObject = objs[0];
			if(aObject){
				var blobs =this.Database.getObjectBLOB(aObject.oid,aObject.dbtype);
				var addObj = this.Database.newObject(aObject.oid,bitsMarkingCollection._uncategorized.dbtype);
				var key;
				for(key in aObject){
					if(key == "oid") continue;
					addObj[key] = aObject[key];
				}
				var pfid = "0";
				var pfid_order = this.Database.getMaxOrderFormPID(pfid,bitsMarkingCollection._uncategorized.dbtype);
				addObj.pfid = pfid;
				addObj.pfid_order = ++pfid_order;
				delete addObj.dbtype;
				delete addObj.fid_style;
				rtn = this.Database.addObject(addObj,bitsMarkingCollection._uncategorized.dbtype);
				if(rtn && blobs && blobs.length>0){
					this.Database.updateObjectBLOB(addObj.oid,blobs[0],bitsMarkingCollection._uncategorized.dbtype);
				}
				if(rtn) rtn = this.Database.removeObject({oid:oid},dbtype);

				if(rtn){
					if(bitsItemView && bitsItemView.isChecked){
						var source = bitsMarker.id_key+dbtype+oid;
						this.Common.changeNodeStyleFromID(source,bitsMarkingCollection._uncategorized.style,0,addObj.oid,bitsMarkingCollection._uncategorized.dbtype);
					}else{
						var f_pfid = undefined;
						var rtnFolder = this.Database.getFolder({fid:fid},dbtype);
						if(rtnFolder && rtnFolder.length) f_pfid = rtnFolder[0].pfid;
						rtnFolder = undefined;
						var dst_fid = pfid;
						var dst_dbtype = bitsMarkingCollection._uncategorized.dbtype;
						var dstAbout = this.DataSource.getID2About(dst_fid,undefined,dst_dbtype);
						var dstRes = this.Common.RDF.GetResource(dstAbout);
						var srcPRes = this.Common.RDF.GetResource(this.DataSource.getID2About(fid,f_pfid,dbtype));
						var srcAbout = this.DataSource.getID2About(oid,fid,dbtype);
						var srcRes = this.Common.RDF.GetResource(srcAbout);
						if(this.DataSource.moveItem(srcRes, srcPRes, dstRes, -1)){
							this.DataSource.setProperty(srcRes, "dbtype", dst_dbtype);
							this.DataSource.setProperty(srcRes, "pfid", dst_fid);
							this.DataSource.setProperty(srcRes, "id", addObj.oid);
							this.DataSource.setID2About(oid,pfid,undefined,dbtype);
							this.DataSource.setID2About(addObj.oid,dst_fid,srcAbout,dst_dbtype);
							if(mcTreeDNDHandler) mcTreeDNDHandler.changeNodeStyle(srcRes);
							this.DataSource.flush();
							if(mcTreeCssService) mcTreeCssService.init();
							if(mcController) mcController.rebuildLocal();
						}
					}
				}
			}
		}else if(rtnObj && rtnObj.length>0 && (bitsItemView && !bitsItemView.isChecked)){
			var srcAbout = this.DataSource.getID2About(oid,fid,dbtype);
			var srcRes = this.Common.RDF.GetResource(srcAbout);
			if(srcRes && this.DataSource.deleteItem(srcRes)){
				if(mcTreeDNDHandler) mcTreeDNDHandler.changeNodeStyle(srcRes);
				this.DataSource.flush();
				if(mcTreeCssService) mcTreeCssService.init();
				if(mcController) mcController.rebuildLocal();
			}
		}
		if(bitsItemView && bitsItemView.isChecked) bitsItemView.refresh();
		this.reload(this._classEditNode.ownerDocument);
	},

/////////////////////////////////////////////////////////////////////
	reload : function(aDocument){
		if(bitsTreeListService._reload_timer) clearTimeout(bitsTreeListService._reload_timer);
		if(aDocument){
			bitsTreeListService._reload_timer = setTimeout(function(){ bitsTreeListService._reload(aDocument);} ,500);
		}else{
			bitsTreeListService._reload(aDocument);
		}
	},
	_reload : function(aDocument){
		if(!aDocument){
			var basedir = this.getBaseDir();
			var res_uri = this.Common.convertFilePathToURL(basedir.path);
			for(var i=0;i<this.gBrowser.browsers.length;i++){
				var doc = this.gBrowser.browsers[i].contentDocument;
				var cur_uri = this.Common.getURLStringFromDocument(doc);
				if(cur_uri.indexOf(res_uri)>=0) this.reload(doc);
			}
			return;
		}
		var param = null;
		var xslpath = undefined;
		var _fileid = undefined;
		var xPathResult = this.XPath.evaluate('//meta[@name]',aDocument);
		for(var k=0;k<xPathResult.snapshotLength;k++){
			var node = xPathResult.snapshotItem(k);
			var name = node.getAttribute('name');
			if(name == 'fid'){
				var content = node.getAttribute('content');
				if(content != "0"){
					if(content.length<=8){
						var year = content.substr(0,4);
						var month = content.substr(4,2);
						var day = content.substr(6,2);
						if(year){
							if(!param) param = {};
							param.date = {};
							param.date.year = year;
						}
						if(year && month) param.date.month = month;
						if(year && month && day) param.date.day = day;
					}else if(content.match(/^\d+$/) && content.length==14){
						if(!param) param = {};
						param.fid = content;
					}
				}
			}else if(name == 'dbtype'){
				var dbtype = node.getAttribute('content');
				if(dbtype && dbtype != ''){
					if(!param) param = {};
					param.dbtype = node.getAttribute('content');
				}
			}else if(name == 'xslpath'){
				xslpath = node.getAttribute('content');
				if(xslpath && xslpath == '') xslpath = undefined;
			}else if(name == '_fileid'){
				_fileid = node.getAttribute('content');
			}
		}
		if(param){
			if(xslpath != bitsTreeListService._listview_drag && !param.fid && param.dbtype) param.fid = "0";
			if(param.fid){
				param.fid_title = aDocument.title;
				window.top.bitsTreeListService.dispList_proc(param,xslpath,_fileid);
			}else{
				param.text = aDocument.title;
				window.top.bitsTreeListService.dispTreeDateList(param,xslpath,_fileid);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	click : function(aEvent){
		try{
			var cur_uri = bitsTreeListService.Common.getURLStringFromDocument(aEvent.target.ownerDocument);
			var basedir = bitsTreeListService.getBaseDir();
			var res_uri = bitsTreeListService.Common.convertFilePathToURL(basedir.path);
			if(cur_uri.indexOf(res_uri)<0) return;
		}catch(e){
			bitsTreeListService._dump("bitsTreeListService.click():"+e);
			return;
		}
		bitsTreeListService._classEditNode = null;
		if(
			aEvent.target.className == "class" &&
			(aEvent.target.nodeName == "SPAN" || aEvent.target.nodeName == "DIV") &&
			aEvent.target.hasAttribute("fid") &&
			aEvent.target.hasAttribute("oid") &&
			aEvent.target.hasAttribute("dbtype")
		){
			var xPathResult = bitsTreeListService.XPath.evaluate('//meta[@name="xslpath"]', aEvent.target.ownerDocument);
			if(xPathResult && xPathResult.snapshotLength>0){
				var node = xPathResult.snapshotItem(0);
				if(node.getAttribute('content') == bitsTreeListService._listview_drag) bitsTreeListService._classEditNode = aEvent.target;
			}
			xPathResult = undefined;
		}
		if(bitsTreeListService._classEditNode){
			if(bitsTreeListService.CLASS_POPUP.openPopupAtScreen){
				bitsTreeListService.CLASS_POPUP.openPopupAtScreen(aEvent.screenX,aEvent.screenY,true);
			}else{
				var elem = document.getElementById("content");
				bitsTreeListService.CLASS_POPUP.showPopup(elem,aEvent.layerX+elem.boxObject.x,aEvent.layerY+6,"context","topleft","bottomright");
			}
			return;
		}else{
			bitsTreeListService.CLASS_POPUP.hidePopup();
		}
		var elem = aEvent.target;
		var edit = elem.getAttribute("edit");
		var select = elem.getAttribute("select");
		var edit_text = "";
		var edit_elem = undefined;
		var select_elem = undefined;
		if((!select || select != "true") && elem.firstChild){
			var cElem = elem.firstChild;
			for(;cElem;cElem = cElem.nextSibling){
				if(!cElem || !cElem.getAttribute) continue;
				select = cElem.getAttribute("select");
				if(select != "true") continue;
				select_elem = cElem;
				break;
			}
		}else{
			select_elem = elem;
		}
		if((!edit || edit != "true") && elem.firstChild){
			var cElem = elem.firstChild;
			for(;cElem;cElem = cElem.nextSibling){
				if(!cElem || !cElem.getAttribute) continue;
				edit = cElem.getAttribute("edit");
				if(edit != "true") continue;
				edit_elem = cElem;
				break;
			}
		}else{
			edit_elem = elem;
		}
		if(!edit_elem && !select_elem){
			var targetWindow = bitsTreeListService.Common.getFocusedWindow();
			var selection = targetWindow.getSelection();
			selection.removeAllRanges();
			return;
		}
		var oid = edit_elem.getAttribute("oid");
		var dbcolumn = edit_elem.getAttribute("dbcolumn");
		if(!dbcolumn) dbcolumn = edit_elem.getAttribute("type");
		var dbtype = edit_elem.getAttribute("dbtype");
		if(select == "true" && select_elem){
			var value = edit_elem.getAttribute("value");
			if(!value || value == ""){
				var pfid = edit_elem.getAttribute("pfid");
				value = bitsTreeListService.DataSource.getID2About(oid,pfid,dbtype);
			}
			var res = bitsTreeListService.Common.RDF.GetResource(value);
			var resArr = [];
			var parentRes = res;
			do{
				parentRes = bitsTreeListService.DataSource.findParentResource(parentRes);
				if(parentRes) resArr.push(parentRes);
			}while(parentRes && parentRes.Value != bitsTreeListService.DataSource.ABOUT_ROOT);
			var mcTreeHandler = this.mcTreeHandler;
			if(mcTreeHandler){
				for(var i=resArr.length-1;i>=0;i--){
					var selectIdx = mcTreeHandler.TREE.builderView.getIndexOfResource(resArr[i]);
					if(selectIdx>=0 && !mcTreeHandler.TREE.view.isContainerOpen(selectIdx)) mcTreeHandler.TREE.view.toggleOpenState(selectIdx);
				}
				var idx = mcTreeHandler.TREE.builderView.getIndexOfResource(res);
				if(idx>=0){
					mcTreeHandler.TREE.currentIndex = idx;
					if(!mcTreeHandler.TREE.view.selection.isSelected(mcTreeHandler.TREE.currentIndex)) mcTreeHandler.TREE.view.selection.select(mcTreeHandler.TREE.currentIndex);
					mcTreeHandler.TREE.focus();
					mcTreeHandler.TREE.treeBoxObject.ensureRowIsVisible(idx);
					this.mcPropertyView.dispProperty(mcTreeHandler.object);
				}
			}
		}
		if(edit != "true" || !edit_elem) return;
		if(edit_elem.nodeName == "IMG"){
			var elemid = "image"+oid;
			edit_elem.setAttribute("id", elemid); 
			var orgIMG = new Image();
			if(!orgIMG) return;
			orgIMG.src = edit_elem.src;
			orgIMG.onload = function(){
				var elemid = "divIMG"+oid;
				var divElem = elem.ownerDocument.getElementById(elemid);
				if(!divElem){
					divElem = elem.ownerDocument.createElement("div");
					if(divElem){
						divElem.setAttribute("id",elemid);
						divElem.addEventListener("mouseout", bitsTreeListService.mouseoutIMG, false);
						edit_elem.parentNode.appendChild(divElem);
					}
				}
				if(!divElem) return;
				var style = "position:absolute;left:"+edit_elem.x+"px;top:"+edit_elem.y+"px;width:"+ edit_elem.width +"px;height:"+ edit_elem.height +"px;"
				style += "border:1px solid blue;";
				divElem.setAttribute("style", style); 
				var btn1id = "btn1IMG"+oid;
				var btn1Elem = elem.ownerDocument.getElementById(btn1id);
				if(!btn1Elem){
					btn1Elem = elem.ownerDocument.createElement("img");
					if(btn1Elem){
						btn1Elem.setAttribute("id",btn1id);
						btn1Elem.setAttribute("oid", oid);
						btn1Elem.setAttribute("dbtype", dbtype);
						btn1Elem.src = "chrome://markingcollection/skin/twisty-clsd.png";
						btn1Elem.addEventListener("click", bitsTreeListService.resizeIMG_P, false);
						divElem.appendChild(btn1Elem);
					}
				}
				if(!btn1Elem) return;
				var style = "position:absolute;left:2px;top:1px;"
				if(edit_elem.width>=orgIMG.width && edit_elem.height>=orgIMG.height){
					style += "opacity:0.3;";
				}else{
					style += "cursor:pointer;";
				}
				btn1Elem.setAttribute("style", style);
				var btn2id = "btn2IMG"+oid;
				var btn2Elem = elem.ownerDocument.getElementById(btn2id);
				if(!btn2Elem){
					btn2Elem = elem.ownerDocument.createElement("img");
					if(btn2Elem){
						btn2Elem.setAttribute("id",btn2id);
						btn2Elem.setAttribute("oid", oid);
						btn2Elem.setAttribute("dbtype", dbtype);
						btn2Elem.src = "chrome://markingcollection/skin/twisty-open.png";
						btn2Elem.addEventListener("click", bitsTreeListService.resizeIMG_M, false);
						divElem.appendChild(btn2Elem);
					}
				}
				if(!btn2Elem) return;
				var style = "position:absolute;left:13px;top:1px;"
				if(edit_elem.width<=100 && edit_elem.height<=100){
					style += "opacity:0.3;";
				}else{
					style += "cursor:pointer;";
				}
				btn2Elem.setAttribute("style", style); 
				if(bitsTreeListService._click_oid != "" && bitsTreeListService._click_oid != oid){
					var elemid = "divIMG"+bitsTreeListService._click_oid;
					var oldElem = elem.ownerDocument.getElementById(elemid);
					if(oldElem) oldElem.style.display = "none";
				}
				bitsTreeListService._click_oid = oid;
				bitsTreeListService._click_dbtype = dbtype;
				divElem.style.display = "";
			}
			return;
		}
		var nodeWalker = edit_elem.ownerDocument.createTreeWalker(edit_elem,NodeFilter.SHOW_TEXT,null,false);
		var txtNode=nodeWalker.nextNode(); 
		for(;txtNode;txtNode = nodeWalker.nextNode()){
			edit_text += txtNode.nodeValue;
		}
		var elemid = dbcolumn+oid;
		var textElem = elem.ownerDocument.getElementById(elemid);
		if(!textElem) textElem = elem.ownerDocument.createElement("textarea");
		if(!textElem) return;
		textElem.setAttribute("id",elemid);
		textElem.setAttribute("wrap","soft");
		textElem.setAttribute("style","font-family:arial;font-size:0.9em;width:"+(edit_elem.parentNode.offsetWidth-3)+"px;height:"+(edit_elem.parentNode.offsetHeight-3)+"px;min-height:3em;");
		textElem.setAttribute("oid",oid);
		textElem.setAttribute("dbcolumn",dbcolumn);
		textElem.setAttribute("dbtype",dbtype);
		textElem.defaultValue = edit_text;
		textElem.value = edit_text;
		edit_elem.parentNode.insertBefore(textElem,edit_elem);
		edit_elem.style.display = "none";
		textElem.focus();
		textElem.select();
		textElem.addEventListener("blur", bitsTreeListService.blur, false);
	},

/////////////////////////////////////////////////////////////////////
	mouseoutIMG : function(aEvent){
		try{
			var elem = aEvent.target;
			if(elem.nodeName != "DIV") return;
			if(elem.offsetLeft <= aEvent.pageX && aEvent.pageX < (elem.offsetLeft+elem.offsetWidth) &&
				 elem.offsetTop  <= aEvent.pageY && aEvent.pageY < (elem.offsetTop +elem.offsetHeight)) return;
			elem.style.display = "none";
			bitsTreeListService._click_oid = "";
			bitsTreeListService._click_dbtype = "";
		}catch(ex){
			elem.style.display = "none";
			try{
				bitsTreeListService._click_oid = "";
				bitsTreeListService._click_dbtype = "";
			}catch(ex2){}
		}
	},

/////////////////////////////////////////////////////////////////////
	resizeIMG_P : function(aEvent){
		try{
			var elem = aEvent.target;
			var oid = elem.getAttribute("oid");
			var dbtype = elem.getAttribute("dbtype");
			var elemid = "image"+oid;
			var imgElem = elem.ownerDocument.getElementById(elemid);
			if(!imgElem) return;
			var orgIMG = new Image();
			if(!orgIMG) return;
			orgIMG.src = imgElem.src;
			orgIMG.onload = function(){
				var elemid = "divIMG"+oid;
				var divElem = elem.ownerDocument.getElementById(elemid);
				if(!divElem) return;
				var width = parseInt(divElem.offsetWidth * 1.1);
				var height = parseInt(divElem.offsetHeight * 1.1);
				if(orgIMG.width>0 && width>orgIMG.width) width = orgIMG.width;
				if(orgIMG.height>0 && height>orgIMG.height) height = orgIMG.height;
				divElem.style.width = width + "px";
				divElem.style.height = height + "px";
				if(bitsTreeListService._timerid) clearTimeout(bitsTreeListService._timerid);
				bitsTreeListService._timerid = setTimeout(bitsTreeListService.updateDBImageSize,1000,elem.ownerDocument,oid,dbtype,width,height);
			}
		}catch(ex){
			bitsTreeListService._dump("bitsTreeListService.resizeIMG_P():"+ex);
		}
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	resizeIMG_M : function(aEvent){
		try{
			var elem = aEvent.target;
			var oid = elem.getAttribute("oid");
			var dbtype = elem.getAttribute("dbtype");
			var elemid = "divIMG"+oid;
			var divElem = elem.ownerDocument.getElementById(elemid);
			if(!divElem) return;
			var width = parseInt(divElem.offsetWidth * 0.9);
			var height = parseInt(divElem.offsetHeight * 0.9);
			if(width<100 && height<100){
			}else{
				divElem.style.width = width + "px";
				divElem.style.height = height + "px";
			}
			if(bitsTreeListService._timerid) clearTimeout(bitsTreeListService._timerid);
			bitsTreeListService._timerid = setTimeout(bitsTreeListService.updateDBImageSize,1000,elem.ownerDocument,oid,dbtype,width,height);
		}catch(ex){
			bitsTreeListService._dump("bitsTreeListService.resizeIMG_M():"+ex);
		}
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	updateDBImageSize : function(aDoc,oid,dbtype,width,height){
		try{
			if(bitsTreeListService._timerid){
				clearTimeout(bitsTreeListService._timerid);
				bitsTreeListService._timerid = null;
			}
			var elemid = "image"+oid;
			var imgElem = aDoc.getElementById(elemid);
			if(!imgElem) return;
			var orgIMG = new Image();
			if(!orgIMG) return;
			var elemid = "divIMG"+oid;
			var divElem = aDoc.getElementById(elemid);
			if(!divElem) return;
			divElem.style.display = "none";
			orgIMG.src = imgElem.src;
			orgIMG.onload = function(){
				if(width<100 && height<100){
					if(orgIMG.width>width && orgIMG.height>height){
						if(orgIMG.width>orgIMG.height){
							width  = 100;
							height = parseInt((orgIMG.height*100)/orgIMG.width);
						}else{
							width = parseInt((orgIMG.width*100)/orgIMG.height);
							height  = 100;
						}
						imgElem.style.maxWidth = width + "px";
						imgElem.style.maxHeight = height + "px";
						imgElem.width = width;
						imgElem.height = height;
					}else{
						imgElem.style.maxWidth = "100px";
						imgElem.style.maxHeight = "100px";
					}
				}else{
					imgElem.style.maxWidth = width + "px";
					imgElem.style.maxHeight = height + "px";
					imgElem.width = width;
					imgElem.height = height;
				}
				var rtnObj = bitsTreeListService.Database.getObject({oid:oid},dbtype);
				if(rtnObj){
					var value = imgElem.width.toString() + "," + imgElem.height.toString();
					var newObj = {oid:rtnObj[0].oid};
					newObj.oid_property = rtnObj[0].oid_property;
					newObj.oid_property = newObj.oid_property.replace(/[\r\n\t]/mg," __BR__ ");
					if(newObj.oid_property.match(/^(.*<IMG_LIST_DISP_SIZE>)(.*?)(<\/IMG_LIST_DISP_SIZE>.*)$/m)){
						newObj.oid_property = RegExp.$1 + value + RegExp.$3;
					}else if(newObj.oid_property.match(/^(<PROPERTY>)(.*<\/PROPERTY>)$/m)){
						newObj.oid_property = RegExp.$1 + "<IMG_LIST_DISP_SIZE>" + value + "</IMG_LIST_DISP_SIZE>" + RegExp.$2;
					}else{
						newObj.oid_property = "<PROPERTY><IMG_LIST_DISP_SIZE>" + value + "</IMG_LIST_DISP_SIZE></PROPERTY>";
					}
					newObj.oid_property = newObj.oid_property.replace(/ __BR__ /mg,"\n");
					bitsTreeListService.Database.updateObject(newObj,dbtype);
				}
				var elemid = "divIMG"+oid;
				var divElem = aDoc.getElementById(elemid);
				if(divElem){
					var style = "position:absolute;left:"+imgElem.x+"px;top:"+imgElem.y+"px;width:"+ imgElem.width +"px;height:"+ imgElem.height +"px;"
					style += "border:1px solid blue;";
					divElem.setAttribute("style", style); 
					var btn1id = "btn1IMG"+oid;
					var btn1Elem = aDoc.getElementById(btn1id);
					if(btn1Elem){
						var style = "position:absolute;left:2px;top:1px;"
						if(imgElem.width>=orgIMG.width && imgElem.height>=orgIMG.height){
							style += "opacity:0.3;";
						}else{
							style += "cursor:pointer;";
						}
						btn1Elem.setAttribute("style", style);
					}
					var btn2id = "btn2IMG"+oid;
					var btn2Elem = aDoc.getElementById(btn2id);
					if(btn2Elem){
						var style = "position:absolute;left:13px;top:1px;"
						if(imgElem.width<=100 && imgElem.height<=100){
							style += "opacity:0.3;";
						}else{
							style += "cursor:pointer;";
						}
						btn2Elem.setAttribute("style", style); 
					}
					divElem.style.display = "";
				}
			};
		}catch(ex){
			bitsTreeListService._dump("bitsTreeListService.updateDBImageSize():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	blur : function(aEvent){
		var textElem = aEvent.target;
		var nextElem = textElem.nextSibling;
		try{
			var dbcolumn = textElem.getAttribute("dbcolumn");
			if(!dbcolumn) dbcolumn = textElem.getAttribute("type");
			if(dbcolumn && dbcolumn == "title"){
				var value = textElem.value;
				value = value.replace(/^\s+/g,"").replace(/\s+$/g,"");
				if(value == ""){
					bitsTreeListService.Common.alert(bitsTreeListService.STRING.getString("ERROR_NOT_ENTER_TITLE"));
					textElem.value = textElem.defaultValue;
					if(aEvent.cancelable){
						aEvent.preventDefault();
						aEvent.stopPropagation();
						setTimeout(function(){
							textElem.focus();
							textElem.select();
						},0);
						return;
					}
				}
			}
		}catch(e){}
		if(textElem.value != textElem.defaultValue){
			nextElem.innerHTML = textElem.value;
			var oid = textElem.getAttribute("oid");
			var dbtype = textElem.getAttribute("dbtype");
			var rtnObj = bitsTreeListService.Database.getObject({oid:oid},dbtype);
			if(rtnObj){
				var newObj = {oid:rtnObj[0].oid};
				var dbcolumn = textElem.getAttribute("dbcolumn");
				if(!dbcolumn) dbcolumn = textElem.getAttribute("type");
				dbcolumn = dbcolumn.toLowerCase();
				if(dbcolumn == "title" || dbcolumn == "note" || dbcolumn.match(/^property::.+/im)){
					if(dbcolumn == "title"){
						newObj.oid_title = textElem.value;
					}else if(dbcolumn == "note"){
						newObj.oid_property = rtnObj[0].oid_property;
						newObj.oid_property = newObj.oid_property.replace(/[\r\n\t]/mg," __BR__ ");
						if(newObj.oid_property.match(/^(.*<NOTE>)(.*?)(<\/NOTE>.*)$/m)){
							newObj.oid_property = RegExp.$1 + textElem.value + RegExp.$3;
						}else if(newObj.oid_property.match(/^(<PROPERTY>)(.*<\/PROPERTY>)$/m)){
							newObj.oid_property = RegExp.$1 + "<NOTE>" + textElem.value + "</NOTE>" + RegExp.$2;
						}else{
							newObj.oid_property = "<PROPERTY><NOTE>" + textElem.value + "</NOTE></PROPERTY>";
						}
						newObj.oid_property = newObj.oid_property.replace(/ __BR__ /mg,"\n");
					}else if(dbcolumn.match(/^property::(.+)$/im)){
						var tag = RegExp.$1;
						tag = tag.toUpperCase();
						var oid_property = rtnObj[0].oid_property;
						oid_property = oid_property.replace(/[\r\n\t]/mg," __BR__ ");
						var re1 = new RegExp("^(.*<" + tag + ">)(.*?)(</" + tag + ">.*)$","m");
						if(oid_property.match(re1)){
							oid_property = RegExp.$1 + textElem.value + RegExp.$3;
						}else if(oid_property.match(/^(<PROPERTY>)(.*<\/PROPERTY>)$/m)){
							oid_property = RegExp.$1 + "<" + tag + ">" + textElem.value + "</" + tag + ">" + RegExp.$2;
						}else{
							oid_property = "<PROPERTY><" + tag + ">" + textElem.value + "</" + tag + "></PROPERTY>";
						}
						newObj.oid_property = oid_property.replace(/ __BR__ /mg,"\n");
					}
					bitsTreeListService.Database.updateObject(newObj,dbtype);
					var contentWindow = null;
					var mcTreeViewModeService = null;
					var bitsItemView = null;
					if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
					if(contentWindow && contentWindow.mcTreeViewModeService) mcTreeViewModeService = contentWindow.mcTreeViewModeService;
					if(contentWindow && contentWindow.bitsItemView) bitsItemView = contentWindow.bitsItemView;
					if(bitsItemView){
						if(bitsItemView.isChecked){
							bitsItemView.refresh();
						}else{
							if(mcTreeViewModeService) mcTreeViewModeService.rebuild();
						}
					}
				}
			}
		}
		textElem.style.width = "0px";
		textElem.style.height = "0px";
		textElem.style.display = "none";
		nextElem.style.display = "";
	},

/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent){
		try{
			if(
				aEvent.target.id != "mcPopupTreeListViewMenuPopup" &&
				aEvent.target.id != "mcPopupFolderTreeListViewMenuPopup" &&
				aEvent.target.id != "mcPopupDateFolderTreeListViewMenuPopup"
			) return;
			var self = bitsTreeListService;
			var dir = self.getDefaultTemplateDir();
			if(dir.exists()){
				var entries = dir.directoryEntries;
				while(entries.hasMoreElements()){
					var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					self.createMenu(aEvent.target,entry);
				}
			}
			if(aEvent.target.lastChild.nodeName.toLowerCase() != "menuseparator"){
				var elemMenuseparator = aEvent.target.ownerDocument.createElement("menuseparator");
				if(elemMenuseparator) aEvent.target.insertBefore(elemMenuseparator,elemMenuitem);
			}
			var dir  = self.getTemplateDir();
			if(dir.exists()){
				var entries = dir.directoryEntries;
				while(entries.hasMoreElements()){
					var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
					self.createMenu(aEvent.target,entry);
				}
			}
			var disabled = false;
			if(aEvent.target.lastChild.nodeName.toLowerCase() != "menuseparator"){
				var elemMenuseparator = aEvent.target.ownerDocument.createElement("menuseparator");
				if(elemMenuseparator) aEvent.target.appendChild(elemMenuseparator);
			}else{
				disabled = true;
			}
			var elemMenuSub = top.document.createElement("menu");
			var elemMenuSubpopup = top.document.createElement("menupopup");
			if(elemMenuSub && elemMenuSubpopup){
				var label = self.STRING.getString("STYLESHEET");
				elemMenuSub.setAttribute("label",label);
				elemMenuSub.setAttribute("class","menu-iconic");
				elemMenuSub.setAttribute("image","chrome://markingcollection/skin/icon_option.gif");
				elemMenuSub.appendChild(elemMenuSubpopup);
				aEvent.target.appendChild(elemMenuSub);
				var label = self.STRING.getString("ADD_STYLESHEET");
				var elemMenuitem = aEvent.target.ownerDocument.createElement("menuitem");
				if(elemMenuitem){
					elemMenuitem.setAttribute("id","mcPopupTreeListViewAddStyleSheet");
					elemMenuitem.setAttribute("label",label+"...");
					elemMenuitem.setAttribute("image","chrome://markingcollection/skin/add_stylesheet.png");
					elemMenuitem.setAttribute("class","menuitem-iconic");
					elemMenuSubpopup.appendChild(elemMenuitem);
				}
				var label = self.STRING.getString("DEL_STYLESHEET");
				var elemMenuitem = aEvent.target.ownerDocument.createElement("menuitem");
				if(elemMenuitem){
					elemMenuitem.setAttribute("id","mcPopupTreeListViewDelStyleSheet");
					elemMenuitem.setAttribute("label",label+"...");
					elemMenuitem.setAttribute("image","chrome://markingcollection/skin/remove_stylesheet.png");
					elemMenuitem.setAttribute("class","menuitem-iconic");
					if(disabled) elemMenuitem.setAttribute("disabled","true");
					elemMenuSubpopup.appendChild(elemMenuitem);
				}
			}
		}catch(ex){
			self._dump("bitsTreeListService.onPopupShowing():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	onPopupHiding : function(aEvent){
		if(
			aEvent.target.id != "mcPopupTreeListViewMenuPopup" &&
			aEvent.target.id != "mcPopupFolderTreeListViewMenuPopup" &&
			aEvent.target.id != "mcPopupDateFolderTreeListViewMenuPopup"
		) return;
		var elem = aEvent.target.lastChild;
		for(var i=aEvent.target.childNodes.length-1;i>=2;i--){
			aEvent.target.removeChild(aEvent.target.childNodes[i]);
		}
	},

/////////////////////////////////////////////////////////////////////
	onPopupFShowing : function(aEvent){
		this._explicitOriginalTarget = aEvent.explicitOriginalTarget;
	},

/////////////////////////////////////////////////////////////////////
	onCommand : function(aEvent){
		switch(aEvent.target.id){
			case "mcPopupTreeListViewAddStyleSheet":
				bitsTreeListService.getStyleSheetFile();
				break;
			case "mcPopupTreeListViewDelStyleSheet":
				bitsTreeListService.removeStyleSheetFile();
				break;
			default:
				bitsTreeListService.dispList(aEvent,aEvent.target.id);
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	getStyleSheetFile : function (){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = false;
		try{
			picker.init(window, "Selected Stylesheet File", picker.modeOpen);
			picker.appendFilter("XSL Stylesheet","*.xsl");
			picker.filterIndex = 0;
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				var dir = bitsTreeListService.getTemplateDir().clone();
				var aFile = dir.clone();
				aFile.append(picker.file.leafName);
				if(aFile.exists() && this.Common.confirm(this.STRING.getString("CONFIRM_UPDATE_STYLESHEET"))) aFile.remove(false);
				if(!aFile.exists()){
					picker.file.copyTo(dir,picker.file.leafName);
					result = true;
				}
			}
		}catch(e){
			result = false;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	removeStyleSheetFile : function (){
		var result = {
			accept : false,
			list   : [],
			title  : this.STRING.getString("STYLESHEET") + this.STRING.getString("DEL_STYLESHEET"),
		};
		var dir  = this.getTemplateDir();
		var entries = dir.directoryEntries;
		while(entries.hasMoreElements()){
			var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if(entry.isFile()){
				result.list.push(entry);
			}else if(entry.isDirectory()){
			}
		}
		window.openDialog("chrome://markingcollection/content/removeDialog.xul", "", "chrome,centerscreen,modal", result);
		if(result.accept){
		}
	},

/////////////////////////////////////////////////////////////////////
	getDefaultTemplateDir : function(){
		var dir  = window.top.bitsMarkingCollection.getExtInstDir().clone();
		dir.append("stylesheet");
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getTemplateDir : function(){
		var dir  = window.top.bitsMarkingCollection.getExtensionDir().clone();
		dir.append("stylesheet");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	createMenu : function(aParentNode,aEntry){
		if(aEntry.isFile() && aEntry.leafName.match(/^(.+)\.xsl$/m)){
			var label = RegExp.$1;
			var elemMenuitem = top.document.createElement("menuitem");
			if(elemMenuitem){
				elemMenuitem.setAttribute("id",this.Common.convertFilePathToURL(aEntry.path));
				elemMenuitem.setAttribute("label",label);
				elemMenuitem.setAttribute("image","chrome://markingcollection/skin/stylesheet.png");
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
			elemMenuSubpopup.setAttribute("id",this.Common.convertFilePathToURL(aEntry.path));
			elemMenuSub.appendChild(elemMenuSubpopup);
			aParentNode.appendChild(elemMenuSub);
			var entries = aEntry.directoryEntries;
			while(entries.hasMoreElements()){
				var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				this.createMenu(elemMenuSubpopup,entry);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	loadText : function(aURI){
		try {
			var channel = this.Common.IO.newChannelFromURI(aURI);
			var stream  = channel.open();
			var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
			scriptableStream.init(stream);
			var fileContents = scriptableStream.read(scriptableStream.available());
			scriptableStream.close();
			stream.close();
			return fileContents;
		}
	  catch(e){ }
	  return null;
	},

/////////////////////////////////////////////////////////////////////
	xmlEncode : function(aString){
		return aString.replace(/&nbsp;/mg," ").replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	},

/////////////////////////////////////////////////////////////////////
	dispList : function(aEvent,aXSLPath){
		aEvent.preventDefault();
		aEvent.stopPropagation();
		var contentWindow = null;
		var mcTreeHandler = null;
		var bitsTreeDate = null;
		var mcTreeViewModeService = null;
		if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
		if(contentWindow && contentWindow.mcTreeHandler) mcTreeHandler = contentWindow.mcTreeHandler;
		if(contentWindow && contentWindow.bitsTreeDate) bitsTreeDate = contentWindow.bitsTreeDate;
		if(!mcTreeHandler || !bitsTreeDate) return;
		this._viewmode = nsPreferences.copyUnicharPref("wiredmarker.viewmode","all");
		if(contentWindow && contentWindow.mcTreeViewModeService) mcTreeViewModeService = contentWindow.mcTreeViewModeService;
		if(mcTreeViewModeService) this._viewmode = mcTreeViewModeService.viewmode;
		if(bitsTreeDate.isChecked){
			var curIdx = bitsTreeDate.TREE.currentIndex;
			if(curIdx<0) return;
			var obj = bitsTreeDate.getRowObject(curIdx);
			if(obj) this.dispTreeDateList(obj,aXSLPath);
		}else{
			var curIdx = mcTreeHandler.TREE.currentIndex;
			if(curIdx<0) return;
			var aRes = null;
			if(!mcTreeHandler.TREE.view.isContainer(curIdx)) return;
			aRes = mcTreeHandler.TREE.builderView.getResourceAtIndex(curIdx);
			if(aRes){
				var fid = this.DataSource.getProperty(aRes,"id");
				var dbtype = this.DataSource.getProperty(aRes,"dbtype");
				if(fid != "0"){
					var aFolder = this.Database.getFolderFormID(fid,dbtype);
					if(aFolder) this.dispList_proc(aFolder[0],aXSLPath);
				}else{
					this.dispList_proc({fid:fid,dbtype:dbtype,fid_title:this.DataSource.getProperty(aRes,"title")},aXSLPath);
				}
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	initLocalParam : function(aFileid){
		this.id2img = {};
		this.id2icon = {};
		this.id2type = {};
		this.id2text = {};
		this.id2uri = {};
		this.id2uri_content = {};
		this.id2st = {};
		this.id2en = {};
		this.id2property = {};
		this.id2dbtype = {};
		this.id2style = {};
		this.id2pfid = {};
		this.id2fid_title = {};
		this.id2folder = {};
		this.id2Value = {};
		this.id2date = {};
		this.id2exists = {};
		this._fileid = (aFileid?aFileid:this.Common.getTimeStamp());
	},

/////////////////////////////////////////////////////////////////////
	getObjectKey : function(aObject){
		return aObject.dbtype + '_' + aObject.oid;
	},

/////////////////////////////////////////////////////////////////////
	setLocalParam : function(aObject){
		var oid_key = this.getObjectKey(aObject);
		if(aObject.oid_type.match(/^image\/(.+)$/)){
			var blob = this.Database.getObjectBLOB(aObject.oid,aObject.dbtype);
			if(blob && blob.length>0 && blob[0].length>0){
				var images = String.fromCharCode.apply(String, blob[0]);
				var image_b64 = btoa(images); // base64 encoding
				image_b64 = 'data:' + aObject.oid_type + ';base64,' + image_b64;
				this.id2img[oid_key] = image_b64;
				this.id2icon[oid_key] = image_b64;
				var blobFile = this.Database.getObjectBLOBFile(aObject.oid,aObject.dbtype);
				var blobUrl = this.Common.convertFilePathToURL(blobFile.path);
				if(aObject.doc_url == blobUrl){
					aObject.doc_url = image_b64;
					this.id2uri[oid_key] = aObject.doc_url;
				}
				if(aObject.con_url == blobUrl){
					aObject.con_url = image_b64;
					this.id2uri_content[oid_key] = aObject.con_url;
				}
			}
			this.id2text[oid_key] = aObject.oid_txt;
		}else if(aObject.oid_type == "text"){
			this.id2text[oid_key] = aObject.oid_txt;
		}else if(aObject.oid_type == "url"){
			this.id2text[oid_key] = aObject.oid_txt;
			var icon = this.Database.getFavicon(aObject.oid_txt,aObject.dbtype);
			if(!icon) icon = this.Database.getFavicon(aObject.doc_url,aObject.dbtype);
			if(icon) this.id2icon[oid_key] = icon;
		}
		if(!this.id2icon[oid_key] && aObject.oid_property){
			var parser = new DOMParser();
			var xmldoc = parser.parseFromString(aObject.oid_property, "text/xml");
			parser = undefined;
			var icon=null;
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("ICON")[0];
				if(xmlnode) icon = xmlnode.textContent;
			}else{
				if(aObject.oid_property.match(/^.*<ICON>(.+?)<\/ICON>.*$/m)){
					icon = RegExp.$1;
				}
			}
			if(icon && icon != ""){
				var url = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
				url.spec = icon;
				if(url.scheme == "file"){
					var file = bitsObjectMng.Common.convertURLToFile(icon)
					if(!file.exists()) icon = undefined;
				}else if(url.scheme == "chrome"){
					var val = this.existsIcon(url);
					if(!val) icon = undefined;
				}
			}
			if(!icon) icon = this.Database.getFavicon(aObject.doc_url,aObject.dbtype);
			if(!icon) icon = this.Common.getChromeImageURI(this.Common.convertURLToObject('chrome://markingcollection/skin/defaultFavicon.png'));
			if(icon) this.id2icon[oid_key] = icon;
		}
		this.id2uri[oid_key] = aObject.doc_url;
		this.id2uri_content[oid_key] = aObject.con_url;
		this.id2date[oid_key] = aObject.oid_date.replace(/(\d{2}\/\d{2})\/(\d{4})/,"$2/$1");
		this.id2type[oid_key] = aObject.oid_type;
		this.id2st[oid_key] = aObject.bgn_dom;
		this.id2en[oid_key] = aObject.end_dom;
		if(aObject.oid_property && aObject.oid_property != "") this.id2property[oid_key] = aObject.oid_property;
		this.id2dbtype[oid_key] = aObject.dbtype;
		if(!this.id2folder[oid_key]) this.id2folder[oid_key] = [];
		this.id2folder[oid_key].push({
			fid       : aObject.pfid,
			fid_title : aObject.fid_title,
			fid_style : aObject.fid_style.replace(/([:;\(,])\s+/mg,"$1")
		});
		if(!this.id2style[oid_key] && aObject.fid_style != undefined && aObject.fid_style != "") this.id2style[oid_key] = aObject.fid_style.replace(/([:;\(,])\s+/mg,"$1");
		if(!this.id2fid_title[oid_key] && aObject.fid_title != undefined && aObject.fid_title != "") this.id2fid_title[oid_key] = aObject.fid_title;
		if(!this.id2pfid[oid_key] && aObject.pfid != undefined && aObject.pfid != "") this.id2pfid[oid_key] = aObject.pfid;
	},

/////////////////////////////////////////////////////////////////////
	createBaseXML : function(aFID,aDBType,aTitle,aXSLPath){
		var aContent = '<?xml version="1.0" encoding="utf-8"?>\n';
		var note = "";
		var aURL = null;
		if(!aXSLPath) aXSLPath = "chrome://markingcollection/content/treelistview.xsl";
		if(aXSLPath && aXSLPath.match(/^file:/)){
			note = this.Common.readFile(this.Common.convertURLToFile(aXSLPath));
		}else if(aXSLPath && aXSLPath.match(/^chrome:/)){
			note = this.loadText(this.Common.convertURLToObject(aXSLPath));
		}
		if(note && note != ""){
			var type = "xsl";
			var typefile  = bitsTreeListService.getTreeListDir();
			typefile.append(aFID+"."+type);
			if(typefile.exists()) typefile.remove(false);
			typefile.create(typefile.NORMAL_FILE_TYPE, 0666);
			var typefile_ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			typefile_ostream.init(typefile, 2, 0x200, false);
			this.Common.UNICODE.charset = "UTF-8";
			note = this.Common.UNICODE.ConvertFromUnicode(note);
			typefile_ostream.write(note, note.length);
			typefile_ostream.close();
			aContent += '<?xml-stylesheet type="text/'+type+'" href="'+aFID+'.'+type+'"?>\n';
		}
		if(!aTitle) aTitle = "";
		if(!aDBType) aDBType = "";
		if(!aFID) aFID = "";
		aContent += '<!DOCTYPE LIST>\n<LIST title="'+aTitle+'" fid="'+aFID+'" dbtype="'+aDBType+'" xslpath="'+aXSLPath+'" _fileid="'+this._fileid+'">\n';
		aContent += "</LIST>\n";
		bitsTreeExportService.createXMLDoc(aContent);
	},

/////////////////////////////////////////////////////////////////////
	loadURL : function(aURL,aFileid){
		var cur_uri = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		var basedir = this.getBaseDir();
		if(aFileid) basedir.append(aFileid);
		var res_uri = this.Common.convertFilePathToURL(basedir.path);
		if(cur_uri.indexOf(res_uri)>=0) this._doc = this.gBrowser.contentDocument;
		var loadFlag = false;
		if(this.gBrowser.browsers.length == 1 && res_uri != "" && cur_uri.indexOf(res_uri)<0){
			loadFlag = true;
		}else if(cur_uri.indexOf(res_uri)>=0){
			loadFlag = false;
		}else{
			loadFlag = true;
			for(var i=0;i<this.gBrowser.browsers.length;i++){
				var doc = this.gBrowser.browsers[i].contentDocument;
				var cur_uri = this.Common.getURLStringFromDocument(doc);
				if(cur_uri.indexOf(res_uri)>=0){
					loadFlag = false;
					if(!aFileid) this.gBrowser.tabContainer.selectedIndex = i;
					break;
				}
			}
		}
		var self = this;
		setTimeout(function(){ self._loadURL(aURL,aFileid,loadFlag); },0);
	},
	_loadURL : function(aURL,aFileid,loadFlag){
		var win = this.Common.WINDOW.getMostRecentWindow("navigator:browser");
		var browser = win.document.getElementById("content");
		if(aFileid && !loadFlag){
			var basedir = this.getBaseDir();
			if(aFileid) basedir.append(aFileid);
			var res_uri = this.Common.convertFilePathToURL(basedir.path);
			for(var i=0;i<this.gBrowser.browsers.length;i++){
				var doc = this.gBrowser.browsers[i].contentDocument;
				var cur_uri = this.Common.getURLStringFromDocument(this.gBrowser.browsers[i].contentDocument);
				if(cur_uri.indexOf(res_uri)>=0){
					this.gBrowser.browsers[i].reloadWithFlags(nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
					break;
				}
			}
		}else{
			var flags = nsIWebNavigation.LOAD_FLAGS_REPLACE_HISTORY;
			if(loadFlag){
				browser.selectedTab = browser.addTab('about:blank');
				flags = nsIWebNavigation.LOAD_FLAGS_NONE;
			}
			browser.loadURIWithFlags(aURL,flags);
		}
		this._openurl = aURL;
		if(this._openurl != ""){
			var remove_dir = this.Common.convertURLToFile(this.Common.getBaseHref(this._openurl));
			window.top.bitsMarkingCollection._removefile.push(remove_dir);
			var contentWindow = null;
			var mcTreeViewModeService = null;
			if(bitsMarkingCollection._contentWindow) contentWindow = bitsMarkingCollection._contentWindow;
			if(contentWindow && contentWindow.mcTreeViewModeService) mcTreeViewModeService = contentWindow.mcTreeViewModeService;
			if(mcTreeViewModeService) mcTreeViewModeService._openlist[aURL] = loadFlag;
		}
	},

/////////////////////////////////////////////////////////////////////
	dispTreeDateList : function(aObject,aXSLPath,aFileid){
		this.initLocalParam(aFileid);
		var fid = "";
		var param = {};
		var title = "";
		if(aObject.date){
			if(aObject.date.year){
				param["substr(om_object.oid_date,7,4)"] = aObject.date.year;
				fid += aObject.date.year;
				title += aObject.date.year;
				if(aObject.date.month){
					param["substr(om_object.oid_date,1,2)"] = aObject.date.month;
					fid += aObject.date.month;
					title += '/' + aObject.date.month;
					if(aObject.date.day){
						param["substr(om_object.oid_date,4,2)"] = aObject.date.day;
						fid += aObject.date.day;
						title += '/' + aObject.date.day;
					}
				}
			}
		}else{
			fid = "0";
			title = aObject.text;
		}
		if(aXSLPath != bitsTreeListService._listview_drag && !aObject.childlen && this.bitsTreeDate){
			var itemObject = this.bitsTreeDate.getObjectFromID(fid);
			if(itemObject) aObject = itemObject;
		}
		if(this._viewmode == "single") param.doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
		var objects = this.Database.getObject(param, aObject.dbtype);
		if(objects && objects.length>0){
			objects.sort(function(a,b){
				var a_date = Date.parse(a.oid_date);
				var b_date = Date.parse(b.oid_date);
				if(a_date < b_date) return -1;
				if(a_date > b_date) return 1;
				return 0;
			});
			var i=0;
			for(i=0;i<objects.length;i++){
				this.setLocalParam(objects[i]);
			}
			if(aXSLPath == this._listview_drag){
				this.id2folder = {};
				for(i=0;i<objects.length;i++){
					var oid_key = this.getObjectKey(objects[i]);
					if(this.id2folder[oid_key]) continue;
					this.id2folder[oid_key] = [];
					var temp_objects = this.Database.getObject({oid:objects[i].oid},objects[i].dbtype);
					if(!temp_objects || temp_objects.length==0) continue;
					temp_objects.sort(function(a,b){
						var a_order = parseInt(a.folder_order);
						var b_order = parseInt(b.folder_order);
						if(a_order < b_order) return -1;
						if(a_order > b_order) return 1;
						return 0;
					});
					for(var j=0;j<temp_objects.length;j++){
						if(temp_objects[j].dbtype == bitsMarkingCollection._uncategorized.dbtype) continue;
						this.id2folder[oid_key].push({
							fid       : temp_objects[j].pfid,
							fid_title : temp_objects[j].fid_title,
							oid       : temp_objects[j].oid,
							dbtype    : temp_objects[j].dbtype,
							fid_style : temp_objects[j].fid_style.replace(/([:;\(,])\s+/mg,"$1")
						});
					}
				}
			}
		}
		var file  = this.getTreeListDir();
		file.append(fid+".xml");
		if(file.exists()) file.remove(false);
		this.createBaseXML(fid,aObject.dbtype,title,aXSLPath);
		this.createTreeDateXML(aObject, bitsTreeExportService.xmldoc.documentElement, aXSLPath);
		var aContent = bitsTreeExportService.xmlSerializer();
		file.create(file.NORMAL_FILE_TYPE, 0666);
		var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
		ostream.init(file, 2, 0x200, false);
		this.Common.UNICODE.charset = "UTF-8";
		aContent = this.Common.UNICODE.ConvertFromUnicode(aContent);
		ostream.write(aContent, aContent.length);
		ostream.close();
		this.loadURL(this.Common.convertFilePathToURL(file.path),aFileid);
	},

/////////////////////////////////////////////////////////////////////
	dispList_proc : function(aFolder,aXSLPath,aFileid){
		
		var fid = aFolder.fid;
		var dbtype = aFolder.dbtype;
		var title = aFolder.fid_title;
		title = this.xmlEncode(title);
		var property = aFolder.fid_property;
		var note = "";
		if(property && property != ""){
			if(property.match(/^(.*<NOTE>)(.*)?(<\/NOTE>.*)$/m)){
				var _property = [];
				_property[0] = RegExp.$1;
				_property[1] = RegExp.$2;
				_property[2] = RegExp.$3;
				_property[1] = this.xmlEncode(_property[1]);
				property = _property.join("");
			}
			if(this.XML.parseFromString(property)){
				var rtnNode = this.XML.getItem("PROPERTY","NOTE");
				if(rtnNode) note = rtnNode[0].textContent;
				if(!rtnNode && note == ""){
					rtnNode = this.XML.getItem("NOTE");
					if(rtnNode) note = rtnNode[0].textContent;
				}
				if(!rtnNode && note == ""){
					var txt = property.replace(/[\r\n\t]/mg," __BR__ ");
					if(txt.match(/<PROPERTY>(.*?)<\/PROPERTY>/m)){
						note = unescape(RegExp.$1);
					}
				}
				if(!rtnNode && note == "") note = property;
			}else{
				note = property;
			}
		}
		note = note.replace(/ __BR__ /mg,"\n");
		this.initLocalParam(aFileid);
		var folderResList = bitsTreeExportService._getAllFolder(aFolder);
		folderResList.push(aFolder);
		var f_dbtype = dbtype;
		if(folderResList.length>0){
			var fcnt;
			for(fcnt=0;fcnt<folderResList.length;fcnt++){
				var fid = folderResList[fcnt].fid;
				var objects = undefined;
				if(this._viewmode == "all"){
					objects = this.Database.getObjectFormPID(fid, f_dbtype);
				}else{
					var doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
					objects = this.Database.getObject({pfid:fid,doc_url:doc_url}, f_dbtype);
				}
				if(objects && objects.length>0){
					var i=0;
					for(i=0;i<objects.length;i++){
						this.setLocalParam(objects[i]);
					}
					if(aXSLPath == this._listview_drag){
						this.id2folder = {};
						for(i=0;i<objects.length;i++){
							var oid_key = this.getObjectKey(objects[i]);
							if(this.id2folder[oid_key]) continue;
							this.id2folder[oid_key] = [];
							var temp_objects = this.Database.getObject({oid:objects[i].oid},objects[i].dbtype);
							if(!temp_objects || temp_objects.length==0) continue;
							temp_objects.sort(function(a,b){
								var a_order = parseInt(a.folder_order);
								var b_order = parseInt(b.folder_order);
								if(a_order < b_order) return -1;
								if(a_order > b_order) return 1;
								return 0;
							});
							for(var j=0;j<temp_objects.length;j++){
								if(temp_objects[j].dbtype == bitsMarkingCollection._uncategorized.dbtype) continue;
								this.id2folder[oid_key].push({
									fid       : temp_objects[j].pfid,
									fid_title : temp_objects[j].fid_title,
									oid       : temp_objects[j].oid,
									dbtype    : temp_objects[j].dbtype,
									fid_style : temp_objects[j].fid_style.replace(/([:;\(,])\s+/mg,"$1")
								});
							}
						}
					}
				}
			}
		}
		var file  = this.getTreeListDir();
		file.append(fid+".xml");
		if(file.exists()){
			try{
				file.remove(true);
			}catch(e){
				this._dump("bitsTreeListService.dispList_proc():"+e);
			}
		}
		if(!file.exists()){
			this.createBaseXML(fid,f_dbtype,title,aXSLPath);
			this.createXML(aFolder, bitsTreeExportService.xmldoc.documentElement, aXSLPath);
			var aContent = bitsTreeExportService.xmlSerializer();
			file.create(file.NORMAL_FILE_TYPE, 0666);
			var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
			this.Common.UNICODE.charset = "UTF-8";
			aContent = this.Common.UNICODE.ConvertFromUnicode(aContent);
			ostream.write(aContent, aContent.length);
			ostream.close();
			this.loadURL(this.Common.convertFilePathToURL(file.path),aFileid);
		}
	},

/////////////////////////////////////////////////////////////////////
	getBaseDir : function(){
		var dir  = window.top.bitsMarkingCollection.getExtensionDir().clone();
		dir.append("treelist");
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	getTreeListDir : function(){
		var dir  = this.getBaseDir().clone();
		dir.append(this._fileid);
		if(!dir.exists()) dir.create(dir.DIRECTORY_TYPE, 0700);
		return dir;
	},

/////////////////////////////////////////////////////////////////////
	createXML : function(aFolder, aParentNode, aXSLPath, aDepth){
		var pfid = aFolder.fid;
		var title = aFolder.fid_title;
		var oidArr = [];
		var contResList;
		var f_dbtype = aFolder.dbtype;
		var objects = undefined;
		if(this._viewmode == "all"){
			objects = this.Database.getObjectFormPID(pfid, f_dbtype);
		}else{
			var doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			objects = this.Database.getObject({pfid:pfid,doc_url:doc_url}, f_dbtype);
		}
		if(objects){
			var i=0;
			for(i=0;i<objects.length;i++){
				oidArr.push(objects[i].oid);
			}
		}
		var contResList = this.Database.getFolderFormPID(aFolder.fid,aFolder.dbtype,false);
		if(contResList){
			var fcnt;
			for(fcnt=0;fcnt<contResList.length;fcnt++){
				oidArr.push(contResList[fcnt].fid);
			}
		}
		if(aDepth == undefined) aDepth = 0;
		var aTab = "";
		var i;
		for(i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var fNode = bitsTreeExportService.createElement("FOLDER",undefined,aParentNode,aTab);
		if(title != "") bitsTreeExportService.createElement("FID_TITLE",title,fNode,aTab+'  ');
		if(pfid != "") bitsTreeExportService.createElement("ID",aFolder.fid,fNode,aTab+'  ');
		if(oidArr.length>0) bitsTreeExportService.createElement("CHILDID",oidArr.join(","),fNode,aTab+'  ');
		if(contResList && contResList.length>0){
			var fcnt;
			for(fcnt=0;fcnt<contResList.length;fcnt++){
				this.createXML(contResList[fcnt], fNode, aXSLPath, aDepth+1);
			}
		}
		if(objects){
			var i;
			for(i=0;i<objects.length;i++){
				this.createXMLObject(objects[i], fNode, aXSLPath, aDepth);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	createXMLFolder : function(aFolder, aParentNode, aDepth, oidArr){
		if(aDepth == undefined) aDepth = 0;
		var aTab = "";
		var i;
		for(i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var fNode = bitsTreeExportService.createElement("FOLDER",undefined,aParentNode,aTab);
		if(aFolder.fid_title != "") bitsTreeExportService.createElement("FID_TITLE",aFolder.fid_title,fNode,aTab+'  ');
		if(aFolder.fid != "") bitsTreeExportService.createElement("ID",aFolder.fid,fNode,aTab+'  ');
		if(oidArr && oidArr.length>0) bitsTreeExportService.createElement("CHILDID",oidArr.join(","),fNode,aTab+'  ');
		return fNode;
	},

/////////////////////////////////////////////////////////////////////
	createTreeDateXML : function(aObject, aParentNode, aXSLPath, aDepth){
		var oidArr = [];
		var contResList = undefined;
		var f_dbtype = aObject.dbtype;
		var objects = undefined;
		if(aXSLPath == this._listview_drag){
			var param = {};
			if(this._viewmode != "all") param.doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
			if(aObject.date && aObject.date.year){
				param["substr(om_object.oid_date,7,4)"] = aObject.date.year;
				if(aObject.date.month){
					param["substr(om_object.oid_date,1,2)"] = aObject.date.month;
					if(aObject.date.day) param["substr(om_object.oid_date,4,2)"] = aObject.date.day;
				}
			}
			objects = this.Database.getObject(param, aObject.dbtype);
		}else{
			contResList = aObject.childlen;
			if(aObject.date && aObject.date.year && aObject.date.month && aObject.date.day){
				var param = {};
				param["substr(om_object.oid_date,7,4)"] = aObject.date.year;
				param["substr(om_object.oid_date,1,2)"] = aObject.date.month;
				param["substr(om_object.oid_date,4,2)"] = aObject.date.day;
				if(this._viewmode != "all") param.doc_url = this.Common.getURLStringFromDocument(this.gBrowser.contentDocument);
				objects = this.Database.getObject(param, aObject.dbtype);
			}
		}
		if(objects){
			objects.sort(function(a,b){
				var a_date = Date.parse(a.oid_date);
				var b_date = Date.parse(b.oid_date);
				if(a_date < b_date) return -1;
				if(a_date > b_date) return 1;
				return 0;
			});
			var i=0;
			for(i=0;i<objects.length;i++){
				oidArr.push(objects[i].oid);
			}
		}
		if(contResList && contResList.length>0){
			var fid = "";
			var fcnt;
			for(fcnt=0;fcnt<contResList.length;fcnt++){
				if(!contResList[fcnt].date) continue;
				fid = "";
				if(contResList[fcnt].date.year){
					fid += contResList[fcnt].date.year;
					if(contResList[fcnt].date.month){
						fid += contResList[fcnt].date.month;
						if(contResList[fcnt].date.day) fid += contResList[fcnt].date.day;
					}
				}
				oidArr.push(fid);
			}
		}
		var aFolder = {
			fid       : "",
			fid_title : "",
		};
		if(aObject.date){
			if(aObject.date.year){
				aFolder.fid += aObject.date.year;
				aFolder.fid_title += aObject.date.year;
				if(aObject.date.month){
					aFolder.fid += aObject.date.month;
					aFolder.fid_title += '/'+aObject.date.month;
					if(aObject.date.day){
						aFolder.fid += aObject.date.day;
						aFolder.fid_title += '/'+aObject.date.day;
					}
				}
			}
		}else{
			aFolder.fid="0";
			aFolder.fid_title=aObject.text;
		}
		if(aDepth == undefined) aDepth = 0;
		var fNode = this.createXMLFolder(aFolder,aParentNode,aDepth,oidArr);
		if(contResList && contResList.length>0){
			var fcnt;
			for(fcnt=0;fcnt<contResList.length;fcnt++){
				this.createTreeDateXML(contResList[fcnt], fNode, aXSLPath, aDepth+1);
			}
		}
		if(objects){
			var i;
			for(i=0;i<objects.length;i++){
				var oid_key = this.getObjectKey(objects[i]);
				if(this.id2exists[oid_key]) continue;
				this.id2exists[oid_key] = true;
				this.createXMLObject(objects[i], fNode, aXSLPath, aDepth);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	createXMLObject : function(aObject, aParentNode, aXSLPath, aDepth){
		var oid_key = this.getObjectKey(aObject);
		var id2img = this.id2img;
		var id2type = this.id2type;
		var id2text = this.id2text;
		var id2uri = this.id2uri;
		var id2uri_content = this.id2uri_content;
		var id2st = this.id2st;
		var id2en = this.id2en;
		var id2date = this.id2date;
		var id2property = this.id2property;
		var id2dbtype = this.id2dbtype;
		var id2style = this.id2style;
		var id2Value = this.id2Value;
		var id2fid_title = this.id2fid_title;
		var id2pfid = this.id2pfid;
		if(aDepth == undefined) aDepth = 0;
		var aTab = "";
		var i;
		for(i=0;i<=aDepth;i++){
			aTab += "  ";
		}
		var aContent = "";
		var oid = aObject.oid;
		var title = aObject.oid_title;
		var alink = "";
		var note = "";
		var structure = "";
		var hyperAnchor = "";
		var location_hash = "";
		var disp_image_size_x = "";
		var disp_image_size_y = "";
		var disp_image_size = "";
		var out_property = [];
		var xmldoc;
		var structureElem;
		if(id2property[oid_key]){
			try{
				var parser = new DOMParser();
				xmldoc = parser.parseFromString(id2property[oid_key], "text/xml");
				parser = undefined;
			}catch(ex){}
			if(xmldoc && xmldoc.documentElement.nodeName == "parsererror"){
				id2property[oid_key] = "";
				xmldoc = undefined;
			}
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("LINK")[0];
				if(xmlnode) alink = this.xmlEncode(xmlnode.textContent);
				xmlnode = xmldoc.getElementsByTagName("STRUCTURE")[0];
				if(xmlnode && xmlnode.hasChildNodes()){
					structureElem = xmlnode.cloneNode(true);
				}
				xmlnode = xmldoc.getElementsByTagName("IMG_LIST_DISP_SIZE")[0];
				if(xmlnode){
					disp_image_size = this.xmlEncode(xmlnode.textContent);
					if(disp_image_size.match(/^(\d+),(\d+)$/mg)){
						disp_image_size_x = RegExp.$1;
						disp_image_size_y = RegExp.$2;
					}
				}
				xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
				if(xmlnode){
					out_property["NOTE"] = {};
					out_property["NOTE"].type  = "text";
					out_property["NOTE"].value = xmlnode.textContent;
				}
				xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
				if(xmlnode) hyperAnchor = xmlnode.textContent;
				xmlnode = xmldoc.getElementsByTagName("LOCATION_HASH")[0];
				if(xmlnode) location_hash = xmlnode.textContent;
			}
		}
		var oNode = bitsTreeExportService.createElement("OBJECT",undefined,aParentNode,aTab+"  ");
		if(title != "") bitsTreeExportService.createElement("OID_TITLE",title,oNode,aTab+"    ");
		if(oid != ""){
			bitsTreeExportService.createElement("ID",oid,oNode,aTab+"    ");
			oNode.setAttribute("oid",oid);
		}
		var tag;
		for(tag in out_property){
			if(typeof out_property[tag] == "function") continue;
			var elem = bitsTreeExportService.createElement("OID_PROPERTY_"+tag,out_property[tag].value,oNode,aTab+"    ");
			elem.setAttribute("type",out_property[tag].type);
			if(id2dbtype[oid_key]) elem.setAttribute("dbtype",id2dbtype[oid_key]);
			if(tag.toLowerCase() == "note") bitsTreeExportService.createElement("OID_NOTE",out_property[tag].value,oNode,aTab+"    ");
		}
		if(id2img[oid_key]) bitsTreeExportService.createElement("OID_IMG",id2img[oid_key],oNode,aTab+"    ");
		if(aXSLPath && disp_image_size_x && disp_image_size_y){
			bitsTreeExportService.createElement("OID_IMG_DISP_WIDTH",disp_image_size_x,oNode,aTab+"    ");
			bitsTreeExportService.createElement("OID_IMG_DISP_HEIGHT",disp_image_size_y,oNode,aTab+"    ");
		}
		if(alink != ""){
			bitsTreeExportService.createElement("OID_TXT",alink,oNode,aTab+"    ");
		}else if(id2text[oid_key]){
			bitsTreeExportService.createElement("OID_TXT",id2text[oid_key],oNode,aTab+"    ");
		}
		if(id2uri[oid_key]) bitsTreeExportService.createElement("DOC_URL",id2uri[oid_key],oNode,aTab+"    ");
		if(id2uri_content[oid_key]) bitsTreeExportService.createElement("CON_URL",id2uri_content[oid_key],oNode,aTab+"    ");
		if(id2st[oid_key]) bitsTreeExportService.createElement("BGN_DOM",id2st[oid_key],oNode,aTab+"    ");
		if(id2en[oid_key]) bitsTreeExportService.createElement("END_DOM",id2en[oid_key],oNode,aTab+"    ");
		if(id2date[oid_key]) bitsTreeExportService.createElement("OID_DATE",id2date[oid_key],oNode,aTab+"    ");
		if(hyperAnchor != ""){
			if(location_hash != "") hyperAnchor = hyperAnchor.replace(/(#hyperanchor)/,'#'+location_hash+"$1");
			bitsTreeExportService.createElement("HYPER_ANCHOR",hyperAnchor,oNode,aTab+"    ");
		}else if(id2uri_content[oid_key] && id2st[oid_key]){
			var text = id2uri_content[oid_key] + '#hyperanchor:' + this.xmlEncode(id2st[oid_key]);
			if(location_hash != "") text += '#' + location_hash;
			text += '#hyperanchor:' + this.xmlEncode(id2st[oid_key]);
			if(id2en[oid_key]) text += "&" + this.xmlEncode(id2en[oid_key]);
			if(id2style[oid_key]) text += "&" + this.xmlEncode(id2style[oid_key]);
			bitsTreeExportService.createElement("HYPER_ANCHOR",text,oNode,aTab+"    ");
		}
		if(this.id2folder[oid_key]){
			var foldersNode = bitsTreeExportService.createElement("FOLDER_INFOS",undefined,oNode,aTab+"    ");
			foldersNode.setAttribute("oid",oid);
			if(id2dbtype[oid_key]) foldersNode.setAttribute("dbtype",id2dbtype[oid_key]);
			for(var fcnt=0;fcnt<this.id2folder[oid_key].length;fcnt++){
				var folderNode = bitsTreeExportService.createElement("FOLDER_INFO","",foldersNode,aTab+"      ");
				folderNode.setAttribute("fid",this.id2folder[oid_key][fcnt].fid);
				folderNode.setAttribute("fid_title",this.id2folder[oid_key][fcnt].fid_title);
				folderNode.setAttribute("fid_style",this.id2folder[oid_key][fcnt].fid_style);
				folderNode.setAttribute("oid",this.id2folder[oid_key][fcnt].oid);
				folderNode.setAttribute("dbtype",this.id2folder[oid_key][fcnt].dbtype);
			}
		}else{
			if(id2style[oid_key]) bitsTreeExportService.createElement("FID_STYLE",id2style[oid_key],oNode,aTab+"    ");
			if(id2fid_title[oid_key]) bitsTreeExportService.createElement("FID_TITLE",id2fid_title[oid_key],oNode,aTab+"    ");
		}
		if(id2pfid[oid_key]) bitsTreeExportService.createElement("PFID",id2pfid[oid_key],oNode,aTab+"    ");
		if(structureElem){
			var elem = bitsTreeExportService.createElement("OID_STRUCTURE","",oNode,aTab+"    ");
			var i;
			for(i=0;i<structureElem.childNodes.length;i++){
				elem.appendChild(structureElem.childNodes[i].cloneNode(true));
			}
		}
		if(id2dbtype[oid_key]){
			bitsTreeExportService.createElement("DBTYPE",id2dbtype[oid_key],oNode,aTab+"    ");
			oNode.setAttribute("dbtype",id2dbtype[oid_key]);
		}
		if(id2Value[oid_key]) bitsTreeExportService.createElement("TREE_VALUE",id2Value[oid_key],oNode,aTab+"    ");
		if(this.id2icon[oid_key]) bitsTreeExportService.createElement("FAVICON",this.id2icon[oid_key],oNode,aTab+"    ");
		bitsTreeExportService.createElement("OID",oid,oNode,aTab+"    ");
	},

/////////////////////////////////////////////////////////////////////
	mergeObject : function(aFolder,aObject){
		var mergeRtn = 0;
		if(aObject.oid_type != "text") return mergeRtn;

		window.top.bitsScrapPartyMergeService._isCancel = false;
		window.top.bitsScrapPartyMergeService._isSameprocessing = false;
		window.top.bitsScrapPartyMergeService._isMergeMode = 0;
		window.top.bitsScrapPartyMergeService._isConfirm = false;
		var i;
		var mergeFlag = false;
		var dstObjects = this.Database.getObject({pfid:aFolder.fid,oid_title:aObject.oid_title}, aFolder.dbtype);
		if(!dstObjects || dstObjects.length == 0) return mergeRtn;
		mergeFlag = true;
		if(!mergeFlag) return mergeRtn;
		mergeRtn |= window.top.bitsScrapPartyMergeService._merge(aObject,aFolder);
		if(window.top.bitsScrapPartyMergeService.cancel) return -1;
		return mergeRtn;
	},

/////////////////////////////////////////////////////////////////////
	copyObject : function(aFolder,aObject){
		var addObj = undefined;
		var pfid = aFolder.fid;
		var pdbtype = aFolder.dbtype;
		var pfid_order = this.Database.getMaxOrderFormPID(aFolder.fid,aFolder.dbtype);
		var exists = false;
		var i;
		var rtn = this.Database.existsObject({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype);
		if(rtn){
			exists = rtn;
		}else{
			if(aObject.dbtype == aFolder.dbtype){
				rtn = this.Database.addLink({oid:aObject.oid,pfid:aFolder.fid,pfid_order:++pfid_order},aFolder.dbtype);
				addObj = {};
				for(var key in aObject){
					addObj[key] = aObject[key];
				}
				addObj.pfid = aFolder.fid;
				addObj.pfid_order = pfid_order;
				addObj.dbtype = aFolder.dbtype;
			}else{
				var objs = this.Database.getObjectWithProperty({oid:aObject.oid,pfid:aObject.pfid},aObject.dbtype);
				var blobs =this.Database.getObjectBLOB(aObject.oid,aObject.dbtype);
				if(objs && objs.length>0) aObject = objs[0];
				addObj = this.Database.newObject(aObject.oid,aFolder.dbtype);
				var key;
				for(key in aObject){
					if(key == "oid") continue;
					addObj[key] = aObject[key];
				}
				addObj.pfid = aFolder.fid;
				delete addObj.dbtype;
				delete addObj.fid_style;
				rtn = this.Database.addObject(addObj,aFolder.dbtype);
				if(rtn){
					if(blobs && blobs.length>0){
						this.Database.updateObjectBLOB(addObj.oid,blobs[0],aFolder.dbtype);
					}
				}
			}
		}
		if(exists) this.Common.alert(this.STRING.getString("ALERT_COPYOBJECT_EXISTS"));
		return addObj;
	},

/////////////////////////////////////////////////////////////////////
	moveObject : function(aFolder,aObject,aModShift){
		try{
			if(aModShift == undefined) aModShift = false;
			var update = false;
			if(update == false && aObject.dbtype == aFolder.dbtype && this.Database.existsObject({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype)){
				if(this.Common.confirm(this.STRING.getString("CONFIRM_COPYOBJECT_OVERWRITE"))){
					update = true;
				}else{
					return false;
				}
			}
			if(update && aObject.dbtype == aFolder.dbtype && this.Database.existsObject({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype)){
				var rtn = this.Database.removeLink({oid:aObject.oid,pfid:aFolder.fid},aFolder.dbtype);
			}
			var addObj = this._moveObject(aFolder,aObject,aModShift);
			return addObj;
		}catch(e){
			this._dump("bitsTreeListService.moveObject():"+e);
			return undefined;
		}
	},

	_moveObject : function(aFolder,aObject,aModShift){
		var addObj = undefined;
		var rtn;
		var pfid_order = this.Database.getMaxOrderFormPID(aFolder.fid,aFolder.dbtype);
		var old_source = bitsMarker.id_key+aObject.dbtype+aObject.oid;
		var new_source = bitsMarker.id_key;
		if(aObject.dbtype == aFolder.dbtype){
			rtn = this.Database.updateObject({oid:aObject.oid,pfid:aFolder.fid,pfid_old:aObject.pfid,pfid_order:++pfid_order},aFolder.dbtype);
			new_source += aFolder.dbtype+aObject.oid;
			addObj = aObject;
		}else{
			var objs = this.Database.getObjectWithProperty({oid:aObject.oid,pfid:aObject.pfid},aObject.dbtype);
			var blobs =this.Database.getObjectBLOB(aObject.oid,aObject.dbtype);
			if(objs && objs.length>0) aObject = objs[0];
			addObj = this.Database.newObject(aObject.oid,aFolder.dbtype);
			var key;
			for(key in aObject){
				if(key == "oid") continue;
				addObj[key] = aObject[key];
			}
			addObj.pfid = aFolder.fid;
			addObj.pfid_order = ++pfid_order;
			delete addObj.dbtype;
			delete addObj.fid_style;
			rtn = this.Database.addObject(addObj,aFolder.dbtype);
			if(rtn && blobs && blobs.length>0) this.Database.updateObjectBLOB(addObj.oid,blobs[0],aFolder.dbtype);
			if(rtn && aModShift) rtn = this.Database.removeObject(aObject,aObject.dbtype);
			new_source += aFolder.dbtype+addObj.oid;
		}
		this.Common.changeNodeStyleFromID(old_source,aFolder.fid_style,addObj.pfid,addObj.oid,aFolder.dbtype);
		return addObj;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
