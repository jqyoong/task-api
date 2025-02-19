import path from 'node:path';
import * as url from 'node:url';

import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import nconf from 'nconf';
import AutoLoad from '@fastify/autoload';

import * as pgDb from '@models/pgsql';
import * as appRepo from '@repos/index';

import { Consts } from '@helpers/index';
import { DRIZZLE_DBCONFIG } from '@configs/db';

const supportedLocales = nconf.get('SUPPORTED_LOCALES');
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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

  app.addHook('onClose', async () => {
    pgDb.closeDbConns;
  });

  done();
};

export default app;
