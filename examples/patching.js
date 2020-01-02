const { patch } = require("../src");

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

let newBase = patch(base, patches, "id");
console.log(newBase);
/*
[
  {
    id: '1',
    val: 456,
    arr: [ { key: '1', val: 1 }, { key: '2', val: 222 } ]
  }
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
newBase = patch(base, patches, "id");
console.log(newBase);
/*
{
  id: '1',
  val: 456,
  arr: [ { key: '1', val: 1 }, { key: '2', val: 222 } ]
}
*/
