import {
  ApplicationCommandOptionType,
  ChannelType,
  bold,
  userMention
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { robCommand } from "#lib/constants";
import { prettyNumber, proportionOf, randomNumber } from "#lib/utils";

@ApplyOptions<Command.Options>({
  description: "Rob someone",
  cooldownDelay: robCommand.cooldown,
  runIn: ChannelType.GuildText
})
export class RobCommand extends Command {
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
        }
      ]
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    await interaction.deferReply();

    const target = interaction.options.getUser("target", true);

    if (target.bot) {
      return interaction.editReply({
        embeds: [this.container.embeds.error(`You can't rob a bot!`)]
      });
    }

    if (target.id === interaction.user.id) {
      return interaction.editReply({
        embeds: [this.container.embeds.error(`You can't rob yourself!`)]
      });
    }

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    if (userDoc.economy.wallet < robCommand.min) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You need at least ${bold(`$${prettyNumber(robCommand.min)}`)} to rob someone!`
          )
        ]
      });
    }

    const targetDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      target.id
    );

    if (targetDoc.economy.wallet < robCommand.min) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `The target doesn't have enough money to be robbed!`
          )
        ]
      });
    }

    const caughtChance = randomNumber(0, 100);

    if (caughtChance <= robCommand.caughtAt) {
      const stolenAmount = proportionOf(
        targetDoc.economy.wallet,
        robCommand.proportion
      );

      userDoc.economy.wallet += stolenAmount;
      userDoc.economy.transactions.push({
        type: "income",
        message: `Robbed ${target.tag}`,
        amount: stolenAmount
      });
      targetDoc.economy.wallet -= stolenAmount;
      targetDoc.economy.transactions.push({
        type: "expense",
        message: `Robbed by ${interaction.user.tag}`,
        amount: stolenAmount
      });
      await userDoc.save();
      await targetDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You robbed ${userMention(target.id)} and stole ${bold(`$${prettyNumber(stolenAmount)}`)} from them!`
          )
        ]
      });
    } else {
      const fineAmount = proportionOf(
        userDoc.economy.wallet,
        robCommand.proportion
      );

      userDoc.economy.wallet -= fineAmount;
      userDoc.economy.transactions.push({
        type: "expense",
        message: `Got caught robbing someone`,
        amount: fineAmount
      });
      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You got caught robbing ${userMention(target.id)} and had to pay a fine of ${bold(`$${prettyNumber(fineAmount)}`)}`
          )
        ]
      });
    }
  }
}
