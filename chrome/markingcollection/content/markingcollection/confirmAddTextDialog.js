var wmConfirmAddTextDialog = {

/////////////////////////////////////////////////////////////////////
	get STRING()     { return document.getElementById("wmConfirmAddTextDialogString"); },
	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	get URL()      { return document.getElementById("wmUrl"); },
	get TITLE()    { return document.getElementById("wmTitle"); },
	get NOTE()     { return document.getElementById("wmNote"); },
	get LPAGE()    { return document.getElementById("wmLogicalPage"); },
	get PPAGE()    { return document.getElementById("wmPhysicalPage"); },
	get PTITLE()   { return document.getElementById("wmPageTitle"); },
	get TITLE_HBOX(){ return document.getElementById("wmTitleHBox"); },

	info    : null,
	_xmldoc : null,

	get xmldoc(){ return this._xmldoc; },

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(wmConfirmAddTextDialog._init) return;

		try {
			this.info = window.arguments[0];
		}catch(ex){
		}

		this.URL.value = this.info.con_url;
		this.TITLE.value  = this.info.title;
		this.PTITLE.value  = this.info.doc_title;

		this.info.note = "";
		if(this.info.property){
			this._createXMLDoc(this.info.property);
			if(this.xmldoc){
				var note_elem = this.xmldoc.getElementsByTagName("NOTE")[0];
				if(note_elem) this.info.note = note_elem.textContent.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");

				var lpage_elem = this.xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
				if(lpage_elem) this.info.logical_page = lpage_elem.textContent;

				var ppage_elem = this.xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
				if(ppage_elem) this.info.physical_page = ppage_elem.textContent;
			}
		}
		if(this.info.note != undefined) this.NOTE.value = this.info.note;
		if(this.info.logical_page != undefined)  this.LPAGE.value = this.info.logical_page;
		if(this.info.physical_page != undefined) this.PPAGE.value = this.info.physical_page;

		try{this.URL.editor.transactionManager.clear();}catch(ex2){}
		try{this.TITLE.editor.transactionManager.clear();}catch(ex2){}
		try{this.NOTE.editor.transactionManager.clear();}catch(ex2){}
		try{this.LPAGE.editor.transactionManager.clear();}catch(ex2){}
		try{this.PPAGE.editor.transactionManager.clear();}catch(ex2){}
		try{this.PTITLE.editor.transactionManager.clear();}catch(ex2){}

		try{
			this._init = true;
		}catch(ex){
			this.Common.alert("wmConfirmAddTextDialog.init():"+ex);
		}
	},

/////////////////////////////////////////////////////////////////////
	done : function(event){
		if(this._init){
			this._init = false;
		}
	},

/////////////////////////////////////////////////////////////////////
	_createXMLDoc : function(aContent){
		var parser = new DOMParser();
		this._xmldoc = parser.parseFromString(aContent, "text/xml");
		parser = undefined;
	},

/////////////////////////////////////////////////////////////////////
	_xmlSerializer : function(){
		var s = new XMLSerializer();
		var aContent = s.serializeToString(this.xmldoc);
		s = undefined;
		return aContent;
	},

