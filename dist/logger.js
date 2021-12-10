"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const moment_1 = __importDefault(require("moment"));
const LOGGER_PROTECTOR = Symbol();
class Logger {
    static winston = {};
    transports = {
        text: [],
        json: []
    };
    static instance;
    levels = {
        emerg: 0,
        errorRuntime: 1,
        errorLogic: 2,
        warn: 3,
        status: 4,
        info: 5,
        debug: 6,
        debugEx: 7
    };
    colors = {
        emerg: 'bold red',
        errorRuntime: 'red',
        errorLogic: 'red',
        warn: 'yellow',
        status: 'bold green',
        info: 'blue',
        debug: 'cyan',
        debugEx: 'grey'
    };
    static createInstance(config = {}) {
        Logger.instance = new Logger(LOGGER_PROTECTOR, config);
    }
    get defaultLevel() { return this.levels.info; }
    get flippedLevels() {
        return Object.entries(this.levels).reduce((p, c) => {
            const [key, value] = c;
            p[value] = key;
            return p;
        }, {});
    }
    constructor(protector, config = {}) {
        if (LOGGER_PROTECTOR !== protector) {
            throw new Error(`${Logger.name}: please use create instance instead direct new Logger()`);
        }
        const clearedConfig = this.clearConfig(config);
        this.configureLoki(clearedConfig);
        this.configureFile(clearedConfig);
        this.configureDatadog(clearedConfig);
        winston_1.default.addColors(this.colors);
        for (const transport in this.transports) {
            if (Object.prototype.hasOwnProperty.call(this.transports, transport)) {
                if (this.transports[transport].length) {
                    Logger.winston[transport] = winston_1.default.createLogger({
                        transports: this.transports[transport],
                        ...{
                            levels: this.levels,
                            defaultMeta: { service: clearedConfig.shortCode ? clearedConfig.shortCode.toUpperCase() : 'APP' }
                        }
                    });
                }
            }
        }
    }
    clearConfig(config) {
        const cleared = {};
        for (const logger in config) {
            if (Object.prototype.hasOwnProperty.call(config, logger)) {
                const options = config[logger];
                switch (typeof options) {
                    case 'boolean':
                        cleared[logger] = { level: this.defaultLevel };
                        break;
                    case 'object':
                        cleared[logger] = {
                            ...options,
                            level: options.level ? options.level : this.defaultLevel
                        };
                        break;
                    case 'string':
                        cleared[logger] = options;
                        break;
                    default:
                        throw new Error(`${logger} invalid format`);
                }
            }
        }
        return cleared;
    }
    configureLoki(config) {
        config.loki ?
            this.transports.json.push(new winston_1.default.transports.Console({
                format: winston_1.default.format.printf(info => info.message),
                ...typeof config.loki === 'object' && {
                    level: this.flippedLevels[config.loki.level]
                }
            })) :
            this.transports.text.push(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.colorize(), winston_1.default.format.printf(info => `[${(0, moment_1.default)(info.timestamp).format('YYYY-MM-DD HH:mm:ss')}] ${info.level}: ${info.message}`))
            }));
    }
    configureFile(config) {
        config.file && this.transports.text.push(new winston_1.default.transports.File({
            filename: config.file.paths.text,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.prettyPrint()),
            level: this.flippedLevels[config.file.level]
        }));
        config.file && this.transports.json.push(new winston_1.default.transports.File({
            filename: config.file.paths.json,
            format: winston_1.default.format.printf(info => `[${(0, moment_1.default)(info.timestamp).format('YYYY-MM-DD HH:mm:ss')}] ${info.level}: ${info.message}`),
            level: this.flippedLevels[config.file.level]
        }));
    }
    configureDatadog(config) {
        config.datadog && this.transports.json.push(new winston_1.default.transports.Http({
            format: winston_1.default.format.json(),
            level: this.flippedLevels[config.datadog.level],
            host: config.datadog.host,
            path: `/v1/input/${config.datadog.apikey}?ddsource=nodejs&service=${config.datadog.service}`,
            ssl: true
        }));
    }
    toLog(level, text, meta) {
        Logger.winston.text && Logger.winston.text.log(level, text);
        if (Logger.winston.json) {
            const ts = (0, moment_1.default)();
            Logger.winston.json.log(level, JSON.stringify({
                text,
                level,
                date: ts.format('YYYY-MM-DD HH:mm:ss'),
                ts: ts.unix(),
                ...meta && meta
            }));
        }
    }
    static log(level, text, meta = {}) {
        Logger.instance.toLog(level, text, meta);
    }
    static emerg(text, meta = {}) {
        Logger.instance.toLog('emerg', text, meta);
    }
    static errorRuntime(text, meta = {}) {
        Logger.instance.toLog('errorRuntime', text, meta);
    }
    static errorLogic(text, meta = {}) {
        Logger.instance.toLog('errorLogic', text, meta);
    }
    static warn(text, meta = {}) {
        Logger.instance.toLog('warn', text, meta);
    }
    static status(text, meta = {}) {
        Logger.instance.toLog('status', text, meta);
    }
    static info(text, meta = {}) {
        Logger.instance.toLog('info', text, meta);
    }
    static debug(text, meta = {}) {
        Logger.instance.toLog('debug', text, meta);
    }
    static debugEx(text, meta = {}) {
        Logger.instance.toLog('debugEx', text, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map