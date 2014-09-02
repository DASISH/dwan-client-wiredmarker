var bitsPubmedCentralService = {
	_init     : false,
	_threadID : 0,
	_mainThread : null,
	_backgroundThread : null,
	_stack : [],

	_capture : {
		confirm : false,
		substitution : {
			confirm : false,
			format  : "MEDLINE.SO from PMC",
		},
	},

	get STRING()  { return document.getElementById("MarkingCollectionOverlayString"); },
	get UNICODE() { return Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].getService(Components.interfaces.nsIScriptableUnicodeConverter); },

	get Common()   { return window.top.bitsObjectMng.Common; },
	get Database() { return window.top.bitsObjectMng.Database;   },

	get mainThread() { return this._mainThread; },
	get backgroundThread() { return this._backgroundThread; },

	get SIDEBAR()     { return window.top.document.getElementById("sidebar"); },
	get SIDEBAR_WIN() {try{return this.SIDEBAR.contentWindow;}catch(e){return undefined;}},
	get SIDEBAR_DOC() {try{return this.SIDEBAR.contentDocument;}catch(e){return undefined;}},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(!this._init){
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
			this._app_version = parseInt(info.version);
			if(this._app_version>=3){
				this._capture.confirm = nsPreferences.getBoolPref("wiredmarker.pubmedcentral.capture.confirm", true);
				this._capture.substitution.confirm = nsPreferences.getBoolPref("wiredmarker.pubmedcentral.capture.substitution.confirm", true);
				var format = nsPreferences.copyUnicharPref("wiredmarker.pubmedcentral.capture.substitution.format");
				if(format == null) nsPreferences.setUnicharPref("wiredmarker.pubmedcentral.capture.substitution.format", this._capture.substitution.format);

				this._mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
			}
			this._init = true;
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){
		if(this._backgroundThread) delete this._backgroundThread;
		if(this._mainThread) delete this._mainThread;
	},

