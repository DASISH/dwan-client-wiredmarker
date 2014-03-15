var annotationProxy = (function() {
    return {
        /***
         * Get current user info
         * @returns {undefined} false if user in not loged in. user object if loged in
         */
        getLoggedInInfo: function(){
            var user_placeholder = {
                URI: 'https://lux17.mpi.nl/ds/webannotator/api/users/00000000-0000-0000-0000-0000000009999',
                uid : '00000000-0000-0000-0000-0000000009999',
                dislayName: 'Test Testsson',
                eMail: 'test@test.com'
            };
            
            return user_placeholder;
        },
        getAnnotations: function(url) {
            annotationProxy.log('getAnnotations for: ' + url);

            annotationFramework.getAnnotations(url, 
                function(annotations){
                    annotationProxy.log('got annotations ');
                    annotationProxy.log(annotations);
                    
                    $.each(annotations, function(index, annotationURL){
                       annotationFramework.getAnnotation(annotationURL, function(result){
                           annotationProxy.log('got Annotation ');
                           annotationProxy.log(result);
                           
                           if(bitsObjectMng.Database._dasish_aid_exists('_uncategorized', result.dasish_aid, true)){
                               annotationProxy.log('AID already in database : ' + result.dasish_aid);
                           }else{
                                bitsObjectMng.Database.addObject(result, 'dasish.remote', undefined);  
                           }
                           
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
        postAnnotation: function(om_object) {
            var annotation = om_object2annotation(om_object);
            annotationFramework.postAnnotation(annotation, om_object.oid);
            this.log('postAnnotation : ' + annotation);
        },
        updateAnnotation: function(om_object) {
            var aid = this.getAidFromOid(om_object.oid);
            this.log('updateAnnotation : ' + JSON.stringify(om_object));
            this.log('UPDATED ANNOTATION AS XML (aid: '+aid+')');
            var xml = om_object_annotation_body(om_object);
            
            this.log(xml);
            
            annotationFramework.putAnnotation(aid, xml);
        },
        getAidFromOid: function(oid){
            var aSql = 'SELECT dasish_aid FROM om_object WHERE oid="' + oid + '"';
            var rtn = bitsObjectMng.Database.selectB("", aSql); // aMode = "" defaults to predefined value; aSql contains sql statement
            
            return rtn[0].dasish_aid;
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