package com.cambi.localstack.demo;


import cloud.localstack.docker.annotation.LocalstackDockerProperties;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.*;
import com.amazonaws.services.identitymanagement.model.Role;
import com.amazonaws.services.lambda.AWSLambda;
import com.amazonaws.services.lambda.model.CreateFunctionRequest;
import com.amazonaws.services.lambda.model.CreateFunctionResult;
import com.amazonaws.services.lambda.model.InvokeRequest;
import com.amazonaws.services.lambda.model.InvokeResult;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@TestPropertySource(locations = "/config.properties")
@TestMethodOrder(value = MethodOrderer.OrderAnnotation.class)
@LocalstackDockerProperties(services = {"iam:4593", "dynamodb", "lambda"})
public class LambdaWriteToDynamoDbTest extends AbstractAwsTest {

    private static String dynamoDbTableArn;
    private static String lambdaRole;
    private static String tableName = "Table";
    private static String jarBuild = "target/demo-0.0.1-SNAPSHOT.jar";
    private static String lambdaName;

    @Test
    @Order(1)
    public void should_create_dynamo_db_table() throws InterruptedException {

        AmazonDynamoDB client = getDynamoDbClient();

        DynamoDB dynamoDB = new DynamoDB(client);

        String keyAttr = "email";
        String keyOrder = "year";

        CreateTableRequest createTableRequest = createTableRequest(tableName,
                Arrays.asList(new KeySchemaElement(keyAttr, KeyType.HASH), new KeySchemaElement(keyOrder, KeyType.RANGE)),
                Arrays.asList(new AttributeDefinition(keyAttr, ScalarAttributeType.S),
                        new AttributeDefinition(keyOrder, ScalarAttributeType.N)));

        Table table = dynamoDB.createTable(createTableRequest);
        table.waitForActive();

        assertNotNull(dynamoDB.getTable(table.getTableName()));

        dynamoDbTableArn =
                table.getDescription().getTableArn();

    }

    @Test
    @Order(2)
    public void should_create_lamba_role() {

        Role iamRole = createLamdbaDynamoDbRole("{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [{\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Action\": [\n" +
                "        \"dynamodb:BatchGetItem\",\n" +
                "        \"dynamodb:GetItem\",\n" +
                "        \"dynamodb:Query\",\n" +
                "        \"dynamodb:Scan\",\n" +
                "        \"dynamodb:BatchWriteItem\",\n" +
                "        \"dynamodb:PutItem\",\n" +
                "        \"dynamodb:UpdateItem\"\n" +
                "      ],\n" +
                "      \"Resource\": \"" + dynamoDbTableArn + "\"\n" +
                "    }\n" +
                "  ]\n" +
                "}");

        lambdaRole = iamRole.getRoleName();
    }

    @Test
    @Order(3)
    public void should_create_lambda() throws IOException {
        AWSLambda lambdaClient = getLambdaClient();

        CreateFunctionRequest createFunctionRequest = createLambdaFunctionRequest(jarBuild,
                LambdaWriteToDynamoRequestHandler.class.getCanonicalName(), lambdaRole, getClass().getName() + " Function");

        CreateFunctionResult result = lambdaClient.createFunction(createFunctionRequest);

        assertNotNull(result);
        assertEquals(1, lambdaClient.listFunctions().getFunctions().size());

        lambdaName = result.getFunctionName();
    }

    @Test
    @Order(4)
    public void should_insert_dynamo_table_after_invoking_lambda() {

        InvokeRequest invokeRequest = new InvokeRequest()
                .withFunctionName(lambdaName)
                .withPayload("{\n" +
                        " \"email\": \"test@gmail.com\",\n" +
                        " \"year\": \"2014\"\n" +
                        "}");

        InvokeResult invokeResult = getLambdaClient().invoke(invokeRequest);

        String ans = new String(invokeResult.getPayload().array(), StandardCharsets.UTF_8);

        assertEquals("\"200 OK\"\n", ans);

        AmazonDynamoDB client = getDynamoDbClient();

        ScanRequest scanRequest = new ScanRequest()
                .withTableName(tableName);

        ScanResult result = client.scan(scanRequest);

        assertEquals(1, result.getCount());
    }
}
