package com.cambi.localstack.demo;

import cloud.localstack.docker.annotation.LocalstackDockerProperties;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(locations = "/config.properties")
@TestMethodOrder(value = MethodOrderer.OrderAnnotation.class)
@LocalstackDockerProperties(services = {"serverless"})
public class SamTest extends AbstractAwsTest {

    @Test
    public void contextLoad() {

    }
}
