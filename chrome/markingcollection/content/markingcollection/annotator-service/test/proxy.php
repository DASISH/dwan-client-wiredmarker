<?php
  //simple local proxy script for testing remote-service
  $params = '';

  foreach($_GET as $key=>$value){
    if($key != 'url'){
      $params .= $key.'='.$value.'&';
    }
  }
  
  if($_REQUEST['log']){
      file_put_contents('log.txt', date("c")."\t".$_REQUEST['message']."\n",  FILE_APPEND);
  }

  $response = file_get_contents($_GET['url'].'?'.$params);

  header( 'Content-type: text/xml');
  print $response;
?>