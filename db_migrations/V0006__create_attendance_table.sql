CREATE TABLE IF NOT EXISTS t_p91106428_student_success_trac.attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON t_p91106428_student_success_trac.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON t_p91106428_student_success_trac.attendance(date);