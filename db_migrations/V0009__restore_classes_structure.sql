-- Восстановление структуры классов из логов
INSERT INTO t_p91106428_student_success_trac.classes (id, name, responsible_teacher_id, created_at)
VALUES 
  ('1770119010098', 'Класс 1', NULL, NOW()),
  ('1770101318357', 'Класс 2', NULL, NOW()),
  ('1770040107130', 'Класс 3', NULL, NOW()),
  ('1770040425156', 'Класс 4', NULL, NOW()),
  ('1770039955188', 'Класс 5', NULL, NOW()),
  ('1770040289284', 'Класс 6', NULL, NOW()),
  ('1770040227770', 'Класс 7', NULL, NOW()),
  ('1770129422477', 'Класс 8', NULL, NOW()),
  ('1770129664367', 'Класс 9', NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  responsible_teacher_id = EXCLUDED.responsible_teacher_id;
