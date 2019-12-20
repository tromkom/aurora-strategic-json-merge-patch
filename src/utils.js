module.exports.createItr = (obj, key) => {
  if (Array.isArray(obj)) {
    return obj.reduce((a, c) => {
      const k = c[key];
      if (k === undefined) {
        console.error(c);
        throw new Error(`Did not find the key ${key}`);
      }
      a[k] = c;
      return a;
    }, {});
  }
  if (obj[key] === undefined) {
    return obj;
  }
  return {
    [obj[key]]: obj
  };
};

module.exports.uniqueEntriesForObjects = (a, b) => {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])];
};

module.exports.clone = obj => JSON.parse(JSON.stringify(obj));
