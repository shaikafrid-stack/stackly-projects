from flask import Blueprint, request, jsonify
from models.db import db
from models.models import Project, EmployeeProject
from utils.auth_utils import token_required, manager_required
from datetime import date

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/projects", methods=["GET"])
@token_required
def get_projects(current_user):
    status_filter = request.args.get("status")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    query = Project.query
    if status_filter:
        query = query.filter_by(status=status_filter)
    if search:
        query = query.filter(Project.project_name.ilike(f"%{search}%"))

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "projects": [p.to_dict() for p in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@projects_bp.route("/projects/<int:project_id>", methods=["GET"])
@token_required
def get_project(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({"project": project.to_dict()}), 200


@projects_bp.route("/projects", methods=["POST"])
@manager_required
def create_project(current_user):
    data = request.get_json()
    name = data.get("project_name", "").strip()
    if not name:
        return jsonify({"error": "Project name is required"}), 400

    project = Project(
        project_name=name,
        project_description=data.get("project_description", ""),
        start_date=date.fromisoformat(data["start_date"]) if data.get("start_date") else None,
        end_date=date.fromisoformat(data["end_date"]) if data.get("end_date") else None,
        status=data.get("status", "active")
    )
    db.session.add(project)
    db.session.commit()
    return jsonify({"project": project.to_dict()}), 201


@projects_bp.route("/projects/<int:project_id>", methods=["PUT"])
@manager_required
def update_project(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()

    if "project_name" in data:
        project.project_name = data["project_name"].strip()
    if "project_description" in data:
        project.project_description = data["project_description"]
    if "start_date" in data and data["start_date"]:
        project.start_date = date.fromisoformat(data["start_date"])
    if "end_date" in data and data["end_date"]:
        project.end_date = date.fromisoformat(data["end_date"])
    if "status" in data:
        project.status = data["status"]

    db.session.commit()
    return jsonify({"project": project.to_dict()}), 200


@projects_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@manager_required
def delete_project(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted"}), 200


@projects_bp.route("/assign-project", methods=["POST"])
@manager_required
def assign_project(current_user):
    data = request.get_json()
    employee_id = data.get("employee_id")
    project_id = data.get("project_id")

    if not employee_id or not project_id:
        return jsonify({"error": "employee_id and project_id are required"}), 400

    existing = EmployeeProject.query.filter_by(
        employee_id=employee_id, project_id=project_id
    ).first()
    if existing:
        return jsonify({"error": "Employee already assigned to this project"}), 409

    assignment = EmployeeProject(
        employee_id=employee_id,
        project_id=project_id,
        assigned_date=date.today()
    )
    db.session.add(assignment)
    db.session.commit()
    return jsonify({"assignment": assignment.to_dict()}), 201


@projects_bp.route("/employee-projects", methods=["GET"])
@token_required
def employee_projects(current_user):
    if current_user.role == "manager":
        assignments = EmployeeProject.query.all()
    else:
        assignments = EmployeeProject.query.filter_by(employee_id=current_user.id).all()
    return jsonify({"assignments": [a.to_dict() for a in assignments]}), 200


@projects_bp.route("/unassign-project/<int:assignment_id>", methods=["DELETE"])
@manager_required
def unassign_project(current_user, assignment_id):
    assignment = EmployeeProject.query.get_or_404(assignment_id)
    db.session.delete(assignment)
    db.session.commit()
    return jsonify({"message": "Assignment removed"}), 200
