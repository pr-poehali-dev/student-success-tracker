/**
 * Simple Node.js script to generate Excel file for class import example
 * Run with: node scripts/generate-excel.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Define the data structure
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

// Set column widths
worksheet['!cols'] = [
  { wch: 15 },  // ID класса
  { wch: 18 },  // Название класса
  { wch: 23 },  // Количество учеников
  { wch: 28 },  // Ответственный учитель ID
  { wch: 35 }   // Ответственный учитель ФИО
];

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Классы');

// Ensure the public directory exists
const outputDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the file
const outputPath = path.join(outputDir, 'import_example.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✓ Excel file created successfully!');
console.log(`✓ Location: ${path.resolve(outputPath)}`);
console.log('✓ Sheet name: Классы');
console.log(`✓ Number of example rows: ${data.length}`);
console.log('✓ Columns:');
console.log('  - ID класса');
console.log('  - Название класса');
console.log('  - Количество учеников');
console.log('  - Ответственный учитель ID');
console.log('  - Ответственный учитель ФИО');
