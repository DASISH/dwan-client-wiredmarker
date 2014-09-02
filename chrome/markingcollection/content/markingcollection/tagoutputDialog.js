var tagoutputDialog = {

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("tagoutputDialogString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get DIALOG() { return document.getElementById("tagoutputDialog"); },
	get STYLE_NO()   { return document.getElementById("no_style"); },
	get STYLE_WITH() { return document.getElementById("with_style"); },
	get VISIBILITY_VISIBLE() { return document.getElementById("visible"); },
	get VISIBILITY_HIDDEN()  { return document.getElementById("hidden"); },
	get FORMAT() { return document.getElementById("format"); },
	get PATH() { return document.getElementById("path"); },

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(tagoutputDialog._init) return;

		try {
			this.info = window.arguments[0];
		}catch(ex){
		}

		if(this.info.hidden){
			this.VISIBILITY_HIDDEN.setAttribute("selected","true");
			this.VISIBILITY_VISIBLE.removeAttribute("selected");
		}else{
			this.VISIBILITY_VISIBLE.setAttribute("selected","true");
			this.VISIBILITY_HIDDEN.removeAttribute("selected");
		}

		if(this.info.style){
			this.STYLE_WITH.setAttribute("selected","true");
			this.STYLE_NO.removeAttribute("selected");
		}else{
			this.STYLE_NO.setAttribute("selected","true");
			this.STYLE_WITH.removeAttribute("selected");
		}

		this.setFormatString();

		this.PATH.checked = this.info.rpath;

		try{
			this._init = true;
		}catch(ex){
			this.Common.alert("tagoutputDialog.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(this._init){
			this._init = false;
		}
	},

/////////////////////////////////////////////////////////////////////
	setFormatString : function(){
		if(this.STYLE_WITH.selected || this.VISIBILITY_HIDDEN.selected){
			this.FORMAT.setAttribute("value",this.STRING.getString("MSG_FILE_FORMAT_HTML"));
		}else{
			this.FORMAT.setAttribute("value",this.STRING.getString("MSG_FILE_FORMAT_ORIGINAL"));
		}
	},

/////////////////////////////////////////////////////////////////////
	style : function(aEvent){
		if(aEvent.target.value == 'with'){
			this.STYLE_WITH.setAttribute("selected","true");
			this.STYLE_NO.removeAttribute("selected");
			this.info.style = true;
		}else{
			this.STYLE_NO.setAttribute("selected","true");
			this.STYLE_WITH.removeAttribute("selected");
			this.info.style = false;
		}
		this.setFormatString();
	},

/////////////////////////////////////////////////////////////////////
	visibility : function(aEvent){
		if(aEvent.target.value == 'hidden'){
			this.VISIBILITY_HIDDEN.setAttribute("selected","true");
			this.VISIBILITY_VISIBLE.removeAttribute("selected");
			this.info.hidden = true;
		}else{
			this.VISIBILITY_VISIBLE.setAttribute("selected","true");
			this.VISIBILITY_HIDDEN.removeAttribute("selected");
			this.info.hidden = false;
		}
		this.setFormatString();
	},

/////////////////////////////////////////////////////////////////////
	path : function(aEvent){
		this.info.rpath = aEvent.target.checked;
	},

/////////////////////////////////////////////////////////////////////
	accept : function(aEvent){
		window.arguments[0].accept = true;
		return true;
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(aEvent){
		window.arguments[0].accept = false;
		return true;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};
