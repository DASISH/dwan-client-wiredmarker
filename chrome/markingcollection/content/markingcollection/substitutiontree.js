/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var bitsSubstitutionTree = {
	_xmlfile : null,
	_xmldoc  : null,

	get idMENU()        { return "bitsSubstitutionTreeMenu"; },
	get idMENU_ALL()    { return "bitsSubstitutionTreeAllMenuitem"; },
	get idMENU_SELECT(){ return "bitsSubstitutionTreeSelectMenuitem"; },

	get idCMENU()       { return "bitsSubstitutionTreeContextmenu"; },

	get MENU()          { return document.getElementById(this.idMENU); },
	get MENU_ALL()      { return document.getElementById(this.idMENU_ALL); },

	get CMENU()         { return document.getElementById(this.idCMENU); },

	get TITLE()         { return window.top.document.getElementById("sidebar-title"); },

	get STRING()     { return window.top.document.getElementById("MarkingCollectionOverlayString"); },
	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get xmldoc()     { return this._xmldoc; },
	get xmlurl()     { return (this._xmlfile?this.Common.convertFilePathToURL(this._xmlfile.path):""); },

	get confirmDelete(){ return true; },

	baseURL  : "",
	shouldRebuild : false,

	init : function(){
		var extensionDir = this.Common.getExtensionDir().clone();
		if(extensionDir){
			this._xmlfile = extensionDir.clone();
			this._xmlfile.append("substitutiontree.xml");
			if(!this._xmlfile.exists()){
				var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
				aContent += '<!DOCTYPE items>\n<items/>\n';
				this.Common.writeFile(this._xmlfile,aContent,"UTF-8");
			}
			function _loadXMLDocument(pUri){
				if(pUri == undefined) return undefined;
				var xmlDocument = window.top.bitsMarkingCollection.loadXMLDocument(pUri);
				if(xmlDocument){
					return xmlDocument;
				}else{
					return undefined;
				}
			}
			function _createXMLDocument(aXMLFile){
				if(!aXMLFile) return undefined;
				try{
					return _loadXMLDocument(bitsSubstitutionTree.Common.IO.newFileURI(aXMLFile).spec);
				}catch(ex){
					bitsSubstitutionTree._dump("bitsSubstitutionTree._createXMLDocument():"+ ex);
					return undefined;
				}
			}
			this._xmldoc = _createXMLDocument(this._xmlfile);
		}
	},

	done : function(){
		this.xmlflash();
	},

	rebuild : function(){
	},

	xmlflash : function(){
		var s = new XMLSerializer();
		var xml = s.serializeToString(bitsSubstitutionTree.xmldoc);
		bitsSubstitutionTree.Common.writeFile(bitsSubstitutionTree._xmlfile, xml+"\n","UTF-8");
	},

	addSubstitution : function(aItem){
		var results = this.XPath.evaluateArray('//item[@src="'+aItem.src+'"]',this.xmldoc);
		if(results.length){
			this.Common.alert(this.STRING.getString("ALERT_REGISTERED"));
			return false;
		}
		if(this.xmldoc){
			var node = this.xmldoc.createElement("item");
			node.setAttribute("src",aItem.src);
			node.setAttribute("alt",aItem.alt);
			this.xmldoc.documentElement.appendChild(node);
			this.xmlflash();
		}
	},

	_confirmRemovingFor : function(){
		try{
			if(bitsSubstitutionTree.confirmDelete){
				return this.Common.confirm( bitsSubstitutionTree.STRING.getString("CONFIRM_DELETE") );
			}
			return true;
		}catch(e){
			return false;
		}
	},

	removeSubstitution : function(aEvent){
		if(!this.xmldoc || !this._explicitOriginalTarget) return;
		if(!this._confirmRemovingFor()) return;
		var src = this._explicitOriginalTarget.getAttribute("src");
		var results = this.XPath.evaluateArray('//item[@src="'+src+'"]',this.xmldoc);
		if(results.length){
			var i;
			for(i=results.length-1;i>=0;i--){
				results[i].parentNode.removeChild(results[i]);
			}
			this.xmlflash();
		}
		this._explicitOriginalTarget = undefined;
	},

	getSubstitutionText : function(aNode){
		var selectimportimage = nsPreferences.copyUnicharPref("wiredmarker.selectimportimage","none");
		var src = (aNode.src?aNode.src:"");
		var alt = (aNode.alt?aNode.alt:"");
		if(selectimportimage == "alt") return alt;
		if(selectimportimage == "alt_substitution" && alt != "") return alt;
		if(selectimportimage == "substitution") alt = "";
		src = src.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
		if(src == "") return "";
		try{
			var aURI = this.Common.convertURLToObject(src);
			var aURL = aURI.QueryInterface(Components.interfaces.nsIURL);
		}catch(e){}
		if(!aURL) return "";
		var results = this.XPath.evaluateArray('//item[@src="'+aURL.fileName+'"]',this.xmldoc);
		if(results.length){
			alt = results[0].getAttribute("alt");
		}else{
			var confirm = nsPreferences.getBoolPref("wiredmarker.substitution.confirm", true);
			if(confirm){
				if(this.Common.confirm( this.STRING.getString("CONFIRM_SUBSTITUTION_TABLE_NONE") )){
					var src = {value: aURL.fileName};
					var alt = {value: (aNode.alt?aNode.alt:"")};
					var check = {value: false};
					var result = false;
					do{
						result = this.Common.PROMPT.prompt(window, this.STRING.getString("MSG_SUBSTITUTION_ADD"), this.STRING.getString("MSG_SUBSTITUTION_INPUT_FILENAME"), src, null, check);
						if(!result) return alt;
						src.value = src.value.replace(/^\s*/mg,"").replace(/\s*$/mg,"");
					}while(src.value == "");
					var src_results = this.XPath.evaluateArray('//item[@src="'+src.value+'"]',this.xmldoc);
					if(src_results.length){
						this.Common.alert(this.STRING.getString("ALERT_REGISTERED"));
						return alt;
					}
					result = this.Common.PROMPT.prompt(window, this.STRING.getString("MSG_SUBSTITUTION_ADD"), this.STRING.getString("MSG_SUBSTITUTION_FILENAME") + ":["+src.value+"]\n" + this.STRING.getString("MSG_SUBSTITUTION_INPUT_SUBSTITUTE_TEXT"), alt, null, check);
					if(!result) return alt;
					var node = this.xmldoc.createElement("item");
					node.setAttribute("src",src.value);
					node.setAttribute("alt",alt.value);
					this.xmldoc.documentElement.appendChild(node);
					alt = alt.value;
				}
			}
		}
		return (alt?alt:"");
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};

