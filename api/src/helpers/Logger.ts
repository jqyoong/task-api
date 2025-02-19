import type { Level } from 'pino-multi-stream';

import nconf from 'nconf';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import pinoDatadog from 'pino-datadog';

const LOGGER_LEVEL = {
  trace: { label: 'trace', number: 10 },
  debug: { label: 'debug', number: 20 },
  info: { label: 'info', number: 30 },
  warn: { label: 'warn', number: 40 },
  error: { label: 'error', number: 50 },
  fatal: { label: 'fatal', number: 60 },
};

const level = (LOGGER_LEVEL[nconf.get('LOG_LEVEL') as keyof typeof LOGGER_LEVEL]?.label as Level) || LOGGER_LEVEL?.trace?.label;
const streams = [];

if (nconf.get('ENABLE_TERMINAL_LOG_STREAM')) {
  const prettyStream = pinoms.prettyStream();
  streams.push({ stream: prettyStream, level });
}

if (nconf.get('ENABLE_DATADOG_LOG_STREAM')) {
  const streamToDatadog = pinoDatadog.createWriteStreamSync({
    apiKey: nconf.get('DATADOG_API_KEY'),
    hostname: nconf.get('DATADOG_TRACER_HOSTNAME'),
    service: nconf.get('DATADOG_TRACER_SERVICE_NAME_V3'),
    ddtags: `env:${nconf.get('ENVIRONMENT')}`,
  });
  streams.push({ stream: streamToDatadog, level });
}

const defaultPinoOptions: pinoms.LoggerOptions = {
  formatters: {
    bindings: () => ({}),
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: ['*.event.*.password', 'event.*.password'],
    censor: '[redacted]',
  },
  timestamp: process.env.NODE_ENV === 'development' ? undefined : pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development'
    ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
        },
      }
    : {}),
};

const Logger = streams.length > 0 ? pinoms(Object.assign({}, { streams }, defaultPinoOptions)) : pinoms(defaultPinoOptions);

export default Logger;
