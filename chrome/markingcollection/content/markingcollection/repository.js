var mcRepository = {

	_passwd : "",

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get BUTTON()  { return document.getElementById("mcToolbarRepositorySettingButton"); },
	get POPUP()   { return document.getElementById("mcPopup"); },

	get PATH()    { return document.getElementById("mcRepositoryPath"); },
	get USER()    { return document.getElementById("mcRepositoryUser"); },
	get PASSWD()  { return document.getElementById("mcRepositoryPassword"); },
	get PASSWDL() { return document.getElementById("mcRepositoryPasswordLabel"); },

	get top(){
		if(window.opener){
			return window.opener.top;
		}else if(window.top){
			return window.top;
		}else{
			return null;
		}
	},
	get DataSource() { return mcRepository.top.bitsObjectMng.DataSource; },
	get Common()     { return mcRepository.top.bitsObjectMng.Common;     },
	get Database()   { return mcRepository.top.bitsObjectMng.Database;   },

	get mcMainService(){
		if(window.opener){
			return window.opener.mcMainService;
		}else{
			return mcMainService;
		}
	},

	get isChecked() {
		var aMode = mcRepository.Mode;
		var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+aMode, "");
		var user = nsPreferences.copyUnicharPref("markingcollection.repository.user", "");
		return (path!="" && user != "");
	},

	get Mode(){
		return this.Database._repositoryMode;
	},

/////////////////////////////////////////////////////////////////////
	init : function(){
		this._passwd = "";
	},

/////////////////////////////////////////////////////////////////////
	done : function(){
	},

/////////////////////////////////////////////////////////////////////
	onload : function(){
		var aMode = mcRepository.Mode;
		var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+aMode, "");
		mcRepository.PATH.value = path;
		var user = nsPreferences.copyUnicharPref("markingcollection.repository.user", "");
		mcRepository.USER.value = user;
	},

/////////////////////////////////////////////////////////////////////
	onunload : function(){
		return;
	},

/////////////////////////////////////////////////////////////////////
	ondialogaccept : function(){
		if(mcRepository.PATH.value != ""){
			var aDir = mcRepository.getNsILocalFile(mcRepository.PATH.value);
			if(!aDir || !aDir.exists()){
				if(window.arguments[0]) window.arguments[0].accept = false;
				return false;
			}
		}
		var aMode = mcRepository.Mode;
		nsPreferences.setUnicharPref("markingcollection.dbpath."+aMode  , mcRepository.PATH.value);
		nsPreferences.setUnicharPref("markingcollection.repository.user", mcRepository.USER.value);
		if(window.arguments[0]) window.arguments[0].accept = true;
	},

/////////////////////////////////////////////////////////////////////
	ondialogcancel : function(){
		if(window.arguments[0]) window.arguments[0].accept = false;
	},

/////////////////////////////////////////////////////////////////////
	getNsILocalFile : function(aPath){
		var aFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
		if(aFile) aFile.initWithPath(aPath);
		return aFile;
	},

/////////////////////////////////////////////////////////////////////
	commandRepositorySetting : function(aEvent){
		var result = {};
		window.openDialog("chrome://markingcollection/content/repositorysetting.xul", "", "chrome,centerscreen,modal", result);
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	commandRepositoryMerge : function(aEvent){
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	commandChangedRepository : function(aEvent){
		var checked = this.getRepositoryPath(aEvent);
		if(checked){
			var aMode = mcRepository.Mode;
			var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+aMode, "");
			mcRepository.PATH.value = path;
		}
		aEvent.stopPropagation();
	},

/////////////////////////////////////////////////////////////////////
	getRepositoryPath : function(aEvent){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = false;
		try{
			var picker_title = mcRepository.mcMainService.STRING.getString("SELECTED_REPOSITORY_FOLDER");
			picker.init(window, picker_title, picker.modeGetFolder);
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				var aMode = mcRepository.Mode;
				nsPreferences.setUnicharPref("markingcollection.dbpath."+aMode, picker.file.path);
				result = true;
			}
		}catch(e){
			result = false;
			this.Common.alert(e);
		}
		return result;
	},

