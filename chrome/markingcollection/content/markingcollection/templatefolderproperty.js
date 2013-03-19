var mcPropService = {

	get STRING()     { return document.getElementById("mcPropString"); },

	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	item     : null,

	init : function(){
		try {
			this.item = window.arguments[0];
		}catch(ex){
		}
		if(!this.item) return;
		if(this.item.title){
			document.title = this.item.title;
			document.getElementById("mcPropTitle").value = this.item.title;
		}
		if(this.item.note) document.getElementById("mcPropNote").value = this.item.note;
		try{document.getElementById("mcPropTitle").editor.transactionManager.clear();}catch(ex2){}
		try{document.getElementById("mcPropNote").editor.transactionManager.clear();}catch(ex2){}
		return;
	},

	accept : function(){
		var newVals = {
			title : document.getElementById("mcPropTitle").value,
			note  : this.Common.escapeComment(document.getElementById("mcPropNote").value),
		};
		var props;
		for(props in newVals){
			if(this.item[props] == newVals[props]) continue;
			window.arguments[0][props] = newVals[props];
			window.arguments[0].accept = true;
		}
	},

	cancel : function(){
		if(window.arguments[0]) window.arguments[0].accept = false;
	},
};

function _dump(aString){
	if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
}

