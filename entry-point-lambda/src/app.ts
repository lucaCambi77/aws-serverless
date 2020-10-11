import Kinesis from 'aws-sdk/clients/kinesis';
import { HttpStatus } from 'aws-sdk/clients/lambda';
import KinesisToEventConverter from './converter/KinesisToEventConverter';
import { Event } from './model/Event';

exports.lambdaHandler = async (event): Promise<HttpStatus> => {

    const records: Kinesis.RecordList = event?.Records;

    if (records) {
        const event : Event = KinesisToEventConverter.convertFromKinesis(records);
    }

    return Promise.resolve(200);
};

