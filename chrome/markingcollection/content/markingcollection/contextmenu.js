// コンテキストメニュー
var bitsContextMenu = {
    dispMenu: true,
    _localFolderRes: null,
    _cssTitle: "bitsMarkingCollectionCSS",
    _styleSheet: null,
    get STRING() {
        return document.getElementById("MarkingCollectionOverlayString");
    },
    get DataSource() {
        return window.top.bitsObjectMng.DataSource;
    },
    get Common() {
        return window.top.bitsObjectMng.Common;
    },
    get XPath() {
        return window.top.bitsObjectMng.XPath;
    },
    get Database() {
        return window.top.bitsObjectMng.Database;
    },
    get gBrowser() {
        return window.top.bitsObjectMng.getBrowser();
    },
    get _contextMenu() {
        return top.document.getElementById("MarkingCollectionContextMenu");
    },
    get _contextMenuRemarker() {
        return top.document.getElementById("MarkingCollectionContextMenuItemMarkerRemarker");
    },
    get _contextMenuRemoveAll() {
        return top.document.getElementById("MarkingCollectionContextMenuItemMarkerRemoveAll");
    },
    get _contextMenuRemove() {
        return top.document.getElementById("MarkingCollectionContextMenuItemMarkerRemove");
    },
    get _contextMenuRemoveSep() {
        return top.document.getElementById("MarkingCollectionContextMenuSeparatorMarkerRemove");
    },
    get _contextMenuProperty() {
        return top.document.getElementById("MarkingCollectionContextMenuItemMarkerProperty");
    },
    get _contextMenuPropertySep() {
        return top.document.getElementById("MarkingCollectionContextMenuSeparatorMarkerProperty");
    },
    get _contextMenuCopyToClipboard() {
        return top.document.getElementById("MarkingCollectionContextMenuItemMarkerCopyToClipboard");
    },
    get _contextMenuCopyToClipboardSep() {
        return top.document.getElementById("MarkingCollectionContextMenuSeparatorMarkerCopyToClipboard");
    },
    get _contextMenuUncategorized() {
        return top.document.getElementById("MarkingCollectionContextMenuUncategorized");
    },
    get _contentAreaContextMenu() {
        return top.document.getElementById("contentAreaContextMenu");
    },
    get _contextBookmarklink() {
        return top.document.getElementById("context-bookmarklink");
    },
    get _contextMenuObject() {
        if ("gContextMenu" in window && gContextMenu) {
            return gContextMenu;
        } else if ("gContextMenu" in window.top && window.top.gContextMenu) {
            return window.top.gContextMenu;
        } else {
            return {
                target: null,
                onLink: false,
                link: false,
                onImage: false
            }
        }
    },
/////////////////////////////////////////////////////////////////////
    init: function() {
        bitsContextMenu.removeMenu();
        bitsContextMenu._buildElement = [];
        bitsContextMenu.popup_elem = null;
        bitsContextMenu._contentAreaContextMenu.addEventListener("popupshowing", bitsContextMenu.popupshowing, false);
        bitsContextMenu.initMarkerFolder();
        bitsContextMenu.rebuildCSS();
    },
/////////////////////////////////////////////////////////////////////
    done: function() {
        this.removeMenu();
        delete this._buildElement;
        this._buildElement = null;
        this._contentAreaContextMenu.removeEventListener("popupshowing", bitsContextMenu.popupshowing, false);
    },
/////////////////////////////////////////////////////////////////////
    rebuildCSS: function() {
        var styleSheet = null;
        var i;
        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].title != bitsContextMenu._cssTitle)
                continue;
            styleSheet = document.styleSheets[i];
            break;
        }
        if (!styleSheet)
            return;
        var dbinfo = bitsMarkingCollection.dbinfo.getAllDBInfo();
        if (dbinfo) {
            for (i = 0; i < dbinfo.length; i++) {
                var foldres = bitsContextMenu.Database.getAllFolder(dbinfo[i].database_dbtype);
                if (foldres) {
                    var j;
                    for (j = 0; j < foldres.length; j++) {
                        if (!foldres[j].fid_style || foldres[j].fid_style == "")
                            continue;
                        var selector = "#css_" + dbinfo[i].database_dbtype + "_" + foldres[j].fid;
                        styleSheet.insertRule(selector + " { -moz-appearance: none !important; " + foldres[j].fid_style + " }", styleSheet.cssRules.length);
                        styleSheet.insertRule(selector + '[_moz-menuactive="true"] { -moz-appearance: none !important; background-color: Highlight; color: HighlightText; }', styleSheet.cssRules.length);
                    }
                }
            }
        }
    },
