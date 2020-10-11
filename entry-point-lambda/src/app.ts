import Kinesis from 'aws-sdk/clients/kinesis';

exports.lambdaHandler = async (event): Promise<HttpStatus> => {

    const records: Kinesis.RecordList = event?.Records;

    if (records) {

    }

    return Promise.resolve(200);
};

