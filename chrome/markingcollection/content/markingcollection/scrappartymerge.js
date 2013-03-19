function bitsScrapPartyMergeObserver(aEvent){
	try{
		switch(aEvent.type){
			case "load":
				var merge = bitsScrapPartyMergeService.availableness;
				var button = aEvent.target.getElementById("mcToolbarButtonScrapPartyMerge");
				button.setAttribute("checked",merge);
				break;
			default:
				break;
		}
	}catch(ex){
		bitsScrapPartyMergeService._dump("bitsScrapPartyMergeObserver():"+ex);
		aEvent.preventDefault();
	}
};

var bitsScrapPartyMergeService = {
	prefs : {},
	_isCancel : false,
	_isConfirm : false,

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("bitsScrapPartyMergeString"); },
	get DataSource() { return bitsObjectMng.DataSource; },
	get Common()     { return bitsObjectMng.Common;     },
	get XPath()      { return bitsObjectMng.XPath;      },
	get Database()   { return bitsObjectMng.Database;   },
	get gBrowser()   { return bitsObjectMng.getBrowser();},

	get BROWSER() {  return document.getElementById("bitsScrapPartyMergeBrowser"); },

/////////////////////////////////////////////////////////////////////
	get availableness(){ return true; },
	get cancel(){ return bitsScrapPartyMergeService._isCancel; },
	get confirm(){ return bitsScrapPartyMergeService._isConfirm; },

/////////////////////////////////////////////////////////////////////
	initPrefs : function(){
		this.prefs.conditionMerge = nsPreferences.getIntPref("wiredmarker.merge.conditionMerge", 0);
		this.prefs.confirmMerge   = nsPreferences.getBoolPref("wiredmarker.merge.confirmMerge",  true);
	},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(this._init) return;
		try{
			if(!bitsObjectMng){
				setTimeout(function(){bitsScrapPartyMergeService.init(aEvent)},1000);
				return;
			}
		}catch(ex){
			setTimeout(function(){bitsScrapPartyMergeService.init(aEvent)},1000);
			return;
		}
		try{
			this._init = true;
			this.initPrefs();
		}catch(ex){
			this.Common.alert("bitsScrapPartyMergeService.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(this._init){
			this._init = false;
		}
	},

/////////////////////////////////////////////////////////////////////
	dispOptions : function(event){
		window.openDialog('chrome://markingcollection/content/optionsDialog.xul',undefined,'modal,centerscreen,chrome');
		this.initPrefs();
	},

/////////////////////////////////////////////////////////////////////
	dispConfirm : function(aInfo){
		var result = {};
		window.openDialog('chrome://markingcollection/content/confirmDialog.xul',undefined,'modal,centerscreen,chrome',aInfo,result);
		this._isSameprocessing = result.sameprocessing
		this._isMergeMode = result.accept
		return result.accept;
	},

/////////////////////////////////////////////////////////////////////
	onClick : function(aEvent){
		bitsScrapPartyMergeService._onClick(aEvent);
	},

/////////////////////////////////////////////////////////////////////
	_onClick : function(aEvent){
		var button = aEvent.target;
		//button.setAttribute("checked",!eval(button.getAttribute("checked")));
		//nsPreferences.setBoolPref("wiredmarker.merge", eval(button.getAttribute("checked")));
	},

/////////////////////////////////////////////////////////////////////
	mergeResource : function(aPram){
		try{
			if(aPram == undefined || aPram.modCtrl || aPram.modShift) return 0;
			if(!bitsScrapPartyMergeService.availableness) return 0;
			this._isCancel = false;
			this._isSameprocessing = false;
			this._isMergeMode = 0;
			this._isConfirm = false;
			var rtn = this._mergeResource(aPram)
			return rtn;
		}catch(ex){
			this._dump("bitsScrapPartyMergeService.mergeResource():ex="+ex);
			return 0;
		}
	},

