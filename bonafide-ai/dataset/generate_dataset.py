"""
Student Dataset Generator for AI-Based Bonafide Certificate Generator
=====================================================================

Generates 20,000+ synthetic student records with:
  - Personal data
  - Academic data
  - Coding skill data
  - Technical skill data
  - English communication skills
  - Problem-solving skills
  - Aptitude skills
  - Soft skills
  - Other academic information
  - Bonafide application data
  - ML recommendation & confidence

All data is synthetic. No real personal information is used.

Usage:
    python generate_dataset.py                     # default 20,000
    python generate_dataset.py --count 50000       # 50,000 records
"""

import os
import sys
import json
import random
import argparse
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False
    print("[WARNING] openpyxl not installed. Excel output will be skipped.")
    print("         Install with: pip install openpyxl")

# ──────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────
NUMBER_OF_STUDENTS = 20000
RANDOM_SEED = 42

# ──────────────────────────────────────────────
# DATA POOLS
# ──────────────────────────────────────────────
FIRST_NAMES_MALE = [
    "Arjun", "Ravi", "Kiran", "Rahul", "Aditya", "Vikram", "Sanjay", "Deepak",
    "Manoj", "Suresh", "Anil", "Rajesh", "Vikas", "Amit", "Nitin", "Gaurav",
    "Prakash", "Sachin", "Vivek", "Nikhil", "Rohit", "Ajay", "Rajan", "Tushar",
    "Pranav", "Karan", "Jatin", "Mohit", "Aakash", "Harsh", "Darshan", "Yash",
    "Kunal", "Aryan", "Nishant", "Tarun", "Ankur", "Dev", "Ishaan", "Shubham",
    "Ashish", "Sumit", "Rajan", "Pankaj", "Mukesh", "Dinesh", "Arun", "Krishna",
    "Vinod", "Vishal", "Ramesh", "Jogesh", "Prashant", "Satish", "Ashok", "Kishore",
    "Bharat", "Rakesh", "Manish", "Himanshu", "Chetan", "Ganesh", "Tanmay", "Akash",
]

FIRST_NAMES_FEMALE = [
    "Priya", "Ananya", "Sneha", "Divya", "Kavita", "Pooja", "Neha", "Shweta",
    "Manisha", "Rekha", "Sunita", "Geeta", "Anita", "Meena", "Ritu", "Simran",
    "Tanvi", "Payal", "Sakshi", "Richa", "Pallavi", "Nisha", "Mamta", "Komal",
    "Deepika", "Alka", "Aarti", "Rani", "Seema", "Ashwini", "Prachi", "Varsha",
    "Mitali", "Trisha", "Nandini", "Aishwarya", "Kritika", "Shruti", "Monika", "Chhaya",
    "Usha", "Jyoti", "Kiran", "Bharti", "Madhuri", "Saroj", "Veena", "Uma",
    "Lata", "Indira", "Archana", "Suman", "Preeti", "Sadhana", "Neelam", "Vandana",
    "Sonia", "Lakshmi", "Parul", "Juhi", "Rupal", "Hetal", "Bina", "Nutan",
]

LAST_NAMES = [
    "Kumar", "Singh", "Sharma", "Verma", "Gupta", "Das", "Reddy", "Patel",
    "Nair", "Menon", "Iyer", "Mishra", "Pandey", "Tiwari", "Chowdhury", "Banerjee",
    "Mukherjee", "Joshi", "Mehta", "Shah", "Rao", "Kapoor", "Malhotra", "Chauhan",
    "Bhat", "Kulkarni", "Desai", "Naik", "Jain", "Agarwal", "Sinha", "Bose",
    "Sen", "Ghosh", "Pal", "Dey", "Mondal", "Sarkar", "Haldar", "Kaur",
    "Gill", "Khanna", "Saxena", "Bhatt", "Thakur", "Chandra", "Prasad", "Tandon",
    "Mittal", "Goel", "Sethi", "Kohli", "Arora", "Sood", "Bali", "Chopra",
    "Nagpal", "Bhatia", "Ahluwalia", "Bajaj", "Goyal", "Mahajan", "Suri", "Dutta",
]