/////////////////////////////////////////////////////////////////////
	formatPMCID : function(aPMCID){
		try{
			if(!aPMCID) return undefined;
			if(aPMCID.match(/^\d+$/)) aPMCID = "PMC"+aPMCID;
			if(!aPMCID.match(/^PMC\d+$/)) return undefined;
			return aPMCID;
		}catch(err){
			this._dump("bitsPubmedCentralService.getExtensionDir():"+err);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	getExtensionDir : function(aPMCID){
		try{
			aPMCID = this.formatPMCID(aPMCID);
			if(!aPMCID) return undefined;
			var extensionDir = this.Common.getExtensionDir().clone();
			extensionDir.append("PubmedCentral");
			var arr = aPMCID.split("");
			while(arr.length>0){
				extensionDir.append(arr.shift());
			}
			return extensionDir;
		}catch(err){
			this._dump("bitsPubmedCentralService.getExtensionDir():"+err);
			return undefined;
		}
	},

/////////////////////////////////////////////////////////////////////
	getPubmedInfo : function(aObject){
		this._capture.confirm = nsPreferences.getBoolPref("wiredmarker.pubmedcentral.capture.confirm", true);
		this._capture.substitution.confirm = nsPreferences.getBoolPref("wiredmarker.pubmedcentral.capture.substitution.confirm", true);
		this._capture.substitution.format = nsPreferences.copyUnicharPref("wiredmarker.pubmedcentral.capture.substitution.format");
		if(!this._capture.confirm) return;
		if(!aObject) return;
		if(!aObject.con_url.match(/^http:\/\/www\.pubmedcentral\.nih\.gov\/.+?\?artid=(\d+)/) && !aObject.con_url.match(/^http:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\/articles\/([^\/]+)/)) return;
		var pmcid = RegExp.$1;
		pmcid = this.formatPMCID(pmcid);
		this.execThread(pmcid,function(aResult){
			if(!aObject.oid_property) aObject.oid_property = '<PROPERTY/>';
			var parser = new DOMParser();
			var xml_property = parser.parseFromString(aObject.oid_property, "text/xml");
			parser = undefined;
			var extras_msg = xml_property.getElementsByTagName("EXTENDED_MESSAGE")[0];
			if(!extras_msg){
				extras_msg = xml_property.createElement("EXTENDED_MESSAGE");
				xml_property.documentElement.appendChild(extras_msg);
			}
			elem_medline = xml_property.createElement("MEDLINE");
			extras_msg.appendChild(elem_medline);
			if(aResult.medline.PMID){
				var elem_pmid = xml_property.createElement("PMID");
				elem_pmid.appendChild(xml_property.createTextNode(aResult.medline.PMID));
				elem_medline.appendChild(elem_pmid);
			}
			if(aResult.medline.SO){
				var elem_so = xml_property.createElement("SO");
				elem_so.appendChild(xml_property.createTextNode(aResult.medline.SO));
				elem_medline.appendChild(elem_so);
			}
			aResult.medline.PMCID = pmcid;
			var elem_pmcid = xml_property.createElement("PMCID");
			elem_pmcid.appendChild(xml_property.createTextNode(pmcid));
			elem_medline.appendChild(elem_pmcid);
			var s = new XMLSerializer();
			aObject.oid_property = s.serializeToString(xml_property);
			s = undefined;
			if(bitsPubmedCentralService._capture.substitution.confirm){
				var keys_arr = [];
				for(var key in aResult.medline){
					keys_arr.push(key);
				}
				keys_arr.sort();
				keys_arr.sort(function(a,b){return b.length-a.length;});
				var format = nsPreferences.copyUnicharPref("wiredmarker.pubmedcentral.capture.substitution.format");
				for(var i=0;i<keys_arr.length;i++){
					var regexp = new RegExp("MEDLINE\\."+keys_arr[i],"g");
					format = format.replace(regexp,aResult.medline[keys_arr[i]]);
				}
				aObject.doc_title = format;
			}
			var dbtype = aObject.dbtype;
			delete aObject.dbtype;
			delete aObject.fid_style;
			delete aObject.fid_title;
			delete aObject.folder_order;
			bitsPubmedCentralService.Database.updateObject(aObject,dbtype);
			setTimeout(function(){
				aObject.dbtype = dbtype;
				var contentWindow = bitsPubmedCentralService.SIDEBAR_WIN;
				var contentDocument = bitsPubmedCentralService.SIDEBAR_DOC;
				var mcTreeHandler = null;
				if(contentWindow && contentWindow.mcPropertyView) mcPropertyView = contentWindow.mcPropertyView;
				if(mcPropertyView && mcPropertyView._id == aObject.oid && mcPropertyView._dbtype == aObject.dbtype){
					mcPropertyView.dispProperty(aObject);
				}
			},500);
		})
	},

/////////////////////////////////////////////////////////////////////
	getPubmedInfoSync : function(aObject){
		this._capture.confirm = nsPreferences.getBoolPref("wiredmarker.pubmedcentral.capture.confirm", true);
		this._capture.substitution.confirm = nsPreferences.getBoolPref("wiredmarker.pubmedcentral.capture.substitution.confirm", true);
		this._capture.substitution.format = nsPreferences.copyUnicharPref("wiredmarker.pubmedcentral.capture.substitution.format");
		if(!this._capture.confirm) return aObject;
		if(!aObject) return aObject;
		if(!aObject.con_url.match(/^http:\/\/www\.pubmedcentral\.nih\.gov\/.+?\?artid=(\d+)/) && !aObject.con_url.match(/^http:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\/articles\/([^\/]+)/)) return;
		var pmcid = RegExp.$1;
		pmcid = this.formatPMCID(pmcid);
		var aResult = this.execThread(pmcid);
		if(!aObject.oid_property) aObject.oid_property = '<PROPERTY/>';
		var parser = new DOMParser();
		var xml_property = parser.parseFromString(aObject.oid_property, "text/xml");
		parser = undefined;
		var extras_msg = xml_property.getElementsByTagName("EXTENDED_MESSAGE")[0];
		if(!extras_msg){
			extras_msg = xml_property.createElement("EXTENDED_MESSAGE");
			xml_property.documentElement.appendChild(extras_msg);
		}
		elem_medline = xml_property.createElement("MEDLINE");
		extras_msg.appendChild(elem_medline);
		if(aResult.medline.PMID){
			var elem_pmid = xml_property.createElement("PMID");
			elem_pmid.appendChild(xml_property.createTextNode(aResult.medline.PMID));
			elem_medline.appendChild(elem_pmid);
		}
		if(aResult.medline.SO){
			var elem_so = xml_property.createElement("SO");
			elem_so.appendChild(xml_property.createTextNode(aResult.medline.SO));
			elem_medline.appendChild(elem_so);
		}
		aResult.medline.PMCID = pmcid;
		var elem_pmcid = xml_property.createElement("PMCID");
		elem_pmcid.appendChild(xml_property.createTextNode(pmcid));
		elem_medline.appendChild(elem_pmcid);
		var s = new XMLSerializer();
		aObject.oid_property = s.serializeToString(xml_property);
		s = undefined;
		if(bitsPubmedCentralService._capture.substitution.confirm){
			var keys_arr = [];
			for(var key in aResult.medline){
				keys_arr.push(key);
			}
			keys_arr.sort();
			keys_arr.sort(function(a,b){return b.length-a.length;});
			var format = nsPreferences.copyUnicharPref("wiredmarker.pubmedcentral.capture.substitution.format");
			for(var i=0;i<keys_arr.length;i++){
				var regexp = new RegExp("MEDLINE\\."+keys_arr[i],"g");
				format = format.replace(regexp,aResult.medline[keys_arr[i]]);
			}
			aObject.doc_title = format;
		}
		return aObject;
	},

/////////////////////////////////////////////////////////////////////
	execThread : function(aPMCID,aCB){
		//Threadを使用しない
		if(aCB){
			setTimeout(function(){
				var func = new bitsPubmedCentralServiceFunc(aPMCID,aCB);
				var aResult = func.run();
				if(aCB) (aCB)(aResult);
			},0);
			return;
		}else{
			var func = new bitsPubmedCentralServiceFunc(aPMCID,aCB);
			var aResult = func.run();
			return aResult;
		}
		//Threadを使用する
		if(!this._mainThread) return;
		this._threadID++;
		if(this._backgroundThread){
			this._stack.push({pmcid : aPMCID, callback : aCB});
		}else{
			this._backgroundThread = Components.classes["@mozilla.org/thread-manager;1"].getService().newThread(0);
			this.backgroundThread.dispatch(new bitsPubmedCentralServiceWorkingThread(this._threadID, aPMCID, aCB), this.backgroundThread.DISPATCH_NORMAL);
		}
	},

/////////////////////////////////////////////////////////////////////
	exitThread : function(aResult,aCB){
		if(this._backgroundThread) delete this._backgroundThread;
		this._backgroundThread = null;
		if(aCB) (aCB)(aResult);
		if(this._stack.length){
			var stack = this._stack.shift();
			this.execThread(stack.pmcid,stack.callback);
		}
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
};

/////////////////////////////////////////////////////////////////////
var bitsPubmedCentralServiceFunc = function(aPMCID, aCB) {
	this.pmcid = aPMCID;
	this.callback = aCB; //互換性の為、実際には使用しない
	this.result = 0;
};

bitsPubmedCentralServiceFunc.prototype = {
	getText : function(pUrl){
		var text = null;
		try{
			var xmlhttp = new XMLHttpRequest();
			if(xmlhttp){
				xmlhttp.open("GET",pUrl,false);
				xmlhttp.send(null);
				if(xmlhttp.status == 200){
					if(xmlhttp.responseText.length >0) return xmlhttp.responseText;
				}else{
					bitsPubmedCentralService._dump("bitsPubmedCentralServiceWorkingThread.getText():error=["+ req.status +" "+ req.statusText+"]");
				}
			}
		}catch(err){
			Components.utils.reportError(err);
		}
		return undefined;
	},

	getXML : function(pUrl){
		var xmldoc = null;
		try{
			var responseText = this.getText(pUrl);
			if(responseText){
				var parser = new DOMParser();
				xmldoc = parser.parseFromString(responseText, "text/xml");
				parser = undefined;
			}
		}catch(err){
			Components.utils.reportError(err);
		}
		return xmldoc;
	},

	searchNCBI : function(aPMCID){
		aPMCID = bitsPubmedCentralService.formatPMCID(aPMCID);
		if(!aPMCID) return undefined;
		const getURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=";
		var url = getURL + aPMCID;
		var xmldoc = this.getXML(url);
		if(!xmldoc) return undefined;
		var elemId = xmldoc.getElementsByTagName("Id")[0];
		if(elemId){
			return elemId.textContent;
		}else{
			return undefined;
		}
	},

	fetchNCBI : function(aPMID, aRetmode){
		const getMEDLINEURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=text&rettype=medline&id=";
		const getXMLURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=";
		if(!aRetmode || aRetmode == 'xml'){
			return this.getXML(getXMLURL + aPMID);
		}else{
			return this.getText(getMEDLINEURL + aPMID);
		}
		return undefined;
	},

	convertFormUnicode : function(aString, aCharset){
		if(!aString) return "";
		try {
			bitsPubmedCentralService.UNICODE.charset = aCharset;
			aString = bitsPubmedCentralService.UNICODE.ConvertFromUnicode(aString);
		}catch(ex){}
		return aString;
	},

	convertToUnicode : function(aString, aCharset){
		if(!aString) return "";
		try {
			bitsPubmedCentralService.UNICODE.charset = aCharset;
			aString = bitsPubmedCentralService.UNICODE.ConvertToUnicode(aString);
		}catch(ex){}
		return aString;
	},

	writeFile : function(aFile, aContent){
		if(aFile.exists()) aFile.remove(false);
		try {
			aFile.create(aFile.NORMAL_FILE_TYPE, 0666);
			var content = this.convertFormUnicode(aContent,"UTF-8");
			var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(aFile, 2, 0x200, false);
			ostream.write(content, content.length);
			ostream.close();
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralService ERROR: Failed to write file: " + aFile.path + "["+ ex + "]");
		}
	},

	readFile : function(aFile){
		if(!aFile || !aFile.exists()) return undefined;
		try {
			var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
			istream.init(aFile, 1, 0, false);
			var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
			sstream.init(istream);
			var content = sstream.read(sstream.available());
			sstream.close();
			istream.close();
			content = this.convertToUnicode(content,"UTF-8");
			return content;
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralService ERROR: readFile():" + ex);
			return undefined;
		}
	},

	createXMLDocument : function(aXMLFile){
		if(!aXMLFile) return undefined;
		try{
			var fileContents = this.readFile(aXMLFile);
			var parser = new DOMParser();
			var xmlDocument = parser.parseFromString(fileContents, "text/xml");
			parser = undefined;
			return xmlDocument;
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralServiceWorkingThread.createXMLDocument():"+ ex);
			return undefined;
		}
	},

	analysisMedline : function(aMedline){
		if(!aMedline) return undefined;
		try{
			var rtn = {};
			var arr = aMedline.replace(/\x0D\x0A|\x0D|\x0A/g,"\n").split("\n");
			var key = "";
			var val = "";
			for(var i=0;i<arr.length;i++){
				if(arr[i].match(/^([A-Z]+)\s*\-\s(.+)$/)){
					key = RegExp.$1;
					val = RegExp.$2;
					if(rtn[key]){
						if(typeof rtn[key] == "string"){
							var oldval = rtn[key];
							rtn[key] = [oldval];
						}
						rtn[key].push(val);
					}else{
						rtn[key] = val;
					}
				}else if(arr[i].match(/^\s+?(\S.+)$/)){
					val = RegExp.$1;
					rtn[key] += ' ' + val;
					rtn[key] = rtn[key].replace(/\s{2,}/g," ");
				}
			}
			return rtn;
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralServiceWorkingThread.analysisMedline():"+ ex);
			return undefined;
		}
	},

	run : function() {
		try {
			var xmldoc = null;
			var medline = null;
			var xmlFile = bitsPubmedCentralService.getExtensionDir(this.pmcid);
			var medlineFile = xmlFile.clone();
			xmlFile.append(this.pmcid+".xml");
			medlineFile.append(this.pmcid+".txt");
			if(!xmlFile.exists()){
				var pmid = this.searchNCBI(this.pmcid);
				if(pmid){
					xmldoc = this.fetchNCBI(pmid);
					if(xmldoc){
						var s = new XMLSerializer();
						var xml = s.serializeToString(xmldoc);
						s = undefined;
						this.writeFile(xmlFile, xml+"\n","UTF-8");
					}
					medline = this.fetchNCBI(pmid,'text');
					if(medline) this.writeFile(medlineFile, medline,"UTF-8");
				}
			}else{
				xmldoc = this.createXMLDocument(xmlFile);
				medline = this.readFile(medlineFile);
			}
			if(medline) medline = this.analysisMedline(medline);
			this.result = {
				xmldoc  : xmldoc,
				medline : medline,
			};
			return this.result;

		}catch(err){
			Components.utils.reportError(err);
		}
	}
};

/////////////////////////////////////////////////////////////////////
var bitsPubmedCentralServiceMainThread = function(threadID, aResult, aCB) {
	this.threadID = threadID;
	this.result = aResult;
	this.callback = aCB;
};

bitsPubmedCentralServiceMainThread.prototype = {
	run: function() {
		try {
			// ここでワーキングスレッドの完了に対して反応を返す
			bitsPubmedCentralService.exitThread(this.result,this.callback);
		}catch(err){
			Components.utils.reportError(err);
		}
	},

	QueryInterface: function(iid) {
		if( iid.equals(Components.interfaces.nsIRunnable) ||
				iid.equals(Components.interfaces.nsISupports)) {
			return this;
		}
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
};

/////////////////////////////////////////////////////////////////////
var bitsPubmedCentralServiceWorkingThread = function(threadID, aPMCID, aCB) {
	this.threadID = threadID;
	this.pmcid = aPMCID;
	this.callback = aCB;
	this.result = 0;
};

bitsPubmedCentralServiceWorkingThread.prototype = {
	getText : function(pUrl){
		var text = null;
		try{
			var xmlhttp = new XMLHttpRequest();
			if(xmlhttp){
				xmlhttp.open("GET",pUrl,false);
				xmlhttp.send(null);
				if(xmlhttp.status == 200){
					if(xmlhttp.responseText.length >0) return xmlhttp.responseText;
				}else{
					bitsPubmedCentralService._dump("bitsPubmedCentralServiceWorkingThread.getText():error=["+ req.status +" "+ req.statusText+"]");
				}
			}
		}catch(err){
			Components.utils.reportError(err);
		}
		return undefined;
	},

	getXML : function(pUrl){
		var xmldoc = null;
		try{
			var responseText = this.getText(pUrl);
			if(responseText){
				var parser = new DOMParser();
				xmldoc = parser.parseFromString(responseText, "text/xml");
				parser = undefined;
			}
		}catch(err){
			Components.utils.reportError(err);
		}
		return xmldoc;
	},

	searchNCBI : function(aPMCID){
		aPMCID = bitsPubmedCentralService.formatPMCID(aPMCID);
		if(!aPMCID) return undefined;
		const getURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=";
		var url = getURL + aPMCID;
		var xmldoc = this.getXML(url);
		if(!xmldoc) return undefined;
		var elemId = xmldoc.getElementsByTagName("Id")[0];
		if(elemId){
			return elemId.textContent;
		}else{
			return undefined;
		}
	},

	fetchNCBI : function(aPMID, aRetmode){
		const getMEDLINEURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=text&rettype=medline&id=";
		const getXMLURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=";
		if(!aRetmode || aRetmode == 'xml'){
			return this.getXML(getXMLURL + aPMID);
		}else{
			return this.getText(getMEDLINEURL + aPMID);
		}
		return undefined;
	},

	convertFormUnicode : function(aString, aCharset){
		if(!aString) return "";
		try {
			bitsPubmedCentralService.UNICODE.charset = aCharset;
			aString = bitsPubmedCentralService.UNICODE.ConvertFromUnicode(aString);
		}catch(ex){}
		return aString;
	},

	convertToUnicode : function(aString, aCharset){
		if(!aString) return "";
		try {
			bitsPubmedCentralService.UNICODE.charset = aCharset;
			aString = bitsPubmedCentralService.UNICODE.ConvertToUnicode(aString);
		}catch(ex){}
		return aString;
	},

	writeFile : function(aFile, aContent){
		if(aFile.exists()) aFile.remove(false);
		try {
			aFile.create(aFile.NORMAL_FILE_TYPE, 0666);
			var content = this.convertFormUnicode(aContent,"UTF-8");
			var ostream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(aFile, 2, 0x200, false);
			ostream.write(content, content.length);
			ostream.close();
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralService ERROR: Failed to write file: " + aFile.path + "["+ ex + "]");
		}
	},

	readFile : function(aFile){
		if(!aFile || !aFile.exists()) return undefined;
		try {
			var istream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
			istream.init(aFile, 1, 0, false);
			var sstream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
			sstream.init(istream);
			var content = sstream.read(sstream.available());
			sstream.close();
			istream.close();
			content = this.convertToUnicode(content,"UTF-8");
			return content;
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralService ERROR: readFile():" + ex);
			return undefined;
		}
	},

	createXMLDocument : function(aXMLFile){
		if(!aXMLFile) return undefined;
		try{
			var fileContents = this.readFile(aXMLFile);
			var parser = new DOMParser();
			var xmlDocument = parser.parseFromString(fileContents, "text/xml");
			parser = undefined;
			return xmlDocument;
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralServiceWorkingThread.createXMLDocument():"+ ex);
			return undefined;
		}
	},

	analysisMedline : function(aMedline){
		if(!aMedline) return undefined;
		try{
			var rtn = {};
			var arr = aMedline.replace(/\x0D\x0A|\x0D|\x0A/g,"\n").split("\n");
			var key = "";
			var val = "";
			for(var i=0;i<arr.length;i++){
				if(arr[i].match(/^([A-Z]+)\s*\-\s(.+)$/)){
					key = RegExp.$1;
					val = RegExp.$2;
					if(rtn[key]){
						if(typeof rtn[key] == "string"){
							var oldval = rtn[key];
							rtn[key] = [oldval];
						}
						rtn[key].push(val);
					}else{
						rtn[key] = val;
					}
				}else if(arr[i].match(/^\s+?(\S.+)$/)){
					val = RegExp.$1;
					rtn[key] += ' ' + val;
					rtn[key] = rtn[key].replace(/\s{2,}/g," ");
				}
			}
			return rtn;
		}catch(ex){
			bitsPubmedCentralService._dump("bitsPubmedCentralServiceWorkingThread.analysisMedline():"+ ex);
			return undefined;
		}
	},

	run : function() {
		try {
			// ここでワーキングスレッドが処理を行う
			var xmldoc = null;
			var medline = null;
			var xmlFile = bitsPubmedCentralService.getExtensionDir(this.pmcid);
			var medlineFile = xmlFile.clone();
			xmlFile.append(this.pmcid+".xml");
			medlineFile.append(this.pmcid+".txt");
			if(!xmlFile.exists()){
				var pmid = this.searchNCBI(this.pmcid);
				if(pmid){
					xmldoc = this.fetchNCBI(pmid);
					if(xmldoc){
						var s = new XMLSerializer();
						var xml = s.serializeToString(xmldoc);
						s = undefined;
						this.writeFile(xmlFile, xml+"\n","UTF-8");
					}
					medline = this.fetchNCBI(pmid,'text');
					if(medline) this.writeFile(medlineFile, medline,"UTF-8");
				}
			}else{
				xmldoc = this.createXMLDocument(xmlFile);
				medline = this.readFile(medlineFile);
			}
			if(medline) medline = this.analysisMedline(medline);
			this.result = {
				xmldoc  : xmldoc,
				medline : medline,
			};
			// 処理が終了したら、終了を知らせるためにメインスレッドにコールバックする
			bitsPubmedCentralService.mainThread.dispatch(new bitsPubmedCentralServiceMainThread(this.threadID, this.result, this.callback), bitsPubmedCentralService.backgroundThread.DISPATCH_NORMAL);
		}catch(err){
			Components.utils.reportError(err);
		}
	},

	QueryInterface : function(iid) {
		if(	iid.equals(Components.interfaces.nsIRunnable) ||
				iid.equals(Components.interfaces.nsISupports)) {
			return this;
		}
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
};
