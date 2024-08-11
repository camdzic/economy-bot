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

    if (amount === 'all') {
      const userBank = userDoc.economy.bank;

      if (!userBank) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(`You don't have any money to withdraw!`)
          ]
        });
      }

      userDoc.economy.wallet += userBank;
      userDoc.economy.bank = 0;
      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You withdrew ${bold(`$${prettyNumber(userBank)}`)} from your bank!`
          )
        ]
      });
    } else {
      const parsedAmount = parseMoney(amount);

      if (!parsedAmount) {
        return interaction.editReply({
          embeds: [this.container.embeds.error('Invalid amount of money!')]
        });
      }

      if (userDoc.economy.bank < parsedAmount) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(
              `You don't have that much money to withdraw!`
            )
          ]
        });
      }

      userDoc.economy.wallet += parsedAmount;
      userDoc.economy.bank -= parsedAmount;
      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You withdrew ${bold(`$${prettyNumber(parsedAmount)}`)} from your bank!`
          )
        ]
      });
    }
  }
}
