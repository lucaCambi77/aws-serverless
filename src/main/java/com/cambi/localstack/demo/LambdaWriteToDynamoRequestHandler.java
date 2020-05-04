package com.cambi.localstack.demo;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import java.util.Map;

public class LambdaWriteToDynamoRequestHandler implements RequestHandler<Map<String, String>, String> {

    private AmazonDynamoDB client;
    private String tableName = "Table";
    private String defaulRegion = "us-east-1";
    private String dynamodbHost = "us-east-1";

    public LambdaWriteToDynamoRequestHandler() {
        client = AmazonDynamoDBClientBuilder.standard()
                .withEndpointConfiguration(new AwsClientBuilder
                        .EndpointConfiguration("http://localhost:4569", defaulRegion))
                .build();

    }

    @Override
    public String handleRequest(Map<String, String> stringStringMap, Context context) {

        LambdaLogger logger = context.getLogger();
        logger.log(getClass().getName() + " handles request ...");

        DynamoDB dynamoDB = new DynamoDB(client);

        Table table = dynamoDB.getTable(tableName);
        Item item = new Item().withPrimaryKey("email", stringStringMap.get("email"))
                .withNumber("year", Integer.parseInt(stringStringMap.get("year")));

        table.putItem(item);

        return "200 OK";
    }
}
