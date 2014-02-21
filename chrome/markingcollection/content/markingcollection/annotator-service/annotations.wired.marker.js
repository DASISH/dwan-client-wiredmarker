var annotationProxy = (function() {
    return {
        getAnnotations: function(url) {
            annotationProxy.log('getAnnotations for: ' + url);


            annotationFramework.getAnnotations(url, 
                function(annotations){
                    annotationProxy.log('got annotations ');
                    Firebug.Console.log(annotations);
                    
                    $.each(annotations, function(index, annotationURL){
                       annotationFramework.getAnnotation(annotationURL, function(result){
                           annotationProxy.log('got Annotation ');
                           annotationProxy.log(result);
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
        insertTestAnnotation: function(){
             //temp annotation for testing insert via bitsObjectMng.Database.addObject() 
            var tmp = {
                "oid": 1320227156,
                "pfid": "0",
                "doc_title": "Svensk nationell datatjänst | Svensk Nationell Datatjänst",
                "doc_url": "http://snd.gu.se/",
                "con_url": "http://snd.gu.se/",
                "bgn_dom": "//div[@id=\"node-170\"]/div[1]/div[1]/div[1]/div[1]/p[1](34)(3)",
                "end_dom": "//div[@id=\"node-170\"]/div[1]/div[1]/div[1]/div[1]/p[1](54)(3)",
                "oid_title": "Test test test",
                "oid_property": "<PROPERTY><HYPER_ANCHOR>http://snd.gu.se/#hyperanchor1.3%3A%2F%2Fdiv%5B%40id%3D%26quot%3Bnode-170%26quot%3B%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fp%5B1%5D(34)(3)%26%2F%2Fdiv%5B%40id%3D%26quot%3Bnode-170%26quot%3B%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fp%5B1%5D(54)(3)%26border%3Athin%20dotted%20rgb(255%2C204%2C0)%3Bbackground-color%3Argb(255%2C255%2C204)%3Bcolor%3Argb(0%2C0%2C0)%3B</HYPER_ANCHOR><NOTE>SND is a service organization</NOTE></PROPERTY>",
                "oid_mode": "0",
                "oid_type": "text",
                "oid_txt": "serviceorganisation", //must be the marked text!
                "oid_img": null,
                "oid_date": "2013/9/20 11:0:22",
                "pfid_order": 4
              };
            
            //fungerar
            var tmp2 = {
                "oid": "20130920171330",
                "pfid": "0",
                "doc_title": "Svensk nationell datatjänst | Svensk Nationell Datatjänst",
                "doc_url": "http://snd.gu.se/",
                "con_url": "http://snd.gu.se/",
                "bgn_dom": "//div[@id=\"node-170\"]/div[1]/div[1]/div[1]/div[1]/p[1](0)(3)",
                "end_dom": "//div[@id=\"node-170\"]/div[1]/div[1]/div[1]/div[1]/p[1](7)(3)",
                "oid_title": "test testar",
                "oid_property": "<PROPERTY><HYPER_ANCHOR>http://snd.gu.se/#hyperanchor1.3%3A%2F%2Fdiv%5B%40id%3D%26quot%3Bnode-170%26quot%3B%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fp%5B1%5D(0)(3)(Sve)%26%2F%2Fdiv%5B%40id%3D%26quot%3Bnode-170%26quot%3B%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Fp%5B1%5D(7)(3)(nsk)%26border%3Athin%20dotted%20rgb(255%2C204%2C0)%3Bbackground-color%3Argb(255%2C255%2C204)%3Bcolor%3Argb(0%2C0%2C0)%3B</HYPER_ANCHOR><NOTE>testing</NOTE></PROPERTY>",
                "oid_mode": "0",
                "oid_type": "text",
                "oid_txt": "Svensk",
                "oid_img": null,
                "oid_date": "09/20/2013 17:13:21",
                "pfid_order": 8
              };
              
            //insert test via bitsObjectMng (works but the annotation does not show :-( )   
            bitsObjectMng.Database.addObject(tmp, 'dasish.remote', undefined);           
        },
        postAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            annotationFramework.postAnnotation(annotation, om_object.oid);
            this.log('postAnnotation : ' + annotation);
        },
        updateAnnotation: function(annotation) {
            this.log('updateAnnotation : ' + JSON.stringify(annotation));
        },
        log: function(message) {
            //log to console
            if (typeof Firebug!='undefined' && Firebug.Console) {
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