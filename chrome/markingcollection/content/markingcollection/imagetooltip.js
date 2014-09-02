var bitsImageTooltip = {
	tooltipRow : -1,
	tooltipTimer : null,

	get TOOLTIP() { return window.top.document.getElementById("MarkingCollectionImageTooltip"); },
	get CANVAS()  { return window.top.document.getElementById("MarkingCollectionImageTooltipCanvas"); },
	get SIDEBAR() { return window.top.document.getElementById("sidebar"); },

	get Database(){ return window.top.bitsObjectMng.Database; },

	init : function(){},

	done : function(){},

	onMousedown : function(aEvent){
		bitsImageTooltip.hidePopup();
	},

	onMouseout : function(aEvent){
		bitsImageTooltip.hidePopup();
	},

	hidePopup : function(){
		if(bitsImageTooltip.tooltipTimer) clearTimeout(bitsImageTooltip.tooltipTimer);
		bitsImageTooltip.tooltipTimer = null;
		bitsImageTooltip.TOOLTIP.hidePopup();
		bitsImageTooltip.tooltipRow = -1;
	},

	onMousemove : function(aEvent,aParam){
		bitsImageTooltip.hidePopup();
		if(aParam.tree && (aParam.row == undefined || bitsImageTooltip.tooltipRow == aParam.row.value) )return;
		bitsImageTooltip.tooltipTimer = setTimeout(
			function(){
				bitsImageTooltip._onMousemove(aParam);
			},500)
	},

	_onMousemove : function(aParam){
		try {
			if(aParam.tree){
				var curIdx = aParam.row.value;
				bitsImageTooltip.tooltipRow = curIdx;
				if(aParam.tree.view.isContainer(curIdx)){
					bitsImageTooltip.TOOLTIP.hidePopup();
					return;
				}
			}
			if(!aParam.obj){
				bitsImageTooltip.TOOLTIP.hidePopup();
				return;
			}
			if(aParam.obj.oid_type.match(/^image\/(.+)$/)){
				var itemX = {};
				var itemY = {};
				var width = {};
				var height = {};
				var screenX = 0;
				var screenY = 0;
				if(aParam.tree){
					aParam.tree.treeBoxObject.getCoordsForCellItem(aParam.row.value,aParam.col.value,aParam.childElt.value,itemX,itemY,width,height);
					screenX = aParam.tree.treeBoxObject.screenX;
					screenY = aParam.tree.treeBoxObject.screenY;
				}else if(aParam.menuitem){
					itemX.value = aParam.menuitem.boxObject.x;
					itemY.value = aParam.menuitem.boxObject.y;
					width.value = aParam.menuitem.boxObject.width;
					height.value = aParam.menuitem.boxObject.height;
					screenX = aParam.menuitem.boxObject.screenX;
					screenY = aParam.menuitem.boxObject.screenY;
				}
				var blob = bitsImageTooltip.Database.getObjectBLOB(aParam.obj.oid,aParam.obj.dbtype);
				if(blob && blob.length>0 && blob[0].length>0){
					var images = String.fromCharCode.apply(String, blob[0]);
					var image_b64 = btoa(images); // base64 encoding
					image_b64 = 'data:' + aParam.obj.oid_type + ';base64,' + image_b64;
					var img = new Image();
					img.src = image_b64;
					img.onload = function(){
						if(bitsImageTooltip.updatePreview(img)){
							var x=0;
							var y=0;
							if(aParam.tree){
								x = screenX + itemX.value - parseInt((top.outerWidth-top.innerWidth)/2);
								y = screenY + itemY.value;
								if(aParam.tree && aParam.tree.id == "bitsItemTree"){
									x += width.value;
									y += height.value+4;
								}
							}else if(aParam.menuitem){
								x = screenX + parseInt(width.value/3);
								y = screenY;
							}
							if(bitsImageTooltip.tooltipTimer) clearTimeout(bitsImageTooltip.tooltipTimer);
							bitsImageTooltip.showPreview(x,y,aParam);
						}else{
							bitsImageTooltip.hidePopup();
						}
						img = undefined;
					}
				}else{
					bitsImageTooltip.TOOLTIP.hidePopup();
				}
			}else{
				bitsImageTooltip.TOOLTIP.hidePopup();
			}
		}catch(ex){
			window.top.bitsObjectMng._dump('bitsImageTooltip.onMousemove():' + ex);
			bitsImageTooltip.TOOLTIP.hidePopup();
		}
	},

	updatePreview: function(aImage){
		var canvas = bitsImageTooltip.CANVAS;
		var tooltip = bitsImageTooltip.TOOLTIP;
		var canvasW = aImage.width;
		var canvasH = aImage.height;
		canvas.style.width = canvasW+"px";
		canvas.style.height = canvasH+"px";
		canvas.width = canvasW;
		canvas.height = canvasH;

		var width = canvasW;
		var height = canvasH;
		var tWIDTH = 480;
		if(canvasW > tWIDTH){
			width = tWIDTH-14;
			height = parseInt((canvasH*width)/canvasW);
			canvas.style.width = width+"px";
			canvas.style.height = height+"px";
			canvas.width = width;
			canvas.height = height;
		}
		try{
			if(!canvas.getContext) return false;
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvasW, canvasH);
			ctx.save();
			ctx.scale(width/canvasW, height/canvasH);
			ctx.drawImage(aImage,0,0);
			ctx.restore();
		}
		catch(ex){
			window.top.bitsObjectMng._dump('bitsImageTooltip.updatePreview():' + ex);
			return false;
		}
		return true;
  },

	showPreview: function(x, y, aParam){
		if(this.tooltipTimer) clearTimeout(this.tooltipTimer);
		this.tooltipTimer = null;
		if(this.TOOLTIP.openPopupAtScreen){
			this.TOOLTIP.openPopupAtScreen(x, y, false);
		}else{
			if(aParam.tree){
				this.TOOLTIP.showPopup(this.SIDEBAR, x, y, "tooltip");
			}else if(aParam.menuitem){
			}
		}
  },

};
