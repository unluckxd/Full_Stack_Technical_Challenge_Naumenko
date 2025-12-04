import { describe, expect, it } from "vitest";
import { calculateReadingTime } from "../utils/readingTime";
import { slugify } from "../utils/slugify";

describe("slugify", () => {
  it("converts strings to lowercase kebab-case", () => {
    expect(slugify("Hello World"))
      .toBe("hello-world");
  });

  it("removes invalid characters", () => {
    expect(slugify("Design & Build!!!")).toBe("design-build");
  });
});

describe("calculateReadingTime", () => {
  it("returns at least 1 minute", () => {
    expect(calculateReadingTime("short text"))
      .toBe(1);
  });

  it("estimates minutes based on words", () => {
    const longText = new Array(1000).fill("word").join(" ");
    expect(calculateReadingTime(longText)).toBeGreaterThan(1);
  });
});
