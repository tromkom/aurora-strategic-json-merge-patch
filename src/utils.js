const customReduce = (arr, func, start, extra) => {
  for (const val of arr) {
    start = func(start, val, extra);
  }
  return start;
};
module.exports.customReduce = customReduce;

const reducer = (a, c, key) => {
  const k = c[key];
  if (k === undefined) {
    console.error(c);
    throw new Error(`Did not find the key ${key}`);
  }
  a[k] = c;
  return a;
};

module.exports.createItr = (obj, key) => {
  if (Array.isArray(obj)) {
    return customReduce(obj, reducer, {}, key);
  }
  if (obj[key] === undefined) {
    return obj;
  }
  return {
    [obj[key]]: obj,
  };
};

const simpleReducer = (a, c) => {
  a[c] = 0;
  return a;
};

module.exports.uniqueEntriesForObjects = (a, b) => {
  const r = customReduce(
    Object.keys(a),
    simpleReducer,
    customReduce(Object.keys(b), simpleReducer, {})
  );
  return Object.keys(r);
};

module.exports.clone = (obj) => JSON.parse(JSON.stringify(obj));
