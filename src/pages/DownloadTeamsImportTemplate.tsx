import { useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function DownloadTeamsImportTemplate() {
  useEffect(() => {
    const createTemplate = () => {
      const workbook = XLSX.utils.book_new();

      const teamsData = [
        {
          "Команда": "Викинги",
          "Ученик": "Иван Иванов",
          "Класс": "Grade 5А"
        },
        {
          "Команда": "Викинги",
          "Ученик": "Петр Петров",
          "Класс": "Grade 5А"
        },
        {
          "Команда": "Берсерки",
          "Ученик": "Анна Сидорова",
          "Класс": "Grade 5Б"
        },
        {
          "Команда": "Берсерки",
          "Ученик": "Мария Козлова",
          "Класс": "Grade 5Б"
        },
        {
          "Команда": "Римляне",
          "Ученик": "Сергей Смирнов",
          "Класс": "Grade 6А"
        },
        {
          "Команда": "Римляне",
          "Ученик": "Ольга Новикова",
          "Класс": "Grade 6А"
        },
        {
          "Команда": "Греки",
          "Ученик": "Дмитрий Федоров",
          "Класс": "Grade 6Б"
        },
        {
          "Команда": "Греки",
          "Ученик": "Елена Морозова",
          "Класс": "Grade 6Б"
        }
      ];

      const teamsSheet = XLSX.utils.json_to_sheet(teamsData);
      teamsSheet['!cols'] = [
        { wch: 20 },
        { wch: 25 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, teamsSheet, "Команды");

      const matchesData = [
        {
          "Игра": "valheim",
          "Команда 1": "Викинги",
          "Цвет команды 1": "#FDE2E4",
          "Команда 2": "Берсерки",
          "Цвет команды 2": "#D9E7FF",
          "Лига": "premiere",
          "Дата": "2024-03-15",
          "Время": "14:00"
        },
        {
          "Игра": "civilization",
          "Команда 1": "Римляне",
          "Цвет команды 1": "#FFF4CC",
          "Команда 2": "Греки",
          "Цвет команды 2": "#D4F1D4",
          "Лига": "beginner",
          "Дата": "2024-03-16",
          "Время": "15:00"
        }
      ];

      const matchesSheet = XLSX.utils.json_to_sheet(matchesData);
      matchesSheet['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 }
      ];
      XLSX.utils.book_append_sheet(workbook, matchesSheet, "Матчи");

      const teamsInstructionsData = [
        {
          "Поле": "Команда",
          "Описание": "Уникальное название команды. Используйте это же название в листе 'Матчи'",
          "Пример": "Викинги"
        },
        {
          "Поле": "Ученик",
          "Описание": "ФИО ученика ТОЧНО как в базе данных",
          "Пример": "Иван Иванов"
        },
        {
          "Поле": "Класс",
          "Описание": "Название класса ученика ТОЧНО как в базе (для различения учеников с одинаковыми именами)",
          "Пример": "Grade 5А"
        }
      ];

      const teamsInstructionsSheet = XLSX.utils.json_to_sheet(teamsInstructionsData);
      teamsInstructionsSheet['!cols'] = [
        { wch: 15 },
        { wch: 70 },
        { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(workbook, teamsInstructionsSheet, "Инструкция: Команды");

      const matchesInstructionsData = [
        {
          "Поле": "Игра",
          "Описание": "Тип игры (valheim, civilization, factorio, sport, robo, 3dphysics, lumocity)",
          "Пример": "valheim"
        },
        {
          "Поле": "Команда 1",
          "Описание": "Название команды из листа 'Команды'",
          "Пример": "Викинги"
        },
        {
          "Поле": "Цвет команды 1",
          "Описание": "HEX цвет карточки команды 1 (см. лист 'Доступные цвета')",
          "Пример": "#FDE2E4"
        },
        {
          "Поле": "Команда 2",
          "Описание": "Название команды из листа 'Команды'",
          "Пример": "Берсерки"
        },
        {
          "Поле": "Цвет команды 2",
          "Описание": "HEX цвет карточки команды 2 (см. лист 'Доступные цвета')",
          "Пример": "#D9E7FF"
        },
        {
          "Поле": "Лига",
          "Описание": "Код лиги: beginner, second, first, premiere (см. лист 'Доступные лиги')",
          "Пример": "premiere"
        },
        {
          "Поле": "Дата",
          "Описание": "Дата матча в формате YYYY-MM-DD",
          "Пример": "2024-03-15"
        },
        {
          "Поле": "Время",
          "Описание": "Время матча в формате HH:MM",
          "Пример": "14:00"
        }
      ];

      const matchesInstructionsSheet = XLSX.utils.json_to_sheet(matchesInstructionsData);
      matchesInstructionsSheet['!cols'] = [
        { wch: 20 },
        { wch: 70 },
        { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(workbook, matchesInstructionsSheet, "Инструкция: Матчи");

      const colorsData = [
        { "Название": "Белый", "Код цвета": "#FFFFFF" },
        { "Название": "Розовый", "Код цвета": "#FDE2E4" },
        { "Название": "Персиковый", "Код цвета": "#FFE5D9" },
        { "Название": "Желтый", "Код цвета": "#FFF4CC" },
        { "Название": "Зеленый", "Код цвета": "#D4F1D4" },
        { "Название": "Голубой", "Код цвета": "#D9E7FF" },
        { "Название": "Фиолетовый", "Код цвета": "#E8DAFF" },
        { "Название": "Серый", "Код цвета": "#F3F4F6" },
        { "Название": "Красный", "Код цвета": "#FECACA" },
        { "Название": "Оранжевый", "Код цвета": "#FED7AA" },
        { "Название": "Лаймовый", "Код цвета": "#D9F99D" },
        { "Название": "Бирюзовый", "Код цвета": "#A5F3FC" }
      ];

      const colorsSheet = XLSX.utils.json_to_sheet(colorsData);
      colorsSheet['!cols'] = [
        { wch: 20 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, colorsSheet, "Доступные цвета");

      const leaguesData = [
        { "Код лиги": "beginner", "Название": "Beginner League", "Описание": "Начальная лига для новичков" },
        { "Код лиги": "second", "Название": "Second League", "Описание": "Вторая лига" },
        { "Код лиги": "first", "Название": "First League", "Описание": "Первая лига" },
        { "Код лиги": "premiere", "Название": "Premiere League", "Описание": "Премьер-лига для опытных игроков" }
      ];

      const leaguesSheet = XLSX.utils.json_to_sheet(leaguesData);
      leaguesSheet['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 40 }
      ];
      XLSX.utils.book_append_sheet(workbook, leaguesSheet, "Доступные лиги");

      XLSX.writeFile(workbook, 'Шаблон_импорта_команд.xlsx');
    };

    createTemplate();
    
    setTimeout(() => {
      window.close();
    }, 1000);
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Скачивание шаблона...</h1>
      <p style={{ color: '#666' }}>Файл скачивается автоматически. Окно закроется через секунду.</p>
    </div>
  );
}
