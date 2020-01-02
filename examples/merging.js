const { merge } = require("../src");

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

let newBase = [
  {
    id: "1",
    val: 456,
    arr: [
      {
        key: "2",
        val: 222
      }
    ]
  }
];

let res = merge(base, newBase, "id");
console.log(res);
/*
[
  {
    id: '1',
    val: 456,
    arr: [ { key: '1', val: 1 }, { key: '2', val: 222 } ]
  },
  { id: '2', val: 456 }
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

newBase = {
  id: "1",
  val: 456,
  arr: [
    {
      key: "1",
      val: 1
    },
    {
      key: "2",
      val: 222
    }
  ]
};
res = merge(base, newBase, "id")[newBase.id];
console.log(res);
/*
{
  id: '1',
  val: 456,
  arr: [ { key: '1', val: 1 }, { key: '2', val: 222 } ]
}
*/
