
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

describe('Dao', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('put item', () => {

        test('dao put new item with expected data and call promise', async () => {
            //
        });
    });
});
