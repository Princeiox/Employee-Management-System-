from sqlalchemy import inspect, text

from app import models
from app.db.database import engine


def init_db() -> None:
    # Create missing tables first, then backfill columns for older deployments.
    models.Base.metadata.create_all(bind=engine)
    _ensure_columns()


def _ensure_columns() -> None:
    with engine.begin() as conn:
        inspector = inspect(conn)

        existing_users_columns = {column["name"] for column in inspector.get_columns("users")}
        users_columns = {
            "phone": "ALTER TABLE users ADD COLUMN phone VARCHAR(255)",
            "cover_pic": "ALTER TABLE users ADD COLUMN cover_pic VARCHAR(255)",
            "leave_balance": "ALTER TABLE users ADD COLUMN leave_balance INTEGER DEFAULT 24",
            "pref_timesheets": "ALTER TABLE users ADD COLUMN pref_timesheets BOOLEAN DEFAULT TRUE",
            "pref_alerts": "ALTER TABLE users ADD COLUMN pref_alerts BOOLEAN DEFAULT TRUE",
            "github_url": "ALTER TABLE users ADD COLUMN github_url TEXT",
            "meet_url": "ALTER TABLE users ADD COLUMN meet_url TEXT",
        }

        for column_name, sql in users_columns.items():
            if column_name not in existing_users_columns:
                conn.execute(text(sql))

        existing_attendance_columns = {column["name"] for column in inspector.get_columns("attendance")}
        attendance_columns = {
            "latitude": "ALTER TABLE attendance ADD COLUMN latitude FLOAT",
            "longitude": "ALTER TABLE attendance ADD COLUMN longitude FLOAT",
        }

        for column_name, sql in attendance_columns.items():
            if column_name not in existing_attendance_columns:
                conn.execute(text(sql))
