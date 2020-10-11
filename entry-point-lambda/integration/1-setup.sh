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

echo $(aws --endpoint-url=http://localhost:4585 \
    stepfunctions \
    create-state-machine \
    --name "scheduling-service-state-machine" \
    --definition "file://../../workflow/step_function.json" \
    --role-arn arn:aws:iam::012345678901:role/DummyRole
)
