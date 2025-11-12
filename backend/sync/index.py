import json
import os
import psycopg2
from typing import Dict, Any, List

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
            
            result = {
                'teachers': teachers_data,
                'classes': classes_data,
                'matches': matches_data
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if 'teacher' in body_data:
                save_teacher(cursor, body_data['teacher'])
            
            if 'classes' in body_data:
                save_classes(cursor, body_data['classes'])
            
            if 'matches' in body_data:
                save_matches(cursor, body_data['matches'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'success', 'message': 'Data synchronized'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            
            if 'teacherId' in body_data:
                teacher_id = escape_sql(body_data['teacherId'])
                cursor.execute(f'DELETE FROM teachers WHERE id = {teacher_id}')
            
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
        FROM teachers
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
        SELECT id, name, responsible_teacher_id, created_at
        FROM classes
        ORDER BY created_at DESC
    ''')
    
    classes = []
    for row in cursor.fetchall():
        class_id = row[0]
        
        cursor.execute(f'''
            SELECT id, name, email, class_id
            FROM students
            WHERE class_id = {escape_sql(class_id)}
            ORDER BY name
        ''')
        
        students = []
        for student_row in cursor.fetchall():
            students.append({
                'id': student_row[0],
                'name': student_row[1],
                'email': student_row[2] or ''
            })
        
        classes.append({
            'id': class_id,
            'name': row[1],
            'responsibleTeacherId': row[2],
            'students': students
        })
    
    return classes


def get_all_matches(cursor) -> List[Dict[str, Any]]:
    cursor.execute('''
        SELECT m.id, m.game_type, m.team1_id, m.team2_id, m.result, m.date, m.completed, m.created_by, m.created_at
        FROM matches m
        ORDER BY m.created_at DESC
    ''')
    
    matches = []
    for row in cursor.fetchall():
        match_id = row[0]
        team1 = get_team(cursor, row[2])
        team2 = get_team(cursor, row[3])
        
        cursor.execute(f'''
            SELECT id, date, time
            FROM scheduled_dates
            WHERE match_id = {escape_sql(match_id)}
            ORDER BY date, time
        ''')
        
        scheduled_dates = []
        for sd_row in cursor.fetchall():
            scheduled_dates.append({
                'id': sd_row[0],
                'date': sd_row[1],
                'time': sd_row[2]
            })
        
        matches.append({
            'id': match_id,
            'gameType': row[1],
            'team1': team1,
            'team2': team2,
            'result': row[4],
            'date': row[5],
            'completed': row[6],
            'createdBy': row[7],
            'createdAt': row[8].isoformat() if row[8] else None,
            'scheduledDates': scheduled_dates
        })
    
    return matches


def get_team(cursor, team_id: str) -> Dict[str, Any]:
    cursor.execute(f'''
        SELECT id, name
        FROM teams
        WHERE id = {escape_sql(team_id)}
    ''')
    
    team_row = cursor.fetchone()
    if not team_row:
        return {'id': team_id, 'name': '', 'members': []}
    
    cursor.execute(f'''
        SELECT student_id, student_name, class_name, role
        FROM team_members
        WHERE team_id = {escape_sql(team_id)}
        ORDER BY role DESC, student_name
    ''')
    
    members = []
    for member_row in cursor.fetchall():
        members.append({
            'studentId': member_row[0],
            'studentName': member_row[1],
            'className': member_row[2],
            'role': member_row[3]
        })
    
    return {
        'id': team_row[0],
        'name': team_row[1],
        'members': members
    }


def save_teacher(cursor, teacher: Dict[str, Any]) -> None:
    tid = escape_sql(teacher['id'])
    name = escape_sql(teacher['name'])
    email = escape_sql(teacher.get('email', ''))
    role = escape_sql(teacher['role'])
    username = escape_sql(teacher.get('username'))
    password = escape_sql(teacher.get('password', ''))
    
    cursor.execute(f'''
        INSERT INTO teachers (id, name, email, role, username, password, created_at)
        VALUES ({tid}, {name}, {email}, {role}, {username}, {password}, NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            username = EXCLUDED.username,
            password = EXCLUDED.password
    ''')


def save_classes(cursor, classes: List[Dict[str, Any]]) -> None:
    for cls in classes:
        cid = escape_sql(cls['id'])
        cname = escape_sql(cls['name'])
        teacher_id = escape_sql(cls.get('responsibleTeacherId'))
        
        cursor.execute(f'''
            INSERT INTO classes (id, name, responsible_teacher_id, created_at)
            VALUES ({cid}, {cname}, {teacher_id}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                responsible_teacher_id = EXCLUDED.responsible_teacher_id
        ''')
        
        cursor.execute(f'DELETE FROM students WHERE class_id = {cid}')
        
        for student in cls.get('students', []):
            sid = escape_sql(student['id'])
            sname = escape_sql(student['name'])
            semail = escape_sql(student.get('email', ''))
            
            cursor.execute(f'''
                INSERT INTO students (id, name, email, class_id)
                VALUES ({sid}, {sname}, {semail}, {cid})
            ''')


def save_matches(cursor, matches: List[Dict[str, Any]]) -> None:
    for match in matches:
        team1_id = save_team(cursor, match['team1'])
        team2_id = save_team(cursor, match['team2'])
        
        mid = escape_sql(match['id'])
        game_type = escape_sql(match['gameType'])
        t1id = escape_sql(team1_id)
        t2id = escape_sql(team2_id)
        result = escape_sql(match.get('result'))
        date = escape_sql(match['date'])
        completed = escape_sql(match['completed'])
        created_by = escape_sql(match['createdBy'])
        
        cursor.execute(f'''
            INSERT INTO matches (id, game_type, team1_id, team2_id, result, date, completed, created_by, created_at)
            VALUES ({mid}, {game_type}, {t1id}, {t2id}, {result}, {date}, {completed}, {created_by}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                game_type = EXCLUDED.game_type,
                result = EXCLUDED.result,
                completed = EXCLUDED.completed
        ''')
        
        cursor.execute(f'DELETE FROM scheduled_dates WHERE match_id = {mid}')
        
        for sd in match.get('scheduledDates', []):
            sdid = escape_sql(sd['id'])
            sddate = escape_sql(sd['date'])
            sdtime = escape_sql(sd['time'])
            
            cursor.execute(f'''
                INSERT INTO scheduled_dates (id, match_id, date, time)
                VALUES ({sdid}, {mid}, {sddate}, {sdtime})
            ''')


def save_team(cursor, team: Dict[str, Any]) -> str:
    tid = escape_sql(team['id'])
    tname = escape_sql(team['name'])
    
    cursor.execute(f'''
        INSERT INTO teams (id, name, created_at)
        VALUES ({tid}, {tname}, NOW())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    ''')
    
    cursor.execute(f'DELETE FROM team_members WHERE team_id = {tid}')
    
    for member in team.get('members', []):
        member_id = escape_sql(f"{team['id']}-{member['studentId']}")
        student_id = escape_sql(member['studentId'])
        student_name = escape_sql(member['studentName'])
        class_name = escape_sql(member['className'])
        role = escape_sql(member['role'])
        
        cursor.execute(f'''
            INSERT INTO team_members (id, team_id, student_id, student_name, class_name, role)
            VALUES ({member_id}, {tid}, {student_id}, {student_name}, {class_name}, {role})
        ''')
    
    return team['id']
