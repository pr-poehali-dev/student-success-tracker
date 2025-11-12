import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Синхронизация данных учителей, классов, студентов и матчей между устройствами
    Args: event - dict с httpMethod (GET/POST), body с данными для синхронизации
          context - object с request_id, function_name и другими атрибутами
    Returns: HTTP response с данными из БД или статусом сохранения
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'success', 'message': 'Data synchronized'}),
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
        SELECT id, name, email, role, username, created_at
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
            'createdAt': row[5].isoformat() if row[5] else ''
        })
    
    return teachers


def get_all_classes(cursor) -> List[Dict[str, Any]]:
    cursor.execute('''
        SELECT c.id, c.name, c.responsible_teacher_id
        FROM classes c
        ORDER BY c.created_at DESC
    ''')
    
    classes = []
    for row in cursor.fetchall():
        class_id = row[0]
        
        cursor.execute('''
            SELECT s.id, s.name, s.points
            FROM students s
            WHERE s.class_id = %s
            ORDER BY s.points DESC
        ''', (class_id,))
        
        students = []
        for s_row in cursor.fetchall():
            student_id = s_row[0]
            
            cursor.execute('''
                SELECT achievement_id
                FROM achievements
                WHERE student_id = %s
            ''', (student_id,))
            achievements = [ach[0] for ach in cursor.fetchall()]
            
            cursor.execute('''
                SELECT type, date, points, time, result, role, game_status,
                       match_name, team_name, opponent_team_name,
                       civilization_year, civilization_defense_year,
                       civilization_production1, civilization_production2, civilization_production3,
                       simcity_citizens, simcity_happiness, simcity_production,
                       factorio_flasks
                FROM activities
                WHERE student_id = %s
                ORDER BY date DESC
            ''', (student_id,))
            
            activities = []
            for a_row in cursor.fetchall():
                activity = {'type': a_row[0], 'date': a_row[1]}
                if a_row[2] is not None: activity['points'] = a_row[2]
                if a_row[3] is not None: activity['time'] = a_row[3]
                if a_row[4]: activity['result'] = a_row[4]
                if a_row[5]: activity['role'] = a_row[5]
                if a_row[6]: activity['gameStatus'] = a_row[6]
                if a_row[7]: activity['matchName'] = a_row[7]
                if a_row[8]: activity['teamName'] = a_row[8]
                if a_row[9]: activity['opponentTeamName'] = a_row[9]
                if a_row[10] is not None: activity['civilizationYear'] = a_row[10]
                if a_row[11] is not None: activity['civilizationDefenseYear'] = a_row[11]
                if a_row[12]: activity['civilizationProduction1'] = a_row[12]
                if a_row[13]: activity['civilizationProduction2'] = a_row[13]
                if a_row[14]: activity['civilizationProduction3'] = a_row[14]
                if a_row[15] is not None: activity['simcityCitizens'] = a_row[15]
                if a_row[16] is not None: activity['simcityHappiness'] = a_row[16]
                if a_row[17]: activity['simcityProduction'] = a_row[17]
                if a_row[18] is not None: activity['factorioFlasks'] = a_row[18]
                activities.append(activity)
            
            students.append({
                'id': s_row[0],
                'name': s_row[1],
                'points': s_row[2],
                'achievements': achievements,
                'activities': activities
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
        SELECT id, game_type, team1_id, team2_id, result, date, completed, created_by
        FROM matches
        ORDER BY created_at DESC
    ''')
    
    matches = []
    for row in cursor.fetchall():
        match_id = row[0]
        
        team1 = get_team_data(cursor, row[2])
        team2 = get_team_data(cursor, row[3])
        
        cursor.execute('''
            SELECT id, date, time
            FROM scheduled_dates
            WHERE match_id = %s
        ''', (match_id,))
        scheduled_dates = [{'id': sd[0], 'date': sd[1], 'time': sd[2]} for sd in cursor.fetchall()]
        
        match = {
            'id': match_id,
            'gameType': row[1],
            'team1': team1,
            'team2': team2,
            'date': row[5],
            'completed': row[6],
            'createdBy': row[7]
        }
        if row[4]: match['result'] = row[4]
        if scheduled_dates: match['scheduledDates'] = scheduled_dates
        
        matches.append(match)
    
    return matches


def get_team_data(cursor, team_id: str) -> Dict[str, Any]:
    cursor.execute('SELECT name FROM teams WHERE id = %s', (team_id,))
    team_name = cursor.fetchone()[0]
    
    cursor.execute('''
        SELECT student_id, student_name, class_name, role
        FROM team_members
        WHERE team_id = %s
    ''', (team_id,))
    
    members = []
    for m_row in cursor.fetchall():
        members.append({
            'studentId': m_row[0],
            'studentName': m_row[1],
            'className': m_row[2],
            'role': m_row[3]
        })
    
    return {'id': team_id, 'name': team_name, 'members': members}


def save_teacher(cursor, teacher: Dict[str, Any]) -> None:
    cursor.execute('''
        INSERT INTO teachers (id, name, email, role, username, created_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            username = EXCLUDED.username
    ''', (
        teacher['id'],
        teacher['name'],
        teacher.get('email', ''),
        teacher['role'],
        teacher.get('username')
    ))


def save_classes(cursor, classes: List[Dict[str, Any]]) -> None:
    for cls in classes:
        cursor.execute('''
            INSERT INTO classes (id, name, responsible_teacher_id, created_at)
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                responsible_teacher_id = EXCLUDED.responsible_teacher_id
        ''', (cls['id'], cls['name'], cls.get('responsibleTeacherId')))
        
        for student in cls.get('students', []):
            cursor.execute('''
                INSERT INTO students (id, class_id, name, points, created_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    points = EXCLUDED.points
            ''', (student['id'], cls['id'], student['name'], student['points']))
            
            cursor.execute('DELETE FROM achievements WHERE student_id = %s', (student['id'],))
            for ach in student.get('achievements', []):
                cursor.execute('''
                    INSERT INTO achievements (id, student_id, achievement_id, created_at)
                    VALUES (%s, %s, %s, NOW())
                ''', (f"{student['id']}-{ach}", student['id'], ach))
            
            cursor.execute('DELETE FROM activities WHERE student_id = %s', (student['id'],))
            for activity in student.get('activities', []):
                activity_id = f"{student['id']}-{activity['date']}-{activity['type']}"
                cursor.execute('''
                    INSERT INTO activities (
                        id, student_id, type, date, points, time, result, role,
                        game_status, match_name, team_name, opponent_team_name,
                        civilization_year, civilization_defense_year,
                        civilization_production1, civilization_production2, civilization_production3,
                        simcity_citizens, simcity_happiness, simcity_production,
                        factorio_flasks, created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, NOW()
                    )
                ''', (
                    activity_id, student['id'], activity['type'], activity['date'],
                    activity.get('points'), activity.get('time'), activity.get('result'), activity.get('role'),
                    activity.get('gameStatus'), activity.get('matchName'), activity.get('teamName'), activity.get('opponentTeamName'),
                    activity.get('civilizationYear'), activity.get('civilizationDefenseYear'),
                    activity.get('civilizationProduction1'), activity.get('civilizationProduction2'), activity.get('civilizationProduction3'),
                    activity.get('simcityCitizens'), activity.get('simcityHappiness'), activity.get('simcityProduction'),
                    activity.get('factorioFlasks')
                ))


def save_matches(cursor, matches: List[Dict[str, Any]]) -> None:
    for match in matches:
        team1_id = save_team(cursor, match['team1'])
        team2_id = save_team(cursor, match['team2'])
        
        cursor.execute('''
            INSERT INTO matches (id, game_type, team1_id, team2_id, result, date, completed, created_by, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                game_type = EXCLUDED.game_type,
                result = EXCLUDED.result,
                completed = EXCLUDED.completed
        ''', (
            match['id'], match['gameType'], team1_id, team2_id,
            match.get('result'), match['date'], match['completed'], match['createdBy']
        ))
        
        cursor.execute('DELETE FROM scheduled_dates WHERE match_id = %s', (match['id'],))
        for sd in match.get('scheduledDates', []):
            cursor.execute('''
                INSERT INTO scheduled_dates (id, match_id, date, time)
                VALUES (%s, %s, %s, %s)
            ''', (sd['id'], match['id'], sd['date'], sd['time']))


def save_team(cursor, team: Dict[str, Any]) -> str:
    cursor.execute('''
        INSERT INTO teams (id, name, created_at)
        VALUES (%s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    ''', (team['id'], team['name']))
    
    cursor.execute('DELETE FROM team_members WHERE team_id = %s', (team['id'],))
    for member in team.get('members', []):
        cursor.execute('''
            INSERT INTO team_members (id, team_id, student_id, student_name, class_name, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            f"{team['id']}-{member['studentId']}", team['id'],
            member['studentId'], member['studentName'], member['className'], member['role']
        ))
    
    return team['id']