/////////////////////////////////////////////////////////////////////
    removeMenu: function() {
        if (!this._buildElement || this._buildElement.length == 0)
            return;
        var i;
        for (i = this._buildElement.length - 1; i >= 0; i--) {
            this._buildElement[i].parentNode.removeChild(this._buildElement[i]);
        }
        delete this._buildElement;
        this._buildElement = null;
        this._buildElement = [];
    },
/////////////////////////////////////////////////////////////////////
    createMarkerFolder: function(pTitle, pTarResName, pStyle, pIndex, pPID, pOrder) {
        try {
            if (!pPID)
                pPID = 0;
            var dbtype;
            if (pTarResName) {
                var aRes = this.Common.RDF.GetResource(pTarResName);
                dbtype = this.DataSource.getProperty(aRes, "dbtype");
            } else {
                dbtype = this.Database._defaultMode;
            }
            var newID = this.DataSource.identify(this.Common.getTimeStamp());
            var newFolder = this.Database.newFolder(newID);
            newFolder.fid_title = pTitle;
            newFolder.fid_style = pStyle;
            newFolder.pfid = "" + pPID;
            if (pOrder)
                newFolder.pfid_order = "" + pOrder;
            if (!this.Database.addFolder(newFolder, dbtype))
                return null;
            return newFolder.fid;
        } catch (e) {
            bitsContextMenu._dump("bitsContextMenu.createMarkerFolder():" + e);
            return null;
        }
    },
/////////////////////////////////////////////////////////////////////
    initMarkerFolder: function() {
        if (this.Database._fidCount() == 0) {
            var folder_title = this.STRING.getString("MARKER_FOLDER");
            var pfid = this.createMarkerFolder(folder_title, undefined, undefined, undefined, undefined, 1);
            for (var i = 8; i > 0; i--) {
                var idx = i;
                var title = folder_title + idx;
                var cssText = nsPreferences.copyUnicharPref("wiredmarker.marker.style." + idx, bitsMarker.PRESET_STYLES[idx]);
                this.createMarkerFolder(title, undefined, cssText, idx, pfid, idx);
            }
        }
    },
/////////////////////////////////////////////////////////////////////
    rebuild: function() {
        this.removeMenu();
        var doc = this._contentAreaContextMenu.ownerDocument;
        var removePElem = null;
        var removeElem = null;
        var i;
        var rootfolder = nsPreferences.copyUnicharPref("wiredmarker.rootfolder", window.top.bitsObjectMng.DataSource.ABOUT_ROOT);
        var contResList = this.DataSource.flattenResources(this.Common.RDF.GetResource(rootfolder), 1, false);
        for (i = 0; i < contResList.length; i++) {
            if (contResList[i].Value == rootfolder)
                continue;
            var title = this.DataSource.getProperty(contResList[i], "title");
            if (title == "")
                continue;
            var contItemList = this.DataSource.flattenResources(contResList[i], 1, false);
            if (contItemList.length <= 1)
                continue;
            removeElem = null;
            removePElem = null;
            var elemMenu = top.document.createElement("menu");
            var elemMenupopup = top.document.createElement("menupopup");
            if (!elemMenu || !elemMenupopup)
                continue;
            elemMenu.setAttribute("label", title);
            elemMenupopup.setAttribute("id", contResList[i].Value);
            elemMenupopup.addEventListener("command", this.commandIndexContextMenu, false);
            elemMenupopup.addEventListener("click", this.clickIndexContextMenu, false);
            elemMenupopup.addEventListener("popuphidden", this.popuphiddenIndexContextMenu, false);
            elemMenupopup.addEventListener("popupshowing", this.popupshowingIndexContextMenu, false);
            elemMenu.appendChild(elemMenupopup);
            this._contentAreaContextMenu.insertBefore(elemMenu, this._contextBookmarklink);
            this._buildElement.push(elemMenu);
            this._buildElement.push(elemMenupopup);
        }
        if (contResList.length > 0) {
            var id = "DS_menuseparator";
            removeElem = doc.getElementById(id);
            if (removeElem)
                removeElem.parentNode.removeChild(removeElem);
            removeElem = null;
            var elemMenuseparator = top.document.createElement("menuseparator");
            elemMenuseparator.setAttribute("id", "MC_menuseparator");
            this._contentAreaContextMenu.insertBefore(elemMenuseparator, this._contextBookmarklink);
            this._buildElement.push(elemMenuseparator);
        }
    },
/////////////////////////////////////////////////////////////////////
    isDispContextmenu: function(aDoc) {
        var nodesSnapshot = this.getMarkerNodes(aDoc);
        var rtn = (nodesSnapshot && nodesSnapshot.snapshotLength > 0 ? true : false);
        if (rtn)
            return rtn;
        var url = bitsContextMenu.Common.getURLStringFromDocument(aDoc);
        var rtnObj = this.Database.getAllObjectFormContentURL(url);
        return (rtnObj && rtnObj.length > 0) ? true : false;
    },
