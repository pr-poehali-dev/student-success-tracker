"""
FastAPI сервер для Student Success Tracker
Переделанный из Cloud Functions для самостоятельного хостинга
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import psycopg2
import os
from datetime import date, datetime

app = FastAPI(title="Student Success Tracker API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/student_tracker')
SCHEMA = os.environ.get('DB_SCHEMA', 'public')


# Pydantic models
class Teacher(BaseModel):
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    role: str
    username: str
    password: Optional[str] = None


class Student(BaseModel):
    id: str
    name: str
    points: int = 0
    achievements: List[str] = []
    activities: List[str] = []
    softSkills: List[str] = []


class ClassRoom(BaseModel):
    id: str
    name: str
    responsibleTeacherId: str
    students: List[Student] = []


class ScheduledDate(BaseModel):
    id: str
    date: str
    time: str


class TeamMember(BaseModel):
    studentId: str
    studentName: str
    className: str
    role: str


class Team(BaseModel):
    id: str
    name: str
    members: List[TeamMember] = []


class Match(BaseModel):
    id: str
    gameType: str
    team1: Team
    team2: Team
    result: Optional[str] = None
    scheduledDates: List[ScheduledDate] = []
    completed: bool = False
    createdBy: str


class AttendanceRecord(BaseModel):
    id: str
    studentId: str
    studentName: str
    classId: str
    className: str
    date: str
    status: str
    teacherName: str


class SyncRequest(BaseModel):
    teacher: Optional[Teacher] = None
    currentTeacher: Optional[Teacher] = None
    classes: Optional[List[ClassRoom]] = None
    matches: Optional[List[Match]] = None
    attendance: Optional[List[AttendanceRecord]] = None


class DeleteRequest(BaseModel):
    teacherId: str


# Utility functions
def convert_dates_to_strings(obj: Any) -> Any:
    """Recursively convert date/datetime objects to ISO format strings"""
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_dates_to_strings(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_dates_to_strings(item) for item in obj]
    return obj


def safe_date_to_string(date_obj: Any) -> Any:
    """Safely convert date/datetime to string"""
    if date_obj is None:
        return None
    if isinstance(date_obj, str):
        return date_obj
    if isinstance(date_obj, (date, datetime)):
        return date_obj.isoformat()
    return date_obj


def escape_sql(value: Any) -> str:
    """Escape values for simple query protocol"""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL)


# Database query functions
def get_all_teachers(cursor) -> List[Dict[str, Any]]:
    cursor.execute(f'''
        SELECT id, name, email, role, username, created_at, password
        FROM {SCHEMA}.teachers
        ORDER BY created_at DESC
    ''')
    
    teachers = []
    for row in cursor.fetchall():
        teachers.append({
            'id': row[0],
            'name': row[1],
            'email': row[2] or '',
            'role': row[3],
            'username': row[4],
            'createdAt': row[5].isoformat() if row[5] else None,
            'password': row[6] or ''
        })
    
    return teachers


def get_all_classes(cursor) -> List[Dict[str, Any]]:
    cursor.execute(f'''
        SELECT c.id, c.name, c.responsible_teacher_id,
               COALESCE(json_agg(
                   json_build_object(
                       'id', s.id, 
                       'name', s.name, 
                       'points', s.points,
                       'achievements', s.achievements,
                       'activities', s.activities,
                       'softSkills', s.soft_skills
                   )
                   ORDER BY s.name
               ) FILTER (WHERE s.id IS NOT NULL), '[]') as students
        FROM {SCHEMA}.classes c
        LEFT JOIN {SCHEMA}.students s ON c.id = s.class_id
        GROUP BY c.id, c.name, c.responsible_teacher_id, c.created_at
        ORDER BY c.created_at DESC
    ''')
    
    classes = []
    for row in cursor.fetchall():
        classes.append({
            'id': row[0],
            'name': row[1],
            'responsibleTeacherId': row[2],
            'students': row[3] if isinstance(row[3], list) else []
        })
    
    return classes


def get_all_matches(cursor) -> List[Dict[str, Any]]:
    cursor.execute(f'''
        SELECT m.id, m.game_type, m.team1_id, m.team2_id, m.result, m.date, m.completed, m.created_by, m.created_at
        FROM {SCHEMA}.matches m
        ORDER BY m.created_at DESC
    ''')
    
    match_rows = cursor.fetchall()
    
    cursor.execute(f'SELECT id, date, time, match_id FROM {SCHEMA}.scheduled_dates ORDER BY match_id, date, time')
    all_dates = cursor.fetchall()
    dates_by_match = {}
    for date_row in all_dates:
        match_id = date_row[3]
        if match_id not in dates_by_match:
            dates_by_match[match_id] = []
        dates_by_match[match_id].append({
            'id': date_row[0],
            'date': safe_date_to_string(date_row[1]),
            'time': date_row[2]
        })
    
    cursor.execute(f'SELECT id, name FROM {SCHEMA}.teams')
    teams_data = {row[0]: {'id': row[0], 'name': row[1], 'members': []} for row in cursor.fetchall()}
    
    cursor.execute(f'SELECT team_id, student_id, student_name, class_name, role FROM {SCHEMA}.team_members ORDER BY team_id, role DESC, student_name')
    for member_row in cursor.fetchall():
        team_id = member_row[0]
        if team_id in teams_data:
            teams_data[team_id]['members'].append({
                'studentId': member_row[1],
                'studentName': member_row[2],
                'className': member_row[3],
                'role': member_row[4]
            })
    
    matches = []
    for match_row in match_rows:
        match_id = match_row[0]
        team1_id = match_row[2]
        team2_id = match_row[3]
        
        match_obj = {
            'id': match_id,
            'gameType': match_row[1],
            'team1': teams_data.get(team1_id, {'id': team1_id, 'name': 'Unknown', 'members': []}),
            'team2': teams_data.get(team2_id, {'id': team2_id, 'name': 'Unknown', 'members': []}),
            'result': match_row[4],
            'scheduledDates': dates_by_match.get(match_id, []),
            'completed': match_row[6] if match_row[6] is not None else False,
            'createdBy': match_row[7]
        }
        
        matches.append(match_obj)
    
    return matches


def get_all_attendance(cursor) -> List[Dict[str, Any]]:
    cursor.execute(f'''
        SELECT id, student_id, student_name, class_id, class_name, date, status, teacher_name
        FROM {SCHEMA}.attendance
        ORDER BY date DESC
    ''')
    
    attendance = []
    for row in cursor.fetchall():
        attendance.append({
            'id': row[0],
            'studentId': row[1],
            'studentName': row[2],
            'classId': row[3],
            'className': row[4],
            'date': safe_date_to_string(row[5]),
            'status': row[6],
            'teacherName': row[7]
        })
    
    return attendance


def save_teacher(cursor, teacher_data: Dict):
    """Save or update teacher"""
    teacher_id = escape_sql(teacher_data.get('id'))
    name = escape_sql(teacher_data.get('name'))
    email = escape_sql(teacher_data.get('email', ''))
    role = escape_sql(teacher_data.get('role'))
    username = escape_sql(teacher_data.get('username'))
    password = escape_sql(teacher_data.get('password', ''))
    
    cursor.execute(f'''
        INSERT INTO {SCHEMA}.teachers (id, name, email, role, username, password, created_at)
        VALUES ({teacher_id}, {name}, {email}, {role}, {username}, {password}, NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = {name},
            email = {email},
            role = {role},
            username = {username},
            password = {password}
    ''')


def save_classes(cursor, classes_data: List[Dict], current_teacher: Optional[Dict]):
    """Save classes and students"""
    for class_data in classes_data:
        class_id = escape_sql(class_data['id'])
        class_name = escape_sql(class_data['name'])
        responsible_teacher_id = escape_sql(class_data.get('responsibleTeacherId', ''))
        
        cursor.execute(f'''
            INSERT INTO {SCHEMA}.classes (id, name, responsible_teacher_id, created_at)
            VALUES ({class_id}, {class_name}, {responsible_teacher_id}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = {class_name},
                responsible_teacher_id = {responsible_teacher_id}
        ''')
        
        cursor.execute(f'DELETE FROM {SCHEMA}.students WHERE class_id = {class_id}')
        
        for student in class_data.get('students', []):
            student_id = escape_sql(student['id'])
            student_name = escape_sql(student['name'])
            points = escape_sql(student.get('points', 0))
            achievements = escape_sql(str(student.get('achievements', [])))
            activities = escape_sql(str(student.get('activities', [])))
            soft_skills = escape_sql(str(student.get('softSkills', [])))
            
            cursor.execute(f'''
                INSERT INTO {SCHEMA}.students (id, name, points, achievements, activities, soft_skills, class_id)
                VALUES ({student_id}, {student_name}, {points}, {achievements}::text[], {activities}::text[], {soft_skills}::text[], {class_id})
            ''')


def save_matches(cursor, matches_data: List[Dict], current_teacher: Optional[Dict]):
    """Save matches, teams, and scheduled dates"""
    for match_data in matches_data:
        match_id = escape_sql(match_data['id'])
        
        # Save teams
        for team_key in ['team1', 'team2']:
            team = match_data[team_key]
            team_id = escape_sql(team['id'])
            team_name = escape_sql(team['name'])
            
            cursor.execute(f'''
                INSERT INTO {SCHEMA}.teams (id, name)
                VALUES ({team_id}, {team_name})
                ON CONFLICT (id) DO UPDATE SET name = {team_name}
            ''')
            
            cursor.execute(f'DELETE FROM {SCHEMA}.team_members WHERE team_id = {team_id}')
            
            for member in team.get('members', []):
                student_id = escape_sql(member['studentId'])
                student_name = escape_sql(member['studentName'])
                class_name = escape_sql(member['className'])
                role = escape_sql(member['role'])
                
                cursor.execute(f'''
                    INSERT INTO {SCHEMA}.team_members (team_id, student_id, student_name, class_name, role)
                    VALUES ({team_id}, {student_id}, {student_name}, {class_name}, {role})
                ''')
        
        # Save match
        game_type = escape_sql(match_data['gameType'])
        team1_id = escape_sql(match_data['team1']['id'])
        team2_id = escape_sql(match_data['team2']['id'])
        result = escape_sql(match_data.get('result'))
        completed = escape_sql(match_data.get('completed', False))
        created_by = escape_sql(match_data.get('createdBy', ''))
        
        cursor.execute(f'''
            INSERT INTO {SCHEMA}.matches (id, game_type, team1_id, team2_id, result, completed, created_by, created_at, date)
            VALUES ({match_id}, {game_type}, {team1_id}, {team2_id}, {result}, {completed}, {created_by}, NOW(), NULL)
            ON CONFLICT (id) DO UPDATE SET
                game_type = {game_type},
                team1_id = {team1_id},
                team2_id = {team2_id},
                result = {result},
                completed = {completed},
                created_by = {created_by}
        ''')
        
        # Save scheduled dates
        cursor.execute(f'DELETE FROM {SCHEMA}.scheduled_dates WHERE match_id = {match_id}')
        
        for scheduled_date in match_data.get('scheduledDates', []):
            date_id = escape_sql(scheduled_date['id'])
            date_val = escape_sql(scheduled_date['date'])
            time_val = escape_sql(scheduled_date['time'])
            
            cursor.execute(f'''
                INSERT INTO {SCHEMA}.scheduled_dates (id, date, time, match_id)
                VALUES ({date_id}, {date_val}::date, {time_val}, {match_id})
            ''')


def save_attendance(cursor, attendance_data: List[Dict]):
    """Save attendance records"""
    for record in attendance_data:
        record_id = escape_sql(record['id'])
        student_id = escape_sql(record['studentId'])
        student_name = escape_sql(record['studentName'])
        class_id = escape_sql(record['classId'])
        class_name = escape_sql(record['className'])
        date_val = escape_sql(record['date'])
        status = escape_sql(record['status'])
        teacher_name = escape_sql(record['teacherName'])
        
        cursor.execute(f'''
            INSERT INTO {SCHEMA}.attendance (id, student_id, student_name, class_id, class_name, date, status, teacher_name)
            VALUES ({record_id}, {student_id}, {student_name}, {class_id}, {class_name}, {date_val}::date, {status}, {teacher_name})
            ON CONFLICT (id) DO UPDATE SET
                student_id = {student_id},
                student_name = {student_name},
                class_id = {class_id},
                class_name = {class_name},
                date = {date_val}::date,
                status = {status},
                teacher_name = {teacher_name}
        ''')


# API Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Student Success Tracker API"}


@app.get("/api/sync")
async def sync_get():
    """Get all data from database"""
    conn = get_db_connection()
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        teachers_data = get_all_teachers(cursor)
        classes_data = get_all_classes(cursor)
        matches_data = get_all_matches(cursor)
        attendance_data = get_all_attendance(cursor)
        
        result = {
            'teachers': teachers_data,
            'classes': classes_data,
            'matches': matches_data,
            'attendance': attendance_data
        }
        
        result = convert_dates_to_strings(result)
        
        return result
    finally:
        cursor.close()
        conn.close()


@app.post("/api/sync")
async def sync_post(data: SyncRequest):
    """Save data to database"""
    conn = get_db_connection()
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        current_teacher = data.teacher or data.currentTeacher
        
        if current_teacher:
            save_teacher(cursor, current_teacher.model_dump())
        
        if data.classes:
            save_classes(cursor, [c.model_dump() for c in data.classes], 
                        current_teacher.model_dump() if current_teacher else None)
        
        if data.attendance:
            save_attendance(cursor, [a.model_dump() for a in data.attendance])
        
        if data.matches:
            save_matches(cursor, [m.model_dump() for m in data.matches], 
                        current_teacher.model_dump() if current_teacher else None)
        
        return {'status': 'success', 'message': 'Data synchronized'}
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/sync")
async def sync_delete(data: DeleteRequest):
    """Delete teacher"""
    conn = get_db_connection()
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        teacher_id = escape_sql(data.teacherId)
        cursor.execute(f'DELETE FROM {SCHEMA}.teachers WHERE id = {teacher_id}')
        
        return {'status': 'success', 'message': 'Teacher deleted'}
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
