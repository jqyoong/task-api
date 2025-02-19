import type Redoc from 'redoc';
import { OpenAPI } from 'openapi-types';
import { FastifyPluginAsync } from 'fastify';

import { Tracer, FastitfySwagger } from '@helpers/index';

const routes: FastifyPluginAsync = async (server) => {
    server.get(
        '/',
        {
            schema: {
                hide: true,
            },
        },
        function handler() {
            const swaggerDoc: OpenAPI.Document<Record<string, unknown>> & { 'x-tagGroups'?: Redoc.TagGroup[] } = this.swagger();
            return Tracer.traceFunction({
                name: 'controller.getSwaggerDoc',
                promise: async function () {
                    const tags = [...FastitfySwagger.tags, ...FastitfySwagger.modelTags];

                    swaggerDoc['x-tagGroups'] = [
                        { name: 'APIs', tags: tags?.filter((tag) => !tag.name.includes('Model')).map((tag) => tag.name) || [] },
                        { name: 'Models', tags: tags?.filter((tag) => tag.name.includes('Model')).map((tag) => tag.name) || [] },
                    ];

                    return swaggerDoc;
                },
            });
        }
    );
};

export default routes;
