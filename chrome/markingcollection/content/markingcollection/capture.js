var mcCapture = {

	get POPUP()    { return document.getElementById("mcPopup"); },

	get gBrowser()   { return window.top.bitsObjectMng.getBrowser();},
	get Common()     { return window.top.bitsObjectMng.Common;      },
	get DataSource() { return window.top.bitsObjectMng.DataSource;  },
	get Database() { return window.top.bitsObjectMng.Database;  },

/////////////////////////////////////////////////////////////////////
	init : function(){
		if(mcCapture.POPUP) mcCapture.POPUP.addEventListener("popupshowing", mcCapture.onPopupShowing, false);
	},

/////////////////////////////////////////////////////////////////////
	done : function(){
		if(mcCapture.POPUP) mcCapture.POPUP.removeEventListener("popupshowing", mcCapture.onPopupShowing, false);
	},

/////////////////////////////////////////////////////////////////////
	onPopupShowing : function(aEvent){
		if(aEvent.originalTarget.localName != "popup") return;
		var res = mcTreeHandler.resource;
		if(!res){ aEvent.preventDefault(); return; }
		var hidden = mcCapture.DataSource.isContainer(res);
		if(hidden){
			var type = mcCapture.DataSource.getProperty(res,"type");
			if(type != "folder") hidden = false;
		}
		try{ document.getElementById("mcPopupCaptureMenu").hidden = !hidden; }catch(ex){}
		try{ document.getElementById("mcPopupCaptureMenuSimple").hidden = !hidden; }catch(ex){}
	},

/////////////////////////////////////////////////////////////////////
	commandCaptureAll : function(aEvent){
		var win = this.gBrowser.contentWindow;
		var pos = {x:0,y:0};
		var size = {w:win.document.documentElement.clientWidth,h:win.document.documentElement.clientHeight};
		if(win.document.body.clientHeight > win.document.documentElement.clientHeight) size = {w:win.document.body.clientWidth,h:win.document.body.clientHeight};
		var div = win.document.getElementById("divMcCapture");
		if(div) div.style.display = "none";
		var url = this._capture(win,pos,size);
		if(!url) return;
		var style = "";
		var div = win.document.getElementById("divMcCapture");
		if(!div){
			div = win.document.createElement("div");
			div.setAttribute("id", "divMcCapture");
			style += "position:absolute;left:0px;top:0px;width:"+ size.w +"px;height:"+ size.h +"px;"
			div.setAttribute("style", style); 
			win.document.body.appendChild(div);
		}
		div.style.display = "";
		var divBG = win.document.getElementById("divMcCaptureBG");
		if(!divBG){
			divBG = win.document.createElement("div");
			divBG.setAttribute("id", "divMcCaptureBG");
			style = "";
			style += "position:absolute;left:0px;top:0px;width:"+ size.w +"px;height:"+ size.h +"px;"
			style += "background-color:#000000;"
			style += "opacity:0.7;"
			style += "z-index:1;"
			divBG.setAttribute("style", style); 
			div.appendChild(divBG);
		}
		var img = win.document.getElementById("imgMcCapture");
		if(!img){
			img = win.document.createElement("img");
			img.setAttribute("id", "imgMcCapture");
			div.appendChild(img);
		}
		img.src = url;
		if(img.complete) {
			this._showImage();
		} else {
			img.addEventListener("load", mcCapture._showImage, false);
		}
	},

/////////////////////////////////////////////////////////////////////
	_showImage : function(){
		var win = mcCapture.gBrowser.contentWindow;
		var img = win.document.getElementById("imgMcCapture");
		if(!img) return;
		img.removeEventListener("load", mcCapture._showImage, false);
		const margin = 200;
		var style = "";
		style += "position:absolute;left:0px;top:0px;";
		if(img.width>img.height){
			style += "max-width:" + (win.document.body.clientWidth>margin?win.document.body.clientWidth-margin:win.document.body.clientWidth-20) +"px;";
		}else{
			style += "max-height:"+ (win.document.body.clientHeight>margin?win.document.body.clientHeight-margin:win.document.body.clientHeight-20) +"px;";
		}
		style += "z-index:2;"
		img.setAttribute("style", style); 
		img.style.left = parseInt((win.document.body.clientWidth-img.width)/2)+"px";
		img.style.top  = parseInt((win.document.body.clientHeight-img.height)/2)+"px";
		img.style.display = "";
	},

/////////////////////////////////////////////////////////////////////
	_capture : function(aWin,aPos,aSize){
		var win = aWin;
		var w = aSize.w;
		var h = aSize.h;
		var vbox = document.getElementById("captureMenuVBox");
		vbox.setAttribute("hidden",false);
		var canvas = document.getElementById("capturecanvas");
		var canvasW = w;
		var canvasH = h;
		var xScroll = aPos.x;
		var yScroll = aPos.y;
		canvas.style.width = canvasW+"px";
		canvas.style.height = canvasH+"px";
		canvas.width = canvasW;
		canvas.height = canvasH;
		try{
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.scale(1.0, 1.0);    // 1.0なら原寸大
			ctx.drawWindow(win, xScroll, yScroll, w, h, "rgb(255,255,255)");
			ctx.restore();
		}catch(e){ this._dump('Capture Error: ' + e.message + '\n'); }
		try{
			var url = canvas.toDataURL("image/png");
		}catch(e){
			this.Common.alert("This feature requires Firefox 2.0.\n" + ex);
			vbox.setAttribute("hidden",true);
			return null;
		}
		vbox.setAttribute("hidden",true);
		return url;
	},

/////////////////////////////////////////////////////////////////////
	onKeyUp : function(aEvent){
		switch ( aEvent.keyCode ){
			case aEvent.DOM_VK_PRINTSCREEN :
				if(mcTreeHandler.TREE.currentIndex<0) return;
				if(!mcTreeHandler.TREE.view.isContainer(mcTreeHandler.TREE.currentIndex)) return;
				mcCapture.commandCaptureFromClipboard(aEvent);
				break;
			case 115 :
				mcCapture.commandCaptureFromClipboard(aEvent);
				break;
			default:
				break;
		}
	},

/////////////////////////////////////////////////////////////////////
	commandCaptureFromDocument : function(aEvent){
		var win = this.gBrowser.contentWindow;
		var doc = win.document;
		var pos  = {x:0,y:0};
		var size = {};
		try{
			pos.x = (doc.body.scrollLeft > doc.documentElement.scrollLeft)?doc.body.scrollLeft:doc.documentElement.scrollLeft;
			pos.y = (doc.body.scrollTop > doc.documentElement.scrollTop)?doc.body.scrollTop:doc.documentElement.scrollTop;
		}catch(e){}
		try{
			size.w = (doc.body.clientWidth > doc.documentElement.clientWidth)?doc.body.clientWidth:doc.documentElement.clientWidth;
			size.h = (doc.body.clientHeight < doc.documentElement.clientHeight)?doc.body.clientHeight:doc.documentElement.clientHeight;
		}catch(e){
			try{
				if(!doc.body && doc.width && doc.height){
					size.w = doc.width;
					size.h = doc.height;
				}
			}catch(e){return;}
		}
		var url = this._capture(win,pos,size);
		if(!url) return;
		mcCapture.openCaptureDialog(url);
	},

/////////////////////////////////////////////////////////////////////
	commandCaptureFromClipboard : function(aEvent){
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
		if(!clip) return false;
		var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
		if(!trans) return false;
		trans.addDataFlavor("text/unicode");
		trans.addDataFlavor("image/gif");
		trans.addDataFlavor("image/jpeg");
		trans.addDataFlavor("image/png");
/*
		trans.addDataFlavor("image/bmp");
		trans.addDataFlavor("image/tiff");
		trans.addDataFlavor("image/x-xbitmap");
		trans.addDataFlavor("image/x-xpixmap");
*/
		clip.getData(trans, clip.kGlobalClipboard);
		var str = new Object();
		var str_len = new Object();
		try{
			var flavor = {};
			trans.getAnyTransferData(flavor,str,str_len);
		}catch(e){
			try{
				trans.getTransferData("text/unicode",str,str_len);
			}catch(e){
				this._dump("e=["+e+"]");
				str = null;
				str_len = null;
			}
		}
		var url = null;
		var pastetext = "";
		if(str){
			if(flavor.value && flavor.value.match(/^image\/(.+)/img)){
				var ext = RegExp.$1;
				var nsIInputStream = str.value.QueryInterface( Components.interfaces.nsIInputStream );
				var bstream = Components.classes['@mozilla.org/binaryinputstream;1'].createInstance(Components.interfaces.nsIBinaryInputStream);
				bstream.setInputStream(nsIInputStream);
				var len = nsIInputStream.available();
				var bytes = bstream.readByteArray(len);
				bstream.close();
				nsIInputStream.close();
				var images = String.fromCharCode.apply(String, bytes);
				var image_b64 = btoa(images); // base64 encoding
				url = 'data:' + flavor.value +';base64,' + image_b64;
				str = null;
			}else{
				if("nsISupportsWString" in Components.interfaces){
					str = str.value.QueryInterface(Components.interfaces.nsISupportsWString);
				}else if("nsISupportsString" in Components.interfaces){
					str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
				}else{
					str = null;
				}
			}
		}
		if(str) pastetext=str.data.substring(0,str_len.value / 2);
		if(url){
			mcCapture.openCaptureDialog(url,false);
		}else{
			this.Common.alert( mcMainService.STRING.getString("CAPTURE_CLIPBOARD_NO_IMAGE") );
		}
	},

/////////////////////////////////////////////////////////////////////
	openCaptureDialog : function(aUrlString,aLink){
		if(aLink == undefined) aLink = true;
		var result = {};
		var width = (outerWidth-100);
		var height = (outerHeight-100);
		var img = new Image();
		img.src = aUrlString;
		img.onload = function(){
			width = (width>img.width+41)?img.width+41:width;
			height = (height>img.height+129)?img.height+129:height;
			result.title = "Capture:"+mcCapture.Common.getTimeStamp();
			result.document_link = aLink;
			window.openDialog("chrome://markingcollection/content/captureDialog.xul", "", "chrome,centerscreen,modal,width="+ width +",height="+ height, aUrlString, result);
			if(!result.accept) return;
			if(result.url){
				var parentID = "0";
				var aRes = mcTreeHandler.resource;
				var dbtype = mcCapture.DataSource.getProperty(aRes,"dbtype");
				if(aRes.Value != mcCapture.DataSource.ABOUT_ROOT) parentID = mcCapture.DataSource.getProperty(aRes,"id");
				var pfid_order = mcCapture.Database.getMaxOrderFormPID(parentID);
				var regexp = new RegExp("^data:image/\\w+?;base64,");
				if(typeof result.url == "string" && regexp.test(result.url)){
					var rObj = mcCapture.Database.newObject(undefined,dbtype);
					if(rObj){
						rObj.pfid = parentID;
						if(result.title && result.title != ""){
							rObj.oid_title = result.title;
						}else{
							rObj.oid_title = "Capture:"+mcCapture.Common.getTimeStamp();
						}
						if(result.document_link && result.document_link==true){
							rObj.doc_url = mcCapture.Common.getURLStringFromDocument(mcCapture.gBrowser.contentDocument);
							rObj.doc_title = mcCapture.gBrowser.contentDocument.title?mcCapture.gBrowser.contentDocument.title:rObj.doc_url;
							rObj.con_url = rObj.doc_url;
						}else{
							var blobFile = mcCapture.Database.getObjectBLOBFile(rObj.oid,dbtype);
							var url = mcCapture.Common.convertFilePathToURL(blobFile.path);
							rObj.doc_url = url;
							rObj.con_url = url;
							rObj.doc_title = rObj.oid_title;
						}
						rObj.oid_property = "";
						rObj.oid_mode = "0";
						rObj.oid_type = "image/png";
						rObj.oid_date = mcCapture.Common.getFormatDate();
						rObj.pfid_order = ++pfid_order;
						var rtn = mcCapture.Database.addObject(rObj,dbtype);
						if(rtn) mcCapture.Database.updateObjectBLOB(rObj.oid,result.url,dbtype);
						if(rtn){
							if(mcItemView.isChecked){
								mcItemView.onTreeClick();
							}else{
								var newDCitem = mcCapture.Database.makeObjectToItem(rObj);
//								var newDCitem = mcCapture.Common.newItem(mcCapture.DataSource.identify(rObj.oid));
//								newDCitem.pfid = parentID;
//								newDCitem.type = "item";
//								newDCitem.title = rObj.oid_title;
//								newDCitem.editmode = rObj.oid_mode;
//								newDCitem.uri = rObj.doc_url;
//								newDCitem.dbtype = dbtype;
//								newDCitem.title = rObj.oid_title;
								newDCitem.icon = "chrome://markingcollection/skin/image.png";
								newRes = mcCapture.DataSource.addItem(newDCitem, aRes.Value, -1, dbtype);
								mcCapture.DataSource.flush();
								mcController.rebuildLocal();
								newDCitem = undefined;
							}
						}
						rObj = undefined;
					}
				}
			}
		}
	},

/////////////////////////////////////////////////////////////////////
	_dump : function (aString){
		window.top.bitsMarkingCollection._dump(aString);
	},

};
