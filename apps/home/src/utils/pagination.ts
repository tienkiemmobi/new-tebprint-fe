export const pagination = (
  current: number,
  totalPages: number,
  usingStartDot: boolean = false,
  usingEndDot: boolean = true,
) => {
  const range = [];
  const start = Math.max(current - 1, 1);
  const end = Math.min(current + 1, totalPages);

  let key = 1; // Initialize a key counter

  if (start > 1) {
    key += 1;
    range.push({ page: 1, key: `page_${key}` });
    if (start > 2 && usingStartDot) {
      range.push({ page: '...', key: `dots_start` });
    }
  }

  for (let i = start; i <= end; i += 1) {
    key += 1;
    range.push({ page: i, key: `page_${key}` });
  }

  if (end < totalPages) {
    if (end < totalPages - 1 && usingEndDot) {
      range.push({ page: '...', key: `dots_end` });
    }
    key += 1;
    range.push({ page: totalPages, key: `page_${key}` });
  }

  return range;
};
