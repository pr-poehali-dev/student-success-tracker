"""
WebSocket-like сервер для real-time синхронизации через Long Polling.
Хранит последние изменения в памяти и отдает их клиентам по запросу.
"""
import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# In-memory хранилище изменений (живет пока работает функция)
# В production можно использовать Redis, но для начала достаточно памяти
CHANGES_STORE: Dict[str, List[Dict[str, Any]]] = {}
CLEANUP_INTERVAL = 300  # Очищаем старые изменения каждые 5 минут

# Отслеживание онлайн пользователей: {teacher_id: last_seen_timestamp}
ONLINE_USERS: Dict[str, float] = {}
ONLINE_TIMEOUT = 10  # Считаем офлайн если не было активности 10 секунд

def cleanup_old_changes():
    """Удаляем изменения старше 1 часа"""
    current_time = time.time()
    cutoff_time = current_time - 3600  # 1 час
    
    for key in list(CHANGES_STORE.keys()):
        CHANGES_STORE[key] = [
            change for change in CHANGES_STORE[key]
            if change.get('timestamp', 0) > cutoff_time
        ]
        if not CHANGES_STORE[key]:
            del CHANGES_STORE[key]

def add_change(change_type: str, data: Any, author: str):
    """Добавляет изменение в очередь broadcast"""
    change = {
        'type': change_type,
        'data': data,
        'author': author,
        'timestamp': time.time()
    }
    
    if 'all' not in CHANGES_STORE:
        CHANGES_STORE['all'] = []
    
    CHANGES_STORE['all'].append(change)
    
    # Ограничиваем размер очереди (храним последние 1000 изменений)
    if len(CHANGES_STORE['all']) > 1000:
        CHANGES_STORE['all'] = CHANGES_STORE['all'][-1000:]
    
    print(f"📣 [BROADCAST] Added change: {change_type} by {author}")

def get_changes_since(since_timestamp: float) -> List[Dict[str, Any]]:
    """Возвращает все изменения после указанного timestamp"""
    all_changes = CHANGES_STORE.get('all', [])
    return [
        change for change in all_changes
        if change.get('timestamp', 0) > since_timestamp
    ]

def update_user_online(user_id: str, user_name: str):
    """Обновляет последнюю активность пользователя"""
    ONLINE_USERS[user_id] = {
        'name': user_name,
        'last_seen': time.time()
    }

def get_online_users() -> List[Dict[str, Any]]:
    """Возвращает список онлайн пользователей"""
    current_time = time.time()
    online = []
    
    # Очищаем неактивных пользователей
    for user_id in list(ONLINE_USERS.keys()):
        user_data = ONLINE_USERS[user_id]
        if current_time - user_data['last_seen'] > ONLINE_TIMEOUT:
            del ONLINE_USERS[user_id]
        else:
            online.append({
                'id': user_id,
                'name': user_data['name'],
                'last_seen': user_data['last_seen']
            })
    
    return online

def handler(event: dict, context) -> dict:
    """
    Обрабатывает запросы для WebSocket-like синхронизации.
    
    GET /websocket?since=<timestamp> - получить изменения после timestamp
    POST /websocket - отправить изменение для broadcast
    OPTIONS /websocket - CORS preflight
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }
    
    # OPTIONS - CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    # GET - получить изменения
    if method == 'GET':
        try:
            query_params = event.get('queryStringParameters', {}) or {}
            since_str = query_params.get('since', '0')
            user_id = query_params.get('userId', '')
            user_name = query_params.get('userName', 'Unknown')
            
            try:
                since_timestamp = float(since_str)
            except (ValueError, TypeError):
                since_timestamp = 0
            
            # Обновляем онлайн статус пользователя
            if user_id:
                update_user_online(user_id, user_name)
            
            # Получаем изменения
            changes = get_changes_since(since_timestamp)
            
            # Получаем список онлайн пользователей
            online_users = get_online_users()
            
            # Периодически чистим старые изменения
            if time.time() % CLEANUP_INTERVAL < 1:
                cleanup_old_changes()
            
            response_data = {
                'changes': changes,
                'timestamp': time.time(),
                'count': len(changes),
                'online_users': online_users
            }
            
            print(f"📥 [GET] Returning {len(changes)} changes since {since_timestamp}, {len(online_users)} users online")
            
            return {
                'statusCode': 200,
                'headers': {
                    **cors_headers,
                    'Content-Type': 'application/json'
                },
                'body': json.dumps(response_data)
            }
            
        except Exception as e:
            print(f"❌ [GET] Error: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    **cors_headers,
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': str(e)})
            }
    
    # POST - отправить изменение
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            change_type = body.get('type')
            data = body.get('data')
            author = body.get('author', 'Unknown')
            
            if not change_type or data is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        **cors_headers,
                        'Content-Type': 'application/json'
                    },
                    'body': json.dumps({'error': 'Missing type or data'})
                }
            
            # Добавляем изменение в broadcast
            add_change(change_type, data, author)
            
            print(f"✅ [POST] Change added: {change_type} by {author}")
            
            return {
                'statusCode': 200,
                'headers': {
                    **cors_headers,
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'success': True,
                    'timestamp': time.time()
                })
            }
            
        except Exception as e:
            print(f"❌ [POST] Error: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    **cors_headers,
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': str(e)})
            }
    
    # Неподдерживаемый метод
    return {
        'statusCode': 405,
        'headers': {
            **cors_headers,
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }