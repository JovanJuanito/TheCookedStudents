<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET");

$file = "userLogin.json";

/* Read incoming JSON */
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["username"]) || trim($input["username"]) === "") {
    echo json_encode(["error" => "Username required"]);
    exit;
}

$username = htmlspecialchars(trim($input["username"]));
$time = date("c");

/* Load existing data */
$data = [];
if (file_exists($file)) {
    $data = json_decode(file_get_contents($file), true) ?? [];
}

/* Save new user */
$data[] = [
    "username" => $username,
    "time" => $time
];

/* Write back to JSON */
file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
