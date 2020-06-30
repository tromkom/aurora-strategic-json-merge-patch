# Aurora Strategic JSON Merge

Aurora Strategic JSON Merge allows diffing and merging of objects, including array entries, however each array entry needs to have an object with a `key` attribute to serve as a unique identifier.

## Installation

`npm install @tromkom/aurora-strategic-json-merge-patch`

## Usage

**_The key attribute should always be a string_**

### Diffing

Diffs two objects and returns an array of patches

```js
const { diff } = require("aurora-strategic-json-merge-patch");

let base = [
  {
    id: "1",
    val: 123,
    arr: [
      {
        id: "1",
        val: 1,
      },
    ],
  },
  {
    id: "2",
    val: 456,
  },
];

let newBase = [
  {
    id: "1",
    val: 456,
    arr: [
      {
        id: "1",
        val: 1,
      },
      {
        id: "2",
        val: 222,
      },
    ],
  },
];

let patches = diff(base, newBase, "id");
console.log(patches);
/*
[
  { id: '1', val: 456, arr: [ { id: '2', val: 222 } ] },
  { id: '2', __self: null }
]
*/
```

### Patching

Using the patch from diffing on an equal base object, will return the new base.

```js
const { patch } = require("@tromkom/aurora-strategic-json-merge-patch");

let base = [
  {
    id: "1",
    val: 123,
    arr: [
      {
        id: "1",
        val: 1,
      },
    ],
  },
  {
    id: "2",
    val: 456,
  },
];

let patches = [
  { id: "1", val: 456, arr: [{ id: "2", val: 222 }] },
  { id: "2", __self: null },
];

let newBase = patch(base, patches, "id");
console.log(newBase);
/*
[
  {
    id: '1',
    val: 456,
    arr: [ { id: '1', val: 1 }, { id: '2', val: 222 } ]
  }
]
*/
```

#### Http/JSON Patching

If you want to use [JSON patch](https://www.npmjs.com/package/fast-json-patch) you can do that.

**_Be careful when using JSON patch as the patch will use the "key" as opposed to the index of the array_**

```js
const { httpPatch } = require("@tromkom/aurora-strategic-json-merge-patch");

let base = [
  {
    id: "1",
    val: 123,
    arr: [
      {
        id: "1",
        val: 1,
      },
    ],
  },
  {
    id: "2",
    val: 456,
  },
];

let patches = [
  { id: "1", val: 456, arr: [{ id: "2", val: 222 }] },
  { id: "2", __self: null },
];

let httpPatches = base
  .map((x) => httpPatch(x, patches, "id", `/${x.id}`).body)
  .flat();
console.log(httpPatches);
/*
[
  { op: 'replace', path: '/1/val', value: 456 },
  { path: '/1/arr/2', op: 'add', value: { id: '2', val: 222 } },
  { path: '/2', op: 'remove' }
]
*/
```

### Merging

Does a strategic JSON Merge that will properly handle arrays (assuming they have a "key").

```js
const { merge } = require("@tromkom/aurora-strategic-json-merge-patch");

let base = [
  {
    id: "1",
    val: 123,
    arr: [
      {
        id: "1",
        val: 1,
      },
    ],
  },
  {
    id: "2",
    val: 456,
  },
];

let newBase = [
  {
    id: "1",
    val: 456,
    arr: [
      {
        id: "2",
        val: 222,
      },
    ],
  },
];

let res = merge(base, newBase, "id");
console.log(res);
/*
[
  {
    id: '1',
    val: 456,
    arr: [ { id: '1', val: 1 }, { id: '2', val: 222 } ]
  },
  { id: '2', val: 456 }
]
*/
```
