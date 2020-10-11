import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import SchedulingAuditService from '../SchedulingAuditService';
import {AWSError} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';
import {PromiseTestUtil} from '../../__tests_util__/PromiseTestUtil';
import ItemUtil from '../../util/ItemUtil';
import {Event} from '../../model/Event';
import {status} from '../../const/EventStatus';
import {Response} from "../../model/Response";

jest.mock('aws-sdk/clients/dynamodb');

const request = PromiseTestUtil.createRequest();
const promiseResult = PromiseTestUtil.createDocumenClientResponse();
const spyPromise = jest.spyOn(request, 'promise');
const spyPut = jest.spyOn(DocumentClient.prototype, 'put');

const TABLE = 'Foo';

const eventStatus = status.SCHEDULED;

const insertDate: Date = new Date();

const event: Event = {
    caller: 'booking-engine',
    data: null,
    executionTime: insertDate,
    identifier: 'identifier',
    task: '123'
};

const awsError = {
    cfId: '',
    code: '',
    extendedRequestId: '',
    hostname: '',
    message: 'awsError',
    name: '',
    region: '',
    requestId: '',
    retryDelay: 0,
    retryable: false,
    stack: '',
    statusCode: 0,
    time: undefined
};

describe('Service Unit Test', () => {

    beforeEach(() => {
        process.env.SCHEDULING_AUDIT_TABLE = TABLE;
        jest.clearAllMocks();
    });

    describe('update', () => {

        describe('service update called without issues', () => {

            test('service update with valid data and no errors', async () => {

                promiseResult.$response.data = {
                    Attributes: {
                        attributes: event
                    }
                };

                spyPromise.mockReturnValueOnce(
                    new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {
                        resolve(promiseResult);
                    })
                );

                spyPut.mockReturnValueOnce(request);

                const service = new SchedulingAuditService();

                await service.put(insertDate, event, eventStatus, null).then((response: Response) => {

                    expect(DocumentClient).toHaveBeenCalledTimes(1);
                    expect(spyPut).toHaveBeenCalled();

                    const params = ItemUtil.createDdbItemFromEvent(insertDate, event, eventStatus, null);

                    expect(spyPut).toHaveBeenCalledWith(params);
                    expect(response.status).toEqual(200);
                });
            });

            test('service update with invalid data', async () => {

                promiseResult.$response.data = {
                    Attributes: {
                        attributes: event
                    }
                };

                spyPromise.mockReturnValueOnce(
                    new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {
                        resolve(promiseResult);
                    })
                );

                spyPut.mockReturnValueOnce(request);

                const service = new SchedulingAuditService();

                const error = ['error1', 'error2'];

                await service.put(insertDate, event, eventStatus, error).then((response: Response) => {

                    expect(DocumentClient).toHaveBeenCalledTimes(1);
                    expect(spyPut).toHaveBeenCalled();

                    const params = ItemUtil.createDdbItemFromEvent(insertDate, event, eventStatus, error.join(','));

                    expect(spyPut).toHaveBeenCalledWith(params);
                    expect(response.status).toEqual(200);
                });
            });
        });

        describe('service update with errors', () => {

            test('should be 500 with Promise error', async () => {

                const promiseRejectError = 'promiseRejectError';

                spyPromise.mockReturnValueOnce(
                    new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve, reject) => {
                        const error = new Error();
                        error.message = promiseRejectError;
                        reject(error);
                    })
                );

                spyPut.mockReturnValueOnce(request);

                const service = new SchedulingAuditService();

                await service.put(insertDate, event, eventStatus, null).then((response: Response) => {
                    expect(DocumentClient).toHaveBeenCalledTimes(1);
                    expect(spyPut).toHaveBeenCalled();
                    expect(response.status).toEqual(500);
                });
            });

            test('should be 500 with Aws error', async () => {

                promiseResult.$response.error = awsError;

                spyPromise.mockReturnValue(
                    new Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>((resolve) => {
                        resolve(promiseResult);
                    })
                );

                spyPut.mockReturnValue(request);

                const service = new SchedulingAuditService();

                await service.put(insertDate, event, eventStatus, null).then((response: Response) => {
                    expect(DocumentClient).toHaveBeenCalledTimes(1);
                    expect(spyPut).toHaveBeenCalled();
                    expect(response.status).toEqual(500);
                });
            });
        });
    });
});
