import { afterEach, describe, expect, it } from "vitest";
import {
  absoluteUrl,
  formatBytes,
  initials,
  inquiryStatusLabel,
  parseList,
  readingTime,
  slugify,
  toInt,
  truncate,
} from "@/lib/utils";

const originalAppUrl = process.env.APP_URL;

afterEach(() => {
  process.env.APP_URL = originalAppUrl;
});

describe("slugify", () => {
  it("normalises spaces, case and punctuation", () => {
    expect(slugify("Courtyard House — Kabul")).toBe("courtyard-house-kabul");
    expect(slugify("  Concrete & Light  ")).toBe("concrete-light");
  });

  it("strips accents", () => {
    expect(slugify("Café Résidence")).toBe("cafe-residence");
  });

  it("collapses repeated hyphens", () => {
    expect(slugify("a---b")).toBe("a-b");
  });
});

describe("text helpers", () => {
  it("calculates reading time with a minimum of one minute", () => {
    expect(readingTime("one two three")).toBe(1);
    expect(readingTime("word ".repeat(440))).toBe(2);
  });

  it("truncates with an ellipsis only when needed", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("a".repeat(20), 5)).toBe("aaaaa…");
  });

  it("formats bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });

  it("builds initials", () => {
    expect(initials("Amina Yusuf")).toBe("AY");
    expect(initials("Kayan")).toBe("K");
  });

  it("labels inquiry statuses", () => {
    expect(inquiryStatusLabel("QUOTATION_SENT")).toBe("Quotation Sent");
    expect(inquiryStatusLabel("NEW")).toBe("New");
  });
});

describe("form helpers", () => {
  it("parses comma and newline separated lists", () => {
    expect(parseList("Residential, Courtyard\nConcrete")).toEqual([
      "Residential",
      "Courtyard",
      "Concrete",
    ]);
    expect(parseList("")).toEqual([]);
  });

  it("parses integers with a fallback", () => {
    expect(toInt("42")).toBe(42);
    expect(toInt("nope", 7)).toBe(7);
  });
});

describe("absoluteUrl", () => {
  it("joins paths to APP_URL without double slashes", () => {
    process.env.APP_URL = "https://kayanland.example/";
    expect(absoluteUrl("/projects")).toBe("https://kayanland.example/projects");
    expect(absoluteUrl("projects")).toBe("https://kayanland.example/projects");
    expect(absoluteUrl()).toBe("https://kayanland.example/");
  });
});
