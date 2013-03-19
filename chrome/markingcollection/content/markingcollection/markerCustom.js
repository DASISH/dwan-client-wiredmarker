var markerCustomizer = {

	get PREVIEW() { return document.getElementById("markerCustomPreview"); },

	index : 8,
	presetIndex : 0,

	init : function(){
		document.documentElement.buttons = "accept,cancel";
		if(!window.arguments || !((window.arguments[0] >= 1 && window.arguments[0] <= markerCustomizer.index) || window.arguments[0] == -1)){
			this.Common.alert(window.arguments[0]);
			window.close(); return;
		}
		this.index = window.arguments[0];
		var cssText = "";
		if(window.arguments[1] && window.arguments[1].style && window.arguments[1].style != ""){
			cssText = window.arguments[1].style;
		}else{
			cssText = nsPreferences.copyUnicharPref("wiredmarker.marker.style." + this.index, bitsMarker.PRESET_STYLES[this.index]);
		}
		this.parseFromString(cssText);
	},

	done : function(){
		if(window.arguments[1]){
			window.arguments[1].accept = true;
			window.arguments[1].style = this.PREVIEW.style.cssText;
		}
	},

	update : function(){
		this.PREVIEW.setAttribute("style", this.parseToString());
	},

	broadcast : function(){
		var ret = [
			document.getElementById("markerBackgroundEnabled").checked,
			document.getElementById("markerTextEnabled").checked,
			document.getElementById("markerBorderEnabled").checked
		];
		document.getElementById("markerBroadcast0").setAttribute("disabled", !ret[0]);
		document.getElementById("markerBroadcast1").setAttribute("disabled", !ret[1]);
		document.getElementById("markerBroadcast2").setAttribute("disabled", !ret[2]);
		return ret;
	},

	parseFromString : function(cssText){
		this.PREVIEW.setAttribute("style", cssText);
		document.getElementById("markerTextBold").checked          = this.PREVIEW.style.fontWeight == "bold";
		document.getElementById("markerTextItalic").checked        = this.PREVIEW.style.fontStyle == "italic";
		document.getElementById("markerTextStrike").checked        = this.PREVIEW.style.textDecoration == "line-through";
		document.getElementById("markerBackgroundEnabled").checked = this.PREVIEW.style.backgroundColor;
		document.getElementById("markerTextEnabled").checked       = this.PREVIEW.style.color;
		document.getElementById("markerBorderEnabled").checked     = this.PREVIEW.style.borderBottom;
		var bcList = this.broadcast();
		if(bcList[0]) document.getElementById("markerBackgroundColor").color = this.PREVIEW.style.backgroundColor;
		if(bcList[1]) document.getElementById("markerTextColor").color       = this.PREVIEW.style.color;
		if(bcList[2]){
			document.getElementById("markerBorderColor").color = this.PREVIEW.style.borderBottomColor;
			document.getElementById("markerBorderType").selectedIndex = this.PREVIEW.style.borderTop ? 0 : 1;
			var elem = document.getElementsByAttribute("value", this.PREVIEW.style.borderBottomStyle);
			document.getElementById("markerBorderStyle").selectedIndex = elem.length > 0 ? elem[0].getAttribute("index") : 0;
			elem = document.getElementsByAttribute("value", this.PREVIEW.style.borderBottomWidth);
			document.getElementById("markerBorderWidth").selectedIndex = elem.length > 0 ? elem[0].getAttribute("index") : 0;
		}
	},

	parseToString : function(){
		var bcList = this.broadcast();
		var cssRules = [];
		if(document.getElementById("markerTextEnabled").checked){
			if(document.getElementById("markerTextBold").checked)   cssRules.push("font-weight:bold");
			if(document.getElementById("markerTextItalic").checked) cssRules.push("font-style:italic");
			if(document.getElementById("markerTextStrike").checked) cssRules.push("text-decoration:line-through");
		}
		if(bcList[0]){
			var backgroundColor = document.getElementById("markerBackgroundColor").color || "none";
			if(backgroundColor != "none") cssRules.push("background-color:" + backgroundColor);
		}
		if(bcList[1]){
			var textColor = document.getElementById("markerTextColor").color || "none";
			if(textColor != "none") cssRules.push("color:" + textColor);
		}
		if(bcList[2]){
			var borderType  = document.getElementById("markerBorderType").selectedItem.value == "box" ? "border" : "border-bottom";
			var borderStyle = document.getElementById("markerBorderStyle").selectedItem.value;
			var borderWidth = document.getElementById("markerBorderWidth").selectedItem.value;
			var borderColor = document.getElementById("markerBorderColor").color || "none";
			if(borderColor != "none") cssRules.push(borderType + ":" + [borderWidth,borderStyle,borderColor].join(" "));
		}
		return cssRules.join(";");
	},

	rotatePreset : function(){
		if(++this.presetIndex > 8) this.presetIndex = 0;
		var presetButton = document.getElementById("markerCustomizeDialog").getButton("extra2");
		presetButton.label = presetButton.label.replace(/\s\d\/8$/, " " + this.presetIndex + "/8");
		this.parseFromString(bitsMarker.PRESET_STYLES[this.presetIndex]);
	},

};


