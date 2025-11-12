<?php
// api/genai.php
header('Content-Type: application/json; charset=utf-8');
// Basic CORS support (adjust origins for security)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['prompt'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing "prompt" in JSON body.']);
  exit;
}

$prompt = $input['prompt'];

// Build the request payload — adjust structure to match the Google GenAI API shape you use
$payload = [
  'prompt' => ['text' => $prompt],
  'maxOutputTokens' => 256
];
$payload_json = json_encode($payload);

// Use cURL to forward the request to the GenAI endpoint
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $GOOGLE_GENAI_ENDPOINT);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload_json);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  // Prefer Authorization header if you set GOOGLE_API_KEY as a Bearer token.
  // If using API key query param, ensure $GOOGLE_GENAI_ENDPOINT already contains ?key=YOUR_KEY
  'Authorization: Bearer ' . $GOOGLE_API_KEY
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($response === false) {
  $err = curl_error($ch);
  curl_close($ch);
  http_response_code(502);
  echo json_encode(['error' => 'cURL error: ' . $err]);
  exit;
}
curl_close($ch);

// Forward the upstream status code and body
http_response_code($http_code);
echo $response;
?>