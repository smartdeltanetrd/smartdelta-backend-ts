import winston, { createLogger } from "winston"
import config from "../../config/config";

const defaultMeta = { service: 'SmartDeltaApi' };
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}
const level = () => {
    const env = config.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'warn'
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

winston.addColors(colors)


const transports = [
    // Allow the use the console to print the messages
    new winston.transports.Console(),
    // Allow to print all the error level messages inside the error.log file
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    // Allow to print all the error message inside the all.log file
    // (also the error log that are also printed inside the error.log)
    new winston.transports.File({ filename: 'logs/all.log' }),
]

const format = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
)

const logger = createLogger({
    level: level(),
    levels,
    transports,
    format,

});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (config.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

const logError = (error: Error) => logger.info('Found %s at %s', 'ERROR ', error)

export default logger
