import { join } from 'path';
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  container
} from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import { setup } from '@skyra/env-utilities';
import { DatabaseHelper } from '#helpers/DatabaseHelper';
import { rootDir } from '#lib/constants';
import { EmbedBuilder } from '#utilities/EmbedBuilder';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);

setup({ path: join(rootDir, '.env') });

container.embeds = new EmbedBuilder();
container.helpers = {
  database: new DatabaseHelper()
};
