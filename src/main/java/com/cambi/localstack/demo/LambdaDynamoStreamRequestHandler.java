package com.cambi.localstack.demo;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;

public class LambdaDynamoStreamRequestHandler implements RequestHandler<DynamodbEvent, String> {

    @Override
    public String handleRequest(DynamodbEvent dynamodbEvent, Context context) {

        LambdaLogger logger = context.getLogger();
        logger.log("Dynamo db event processed");

        return "Dynamo db event processed";
    }
}
