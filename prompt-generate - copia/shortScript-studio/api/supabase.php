<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$SUPABASE_URL = 'https://rvgaozmexpocgxtlomkh.supabase.co';
$SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2Fvem1leHBvY2d4dGxvbWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzMzOTIsImV4cCI6MjA4NzY0OTM5Mn0.SPssPQGYL541QpD7GZv6WHzCSMzmXAFGYHJRsfjfWmQ';

$action = $_REQUEST['action'] ?? $_GET['action'] ?? '';

if (!$action) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
}

if (!$action) {
    echo json_encode(['error' => 'Sin acción']);
    exit;
}

function supabaseRequest($endpoint, $method = 'GET', $body = null) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $ch = curl_init();
    $url = "$SUPABASE_URL/rest/v1/$endpoint";
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_KEY",
        "Authorization: Bearer $SUPABASE_KEY",
        "Content-Type: application/json",
        "Prefer: return=representation"
    ]);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'data' => json_decode($response, true)];
}

switch ($action) {
    case 'get_prompts':
        $result = supabaseRequest('community_prompts?select=*&order=created_at.desc&limit=20', 'GET');
        echo json_encode($result['data']);
        break;
        
    case 'save_prompt':
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest('community_prompts', 'POST', [
            'name' => $input['name'],
            'niche' => $input['niche'],
            'prompt' => $input['prompt'],
            'created_at' => date('c')
        ]);
        echo json_encode($result['data']);
        break;
        
    case 'save_script':
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest('shared_scripts', 'POST', [
            'topic' => $input['topic'],
            'script' => $input['script'],
            'created_at' => date('c')
        ]);
        echo json_encode($result['data']);
        break;
        
    default:
        echo json_encode(['error' => 'Acción no válida: ' . $action]);
}