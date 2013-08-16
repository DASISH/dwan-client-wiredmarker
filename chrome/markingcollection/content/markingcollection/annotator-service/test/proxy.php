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
  
  if($_GET['store']){
      $postdata = file_get_contents("php://input");
      file_put_contents('log.txt', date("c")."\tstore in: ".date('Y-m-d_H.i.s').".xml\n",  FILE_APPEND);
      file_put_contents(date('Y-m-d_H.i.s').'.xml', $postdata);
  }

  $response = file_get_contents($_GET['url'].'?'.$params);

  header( 'Content-type: text/xml');
  print $response;
?>