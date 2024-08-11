import { GatewayIntentBits } from 'discord.js';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import '#lib/setup';

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds],
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug
  }
});

async function bootstrap() {
  console.clear();

  try {
    client.logger.info('Logging in...');
    await client.login();
    client.logger.info(`Logged in as ${client.user?.tag}!`);
  } catch (error) {
    client.logger.fatal(error);
    await client.destroy();
    process.exit(1);
  }
}

void bootstrap();