DEPARTMENTS = [
    "Computer Applications", "Computer Science", "Information Technology",
    "Electronics and Communication", "Electrical Engineering", "Mechanical Engineering",
    "Civil Engineering", "Data Science", "Artificial Intelligence",
]

COURSES = {
    "Computer Applications": ["MCA", "BCA"],
    "Computer Science": ["B.Tech CSE", "M.Tech CSE", "B.Sc CS"],
    "Information Technology": ["B.Tech IT", "M.Tech IT"],
    "Electronics and Communication": ["B.Tech ECE", "M.Tech ECE"],
    "Electrical Engineering": ["B.Tech EE", "M.Tech EE"],
    "Mechanical Engineering": ["B.Tech ME", "M.Tech ME"],
    "Civil Engineering": ["B.Tech CE", "M.Tech CE"],
    "Data Science": ["B.Tech DS", "M.Sc Data Science"],
    "Artificial Intelligence": ["B.Tech AI", "M.Tech AI"],
}

PROGRAMMING_LANGUAGES = ["C", "C++", "Java", "Python", "JavaScript", "SQL", "HTML/CSS", "React", "Node.js"]

TECHNICAL_SKILLS = [
    "Web Development", "Database", "Machine Learning", "Data Science",
    "Cloud Computing", "Networking", "Cybersecurity", "Mobile Development",
]

APPLICATION_PURPOSES = [
    "Scholarship", "Bank Account", "Education Loan", "Internship",
    "Passport", "Travel", "Government Application", "Higher Studies", "Other",
]

FEE_STATUSES = ["Paid", "Pending"]
ACADEMIC_STATUSES = ["Excellent", "Good", "Average", "Poor"]
CODING_SKILLS = ["Beginner", "Intermediate", "Advanced", "Expert"]
TECHNICAL_SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]
ENGLISH_LEVELS = ["Poor", "Average", "Good", "Excellent"]
PROBLEM_SOLVING_LEVELS = ["Poor", "Average", "Good", "Excellent"]
APTITUDE_LEVELS = ["Poor", "Average", "Good", "Excellent"]
PREV_APP_STATUSES = ["No Application", "Approved", "Rejected"]
DISCIPLINARY_STATUSES = ["Clear", "Warning"]
SCHOLARSHIP_STATUSES = ["Yes", "No"]
APPLICATION_STATUSES = ["Pending", "Approved", "Rejected"]


# ──────────────────────────────────────────────
# HELPER FUNCTIONS
# ──────────────────────────────────────────────
def _clamp(val, lo, hi):
    return max(lo, min(hi, val))


def _score_to_level(score, thresholds=(40, 60, 80)):
    """Map a 0-100 score to a level string."""
    if score >= thresholds[2]:
        return "Excellent"
    elif score >= thresholds[1]:
        return "Good"
    elif score >= thresholds[0]:
        return "Average"
    else:
        return "Poor"


def _generate_name(gender):
    first = random.choice(FIRST_NAMES_MALE if gender == "Male" else FIRST_NAMES_FEMALE)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def _generate_email(name, idx):
    clean = name.lower().replace(" ", ".")
    domains = ["student.edu", "university.ac.in", "college.edu", "campus.edu"]
    return f"{clean}{idx}@{random.choice(domains)}"


def _generate_mobile():
    prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "89", "88", "87", "86", "85", "80", "79", "78", "77", "76", "75", "74", "73", "72", "70", "63", "62", "60"]
    return f"{random.choice(prefixes)}{random.randint(10000000, 99999999)}"


def _generate_register_number(dept, idx, year):
    dept_codes = {
        "Computer Applications": "MCA",
        "Computer Science": "CSE",
        "Information Technology": "ITE",
        "Electronics and Communication": "ECE",
        "Electrical Engineering": "EEE",
        "Mechanical Engineering": "MEC",
        "Civil Engineering": "CVE",
        "Data Science": "DSC",
        "Artificial Intelligence": "AIC",
    }
    code = dept_codes.get(dept, "GEN")
    yr = str(year)[-2:]  # last 2 digits of admission year
    return f"{code}{yr}{idx + 1:05d}"


