const toString = Object.prototype.toString;

const getTag = (value: unknown) => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
};

export const isNil = (value: unknown): value is null | undefined => value == null;

export const isObject = (value: unknown): value is object => {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
};

export const isString = (value: unknown): value is string => {
  const type = typeof value;
  return (
    type === 'string' ||
    (type === 'object' && value != null && !Array.isArray(value) && getTag(value) === '[object String]')
  );
};
