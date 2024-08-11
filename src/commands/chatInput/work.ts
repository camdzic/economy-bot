import { ChannelType, bold } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { workCommand } from '#lib/constants';
import { pickRandom, prettyNumber, randomNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Work for money',
  cooldownDelay: workCommand.cooldown,
  runIn: ChannelType.GuildText
})
export class WorkCommand extends Command {
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

    const workedJob = pickRandom(workCommand.jobs);
    const earnedMoney = randomNumber(
      workCommand.income.min,
      workCommand.income.max
    );

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    userDoc.economy.wallet += earnedMoney;
    userDoc.economy.transactions.push({
      type: 'income',
      message: `Worked as a ${workedJob}`,
      amount: earnedMoney
    });
    await userDoc.save();

    return interaction.editReply({
      embeds: [
        this.container.embeds.success(
          `You worked as a ${workedJob} and earned ${bold(`$${prettyNumber(earnedMoney)}`)}`
        )
      ]
    });
  }
}