# ──────────────────────────────────────────────
# MAIN GENERATOR
# ──────────────────────────────────────────────
def generate_dataset(num_records=NUMBER_OF_STUDENTS, seed=RANDOM_SEED):
    random.seed(seed)
    np.random.seed(seed)

    print(f"\n{'='*60}")
    print(f"  STUDENT DATASET GENERATOR")
    print(f"  Generating {num_records:,} synthetic records...")
    print(f"{'='*60}\n")

    records = []

    # Pre-generate batch arrays for performance
    dept_indices = np.random.randint(0, len(DEPARTMENTS), size=num_records)
    attendance_raw = np.clip(np.random.normal(loc=75, scale=14, size=num_records), 15, 100).round(1)
    cgpa_raw = np.clip(np.random.normal(loc=7.2, scale=1.5, size=num_records), 2.0, 10.0).round(2)
    internal_marks_raw = np.clip(np.random.normal(loc=68, scale=16, size=num_records), 5, 100).round(0).astype(int)
    assignment_score_raw = np.clip(np.random.normal(loc=72, scale=15, size=num_records), 10, 100).round(0).astype(int)
    backlog_raw = np.random.poisson(lam=0.8, size=num_records)
    backlog_raw = np.clip(backlog_raw, 0, 8)
    prev_bonafide_raw = np.random.poisson(lam=1.2, size=num_records)
    prev_bonafide_raw = np.clip(prev_bonafide_raw, 0, 10)

    gender_choices = np.random.choice(["Male", "Female"], size=num_records, p=[0.55, 0.45]).tolist()

    fee_status_raw = np.random.choice(FEE_STATUSES, size=num_records, p=[0.80, 0.20]).tolist()
    prev_app_raw = np.random.choice(PREV_APP_STATUSES, size=num_records, p=[0.70, 0.18, 0.12]).tolist()
    disciplinary_raw = np.random.choice(DISCIPLINARY_STATUSES, size=num_records, p=[0.92, 0.08]).tolist()
    scholarship_raw = np.random.choice(SCHOLARSHIP_STATUSES, size=num_records, p=[0.35, 0.65]).tolist()
    purpose_raw = np.random.choice(APPLICATION_PURPOSES, size=num_records).tolist()

    # Date range for applications
    start_date = datetime(2025, 1, 1)
    date_range_days = 600

    # Correlated generation: higher-performing students get higher scores in skills
    # Use CGPA + attendance as base "performance factor"
    performance_factor = (cgpa_raw / 10.0 * 0.5 + attendance_raw / 100.0 * 0.5)  # 0..1

    # Coding skill scores correlated with performance
    coding_score_base = performance_factor * 70 + np.random.normal(15, 12, num_records)
    coding_score_raw = np.clip(coding_score_base, 0, 100).round(0).astype(int)

    # Technical skill scores correlated with performance
    tech_score_base = performance_factor * 65 + np.random.normal(18, 14, num_records)
    tech_score_raw = np.clip(tech_score_base, 0, 100).round(0).astype(int)

    # English scores correlated with performance
    speaking_base = performance_factor * 60 + np.random.normal(20, 13, num_records)
    listening_base = performance_factor * 62 + np.random.normal(19, 12, num_records)
    reading_base = performance_factor * 64 + np.random.normal(18, 11, num_records)
    writing_base = performance_factor * 58 + np.random.normal(22, 14, num_records)
    speaking_raw = np.clip(speaking_base, 0, 100).round(0).astype(int)
    listening_raw = np.clip(listening_base, 0, 100).round(0).astype(int)
    reading_raw = np.clip(reading_base, 0, 100).round(0).astype(int)
    writing_raw = np.clip(writing_base, 0, 100).round(0).astype(int)
    overall_english_raw = ((speaking_raw + listening_raw + reading_raw + writing_raw) / 4).round(0).astype(int)

    # Problem-solving scores
    ps_base = performance_factor * 62 + np.random.normal(19, 15, num_records)
    ps_score_raw = np.clip(ps_base, 0, 100).round(0).astype(int)

    # Aptitude scores
    apt_base = performance_factor * 58 + np.random.normal(22, 16, num_records)
    apt_score_raw = np.clip(apt_base, 0, 100).round(0).astype(int)

    # Soft skill scores (7 individual)
    comm_score_raw = np.clip(performance_factor * 55 + np.random.normal(25, 12, num_records), 0, 100).round(0).astype(int)
    team_score_raw = np.clip(performance_factor * 52 + np.random.normal(28, 13, num_records), 0, 100).round(0).astype(int)
    lead_score_raw = np.clip(performance_factor * 48 + np.random.normal(30, 15, num_records), 0, 100).round(0).astype(int)
    time_score_raw = np.clip(performance_factor * 50 + np.random.normal(28, 14, num_records), 0, 100).round(0).astype(int)
    adapt_score_raw = np.clip(performance_factor * 53 + np.random.normal(26, 13, num_records), 0, 100).round(0).astype(int)
    present_score_raw = np.clip(performance_factor * 49 + np.random.normal(29, 15, num_records), 0, 100).round(0).astype(int)
    creative_score_raw = np.clip(performance_factor * 47 + np.random.normal(31, 16, num_records), 0, 100).round(0).astype(int)
    overall_soft_raw = ((comm_score_raw + team_score_raw + lead_score_raw + time_score_raw + adapt_score_raw + present_score_raw + creative_score_raw) / 7).round(0).astype(int)

    # Semester result: derived from attendance + CGPA
    semester_result_raw = []
    for i in range(num_records):
        att = attendance_raw[i]
        cg = cgpa_raw[i]
        if att >= 50 and cg >= 4.0 and backlog_raw[i] <= 4:
            semester_result_raw.append("Pass")
        else:
            semester_result_raw.append("Fail")

    # ML recommendation with realistic patterns + noise
    # Base score + feature contributions + noise = ml_score
    # Threshold at 0 => ~55-60% approval rate
    ml_scores = np.zeros(num_records)
    for i in range(num_records):
        s = 0.0
        att = attendance_raw[i]
        cg = cgpa_raw[i]
        fee = fee_status_raw[i]
        disc = disciplinary_raw[i]
        prev = prev_app_raw[i]
        bl = backlog_raw[i]
        cs = coding_score_raw[i]
        eng = overall_english_raw[i]
        sm = semester_result_raw[i]

        # Base score (gives most students a head start)
        s += 5.0

        # Attendance (range: -10 to +12)
        if att >= 85:
            s += 12
        elif att >= 75:
            s += 8
        elif att >= 60:
            s += 3
        else:
            s -= 10

        # CGPA (range: -8 to +10)
        if cg >= 8.5:
            s += 10
        elif cg >= 7.0:
            s += 6
        elif cg >= 5.5:
            s += 2
        else:
            s -= 8

        # Fee status (range: -8 to +8)
        if fee == "Paid":
            s += 8
        else:
            s -= 8

        # Disciplinary (range: -12 to +6)
        if disc == "Clear":
            s += 6
        else:
            s -= 12

        # Backlogs (range: -8 to +4)
        if bl == 0:
            s += 4
        elif bl <= 2:
            s += 1
        else:
            s -= bl * 2

        # Semester result (range: -5 to +5)
        if sm == "Pass":
            s += 5
        else:
            s -= 5

        # Previous application (range: -4 to +3)
        if prev == "Approved":
            s += 3
        elif prev == "Rejected":
            s -= 4

        # Coding score (range: 0 to +6)
        if cs >= 75:
            s += 6
        elif cs >= 50:
            s += 3
        elif cs >= 30:
            s += 1

        # English score (range: 0 to +4)
        if eng >= 70:
            s += 4
        elif eng >= 50:
            s += 2

        # Add realistic noise (prevents simple rule-based separation)
        noise = np.random.normal(0, 6)
        ml_scores[i] = s + noise

    # Threshold chosen to give ~55-60% approval (realistic distribution)
    ml_recommendations = np.where(ml_scores >= 36, "Approved", "Rejected")

    # ML confidence: sigmoid-based mapping of score to 0-100 range
    ml_confidence_raw = 100 / (1 + np.exp(-0.12 * (ml_scores - 36)))
    ml_confidence_raw = np.clip(ml_confidence_raw + np.random.normal(0, 3, num_records), 20, 99).round(1)

    print("[1/5] Generating personal & academic records...")

    for i in range(num_records):
        dept = DEPARTMENTS[dept_indices[i]]
        course = random.choice(COURSES[dept])
        gender = gender_choices[i]
        name = _generate_name(gender)

        # Year and semester derived from course
        max_year = 4 if "B." in course or "BCA" in course else 2
        year = random.randint(1, max_year)
        semester = min(year * 2 - random.choice([0, 1]), max_year * 2)
        semester = max(1, semester)

        # Age: typical student age
        base_age = 18 if year == 1 else 18 + (year - 1) * 2
        age = _clamp(base_age + random.randint(-1, 1), 17, 30)

        record = {
            # 1. Personal
            "student_id": f"STU{i + 1:05d}",
            "student_name": name,
            "register_number": _generate_register_number(dept, i, year + 2024),
            "age": age,
            "gender": gender,
            "department": dept,
            "course": course,
            "year": year,
            "semester": semester,
            "email": _generate_email(name, i + 1),
            "mobile_number": _generate_mobile(),

            # 2. Academic
            "attendance_percentage": attendance_raw[i],
            "cgpa": cgpa_raw[i],
            "academic_status": _score_to_level(cgpa_raw[i], (5.5, 7.0, 8.5)),
            "internal_marks": int(internal_marks_raw[i]),
            "assignment_score": int(assignment_score_raw[i]),
            "semester_result": semester_result_raw[i],
            "backlog_count": int(backlog_raw[i]),

            # 3. Coding
            "coding_skill": _score_to_level(coding_score_raw[i]),
            "programming_languages": "|".join(random.sample(PROGRAMMING_LANGUAGES, k=random.randint(1, 5))),
            "coding_score": int(coding_score_raw[i]),

            # 4. Technical
            "technical_skill_level": _score_to_level(tech_score_raw[i]),
            "technical_skills": "|".join(random.sample(TECHNICAL_SKILLS, k=random.randint(1, 4))),
            "technical_skill_score": int(tech_score_raw[i]),

            # 5. English
            "english_communication_level": _score_to_level(overall_english_raw[i]),
            "speaking_score": int(speaking_raw[i]),
            "listening_score": int(listening_raw[i]),
            "reading_score": int(reading_raw[i]),
            "writing_score": int(writing_raw[i]),
            "overall_english_score": int(overall_english_raw[i]),

            # 6. Problem-solving
            "problem_solving_level": _score_to_level(ps_score_raw[i]),
            "problem_solving_score": int(ps_score_raw[i]),

            # 7. Aptitude
            "aptitude_level": _score_to_level(apt_score_raw[i]),
            "aptitude_score": int(apt_score_raw[i]),

            # 8. Soft skills
            "communication_score": int(comm_score_raw[i]),
            "teamwork_score": int(team_score_raw[i]),
            "leadership_score": int(lead_score_raw[i]),
            "time_management_score": int(time_score_raw[i]),
            "adaptability_score": int(adapt_score_raw[i]),
            "presentation_score": int(present_score_raw[i]),
            "creativity_score": int(creative_score_raw[i]),
            "overall_soft_skill_score": int(overall_soft_raw[i]),

            # 9. Other academic
            "fee_status": fee_status_raw[i],
            "previous_bonafide_count": int(prev_bonafide_raw[i]),
            "previous_application_status": prev_app_raw[i],
            "disciplinary_status": disciplinary_raw[i],
            "scholarship_status": scholarship_raw[i],

            # 10. Application
            "application_purpose": purpose_raw[i],
            "application_date": (start_date + timedelta(days=random.randint(0, date_range_days))).strftime("%Y-%m-%d"),
            "application_status": random.choice(APPLICATION_STATUSES),

            # 11. ML
            "ml_recommendation": ml_recommendations[i],
            "ml_confidence": ml_confidence_raw[i],
        }

        records.append(record)

    df = pd.DataFrame(records)

    print(f"[2/5] Validating dataset...")
    _validate_dataset(df, num_records)

    return df


