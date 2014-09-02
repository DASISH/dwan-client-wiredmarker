var mcTreeSharedFolder = {

	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },
	get BUTTON()   { return document.getElementById("mcToolbarSharedFolderButton"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },

	get isChecked() {
		var checked = this.BUTTON.getAttribute("checked");
		if(!checked || checked == "false"){
			checked = false;
		}else{
			checked = true;
		}
		return checked;
	},

	get Mode(){
		return this.Database._sharedMode;
	},

	init : function(){
		var view = this.Common.getBoolPref("markingcollection.sharedfolder.view", false);
		this.BUTTON.setAttribute("checked",view);

		if(view){
			var aMode = mcTreeSharedFolder.Mode;
			mcTreeSharedFolder.Database.init(aMode);
			mcTreeSharedFolder.initMarkerFolder(aMode);
		}
	},

	done : function(){
	},

	getNsILocalFile : function(aPath){
		var aFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
		if(aFile) aFile.initWithPath(aPath);
		return aFile;
	},

	commandDispSharedFolder : function(aEvent){
		var checked = this.isChecked;
		if(!checked){
			checked = true;
		}else{
			checked = false;
		}
		var aMode = mcTreeSharedFolder.Mode;
		if(!checked){
			this.BUTTON.setAttribute("checked",checked);
			this.Common.PREF.setBoolPref("markingcollection.sharedfolder.view",checked);
			mcTreeSharedFolder.Database.done(aMode);
			mcTreeViewModeService.rebuild();
		}else{
			var path = nsPreferences.copyUnicharPref("markingcollection.dbpath."+aMode, "");
			if(path == "") checked = this.commandGetSharedFolderPath(aEvent);
			if(checked){
				this.BUTTON.setAttribute("checked",checked);
				this.Common.PREF.setBoolPref("markingcollection.sharedfolder.view",checked);
				mcTreeSharedFolder.Database.done(aMode);
				mcTreeSharedFolder.Database.init(aMode);
				mcTreeSharedFolder.initMarkerFolder(aMode);
				mcTreeViewModeService.rebuild();
			}
		}
		aEvent.stopPropagation();
	},

	commandChangedSharedFolder : function(aEvent){
		var checked = this.commandGetSharedFolderPath(aEvent);
		if(checked){
			var aMode = mcTreeSharedFolder.Mode;
			mcTreeSharedFolder.Database.done(aMode);
			mcTreeSharedFolder.Database.init(aMode);
			mcTreeSharedFolder.initMarkerFolder(aMode);
			mcTreeViewModeService.rebuild();
		}
		aEvent.stopPropagation();
	},

	commandGetSharedFolderPath : function(aEvent){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = false;
		try{
			var picker_title = mcMainService.STRING.getString("SELECTED_SHARED_FOLDER");
			picker.init(window, picker_title, picker.modeGetFolder);
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				var aMode = mcTreeSharedFolder.Mode;
				mcTreeSharedFolder.Database.done(aMode);
				nsPreferences.setUnicharPref("markingcollection.dbpath."+aMode, picker.file.path);
				result = true;
			}
		}catch(e){
			result = false;
			this.Common.alert(e);
		}
		return result;
	},

	createMarkerFolder : function(aMode,pTitle,pTarResName,pStyle,pIndex,pPID,pOrder){
		try{
			if(!pPID) pPID = 0;
			var newID = this.DataSource.identify(this.Common.getTimeStamp());
			var newFolder = this.Database.newFolder(newID,aMode);
			newFolder.fid_title = pTitle;
			newFolder.fid_style = pStyle;
			newFolder.pfid = ""+pPID;
			if(pOrder) newFolder.pfid_order = ""+pOrder;
			if(!pPID) newFolder.fid_mode = ""+0x0002;
			if(!this.Database.addFolder(newFolder,aMode)) return null;
			return newFolder.fid;
		}catch(e){
			_dump("bitsContextMenu.createMarkerFolder():"+e);
			return null;
		}
	},

	initMarkerFolder : function(aMode){
		if(this.Database._fidCount(aMode) == 0){
			var folder_title = mcMainService.STRING.getString("MARKER_FOLDER");
			var pfid = this.createMarkerFolder(aMode,folder_title,undefined,undefined,undefined,undefined,1);
			var i;
			for(i=8;i>0;i--){
				var idx = i;
				var title = folder_title + idx;
				var cssText = nsPreferences.copyUnicharPref("markingcollection.marker.style." + idx, bitsMarker.PRESET_STYLES[idx]);
				this.createMarkerFolder(aMode,title,undefined,cssText,idx,pfid,idx);
			}
		}
	},

};
