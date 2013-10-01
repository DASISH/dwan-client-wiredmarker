var bitsMarker = {
    markerWindow_count: 0,
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
    get id_key() {
        return "bits_marker_";
    },
    get XHTMLNS() {
        return 'http://www.w3.org/1999/xhtml';
    },
    get nodePositionInRange() {
        return {
            SINGLE: 0,
            START: 1,
            MIDDLE: 2,
            END: 3
        };
    },
    get DEFAULT_ALIGMENT() {
        return 3;
    },
    get alignment() {
        return nsPreferences.getIntPref("wiredmarker.hyperanchor.alignment", this.DEFAULT_ALIGMENT);
    },
    set alignment(aVal) {
        nsPreferences.setIntPref("wiredmarker.hyperanchor.alignment", aVal);
    },
    get STRING() {
        return window.top.document.getElementById("MarkingCollectionOverlayString");
    },
    get PRESET_STYLES()
    {
        return [
            // [0] no styles
            "",
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_1"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_2"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_3"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_4"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_5"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_6"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_7"),
            window.top.bitsMarkingCollection.STRING.getString("MARKER_CUSTOM_8"),
        ];
    },
    get Common() {
        return window.top.bitsObjectMng.Common;
    },
    get XPath() {
        return window.top.bitsObjectMng.XPath;
    },
    get gBrowser() {
        return window.top.bitsObjectMng.getBrowser();
    },
/////////////////////////////////////////////////////////////////////
    init: function() {
        var alignment = nsPreferences.getIntPref("wiredmarker.hyperanchor.alignment");
        if (alignment == undefined)
            nsPreferences.setIntPref("wiredmarker.hyperanchor.alignment", this.DEFAULT_ALIGMENT);
    },
/////////////////////////////////////////////////////////////////////
    done: function() {
    },
/////////////////////////////////////////////////////////////////////
    updateMarkerWindowCount: function(doc) {
        var body = doc.body;
        if (!body)
            return;
        var search_exp = new RegExp("^" + bitsMarker.id_key + "(\\d+)$", "mg");
        var count = -1;
        var elms = body.getElementsByTagName("span");
        for (var i = 0; i < elms.length; i++) {
            var elm = elms[i];
            if (elm.id.search(search_exp) < 0)
                continue;
            var val = parseInt(RegExp.$1);
            if (count < val)
                count = val;
        }
        this.markerWindow_count = count;
    },
/////////////////////////////////////////////////////////////////////
    unmarkerWindow: function(marker_id) {
        var i;
        for (i = 0; i < this.gBrowser.browsers.length; i++) {
            bitsMarker.unmarkerWindow2(this.gBrowser.browsers[i].contentWindow, marker_id);
        }
    },
    unmarkerWindow2: function(win, marker_id) {
        var result = false;
        if (win != null) {
            var doc = win.document;
            if (win.frames != null) {
                var i;
                for (i = 0; i < win.frames.length; i++) {
                    bitsMarker.unmarkerWindow2(win.frames[i], marker_id);
                }
            }
            if (!result) {
                var marker = doc.getElementById(marker_id);
                while (marker != null) {
                    var parent = marker.parentNode;
                    var children = marker.childNodes;
                    var index;
                    for (index = children.length - 1; index >= 0; index--) {
                        parent.insertBefore(children[0], marker);
                    }
                    parent.removeChild(marker);
                    parent.normalize();
                    result = true;
                    marker = doc.getElementById(marker_id)
                }
            }
        }
        return result;
    },
/////////////////////////////////////////////////////////////////////
    markerRange: function(range, aAttributes) {
        try {
            var startContainer = range.startContainer;
            var ownerDoc = startContainer.ownerDocument;
            var spanNode = ownerDoc.createElement("span");
            var attr;
            for (attr in aAttributes) {
                spanNode.setAttribute(attr, aAttributes[attr]);
            }
            var docfrag = range.extractContents();
            spanNode.appendChild(docfrag);
            range.insertNode(spanNode);
            return spanNode;
        } catch (ex) {
            this._dump("bitsMarker.markerRange():" + ex);
            return null;
        }
    },
/////////////////////////////////////////////////////////////////////
    getTextNode: function(aNode) {
        var rtn_txt = "";
        if (aNode.nodeName == "SELECT")
            return rtn_txt;
        if (aNode.style && aNode.style.display == 'none')
            return rtn_txt;
        if (aNode.childNodes.length) {
            var elements = aNode.childNodes;
            for (var j = 0; j < elements.length; j++) {
                if (aNode.nodeName == "TR" && j > 0)
                    rtn_txt += "\t";
                rtn_txt += addSelectionNode(elements[j]);
            }
        }
        if (aNode.nodeName.search(/^P|H1|H2|H3|H4|H5|H6|UL|OL|DIR|MENU|PRE|DL|DIV|CENTER|NOSCRIPT|NOFRAMES|BLOCKQUOTE|FORM|ISINDEX|HR|TABLE|TR|FIELDSET|ADDRESS|MULTICOL|BR$/img) == 0)
            rtn_txt = "\n" + rtn_txt + "\n";
        if (aNode.nodeValue && !(aNode.parentNode && aNode.parentNode.nodeName == "SCRIPT") && aNode.nodeName != "#comment") {
            var txt = aNode.nodeValue;
            txt = txt.replace(/[\r\n]+/img, "\n");
            txt = txt.replace(/\n+/img, " ");
            rtn_txt += txt;
        }
        if (aNode.nodeName == "IMG") {
            var src = aNode.src;
            aNode.setAttribute("src", src);
        }
        return rtn_txt;
    },
/////////////////////////////////////////////////////////////////////
    decorateElement: function(aElement, aCssText) {
        aElement.setAttribute("style", aCssText);
        aElement.setAttribute("tooltiptext", aCssText);
    },
/////////////////////////////////////////////////////////////////////
    _getFindRange: function() {
        var findRange = Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance();
        if (!findRange || !(findRange instanceof Components.interfaces.nsIFind))
            return undefined;
        findRange.caseSensitive = true;
        findRange.findBackwards = false;
        return findRange;
    },
/////////////////////////////////////////////////////////////////////
    xPathMarker: function(aDoc, aXPath, aAttributes) {
        try {
            var rtnNode = [];
            var doc = aDoc;
            if (!aDoc || !aXPath || !aXPath.start || !aXPath.end)
                return null;
            aXPath.start.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
            aXPath.startPath = RegExp.$1;
            aXPath.startOffset = RegExp.$2;
            aXPath.startType = RegExp.$3;
            aXPath.end.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
            aXPath.endPath = RegExp.$1;
            aXPath.endOffset = RegExp.$2;
            aXPath.endType = RegExp.$3;
            var startNode = null;
            var endNode = null;
            if (this.Common.getURLStringFromDocument(doc) != aXPath.con_url) {
                var win = doc.defaultView;
                doc = null;
                if (win.frames != null) {
                    var i;
                    for (var i = 0; i < win.frames.length; i++) {
                        if (this.Common.getURLStringFromDocument(win.frames[i].document) == aXPath.con_url) {
                            doc = win.frames[i].document;
                            break;
                        }
                    }
                }
            }
            if (!doc)
                return null;
            startNode = this.XPath.getCurrentNodeFromXPath(doc, aXPath.startPath, aXPath.startOffset, aXPath.startType);
            if (!startNode || !startNode.node)
                return null;
            endNode = this.XPath.getCurrentNodeFromXPath(doc, aXPath.endPath, aXPath.endOffset, aXPath.endType);
            if (!endNode || !endNode.node)
                return null;
            //annotationProxy.log('aAttributes.id: ' + aAttributes.id);
            if (!aAttributes || !aAttributes.id) {
                this.updateMarkerWindowCount(doc);
                this.markerWindow_count++;
                if (!aAttributes)
                    aAttributes = {};
                aAttributes.id = bitsMarker.id_key + this.markerWindow_count;
            } else if (aAttributes.id && aAttributes.dbtype) {
                aAttributes.id = bitsMarker.id_key + aAttributes.dbtype + aAttributes.id;
            } else if (aAttributes.id) {
                aAttributes.id = bitsMarker.id_key + aAttributes.id;
            }
            var range = doc.createRange();
            try {
                //annotationProxy.log('aAttributes.id startNode.node: ' + startNode.node);
                //annotationProxy.log('aAttributes.id endNode.node: ' + endNode.node);
                //annotationProxy.log('aAttributes.id startNode.offset: ' + endNode.offset);
                //annotationProxy.log('aAttributes.id endNode.offset: ' + endNode.offset);
                range.setStart(startNode.node, startNode.offset);
                range.setEnd(endNode.node, endNode.offset);
            } catch (ex2) {
                //annotationProxy.log('FAIL FOR: aAttributes.id: ' + aAttributes.id);
                this._dump("bitsMarker.xPathMarker():" + aAttributes.id + "=[" + range.toString() + "]::" + ex2);
                return null;
            }
            var xContext = aXPath.context.replace(/\s+$/mg, "").replace(/^\s+/mg, "");
            var rContext = this.Common.exceptCode(range.toString().replace(/\s+$/mg, "").replace(/^\s+/mg, ""));
            if (xContext != "" && xContext != rContext && (this._isTextNode(range.startContainer) || this._isTextNode(range.endContainer))) {
                var alignment = this.alignment;
                if (alignment == 0)
                    return null;
                var textPArray = [];
                var textNArray = [];
                var textContent;
                var textCnt;
                var nodeWalker = doc.createTreeWalker(
                        doc.body,
                        NodeFilter.SHOW_TEXT,
                        {
                            acceptNode: function(aNode) {
                                if (aNode.nodeType == aNode.TEXT_NODE && !(/[^\t\n\r ]/.test(aNode.nodeValue)))
                                    return NodeFilter.FILTER_REJECT;
                                return NodeFilter.FILTER_ACCEPT;
                            }
                        },
                false);
                nodeWalker.currentNode = range.startContainer;
                var textContentP = nodeWalker.currentNode.textContent;
                for (textCnt = 0; textCnt < nodeWalker.currentNode.textContent.length; textCnt++) {
                    textPArray.unshift({
                        node: nodeWalker.currentNode,
                        pos: textCnt
                    });
                }
                if (textContentP.lastIndexOf(xContext) < 0 && textContentP.length < alignment) {
                    while (nodeWalker.previousNode()) {
                        textContentP = nodeWalker.currentNode.textContent + textContentP;
                        for (textCnt = 0; textCnt < nodeWalker.currentNode.textContent.length; textCnt++) {
                            textPArray.unshift({
                                node: nodeWalker.currentNode,
                                pos: textCnt
                            });
                        }
                        if (textContentP.lastIndexOf(xContext) >= 0)
                            break;
                        if (textContentP.length > alignment)
                            break;
                    }
                }
                var indexP = textContentP.lastIndexOf(xContext);
                var lengthP = 0;
                if (indexP >= 0)
                    lengthP = textContentP.length;
                nodeWalker.currentNode = range.startContainer;
                var textContentN = nodeWalker.currentNode.textContent;
                for (textCnt = 0; textCnt < nodeWalker.currentNode.textContent.length; textCnt++) {
                    textNArray.push({
                        node: nodeWalker.currentNode,
                        pos: textCnt
                    });
                }
                if (textContentN.indexOf(xContext) < 0 && textContentN.length < alignment) {
                    while (nodeWalker.nextNode()) {
                        textContentN += nodeWalker.currentNode.textContent;
                        for (textCnt = 0; textCnt < nodeWalker.currentNode.textContent.length; textCnt++) {
                            textNArray.push({
                                node: nodeWalker.currentNode,
                                pos: textCnt
                            });
                        }
                        if (textContentN.indexOf(xContext) >= 0)
                            break;
                        if (textContentN.length > alignment)
                            break;
                    }
                }
                var indexN = textContentN.indexOf(xContext);
                var findRange = this._getFindRange();
                var docRange = doc.createRange();
                docRange.selectNode(doc.body);
                var startRange = docRange.cloneRange();
                var stopRange = docRange.cloneRange();
                stopRange.collapse(false);
                startRange.collapse(false);
                if (indexP >= 0 && (lengthP - indexP) <= alignment && indexN >= 0 && indexN <= alignment) {
                    if ((lengthP - indexP) <= indexN) {
                        startRange.setStart(textPArray[indexP].node, indexP);
                        startRange.setEnd(textPArray[indexP].node, indexP);
                    } else {
                        startRange.setStart(textNArray[indexN].node, textNArray[indexN].pos);
                        startRange.setEnd(textNArray[indexN].node, textNArray[indexN].pos);
                    }
                } else if (indexP >= 0 && (lengthP - indexP) <= alignment) {
                    startRange.setStart(textPArray[indexP].node, indexP);
                    startRange.setEnd(textPArray[indexP].node, indexP);
                } else if (indexN >= 0 && indexN <= alignment) {
                    startRange.setStart(textNArray[indexN].node, textNArray[indexN].pos);
                    startRange.setEnd(textNArray[indexN].node, textNArray[indexN].pos);
                } else {
                    return null;
                }
                var result = findRange.Find(xContext, docRange, startRange, stopRange);
                if (!result)
                    return null;
                range = result.cloneRange();
            }
            rtnNode.push({id: aAttributes.id, text: range.toString()});
            if (doc.getElementById(aAttributes.id))
                return rtnNode;
            var aWindow = doc.defaultView;
            var startC = range.startContainer;
            var endC = range.endContainer;
            var sOffset = range.startOffset;
            var eOffset = range.endOffset;
            var sameNode = (startC == endC);
            var sameOffset = (sOffset == eOffset);
            if (sameNode && sameOffset) {
                this._wrapTextNodeWithSpan(doc, startC, this._createSpanNode(aWindow, aAttributes, this.nodePositionInRange.SINGLE));
                return rtnNode;
            }
            var createNode = false;
            function _acceptNode(aNode) {
                if (aNode.nodeType != aNode.TEXT_NODE && aNode.nodeType != aNode.ELEMENT_NODE)
                    return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
            ;
            if (!sameNode || !this._isTextNode(startC)) {
                var endNode;
                if (endC.nodeType == endC.ELEMENT_NODE && endC.childNodes.length > range.endOffset) {
                    endNode = endC.childNodes[range.endOffset];
                } else {
                    endNode = endC;
                }
                var nodeWalker = doc.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ALL, _acceptNode, false);
                nodeWalker.currentNode = startC;
                for (var txtNode = nodeWalker.nextNode(); txtNode && txtNode != endNode; txtNode = nodeWalker.nextNode()) {
                    if (txtNode.nodeType == txtNode.ELEMENT_NODE)
                        continue;
                    var xContext = txtNode.nodeValue.replace(/[\r\n\t]+/mg, "");
                    if (xContext.length == 0)
                        continue;
                    if (!createNode) {
                        xContext = txtNode.nodeValue.replace(/\s+/mg, "");
                        if (xContext.length == 0)
                            continue;
                    }
                    if (
                            txtNode.parentNode.nodeName == "SCRIPT" ||
                            txtNode.parentNode.nodeName == "TABLE" ||
                            txtNode.parentNode.nodeName == "THEAD" ||
                            txtNode.parentNode.nodeName == "TBODY" ||
                            txtNode.parentNode.nodeName == "TFOOT" ||
                            txtNode.parentNode.nodeName == "TR"
                            )
                        continue;
                    if (endC.compareDocumentPosition(txtNode) == endC.DOCUMENT_POSITION_FOLLOWING)
                        continue;
                    nodeWalker.currentNode = this._wrapTextNodeWithSpan(doc, txtNode, this._createSpanNode(aWindow, aAttributes, this.nodePositionInRange.MIDDLE));
                    createNode = true;
                }
            }
            if (endC.parentNode.nodeName != "SCRIPT") {
                if (this._isTextNode(endC))
                    endC.splitText(eOffset);
                if (!sameNode && endC.nodeValue) {
                    var xContext = endC.nodeValue.replace(/[\r\n\t\s]+/mg, "");
                    if (xContext.length > 0) {
                        this._wrapTextNodeWithSpan(doc, endC, this._createSpanNode(aWindow, aAttributes, this.nodePositionInRange.END));
                        createNode = true;
                    }
                }
            }
            if (this._isTextNode(startC) && startC.parentNode.nodeName != "SCRIPT") {
                var secondHalf = startC.splitText(sOffset);
                var xContext = secondHalf.nodeValue.replace(/[\r\n\t\s]+/mg, "");
                if (xContext.length > 0) {
                    if (sameNode) {
                        this._wrapTextNodeWithSpan(doc, secondHalf, this._createSpanNode(aWindow, aAttributes, this.nodePositionInRange.SINGLE));
                        createNode = true;
                    } else {
                        this._wrapTextNodeWithSpan(doc, secondHalf, this._createSpanNode(aWindow, aAttributes, this.nodePositionInRange.START));
                        createNode = true;
                    }
                }
            }
            if (!createNode && sameNode)
                this.markerRange(range, aAttributes);
            range.collapse(true);
            if (aAttributes.id) {
                var xPathResult = this.XPath.evaluate('//*[@id="' + aAttributes.id + '"]', doc);
                for (var k = 0; k < xPathResult.snapshotLength; k++) {
                    var node = xPathResult.snapshotItem(k);
                    if (xPathResult.snapshotLength > 1) {
                        if (k == 0) {
                            node.style.borderRight = "";
                        } else if (k == (xPathResult.snapshotLength - 1)) {
                            node.style.borderLeft = "";
                        } else {
                            node.style.borderLeft = "";
                            node.style.borderRight = "";
                        }
                    }
                }
            }
            return rtnNode;
        } catch (ex) {
            this._dump("bitsMarker.xPathMarker():" + ex);
            return null;
        }
    },
/////////////////////////////////////////////////////////////////////
    _isTextNode: function(aNode) {
        return aNode.nodeType == aNode.TEXT_NODE;
    },
/////////////////////////////////////////////////////////////////////
    _createSpanNode: function(aWindow, aAttributes, aNodePosInRange) {
        var newNode = aWindow.document.createElement("span");
        for (var attr in aAttributes) {
            newNode.setAttribute(attr, aAttributes[attr]);
        }
        return newNode;
    },
/////////////////////////////////////////////////////////////////////
    _wrapTextNodeWithSpan: function(aDoc, aTextNode, aSpanNode) {
        var clonedTextNode = aTextNode.cloneNode(false);
        var nodeParent = aTextNode.parentNode;
        aSpanNode.appendChild(clonedTextNode);
        nodeParent.replaceChild(aSpanNode, aTextNode);
        return clonedTextNode;
    },
/////////////////////////////////////////////////////////////////////
    _dump: function(aString) {
        window.top.bitsMarkingCollection._dump(aString);
    },
}
