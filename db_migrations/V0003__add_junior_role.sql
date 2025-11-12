-- Удаляем старый CHECK constraint и добавляем новый с поддержкой роли junior
ALTER TABLE t_p91106428_student_success_trac.teachers DROP CONSTRAINT IF EXISTS teachers_role_check;

-- Добавляем новый CHECK constraint с тремя ролями: admin, teacher, junior
ALTER TABLE t_p91106428_student_success_trac.teachers 
ADD CONSTRAINT teachers_role_check CHECK (role IN ('admin', 'teacher', 'junior'));