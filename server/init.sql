-- Complete database schema for Student Success Tracker
-- This combines all migrations into a single initialization script

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'junior')),
    username TEXT,
    password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    responsible_teacher_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    achievements TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    soft_skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    points INTEGER,
    time INTEGER,
    result TEXT,
    role TEXT,
    game_status TEXT,
    match_name TEXT,
    team_name TEXT,
    opponent_team_name TEXT,
    civilization_year INTEGER,
    civilization_defense_year INTEGER,
    civilization_production1 TEXT,
    civilization_production2 TEXT,
    civilization_production3 TEXT,
    simcity_citizens INTEGER,
    simcity_happiness INTEGER,
    simcity_production TEXT,
    factorio_flasks INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('player', 'captain')),
    PRIMARY KEY (team_id, student_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    game_type TEXT NOT NULL,
    team1_id TEXT NOT NULL,
    team2_id TEXT NOT NULL,
    result TEXT,
    date TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled_dates table
CREATE TABLE IF NOT EXISTS scheduled_dates (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_id TEXT NOT NULL,
    class_name TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_match_id ON scheduled_dates(match_id);

-- Create default admin user
INSERT INTO teachers (id, name, email, role, username, password, created_at)
VALUES ('admin-akrovtus', 'Администратор', 'admin@system.local', 'admin', 'Akrovtus', '', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
