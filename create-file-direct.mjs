import XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

try {
  // Data
  const data = [
    {'ID класса': 'class-001', 'Название класса': '5А', 'Количество учеников': 25, 'Ответственный учитель ID': 'teacher-001', 'Ответственный учитель ФИО': 'Иванов Иван Иванович'},
    {'ID класса': 'class-002', 'Название класса': '6Б', 'Количество учеников': 28, 'Ответственный учитель ID': 'teacher-002', 'Ответственный учитель ФИО': 'Петрова Мария Сергеевна'},
    {'ID класса': 'class-003', 'Название класса': '7В', 'Количество учеников': 23, 'Ответственный учитель ID': 'teacher-003', 'Ответственный учитель ФИО': 'Сидоров Алексей Петрович'},
    {'ID класса': 'class-004', 'Название класса': '8Г', 'Количество учеников': 26, 'Ответственный учитель ID': 'teacher-004', 'Ответственный учитель ФИО': 'Козлова Елена Владимировна'}
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{wch:15},{wch:18},{wch:23},{wch:28},{wch:35}];
  XLSX.utils.book_append_sheet(wb, ws, 'Классы');

  // Ensure directory
  const dir = 'public';
  if (!existsSync(dir)) {
    mkdirSync(dir, {recursive: true});
  }

  // Write file
  const path = join(dir, 'import_example.xlsx');
  const buffer = XLSX.write(wb, {type: 'buffer', bookType: 'xlsx'});
  writeFileSync(path, buffer);

  console.log('SUCCESS!');
  console.log('File:', resolve(path));
  console.log('Sheet: Классы');
  console.log('Rows:', data.length);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
