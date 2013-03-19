var bitsMetaCapture = {
	_init : false,
	_xmlfile : null,
	_xmldoc  : null,

	get STRING(){ return document.getElementById("MarkingCollectionOverlayString"); },

	get DataSource(){ return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;        },
	get XPath()      { return window.top.bitsObjectMng.XPath;      },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get xmldoc()     { return this._xmldoc; },
	get xmlurl()     { return (this._xmlfile?this.Common.convertFilePathToURL(this._xmlfile.path):""); },
	get xmlfile()    { return this._xmlfile; },

	get TOKEN_HA()    { return "HYPER_ANCHOR";},
	get TOKEN_TITLE(){ return "WM_TITLE";},
	get TOKEN_NOTE()  { return "WM_NOTE";},
	get TOKEN_META()  { return "WM_META";},

	get TOKEN_MEDLINE_PMCID(){ return "MEDLINE\\.PMCID";},
	get TOKEN_MEDLINE_PMID()  { return "MEDLINE\\.PMID";},
	get TOKEN_MEDLINE_SO()    { return "MEDLINE\\.SO";},

/////////////////////////////////////////////////////////////////////
	init : function(aEvent){
		if(!this._init){
			var extensionDir = this.Common.getExtensionDir().clone();
			if(extensionDir){
				this._xmlfile = extensionDir.clone();
				this._xmlfile.append("metacapture.xml");
			}
			this._init = true;
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(aEvent){},

/////////////////////////////////////////////////////////////////////
	rebuild : function(){
		if(this._xmlfile){
			if(!this._xmlfile.exists()){
				var aContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
				aContent += '<!DOCTYPE METACAPTURE>\n';
				aContent += '<METACAPTURE>\n';
				aContent += '\t<CAPTURE_ITEMS>\n';
				aContent += '\t\t<CAPTURE_ITEM tag="TITLE" value="#text"/>\n';
				aContent += '\t</CAPTURE_ITEMS>\n';
				aContent += '\t<META_REGEXP_ITEMS>\n';
				aContent += '\t\t<META_REGEXP_ITEM tag="TITLE" use="true" regexp="" format=""/>\n';
				aContent += '\t</META_REGEXP_ITEMS>\n';
				aContent += '\t<COPY_ITEMS>\n';
				aContent += '\t\t<COPY_ITEM name="hyperanchor" checked="true" selected="false"/>\n';
				aContent += '\t\t<COPY_ITEM name="title" checked="true" selected="false"/>\n';
				aContent += '\t\t<COPY_ITEM name="note" checked="true" selected="false"/>\n';
				aContent += '\t\t<COPY_ITEM name="meta" checked="true" selected="false"/>\n';
				aContent += '\t</COPY_ITEMS>\n';
				aContent += '\t<OUTPUT_ITEMS>\n';
				aContent += '\t\t<OUTPUT_ITEM format="WM_TITLE (WM_META)" regexp="Section (\\d+)/CHAPTER (\\d+)/(.+) from Gray" replace="$1-$2, $3, Gray\'s Anatomy 20th ED" location_hash="true" regexp_i="false" regexp_g="true" regexp_m="false" selected="true"/>\n';
				aContent += '\t\t<OUTPUT_ITEM format="WM_TITLE [MEDLINE.SO]" regexp="\\.?\\s*Epub \\d{4} .+]\$" replace="]" location_hash="true" regexp_i="false" regexp_g="true" regexp_m="false"/>\n';
				aContent += '\t\t<OUTPUT_ITEM format="WM_TITLE [PMID:MEDLINE.PMID]" regexp="" replace="" location_hash="true" regexp_i="false" regexp_g="true" regexp_m="false"/>\n';
				aContent += '\t</OUTPUT_ITEMS>\n';
				aContent += '</METACAPTURE>\n';
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

/////////////////////////////////////////////////////////////////////
	xmlflash : function(){
		if(bitsMetaCapture.xmldoc && bitsMetaCapture._xmlfile){
			var s = new XMLSerializer();
			var xml = s.serializeToString(bitsMetaCapture.xmldoc);
			bitsMetaCapture.Common.writeFile(bitsMetaCapture._xmlfile, xml+"\n","UTF-8");
		}
	},

/////////////////////////////////////////////////////////////////////
// 一応互換性の為に定義しておく
/////////////////////////////////////////////////////////////////////
	copyToClipBoardByHyperanchor : function(aOID,aDBType){
		this.copyToClipBoard(aOID,aDBType,"copy");
	},

/////////////////////////////////////////////////////////////////////
	copyToClipBoard : function(aOID,aDBType,aMode){
		var obj = bitsMetaCapture.Database.getObject({oid:aOID},aDBType);
		if(obj && obj.length>0){
			var xmldoc = null;
			if(aMode == "copy" || aMode == "copyformat" || aMode == "note" || aMode == "meta" || aMode == "format" || aMode == "setting"){
				var parser = new DOMParser();
				try{ xmldoc = parser.parseFromString(obj[0].oid_property,"text/xml"); }catch(e){xmldoc = null; }
				parser = undefined;
			}
			if(aMode == "copy"){
				var copytext = "";
				if(xmldoc && xmldoc.documentElement){
					var xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
					if(xmlnode) copytext = xmlnode.textContent;
					if(!copytext) copytext = obj[0].con_url;
				}
				this.textToClipBoard(copytext);

			}else if(aMode == "note"){
				var copytext = "";
				if(xmldoc && xmldoc.documentElement){
					var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
					if(xmlnode) copytext = xmlnode.textContent;
				}
				this.textToClipBoard(copytext);

			}else if(aMode == "pagetitle"){
				this.textToClipBoard(obj[0].doc_title);

			}else if(aMode == "meta"){
				var text_arr = [];
				this.rebuild();
				var capture_items = this.XPath.evaluateArray('/METACAPTURE[1]/CAPTURE_ITEMS[1]/CAPTURE_ITEM',this.xmldoc);
				if(capture_items && capture_items.length > 0){
					var pt_flag = (capture_items.length>1?true:false);
					for(var i=0;i<capture_items.length;i++){
						var tag = capture_items[i].getAttribute("tag");
						if(tag == "TITLE"){
							text_arr.push((pt_flag?tag+"\t\t":"")+obj[0].doc_title);
						}else{
							var name = capture_items[i].getAttribute("name");
							var aExpr;
							if(name){
								aExpr = '//METACAPTURE[@tag="'+tag+'" and @name="'+name+'"]';
							}else{
								aExpr = '//METACAPTURE[@tag="'+tag+'"]';
								name = ""
							}
							var results = this.XPath.evaluateArray(aExpr,xmldoc);
							if(results && results.length > 0){
								for(var j=0;j<results.length;j++){
									text_arr.push((pt_flag?tag+"\t"+name+"\t":"")+results[j].getAttribute("content"));
								}
							}
						}
					}
				}
				this.textToClipBoard(text_arr.join("\n"));

			}else if(aMode == "copytext" || aMode == "title"){
				this.textToClipBoard(obj[0].oid_title);

			}else if(aMode == "format"){
					this.rebuild();
					this.textToClipBoard(this.makeFormatText(this.xmldoc,{
						oid_property : xmldoc,
						doc_title    : obj[0].doc_title,
						oid_title    : obj[0].oid_title,
						con_url      : obj[0].con_url
					}));

			}else if(aMode == "copyformat" || aMode == "setting"){
				setTimeout(function(){
					bitsMetaCapture.rebuild();

					var result = {};
					result.accept = false;
					result.xmldoc = bitsMetaCapture.xmldoc;
					result.xmlfile = bitsMetaCapture.xmlfile;
					result.xmlflash = bitsMetaCapture.xmlflash;
					result.makeFormatText = bitsMetaCapture.makeFormatText;
					result.oid_property = xmldoc;
					result.doc_title = obj[0].doc_title;
					result.oid_title = obj[0].oid_title;
					result.con_url = obj[0].con_url;
					window.openDialog("chrome://markingcollection/content/metaCaptureDialog.xul", "", "chrome,centerscreen,modal,dialog,resizable=yes", result);
					if(result.accept){
						bitsMetaCapture.xmlflash();
					}
				},0);
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	textToClipBoard : function(aText){
		if(aText){
			var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
			str.data=aText;
			var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
			trans.addDataFlavor("text/unicode");
			trans.setTransferData("text/unicode",str,aText.length*2);
			var clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
			clip.emptyClipboard(clip.kGlobalClipboard);
			clip.setData(trans,null,clip.kGlobalClipboard);
		}
	},

/////////////////////////////////////////////////////////////////////
	makeFormatText : function(aXMLDoc,aData){
		if(!aXMLDoc || !aData) return "";
		var setting = {};
		var format_text = {};
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]/OUTPUT_ITEM[@selected="true"]',aXMLDoc);
		if(results && results.length > 0){
			setting.format = results[0].getAttribute("format");
			setting.regexp = results[0].getAttribute("regexp");
			setting.replace = results[0].getAttribute("replace");
			setting.location_hash = (results[0].getAttribute("location_hash")=="true"?true:false);
			setting.regexp_i = (results[0].getAttribute("regexp_i")=="true"?true:false);
			setting.regexp_g = (results[0].getAttribute("regexp_g")=="true"?true:false);
			setting.regexp_m = (results[0].getAttribute("regexp_m")=="true"?true:false);
		}else{
			return "";
		}
		var results = this.XPath.evaluateArray('/METACAPTURE[1]/OUTPUT_ITEMS[1]',aXMLDoc);
		if(results && results.length > 0){
			setting.anchor_checked = (results[0].getAttribute("anchor_checked")=="true"?true:false);
		}
		var value = aData.con_url;
		var elem = aData.oid_property.getElementsByTagName("HYPER_ANCHOR")[0];
		if(elem) value = elem.textContent;
		if(value && setting.location_hash){
			var hashReg = new RegExp("^(.+)(#"+bitsHyperAnchorDummy._anchor_title + ")");
			try{var textContent = aData.oid_property.getElementsByTagName("LOCATION_HASH")[0].textContent;}catch(e){textContent = "";}
			value = value.replace(hashReg,"$1#"+ textContent +"$2");
		}
		format_text.hyperanchor = value;
		if(aData.oid_title){
			format_text.title = aData.oid_title;
		}else{
			format_text.title = "";
		}
		var value = "";
		var elem = aData.oid_property.getElementsByTagName("NOTE")[0];
		if(elem) value = elem.textContent;
		format_text.note = value;
		var value = "";
		var attrs = [];
		var attrs_hash = {};
		var regexps = this.XPath.evaluateArray('/METACAPTURE[1]/META_REGEXP_ITEMS[1]/META_REGEXP_ITEM[@use="true"]',aXMLDoc);
		for(var regcnt=0;regcnt<regexps.length;regcnt++){
			var temp_attrs = [];
			var nodeName = "tag";
			var nodeValue = regexps[regcnt].getAttribute(nodeName);
			if(nodeValue != null && nodeValue != "") temp_attrs.push('@'+nodeName+'="'+nodeValue+'"');
			var nodeName = "name";
			var nodeValue = regexps[regcnt].getAttribute(nodeName);
			if(nodeValue != null && nodeValue != "") temp_attrs.push('@'+nodeName+'="'+nodeValue+'"');
			if(temp_attrs.length == 0) continue;
			var attrs_key = temp_attrs.join(" and ");
			if(attrs_hash[attrs_key] == undefined){
				attrs.push(attrs_key);
				attrs_hash[attrs_key] = [];
			}
			var temp_attrs = {};
			var nodeName = "regexp";
			var nodeValue = regexps[regcnt].getAttribute(nodeName);
			if(nodeValue != null) temp_attrs[nodeName] = nodeValue;
			var nodeName = "format";
			var nodeValue = regexps[regcnt].getAttribute(nodeName);
			if(nodeValue != null) temp_attrs[nodeName] = nodeValue;
			attrs_hash[attrs_key].push(temp_attrs);
		}
		for(var regcnt=0;regcnt<attrs.length;regcnt++){
			var attrs_key = attrs[regcnt];
			if(attrs_key.indexOf('@tag="TITLE"')>=0){
				var textContent = aData.doc_title;
				for(var rcnt=0;rcnt<attrs_hash[attrs_key].length;rcnt++){
					var regexp = attrs_hash[attrs_key][rcnt].regexp;
					var format = attrs_hash[attrs_key][rcnt].format;
					if(!regexp || regexp == "") continue;
					try{regexp = new RegExp(regexp);}catch(e){regexp=null;}
					if(!regexp) continue;
					if(!textContent.match(regexp)) continue;
					textContent = textContent.replace(regexp,format);
				}
				value += textContent;
			}else{
				var nodes = this.XPath.evaluateArray("//METACAPTURE[" + attrs_key + "]",aData.oid_property);
				for(var ncnt=0;ncnt<nodes.length;ncnt++){
					var elem = nodes[ncnt];
					var textContent = elem.getAttribute("content");
					if(textContent == null || textContent == "") textContent = elem.textContent;
					for(var rcnt=0;rcnt<attrs_hash[attrs_key].length;rcnt++){
						var regexp = attrs_hash[attrs_key][rcnt].regexp;
						var format = attrs_hash[attrs_key][rcnt].format;
						if(!regexp || regexp == "") continue;
						try{regexp = new RegExp(regexp);}catch(e){regexp=null;}
						if(!regexp) continue;
						if(!textContent.match(regexp)) continue;
						textContent = textContent.replace(regexp,format);
					}
					value += textContent;
				}
			}
		}
		format_text.meta = value;
		format_text.medline = {};
		var value = "";
		var elem = aData.oid_property.getElementsByTagName("PMCID")[0];
		if(elem) value = elem.textContent;
		format_text.medline.pmcid = value;
		var value = "";
		var elem = aData.oid_property.getElementsByTagName("PMID")[0];
		if(elem) value = elem.textContent;
		format_text.medline.pmid = value;
		var value = "";
		var elem = aData.oid_property.getElementsByTagName("SO")[0];
		if(elem) value = elem.textContent;
		format_text.medline.so = value;
		var output = setting.format;
		var flag = "";
		flag += (setting.regexp_i?'i':'');
		flag += (setting.regexp_g?'g':'');
		flag += (setting.regexp_m?'m':'');
		try{var regexp = (setting.regexp?new RegExp(setting.regexp,flag):null);}catch(e){this._dump(e);}
		var replace_text = setting.replace;
		var replacement_key = null;
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_HA,'g');
		output = output.replace(replacement_key,format_text.hyperanchor);
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_TITLE,'g');
		output = output.replace(replacement_key,format_text.title);
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_NOTE,'g');
		output = output.replace(replacement_key,format_text.note);
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_META,'g');
		output = output.replace(replacement_key,format_text.meta);
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_MEDLINE_PMCID,'g');
		output = output.replace(replacement_key,format_text.medline.pmcid);
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_MEDLINE_PMID,'g');
		output = output.replace(replacement_key,format_text.medline.pmid);
		replacement_key = new RegExp(bitsMetaCapture.TOKEN_MEDLINE_SO,'g');
		output = output.replace(replacement_key,format_text.medline.so);
		if(regexp && output.match(regexp)) output = output.replace(regexp,replace_text);
		if(setting.anchor_checked) output = '<a href="'+format_text.hyperanchor+'">'+output+'</a>';
		output = output.replace(/\\n/g,"\n");
		return output;
	},

/////////////////////////////////////////////////////////////////////
	capture : function(aDoc,aProperty){
		var confirm = nsPreferences.getBoolPref("wiredmarker.meta.capture.confirm", true);
		if(!confirm) return aProperty;
		this.rebuild();
		var capture_items = this.XPath.evaluateArray('/METACAPTURE[1]/CAPTURE_ITEMS[1]/CAPTURE_ITEM[@tag!="TITLE"]',this.xmldoc);
		if(!capture_items || capture_items.length == 0) return aProperty;
		if(!aProperty || aProperty == "") aProperty = "<PROPERTY/>";
		var parser = new DOMParser();
		var xmldoc = parser.parseFromString(aProperty,"text/xml");
		var extnode = null
		var results = this.XPath.evaluateArray('//EXTENDED_MESSAGE',xmldoc);
		if(!results || results.length == 0){
			extnode = xmldoc.createElement("EXTENDED_MESSAGE");
			xmldoc.documentElement.appendChild(extnode);
		}else{
			extnode = results[0];
		}
		var metanodes = null;
		var results = this.XPath.evaluateArray('//METACAPTURES',xmldoc);
		if(!results || results.length == 0){
			metanodes = xmldoc.createElement("METACAPTURES");
			extnode.appendChild(metanodes);
		}else{
			metanodes = results[0];
		}
		for(var i=0;i<capture_items.length;i++){
			var tag = capture_items[i].getAttribute("tag");
			var name = capture_items[i].getAttribute("name");
			var value = capture_items[i].getAttribute("value");
			if(!value) value = "#text";
			var aExpr = '//'+tag.toLowerCase();
			if(name) aExpr += '[@name="'+name+'"]';
			var results = this.XPath.evaluateArray(aExpr,aDoc);
			if(results && results.length > 0){
				for(var j=0;j<results.length;j++){
					var metanode = xmldoc.createElement("METACAPTURE");
					metanode.setAttribute("tag",tag);
					if(name) metanode.setAttribute("name",name);
					metanode.setAttribute("content",(value=="#text"?results[j].textContent:results[j].getAttribute(value)));
					metanodes.appendChild(metanode);
				}
			}
		}
		var s = new XMLSerializer();
		return s.serializeToString(xmldoc);
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},
}
