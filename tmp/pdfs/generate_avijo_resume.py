from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, HRFlowable, KeepTogether, PageTemplate, Paragraph, Spacer, Table, TableStyle


OUTPUT = "output/pdf/Rizwan_Ahamed_Avijo_MERN_Full_Stack_Intern_Resume.pdf"
ACCENT = colors.HexColor("#1F4E79")
ACCENT_LIGHT = colors.HexColor("#6B9BC3")
CHARCOAL = colors.HexColor("#222222")


def make_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("Name", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=19, leading=21, alignment=TA_CENTER, textColor=ACCENT, spaceAfter=2))
    styles.add(ParagraphStyle("Headline", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.4, leading=10.8, alignment=TA_CENTER, textColor=CHARCOAL, spaceAfter=1.5))
    styles.add(ParagraphStyle("Contact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.8, leading=10.2, alignment=TA_CENTER, textColor=CHARCOAL))
    styles.add(ParagraphStyle("Section", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.8, leading=12, spaceBefore=4, spaceAfter=1, textColor=ACCENT))
    styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=10.2, alignment=TA_LEFT))
    styles.add(ParagraphStyle("BodyBold", parent=styles["Body"], fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Date", parent=styles["Body"], fontName="Helvetica-Bold", alignment=TA_RIGHT, textColor=CHARCOAL))
    styles.add(ParagraphStyle("ResumeBullet", parent=styles["Body"], leftIndent=11, firstLineIndent=-6, bulletIndent=0, spaceBefore=0.2, spaceAfter=0.2))
    return styles


styles = make_styles()


def p(text, style="Body"):
    return Paragraph(text.replace("&", "and"), styles[style])


def section(title):
    return [Spacer(1, 1.8), p(title.upper(), "Section"), HRFlowable(width="100%", thickness=0.9, color=ACCENT_LIGHT, spaceBefore=0, spaceAfter=3)]


def row_title(left, right):
    table = Table([[p(left, "BodyBold"), p(right, "Date")]], colWidths=[5.55 * inch, 1.35 * inch])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    table.hAlign = "LEFT"
    return table


def bullet(text):
    return Paragraph(text.replace("&", "and"), styles["ResumeBullet"], bulletText="-")


story = [
    p("RIZWAN AHAMED H", "Name"),
    p("MERN Full Stack Developer Intern | Computer Science Undergraduate", "Headline"),
    p("+91 7708959715 | rizwanahamed2726@gmail.com | Palani, Tamil Nadu, India", "Contact"),
    p("linkedin.com/in/rizwan-ahamed-7b236832a | github.com/RizwanAhamed13 | leetcode.com/u/Rizwan13", "Contact"),
]

story.extend(section("Summary"))
story.append(p(
    "Computer Science undergraduate currently pursuing B.E. CSE (CGPA 8.4/10, expected 05/2028) with hands-on full-stack web "
    "development experience across JavaScript, React.js, REST APIs, authentication, databases, testing, and deployment. Built live "
    "production software and student-facing platforms used by real users. Strong fit for Avijo's MERN Full Stack Intern role, with "
    "interest in building secure, scalable healthtech modules that improve accessibility and product quality."
))

story.extend(section("Education"))
story.append(row_title("Dr. Mahalingam College of Engineering and Technology, Pollachi", "08/2024 - 05/2028"))
story.append(p("B.E. Computer Science and Engineering | CGPA: 8.4/10.0 | Currently pursuing Bachelor's degree"))
story.append(bullet("Relevant Coursework: Data Structures and Algorithms, Object-Oriented Programming, Operating Systems, Computer Networks, Database Management Systems"))
story.append(bullet("Programming practice: Solved 100+ LeetCode problems across arrays, strings, trees, graphs, and dynamic programming"))
story.append(row_title("Akshaya Academy CBSE School - TAAC, Palani", "Graduated 05/2024"))
story.append(bullet("HSC (Class XII): 83% | SSLC (Class X): 91%"))

story.extend(section("Technical Skills"))
skills = [
    ("MERN/Web", "JavaScript, React.js, Node.js fundamentals, Express.js fundamentals, MongoDB, REST APIs, HTML, CSS"),
    ("Backend/APIs", "Spring Boot, FastAPI, JWT Authentication, RBAC, API Integration, Real-Time Data Flow, Debugging"),
    ("Databases", "MongoDB, MySQL, PostgreSQL, SQLite, SQL, Data Modeling"),
    ("DevOps/Tools", "Docker, Jenkins, Nginx, Linux, Git, Deployment, Build Logs"),
    ("Quality", "Testing, Code Review, Security, Performance Optimization, Reliability, Monitoring"),
    ("Languages", "JavaScript, Java, Python, C, C++, SQL"),
]
skill_rows = [[p(f"<b>{k}:</b>"), p(v)] for k, v in skills]
skill_table = Table(skill_rows, colWidths=[1.35 * inch, 5.55 * inch])
skill_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (0, -1), 8),
    ("RIGHTPADDING", (1, 0), (1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
]))
skill_table.hAlign = "LEFT"
story.append(skill_table)

