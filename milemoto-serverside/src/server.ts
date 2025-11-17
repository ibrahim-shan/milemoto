import { app } from './app.js';
import { env } from './config/env.js';
import { loadRuntimeFlags } from './config/runtime.js';
import { pingDB } from './db/pool.js';
import { logger } from './utils/logger.js';

async function main() {
  await pingDB();
  await loadRuntimeFlags();
  app.listen(env.PORT, () => logger.info(`API listening on http://localhost:${env.PORT}`));
}
main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
