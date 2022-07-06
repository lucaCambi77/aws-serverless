import AuditService from "../AuditService";
import {PromiseResult} from "aws-sdk/lib/request";
import {AWSError, Response} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import AuditDao from "../../dao/AuditDao";

jest.doMock('aws-sdk', () => {
    return {
        DynamoDB: jest.fn(() => ({
            DocumentClient: jest.fn(() => ({
                put: jest.fn().mockImplementation(() => {
                    return {
                        promise() {
                            return Promise.resolve({});
                        }
                    };
                })
            }))
        }))
    };
});

jest.mock("../../dao/AuditDao");

const auditDaoPutSpy = jest.spyOn(AuditDao, 'put');

const documentClientPromiseResult: PromiseResult<DocumentClient.PutItemOutput, AWSError> = {
    $response: new Response<DocumentClient.PutItemOutput,
        AWSError>()
};

describe('Service Unit Test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('put item', () => {

        test('service calls dao and response ok', async () => {

            auditDaoPutSpy.mockReturnValueOnce(
                new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {

                    documentClientPromiseResult.$response.error = null;

                    resolve(documentClientPromiseResult);
                })
            );

            const response = await AuditService.put(new Date(), {task: "task", executionTime: new Date(), identifier: "identifier"}, null);

            expect(response).not.toBe(null);
            expect(response.status).toBe(200);
            expect(auditDaoPutSpy).toHaveBeenCalledTimes(1);
        });

        test('service calls dao and response error', async () => {

            const error = "error message";

            auditDaoPutSpy.mockReturnValueOnce(
                new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {

                    documentClientPromiseResult.$response.error = {code: "CODE", message: error, name: "some error", time: new Date()};
                    resolve(documentClientPromiseResult);
                })
            );

            const response = await AuditService.put(new Date(), {task: "task", executionTime: new Date(), identifier: "identifier"}, null);

            expect(response).not.toBe(null);
            expect(response.status).toBe(500);
            expect(response.error).toBe(error);
            expect(auditDaoPutSpy).toHaveBeenCalledTimes(1);
        });

        test('service calls dao and response with reject error', async () => {

            const unhandledError = "unhandled error";

            auditDaoPutSpy.mockReturnValueOnce(
                new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {
                    resolve(Promise.reject({
                        message: unhandledError
                    }));
                })
            );

            const response = await AuditService.put(new Date(), {task: "task", executionTime: new Date(), identifier: "identifier"}, null);

            expect(response).not.toBe(null);
            expect(response.status).toBe(500);
            expect(response.error).toBe(unhandledError);
            expect(auditDaoPutSpy).toHaveBeenCalledTimes(1);
        });
    });
});
