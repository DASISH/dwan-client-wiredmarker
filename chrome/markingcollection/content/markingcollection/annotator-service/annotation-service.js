var annotationFramework = (function() {
    // default value for REST service
    // SND backend for first tests
    // var default_backend = "http://pelle.ssd.gu.se:8080/exist/rest/db/annotation-framework/api/annotations.xql";
    // MPI backend
    var default_backend = "https://lux17.mpi.nl/ds/webannotator";

    return {
        getDefaultBackend: function() {
            return default_backend;
        },
        getBackend: function() {
            // selected_state values: "" (empty value as long as Settings Dialog has not been opened) OR "WM_REST_DEFAULT" OR "WM_REST_UserDefined"
            // user-specified value for REST service
            var selected_state = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.url", "");
            if (selected_state === "WM_REST_UserDefined") {
                return nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.url_format", "");
            } else {
                return default_backend;
            }
        },
        getAnnotations: function(url, callback) {
            annotationProxy.log('calling the annotation backend ');
            
            //default get all
            var requestURL = this.getBackend() + '/api/annotations';
            if(url != '' || url === undefined){
                requestURL += '?link='+url;
            }
            
            $.ajax({
                type: "GET",
                url: this.getBackend() + '/api/annotations?link='+url,
                dataType: "xml",
                beforeSend: function(xhr){xhr.setRequestHeader('Content-Type', 'application/xml');},
                success: function(xml, textStatus, jqXHR) {
                    var annotations = Array();
                    
                    $xml = $.parseXML(jqXHR.responseText);
                    annotationProxy.log($xml);
                    
                    jQuery($xml).find('annotationInfo').each(function() {
                        annotationProxy.log(this);
                        annotationProxy.log(this.getAttribute('ref'));
                        
                        annotations.push(this.getAttribute('ref'));
                    });
                    
                    callback.call(undefined, annotations);
                },
                error: function(result){
                    annotationProxy.log('ERROR calling the annotation backend '+result);
                }
            });
        },
        logout : function(){
          $.ajax({
                type: "GET",
                url: this.getBackend() + '/api/authentication/logout',
                success: function(xml, textStatus, jqXHR) {},
                error: function(jqXHR, status, thrownError) {
                    alert('Logout failed. Status code: '+jqXHR.status);
                }
            });
        },
        getAnnotation: function(annotationURL, callback) {
            annotationProxy.log('getAnnotation '+annotationURL);
            $.ajax({
                type: "GET",
                url: annotationURL,
                dataType: "xml",
                success: function(xml, textStatus, jqXHR) {
                    $xml = $.parseXML(jqXHR.responseText);
                    annotationProxy.log('GOT annotation in getAnnotation :'+xml);    
                    annotationProxy.log(xml);
                    var om_object = annotation2om_object($xml);
                    annotationProxy.log('converted to om_object');
                    annotationProxy.log(om_object);
                    callback.call(undefined, om_object);
                },
                error: function(error) {
                    annotationProxy.log('ERROR in getAnnotation ');
                    annotationProxy.log(error);
                }
            });
        },
        getAnnotationXml: function(aid, callback) {
            annotationProxy.log('getAnnotationXml '+aid);
            $.ajax({
                type: "GET",
                url: this.getBackend() + '/api/annotations/' + aid,
                dataType: "xml",
                success: function(xml, textStatus, jqXHR) {
                    callback.call(undefined, jqXHR.responseText);
                },
                error: function(error) {
                    annotationProxy.log('ERROR in getAnnotation ');
                    annotationProxy.log(error);
                }
            });
        },        
        deleteAnnotationByOid: function(oid) {
            annotationProxy.log('entering DELETE for oid: '+oid);
            var aid = annotationProxy.getAidFromOid(oid);
            
            annotationProxy.log('Resolved the AID for oid: '+oid+' for aid: '+aid);
            if (aid) { // ajax request only for annotations posted to and available in backend database
                return $.ajax({
                    url: this.getBackend() + '/api/annotations/' + aid,
                    type: 'DELETE',
                    error: function(jqXHR, status, thrownError) {
                        // Log any errors to debug console
                        annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                        annotationProxy.log("Status Code (DELETE request): " + jqXHR.status);
                        annotationProxy.log("Error DELETE request: " + thrownError);
                    },
                    success: function(result) {            
                        annotationProxy.log("DELETE request was successful.");
                        annotationProxy.log(result);
                    }
                });
            }
        },
        postAnnotation: function(annotation, oid, callback) {
            $.ajax({
                type: "POST",
                url: this.getBackend() + '/api/annotations?store=true',
                dataType: "xml",
                data: annotation,
                contentType: "application/xml",
                error: function(jqXHR, status, thrownError) {
                    // Handle any errors
                    
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    annotationProxy.log("Status Code: " + jqXHR.status);
                    annotationProxy.log("Error : " + thrownError);
                    
                },
                complete: function(jqXHR, status, responseText) {
                    var response = jqXHR.responseText.match(/URI="(.+?)"/)[1].split('/');
                    var aid = response[response.length - 1];

                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    annotationProxy.log("Status Code POST annotation request: " + jqXHR.status);
                    annotationProxy.log("Response Body: " + jqXHR.responseText);
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");

                    annotationProxy.log("OID: " + oid);
                    annotationProxy.log("AID: " + aid);
                    // Firebug.Console.log(bitsObjectMng.Database.getObject({oid: oid}));

                    var aSql = 'UPDATE om_object SET dasish_aid = "' + aid + '" WHERE oid="' + oid + '"';
                    annotationProxy.log(aSql);
                    // insert request to local sqlite database where aid gets inserted
                    if(bitsObjectMng.Database._idExists('local', oid, true)){
                        var rtn = bitsObjectMng.Database.cmd('local', aSql); // aMode = "" defaults to predefined value; aSql contains sql statement
                        annotationProxy.log('UPDATE of AID done in local');
                    }else if(bitsObjectMng.Database._idExists('_uncategorized', oid, true)){
                         var rtn = bitsObjectMng.Database.cmd('_uncategorized', aSql); // aMode = "" defaults to predefined value; aSql contains sql statement
                         annotationProxy.log('UPDATE of AID done in _uncategorized');
                    }
                    
                    // Database insert request is true if successful
                    // Firebug.Console.log(rtn);
                    annotationProxy.log('called cache stuff');
                    callback.call(undefined, aid);  
                    
                }
            });
        },
        putAnnotation: function(aid, annotation) {
            return $.ajax({
                type: "PUT",
                url: this.getBackend() + '/api/annotations/'+aid+'/body',
                dataType: "xml",
                data: annotation,
                contentType: "application/xml",
                error: function(jqXHR, status, thrownError) {
                    // Handle any errors
                    
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    annotationProxy.log("Faild to PUT updated annotation: " + aid);
                    annotationProxy.log("Status Code: " + jqXHR.status);
                    annotationProxy.log("Error : " + thrownError);
                    
                },
                complete: function(jqXHR, status, responseText) {
                    var response = jqXHR.responseText.match(/URI="(.+?)"/)[1].split('/');
                    var aid = response[response.length - 1];

                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    annotationProxy.log("Status Code PUT request: " + jqXHR.status);
                    annotationProxy.log("Response Body: " + jqXHR.responseText);
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");

                }
            });
        },
        putFullAnnotation: function(aid, annotation) {
            return $.ajax({
                type: "PUT",
                url: this.getBackend() + '/api/annotations/'+aid,
                dataType: "xml",
                data: annotation,
                contentType: "application/xml",
                error: function(jqXHR, status, thrownError) {
                    // Handle any errors
                    
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    annotationProxy.log("Faild to PUT updated annotation: " + aid);
                    annotationProxy.log("Status Code: " + jqXHR.status);
                    annotationProxy.log("Error : " + thrownError);
                    
                },
                complete: function(jqXHR, status, responseText) {
                    var response = jqXHR.responseText.match(/URI="(.+?)"/)[1].split('/');
                    var aid = response[response.length - 1];

                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    annotationProxy.log("Status Code PUT request: " + jqXHR.status);
                    annotationProxy.log("Response Body: " + jqXHR.responseText);
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");

                }
            });
        },
        postCache: function(targetURL, cacheMetadata, cache, cacheMimeType){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                annotationProxy.log("Cache POST status for "+targetURL+": "+xhr.status);
                annotationProxy.log(xhr.statusText);
            };
            xhr.open("POST", targetURL, true);
            
            var boundary = '---------------------------'+Date.now();
            xhr.setRequestHeader("Content-Type","multipart/mixed; boundary="+boundary);
            
            //build the multipart body
            var postBody = '--'+boundary+'\n' +
                           'Content-Type:application/xml\n\n' +
                           cacheMetadata+'\n\n' +
                           '--'+boundary+'\n' +
                           'Content-Type:'+cacheMimeType+'\n\n' +
                           cache+'\n\n' +
                           '--'+boundary+'--';
            annotationProxy.log(postBody);       
            xhr.send(postBody);
        },
        getTargets : function(aid, callback){
            $.ajax({
                type: "GET",
                url: this.getBackend() + '/api/annotations/'+aid,
                dataType: "xml",
                success: function(xml, textStatus, jqXHR) {
                    var targets = Array();
                    
                    $xml = $.parseXML(jqXHR.responseText);
                    
                    jQuery($xml).find('targetInfo').each(function() {
                        annotationProxy.log(this);
                        annotationProxy.log(this.getAttribute('ref'));
                        
                        targets.push(this.getAttribute('ref'));
                    });
                    callback.call(undefined, targets);                
                }
            });         
        },
        getCacheURL: function (targetURL, callback){
            $.ajax({
                type: "GET",
                url: targetURL,
                dataType: "xml",
                success: function(xml, textStatus, jqXHR) {
                    $xml = $.parseXML(jqXHR.responseText);
                    
                    jQuery($xml).find('cached').each(function() {
                        var cacheURL = this.getAttribute('ref');
                        callback.call(undefined, cacheURL);
                    });
                    
                                 
                }
            });               
        },
        setBackend: function(url) {
            this.backend = url;
        }
    }
}());