-- Добавляем колонку soft_skills в таблицу students для хранения оценок soft skills
ALTER TABLE t_p91106428_student_success_trac.students 
ADD COLUMN soft_skills JSONB DEFAULT '[]'::jsonb;