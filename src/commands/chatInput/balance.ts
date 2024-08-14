import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { bold } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { prettyNumber } from "#lib/utils";

@ApplyOptions<Command.Options>({
  description: "Get balanace",
  detailedDescription: {
    usage: "[target]"
  },
  runIn: ChannelType.GuildText
})
export class BalanceCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: "target",
          description: "The target user",
          type: ApplicationCommandOptionType.User
        }
      ]
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    await interaction.deferReply();

    const target = interaction.options.getUser("target") ?? interaction.user;

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      target.id
    );

    const wallet = prettyNumber(userDoc.economy.wallet);
    const bank = prettyNumber(userDoc.economy.bank);
    const total = prettyNumber(userDoc.economy.wallet + userDoc.economy.bank);
    const wagered = prettyNumber(userDoc.economy.wagered);

    const prettyTransactions = userDoc.economy.transactions
      .slice(-5)
      .map((t) => {
        const type = t.type === "income" ? "+" : "-";

        return `> [${type}$${prettyNumber(t.amount)}] ${t.message}`;
      })
      .reverse()
      .join("\n");

    if (prettyTransactions) {
      return interaction.editReply({
        embeds: [
          this.container.embeds
            .normal()
            .setTitle(`${target.tag}'s Balance`)
            .setDescription(
              `${bold("Wallet:")} $${wallet}\n${bold("Bank:")} $${bank}\n${bold("Total:")} $${total}\n${bold("Wagered:")} $${wagered}\n\n${bold("Recent Transactions:")}\n${prettyTransactions}`
            )
        ]
      });
    } else {
      return interaction.editReply({
        embeds: [
          this.container.embeds
            .normal()
            .setTitle(`${target.tag}'s Balance`)
            .setDescription(
              `${bold("Wallet:")} $${wallet}\n${bold("Bank:")} $${bank}\n${bold("Total:")} $${total}\n${bold("Wagered:")} $${wagered}`
            )
        ]
      });
    }
  }
}
