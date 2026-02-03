import json
import os
import psycopg2
from typing import Dict, Any, List
from datetime import date, datetime

SCHEMA = 't_p91106428_student_success_trac'

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
    """Safely convert date/datetime to string, or return as-is if already string"""
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Синхронизация данных учителей, классов, студентов и матчей между устройствами
    Args: event - dict с httpMethod (GET/POST/DELETE), body с данными для синхронизации
          context - object с request_id, function_name и другими атрибутами
    Returns: HTTP response с данными из БД или статусом сохранения
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
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
            
            # Convert all date objects to strings before JSON serialization
            result = convert_dates_to_strings(result)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            current_teacher = body_data.get('teacher') or body_data.get('currentTeacher')
            
            if current_teacher:
                save_teacher(cursor, current_teacher)
            
            if 'classes' in body_data:
                save_classes(cursor, body_data['classes'], current_teacher)
            
            if 'attendance' in body_data:
                save_attendance(cursor, body_data['attendance'])
            
            if 'matches' in body_data:
                save_matches(cursor, body_data['matches'], current_teacher)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'status': 'success', 'message': 'Data synchronized'})
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            
            if 'teacherId' in body_data:
                teacher_id = escape_sql(body_data['teacherId'])
                cursor.execute(f'DELETE FROM t_p91106428_student_success_trac.teachers WHERE id = {teacher_id}')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'success', 'message': 'Teacher deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()


