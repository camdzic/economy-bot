import { DatabaseHelper } from "#helpers/DatabaseHelper";
import { LeaderboardService } from "#services/LeaderboardService";
import { EmbedBuilder } from "#utilities/EmbedBuilder";

declare module "@skyra/env-utilities" {
  interface Env {
    MONGO_URI: string;
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    embeds: EmbedBuilder;

    helpers: {
      database: DatabaseHelper;
    };

    services: {
      leaderboard: LeaderboardService;
    };
  }
}

declare module "@sapphire/framework" {
  export interface DetailedDescriptionCommand {
    usage: string;
  }
}
