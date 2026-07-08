#!/bin/bash
echo -e "========== 1. AUTHENTICATING =========="
# Login as QC User (U001)
LOGIN_QC=$(curl -s -X POST -H "Content-Type: application/json" -d '{"employeeId":"U001","password":"password"}' http://localhost:8080/api/auth/login)
TOKEN_QC=$(echo $LOGIN_QC | jq -r '.token')
echo "QC User (U001) logged in successfully."

# Login as HOD User (HOD01)
LOGIN_HOD=$(curl -s -X POST -H "Content-Type: application/json" -d '{"employeeId":"HOD01","password":"password"}' http://localhost:8080/api/auth/login)
TOKEN_HOD=$(echo $LOGIN_HOD | jq -r '.token')
echo "HOD User (HOD01) logged in successfully."

echo -e "\n========== 2. QC USER CREATES RECORD =========="
RECORD_RES=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_QC" -d '{
  "date": "2026-07-08",
  "partName": "Engine Block",
  "dateCode": "TEST-CODE-1",
  "heatCode": "HEAT-X1",
  "remarks": "Initial entry",
  "createdBy": "U001",
  "status": "QC_ENTRY"
}' http://localhost:8080/api/qc-register)
RECORD_ID=$(echo $RECORD_RES | jq -r '.id')
echo "Created new QC Register record with ID: $RECORD_ID"

echo -e "\n========== 3. QC USER EDITS RECORD =========="
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_QC" -d '{
  "date": "2026-07-08",
  "partName": "Engine Block",
  "dateCode": "TEST-CODE-UPDATED",
  "heatCode": "HEAT-X1",
  "remarks": "QC edited this!",
  "createdBy": "U001",
  "status": "QC_ENTRY"
}' http://localhost:8080/api/qc-register/$RECORD_ID > /dev/null
echo "QC user updated the record. Verifying changes..."
curl -s -X GET -H "Authorization: Bearer $TOKEN_HOD" http://localhost:8080/api/qc-register/$RECORD_ID | jq '{id: .id, remarks: .remarks, dateCode: .dateCode}'

echo -e "\n========== 4. ADMIN GLOBAL SEARCH =========="
echo "Searching for records with Date Code 'TEST-CODE-UPDATED'..."
curl -s -X GET -H "Authorization: Bearer $TOKEN_HOD" "http://localhost:8080/api/reports/search?dateCode=TEST-CODE-UPDATED" | jq '.[0] | {type: .type, id: .data.id, dateCode: .data.dateCode, status: .status}'

echo -e "\n========== 5. HOD ONE-SHOT APPROVAL =========="
echo "First, we push the record to HOF_APPROVED so the HOD can approve it..."
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_HOD" -d '{
  "date": "2026-07-08",
  "partName": "Engine Block",
  "dateCode": "TEST-CODE-UPDATED",
  "heatCode": "HEAT-X1",
  "remarks": "QC edited this!",
  "createdBy": "U001",
  "status": "HOF_APPROVED",
  "hofApprovedBy": "HOF01"
}' http://localhost:8080/api/qc-register/$RECORD_ID > /dev/null

echo "Triggering the Approve All endpoint for QC Register as HOD01..."
curl -s -X POST -H "Authorization: Bearer $TOKEN_HOD" http://localhost:8080/api/qc-register/approve-all | jq '.'

echo "Verifying the record's final status..."
curl -s -X GET -H "Authorization: Bearer $TOKEN_HOD" http://localhost:8080/api/qc-register/$RECORD_ID | jq '{id: .id, status: .status, hodApprovedBy: .hodApprovedBy}'

