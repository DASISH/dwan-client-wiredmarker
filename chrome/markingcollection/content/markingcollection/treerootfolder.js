/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var mcTreeRootFolder = {

	get idMENU()        { return "mcToolbarRootFolderButton"; },
	get idMENU_ALL()    { return "mcMenuRootFolderAll"; },
	get idMENU_SELECT() { return "mcMenuRootFolderSelect"; },
	get idMENU_ROOT()   { return "mcPopupRootFolder"; },
	get idMENU_POPUP()  { return "mcMenuRootFolderPopup"; },
	get MENU()          { return document.getElementById(this.idMENU); },
	get MENU_ALL()      { return document.getElementById(this.idMENU_ALL); },
	get MENU_SELECT()   { return document.getElementById(this.idMENU_SELECT); },
	get MENU_ROOT()     { return document.getElementById(this.idMENU_ROOT); },
	get MENU_POPUP()    { return document.getElementById(this.idMENU_POPUP); },
	get TITLE()         { return window.top.document.getElementById("sidebar-title"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser() { return window.top.bitsObjectMng.getBrowser();},

	baseURL  : "",
	shouldRebuild : false,

	init : function(){
		if(mcItemView.isChecked){
			mcTreeRootFolder.MENU_ROOT.setAttribute("hidden","true");
		}else{
			mcTreeRootFolder.MENU_ROOT.removeAttribute("hidden");
		}
	},

	rebuild : function(){},

	onPopupShowing : function(aEvent, aPopupRoot){
		var res = mcTreeHandler.resource;
		try{
			if(!res){
				mcTreeRootFolder.MENU_SELECT.setAttribute("disabled","true");
			}else{
				if(mcTreeHandler.TREE.view.isContainerEmpty(mcTreeHandler.TREE.currentIndex))
					mcTreeRootFolder.MENU_SELECT.setAttribute("disabled","true");
				else
					mcTreeRootFolder.MENU_SELECT.removeAttribute("disabled");
			}
		}catch(e){
			mcTreeRootFolder.MENU_SELECT.setAttribute("disabled","true");
		}
	},

	onClick : function(aEvent){
		if(aEvent.target.id == mcTreeRootFolder.idMENU){
			return;
		}else if(aEvent.target.id == mcTreeRootFolder.idMENU_ALL){
			nsPreferences.setUnicharPref("wiredmarker.rootfolder", "");
			nsPreferences.setUnicharPref("wiredmarker.rootfolder_dbtype", "");
			mcTreeViewModeService.rebuild();
		}else if(aEvent.target.id == mcTreeRootFolder.idMENU_SELECT){
			var res = mcTreeHandler.resource;
			if(!res) return;
			var baseID = this.DataSource.getProperty(res, "id");
			var dbtype = this.DataSource.getProperty(res, "dbtype");
			var title = this.DataSource.getProperty(res, "title");
			nsPreferences.setUnicharPref("wiredmarker.rootfolder", baseID);
			nsPreferences.setUnicharPref("wiredmarker.rootfolder_dbtype", dbtype);
			mcTreeViewModeService.rebuild();
		}else{
			var disabled = aEvent.target.getAttribute("disabled");
			if(disabled == "true") return;
			var res = this.Common.RDF.GetResource(aEvent.target.id)
			var baseID = this.DataSource.getProperty(res, "id");
			var dbtype = this.DataSource.getProperty(res, "dbtype");
			var title = this.DataSource.getProperty(res, "title");
			nsPreferences.setUnicharPref("wiredmarker.rootfolder", baseID);
			nsPreferences.setUnicharPref("wiredmarker.rootfolder_dbtype", dbtype);
			mcTreeViewModeService.rebuild();
			this.MENU_POPUP.hidePopup();
		}
		aEvent.stopPropagation();
	},

	_changeTitle : function(aTitle){
		var label = "";
		var viewmode = mcTreeViewModeService.viewmode;
		switch (viewmode){
			case "each" :
				label = mcTreeViewModeService.EACH.getAttribute("label");
				break;
			case "single" :
				label = mcTreeViewModeService.SINGLE.getAttribute("label");
				break;
			default :
				label = mcTreeViewModeService.ALL.getAttribute("label");
				break;
		}
		var title = aTitle;
		if(!title) title = mcMainService.STRING.getString("DEFAULT_FOLDER");
		var button_title = mcMainService.STRING.getString("APP_DISP_TITLE");
		button_title += " [ " + label + " ]" + " [ " + title + " ]";
		this.TITLE.setAttribute("value",button_title);
	},

};

