import sqlite3
conn = sqlite3.connect("app.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print("Tables in database:", tables)

if 'users' in tables:
    cursor.execute("PRAGMA table_info(users)")
    columns = [(col[1], col[2]) for col in cursor.fetchall()]
    print("\nUsers table columns:")
    for name, type in columns:
        print(f"  - {name}: {type}")
else:
    print("No users table found!")

conn.close()
