# server routes (GET/POST/etc) + connects to DB

import os
from flask import Flask, request, jsonify, g, session
from flask_cors import CORS
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash
from sqlite3 import IntegrityError

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "database.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("SECRET_KEY", "change_me_later")

    # CORS: allow frontend (local dev or Render static site URL)
    origins = ["http://localhost:5173"]
    frontend_url = os.environ.get("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url.rstrip("/"))
    CORS(
        app,
        resources={r"/*": {"origins": origins}},
        supports_credentials=True,
    )

    # Cross-origin session cookie: required when frontend and API are on different origins (e.g. Render)
    if frontend_url:
        app.config["SESSION_COOKIE_SAMESITE"] = "None"
        app.config["SESSION_COOKIE_SECURE"] = True

    # ensure new optional columns exist on Tasks for description and dates
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        cols = {row["name"] for row in conn.execute("PRAGMA table_info(Tasks);").fetchall()}
        for name, ddl in [
            ("description", "TEXT"),
            ("start_date", "TEXT"),
            ("end_date", "TEXT"),
        ]:
            if name not in cols:
                conn.execute(f"ALTER TABLE Tasks ADD COLUMN {name} {ddl};")
        conn.commit()

    def get_db(): #get db connection from global context
        if "db" not in g:
            g.db = sqlite3.connect(DB_PATH)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON;")
        return g.db
    
    @app.teardown_appcontext #close db connection when app context is torn down
    def close_db(exception):
        db = g.pop("db", None)
        if db is not None:
            db.close()
    
    @app.get("/health") #health check route
    def health():
        return jsonify({"ok": True})

    #helper function to format task data
    def format_task(row):
        return {
            "id": row["id"],
            "task": row["task"],
            "description": row["description"],
            "start_date": row["start_date"],
            "end_date": row["end_date"],
            "created_at": row["created_at"],
            "completed": bool(row["completed"])
        }

    def require_login(): #check if user is logged in (401 if not)
        user_id = session.get("user_id")
        if not user_id:
            return None, jsonify({"error": "Unauthorized"}), 401
        return user_id, None

    
    @app.post("/register") #register route
    def register():
        data = request.get_json(silent=True) or {} #get json data from request, if none, return empty dict
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
        
        password_hash = generate_password_hash(password)

        db = get_db()
        try:
            db.execute("INSERT INTO Users (username, password_hash) VALUES (?, ?)", (username, password_hash))
            db.commit()
        
        except IntegrityError:
            return jsonify({"error": "Username already exists"}), 409
        
        return jsonify({"ok": True}), 201
    

    @app.post("/login") #login route
    def login():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
        
        db = get_db()
        row = db.execute("SELECT id, password_hash FROM Users WHERE username = ?", (username,)).fetchone()

        if not row or not check_password_hash(row["password_hash"], password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        #set user id in flask session
        session.clear()
        session["user_id"] = row["id"] 
        return jsonify({"ok": True}), 200


    @app.post("/logout") #logout route
    def logout():
        session.clear()
        return jsonify({"ok": True}), 200

    @app.post("/tasks") #create task route
    def create_task():

        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        #read task from request body
        data = request.get_json(silent=True) or {}
        task_text = (data.get("task") or "").strip()
        description = (data.get("description") or "").strip()
        start_date = (data.get("start_date") or "").strip()
        end_date = (data.get("end_date") or "").strip()

        if not task_text:
            return jsonify({"error": "Task is required"}), 400
        
        db = get_db()
        cur = db.execute(
            "INSERT INTO Tasks (user_id, task, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
            (user_id, task_text, description, start_date, end_date),
        )
        db.commit()

        row = db.execute(
            "SELECT id, task, description, start_date, end_date, created_at, completed FROM Tasks WHERE id = ? AND  user_id = ?",
            (cur.lastrowid, user_id),
        ).fetchone()

        return jsonify(format_task(row)), 201
    
    @app.get("/tasks") #protect task route with login check
    def list_tasks():
        user_id = session.get("user_id")
        if not user_id: 
            return jsonify({"error": "Unauthorized"}), 401

        db = get_db()
        rows = db.execute(
            "SELECT id, task, description, start_date, end_date, created_at, completed FROM Tasks WHERE user_id = ?",
            (user_id,),
        ).fetchall()

        return jsonify({"tasks": [format_task(r) for r in rows]}), 200

    @app.patch("/tasks/<int:task_id>") #update task route
    def update_task(task_id):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        
        data = request.get_json(silent=True) or {}
        task_text = (data.get("task") or "").strip()
        description = (data.get("description") or "").strip()
        start_date = (data.get("start_date") or "").strip()
        end_date = (data.get("end_date") or "").strip()

        if not task_text:
            return jsonify({"error": "Task is required"}), 400

        db = get_db()
        cur = db.execute(
            "UPDATE Tasks SET task = ?, description = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?",
            (task_text, description or None, start_date or None, end_date or None, task_id, user_id),
        )
        db.commit()

        if cur.rowcount == 0:
            return jsonify({"error": "Task not found"}), 404

        row = db.execute(
            "SELECT id, task, description, start_date, end_date, created_at, completed FROM Tasks WHERE id = ? AND user_id = ?",
            (task_id, user_id),
        ).fetchone()

        return jsonify(format_task(row)), 200

    @app.patch("/tasks/<int:task_id>/complete")  # complete task route (toggle on/off)
    def complete_task(task_id):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json(silent=True) or {}
        completed = data.get("completed")
        if completed is None:
            completed = True  # default: mark complete
        completed = 1 if completed else 0

        db = get_db()
        cur = db.execute(
            "UPDATE Tasks SET completed = ? WHERE id = ? AND user_id = ?",
            (completed, task_id, user_id),
        )
        db.commit()

        if cur.rowcount == 0:
            return jsonify({"error": "Task not found"}), 404
        
        row = db.execute(
            "SELECT id, task, description, start_date, end_date, created_at, completed FROM Tasks WHERE id = ? AND user_id = ?",
            (task_id, user_id),
        ).fetchone()

        return jsonify(format_task(row)), 200

    
    @app.delete("/tasks/<int:task_id>") #delete task route
    def delete_task(task_id):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        db = get_db()
        cur = db.execute("DELETE FROM Tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        db.commit()

        if cur.rowcount == 0:
            return jsonify({"error": "Task not found"}), 404

        return jsonify({"ok": True, "deleted_id": task_id}), 200
    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5050)