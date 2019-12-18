const utils = require("./utils");

const getPatchForTwoValues = (a, b, path) => {
  if (typeof a !== typeof b || typeof a !== "object") {
    let body = {
      op: "replace",
      path,
      value: b
    };

    if (b === undefined) return [];
    if ((b || {}).__self === null) {
      body.op = "remove";
      delete body.value;
    }
    if (a === undefined) body.op = "add";
    return [body];
  }

  // they are both objects
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);
  if (aIsArr || bIsArr) {
    if (aIsArr !== bIsArr) {
      const body = { path, op: "replace", value: b };
      if (b.__self === null) {
        body.op = "remove";
        delete body.value;
      }
      return [body];
    }
    return httpPatch(a, b, "key", path, true).body;
  }

  if (b.__self === null) {
    return [
      {
        path,
        op: "remove"
      }
    ];
  }

  let ret = [];
  for (const k of utils.uniqueEntriesForObjects(a, b)) {
    const aVal = a[k];
    const bVal = b[k];
    if (aVal === bVal) continue;

    let newPath = path;
    newPath += `/${k}`;
    ret.push(...getPatchForTwoValues(aVal, bVal, newPath));
  }

  return ret;
};

const httpPatch = (
  base = [],
  patches = [],
  key = "key",
  pathId = null,
  addKeyInPath = false
) => {
  const baseWasArray = Array.isArray(base);
  if (!baseWasArray) {
    base = [base];
  }

  let ret = { delete: false, body: [] };

  const aItr = utils.createItr(base, key);

  for (const bObj of patches) {
    const aObj = aItr[bObj[key]];
    if (aObj === undefined && !baseWasArray) continue;
    if (typeof aObj !== typeof bObj || typeof aObj !== "object") {
      let body = {
        path: pathId,
        op: "replace",
        value: bObj
      };
      if ((bObj || {}).__self === null) {
        body.op = "remove";
        delete body.value;
      }
      if (aObj === undefined) body.op = "add";
      if (addKeyInPath) body.path += `/${bObj.key}`;
      ret.body.push(body);
      continue;
    }
    if (bObj.__self === null) {
      let newPath = pathId;
      if (addKeyInPath) newPath += `/${bObj.key}`;
      ret.body.push({
        path: newPath,
        op: "remove"
      });
      continue;
    }

    for (const k of utils.uniqueEntriesForObjects(aObj, bObj)) {
      const aVal = aObj[k];
      const bVal = bObj[k];
      if (aVal === bVal) continue;

      let newPath = pathId;
      if (addKeyInPath && !Array.isArray(bObj)) {
        newPath += `/${bObj.key}`;
      }
      if (Array.isArray(bObj)) {
        newPath += `/${bObj.key}`;
      } else {
        newPath += `/${k}`;
      }
      ret.body.push(...getPatchForTwoValues(aVal, bVal, newPath));
    }
  }

  // update delete
  ret.delete = !!ret.body.filter(x => x.path === pathId && x.op === "remove")
    .length;
  return ret;
};

module.exports = httpPatch;
