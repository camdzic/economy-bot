import {
  ApplicationCommandOptionType,
  ChannelType,
  bold,
  userMention
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { parseMoney, prettyNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Pay money to someone',
  detailedDescription: {
    usage: '<target> <amount>'
  },
  runIn: ChannelType.GuildText
})
export class PayCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'target',
          description: 'The target user',
          type: ApplicationCommandOptionType.User,
          required: true
        },
        {
          name: 'amount',
          description: 'The amount of money to pay',
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

    const target = interaction.options.getUser('target', true);
    const amount = interaction.options.getString('amount', true);

    if (target.bot) {
      return interaction.editReply({
        embeds: [this.container.embeds.error(`You can't pay money to a bot!`)]
      });
    }

    if (target.id === interaction.user.id) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(`You can't pay money to yourself!`)
        ]
      });
    }

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    const realAmount =
      amount === 'all' ? userDoc.economy.wallet : parseMoney(amount);

    if (realAmount < 1) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You must pay at least ${bold(`$1`)} to someone!`
          )
        ]
      });
    }

    if (realAmount > userDoc.economy.wallet) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You don't have enough money in your wallet!`
          )
        ]
      });
    }

    const targetDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      target.id
    );

    userDoc.economy.wallet -= realAmount;
    userDoc.economy.transactions.push({
      type: 'expense',
      message: `Paid to ${target.tag}`,
      amount: realAmount
    });
    targetDoc.economy.wallet += realAmount;
    targetDoc.economy.transactions.push({
      type: 'income',
      message: `Received from ${interaction.user.tag}`,
      amount: realAmount
    });
    await userDoc.save();
    await targetDoc.save();

    return interaction.editReply({
      embeds: [
        this.container.embeds.success(
          `You paid ${bold(`$${prettyNumber(realAmount)}`)} to ${userMention(
            target.id
          )}!`
        )
      ]
    });
  }
}
