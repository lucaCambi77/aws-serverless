import SchedulingAuditDao from '../dao/SchedulingAuditDao';
import {Event} from '../model/Event';
import {Response} from "../model/Response";
import {logger} from "../logger/logger";

class SchedulingAuditService {

    public put(insertDate: Date, event: Event, status: string, errors: Array<string>): Promise<Response> {

        return SchedulingAuditDao.put(insertDate, event, status, errors)
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

export default new SchedulingAuditService();
