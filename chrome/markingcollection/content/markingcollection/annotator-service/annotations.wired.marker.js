var annotationProxy = (function() {
    return {
        defaltDatabase : 'dwan',
        /***
         * Get current user info
         * @returns {undefined} false if user in not loged in. user object if loged in
         */
        getLoggedInInfo: function(callback) {  
            var authURL = annotationFramework.getBackend() + "/api/authentication/principal";
            $.ajax({
                type: 'GET',
                url: authURL,
                dataType: "xml",
                timeout: 4000, // In order to be able to catch server inaccessibility, e.g. due to security restrictions.
                success: function(xml ,textStatus, jqXHR) {
                   $xml = $.parseXML(jqXHR.responseText);
                   var user = new Object();
                   user.dislayName = jQuery($xml).find('displayName').text();
                   
                   user.email = jQuery($xml).find('eMail').text();
                   callback.call(undefined, {status:jqXHR.status, user:user});
                },
                error: function(jqXHR, status, thrownError) {
                    // alert("statusCode in ajax error method: " + jqXHR.status);
                    callback.call(undefined, {status: jqXHR.status});
                }
            });
            
            var user_placeholder = {
                URI: 'https://lux17.mpi.nl/ds/webannotator/api/users/00000000-0000-0000-0000-0000000009999',
                uid: '00000000-0000-0000-0000-0000000009999',
                dislayName: 'Test Testsson',
                eMail: 'test@test.com'
            }; 

            //return user_placeholder;
        },
        getAnnotations: function(url) {
            annotationProxy.log('getAnnotations for: ' + url);

            annotationFramework.getAnnotations(url,
                function(annotations) {
                    annotationProxy.log('got annotations ');
                    annotationProxy.log(annotations);

                    $.each(annotations, function(index, annotationURL) {
                        annotationFramework.getAnnotation(annotationURL, function(result) {
                            annotationProxy.log('checking if annotation exist in DB:');
                            annotationProxy.log(result);

                            //check if this annotation is already in the one of the local databases
                            if (bitsObjectMng.Database._dasish_aid_exists(annotationProxy.defaltDatabase, result.dasish_aid, true)) {
                                annotationProxy.log('AID already in database '+annotationProxy.defaltDatabase+': ' + result.dasish_aid);
                            }else if(bitsObjectMng.Database._dasish_aid_exists('_uncategorized', result.dasish_aid, true)){
                                annotationProxy.log('AID already in database _uncategorized: ' + result.dasish_aid);
                            } else {
                                annotationProxy.log('Adding annotation to database : ' + result.dasish_aid);
                                bitsObjectMng.Database.addObject(result, annotationProxy.defaltDatabase, undefined);
                            }
                        });
                    });
                }
            );
        },
        postAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            annotationFramework.postAnnotation(annotation, om_object.oid, 
                function(aid){
                    annotationProxy.log('Annotation posted and returned AID: '+aid);
                    annotationProxy.log('Geting target list for posting cache...');
                    annotationFramework.getTargets(aid, 
                        function(targets){
                            //POST cache representation for HTML
                            var htmlDump = annotationProxy.getCurrentHtmlDocument();
                            var cacheMetadata = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+
                                                '<cashedRepresentationInfo xmlns="http://www.dasish.eu/ns/addit" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n'+
                                                '    URI="tmpNewCacheURI" xsi:schemaLocation="http://www.dasish.eu/ns/addit https://svn.clarin.eu/DASISH/t5.6/schema/trunk/annotator-schema/src/main/resources/DASISH-schema.xsd">\n'+
                                                '    <mimeType>text/html</mimeType>\n'+
                                                '    <tool>DWAN</tool>\n'+
                                                '    <type>html</type>\n'+
                                                '</cashedRepresentationInfo>';
                            var cacheMimeType = 'text/html';
                            $.each(targets, function(index, targetURL){
                                var xpointer = encodeURIComponent(om_object_xpointer(om_object));
                                
                                var xpointer = xpointer.replace(/%/g,'--');
                                annotationProxy.log(xpointer);
                                targetURL += '/fragment/'+xpointer+'/cached';
                                
                                //cache html-dump
                                annotationFramework.postCache(targetURL, cacheMetadata, htmlDump, cacheMimeType);
                            });
                    });
                });
        },
        updateAnnotation: function(om_object) {
            var aid = this.getAidFromOid(om_object.oid);
            this.log('updateAnnotation : ' + JSON.stringify(om_object));
            this.log('UPDATED ANNOTATION AS XML (aid: ' + aid + ')');
            var xml = om_object_annotation_body(om_object);

            this.log(xml);

            annotationFramework.putAnnotation(aid, xml);
        },
        updateFullAnnotation: function(om_object) {
            var aid = this.getAidFromOid(om_object.oid);
            annotationFramework.getAnnotationXml(aid, function(annotation){
                //update the annotation
                var note = om_object.oid_property.match(/<NOTE>(.+?)<\/NOTE>/)[1];
                annotation = $.parseXML(annotation);
                $(annotation).find('headline').text(om_object.oid_title);
                $(annotation).find('body').find('xhtml\\:span').text(note);
                
                var xmlString = (new XMLSerializer()).serializeToString(annotation);

                annotationFramework.putFullAnnotation(aid, xmlString);
            });
        },
        openRemoteCache: function(event, tabbed){
            this.log(event);
            var oid = bitsAutocacheService.bitsItemView.object.oid;
            this.getCacheURL(oid, tabbed);
        },
        getCacheURL: function(oid, tabbed){
            var aid = this.getAidFromOid(oid);
            annotationFramework.getTargets(aid, function(targets){
                var targetURL = targets[0];
                annotationProxy.log('targets');
                annotationProxy.log(targets[0]);
                annotationFramework.getCacheURL(targetURL, function(cacheURL){
                    cacheURL += '/stream';
                    annotationProxy.log('cacheURL');
                    annotationProxy.log(cacheURL);
                    bitsAutocacheService.Common.loadURL(cacheURL, tabbed);
                });
            });
            
        },
        getAidFromOid: function(oid) {
            var aSql = 'SELECT dasish_aid FROM om_object WHERE oid="' + oid + '"';
            var rtn; 

            if(bitsObjectMng.Database._idExists('local', oid, true)){
                rtn = bitsObjectMng.Database.selectB('local', aSql);
            }else if(bitsObjectMng.Database._idExists('_uncategorized', oid, true)){
                 rtn = bitsObjectMng.Database.selectB('_uncategorized', aSql);
            }
            
            return rtn[0].dasish_aid;
        },
        getCurrentHtmlDocument : function(){
            var xmlS = new XMLSerializer();
            var temp = xmlS.serializeToString(bitsAutocacheService.gBrowser.contentDocument);
            return temp;
        },
        log: function(message) {
            //log to console
            if (typeof Firebug != 'undefined' && Firebug.Console) {
                Firebug.Console.log(message);
            }
            //log this to the local proxy
            /*
             $.ajax({
             type: "POST",
             url: 'http://localhost/annotations/annotator-service/test/proxy.php',
             data: {log: 'true', message: message}
             });
             */
        },
        showError: function(message) {
            
            if(typeof message != 'object') {
                var tmp = new Object();
                tmp.info = message;
                message = tmp;
            }
            
            message.info = message.info.substring(message.info.lastIndexOf("<body>")+6,message.info.lastIndexOf("</body>"));
            message.info = message.info.replace("<p>", "\n");
            message.info = message.info.replace("<h1>", "\n");
            message.info = message.info.replace("<h3>", "\n");
            message.info = message.info.replace("</p>", "\n");
            message.info = message.info.replace(/<(?:.|\n)*?>/gm, '');
            
            window.openDialog("chrome://markingcollection/content/infoDialog.xul", "", 
                              "chrome,centerscreen,modal", 
                              message);
            
            //alert(body);
        }
    }
}());