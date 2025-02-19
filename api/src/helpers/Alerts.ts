import type { Primitive, Request } from '@sentry/types';
import { FastifyError, FastifyRequest } from 'fastify';

import nconf from 'nconf';
import Sentry from '@sentry/node';
import cloneDeep from 'lodash.clonedeep';
import cookie from 'cookie';
import url from 'node:url';

import Utilities from './Utilities';

const Alerts = {
  sentryAlertFilter({
    error,
    req,
    translations,
    tags = {},
  }: {
    error: FastifyError & { id: string };
    req: FastifyRequest;
    translations: { [key: string]: string };
    tags: { [key: string]: Primitive };
  }) {
    if (this.sentryErrorFilterRules({ error, translations })) {
      return;
    }

    Sentry.withScope((scope) => {
      scope.addEventProcessor((event) => {
        event.request = this.extractRequestData({ req }) as Request;
        return event;
      });
      scope.setTag('path', req.raw.url);
      scope.setTags(tags);
      if (error.id) scope.setTag('error_id', error.id);
      if (nconf.get('ENVIRONMENT') !== 'testing') {
        Sentry.captureException(error);
      }
    });
  },

  sentryErrorFilterRules({ error, translations }: { error: FastifyError; translations: { [key: string]: string } }) {
    if (error.statusCode && error.statusCode === 401) {
      return true;
    }

    if (error.statusCode === 500) {
      return false;
    }

    if (translations[error.message]) {
      return true;
    }

    return false;
  },

  extractRequestData({ req }: { req: FastifyRequest }) {
    const headers = req.headers || {};
    const { method } = req.raw;
    const host = req.hostname || headers.host || '<no host>';
    const protocol = req.protocol;
    const originalUrl = req.originalUrl || req.raw.url;
    const absoluteUrl = `${protocol}://${host}${originalUrl}`;
    const queryString = url.parse(originalUrl || '', false).query;
    const cookies = cookie.parse(headers.cookie || '');

    let data = req.body;

    if (method === 'GET' || method === 'HEAD') {
      if (typeof data === 'undefined') {
        data = '<unavailable>';
      }
    }
    if (data && typeof data === 'string') {
      const { value } = Utilities.tryParseJson(cloneDeep(data));
      data = value;
    }

    return {
      cookies,
      data,
      headers,
      method,
      query_string: queryString,
      url: absoluteUrl,
    };
  },

  captureExceptionsWithScopes({
    error,
    extras = {},
    tags = {},
  }: {
    error: unknown;
    extras?: { [key: string]: unknown };
    tags?: { [key: string]: Primitive };
  }) {
    Sentry.withScope((scope) => {
      Object.entries(extras).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });

      Sentry.captureException(error);
    });
  },
};

export default Alerts;
