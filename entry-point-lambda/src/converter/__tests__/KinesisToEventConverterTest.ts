import fs = require('fs');
import KinesisToEventConverter from '../KinesisToEventConverter';
import { Event } from '../../model/Event';
import logger from "winston";

const spyConsoleError = jest.spyOn(logger, 'error');
const spyConsoleDebug = jest.spyOn(logger, 'debug');

describe('Kinesis to Event Converter Test', () => {

    beforeEach(
        jest.resetAllMocks
    );

    test('Read correct json file', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis.json',
            { encoding: 'utf8', flag: 'r' });

        const record = JSON.parse(kinesisJson);

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).not.toBe(null);
        expect(spyConsoleDebug).toHaveBeenCalled();

    });

    test('Read null input', () => {

        const event: Event = KinesisToEventConverter.convertFromKinesis(null);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });

    test('Read null kinesis', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis.json',
            { encoding: 'utf8', flag: 'r' });

        const record = JSON.parse(kinesisJson);

        record.Records[0].kinesis = null;

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });

    test('Read null data', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis.json',
            { encoding: 'utf8', flag: 'r' });

        const record = JSON.parse(kinesisJson);

        record.Records[0].kinesis.data = null;

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });
});
