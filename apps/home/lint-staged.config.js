module.exports = {
  '*.ts': ['eslint --cache --fix'],
  '*.tsx': ['eslint --cache --fix'],
  '*.astro': ['eslint --cache --fix'],
  '*.*': ['cspell --cache --no-summary --no-progress --no-must-find-files'],
  // '**/*.ts?(x)': 'tsc-files --noEmit',
  '*.json': ['prettier --write'],
};
