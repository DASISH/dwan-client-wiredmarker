var spmConfirmDialog = {

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("spmConfirmDialogString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get S_TITLE()    { return document.getElementById("spmSrcTitle"); },
	get S_NODE()     { return document.getElementById("spmSrcNote"); },
	get D_TITLE()    { return document.getElementById("spmDstTitle"); },
	get D_NODE()     { return document.getElementById("spmDstNote"); },
	get SAMEPROCESS(){ return document.getElementById("spmConfirmSameProcessing"); },

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(spmConfirmDialog._init) return;

		try {
			this.info = window.arguments[0];
		}catch(ex){
		}

		this.S_TITLE.value = this.info.src.title;
		this.S_NODE.value  = this.info.src.note;
		this.D_TITLE.value = this.info.dst.title;
		this.D_NODE.value  = this.info.dst.note;

		try{
			this._init = true;
		}catch(ex){
			this.Common.alert("spmConfirmDialog.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(this._init){
			this._init = false;
		}
	},

/////////////////////////////////////////////////////////////////////
	commandCondition : function(aEvent){
		this.prefs.conditionMerge = this.ConditionMarker.value;
	},

/////////////////////////////////////////////////////////////////////
	commandConfirm : function(aEvent){
		this.prefs.confirmMerge = this.ConfirmMerge.checked;
	},

/////////////////////////////////////////////////////////////////////
	getSameProcessing : function(){
		return (this.SAMEPROCESS.getAttribute("checked")=="true"?true:false);
	},

/////////////////////////////////////////////////////////////////////
	merge : function(aEvent){
		window.arguments[1].accept = 1;
		window.arguments[1].sameprocessing = spmConfirmDialog.getSameProcessing();
	},

/////////////////////////////////////////////////////////////////////
	overwrite : function(aEvent){
		window.arguments[1].accept = 2;
		window.arguments[1].sameprocessing = spmConfirmDialog.getSameProcessing();
		window.close();
	},

/////////////////////////////////////////////////////////////////////
	destruction : function(aEvent){
		window.arguments[1].accept = 3;
		window.arguments[1].sameprocessing = spmConfirmDialog.getSameProcessing();
		window.close();
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(aEvent){
		window.arguments[1].accept = 0;
		window.arguments[1].sameprocessing = spmConfirmDialog.getSameProcessing();
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};
