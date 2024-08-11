import { ChannelType, bold } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { crimeCommand } from '#lib/constants';
import { prettyNumber, randomNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Commit a crime for money',
  cooldownDelay: crimeCommand.cooldown,
  runIn: ChannelType.GuildText
})
export class CrimeCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }

  override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<'cached'>
  ) {
    await interaction.deferReply();

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    if (userDoc.economy.wallet < crimeCommand.income.min) {
      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You need at least $${prettyNumber(crimeCommand.income.min)} to commit a crime!`
          )
        ]
      });
    }

    const moneyEarned = randomNumber(
      crimeCommand.income.min,
      crimeCommand.income.max
    );
    const caughtChance = randomNumber(0, 100);

    if (caughtChance <= crimeCommand.caughtAt) {
      userDoc.economy.wallet -= crimeCommand.income.min;
      userDoc.economy.transactions.push({
        type: 'expense',
        message: `Got caught committing a crime`,
        amount: moneyEarned
      });
      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You got caught committing a crime and lost ${bold(`$${prettyNumber(crimeCommand.income.min)}`)}`
          )
        ]
      });
    } else {
      userDoc.economy.wallet += moneyEarned;
      userDoc.economy.transactions.push({
        type: 'income',
        message: `Committed a crime`,
        amount: moneyEarned
      });
      await userDoc.save();

      return interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You committed a crime and earned ${bold(`$${prettyNumber(moneyEarned)}`)}`
          )
        ]
      });
    }
  }
}