/////////////////////////////////////////////////////////////////////
	_mergeResource : function(aPram){
		var tree = aPram.tree;
		var srcRes = aPram.srcRes;
		var dstRes = aPram.dstRes;
		var modCtrl = aPram.modCtrl;
		var modAlt = aPram.modAlt;
		var modShift = aPram.modShift;
		var srcTitle = this.DataSource.getProperty(srcRes,"title");
		srcTitle = srcTitle.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
		var dstParentRes = this.DataSource.isContainer(dstRes) ? dstRes : this.DataSource.findParentResource(dstRes);
		dstRes = null;
		var dstTarget = this.DataSource.flattenResources(dstParentRes, (this.DataSource.isContainer(srcRes)?1:2), false);
		var i;
		for(i=0;i<dstTarget.length;i++){
			if(dstTarget[i].Value == dstParentRes.Value) continue;
			var dstTitle = this.DataSource.getProperty(dstTarget[i],"title");
			dstTitle = dstTitle.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
			if(srcTitle != dstTitle) continue;
			dstRes = dstTarget[i];
			break;
		}
		if(!dstRes) return 0;
		var srcParentRes = this.DataSource.isContainer(srcRes) ? srcRes : this.DataSource.findParentResource(srcRes);
		var dstParentRes = this.DataSource.isContainer(dstRes) ? dstRes : this.DataSource.findParentResource(dstRes);
		if(srcParentRes.Value == dstParentRes.Value) return 0;
		var rtnObject = undefined;
		if(this.DataSource.isContainer(srcRes)){
			var pfid = this.DataSource.getProperty(srcRes,"id");
			var dbtype = this.DataSource.getProperty(srcRes,"dbtype");
			rtnObject = this.Database.getObject({pfid:pfid}, dbtype);
		}else{
			var pfid = this.DataSource.getProperty(srcParentRes,"id");
			var oid = this.DataSource.getProperty(srcRes,"id");
			var dbtype = this.DataSource.getProperty(srcRes,"dbtype");
			rtnObject = this.Database.getObject({oid:oid, pfid:pfid}, dbtype);
		}
		var rtn = 0;
		var i,j;
		if(rtnObject){
			for(i=0;i<rtnObject.length;i++){
				var dstFID = this.DataSource.getProperty(dstParentRes,"id");
				var dstDBType = this.DataSource.getProperty(dstParentRes,"dbtype");
				rtn |= this._merge(rtnObject[i], {fid:dstFID, dbtype:dstDBType});
				if(this._isCancel) return rtn;
			}
		}
		if(this.DataSource.isContainer(srcRes)){
			var srcFolder = this.DataSource.flattenResources(srcRes, 1, false);
			var dstFolder = this.DataSource.flattenResources(dstRes, 1, false);
			for(i=1;i<srcFolder.length;i++){
				aPram.srcRes = srcFolder[i];
				for(j=1;j<dstFolder.length;j++){
					aPram.dstRes = dstFolder[j];
					rtn |= this._mergeResource(aPram);
					if(this._isCancel) return rtn;
				}
			}
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	_merge : function(aObject, dstFolder, aDBFunc, aTransaction){
		var rtn = 0;
		try{
			if(!aObject.con_url || aObject.con_url == "") return rtn;
			if(!aDBFunc) aDBFunc = this.Database;
			var dstFID = dstFolder.fid;
			var dstDBType = dstFolder.dbtype;
			var srcOID = aObject.oid;
			var srcDBTYPE = aObject.dbtype;
			var srcTitle = aObject.oid_title.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
			var srcProperty = "";
			if(aObject.oid_property && aObject.oid_property != ""){
				try{
					var parser = new DOMParser();
					xmldoc = parser.parseFromString(aObject.oid_property, "text/xml");
					parser = undefined;
					var note = xmldoc.getElementsByTagName("NOTE")[0];
					if(note) srcProperty = note.textContent;
				}catch(e){}
			}
			var info = {};
			info.src = {
				title : srcTitle,
				note  : srcProperty,
			};
			var rtnObject;
			if(
				(aObject.con_url && aObject.con_url != "") &&
				(aObject.bgn_dom && aObject.bgn_dom != "") &&
				(aObject.end_dom && aObject.end_dom != "")
			){
				switch(this.prefs.conditionMerge){
					case 1:
						rtnObject = aDBFunc.getObjectWithProperty({con_url:aObject.con_url, bgn_dom:aObject.bgn_dom, pfid:dstFID}, dstDBType, aTransaction);
						break;
					case 2:
						rtnObject = aDBFunc.getObjectWithProperty({con_url:aObject.con_url, end_dom:aObject.end_dom, pfid:dstFID}, dstDBType, aTransaction);
						break;
					default:
						rtnObject = aDBFunc.getObjectWithProperty({con_url:aObject.con_url, bgn_dom:aObject.bgn_dom, end_dom:aObject.end_dom, pfid:dstFID}, dstDBType, aTransaction);
						break;
				}
			}else{
				rtnObject = aDBFunc.getObjectWithProperty({con_url:aObject.con_url, oid_title:srcTitle, pfid:dstFID}, dstDBType, aTransaction);
			}
			if(rtnObject){
				var i;
				for(i=0;i<rtnObject.length;i++){
					if(srcOID == rtnObject[i].oid && srcDBTYPE == rtnObject[i].dbtype) continue;
					var mergemode = 4;
					var dstTitle = rtnObject[i].oid_title.replace(/^\s+/mg,"").replace(/\s+$/mg,"");
					if(srcTitle == dstTitle){
						if(!this._isConfirm){
							if(nsPreferences.getBoolPref("wiredmarker.merge.confirmMerge",  true) && !this.Common.confirm(this.STRING.getString("CONFIRM_MERGE"))){
								this._isCancel = true;
								return rtn;
							}
							this._isConfirm = true;
						}
						var oid_property = "";
						if(rtnObject[i].oid_property && rtnObject[i].oid_property != ""){
							try{
								var parser = new DOMParser();
								xmldoc = parser.parseFromString(rtnObject[i].oid_property, "text/xml");
								parser = undefined;
								var note = xmldoc.getElementsByTagName("NOTE")[0];
								if(note) oid_property = note.textContent;
							}catch(e){}
						}
						info.dst = {
							title : dstTitle,
							note  : oid_property,
						};
						if(!this._isSameprocessing){
							mergemode = this.dispConfirm(info);
						}else{
							mergemode = this._isMergeMode;
						}
						if(mergemode == 3){	//破棄
							rtn |= 0x04;
							continue;
						}
						if(mergemode == 0){	//キャンセル
							this._isCancel = true;
							return rtn;
						}
					}
					var oid_property = rtnObject[i].oid_property;
					oid_property = oid_property.replace(/[\r\n]+/mg," __BR__ ");
					if(mergemode == 1 || mergemode == 2){
						if(oid_property.match(/^(.*<NOTE>)(.*?)(<\/NOTE>.*)$/m)){
							var prev = RegExp.$1;
							var note = "";
							if(mergemode == 1){	//マージ
								note = RegExp.$2;
								if(note != "") note += "\n";
								note += srcProperty;
							}else{	//上書き
								note = srcProperty;
							}
							var next = RegExp.$3;
							oid_property = prev + note + next;
						}else{
							oid_property = "<PROPERTY><NOTE>" + srcProperty + "</NOTE></PROPERTY>";
						}
						oid_property = oid_property.replace(/ __BR__ /mg,"\n");
						if(aDBFunc.updateObject({oid : rtnObject[i].oid, oid_property : oid_property} ,dstDBType, aTransaction)){
							if(mergemode == 1){	//マージ
								rtn |= 0x01;
							}else{	//上書き
								rtn |= 0x02;
							}
						}
					}else if(mergemode == 4){	//追加
						var pfid_order = aDBFunc.getMaxOrderFormPID(dstFID, dstDBType, aTransaction);
						var oid = aDBFunc._oidIdentify(dstDBType, aObject.oid, aTransaction);
						aObject.oid = oid;
						aObject.pfid = dstFID;
						aObject.pfid_order = ++pfid_order;
						if(aObject.dbtype) delete aObject.dbtype;
						if(aObject.fid_style) delete aObject.fid_style;
						if(aDBFunc.addObject(aObject, dstDBType, aTransaction)){
							rtn |= 0x10;
							var blobs =aDBFunc.getObjectBLOB(aObject.oid,aObject.dbtype);
							if(blobs && blobs.length>0) aDBFunc.updateObjectBLOB(aObject.oid,blobs[0],dstDBType);
						}
					}
				}
			}else{	//追加
			}
			return rtn;
		}catch(ex){
			this._dump("bitsScrapPartyMergeService._merge():ex="+ex);
			return rtn;
		}
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
