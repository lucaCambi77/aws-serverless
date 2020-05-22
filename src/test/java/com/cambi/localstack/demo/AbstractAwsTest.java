package com.cambi.localstack.demo;

import cloud.localstack.docker.LocalstackDockerExtension;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.*;
import com.amazonaws.services.identitymanagement.AmazonIdentityManagement;
import com.amazonaws.services.identitymanagement.AmazonIdentityManagementClientBuilder;
import com.amazonaws.services.identitymanagement.model.CreateRoleRequest;
import com.amazonaws.services.identitymanagement.model.PutRolePolicyRequest;
import com.amazonaws.services.identitymanagement.model.Role;
import com.amazonaws.services.lambda.AWSLambda;
import com.amazonaws.services.lambda.AWSLambdaClientBuilder;
import com.amazonaws.services.lambda.model.CreateFunctionRequest;
import com.amazonaws.services.lambda.model.FunctionCode;
import com.amazonaws.services.lambda.model.Runtime;
import com.amazonaws.services.stepfunctions.AWSStepFunctions;
import com.amazonaws.services.stepfunctions.AWSStepFunctionsClientBuilder;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;

@ExtendWith(LocalstackDockerExtension.class)
public abstract class AbstractAwsTest {

    private static AmazonDynamoDB dynamoDbClient;
    private static AWSLambda lambdaClient;
    private static AmazonIdentityManagement iamClient;
    private static AWSStepFunctions stepFunctionsClient;
    private static String defaultRegion = "us-east-1";

    protected AmazonDynamoDB getDynamoDbClient() {

        if (dynamoDbClient == null)
            dynamoDbClient = AmazonDynamoDBClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder
                            .EndpointConfiguration("http://localhost:4569", defaultRegion))
                    .build();

        return dynamoDbClient;
    }

    protected AWSLambda getLambdaClient() {
        if (lambdaClient == null)
            lambdaClient = AWSLambdaClientBuilder.standard()
                    .withEndpointConfiguration(
                            new AwsClientBuilder
                                    .EndpointConfiguration("http://localhost:4574", defaultRegion)).build();

        return lambdaClient;
    }

    protected AmazonIdentityManagement getIamCLient() {

        if (iamClient == null)
            iamClient = AmazonIdentityManagementClientBuilder.standard()
                    .withEndpointConfiguration(
                            new AwsClientBuilder
                                    .EndpointConfiguration("http://localhost:4593", defaultRegion)).build();

        return iamClient;
    }

    protected AWSStepFunctions getStepFunctionClient() {

        if (stepFunctionsClient == null)
            stepFunctionsClient = AWSStepFunctionsClientBuilder.standard().withEndpointConfiguration(
                    new AwsClientBuilder
                            .EndpointConfiguration("http://localhost:4585", defaultRegion)).build();

        return stepFunctionsClient;
    }

    protected CreateTableRequest createTableRequest(String tableName, List<KeySchemaElement> attrKeySchemaList, List<AttributeDefinition> attrDefinitionList) {
        return new CreateTableRequest()
                .withTableName(tableName)
                .withKeySchema(attrKeySchemaList)
                .withAttributeDefinitions(attrDefinitionList)
                .withProvisionedThroughput(new ProvisionedThroughput(10L, 10L))
                .withStreamSpecification(new StreamSpecification()
                        .withStreamEnabled(true)
                        .withStreamViewType(StreamViewType.NEW_AND_OLD_IMAGES));

    }

    protected Role createLamdbaDynamoDbRole(String policyDocument) {
        Role iamRole = new Role();
        iamRole.withRoleName("lambda-role");
        iamRole.withAssumeRolePolicyDocument("{\n" +
                "   \"Version\": \"2012-10-17\",\n" +
                "   \"Statement\": [\n" +
                "     {\n" +
                "       \"Effect\": \"Allow\",\n" +
                "       \"Principal\": {\n" +
                "         \"Service\": \"lambda.amazonaws.com\"\n" +
                "       },\n" +
                "       \"Action\": \"sts:AssumeRole\"\n" +
                "     }\n" +
                "   ]\n" +
                " }");

        CreateRoleRequest createRoleRequest = new CreateRoleRequest();
        createRoleRequest.setRoleName(iamRole.getRoleName());

        AmazonIdentityManagement amazonIdentityManagementClient = getIamCLient();

        amazonIdentityManagementClient.createRole(createRoleRequest);

        PutRolePolicyRequest putRolePolicyRequest = new PutRolePolicyRequest();
        putRolePolicyRequest.withRoleName(iamRole.getRoleName());
        putRolePolicyRequest.withPolicyDocument(policyDocument);

        putRolePolicyRequest.withPolicyName("lambda-role-policy-name");

        amazonIdentityManagementClient.putRolePolicy(putRolePolicyRequest);
        return iamRole;
    }

    protected CreateFunctionRequest createLambdaFunctionRequest(String jar, String handler, String role, String functionName) throws IOException {
        ByteBuffer buffer = getByteBuffer(jar);

        return new CreateFunctionRequest().withRuntime(Runtime.Java8)
                .withCode(new FunctionCode()
                        .withZipFile(buffer))
                .withFunctionName(functionName)
                .withHandler(handler)
                .withRole(role);
    }

    protected ByteBuffer getByteBuffer(String fileName) throws IOException {

        return ByteBuffer
                .wrap(FileUtils.readFileToByteArray(new File(fileName)));
    }

    protected void setTtl(AmazonDynamoDB client, String tableName, String ttl) {
        UpdateTimeToLiveRequest req = new UpdateTimeToLiveRequest();
        req.setTableName(tableName);

        TimeToLiveSpecification ttlSpec = new TimeToLiveSpecification();
        ttlSpec.setAttributeName(ttl);
        ttlSpec.setEnabled(true);

        req.withTimeToLiveSpecification(ttlSpec);

        client.updateTimeToLive(req);
    }

}
