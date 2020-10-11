#!/usr/bin/env bash

echo $( \
    aws --endpoint-url=http://localhost:4569 \
    dynamodb \
    scan \
    --table-name scheduling_audit \
)
