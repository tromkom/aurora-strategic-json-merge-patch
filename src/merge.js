const utils = require("./utils");

const merge = (a, b, key = "key") => {
  if (typeof a !== typeof b || typeof a !== "object") {
    return b;
  }

  const wasArray = Array.isArray(a);

  const aItr = utils.createItr(a, key);
  const bItr = utils.createItr(b, key);

  for (const k of utils.uniqueEntriesForObjects(aItr, bItr)) {
    const aVal = aItr[k];
    const bVal = bItr[k];

    if (typeof aVal !== typeof bVal || typeof aVal !== "object") {
      if (bVal === undefined) continue;
      aItr[k] = bVal;
      continue;
    }

    // they are both objects
    const aArr = Array.isArray(aVal);
    const bArr = Array.isArray(bVal);
    if (aArr || bArr) {
      if (aArr !== bArr) {
        aItr[k] = bVal;
        continue;
      }
      aItr[k] = merge(aVal, bVal);
      continue;
    }
    for (const k of utils.uniqueEntriesForObjects(aVal, bVal)) {
      aVal[k] = merge(aVal[k], bVal[k]);
    }
  }

  if (wasArray) {
    return Object.values(aItr);
  }
  return aItr;
};

module.exports = merge;
