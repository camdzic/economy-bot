import { join } from 'path';
import { Time } from '@sapphire/time-utilities';

// Default values for the bot
export const rootDir = join(__dirname, '..', '..', '..');
export const srcDir = join(rootDir, 'src');

// Colors for the bot
export enum DefaultColor {
  Primary = 'Blue',
  Success = 'Green',
  Error = 'Red'
}

// Values for the gambling system
export const gamblingSettings = {
  min: 10,
  cooldown: Time.Second * 10
};

// Values for the work command
export const workCommand = {
  income: {
    min: 25,
    max: 150
  },
  jobs: [
    'Developer',
    'Designer',
    'Artist',
    'Musician',
    'Writer',
    'Chef',
    'Conductor',
    'Cinematographer',
    'Editor',
    'Animator',
    'Voice Actor',
    'Sound Designer'
  ],
  cooldown: Time.Second * 30
};

// Values for the daily command
export const dailyCommand = {
  income: {
    min: 100,
    max: 500
  }
};

// Values for the crime command
export const crimeCommand = {
  caughtAt: 50,
  income: {
    min: 100,
    max: 500
  },
  cooldown: Time.Second * 30
};
