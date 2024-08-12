import { ApplicationCommandOptionType, ChannelType, bold } from 'discord.js';
import { Results, SlotMachine, SlotSymbol } from 'slot-machine';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { gamblingSettings } from '#lib/constants';
import { parseMoney, prettyNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Spin the slots machine',
  detailedDescription: {
    usage: '<wager>'
  },
  cooldownDelay: gamblingSettings.cooldown,
  runIn: ChannelType.GuildText
})
export class SlotsCommand extends Command {
  override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'wager',
          description: 'The amount of money to wager',
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

    const wager = interaction.options.getString('wager', true);

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    const machine = new SlotMachine(3, this.symbols);
    const results = machine.play();

    const visualize = this.visualizeMachine(results);
    const points = results.lines.reduce(
      (total, line) => total + line.points,
      0
    );

    const realWager =
      wager === 'all' ? userDoc.economy.wallet : parseMoney(wager);

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
            'You do not have enough money to play this game!'
          )
        ]
      });
    }

    userDoc.economy.wagered += realWager;

    if (points) {
      const profit = realWager * points;

      userDoc.economy.wallet += profit;
      userDoc.economy.transactions.push({
        type: 'income',
        message: `Won a slots game`,
        amount: profit
      });

      interaction.editReply({
        embeds: [
          this.container.embeds.success(
            `You won ${bold(`$${prettyNumber(profit)}`)} with a ${bold(points.toString())} points combination!\n${visualize}`
          )
        ]
      });
    } else {
      userDoc.economy.wallet -= realWager;
      userDoc.economy.transactions.push({
        type: 'expense',
        message: `Lost a slots game`,
        amount: realWager
      });

      interaction.editReply({
        embeds: [
          this.container.embeds.error(
            `You lost ${bold(`$${prettyNumber(realWager)}`)}! Better luck next time!\n${visualize}`
          )
        ]
      });
    }

    return await userDoc.save();
  }

  private visualizeMachine(results: Results) {
    const dollarSigns = ` 💵 💵 💵 `;
    const blackSquare = `⬛`;

    let description = '';

    // Top row
    description += results.lines.slice(-2)[0].isWon
      ? `\n↘`
      : `\n${blackSquare}`;
    description += dollarSigns;
    description += results.lines.slice(-1)[0].isWon ? '↙' : blackSquare;

    // Middle rows
    for (let i = 0; i < results.lines.length - 2; i++) {
      description += results.lines[i].isWon ? `\n➡ ` : `\n${blackSquare} `;
      description += results.lines[i].symbols.map((s) => s.display).join(' ');
      description += results.lines[i].isWon ? ` ⬅` : ` ${blackSquare}`;
    }

    // Bottom row
    description += results.lines.slice(-1)[0].isWon
      ? `\n↗`
      : `\n${blackSquare}`;
    description += dollarSigns;
    description += results.lines.slice(-2)[0].isWon ? '↖' : blackSquare;

    return description;
  }

  private get symbols() {
    return [
      new SlotSymbol('1', {
        display: '🍒',
        points: 1,
        weight: 100
      }),
      new SlotSymbol('2', {
        display: '🍋',
        points: 1,
        weight: 100
      }),
      new SlotSymbol('3', {
        display: '🍇',
        points: 1,
        weight: 100
      }),
      new SlotSymbol('4', {
        display: '🍉',
        points: 1,
        weight: 100
      }),
      new SlotSymbol('5', {
        display: '🍊',
        points: 1,
        weight: 100
      }),
      new SlotSymbol('b', {
        display: '💰',
        points: 10,
        weight: 50
      }),
      new SlotSymbol('c', {
        display: '💎',
        points: 100,
        weight: 25
      }),
      new SlotSymbol('w', {
        display: '🃏',
        points: 1,
        weight: 30,
        wildcard: true
      })
    ];
  }
}
