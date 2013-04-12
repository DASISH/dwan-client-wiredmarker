var annotationFramework = (function() {
    var backend = "http://pelle.ssd.gu.se:8080/exist/rest/db/annotation-framework/api/annotations.xql";
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