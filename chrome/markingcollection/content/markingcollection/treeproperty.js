/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
var mcPropertyView = {
	_dispID : "",
	_dispObj : null,

	get BUTTON()   { return document.getElementById("mcToolbarPropertyViewButton"); },
	get VBOX()     { return document.getElementById("mcPropertyViewVBox"); },
	get SPLITTER() { return document.getElementById("mcPropertyViewSplitter"); },
	get TITLE()    { return document.getElementById("mcPropTitleTextbox"); },
	get NOTE()     { return document.getElementById("mcPropNoteTextbox"); },
	get SAMPLE()   { return document.getElementById("mcPropSampleLabel"); },
	get MARKER_G() { return document.getElementById("mcPropMarkerGroup"); },
	get MARKER_C() { return document.getElementById("mcPropMarkerCustomButton"); },
	get BUTTON_U() { return document.getElementById("mcPropMarkerUpdateButton"); },

	get EXTENDED_MESSAGE() { return document.getElementById("mcPropertyExtendedMessageVBox"); },
	get LOGICAL_PAGE()     { return document.getElementById("mcPropExtendedMessageLogicalPageTextbox"); },
	get PHYSICAL_PAGE()    { return document.getElementById("mcPropExtendedMessagePhysicalPageTextbox"); },

	get MEDLINE_MESSAGE() { return document.getElementById("mcPropertyExtendedMessageMedlineVBox"); },
	get MEDLINE_PMCID()   { return document.getElementById("mcPropertyExtendedMessageMedlinePMCIDTextbox"); },
	get MEDLINE_PMID()    { return document.getElementById("mcPropertyExtendedMessageMedlinePMIDTextbox"); },
	get MEDLINE_SO()      { return document.getElementById("mcPropertyExtendedMessageMedlineSOTextbox"); },

	get URL_BOX()  { return document.getElementById("mcPropertyURLVBox"); },
	get URL()      { return document.getElementById("mcPropURLTextbox"); },

	get METACAPTURE_BOX() { return document.getElementById("mcPropertyMetaCaptureVBox"); },
	get METACAPTURE() { return document.getElementById("mcPropertyMetaCaptureTextbox"); },

	get DataSource() { return window.top.bitsObjectMng.DataSource; },
	get Common()     { return window.top.bitsObjectMng.Common;     },
	get Database()   { return window.top.bitsObjectMng.Database;   },
	get XML()        { return window.top.bitsObjectMng.XML;   },
	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},

	get isChecked() {
		var checked = this.BUTTON.getAttribute("checked");
		if(!checked || checked == "false"){
			checked = false;
		}else{
			checked = true;
		}
		return checked;
	},

	clear : function(){
		this.TITLE.value = "";
		this.NOTE.value = "";
		this.URL.value = "";
		this.BUTTON_U.setAttribute("disabled",true);
		this._resource = null;;
		this._title = "";
		this._note = "";
		this._property = "";
		this._url = "";
		this._index = "";
		this._style = "";
		this._editmode = "";
		this._extended_message = null;
		this._logical_page = "";
		this._physical_page = "";
	},

	init : function(){
		this._dispID = "";
		this.clear();
		var propertyview = nsPreferences.getBoolPref("wiredmarker.propertyview", false);
		this.BUTTON.setAttribute("checked",propertyview);
		this.VBOX.setAttribute("hidden",!propertyview);
		if(this.SPLITTER) this.SPLITTER.setAttribute("hidden",!propertyview);
		this.dispProperty();
	},

	done : function(){
		this.VBOX.setAttribute("hidden",true);
		if(this.SPLITTER) this.SPLITTER.setAttribute("hidden",true);
		this.BUTTON.setAttribute("checked",false);
		this.clear();
	},

	onClick : function(aEvent){
		var checked = this.isChecked;
		if(!checked){
			checked = true;
		}else{
			checked = false;
		}
		this.BUTTON.setAttribute("checked",checked);
		this.VBOX.setAttribute("hidden",!checked);
		if(this.SPLITTER) this.SPLITTER.setAttribute("hidden",!checked);
		nsPreferences.setBoolPref("wiredmarker.propertyview",checked);
		aEvent.stopPropagation();
	},

	xmlEncode : function(aString){
		return aString.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	},

	dispProperty : function(aDispItem){
		var rtn = false;
		var checked = this.isChecked;
		this._dispObj = aDispItem;
		if(aDispItem){
			this._resource = null;
			this._id = (aDispItem.fid!=undefined?aDispItem.fid:aDispItem.oid);
			this._pfid = aDispItem.pfid;
			this._dbtype = aDispItem.dbtype;
			this._editmode = (aDispItem.fid_mode!=undefined?aDispItem.fid_mode:aDispItem.oid_mode);
			this._style = null;
			var rValue = [aDispItem];
			if(rValue[0]){
				if(rValue[0].fid_style){
					this._style = rValue[0].fid_style.replace(/([:;\(,])\s+/mg,"$1")
				}else if(rValue[0].pfid != undefined){
					var folders = this.Database.getFolderFormID(rValue[0].pfid,this._dbtype);
					if(folders) this._style = folders[0].fid_style.replace(/([:;\(,])\s+/mg,"$1")
				}
			}
			if(rValue){
				this._url = "";
				this._metacapture = "";
				if(aDispItem.fid!=undefined){
					this._title = rValue[0].fid_title;
					this._property = rValue[0].fid_property;
					this._extended_message = null;
				}else{
					this._title = rValue[0].oid_title;
					this._url = rValue[0].con_url;
					this._metacapture = rValue[0].doc_title;
					this._property = rValue[0].oid_property;
					this._extended_message = (rValue[0].oid_type == "application/pdf" ? true : null);
				}
				this._note = "";
				this._logical_page = "";
				this._physical_page = "";
				this._medline = {
					PMCID : "",
					PMID  : "",
					SO    : ""
				};
				if(this._property != ""){
					try{
						var parser = new DOMParser();
						var xmldoc = parser.parseFromString(this._property,"text/xml");
						parser = undefined;
						var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
						if(xmlnode) this._note = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
						if(xmlnode) this._url = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
						if(xmlnode) this._logical_page = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
						if(xmlnode) this._physical_page = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("PMCID")[0];
						if(xmlnode) this._medline.PMCID = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("PMID")[0];
						if(xmlnode) this._medline.PMID = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("SO")[0];
						if(xmlnode) this._medline.SO = xmlnode.textContent;
						var xmlnode = xmldoc.getElementsByTagName("METACAPTURE")[0];
						if(xmlnode) this._metacapture = xmlnode.getAttribute("content");
					}catch(ex3){
					}
				}
				if(this._url == "" && rValue[0].con_url && rValue[0].bgn_dom){
					this._url = rValue[0].con_url;
					if(rValue[0].bgn_dom) this._url += "#hyperanchor:"+this.xmlEncode(rValue[0].bgn_dom);
					if(rValue[0].end_dom) this._url += "&"+this.xmlEncode(rValue[0].end_dom);
					if(this._style) this._url += "&"+this.xmlEncode(this._style);
				}
			}else{
				this._title = "";
				this._note = "";
				this._url = "";
				this._metacapture = "";
			}
			this.TITLE.value = this._title;
			this.TITLE.defaultValue = this._title;
			this.NOTE.value = this._note;
			this.URL.value = this._url;
			this.METACAPTURE.value = this._metacapture;
			if(this._extended_message){
				this.EXTENDED_MESSAGE.removeAttribute("hidden");
				this.LOGICAL_PAGE.value = this._logical_page;
				this.PHYSICAL_PAGE.value = this._physical_page;
			}else{
				this.EXTENDED_MESSAGE.setAttribute("hidden","true");
			}
			if(this._medline.PMCID || this._medline.PMID || this._medline.SO){
				this.MEDLINE_MESSAGE.removeAttribute("hidden");
				this.MEDLINE_PMCID.value = this._medline.PMCID;
				this.MEDLINE_PMID.value = this._medline.PMID;
				this.MEDLINE_SO.value = this._medline.SO;
			}else{
				this.MEDLINE_MESSAGE.setAttribute("hidden","true");
			}
			if(this._url){
				this.URL_BOX.removeAttribute("hidden");
			}else{
				this.URL_BOX.setAttribute("hidden","true");
			}
			if(this._metacapture){
				this.METACAPTURE_BOX.removeAttribute("hidden");
			}else{
				this.METACAPTURE_BOX.setAttribute("hidden","true");
			}
			this.SAMPLE.setAttribute("style", this._style);
			if(this._editmode && (parseInt(this._editmode) & 0xFFFF)){
				if((parseInt(this._editmode) & 0x0001)){
					this.MARKER_C.setAttribute("disabled",true);
				}else{
					this.MARKER_C.removeAttribute("disabled");
				}
				if((parseInt(this._editmode) & 0x0002)){
					this.MARKER_G.setAttribute("hidden",true);
				}else{
					this.MARKER_G.removeAttribute("hidden");
				}
				if(parseInt(this._editmode) & 0x00F0){
					this.TITLE.setAttribute("readonly",true);
				}else{
					this.TITLE.removeAttribute("readonly");
				}
				if(parseInt(this._editmode) & 0x0F00){
					this.NOTE.setAttribute("readonly",true);
				}else{
					this.NOTE.removeAttribute("readonly");
				}
			}else{
				this.TITLE.removeAttribute("readonly");
				this.NOTE.removeAttribute("readonly");
				if(this._resource && !this.DataSource.isContainer(this._resource)){
					this.MARKER_G.setAttribute("hidden",true);
				}else{
					this.MARKER_C.removeAttribute("disabled");
					this.MARKER_G.removeAttribute("hidden");
				}
			}
		}else{
			this.clear();
			this.TITLE.setAttribute("readonly",true);
			this.NOTE.setAttribute("readonly",true);
			this.MARKER_C.setAttribute("disabled",true);
			this.EXTENDED_MESSAGE.hidden = true;
			this.MEDLINE_MESSAGE.hidden = true;
			this.METACAPTURE_BOX.hidden = true;
		}
		this.BUTTON_U.setAttribute("disabled",true);
		this.MARKER_G.setAttribute("hidden",true);
		if(this._dispID != this._id){
			try{this.TITLE.editor.transactionManager.clear();}catch(ex2){}
			try{this.NOTE.editor.transactionManager.clear();}catch(ex2){}
			this._dispID = this._id;
		}
		return rtn;
	},

	openDialog : function(){
		var result = {
			accept : false,
			style  : this._style,
		};
		if(!this._index) this._index = -1;
		window.openDialog('chrome://markingcollection/content/markerCustom.xul', '', 'modal,centerscreen,chrome',this._index,result);
		if(result.accept){
			this._style = result.style;
			this.SAMPLE.setAttribute("style",this._style);
			this.DataSource.setProperty(this._resource,"style",this._style);
		}
	},

	updateTitle : function(aValue){
		this.BUTTON_U.removeAttribute("disabled");
	},

	updateNote : function(aValue){
		this.BUTTON_U.removeAttribute("disabled");
	},

	undoTitle : function(){
		try{
			while(this.TITLE.editor.transactionManager.numberOfUndoItems>0){
				this.TITLE.editor.undo(1);
				var title = this.TITLE.value;
				title = title.replace(/\t/mg,"        ");
				title = this.Common.exceptCode(title);
				title = title.replace(/[\r\n]/mg, " ").replace(/^\s*/img,"").replace(/\s*$/img,"");
				if(title != "") break;
			}
		}catch(ex2){_dump(ex2);}
		setTimeout(function(){mcPropertyView.TITLE.focus();},100);
	},

	update : function(aEvent,aElem){
		var title = this.TITLE.value;
		var note = this.NOTE.value;
		note = note.replace(/\t/mg,"        ");
		note = note.replace(/\x0D\x0A|\x0D|\x0A/g," __BR__ ");
		note = this.Common.exceptCode(note);
		note = note.replace(/ __BR__ /mg,"\n");
		title = title.replace(/\t/mg,"        ");
		title = this.Common.exceptCode(title);
		var logical_page = null;
		var physical_page = null;
		if(this._extended_message){
			logical_page = this.LOGICAL_PAGE.value;
			logical_page = logical_page.replace(/\t/mg,"        ");
			logical_page = this.Common.exceptCode(logical_page);
			physical_page = this.PHYSICAL_PAGE.value;
			physical_page = physical_page.replace(/\t/mg,"        ");
			physical_page = this.Common.exceptCode(physical_page);
		}
		if(this._dispObj && this._title != title){
			var chkTitle = title.replace(/[\r\n]/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
			if(chkTitle == ""){
				this.Common.alert(mcMainService.STRING.getString("ERROR_NOT_ENTER_TITLE"));
//				this.undoTitle();
				this.TITLE.value = this.TITLE.defaultValue;
				aEvent.preventDefault();
				aEvent.stopPropagation();
				var self = this;
				setTimeout(function(){ self.TITLE.focus(); },0);
				return false;
			}
			if(this._dispObj.fid != undefined){
				var i;
				var listTitle = "";
				var listRes = this.Database.getFolderFormPID(this._dispObj.pfid,this._dispObj.dbtype);
				if(listRes){
					for(i=0;i<listRes.length;i++){
						if(listRes[i].fid == this._dispObj.fid) continue;
						listTitle = listRes[i].fid_title;
						listTitle = listTitle.replace(/^\s*/img,"").replace(/\s*$/img,"");
						if(listTitle == chkTitle) break;
					}
					if(listTitle == chkTitle){
						this.Common.alert(mcMainService.STRING.getString("ERROR_INVALID_TITLE") + "[ " + chkTitle + " ]");
//						this.undoTitle();
						this.TITLE.value = this.TITLE.defaultValue;
						aEvent.preventDefault();
						aEvent.stopPropagation();
						var self = this;
						setTimeout(function(){ self.TITLE.focus(); },0);
						return false;
					}
				}else{
					return;
				}
			}
		}
		if(this._title != title || this._note != note || (this._extended_message && (this._logical_page != logical_page || this._physical_page != physical_page))){
			if(this._note != note || (this._extended_message && (this._logical_page != logical_page || this._physical_page != physical_page))){
				if(!this._property || this._property == "") this._property = "<PROPERTY/>";
				try{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(this._property,"text/xml");
					parser = undefined;
					if(this._note != note){
						var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
						if(!xmlnode){
							xmlnode = xmldoc.createElement("NOTE");
							xmldoc.documentElement.appendChild(xmlnode);
						}
						while(xmlnode.hasChildNodes()) xmlnode.removeChild(xmlnode.lastChild);
						var elemS = xmldoc.createTextNode(note);
						if(elemS) xmlnode.appendChild(elemS);
					}
					if(this._extended_message && (this._logical_page != logical_page || this._physical_page != physical_page)){
						var extras_msg = xmldoc.getElementsByTagName("EXTENDED_MESSAGE")[0];
						if(!extras_msg){
							extras_msg = xmldoc.createElement("EXTENDED_MESSAGE");
							xmldoc.documentElement.appendChild(extras_msg);
						}
						var xmlnode = xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
						if(!xmlnode){
							xmlnode = xmldoc.createElement("LOGICAL_PAGE");
							extras_msg.appendChild(xmlnode);
						}
						if(xmlnode){
							while(xmlnode.hasChildNodes()){ xmlnode.removeChild(xmlnode.lastChild); }
							if(logical_page) xmlnode.appendChild(xmldoc.createTextNode(logical_page));
						}
						var xmlnode = xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
						if(!xmlnode){
							xmlnode = xmldoc.createElement("PHYSICAL_PAGE");
							extras_msg.appendChild(xmlnode);
						}
						if(xmlnode){
							while(xmlnode.hasChildNodes()){ xmlnode.removeChild(xmlnode.lastChild); }
							if(physical_page) xmlnode.appendChild(xmldoc.createTextNode(physical_page));
						}
					}
					var s = new XMLSerializer();
					this._property = s.serializeToString(xmldoc);
					s = undefined;
				}catch(ex3){
				}
				try{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(this._property,"text/xml");
					if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
					if(!xmldoc){
						this.Common.alert("Read Error!!");
						return false;
					}
				}catch(ex3){
					alert(ex3);
				}
			}
			var rtn = false;
			if(this._dispObj.fid != undefined){
				rtn = this.Database.updateFolder({fid:this._id, fid_title:title, fid_property:this._property},this._dbtype);
				if(rtn){
					this._dispObj.fid_title = title;
					this._dispObj.fid_property = this._property;
				}
			}else{
				rtn = this.Database.updateObject({oid:this._id, oid_title:title, oid_property:this._property},this._dbtype);
				if(rtn){
					this._dispObj.oid_title = title;
					this._dispObj.oid_property = this._property;
				}
			}
			if(rtn){
				var About = this.DataSource.getID2About(this._id,this._pfid,this._dbtype);
				if(About && this._title != title){
					var res = this.Common.RDF.GetResource(About);
					if(this.DataSource.isContainer(res)){
						this.DataSource.setProperty(res,"title",title);
					}else{
						var contResList = this.DataSource.flattenResources(this.Common.RDF.GetResource(this.DataSource.ABOUT_ROOT), 2, true);
						var i;
						for(i=0;i<contResList.length;i++){
							var id = this.DataSource.getProperty(contResList[i],"id");
							var dbtype = this.DataSource.getProperty(contResList[i],"dbtype");
							if(this._id != id || this._dbtype != dbtype) continue;
							this.DataSource.setProperty(contResList[i],"title",title);
						}
					}
					this.DataSource.flush();
				}
				if(mcItemView.isChecked) mcItemView.refresh();
			}
			this._title = title;
			this._note = note;
			if(this._extended_message){
				this._logical_page = logical_page;
				this._physical_page = physical_page;
			}
		}
		if(this.NOTE.value != note) this.NOTE.value = note;
		if(this.TITLE.value != title) this.TITLE.value = title;
		if(this._extended_message){
			if(this.LOGICAL_PAGE.value != logical_page) this.LOGICAL_PAGE.value = logical_page;
			if(this.PHYSICAL_PAGE.value != physical_page) this.PHYSICAL_PAGE.value = physical_page;
		}
		return true;
	},

};
function _dump2(aString){
	if(!nsPreferences.getBoolPref("wiredmarker.debug", false)) return;
	var dumpString = new String(aString);
	var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
	                      .getService(Components.interfaces.nsIConsoleService);
	aConsoleService.logStringMessage(dumpString);
	window.dump(aString+"\n");
}
