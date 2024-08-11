/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config | import("@trivago/prettier-plugin-sort-imports").PluginConfig}}
 */

module.exports = {
  arrowParens: 'always',
  trailingComma: 'none',
  tabWidth: 2,
  semi: true,
  singleQuote: true,

  importOrder: ['^[^@.#]', '^@', '^#', '^\\.'],
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'decorators'],
  plugins: ['@trivago/prettier-plugin-sort-imports']
};
