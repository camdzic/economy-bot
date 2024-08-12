export * from '@sapphire/utilities';

// Given a number, return a random number between some range
export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Given a value and a percentage, return the proportion of the value
export function proportionOf(value: number, percentage: number) {
  return Math.floor((value * percentage) / 100);
}

// Given a number, return a string with commas separating every 3 digits
export function prettyNumber(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Given a string, parse it into a number if it's a valid number between 1 and 100000000
export function parseMoney(input: string) {
  const parsed = parseInt(input);

  return isNaN(parsed) || parsed < 1 || parsed > 100000000 ? 0 : parsed;
}