/////////////////////////////////////////////////////////////////////
    getMarkerNodes: function(aDoc) {
        return this.XPath.evaluate('//*[@id and @dbtype and @pfid]', aDoc);
    },
/////////////////////////////////////////////////////////////////////
    popupshowing: function(event) {
        var cm = bitsContextMenu._contextMenuObject;
        bitsContextMenu.popup_elem = null;
        var match_exp = new RegExp("^(" + bitsMarker.id_key + ".+)$", "mg");
        var clickElem = cm.target;
        while (clickElem && clickElem.id) {
            if (clickElem.id.match(match_exp)) {
                bitsContextMenu.popup_elem = clickElem;
                break;
            }
            clickElem = clickElem.parentNode;
        }
        bitsContextMenu._contextMenu.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuProperty.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuPropertySep.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuRemarker.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuRemoveAll.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuRemove.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuRemoveSep.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuCopyToClipboard.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuCopyToClipboardSep.setAttribute("hidden", "true");
        bitsContextMenu._contextMenuUncategorized.setAttribute("hidden", "true");

        var tagoutput_contextmenu_disp = true;
        var contextmenu_mode = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.mode");
        var contextmenu_type = nsPreferences.copyUnicharPref("wiredmarker.contextmenu.type", "");
        if (contextmenu_mode == "legacy" && contextmenu_type == "simple") {
            tagoutput_contextmenu_disp = false;
        } else {
            tagoutput_contextmenu_disp = bitsTagOutputService.isDispContextmenu(bitsContextMenu.gBrowser.contentDocument);
        }

        if (bitsContextMenu.isDispContextmenu(bitsContextMenu.gBrowser.contentDocument)) {
            bitsContextMenu._contextMenu.removeAttribute("hidden");
            bitsContextMenu._contextMenuRemoveAll.removeAttribute("hidden");
            if (tagoutput_contextmenu_disp)
                bitsContextMenu._contextMenuRemoveSep.removeAttribute("hidden");
        }

        var contentWindow = null;
        var mcTreeHandler = null;
        if (window.top.bitsMarkingCollection._contentWindow)
            contentWindow = window.top.bitsMarkingCollection._contentWindow;
        if (contentWindow && contentWindow.mcTreeHandler)
            mcTreeHandler = contentWindow.mcTreeHandler;
        if (tagoutput_contextmenu_disp || cm.isTextSelected || cm.onLink || cm.onImage || bitsContextMenu.popup_elem) {
            bitsContextMenu._contextMenu.removeAttribute("hidden");
            if (cm.isTextSelected || cm.onLink || cm.onImage) {
                var menupopup = bitsContextMenu._contextMenu.firstChild;
                if (bitsMarkingCollection._uncategorized.use)
                    bitsContextMenu._contextMenuUncategorized.removeAttribute("hidden");
            }
            if (bitsContextMenu.popup_elem) {
                bitsContextMenu._contextMenu.removeAttribute("hidden");
                bitsContextMenu._contextMenuRemoveSep.removeAttribute("hidden");
                if (mcTreeHandler) {
                    bitsContextMenu._contextMenuProperty.removeAttribute("hidden");
                    bitsContextMenu._contextMenuPropertySep.removeAttribute("hidden");
                    bitsContextMenu._contextMenuCopyToClipboard.removeAttribute("hidden");
                    bitsContextMenu._contextMenuCopyToClipboardSep.removeAttribute("hidden");
                }
                bitsContextMenu._contextMenuRemove.removeAttribute("hidden");
                if (cm.isTextSelected) {
                    bitsContextMenu._contextMenuRemarker.removeAttribute("hidden");
                }
                if (cm.isTextSelected || cm.onLink || cm.onImage) {
                    bitsContextMenu._contextMenuRemoveSep.removeAttribute("hidden");
                }
            }
        } else {
        }
    },
/////////////////////////////////////////////////////////////////////
    popuphidden: function(event) {
    },