# ──────────────────────────────────────────────
# VALIDATION
# ──────────────────────────────────────────────
def _validate_dataset(df, expected_count):
    total = len(df)
    cols = len(df.columns)
    missing = int(df.isnull().sum().sum())
    dup_ids = int(df["student_id"].duplicated().sum())
    dup_regs = int(df["register_number"].duplicated().sum())

    bad_cgpa = int(((df["cgpa"] < 0) | (df["cgpa"] > 10)).sum())
    bad_att = int(((df["attendance_percentage"] < 0) | (df["attendance_percentage"] > 100)).sum())
    bad_score = int(((df["coding_score"] < 0) | (df["coding_score"] > 100)).sum())
    bad_sem = int(((df["semester"] < 1) | (df["semester"] > 12)).sum())
    bad_age = int(((df["age"] < 15) | (df["age"] > 35)).sum())

    print(f"\n{'='*60}")
    print(f"  VALIDATION REPORT")
    print(f"{'='*60}")
    print(f"  Records:             {total:,}")
    print(f"  Columns:             {cols}")
    print(f"  Missing Values:      {missing}")
    print(f"  Duplicate IDs:       {dup_ids}")
    print(f"  Duplicate RegNos:    {dup_regs}")
    print(f"  Invalid CGPA:        {bad_cgpa}")
    print(f"  Invalid Attendance:  {bad_att}")
    print(f"  Invalid Scores:      {bad_score}")
    print(f"  Invalid Semester:    {bad_sem}")
    print(f"  Invalid Age:         {bad_age}")
    print(f"{'='*60}")

    if total != expected_count:
        print(f"  [WARN] Expected {expected_count:,} but got {total:,}")
    if missing > 0:
        print(f"  [WARN] {missing} missing values found")
    if dup_ids > 0:
        print(f"  [WARN] {dup_ids} duplicate student IDs found")
    if dup_regs > 0:
        print(f"  [WARN] {dup_regs} duplicate register numbers found")

    issues = missing + dup_ids + dup_regs + bad_cgpa + bad_att + bad_score + bad_sem + bad_age
    if issues == 0:
        print(f"  [OK] All validations passed!")
    else:
        print(f"  [WARN] {issues} total issues found")
    print(f"{'='*60}\n")


