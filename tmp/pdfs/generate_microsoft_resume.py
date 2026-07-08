from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "output/pdf/Rizwan_Ahamed_Microsoft_Software_Engineering_Intern_Resume.pdf"
ACCENT = colors.HexColor("#1F4E79")
ACCENT_LIGHT = colors.HexColor("#6B9BC3")
CHARCOAL = colors.HexColor("#222222")


def style_sheet():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Name",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=19,
            leading=21,
            alignment=TA_CENTER,
            textColor=ACCENT,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Headline",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.4,
            leading=10.8,
            alignment=TA_CENTER,
            textColor=CHARCOAL,
            spaceAfter=1.5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Contact",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.8,
            leading=10.2,
            alignment=TA_CENTER,
            textColor=CHARCOAL,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.8,
            leading=12,
            spaceBefore=4,
            spaceAfter=1,
            textTransform="uppercase",
            textColor=ACCENT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.2,
            alignment=TA_LEFT,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyBold",
            parent=styles["Body"],
            fontName="Helvetica-Bold",
        )
    )
    styles.add(
        ParagraphStyle(
            name="ResumeItalic",
            parent=styles["Body"],
            fontName="Helvetica-Oblique",
        )
    )
    styles.add(
        ParagraphStyle(
            name="Date",
            parent=styles["Body"],
            fontName="Helvetica-Bold",
            alignment=TA_RIGHT,
            textColor=CHARCOAL,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ResumeBullet",
            parent=styles["Body"],
            leftIndent=11,
            firstLineIndent=-6,
            bulletIndent=0,
            spaceBefore=0.2,
            spaceAfter=0.2,
        )
    )
    return styles


styles = style_sheet()


def para(text, style="Body"):
    return Paragraph(text, styles[style])


def section(title):
    return [
        Spacer(1, 1.8),
        para(title, "Section"),
        HRFlowable(width="100%", thickness=0.9, color=ACCENT_LIGHT, spaceBefore=0, spaceAfter=3),
    ]


def row_title(left, right):
    table = Table(
        [[para(left, "BodyBold"), para(right, "Date")]],
        colWidths=[5.55 * inch, 1.35 * inch],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        ),
    )
    table.hAlign = "LEFT"
    return table


def bullet(text):
    return Paragraph(text, styles["ResumeBullet"], bulletText="-")


story = []
story.append(para("RIZWAN AHAMED H", "Name"))
story.append(para("Software Engineering Intern | Computer Science Undergraduate", "Headline"))
story.append(
    para(
        "+91 7708959715 | rizwanahamed2726@gmail.com | Palani, Tamil Nadu, India",
        "Contact",
    )
)
story.append(
    para(
        "linkedin.com/in/rizwan-ahamed-7b236832a | github.com/RizwanAhamed13 | leetcode.com/u/Rizwan13",
        "Contact",
    )
)

story.extend(section("Summary"))
story.append(
    para(
        "Software Engineering Intern candidate and Computer Science undergraduate currently pursuing a Bachelor of Engineering "
        "(CGPA 8.4/10, expected 05/2028) with one year of object-oriented programming experience in Java, Python, C++, and "
        "JavaScript. Strong foundation in data structures, algorithms, software design, testing, distributed systems, and product "
        "quality. Built production software used by real users, translating stakeholder and user requirements into reliable, "
        "observable, efficient, and scalable technical solutions.",
        "Body",
    )
)

story.extend(section("Education"))
story.append(row_title("Dr. Mahalingam College of Engineering and Technology, Pollachi", "08/2024 - 05/2028"))
story.append(para("<i>B.E. Computer Science and Engineering | CGPA: 8.4/10.0 | Currently pursuing Bachelor's degree</i>", "Body"))
story.append(
    bullet(
        "Relevant Coursework: Data Structures and Algorithms, Object-Oriented Programming, Operating Systems, Computer Networks, "
        "Database Management Systems, Probability and Statistics"
    )
)
story.append(bullet("Programming practice: Solved 100+ LeetCode problems across arrays, strings, trees, graphs, and dynamic programming"))
story.append(row_title("Akshaya Academy CBSE School - TAAC, Palani", "Graduated 05/2024"))
story.append(bullet("HSC (Class XII): 83% | SSLC (Class X): 91%"))

