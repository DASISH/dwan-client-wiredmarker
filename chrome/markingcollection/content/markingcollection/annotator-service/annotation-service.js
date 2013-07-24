var annotationFramework = (function() {
    // default value for REST service
    var backend = "http://pelle.ssd.gu.se:8080/exist/rest/db/annotation-framework/api/annotations.xql";
    var selected_state = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.url","");
    // selected_state values: "" (empty value as long as Settings Dialog has not been opened) OR "WM_REST_DEFAULT" OR "WM_REST_UserDefined"
    // user-specified value for REST service
    if (selected_state === "WM_REST_UserDefined") {
        var backend = nsPreferences.copyUnicharPref("wiredmarker.marker.initdata.url_format","");
    }
    // alert("The following backend is used: " + backend);
    // TODO: The above code is executed only when restarting the application (or when a new window is opened),
    // however the settings will be changed without calling for a restart (or opening a new window).
    // Solution to get the correct backend URL at any time?
    
    return {
        getAnnotations: function(params, callback) {
            $.ajax({
                type: "GET",
                url: this.backend,
                data:params,
                dataType: "xml",
                success: function(xml) {
                    var annotations = Array();

                    $xml = $(xml);
                    $xml.find('annotation').each(function(){              
                        var annotation = $.xml2json(this);
                        //annotation.type = $(this).find('body').attr('type');
                        //annotation.URI = unescape(annotation.URI);
                        annotations.push(annotation);
                    });

                    callback.call(undefined, annotations);
                }
            });
        },
        putAnnotation: function() {
            $.ajax({
                type: "POST",
                url: this.backend,
                dataType: "xml"
            });
        },
        setBackend:function(url) {this.backend = url;}
    }
}());