/////////////////////////////////////////////////////////////////////
	undoTitle : function(){
		try{
			while(this.TITLE.editor.transactionManager.numberOfUndoItems>0){
				this.TITLE.editor.undo(1);
				var title = this.TITLE.value;
				title = title.replace(/\t/mg,"        ");
				title = this.Common.exceptCode(title);
				title = title.replace(/[\r\n]/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
				if(title != "") break;
			}
		}catch(ex2){_dump(ex2);}
		window.focus();
		var self = this;
		setTimeout(function(){self.TITLE.focus();},100);
	},

/////////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////
	changeTitle : function(aEvent){
		var title = this.TITLE.value;
		title = title.replace(/\t/g,"        ");
		title = this.Common.exceptCode(title);
		title = title.replace(/[\r\n]/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		if(title == ""){
			aEvent.preventDefault();
			aEvent.stopPropagation();
			if(Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS != "Darwin"){
				this.Common.alert(this.STRING.getString("ERROR_NOT_ENTER_TITLE"));
				this.undoTitle();
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
		}
	},

/////////////////////////////////////////////////////////////////////
	accept : function(aEvent){
		window.arguments[0].accept = 1;
		var newVals = {
			title         : this.TITLE.value,
			note          : this.Common.escapeComment(this.NOTE.value),
			logical_page  : this.LPAGE.value,
			physical_page : this.PPAGE.value,
			doc_title     : this.PTITLE.value
		};
		newVals["title"] = newVals["title"].replace(/\t/g,"        ");
		newVals["title"] = this.Common.exceptCode(newVals["title"]);
		newVals["title"] = newVals["title"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		if(newVals["title"] == "") return false;

		newVals["note"] = newVals["note"].replace(/\t/mg,"        ");
		newVals["note"] = newVals["note"].replace(/\x0D\x0A|\x0D|\x0A/g," __BR__ ");
		newVals["note"] = this.Common.exceptCode(newVals["note"]);
		newVals["note"] = newVals["note"].replace(/[\r\n]/mg, " ").replace(/ __BR__ /mg,"\n");

		newVals["logical_page"] = newVals["logical_page"].replace(/\t/mg,"        ");
		newVals["logical_page"] = this.Common.exceptCode(newVals["logical_page"]);
		newVals["logical_page"] = newVals["logical_page"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");

		newVals["physical_page"] = newVals["physical_page"].replace(/\t/mg,"        ");
		newVals["physical_page"] = this.Common.exceptCode(newVals["physical_page"]);
		newVals["physical_page"] = newVals["physical_page"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");

		newVals["doc_title"] = newVals["doc_title"].replace(/\t/mg,"        ");
		newVals["doc_title"] = this.Common.exceptCode(newVals["doc_title"]);
		newVals["doc_title"] = newVals["doc_title"].replace(/\x0D\x0A|\x0D|\x0A/g, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");

		var changed = false;
		var props;
		for(props in newVals){
			if(this.info[props] == newVals[props]) continue;
			this.info[props] = newVals[props];
			changed = true;
		}

		if(changed){
			if(this.info.title) this.info.title = this.info.title.replace(/[\r\n]/mg, " ");
			if(this.info.doc_title) this.info.doc_title = this.info.doc_title.replace(/[\r\n]/mg, " ");
			if(this.info.note || this.info.logical_page || this.info.physical_page){
				if(this.info.property == "") this.info.property = "<PROPERTY/>";
				this._createXMLDoc(this.info.property);
				if(this.xmldoc){
					if(this.info.note != undefined){
						var note = this.xmldoc.getElementsByTagName("NOTE")[0];
						if(this.info.note != "" && !note){
							note = this.xmldoc.createElement("NOTE");
							this.xmldoc.documentElement.appendChild(note);
						}else if(this.info.note == "" && note){
							note.parentNode.removeChild(note);
							note = undefined;
						}
						if(note){
							while(note.hasChildNodes()){ note.removeChild(note.lastChild); }
							note.appendChild(this.xmldoc.createTextNode(this.info.note));
						}
					}
					if(this.info.logical_page != undefined){
						var extras_msg = this.xmldoc.getElementsByTagName("EXTENDED_MESSAGE")[0];
						if(!extras_msg){
							extras_msg = this.xmldoc.createElement("EXTENDED_MESSAGE");
							this.xmldoc.documentElement.appendChild(extras_msg);
						}
						var lpage_elem = this.xmldoc.getElementsByTagName("LOGICAL_PAGE")[0];
						if(this.info.logical_page != "" && !lpage_elem){
							lpage_elem = this.xmldoc.createElement("LOGICAL_PAGE");
							extras_msg.appendChild(lpage_elem);
						}else if(this.info.logical_page == "" && lpage_elem){
							lpage_elem.parentNode.removeChild(lpage_elem);
							lpage_elem = undefined;
						}
						if(lpage_elem){
							while(lpage_elem.hasChildNodes()){ lpage_elem.removeChild(lpage_elem.lastChild); }
							lpage_elem.appendChild(this.xmldoc.createTextNode(this.info.logical_page));
						}
					}

					if(this.info.physical_page != undefined){
						var extras_msg = this.xmldoc.getElementsByTagName("EXTENDED_MESSAGE")[0];
						if(!extras_msg){
							extras_msg = this.xmldoc.createElement("EXTENDED_MESSAGE");
							this.xmldoc.documentElement.appendChild(extras_msg);
						}
						var ppage_elem = this.xmldoc.getElementsByTagName("PHYSICAL_PAGE")[0];
						if(this.info.physical_page != "" && !ppage_elem){
							ppage_elem = this.xmldoc.createElement("PHYSICAL_PAGE");
							extras_msg.appendChild(ppage_elem);
						}else if(this.info.physical_page == "" && ppage_elem){
							ppage_elem.parentNode.removeChild(ppage_elem);
							ppage_elem = undefined;
						}
						if(ppage_elem){
							while(ppage_elem.hasChildNodes()){ ppage_elem.removeChild(ppage_elem.lastChild); }
							ppage_elem.appendChild(this.xmldoc.createTextNode(this.info.physical_page));
						}
					}

					this.info.property = this._xmlSerializer();
				}
			}
		}
		return true;
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(aEvent){
		window.arguments[0].accept = 0;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};
