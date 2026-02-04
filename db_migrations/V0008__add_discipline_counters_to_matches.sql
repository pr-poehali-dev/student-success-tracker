-- Добавляем столбец discipline_counters в таблицу matches для хранения счётчиков по дисциплинам
ALTER TABLE t_p91106428_student_success_trac.matches 
ADD COLUMN discipline_counters JSONB DEFAULT '[]'::jsonb;