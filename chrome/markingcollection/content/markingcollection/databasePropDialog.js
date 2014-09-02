var mcDatabasePropService = {

	get STRING()      { return document.getElementById("mcDBPropString"); },
	get TITLE()       { return document.getElementById("mcDBPropTitleTextbox"); },
	get COMMENT()     { return document.getElementById("mcDBPropCommentTextbox"); },
	get USE()         { return document.getElementById("mcDBPropUseCheckbox"); },
	get CONTEXTMENU() { return document.getElementById("mcDBPropContextmenuCheckbox"); },
	get DEFAULT()     { return document.getElementById("mcDBPropDefaultCheckbox"); },
	get ACCEPTBTN()   { return document.getElementById("mcDBPropWindow").getButton("accept"); },
	get DB_PATH()     { return document.getElementById("mcDBPropDBPath"); },
	get DB_DATE()     { return document.getElementById("mcDBPropDBDate"); },
	get DB_SIZE()     { return document.getElementById("mcDBPropDBSize"); },
	get DB_GROUP()    { return document.getElementById("mcDBPropDatabaseGroup"); },

	get IO()         { return Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService); },

	item     : null,
	dbFile   : null,

	init : function(){
		try {
			this.item = window.arguments[0];
		}catch(ex){}
		if(!this.item) return;

		if(this.item.title) this.TITLE.value = this.item.title;
		try{this.TITLE.editor.transactionManager.clear();}catch(ex2){}
		if(this.item.comment) this.COMMENT.value = this.item.comment;
		try{this.COMMENT.editor.transactionManager.clear();}catch(ex2){}

		if(this.item.use != undefined) this.USE.checked = this.item.use;
		if(this.item.contextmenu != undefined) this.CONTEXTMENU.checked = this.item.contextmenu;
		if(this.item.default != undefined) this.DEFAULT.checked = this.item.default;
		this.DEFAULT.disabled = this.DEFAULT.checked;

		this.dbFile = null;
		this.dispDBFileInfo();

		document.title = this.TITLE.value;
	},

	done : function(){
	},

	commandDefault : function(e){
		if(this.DEFAULT.checked){
			this.USE.checked = this.DEFAULT.checked;
		}else if(!this.item.default && !this.item.use){
			this.USE.checked = this.DEFAULT.checked;
		}
	},

	commandUse : function(e){
		this.CONTEXTMENU.checked = this.USE.checked;
	},

	accept : function(){
		var changed = false;
		var newVals = {
			title       : this.TITLE.value   != "" ? this.TITLE.value   : null,
			comment     : this.COMMENT.value != "" ? this.COMMENT.value : null,
			use         : this.USE.checked,
			contextmenu : this.CONTEXTMENU.checked,
			default     : this.DEFAULT.checked,
		};
		if(newVals["title"]){
			newVals["title"] = newVals["title"].replace(/\t/mg,"        ");
			newVals["title"] = newVals["title"].replace(/[\cA\cB\cC\cD\cE\cF\cG\cH\cI\cJ\cK\cL\cM\cN\cO\cP\cQ\cR\cS\cT\cU\cV\cW\cX\cY\cZ\c[\c\\\c]\c^\c_]/mg," ");
			newVals["title"] = newVals["title"].replace(/[\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f]/mg," ");
			newVals["title"] = newVals["title"].replace(/[\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/mg," ");
			newVals["title"] = newVals["title"].replace(/[\x7f]/mg," ");
		}else{
//			window.acceptDialog();
//			return;
		}
		if(newVals["comment"]){
			newVals["comment"] = newVals["comment"].replace(/\t/mg,"        ");
			newVals["comment"] = newVals["comment"].replace(/[\r\n]/mg," __BR__ ");
			newVals["comment"] = newVals["comment"].replace(/[\cA\cB\cC\cD\cE\cF\cG\cH\cI\cJ\cK\cL\cM\cN\cO\cP\cQ\cR\cS\cT\cU\cV\cW\cX\cY\cZ\c[\c\\\c]\c^\c_]/mg," ");
			newVals["comment"] = newVals["comment"].replace(/[\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f]/mg," ");
			newVals["comment"] = newVals["comment"].replace(/[\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]/mg," ");
			newVals["comment"] = newVals["comment"].replace(/[\x7f]/mg," ");
			newVals["comment"] = newVals["comment"].replace(/ __BR__ /mg,"\n");
		}
		var props;
		for(props in newVals){

_dump(props+"=["+this.item[props]+"]["+newVals[props]+"]");

			if(this.item[props] == newVals[props]) continue;
			this.item[props] = newVals[props];
			changed = true;
		}
		if(window.arguments[0]) window.arguments[0].accept = true;
		return true;
	},

	cancel : function(){
		if(window.arguments[0]) window.arguments[0].accept = false;
	},

	dialogaccept : function(){
		try{this.TITLE.editor.transactionManager.undoTransaction();}catch(ex2){this.Common.alert(ex2)}
		this.TITLE.focus();
		return false;
	},

	input : function(){
		if(this.TITLE.value == ""){
			this.ACCEPTBTN.setAttribute("disabled","true");
		}else{
			this.ACCEPTBTN.removeAttribute("disabled");
		}
	},

	dispDBFileInfo : function(){
		if(this.item.file){
			var aURI = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
			aURI.spec = this.item.file;
			if(aURI.schemeIs("file")){
				try {
					var fileHandler = this.IO.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
					this.dbFile = fileHandler.getFileFromURLSpec(this.item.file);
				}catch(ex){
					_dump("init():ex="+ex);
					this.dbFile = null;
				}
			}
		}

_dump("dispDBFileInfo():this.dbFile="+this.dbFile);
		if(this.dbFile && this.dbFile.exists()){
			this.DB_GROUP.removeAttribute("hidden");
			this.DB_PATH.value = this.dbFile.path;
			this.DB_DATE.value = (new Date(this.dbFile.lastModifiedTime)).toLocaleString();
			this.DB_SIZE.value = this.formatFileSize(this.dbFile.fileSize);
		}else{
			this.DB_GROUP.hidden = true;
			this.DB_PATH.value = "";
			this.DB_DATE.value = "";
			this.DB_SIZE.value = "";
		}
_dump("dispDBFileInfo():DB_DATE="+this.DB_DATE.value);
	},

	formatFileSize : function(aBytes){
		if(aBytes > 1000 * 1000){
			return this.divideBy100( Math.round( aBytes / 1024 / 1024 * 100 ) ) + " MB";
		}else if( aBytes == 0 ){
			return "0 KB";
		}else{
			var kbytes = Math.round( aBytes / 1024 );
			return (kbytes == 0 ? 1 : kbytes) + " KB";
		}
	},

	divideBy100 : function(aInt){
		if(aInt % 100 == 0){
			return aInt / 100 + ".00";
		}else if(aInt % 10 == 0){
			return aInt / 100 + "0";
		}else{
			return aInt / 100;
		}
	},
};


function _dump(aString){
	if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
}