# ──────────────────────────────────────────────
# SAVE CSV
# ──────────────────────────────────────────────
def save_csv(df, path):
    df.to_csv(path, index=False)
    print(f"  CSV saved:  {path}")


# ──────────────────────────────────────────────
# SAVE JSON
# ──────────────────────────────────────────────
def save_json(df, path):
    records = df.to_dict(orient="records")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"  JSON saved: {path}")


# ──────────────────────────────────────────────
# SAVE EXCEL
# ──────────────────────────────────────────────
def save_excel(df, path):
    if not HAS_OPENPYXL:
        print("  [SKIP] openpyxl not available, skipping Excel.")
        return

    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        # Sheet 1: Dataset
        df.to_excel(writer, sheet_name="Student Dataset", index=False)

        # Sheet 2: Summary
        summary = _build_summary(df)
        summary_df = pd.DataFrame(list(summary.items()), columns=["Metric", "Value"])
        summary_df.to_excel(writer, sheet_name="Dataset Summary", index=False)

        # Sheet 3: Feature Description
        feature_desc = _get_feature_descriptions()
        feat_df = pd.DataFrame(
            [(k, v) for k, v in feature_desc.items()],
            columns=["Column Name", "Description"]
        )
        feat_df.to_excel(writer, sheet_name="Feature Description", index=False)

    print(f"  Excel saved: {path}")


