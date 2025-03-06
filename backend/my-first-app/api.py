from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Reactアプリのオリジン
    allow_credentials=True,
    allow_methods=["*"],  # 全てのHTTPメソッドを許可
    allow_headers=["*"],  # 全てのヘッダーを許可
)

DATABASE = "todolist.db"

# SQLiteの接続関数
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# データベース初期化（テーブル作成）
def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            is_complete INTEGER NOT NULL DEFAULT 0,
            due_date TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Pydanticモデル（入力／出力用）
# BaseModel: pydanticのライブラリ これを使っておけば大丈夫
class Task(BaseModel):
    id: Optional[int]
    task: str
    is_complete: Optional[int] = 0
    due_date: Optional[str] = None

# タスク一覧取得エンドポイント
@app.get("/tasks", response_model=List[Task])
def read_tasks():
    conn = get_db_connection()
    cursor = conn.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()
    conn.close()
    return [Task(**dict(row)) for row in rows]

# 単一タスク取得エンドポイント
@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**dict(row))

# タスク作成エンドポイント
@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: Task):
    conn = get_db_connection()
    cursor = conn.execute(
        "INSERT INTO tasks (task, is_complete, due_date) VALUES (?, ?, ?)",
        (task.task, task.is_complete, task.due_date)
    )
    conn.commit()
    task_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return Task(**dict(row))

    # ...existing code...

# タスク更新エンドポイント
@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: Task):
    conn = get_db_connection()
    cursor = conn.execute(
        "UPDATE tasks SET task = ?, is_complete = ?, due_date = ? WHERE id = ?",
        (task.task, task.is_complete, task.due_date, task_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**dict(row))

# タスク削除エンドポイント
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_db_connection()
    cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}