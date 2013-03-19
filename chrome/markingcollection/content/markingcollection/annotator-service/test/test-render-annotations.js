/*Holds test-renders for listing results from backend
 * 
 * 
 */

function listAnnotations(annotations){
    $.each(annotations, function(i, annotation){
        annotation.om_object = annotation2om_object(annotation);
        
        var output = '';
        $.each( annotation, function( key, value ) {
            if(key === 'om_object'){
                output += '<strong>om_object</strong><br/>';
                output += '<table>';
                
                $.each( value, function( k, v ) {
                    if(k === 'oid_property'){
                        output += '<tr><td>'+k+'</td><td><textarea cols="70" rows="4">'+v+'</textarea></td></tr>';
                    }else{
                        output += '<tr><td>'+k+'</td><td>'+v+'</td></tr>';
                    }
                });
                output += '</table>';
            }else{
                output += '<span>'+key+': '+value+'</span><br/>';
            }
        });
        
        $("#annotations").append(
                '<li>'+
                    '<strong>'+annotation.body.text+'</strong><br/>'+
                    output+
                '</li>'
        );
    });
}