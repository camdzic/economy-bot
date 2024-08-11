import {
  ChatInputCommandDeniedPayload,
  Events,
  Listener,
  UserError
} from '@sapphire/framework';

export class ChatInputCommandDeniedListener extends Listener<
  typeof Events.ChatInputCommandDenied
> {
  override async run(error: unknown, payload: ChatInputCommandDeniedPayload) {
    if (!(error instanceof UserError)) return;

    if (Reflect.get(Object(error.context), 'silent')) return;

    if (payload.interaction.deferred || payload.interaction.replied) {
      return payload.interaction.editReply({
        embeds: [this.container.embeds.error(error.message)]
      });
    }

    return payload.interaction.reply({
      embeds: [this.container.embeds.error(error.message)],
      ephemeral: true
    });
  }
}
