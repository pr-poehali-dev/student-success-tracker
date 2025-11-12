-- Добавляем колонки achievements и activities в таблицу students
ALTER TABLE t_p91106428_student_success_trac.students 
ADD COLUMN achievements TEXT[] DEFAULT '{}',
ADD COLUMN activities JSONB DEFAULT '[]'::jsonb;