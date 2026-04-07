import { describe, it, expect } from "vitest";
import { toSortedJson } from "../src/utils/sort-json.js";

describe("toSortedJson", () => {
  it("sorts top-level keys alphabetically", () => {
    const input = { z: 1, a: 2, m: 3 };
    expect(toSortedJson(input)).toBe('{"a":2,"m":3,"z":1}');
  });

  it("sorts nested object keys", () => {
    const input = { b: { z: 1, a: 2 }, a: 1 };
    expect(toSortedJson(input)).toBe('{"a":1,"b":{"a":2,"z":1}}');
  });

  it("sorts objects within arrays", () => {
    const input = { items: [{ z: 1, a: 2 }, { c: 3, b: 4 }] };
    expect(toSortedJson(input)).toBe(
      '{"items":[{"a":2,"z":1},{"b":4,"c":3}]}',
    );
  });

  it("handles null values", () => {
    const input = { b: null, a: 1 };
    expect(toSortedJson(input)).toBe('{"a":1,"b":null}');
  });

  it("matches Go SDK sort for withdrawal body", () => {
    const input = {
      uid: "sumMj2",
      asset_id: 1,
      amount: 100,
      to_address: "0x693735a9595fa92d826FB64E493d1c15B49A7fdE",
      network_id: 11155111,
    };
    const expected =
      '{"amount":100,"asset_id":1,"network_id":11155111,"to_address":"0x693735a9595fa92d826FB64E493d1c15B49A7fdE","uid":"sumMj2"}';
    expect(toSortedJson(input)).toBe(expected);
  });

  it("handles string input", () => {
    const input = '{"b":1,"a":2}';
    expect(toSortedJson(input)).toBe('{"a":2,"b":1}');
  });
});
