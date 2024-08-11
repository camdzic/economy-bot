import { EmbedBuilder as DJSEmbedBuilder } from 'discord.js';
import { DefaultColor } from '#lib/constants';

export class EmbedBuilder {
  normal() {
    return new DJSEmbedBuilder().setColor(DefaultColor.Primary);
  }

  success(message: string) {
    return new DJSEmbedBuilder()
      .setTitle('Success!')
      .setDescription(`✅ ${message}`)
      .setColor(DefaultColor.Success);
  }

  error(message: string) {
    return new DJSEmbedBuilder()
      .setTitle('Oops!')
      .setDescription(`❌ ${message}`)
      .setColor(DefaultColor.Error);
  }
}
