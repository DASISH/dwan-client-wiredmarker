var mcCaptureDialog = {

	get STRING()     { return document.getElementById("mcCaptureString"); },
	get TITLE()      { return document.getElementById("mcCaptureTitle"); },
	get LINK()       { return document.getElementById("mcCaptureLink"); },

	get DataSource() { return window.opener.top.bitsObjectMng.DataSource; },
	get Common()     { return window.opener.top.bitsObjectMng.Common;     },
	get XPath()      { return window.opener.top.bitsObjectMng.XPath;      },
	get Database()   { return window.opener.top.bitsObjectMng.Database;   },
	get XML()        { return window.opener.top.bitsObjectMng.XML;        },
	get gBrowser()   { return window.opener.top.bitsObjectMng.getBrowser();},

	rulstring : "",
	id        : null,
	item      : null,
	resource  : null,
	property  : "",
	allselect : false,





/////////////////////////////////////////////////////////////////////
	init : function(){
		try {
			mcCaptureDialog.rulstring = window.arguments[0];
		}catch(ex){
			document.location.href.match(/\?url\=(.*)$/);
			mcCaptureDialog.rulstring = RegExp.$1;
		}
		if(!mcCaptureDialog.rulstring) return;

		try {
			mcCaptureDialog.item = window.arguments[1];
		}catch(ex){
		}
		
		if(mcCaptureDialog.item){
			if(mcCaptureDialog.item.title) mcCaptureDialog.TITLE.value = mcCaptureDialog.item.title;
			if(mcCaptureDialog.item.document_link != undefined) mcCaptureDialog.LINK.setAttribute("checked",mcCaptureDialog.item.document_link);
		}

		var acceptButt = document.documentElement.getButton("accept");
		var cancelButt = document.documentElement.getButton("cancel");
		cancelButt.focus();
		if(acceptButt) acceptButt.setAttribute("disabled",true);

		var div = document.getElementById('cutdiv');
		if(div){
			div.style.width = (innerWidth-(8*2)-4) + "px";
			div.style.height = (innerHeight-(acceptButt.boxObject.height+(8*10))) + "px";
			div.style.maxWidth = (innerWidth-(8*2)-4) + "px";
			div.style.maxHeight = (innerHeight-(acceptButt.boxObject.height+(8*10))) + "px";

			var vertical_cursor = document.getElementById('vertical_cursor');
			if(vertical_cursor){
				vertical_cursor.style.height = div.offsetHeight + "px";
				vertical_cursor.style.maxHeight = div.offsetHeight + "px";
			}
			var horizontal_cursor = document.getElementById('horizontal_cursor');
			if(horizontal_cursor){
				horizontal_cursor.style.width = div.offsetWidth + "px";
				horizontal_cursor.style.maxWidth = div.offsetWidth + "px";
			}

			div.addEventListener("mousemove", mcCaptureDialog.onMousemove, false);
			div.addEventListener("mouseout",  mcCaptureDialog.onMouseout, false);
			div.addEventListener("mousedown", mcCaptureDialog.onMousedownR, false);
			div.addEventListener("scroll", mcCaptureDialog.onMousemove, false);

		}

		var canvas = document.getElementById('cutcanvas');
		if(canvas){
			var img = new Image();   // 新しい Image オブジェクトを作る
			img.src = mcCaptureDialog.rulstring; // ソースのパスを設定する
			img.onload = function(){
				// drawImage 文をここで実行

				canvas.style.width = img.width+"px";
				canvas.style.height = img.height+"px";
				canvas.width = img.width;
				canvas.height = img.height;

				var ctx = canvas.getContext("2d");
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				ctx.drawImage(img,0,0);

				ctx.restore();

				var basediv = document.getElementById('basediv');
				basediv.style.width = img.width+"px";
				basediv.style.height = img.height+"px";

				mcCaptureDialog.cmdAllSelect();

			}
		}
    window.sizeToContent();
		if(div){
			div.style.width = (innerWidth-(8*2)-4) + "px";
			div.style.maxWidth = (innerWidth-(8*2)-4) + "px";
		}
	},

/////////////////////////////////////////////////////////////////////
	cmdAllSelect : function(aEvent){

		var rubber_band = document.getElementById('rubber_band');
		var canvas = document.getElementById('cutcanvas');
		var acceptButt = document.documentElement.getButton("accept");
		if(!rubber_band || !canvas) return;

		rubber_band.style.left = "-1px";
		rubber_band.style.top = "-1px";
		rubber_band.style.width = (canvas.width-2) + "px";
		rubber_band.style.height = (canvas.height-2) + "px";
		rubber_band.style.display = "";

		if(acceptButt) acceptButt.removeAttribute("disabled");
		
		mcCaptureDialog.allselect = true;
	},

/////////////////////////////////////////////////////////////////////
	onMousemove : function(aEvent){
		var div = document.getElementById('cutdiv');
		if(!div) return;

		var vertical_cursor = document.getElementById('vertical_cursor');
		if(vertical_cursor){
			vertical_cursor.style.display = "";
			vertical_cursor.style.left = (div.scrollLeft + (aEvent.pageX - div.offsetLeft)) + "px";
			vertical_cursor.style.top  = div.scrollTop + "px";
		}
		var horizontal_cursor = document.getElementById('horizontal_cursor');
		if(horizontal_cursor){
			horizontal_cursor.style.display = "";
			horizontal_cursor.style.top = (div.scrollTop + (aEvent.pageY - div.offsetTop)) + "px";
			horizontal_cursor.style.left = div.scrollLeft + "px";
		}
	},

/////////////////////////////////////////////////////////////////////
	onMouseout : function(aEvent){
		var vertical_cursor = document.getElementById('vertical_cursor');
		if(vertical_cursor){
			vertical_cursor.style.display = "none";
		}
		var horizontal_cursor = document.getElementById('horizontal_cursor');
		if(horizontal_cursor){
			horizontal_cursor.style.display = "none";
		}

	},

/////////////////////////////////////////////////////////////////////
	onMousedownR : function(aEvent){
		mcCaptureDialog.allselect = false;

		var rubber_band = document.getElementById('rubber_band');
		if(!rubber_band) return;

		var acceptButt = document.documentElement.getButton("accept");
		if(acceptButt) acceptButt.setAttribute("disabled",true);

		if(aEvent.which == 3){
			rubber_band.style.display = "none";
		}

		if(aEvent.which != 1) return;

		var div = document.getElementById('cutdiv');
		if(!div) return;

		mcCaptureDialog.rx = div.scrollLeft + (aEvent.pageX - div.offsetLeft);
		mcCaptureDialog.ry = div.scrollTop + (aEvent.pageY - div.offsetTop);

		rubber_band.style.left = mcCaptureDialog.rx + "px";
		rubber_band.style.top = mcCaptureDialog.ry + "px";

		rubber_band.style.width = "0px";
		rubber_band.style.height = "0px";

		rubber_band.style.display = "";

		div.addEventListener("mousemove", mcCaptureDialog.onMousemoveR, false);
		div.addEventListener("mouseup",   mcCaptureDialog.onMouseupR, false);

	},

/////////////////////////////////////////////////////////////////////
	onMousemoveR : function(aEvent){

		var div = document.getElementById('cutdiv');
		if(!div) return;


		var rubber_band = document.getElementById('rubber_band');
		if(!rubber_band) return;

		var canvas = document.getElementById('cutcanvas');
		if(!canvas) return;

		var x = div.scrollLeft + (aEvent.pageX - div.offsetLeft);
		var y = div.scrollTop + (aEvent.pageY - div.offsetTop);

		if(x<=0 || x>=canvas.width ||
			 y<=0 || y>=canvas.height
		){
			mcCaptureDialog.onMouseupR(aEvent);
			return;
		}

		if(mcCaptureDialog.rx<x){
			rubber_band.style.width = (x-mcCaptureDialog.rx-2) + "px";
		}else{
			rubber_band.style.left = x + "px";
			rubber_band.style.width = (mcCaptureDialog.rx-x) + "px";
		}

		if(mcCaptureDialog.ry<y){
			rubber_band.style.height = (y-mcCaptureDialog.ry-2) + "px";
		}else{
			rubber_band.style.top = y + "px";
			rubber_band.style.height = (mcCaptureDialog.ry-y) + "px";
		}
	},

/////////////////////////////////////////////////////////////////////
	onMouseupR : function(aEvent){
		var div = document.getElementById('cutdiv');
		if(!div) return;
		div.removeEventListener("mousemove", mcCaptureDialog.onMousemoveR, false);
		div.removeEventListener("mouseup",   mcCaptureDialog.onMouseupR, false);

		var rubber_band = document.getElementById('rubber_band');
		if(!rubber_band) return;


		var win = window;
		var canvas = document.getElementById("capturecanvas");

		var canvasW = rubber_band.offsetWidth-2;
		var canvasH = rubber_band.offsetHeight-2;
		if(canvasW<=2 && canvasH<=2){
			rubber_band.style.display = "none";
			return;
		}

		// set the preview initially for top left
		var xScroll = rubber_band.offsetLeft + div.offsetLeft+3 - div.scrollLeft;
		var yScroll = rubber_band.offsetTop + div.offsetTop+3 - div.scrollTop;


		var vertical_cursor = document.getElementById('vertical_cursor');
		if(vertical_cursor) vertical_cursor.style.display = "none";
		var horizontal_cursor = document.getElementById('horizontal_cursor');
		if(horizontal_cursor) horizontal_cursor.style.display = "none";
		rubber_band.style.display = "none";


		canvas.style.width = canvasW+"px";
		canvas.style.height = canvasH+"px";
		canvas.width = canvasW;
		canvas.height = canvasH;
		try {
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.scale(1.0, 1.0);    // 1.0なら原寸大
			ctx.drawWindow(win, xScroll, yScroll, canvasW, canvasH, "rgb(255,255,255)");
			ctx.restore();

			var acceptButt = document.documentElement.getButton("accept");
			if(acceptButt) acceptButt.removeAttribute("disabled");
		}
		catch(e) { dump('Capture Error: ' + e.message + '\n'); }

		if(vertical_cursor) vertical_cursor.style.display = "";
		if(horizontal_cursor) horizontal_cursor.style.display = "";
		rubber_band.style.display = "";

	},

/////////////////////////////////////////////////////////////////////
	accept : function(){
		if(window.arguments[1]){
			window.arguments[1].allselect = mcCaptureDialog.allselect;

			var canvas = null;
			if(mcCaptureDialog.allselect){
				canvas = document.getElementById("cutcanvas");
			}else{
				canvas = document.getElementById("capturecanvas");
			}
			try {
				window.arguments[1].url = canvas.toDataURL("image/png");
			}catch(ex){
				mcCapture._dump("This feature requires Firefox 2.0.\n" + ex);
			}

			window.arguments[1].title = mcCaptureDialog.TITLE.value;
			window.arguments[1].document_link = mcCaptureDialog.LINK.checked;

			window.arguments[1].accept = true;
		}
	},

/////////////////////////////////////////////////////////////////////
	cancel : function(){
		if(window.arguments[1]) window.arguments[1].accept = false;
	},

/////////////////////////////////////////////////////////////////////
	_dump : function(aString){
		if(nsPreferences.getBoolPref("wiredmarker.debug", false)) window.dump(aString+"\n");
	},
};



