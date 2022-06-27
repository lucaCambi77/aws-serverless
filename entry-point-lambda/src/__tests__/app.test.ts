jest.mock('../converter/KinesisToEventConverter');
import KinesisToEventConverter from "../converter/KinesisToEventConverter";

const app = require('../app');

describe('Test app', function () {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Verify kinesis', function () {

        test('verifies convertFromKinesis not invoked when input is null', () => {

            const spy = jest.spyOn(KinesisToEventConverter, 'convertFromKinesis');
            app.lambdaHandler(null);
            expect(spy).toHaveBeenCalledTimes(0);
        });


        test('verifies convertFromKinesis is invoked', () => {

            const spy = jest.spyOn(KinesisToEventConverter, 'convertFromKinesis');

            app.lambdaHandler({Records: [{kinesis: {data: ""}}]});

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

});
