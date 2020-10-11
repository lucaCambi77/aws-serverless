import {createLogger, format, Logger, transports} from "winston";

const level = process.env.LOG_LEVEL || 'debug';

const loggerFormat = format.combine(
    format.timestamp(),
    format.json(),
);

export const logger: Logger = createLogger({
    level: level,
    format: loggerFormat,
    transports: [
        new transports.Console(),
    ],
});
