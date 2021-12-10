export interface Config {
    shortCode?: string;
    loki?: LoggerConfig | boolean;
    file?: LoggerConfig & FileConfig;
    datadog?: LoggerConfig & DatadogConfig;
}
export interface ClearedConfig {
    shortCode?: string;
    loki?: {
        level: LoggerLevel;
    };
    file?: {
        level: LoggerLevel;
    } & FileConfig;
    datadog?: {
        level: LoggerLevel;
    } & DatadogConfig;
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
export declare type LoggerLevelName = 'emerg' | 'errorRuntime' | 'errorLogic' | 'warn' | 'status' | 'info' | 'debug' | 'debugEx';
export declare type LoggerLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export declare type LoggerLevelColor = 'bold red' | 'red' | 'yellow' | 'bold green' | 'blue' | 'cyan' | 'grey';
export declare type LoggerLevelType = {
    [key in LoggerLevelName]: LoggerLevel;
};
export declare type LoggerColorType = {
    [key in LoggerLevelName]: LoggerLevelColor;
};