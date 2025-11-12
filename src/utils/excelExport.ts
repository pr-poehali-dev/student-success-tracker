import * as XLSX from 'xlsx';
import { Teacher, ClassRoom, Match } from '@/types';

export const exportToExcel = (teachers: Teacher[], classes: ClassRoom[], matches: Match[]) => {
  const workbook = XLSX.utils.book_new();

  // Лист 1: Учителя
  const teachersData = teachers.map(teacher => ({
    'ФИО': teacher.name,
    'Email': teacher.email || '-',
    'Роль': teacher.role === 'admin' ? 'Администратор' : teacher.role === 'teacher' ? 'Учитель' : 'МНС',
    'Пароль': teacher.password || '-',
    'Дата регистрации': new Date(teacher.createdAt).toLocaleDateString('ru-RU')
  }));
  const teachersSheet = XLSX.utils.json_to_sheet(teachersData);
  XLSX.utils.book_append_sheet(workbook, teachersSheet, 'Учителя');

  // Лист 2: Классы
  const classesData = classes.map(classRoom => {
    const responsibleTeacher = teachers.find(t => t.id === classRoom.responsibleTeacherId);
    return {
      'Класс': classRoom.name,
      'Количество учеников': classRoom.students.length,
      'Ответственный': responsibleTeacher ? responsibleTeacher.name : 'Не назначен'
    };
  });
  const classesSheet = XLSX.utils.json_to_sheet(classesData);
  XLSX.utils.book_append_sheet(workbook, classesSheet, 'Классы');

  // Лист 3: Ученики
  const studentsData: any[] = [];
  classes.forEach(classRoom => {
    classRoom.students.forEach(student => {
      studentsData.push({
        'Класс': classRoom.name,
        'ФИО ученика': student.name,
        'Баллы': student.points,
        'Достижения': student.achievements.join(', ') || '-'
      });
    });
  });
  const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
  XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Ученики');

  // Лист 4: Матчи
  const getGameTypeLabel = (gameType: string) => {
    const labels: Record<string, string> = {
      valheim: 'Valheim',
      civilization: 'Civilization',
      factorio: 'Factorio',
      sport: 'Спорт',
      robo: 'Робототехника'
    };
    return labels[gameType] || gameType;
  };

  const matchesData = matches.map(match => ({
    'Тип игры': getGameTypeLabel(match.gameType),
    'Команда 1': match.team1.name,
    'Команда 2': match.team2.name,
    'Дата': new Date(match.date).toLocaleDateString('ru-RU'),
    'Статус': match.completed ? 'Завершён' : 'В процессе',
    'Результат': match.result === 'team1' ? 'Победа команды 1' : match.result === 'team2' ? 'Победа команды 2' : 'Не определён',
    'Создал': match.createdBy
  }));
  const matchesSheet = XLSX.utils.json_to_sheet(matchesData);
  XLSX.utils.book_append_sheet(workbook, matchesSheet, 'Матчи');

  // Лист 5: Статистика
  const adminCount = teachers.filter(t => t.role === 'admin').length;
  const teacherCount = teachers.filter(t => t.role === 'teacher').length;
  const juniorCount = teachers.filter(t => t.role === 'junior').length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  const completedMatches = matches.filter(m => m.completed).length;

  const statsData = [
    { 'Показатель': 'Администраторов', 'Значение': adminCount },
    { 'Показатель': 'Учителей', 'Значение': teacherCount },
    { 'Показатель': 'Младших научных сотрудников', 'Значение': juniorCount },
    { 'Показатель': 'Всего учеников', 'Значение': totalStudents },
    { 'Показатель': 'Всего матчей', 'Значение': matches.length },
    { 'Показатель': 'Завершённых матчей', 'Значение': completedMatches }
  ];
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');

  // Генерация файла
  const fileName = `admin_data_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
