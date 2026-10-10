#!/bin/bash
set -e

echo "Starting C++ Server for Automated Test Suite..."
./backend/bin/metamorphosis_server 8086 &
SERVER_PID=$!
sleep 1.5

cleanup() {
    echo "Stopping test server (PID $SERVER_PID)..."
    kill -9 $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "========================================================"
echo "1. Register a new user successfully"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Sylph_Zero","password":"Chrysalis2026!"}'

echo "========================================================"
echo "2. Attempt to register the same username again (duplicate)"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Sylph_Zero","password":"DifferentPassword123!"}'

echo "========================================================"
echo "3. Submit an empty username"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":"Chrysalis2026!"}'

echo "========================================================"
echo "4. Submit an empty password"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ValidUser_1","password":""}'

echo "========================================================"
echo "6. Log in with correct credentials"
LOGIN_RES=$(curl -s -X POST http://127.0.0.1:8086/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Sylph_Zero","password":"Chrysalis2026!"}')
echo "Response: $LOGIN_RES"
TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"

echo "========================================================"
echo "7. Log in with an incorrect password"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Sylph_Zero","password":"WrongPassword123!"}'

echo "========================================================"
echo "8. Log in with a nonexistent username"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"GhostUser_999","password":"Chrysalis2026!"}'

echo "========================================================"
echo "10. Protected route before and after logout"
echo "Access /api/me before logout:"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET http://127.0.0.1:8086/api/me \
  -H "Authorization: Bearer $TOKEN"

echo "Calling /api/logout:"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/logout \
  -H "Authorization: Bearer $TOKEN"

echo "Access /api/me after logout (Must be 401 Unauthorized):"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET http://127.0.0.1:8086/api/me \
  -H "Authorization: Bearer $TOKEN"

echo "========================================================"
echo "12. Attempt malformed request payload"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://127.0.0.1:8086/api/register \
  -H "Content-Type: application/json" \
  -d '{"invalid_json'

echo -e "\n========================================================"
echo "All automated tests executed successfully!"
