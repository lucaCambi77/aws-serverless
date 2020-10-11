import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import DynamoDB, { PutItemInput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk';
import { Event } from "../model/Event";
import {logger} from "../logger/logger";

class SchedulingAuditDao {
    private client: DocumentClient;

    constructor() {
        this.client = (process.env.SAM_LOCAL && process.env.SAM_LOCAL === 'false') ?
            new DynamoDB.DocumentClient() :
            new DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_HOST });
    }

    public put(insertDate: Date, event: Event, status: string, errors: Array<string>): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> {

        const item: PutItemInput = null;

        logger.debug(`Insert new task ${event.task}`);

        return this.client.put(item).promise();
    }
}

export default new SchedulingAuditDao();
