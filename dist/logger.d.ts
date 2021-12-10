import { Config, LoggerLevel, LoggerLevelName } from './types';
export declare class Logger {
    private static winston;
    private readonly transports;
    private static instance;
    private readonly levels;
    private readonly colors;
    static createInstance(config?: Config): void;
    get defaultLevel(): LoggerLevel;
    get flippedLevels(): {};
    constructor(protector: Symbol, config?: Config);
    private clearConfig;
    private configureLoki;
    private configureFile;
    private configureDatadog;
    private toLog;
    static log(level: LoggerLevelName, text: string, meta?: object): void;
    static emerg(text: string, meta?: object): void;
    static errorRuntime(text: string, meta?: object): void;
    static errorLogic(text: string, meta?: object): void;
    static warn(text: string, meta?: object): void;
    static status(text: string, meta?: object): void;
    static info(text: string, meta?: object): void;
    static debug(text: string, meta?: object): void;
    static debugEx(text: string, meta?: object): void;
}
