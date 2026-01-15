#!/usr/bin/env node
/**
 * Script to create an Excel file example for importing classes data.
 * Uses the xlsx library that's already installed in the project.
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

function createClassesImportExample() {
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
  const outputDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the file
  const outputPath = path.join(outputDir, 'import_example.xlsx');
  XLSX.writeFile(workbook, outputPath);
  
  console.log('✓ Excel file created successfully!');
  console.log(`✓ Location: ${outputPath}`);
  console.log('✓ Sheet name: Классы');
  console.log(`✓ Number of example rows: ${data.length}`);
  console.log('✓ Columns: ID класса, Название класса, Количество учеников, Ответственный учитель ID, Ответственный учитель ФИО');
}

// Run the script
try {
  createClassesImportExample();
} catch (error) {
  console.error('Error creating Excel file:', error);
  process.exit(1);
}
