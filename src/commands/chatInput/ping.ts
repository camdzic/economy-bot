import { ChannelType } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
  description: 'Replies with "Pong!"',
  runIn: ChannelType.GuildText
})
export class PingCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const pingMessage = await interaction.reply({
      content: "Pong!"
    });

    return interaction.editReply({
      content: `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
        pingMessage.createdTimestamp - interaction.createdTimestamp
      }ms.`
    });
  }
}
