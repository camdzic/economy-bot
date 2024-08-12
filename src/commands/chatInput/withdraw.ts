import { ApplicationCommandOptionType, bold } from 'discord.js';
import { ChannelType } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { parseMoney, prettyNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Withdraw money from your bank',
  detailedDescription: {
    usage: '<amount>'
  },
  runIn: ChannelType.GuildText
})
export class WithdrawCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'amount',
          description: 'The amount of money to withdraw',
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<'cached'>
  ) {
    await interaction.deferReply();

    const amount = interaction.options.getString('amount', true);

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    const realAmount =
      amount === 'all' ? userDoc.economy.bank : parseMoney(amount);

    if (realAmount < 1) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You must withdraw at least ${bold(`$1`)} from your bank!`
          )
        ]
      });
    }

    if (realAmount > userDoc.economy.bank) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You don't have enough money in your bank!`
          )
        ]
      });
    }

    userDoc.economy.wallet += realAmount;
    userDoc.economy.bank -= realAmount;
    await userDoc.save();

    return interaction.editReply({
      embeds: [
        this.container.embeds.success(
          `You withdrew ${bold(`$${prettyNumber(realAmount)}`)} from your bank!`
        )
      ]
    });
  }
}
