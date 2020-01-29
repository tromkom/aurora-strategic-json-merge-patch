/* Specs:
"__self" keyword is reserved for deleting the entry itself

key will default to identifying array entries with "key" unless other is specified
*/
const utils = require("./utils");

const diffTwoValues = (a, b, parentKey, uniqueKey, diffs = {}) => {
  if (typeof a !== typeof b || typeof a !== "object") {
    if (a !== b) {
      if (b === undefined) {
        diffs[parentKey] = { __self: null };
      } else {
        diffs[parentKey] = b;
      }
    }
    return diffs;
  }

  // A and B are objects
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);
  if (aIsArr || bIsArr) {
    if (aIsArr !== bIsArr) {
      diffs[parentKey] = b;
      return diffs;
    }

    const patches = diff(a, b, uniqueKey);

    for (const patch of patches) {
      if (!diffs[parentKey]) {
        diffs[parentKey] = [patch];
      } else {
        diffs[parentKey].push(patch);
      }
    }
    return diffs;
  }

  for (const key of utils.uniqueEntriesForObjects(a, b)) {
    const differences = diffTwoValues(
      a[key],
      b[key],
      key,
      uniqueKey,
      diffs[parentKey] || {}
    );
    if (Object.keys(differences).length) {
      diffs[parentKey] = differences;
    }
  }

  return diffs;
};

const diff = (a, b, key = "key") => {
  if (typeof a !== typeof b || typeof a !== "object") return b;

  let patches = [];
  let aItr = utils.createItr(a, key);
  let bItr = utils.createItr(b, key);

  for (const uniqueId of utils.uniqueEntriesForObjects(aItr, bItr)) {
    const bObj = bItr[uniqueId];
    if (bObj === undefined) {
      patches.push({
        [key]: uniqueId,
        __self: null
      });
      continue;
    }
    const aObj = aItr[uniqueId];
    if (aObj === undefined) {
      patches.push({
        [key]: uniqueId,
        ...bObj
      });
      continue;
    }

    // we can assume that both aObj and bObj are objects
    for (const k of utils.uniqueEntriesForObjects(aObj, bObj)) {
      const aVal = aObj[k];
      const bVal = bObj[k];

      const patch = diffTwoValues(aVal, bVal, k, key, {
        [key]: uniqueId
      });
      if (Object.keys(patch).length > 1) {
        patches.push(patch);
      }
    }
  }

  // flatten patches array, so that each "key" (pid) has all the changes in a single arary entry
  let patchesObj = patches.reduce((a, c) => {
    if (a[c[key]]) {
      a[c[key]] = { ...a[c[key]], ...c };
    } else a[c[key]] = c;
    return a;
  }, {});
  return Object.values(patchesObj);
};

module.exports = diff;
