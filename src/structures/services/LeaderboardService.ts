import { container } from '@sapphire/framework';
import { Time, TimerManager } from '@sapphire/time-utilities';
import { UserModel } from '#models/UserModel';
import { Leaderboard } from '#types/leaderboard';

export class LeaderboardService {
  private result: Leaderboard[] = [];

  constructor() {
    this.refreshLeaderboard();
    container.logger.info('Leaderboard service has been initialized');

    TimerManager.setInterval(() => this.refreshLeaderboard(), Time.Minute);
  }

  getLeaderboard(guildId: string) {
    return this.result.filter((doc) => doc.guildId === guildId);
  }

  private async refreshLeaderboard() {
    const documents = await UserModel.find().lean();

    this.result = documents
      .filter((doc) => doc.economy.wallet + doc.economy.bank > 500)
      .sort(
        (a, b) =>
          b.economy.wallet + b.economy.bank - a.economy.wallet - a.economy.bank
      )
      .map((doc, i) => ({
        i: i + 1,
        guildId: doc.guildId,
        userId: doc.userId,
        money: doc.economy.wallet + doc.economy.bank
      }));
  }
}
