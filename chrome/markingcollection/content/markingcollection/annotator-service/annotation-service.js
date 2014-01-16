var annotationFramework = (function() {
    // default value for REST service
    var default_backend = "http://pelle.ssd.gu.se:8080/exist/rest/db/annotation-framework/api/annotations.xql";

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
        postAnnotation: function(annotation) {
            return $.ajax({
                type: "POST",
                url: this.getBackend() + '/api/annotations?store=true',
                dataType: "xml",
                data: annotation,
                contentType: "application/xml",
                complete: function(jqXHR, status, responseText) {
                    if (typeof Firebug !== 'undefined' && Firebug.Console) {
                        Firebug.Console.log("+ + + + + + + + + + + + + + + + + + + + + + + +");
                        Firebug.Console.log("Status Code: " + jqXHR.status);
                        Firebug.Console.log("Response Body: " + jqXHR.responseText);
                    }
                }
            });
        },
        setBackend: function(url) {
            this.backend = url;
        }
    }
}());