/***
 * 
 * @param {object} annotation annotation object from webservice
 * @returns {annotationToOmObject.om_object} an object for Wired Marker
 */
function annotation2om_object(annotation){
    var om_object = {
                        oid		:"",
                        pfid            :"0",
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
                        oid_date        :"",
                        pfid_order: 4
                    };
    
    //example anchor:
    // http://snd.gu.se/#hyperanchor1.3://div[@id="node-170"]/div[1]/div[1]/div[1]/div[1]/p[1](294)(3)(sse)&
    // //div[@id="node-170"]/div[1]/div[1]/div[1]/div[1]/p[1](365)(3)(kav)&
    // border:thin dotted rgb(255,204,0);background-color:rgb(255,255,204);color:rgb(0,0,0); 
    
    var title = $(annotation).find('headline').text().trim();
    var body = $(annotation).find('body').text().trim();
    var style = $(annotation).find('body').find('xhtml\\:span').attr('style');
    var type = $(annotation).find('body').attr('type').toLowerCase();
    var link = $(annotation).find('link').text();
    var time = $(annotation).attr('timeStamp');
           
    var urlParts = link.split("#xpointer"); 
    
    om_object.doc_url = urlParts[0];
    om_object.con_url = urlParts[0];
    var xpointer = urlParts[1];
    
    //start dom
    xpointer.match(/start-point\(string-range\((.+?)\)\)\/range-to\(/);
    var parts = RegExp.$1.split(',');
    om_object.bgn_dom = parts[0]+'('+parts[2]+')(3)';
    
    //end dom
    xpointer.match(/range-to\(string-range\((.+?)\)\)\)/);
    var parts = RegExp.$1.split(',');
    om_object.end_dom = parts[0]+'('+parts[2]+')(3)';
    
    //build hyperanchor
    var hyperanchor = '#hyperanchor1.3:'+om_object.bgn_dom+'&'+om_object.end_dom+'&'+style;
    
    om_object.doc_title = title;
    
    om_object.oid = hashCode($(annotation).attr('URI'));
    if(om_object.oid < 0){
        om_object.oid = om_object.oid * -1;
    }
    console.log(link);
    om_object.oid_property = "<PROPERTY><HYPER_ANCHOR>"+encodeURI(om_object.doc_url+hyperanchor)+"</HYPER_ANCHOR><NOTE>"+body+"</NOTE></PROPERTY>";
    
    if(type === 'note'){
        om_object.oid_txt = body;
        om_object.oid_type = 'text';
    }
    var d = new Date(time);
    om_object.oid_date = (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
    
    return om_object;
}

/**
 * converts wired marker annotations to dassish annotations
 * @param {object} om_object contains wired marker object for annotation
 * @returns {String} annotation in xml
 */
function om_object2annotation(om_object){
    var note = om_object.oid_property.match(/<NOTE>(.+?)<\/NOTE>/)[1];
    var hyperanchor = om_object.oid_property.match(/<HYPER_ANCHOR>(.+?)<\/HYPER_ANCHOR>/)[1];
    var style='';
    var timestamp = new Date(om_object.oid_date);
    
    hyperanchor = unescape(hyperanchor);
    
    hyperanchor.match(/^(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))&(.+\([0-9]+\)\([0-9]+\)\([\s\S]*\))&(.+)$/);
    
    style = RegExp.$3;
    
    var path = {};
    
    om_object.bgn_dom.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
    path.start = RegExp.$1;
    path.startOffset = RegExp.$2;
    path.startType = RegExp.$3;

    om_object.end_dom.match(/(.+)\(([0-9]+)\)\(([0-9]+)\)/);
    path.end = RegExp.$1;
    path.endOffset = RegExp.$2;
    path.endType = RegExp.$3;
    
    var xpointer = '';
    
    xpointer += "#xpointer(start-point(string-range("+path.start+"/text()[1],'',"+path.startOffset+"))";
    xpointer += "/range-to(string-range("+path.end+"/text()[1],'',"+path.endOffset+")))";
    
    var annotation = '<?xml version="1.0" encoding="UTF-8"?>\n\
                      <annotation xmlns="http://www.dasish.eu/ns/addit"\n\
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\
                            xmlns:xhtml="http://www.w3.org/1999/xhtml"\n\
                            xsi:schemaLocation="http://www.dasish.eu/ns/addit http://dasish.eu/DASISH-schema.xsd"\n\
                            URI="tempAID'+om_object.oid+'"\n\
                            timeStamp="'+timestamp.toISOString()+'">\n\
                        <owner ref="http://dasish.eu/users/UIxyz/how_will_this_be_sent_from_the_client"/>\n\
                        <headline>'+om_object.oid_title+'</headline>\n\
                        <body type="Note" ref="tmp'+om_object.oid+'">\n\
                            <xhtml:span style="'+style+'">'+note+'</xhtml:span>\n\
                        </body>\n\
                        <targetSources>\n\
                            <target>\n\
                                <newSource xml:id="tmp'+om_object.oid+'">\n\
                                    <link>'+om_object.doc_url+xpointer+'</link>\n\
                                    <version>'+timestamp.toISOString()+'</version>\n\
                                </newSource>\n\
                            </target>\n\
                        </targetSources>\n\
                        <permissions ref="tmpPermissionsListID'+om_object.oid+'"/>\n\
                      </annotation>';
    return annotation;
}

function hashCode(str){
      var hash = 0;
      if (str == undefined || str.length == 0) return hash;
      for (i = 0; i < str.length; i++) {
          char = str.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
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
