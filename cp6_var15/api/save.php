<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents("php://input");
if ($raw === false || trim($raw) === "") {
  http_response_code(400);
  echo json_encode(["error" => "Empty body"]);
  exit;
}

$data = json_decode($raw, true);
if (!is_array($data) || !isset($data["items"]) || !is_array($data["items"])) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON structure"]);
  exit;
}

// Мінімальна валідація/нормалізація
$items = [];
foreach ($data["items"] as $it) {
  if (!is_array($it)) continue;

  $text  = substr((string)($it["text"] ?? ""), 0, 120);
  $pad   = (int)($it["pad"] ?? 12);
  $dur   = (int)($it["dur"] ?? 1500);
  $shift = (int)($it["shift"] ?? 2);

  $bg = (string)($it["bg"] ?? "#0b0b0f");
  $fg = (string)($it["fg"] ?? "#ffffff");
  $c1 = (string)($it["c1"] ?? "#ff3b8d");
  $c2 = (string)($it["c2"] ?? "#31d0ff");

  $items[] = [
    "text" => $text === "" ? "GLITCH" : $text,
    "pad" => max(0, min(60, $pad)),
    "bg" => $bg,
    "fg" => $fg,
    "c1" => $c1,
    "c2" => $c2,
    "dur" => max(100, min(10000, $dur)),
    "shift" => max(0, min(20, $shift))
  ];
}

$payload = [
  "version" => time(), // простий version marker
  "items" => $items
];

$path = __DIR__ . "/../data/glitch.json";
if (!is_dir(dirname($path))) {
  mkdir(dirname($path), 0777, true);
}

$ok = file_put_contents($path, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
if ($ok === false) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to write file"]);
  exit;
}

echo json_encode(["ok" => true, "version" => $payload["version"]], JSON_UNESCAPED_UNICODE);
