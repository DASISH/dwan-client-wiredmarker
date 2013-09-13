var annotationProxy = (function() {
    return {
        getAnnotations: function(url) {
            annotationProxy.log('getAnnotations for: ' + url);

            var tmp = {
                oid: "193205378",
                pdif: "4",
                doc_title: "Background - Sagrada Família - Wikipedia, the free encyclopedia",
                doc_url: "http://en.wikipedia.org/wiki/Sagrada_FamÃ­lia",
                con_url: "http://en.wikipedia.org/wiki/Sagrada_FamÃ­lia",
                bgn_dom: "//span[@id=\"Background\"]/text()[1](0)(3)",
                end_dom: "//span[@id=\"Background\"]/text()[1](10)(3)",
                oid_title: "http://localhost/annotation/test/test-service.html",
                oid_property: "<PROPERTY><HYPER_ANCHOR>http://en.wikipedia.org/wiki/Sagrada_FamÃ­lia#hyperanchor1.3://span[@id=\"Background\"]/text()[1](0)(3)&//span[@id=\"Background\"]/text()[1](10)(3)&background-color:rgb(0,0,153);color:rgb(255,255,255);border: thick solid rgb(0, 0, 153);</HYPER_ANCHOR><NOTE>Some background information on Sagrada Família.</NOTE></PROPERTY>",
                oid_mode: "0",
                oid_type: "text",
                oid_txt: "Some background information on Sagrada Família.",
                oid_img: null,
                oid_date: "8/8/2013 11:46:6",
                pfid_order: 4
            };
            

            //if (bitsObjectMng.Database.existsObject(tmp, undefined)) {
            //    this.log("annotationProxy annotation exists in the database");
            //} else {
            //    this.log("annotationProxy inserting annotation in the database");
                //bitsObjectMng.Database.addObject(tmp, undefined, undefined);
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
        putAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            annotationFramework.putAnnotation(annotation);
            this.log('putAnnotation : ' + annotation);
        },
        updateAnnotation: function(annotation) {
            this.log('updateAnnotation : ' + JSON.stringify(annotation));
        },
        log: function(message) {
            //log to console
            if (Firebug.Console) {
                Firebug.Console.log(message);
            }
            //log this to the local proxy
            $.ajax({
                type: "POST",
                url: 'http://localhost/annotations/annotator-service/test/proxy.php',
                data: {log: 'true', message: message}
            });
        }
    }
}());