const { httpPatch } = require("../src");

{
  const util = require("util");
  const old = console.log;
  console.log = arg => {
    old(util.inspect(arg, false, null, true));
  };
}

let base = [
  {
    id: "1",
    val: 123,
    arr: [
      {
        key: "1",
        val: 1
      }
    ]
  },
  {
    id: "2",
    val: 456
  }
];

let patches = [
  { id: "1", val: 456, arr: [{ key: "2", val: 222 }] },
  { id: "2", __self: null }
];

let httpPatches = base
  .map(x => httpPatch(x, patches, "id", `/${x.id}`).body)
  .flat();
console.log(httpPatches);
/*
[
  { op: 'replace', path: '/1/val', value: 456 },
  { path: '/1/arr/2', op: 'add', value: { key: '2', val: 222 } },
  { path: '/2', op: 'remove' }
]
*/

base = {
  id: "1",
  val: 123,
  arr: [
    {
      key: "1",
      val: 1
    }
  ]
};

patches = [{ id: "1", val: 456, arr: [{ key: "2", val: 222 }] }];
httpPatches = httpPatch(base, patches, "id", `/${base.id}`);
console.log(httpPatches);
/*
{
  delete: false,
  body: [
    { op: 'replace', path: '/1/val', value: 456 },
    { path: '/1/arr/2', op: 'add', value: { key: '2', val: 222 } }
  ]
}
*/
