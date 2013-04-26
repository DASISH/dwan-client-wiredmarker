var annotationProxy = (function() {
    return {
        getAnnotations: function(url) {
           this.log('getAnnotations for: '+url);
           annotationFramework.getAnnotations({url:url}, function(annotations){
               this.log('annotations from backend: '+JSON.stringify(annotations));
           });
        },
        putAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            this.log('putAnnotation : '+annotation);
        },
        updateAnnotation: function(annotation) {
            this.log('updateAnnotation : '+JSON.stringify(annotation));
        },
        log: function(message){
            //log this to the local proxy
            $.ajax({
                type: "POST",
                url: 'http://localhost/annotations/annotator-service/test/proxy.php',
                data: {log:'true',message:message}
            });
        }
    }
}());