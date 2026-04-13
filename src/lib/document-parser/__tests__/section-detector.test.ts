import { describe, it, expect } from "vitest";
import { detectSections } from "../utils/section-detector";

describe("detectSections", () => {
  it("detects numbered headings (level 1)", () => {
    const text = "1. Introduction\nThis is the intro.\n\n2. Procedure\nDo the thing.";
    const sections = detectSections(text);

    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBe("Introduction");
    expect(sections[0].level).toBe(1);
    expect(sections[0].content).toContain("This is the intro.");
    expect(sections[1].heading).toBe("Procedure");
    expect(sections[1].level).toBe(1);
    expect(sections[1].content).toContain("Do the thing.");
  });

  it("detects multi-level numbered headings", () => {
    const text =
      "1. Overview\nSome text\n\n1.1 Scope\nScope text\n\n1.1.1 Details\nDetail text";
    const sections = detectSections(text);

    expect(sections).toHaveLength(3);
    expect(sections[0].level).toBe(1);
    expect(sections[1].level).toBe(2);
    expect(sections[1].heading).toBe("Scope");
    expect(sections[2].level).toBe(3);
    expect(sections[2].heading).toBe("Details");
  });

  it("detects ALL CAPS headings", () => {
    const text =
      "SAFETY REQUIREMENTS\nWear goggles.\n\nTEST PROCEDURE\nFollow steps below.";
    const sections = detectSections(text);

    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBe("SAFETY REQUIREMENTS");
    expect(sections[0].level).toBe(1);
    expect(sections[1].heading).toBe("TEST PROCEDURE");
    expect(sections[1].level).toBe(1);
  });

  it("detects colon-ending headings", () => {
    const text =
      "Safety Requirements:\nWear PPE at all times.\n\nEquipment:\nTorque wrench, multimeter.";
    const sections = detectSections(text);

    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBe("Safety Requirements");
    expect(sections[0].level).toBe(2);
    expect(sections[1].heading).toBe("Equipment");
    expect(sections[1].level).toBe(2);
  });

  it("returns single section with heading null when no headings found", () => {
    const text = "This is just a plain paragraph.\nWith some lines.\nNo headings here.";
    const sections = detectSections(text);

    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBeNull();
    expect(sections[0].level).toBe(0);
    expect(sections[0].content).toContain("This is just a plain paragraph.");
  });

  it("captures preamble content before first heading", () => {
    const text =
      "Some introductory text.\n\n1. First Section\nSection content.";
    const sections = detectSections(text);

    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBeNull();
    expect(sections[0].level).toBe(0);
    expect(sections[0].content).toBe("Some introductory text.");
    expect(sections[1].heading).toBe("First Section");
  });

  it("returns empty array for empty text", () => {
    expect(detectSections("")).toEqual([]);
    expect(detectSections("   ")).toEqual([]);
  });

  it("extracts list items from section content", () => {
    const text = "1. Checklist\n- Item one\n- Item two\n- Item three";
    const sections = detectSections(text);

    expect(sections).toHaveLength(1);
    expect(sections[0].listItems).toEqual(["Item one", "Item two", "Item three"]);
  });

  it("initializes tables as empty array for each section", () => {
    const text = "1. Section A\nContent";
    const sections = detectSections(text);

    expect(sections[0].tables).toEqual([]);
  });
});
