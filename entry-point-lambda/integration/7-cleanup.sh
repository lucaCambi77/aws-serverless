#!/usr/bin/env bash

echo $( \
    aws --endpoint-url=http://localhost:4569 \
    dynamodb \
    delete-table \
    --table-name scheduling_audit \
)
