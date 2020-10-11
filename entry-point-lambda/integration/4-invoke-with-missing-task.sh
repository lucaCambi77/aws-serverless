#!/usr/bin/env bash

sam local invoke EntryPointLambdaFunction \
    --template ../../template.yaml  \
    --event ../events/kinesis-missing-task.json --env-vars ../envTest.json
