/***
 * 
 * @param {object} annotation annotation object from webservice
 * @returns {annotationToOmObject.om_object} an object for Wired Marker
 */
function annotation2om_object(annotation){
    var om_object = {
                        oid		:"",
                        doc_title	:"http://localhost/annotation/test/test-service.html",
                        doc_url         :"http://localhost/annotation/test/test-service.html",
                        con_url         :"http://localhost/annotation/test/test-service.html",
                        bgn_dom         :"",
                        end_dom         :"",
                        oid_title	:"http://localhost/annotation/test/test-service.html",
                        oid_property    :"<PROPERTY><HYPER_ANCHOR>http://localhost/annotation/test/test-service.html#hyperanchor1.3%3A%2Fhtml%5B1%5D%2Fbody%5B1%5D%2Fdiv%5B2%5D%2Fp%5B1%5D(0)(3)(Ane)%26%2Fhtml%5B1%5D%2Fbody%5B1%5D%2Fdiv%5B2%5D%2Fp%5B1%5D(45)(3)(ter)%26background-color%3A%20rgb(%2044%2C%20254%2C%20%2081)%3Bcolor%3Argb(0%2C0%2C0)%3B</HYPER_ANCHOR><NOTE>text om en författare</NOTE></PROPERTY>",
                        oid_mode	:"0",
                        oid_type	:"text",
                        oid_txt         :"An example text about Douglas Adams; a writer",
                        oid_img         :null,
                        oid_date        :""
                    };
    
    om_object.oid = hashCode(annotation['xml:id']);
    console.log(annotation.targetSources.targetSource);
    om_object.oid_property = "<PROPERTY><HYPER_ANCHOR>"+annotation.targetSources.targetSource.id+"</HYPER_ANCHOR><NOTE>"+annotation.body+"</NOTE></PROPERTY>";
    
    if(annotation.type.toLowerCase() === 'note'){
        om_object.oid_txt = annotation.body;
        om_object.oid_type = 'text';
    }
    var d = new Date(annotation.timeStamp);
    om_object.oid_date = (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
    
    return om_object;
}

function om_object2annotation(om_object){
    var note = om_object.oid_property.match(/<NOTE>(.+?)<\/NOTE>/)[1];
    var d = new Date(om_object.oid_date);
    
    var annotation = '<?xml version="1.0"?>\n\
                      <annotation xmlns="http://dasish.eu/ns/addit" timeStamp="'+d.toISOString()+'">\n\
                        <body type="Note">'+note+'</body>\n\
                      </annotation>';
    return annotation;
}

function hashCode(str){
      var hash = 0;
      if (str.length == 0) return hash;
      for (i = 0; i < str.length; i++) {
          char = str.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
}

function createXpointer(url, bgn_dom, end_dom){
    
}

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        function pad(n) { return n < 10 ? '0' + n : n }
        return this.getUTCFullYear() + '-'
            + pad(this.getUTCMonth() + 1) + '-'
            + pad(this.getUTCDate()) + 'T'
            + pad(this.getUTCHours()) + ':'
            + pad(this.getUTCMinutes()) + ':'
            + pad(this.getUTCSeconds()) + 'Z';
    };
}

/*
From SQL-lite for wired-marker
<PROPERTY>
<HYPER_ANCHOR>http://localhost/annotation/test/test-service.html#hyperanchor1.3%3A%2Fhtml%5B1%5D%2Fbody%5B1%5D%2Fdiv%5B2%5D%2Fp%5B1%5D(0)(3)(Ane)%26%2Fhtml%5B1%5D%2Fbody%5B1%5D%2Fdiv%5B2%5D%2Fp%5B1%5D(45)(3)(ter)%26background-color%3A%20rgb(%2044%2C%20254%2C%20%2081)%3Bcolor%3Argb(0%2C0%2C0)%3B</HYPER_ANCHOR>
<NOTE>text om en f�rfattare</NOTE>
</PROPERTY>
unescaped: http://localhost/annotation/test/test-service.html#hyperanchor1.3:/html[1]/body[1]/div[2]/p[1](0)(3)(Ane)&/html[1]/body[1]/div[2]/p[1](45)(3)(ter)&background-color: rgb( 44, 254, 81);color:rgb(0,0,0);text om en f�rfattare
*/
