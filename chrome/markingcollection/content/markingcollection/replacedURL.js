var mcReplacedURL = {

	get STRING()     { return document.getElementById("mcRepString"); },
	get SEARCHLIST() { return document.getElementById("mcRepSearchMenulist"); },
	get REPLACETEXT(){ return document.getElementById("mcRepReplaceTextbox"); },
	get ACCEPTBTN()  { return document.getElementById("mcRepDialog").getButton("accept"); },
	get REPLACEBTN() { return document.getElementById("mcRepReplaceButton"); },
	get REPLACETAR() { return document.getElementById("mcRepTargetDirectory"); },

	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	item     : null,
	resource : null,
	property : "",
	changed  : false,

	init : function(){
		this.item = window.arguments[0];
		this.resource = this.item.res;
		this.list = this.item.list;
		this.objArr = [];
		this.id2changed = [];
		var dbtype = this.DataSource.getProperty(this.resource, "dbtype");
		var i;
		for(i=0;i<this.list.length;i++){
			this.objArr.push(this.list[i]);
			this.id2changed[this.list[i].oid] = false;
		}
		this.remakeList();
		var title = this.STRING.getString("REPLACED_URL");
		document.title = title + " [ " + this.DataSource.getProperty(this.resource, "title") + " ]";
    window.sizeToContent();
		var width = window.opener.top.innerWidth - 50;
		window.resizeTo(width,window.outerHeight);
		if(this.ACCEPTBTN)  this.ACCEPTBTN.setAttribute("disabled","true");
		if(this.REPLACEBTN) this.REPLACEBTN.setAttribute("disabled","true");
	},

	remakeList : function(){
		var i,key;
		var hash = [];
		var aURI;
		var aURL;
		for(i=0;i<this.objArr.length;i++){
			var uri = this.objArr[i].doc_url;
			if(this.REPLACETAR.selected){
				aURI = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
				aURI.spec = uri;
				aURL = aURI.QueryInterface(Components.interfaces.nsIURL);
				uri = aURL.prePath+aURL.directory;
			}
			hash[uri] = "";
		}
		var arr = [];
		for(key in hash){
			if(typeof hash[key] == "function") continue;
			arr.push(key);
		}
		arr.sort();
		this.SEARCHLIST.removeAllItems();
		this.SEARCHLIST.value = "";
		for(i=0;i<arr.length;i++){
			this.SEARCHLIST.appendItem(arr[i],"","");
		}
	},

	changeTarget : function(){
		this.remakeList();
	},

	change : function(){
		var searched_text = this.SEARCHLIST.value;
		var replaced_text = this.REPLACETEXT.value;
		if(!searched_text || searched_text == "" || !replaced_text || replaced_text == ""){
			this.REPLACEBTN.setAttribute("disabled","true");
		}else{
			this.REPLACEBTN.removeAttribute("disabled");
		}
	},

	displayURL : function(){
		var uri = this.gBrowser.contentDocument.location.href;
		if(this.REPLACETAR.selected){
			var aURI = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
			aURI.spec = uri;
			var aURL = aURI.QueryInterface(Components.interfaces.nsIURL);
			uri = aURL.prePath+aURL.directory;
		}
		this.REPLACETEXT.value = uri;
		this.change();
	},

	folderURL : function(){
		var folder = this.getFolder();
		if(!folder) return;
		this.REPLACETEXT.value = this.Common.convertFilePathToURL(folder.path);
		this.change();
	},

	getFolder : function (){
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var result = null;
		try{
			picker.init(window, "Selected Folder", picker.modeGetFolder);
			var showResult = picker.show();
			if(showResult == picker.returnOK){
				result = picker.file;
			}else if(showResult == picker.returnReplace){
				if(picker.file.exists()) picker.file.remove(false);
				result = picker.file;
			}
		}catch(e){
			result = null;
		}
		return result;
	},

	replaced : function(){
		var searched_text = this.SEARCHLIST.value;
		var replaced_text = this.REPLACETEXT.value;
		if(!searched_text || searched_text == "") return;
		var replacedNum = 0;
		var i;
		for(i=0;i<this.objArr.length;i++){
			if(this.objArr[i].doc_url.indexOf(searched_text)>=0){
				replacedNum++;
			}else if(this.objArr[i].con_url.indexOf(searched_text)>=0){
				replacedNum++;
			}
		}
		if(replacedNum==0){
			this.Common.alert(this.STRING.getString("ALERT_REPLACED_URL"),undefined,window);
			return;
		}
		var title = this.STRING.getString("CONFIRM_REPLACED_URL");
		if(!this.Common.confirm("[ "+replacedNum + " ] " + title,undefined,undefined,undefined,undefined,window)) return;
		var parser = new DOMParser();
		var s = new XMLSerializer();
		for(i=0;i<this.objArr.length;i++){
			if(this.objArr[i].doc_url.indexOf(searched_text)>=0){
				this.objArr[i].doc_url = this.objArr[i].doc_url.replace(searched_text, replaced_text);
				this.id2changed[this.objArr[i].oid] = true;
			}
			if(this.objArr[i].con_url.indexOf(searched_text)>=0){
				this.objArr[i].con_url = this.objArr[i].con_url.replace(searched_text, replaced_text);
				this.id2changed[this.objArr[i].oid] = true;
			}
			if(this.objArr[i].oid_property){
				try{ var xmldoc = parser.parseFromString(this.objArr[i].oid_property,"text/xml"); }catch(e){xmldoc = null; }
				if(xmldoc && xmldoc.documentElement){
					var xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
					if(xmlnode && xmlnode.textContent.indexOf(searched_text)>=0){
						var hyperAnchor = xmlnode.textContent;
						while(xmlnode.hasChildNodes()){
							xmlnode.removeChild(xmlnode.lastChild);
						}
						hyperAnchor = hyperAnchor.replace(searched_text, replaced_text);
						xmlnode.appendChild(xmldoc.createTextNode(hyperAnchor));
						this.objArr[i].oid_property = s.serializeToString(xmldoc);
					}
				}
			}
			this.changed |= this.id2changed[this.objArr[i].oid];
		}
		s = undefined;
		parser = undefined;
		if(this.changed && this.ACCEPTBTN) this.ACCEPTBTN.removeAttribute("disabled");
		this.remakeList();
	},

	accept : function(){
		var rtnArr = [];
		var i;
		for(i=0;i<this.objArr.length;i++){
			if(!this.id2changed[this.objArr[i].oid]) continue;
			rtnArr.push(this.objArr[i]);
		}
		if(window.arguments[0]){
			if(rtnArr.length>0) window.arguments[0].objArr = rtnArr;
			window.arguments[0].accept = this.changed;
			if(window.arguments[0].callback) window.arguments[0].callback(window.arguments[0]);
		}
	},

	cancel : function(){
		if(window.arguments[0]) window.arguments[0].accept = false;
	},
};


function _dump(aString){
	window.opener.top.bitsMarkingCollection._dump(aString);
}

