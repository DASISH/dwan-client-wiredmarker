var annotationProxy = (function() {
    return {
        defaltDatabase : 'dwan',
        /***
         * Get current user info
         * @returns {undefined} false if user in not loged in. user object if loged in
         */
        getLoggedInInfo: function(callback) {  
            var authURL = annotationFramework.getBackend() + "/api/authentication/user";
            $.ajax({
                type: 'GET',
                url: authURL,
                dataType: "xml",
                success: function(xml ,textStatus, jqXHR) {
                   $xml = $.parseXML(jqXHR.responseText);
                   // alert(JSON.stringify($xml));
                },
                error: function(jqXHR, status, thrownError) {
                    // alert("statusCode in ajax error method: " + jqXHR.status);
                    callback.call(undefined, jqXHR.status);
                }
                
            });
            
            var user_placeholder = {
                URI: 'https://lux17.mpi.nl/ds/webannotator/api/users/00000000-0000-0000-0000-0000000009999',
                uid: '00000000-0000-0000-0000-0000000009999',
                dislayName: 'Test Testsson',
                eMail: 'test@test.com'
            }; 

            return user_placeholder;
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
                                if (bitsObjectMng.Database._dasish_aid_exists('', result.dasish_aid, true)) {
                                    annotationProxy.log('AID already in database : ' + result.dasish_aid);
                                } else {
                                    annotationProxy.log('Adding annotation to database : ' + result.dasish_aid);
                                    
                                    var aSql = 'SELECT pfid, pfid_order, fid_title FROM om_folder WHERE fid_title = "Marker"';
                                    var rtn = bitsObjectMng.Database.selectB(annotationProxy.defaltDatabase, aSql);
                                    //var folder = rtn[0].fid_title;
                                    
                                    bitsObjectMng.Database.addObject(result, annotationProxy.defaltDatabase, undefined);
                                }
                            });
                        });
                    }
            );

            //if (bitsObjectMng.Database.existsObject(tmp, undefined)) {
            //    this.log("annotationProxy annotation exists in the database");
            //} else {
            //    this.log("annotationProxy inserting annotation in the database");
            //    bitsObjectMng.Database.addObject(tmp, '_uncategorized', undefined);
            //}
            /*
             annotationFramework.getAnnotations({link: url, access: read}, function(result) {
             var annotations = $(result);
             
             annotations.find('annotation').each(function() {
             var aid = $(this).attr('ref').substr($(this).attr('ref').lastIndexOf('/') + 1);
             
             annotationFramework.getAnnotation(aid, function(annotation){
             annotation.find('annotation').each(function() {
             var om_object = annotation2om_object(this);
             
             //bitsObjectMng.Database.addObject
             });
             });
             });
             });
             */
        },
        postAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            annotationFramework.postAnnotation(annotation, om_object.oid, 
                function(aid){
                    annotationProxy.log('Annotation posted and returned AID: '+aid);
                    annotationProxy.log('Geting target list for posting cache...');
                    annotationFramework.getTargets(aid, 
                        function(targets){
                            var htmlDump = annotationProxy.getCurrentHtmlDocument();
                            var cacheMetadata = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\
                                                 <cashedRepresentationInfo xmlns="http://www.dasish.eu/ns/addit" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" URI="https://lux17.mpi.nl/ds/webannotator/api/cached/00000000-0000-0000-0000-000000000051" xsi:schemaLocation="http://www.dasish.eu/ns/addit https://svn.clarin.eu/DASISH/t5.6/schema/trunk/annotator-schema/src/main/resources/DASISH-schema.xsd">\n\
                                                    <mimeType>text/plain</mimeType>\n\
                                                    <tool>DWAN</tool>\n\
                                                    <type>html</type>\n\
                                                 </cashedRepresentationInfo>';
                            annotationProxy.log(cacheMetadata);
                            $.each(targets, function(index, targetURL){
                                var xpointer = encodeURIComponent(om_object_xpointer(om_object));
                                targetURL += '/fragment/placeholderForFragment/cached';
                                
                                annotationFramework.postCache(targetURL, htmlDump, cacheMetadata);
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
        getAidFromOid: function(oid) {
            var aSql = 'SELECT dasish_aid FROM om_object WHERE oid="' + oid + '"';
            var rtn = bitsObjectMng.Database.selectB(annotationProxy.defaltDatabase, aSql); // aMode = "" defaults to predefined value; aSql contains sql statement

            return rtn[0].dasish_aid;
        },
        getCurrentHtmlDocument : function(){
            var xmlS = new XMLSerializer();
            var temp = xmlS.serializeToString(document);
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
        }
    }
}());