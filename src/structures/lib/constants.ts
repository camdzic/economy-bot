import { join } from 'path';
import { Time } from '@sapphire/time-utilities';

export const rootDir = join(__dirname, '..', '..', '..');
export const srcDir = join(rootDir, 'src');

export enum DefaultColor {
  Primary = 'Blue',
  Success = 'Green',
  Error = 'Red'
}

export const gamblingSettings = {
  min: 100,
  cooldown: Time.Second * 5
};

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

export const dailyCommand = {
  income: {
    min: 100,
    max: 500
  }
};

export const crimeCommand = {
  caughtAt: 50,
  income: {
    min: 100,
    max: 500
  },
  cooldown: Time.Second * 30
};

export const robCommand = {
  caughtAt: 50,
  proportion: 35,
  min: 100,
  cooldown: Time.Minute * 5
};

export const cockfightCommand = {
  startingWinRate: 60,
  maxWinRate: 85
};
