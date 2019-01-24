import _ from "lodash";
import React from "react";
import * as d3 from "d3";
import { expect } from "chai";

import {
  scaleTypeFromDataType,
  dataTypeFromScaleType,
  inferScaleType,
  initScale,
  isValidScale,
  invertPointScale,
  indexOfClosestLeftNumberInList
} from "../../../src/utils/Scale";

describe("Scale utils", () => {
  describe("scaleTypeFromDataType", () => {
    it("returns scale types given data types", () => {
      expect(scaleTypeFromDataType("number")).to.equal("linear");
      expect(scaleTypeFromDataType("time")).to.equal("time");
      expect(scaleTypeFromDataType("categorical")).to.equal("ordinal");
    });

    it("returns `ordinal` for unknown data types", () => {
      expect(scaleTypeFromDataType("chewbacca")).to.equal("ordinal");
    });
  });

  describe("dataTypeFromScaleType", () => {
    it("returns data types given scale types", () => {
      expect(dataTypeFromScaleType("linear")).to.equal("number");
      expect(dataTypeFromScaleType("log")).to.equal("number");
      expect(dataTypeFromScaleType("pow")).to.equal("number");
      expect(dataTypeFromScaleType("time")).to.equal("time");
      expect(dataTypeFromScaleType("ordinal")).to.equal("categorical");
    });

    it("returns `categorical` for unknown scale types", () => {
      expect(dataTypeFromScaleType("chewbacca")).to.equal("categorical");
    });
  });

  describe("inferScaleType", () => {
    it("infers the correct scale type, given a scale", () => {
      expect(inferScaleType(d3.scaleLinear())).to.equal("linear");
      expect(inferScaleType(d3.scaleTime())).to.equal("time");
      expect(inferScaleType(d3.scaleOrdinal())).to.equal("ordinal");
      expect(inferScaleType(d3.scaleLog())).to.equal("log");
      expect(inferScaleType(d3.scalePow())).to.equal("pow");
    });
  });

  describe("initScale", () => {
    it("creates a scale of the correct type, given a scale type", () => {
      const linearScale = initScale("linear")
        .domain([0, 1])
        .range([100, 200]);
      expect(inferScaleType(linearScale)).to.equal("linear");
      expect(linearScale(0.5)).to.equal(150);

      expect(inferScaleType(initScale("time"))).to.equal("time");
      expect(inferScaleType(initScale("ordinal"))).to.equal("ordinal");
      expect(inferScaleType(initScale("log"))).to.equal("log");
      expect(inferScaleType(initScale("pow"))).to.equal("pow");
    });
  });

  describe("isValidScale", () => {
    it("returns true for all known scale types", () => {
      expect(isValidScale(d3.scaleLinear())).to.equal(true);
      expect(isValidScale(d3.scaleTime())).to.equal(true);
      expect(isValidScale(d3.scaleOrdinal())).to.equal(true);
      expect(isValidScale(d3.scaleLog())).to.equal(true);
      expect(isValidScale(d3.scalePow())).to.equal(true);
    });
    it("returns false for non-scale things", () => {
      expect(isValidScale(9)).to.equal(false);
      expect(isValidScale(true)).to.equal(false);
      expect(isValidScale([4, 5])).to.equal(false);
      expect(isValidScale({ range: [0, 100], domain: [500, 1000] })).to.equal(
        false
      );
    });
  });

  describe("indexOfClosestLeftNumberInList", () => {
    it("returns index of left closest to the number in the array", () => {
      expect(indexOfClosestLeftNumberInList(1.5, [5, 4, 3, 2, 1])).to.equal(3);
      expect(indexOfClosestLeftNumberInList(1.5, [1, 2, 3, 4, 5])).to.equal(0);
    });
  });

  describe("invertPointScale", () => {
    it("returns a valid value for given rangeValue", () => {
      const scale = d3
        .scalePoint()
        .domain(["a", "b", "c", "d", "e"])
        .range([0, 100]);

      expect(invertPointScale(scale, 0)).to.equal("a");
      expect(invertPointScale(scale, 26)).to.equal("b");
      expect(invertPointScale(scale, 51)).to.equal("c");
      expect(invertPointScale(scale, 76)).to.equal("d");
      expect(invertPointScale(scale, 101)).to.equal("e");
    });
  });
});
