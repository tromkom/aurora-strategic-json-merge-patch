const chai = require("chai");
const should = chai.should();

{
  const util = require("util");
  const old = console.log;
  console.log = arg => {
    old(util.inspect(arg, false, null, true));
  };
}

const _ = require("lodash");

const {
  merge,
  utils: { clone }
} = require("../src");

describe("should strategic merge simple structures", () => {
  const firstObj = {
    pid: 123,
    arr: [
      {
        key: 1,
        val: "Hello"
      }
    ]
  };
  const secondObj = {
    pid: 123,
    arr: [
      {
        key: 2,
        val: "World!"
      }
    ]
  };
  const finalObj = {
    123: {
      pid: 123,
      arr: [
        {
          key: 1,
          val: "Hello"
        },
        {
          key: 2,
          val: "World!"
        }
      ]
    }
  };

  const array = [clone(firstObj), clone(secondObj)];
  const finalArray = [finalObj[123]];

  it("should merge two objects", () => {
    const merged = merge(firstObj, secondObj, "pid");
    should.equal(true, _.isEqual(merged, finalObj));
  });

  it("should merge an array", () => {
    const merged = array.reduce((a, c) => merge(a, c, "pid"), []);
    should.equal(true, _.isEqual(merged, finalArray));
  });
});

describe("should strategic merge complex structures", () => {
  const firstObj = {
    pid: 123,
    arr: [
      {
        key: 1,
        val: "Hello",
        info: {
          emails: [
            {
              key: 1,
              val: "abc@abc.com"
            }
          ]
        }
      },
      {
        key: 2,
        val: "World"
      }
    ],
    dope: 432
  };
  const secondObj = {
    pid: 123,
    arr: [
      {
        key: 1,
        val: "Hello",
        info: {
          emails: [
            {
              key: 3,
              val: "fgh@fgh.com"
            }
          ]
        }
      },
      {
        key: 2,
        val: "World!"
      },
      {
        key: 3,
        val: "Oki!"
      }
    ],
    dope: 567
  };
  const finalObj = {
    123: {
      pid: 123,
      dope: 567,
      arr: [
        {
          key: 1,
          val: "Hello",
          info: {
            emails: [
              {
                key: 1,
                val: "abc@abc.com"
              },
              {
                key: 3,
                val: "fgh@fgh.com"
              }
            ]
          }
        },
        {
          key: 2,
          val: "World!"
        },
        {
          key: 3,
          val: "Oki!"
        }
      ]
    }
  };

  const array = [clone(firstObj), clone(secondObj)];
  const finalArray = [finalObj[123]];

  it("should merge two objects", () => {
    const merged = merge(firstObj, secondObj, "pid");
    console.log(merged);
    should.equal(true, _.isEqual(merged, finalObj));
  });

  it("should merge an array", () => {
    const merged = array.reduce((a, c) => merge(a, c, "pid"), []);
    should.equal(true, _.isEqual(merged, finalArray));
  });
});
