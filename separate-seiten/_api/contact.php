<?php 

$data = [
  "test" => "success"
];
header('Content-type:application/json;charset=utf-8');
echo json_encode($data);