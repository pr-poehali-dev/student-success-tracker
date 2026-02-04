// Скрипт для восстановления классов
// Откройте консоль браузера (F12) и вставьте этот скрипт

const restoreClasses = () => {
  // Восстанавливаем классы из логов (данные до удаления 12:40:54)
  const classesData = [
    {
      "id": "1770119010098",
      "name": "Класс 1",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770101318357",
      "name": "Класс 2",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770040107130",
      "name": "Класс 3",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770040425156",
      "name": "Класс 4",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770039955188",
      "name": "Класс 5",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770040289284",
      "name": "Класс 6",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770040227770",
      "name": "Класс 7",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770129422477",
      "name": "Класс 8",
      "students": [],
      "responsibleTeacherId": null
    },
    {
      "id": "1770129664367",
      "name": "Класс 9",
      "students": [],
      "responsibleTeacherId": null
    }
  ];

  // Загружаем текущее состояние
  const currentState = JSON.parse(localStorage.getItem('poehali_teacher_app_state') || '{}');
  
  // Обновляем классы
  currentState.classes = classesData;
  
  // Сохраняем обратно
  localStorage.setItem('poehali_teacher_app_state', JSON.stringify(currentState));
  
  console.log('✅ Классы восстановлены! Обновите страницу.');
  console.log('Восстановлено классов:', classesData.length);
  
  return classesData;
};

// Выполняем восстановление
restoreClasses();
