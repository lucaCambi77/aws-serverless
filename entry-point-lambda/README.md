## EntryPointLambdaFunction
EntryPointLambdaFunction is a node project. It is part of the scheduling service project and will be installed on AWS as a Lambda function.

The scope of this application is to schedule a specific task invoking a Step Function that will start and execute the task based on input parameters.

A record will be inserted in DynamoDb table to keep track.

Input parameters are :

* waitUntilTimestamp (time when the task will be executed and Step Function will start)
* preProcess (first step function's task that will be triggered on requested time)
* taskId (name of the task to be executed e.g. customer_confirmation)

## Implementation

Input of this Lambda is a Kinesis stream with information about the task to be scheduled.

KinesisEventRecord will be validated and if the input is correct, the Step Function will be triggered.

Validation will trace errors in case of missing attributes for the Event, json parsing error or step function start execution failed.

A record will finally be inserted in DynamoDb as audit if the task exists.

## Getting Started

We need to run 

```
npm install
```

at the root of the project

## Available Commands

| Command            | Description                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run tsc        | Compiles the Typescript code and outputs into `/build/`                                                                                     |
| npm run package    | Removes previous builds, runs tests, compiles the code and copies the package.json information. This is used by AWS SAM during the SAM build|
| npm run test       | Removes previous build and runs the jest unit tests.                                                                                        |

## Code pipe line

Lambda builds and deploys with SAM using cloudformation to create cloud infrastructures from a [template](../../template.yaml)
 
See code pipe line in [Dev](https://us-west-2.console.aws.amazon.com/codesuite/codepipeline/pipelines/SchedulingServiceCodePipeline/view?region=us-west-2#)

#### Deploy 

Currently, deployed in :

* Dev :: Region :: us-west-2

See function from CLI :
```bash
aws lambda get-function --function-name EntryPointLambda-SchedulingService
```

#### Local test
In [integration](integration) folder there are script to set up and run local tests.

To run a localstack docker image :
```bash
docker-compose up -d 
```

There are also sh scripts to run some tests :

* [setup](integration/1-setup.sh) (to build the project with sam and set up dynamo db table)
* script from 2 to 5 will handle invalid input such as missing task, wrong json format or wrong event
* [scan audit table](integration/6-scan_audit_table.sh) (scan dynamo db table to see items)
* [cleanup](integration/7-cleanup.sh) (delete dynamo db table)

Invocation of service with aws cli commands 
Host environment variables are set during project build with env [json](envTest.json)

#### Remote test

After logging to aws cli with SSO, we can execute a request for a particular task e.g.

```
aws lambda invoke --function-name EntryPointLambda-SchedulingService output.json --cli-binary-format raw-in-base64-out --payload file://events/kinesis.json --log-type Tail --query 'LogResult' --output text |  base64 -D
```

check result in output.json
