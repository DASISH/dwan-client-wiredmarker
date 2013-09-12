/*
 * @content Mocking retrieval of annotations
 * (see: https://trac.clarin.eu/wiki/DASISH/XSD%20and%20XML#RespondingGETapiannotationslinkhttp:en.wikipedia.orgwikiSagrada_FamC3ADliaaccessread;
 * Scenario - visiting an annotated web page: https://trac.clarin.eu/wiki/DASISH/Scenario)
 */

var url = '/api/annotations?link="http://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia"';

// Mock for Responding GET api/annotations?link="URI"
$.mockjax({
    /* url: A string or regular expression specifying the url of the request that the data should be mocked for. */
    // url: '/api/annotations?link="http://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia"&access=read',
    url: url,
    // url: '/api/annotations?link="http://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia"',
    /* type: Specify what HTTP method to match, usually GET or POST. Case-insensitive, so get and post also work. */
    type: 'GET',
    /* dataType: Allowed data formats are Text, HTML, JSON, Script and XML. */
    dataType: 'xml',
    /* responseTime: An integer that specifies a simulated network and server latency (in milliseconds). */
    responseTime: 750,
    /* proxy: A string specifying a path to a file, from which the contents will be returned for the request. */
    proxy: 'mocks/annotations-sagrada-GET.xml',
});

// Mock for Responding GET api/annotations/AID20130808114716 (annot-0001-GET.xml)
$.mockjax({
    url: '/api/annotations/AID20130808114716',
    type: 'GET',
    dataType: 'xml',
    responseTime: 750,
    proxy: 'mocks/annot-0001-GET.xml',
});

// Mock for Responding GET api/annotations/AID20130808124131 (annot-0002-GET.xml)
$.mockjax({
    url: '/api/annotations/AID20130808124131',
    type: 'GET',
    dataType: 'xml',
    responseTime: 750,
    proxy: 'mocks/annot-0002-GET.xml',
});

// Mock for Responding GET api/annotations/AID20130809151651 (annot-0003-GET.xml)
$.mockjax({
    url: '/api/annotations/AID20130809151651',
    type: 'GET',
    dataType: 'xml',
    responseTime: 750,
    proxy: 'mocks/annot-0003-GET.xml',
});

// Mock for Responding GET api/annotations/AID20130816145322 (annot-0004-GET.xml)
$.mockjax({
    url: '/api/annotations/AID20130816145322',
    type: 'GET',
    dataType: 'xml',
    responseTime: 750,
    proxy: 'mocks/annot-0004-GET.xml',
});

// Mock for Responding GET api/annotations/AID20130816170015 (annot-0005-GET.xml)
$.mockjax({
    url: '/api/annotations/AID20130816170015',
    type: 'GET',
    dataType: 'xml',
    responseTime: 750,
    proxy: 'mocks/annot-0005-GET.xml',
});

var XMLData = function() {
    return {
        getMockAnnotations: function(url) {
            $.ajax({
                url: url,
                dataType: 'xml',
                type: 'GET',
                success: function(xml, textStatus, jqXHR) {
                    // success: function(xml) {    
                    // can be used if parameters textStatus and jqXHR are not required within the following code block

                    $xml = $(xml);
                    
                    console.log('Data: ' + $xml);
                    console.log($xml);
                    console.log('Status: ' + textStatus);
                    console.log('XMLHttpRequest object: ' + jqXHR);
                    console.log(jqXHR);
                    
                    var aidArr = [];
                    var aid_string = "";
                    
                    $xml.find('annotations annotation').each(function() {
                        $aid_uri = $(this).attr('ref');
                        aidArr.push($aid_uri.substr($aid_uri.lastIndexOf('/')+1)); // http://dasish.eu/annotations/ is erased
                    });

                    console.log(aidArr);

                    for (var i in aidArr) {
                        aid_string += '<br />' + aidArr[i];
                        $('#xmlContents').html('<h4 style="margin-bottom: 0;">List of AIDs returned from REST service address<br />GET api/annotations?link="URI":</h4>' + aid_string);
                        url = "";
                        url = '/api/annotations/' + aidArr[i];
                        
                        $.ajax({
                            url: url,
                            dataType: 'xml',
                            type: 'GET',
                            success: function(xml) {
                                
                                $xml = $(xml);
   
                                var body = "";
                                var aid = "";
                                
                                $xml.find('annotation').each(function() {
                                    body = $(this).find('body').text();
                                    aid = $(this).attr('URI').substr($(this).attr('URI').lastIndexOf('/')+1);
  
                                    $('#xmlContents').append("<br /><br /><strong>Body content of " + aid + ":</strong><br /><em>" + body + "</em>");
                                    
                                    var om_object = annotation2om_object(this);
                                    $('#xmlContents').append("<br /><strong>converted to om_object:</strong><br/><textarea cols='130' rows='16'>"+unescape(JSON.stringify(om_object, null, '  '))+"</textarea>");
                                });   
                                
                            }
                        });

                    }

                }

            });
        }
    }
}();

XMLData.getMockAnnotations(url);