/////////////////////////////////////////////////////////////////////
    commandIndexContextMenu: function(event) {
        if (bitsMarker && event.target == bitsContextMenu._contextMenuRemoveAll) {
            if (!bitsContextMenu.Common.confirm(bitsContextMenu.STRING.getString("CONFIRM_DELETE_ALL")))
                return;
            var rtn = false;
            var url = bitsContextMenu.Common.getURLStringFromDocument(bitsContextMenu.gBrowser.contentDocument);
            var rtnObj = bitsMarkingCollection.Database.getAllObjectFormContentURL(url);
            if (rtnObj && rtnObj.length) {
                var contentWindow = null;
                var bitsItemView = null;
                var mcPropertyView = null;
                if (window.top.bitsMarkingCollection._contentWindow)
                    contentWindow = window.top.bitsMarkingCollection._contentWindow;
                if (contentWindow && contentWindow.bitsItemView)
                    bitsItemView = contentWindow.bitsItemView;
                if (contentWindow && contentWindow.mcPropertyView)
                    mcPropertyView = contentWindow.mcPropertyView;
                for (var i = 0; i < rtnObj.length; i++) {
                    var pfid = rtnObj[i].pfid;
                    var dbtype = rtnObj[i].dbtype;
                    var oid = rtnObj[i].oid;
                    var res = bitsContextMenu.Common.RDF.GetResource(bitsContextMenu.DataSource.ABOUT_ITEM + oid);
                    if (event && res)
                        bitsScrapPartyAddonService.eventListener(event, 0, res);
                    rtn |= bitsContextMenu.Database.removeObject({oid: oid, pfid: pfid}, dbtype, false);
                    var node_id = bitsMarker.id_key + dbtype + oid;
                    bitsMarker.unmarkerWindow(node_id);
                    if (event && res)
                        bitsScrapPartyAddonService.eventListener(event, 1, res);
                    try {
                        if (res && bitsItemView && !bitsItemView.isChecked)
                            bitsContextMenu.DataSource.deleteItem(res);
                    } catch (e) {
                    }
                }
                if (rtn) {
                    try {
                        if (bitsItemView)
                            bitsItemView.refresh();
                        if (mcPropertyView)
                            mcPropertyView.dispProperty();
                    } catch (e) {
                    }
                }
            }
            return;
        }

        var win = bitsContextMenu.Common.getFocusedWindow();
        var sel = win.getSelection();
        var isSelected = false;
        try {
            isSelected = (sel.anchorNode === sel.focusNode && sel.anchorOffset == sel.focusOffset) ? false : true;
        } catch (ex) {
        }
        var cm = bitsContextMenu._contextMenuObject;
        var fid = event.target.getAttribute("fid");
        var fid_style = event.target.getAttribute("_style");
        var dbtype = event.target.getAttribute("dbtype");
        if (fid != "" && dbtype != "") {
            if (isSelected) {
                var newResArr = bitsMarkingCollection.addSelectedText({fid: fid, fid_style: fid_style, dbtype: dbtype}, -1);
                if (!newResArr)
                    return;
                var contentWindow = null;
                var mcTreeHandler = null;
                var mcController = null;
                if (window.top.bitsMarkingCollection._contentWindow)
                    contentWindow = window.top.bitsMarkingCollection._contentWindow;
                if (contentWindow) {
                    if (contentWindow.mcTreeHandler)
                        mcTreeHandler = contentWindow.mcTreeHandler;
                    if (contentWindow.mcController)
                        mcController = contentWindow.mcController;
                }
                if (mcTreeHandler && mcController) {
                    mcController.rebuildLocal();
                    var XferData = {};
                    XferData.data = "";
                    XferData.flavour = {};
                    XferData.flavour.contentType = "text/x-moz-url";
                    var XferDataSet = {};
                    XferDataSet.first = {};
                    XferDataSet.first.first = XferData;
                    var row = mcTreeHandler.TREE.builderView.getIndexOfResource(newResArr[0]);
                    if (row < 0) {
                        var folderRes = bitsContextMenu.DataSource.findParentResource(newResArr[0]);
                        row = mcTreeHandler.TREE.builderView.getIndexOfResource(folderRes);
                    }
                    bitsScrapPartyAddonService.builderViewObserver.onDrop(row, 1, mcTreeHandler.TREE, XferDataSet, {isSelected: isSelected, resArr: newResArr});
                }
            } else if (cm && cm.target && (cm.onLink || cm.onImage)) {
                var aXferString = "";
                var aTarget = null;
                var url = "";
                var txtContext = "";
                if (cm.onLink) {
                    var elemA = cm.target;
                    if (elemA.nodeName != "A") {
                        while (elemA && elemA.nodeName != "A") {
                            elemA = elemA.parentNode;
                        }
                    }
                    if (!elemA)
                        return;
                    aTarget = elemA;
                    url = elemA.href;
                    var nodeWalker = elemA.ownerDocument.createTreeWalker(elemA, NodeFilter.SHOW_TEXT, null, false);
                    for (var txtNode = nodeWalker.nextNode(); txtNode; txtNode = nodeWalker.nextNode()) {
                        txtContext += txtNode.nodeValue.replace(/[\r\n\t]+/mg, "") + " ";
                    }
                    txtContext = txtContext.replace(/^\s+/mg, "").replace(/\s+$/mg, "").replace(/\s{2,}/mg, " ");
                    if (txtContext == "")
                        txtContext = url;
                }
                if (cm.onImage) {
                    var elemIMG = null;
                    if (cm.target.nodeName == "IMG")
                        elemIMG = cm.target;
                    if (elemIMG) {
                        aTarget = elemIMG;
                        if (!cm.onLink && elemIMG.src)
                            url = elemIMG.src;
                        if (!cm.onLink && elemIMG.alt)
                            txtContext = elemIMG.alt;
                    }
                }
                aXferString = url + "\n" + txtContext;
                if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0 || url.indexOf("file://") == 0) {
                    bitsMarkingCollection.addURLText({fid: fid, fid_style: fid_style, dbtype: dbtype}, -1, undefined, aXferString, aTarget);
                } else {
                    this.Common.alert(bitsContextMenu.STRING.getString("ERROR_INVALID_URL") + "\n" + url);
                }
            }
        } else if (bitsContextMenu.popup_elem && event.target == bitsContextMenu._contextMenuRemove) {
            var match_exp = new RegExp("^" + bitsMarker.id_key + "\\D+(\\d+)$", "m");
            if (bitsContextMenu.popup_elem.id.match(match_exp)) {
                var dbtype = bitsContextMenu.popup_elem.getAttribute("dbtype");
                match_exp = new RegExp("^" + bitsMarker.id_key + dbtype + "(\\d+)$", "m");
                if (match_exp.test(bitsContextMenu.popup_elem.id)) {
                    var id = RegExp.$1;
                    var res = bitsContextMenu.Common.RDF.GetResource(bitsContextMenu.DataSource.ABOUT_ITEM + id);
                    if (event)
                        bitsScrapPartyAddonService.eventListener(event, 0, res);
                    var pfid = bitsContextMenu.popup_elem.getAttribute("pfid");
                    var dbtype = bitsContextMenu.popup_elem.getAttribute("dbtype");
                    if (bitsContextMenu.Database.removeObject({oid: id, pfid: pfid}, dbtype, false)) {
                        bitsMarker.unmarkerWindow(bitsContextMenu.popup_elem.id);
                        if (event)
                            bitsScrapPartyAddonService.eventListener(event, 1, res);
                        var contentWindow = null;
                        var bitsItemView = null;
                        if (window.top.bitsMarkingCollection._contentWindow)
                            contentWindow = window.top.bitsMarkingCollection._contentWindow;
                        if (contentWindow && contentWindow.bitsItemView)
                            bitsItemView = contentWindow.bitsItemView;
                        try {
                            if (res && !bitsItemView.isChecked)
                                bitsContextMenu.DataSource.deleteItem(res);
                        } catch (e) {
                        }
                        try {
                            var viewmode = window.top.bitsMarkingCollection._contentWindow.mcTreeViewModeService.viewmode;
                            bitsItemView.refresh();
                            var mcPropertyView = null;
                            if (contentWindow && contentWindow.mcPropertyView)
                                mcPropertyView = contentWindow.mcPropertyView;
                            if (mcPropertyView)
                                mcPropertyView.dispProperty();
                        } catch (e) {
                        }
                    }
                }
            }
        } else if (bitsContextMenu.popup_elem && event.target == bitsContextMenu._contextMenuRemarker) {
            var match_exp = new RegExp("^" + bitsMarker.id_key + "\\D+(\\d+)$", "m");
            if (bitsContextMenu.popup_elem.id.match(match_exp)) {
                bitsMarkingCollection.updateSelectedText(bitsContextMenu.popup_elem);
            }
        } else if (bitsContextMenu.popup_elem && event.target == bitsContextMenu._contextMenuProperty) {
            var contentWindow = null;
            var bitsItemView = null;
            var mcTreeHandler = null;
            var mcController = null;
            if (window.top.bitsMarkingCollection._contentWindow)
                contentWindow = window.top.bitsMarkingCollection._contentWindow;
            if (contentWindow && contentWindow.bitsItemView)
                bitsItemView = contentWindow.bitsItemView;
            if (contentWindow && contentWindow.mcTreeHandler)
                mcTreeHandler = contentWindow.mcTreeHandler;
            if (contentWindow && contentWindow.mcController)
                mcController = contentWindow.mcController;
            if (bitsItemView && bitsItemView.isChecked) {
                bitsItemView.property();
            } else if (mcTreeHandler && mcController && mcTreeHandler.TREE.currentIndex >= 0) {
                mcController.property(mcTreeHandler.TREE.builderView.getResourceAtIndex(mcTreeHandler.TREE.currentIndex));
            }
        } else if (bitsContextMenu.popup_elem && event.target == bitsContextMenu._contextMenuCopyToClipboard) {
            try {
                var match_exp = new RegExp("^" + bitsMarker.id_key + "\\D+(\\d+)$", "m");
                if (bitsContextMenu.popup_elem.id.match(match_exp)) {
                    var dbtype = bitsContextMenu.popup_elem.getAttribute("dbtype");
                    match_exp = new RegExp("^" + bitsMarker.id_key + dbtype + "(\\d+)$", "m");
                    if (match_exp.test(bitsContextMenu.popup_elem.id)) {
                        var oid = RegExp.$1;
                        bitsMetaCapture.copyToClipBoardByHyperanchor(oid, dbtype);
                    }
                }
            } catch (e) {
                alert(e);
            }
        }
    },
