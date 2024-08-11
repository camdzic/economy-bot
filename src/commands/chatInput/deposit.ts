import { ApplicationCommandOptionType, ChannelType, bold } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { parseMoney, prettyNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Deposit money to your bank',
  detailedDescription: {
    usage: '<amount>'
  },
  runIn: ChannelType.GuildText
})
export class DepositCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'amount',
          description: 'The amount of money to deposit',
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
      const userWallet = userDoc.economy.wallet;

      if (!userWallet) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(`You don't have any money to deposit!`)
          ]
        });
      }

      userDoc.economy.bank += userWallet;
      userDoc.economy.wallet = 0;

      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You deposited ${bold(`$${prettyNumber(userWallet)}`)} into your bank!`
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

      if (userDoc.economy.wallet < parsedAmount) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(
              `You don't have that much money to deposit!`
            )
          ]
        });
      }

      userDoc.economy.wallet -= parsedAmount;
      userDoc.economy.bank += parsedAmount;
      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You deposited ${bold(`$${prettyNumber(parsedAmount)}`)} into your bank!`
          )
        ]
      });
    }
  }
}
