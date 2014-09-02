var autocacheDialog = {

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("autocacheDialogString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},
	get bitsAutocacheService() { return window.opener.top.bitsAutocacheService;},

	get DIALOG() { return document.getElementById("autocacheDialog"); },
	get LIST()   { return document.getElementById("autocacheListbox"); },
	get REMOVE() { return document.getElementById("autocacheDialogRemove"); },

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(autocacheDialog._init) return;

		try {
			this.info = window.arguments[0];
		}catch(ex){
		}

		this.makeList();

		try{
			this._init = true;
		}catch(ex){
			this.Common.alert("autocacheDialog.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(this._init){
			this._init = false;
		}
	},

/////////////////////////////////////////////////////////////////////
	select : function(aEvent){
		this.DIALOG.setAttribute("buttondisabledaccept","true");
		this.REMOVE.setAttribute("disabled","true");

		if(this.LIST.selectedCount==1) this.DIALOG.removeAttribute("buttondisabledaccept");
		if(this.LIST.selectedCount>0) this.REMOVE.removeAttribute("disabled");
	},

/////////////////////////////////////////////////////////////////////
	remove : function(aEvent){
		if(this.LIST.selectedItems.length<=0) return;
		if(Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS != "Darwin"){
			if(!this.Common.confirm( this.STRING.getString("CONFIRM_DELETE") )) return;
		}

		var i;
		for(i=0;i<this.LIST.selectedItems.length;i++){
			if(!this.info.list[this.LIST.selectedItems[i].value].exists()) continue;
			this.info.list[this.LIST.selectedItems[i].value].remove(true);
		}
		this.makeList();
	},

/////////////////////////////////////////////////////////////////////
	makeList : function(){
		while(this.LIST.getRowCount()>0){
			this.LIST.removeItemAt(0);
		}
		try{
			var dir_arr = [];
			var entries = this.info.dir.directoryEntries;
			while(entries.hasMoreElements()){
				var entry = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				if(!entry.isDirectory() || (entry.isDirectory() && entry.leafName.match(/^\./))) continue;
				dir_arr.push(entry.clone());
			}
			if(dir_arr.length>0) dir_arr.sort(function(a, b) { return(parseInt(b.leafName) - parseInt(a.leafName)); });

			var i;
			for(i=0;i<dir_arr.length;i++){
				var label = dir_arr[i].leafName;
				if(label && label.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)) label = RegExp.$1+"/"+RegExp.$2+"/"+RegExp.$3+" "+RegExp.$4+":"+RegExp.$5+":"+RegExp.$6;
				var item = this.LIST.appendItem(label,i);
				if(!item) continue;
				var info = window.opener.top.bitsAutocacheService._getSaveCacheInfo(dir_arr[i]);
				if(info && info.INDEX){
					var indexFile = dir_arr[i].clone();
					indexFile.append(info.INDEX);
					if(indexFile.exists()){
						var listcell = document.createElement("listcell");
						if(listcell){
							listcell.setAttribute("label",this.formatFileSize(indexFile.fileSize));
							item.appendChild(listcell);
						}
					}
				}
			}
			this.info.list = dir_arr.concat([]);
		}catch(e){this._dump(e);}
		this.select();
	},

/////////////////////////////////////////////////////////////////////
	accept : function(aEvent){
		window.arguments[0].accept = true;
		try{ window.arguments[0].acceptdir = this.info.list[this.LIST.selectedIndex].clone(); }catch(e){}
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(aEvent){
		window.arguments[0].accept = false;
	},

/////////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};
