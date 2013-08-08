/*
 * @content Mocking retrieval of annotations
 * (see: https://trac.clarin.eu/wiki/DASISH/XSD%20and%20XML#RespondingGETapiannotationslinkhttp:en.wikipedia.orgwikiSagrada_FamC3ADliaaccessread;
 * Scenario - visiting an annotated web page: https://trac.clarin.eu/wiki/DASISH/Scenario)
 */

var url = '/api/annotations?link="http://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia"';

$.mockjax({
    /* url: A string or regular expression specifying the url of the request that the data should be mocked for. */
    // url: '/api/annotations?link="http://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia"&access=read',
    url: url,
    /* type: Specify what HTTP method to match, usually GET or POST. Case-insensitive, so get and post also work. */
    type: 'GET',
    /* dataType: Allowed data formats are Text, HTML, JSON, Script and XML. */
    dataType: 'xml',
    /* responseTime: An integer that specifies a simulated network and server latency (in milliseconds). */
    responseTime: 750,
    /* proxy: A string specifying a path to a file, from which the contents will be returned for the request. */
    proxy: 'mocks/annotations-sagrada-GET.xml'
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
                        aidArr.push($(this).attr('ref').substr(29)); // http://dasish.eu/annotations/ is erased
                    });
  
                    console.log(aidArr);
                    
                    for(var i in aidArr) {
                        aid_string += '<br />' + aidArr[i];
                        $('#xmlContents').html('<h4 style="margin-bottom: 0;">List of AIDs returned from REST service address<br />GET api/annotations?link="URI":</h4>' + aid_string);
                    }
                    
                }
            });
        }
    }
}();

XMLData.getMockAnnotations(url);