/////////////////////////////////////////////////////////////////////
    clickIndexContextMenu: function(event) {
    },
/////////////////////////////////////////////////////////////////////
    popuphiddenIndexContextMenu: function(event) {
        if (!event.target.nodeName || event.target.nodeName != "menupopup")
            return;
        var elemMenupopup = event.target;
        if (!elemMenupopup.hasChildNodes() || elemMenupopup.childNodes.length == 0)
            return;
        var match_exp = new RegExp("^(MarkingCollectionContextMenu.+)$", "mg");
        var i;
        for (i = elemMenupopup.childNodes.length - 1; i >= 0; i--) {
            if (elemMenupopup.childNodes[i].id && elemMenupopup.childNodes[i].id != "" && elemMenupopup.childNodes[i].id.match(match_exp))
                continue; /* フォルダーメニューのみ削除する */
            elemMenupopup.removeChild(elemMenupopup.childNodes[i]);
        }
    },
/////////////////////////////////////////////////////////////////////
    popupshowingIndexContextMenu_old: function(event) {
        if (!event.target.nodeName || event.target.nodeName != "menupopup")
            return;
        var cm = bitsContextMenu._contextMenuObject;
        if (cm && !(cm.isTextSelected || cm.onLink || cm.onImage))
            return;
        var elemMenupopup = event.target;
        var j;
        var aRes = null;
        var rootfolder = elemMenupopup.id;
        try {
            aRes = bitsContextMenu.Common.RDF.GetResource(rootfolder);
        } catch (ex) {
            rootfolder = bitsMarkingCollection.localfolder.about;
            if (nsPreferences.copyUnicharPref("wiredmarker.rootfolder", "") == "") {
                var listContRes = bitsContextMenu.DataSource.flattenResources(bitsContextMenu.Common.RDF.GetResource(rootfolder), 1, false);
                if (listContRes.length == 2)
                    rootfolder = listContRes[1].Value;
            } else {
                var listContRes = bitsContextMenu.DataSource.flattenResources(bitsContextMenu.Common.RDF.GetResource(bitsContextMenu.DataSource.ABOUT_ROOT), 1, false);
                if (listContRes.length == 2)
                    rootfolder = listContRes[1].Value;
            }
            aRes = bitsContextMenu.Common.RDF.GetResource(rootfolder);
        }
        if (!aRes) {
            this.Common.alert(elemMenupopup.id);
            return;
        }
        var title = bitsContextMenu.DataSource.getProperty(aRes, "title");
        var style = bitsContextMenu.DataSource.getProperty(aRes, "style");
        if (rootfolder != bitsMarkingCollection.localfolder.about) {
            var elemMenuitem = top.document.createElement("menuitem");
            if (elemMenuitem) {
                var isContainerOpen = false;
                elemMenuitem.setAttribute("id", aRes.Value);
                elemMenuitem.setAttribute("label", title);
                elemMenuitem.setAttribute("style", style);
                if (isContainerOpen) {
                    elemMenuitem.setAttribute("image", "chrome://markingcollection/skin/folder-open.png");
                } else {
                    elemMenuitem.setAttribute("image", "chrome://markingcollection/skin/folder-close.png");
                }
                elemMenuitem.setAttribute("class", "menuitem-iconic");
                elemMenupopup.appendChild(elemMenuitem);
                var elemMenuseparator = top.document.createElement("menuseparator");
                if (elemMenuseparator) {
                    elemMenuseparator.setAttribute("id", bitsContextMenu.DataSource.ABOUT_ITEM + "_sep_" + aRes.Value);
                    elemMenupopup.appendChild(elemMenuseparator);
                }
            }
        }
        var contItemList = bitsContextMenu.DataSource.flattenResources(aRes, 1, false);
        var title = bitsContextMenu.DataSource.getProperty(aRes, "title");
        if (contItemList.length > 1) {
            for (j = 0; j < contItemList.length; j++) {
                if (contItemList[j].Value == rootfolder)
                    continue;
                var title = bitsContextMenu.DataSource.getProperty(contItemList[j], "title");
                if (title == "")
                    continue;
                var style = bitsContextMenu.DataSource.getProperty(contItemList[j], "style");
                var contItemSubList = bitsContextMenu.DataSource.flattenResources(contItemList[j], 1, false);
                if (contItemSubList.length > 1) {
                    var elemMenuSub = top.document.createElement("menu");
                    var elemMenuSubpopup = top.document.createElement("menupopup");
                    if (!elemMenuSub || !elemMenuSubpopup)
                        continue;
                    elemMenuSub.setAttribute("label", title);
                    elemMenuSub.setAttribute("class", "menu-iconic");
                    var isContainerOpen = false;
                    if (isContainerOpen) {
                        elemMenuSub.setAttribute("image", "chrome://markingcollection/skin/folder-open.png");
                    } else {
                        elemMenuSub.setAttribute("image", "chrome://markingcollection/skin/folder-close.png");
                    }
                    elemMenuSubpopup.setAttribute("id", contItemList[j].Value);
                    elemMenuSub.appendChild(elemMenuSubpopup);
                    elemMenupopup.appendChild(elemMenuSub);
                } else {
                    var elemMenuitem = top.document.createElement("menuitem");
                    if (!elemMenuitem)
                        continue;
                    var isContainerOpen = false;
                    elemMenuitem.setAttribute("id", contItemList[j].Value);
                    elemMenuitem.setAttribute("label", title);
                    elemMenuitem.setAttribute("style", style);
                    if (isContainerOpen) {
                        elemMenuitem.setAttribute("image", "chrome://markingcollection/skin/folder-open.png");
                    } else {
                        elemMenuitem.setAttribute("image", "chrome://markingcollection/skin/folder-close.png");
                    }
                    elemMenuitem.setAttribute("class", "menuitem-iconic");

                    elemMenupopup.appendChild(elemMenuitem);
                }
            }
        }
    },
