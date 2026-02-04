import * as XLSX from 'xlsx';

export function generateExcelExample(): Blob {
  const data = [
    ['Класс', 'Имя ученика'],
    ['Класс 1', 'Иванов Иван'],
    ['Класс 1', 'Петрова Мария'],
    ['Класс 1', 'Сидоров Алексей'],
    ['Класс 1', 'Козлова Анна'],
    ['Класс 1', 'Морозов Дмитрий'],
    ['Класс 2', 'Волкова Екатерина'],
    ['Класс 2', 'Зайцев Максим'],
    ['Класс 2', 'Соколова Ольга'],
    ['Класс 2', 'Лебедев Артём'],
    ['Класс 2', 'Новикова Дарья'],
    ['Класс 3', 'Ковалёв Никита'],
    ['Класс 3', 'Попова Софья'],
    ['Класс 3', 'Павлов Егор'],
    ['Класс 3', 'Семёнова Виктория'],
    ['Класс 3', 'Голубев Андрей'],
    ['Класс 4', 'Виноградова Полина'],
    ['Класс 4', 'Богданов Роман'],
    ['Класс 4', 'Михайлова Кристина'],
    ['Класс 4', 'Фёдоров Сергей'],
    ['Класс 4', 'Александрова Юлия'],
    ['Класс 5', 'Смирнов Владимир'],
    ['Класс 5', 'Кузнецова Елизавета'],
    ['Класс 5', 'Орлов Даниил'],
    ['Класс 5', 'Макарова Алина'],
    ['Класс 5', 'Николаев Илья'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Классы');

  const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function generateTeamsExcelExample(): Blob {
  const data = [
    ['Название команды', 'Имя участника'],
    ['Команда Альфа', 'Иванов Иван'],
    ['Команда Альфа', 'Петрова Мария'],
    ['Команда Альфа', 'Сидоров Алексей'],
    ['Команда Бета', 'Волкова Екатерина'],
    ['Команда Бета', 'Зайцев Максим'],
    ['Команда Бета', 'Соколова Ольга'],
    ['Команда Гамма', 'Ковалёв Никита'],
    ['Команда Гамма', 'Попова Софья'],
    ['Команда Гамма', 'Павлов Егор'],
    ['Команда Дельта', 'Виноградова Полина'],
    ['Команда Дельта', 'Богданов Роман'],
    ['Команда Дельта', 'Михайлова Кристина'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Команды');

  const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadExcelExample() {
  const blob = generateExcelExample();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'import-classes-example.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTeamsExcelExample() {
  const blob = generateTeamsExcelExample();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'import-teams-example.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}