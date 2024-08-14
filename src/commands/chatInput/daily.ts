import { ChannelType, bold } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { dailyCommand } from "#lib/constants";
import { prettyNumber, randomNumber } from "#lib/utils";

@ApplyOptions<Command.Options>({
  description: "Collect daily reward",
  cooldownDelay: Time.Day,
  runIn: ChannelType.GuildText
})
export class DailyCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    await interaction.deferReply();

    const earnedMoney = randomNumber(
      dailyCommand.income.min,
      dailyCommand.income.max
    );

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    userDoc.economy.wallet += earnedMoney;
    userDoc.economy.transactions.push({
      type: "income",
      message: `Collected daily reward`,
      amount: earnedMoney
    });
    await userDoc.save();

    return interaction.editReply({
      embeds: [
        this.container.embeds.success(
          `You collected your daily reward and earned ${bold(`$${prettyNumber(earnedMoney)}`)}`
        )
      ]
    });
  }
}
