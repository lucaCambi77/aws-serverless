import SchedulingAuditDao from '../dao/SchedulingAuditDao';
import {Event} from '../model/Event';
import {Response} from "../model/Response";
import logger from "winston";

export default class SchedulingAuditService {
    private dao: SchedulingAuditDao;

    constructor() {
        this.dao = new SchedulingAuditDao();
    }

    public put(insertDate: Date, event: Event, status: string, errors: Array<string>): Promise<Response> {

        return this.dao.put(insertDate, event, status, errors)
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
