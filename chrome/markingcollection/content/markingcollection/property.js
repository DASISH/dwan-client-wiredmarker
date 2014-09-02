var mcPropService = {

	get STRING()     { return document.getElementById("mcPropString"); },
	get ICON()       { return document.getElementById("mcPropIcon"); },
	get TITLE()      { return document.getElementById("mcPropTitle"); },
	get NOTE()       { return document.getElementById("mcPropNote"); },
	get TAG()        { return document.getElementById("mcPropTagTextbox"); },
	get DB_PATH()    { return document.getElementById("mcPropDBPath"); },
	get DB_DATE()    { return document.getElementById("mcPropDBDate"); },
	get DB_SIZE()    { return document.getElementById("mcPropDBSize"); },
	get ICON_SIZE()  { return document.getElementById("mcPropIconsize"); },
	get ICON_SIZE_S(){ return document.getElementById("mcPropIconsizeSmall"); },
	get ICON_SIZE_L(){ return document.getElementById("mcPropIconsizeLarge"); },
	get ICON_SIZE_I(){ return document.getElementById("mcPropIconsizeImage"); },

	get TITLE_HBOX() { return document.getElementById("mcPropTitleHBox"); },

	get TABBOX()     { return document.getElementById("mcPropTabbox"); },

	get GENERAL_TAB() { return document.getElementById("mcPropGeneralTab"); },
	get NOTE_TAB()    { return document.getElementById("mcPropNoteTab"); },

	get EXTENDED_MESSAGE_TAB() { return document.getElementById("mcPropExtendedMessageTab"); },
	get LOGICAL_PAGE()         { return document.getElementById("mcPropExtendedMessageLogicalPageTextbox"); },
	get PHYSICAL_PAGE()        { return document.getElementById("mcPropExtendedMessagePhysicalPageTextbox"); },

	get URL_TAB()    { return document.getElementById("mcPropURLTab"); },
	get URL_PANEL()  { return document.getElementById("mcPropURLTabpanel"); },
	get URL()        { return document.getElementById("mcPropURLTextbox"); },

	get METACAPTURE_TAB()   { return document.getElementById("mcPropMetaCaptureTab"); },
	get METACAPTURE_PANEL() { return document.getElementById("mcPropMetaCaptureTabpanel"); },
	get METACAPTURE()       { return document.getElementById("mcPropMetaCaptureTextbox"); },

	get MEDLINE_TAB()   { return document.getElementById("mcPropMedlineTab"); },
	get MEDLINE_PMCID() { return document.getElementById("mcPropMedlinePMCIDTextbox"); },
	get MEDLINE_PMID()  { return document.getElementById("mcPropMedlinePMIDTextbox"); },
	get MEDLINE_SO()    { return document.getElementById("mcPropMedlineSOTextbox"); },

	get SC_DISABLED(){ return document.getElementById("mcPropShortcutDisabled"); },
	get SC_SHIFT()   { return document.getElementById("mcPropShortcutShift"); },
	get SC_ALT()     { return document.getElementById("mcPropShortcutAlt"); },
	get SC_ACCEL()   { return document.getElementById("mcPropShortcutAccel"); },
	get SC_KEY()     { return document.getElementById("mcPropShortcutKey"); },
	get SC_MOD()     { return document.getElementById("mcPropShortcutModifiers"); },

	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},
	get mcItemView() { return window.opener.mcItemView;},

	id       : null,
	item     : null,
	resource : null,
	property : "",
	_xmldoc : null,

	get xmldoc(){ return this._xmldoc; },

	init : function(){
		try {
			if(window.arguments[1] && window.arguments[1].id){
				this.id = window.arguments[1].id;
			}else{
				this.id = window.arguments[0];
			}
		}catch(ex){
			document.location.href.match(/\?id\=(.*)$/);
			this.id = RegExp.$1;
		}
		if(!this.id) return;
		this.item = this.Common.newItem();
		this.resource = this.Common.RDF.GetResource(this.DataSource.ABOUT_ITEM + this.id);
		var prop;
		var value;
		for(prop in this.item){
			value = undefined;
			if(window.arguments[1] && window.arguments[1][prop]){
				value = window.arguments[1][prop];
			}else{
				value = this.DataSource.getProperty(this.resource, prop);
			}
			if(value == undefined) continue;
			this.item[prop] = value;
		}
		if(this.item["editmode"] == undefined) this.item["editmode"] = this.DataSource.getProperty(this.resource, "editmode");
		this.TITLE.value = this.item.title;
		this.TITLE.defaultValue = this.item.title;
		try{this.TITLE.editor.transactionManager.clear();}catch(ex2){}
		this._extended_message = null;
		if(this.item.dbtype){
			this.dbtype = this.item.dbtype;
		}else{
			this.dbtype = this.DataSource.getProperty(this.resource, "dbtype");
		}
		this.GENERAL_TAB.setAttribute("hidden","true");
		this.NOTE_TAB.setAttribute("hidden","true");
		this.URL_TAB.setAttribute("hidden","true");
		this.METACAPTURE_TAB.setAttribute("hidden","true");
		this.MEDLINE_TAB.setAttribute("hidden","true");
		this.EXTENDED_MESSAGE_TAB.setAttribute("hidden","true");
		if(this.item.property){
			this.property = this.item.property;
		}else{
			this.property = "";
			if(this.DataSource.isContainer(this.resource)){
				var rValue = this.Database.getFolderFormID(this.item.id,this.dbtype);
				if(rValue) this.property = rValue[0].fid_property;
			}else{
				var rValue = this.Database.getObjectFormID(this.item.id,this.dbtype);
				if(rValue){
					this.property = rValue[0].oid_property;
					this.URL.value = rValue[0].con_url;
					this.METACAPTURE.value = rValue[0].doc_title;
					this._extended_message = (rValue[0].oid_type == "application/pdf" ? true : null);
					this.URL_TAB.removeAttribute("hidden");
					this.METACAPTURE_TAB.removeAttribute("hidden");
				}
			}
		}
		var parser = new DOMParser();
		var xmldoc;
		if(this.property != "") xmldoc = parser.parseFromString(this.property, "text/xml");
		parser = undefined;
		var note_elem;
		var iconsize_elem;
		var propertyOverlay_elem;
		var tag_elem;
		var url_elem;
		var metacapture_elem;
		var logical_elem;
		var physical_elem;
		var medline_pmcid_elem;
		var medline_pmid_elem;
		var medline_so_elem;
		if(xmldoc){
			note_elem = xmldoc.getElementsByTagName("NOTE")[0];
			iconsize_elem = xmldoc.getElementsByTagName("ICON_SIZE")[0];
			propertyOverlay_elem = xmldoc.getElementsByTagName("PROPERTYOVERLAY")[0];
			tag_elem = xmldoc.getElementsByTagName("TAG")[0];
			url_elem = xmldoc.getElementsByTagName("HYPER_ANCHOR")[0];
			logical_elem = xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
			physical_elem = xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
			metacapture_elem = xmldoc.getElementsByTagName("METACAPTURE")[0];

			medline_pmcid_elem = xmldoc.getElementsByTagName("PMCID")[0];
			medline_pmid_elem = xmldoc.getElementsByTagName("PMID")[0];
			medline_so_elem = xmldoc.getElementsByTagName("SO")[0];
		}
		if(url_elem){
			this.URL.value = url_elem.textContent;
		}
		if(metacapture_elem){
			this.METACAPTURE.value = metacapture_elem.getAttribute("content");
		}
		if(this._extended_message){
			this.EXTENDED_MESSAGE_TAB.removeAttribute("hidden");
			if(logical_elem){
				this.LOGICAL_PAGE.value = logical_elem.textContent;
				this.item.logical = logical_elem.textContent;
			}
			if(physical_elem){
				this.PHYSICAL_PAGE.value = physical_elem.textContent;
				this.item.physical = physical_elem.textContent;
			}
		}
		if(medline_pmcid_elem || medline_pmid_elem || medline_so_elem){
			this.MEDLINE_TAB.removeAttribute("hidden");
			this.MEDLINE_PMCID.value = medline_pmcid_elem.textContent;
			this.MEDLINE_PMID.value = medline_pmid_elem.textContent;
			this.MEDLINE_SO.value = medline_so_elem.textContent;
		}
		this.item.note = "";
		if(note_elem){
			this.item.note = note_elem.textContent;
		}else if(this.property != ""){
			this.property = this.property.replace(/[\r\n\t]/mg," __BR__ ");
			if(this.property.match(/^.*<NOTE>(.*?)<\/NOTE>.*$/m)){
				this.item.note = RegExp.$1;
			}else if(this.property.match(/^<PROPERTY>.*<\/PROPERTY>.*$/m)){
				this.item.note = "";
			}else{
				this.item.note = this.property;
			}
			this.item.note = this.item.note.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
			this.property = this.property.replace(/ __BR__ /mg,"\n");
			this.item.note = this.item.note.replace(/ __BR__ /mg,"\n");
		}
		this.item.iconsize = "small";
		if(iconsize_elem){
			this.item.iconsize = iconsize_elem.textContent;
		}else if(this.property != ""){
			var property = this.property.replace(/[\r\n\t]/mg," __BR__ ");
			if(property.match(/^.*<ICON_SIZE>(.*?)<\/ICON_SIZE>.*$/m)){
				this.item.iconsize = RegExp.$1;
			}
			this.item.iconsize = this.item.iconsize.replace(/ __BR__ /mg,"\n");
		}
		var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		if(parseInt(info.version)>2 && this.mcItemView.isChecked){
			if(this.item.iconsize == "small"){
				this.ICON_SIZE_S.setAttribute("selected",true);
				this.ICON_SIZE_L.removeAttribute("selected");
			}else{
				this.ICON_SIZE_L.setAttribute("selected",true);
				this.ICON_SIZE_S.removeAttribute("selected");
			}
			this.ICON_SIZE_I.setAttribute("iconsize",this.item.iconsize);
		}else{
			this.ICON_SIZE_L.setAttribute("disabled","true");
			this.ICON_SIZE_S.setAttribute("disabled","true");
		}
		this.NOTE.value = this.item.note;
		try{this.NOTE.editor.transactionManager.clear();}catch(ex2){}
		if(tag_elem) this.item.tag = tag_elem.textContent;
		if(this.item.tag != undefined) this.TAG.value = this.item.tag;
		try{this.TAG.editor.transactionManager.clear();}catch(ex2){}
		document.getElementById("mcPropSample").setAttribute("style",this.item.style);
		if(this.item.editmode && (parseInt(this.item.editmode) & 0xFFFF)){
			if((parseInt(this.item.editmode) & 0x0001)){
				document.getElementById("mcPropMarkerCustomButton").setAttribute("disabled",true);
			}
			if((parseInt(this.item.editmode) & 0x0002)){
				document.getElementById("mcPropMarkerGroup").setAttribute("hidden",true);
				document.getElementById("mcPropTagGroup").setAttribute("hidden",true);
				document.getElementById("mcPropShortcutGroup").setAttribute("hidden",true);
			}
			if((parseInt(this.item.editmode) & 0x0004)){
				document.getElementById("mcPropTagGroup").setAttribute("hidden",true);
				document.getElementById("mcPropShortcutGroup").setAttribute("hidden",true);
			}
			if(!(parseInt(this.item.editmode) & 0x00F0)){
				this.TITLE.removeAttribute("readonly");
				this.TITLE.removeAttribute("style");
				this.TAG.removeAttribute("readonly");
				this.TAG.removeAttribute("style");
			}
			if(!(parseInt(this.item.editmode) & 0x0F00)){
				this.NOTE.removeAttribute("readonly");
				this.NOTE.removeAttribute("style");
			}
		}else if(!this.DataSource.isContainer(this.resource)){
			document.getElementById("mcPropMarkerGroup").setAttribute("hidden",true);
			document.getElementById("mcPropTagGroup").setAttribute("hidden",true);
			document.getElementById("mcPropShortcutGroup").setAttribute("hidden",true);
			document.getElementById("mcPropIconsizeGroup").setAttribute("hidden",true);
			this.TITLE.removeAttribute("readonly");
			this.TITLE.removeAttribute("style");
			this.TAG.removeAttribute("readonly");
			this.TAG.removeAttribute("style");
			this.NOTE.removeAttribute("readonly");
			this.NOTE.removeAttribute("style");
		}else{
			this.TITLE.removeAttribute("readonly");
			this.TITLE.removeAttribute("style");
			this.TAG.removeAttribute("readonly");
			this.TAG.removeAttribute("style");
			this.NOTE.removeAttribute("readonly");
			this.NOTE.removeAttribute("style");
		}
		document.getElementById("mcPropDatabaseGroup").setAttribute("hidden",true);
		if(parseInt(this.item.editmode) & 0x1000){
			var aDBFile = this.Database.getDatabaseFile(this.dbtype);
			if(aDBFile){
				var aFile = this.Common.convertPathToFile(aDBFile.path);
				this.DB_PATH.value = aFile.path;
				this.DB_DATE.value = (new Date(aFile.lastModifiedTime)).toLocaleString();
				this.DB_SIZE.value = this.formatFileSize(aFile.fileSize);
				document.getElementById("mcPropDatabaseGroup").removeAttribute("hidden");
			}
		}
		if(!document.getElementById("mcPropShortcutGroup").hasAttribute("hidden")){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			this._opener = wm.getMostRecentWindow("navigator:browser");
			var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
			if(osString == "Darwin"){
				this.SC_ALT.setAttribute('label','Option');
				this.SC_ACCEL.setAttribute('label','Command');
			}
			if(!this.id || !this.dbtype || !this._opener){
				this.SC_DISABLED.setAttribute("disabled","true");
				this.SC_SHIFT.setAttribute("disabled","true");
				this.SC_ALT.setAttribute("disabled","true");
				this.SC_ACCEL.setAttribute("disabled","true");
				this.SC_KEY.setAttribute("disabled","true");
			}else{
				var bitsShortcutService = this._opener.top.bitsShortcutService;
				if(bitsShortcutService){
					var sc = bitsShortcutService.getShortcut(this.id,this.dbtype);
					if(!sc || sc.disabled){
						this.SC_DISABLED.checked = false;
					}else{
						this.SC_DISABLED.checked = true;
					}
					if(!this.SC_DISABLED.checked){
						this.SC_SHIFT.setAttribute("disabled","true");
						this.SC_ALT.setAttribute("disabled","true");
						this.SC_ACCEL.setAttribute("disabled","true");
						this.SC_KEY.setAttribute("disabled","true");
					}
					if(sc){
						this.SC_SHIFT.checked = sc.shift;
						this.SC_ALT.checked = sc.alt;
						this.SC_ACCEL.checked = sc.accel;
						if(sc.key){
							this.SC_KEY.value = sc.key;
							var acceltext = [];
							if(sc.accel){
								if(osString == "Darwin"){
									acceltext.push('Command');
								}else{
									acceltext.push('Ctrl');
								}
							}
							if(sc.shift) acceltext.push('Shift');
							if(sc.alt){
								if(osString == "Darwin"){
									acceltext.push('Option');
								}else{
									acceltext.push('Alt');
								}
							}
							this.SC_MOD.value = acceltext.join("+")+" +";
						}
					}
				}
			}
			try{this.SC_KEY.editor.transactionManager.clear();}catch(ex2){}
		}
		if(propertyOverlay_elem){
			document.loadOverlay(propertyOverlay_elem.textContent, null);
			setTimeout(function(){
				window.sizeToContent();
				setTimeout(function(){ window.sizeToContent(); },500);
			},100);
		}
		this.NOTE_TAB.removeAttribute("hidden");
		this.GENERAL_TAB.removeAttribute("hidden");
		document.title = this.item.title;
		return;
	},

	_createXMLDoc : function(aContent){
		var parser = new DOMParser();
		this._xmldoc = parser.parseFromString(aContent, "text/xml");
		parser = undefined;
	},

	_xmlSerializer : function(){
		var s = new XMLSerializer();
		var aContent = s.serializeToString(this.xmldoc);
		s = undefined;
		return aContent;
	},

	accept : function(){
		var newVals = {
			title    : this.TITLE.value,
			tag      : this.TAG.value,
			style    : document.getElementById("mcPropSample").style.cssText,
			note     : this.Common.escapeComment(this.NOTE.value),
			iconsize : (this.ICON_SIZE.disabled?"small":this.ICON_SIZE.value),
		};
		if(this._extended_message){
			newVals["logical"] = this.LOGICAL_PAGE.value;
			newVals["logical"] = newVals["logical"].replace(/\t/mg,"        ");
			newVals["logical"] = this.Common.exceptCode(newVals["logical"]);
			newVals["logical"] = newVals["logical"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");

			newVals["physical"] = this.PHYSICAL_PAGE.value;
			newVals["physical"] = newVals["physical"].replace(/\t/mg,"        ");
			newVals["physical"] = this.Common.exceptCode(newVals["physical"]);
			newVals["physical"] = newVals["physical"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		}

		var changed = this.DataSource.isContainer(this.resource);
		if(!this.DataSource.isContainer(this.resource) && newVals.style) delete newVals.style;

		newVals["title"] = newVals["title"].replace(/\t/mg,"        ");
		newVals["title"] = this.Common.exceptCode(newVals["title"]);
		newVals["title"] = newVals["title"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		if(newVals["title"] == ""){
			this.TITLE.value = this.TITLE.defaultValue;
			this.TABBOX.selectedTab = this.GENERAL_TAB;
			var self = this;
			setTimeout(function(){ self.TITLE.focus(); },0);
			return false;
		}
		if(this.DataSource.isContainer(this.resource)){
			var parRes = this.DataSource.findParentResource(this.resource);
			if(!parRes) return;
			var i;
			var listTitle = "";
			var listRes = this.DataSource.flattenResources(parRes,1,false);
			for(i=0;i<listRes.length;i++){
				if(listRes[i].Value == this.resource.Value) continue;
				listTitle = this.DataSource.getProperty(listRes[i],"title");
				listTitle = listTitle.replace(/^\s*/img,"").replace(/\s*$/img,"");
				if(listTitle == newVals["title"]) break;
				listTitle = "";
			}
			if(listTitle == newVals["title"]){
				this.TITLE.value = this.TITLE.defaultValue;
				var self = this;
				setTimeout(function(){ self.TITLE.focus(); },0);
				return false;
			}
		}

		newVals["tag"] = newVals["tag"].replace(/\t/mg,"        ");
		newVals["tag"] = this.Common.exceptCode(newVals["tag"]);
		newVals["tag"] = newVals["tag"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");

		newVals["note"] = newVals["note"].replace(/\t/mg,"        ");
		newVals["note"] = newVals["note"].replace(/\x0D\x0A|\x0D|\x0A/g," __BR__ ");
		newVals["note"] = this.Common.exceptCode(newVals["note"]);
		newVals["note"] = newVals["note"].replace(/[\r\n]/mg, " ").replace(/ __BR__ /mg,"\n");

		var props;
		for(props in newVals){
			if(this.item[props] == newVals[props]) continue;
			this.item[props] = newVals[props];
			changed = true;
		}

		if(!this.DataSource.isContainer(this.resource) && this.item.style) delete this.item.style;

		if(changed){
			if(this.item.title) this.item.title = this.item.title.replace(/[\r\n]/mg, " ");
			//最新の情報を取得
			var dbitem = {};
			if(this.item.id){
				if(this.item.tag || this.item.note || this.item.iconsize || this.item.logical || this.item.physical){
					if(this.property == "") this.property = "<PROPERTY/>";
					this._createXMLDoc(this.property);
					if(this.xmldoc){
						if(this.item.tag != undefined){
							var tag = this.xmldoc.getElementsByTagName("TAG")[0];
							if(this.item.tag != "" && !tag){
								tag = this.xmldoc.createElement("TAG");
								this.xmldoc.documentElement.appendChild(tag);
							}else if(this.item.tag == "" && tag){
								tag.parentNode.removeChild(tag);
								tag = undefined;
							}
							if(tag){
								while(tag.hasChildNodes()){ tag.removeChild(tag.lastChild); }
								tag.appendChild(this.xmldoc.createTextNode(this.item.tag));
							}
						}
						if(this.item.note != undefined){
							var note = this.xmldoc.getElementsByTagName("NOTE")[0];
							if(this.item.note != "" && !note){
								note = this.xmldoc.createElement("NOTE");
								this.xmldoc.documentElement.appendChild(note);
							}else if(this.item.note == "" && note){
								note.parentNode.removeChild(note);
								note = undefined;
							}
							if(note){
								while(note.hasChildNodes()){ note.removeChild(note.lastChild); }
								note.appendChild(this.xmldoc.createTextNode(this.item.note));
							}
						}
						if(this.item.iconsize && this.DataSource.isContainer(this.resource)){
							var iconsize = this.xmldoc.getElementsByTagName("ICON_SIZE")[0];
							if(!iconsize){
								iconsize = this.xmldoc.createElement("ICON_SIZE");
								this.xmldoc.documentElement.appendChild(iconsize);
							}
							while(iconsize.hasChildNodes()){ iconsize.removeChild(iconsize.lastChild); }
							iconsize.appendChild(this.xmldoc.createTextNode(this.item.iconsize));
						}
						if(this.item.logical != undefined){
							var logical = this.xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
							if(this.item.logical != "" && !logical){
								logical = this.xmldoc.createElement("LOGICAL_PAGE");
								var extras_msg = this.xmldoc.getElementsByTagName("EXTENDED_MESSAGE")[0];
								if(!extras_msg){
									extras_msg = this.xmldoc.createElement("EXTENDED_MESSAGE");
									this.xmldoc.documentElement.appendChild(extras_msg);
								}
								extras_msg.appendChild(logical);
							}else if(this.item.logical == "" && logical){
								logical.parentNode.removeChild(logical);
								logical = undefined;
							}
							if(logical){
								while(logical.hasChildNodes()){ logical.removeChild(logical.lastChild); }
								logical.appendChild(this.xmldoc.createTextNode(this.item.logical));
							}
						}
						if(this.item.physical != undefined){
							var physical = this.xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
							if(this.item.physical != "" && !physical){
								physical = this.xmldoc.createElement("PHYSICAL_PAGE");
								var extras_msg = this.xmldoc.getElementsByTagName("EXTENDED_MESSAGE")[0];
								if(!extras_msg){
									extras_msg = this.xmldoc.createElement("EXTENDED_MESSAGE");
									this.xmldoc.documentElement.appendChild(extras_msg);
								}
								extras_msg.appendChild(physical);
							}else if(this.item.physical == "" && physical){
								physical.parentNode.removeChild(physical);
								physical = undefined;
							}
							if(physical){
								while(physical.hasChildNodes()){ physical.removeChild(physical.lastChild); }
								physical.appendChild(this.xmldoc.createTextNode(this.item.physical));
							}
						}
						this.property = this._xmlSerializer();
					}
				}
				if(this.DataSource.isContainer(this.resource)){
					dbitem.fid = this.id;
					if(this.item.title != undefined) dbitem.fid_title = this.item.title;
					if(this.item.note != undefined)  dbitem.fid_property = this.property;
					if(this.item.style != undefined) dbitem.fid_style = this.item.style;
					if(this.item.note != undefined || this.item.iconsize != undefined) dbitem.fid_property = this.property;
					changed = this.Database.updateFolder(dbitem,this.dbtype);
				}else{
					dbitem.oid = this.id;
					if(this.item.title != undefined)   dbitem.oid_title = this.item.title;
					if(this.item.note != undefined) dbitem.oid_property = this.property;
					changed = this.Database.updateObject(dbitem,this.dbtype);
				}
			}
		}
		if(changed){
			for(props in this.item){
				if(props == "tag") continue;
				if(props == "note") continue;
				if(props == "index") continue;
				if(props == "addon_id") continue;
				if(props == "iconsize") continue;
				this.DataSource.setProperty(this.resource, props, this.item[props]);
			}
			if(this.DataSource.isContainer(this.resource)) this.DataSource.setProperty(this.resource,"cssrule",'css_'+this.dbtype+'_'+this.id);
			try{
				var update_id = this.DataSource.getProperty(this.resource,"id");
				var listRes2 = this.DataSource.flattenResources(this.Common.RDF.GetResource(this.DataSource.ABOUT_ROOT),2,true);
				for(var j=0;j<listRes2.length;j++){
					var id = this.DataSource.getProperty(listRes2[j],"id");
					if(id != update_id) continue;
					this.DataSource.setProperty(listRes2[j],"title",this.item.title);
				}
			}catch(e){}
			this.DataSource.flush();
		}
		if(window.arguments[1]) window.arguments[1].accept = changed;

		if(!document.getElementById("mcPropShortcutGroup").hasAttribute("hidden") && this.id && this.dbtype && this._opener){
			var bitsShortcutService = this._opener.top.bitsShortcutService;
			if(bitsShortcutService){
				var sc = bitsShortcutService.getShortcut(this.id,this.dbtype);
				if(!sc) sc = {disabled:true};
				sc.disabled = !this.SC_DISABLED.checked;
				sc.shift    = this.SC_SHIFT.checked;
				sc.alt      = this.SC_ALT.checked;
				sc.accel    = this.SC_ACCEL.checked;
				sc.title    = this.item.title;
				sc.style    = this.item.style;

				var key = this.SC_KEY.value;
				key = key.replace(/\t/mg,"        ");
				key = this.Common.exceptCode(key);
				key = key.replace(/[\r\n]/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
				if(key){
					sc.key = key;
				}else{
					sc.disabled = true;
				}
				bitsShortcutService.setShortcut(this.id,this.dbtype,sc);
			}
		}
		return true;
	},

	cancel : function(){
		if(window.arguments[1]) window.arguments[1].accept = false;
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
		window.focus();
		var self = this;
		setTimeout(function(){self.TITLE.focus();},100);
	},

	inputTitle : function(aEvent){
		var title = this.TITLE.value;
		title = title.replace(/\t/g,"        ");
		title = this.Common.exceptCode(title);
		title = title.replace(/[\r\n]/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		if(title == ""){
			this.TITLE_HBOX.style.borderColor = 'red';
		}else{
			this.TITLE_HBOX.style.borderColor = 'transparent';
		}
	},

	checkedTitle : function(aEvent){
		var title = this.TITLE.value;
		title = title.replace(/\t/g,"        ");
		title = this.Common.exceptCode(title);
		title = title.replace(/[\r\n]/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		if(title == ""){
			aEvent.preventDefault();
			aEvent.stopPropagation();
			this.TABBOX.selectedTab = this.GENERAL_TAB;
			if(Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS != "Darwin"){
				this.Common.alert(this.STRING.getString("ERROR_NOT_ENTER_TITLE"));
//				this.undoTitle();
				this.TITLE.value = this.TITLE.defaultValue;
				var self = this;
				setTimeout(function(){ self.TITLE.focus(); },0);
			}
			var title = this.TITLE.value;
			title = title.replace(/\t/g,"        ");
			title = this.Common.exceptCode(title);
			title = title.replace(/[\r\n]/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
			if(title == ""){
				this.TITLE_HBOX.style.borderColor = 'red';
			}else{
				this.TITLE_HBOX.style.borderColor = 'transparent';
			}
			return false;
		}
		if(this.DataSource.isContainer(this.resource)){
			var parRes = this.DataSource.findParentResource(this.resource);
			if(!parRes) return;
			var i;
			var listTitle = "";
			var listRes = this.DataSource.flattenResources(parRes,1,false);
			for(i=0;i<listRes.length;i++){
				if(listRes[i].Value == this.resource.Value) continue;
				listTitle = this.DataSource.getProperty(listRes[i],"title");
				listTitle = listTitle.replace(/^\s*/img,"").replace(/\s*$/img,"");
				if(listTitle == title) break;
			}
			if(listTitle != title) return true;
			if(Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS != "Darwin"){
				this.Common.alert(this.STRING.getString("ERROR_INVALID_TITLE"));
				this.TITLE.value = this.TITLE.defaultValue;
				var self = this;
				setTimeout(function(){ self.TITLE.focus(); },0);
			}else{
				this.TITLE.value = "";
			}
			aEvent.preventDefault();
			aEvent.stopPropagation();
			return false;
		}else{
			return true;
		}
		this.undoTitle();
		return false;
	},

	updateNoteTab : function(aNote){
		var elem = this.NOTE_TAB;
		if(aNote != undefined)
			elem.setAttribute("image", "chrome://markingcollection/skin/edit_comment.png");
		else
			elem.removeAttribute("image");
	},

	checkedTag : function(){
		var tag = this.TAG.value.replace(/[\r\n]/mg, " ").replace(/^\s*/img,"").replace(/\s*$/img,"");
		if(tag.match(/^[^a-z]/i)) this.Common.alert(this.STRING.getString("WARNING_NOT_BEGIN_ENGLISH_TAG"));
	},

	commandColor : function(event){
		document.getElementById("mcPropSample").style.backgroundColor = event.target.style.backgroundColor;
		document.getElementById("mcPropSample").style.color = event.target.style.color;
	},

	commandBorderStyle : function(event){
		document.getElementById("mcPropSample").style.borderStyle = event.target.style.borderStyle;
	},

	commandBorderColor : function(event){
		document.getElementById("mcPropSample").style.borderColor = event.target.style.backgroundColor;
	},

	commandBorderWidth : function(event){
		document.getElementById("mcPropSample").style.borderWidth = event.target.style.borderWidth;
	},

	commandIconsize : function(event){
		this.ICON_SIZE_I.setAttribute("iconsize",this.ICON_SIZE.value);
	},

	openDialog : function(){
		var result = {
			accept : false,
			style  : document.getElementById("mcPropSample").style.cssText,
		};
		if(!this.item.index) this.item.index = -1;

		window.openDialog('chrome://markingcollection/content/markerCustom.xul', '', 'modal,centerscreen,chrome',this.item.index,result);
		if(result.accept) document.getElementById("mcPropSample").setAttribute("style",result.style);
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

	vacuumDB : function(){
		this.Database.vacuum(this.dbtype);
		setTimeout(
			function(){
				document.getElementById("mcPropDatabaseGroup").setAttribute("hidden",true);
				if(parseInt(mcPropService.item.editmode) & 0x1000){
					var aDBFile = mcPropService.Database.getDatabaseFile(mcPropService.dbtype);
					if(aDBFile){
						mcPropService.DB_PATH.value = aDBFile.path;
						mcPropService.DB_DATE.value = (new Date(aDBFile.lastModifiedTime)).toLocaleString();
						mcPropService.DB_SIZE.value = mcPropService.formatFileSize(aDBFile.fileSize);
						document.getElementById("mcPropDatabaseGroup").removeAttribute("hidden");
					}
				}
		},500);
	},

	commandShortcut : function(aEvent){
		if(!this.SC_DISABLED.checked){
			this.SC_SHIFT.setAttribute("disabled","true");
			this.SC_ALT.setAttribute("disabled","true");
			this.SC_ACCEL.setAttribute("disabled","true");
			this.SC_KEY.setAttribute("disabled","true");
		}else{
			this.SC_SHIFT.removeAttribute("disabled");
			this.SC_ALT.removeAttribute("disabled");
			this.SC_ACCEL.removeAttribute("disabled");
			this.SC_KEY.removeAttribute("disabled");
			this.SC_KEY.focus();
		}
			this.SC_SHIFT.setAttribute("disabled","true");
			this.SC_ALT.setAttribute("disabled","true");
			this.SC_ACCEL.setAttribute("disabled","true");

	},
	inputShortcut : function(aEvent){
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var sc = {
			key     : ""+String.fromCharCode(aEvent.charCode).toUpperCase(),
			shift   : aEvent.shiftKey,
			alt     : aEvent.altKey,
			accel   : (osString == "Darwin" ? aEvent.metaKey: aEvent.ctrlKey)
		};
		this.SC_KEY.value = '';
		this.SC_MOD.value = '';
		if(!sc.key || !(sc.shift||sc.alt||sc.accel)) return;
		this.SC_SHIFT.checked = sc.shift;
		this.SC_ALT.checked = sc.alt;
		this.SC_ACCEL.checked = sc.accel;

		var acceltext = [];
		if(sc.accel){
			if(osString == "Darwin"){
				acceltext.push('Command');
			}else{
				acceltext.push('Ctrl');
			}
		}
		if(sc.shift) acceltext.push('Shift');
		if(sc.alt){
			if(osString == "Darwin"){
				acceltext.push('Option');
			}else{
				acceltext.push('Alt');
			}
		}
		this.SC_MOD.value = acceltext.join("+")+" +";

		this.SC_KEY.value = sc.key;
		this.SC_KEY.focus();
	},
};

function _dump(aString){
	window.opener.top.bitsMarkingCollection._dump(aString);
}
