var spmOptionsDialog = {

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("spmOptionsDialogString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get ConditionMarker()    { return document.getElementById("spmConditionMarker"); },
	get ConditionMarkerAll() { return document.getElementById("spmConditionMarkerAll"); },
	get ConditionMarkerSt()  { return document.getElementById("spmConditionMarkerSt"); },
	get ConditionMarkerEn()  { return document.getElementById("spmConditionMarkerEn"); },
	get ConfirmMerge()       { return document.getElementById("spmConfirmMerge"); },

	prefs : {},

/////////////////////////////////////////////////////////////////////
	initPrefs : function(){
		this.prefs.conditionMerge = nsPreferences.getIntPref("wiredmarker.merge.conditionMerge", 0);
		this.prefs.confirmMerge   = nsPreferences.getBoolPref("wiredmarker.merge.confirmMerge",  true);
	},

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(spmOptionsDialog._init) return;
		try{
			this._init = true;
			this.initPrefs();
			switch(this.prefs.conditionMerge){
				case 1:
					this.ConditionMarkerSt.setAttribute("selected",true);
					this.ConditionMarkerEn.removeAttribute("selected");
					this.ConditionMarkerAll.removeAttribute("selected");
					break;
				case 2:
					this.ConditionMarkerEn.setAttribute("selected",true);
					this.ConditionMarkerSt.removeAttribute("selected");
					this.ConditionMarkerAll.removeAttribute("selected");
					break;
				default:
					this.ConditionMarkerAll.setAttribute("selected",true);
					this.ConditionMarkerSt.removeAttribute("selected");
					this.ConditionMarkerEn.removeAttribute("selected");
					break;
			}
			this.ConfirmMerge.setAttribute("checked",this.prefs.confirmMerge);

		}catch(ex){
			this.Common.alert("spmOptionsDialog.init():"+ex);
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
	accept : function(aEvent){
		nsPreferences.setIntPref("wiredmarker.merge.conditionMerge", this.prefs.conditionMerge);
		nsPreferences.setBoolPref("wiredmarker.merge.confirmMerge",  this.prefs.confirmMerge);
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(aEvent){
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};