# ──────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────
def _build_summary(df):
    male_count = int((df["gender"] == "Male").sum())
    female_count = int((df["gender"] == "Female").sum())
    dept_count = df["department"].nunique()
    approved = int((df["application_status"] == "Approved").sum())
    rejected = int((df["application_status"] == "Rejected").sum())
    pending = int((df["application_status"] == "Pending").sum())
    ml_approved = int((df["ml_recommendation"] == "Approved").sum())
    ml_rejected = int((df["ml_recommendation"] == "Rejected").sum())

    return {
        "Total Students": f"{len(df):,}",
        "Male Count": f"{male_count:,}",
        "Female Count": f"{female_count:,}",
        "Departments": dept_count,
        "Average Attendance": f"{df['attendance_percentage'].mean():.1f}",
        "Average CGPA": f"{df['cgpa'].mean():.2f}",
        "Average Coding Score": f"{df['coding_score'].mean():.1f}",
        "Average English Score": f"{df['overall_english_score'].mean():.1f}",
        "Average Technical Score": f"{df['technical_skill_score'].mean():.1f}",
        "Average Problem-Solving Score": f"{df['problem_solving_score'].mean():.1f}",
        "Average Aptitude Score": f"{df['aptitude_score'].mean():.1f}",
        "Average Soft Skill Score": f"{df['overall_soft_skill_score'].mean():.1f}",
        "Approved Applications": f"{approved:,}",
        "Rejected Applications": f"{rejected:,}",
        "Pending Applications": f"{pending:,}",
        "ML Recommended Approved": f"{ml_approved:,}",
        "ML Recommended Rejected": f"{ml_rejected:,}",
    }


