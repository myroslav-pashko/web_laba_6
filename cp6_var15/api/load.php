<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$path = __DIR__ . "/../data/glitch.json";
if (!file_exists($path)) {
  echo json_encode(["version" => null, "items" => []], JSON_UNESCAPED_UNICODE);
  exit;
}

$raw = file_get_contents($path);
if ($raw === false) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to read file"]);
  exit;
}

echo $raw;
