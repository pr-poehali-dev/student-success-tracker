"""
Скрипт для экспорта данных из текущей БД в SQL файл
Запустите это на своём компьютере с доступом к текущей БД poehali.dev
"""
import os
import psycopg2

# Получите DATABASE_URL по ссылке: https://functions.poehali.dev/a6f07eb2-4c19-423a-a564-fe3d37a9c904
DATABASE_URL = os.environ.get('DATABASE_URL', 'ВСТАВЬТЕ_СЮДА_DATABASE_URL_ИЗ_ФУНКЦИИ')
SCHEMA = 't_p91106428_student_success_trac'
OUTPUT_FILE = 'data_dump.sql'

def escape_sql_value(value):
    """Escape SQL values for INSERT statements"""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        # Convert Python list to PostgreSQL array format
        escaped_items = [f"'{str(item).replace(chr(39), chr(39)+chr(39))}'" for item in value]
        return "ARRAY[" + ", ".join(escaped_items) + "]"
    # String type
    return "'" + str(value).replace("'", "''") + "'"

def export_table(cursor, table_name, f):
    """Export single table data to SQL file"""
    print(f"Exporting {table_name}...")
    
    # Get column names
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = '{SCHEMA}' AND table_name = '{table_name}'
        ORDER BY ordinal_position
    """)
    columns = cursor.fetchall()
    column_names = [col[0] for col in columns]
    
    # Get data
    cursor.execute(f'SELECT * FROM {SCHEMA}.{table_name}')
    rows = cursor.fetchall()
    
    if not rows:
        print(f"  No data in {table_name}")
        return
    
    f.write(f"\n-- Data for {table_name} ({len(rows)} rows)\n")
    
    for row in rows:
        values = [escape_sql_value(val) for val in row]
        insert_sql = f"INSERT INTO {table_name} ({', '.join(column_names)}) VALUES ({', '.join(values)});\n"
        f.write(insert_sql)
    
    print(f"  ✓ Exported {len(rows)} rows")

def main():
    print("=" * 60)
    print("ЭКСПОРТ ДАННЫХ ИЗ БАЗЫ ДАННЫХ POEHALI.DEV")
    print("=" * 60)
    
    if 'ВСТАВЬТЕ_СЮДА' in DATABASE_URL:
        print("\n❌ ОШИБКА: Укажите DATABASE_URL!")
        print("\n1. Откройте в браузере: https://functions.poehali.dev/a6f07eb2-4c19-423a-a564-fe3d37a9c904")
        print("2. Скопируйте значение 'database_url' из JSON")
        print("3. Замените DATABASE_URL в этом файле на скопированное значение")
        print("4. Запустите скрипт снова: python export_data.py\n")
        return
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Список таблиц в правильном порядке (учитывая foreign keys)
        tables = [
            'teachers',
            'classes',
            'students',
            'achievements',
            'activities',
            'teams',
            'team_members',
            'matches',
            'scheduled_dates',
            'attendance'
        ]
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write("-- Data dump from poehali.dev database\n")
            f.write(f"-- Generated: {__import__('datetime').datetime.now()}\n")
            f.write(f"-- Schema: {SCHEMA}\n\n")
            
            for table in tables:
                export_table(cursor, table, f)
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print(f"✅ ГОТОВО! Данные экспортированы в файл: {OUTPUT_FILE}")
        print("=" * 60)
        print("\nСкопируйте этот файл на ваш Ubuntu сервер вместе с остальными файлами проекта.")
        
    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        print("\nПроверьте правильность DATABASE_URL")

if __name__ == '__main__':
    main()