def save_summary_xlsx(df, path):
    if not HAS_OPENPYXL:
        return
    summary = _build_summary(df)
    summary_df = pd.DataFrame(list(summary.items()), columns=["Metric", "Value"])
    summary_df.to_excel(path, index=False, sheet_name="Dataset Summary")
    print(f"  Summary XLSX saved: {path}")


# ──────────────────────────────────────────────
# FEATURE DESCRIPTIONS
# ──────────────────────────────────────────────
def _get_feature_descriptions():
    return {
        "student_id": "Unique student identifier (e.g., STU00001)",
        "student_name": "Synthetic student full name",
        "register_number": "Synthetic register/enrollment number",
        "age": "Student age (17-30)",
        "gender": "Male or Female",
        "department": "Academic department",
        "course": "Programme/course enrolled",
        "year": "Year of study",
        "semester": "Current semester",
        "email": "Synthetic email address",
        "mobile_number": "Synthetic 10-digit mobile number",
        "attendance_percentage": "Attendance percentage (0-100)",
        "cgpa": "Cumulative GPA (0.0-10.0)",
        "academic_status": "Excellent / Good / Average / Poor based on CGPA",
        "internal_marks": "Internal assessment marks (0-100)",
        "assignment_score": "Assignment score (0-100)",
        "semester_result": "Pass or Fail",
        "backlog_count": "Number of backlogs (0-8)",
        "coding_skill": "Coding proficiency level",
        "programming_languages": "Known languages (pipe-separated)",
        "coding_score": "Coding score (0-100)",
        "technical_skill_level": "Technical skill level",
        "technical_skills": "Known technical areas (pipe-separated)",
        "technical_skill_score": "Technical skill score (0-100)",
        "english_communication_level": "English proficiency level",
        "speaking_score": "English speaking score (0-100)",
        "listening_score": "English listening score (0-100)",
        "reading_score": "English reading score (0-100)",
        "writing_score": "English writing score (0-100)",
        "overall_english_score": "Overall English score (0-100)",
        "problem_solving_level": "Problem-solving proficiency level",
        "problem_solving_score": "Problem-solving score (0-100)",
        "aptitude_level": "Aptitude proficiency level",
        "aptitude_score": "Aptitude score (0-100)",
        "communication_score": "Soft skill: Communication (0-100)",
        "teamwork_score": "Soft skill: Teamwork (0-100)",
        "leadership_score": "Soft skill: Leadership (0-100)",
        "time_management_score": "Soft skill: Time Management (0-100)",
        "adaptability_score": "Soft skill: Adaptability (0-100)",
        "presentation_score": "Soft skill: Presentation (0-100)",
        "creativity_score": "Soft skill: Creativity (0-100)",
        "overall_soft_skill_score": "Average of all soft skill scores (0-100)",
        "fee_status": "Paid or Pending",
        "previous_bonafide_count": "Number of previously issued bonafides (0-10)",
        "previous_application_status": "No Application / Approved / Rejected",
        "disciplinary_status": "Clear or Warning",
        "scholarship_status": "Yes or No",
        "application_purpose": "Purpose of bonafide application",
        "application_date": "Date of application (YYYY-MM-DD)",
        "application_status": "Pending / Approved / Rejected",
        "ml_recommendation": "ML model recommendation: Approved or Rejected",
        "ml_confidence": "ML confidence score (0-100)",
    }


def save_feature_description_xlsx(path):
    if not HAS_OPENPYXL:
        return
    feature_desc = _get_feature_descriptions()
    feat_df = pd.DataFrame(
        [(k, v) for k, v in feature_desc.items()],
        columns=["Column Name", "Description"]
    )
    feat_df.to_excel(path, index=False, sheet_name="Feature Description")
    print(f"  Feature Description XLSX saved: {path}")


