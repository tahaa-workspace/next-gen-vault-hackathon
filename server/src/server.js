import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function start() {
  try {
    await connectDB();
    const app = createApp();
    app.listen(config.port, () => {
      console.log(`Next Gen Vault API running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
