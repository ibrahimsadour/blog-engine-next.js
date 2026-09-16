import ExcelJS from 'exceljs';

const MAX_SPREADSHEET_BYTES = 5 * 1024 * 1024;
const MAX_SPREADSHEET_ROWS = 5_000;

export class SpreadsheetImportError extends Error {}

export async function readXlsxRows(file: File): Promise<Record<string, string>[]> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    throw new SpreadsheetImportError('Only .xlsx files are supported');
  }

  if (file.size === 0 || file.size > MAX_SPREADSHEET_BYTES) {
    throw new SpreadsheetImportError('Spreadsheet must be between 1 byte and 5 MB');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new SpreadsheetImportError('Invalid XLSX file content');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Uint8Array.from(buffer).buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new SpreadsheetImportError('The spreadsheet does not contain a worksheet');
  }

  if (worksheet.actualRowCount < 2) return [];
  if (worksheet.actualRowCount - 1 > MAX_SPREADSHEET_ROWS) {
    throw new SpreadsheetImportError(`Spreadsheet cannot contain more than ${MAX_SPREADSHEET_ROWS} data rows`);
  }

  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, columnNumber) => {
    headers[columnNumber] = cell.text.trim();
  });

  const rows: Record<string, string>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const record: Record<string, string> = {};
    headers.forEach((header, columnNumber) => {
      if (header) record[header] = row.getCell(columnNumber).text.trim();
    });
    if (Object.values(record).some(Boolean)) rows.push(record);
  });

  return rows;
}

export function isSpreadsheetImportError(error: unknown): error is SpreadsheetImportError {
  return error instanceof SpreadsheetImportError;
}