story.extend(section("Projects"))
projects = [
    (
        "SACL PMS - Production Quality Control System",
        "08/2024 - 01/2025",
        "React.js, JavaScript, Java, Spring Boot, MySQL, Docker, JWT, RBAC",
        [
            "Designed, developed, tested, and deployed a live production web application for Sakthi Auto Components Ltd., replacing paper QC registers across 4 inspection workflows.",
            "Built secure role-based workflows with OPERATOR, QC_APPROVER, and ADMIN access, JWT authentication, approval state machine, audit trails, and reliable data capture.",
            "Collaborated from real user requirements to debug existing workflows, improve usability, and support production-quality operations on automotive OEM servers.",
        ],
    ),
    (
        "Quad - Self-Hosted Campus Developer Platform",
        "01/2025 - Present",
        "Python, FastAPI, Docker, SQLite, Nginx, JavaScript, Ollama",
        [
            "Architected a scalable platform handling 150+ concurrent projects on 16GB RAM with stack detection, generated Dockerfiles, container scheduling, and scale-to-zero behavior.",
            "Implemented REST-style service workflows, reverse-tunnel networking, HTTPS routing, environment secrets, rollback, build log capture, rate limiting, and security hardening.",
            "Integrated local LLM features for codebase Q and A, submission analysis, and code health scoring while maintaining reliability, performance, and low infrastructure cost.",
        ],
    ),
    (
        "SRC Website and Internal Tools",
        "01/2025 - Present",
        "JavaScript, Web Development, Server Operations, Git",
        [
            "Sole developer of src.drmcet.ac.in and related internal tooling for a 500+ member technical community.",
            "Coordinate with students and faculty to prioritize features, maintain web content, manage lab servers, and ship useful product modules quickly.",
        ],
    ),
]
for title, dates, tech, bullets in projects:
    block = [row_title(title, dates), p(f"<i>{tech}</i>")]
    block.extend(bullet(x) for x in bullets)
    story.append(KeepTogether(block))

story.extend(section("Experience"))
experience = [
    (
        "Executive Member - Technical Staff | Student Research Club (SRC), Dr. MCET",
        "01/2025 - Present",
        [
            "Build and maintain the live website, internal tools, and lab server operations while collaborating with technical teammates and faculty stakeholders.",
            "Participate in team discussions, product decisions, debugging, and delivery planning for student-facing technical systems.",
        ],
    ),
    (
        "Vice President and Technical Lead | Ignite Association, Dr. MCET",
        "08/2024 - 01/2025",
        [
            "Led technical execution for a 1,200+ member association, coordinating registrations, event infrastructure, and cross-department requirements.",
            "Improved scalable event workflows and contributed to 40%+ participation growth through reliable digital systems.",
        ],
    ),
]
for title, dates, bullets in experience:
    block = [row_title(title, dates)]
    block.extend(bullet(x) for x in bullets)
    story.append(KeepTogether(block))

story.extend(section("Additional Strengths"))
story.append(p("Fast learner, founder-facing execution, healthcare mission alignment, collaboration, code reviews, accountability, flexible remote work, and product-quality mindset."))


doc = BaseDocTemplate(OUTPUT, pagesize=A4, leftMargin=0.42 * inch, rightMargin=0.42 * inch, topMargin=0.38 * inch, bottomMargin=0.35 * inch)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="resume", frames=[frame])])
doc.build(story)
print(OUTPUT)
