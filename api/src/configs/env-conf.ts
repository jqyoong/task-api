import type { Provider } from 'nconf';

import path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Init nconf according to different envioronment variables.
 *
 * @param {{ nconf: Provider }} param0
 * @returns {void}
 */
export default async ({ nconf, configs = {} }: { nconf: Provider; configs?: Record<string, unknown> }) => {
    const filePath = path.join(__dirname, 'dev.json');

    nconf.overrides(configs).argv({ parseValues: true }).env({ parseValues: true }).file({ file: filePath });
};
