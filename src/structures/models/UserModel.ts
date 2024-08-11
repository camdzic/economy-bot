import { Schema, model } from 'mongoose';

export interface IUser {
  guildId: string;
  userId: string;
  economy: {
    wallet: number;
    bank: number;
    wagered: number;
    transactions: {
      type: 'income' | 'expense';
      message: string;
      amount: number;
    }[];
  };
}

const UserSchema = new Schema<IUser>({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  economy: {
    wallet: { type: Number, default: 500 },
    bank: { type: Number, default: 0 },
    wagered: { type: Number, default: 0 },
    transactions: {
      type: [
        {
          type: { type: String, required: true },
          message: { type: String, required: true },
          amount: { type: Number, required: true }
        }
      ],
      default: []
    }
  }
});

export const UserModel = model<IUser>('User', UserSchema);
