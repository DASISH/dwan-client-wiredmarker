<?php
  //simple local proxy script for testing remote-service
  $params = '';

  foreach($_GET as $key=>$value){
    if($key != 'url'){
      $params .= $key.'='.$value.'&';
    }
  }

  $response = file_get_contents($_GET['url'].'?'.$params);

  header( 'Content-type: text/xml');
  print $response;
?>