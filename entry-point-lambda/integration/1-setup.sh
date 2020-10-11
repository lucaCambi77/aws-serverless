#!/usr/bin/env bash

npm --prefix ../ run package
cd ../build
npm install

echo $(\
    aws --endpoint-url=http://localhost:4569 \
    dynamodb \
    create-table \
    --table-name scheduling_audit \
    --attribute-definitions AttributeName=task_id,AttributeType=S \
    --key-schema AttributeName=task_id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
)
