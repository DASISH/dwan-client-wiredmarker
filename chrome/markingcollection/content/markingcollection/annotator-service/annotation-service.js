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
        getAnnotations: function(params, callback) {
            $.ajax({
                type: "GET",
                url: this.getBackend() + '/annotations',
                data: params,
                dataType: "xml",
                success: function(xml) {
                    var annotations = Array();

                    $xml = $(xml);
                    $xml.find('annotation').each(function() {
                        var annotation = $.xml2json(this);

                        annotations.push(annotation);
                    });

                    callback.call(undefined, annotations);
                }
            });
        },
        getAnnotation: function(aid, callback) {
            $.ajax({
                type: "GET",
                url: this.getBackend() + '/' + aid,
                dataType: "xml",
                success: function(xml) {
                    var annotation = $xml.find('annotation');

                    callback.call(undefined, annotation);
                }
            });
        },
        deleteAnnotationByOid: function(oid) {
            var aid;
            var aSql = 'select dasish_aid from om_object where oid="' + oid + '"';
            var rtn = bitsObjectMng.Database.selectB("", aSql); // aMode = "" defaults to predefined value; aSql contains sql statement

            aid = rtn[0].dasish_aid;

            if (aid) { // ajax request only for annotations posted to and available in backend database
                return $.ajax({
                    url: this.getBackend() + '/api/annotations/' + aid,
                    type: 'DELETE',
                    error: function(jqXHR, status, thrownError) {
                        // Handle any errors
                        if (typeof Firebug !== 'undefined' && Firebug.Console) {
                            Firebug.Console.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                            Firebug.Console.log("Status Code (DELETE request): " + jqXHR.status);
                            Firebug.Console.log("Error DELETE request: " + thrownError);
                        }
                    },
                    success: function(result) {
                        if (typeof Firebug !== 'undefined' && Firebug.Console) {
                            Firebug.Console.log("DELETE request was successful.");
                            Firebug.Console.log(result);
                        }
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
                    if (typeof Firebug !== 'undefined' && Firebug.Console) {
                        Firebug.Console.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                        Firebug.Console.log("Status Code: " + jqXHR.status);
                        Firebug.Console.log("Error : " + thrownError);
                    }
                },
                complete: function(jqXHR, status, responseText) {
                    var response = jqXHR.responseText.match(/URI="(.+?)"/)[1].split('/');
                    var aid = response[response.length - 1];

                    if (typeof Firebug !== 'undefined' && Firebug.Console) {
                        Firebug.Console.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                        Firebug.Console.log("Status Code POST request: " + jqXHR.status);
                        Firebug.Console.log("Response Body: " + jqXHR.responseText);
                        Firebug.Console.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                    }
                    // Firebug.Console.log("OID: " + oid);
                    // Firebug.Console.log("AID: " + aid);
                    // Firebug.Console.log(bitsObjectMng.Database.getObject({oid: oid}));

                    var aSql = 'update om_object set dasish_aid = "' + aid + '" where oid="' + oid + '"';
                    // insert request to local sqlite database where aid gets inserted
                    rtn = bitsObjectMng.Database.cmd("", aSql); // aMode = "" defaults to predefined value; aSql contains sql statement

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