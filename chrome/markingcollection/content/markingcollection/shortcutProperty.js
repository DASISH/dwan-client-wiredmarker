var mcSCPropService = {
	_opener : null,

	get Common()     { return this._opener.top.bitsObjectMng.Common;     },

	get STRING()     { return document.getElementById("mcSCPropString"); },
	get DIALOG()     { return document.getElementById("mcSCPropDialog"); },
	get TITLE()      { return document.getElementById("mcSCPropTitle"); },
	get SHIFT()      { return document.getElementById("mcSCPropShift"); },
	get ALT()        { return document.getElementById("mcSCPropAlt"); },
	get ACCEL()      { return document.getElementById("mcSCPropAccel"); },
	get KEY()        { return document.getElementById("mcSCPropKey"); },
	get MOD()        { return document.getElementById("mcSCPropModifiers"); },

	property : null,

	init : function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		this._opener = wm.getMostRecentWindow("navigator:browser");
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		if(osString == "Darwin"){
			this.ALT.setAttribute('label','Option');
			this.ACCEL.setAttribute('label','Command');
		}
		try {
			this.property = window.arguments[0];
		}catch(e){}
		if(!this.property) return;
		this.TITLE.value = this.property.title;
		try{this.TITLE.editor.transactionManager.clear();}catch(ex2){}
		if(!this.property.removed) this.TITLE.setAttribute("readonly","true");
		this.KEY.value = this.property.key;
		try{this.KEY.editor.transactionManager.clear();}catch(ex2){}
		this.SHIFT.checked = this.property.shift;
		this.ALT.checked = this.property.alt;
		this.ACCEL.checked = this.property.accel;
		var acceltext = [];
		if(this.ACCEL.checked){
			if(osString == "Darwin"){
				acceltext.push('Command');
			}else{
				acceltext.push('Ctrl');
			}
		}
		if(this.SHIFT.checked) acceltext.push('Shift');
		if(this.ALT.checked){
			if(osString == "Darwin"){
				acceltext.push('Option');
			}else{
				acceltext.push('Alt');
			}
		}
		this.MOD.value = acceltext.join("+")+" +";
		document.title = this.property.title;
		return;
	},

	accept : function(){
		var changed = false;
		var newVals = {
			title : this.TITLE.value,
			shift : this.SHIFT.checked,
			alt   : this.ALT.checked,
			accel : this.ACCEL.checked,
			key   : this.KEY.value
		};
		newVals.title = newVals.title.replace(/\t/mg,"        ");
		newVals.title = this.Common.exceptCode(newVals.title);
		newVals.title = newVals.title.replace(/[\r\n]/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		newVals.key = newVals.key.replace(/\t/mg,"        ");
		newVals.key = this.Common.exceptCode(newVals.key);
		newVals.key = newVals.key.replace(/[\r\n]/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		var key;
		for(key in newVals){
			if(window.arguments[0][key] == newVals[key]) continue;
			window.arguments[0][key] = newVals[key];
			changed = true;
		}
		if(window.arguments[0]) window.arguments[0].accept = changed;
		return true;
	},

	cancel : function(){
		if(window.arguments[0]) window.arguments[0].accept = false;
	},

	inputTitle : function(aEvent){
		var title = this.TITLE.value;
		title = title.replace(/\t/mg,"        ");
		title = this.Common.exceptCode(title);
		title = title.replace(/[\r\n]/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		var key = this.KEY.value;
		key = key.replace(/\t/mg,"        ");
		key = this.Common.exceptCode(key);
		key = key.replace(/[\r\n]/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		if(title.length == 0 || key.length == 0){
			this.DIALOG.setAttribute("buttondisabledaccept","true");
		}else if(
			title              != this.property.title ||
			key                != this.property.key ||
			this.SHIFT.checked != this.property.shift ||
			this.ALT.checked   != this.property.alt ||
			this.ACCEL.checked != this.property.accel
		){
			this.DIALOG.removeAttribute("buttondisabledaccept");
		}else{
			this.DIALOG.setAttribute("buttondisabledaccept","true");
		}
	},

	inputKey : function(aEvent){
		var title = this.TITLE.value;
		title = title.replace(/\t/mg,"        ");
		title = this.Common.exceptCode(title);
		title = title.replace(/[\r\n]/mg, " ").replace(/^\s*/g,"").replace(/\s*$/g,"");
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var sc = {
			key     : ""+String.fromCharCode(aEvent.charCode).toUpperCase(),
			shift   : aEvent.shiftKey,
			alt     : aEvent.altKey,
			accel   : (osString == "Darwin" ? aEvent.metaKey: aEvent.ctrlKey)
		};
		if(title.length == 0 || sc.key.length == 0){
			this.DIALOG.setAttribute("buttondisabledaccept","true");
		}else if(
			title              != this.property.title ||
			sc.key             != this.property.key ||
			this.SHIFT.checked != this.property.shift ||
			this.ALT.checked   != this.property.alt ||
			this.ACCEL.checked != this.property.accel
		){
			this.DIALOG.removeAttribute("buttondisabledaccept");
		}else{
			this.DIALOG.setAttribute("buttondisabledaccept","true");
		}
		this.KEY.value = '';
		this.MOD.value = '';
		if(!sc.key || !(sc.shift||sc.alt||sc.accel)) return;
		this.SHIFT.checked = sc.shift;
		this.ALT.checked = sc.alt;
		this.ACCEL.checked = sc.accel;
		var acceltext = [];
		var sccnt=0;
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
		this.MOD.value = acceltext.join("+")+" +";
		this.KEY.value = sc.key;
		this.KEY.focus();

	},

	_dump : function(aString){
		this._opener.top.bitsMarkingCollection._dump(aString);
	}
};



