const toCamelCaseSingle = (word: string) => {
  return word
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
      return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '');
};

const toCamelCaseKey = (inputObject: Record<string, any>): Record<string, any> => {
  const camelCaseObject: Record<string, any> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(inputObject)) {
    const camelCaseKey = toCamelCaseSingle(key);
    camelCaseObject[camelCaseKey] = `${value}`;
  }

  return camelCaseObject;
};

const toTitleCaseSingle = (word: string): string => {
  return word
    .replace(/([A-Z])/g, ' $1') // Add a space before each uppercase letter
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .trim(); // Remove any leading/trailing spaces
};

const toTitleCaseKey = (inputObject: Record<string, any>): Record<string, any> => {
  const titleCaseObject: Record<string, any> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(inputObject)) {
    const titleCaseKey = toTitleCaseSingle(key);
    titleCaseObject[titleCaseKey] = value;
  }

  return titleCaseObject;
};

export { toCamelCaseKey, toTitleCaseKey };
