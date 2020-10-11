import fs from 'fs';

const kinesisJson = fs.readFileSync('./events/kinesis.json',
    { encoding: 'utf8', flag: 'r' });


describe('Test app', function () {

    afterEach(() => {
        jest.clearAllMocks();
    });

});
