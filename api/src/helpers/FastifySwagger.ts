import type { RouteOptions } from 'fastify';
import type { OpenAPIV3_1 } from 'openapi-types';
import type { CustomErrorSchema } from '@def/types/fastify-schema';

import nconf from 'nconf';
import { Type } from '@sinclair/typebox';

import { Utilities } from '@helpers/index';
import TSLib from '@locales/index';

const supportedLocales = nconf.get('SUPPORTED_LOCALES');
const translationsShelf = await TSLib({ supportedLocales });

type CustomRouteOptions = RouteOptions & {
  schema: CustomErrorSchema;
};

class FastitfySwagger {
  tags: OpenAPIV3_1.TagObject[];
  modelTags: OpenAPIV3_1.TagObject[];
  schemas: Record<string, OpenAPIV3_1.SchemaObject>;

  constructor() {
    this.tags = [];
    this.modelTags = [];
    this.schemas = {};
  }

  init({ modelSchemas }: { modelSchemas: Record<string, OpenAPIV3_1.SchemaObject['properties']> }) {
    Object.keys(modelSchemas).forEach((key) => {
      if (!['Pagination'].includes(key)) {
        this.modelTags.push({ name: `${key}Model`, description: `<SchemaDefinition schemaRef="#/components/schemas/${key}" />` });
        this.schemas[key] = { type: 'object', properties: modelSchemas[key] };
      }
    });
  }

  urlHandler(routeOptions: RouteOptions) {
    const { url, schema, method } = routeOptions;

    if (!url.includes('/v1') || method === 'HEAD') return;

    const path = url.split('/v1/')[1];
    const [tagName, ...remaining] = path.split('/');
    let tagNameSingular;
    if (tagName.endsWith('ies')) tagNameSingular = tagName.replace(new RegExp('ies$'), 'y');
    else if (tagName.endsWith('s')) tagNameSingular = tagName.replace(new RegExp('s$'), '');
    else tagNameSingular = tagName;

    const startCaseTagName = Utilities.startCase(tagNameSingular);
    if (!startCaseTagName) return;

    const exist = this.tags.find((tag) => tag.name === startCaseTagName);
    if (!exist) this.tags.push({ name: startCaseTagName, description: `${startCaseTagName} functions` });

    if (!schema) return;

    schema.tags = schema.tags ? [...schema.tags, startCaseTagName] : [startCaseTagName];

    if (schema.summary) return;

    let summary;
    if (method === 'POST' && !remaining.length) summary = `Create ${startCaseTagName}`;
    else if (method === 'GET' && !remaining.length) summary = `Get ${startCaseTagName} List`;
    else if (method === 'GET' && (remaining[0] === ':id' || remaining[0] === `:${tagName}Id`)) summary = `Get ${startCaseTagName} By ID`;
    else if (method === 'PATCH' && !remaining.length) summary = `Update ${startCaseTagName} By ID`;
    else if (method === 'DELETE' && !remaining.length) summary = `Delete ${startCaseTagName} By ID`;
    else summary = `${method} /${path}`;
    schema.summary = summary;
  }

  errorHandler(routeOptions: CustomRouteOptions) {
    const { schema } = routeOptions;

    if (schema && schema.response) {
      Object.keys(schema.response).forEach((statusCode: string) => {
        const isErrorStatusCode = ['4', '5'].includes(statusCode[0]);
        const frontendEnum = schema.response[statusCode].errors;

        if (!(isErrorStatusCode && frontendEnum)) return;

        const StringEnum = <T extends string[]>(values: [...T]) =>
          Type.Unsafe<T[number]>({
            type: 'string',
            enum: values,
            description: `${values
              .map((frontendEnum) => `***${frontendEnum}*** - ${translationsShelf['en-MY'][frontendEnum]}`)
              .join('\n')}`,
          });

        schema.response[statusCode] = Type.Object({
          frontend_enum: StringEnum(frontendEnum),
          message: Type.String(),
          details: Type.Object({}),
          id: Type.String(),
        });
      });
    }
  }

  onRouteHook(routeOptions: RouteOptions) {
    this.urlHandler(routeOptions);
    this.errorHandler(routeOptions as CustomRouteOptions);
  }
}

export default new FastitfySwagger();
