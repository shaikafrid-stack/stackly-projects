from flask import Blueprint, request, jsonify
from models.db import db
from models.models import Timesheet, EmployeeProject
from utils.auth_utils import token_required, manager_required
from datetime import date

timesheets_bp = Blueprint("timesheets", __name__)


@timesheets_bp.route("/timesheets", methods=["POST"])
@token_required
def create_timesheet(current_user):
    data = request.get_json()
    project_id = data.get("project_id")
    work_date = data.get("work_date")
    hours_logged = data.get("hours_logged")
    task_description = data.get("task_description", "")

    if not project_id or not work_date or hours_logged is None:
        return jsonify({"error": "project_id, work_date, and hours_logged are required"}), 400
    if float(hours_logged) <= 0 or float(hours_logged) > 24:
        return jsonify({"error": "Hours logged must be between 0.1 and 24"}), 400

    assigned = EmployeeProject.query.filter_by(
        employee_id=current_user.id, project_id=project_id
    ).first()
    if not assigned:
        return jsonify({"error": "You are not assigned to this project"}), 403

    ts = Timesheet(
        employee_id=current_user.id,
        project_id=project_id,
        work_date=date.fromisoformat(work_date),
        hours_logged=float(hours_logged),
        task_description=task_description
    )
    db.session.add(ts)
    db.session.commit()
    return jsonify({"timesheet": ts.to_dict()}), 201


@timesheets_bp.route("/timesheets/my", methods=["GET"])
@token_required
def my_timesheets(current_user):
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    project_id = request.args.get("project_id")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    query = Timesheet.query.filter_by(employee_id=current_user.id)
    if project_id:
        query = query.filter_by(project_id=project_id)
    if start_date:
        query = query.filter(Timesheet.work_date >= date.fromisoformat(start_date))
    if end_date:
        query = query.filter(Timesheet.work_date <= date.fromisoformat(end_date))

    paginated = query.order_by(Timesheet.work_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "timesheets": [t.to_dict() for t in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@timesheets_bp.route("/timesheets", methods=["GET"])
@manager_required
def all_timesheets(current_user):
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    project_id = request.args.get("project_id")
    employee_id = request.args.get("employee_id")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    query = Timesheet.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    if start_date:
        query = query.filter(Timesheet.work_date >= date.fromisoformat(start_date))
    if end_date:
        query = query.filter(Timesheet.work_date <= date.fromisoformat(end_date))

    paginated = query.order_by(Timesheet.work_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "timesheets": [t.to_dict() for t in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@timesheets_bp.route("/timesheets/<int:ts_id>", methods=["PUT"])
@token_required
def update_timesheet(current_user, ts_id):
    ts = Timesheet.query.get_or_404(ts_id)
    if ts.employee_id != current_user.id and current_user.role != "manager":
        return jsonify({"error": "Not authorized"}), 403

    data = request.get_json()
    if "hours_logged" in data:
        if float(data["hours_logged"]) <= 0 or float(data["hours_logged"]) > 24:
            return jsonify({"error": "Hours must be between 0.1 and 24"}), 400
        ts.hours_logged = float(data["hours_logged"])
    if "work_date" in data:
        ts.work_date = date.fromisoformat(data["work_date"])
    if "task_description" in data:
        ts.task_description = data["task_description"]

    db.session.commit()
    return jsonify({"timesheet": ts.to_dict()}), 200


@timesheets_bp.route("/timesheets/<int:ts_id>", methods=["DELETE"])
@token_required
def delete_timesheet(current_user, ts_id):
    ts = Timesheet.query.get_or_404(ts_id)
    if ts.employee_id != current_user.id and current_user.role != "manager":
        return jsonify({"error": "Not authorized"}), 403

    db.session.delete(ts)
    db.session.commit()
    return jsonify({"message": "Timesheet deleted"}), 200
