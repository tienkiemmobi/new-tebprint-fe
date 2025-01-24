export const ORDER_DETAIL = 'ORDER_DETAIL';
export const ORDER_ERROR = 'ORDER_ERROR';

export type SeparateValueType = 'default' | 'detail' | 'error';

export const handleSeparateValue = (
  valueParam: any = '',
): { value: string; message: string; type: SeparateValueType } => {
  // eslint-disable-next-line no-param-reassign
  valueParam = `${valueParam}`;
  const value = valueParam?.split('|')[0] || valueParam;
  const secondParam = valueParam?.split('|')[1] || '';
  let message = '';
  let type: SeparateValueType = 'default';

  if (secondParam.includes(ORDER_DETAIL)) {
    message = secondParam.split(`${ORDER_DETAIL}_`)[1] || 'May be wrong, check again';
    type = 'detail';
  } else if (secondParam.includes(ORDER_ERROR)) {
    message = secondParam.split(`${ORDER_ERROR}_`)[1] || 'May be wrong, check again';
    type = 'error';
  }

  return { value, message, type };
};
