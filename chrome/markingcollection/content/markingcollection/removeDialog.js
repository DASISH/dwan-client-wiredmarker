var removeDialog = {

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("removeDialogString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get DIALOG()     { return document.getElementById("removeDialog"); },
	get LIST()       { return document.getElementById("removeList"); },

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(removeDialog._init) return;

		try {
			this.info = window.arguments[0];

			if(this.info.title) document.title = this.info.title;

			this.LIST.suppressonselect = true;
			if(this.info.list){
				for(var i=0;i<this.info.list.length;i++){
					this.LIST.appendItem(unescape(this.info.list[i].leafName) , this.Common.convertFilePathToURL(this.info.list[i].path));
				}
			}
			this.LIST.currentIndex = -1;
			this.LIST.clearSelection();
			this.LIST.suppressonselect = false;

			this._init = true;
		}catch(ex){
			this.Common.alert("removeDialog.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(this._init){
			this._init = false;
		}
	},

/////////////////////////////////////////////////////////////////////
	commandList : function(aEvent){
		if(this.LIST.currentIndex>=0) this.DIALOG.removeAttribute("buttondisabledaccept");
	},

/////////////////////////////////////////////////////////////////////
	accept : function(aEvent){
		window.arguments[0].accept = true;
		for(var i=this.LIST.selectedItems.length-1;i>=0;i--){
			var aFile = this.Common.convertURLToFile(this.LIST.selectedItems[i].value);
			if(aFile && aFile.exists()) aFile.remove(true);
		}
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(aEvent){
		window.arguments[0].accept = false;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};
