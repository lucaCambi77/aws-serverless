import {AWSError, Request, Response, Service} from 'aws-sdk';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {PromiseResult} from 'aws-sdk/lib/request';

export class PromiseTestUtil {

    public static createRequest(): Request<unknown, AWSError> {

        return new Request<unknown, AWSError>(new Service({
            endpoint: '...host/test',
        }), null, null);
    }

    public static createDocumenClientResponse(): PromiseResult<DocumentClient.PutItemOutput, AWSError> {

        const result: PromiseResult<DocumentClient.PutItemOutput, AWSError> = {
            $response: new Response<DocumentClient.PutItemOutput,
                AWSError>()
        };

        return result;
    }
}
