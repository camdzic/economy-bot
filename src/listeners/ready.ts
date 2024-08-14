import { blue, white } from "colorette";
import mongoose from "mongoose";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, StoreRegistryValue } from "@sapphire/framework";
import { LeaderboardService } from "#services/LeaderboardService";

@ApplyOptions<Listener.Options>({ once: true })
export class ClientReadyListener extends Listener<typeof Events.ClientReady> {
  override async run() {
    await this.initializeMongo();

    this.printStoreDebugInformation();
  }

  private async initializeMongo() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      this.container.logger.info("Connected to MongoDB");

      this.container.services = {
        leaderboard: new LeaderboardService()
      };
    } catch (error) {
      this.container.logger.fatal(error);
      await this.container.client.destroy();
      process.exit(1);
    }
  }

  private printStoreDebugInformation() {
    const { client, logger } = this.container;

    const stores = [...client.stores.values()];
    const last = stores.pop()!;

    for (const store of stores) {
      logger.info(this.styleStore(store, false));
    }
    logger.info(this.styleStore(last, true));
  }

  private styleStore(store: StoreRegistryValue, last: boolean) {
    return white(
      `${last ? "└─" : "├─"} Loaded ${blue(store.size.toString().padEnd(3, " "))} ${store.name}.`
    );
  }
}
