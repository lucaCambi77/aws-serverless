#!/usr/bin/env bash

sam local invoke EntryPointLambdaFunction \
    --template ../../template.yaml  \
    --event ../events/kinesis-wrong-event.json --env-vars ../envTest.json
