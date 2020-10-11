import DynamoDB, {DocumentClient} from 'aws-sdk/clients/dynamodb';
import SchedulingAuditDao from '../SchedulingAuditDao';
import {PromiseTestUtil} from '../../__tests_util__/PromiseTestUtil';
import {Event} from '../../model/Event';
import ItemUtil from '../../util/ItemUtil';
import {status} from '../../const/EventStatus';

jest.mock('aws-sdk/clients/dynamodb');

const TABLE = 'Foo';

const event: Event = {
    caller: 'booking-engine',
    data: null,
    executionTime: new Date,
    identifier: 'identifier',
    task: '123'
};

describe('Dao', () => {

    beforeEach(() => {
        process.env.SCHEDULING_AUDIT_TABLE = TABLE;
        process.env.SAM_LOCAL = 'true';
        jest.clearAllMocks();
    });

    describe('put item', () => {

        test('dao put new item with expected data and call promise', async () => {

            const request = PromiseTestUtil.createRequest();

            const promiseMock = jest.spyOn(request, 'promise').mockImplementation();

            const spy = jest.spyOn(DocumentClient.prototype, 'put').mockReturnValue(request);

            const dao = new SchedulingAuditDao();

            expect(DynamoDB.DocumentClient).toHaveBeenCalled();

            expect(DocumentClient).not.toBe(null);

            const insertDate = new Date();

            await dao.put(insertDate, event, status.SCHEDULED, null);

            const itemTemplate = ItemUtil.createDdbItemFromEvent(insertDate, event, status.SCHEDULED, null);

            expect(spy).toHaveBeenCalledWith(itemTemplate);

            expect(promiseMock).toHaveBeenCalled();

        });
    });
});
