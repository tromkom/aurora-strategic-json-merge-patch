const chai = require("chai");
const should = chai.should();

const _ = require("lodash");

const { diff: diffLib, patch: patchLib, httpPatch, utils } = require("../src");

describe("diffing & patching on simple object", () => {
  const base = [
    {
      key: "1",
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
      key: "2",
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
      key: "1",
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
      key: "2",
      __self: null
    }
  ];

  const expectedHttpPatches = [
    {
      delete: false,
      body: [
        {
          path: "/1/info/emails/1",
          op: "remove"
        }
      ]
    },
    {
      delete: true,
      body: [
        {
          path: "/2",
          op: "remove"
        }
      ]
    }
  ];

  const expectedNewBase = [
    {
      key: "1",
      info: {
        emails: []
      }
    }
  ];

  it("should diff and confirm result", () => {
    const patches = diffLib(base, expectedNewBase, "key");
    should.equal(true, _.isEqual(patches, expectedPatches));
  });

  it("should httpPatch and confirm result", () => {
    const patches = base.map(x =>
      httpPatch(x, expectedPatches, "key", `/${x.key}`)
    );
    should.equal(true, _.isEqual(patches, expectedHttpPatches));
  });

  it("should patch and confirm result", () => {
    const newObject = patchLib(base, expectedPatches, "key");
    should.equal(true, _.isEqual(newObject, expectedNewBase));
  });
});

describe("diffing & patching on arrays", () => {
  const base = {
    key: "1234",
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
      key: "1234",
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
          op: "remove"
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
    key: "1234",
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
    const patches = diffLib(base, expectedNewBase, "key");
    should.equal(true, _.isEqual(patches, expectedPatches));
  });

  it("should httpPatch and confirm result", () => {
    const patches = httpPatch(base, expectedPatches, "key", `/${base.key}`);
    should.equal(true, _.isEqual([patches], expectedHttpPatches));
  });

  it("should patch and confirm result", () => {
    const newObject = patchLib(base, expectedPatches, "key");
    should.equal(true, _.isEqual(newObject, expectedNewBase));
  });
});

describe("diffing & patching on complex arrays", () => {
  const base = [
    {
      key: "1",
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
      key: "2",
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
      key: "3",
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
      key: "1",
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
      key: "2",
      __self: null
    },
    {
      key: "3",
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
      key: "4",
      val: 402
    }
  ];

  const expectedHttpPatches = [
    {
      delete: false,
      body: [
        {
          path: "/1/val",
          op: "remove"
        },
        {
          path: "/1/nestedObjects/willNest",
          op: "remove"
        },
        {
          path: "/1/notSoNested",
          op: "remove"
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
          op: "remove"
        }
      ]
    },
    {
      delete: false,
      body: [
        {
          path: "/3/val",
          op: "replace",
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
          op: "remove"
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
            key: "4",
            val: 402
          }
        }
      ]
    }
  ];

  const expectedNewBase = [
    {
      key: "1",
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
      key: "3",
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
      key: "4",
      val: 402
    }
  ];

  it("should diff and confirm result", () => {
    const patches = diffLib(base, expectedNewBase, "key");
    should.equal(true, _.isEqual(patches, expectedPatches));
  });

  it("should httpPatch and confirm result", () => {
    const aItr = utils.createItr(base, "key");
    const patches = expectedPatches.map(x =>
      httpPatch(aItr[x.key], [x], "key", `/${x.key}`)
    );
    should.equal(true, _.isEqual(patches, expectedHttpPatches));
  });

  it("should patch and confirm result", () => {
    const newObject = patchLib(base, expectedPatches, "key");
    should.equal(true, _.isEqual(newObject, expectedNewBase));
  });
});
