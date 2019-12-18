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

const { diff: diffLib, patch: patchLib, httpPatch, utils } = require("../src");

describe("diffing & patching on simple object", () => {
  const base = [
    {
      pid: "1",
      info: {
        emails: [
          {
            key: "1",
            email: "a@a.com"
          }
        ]
      }
    },
    {
      pid: "2",
      info: {
        emails: [
          {
            key: "59",
            email: "2593asd@g.com"
          }
        ]
      }
    }
  ];

  const expectedPatches = [
    {
      pid: "1",
      info: {
        emails: [
          {
            key: "1",
            __self: null
          }
        ]
      }
    },
    {
      pid: "2",
      __self: null
    }
  ];

  const expectedHttpPatches = [
    {
      delete: false,
      body: [
        {
          path: "/1/info/emails/1",
          op: "delete"
        }
      ]
    },
    {
      delete: true,
      body: [
        {
          path: "/2",
          op: "delete"
        }
      ]
    }
  ];

  const expectedNewBase = [
    {
      pid: "1",
      info: {
        emails: []
      }
    }
  ];

  it("should diff and confirm result", () => {
    const patches = diffLib(base, expectedNewBase, "pid");
    should.equal(true, _.isEqual(patches, expectedPatches));
  });

  it("should httpPatch and confirm result", () => {
    const patches = base.map(x =>
      httpPatch(x, expectedPatches, "pid", `/${x.pid}`)
    );
    should.equal(true, _.isEqual(patches, expectedHttpPatches));
  });

  it("should patch and confirm result", () => {
    const newObject = patchLib(base, expectedPatches, "pid");
    should.equal(true, _.isEqual(newObject, expectedNewBase));
  });
});

describe("diffing & patching on arrays", () => {
  const base = {
    pid: "1234",
    contactInfo: {
      emails: [
        {
          key: "1",
          email: "a@g.com"
        },
        {
          key: "2",
          email: "b@g.com"
        }
      ]
    }
  };

  const expectedPatches = [
    {
      pid: "1234",
      contactInfo: {
        emails: [
          {
            key: "2",
            __self: null
          },
          {
            key: "3",
            email: "c@g.com"
          }
        ]
      }
    }
  ];

  const expectedHttpPatches = [
    {
      delete: false,
      body: [
        {
          path: "/1234/contactInfo/emails/2",
          op: "delete"
        },
        {
          path: "/1234/contactInfo/emails/3",
          op: "add",
          value: {
            key: "3",
            email: "c@g.com"
          }
        }
      ]
    }
  ];

  const expectedNewBase = {
    pid: "1234",
    contactInfo: {
      emails: [
        {
          key: "1",
          email: "a@g.com"
        },
        {
          key: "3",
          email: "c@g.com"
        }
      ]
    }
  };

  it("should diff and confirm result", () => {
    const patches = diffLib(base, expectedNewBase, "pid");
    should.equal(true, _.isEqual(patches, expectedPatches));
  });

  it("should httpPatch and confirm result", () => {
    const patches = httpPatch(base, expectedPatches, "pid", `/${base.pid}`);
    should.equal(true, _.isEqual([patches], expectedHttpPatches));
  });

  it("should patch and confirm result", () => {
    const newObject = patchLib(base, expectedPatches, "pid");
    should.equal(true, _.isEqual(newObject, expectedNewBase));
  });
});

describe("diffing & patching on complex arrays", () => {
  const base = [
    {
      pid: "1",
      val: 111,
      nestedObjects: {
        dontTouchMe: "ok",
        willNest: {
          val: 123
        }
      },
      notSoNested: {
        iWillGetDeleted: "sad",
        willNest: {
          val: 123
        }
      },
      info: {
        emails: [
          {
            key: "1",
            email: "a@a.com"
          }
        ]
      }
    },
    {
      pid: "2",
      val: 222,
      info: {
        emails: [
          {
            key: "59",
            email: "2593asd@g.com"
          }
        ]
      }
    },
    {
      pid: "3",
      val: 333,
      info: {
        emails: [
          {
            key: "455",
            email: "asldwdj@g.com"
          },
          {
            key: "45622",
            email: "asldwdj@g.com"
          },
          {
            key: "348924",
            email: "asldwdj@g.com"
          }
        ]
      }
    }
  ];

  const expectedPatches = [
    {
      pid: "1",
      val: {
        __self: null
      },
      nestedObjects: {
        willNest: {
          __self: null
        }
      },
      notSoNested: {
        __self: null
      },
      info: {
        emails: [
          {
            key: "2",
            email: "b@g.com"
          }
        ]
      }
    },
    {
      pid: "2",
      __self: null
    },
    {
      pid: "3",
      val: 420,
      info: {
        emails: [
          {
            key: "23985",
            email: "wdjasdk@g.com"
          },
          {
            key: "45622",
            __self: null
          }
        ]
      }
    },
    {
      pid: "4",
      val: 402
    }
  ];

  const expectedHttpPatches = [
    {
      delete: false,
      body: [
        {
          path: "/1/val",
          op: "delete"
        },
        {
          path: "/1/nestedObjects/willNest",
          op: "delete"
        },
        {
          path: "/1/notSoNested",
          op: "delete"
        },
        {
          path: "/1/info/emails/2",
          op: "add",
          value: {
            key: "2",
            email: "b@g.com"
          }
        }
      ]
    },
    {
      delete: true,
      body: [
        {
          path: "/2",
          op: "delete"
        }
      ]
    },
    {
      delete: false,
      body: [
        {
          path: "/3/val",
          op: "update",
          value: 420
        },
        {
          path: "/3/info/emails/23985",
          op: "add",
          value: {
            key: "23985",
            email: "wdjasdk@g.com"
          }
        },
        {
          path: "/3/info/emails/45622",
          op: "delete"
        }
      ]
    },
    {
      delete: false,
      body: [
        {
          path: "/4",
          op: "add",
          value: {
            pid: "4",
            val: 402
          }
        }
      ]
    }
  ];

  const expectedNewBase = [
    {
      pid: "1",
      nestedObjects: {
        dontTouchMe: "ok"
      },
      info: {
        emails: [
          {
            key: "1",
            email: "a@a.com"
          },
          {
            key: "2",
            email: "b@g.com"
          }
        ]
      }
    },
    {
      pid: "3",
      val: 420,
      info: {
        emails: [
          {
            key: "455",
            email: "asldwdj@g.com"
          },
          {
            key: "23985",
            email: "wdjasdk@g.com"
          },
          {
            key: "348924",
            email: "asldwdj@g.com"
          }
        ]
      }
    },
    {
      pid: "4",
      val: 402
    }
  ];

  it("should diff and confirm result", () => {
    const patches = diffLib(base, expectedNewBase, "pid");
    should.equal(true, _.isEqual(patches, expectedPatches));
  });

  it("should httpPatch and confirm result", () => {
    const aItr = utils.createItr(base, "pid");
    const patches = expectedPatches.map(x =>
      httpPatch(aItr[x.pid], [x], "pid", `/${x.pid}`)
    );
    should.equal(true, _.isEqual(patches, expectedHttpPatches));
  });

  it("should patch and confirm result", () => {
    const newObject = patchLib(base, expectedPatches, "pid");
    should.equal(true, _.isEqual(newObject, expectedNewBase));
  });
});