story.extend(section("Technical Skills"))
skills = [
    ("Languages", "Java, Python, C, C++, JavaScript, SQL"),
    ("CS Fundamentals", "Data Structures, Algorithms, Object-Oriented Programming, Software Design, Problem Solving, Concurrency"),
    ("Backend and APIs", "Spring Boot, FastAPI, REST APIs, Distributed Systems, Networking, RBAC, JWT"),
        ("Databases/DevOps", "MySQL, PostgreSQL, SQLite, MongoDB, Docker, Jenkins, Nginx, Linux, Git"),
        ("Quality/Ops", "Testing, Monitoring, Observability, Reliability, Availability, Performance, Security, Code Review"),
    ("AI/ML", "Machine Learning, Ollama, LangChain, Sentence Transformers, Prompt Engineering"),
]
skill_rows = [[para(f"<b>{k}:</b>", "Body"), para(v, "Body")] for k, v in skills]
skill_table = Table(
        skill_rows,
        colWidths=[1.45 * inch, 5.45 * inch],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, -1), 8),
                ("RIGHTPADDING", (1, 0), (1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        ),
)
skill_table.hAlign = "LEFT"
story.append(skill_table)

story.extend(section("Projects"))
projects = [
    (
        "Quad - Self-Hosted Campus Developer Platform",
        "01/2025 - Present",
        "Python, FastAPI, Docker, SQLite, Nginx, Ollama",
        [
            "Architected a distributed systems stack handling 150+ concurrent projects on 16GB RAM; auto-detects stacks from project manifests, generates multi-stage Dockerfiles, and schedules containers with scale-to-zero for availability, reliability, efficiency, and performance.",
            "Implemented reverse-tunnel networking, per-project HTTPS, environment secrets, rollback, build log capture, rate limiting, synchronization, and path-traversal hardening; maintained 220+ unit, integration, and security tests.",
            "Learned and adopted local LLM methods with Ollama to support on-premise codebase Q and A, faculty submission analysis, and code health scoring while reducing SaaS dependency risk.",
        ],
    ),
    (
        "SACL PMS - Production Quality Control System",
        "08/2024 - 01/2025",
        "Java, Spring Boot, MySQL, Docker, RBAC",
        [
            "Designed, developed, tested, and deployed a live production software system for Sakthi Auto Components Ltd. automotive OEM servers, replacing paper QC registers across 4 inspection workflows.",
            "Worked from operator, quality approver, and admin user requirements to build 3-role RBAC, JWT authentication, approval state machine, audit trails, and reliable data capture for product quality operations.",
        ],
    ),
    (
        "SafeDeploy - Pre-Deployment Simulation Platform",
        "01/2025 - 02/2025",
        "Java, Docker, Jenkins, Linux",
        [
            "Built a pre-deployment simulation tool for CPU, memory, and I/O constraints to improve software testing, debugging, and reliability before production release.",
            "Used monitoring and debugging to identify a Java heap memory leak that could have caused production downtime, then applied feedback to improve technical solution quality.",
        ],
    ),
]
for title, dates, tech, bullets in projects:
    parts = [row_title(title, dates), para(f"<i>{tech}</i>", "Body")]
    parts.extend(bullet(x) for x in bullets)
    story.append(KeepTogether(parts))

story.extend(section("Experience"))
experience = [
    (
        "Executive Member - Technical Staff | Student Research Club (SRC), Dr. MCET",
        "01/2025 - Present",
        [
            "Sole developer of src.drmcet.ac.in; build the live website, internal tools, and lab server operations for a 500+ member technical community.",
            "Collaborate with students, faculty, and technical teammates to prioritize features, review requirements, and ship reliable internal software.",
        ],
    ),
    (
        "Vice President and Technical Lead | Ignite Association, Dr. MCET",
        "08/2024 - 01/2025",
        [
            "Led technical execution for a 1,200+ member association, coordinating event infrastructure, registrations, and cross-department stakeholder needs.",
            "Drove 40%+ growth in participation by improving scalable event software, communication workflows, and accountability across the team.",
        ],
    ),
]
for title, dates, bullets in experience:
    parts = [row_title(title, dates)]
    parts.extend(bullet(x) for x in bullets)
    story.append(KeepTogether(parts))

story.extend(section("Additional Strengths"))
story.append(
    para(
        "Growth mindset, collaboration, accountability, creative engineering, time management, technical guidance, feedback-driven iteration, and cooperative team delivery.",
        "Body",
    )
)


doc = BaseDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=0.42 * inch,
    rightMargin=0.42 * inch,
    topMargin=0.38 * inch,
    bottomMargin=0.35 * inch,
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="resume", frames=[frame])])
doc.build(story)
print(OUTPUT)
