import { ApplicationCommandOptionType, ChannelType, bold } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { DefaultColor, gamblingSettings } from '#lib/constants';
import { parseMoney, prettyNumber, randomNumber } from '#lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Play a dice game',
  detailedDescription: {
    usage: 'dice 500'
  },
  cooldownDelay: gamblingSettings.cooldown,
  runIn: ChannelType.GuildText
})
export class DiceCommand extends Command {
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
        },
        {
          name: 'guess',
          description: 'The number you think the dice will roll',
          type: ApplicationCommandOptionType.Integer,
          minValue: 1,
          maxValue: 6,
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
    const guess = interaction.options.getInteger('guess', true);

    const userDoc = await this.container.helpers.database.getUserDocument(
      interaction.guildId,
      interaction.user.id
    );

    const diceRoll = randomNumber(1, 6);

    if (wager === 'all') {
      const userWallet = userDoc.economy.wallet;

      if (userWallet < gamblingSettings.min) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(
              `You need at least ${bold(`$${prettyNumber(gamblingSettings.min)}`)} to play this game!`
            )
          ]
        });
      }

      userDoc.economy.wagered += userWallet;

      if (diceRoll === guess) {
        userDoc.economy.wallet += userWallet;
        userDoc.economy.transactions.push({
          type: 'income',
          message: `Won a dice game`,
          amount: userWallet
        });

        interaction.editReply({
          embeds: [
            this.container.embeds
              .normal()
              .setTitle('Dice Win')
              .setDescription('You guessed correctly!')
              .addFields(
                {
                  name: 'Guess',
                  value: guess.toString(),
                  inline: true
                },
                {
                  name: 'Dice Roll',
                  value: diceRoll.toString(),
                  inline: true
                },
                {
                  name: 'Profit',
                  value: `$${prettyNumber(userWallet)}`,
                  inline: true
                }
              )
              .setColor(DefaultColor.Success)
          ]
        });
      } else {
        userDoc.economy.wallet -= userWallet;
        userDoc.economy.transactions.push({
          type: 'expense',
          message: `Lost a dice game`,
          amount: userWallet
        });

        interaction.editReply({
          embeds: [
            this.container.embeds
              .normal()
              .setTitle('Dice Loss')
              .setDescription('You guessed incorrectly!')
              .addFields(
                {
                  name: 'Guess',
                  value: guess.toString(),
                  inline: true
                },
                {
                  name: 'Dice Roll',
                  value: diceRoll.toString(),
                  inline: true
                },
                {
                  name: 'Loss',
                  value: `$${prettyNumber(userWallet)}`,
                  inline: true
                }
              )
              .setColor(DefaultColor.Error)
          ]
        });
      }
    } else {
      const parsedAmount = parseMoney(wager);

      if (!parsedAmount) {
        return interaction.editReply({
          embeds: [this.container.embeds.error('Invalid amount of money!')]
        });
      }

      if (parsedAmount < gamblingSettings.min) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(
              `You need at least  ${bold(`$${prettyNumber(gamblingSettings.min)}`)} to play this game!`
            )
          ]
        });
      }

      if (parsedAmount > userDoc.economy.wallet) {
        return interaction.editReply({
          embeds: [
            this.container.embeds.error(
              'You do not have enough money to play this game!'
            )
          ]
        });
      }

      userDoc.economy.wagered += parsedAmount;

      if (diceRoll === guess) {
        userDoc.economy.wallet += parsedAmount;
        userDoc.economy.transactions.push({
          type: 'income',
          message: `Won a dice game`,
          amount: parsedAmount
        });

        interaction.editReply({
          embeds: [
            this.container.embeds
              .normal()
              .setTitle('Dice Win')
              .setDescription('You guessed correctly!')
              .addFields(
                {
                  name: 'Guess',
                  value: guess.toString(),
                  inline: true
                },
                {
                  name: 'Dice Roll',
                  value: diceRoll.toString(),
                  inline: true
                },
                {
                  name: 'Profit',
                  value: `$${prettyNumber(parsedAmount)}`,
                  inline: true
                }
              )
              .setColor(DefaultColor.Success)
          ]
        });
      } else {
        userDoc.economy.wallet -= parsedAmount;
        userDoc.economy.transactions.push({
          type: 'expense',
          message: `Lost a dice game`,
          amount: parsedAmount
        });

        interaction.editReply({
          embeds: [
            this.container.embeds
              .normal()
              .setTitle('Dice Loss')
              .setDescription('You guessed incorrectly!')
              .addFields(
                {
                  name: 'Guess',
                  value: guess.toString(),
                  inline: true
                },
                {
                  name: 'Dice Roll',
                  value: diceRoll.toString(),
                  inline: true
                },
                {
                  name: 'Loss',
                  value: `$${prettyNumber(parsedAmount)}`,
                  inline: true
                }
              )
              .setColor(DefaultColor.Error)
          ]
        });
      }
    }

    return await userDoc.save();
  }
}
