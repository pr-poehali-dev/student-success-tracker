import { ClassRoom, Match, AttendanceRecord } from "@/types";
import * as XLSX from "xlsx";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins} мин ${secs} сек`;
  }
  return `${secs} сек`;
};

const getMatchName = (matchId: string | undefined, matches: Match[]): string => {
  if (!matchId) return "-";
  const match = matches.find(m => m.id === matchId);
  if (!match) return "-";
  return `${match.team1.name} vs ${match.team2.name}`;
};

const getGameTypeName = (gameType: string | undefined): string => {
  const gameLabels: Record<string, string> = {
    lumosity: "Люмосити",
    lumocity: "Lumocity",
    valheim: "Valheim",
    civilization: "Civilization",
    factorio: "Factorio",
    simcity: "SimCity",
    sport: "Спорт",
    robo: "Робототехника",
    "3dphysics": "3D физкультура"
  };
  return gameType ? gameLabels[gameType] || "-" : "-";
};

export const createExcelWorkbook = (classes: ClassRoom[], matches: Match[] = [], attendance: AttendanceRecord[] = []) => {
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

      const studentAbsences = attendance.filter(a => a.studentId === student.id);
      const absenceDates = studentAbsences.map(a => new Date(a.date).toLocaleDateString('ru-RU')).join(', ');

      return {
        "ФИО": student.name,
        "Класс": cls.name,
        "Посещаемость": absenceDates || "",
        "Люмосити (баллы)": lumosityTotal,
        "Робо (время)": formatTime(roboTotal),
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
          "Баллы": activity.points || 0,
          "Оценил": activity.ratedBy || "-"
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
          "Время": formatTime(activity.time || 0),
          "Оценил": activity.ratedBy || "-"
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
          "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
          "Оценил": activity.ratedBy || "-"
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
          "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
          "Оценил": activity.ratedBy || "-"
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
          "Производство 3": activity.civilizationProduction3 || "-",
          "Оценил": activity.ratedBy || "-"
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
          "Производство": activity.simcityProduction || "-",
          "Оценил": activity.ratedBy || "-"
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
          "Количество колб": activity.factorioFlasks || "-",
          "Оценил": activity.ratedBy || "-"
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
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Оценил": activity.ratedBy || "-"
        }))
    )
  );
  if (pe3dData.length > 0) {
    const pe3dSheet = XLSX.utils.json_to_sheet(pe3dData);
    XLSX.utils.book_append_sheet(workbook, pe3dSheet, "3D Физкультура");
  }

  const lumocityData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "lumocity")
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
          "Оценил": activity.ratedBy || "-"
        }))
    )
  );
  if (lumocityData.length > 0) {
    const lumocitySheet = XLSX.utils.json_to_sheet(lumocityData);
    XLSX.utils.book_append_sheet(workbook, lumocitySheet, "Lumocity");
  }

  const disciplineCountersData = matches.flatMap(match => {
    if (!match.disciplineCounters || match.disciplineCounters.length === 0) return [];
    
    return match.disciplineCounters.flatMap(discipline => {
      return Object.entries(discipline.studentScores).map(([studentId, score]) => {
        const allStudents = classes.flatMap(cls => cls.students);
        const student = allStudents.find(s => s.id === studentId);
        const studentClass = classes.find(cls => cls.students.some(s => s.id === studentId));
        
        return {
          "Матч": `${match.team1.name} vs ${match.team2.name}`,
          "Дата": new Date(match.date).toLocaleString('ru-RU'),
          "ФИО": student?.name || "Неизвестно",
          "Класс": studentClass?.name || "-",
          "Дисциплина": discipline.disciplineName,
          "Оценка": score
        };
      });
    });
  });

  if (disciplineCountersData.length > 0) {
    const disciplineCountersSheet = XLSX.utils.json_to_sheet(disciplineCountersData);
    XLSX.utils.book_append_sheet(workbook, disciplineCountersSheet, "Оценки по дисциплинам");
  }

  const softSkillsData = classes.flatMap(cls =>
    cls.students.flatMap(student =>
      (student.softSkills || []).map(rating => ({
        "ФИО": student.name,
        "Класс": cls.name,
        "Дата оценки": new Date(rating.date).toLocaleString('ru-RU'),
        "Оценил": rating.ratedBy,
        "Игра": getGameTypeName(rating.gameType),
        "Матч": getMatchName(rating.matchId, matches),
        "Лидерство": rating.leadership,
        "Самоконтроль": rating.selfControl,
        "Коммуникация": rating.communication,
        "Саморефлексия": rating.selfReflection,
        "Критическое мышление": rating.criticalThinking,
        "Средний балл": ((rating.leadership + rating.selfControl + rating.communication + rating.selfReflection + rating.criticalThinking) / 5).toFixed(2)
      }))
    )
  );
  if (softSkillsData.length > 0) {
    const softSkillsSheet = XLSX.utils.json_to_sheet(softSkillsData);
    XLSX.utils.book_append_sheet(workbook, softSkillsSheet, "Soft Skills");
  }

  const softSkillsAverage = classes.flatMap(cls =>
    cls.students
      .filter(student => student.softSkills && student.softSkills.length > 0)
      .map(student => {
        const ratings = student.softSkills!;
        const avgLeadership = ratings.reduce((sum, r) => sum + r.leadership, 0) / ratings.length;
        const avgSelfControl = ratings.reduce((sum, r) => sum + r.selfControl, 0) / ratings.length;
        const avgCommunication = ratings.reduce((sum, r) => sum + r.communication, 0) / ratings.length;
        const avgSelfReflection = ratings.reduce((sum, r) => sum + r.selfReflection, 0) / ratings.length;
        const avgCriticalThinking = ratings.reduce((sum, r) => sum + r.criticalThinking, 0) / ratings.length;
        const totalAvg = (avgLeadership + avgSelfControl + avgCommunication + avgSelfReflection + avgCriticalThinking) / 5;

        return {
          "ФИО": student.name,
          "Класс": cls.name,
          "Количество оценок": ratings.length,
          "Лидерство (ср)": avgLeadership.toFixed(2),
          "Самоконтроль (ср)": avgSelfControl.toFixed(2),
          "Коммуникация (ср)": avgCommunication.toFixed(2),
          "Саморефлексия (ср)": avgSelfReflection.toFixed(2),
          "Крит. мышление (ср)": avgCriticalThinking.toFixed(2),
          "Общий балл": totalAvg.toFixed(2)
        };
      })
  );
  if (softSkillsAverage.length > 0) {
    const softSkillsAvgSheet = XLSX.utils.json_to_sheet(softSkillsAverage);
    XLSX.utils.book_append_sheet(workbook, softSkillsAvgSheet, "Soft Skills Средние");
  }

  return workbook;
};

export const createClassExcelWorkbook = (classRoom: ClassRoom, matches: Match[] = [], attendance: AttendanceRecord[] = []) => {
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

    const studentAbsences = attendance.filter(a => a.studentId === student.id);
    const absenceDates = studentAbsences.map(a => new Date(a.date).toLocaleDateString('ru-RU')).join(', ');

    return {
      "ФИО": student.name,
      "Класс": classRoom.name,
      "Посещаемость": absenceDates || "",
      "Люмосити (баллы)": lumosityTotal,
      "Робо (время)": formatTime(roboTotal),
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
        "Баллы": activity.points || 0,
        "Оценил": activity.ratedBy || "-"
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
        "Время": formatTime(activity.time || 0),
        "Оценил": activity.ratedBy || "-"
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
        "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
        "Оценил": activity.ratedBy || "-"
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
        "Статус игры": activity.gameStatus === "finished" ? "Закончена" : activity.gameStatus === "ongoing" ? "Идет игра" : "-",
        "Оценил": activity.ratedBy || "-"
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
        "Производство 3": activity.civilizationProduction3 || "-",
        "Оценил": activity.ratedBy || "-"
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
        "Производство": activity.simcityProduction || "-",
        "Оценил": activity.ratedBy || "-"
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
        "Количество колб": activity.factorioFlasks || "-",
        "Оценил": activity.ratedBy || "-"
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
        "Дата": new Date(activity.date).toLocaleString('ru-RU'),
        "Оценил": activity.ratedBy || "-"
      }))
  );
  if (pe3dData.length > 0) {
    const pe3dSheet = XLSX.utils.json_to_sheet(pe3dData);
    XLSX.utils.book_append_sheet(workbook, pe3dSheet, "3D Физкультура");
  }

  const softSkillsData = classRoom.students.flatMap(student =>
    (student.softSkills || []).map(rating => ({
      "ФИО": student.name,
      "Дата оценки": new Date(rating.date).toLocaleString('ru-RU'),
      "Оценил": rating.ratedBy,
      "Игра": getGameTypeName(rating.gameType),
      "Матч": getMatchName(rating.matchId, matches),
      "Лидерство": rating.leadership,
      "Самоконтроль": rating.selfControl,
      "Коммуникация": rating.communication,
      "Саморефлексия": rating.selfReflection,
      "Критическое мышление": rating.criticalThinking,
      "Средний балл": ((rating.leadership + rating.selfControl + rating.communication + rating.selfReflection + rating.criticalThinking) / 5).toFixed(2)
    }))
  );
  if (softSkillsData.length > 0) {
    const softSkillsSheet = XLSX.utils.json_to_sheet(softSkillsData);
    XLSX.utils.book_append_sheet(workbook, softSkillsSheet, "Soft Skills");
  }

  const softSkillsAverage = classRoom.students
    .filter(student => student.softSkills && student.softSkills.length > 0)
    .map(student => {
      const ratings = student.softSkills!;
      const avgLeadership = ratings.reduce((sum, r) => sum + r.leadership, 0) / ratings.length;
      const avgSelfControl = ratings.reduce((sum, r) => sum + r.selfControl, 0) / ratings.length;
      const avgCommunication = ratings.reduce((sum, r) => sum + r.communication, 0) / ratings.length;
      const avgSelfReflection = ratings.reduce((sum, r) => sum + r.selfReflection, 0) / ratings.length;
      const avgCriticalThinking = ratings.reduce((sum, r) => sum + r.criticalThinking, 0) / ratings.length;
      const totalAvg = (avgLeadership + avgSelfControl + avgCommunication + avgSelfReflection + avgCriticalThinking) / 5;

      return {
        "ФИО": student.name,
        "Количество оценок": ratings.length,
        "Лидерство (ср)": avgLeadership.toFixed(2),
        "Самоконтроль (ср)": avgSelfControl.toFixed(2),
        "Коммуникация (ср)": avgCommunication.toFixed(2),
        "Саморефлексия (ср)": avgSelfReflection.toFixed(2),
        "Крит. мышление (ср)": avgCriticalThinking.toFixed(2),
        "Общий балл": totalAvg.toFixed(2)
      };
    });
  if (softSkillsAverage.length > 0) {
    const softSkillsAvgSheet = XLSX.utils.json_to_sheet(softSkillsAverage);
    XLSX.utils.book_append_sheet(workbook, softSkillsAvgSheet, "Soft Skills Средние");
  }

  return workbook;
};