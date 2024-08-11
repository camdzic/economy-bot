import { UserModel } from '#models/UserModel';

export class DatabaseHelper {
  async getUserDocument(guildId: string, userId: string) {
    return (
      (await UserModel.findOne({
        guildId,
        userId
      })) ||
      (await new UserModel({
        guildId,
        userId
      }).save())
    );
  }
}
