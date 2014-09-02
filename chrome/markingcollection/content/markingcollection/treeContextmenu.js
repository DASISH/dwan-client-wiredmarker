var bitsTreeContextmenu = {
/////////////////////////////////////////////////////////////////////
	init  : function(aEvent){
		var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
		if(contextmenu_mode == null){
			setTimeout(function(){
				bitsTreeContextmenu.confirm();
			},500);
		}
	},

/////////////////////////////////////////////////////////////////////
	done  : function(aEvent){
	},

/////////////////////////////////////////////////////////////////////
	confirm : function(){
		window.openDialog("chrome://markingcollection/content/treeContextmenuDialog.xul", "", "chrome,centerscreen,modal,dialog,close=no");
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};