/////////////////////////////////////////////////////////////////////
	popupshowing : function(aEvent){
		if(aEvent.originalTarget.localName != "popup") return;
		var res = mcTreeHandler.resource;
		if(!res){ aEvent.preventDefault(); return; }
		var type   = mcRepository.DataSource.getProperty(res,"type");
		var dbtype = mcRepository.DataSource.getProperty(res,"dbtype");
		var contFolderList = [];
		var contItemList = [];
		if(type.indexOf("folder")>=0){
			contFolderList = mcRepository.DataSource.flattenResources(res, 1, false);
			contItemList = mcRepository.DataSource.flattenResources(res, 2, true);
		}
		try{
			document.getElementById("mcPopupMergeContents").hidden    =  type.indexOf("folder")>=0 ;
			document.getElementById("mcPopupMerges").hidden           =  type=="item";
			document.getElementById("mcPopupMergeAllFolder").hidden   =  type=="item" || contFolderList.length<=1 || mcRepository.Database._defaultMode != dbtype;
			document.getElementById("mcPopupMergeFolder").hidden      =  type!="folder";
			document.getElementById("mcPopupMergeAllContents").hidden =  contItemList.length==0;
		}catch(ex){
			mcRepository._dump("mcRepository.popupshowing():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	lockRepository : function(){
		try{
			var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+this.Mode, "");
			var user = nsPreferences.copyUnicharPref("markingcollection.repository.user", "");
			if(path == "") return false;
			var dbLockFile = this.Common.convertPathToFile(path);
			dbLockFile.append(".repository.lock");
			if(!dbLockFile.exists()){
				try{
					dbLockFile.create(dbLockFile.DIRECTORY_TYPE, 0700);
					this.logFile = this.Common.convertPathToFile(path);
					this.logFile.append(".repository.log");
					if(this.logFile.exists()){
						this.logContent = this.Common.readFile(this.logFile);
					}else{
						this.logContent = "";
					}
					this.logContent += "["+this.Common.getTimeStamp()+"]:LOCK:"+user+"\n";
					return true;
				}catch(ex2){
					bitsObjectMng._dump("mcRepository.lockRepository():"+ex2);
					return false;
				}
			}
		}catch(ex){
			mcRepository._dump("mcRepository.lockRepository():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	unlockRepository : function(){
		try{
			var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+this.Mode, "");
			var user = nsPreferences.copyUnicharPref("markingcollection.repository.user", "");
			if(path == "") return false;
			var dbLockFile = mcRepository.Common.convertPathToFile(path);
			dbLockFile.append(".repository.lock");
			if(dbLockFile.exists()){
				try{
					this.logContent += "["+this.Common.getTimeStamp()+"]:UNLOCK:"+user+"\n";
					var tmpArr = this.logContent.split("\n");
					if(tmpArr.length>1000){
						this.logContent = tmpArr.slice(tmpArr.length-1000-1).join("\n");
					}
					this.Common.writeFile(this.logFile,this.logContent,"UTF-8");
					dbLockFile.remove(true);
				}catch(ex2){
					bitsObjectMng._dump("mcRepository.unlockRepository():"+ex2);
					return false;
				}
				return true;
			}else{
				return false;
			}
		}catch(ex){
			mcRepository._dump("mcRepository.unlockRepository():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	confirm : function(aString){
		var res = mcTreeHandler.resource;
		if(!res) return false;
		var title = mcRepository.DataSource.getProperty(res,"title");
		if(!this.Common.confirm(mcRepository.mcMainService.STRING.getString(aString) + "[ " + title + " ]")) return false;
		return true;
	},

/////////////////////////////////////////////////////////////////////
	initRepository : function(){
		if(!this.lockRepository()){
			var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+this.Mode, "");
			if(path != ""){
				var logFile = this.Common.convertPathToFile(path);
				logFile.append(".repository.log");
				var logContent = "";
				if(logFile.exists()){
					logContent = this.Common.readFile(logFile);
				}
			}
			this.Common.alert(mcRepository.mcMainService.STRING.getString("BUSY_REPOSITORY"));
			return false;
		}
		this.Database.init(this.Mode);
		return true;
	},

/////////////////////////////////////////////////////////////////////
	endRepository : function(){
		this.Database.done(this.Mode);
		this.unlockRepository();
		return true;
	},

/////////////////////////////////////////////////////////////////////
	mergeObjectExec : function(aRes,aParRes,aParTitle){
		if(!aRes) return false;
		if(!this.title2fid[aParTitle]) return false;
		var pfid = this.DataSource.getProperty(aParRes,"id");
		var oid = this.DataSource.getProperty(aRes,"id");
		var dbtype = this.DataSource.getProperty(aRes,"dbtype");
		var objects = this.Database.getObject({oid:oid,pfid:pfid},dbtype);
		if(!objects) return false;
		var rtnObject = this.existsRepositoryObject(objects[0]);
		if(rtnObject){
			this.updateRepositoryObject(objects[0],rtnObject,aParTitle);
		}else{
			this.addRepositoryObject(objects[0],aParTitle);
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
	mergeFolderExec : function(aRes,aParTitle){
		if(!aRes) return false;
		var fid = this.DataSource.getProperty(aRes,"id");
		var dbtype = this.DataSource.getProperty(aRes,"dbtype");
		var title = this.DataSource.getProperty(aRes,"title");
		var folders = this.Database.getFolderFormID(fid,dbtype);
		if(!folders) return false;
		var aResTitle = aParTitle + "\t" + folders[0].fid_title;
		aResTitle = aResTitle.replace(/^\s*/img,"");
		if(this.title2fid[aResTitle]){
			this.updateRepositoryFolder(folders[0],aResTitle);
			if(this.confirmRepositoryDeleteFolder(aRes,aParTitle,aResTitle) || this.confirmRepositoryDeleteObject(aRes,aParTitle,aResTitle)) this.getRepository();
		}else{
			this.addRepositoryFolder(folders[0],aParTitle);
		}
		var i;
		var contFolderList = this.DataSource.flattenResources(aRes, 1, false);
		for(i=0;i<contFolderList.length;i++){
			if(contFolderList[i].Value == aRes.Value) continue;
			this.mergeFolderExec(contFolderList[i],aResTitle);
		}
		var contItemList = this.DataSource.flattenResources(aRes, 2, false);
		for(i=0;i<contItemList.length;i++){
			this.mergeObjectExec(contItemList[i],aRes,aResTitle);
		}
		return true;
	},


/////////////////////////////////////////////////////////////////////
	merge : function(aEvent){
		if(!this.isChecked){
			this.commandRepositorySetting(aEvent);
			if(!this.isChecked) return;
		}
		if(!this.confirm("CONFIRM_REPOSITORY_MERGE")) return;
		this._dump("mcRepository.merge()");
		if(!this.initRepository()) return false;
		if(!this.getRepository()){
			this.endRepository();
			this.Common.alert("err!!");
			return;
		}
		var res = mcTreeHandler.resource;
		if(!res) return false;
		var parRes = null;
		if(this.DataSource.isContainer(res)){
			parRes = res;
		}else{
			parRes = this.DataSource.findParentResource(res);
		}
		var merRes = parRes;
		var merFolder = [];
		var fid = "";
		while(1){
			fid = this.DataSource.getProperty(merRes, "id");
			if(fid == "0") break;
			merFolder.push(merRes);
			merRes = this.DataSource.findParentResource(merRes);
		}
		var parTitle = "";
		var merTitle = "";
		if(merFolder.length > 0){
			var pfid;
			var dbtype;
			var i;
			for(i=merFolder.length-1;i>=0;i--){
				fid = this.DataSource.getProperty(merFolder[i], "id");
				dbtype = this.DataSource.getProperty(merFolder[i], "dbtype");
				var folders = this.Database.getFolderFormID(fid,dbtype);
				if(!folders) continue;
				parTitle = merTitle;
				merTitle += "\t" + folders[0].fid_title;
				merTitle = merTitle.replace(/^\s*/img,"");
				if(this.title2fid[merTitle]) continue;
				this.addRepositoryFolder(folders[0],parTitle);
			}
		}
		if(this.DataSource.isContainer(res)){
			if(merFolder.length > 0 && parRes.Value == res.Value){
				this.mergeFolderExec(parRes,parTitle);
			}else{
				if(this.confirmRepositoryDeleteFolder(parRes,parTitle,merTitle)) this.getRepository();
				var contFolderList = this.DataSource.flattenResources(parRes, 1, false);
				var i;
				for(i=0;i<contFolderList.length;i++){
					if(contFolderList[i].Value == parRes.Value) continue;
					this.mergeFolderExec(contFolderList[i],merTitle);
				}
			}
		}else{
			this.mergeObjectExec(res,parRes,merTitle);
		}
		this.endRepository();
	},

/////////////////////////////////////////////////////////////////////
	importObjectExec : function(aOID,aFID,aImpTitle,dbtype){
		if(aOID == undefined) return false;
		if(aFID == undefined) return false;
		if(aImpTitle == undefined) return false;
		if(dbtype == undefined) return false;
		if(!this.title2fid[aImpTitle]) return false;
		var objects = this.Database.getObject({oid:aOID,pfid:aFID},dbtype);
		if(!objects) return false;
		var rtnObject = this.existsRepositoryObject(objects[0]);
		if(rtnObject){
			if(rtnObject.oid_title    != objects[0].oid_title ||
				 rtnObject.oid_property != objects[0].oid_property){
				var dispTitle = "/" + aImpTitle.replace(/\t+/img,"/") + "/" + objects[0].oid_title;
				if(this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_UPDATE_OBJECT") + "[ " + dispTitle + " ]")){
					objects[0].oid_title = rtnObject.oid_title;
					objects[0].oid_property = rtnObject.oid_property;
					if(objects[0].dbtype) delete objects[0].dbtype;
					if(objects[0].fid_style) delete objects[0].fid_style;
					this.Database.updateObject(objects[0],dbtype);
				}
			}
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
	importFolderExec : function(aFldID,aFldTitle,aDBType){
		if(!aFldID) return false;
		if(!this.title2fid[aFldTitle] && aFldTitle != "") return false;
		if(this.title2fid[aFldTitle] && this.om_folder_hash[this.title2fid[aFldTitle]]){
			var folders = this.Database.getFolderFormID(aFldID,aDBType);
			if(folders){
				if(this.om_folder_hash[this.title2fid[aFldTitle]].fid_property != folders[0].fid_property ||
					 this.om_folder_hash[this.title2fid[aFldTitle]].fid_style    != folders[0].fid_style){
					var dispTitle = "/" + aFldTitle.replace(/\t+/img,"/");
					if(this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_UPDATE_FOLDER") + "[ " + dispTitle + " ]1")){
						folders[0].fid_property = this.om_folder_hash[this.title2fid[aFldTitle]].fid_property;
						folders[0].fid_style = this.om_folder_hash[this.title2fid[aFldTitle]].fid_style;
						if(folders[0].dbtype) delete folders[0].dbtype;
						this.Database.updateFolder(folders[0],aDBType);
					}
				}
			}
		}
		if(this.pfid2fid[aFldID] && this.pfid2fid[aFldID].length>0){
			var folders = this.Database.getFolderFormPID(aFldID,aDBType);
			var i,j,fid;
			for(i=0;i<this.pfid2fid[aFldID].length;i++){
				fid = this.pfid2fid[aFldID][i];
				var folder = null;
				if(folders){
					for(j=0;j<folders.length;j++){
						var fldTitle = aFldTitle + "\t" + folders[j].fid_title;
						fldTitle = fldTitle.replace(/^\s*/img,"");
						if(!this.title2fid[fldTitle] || this.title2fid[fldTitle] != fid) continue;
						folder = folders[j];
						break;
					}
				}
				if(folder){
					if(this.om_folder_hash[fid].fid_property != folder.fid_property ||
						 this.om_folder_hash[fid].fid_style    != folder.fid_style){
						var dispTitle = "/" + aFldTitle.replace(/\t+/img,"/") + "/" + folder.fid_title;
						if(this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_UPDATE_FOLDER") + "[ " + dispTitle + " ]2")){
							folder.fid_property = this.om_folder_hash[fid].fid_property;
							folder.fid_style = this.om_folder_hash[fid].fid_style;
							if(folder.dbtype) delete folder.dbtype;
							this.Database.updateFolder(folder,aDBType);
						}
					}
				}else{
					folder = this.om_folder_hash[fid];
					folder.fid = this.Database._fidIdentify(aDBType,folder.fid);
					folder.pfid = aFldID;
					this.Database.addFolder(folder,aDBType);
				}
				var fldTitle = aFldTitle + "\t" + folder.fid_title;
				fldTitle = fldTitle.replace(/^\s*/img,"");
				this.importFolderExec(folder.fid,fldTitle,aDBType);
			}
		}
		if(this.pfid2oid[aFldID] && this.pfid2oid[aFldID].length>0){
			var objects = this.Database.getObjectFormPID(aFldID,aDBType);
			var i,j,oid;
			for(i=0;i<this.pfid2oid[aFldID].length;i++){
				oid = this.pfid2oid[aFldID][i];
				var object = null;
				if(objects){
					for(j=0;j<objects.length;j++){

						if(
							this.om_object_hash[oid].doc_url  != objects[j].doc_url ||
							this.om_object_hash[oid].con_url  != objects[j].con_url ||
							this.om_object_hash[oid].bgn_dom  != objects[j].bgn_dom ||
							this.om_object_hash[oid].end_dom  != objects[j].end_dom ||
							this.om_object_hash[oid].oid_type != objects[j].oid_type
						) continue;

						object = objects[j];
						break;
					}
				}
				if(object){
					if(this.om_object_hash[oid].oid_title    != object.oid_title ||
						 this.om_object_hash[oid].oid_property != object.oid_property){
						var dispTitle = "/" + aFldTitle.replace(/\t+/img,"/") + "/" + object.oid_title;
						if(this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_UPDATE_OBJECT") + "[ " + dispTitle + " ]")){
							object.oid_title = this.om_object_hash[oid].oid_title;
							object.oid_property = this.om_object_hash[oid].oid_property;
							if(object.dbtype) delete object.dbtype;
							if(object.fid_style) delete object.fid_style;
							this.Database.updateObject(object,aDBType);
						}
					}
				}else{
					object = this.om_object_hash[oid];
					object.oid = this.Database._oidIdentify(aDBType,object.oid);
					object.pfid = aFldID;
					this.Database.addObject(object,aDBType);
					var blob = this.Database.getObjectBLOB(oid,this.Mode);
					if(blob && blob.length>0 && blob[0].length>0){
						this.Database.updateObjectBLOB(oid,blob[0],aDBType);
					}
				}
			}
		}
		return true;
	},


/////////////////////////////////////////////////////////////////////
	import : function(aEvent){
		if(!this.isChecked){
			this.commandRepositorySetting(aEvent);
			if(!this.isChecked) return;
		}
		if(!this.confirm("CONFIRM_REPOSITORY_IMPOER")) return;
		this._dump("mcRepository.import()");
		if(!this.initRepository()) return false;
		if(!this.getRepository()){
			this.Common.alert("err!!");
			return;
		}
		var res = mcTreeHandler.resource;
		if(!res) return false;
		var parRes = null;
		if(this.DataSource.isContainer(res)){
			parRes = res;
		}else{
			parRes = this.DataSource.findParentResource(res);
		}
		var impRes = parRes;
		var impFolder = [];
		var fid = "";
		while(1){
			fid = this.DataSource.getProperty(impRes, "id");
			if(fid == "0") break;
			impFolder.push(impRes);
			impRes = this.DataSource.findParentResource(impRes);
		}
		var impTitle = "";
		if(impFolder.length > 0){
			var pfid;
			var dbtype;
			var i;
			for(i=impFolder.length-1;i>=0;i--){
				fid = this.DataSource.getProperty(impFolder[i], "id");
				dbtype = this.DataSource.getProperty(impFolder[i], "dbtype");
				var folders = this.Database.getFolderFormID(fid,dbtype);
				if(!folders) continue;

				impTitle += "\t" + folders[0].fid_title;
				impTitle = impTitle.replace(/^\s*/img,"");
			}
		}
		if(this.DataSource.isContainer(res)){
			fid = this.DataSource.getProperty(res, "id");
			var dbtype = this.DataSource.getProperty(res,"dbtype");
			this.importFolderExec(fid.toString(),impTitle,dbtype);
		}else{
			fid = this.DataSource.getProperty(parRes, "id");
			var oid = this.DataSource.getProperty(res, "id");
			var dbtype = this.DataSource.getProperty(res,"dbtype");
			this.importObjectExec(oid.toString(),fid.toString(),impTitle,dbtype);
		}
		this.endRepository();
	},

/////////////////////////////////////////////////////////////////////
	getRepository : function(){
		try{
			var aMode = this.Mode;
			if(!this.Database.beginTransaction(aMode)) return false;
			var oSql = 'select * from om_object';
			var lSql = 'select * from om_link';
			var fSql = 'select * from om_folder';
			var i;
			this.om_object_hash = [];
			this.om_folder_hash = [];
			this.oid2pfid = [];
			this.pfid2oid = [];
			this.fid2pfid = [];
			this.pfid2fid = [];
			this.title2fid = [];
			this.fid2title = [];
			this.om_object = this.Database.select(aMode,oSql,false);
			this.om_link = this.Database.select(aMode,lSql,false);
			this.om_folder = this.Database.select(aMode,fSql,false);
			if(this.om_link && this.om_link.length>0){
				for(i=0;i<this.om_link.length;i++){
					if(!this.oid2pfid[this.om_link[i].oid.toString()])  this.oid2pfid[this.om_link[i].oid.toString()] = [];
					if(!this.pfid2oid[this.om_link[i].pfid.toString()]) this.pfid2oid[this.om_link[i].pfid.toString()] = [];
					this.oid2pfid[this.om_link[i].oid.toString()].push(this.om_link[i].pfid);
					this.pfid2oid[this.om_link[i].pfid.toString()].push(this.om_link[i].oid);
				}
			}
			if(this.om_object && this.om_object.length>0){
				for(i=0;i<this.om_object.length;i++){
					this.om_object_hash[this.om_object[i].oid.toString()] = this.om_object[i];
				}
			}
			if(this.om_folder && this.om_folder.length>0){
				for(i=0;i<this.om_folder.length;i++){
					this.om_folder_hash[this.om_folder[i].fid.toString()] = this.om_folder[i];
					if(!this.fid2pfid[this.om_folder[i].fid.toString()])  this.fid2pfid[this.om_folder[i].fid.toString()] = [];
					if(!this.pfid2fid[this.om_folder[i].pfid.toString()]) this.pfid2fid[this.om_folder[i].pfid.toString()] = [];
					this.fid2pfid[this.om_folder[i].fid.toString()].push(this.om_folder[i].pfid);
					this.pfid2fid[this.om_folder[i].pfid.toString()].push(this.om_folder[i].fid);
				}
				this.makeTitle2Folder("0");
			}
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			mcRepository._dump("mcRepository.getRepository():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	makeTitle2Folder : function(aPFid){
		var pfid = aPFid.toString();
		if(!this.pfid2fid[pfid]) return;
		var i;
		for(i=0;i<this.pfid2fid[pfid].length;i++){
			var title = "";
			if(this.fid2title[pfid]) title = this.fid2title[pfid] + "\t";
			var fid = this.pfid2fid[pfid][i].toString();
			title += this.om_folder_hash[fid].fid_title;
			this.fid2title[fid] = title;
			this.title2fid[title] = fid;
			this.makeTitle2Folder(fid);
		}
	},

/////////////////////////////////////////////////////////////////////
	addRepositoryFolder : function(aFolder,aParTitle){
		try{
			var aMode = this.Mode;
			var aTitle = aParTitle + "\t" + aFolder.fid_title;
			aTitle = aTitle.replace(/^\s*/img,"");
			var dispTitle = "/" + aTitle.replace(/\t+/img,"/");
		if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_ADD_FOLDER") + "[ " + dispTitle + " ]")) return false;
			if(!this.Database.beginTransaction(aMode)) return false;
			aFolder.fid = this.Database._fidIdentify(aMode,aFolder.fid,false);
			if(this.title2fid[aParTitle]){
				aFolder.pfid = this.title2fid[aParTitle];
			}else{
				aFolder.pfid = "0";
			}
			if(aFolder.dbtype) delete aFolder.dbtype;
			this.Database.addFolder(aFolder,aMode,false);
			this.om_folder_hash[aFolder.fid.toString()] = aFolder;
			if(!this.fid2pfid[aFolder.fid.toString()])  this.fid2pfid[aFolder.fid.toString()] = [];
			if(!this.pfid2fid[aFolder.pfid.toString()]) this.pfid2fid[aFolder.pfid.toString()] = [];
			this.fid2pfid[aFolder.fid.toString()].push(aFolder.pfid);
			this.pfid2fid[aFolder.pfid.toString()].push(aFolder.fid);
			this.fid2title[aFolder.fid.toString()] = aTitle;
			this.title2fid[aTitle] = aFolder.fid;
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			mcRepository._dump("mcRepository.addRepositoryFolder():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	updateRepositoryFolder : function(aFolder,aResTitle){
		try{
			var aMode = this.Mode;
			if(!this.title2fid[aResTitle]) return false;
			var fid = this.title2fid[aResTitle];
			if(this.om_folder_hash[fid].fid_property == aFolder.fid_property && this.om_folder_hash[fid].fid_style == aFolder.fid_style) return true;
			var dispTitle = "/" + aResTitle.replace(/\t+/img,"/");
			if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_UPDATE_FOLDER") + "[ " + dispTitle + " ]")) return false;
			if(!this.Database.beginTransaction(aMode)) return false;
			aFolder.fid = this.title2fid[aResTitle];
			aFolder.pfid = this.om_folder_hash[aFolder.fid.toString()].pfid;
			if(aFolder.dbtype) delete aFolder.dbtype;
			this.Database.updateFolder(aFolder,aMode,false);
			this.om_folder_hash[aFolder.fid.toString()] = aFolder;
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			this._dump("mcRepository.updateRepositoryFolder():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	confirmRepositoryDeleteFolder : function(parRes,parTitle,merTitle){
		var rtn = false;
		var contFolderList = this.DataSource.flattenResources(parRes, 1, false);
		var i;
		var usefid = [];
		for(i=0;i<contFolderList.length;i++){
			if(contFolderList[i].Value == parRes.Value) continue;
			var resTitle = merTitle + "\t" + this.DataSource.getProperty(contFolderList[i], "title");
			resTitle = resTitle.replace(/^\s*/img,"");
			if(!this.title2fid[resTitle]) continue;
			var fid = this.title2fid[resTitle];
			usefid[fid.toString()] = fid;
		}
		var pfid = "0";
		if(this.title2fid[merTitle]) pfid = this.title2fid[merTitle].toString();
		if(this.pfid2fid[pfid] && this.pfid2fid[pfid].length>0){
			for(i=0;i<this.pfid2fid[pfid].length;i++){
				var fid = this.pfid2fid[pfid][i].toString();
				if(usefid[fid]) continue;
				var msgTitle = "/" + this.fid2title[fid].replace(/\t+/img,"/");
				if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_DELETE_FOLDER") + "[ " + msgTitle + " ]")) continue;
				rtn = this.deleteRepositoryFolder(fid);
			}
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	deleteRepositoryFolder : function(aFID){
		try{
			var aMode = this.Mode;
			if(!this.Database.beginTransaction(aMode)) return false;
			this.Database.removeFolder(aFID,aMode,false);
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			mcRepository._dump("mcRepository.deleteRepositoryFolder():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	existsRepositoryObject : function(aObject,aParTitle){
		var rtnObject = null;
		var oid;
		for(oid in this.om_object_hash){
			if(typeof this.om_object_hash[oid] == "function") continue;
			if(
				this.om_object_hash[oid].doc_url  != aObject.doc_url ||
				this.om_object_hash[oid].con_url  != aObject.con_url ||
				this.om_object_hash[oid].bgn_dom  != aObject.bgn_dom ||
				this.om_object_hash[oid].end_dom  != aObject.end_dom ||
				this.om_object_hash[oid].oid_type != aObject.oid_type
			) continue;
			rtnObject = this.om_object_hash[oid];
			break;
		}
		return rtnObject;
	},

/////////////////////////////////////////////////////////////////////
	addRepositoryObject : function(aObject,aParTitle){
		var aMode = this.Mode;
		try{
			var dispTitle = "/" + aParTitle.replace(/\t+/img,"/") + "/" + aObject.oid_title;
			if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_ADD_OBJECT") + "[ " + dispTitle + " ]")) return false;
			if(!this.Database.beginTransaction(aMode)) return false;
			aObject.oid = this.Database._oidIdentify(aMode,aObject.oid,false);
			if(this.title2fid[aParTitle]){
				aObject.pfid = this.title2fid[aParTitle];
			}else{
				aObject.pfid = "0";
			}
			var blob = this.Database.getObjectBLOB(aObject.oid,aObject.dbtype,false);
			if(aObject.dbtype) delete aObject.dbtype;
			if(aObject.fid_style) delete aObject.fid_style;
			this.Database.addObject(aObject,aMode,false);
			if(blob && blob.length>0 && blob[0].length>0){
				this.Database.updateObjectBLOB(aObject.oid,blob[0],aMode,false);
			}
			this.om_object_hash[aObject.oid.toString()] = aObject;
			if(!this.oid2pfid[aObject.oid.toString()])  this.oid2pfid[aObject.oid.toString()] = [];
			if(!this.pfid2oid[aObject.pfid.toString()]) this.pfid2oid[aObject.pfid.toString()] = [];
			this.oid2pfid[aObject.oid.toString()].push(aObject.pfid);
			this.pfid2oid[aObject.pfid.toString()].push(aObject.oid);
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			this._dump("mcRepository.addRepositoryObject():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	updateRepositoryObject : function(aObject,aRObject,aParTitle){
		var aMode = this.Mode;
		try{
			var addlink = true;
			var pfid;
			if(this.title2fid[aParTitle]){
				pfid = this.title2fid[aParTitle];
			}else{
				pfid = "0";
			}
			if(this.oid2pfid[aObject.oid.toString()] && this.oid2pfid[aObject.oid.toString()].length>0){
				var i;
				for(i=0;i<this.oid2pfid[aObject.oid.toString()].length;i++){
					if(pfid != this.oid2pfid[aObject.oid.toString()][i]) continue;
					addlink = false;
					break;
				}
			}
			if(!addlink && aRObject.oid_title == aObject.oid_title && aRObject.oid_property == aObject.oid_property) return true;
			var dispTitle = "/" + aParTitle.replace(/\t+/img,"/") + "/" + aObject.oid_title;
			if(addlink){
				if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_ADD_OBJECT") + "[ " + dispTitle + " ]")) return false;
			}else{
				if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_UPDATE_OBJECT") + "[ " + dispTitle + " ]")) return false;
			}
			if(!this.Database.beginTransaction(aMode)) return false;
			if(aRObject.oid_title != aObject.oid_title || aRObject.oid_property != aObject.oid_property){
				aRObject.oid_title = aObject.oid_title;
				aRObject.oid_property = aObject.oid_property;
				if(aRObject.dbtype) delete aRObject.dbtype;
				if(aRObject.fid_style) delete aRObject.fid_style;
				if(aRObject.pfid) delete aRObject.pfid;
				this.Database.updateObject(aRObject,aMode,false);
				this.om_object_hash[aRObject.oid.toString()] = aRObject;
			}
			if(addlink){
				this.Database.addLink({oid:aRObject.oid,pfid:pfid,pfid_order:aObject.pfid_order},aMode,false);
				if(!this.oid2pfid[aRObject.oid.toString()])  this.oid2pfid[aRObject.oid.toString()] = [];
				if(!this.pfid2oid[pfid.toString()]) this.pfid2oid[pfid.toString()] = [];
				this.oid2pfid[aRObject.oid.toString()].push(pfid);
				this.pfid2oid[pfid.toString()].push(aRObject.oid);
			}
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			this._dump("mcRepository.updateRepositoryObject():"+ex);
			return false;
		}
	},

/////////////////////////////////////////////////////////////////////
	confirmRepositoryDeleteObject : function(parRes,parTitle,merTitle){
		var rtn = false;
		var contObjectList = this.DataSource.flattenResources(parRes, 2, false);
		var i;
		var usefid = [];
		var pfid = "0";
		if(this.title2fid[merTitle]) pfid = this.title2fid[merTitle].toString();
		for(i=0;i<contObjectList.length;i++){
			var oid = this.DataSource.getProperty(contObjectList[i], "id");
			var dbtype = this.DataSource.getProperty(contObjectList[i], "dbtype");
			var objects = this.Database.getObject({oid:oid,pfid:pfid},dbtype);
			if(!objects) continue;
			var object = this.existsRepositoryObject(objects[0],merTitle);
			if(!object) continue;
			usefid[oid.toString()] = object.oid;
		}
		if(this.pfid2oid[pfid] && this.pfid2oid[pfid].length>0){
			for(i=0;i<this.pfid2oid[pfid].length;i++){
				var oid = this.pfid2oid[pfid][i].toString();
				if(usefid[oid]) continue;
				var msgTitle = "/" + this.fid2title[pfid].replace(/\t+/img,"/") + "/" + this.om_object_hash[oid].oid_title;
				if(!this.Common.confirm(this.mcMainService.STRING.getString("CONFIRM_REPOSITORY_DELETE_OBJECT") + "[ " + msgTitle + " ]")) continue;
				rtn = this.deleteRepositoryObject({oid:oid,pfid:pfid});
			}
		}
		return rtn;
	},

/////////////////////////////////////////////////////////////////////
	deleteRepositoryObject : function(aObject){
		try{
			var aMode = this.Mode;
			if(!this.Database.beginTransaction(aMode)) return false;
			this.Database.removeObject(aObject,aMode,false);
			this.Database.endTransaction(aMode);
			return true;
		}catch(ex){
			try{ this.Database.endTransaction(aMode); }catch(ex2){}
			mcRepository._dump("mcRepository.deleteRepositoryObject():"+ex);
			return false;
		}
	},


/////////////////////////////////////////////////////////////////////
	_dump : function (aString){
		if(nsPreferences.getBoolPref("scrapparty.debug", false)) window.dump(aString+"\n");
	},
};
