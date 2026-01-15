const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const data = [
  {'ID класса': 'class-001', 'Название класса': '5А', 'Количество учеников': 25, 'Ответственный учитель ID': 'teacher-001', 'Ответственный учитель ФИО': 'Иванов Иван Иванович'},
  {'ID класса': 'class-002', 'Название класса': '6Б', 'Количество учеников': 28, 'Ответственный учитель ID': 'teacher-002', 'Ответственный учитель ФИО': 'Петрова Мария Сергеевна'},
  {'ID класса': 'class-003', 'Название класса': '7В', 'Количество учеников': 23, 'Ответственный учитель ID': 'teacher-003', 'Ответственный учитель ФИО': 'Сидоров Алексей Петрович'},
  {'ID класса': 'class-004', 'Название класса': '8Г', 'Количество учеников': 26, 'Ответственный учитель ID': 'teacher-004', 'Ответственный учитель ФИО': 'Козлова Елена Владимировна'}
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
ws['!cols'] = [{wch:15},{wch:18},{wch:23},{wch:28},{wch:35}];
XLSX.utils.book_append_sheet(wb, ws, 'Классы');

const dir = path.join(__dirname, 'public');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

const file = path.join(dir, 'import_example.xlsx');
XLSX.writeFile(wb, file);
console.log('File created:', path.resolve(file));
