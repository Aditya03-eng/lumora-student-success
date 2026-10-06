"""
SQLite persistence module for Lumora Backend.
Stores: mentor assignments, mock interviews, feedback, assessments, events, hackathons, certificates.
"""

import os
import sqlite3
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lumora.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Mentor assignments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mentor_assignments (
        student_id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        mentor_name TEXT NOT NULL,
        assigned_at TEXT NOT NULL
    );
    """)

    # 2. Intervention status overrides
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS intervention_statuses (
        student_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # 3. Skills & Assessments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT,
        department TEXT,
        assessment_type TEXT NOT NULL,
        category TEXT NOT NULL,
        score REAL NOT NULL,
        status TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT
    );
    """)

    # 4. Mock Interviews
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mock_interviews (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        department TEXT,
        interviewer TEXT NOT NULL,
        interviewer_id TEXT,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 5. Feedback
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedbacks (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        department TEXT,
        mentor TEXT NOT NULL,
        category TEXT NOT NULL,
        rating INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        date TEXT NOT NULL
    );
    """)

    # 6. Campus Events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        event_name TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        participants INTEGER NOT NULL,
        status TEXT NOT NULL,
        description TEXT
    );
    """)

    # 7. Hackathons
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hackathons (
        id TEXT PRIMARY KEY,
        hackathon_name TEXT NOT NULL,
        date TEXT NOT NULL,
        participants INTEGER NOT NULL,
        teams INTEGER NOT NULL,
        winners TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT
    );
    """)

    # 8. Certificates
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        department TEXT,
        event_or_hackathon TEXT NOT NULL,
        achievement TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        status TEXT NOT NULL,
        credential_id TEXT NOT NULL,
        verified_by TEXT,
        verified_at TEXT
    );
    """)

    conn.commit()

    # Seed verified initial mock data if empty
    seed_initial_data(cursor, conn)
    conn.close()

