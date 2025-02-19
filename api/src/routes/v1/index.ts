import { FOSchema } from "@def/types/fastify-schema";

import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

const routes: FastifyPluginAsync = async (server) => {
    server.get(
        "/health",
        {
            schema: {
                summary: "Get server health",
                description: "Get server health",
                response: {
                    200: Type.Object({
                        root: Type.String(),
                    }),
                },
            } as FOSchema,
        },
        async function () {
            return { root: "hi" };
        }
    );
};

export default routes;
