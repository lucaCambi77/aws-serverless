# Aws demo project for multiple steps processing

###

Sources :

### DynamoDb
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html

### Lambda
https://docs.aws.amazon.com/lambda/latest/dg/welcome.html

https://github.com/awsdocs/aws-lambda-developer-guide

### Localstack
https://github.com/localstack/localstack

https://github.com/localstack/localstack-java-utils

## Run
Requirements

- maven
- java8
- docker
 
It is recommended to delete your localstack docker image in order to pull the latest version.

Build
```
mvn clean package -Dmaven.test.skip=true
```

Execute tests
```
mvn test
```
or single tests with you IDE
