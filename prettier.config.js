/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config | import("@trivago/prettier-plugin-sort-imports").PluginConfig}}
 */

const config = {
  arrowParens: "always",
  trailingComma: "none",
  tabWidth: 2,
  semi: true,

  importOrder: ["^[^@.#]", "^@", "^#", "^\\."],
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "decorators"],
  plugins: ["@trivago/prettier-plugin-sort-imports"]
};

module.exports = config;
