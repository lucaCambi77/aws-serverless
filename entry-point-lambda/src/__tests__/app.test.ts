import fs from 'fs';
import KinesisToEventConverter from '../converter/KinesisToEventConverter';

const app = require('../app');

const kinesisJson = fs.readFileSync('./events/kinesis.json',
    {encoding: 'utf8', flag: 'r'});

describe('Test app', function () {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Verify kinesis', function () {

        test('verifies null kinesis', () => {

            const spy = jest.spyOn(KinesisToEventConverter, 'convertFromKinesis');
            app.lambdaHandler(null);
            expect(spy).toHaveBeenCalledTimes(0);
        });
    });

    describe('Verify kinesis ok', function () {

        test('verifies null kinesis', () => {

            const spy = jest.spyOn(KinesisToEventConverter, 'convertFromKinesis');
            const record = JSON.parse(kinesisJson);

            app.lambdaHandler(record);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
