import pandas as pd
import json
import ast
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'public', 'data')

students_csv_path = os.path.join(DATA_DIR, 'student_dashboard_data_final.csv')
mentors_csv_path = os.path.join(DATA_DIR, 'mentors_final.csv')

def parse_list_col(val):
    if pd.isna(val) or val is None:
        return []
    s = str(val).strip()
    if not s or s == '[]':
        return []
    try:
        res = ast.literal_eval(s)
        if isinstance(res, list):
            return [str(x).strip() for x in res if str(x).strip()]
        return [str(res).strip()]
    except Exception:
        # fallback manual clean
        cleaned = s.strip("[]").replace("'", "").replace('"', "")
        return [x.strip() for x in cleaned.split(',') if x.strip()]

print("Loading student dataset...")
df_students = pd.read_csv(students_csv_path)

print("Loading mentor dataset...")
df_mentors = pd.read_csv(mentors_csv_path)

# Fill nulls appropriately
df_students['activity_type'] = df_students['activity_type'].fillna('None')
df_students['leadership_role'] = df_students['leadership_role'].fillna('None')
df_students['mentor_match_reason'] = df_students['mentor_match_reason'].fillna('None')

# Process list fields
df_students['risk_factors_list'] = df_students['risk_factors'].apply(parse_list_col)
df_students['recommendations_list'] = df_students['recommendations'].apply(parse_list_col)

# Prepare clean mentor data
# In mentors_final.csv:
# mentor_id, mentor_name, department, expertise, max_students, current_students, available_slots
mentors_list = []
# Calculate live assignment count from student records
mentor_student_counts = df_students[df_students['mentor_name'] != 'Not Required']['mentor_id'].value_counts().to_dict()

for _, row in df_mentors.iterrows():
    m_id = str(row['mentor_id']).strip()
    max_s = int(row['max_students'])
    # actual students assigned in dataset with this mentor id
    assigned_count = mentor_student_counts.get(m_id, int(row['current_students']))
    avail = max(0, max_s - assigned_count)
    util = round((assigned_count / max_s) * 100, 1) if max_s > 0 else 0
    
    mentors_list.append({
        'mentor_id': m_id,
        'mentor_name': str(row['mentor_name']).strip(),
        'department': str(row['department']).strip(),
        'expertise': [e.strip() for e in str(row['expertise']).split('|') if e.strip()],
        'expertise_raw': str(row['expertise']).strip(),
        'max_students': max_s,
        'current_students': assigned_count,
        'available_slots': avail,
        'utilization_percent': util
    })

# Write mentors.json
with open(os.path.join(DATA_DIR, 'mentors.json'), 'w', encoding='utf-8') as f:
    json.dump(mentors_list, f, indent=2)

print(f"Exported {len(mentors_list)} mentors to mentors.json")

# Prepare clean students data
students_records = []
for _, row in df_students.iterrows():
    rf_list = row['risk_factors_list']
    rec_list = row['recommendations_list']
    main_rf = rf_list[0] if len(rf_list) > 0 else "None identified"
    
    # default intervention status
    pred_risk = str(row['predicted_risk_level']).strip()
    if pred_risk == 'High':
        status = 'In Progress' if row['mentor_name'] not in ['Not Required', 'No mentor available'] else 'Assigned'
    elif pred_risk == 'Medium':
        status = 'Assigned'
    else:
        status = 'Completed'
        
    students_records.append({
        'student_id': str(row['student_id']),
        'name': str(row['name']),
        'email': str(row['email']),
        'department': str(row['department']),
        'gender': str(row['gender']),
        'city': str(row['city']),
        'admission_year': int(row['admission_year']) if pd.notna(row['admission_year']) else 2024,
        'attendance_percent': round(float(row['attendance_percent']), 2),
        'marks': round(float(row['marks']), 2) if pd.notna(row['marks']) else 0,
        'average_score': round(float(row['average_score']), 2) if pd.notna(row['average_score']) else 0,
        'total_assignments': int(row['total_assignments']) if pd.notna(row['total_assignments']) else 0,
        'submitted': int(row['submitted']) if pd.notna(row['submitted']) else 0,
        'assignment_completion_rate': round(float(row['assignment_completion_rate']), 2),
        'activities_joined': int(row['activities_joined']) if pd.notna(row['activities_joined']) else 0,
        'activity_type': str(row['activity_type']),
        'events_attended': int(row['events_attended']) if pd.notna(row['events_attended']) else 0,
        'leadership_role': str(row['leadership_role']),
        'books_borrowed': int(row['books_borrowed']) if pd.notna(row['books_borrowed']) else 0,
        'books_returned': int(row['books_returned']) if pd.notna(row['books_returned']) else 0,
        'student_satisfaction': round(float(row['student_satisfaction']), 2),
        'faculty_feedback': round(float(row['faculty_feedback']), 2),
        'academic_support_need': str(row['academic_support_need']),
        'career_support_need': str(row['career_support_need']),
        'technical_skill': round(float(row['technical_skill']), 2),
        'communication_skill': round(float(row['communication_skill']), 2),
        'problem_solving': round(float(row['problem_solving']), 2),
        'teamwork': round(float(row['teamwork']), 2),
        'leadership': round(float(row['leadership']), 2),
        'aptitude_score': round(float(row['aptitude_score']), 2),
        'coding_score': round(float(row['coding_score']), 2),
        'placement_communication_score': round(float(row['placement_communication_score']), 2),
        'mock_interview_score': round(float(row['mock_interview_score']), 2),
        'placement_readiness': round(float(row['placement_readiness']), 2),
        'academic_score': round(float(row['academic_score']), 2) if pd.notna(row['academic_score']) else round(float(row['average_score']), 2),
        'skill_score': round(float(row['skill_score']), 2),
        'placement_score': round(float(row['placement_score']), 2),
        'engagement_score': round(float(row['engagement_score']), 2),
        'feedback_score': round(float(row['feedback_score']), 2),
        'student_success_score': round(float(row['student_success_score']), 2),
        'risk_level': str(row['risk_level']),
        'predicted_risk_level': pred_risk,
        'academic_risk_probability': round(float(row['academic_risk_probability']), 2),
        'placement_risk_probability': round(float(row['placement_risk_probability']), 2),
        'risk_factors': rf_list,
        'main_risk_factor': main_rf,
        'recommendations': rec_list,
        'segment': int(row['segment']) if pd.notna(row['segment']) else 0,
        'segment_name': str(row['segment_name']),
        'mentor_id': str(row['mentor_id']),
        'mentor_name': str(row['mentor_name']),
        'mentor_match_reason': str(row['mentor_match_reason']),
        'intervention_status': status
    })

with open(os.path.join(DATA_DIR, 'students.json'), 'w', encoding='utf-8') as f:
    json.dump(students_records, f, indent=2)

print(f"Exported {len(students_records)} students to students.json")
