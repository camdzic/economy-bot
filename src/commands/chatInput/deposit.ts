import { ApplicationCommandOptionType, ChannelType, bold } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { parseMoney, prettyNumber } from "#lib/utils";

@ApplyOptions<Command.Options>({
  description: "Deposit money to your bank",
  detailedDescription: {
    usage: "<amount>"
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
          name: "amount",
          description: "The amount of money to deposit",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    await interaction.deferReply();

    const amount = interaction.options.getString("amount", true);

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    const realAmount =
      amount === "all" ? userDoc.economy.wallet : parseMoney(amount);

    if (realAmount < 1) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You must deposit at least ${bold(`$1`)} into your bank!`
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

    userDoc.economy.wallet -= realAmount;
    userDoc.economy.bank += realAmount;
    await userDoc.save();

    return interaction.editReply({
      embeds: [
        this.container.embeds.success(
          `You deposited ${bold(`$${prettyNumber(realAmount)}`)} into your bank!`
        )
      ]
    });
  }
}
