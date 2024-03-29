import {Event} from '../model/Event';
import {logger} from "../logger/logger";

class KinesisToEventConverter {

    public convertFromKinesis(record: any): Event {

        const data = record?.kinesis?.data;

        if (!data) {
            logger.error(`Unable to process KinesisEventRecord : record or data is null`);
            return undefined;
        }

        try {

            const kinesisData = Buffer.from(record.kinesis.data, 'base64').toString('ascii');

            const event: Event = JSON.parse(kinesisData);

            if (event.executionTime) {
                event.executionTime = new Date(event.executionTime);
            }

            logger.debug(`Processing KinesisEventRecord : ${JSON.stringify(event)}`);
            return event;
        } catch (e) {
            logger.error(`Unable to process KinesisEventRecord : ${e.message}`);
            return undefined;
        }
    }
}

export default new KinesisToEventConverter();
