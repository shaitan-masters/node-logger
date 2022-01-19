import {LoggerLevelName} from './Types';
import {Logger} from './Logger';

export class LoggerGroup {
	instance: typeof Logger;
	private name: string;

	constructor(logger: typeof Logger, name: string) {
		this.instance = logger;
		this.name = name;
	}

	log(level: LoggerLevelName, text: string, meta: { [key: string]: any } = {}): void {
		meta.groupName = this.name;
		this.instance.log(level, `${this.name} ${text}`, meta);
	}

	emerg(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.emerg, text, meta);
	}

	errorRuntime(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.errorRuntime, text, meta);
	}

	errorLogic(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.errorLogic, text, meta);
	}

	warn(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.warn, text, meta);
	}

	status(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.status, text, meta);
	}

	info(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.info, text, meta);
	}

	debug(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.debug, text, meta);
	}

	debugEx(text: string, meta: { [key: string]: any } = {}): void {
		this.log(Logger.levelNames.debugEx, text, meta);
	}

	setName(name: string) {
		this.name = name;
	}
}
