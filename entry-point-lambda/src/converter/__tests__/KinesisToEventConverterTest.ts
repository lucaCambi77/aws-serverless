import fs = require('fs');
import KinesisToEventConverter from '../KinesisToEventConverter';
import {Event} from '../../model/Event';
import {logger} from "@rides/taxi-winston-logger";

const spyConsoleError = jest.spyOn(logger, 'error');
const spyConsoleDebug = jest.spyOn(logger, 'debug');

const kinesisToEventConverter: KinesisToEventConverter = new KinesisToEventConverter();

describe('Kinesis to Event Converter Test', () => {

    beforeEach(
        jest.resetAllMocks
    );

    test('Read correct json file', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis.json',
            {encoding: 'utf8', flag: 'r'});

        const record = JSON.parse(kinesisJson);

        const event: Event = kinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).not.toBe(null);
        expect(spyConsoleDebug).toHaveBeenCalled();

    });

    test('Read json event file missing task', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis-missing-task.json',
            {encoding: 'utf8', flag: 'r'});

        const record = JSON.parse(kinesisJson);

        const event: Event = kinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event.task).toBe(undefined);
        expect(spyConsoleError).not.toHaveBeenCalled();
    });

    test('Read wrong data json file', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis-wrong-event.json',
            {encoding: 'utf8', flag: 'r'});

        const record = JSON.parse(kinesisJson);

        const event: Event = kinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).not.toBe(undefined);
        expect(event.task).toBe(undefined);
        expect(spyConsoleError).not.toHaveBeenCalled();
    });

    test('Read invalid json file', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis-invalid-data.json',
            {encoding: 'utf8', flag: 'r'});

        const record = JSON.parse(kinesisJson);

        const event: Event = kinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });

    test('Read null input', () => {

        const event: Event = kinesisToEventConverter.convertFromKinesis(null);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });

    test('Read null kinesis', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis.json',
            {encoding: 'utf8', flag: 'r'});

        const record = JSON.parse(kinesisJson);

        record.Records[0].kinesis = null;

        const event: Event = kinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });

    test('Read null data', () => {
        const kinesisJson = fs.readFileSync('./events/kinesis.json',
            {encoding: 'utf8', flag: 'r'});

        const record = JSON.parse(kinesisJson);

        record.Records[0].kinesis.data = null;

        const event: Event = kinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
    });
});
