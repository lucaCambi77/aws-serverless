package com.cambi.localstack.demo;

import cloud.localstack.docker.annotation.LocalstackDockerProperties;
import com.amazonaws.services.stepfunctions.AWSStepFunctions;
import com.amazonaws.services.stepfunctions.model.*;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.text.SimpleDateFormat;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(value = MethodOrderer.OrderAnnotation.class)
@LocalstackDockerProperties(services = {"stepfunctions:4585"})
public class StepFunctionTest extends AbstractAwsTest {

    private static String stateMachineArn;

    @Test
    @Order(1)
    public void should_create_step_function_client() {

        AWSStepFunctions stepFunctionClient = getStepFunctionClient();
        assertNotNull(stepFunctionClient);

    }

    @Test
    @Order(2)
    public void should_create_step_function() {

        CreateStateMachineRequest createStateMachineRequest = new CreateStateMachineRequest();
        createStateMachineRequest.withName("TestStateMachine")
                .withDefinition("{\n" +
                        "  \"StartAt\": \"SCHEDULING_INITIAL_WAIT\",\n" +
                        "  \"States\": {\n" +
                        "    \"SCHEDULING_INITIAL_WAIT\": {\n" +
                        "      \"Type\": \"Wait\",\n" +
                        "      \"TimestampPath\": \"$.waitUntilTimestamp\",\n" +
                        "      \"End\": true\n" +
                        "    }\n" +
                        "  }\n" +
                        "}\n");

        AWSStepFunctions stepFunctionClient = getStepFunctionClient();
        stateMachineArn = stepFunctionClient.createStateMachine(createStateMachineRequest).getStateMachineArn();

    }

    @Test
    @Order(3)
    public void should_not_execute_step_function_wrong_input() throws InterruptedException {

        StartExecutionRequest startExecutionRequest = new StartExecutionRequest()
                .withStateMachineArn(stateMachineArn)
                .withInput("{ \"waitUntlTimestamp\": \"" + dateToIsoString(new Date()) + "\" }");

        StartExecutionResult startExecutionResult = startExecution(startExecutionRequest);

        DescribeExecutionRequest describeExecutionResult = new DescribeExecutionRequest();
        describeExecutionResult.setExecutionArn(startExecutionResult.getExecutionArn());

        Thread.sleep(1000);
        DescribeExecutionResult output = getStepFunctionClient().describeExecution(describeExecutionResult);

        assertEquals("FAILED", output.getStatus());
        assertEquals(200, startExecutionResult.getSdkHttpMetadata().getHttpStatusCode());
    }

    @Test
    @Order(4)
    public void should_not_execute_step_function_wrong_arn() throws InterruptedException {

        StartExecutionRequest startExecutionRequest = new StartExecutionRequest()
                .withStateMachineArn("arn:aws:states:us-east-2:000000000000:stateMachine:TestStateMachine")
                .withInput("{ \"waitUntilTimestamp\": \"" + dateToIsoString(new Date()) + "\" }");

        assertThrows(Exception.class, () -> {
            startExecution(startExecutionRequest);
        });


    }

    @Test
    @Order(5)
    public void should_execute_step_function() throws InterruptedException {

        StartExecutionRequest startExecutionRequest = new StartExecutionRequest()
                .withStateMachineArn(stateMachineArn)
                .withInput("{ \"waitUntilTimestamp\": \"" + dateToIsoString(new Date()) + "\" }");

        StartExecutionResult startExecutionResult = startExecution(startExecutionRequest);

        DescribeExecutionRequest describeExecutionResult = new DescribeExecutionRequest();
        describeExecutionResult.setExecutionArn(startExecutionResult.getExecutionArn());

        Thread.sleep(1000);
        DescribeExecutionResult output = getStepFunctionClient().describeExecution(describeExecutionResult);

        assertEquals("SUCCEEDED", output.getStatus());
        assertEquals(200, startExecutionResult.getSdkHttpMetadata().getHttpStatusCode());

    }

    private StartExecutionResult startExecution(StartExecutionRequest request) {
        return getStepFunctionClient().startExecution(request);
    }

    private static String dateToIsoString(Date input) {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(input);
    }
}
