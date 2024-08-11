export * from '@sapphire/utilities';

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function prettyNumber(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseMoney(input: string) {
  const parsed = parseInt(input);

  return isNaN(parsed) || parsed < 1 || parsed > 100000000 ? NaN : parsed;
}
