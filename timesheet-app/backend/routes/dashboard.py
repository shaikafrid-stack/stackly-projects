from flask import Blueprint, jsonify
from models.db import db
from models.models import User, Project, Timesheet, EmployeeProject
from utils.auth_utils import token_required, manager_required
from sqlalchemy import func
from datetime import date, timedelta

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard/employee", methods=["GET"])
@token_required
def employee_dashboard(current_user):
    assigned_count = EmployeeProject.query.filter_by(employee_id=current_user.id).count()
    total_hours = db.session.query(func.sum(Timesheet.hours_logged)).filter_by(
        employee_id=current_user.id
    ).scalar() or 0

    week_start = date.today() - timedelta(days=date.today().weekday())
    weekly_hours = db.session.query(func.sum(Timesheet.hours_logged)).filter(
        Timesheet.employee_id == current_user.id,
        Timesheet.work_date >= week_start
    ).scalar() or 0

    recent_timesheets = Timesheet.query.filter_by(
        employee_id=current_user.id
    ).order_by(Timesheet.work_date.desc()).limit(5).all()

    return jsonify({
        "assigned_projects": assigned_count,
        "total_hours": float(total_hours),
        "weekly_hours": float(weekly_hours),
        "recent_timesheets": [t.to_dict() for t in recent_timesheets]
    }), 200


@dashboard_bp.route("/dashboard/manager", methods=["GET"])
@manager_required
def manager_dashboard(current_user):
    total_employees = User.query.filter_by(role="employee").count()
    active_projects = Project.query.filter_by(status="active").count()
    total_hours = db.session.query(func.sum(Timesheet.hours_logged)).scalar() or 0
    pending_entries = Timesheet.query.count()

    # Employee-wise hours
    emp_hours = db.session.query(
        User.name, func.sum(Timesheet.hours_logged).label("hours")
    ).join(Timesheet, User.id == Timesheet.employee_id).group_by(User.id, User.name).all()

    # Project-wise hours
    proj_hours = db.session.query(
        Project.project_name, func.sum(Timesheet.hours_logged).label("hours")
    ).join(Timesheet, Project.id == Timesheet.project_id).group_by(Project.id, Project.project_name).all()

    # Top 5 most active employees
    top_employees = db.session.query(
        User.name, func.sum(Timesheet.hours_logged).label("hours")
    ).join(Timesheet, User.id == Timesheet.employee_id).group_by(
        User.id, User.name
    ).order_by(func.sum(Timesheet.hours_logged).desc()).limit(5).all()

    return jsonify({
        "total_employees": total_employees,
        "active_projects": active_projects,
        "total_hours": float(total_hours),
        "pending_entries": pending_entries,
        "employee_hours": [{"name": r[0], "hours": float(r[1])} for r in emp_hours],
        "project_hours": [{"name": r[0], "hours": float(r[1])} for r in proj_hours],
        "top_employees": [{"name": r[0], "hours": float(r[1])} for r in top_employees]
    }), 200
