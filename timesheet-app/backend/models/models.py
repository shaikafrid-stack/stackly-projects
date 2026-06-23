from models.db import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("manager", "employee"), nullable=False, default="employee")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    timesheets = db.relationship("Timesheet", backref="employee", lazy=True)
    assignments = db.relationship("EmployeeProject", backref="employee", lazy=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(200), nullable=False)
    project_description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    status = db.Column(db.Enum("active", "completed", "on_hold"), default="active")

    assignments = db.relationship("EmployeeProject", backref="project", lazy=True)
    timesheets = db.relationship("Timesheet", backref="project", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "project_name": self.project_name,
            "project_description": self.project_description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status
        }


class EmployeeProject(db.Model):
    __tablename__ = "employee_projects"

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    assigned_date = db.Column(db.Date, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "project_id": self.project_id,
            "assigned_date": self.assigned_date.isoformat() if self.assigned_date else None,
            "employee_name": self.employee.name if self.employee else None,
            "project_name": self.project.project_name if self.project else None
        }


class Timesheet(db.Model):
    __tablename__ = "timesheets"

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    work_date = db.Column(db.Date, nullable=False)
    hours_logged = db.Column(db.Numeric(4, 2), nullable=False)
    task_description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "project_id": self.project_id,
            "work_date": self.work_date.isoformat() if self.work_date else None,
            "hours_logged": float(self.hours_logged),
            "task_description": self.task_description,
            "created_at": self.created_at.isoformat(),
            "employee_name": self.employee.name if self.employee else None,
            "project_name": self.project.project_name if self.project else None
        }
