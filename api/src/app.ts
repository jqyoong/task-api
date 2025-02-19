import path from 'node:path';
import * as url from 'node:url';

import { FastifyError, FastifyPluginCallback, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import nconf from 'nconf';
import { v4 as uuid } from 'uuid';
import AutoLoad from '@fastify/autoload';

import * as pgDb from '@models/pgsql';
import * as appRepo from '@repos/index';
import TSLib from '@locales/index';

import { CustomError, Logger, Tracer, Alerts, Consts } from '@helpers/index';
import { DRIZZLE_DBCONFIG } from '@configs/db';

const supportedLocales = nconf.get('SUPPORTED_LOCALES');
const translationsShelf = await TSLib({ supportedLocales });
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ENABLE_SENTRY_TOGGLE = nconf.get('ENABLE_SENTRY_TOGGLE');

const app: FastifyPluginCallback = async (app, opts: FastifyPluginOptions, done) => {
  app.register(async () => {
    if (nconf.get('ENVIRONMENT') === Consts.ENV.local) {
      return pgDb.init({ dbConns: DRIZZLE_DBCONFIG });
    }
  });
  app.register(async () => {
    await appRepo.init();
  });
  app.register(import('@fastify/helmet'), { global: true });
  app.register(import('@fastify/cors'), { origin: '*' });
  app.register(import('fastify-language-parser'), {
    fallbackLng: nconf.get('LOCALE'),
    order: ['query', 'header'],
    supportedLngs: supportedLocales,
  });
  app.register(import('@fastify/rate-limit'), {
    global: false,
    max: 3000,
    allowList: ['127.0.0.1'],
    skipOnError: true,
    addHeaders: {
      // default show all the response headers when rate limit is reached
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    keyGenerator: (req) => {
      return req.headers['x-real-ip'] ? `${req.headers['x-real-ip']}` : req?.connection?.remoteAddress || req.ip;
    },
  });
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  app.register(AutoLoad, {
    dir: path.join(__dirname, 'middlewares'),
    forceESM: true,
    options: Object.assign({}, opts),
  });

  app.register(AutoLoad, {
    dir: path.join(__dirname, 'routes/v1'),
    forceESM: true,
    options: Object.assign(opts, {
      prefix: `${opts?.prefix ? '' : '/api'}/v1`,
    }),
    ignorePattern: /(?:test|spec|config)\.ts$/,
    maxDepth: 2,
  });

  app.setErrorHandler((error: FastifyError & CustomError & { id: string }, req: FastifyRequest, reply: FastifyReply) => {
    const errorId = uuid();
    let statusCode = error.statusCode || 400;
    const customError = {
      // follow back statusCode
      frontend_enum: '',
      message: error.message,
      details: error.details || error.message || null,
      id: errorId,
    };
    error.id = errorId;
    Tracer.setSpanTag('error.id', { key: 'error.id', value: errorId });
    // Only fastify validation errors and CustomError should have 4xx error codes
    // Other uncaught exceptions should be 500 with a short message to avoid exposing too much information to users
    if (!(error.validation || error instanceof CustomError)) {
      statusCode = 500;
      customError.message = 'INTERNAL_SERVER_ERROR';
    }

    const translations = translationsShelf[req.detectedLng];
    if (ENABLE_SENTRY_TOGGLE) {
      // Sentry Alert rules
      Alerts.sentryAlertFilter({ error, req, translations, tags: { trace_id: Tracer.getTraceId() } });
    }

    if (!translations[customError.message]) {
      req.log.error(error);
      Logger.error(error);
    }

    if (translations[customError.message]) {
      customError.frontend_enum = customError.message;
      customError.message = translations[customError.message];

      if (error.replaceKeyWords) {
        error.replaceKeyWords.forEach((keyword, index) => {
          customError.message = customError.message.replace(keyword, error.replaceWords[index]);
        });
      }
      error.frontendEnum = customError.frontend_enum;
      error.details = customError.message;
      Logger.error(error);
    }

    reply.code(statusCode).send(customError);
  });

  app.addHook('onClose', async () => {
    pgDb.closeDbConns;
  });

  done();
};

export default app;
