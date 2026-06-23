from flask import Blueprint, jsonify, request
from models.models import User
from utils.auth_utils import token_required, manager_required

employees_bp = Blueprint("employees", __name__)


@employees_bp.route("/employees", methods=["GET"])
@manager_required
def get_employees(current_user):
    search = request.args.get("search", "")
    query = User.query.filter_by(role="employee")
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    employees = query.all()
    return jsonify({"employees": [e.to_dict() for e in employees]}), 200
