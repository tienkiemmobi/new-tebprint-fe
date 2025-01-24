module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  plugins: [require.resolve('prettier-plugin-astro'), 'prettier-plugin-tailwindcss'],

  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
};
