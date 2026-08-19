const fs = require('fs');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

/**
 * Parses a CSV or XLSX file on disk into a plain array-of-objects structure.
 * Returns { headers: string[], rows: object[] }
 */
function parseDatasetFile(filePath, fileType) {
  if (fileType === 'CSV') {
    const content = fs.readFileSync(filePath, 'utf8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });
    const headers = records.length > 0 ? Object.keys(records[0]) : [];
    return { headers, rows: records };
  }

  if (fileType === 'XLSX') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    const headers = records.length > 0 ? Object.keys(records[0]) : [];
    return { headers, rows: records };
  }

  throw new Error(`Unsupported file type for parsing: ${fileType}`);
}

module.exports = { parseDatasetFile };
