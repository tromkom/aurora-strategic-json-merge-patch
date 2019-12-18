const utils = require("./utils");

const strategicMerge = (base, edits) => {
  if (typeof base !== typeof edits || typeof base !== "object") {
    return edits;
  }

  // both base and edits are objects
  const bIsArr = Array.isArray(base);
  const eIsArr = Array.isArray(edits);
  if (bIsArr || eIsArr) {
    if (bIsArr !== eIsArr) {
      return edits;
    }
    return patch(base, edits, "key");
  }

  for (const [key, value] of Object.entries(edits)) {
    if ((value || {}).__self === null) {
      delete base[key];
    } else {
      base[key] = strategicMerge(base[key], value);
    }
  }

  return base;
};

const patch = (base, patches = [], key = "key") => {
  const wasArray = Array.isArray(base);
  let itr = utils.createItr(base, key);

  for (const patch of patches) {
    const uniqueId = patch[key];
    const obj = itr[uniqueId];
    if (obj === undefined || typeof obj !== "object") {
      itr[uniqueId] = patch;
      continue;
    }

    if (patch.__self === null) {
      delete itr[uniqueId];
      continue;
    }

    // obj = actual object
    // patch = patch object
    for (const [key, edits] of Object.entries(patch)) {
      const oldVal = obj[key];
      const newVal = strategicMerge(oldVal, edits);
      if ((newVal || {}).__self === null) {
        delete obj[key];
      } else {
        obj[key] = newVal;
      }
    }
  }

  const ret = Object.values(itr);
  return wasArray ? ret : ret[0];
};

module.exports = patch;
