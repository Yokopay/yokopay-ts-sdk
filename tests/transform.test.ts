import { describe, it, expect } from "vitest";
import { toSnakeCase, toCamelCase } from "../src/utils/transform.js";

describe("toSnakeCase", () => {
  it("converts camelCase keys to snake_case", () => {
    expect(toSnakeCase({ networkId: 1, userUid: "abc" })).toEqual({
      network_id: 1,
      user_uid: "abc",
    });
  });

  it("converts nested objects", () => {
    expect(toSnakeCase({ data: { projectUid: "x", networkName: "y" } })).toEqual({
      data: { project_uid: "x", network_name: "y" },
    });
  });

  it("converts objects in arrays", () => {
    expect(toSnakeCase({ items: [{ assetId: 1 }] })).toEqual({
      items: [{ asset_id: 1 }],
    });
  });

  it("leaves primitives unchanged", () => {
    expect(toSnakeCase("hello")).toBe("hello");
    expect(toSnakeCase(42)).toBe(42);
    expect(toSnakeCase(null)).toBe(null);
  });
});

describe("toCamelCase", () => {
  it("converts snake_case keys to camelCase", () => {
    expect(toCamelCase({ network_id: 1, user_uid: "abc" })).toEqual({
      networkId: 1,
      userUid: "abc",
    });
  });

  it("converts nested objects", () => {
    expect(
      toCamelCase({ data: { project_uid: "x", network_name: "y" } }),
    ).toEqual({
      data: { projectUid: "x", networkName: "y" },
    });
  });

  it("handles already camelCase keys", () => {
    expect(toCamelCase({ already: "fine" })).toEqual({ already: "fine" });
  });
});