def seed_initial_data(cursor: sqlite3.Cursor, conn: sqlite3.Connection):
    # Check if events table is empty
    cursor.execute("SELECT COUNT(*) FROM events")
    if cursor.fetchone()[0] == 0:
        initial_events = [
            ("EVT-01", "Annual Inter-University HackSprint 2026", "2026-10-24", "Technical", "Innovation Hub Lab 4", 164, "Upcoming", "24-hour sprint focused on AI for social impact, cloud pipelines, and IoT architectures."),
            ("EVT-02", "Placement Mock Drive & HR Round", "2026-10-29", "Career", "Auditorium West", 320, "Upcoming", "Rigorous corporate simulation with Fortune 500 recruiters for final and pre-final year cohorts."),
            ("EVT-03", "National Mathematics & Algorithmic Symposium", "2026-11-05", "Academic", "Conference Hall B", 95, "Upcoming", "Keynotes on graph algorithms, theoretical computing, and competitive mathematical Olympiads."),
            ("EVT-04", "Spandan Cultural Fest 2026", "2026-11-14", "Cultural", "Open Air Theatre", 480, "Upcoming", "Inter-college arts showcase, drama competitions, music, and literary debates."),
            ("EVT-05", "Inter-Department Cricket & Football Cup", "2026-11-20", "Sports", "Main Sports Complex", 240, "Upcoming", "Championship league fostering inter-department camaraderie, teamwork, and athletic wellness."),
            ("EVT-06", "Full Stack Cloud Workshop with AWS", "2026-09-18", "Technical", "CS Seminar Hall", 210, "Past", "Hands-on architectural deployment workshop on serverless microservices and Terraform."),
            ("EVT-07", "Campus Resume Clinic & LinkedIn Masterclass", "2026-09-04", "Career", "Management Block", 380, "Past", "1-on-1 resume tear-downs and corporate personal branding masterclasses by senior industry leaders."),
            ("EVT-08", "Research Methodologies in Data Science", "2026-08-22", "Academic", "Lecture Hall 1", 135, "Past", "Faculty-led symposium on peer-reviewed scientific publishing and dataset benchmarking.")
        ]
        cursor.executemany("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?)", initial_events)

    # Check if hackathons table is empty
    cursor.execute("SELECT COUNT(*) FROM hackathons")
    if cursor.fetchone()[0] == 0:
        initial_hackathons = [
            ("HACK-01", "Smart India Hackathon (SIH) Internal Grand Finale", "2026-09-24", 180, 36, "Team CyberSentinels (CSE)", "Completed", json.dumps({
                "theme": "Smart Automation & Campus Infrastructure",
                "participants": [
                    {"student_id": "STU10003", "name": "Sakshi Negi", "department": "Mechanical", "team": "EcoAutomata", "role": "Hardware Lead", "achievement": "1st Runner-Up"},
                    {"student_id": "STU10008", "name": "Kabir Srivastava", "department": "AI & DS", "team": "Neurals", "role": "ML Developer", "achievement": "Finalist"},
                    {"student_id": "STU10012", "name": "Rohan Deshmukh", "department": "CSE", "team": "CyberSentinels", "role": "Full Stack Lead", "achievement": "Winner"},
                    {"student_id": "STU10004", "name": "Ankit Malhotra", "department": "ECE", "team": "QuantumPulse", "role": "System Architect", "achievement": "Special Jury Mention"}
                ]
            })),
            ("HACK-02", "HackNova 48-Hour Open AI Challenge", "2026-06-12", 140, 28, "Team VisionML (AI & DS)", "Completed", json.dumps({
                "theme": "Generative AI Agents & Multimodal Processing",
                "participants": [
                    {"student_id": "STU10001", "name": "Kritika Agarwal", "department": "BBA", "team": "FinSmart", "role": "Product Strategist", "achievement": "Best Business Pitch"},
                    {"student_id": "STU10012", "name": "Rohan Deshmukh", "department": "CSE", "team": "VisionML", "role": "Tech Lead", "achievement": "Winner"}
                ]
            })),
            ("HACK-03", "CodeRed Algorithmic HackSprint", "2026-11-15", 220, 44, "TBD", "Upcoming", json.dumps({
                "theme": "High-Throughput Distributed Systems",
                "participants": []
            }))
        ]
        cursor.executemany("INSERT INTO hackathons VALUES (?, ?, ?, ?, ?, ?, ?, ?)", initial_hackathons)

    # Check if certificates table is empty
    cursor.execute("SELECT COUNT(*) FROM certificates")
    if cursor.fetchone()[0] == 0:
        initial_certs = [
            ("CERT-001", "STU10012", "Rohan Deshmukh", "CSE", "Smart India Hackathon 2026", "Winner - 1st Place", "2026-09-25", "Verified", "SIH-2026-WIN-042", "Dean Office", "2026-09-26"),
            ("CERT-002", "STU10003", "Sakshi Negi", "Mechanical", "Smart India Hackathon 2026", "1st Runner-Up", "2026-09-25", "Verified", "SIH-2026-RU-108", "Dean Office", "2026-09-26"),
            ("CERT-003", "STU10008", "Kabir Srivastava", "AI & DS", "AI Summit HackSprint", "Runner Up - 2nd Place", "2026-04-10", "Verified", "AIS-2026-RU-204", "Dept Coordinator", "2026-04-12"),
            ("CERT-004", "STU10005", "Kabir Jain", "CSE", "Smart Campus Hackathon", "Best Technical Solution", "2026-03-15", "Pending", "SCH-2026-BTS-008", None, None),
            ("CERT-005", "STU10015", "Aarav Sharma", "ECE", "IoT Hardware Hackfest", "Special Jury Award", "2026-01-22", "Verified", "IOT-2026-SJA-033", "Dean Office", "2026-01-25"),
            ("CERT-006", "STU10032", "Ananya Roy", "BCA", "Cloud Native Developer Sprint", "Finalist", "2026-05-04", "Pending", "CNDS-2026-FN-115", None, None)
        ]
        cursor.executemany("INSERT INTO certificates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", initial_certs)

    # Check if feedbacks table is empty
    cursor.execute("SELECT COUNT(*) FROM feedbacks")
    if cursor.fetchone()[0] == 0:
        initial_feedbacks = [
            ("FB-01", "STU10008", "Kabir Srivastava", "AI & DS", "Priya Mehta", "Coding", 4, "Strong progress in algorithmic problem solving. Needs practice in dynamic programming and tree traversals.", "2026-10-04"),
            ("FB-02", "STU10004", "Ankit Malhotra", "ECE", "Amit Kumar", "Attendance", 3, "Attendance improved over last 3 weeks from 58% to 72%. On track to reach clearance threshold.", "2026-10-03"),
            ("FB-03", "STU10012", "Rohan Deshmukh", "CSE", "Rahul Sharma", "Placement", 2, "Needs intensive resume review and mock aptitude practice. Technical foundation requires reinforcement.", "2026-10-01"),
            ("FB-04", "STU10024", "Kabir Srivastava", "AI & DS", "Priya Mehta", "Communication", 5, "Exemplary technical articulation and team presentation skills demonstrated during campus hackathon prep.", "2026-09-30"),
            ("FB-05", "STU10001", "Kritika Agarwal", "BBA", "Neha Gupta", "Overall", 5, "Outstanding academic rigor and classroom contribution. Recommended for university honor society.", "2026-09-28")
        ]
        cursor.executemany("INSERT INTO feedbacks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", initial_feedbacks)

    # Check if mock_interviews table is empty
    cursor.execute("SELECT COUNT(*) FROM mock_interviews")
    if cursor.fetchone()[0] == 0:
        initial_interviews = [
            ("MI-001", "STU10004", "Ankit Malhotra", "ECE", "Amit Kumar", "M003", "Technical Coding", "2026-10-15", "10:30 AM", "Scheduled", "Focus on digital electronics principles, C embedded pointer arithmetic, and algorithmic aptitude.", "2026-10-05"),
            ("MI-002", "STU10012", "Rohan Deshmukh", "CSE", "Rahul Sharma", "M001", "Placement Readiness", "2026-10-18", "02:00 PM", "Scheduled", "Full mock interview with corporate behavioral round and system architecture problem solving.", "2026-10-04"),
            ("MI-003", "STU10008", "Kabir Srivastava", "AI & DS", "Priya Mehta", "M002", "Behavioral & HR", "2026-10-20", "11:00 AM", "Scheduled", "HR fitment, situation-behavior-impact communication answers, and leadership role case studies.", "2026-10-03")
        ]
        cursor.executemany("INSERT INTO mock_interviews VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", initial_interviews)

    conn.commit()
