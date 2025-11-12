import json
import os
import psycopg2
from typing import Dict, Any, List

SCHEMA = 't_p91106428_student_success_trac'

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
            
            if 'teacher' in body_data and body_data['teacher']:
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
                   json_build_object('id', s.id, 'name', s.name)
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
            'date': date_row[1],
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
            'date': row[5],
            'completed': row[6],
            'createdBy': row[7],
            'createdAt': row[8].isoformat() if row[8] else None,
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


def save_classes(cursor, classes: List[Dict[str, Any]]) -> None:
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
        
        students = cls.get('students', [])
        if students:
            cursor.execute(f'DELETE FROM t_p91106428_student_success_trac.students WHERE class_id = {cid}')
            
            for student in students:
                if not student.get('id'):
                    continue
                    
                sid = escape_sql(student['id'])
                sname = escape_sql(student.get('name', ''))
                
                cursor.execute(f'''
                    INSERT INTO t_p91106428_student_success_trac.students (id, name, class_id)
                    VALUES ({sid}, {sname}, {cid})
                ''')


def save_matches(cursor, matches: List[Dict[str, Any]]) -> None:
    if not matches:
        return
    
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
        if scheduled_dates:
            cursor.execute(f'DELETE FROM t_p91106428_student_success_trac.scheduled_dates WHERE match_id = {mid}')
            
            for sd in scheduled_dates:
                if not sd.get('id'):
                    continue
                    
                sdid = escape_sql(sd['id'])
                sddate = escape_sql(sd.get('date', ''))
                sdtime = escape_sql(sd.get('time', ''))
                
                cursor.execute(f'''
                    INSERT INTO t_p91106428_student_success_trac.scheduled_dates (id, match_id, date, time)
                    VALUES ({sdid}, {mid}, {sddate}, {sdtime})
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
            ''')
    
    return team['id']