/////////////////////////////////////////////////////////////////////
    popupshowingIndexContextMenu: function(event) {
        if (!event.target.nodeName || event.target.nodeName != "menupopup")
            return;
        if (event.target.id && event.target.id != "MarkingCollectionContextMenupopup")
            return;
        var cm = bitsContextMenu._contextMenuObject;
        if (cm && !(cm.isTextSelected || cm.onLink || cm.onImage))
            return;
        var elemMenupopup = event.target;
        var j;
        var aRes = null;
        var rootfolder = elemMenupopup.id;
        var root_fid = elemMenupopup.getAttribute("fid");
        var root_dbtype = elemMenupopup.getAttribute("dbtype");
        if (root_fid == "" && root_dbtype == "") {
            root_fid = nsPreferences.copyUnicharPref("wiredmarker.rootfolder", "");
            root_dbtype = nsPreferences.copyUnicharPref("wiredmarker.rootfolder_dbtype", "");
        }
        if (root_fid == "" && root_dbtype == "") {
            var dbinfo = window.top.bitsMarkingCollection.dbinfo.getAllDBInfo();
            if (dbinfo) {
                var d_dbinfo = [];
                var i;
                for (i = 0; i < dbinfo.length; i++) {
                    if (!dbinfo[i].db_contextmenu)
                        continue;
                    d_dbinfo.push(dbinfo[i]);
                }
                for (i = 0; i < d_dbinfo.length; i++) {
                    var foldres = bitsContextMenu.Database.getFolderFormPID("0", d_dbinfo[i].database_dbtype);
                    this._popupshowingIndexContextMenu(elemMenupopup, foldres);
                    if (i < d_dbinfo.length - 1) {
                        var elemMenuseparator = top.document.createElement("menuseparator");
                        if (elemMenuseparator)
                            elemMenupopup.appendChild(elemMenuseparator);
                    }
                }
                return;
            }
        }
        var parser = new DOMParser();
        var foldres = bitsContextMenu.Database.getFolderFormPID(root_fid, root_dbtype);
        var foldre = bitsContextMenu.Database.getFolderFormID(root_fid, root_dbtype);
        if (foldre) {
            var elemMenuitem = top.document.createElement("menuitem");
            if (elemMenuitem) {
                elemMenuitem.setAttribute("fid", foldre[0].fid);
                elemMenuitem.setAttribute("dbtype", foldre[0].dbtype);
                elemMenuitem.setAttribute("label", foldre[0].fid_title);
                elemMenuitem.setAttribute("id", "css_" + foldre[0].dbtype + "_" + foldre[0].fid);
                elemMenuitem.setAttribute("_style", foldre[0].fid_style);
                elemMenuitem.setAttribute("class", "menuitem-iconic");
                var acceltext = bitsShortcutService.getAcceltext(foldre[0].fid, foldre[0].dbtype);
                if (acceltext)
                    elemMenuitem.setAttribute("acceltext", acceltext);
                if (foldre[0].fid_property) {
                    var xmldoc = parser.parseFromString(foldre[0].fid_property, "text/xml");
                    if (xmldoc && xmldoc.documentElement.nodeName == "parsererror")
                        xmldoc = undefined;
                    if (xmldoc) {
                        var elems = xmldoc.getElementsByTagName("ICON");
                        if (elems && elems.length > 0)
                            elemMenuitem.setAttribute("image", elems[0].textContent);
                        elems = undefined;
                        xmldoc = undefined;
                    }
                }
                if (!elemMenuitem.hasAttribute("image"))
                    elemMenuitem.setAttribute("image", "chrome://markingcollection/skin/folder-close.png");
                elemMenupopup.appendChild(elemMenuitem);
                if (foldres && foldres.length > 0) {
                    var elemMenuseparator = top.document.createElement("menuseparator");
                    if (elemMenuseparator) {
                        elemMenupopup.appendChild(elemMenuseparator);
                    }
                }
            }
        }
        parser = undefined;
        this._popupshowingIndexContextMenu(elemMenupopup, foldres);
    },
