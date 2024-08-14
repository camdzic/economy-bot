import { ApplicationCommandOptionType, ChannelType, bold } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { cockfightCommand, gamblingSettings } from "#lib/constants";
import { parseMoney, prettyNumber, randomNumber } from "#lib/utils";

@ApplyOptions<Command.Options>({
  description: "Fight against another chicken",
  detailedDescription: {
    usage: "<wager>"
  },
  cooldownDelay: gamblingSettings.cooldown,
  runIn: ChannelType.GuildText
})
export class CockfightCommand extends Command {
  private winRates = new Map<string, number>();

  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: "wager",
          description: "The amount of money to wager",
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

    const wager = interaction.options.getString("wager", true);

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    const game = this.initializeGame(interaction.guildId, interaction.user.id);

    const realWager =
      wager === "all" ? userDoc.economy.wallet : parseMoney(wager);

    if (realWager < gamblingSettings.min) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You need at least ${bold(`$${prettyNumber(gamblingSettings.min)}`)} to play this game!`
          )
        ]
      });
    }

    if (realWager > userDoc.economy.wallet) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            "You do not have enough money to play this game!"
          )
        ]
      });
    }

    userDoc.economy.wagered += realWager;

    if (game.winner === "user") {
      userDoc.economy.wallet += realWager;
      userDoc.economy.transactions.push({
        type: "income",
        message: "Won a cockfight game",
        amount: realWager
      });

      interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You won ${bold(`$${prettyNumber(realWager)}`)}! Your win rate is now ${bold(`${game.rates.user}%`)} and the bot's win rate is ${bold(`${game.rates.bot}%`)}`
          )
        ]
      });
    } else {
      userDoc.economy.wallet -= realWager;
      userDoc.economy.transactions.push({
        type: "expense",
        message: "Lost a cockfight game",
        amount: realWager
      });

      interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You lost ${bold(`$${prettyNumber(realWager)}`)}! Your win rate was ${bold(`${game.rates.user}%`)} and the bot's win rate was ${bold(`${game.rates.bot}%`)}`
          )
        ]
      });
    }

    return await userDoc.save();
  }

  private getWinRate(guildId: string, userId: string) {
    return (
      this.winRates.get(`${guildId}:${userId}`) ??
      cockfightCommand.startingWinRate
    );
  }

  private setWinRate(guildId: string, userId: string, newWinRate: number) {
    this.winRates.set(`${guildId}:${userId}`, newWinRate);
  }

  private initializeGame(guildId: string, userId: string) {
    const winRate = this.getWinRate(guildId, userId);
    const botWinRate = 100 - winRate - 1;

    const randomRate = randomNumber(1, 100);

    if (randomRate < winRate) {
      const newWinRate = Math.min(winRate + 1, cockfightCommand.maxWinRate);
      this.setWinRate(guildId, userId, newWinRate);

      return {
        winner: "user",
        rates: {
          user: newWinRate,
          bot: botWinRate
        }
      };
    } else {
      this.setWinRate(guildId, userId, cockfightCommand.startingWinRate);

      return {
        winner: "bot",
        rates: {
          user: winRate,
          bot: botWinRate + 1
        }
      };
    }
  }
}
