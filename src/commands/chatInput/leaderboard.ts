import { ChannelType, userMention } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { prettyNumber } from "#lib/utils";
import { ExtendedPaginatedMessage } from "#utilities/ExtendedPaginationMessage";

@ApplyOptions<Command.Options>({
  description: "Get top 10 users with the most money",
  runIn: ChannelType.GuildText
})
export class LeaderboardCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    const leaderboard = this.container.services.leaderboard.getLeaderboard(
      interaction.guildId
    );
    const chunks = this.chunkArray(leaderboard);

    const paginatedMessage = new ExtendedPaginatedMessage({
      pages: chunks.map((chunk) => ({
        embeds: [
          this.container.embeds
            .normal()
            .setTitle("Leaderboard")
            .setDescription(
              chunk
                .map(
                  (c) =>
                    `${c.i}. ${userMention(c.userId)}・$${prettyNumber(c.money)}`
                )
                .join("\n")
            )
        ]
      }))
    })
      .setIdle(Time.Minute * 3)
      .setWrongUserInteractionReply(() => {
        return {
          embeds: [
            this.container.embeds.error(
              `You can't interact with this message! Only ${interaction.user} can!`
            )
          ],
          ephemeral: true
        };
      });
    paginatedMessage.pageIndexPrefix = "Page";

    return paginatedMessage.run(interaction, interaction.user);
  }

  private chunkArray<T>(array: T[]) {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += 10) {
      result.push(array.slice(i, i + 10));
    }

    return result;
  }
}
