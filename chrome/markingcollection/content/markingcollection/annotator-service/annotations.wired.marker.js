var annotationProxy = (function() {
    return {
        getAnnotations: function(url) {
           this.log('getAnnotations for: '+url);
           annotationFramework.getAnnotations({link:url,access:read}, function(result){
               this.log('annotations from backend: '+annotations);
               
               var annotations = $(result);
               
               var aids = [];
               
               annotations.find('annotations annotation').each(function() {
                        aids.push($(this).attr('ref').substr($(this).attr('ref').lastIndexOf('/') + 1));
               });
               //bitsObjectMng.Database.addObject
               
                //loop trough annnotations and get each annotation
               
           });
        },
        putAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            annotationFramework.putAnnotation(annotation);
            this.log('putAnnotation : '+annotation);
        },
        updateAnnotation: function(annotation) {
            this.log('updateAnnotation : '+JSON.stringify(annotation));
        },
        log: function(message){
            //log to console
            Firebug.Console.log(message);
            //log this to the local proxy
            $.ajax({
                type: "POST",
                url: 'http://localhost/annotations/annotator-service/test/proxy.php',
                data: {log:'true',message:message}
            });
        }
    }
}());