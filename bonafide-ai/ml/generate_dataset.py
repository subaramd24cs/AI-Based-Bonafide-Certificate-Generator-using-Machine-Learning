import pandas as pd
import numpy as np
import os

# Configuration variable - can be easily modified to 10000, 20000, 50000, 100000
NUMBER_OF_RECORDS = 20000
RANDOM_SEED = 42

def generate_dataset(num_records=NUMBER_OF_RECORDS, output_path="dataset.csv"):
    np.random.seed(RANDOM_SEED)
    print(f"Generating synthetic dataset with {num_records} records...")

    # Data choices
    departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
    courses = ['MCA', 'B.Tech', 'M.Tech', 'B.Sc', 'M.Sc']
    purposes = ['Scholarship', 'Bank', 'Education Loan', 'Internship', 'Passport', 'Travel', 'Government Application', 'Other']
    fee_statuses = ['Paid', 'Pending']
    academic_statuses = ['Good', 'Average', 'Poor']
    prev_app_statuses = ['Approved', 'Rejected', 'None']
    disciplinary_statuses = ['Clear', 'Warning']

    # Generating features
    student_ids = [f"STU{i+1:05d}" for i in range(num_records)]
    attendance_percentages = np.clip(np.random.normal(loc=78, scale=12, size=num_records), 40.0, 100.0).round(1)
    cgpa_values = np.clip(np.random.normal(loc=7.4, scale=1.3, size=num_records), 4.0, 10.0).round(2)
    semesters = np.random.randint(1, 7, size=num_records)
    previous_bonafide_counts = np.random.poisson(lam=1.5, size=num_records)
    previous_bonafide_counts = np.clip(previous_bonafide_counts, 0, 10)

    fee_status_list = np.random.choice(fee_statuses, size=num_records, p=[0.82, 0.18])
    prev_app_list = np.random.choice(prev_app_statuses, size=num_records, p=[0.75, 0.15, 0.10])
    disciplinary_list = np.random.choice(disciplinary_statuses, size=num_records, p=[0.91, 0.09])
    purpose_list = np.random.choice(purposes, size=num_records)
    course_list = np.random.choice(courses, size=num_records)
    dept_list = np.random.choice(departments, size=num_records)

    # Derive academic status logically from CGPA
    academic_status_list = []
    for g in cgpa_values:
        if g >= 7.5:
            academic_status_list.append('Good')
        elif g >= 5.5:
            academic_status_list.append('Average')
        else:
            academic_status_list.append('Poor')

    # Generate realistic decision score for approval
    results = []
    for i in range(num_records):
        score = 0.0
        att = attendance_percentages[i]
        cg = cgpa_values[i]
        fee = fee_status_list[i]
        disc = disciplinary_list[i]
        prev_app = prev_app_list[i]

        # Attendance component
        if att >= 75:
            score += 40
        elif att >= 60:
            score += 20
        else:
            score -= 30

        # Fee component
        if fee == 'Paid':
            score += 30
        else:
            score -= 25

        # CGPA component
        if cg >= 7.5:
            score += 20
        elif cg >= 5.5:
            score += 10
        else:
            score -= 10

        # Disciplinary component
        if disc == 'Clear':
            score += 10
        else:
            score -= 35

        # Previous application history
        if prev_app == 'Approved':
            score += 5
        elif prev_app == 'Rejected':
            score -= 10

        # Add small Gaussian noise to prevent simple linear separability
        noise = np.random.normal(0, 8)
        final_score = score + noise

        # Decision threshold
        if final_score >= 50:
            results.append('Approved')
        else:
            results.append('Rejected')

    df = pd.DataFrame({
        'student_id': student_ids,
        'attendance_percentage': attendance_percentages,
        'fee_status': fee_status_list,
        'semester': semesters,
        'cgpa': cgpa_values,
        'academic_status': academic_status_list,
        'previous_bonafide_count': previous_bonafide_counts,
        'application_purpose': purpose_list,
        'previous_application_status': prev_app_list,
        'disciplinary_status': disciplinary_list,
        'course': course_list,
        'department': dept_list,
        'result': results
    })

    # Ensure target output directory exists
    dir_name = os.path.dirname(output_path)
    if dir_name and not os.path.exists(dir_name):
        os.makedirs(dir_name, exist_ok=True)

    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created at {output_path} with shape {df.shape}")
    print("Class Distribution:")
    print(df['result'].value_counts(normalize=True) * 100)
    return df

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(script_dir, "dataset.csv")
    generate_dataset(NUMBER_OF_RECORDS, target_path)
