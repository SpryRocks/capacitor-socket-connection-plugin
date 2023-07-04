import {
  CoreLogData,
  ILoggerFactory,
  ILoggerObserver,
  LogData,
  LoggerFactory,
  LoggerObserver,
} from '@spryrocks/logger-plugin';

const _loggerObserver = new LoggerObserver();
const loggerObserver: ILoggerObserver = _loggerObserver;

const pluginName = 'SocketConnectionPlugin';

const prepareLogData = ({data}: {data: CoreLogData}): LogData => ({
  ...data,
  plugin: pluginName,
  action: undefined,
});

const factory: ILoggerFactory = new LoggerFactory({
  notifier: _loggerObserver,
  prepareLogData,
  globalData: undefined,
});

const createLogger = (tag?: string) => factory.createLogger(tag);

export {loggerObserver as LoggerObserver, createLogger};
