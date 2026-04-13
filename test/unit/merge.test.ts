import { describe, it, expect } from "vitest";
import { defuReplaceArray } from "../../src/runtime/utils/merge";

describe("defuReplaceArray", () => {
  it("fills missing keys from sources", () => {
    expect(defuReplaceArray({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("first-wins for primitive collisions", () => {
    expect(defuReplaceArray({ a: 1 }, { a: 99 })).toEqual({ a: 1 });
  });

  it("deep-merges nested objects", () => {
    expect(defuReplaceArray({ n: { a: 1 } }, { n: { b: 2 } })).toEqual({
      n: { a: 1, b: 2 },
    });
  });

  it("nested primitive collision: first-wins", () => {
    expect(defuReplaceArray({ n: { a: 1 } }, { n: { a: 99, b: 2 } })).toEqual({
      n: { a: 1, b: 2 },
    });
  });

  it("replaces arrays instead of concatenating (target has array)", () => {
    expect(defuReplaceArray({ arr: [1, 2] }, { arr: [3, 4, 5] })).toEqual({
      arr: [1, 2],
    });
  });

  it("takes source array when target key is absent", () => {
    expect(defuReplaceArray({}, { arr: [1, 2, 3] })).toEqual({
      arr: [1, 2, 3],
    });
  });

  it("replaces array when source has array and target has primitive", () => {
    expect(defuReplaceArray({ arr: [1, 2] }, { arr: 42 })).toEqual({
      arr: [1, 2],
    });
  });

  it("merges multiple sources left-to-right with first-wins", () => {
    expect(defuReplaceArray({ a: 1 }, { a: 2, b: 2 }, { b: 3, c: 3 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it("handles empty target and source", () => {
    expect(defuReplaceArray({}, {})).toEqual({});
  });

  it("does not mutate the original objects", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    defuReplaceArray(target, source);
    expect(target).toEqual({ a: 1 });
    expect(source).toEqual({ b: 2 });
  });
});
