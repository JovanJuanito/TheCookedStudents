<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET");

$file = "score.json";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["username"]) || !isset($data["score"])) {
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$username = htmlspecialchars($data["username"]);
$score = floatval($data["score"]);
$type = $data["type"] ?? "Unknown";
$time = date("c");

$scores = [];
if (file_exists($file)) {
    $scores = json_decode(file_get_contents($file), true) ?? [];
}

$scores[] = [
    "username" => $username,
    "score" => $score,
    "type" => $type,
    "time" => $time
];

file_put_contents($file, json_encode($scores, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
