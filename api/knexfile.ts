// Update with your config settings.
import util from 'util';
import nconf from 'nconf';

const setTimeoutPromise = util.promisify(setTimeout);
const migrationScriptsPath = './src/migrations/scripts';

const defaultHandler = async () => {
  try {
    const nconfInit = await import('@configs/env-conf');
    await nconfInit.default({ nconf });

    await setTimeoutPromise(1000);
    if (nconf.get('ENVIRONMENT') === 'local') {
      const { KNEX_DBCONFIG } = await import('@configs/db');
      console.log('PRIMARY:', KNEX_DBCONFIG.primary);
      const config = Object.assign(KNEX_DBCONFIG.primary, {
        migrations: {
          directory: migrationScriptsPath,
          disableMigrationsListValidation: true,
        },
      });
      return config;
    }
  } catch (e) {
    console.log('MIGRATION ERROR');
    console.log(e);
  }
};

export default defaultHandler;
