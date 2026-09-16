import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document(output_path):
    doc = Document()

    # Set Page Margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Base Colors
    NAVY = RGBColor(15, 23, 42)      # #0F172A
    BLUE = RGBColor(37, 99, 235)     # #2563EB
    SLATE = RGBColor(71, 85, 105)    # #475569
    DARK_GRAY = RGBColor(51, 65, 85) # #334155

    # Document Header Title Box
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = title_p.add_run("STUDENT MONITORING SYSTEM\n")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(14)
    run_sub.font.bold = True
    run_sub.font.color.rgb = BLUE

    run_title = title_p.add_run("Comprehensive Problem Statement & System Architecture Analysis")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    doc.add_paragraph() # Spacer

    # Metadata Table
    table_meta = doc.add_table(rows=5, cols=2)
    table_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_meta.autofit = False

    meta_data = [
        ("Project Name", "Student Monitoring System (SMS)"),
        ("Document Title", "System Problem Statement, Admin/Faculty/Student Analysis & Architecture"),
        ("Target Scope", "Admin Panel, Faculty Panel, Student Panel"),
        ("Technology Stack", "Django REST Framework (Backend) + React 18 / Vite / Tailwind CSS (Frontend)"),
        ("Status & Date", "Final Specification Document | August 2026"),
    ]

    for i, (label, val) in enumerate(meta_data):
        cell_lbl, cell_val = table_meta.rows[i].cells
        cell_lbl.width = Inches(2.0)
        cell_val.width = Inches(4.5)

        p_lbl = cell_lbl.paragraphs[0]
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.bold = True
        r_lbl.font.size = Pt(10)
        r_lbl.font.color.rgb = NAVY

        p_val = cell_val.paragraphs[0]
        r_val = p_val.add_run(val)
        r_val.font.size = Pt(10)
        r_val.font.color.rgb = SLATE

        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "F8FAFC")
        set_cell_margins(cell_lbl, top=80, bottom=80, left=120, right=120)
        set_cell_margins(cell_val, top=80, bottom=80, left=120, right=120)

    doc.add_paragraph()

    def add_heading_1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        run = h.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = NAVY
        return h

    def add_heading_2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        run = h.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = BLUE
        return h

    def add_body_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Calibri"
            r_pre.font.size = Pt(11)
            r_pre.font.bold = True
            r_pre.font.color.rgb = NAVY
        r_text = p.add_run(text)
        r_text.font.name = "Calibri"
        r_text.font.size = Pt(11)
        r_text.font.color.rgb = DARK_GRAY
        return p

    def add_bullet_p(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Calibri"
            r_pre.font.size = Pt(11)
            r_pre.font.bold = True
            r_pre.font.color.rgb = NAVY
        r_text = p.add_run(text)
        r_text.font.name = "Calibri"
        r_text.font.size = Pt(11)
        r_text.font.color.rgb = DARK_GRAY
        return p

    # --- 1. EXECUTIVE SUMMARY ---
    add_heading_1("1. Executive Summary")
    add_body_p(
        "Educational institutions encounter major structural challenges in maintaining consistent, real-time visibility into academic performance, classroom participation, and student self-study habits. Traditional academic governance relies heavily on manual paper-based attendance registers, disconnected spreadsheets, and periodic end-of-semester examinations."
    )
    add_body_p(
        "This approach creates an operational disconnect across all three primary institutional stakeholders: Administrators lack central real-time analytics to detect trends early, Faculty Members suffer from administrative paperwork without qualitative evaluation tools, and Students have zero visibility into their continuous performance metrics or home study tracking."
    )
    add_body_p(
        "The Student Monitoring System (SMS) resolves these challenges by establishing a unified, role-tailored digital platform connecting the Admin Panel, Faculty Panel, and Student Panel with automated participation scoring, real-time analytics, and server-side PDF report generation."
    )

    # --- 2. COMPREHENSIVE PROBLEM STATEMENT ---
    add_heading_1("2. Comprehensive Problem Statement")
    add_body_p(
        "In modern higher education, student success depends on continuous engagement both inside and outside the classroom. Modern pedagogy recognizes that attendance alone is an insufficient indicator of learning success. Qualitative engagement indicators—such as active participation in oral discussions, written problem solving, hands-on coding exercises, timely homework submission, and personal study discipline—are crucial determinants of academic performance."
    )

    add_heading_2("A. Admin Panel Perspective (Central Governance & Oversight)")
    add_bullet_p(" Department heads and campus directors cannot view ongoing lectures, active class attendance rates, or department-level attendance trends in real time.", "Lack of Real-Time Institutional Visibility:")
    add_bullet_p(" Without automated performance algorithms and leaderboards (Top Performers vs. Needs Improvement alerts), administrators only discover academic dropouts after end-of-term exams when remediation is too late.", "Inability to Execute Early Interventions:")
    add_bullet_p(" Generating departmental reports, student performance cards, and historical attendance logs requires tedious manual spreadsheet work without automated PDF document generation capabilities.", "Administrative Overhead & Manual Reporting:")

    add_heading_2("B. Faculty Panel Perspective (Classroom Execution & Interactive Assessment)")
    add_bullet_p(" Marking attendance manually on paper or in standalone files consumes 10–15 minutes of instructional time every lecture.", "Time-Consuming & Error-Prone Processes:")
    add_bullet_p(" Standard platforms record attendance only as a binary state (Present/Absent). Faculty members have no structured digital mechanism to evaluate qualitative student engagement—such as oral responses, written problem-solving, coding exercise completion, and homework adherence.", "Binary Evaluation Limitations:")
    add_bullet_p(" Faculty members cannot objectively evaluate qualitative behavioral attributes—such as confidence, communication, subject understanding, and classroom conduct—on a repeatable digital scale.", "Lack of Standardized Soft-Skill Ratings:")

    add_heading_2("C. Student Panel Perspective (Self-Monitoring & Home Study Accountability)")
    add_bullet_p(" Students lack continuous transparent feedback regarding their classroom participation scores, cumulative attendance percentages, and overall rank.", "Opacity of Academic Standing:")
    add_bullet_p(" Learning outside the classroom (daily study hours, homework execution, topic revision) is untracked. Without a digital Daily Study Diary with parent/guardian signature verification, home study remains unverified and inconsistent.", "Unmonitored Home Study Habits:")
    add_bullet_p(" Students cannot track how daily contributions (oral/written/coding answers) directly improve their academic trajectory, dampening motivation.", "Lack of Motivation & Progress Tracking:")

    # --- 3. PROJECT DESCRIPTION & ARCHITECTURE ---
    add_heading_1("3. Project Description & System Architecture")
    add_body_p(
        "The Student Monitoring System (SMS) bridges these gaps by establishing a synchronized digital ecosystem connecting the Admin Panel, Faculty Panel, and Student Panel via a decoupled web framework:"
    )
    add_bullet_p(" Built with Django 6.0 and Django REST Framework (DRF), utilizing SQLite, SimpleJWT token authentication, and ReportLab for automated PDF report generation.", "Backend Architecture:")
    add_bullet_p(" Developed with React 18, Vite, and Tailwind CSS, utilizing Lucide React for UI icons, React Router DOM v6 for nested routing, and Recharts / Chart.js for analytics charts.", "Frontend Architecture:")

    # --- 4. CORE TECHNICAL FEATURES ACROSS PANELS ---
    add_heading_1("4. Core Technical Features Across Panels")

    table_feat = doc.add_table(rows=6, cols=3)
    table_feat.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_feat.autofit = False

    headers = ["Panel / Component", "Technical Implementation", "Impact / Value Deliverable"]
    for j, h_text in enumerate(headers):
        cell = table_feat.rows[0].cells[j]
        p = cell.paragraphs[0]
        r = p.add_run(h_text)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)

    feat_data = [
        ("Admin: Analytics Center", "Departmental attendance pie/bar charts, trend lines, and central stats.", "Real-time institutional oversight across all departments."),
        ("Admin: Performance Alerts", "Django ORM aggregations isolating top 5 and bottom 5 scoring students.", "Enables immediate tutoring intervention prior to mid-term exams."),
        ("Faculty: Live Classroom", "Real-time evaluation matrix (Oral, Written, Coding, Homework + Soft Skills).", "Reduces evaluation time from 15 minutes to under 2 minutes."),
        ("Faculty: PDF Export", "ReportLab backend compiling formatted lecture summaries & report cards.", "Eliminates manual report generation completely."),
        ("Student: Daily Study Diary", "Log home study hours, topics, homework, and parent signature status.", "Establishes home study discipline and parent accountability."),
    ]

    for i, (col1, col2, col3) in enumerate(feat_data, start=1):
        row_cells = table_feat.rows[i].cells
        for j, text in enumerate([col1, col2, col3]):
            cell = row_cells[j]
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_GRAY
            bg = "F8FAFC" if i % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

    doc.add_paragraph()

    # --- 5. PARTICIPATION SCORING ALGORITHM ---
    add_heading_1("5. Multi-Factor Participation Scoring Algorithm")
    add_body_p(
        "The system replaces binary attendance with an automated scoring algorithm executed during every LectureStudentActivity save() call. Maximum total score per lecture is up to 110 points:"
    )
    add_bullet_p(" Awarded for class presence.", "Present Attendance (+10 pts):")
    add_bullet_p(" Awarded for active oral discussion participation.", "Oral Answer (+20 pts):")
    add_bullet_p(" Awarded for correct written problem solving.", "Written Answer (+20 pts):")
    add_bullet_p(" Awarded for completing hands-on coding exercises.", "Coding Answer (+25 pts):")
    add_bullet_p(" Awarded for submitting pre-assigned homework.", "Homework Completed (+15 pts):")
    add_bullet_p(" Ratings for Confidence (0-5), Communication (0-5), Understanding (0-5), and Behaviour (0-5).", "Behavioral & Soft Skills (+20 pts max):")

    # --- 6. CONCLUSION ---
    add_heading_1("6. Conclusion")
    add_body_p(
        "By addressing the specific pain points of Administrators, Faculty Members, and Students, the Student Monitoring System transforms institutional academic tracking from a reactive, paper-heavy chore into a proactive, data-driven, and highly transparent digital ecosystem."
    )

    doc.save(output_path)
    print(f"Successfully generated Word Document at: {output_path}")

if __name__ == "__main__":
    import sys
    out_path = sys.argv[1] if len(sys.argv) > 1 else "Student_Monitoring_System_Problem_Statement.docx"
    create_document(out_path)
