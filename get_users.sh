#!/bin/bash
# First login as EMP043 to get an admin token (since it gave us ROLE_ADMIN)
LOGIN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"employeeId":"EMP043","password":"Rizwan@25012007"}' http://localhost:8080/api/auth/login)
TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -s -X GET -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/users | jq '.[] | {employeeId: .employeeId, role: .role}'
