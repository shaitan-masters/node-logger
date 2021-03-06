// noinspection JSMethodCanBeStatic

import winston, {level, Logger as WinstonLogger} from 'winston';
import TransportStream from 'winston-transport';
import moment from 'moment';
import {
	LoggerColorType,
	LoggerLevelType,
	Config,
	ClearedConfig,
	LoggerLevel,
	LoggerLevelName,
	LoggerLevelNames
} from './Types';

const LOGGER_PROTECTOR: Symbol = Symbol();

export class Logger {
	private static winston: {
		text?: WinstonLogger;
		json?: WinstonLogger;
	} = {};

	private readonly transports: {
		text: TransportStream[];
		json: TransportStream[];
	} = {
		text: [],
		json: []
	};

	private static instance: Logger;

	static readonly levels: Readonly<LoggerLevelType> = {
		emerg       : 0,
		errorRuntime: 1,
		errorLogic  : 2,
		warn        : 3,
		status      : 4,
		info        : 5,
		debug       : 6,
		debugEx     : 7
	};

	private readonly colors: Readonly<LoggerColorType> = {
		emerg       : 'bold red',
		errorRuntime: 'red',
		errorLogic  : 'red',
		warn        : 'yellow',
		status      : 'bold green',
		info        : 'blue',
		debug       : 'cyan',
		debugEx     : 'grey'
	};

	static readonly levelNames: Readonly<LoggerLevelNames> = {
		emerg       : 'emerg',
		errorRuntime: 'errorRuntime',
		errorLogic  : 'errorLogic',
		warn        : 'warn',
		status      : 'status',
		info        : 'info',
		debug       : 'debug',
		debugEx     : 'debugEx'
	};

	static createInstance(config: Config = {}): void {
		Logger.instance = new Logger(LOGGER_PROTECTOR, config);
	}

	get defaultLevel(): LoggerLevel { return Logger.levels.info; }

	get flippedLevels() {
		return Object.entries(Logger.levels).reduce((p, c) => {
			const [key, value] = c;
			p[value] = key;

			return p;
		}, {});
	}

	constructor(protector: Symbol, config: Config = {}) {
		if (LOGGER_PROTECTOR !== protector) {
			throw new Error(`${Logger.name}: please use create instance instead direct new Logger()`);
		}

		const clearedConfig = this.clearConfig(config);

		this.configureConsole(clearedConfig);
		this.configureFile(clearedConfig);
		this.configureDatadog(clearedConfig);

		winston.addColors(this.colors);

		for (const transport in this.transports) {
			if (Object.prototype.hasOwnProperty.call(this.transports, transport)) {
				if (this.transports[transport].length) {
					Logger.winston[transport] = winston.createLogger({
						transports: this.transports[transport],
						...{
							levels     : Logger.levels,
							defaultMeta: {service: clearedConfig.shortCode ? clearedConfig.shortCode.toUpperCase() : 'APP'}
						}
					});
				}
			}
		}
	}

	private clearConfig(config: Config): ClearedConfig {
		const cleared: ClearedConfig = {};
		for (const logger in config) {
			if (Object.prototype.hasOwnProperty.call(config, logger)) {
				const options = config[logger];

				switch (typeof options) {
					case 'boolean':
						cleared[logger] = {level: this.defaultLevel};
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

	private configureConsole(config: ClearedConfig): void {
		if (config.loki) {
			this.transports.json.push(
				new winston.transports.Console({
					format: winston.format.printf(info => info.message),
					...typeof config.loki === 'object' && {
						level: config.loki?.level !== undefined ? this.flippedLevels[config.loki.level] : this.defaultLevel
					}
				})
			);
			return;
		}

		this.transports.text.push(
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.timestamp(),
					winston.format.colorize(),
					winston.format.printf(
						info => `[${moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss')}] ${info.level}: ${info.message}`
					)
				),
				level : config.console?.level !== undefined ? this.flippedLevels[config.console.level] : this.defaultLevel
			})
		);
	}

	private configureFile(config: ClearedConfig): void {
		config.file && this.transports.text.push(
			new winston.transports.File({
				filename: config.file.paths.text,
				format  : winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
				level   : this.flippedLevels[config.file.level]
			})
		);

		config.file && this.transports.json.push(
			new winston.transports.File({
				filename: config.file.paths.json,
				format  : winston.format.printf(
					info => `[${moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss')}] ${info.level}: ${info.message}`
				),
				level   : this.flippedLevels[config.file.level]
			})
		);
	}

	private configureDatadog(config: ClearedConfig): void {
		config.datadog && this.transports.json.push(
			new winston.transports.Http({
				format: winston.format.json(),
				level : this.flippedLevels[config.datadog.level],
				host  : config.datadog.host,
				path  : `/v1/input/${config.datadog.apikey}?ddsource=nodejs&service=${config.datadog.service}`,
				ssl   : true
			})
		);
	}

	private toLog(level: LoggerLevelName, text: string, meta: object) {
		Logger.winston.text && Logger.winston.text.log(level, text);

		if (Logger.winston.json) {
			const ts = moment();

			Logger.winston.json.log(
				level,
				JSON.stringify({
					text,
					level,
					date: ts.format('YYYY-MM-DD HH:mm:ss'),
					ts  : ts.unix(),
					...meta && meta
				})
			);
		}
	}

	static log(level: LoggerLevelName, text: string, meta: object = {}): void {
		Logger.instance.toLog(level, text, meta);
	}

	static emerg(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.emerg, text, meta);
	}

	static errorRuntime(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.errorRuntime, text, meta);
	}

	static errorLogic(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.errorLogic, text, meta);
	}

	static warn(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.warn, text, meta);
	}

	static status(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.status, text, meta);
	}

	static info(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.info, text, meta);
	}

	static debug(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.debug, text, meta);
	}

	static debugEx(text: string, meta: object = {}): void {
		Logger.log(Logger.levelNames.debugEx, text, meta);
	}
}
