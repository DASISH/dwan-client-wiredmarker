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
        getAnnotation: function(annotationURL, callback) {
            annotationProxy.log('getAnnotation '+annotationURL);
            $.ajax({
                type: "GET",
                url: annotationURL,
                dataType: "xml",
                success: function(xml, textStatus, jqXHR) {
                    $xml = $.parseXML(jqXHR.responseText);
                    annotationProxy.log('GOT annotation in getAnnotation ');    
                    annotationProxy.log($xml);
                    var om_object = annotation2om_object($xml);
                    
                    callback.call(undefined, om_object);
                },
                error: function(error) {
                    annotationProxy.log('ERROR in getAnnotation ');
                    annotationProxy.log(error);
                }
            });
        },
        deleteAnnotationByOid: function(oid) {
            annotationProxy.log('entering DELETE for oid: '+oid);
            var aid;
            var aSql = 'select dasish_aid from om_object where oid="' + oid + '"';
            var rtn = bitsObjectMng.Database.selectB("", aSql); // aMode = "" defaults to predefined value; aSql contains sql statement
            
            aid = rtn[0].dasish_aid;
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
        postAnnotation: function(annotation, oid) {
            return $.ajax({
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
                    annotationProxy.log("Status Code POST request: " + jqXHR.status);
                    annotationProxy.log("Response Body: " + jqXHR.responseText);
                    annotationProxy.log("+ + + + + + + + + + + + + + + + + + + + + + + +");

                    annotationProxy.log("OID: " + oid);
                    annotationProxy.log("AID: " + aid);
                    // Firebug.Console.log(bitsObjectMng.Database.getObject({oid: oid}));

                    var aSql = 'update om_object set dasish_aid = "' + aid + '" where oid="' + oid + '"';
                    annotationProxy.log(aSql);
                    // insert request to local sqlite database where aid gets inserted
                    var rtn = bitsObjectMng.Database.cmd("", aSql); // aMode = "" defaults to predefined value; aSql contains sql statement
                    annotationProxy.log('UPDATE of AID done');
                    annotationProxy.log(rtn);
                    // Database insert request is true if successful
                    // Firebug.Console.log(rtn);
                }
            });
        },
        setBackend: function(url) {
            this.backend = url;
        }
    }
}());