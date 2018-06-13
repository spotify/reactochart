import { expect } from "chai";
import {
  innerHeight,
  innerRangeX,
  innerRangeY,
  innerWidth,
  prefixKeys,
  sumMargins
} from "../../../src/utils/Margin";

describe("Scale utils", () => {
  describe("innerWidth", () => {
    it("returns inner width value, given outer width and a margin object", () => {
      expect(innerWidth(500)).to.equal(500);
      expect(innerWidth(500, {})).to.equal(500);
      expect(innerWidth(500, { top: 100, bottom: 50 })).to.equal(500);
      expect(innerWidth(500, { left: 100, right: 50 })).to.equal(350);
      expect(innerWidth(10, { left: 100, right: 50 })).to.equal(0);
    });
  });

  describe("innerHeight", () => {
    it("returns inner height value, given outer height and a margin object", () => {
      expect(innerHeight(500)).to.equal(500);
      expect(innerHeight(500, {})).to.equal(500);
      expect(innerHeight(500, { left: 100, right: 50 })).to.equal(500);
      expect(innerHeight(500, { top: 100, bottom: 50 })).to.equal(350);
      expect(innerHeight(10, { top: 100, bottom: 50 })).to.equal(0);
    });
  });

  describe("innerRangeX", () => {
    it("returns inner X-range array, given outer width and a margin object", () => {
      expect(innerRangeX(500)).to.deep.equal([0, 500]);
      expect(innerRangeX(500, {})).to.deep.equal([0, 500]);
      expect(innerRangeX(500, { top: 100, bottom: 50 })).to.deep.equal([
        0,
        500
      ]);
      expect(innerRangeX(500, { left: 100, right: 50 })).to.deep.equal([
        100,
        450
      ]);
      expect(innerRangeX(10, { left: 100, right: 50 })).to.deep.equal([10, 10]);
      expect(innerRangeX(120, { left: 100, right: 50 })).to.deep.equal([
        100,
        100
      ]);
    });
  });

  describe("innerRangeY", () => {
    it("returns inner Y-range array, given outer width and a margin object", () => {
      expect(innerRangeY(500)).to.deep.equal([500, 0]);
      expect(innerRangeY(500, {})).to.deep.equal([500, 0]);
      expect(innerRangeY(500, { left: 100, right: 50 })).to.deep.equal([
        500,
        0
      ]);
      expect(innerRangeY(500, { top: 100, bottom: 50 })).to.deep.equal([
        450,
        100
      ]);
      expect(innerRangeY(10, { top: 100, bottom: 50 })).to.deep.equal([10, 10]);
      expect(innerRangeY(120, { top: 100, bottom: 50 })).to.deep.equal([
        100,
        100
      ]);
    });
  });

  describe("prefixKeys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const prefix = "woot";

    expect(prefixKeys(obj, prefix)).to.eql({
      wootA: 1,
      wootB: 2,
      wootC: 3
    });
  });

  describe("sumMargins", () => {
    const margins = [
      { marginBottom: 5, marginTop: 0, marginLeft: 0, marginRight: 0 },
      { marginTop: 0, marginBottom: 29, marginLeft: 0, marginRight: 0 },
      { marginBottom: 17, marginLeft: 16, marginRight: 16, marginTop: 0 }
    ];
    const prefix = "margin";
    expect(sumMargins(margins, prefix)).to.eql({
      marginTop: 0,
      marginBottom: 51,
      marginLeft: 16,
      marginRight: 16
    });
  });
});
