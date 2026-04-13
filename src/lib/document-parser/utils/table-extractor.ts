/**
 * HTML table extraction utility.
 * Extracts structured table data from HTML produced by mammoth (DOCX conversion).
 */

import type { CheerioAPI } from "cheerio";
import type { ParsedTable } from "@/lib/types/pipeline";

/**
 * Extracts all tables from an HTML document loaded into Cheerio.
 * For each <table> element, extracts headers from <th> cells or
 * falls back to treating the first <tr> as the header row.
 * Remaining rows become data rows.
 *
 * @param $ - A CheerioAPI instance loaded with HTML content.
 * @returns An array of ParsedTable objects, one per <table> found.
 */
export function extractTablesFromHtml($: CheerioAPI): ParsedTable[] {
  const tables: ParsedTable[] = [];

  $("table").each((_index, tableEl) => {
    const $table = $(tableEl);
    const rows = $table.find("tr");
    if (rows.length === 0) return;

    let headers: string[] = [];
    const dataRows: string[][] = [];
    let headerRowIndex = -1;

    // Try to find headers from <th> cells in the first row
    const firstRow = rows.first();
    const thCells = firstRow.find("th");

    if (thCells.length > 0) {
      // Headers come from <th> elements
      thCells.each((_i, th) => {
        headers.push($(th).text().trim());
      });
      headerRowIndex = 0;
    } else {
      // Fall back: treat the first row as headers
      const firstRowCells = firstRow.find("td");
      if (firstRowCells.length > 0) {
        firstRowCells.each((_i, td) => {
          headers.push($(td).text().trim());
        });
        headerRowIndex = 0;
      }
    }

    // Extract data from remaining rows
    rows.each((rowIndex, tr) => {
      if (rowIndex === headerRowIndex) return;

      const cells: string[] = [];
      $(tr)
        .find("td, th")
        .each((_i, cell) => {
          cells.push($(cell).text().trim());
        });

      if (cells.length > 0) {
        dataRows.push(cells);
      }
    });

    tables.push({ headers, rows: dataRows });
  });

  return tables;
}
