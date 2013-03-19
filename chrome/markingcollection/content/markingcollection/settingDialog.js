var mcSettingService = {
	
	get BrowserWindow() { return Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser"); },
	
	_rebootFlag : false,
	_lastModifiedTime : 0,
	_xmlfile : null,
	_uncategorized_use : true,
	
	get rebootFlag() { return this._rebootFlag; },
	set rebootFlag(aFlag) { this._rebootFlag = aFlag; },

	init : function(){
		window.sizeToContent();
	},

	done : function(){
		
		if(window.arguments && window.arguments[0]){
			window.arguments[0].reboot = this._rebootFlag;
		}else{
			
			var bitsMarkingCollection = mcSettingService.BrowserWindow.bitsMarkingCollection;
			var bitsContextMenu = mcSettingService.BrowserWindow.bitsContextMenu;
			
			bitsMarkingCollection.dbinfo.init(true);
			bitsContextMenu.rebuildCSS();
			
			var mcTreeViewModeService = bitsMarkingCollection._contentWindow.mcTreeViewModeService;
			var bitsTreeDate = bitsMarkingCollection._contentWindow.bitsTreeDate;
			if(mcTreeViewModeService) mcTreeViewModeService.rebuild();
			if(bitsTreeDate) bitsTreeDate.refresh();
		}
	},

};
