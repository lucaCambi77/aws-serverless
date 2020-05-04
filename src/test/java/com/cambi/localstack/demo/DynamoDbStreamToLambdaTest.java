package com.cambi.localstack.demo;

import cloud.localstack.docker.annotation.LocalstackDockerProperties;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.*;
import com.amazonaws.services.identitymanagement.model.Role;
import com.amazonaws.services.lambda.AWSLambda;
import com.amazonaws.services.lambda.model.CreateEventSourceMappingRequest;
import com.amazonaws.services.lambda.model.CreateFunctionRequest;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@TestPropertySource(locations = "/config.properties")
@TestMethodOrder(value = MethodOrderer.OrderAnnotation.class)
@LocalstackDockerProperties(services = {"iam:4593", "dynamodb", "dynamodbstreams", "lambda"})
class DynamoDbStreamToLambdaTest extends AbstractAwsTest {

    private static String dynamoDbTableArn;
    private static String dynamoDbTableLatesStreamArn;
    private static String lambdaRole;
    private static String tableName = "Table";
    private static String jarBuild = "target/demo-0.0.1-SNAPSHOT.jar";

    @Test
    @Order(1)
    public void should_create_dynamo_db_table() throws InterruptedException {

        AmazonDynamoDB client = getDynamoDbClient();

        DynamoDB dynamoDB = new DynamoDB(client);

        String keyAttr = "email";
        String ttlAttr = "expires_at";
        CreateTableRequest createTableRequest =
                createTableRequest(tableName
                        , Arrays.asList(new KeySchemaElement(keyAttr, KeyType.HASH))
                        , Arrays.asList(new AttributeDefinition(keyAttr, ScalarAttributeType.S)));

        Table table = dynamoDB.createTable(createTableRequest);
        table.waitForActive();

        assertNotNull(dynamoDB.getTable(table.getTableName()));

        setTtl(client, tableName, ttlAttr);

        dynamoDbTableArn =
                table.getDescription().getTableArn();

        dynamoDbTableLatesStreamArn =
                table.getDescription().getLatestStreamArn();

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
                LambdaDynamoStreamRequestHandler.class.getCanonicalName(), lambdaRole, getClass().getName() + " Function");

        lambdaClient.createFunction(createFunctionRequest);

        assertEquals(1, lambdaClient.listFunctions().getFunctions().size());

        CreateEventSourceMappingRequest eventSourceMappingRequest = new CreateEventSourceMappingRequest()
                .withEventSourceArn(dynamoDbTableLatesStreamArn)
                .withEnabled(true)
                .withBatchSize(1)
                .withFunctionName("Lambda stream Dynamo Function");

        lambdaClient.createEventSourceMapping(eventSourceMappingRequest);
    }

    @Test
    @Order(4)
    public void should_trigger_lambda_after_insert_dynamo_table() {
        AmazonDynamoDB client = getDynamoDbClient();

        DynamoDB dynamoDB = new DynamoDB(client);

        String email = "example@example.com";
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(1);
        Long expiresAtEpoch = expiresAt.atZone(ZoneId.systemDefault()).toEpochSecond();

        Table table = dynamoDB.getTable(tableName);
        Item item = new Item().withPrimaryKey("email", email).withNumber("expires_at", expiresAtEpoch);
        table.putItem(item);

    }


}
