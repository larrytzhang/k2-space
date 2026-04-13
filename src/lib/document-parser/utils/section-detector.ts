/**
 * Section detection utility for plain text documents.
 * Scans text for heading patterns and splits content into sections.
 */

import type { ParsedSection } from "@/lib/types/pipeline";
import { HEADING_PATTERNS } from "../constants";

/**
 * Result of matching a line against heading patterns.
 */
interface HeadingMatch {
  /** The heading text (without numbering prefix). */
  text: string;
  /** The heading depth level (1 = top, 2 = sub, 3 = sub-sub). */
  level: number;
  /** The line index where this heading was found. */
  lineIndex: number;
}

/**
 * Detects section headings in plain text and splits content into sections.
 * Scans each line against HEADING_PATTERNS from constants.ts.
 * If no headings are detected, returns a single section with heading: null
 * and level: 0 containing the entire text.
 *
 * @param text - The plain text to scan for sections.
 * @returns An array of ParsedSection objects.
 */
export function detectSections(text: string): ParsedSection[] {
  if (!text.trim()) {
    return [];
  }

  const lines = text.split("\n");
  const headings: HeadingMatch[] = [];

  // Scan for headings
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = matchHeading(line);
    if (match) {
      headings.push({ ...match, lineIndex: i });
    }
  }

  // No headings found — return entire text as a single section
  if (headings.length === 0) {
    return [
      {
        heading: null,
        level: 0,
        content: text.trim(),
        tables: [],
        listItems: extractListItems(text),
      },
    ];
  }

  const sections: ParsedSection[] = [];

  // If there's content before the first heading, capture it as preamble
  if (headings[0].lineIndex > 0) {
    const preambleLines = lines.slice(0, headings[0].lineIndex);
    const preambleContent = preambleLines.join("\n").trim();
    if (preambleContent) {
      sections.push({
        heading: null,
        level: 0,
        content: preambleContent,
        tables: [],
        listItems: extractListItems(preambleContent),
      });
    }
  }

  // Build sections from headings
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const startLine = heading.lineIndex + 1;
    const endLine =
      i + 1 < headings.length ? headings[i + 1].lineIndex : lines.length;

    const contentLines = lines.slice(startLine, endLine);
    const content = contentLines.join("\n").trim();

    sections.push({
      heading: heading.text,
      level: heading.level,
      content,
      tables: [],
      listItems: extractListItems(content),
    });
  }

  return sections;
}

/**
 * Tests a single line against all heading patterns.
 * Returns the first match found, or null if the line is not a heading.
 *
 * @param line - A trimmed line of text to test.
 * @returns A partial HeadingMatch (text + level) or null.
 */
function matchHeading(line: string): { text: string; level: number } | null {
  for (const { pattern, level } of HEADING_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      // For numbered patterns, the heading text is in the last capture group
      // For ALL CAPS / colon patterns, the heading text is the first group
      const text = match[match.length - 1] || match[1] || line;
      return { text: text.trim(), level };
    }
  }
  return null;
}

/**
 * Extracts list items from text content.
 * Detects lines starting with bullet markers (-, *, bullet char)
 * or numbered list markers (1., a., i.).
 *
 * @param text - The text to scan for list items.
 * @returns An array of list item strings (without the bullet/number prefix).
 */
function extractListItems(text: string): string[] {
  const items: string[] = [];
  const listPattern = /^[\s]*(?:[-*\u2022]\s+|\d+\.\s+|[a-z]\.\s+|[ivx]+\.\s+)(.+)$/gm;

  let match: RegExpExecArray | null;
  while ((match = listPattern.exec(text)) !== null) {
    items.push(match[1].trim());
  }

  return items;
}