/////////////////////////////////////////////////////////////////////
    _popupshowingIndexContextMenu: function(elemMenupopup, foldres) {
        if (foldres && foldres.length > 0) {
            var parser = new DOMParser();
            foldres.sort(function(a, b) {
                return parseFloat(a.pfid_order) - parseFloat(b.pfid_order);
            });
            var j;
            for (j = 0; j < foldres.length; j++) {
                var title = foldres[j].fid_title;
                if (title == "")
                    continue;
                var style = foldres[j].fid_style;
                var contItemSubList = bitsContextMenu.Database.getFolderFormPID(foldres[j].fid, foldres[j].dbtype);
                if (contItemSubList && contItemSubList.length > 0) {
                    var elemMenuSub = top.document.createElement("menu");
                    var elemMenuSubpopup = top.document.createElement("menupopup");
                    if (!elemMenuSub || !elemMenuSubpopup)
                        continue;
                    elemMenuSub.setAttribute("label", foldres[j].fid_title);
                    elemMenuSub.setAttribute("id", "css_" + foldres[j].dbtype + "_" + foldres[j].fid);
                    elemMenuSub.setAttribute("_style", foldres[j].fid_style);
                    elemMenuSub.setAttribute("class", "menu-iconic");
                    if (foldres[j].fid_property) {
                        var xmldoc = parser.parseFromString(foldres[j].fid_property, "text/xml");
                        if (xmldoc && xmldoc.documentElement.nodeName == "parsererror")
                            xmldoc = undefined;
                        if (xmldoc) {
                            var elems = xmldoc.getElementsByTagName("ICON");
                            if (elems && elems.length > 0)
                                elemMenuSub.setAttribute("image", elems[0].textContent);
                            elems = undefined;
                            xmldoc = undefined;
                        }
                    }
                    if (!elemMenuSub.hasAttribute("image"))
                        elemMenuSub.setAttribute("image", "chrome://markingcollection/skin/folder-close.png");
                    elemMenuSubpopup.setAttribute("fid", foldres[j].fid);
                    elemMenuSubpopup.setAttribute("dbtype", foldres[j].dbtype);
                    elemMenuSub.appendChild(elemMenuSubpopup);
                    elemMenupopup.appendChild(elemMenuSub);
                } else {
                    var elemMenuitem = top.document.createElement("menuitem");
                    if (!elemMenuitem)
                        continue;
                    elemMenuitem.setAttribute("fid", foldres[j].fid);
                    elemMenuitem.setAttribute("dbtype", foldres[j].dbtype);
                    elemMenuitem.setAttribute("label", foldres[j].fid_title);
                    elemMenuitem.setAttribute("id", "css_" + foldres[j].dbtype + "_" + foldres[j].fid);
                    elemMenuitem.setAttribute("_style", foldres[j].fid_style);
                    elemMenuitem.setAttribute("class", "menuitem-iconic");
                    var acceltext = bitsShortcutService.getAcceltext(foldres[j].fid, foldres[j].dbtype);
                    if (acceltext)
                        elemMenuitem.setAttribute("acceltext", acceltext);
                    if (foldres[j].fid_property) {
                        var xmldoc = parser.parseFromString(foldres[j].fid_property, "text/xml");
                        if (xmldoc && xmldoc.documentElement.nodeName == "parsererror")
                            xmldoc = undefined;
                        if (xmldoc) {
                            var elems = xmldoc.getElementsByTagName("ICON");
                            if (elems && elems.length > 0)
                                elemMenuitem.setAttribute("image", elems[0].textContent);
                            elems = undefined;
                            xmldoc = undefined;
                        }
                    }
                    if (!elemMenuitem.hasAttribute("image"))
                        elemMenuitem.setAttribute("image", "chrome://markingcollection/skin/folder-close.png");
                    elemMenupopup.appendChild(elemMenuitem);
                }
            }
            parser = undefined;
        }
    },
/////////////////////////////////////////////////////////////////////
// 一応互換性の為に定義しておく
/////////////////////////////////////////////////////////////////////
    copyToClipBoardByHyperanchor: function(aOID, aDBType) {
        window.top.bitsMetaCapture.copyToClipBoard(aOID, aDBType, "copy");
    },
/////////////////////////////////////////////////////////////////////
    _dump: function(aString) {
        window.top.bitsMarkingCollection._dump(aString);
    },
};
