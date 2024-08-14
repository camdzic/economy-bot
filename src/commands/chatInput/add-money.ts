import {
  ApplicationCommandOptionType,
  ChannelType,
  bold,
  userMention
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { prettyNumber } from "#lib/utils";

@ApplyOptions<Command.Options>({
  description: "Add money to someone",
  detailedDescription: {
    usage: "<target> <amount>"
  },
  requiredUserPermissions: "ManageGuild",
  runIn: ChannelType.GuildText
})
export class AddMoneyCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: "target",
          description: "The target user",
          type: ApplicationCommandOptionType.User,
          required: true
        },
        {
          name: "amount",
          description: "The amount of money to add",
          type: ApplicationCommandOptionType.Integer,
          minValue: 1,
          maxValue: 100000000,
          required: true
        }
      ]
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    await interaction.deferReply();

    const target = interaction.options.getUser("target", true);
    const amount = interaction.options.getInteger("amount", true);

    if (target.bot) {
      return interaction.editReply({
        embeds: [this.container.embeds.error(`You can't add money to a bot!`)]
      });
    }

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      target.id
    );

    userDoc.economy.wallet += amount;
    userDoc.economy.transactions.push({
      type: "income",
      message: `Added by ${interaction.user.tag}`,
      amount: amount
    });
    await userDoc.save();

    return interaction.editReply({
      embeds: [
        this.container.embeds.success(
          `You added ${bold(`$${prettyNumber(amount)}`)} to ${userMention(target.id)}'s wallet!`
        )
      ]
    });
  }
}
