import { ApplicationCommandOptionType, ChannelType, bold } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';

@ApplyOptions<Command.Options>({
  description: 'Get help with commands',
  runIn: ChannelType.GuildText
})
export class HelpCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'command',
          description: 'The command to get help with',
          type: ApplicationCommandOptionType.String
        }
      ]
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    await interaction.deferReply();

    const commandName = interaction.options.getString('command');

    if (commandName) {
      const command = this.container.stores
        .get('commands')
        .find((c) => c.name === commandName);

      if (!command) {
        return interaction.editReply({
          embeds: [this.container.embeds.error("I couldn't find that command!")]
        });
      }

      return interaction.editReply({
        embeds: [
          this.container.embeds
            .normal()
            .setTitle(toTitleCase(command.name))
            .addFields(
              {
                name: 'Description',
                value: command.description
              },
              {
                name: 'Usage',
                value: `/${command.name} ${command.detailedDescription.usage ?? ''}`
              }
            )
        ]
      });
    } else {
      const prettyCommands = this.container.stores
        .get('commands')
        .filter((c) => c.enabled)
        .map((c) => `> ${bold(`/${c.name}`)}・${c.description}`)
        .join('\n');

      return interaction.editReply({
        embeds: [
          this.container.embeds
            .normal()
            .setTitle('Commands')
            .setDescription(prettyCommands)
        ]
      });
    }
  }
}
