module.exports = {
  '*.ts': ['eslint --cache --fix'],
  '*.tsx': ['eslint --cache --fix'],
  '*.*': ['cspell --cache --no-summary --no-progress --no-must-find-files'],
  '*.json': ['prettier --write'],
};