# ──────────────────────────────────────────────
# ML-READY DATASET
# ──────────────────────────────────────────────
def save_ml_dataset(df, path):
    """Encode categorical variables and normalize for Keras training."""
    from sklearn.preprocessing import LabelEncoder, StandardScaler

    ml_df = df.copy()

    # Drop non-ML columns
    drop_cols = [
        "student_id", "student_name", "register_number", "email", "mobile_number",
        "application_date", "programming_languages", "technical_skills",
    ]
    ml_df = ml_df.drop(columns=[c for c in drop_cols if c in ml_df.columns], errors="ignore")

    # Encode target
    le_target = LabelEncoder()
    ml_df["ml_recommendation"] = le_target.fit_transform(ml_df["ml_recommendation"])

    # Encode categorical columns
    cat_cols = ml_df.select_dtypes(include=["object", "string"]).columns.tolist()
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        ml_df[col] = le.fit_transform(ml_df[col].astype(str))
        encoders[col] = le

    # Separate features and target
    X = ml_df.drop(columns=["ml_recommendation"]).values
    y = ml_df["ml_recommendation"].values
    feature_names = [c for c in ml_df.columns if c != "ml_recommendation"]

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Reconstruct DataFrame
    ml_ready = pd.DataFrame(X_scaled, columns=feature_names)
    ml_ready["ml_recommendation"] = y

    ml_ready.to_csv(path, index=False)
    print(f"  ML dataset saved: {path}")
    print(f"    Features: {len(feature_names)}, Samples: {len(y)}")
    approved_count = int((y == 0).sum())
    rejected_count = int((y == 1).sum())
    print(f"    Class distribution: Approved={approved_count:,} ({approved_count/len(y)*100:.1f}%), Rejected={rejected_count:,} ({rejected_count/len(y)*100:.1f}%)")


# ──────────────────────────────────────────────
# PRINT SAMPLE
# ──────────────────────────────────────────────
def print_sample(df):
    print(f"\n{'='*60}")
    print(f"  SAMPLE RECORD (STU00001)")
    print(f"{'='*60}")
    row = df.iloc[0]
    for col in df.columns:
        print(f"  {col}: {row[col]}")
    print(f"{'='*60}\n")


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate synthetic student dataset")
    parser.add_argument("--count", type=int, default=NUMBER_OF_STUDENTS,
                        help="Number of student records (default: 20000)")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED,
                        help="Random seed (default: 42)")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Generate
    df = generate_dataset(num_records=args.count, seed=args.seed)

    # Print sample
    print_sample(df)

    # Save all outputs
    print("[3/5] Saving output files...")

    csv_path = os.path.join(script_dir, "student_dataset.csv")
    json_path = os.path.join(script_dir, "student_dataset.json")
    xlsx_path = os.path.join(script_dir, "student_dataset.xlsx")
    ml_csv_path = os.path.join(script_dir, "ml_training_dataset.csv")
    feat_xlsx_path = os.path.join(script_dir, "feature_description.xlsx")
    summary_xlsx_path = os.path.join(script_dir, "dataset_summary.xlsx")

    save_csv(df, csv_path)
    save_json(df, json_path)
    save_excel(df, xlsx_path)

    print("\n[4/5] Generating ML-ready dataset...")
    save_ml_dataset(df, ml_csv_path)

    print("\n[5/5] Saving supplementary files...")
    save_feature_description_xlsx(feat_xlsx_path)
    save_summary_xlsx(df, summary_xlsx_path)

    # Final report
    print(f"\n{'='*60}")
    print(f"  DATASET GENERATION COMPLETED")
    print(f"{'='*60}")
    print(f"  Records:  {len(df):,}")
    print(f"  Columns:  {len(df.columns)}")
    print(f"  Files generated:")
    print(f"    - student_dataset.csv")
    print(f"    - student_dataset.xlsx")
    print(f"    - student_dataset.json")
    print(f"    - ml_training_dataset.csv")
    print(f"    - feature_description.xlsx")
    print(f"    - dataset_summary.xlsx")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
