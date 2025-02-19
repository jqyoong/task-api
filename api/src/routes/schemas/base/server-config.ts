import { Type } from '@sinclair/typebox';

const ServerConfigs = Type.Object(
    {},
    {
        patternProperties: {
            '.*': Type.Object({
                value: Type.Union([Type.Record(Type.String(), Type.Any()), Type.Number(), Type.String(), Type.Array(Type.String())]),
                is_editable: Type.Boolean(),
            }),
        },
        additionalProperties: false,
    }
);

export default ServerConfigs;
