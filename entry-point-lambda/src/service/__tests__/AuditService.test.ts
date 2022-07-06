import AuditService from "../AuditService";
import {PromiseResult} from "aws-sdk/lib/request";
import {AWSError, Response} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import AuditDao from "../../dao/AuditDao";

jest.mock("aws-sdk", () => {
    return {
        DocumentClient: jest.fn().mockImplementation(() => {
            return {};
        })
    };
});

jest.mock("../../dao/AuditDao");

const auditDaoPutSpy = jest.spyOn(AuditDao, 'put');

describe('Service Unit Test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('update', () => {

        test('service calls dao', async () => {

            auditDaoPutSpy.mockReturnValueOnce(
                new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {
                    resolve({
                        $response: new Response<DocumentClient.PutItemOutput,
                            AWSError>()
                    });
                })
            );

            await AuditService.put(new Date(), {task: "task", executionTime: new Date(), identifier: "identifier"}, null);

            expect(auditDaoPutSpy).toHaveBeenCalledTimes(1);
        });
    });
});
