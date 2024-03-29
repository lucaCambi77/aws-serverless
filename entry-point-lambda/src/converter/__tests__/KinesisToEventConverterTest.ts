import KinesisToEventConverter from '../KinesisToEventConverter';
import {Event} from '../../model/Event';
import {logger} from "../../logger/logger";

const spyConsoleError = jest.spyOn(logger, 'error');
const spyConsoleDebug = jest.spyOn(logger, 'debug');

describe('Kinesis to Event Converter Test', () => {

    beforeEach(
        jest.resetAllMocks
    );

    test('Read correct json file', () => {

        const record = {
            Records: [{
                kinesis: {
                    data: "eyJ0YXNrIjoidGFzayIsImlkZW50aWZpZXIiOiJpZGVudGlmaWVyIiwiZXhlY3V0aW9uVGltZSI6MTU4OTI5MzkyNjU4NX0=",
                }
            }]
        };

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).not.toBe(null);
        expect(spyConsoleDebug).toHaveBeenCalled();

    });

    test('Read null input', () => {

        const event: Event = KinesisToEventConverter.convertFromKinesis(null);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
        expect(spyConsoleDebug).not.toHaveBeenCalled();
    });

    test('Read null kinesis', () => {
        const record = {
            Records: [{
                kinesis: null
            }]
        };

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
        expect(spyConsoleDebug).not.toHaveBeenCalled();
    });

    test('Read null data', () => {
        const record = {
            Records: [{
                kinesis: {
                    data: null,
                }
            }]
        };

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
        expect(spyConsoleDebug).not.toHaveBeenCalled();
    });

    test('Data read exception', () => {
        const record = {
            Records: [{
                kinesis: {
                    data: "data",
                }
            }]
        };

        const spyBufferFrom = jest.spyOn(Buffer, 'from');
        spyBufferFrom.mockImplementation(() => {
            throw new Error('Buffer Error');
        });

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
        expect(spyConsoleDebug).not.toHaveBeenCalled();
    });

    test('Json Parse exception', () => {
        const record = {
            Records: [{
                kinesis: {
                    data: "data",
                }
            }]
        };

        const spyJsonParse = jest.spyOn(JSON, 'parse');
        spyJsonParse.mockImplementation(() => {
            throw new Error('Json Parse Error');
        });

        const event: Event = KinesisToEventConverter.convertFromKinesis(record.Records[0]);

        expect(event).toBe(undefined);
        expect(spyConsoleError).toHaveBeenCalled();
        expect(spyConsoleDebug).not.toHaveBeenCalled();
    });
});
