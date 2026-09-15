import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { InputValidationError, normalizeSlug, validateDirectoryInput } from '../lib/content-input';
import { readXlsxRows, SpreadsheetImportError } from '../lib/import-spreadsheet';
import { validateImageUpload } from '../lib/media/image-validation';

test('normalizes Arabic and Latin slugs consistently', () => {
  assert.equal(normalizeSlug('  تصليح__سيارات / الكويت  '), 'تصليح-سيارات-الكويت');
  assert.equal(normalizeSlug('My NEW_page!!'), 'my-new-page');
});

test('rejects reserved, empty and oversized directory input', () => {
  assert.throws(() => validateDirectoryInput({ name: 'مدينة', slug: 'admin' }, { topLevel: true }), InputValidationError);
  assert.throws(() => validateDirectoryInput({ name: '', slug: 'valid' }, { topLevel: true }), InputValidationError);
  assert.throws(() => validateDirectoryInput({ name: 'x'.repeat(161), slug: 'valid' }), InputValidationError);
});

test('reads a real XLSX workbook and rejects invalid content', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  sheet.addRow(['name', 'slug']);
  sheet.addRow(['الكويت', 'Kuwait City']);
  const bytes = await workbook.xlsx.writeBuffer();
  const rows = await readXlsxRows(new File([bytes], 'cities.xlsx'));
  assert.deepEqual(rows, [{ name: 'الكويت', slug: 'Kuwait City' }]);

  await assert.rejects(() => readXlsxRows(new File(['not a zip'], 'bad.xlsx')), SpreadsheetImportError);
  await assert.rejects(() => readXlsxRows(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.xlsx')), SpreadsheetImportError);
});

test('validates uploaded image extension, MIME and magic bytes together', () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(validateImageUpload('photo.png', 'image/png', png)?.extension, 'png');
  assert.equal(validateImageUpload('photo.svg', 'image/png', png), null);
  assert.equal(validateImageUpload('photo.png', 'image/jpeg', png), null);
});
