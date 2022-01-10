export interface Config {
	shortCode?: string;
	loki?: LoggerConfig | boolean;
	file?: LoggerConfig & FileConfig;
	datadog?: LoggerConfig & DatadogConfig;
}

export interface ClearedConfig {
	shortCode?: string;
	loki?: { level: LoggerLevel; };
	file?: { level: LoggerLevel; } & FileConfig;
	datadog?: { level: LoggerLevel; } & DatadogConfig;
}

export interface LoggerConfig {
	level?: LoggerLevel;
}

export interface DatadogConfig {
	host: string;
	service: string;
	apikey: string;
}

export interface FileConfig {
	paths: {
		text: string;
		json: string;
	};
}

export type LoggerLevelName = 'emerg'
	| 'errorRuntime'
	| 'errorLogic'
	| 'warn'
	| 'status'
	| 'info'
	| 'debug'
	| 'debugEx';
export type LoggerLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type LoggerLevelColor = 'bold red'
	| 'red'
	| 'yellow'
	| 'bold green'
	| 'blue'
	| 'cyan'
	| 'grey';

export type LoggerLevelType = {
	[key in LoggerLevelName]: LoggerLevel;
};
export type LoggerColorType = {
	[key in LoggerLevelName]: LoggerLevelColor;
};
export type LoggerLevelNames = {
	[key in LoggerLevelName]: LoggerLevelName;
};
