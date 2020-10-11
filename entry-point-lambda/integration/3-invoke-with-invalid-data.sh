#!/usr/bin/env bash

sam local invoke EntryPointLambdaFunction \
    --template ../../template.yaml  \
    --event ../events/kinesis-invalid-data.json --env-vars ../envTest.json
