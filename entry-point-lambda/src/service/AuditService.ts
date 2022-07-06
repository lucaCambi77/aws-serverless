import AuditDao from '../dao/AuditDao';
import {Event} from '../model/Event';
import {Response} from "../model/Response";
import {logger} from "../logger/logger";

class AuditService {

    public put(insertDate: Date, event: Event, errors: Array<string>): Promise<Response> {

        return AuditDao.put(insertDate, event, errors)
            .then((data) => {

                    if (data.$response.error) {
                        return {
                            error: data.$response.error.message,
                            status: 500
                        };
                    }

                    logger.info(`Insert new task completed successfully for ${event.task}`);
                    return {
                        error: null,
                        status: 200
                    };
                }, (error) => {
                    return {
                        error: error.message,
                        status: 500
                    };
                }
            );
    }
}

export default new AuditService();
