import { ClassRoom } from "@/types";
import * as XLSX from "xlsx";

export const createExcelWorkbook = (classes: ClassRoom[]) => {
  const workbook = XLSX.utils.book_new();

  const summaryData = classes.flatMap(cls =>
    cls.students.map(student => {
      const lumosityTotal = (student.activities || [])
        .filter(a => a.type === "lumosity")
        .reduce((sum, a) => sum + (a.points || 0), 0);
      
      const roboTotal = (student.activities || [])
        .filter(a => a.type === "robo")
        .reduce((sum, a) => sum + (a.time || 0), 0);
      
      const sportActivities = (student.activities || []).filter(a => a.type === "sport");
      const sportWins = sportActivities.filter(a => a.result === "win").length;
      const sportLosses = sportActivities.filter(a => a.result === "loss").length;
      const sportCaptain = sportActivities.filter(a => a.role === "captain").length;
      const sportPlayer = sportActivities.filter(a => a.role === "player").length;

      return {
        "ФИО": student.name,
        "Класс": cls.name,
        "Люмосити (баллы)": lumosityTotal,
        "Робо (время мин)": roboTotal,
        "Спорт Побед": sportWins,
        "Спорт Проигрышей": sportLosses,
        "Спорт Капитаном": sportCaptain,
        "Спорт Игроком": sportPlayer
      };
    })
  );
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Общая сводка");

  const lumosityData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "lumosity")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Баллы": activity.points || 0
        }))
    )
  );
  if (lumosityData.length > 0) {
    const lumositySheet = XLSX.utils.json_to_sheet(lumosityData);
    XLSX.utils.book_append_sheet(workbook, lumositySheet, "Люмосити");
  }

  const roboData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "robo")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Время (мин)": activity.time || 0
        }))
    )
  );
  if (roboData.length > 0) {
    const roboSheet = XLSX.utils.json_to_sheet(roboData);
    XLSX.utils.book_append_sheet(workbook, roboSheet, "Робо");
  }

  const sportData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "sport")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Название матча": activity.matchName || "-",
          "Команда": activity.teamName || "-",
          "Противник": activity.opponentTeamName || "-",
          "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
          "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
          "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-"
        }))
    )
  );
  if (sportData.length > 0) {
    const sportSheet = XLSX.utils.json_to_sheet(sportData);
    XLSX.utils.book_append_sheet(workbook, sportSheet, "Спорт");
  }

  const valheimData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "valheim")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Название матча": activity.matchName || "-",
          "Команда": activity.teamName || "-",
          "Противник": activity.opponentTeamName || "-",
          "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
          "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
          "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-"
        }))
    )
  );
  if (valheimData.length > 0) {
    const valheimSheet = XLSX.utils.json_to_sheet(valheimData);
    XLSX.utils.book_append_sheet(workbook, valheimSheet, "Вальхейм");
  }

  const civilizationData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "civilization")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Название матча": activity.matchName || "-",
          "Команда": activity.teamName || "-",
          "Противник": activity.opponentTeamName || "-",
          "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
          "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
          "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
          "Год объявления": activity.civilizationYear || "-",
          "Год защиты": activity.civilizationDefenseYear || "-",
          "Производство 1": activity.civilizationProduction1 || "-",
          "Производство 2": activity.civilizationProduction2 || "-",
          "Производство 3": activity.civilizationProduction3 || "-"
        }))
    )
  );
  if (civilizationData.length > 0) {
    const civilizationSheet = XLSX.utils.json_to_sheet(civilizationData);
    XLSX.utils.book_append_sheet(workbook, civilizationSheet, "Цивилизация");
  }

  const simcityData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "simcity")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Количество граждан": activity.simcityCitizens || "-",
          "Уровень счастья": activity.simcityHappiness || "-",
          "Производство": activity.simcityProduction || "-"
        }))
    )
  );
  if (simcityData.length > 0) {
    const simcitySheet = XLSX.utils.json_to_sheet(simcityData);
    XLSX.utils.book_append_sheet(workbook, simcitySheet, "Симсити");
  }

  const factorioData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "factorio")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Название матча": activity.matchName || "-",
          "Команда": activity.teamName || "-",
          "Противник": activity.opponentTeamName || "-",
          "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
          "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
          "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
          "Количество колб": activity.factorioFlasks || "-"
        }))
    )
  );
  if (factorioData.length > 0) {
    const factorioSheet = XLSX.utils.json_to_sheet(factorioData);
    XLSX.utils.book_append_sheet(workbook, factorioSheet, "Факторио");
  }

  const pe3dData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "pe3d")
        .map(activity => ({
          "ФИО": student.name,
          "Класс": cls.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU')
        }))
    )
  );
  if (pe3dData.length > 0) {
    const pe3dSheet = XLSX.utils.json_to_sheet(pe3dData);
    XLSX.utils.book_append_sheet(workbook, pe3dSheet, "3D Физкультура");
  }

  return workbook;
};

