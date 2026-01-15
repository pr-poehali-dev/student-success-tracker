#!/usr/bin/env bun
/**
 * Script to generate Excel import example file
 * Run with: bun generate-import-example.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Define example data
const data = [
  {
    'ID класса': 'class-001',
    'Название класса': '5А',
    'Количество учеников': 25,
    'Ответственный учитель ID': 'teacher-001',
    'Ответственный учитель ФИО': 'Иванов Иван Иванович'
  },
  {
    'ID класса': 'class-002',
    'Название класса': '6Б',
    'Количество учеников': 28,
    'Ответственный учитель ID': 'teacher-002',
    'Ответственный учитель ФИО': 'Петрова Мария Сергеевна'
  },
  {
    'ID класса': 'class-003',
    'Название класса': '7В',
    'Количество учеников': 23,
    'Ответственный учитель ID': 'teacher-003',
    'Ответственный учитель ФИО': 'Сидоров Алексей Петрович'
  },
  {
    'ID класса': 'class-004',
    'Название класса': '8Г',
    'Количество учеников': 26,
    'Ответственный учитель ID': 'teacher-004',
    'Ответственный учитель ФИО': 'Козлова Елена Владимировна'
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.json_to_sheet(data);

// Set column widths for better readability
worksheet['!cols'] = [
  { wch: 15 },  // ID класса
  { wch: 18 },  // Название класса
  { wch: 23 },  // Количество учеников
  { wch: 28 },  // Ответственный учитель ID
  { wch: 35 }   // Ответственный учитель ФИО
];

// Add the worksheet to the workbook with the name "Классы"
XLSX.utils.book_append_sheet(workbook, worksheet, 'Классы');

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate the file
const outputPath = path.join(publicDir, 'import_example.xlsx');
XLSX.writeFile(workbook, outputPath);

// Success message
const absolutePath = path.resolve(outputPath);
console.log('\n✓ Excel file created successfully!');
console.log(`✓ Location: ${absolutePath}`);
console.log('✓ Relative path: public/import_example.xlsx');
console.log('✓ Sheet name: Классы');
console.log(`✓ Number of example rows: ${data.length}`);
console.log('\n✓ Columns:');
console.log('  1. ID класса (text)');
console.log('  2. Название класса (text)');
console.log('  3. Количество учеников (number)');
console.log('  4. Ответственный учитель ID (text)');
console.log('  5. Ответственный учитель ФИО (text)');
console.log('\n✓ Example data includes classes: 5А, 6Б, 7В, 8Г\n');