def get_all_teachers(cursor) -> List[Dict[str, Any]]:
    cursor.execute('''
        SELECT id, name, email, role, username, created_at, password
        FROM t_p91106428_student_success_trac.teachers
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
    cursor.execute('''
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
        FROM t_p91106428_student_success_trac.classes c
        LEFT JOIN t_p91106428_student_success_trac.students s ON c.id = s.class_id
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
    cursor.execute('''
        SELECT m.id, m.game_type, m.team1_id, m.team2_id, m.result, m.date, m.completed, m.created_by, m.created_at
        FROM t_p91106428_student_success_trac.matches m
        ORDER BY m.created_at DESC
    ''')
    
    match_rows = cursor.fetchall()
    
    cursor.execute('SELECT id, date, time, match_id FROM t_p91106428_student_success_trac.scheduled_dates ORDER BY match_id, date, time')
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
    
    cursor.execute('SELECT id, name FROM t_p91106428_student_success_trac.teams')
    teams_data = {row[0]: {'id': row[0], 'name': row[1], 'members': []} for row in cursor.fetchall()}
    
    cursor.execute('SELECT team_id, student_id, student_name, class_name, role FROM t_p91106428_student_success_trac.team_members ORDER BY team_id, role DESC, student_name')
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
    for row in match_rows:
        match_id = row[0]
        team1_id = row[2]
        team2_id = row[3]
        
        matches.append({
            'id': match_id,
            'gameType': row[1],
            'team1': teams_data.get(team1_id, {'id': team1_id, 'name': '', 'members': []}),
            'team2': teams_data.get(team2_id, {'id': team2_id, 'name': '', 'members': []}),
            'result': row[4],
            'date': safe_date_to_string(row[5]),
            'completed': row[6],
            'createdBy': row[7],
            'createdAt': safe_date_to_string(row[8]),
            'scheduledDates': dates_by_match.get(match_id, [])
        })
    
    return matches


def save_teacher(cursor, teacher: Dict[str, Any]) -> None:
    tid = escape_sql(teacher['id'])
    name = escape_sql(teacher['name'])
    email = escape_sql(teacher.get('email', ''))
    role = escape_sql(teacher['role'])
    username = escape_sql(teacher.get('username'))
    password = escape_sql(teacher.get('password', ''))
    
    cursor.execute(f'''
        INSERT INTO t_p91106428_student_success_trac.teachers (id, name, email, role, username, password, created_at)
        VALUES ({tid}, {name}, {email}, {role}, {username}, {password}, NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            username = EXCLUDED.username,
            password = EXCLUDED.password
    ''')


def save_classes(cursor, classes: List[Dict[str, Any]], current_teacher: Dict[str, Any] = None) -> None:
    if not classes:
        return
    
    for cls in classes:
        if not cls.get('id'):
            continue
            
        cid = escape_sql(cls['id'])
        cname = escape_sql(cls.get('name', ''))
        teacher_id = escape_sql(cls.get('responsibleTeacherId'))
        
        cursor.execute(f'''
            INSERT INTO t_p91106428_student_success_trac.classes (id, name, responsible_teacher_id, created_at)
            VALUES ({cid}, {cname}, {teacher_id}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                responsible_teacher_id = EXCLUDED.responsible_teacher_id
        ''')
        
        cursor.execute(f'DELETE FROM t_p91106428_student_success_trac.students WHERE class_id = {cid}')
        
        students = cls.get('students', [])
        for student in students:
                if not student.get('id'):
                    continue
                    
                sid = escape_sql(student['id'])
                sname = escape_sql(student.get('name', ''))
                spoints = escape_sql(student.get('points', 0))
                
                achievements_list = student.get('achievements', [])
                if achievements_list:
                    sachievements = "ARRAY[" + ",".join([f"'{ach.replace(chr(39), chr(39)+chr(39))}'" for ach in achievements_list]) + "]"
                else:
                    sachievements = "ARRAY[]::TEXT[]"
                
                sactivities = escape_sql(json.dumps(student.get('activities', [])))
                ssoftskills = escape_sql(json.dumps(student.get('softSkills', [])))
                
                cursor.execute(f'''
                    INSERT INTO t_p91106428_student_success_trac.students (id, name, class_id, points, achievements, activities, soft_skills)
                    VALUES ({sid}, {sname}, {cid}, {spoints}, {sachievements}, {sactivities}::jsonb, {ssoftskills}::jsonb)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        class_id = EXCLUDED.class_id,
                        points = EXCLUDED.points,
                        achievements = EXCLUDED.achievements,
                        activities = EXCLUDED.activities,
                        soft_skills = EXCLUDED.soft_skills
                ''')


def save_matches(cursor, matches: List[Dict[str, Any]], current_teacher: Dict[str, Any] = None) -> None:
    for match in matches:
        if not match.get('id'):
            continue
            
        team1_id = save_team(cursor, match.get('team1', {}))
        team2_id = save_team(cursor, match.get('team2', {}))
        
        if not team1_id or not team2_id:
            continue
        
        mid = escape_sql(match['id'])
        game_type = escape_sql(match.get('gameType', ''))
        t1id = escape_sql(team1_id)
        t2id = escape_sql(team2_id)
        result = escape_sql(match.get('result'))
        date = escape_sql(match.get('date', ''))
        completed = escape_sql(match.get('completed', False))
        created_by = escape_sql(match.get('createdBy', ''))
        
        cursor.execute(f'''
            INSERT INTO t_p91106428_student_success_trac.matches (id, game_type, team1_id, team2_id, result, date, completed, created_by, created_at)
            VALUES ({mid}, {game_type}, {t1id}, {t2id}, {result}, {date}, {completed}, {created_by}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                game_type = EXCLUDED.game_type,
                result = EXCLUDED.result,
                completed = EXCLUDED.completed
        ''')
        
        scheduled_dates = match.get('scheduledDates', [])
        for sd in scheduled_dates:
                if not sd.get('id'):
                    continue
                    
                sdid = escape_sql(sd['id'])
                sddate = escape_sql(sd.get('date', ''))
                sdtime = escape_sql(sd.get('time', ''))
                
                cursor.execute(f'''
                    INSERT INTO t_p91106428_student_success_trac.scheduled_dates (id, match_id, date, time)
                    VALUES ({sdid}, {mid}, {sddate}, {sdtime})
                    ON CONFLICT (id) DO UPDATE SET
                        match_id = EXCLUDED.match_id,
                        date = EXCLUDED.date,
                        time = EXCLUDED.time
                ''')


def save_team(cursor, team: Dict[str, Any]) -> str:
    if not team or not team.get('id'):
        return ''
    
    tid = escape_sql(team['id'])
    tname = escape_sql(team.get('name', ''))
    
    cursor.execute(f'''
        INSERT INTO t_p91106428_student_success_trac.teams (id, name, created_at)
        VALUES ({tid}, {tname}, NOW())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    ''')
    
    members = team.get('members', [])
    if members:
        cursor.execute(f'DELETE FROM t_p91106428_student_success_trac.team_members WHERE team_id = {tid}')
        
        for member in members:
            if not member.get('studentId'):
                continue
                
            member_id = escape_sql(f"{team['id']}-{member['studentId']}")
            student_id = escape_sql(member['studentId'])
            student_name = escape_sql(member.get('studentName', ''))
            class_name = escape_sql(member.get('className', ''))
            role = escape_sql(member.get('role', ''))
            
            cursor.execute(f'''
                INSERT INTO t_p91106428_student_success_trac.team_members (id, team_id, student_id, student_name, class_name, role)
                VALUES ({member_id}, {tid}, {student_id}, {student_name}, {class_name}, {role})
                ON CONFLICT (id) DO UPDATE SET
                    student_name = EXCLUDED.student_name,
                    class_name = EXCLUDED.class_name,
                    role = EXCLUDED.role
            ''')
    
    return team['id']


def get_all_attendance(cursor) -> List[Dict[str, Any]]:
    cursor.execute('''
        SELECT id, student_id, date, created_at
        FROM t_p91106428_student_success_trac.attendance
        ORDER BY date DESC
    ''')
    
    attendance = []
    for row in cursor.fetchall():
        attendance.append({
            'id': row[0],
            'studentId': row[1],
            'date': safe_date_to_string(row[2]),
            'createdAt': safe_date_to_string(row[3])
        })
    
    return attendance


def save_attendance(cursor, attendance_list: List[Dict[str, Any]]) -> None:
    if not attendance_list:
        return
    
    for att in attendance_list:
        if not att.get('id'):
            continue
        
        att_id = escape_sql(att['id'])
        student_id = escape_sql(att['studentId'])
        date = escape_sql(att['date'])
        
        cursor.execute(f'''
            INSERT INTO t_p91106428_student_success_trac.attendance (id, student_id, date, created_at)
            VALUES ({att_id}, {student_id}, {date}, NOW())
            ON CONFLICT (student_id, date) DO UPDATE SET
                id = EXCLUDED.id
        ''')