export const createClassExcelWorkbook = (classRoom: ClassRoom) => {
  const workbook = XLSX.utils.book_new();

  const summaryData = classRoom.students.map(student => {
    const lumosityTotal = (student.activities || [])
      .filter(a => a.type === "lumosity")
      .reduce((sum, a) => sum + (a.points || 0), 0);
    
    const roboTotal = (student.activities || [])
      .filter(a => a.type === "robo")
      .reduce((sum, a) => sum + (a.time || 0), 0);
    
    const sportActivities = (student.activities || []).filter(a => a.type === "sport");
    const sportWins = sportActivities.filter(a => a.result === "win").length;
    const sportLosses = sportActivities.filter(a => a.result === "loss").length;
    const sportCaptain = sportActivities.filter(a => a.role === "captain").length;
    const sportPlayer = sportActivities.filter(a => a.role === "player").length;

    return {
      "ФИО": student.name,
      "Класс": classRoom.name,
      "Люмосити (баллы)": lumosityTotal,
      "Робо (время мин)": roboTotal,
      "Спорт Побед": sportWins,
      "Спорт Проигрышей": sportLosses,
      "Спорт Капитаном": sportCaptain,
      "Спорт Игроком": sportPlayer
    };
  });
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Сводка");

  const lumosityData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "lumosity")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Баллы": activity.points || 0
      }))
  );
  if (lumosityData.length > 0) {
    const lumositySheet = XLSX.utils.json_to_sheet(lumosityData);
    XLSX.utils.book_append_sheet(workbook, lumositySheet, "Люмосити");
  }

  const roboData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "robo")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Время (мин)": activity.time || 0
      }))
  );
  if (roboData.length > 0) {
    const roboSheet = XLSX.utils.json_to_sheet(roboData);
    XLSX.utils.book_append_sheet(workbook, roboSheet, "Робо");
  }

  const sportData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "sport")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Название матча": activity.matchName || "-",
        "Команда": activity.teamName || "-",
        "Противник": activity.opponentTeamName || "-",
        "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
        "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
        "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-"
      }))
  );
  if (sportData.length > 0) {
    const sportSheet = XLSX.utils.json_to_sheet(sportData);
    XLSX.utils.book_append_sheet(workbook, sportSheet, "Спорт");
  }

  const valheimData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "valheim")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Название матча": activity.matchName || "-",
        "Команда": activity.teamName || "-",
        "Противник": activity.opponentTeamName || "-",
        "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
        "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
        "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-"
      }))
  );
  if (valheimData.length > 0) {
    const valheimSheet = XLSX.utils.json_to_sheet(valheimData);
    XLSX.utils.book_append_sheet(workbook, valheimSheet, "Вальхейм");
  }

  const civilizationData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "civilization")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Название матча": activity.matchName || "-",
        "Команда": activity.teamName || "-",
        "Противник": activity.opponentTeamName || "-",
        "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
        "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
        "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
        "Год объявления": activity.civilizationYear || "-",
        "Год защиты": activity.civilizationDefenseYear || "-",
        "Производство 1": activity.civilizationProduction1 || "-",
        "Производство 2": activity.civilizationProduction2 || "-",
        "Производство 3": activity.civilizationProduction3 || "-"
      }))
  );
  if (civilizationData.length > 0) {
    const civilizationSheet = XLSX.utils.json_to_sheet(civilizationData);
    XLSX.utils.book_append_sheet(workbook, civilizationSheet, "Цивилизация");
  }

  const simcityData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "simcity")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Количество граждан": activity.simcityCitizens || "-",
        "Уровень счастья": activity.simcityHappiness || "-",
        "Производство": activity.simcityProduction || "-"
      }))
  );
  if (simcityData.length > 0) {
    const simcitySheet = XLSX.utils.json_to_sheet(simcityData);
    XLSX.utils.book_append_sheet(workbook, simcitySheet, "Симсити");
  }

  const factorioData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "factorio")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Название матча": activity.matchName || "-",
        "Команда": activity.teamName || "-",
        "Противник": activity.opponentTeamName || "-",
        "Роль": activity.role === "captain" ? "Капитан" : "Игрок",
        "Результат": activity.result === "win" ? "Победа" : activity.result === "loss" ? "Поражение" : "-",
        "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
        "Количество колб": activity.factorioFlasks || "-"
      }))
  );
  if (factorioData.length > 0) {
    const factorioSheet = XLSX.utils.json_to_sheet(factorioData);
    XLSX.utils.book_append_sheet(workbook, factorioSheet, "Факторио");
  }

  const pe3dData = classRoom.students.flatMap(student =>
    (student.activities || [])
      .filter(a => a.type === "pe3d")
      .map(activity => ({
        "ФИО": student.name,
        "Класс": classRoom.name,
        "Дата": new Date(activity.date).toLocaleString('ru-RU')
      }))
  );
  if (pe3dData.length > 0) {
    const pe3dSheet = XLSX.utils.json_to_sheet(pe3dData);
    XLSX.utils.book_append_sheet(workbook, pe3dSheet, "3D Физкультура");
  }

  return workbook;
};
