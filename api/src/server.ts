import 'dotenv/config';
import cluster from 'node:cluster';
import os from 'node:os';
import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import dayjs from 'dayjs';
import nconf from 'nconf';
import Sentry from '@sentry/node';
import DDTracer from 'dd-trace';
// init the nconf before every functions
await (await import('@configs/env-conf')).default({ nconf });

const ENABLE_SENTRY_TOGGLE = nconf.get('ENABLE_SENTRY_TOGGLE');
const ENABLE_DATADOG_TOGGLE = nconf.get('ENABLE_DATADOG_TRACER_TOGGLE');

if (ENABLE_SENTRY_TOGGLE) {
    Sentry.init({
        dsn: nconf.get('SENTRY_DSN_KEY'),
        environment: nconf.get('ENVIRONMENT'),
    });
}

if (ENABLE_DATADOG_TOGGLE) {
    DDTracer.init({
        hostname: nconf.get('DATADOG_TRACER_HOSTNAME'),
        port: 8126,
        service: nconf.get('DATADOG_TRACER_SERVICE_NAME'),
        env: nconf.get('ENVIRONMENT'),
        logInjection: true,
        reportHostname: true,
        runtimeMetrics: true,
        dogstatsd: { hostname: nconf.get('DATADOG_TRACER_HOSTNAME') },
        ingestion: { sampleRate: nconf.get('DD_INGESTION_SAMPLE_RATE') },
        startupLogs: false,
    });

    DDTracer.use('fastify', {
        hooks: {
            request: (span, req) => {
                span?.setTag('user.ip', req?.headers['x-real-ip'] || req?.headers['x-forwarded-for']);
            },
        },
        enabled: true,
    });
}

console.log('Current ENV: ', process.env.ENVIRONMENT);

const server = fastify({
    ajv: {
        customOptions: {
            removeAdditional: 'all',
            coerceTypes: 'array',
            useDefaults: true,
            allErrors: true,
        },
    },
    logger: {
        transport:
            process.env.ENVIRONMENT !== 'production'
                ? {
                      target: 'pino-pretty',
                      options: {
                          colorize: true,
                          translateTime: 'HH:MM:ss Z',
                          ignore: 'pid,hostname',
                      },
                  }
                : undefined,
        level: 'info',
        redact: ['req.headers.authorization'],
        serializers: {
            res(res) {
                return {
                    statusCode: res.statusCode,
                };
            },
            req(req) {
                return {
                    time: dayjs().format('YYYY-MM-DD HH:MM:ss ZZ'),
                    method: req.method,
                    url: req.url,
                    language: req.headers['accept-language'],
                    remoteAddress: req?.socket?.remoteAddress || '',
                    remotePort: req.socket.remotePort,
                };
            },
        },
    },
    pluginTimeout: 40000,
    keepAliveTimeout: 180 * 1000,
    bodyLimit: 1748576,
}).withTypeProvider<TypeBoxTypeProvider>();

await server.register(import('./app'), { prefix: '/api' });

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error(err);
});

const startAPIServer = () => {
    const port = Number(process.env.PORT) || 3000;
    server.listen({ port, host: '0.0.0.0' }, (err) => {
        if (err) {
            server.log.error(err);
        }
    });
    console.log(`Worker ${process.pid} started on port ${port}`);
};

if (nconf.get('IS_CLUSTER_APP')) {
    if (cluster.isPrimary) {
        process.title = 'primary';

        os.cpus().forEach(function (cpu, index) {
            cluster.fork({ workerId: index + 1 });
        });

        console.log(`Master ${process.pid} is running`);
        cluster.on('exit', function (worker) {
            console.log(`Worker Process crashed: worker ${worker.id} died`);
            cluster.fork({ workerId: worker.id });
        });
    } else {
        startAPIServer();
    }
} else {
    startAPIServer();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () =>
        server.close().then((err) => {
            console.log(`close application on ${signal}`);
            process.exit(err ? 1 : 0);
        })
    );
}
