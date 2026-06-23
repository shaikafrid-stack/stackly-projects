from app import create_app
from models.db import db
from models.models import User, Project, EmployeeProject, Timesheet
from datetime import date, timedelta
import random

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # Create manager
    manager = User(name="Alice Manager", email="manager@demo.com", role="manager")
    manager.set_password("manager123")
    db.session.add(manager)

    # Create employees
    employees = []
    for i, (name, email) in enumerate([
        ("Bob Smith", "bob@demo.com"),
        ("Carol Jones", "carol@demo.com"),
        ("David Lee", "david@demo.com"),
    ]):
        emp = User(name=name, email=email, role="employee")
        emp.set_password("employee123")
        db.session.add(emp)
        employees.append(emp)

    db.session.flush()

    # Create projects
    projects = []
    for pname, desc in [
        ("Website Redesign", "Complete overhaul of company website"),
        ("Mobile App v2", "New features for the mobile application"),
        ("Data Pipeline", "ETL pipeline for analytics"),
        ("CRM Integration", "Integrate Salesforce with internal tools"),
    ]:
        p = Project(
            project_name=pname,
            project_description=desc,
            start_date=date.today() - timedelta(days=30),
            end_date=date.today() + timedelta(days=60),
            status="active"
        )
        db.session.add(p)
        projects.append(p)

    db.session.flush()

    # Assign employees to projects
    for emp in employees:
        for proj in random.sample(projects, k=2):
            ep = EmployeeProject(
                employee_id=emp.id,
                project_id=proj.id,
                assigned_date=date.today() - timedelta(days=20)
            )
            db.session.add(ep)

    db.session.flush()

    # Add timesheets
    for emp in employees:
        assignments = EmployeeProject.query.filter_by(employee_id=emp.id).all()
        for i in range(10):
            work_date = date.today() - timedelta(days=i)
            ts = Timesheet(
                employee_id=emp.id,
                project_id=random.choice(assignments).project_id,
                work_date=work_date,
                hours_logged=round(random.uniform(2, 8), 2),
                task_description=f"Work on task for day {i+1}"
            )
            db.session.add(ts)

    db.session.commit()
    print("✅ Seed data inserted successfully!")
    print("Manager login: manager@demo.com / manager123")
    print("Employee login: bob@demo.com / employee123")
