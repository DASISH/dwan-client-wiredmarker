var bitsObjectTooltip = {
	tooltipTimer : null,
	_contextmenushow : false,

	get gBrowser(){ return gBrowser; },

	get TOOLTIP()    { return window.top.document.getElementById("MarkingCollectionObjectTooltip"); },
	get TITLE()      { return window.top.document.getElementById("MarkingCollectionObjectTooltipTitleLabel"); },
	get NOTE()       { return window.top.document.getElementById("MarkingCollectionObjectTooltipNoteDescription"); },
	get CONTEXTMENU(){ return window.top.document.getElementById("contentAreaContextMenu"); },

	get Database(){ return window.top.bitsObjectMng.Database; },

	init : function(){
		this.gBrowser.addEventListener("mousemove",bitsObjectTooltip.mousemove,false);
		this.CONTEXTMENU.addEventListener("popupshowing",bitsObjectTooltip.contextmenushown,false);
		this.CONTEXTMENU.addEventListener("popuphiding",bitsObjectTooltip.contextmenuhidden,false);
	},

	done : function(){
		this.gBrowser.removeEventListener("mousemove",bitsObjectTooltip.mousemove,false);
		this.CONTEXTMENU.removeEventListener("popupshowing",bitsObjectTooltip.contextmenushown,false);
		this.CONTEXTMENU.removeEventListener("popuphiding",bitsObjectTooltip.contextmenuhidden,false);
	},

	contextmenushown : function(event){
		bitsObjectTooltip._contextmenushow = true;
		bitsObjectTooltip.hideTooltip();
	},

	contextmenuhidden : function(event){
		bitsObjectTooltip._contextmenushow = false;
	},

	mousemove : function(event){
		try{ if(!bitsMarker) return; }catch(ex){ return; }
		var match_exp = new RegExp("^"+bitsMarker.id_key+"\\D+(\\d+)$","m");
		var click_oid = "";
		var parent = event.rangeParent;
		while(parent){
			if(parent.id && parent.id.match(match_exp)){
				var dbtype = parent.getAttribute("dbtype");
				match_exp = new RegExp("^"+bitsMarker.id_key+dbtype+"(\\d+)$","m");
				if(match_exp.test(parent.id)){
					click_oid = RegExp.$1;
					break;
				}
			}
			parent = parent.parentNode;
		}
		var disptooltip = nsPreferences.getBoolPref("wiredmarker.marker.mouseover.disptooltip", true);
		if(!disptooltip || !parent || click_oid == "" || !event.target.id || (event.target.id && event.target.id != parent.id)){
			bitsObjectTooltip.hideTooltip();
			return;
		}
		bitsObjectTooltip.showTooltip({
			element : parent,
			oid     : click_oid,
			dbtype  : parent.getAttribute("dbtype"),
			pfid    : parent.getAttribute("pfid"),
			screenX : event.screenX,
			screenY : event.screenY,
		});
	},

	hideTooltip : function(aParam){
//		this.TITLE.value = '';
		while(this.TITLE.hasChildNodes()){
			this.TITLE.removeChild(this.TITLE.lastChild);
		}
		while(this.NOTE.hasChildNodes()){
			this.NOTE.removeChild(this.NOTE.lastChild);
		}
		if(this.tooltipTimer) clearTimeout(this.tooltipTimer);
		this.tooltipTimer = null;
		this.TOOLTIP.hidePopup();
	},

	showTooltip : function(aParam){
		if(this._contextmenushow) return;
		this.hideTooltip();
		this.tooltipTimer = setTimeout(function(){
			bitsObjectTooltip._showTooltip(aParam);
		},500)
	},

	_showTooltip : function(aParam){
		var objects = this.Database.getObject({oid : aParam.oid},aParam.dbtype);
		if(!objects || objects.length == 0){
			this.hideTooltip();
			return;
		}
		var object = objects[0];
//		this.TITLE.value = object.oid_title;
		this.TITLE.appendChild(this.TITLE.ownerDocument.createTextNode(object.oid_title));

		var oid_note = "";
		var domParser = new DOMParser();
		if(object.oid_property && object.oid_property != ""){
			var xmldoc = domParser.parseFromString(object.oid_property, "text/xml");
			if(xmldoc && xmldoc.documentElement.nodeName == "parsererror") xmldoc = undefined;
			if(xmldoc){
				var xmlnode = xmldoc.getElementsByTagName("NOTE")[0];
				if(xmlnode) oid_note = xmlnode.textContent;
			}
			if(oid_note == undefined) oid_note = "";
		}
		domParser = undefined;
		if(oid_note != ""){
			oid_note = oid_note.replace(/^\s*/g,"").replace(/\s*$/g,"");
			this.NOTE.appendChild(this.NOTE.ownerDocument.createTextNode(oid_note));
		}
		this.showPopup(aParam.screenX,aParam.screenY,aParam);
	},

	showPopup: function(x, y, aParam){
		if(this.tooltipTimer) clearTimeout(this.tooltipTimer);
		this.tooltipTimer = null;
		if(this.TOOLTIP.openPopupAtScreen){
			this.TOOLTIP.openPopupAtScreen(x, y, false);
		}else{
			this.TOOLTIP.showPopup(aParam.element, x, y, "tooltip");
		}
	},

	_dump : function(aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
