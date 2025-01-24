const camelCaseToWords = (inputStr: string) => {
  const words = inputStr.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');

  const result = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return result;
};

export { camelCaseToWords };
