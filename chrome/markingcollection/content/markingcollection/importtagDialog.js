var mcImportTagService = {

	get STRING()     { return document.getElementById("mcImportTagString"); },
	get HLIST()      { return document.getElementById("mcImportTagHtmlListbox"); },
	get NLIST()      { return document.getElementById("mcImportTagNohtmlListbox"); },
	get IRADIO()     { return document.getElementById("mcImportTagRadiogroup"); },
	get HRADIO()     { return document.getElementById("mcImportTagRadioH"); },
	get NRADIO()     { return document.getElementById("mcImportTagRadioN"); },
	get IMG_RADIO()  { return document.getElementById("mcImportTagImgOptionsRadiogroup"); },
	get IMG_RADIO_I(){ return document.getElementById("mcImportTagImgOptionsRadioImage"); },
	get IMG_RADIO_S(){ return document.getElementById("mcImportTagImgOptionsRadioString"); },

	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	id       : null,
	item     : null,
	resource : null,
	property : "",
	_xmldoc : null,






	init : function(){
		var tags;
		if(window.arguments[0]) tags = window.arguments[0];
		if(!tags) return;

		var html = [];
		var nohtml = [];
		for(var tag in tags.html){
			html.push(tag);
		}
		html.sort();
		for(var tag in tags.nohtml){
			nohtml.push(tag);
		}
		nohtml.sort();
		var i;
		for(i=0;i<html.length;i++){
			var label;
			if(html[i].toUpperCase() == "IMG"){
				label = "<"+html[i]+"/>";
			}else{
				label = "<"+html[i]+">...</"+html[i]+">";
			}
			this.HLIST.appendItem( label, html[i] );
		}
		if(html.length>0 && this.HLIST.selectedCount<=0){
			this.HLIST.selectedIndex = 0;
			this.HLIST.focus();
		}
		if(html.length == 0) this.HRADIO.setAttribute("disabled","true");

		for(i=0;i<nohtml.length;i++){
			var label = "<"+nohtml[i]+">...</"+nohtml[i]+">";
			this.NLIST.appendItem( label, nohtml[i] );
		}
		if(nohtml.length > 0 && this.NLIST.selectedCount<=0) this.NLIST.selectedIndex = 0;
		if(nohtml.length == 0){
			this.NRADIO.setAttribute("disabled","true");
			this.NLIST.setAttribute("rows","1");
		}

//this.NRADIO.removeAttribute("selected");
//this.HRADIO.setAttribute("selected","true");


	},

	command : function(aEvent){
		if(this.HRADIO.selected){
			this.HLIST.removeAttribute("disabled");
			this.HLIST.focus();
			if(this.HLIST.selectedCount<=0) this.HLIST.selectedIndex = 0;
			this.NLIST.setAttribute("disabled","true");
		}else{
			this.NLIST.removeAttribute("disabled");
			this.NLIST.focus();
			if(this.NLIST.selectedCount<=0) this.NLIST.selectedIndex = 0;
			this.HLIST.setAttribute("disabled","true");
		}
	},

	select : function(aEvent){
		try{
			if(this.HRADIO.selected) return;
			var list = this.HLIST.selectedItems;
			var i;
			for(i=0;i<list.length;i++){
				if(list[i].value != "img") continue;
				break;
			}
			if(i<list.length){
				this.IMG_RADIO.removeAttribute("disabled");
				this.IMG_RADIO.disabled=false;
			}else{
				this.IMG_RADIO.setAttribute("disabled","true");
				this.IMG_RADIO.disabled=true;
			}
		}catch(e){
			_dump(e);
		}
	},

	accept : function(){
		try{
			if(window.arguments[1]){
				window.arguments[1].accept = true;
				window.arguments[1].type = (this.HRADIO.selected?"html":"nohtml");
				var list;
				if(this.HRADIO.selected){
					list = this.HLIST.selectedItems;
				}else{
					list = this.NLIST.selectedItems;
				}
				if(list){
					var tags = [];
					var i;
					for(i=0;i<list.length;i++){
						tags.push(list[i].value);
						if(list[i].value != "img") continue;
						if(this.IMG_RADIO_I){
							window.arguments[1].img_opt = (this.IMG_RADIO_I.selected?"image":"string");
						}else{
							window.arguments[1].img_opt = "image";
						}
					}
					window.arguments[1].tags = tags;
				}
			}
		}catch(e){
			this._dump("mcImportTagService.accept():"+e);
		}
	},

	cancel : function(){
		if(window.arguments[1]) window.arguments[1].accept = false;
	},

	_dump : function(aString){
		window.opener.top.bitsMarkingCollection._dump(aString);
	},

};
