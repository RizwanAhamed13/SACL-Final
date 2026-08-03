# Sakthi Autos Quality Management System - Comprehensive Workflow & UI Documentation

This document provides a 100% complete, granular, and exhaustive breakdown of every workflow, use case, user interface element, form field, and actionable button within the Sakthi Autos (SACL) Quality Management System frontend.

---

## 1. Authentication & System Navigation

### 1.1 Login Module (`Login.jsx`)
- **Workflow**: The entry point to the system. Users authenticate and receive a JWT token, which determines their `role` and specific `formPermissions`.
- **Form Fields**: 
  - `Username / Employee ID` (Text Input)
  - `Password` (Password Input)
- **Buttons / Actions**:
  - `Sign In` Button: Submits the form. On success, redirects to `/`. On failure, shows an error toast ("Invalid credentials").

### 1.2 Main Layout & Sidebar (`MainLayout.jsx`)
- **Workflow**: Wraps all authenticated routes, supplying a responsive sidebar and top header. It uses the `hasAccess` helper to conditionally render navigation links based on user roles and form permissions. Admin/HOD roles bypass form-specific checks.
- **Buttons / Actions**:
  - `Sidebar Toggle` (Hamburger icon): Toggles the sidebar visibility (slide-out on mobile, collapse on desktop).
  - `Navigation Links`:
    - `Dashboard` (Always visible)
    - `QC Register` (Requires `QC_REGISTER` permission or Admin/HOD role)
    - `Micro Structure` (Requires `MICRO_STRUCTURE` permission or Admin/HOD role)
    - `Tensile Test` (Requires `TENSILE_TEST` permission or Admin/HOD role)
    - `Impact Test` (Requires `IMPACT_TEST` permission or Admin/HOD role)
    - `Part Names` (Admin/HOD only)
    - `User Management` (Admin/HOD only)
    - `Logging & Reports` (Admin/HOD only)
    - `Employee Efficiency` (Admin/HOD only)
    - `Performance Feedback` (Admin/HOD only)
  - `Sign Out` Button: Clears local storage context, revokes the user session, and navigates to `/login`.

### 1.3 Dashboard (`Dashboard.jsx`)
- **Workflow**: The central hub displaying statistical aggregates, recent activities, the approval pipeline status, and quick access cards.
- **Data Sections**:
  - `Welcome Banner`: Shows user name, role, current date, and total records count.
  - `Stat Cards`: Shows total record counts for QC Register, Micro Structure, Tensile Test, and Impact Test.
  - `Approval Pipeline`: A visual progress bar detailing how many total records are pending `QC_ENTRY` (Pending HOF), `HOF_APPROVED` (Awaiting HOD), and `HOD_APPROVED` (Fully Approved).
  - `Recent Activity`: A list of the latest 8 records submitted across all modules, sorted chronologically, showing part name, module type, date, and current status.
  - `System Info Bar`: Displays the app version (2.0.0) and standard compliance (IATF 16949:2016).
- **Buttons / Actions**:
  - Clicking any `Stat Card` or `Quick Access Card` routes the user directly to the respective list/form page for that module.

---

## 2. Administration Modules (ADMIN / HOD Only)

### 2.1 Part Names Master (`PartNames.jsx`)
- **Workflow**: The foundational configuration module where the master quality standards (thresholds) and location combinations for every physical part are defined. All data entry forms rely on this data for real-time validation.
- **Use Case**: When a new part is introduced to the foundry, an Admin defines its minimum/maximum threshold values for composition, mechanical properties, and specifies which locations (e.g., TRA, SBA) need to be tested for micro/tensile analysis.
- **Form Fields (Add/Edit Modal)**:
  - `Part Name` (Text input, e.g., "Housing")
  - **Locations**:
    - `Micro Locations` (Text input, comma-separated, e.g., "TRA, SBA")
    - `Mech Locations` (Text input, comma-separated, e.g., "TRA, SBA")
  - **Threshold Parameters (Min/Max inputs for all)**:
    - Composition: C%, Si%, Mn%, P%, S%, Mg(First/Last), Cu%, Cr%, Sn%.
    - Pouring Temp, Tapping Time, Tapping Wt, Mg(kgs), Rec Mg%.
    - Micro Structure: Nodularity %, Count, Ferrite %, Pearlite %, Carbide %, Size.
    - Mechanical Properties: Tensile Strength, Yield Strength, Elongation %.
- **Buttons / Actions**:
  - `Search` Input: Filters the list of displayed parts by name.
  - `Add New Part` Button: Opens the creation modal.
  - `Edit` (Row-level action): Opens the edit modal populated with the specific part's data.
  - `Delete` (Row-level action): Opens a confirmation modal. If confirmed, deletes the part.
  - `Save Part Name` Button (Inside modal): Submits and validates the part configuration to the backend.
  - `Cancel` Button (Inside modal): Closes the form without saving.

### 2.2 User Management (`UserManagement.jsx`)
- **Workflow**: Manages system authentication credentials, applies granular Role-Based Access Control (RBAC), and provides a critical "Global Record Search & Edit" tool for correcting finalized data.
- **Use Case 1 (User Creation)**: Admin creates an employee account, setting their role to `ROLE_QC`, and ticking checkboxes to only allow access to "QC Register" and "Impact Test".
- **Use Case 2 (Global Record Edit)**: An HOD discovers a typo on an already-approved record. Using the "Global Record Search", they search for the record by Part Name/Date Code/Heat Code, edit the specific details directly, and save, overriding standard workflow locks.
- **Form Fields (User Form)**:
  - `Full Name`, `Username`, `Employee ID`, `Email` (Text inputs).
  - `Password` (Password input - required on creation, optional on edit).
  - `Role` (Dropdown: Admin (HOD), Head of Factory (HOF), Employee (QC Engineer)).
  - `Status` (Dropdown: Active / Inactive) - Visible on Edit only.
  - `Form Access Permissions` (Checkboxes: QC Register, Micro Structure, Tensile Test, Impact Test) - Hidden if role is Admin.
- **Buttons / Actions (User Management)**:
  - `Add User` Button: Opens the user creation form.
  - `Edit` / `Delete` Action Buttons (Row-level) for managing users.
  - `Save User` / `Cancel` Buttons in the user form.
- **Form Fields (Global Record Search & Edit)**:
  - **Search Inputs**: `Part Name` (Select dropdown), `Date Code`, `Heat Code`.
  - **Edit Modal Inputs**: `Part Name` (Select dropdown), `Date Code`, `Heat Code / No`, `Status` (Dropdown: QC_ENTRY, HOF_APPROVED, HOD_APPROVED).
- **Buttons / Actions (Global Record Search)**:
  - `Search` Button: Fetches records matching the criteria across *all* module tables.
  - `Edit` Button (Row-level on search results): Opens the Global Record Edit Modal.
  - `Save Changes` / `Cancel` (Inside Edit Modal): Submits the override update to the backend database.

---

## 3. Data Entry & Quality Control Workflows

### 3.1 Standard Approval Workflow (Applies to all Data Entry forms)
The system enforces a strict 3-tier status progression:
1. **`QC_ENTRY`**: Initial submission by an Employee/QC Engineer. Real-time form validation compares inputted numerical values against the Part Name's Min/Max thresholds. Any out-of-bounds fields are highlighted with a red border and the form cannot be saved until corrected.
2. **`HOF_APPROVED`**: A Head of Factory logs in, reviews `QC_ENTRY` records. They can click `Approve` to transition the record to `HOF_APPROVED`, or `Reject` (prompting for remarks) to transition it to `REJECTED`.
3. **`HOD_APPROVED`**: An Admin/HOD logs in, reviews `HOF_APPROVED` records, and clicks `Approve` to finalize the record as `HOD_APPROVED`.
*Note: Admins and HOFs have a `Approve All Pending` button for bulk approvals.*

### 3.2 QC Register (`QcRegister.jsx`)
- **Workflow**: Logs primary daily heat composition, process parameters, tapping, and additions.
- **Form Fields**: 
  - `Date`, `Part Name`, `Heat Code`, `Date Code`, `Disa`, `Qty (Moulds)`.
  - **Metal Composition**: `C%`, `Si%`, `Mn%`, `P%`, `S%`, `Mg(First/Last)%`, `Cu%`, `Cr%`, `Sn%`.
  - **Process Parameters**: `Time of Pouring (Start/End)`, `Pouring Temp (Start/End)`, `PP Code`, `Treatment No`, `FC No / Heat No`, `Con No`.
  - **Tapping & Additions**: `Tapping Time`, `Tapping Wt (Kgs)`.
  - **Corrective Additions**: `C`, `Si`, `Mn`, `S`, `Cr`, `Cu`, `Sn`.
  - **Alloy Additions**: `Mg (Kgs)`, `Res Mg %`, `Rec Mg %`, `Stream Innoculant`, `P.Time(Sec) Start/End`.
  - `Remarks`.
- **Buttons / Actions**:
  - `New QC Register Entry` Button: Toggles the large data entry form.
  - `Save QC Register` Button: Validates thresholds and saves. Disabled if errors exist.
  - `Clear` Button: Clears the entire form.
  - **List View Actions**:
    - `Search`: Filters by Date, Part Name, Heat No.
    - `Approve` (Row-level): For HOF/HOD to advance workflow.
    - `Reject` (Row-level): Opens modal for HOF/HOD to type rejection reason.
    - `Approve All Pending`: Opens bulk approval modal for all visible pending items.

### 3.3 Micro Structure Analysis (`MicroStructure.jsx`)
- **Workflow**: Logs Nodularity and Matrix analysis data. Uses **Multi-Location Batch Entry**.
- **Use Case**: The QC Engineer selects a Part Name (e.g., "Bracket"). The system detects the part requires testing at two locations ("TRA" and "SBA") based on master configuration. The UI dynamically generates two stacked form cards. Filling out and saving will generate two distinct database records simultaneously.
- **Form Fields**:
  - `Inspection Date`, `Part Name`, `Heat Code`, `Date Code`, `Disa`.
  - **Location-Specific Arrays** (one set per location):
    - `Nodularity %`, `Graphite Type`.
    - `Count Min/Max` (Nos/mm²).
    - `Ferrite Min/Max %`, `Pearlite Min/Max %`, `Carbide Min/Max %`.
    - `Size Min/Max`.
    - `Remarks`.
- **Buttons / Actions**:
  - `New Analysis` Button: Toggles the form.
  - `Save Micro Structure`: Submits the batch data.
  - Standard Search, Row-level Approve/Reject, and Bulk Approve All Pending.

### 3.4 Tensile Test (`MicroTensile.jsx`)
- **Workflow**: Logs Mechanical Properties. Also uses **Multi-Location Batch Entry** based on `mechLocations`.
- **Form Fields**:
  - `Date of Inspection`, `Part Name` (Item), `Heat Code`, `Date Code`, `Disa`.
  - **Location-Specific Arrays**:
    - Specimen Dimensions: `Bar Dia (mm)`, `Gauge Length (mm)`.
    - Loads: `Max Load (kN)`, `Yield Load (kN)`.
    - Properties: `Tensile Strength`, `Yield Strength 0.2%`, `Yield Strength 0.5%`, `Elongation %`.
    - `Remarks`.
- **Buttons / Actions**:
  - `New Test` Button, `Save Tensile Test` Button.
  - Standard Search, Row-level Approve/Reject, and Bulk Approve All Pending.

### 3.5 Impact Test (`ImpactTest.jsx`)
- **Workflow**: Logs Charpy impact strength. Also uses **Multi-Location Batch Entry** based on `mechLocations`, and supports both U-Notch and V-Notch simultaneously for each location.
- **Form Fields**:
  - `Date of Inspection`, `Part Name`, `Date Code`, `Disa`.
  - **Location-Specific Arrays (Sub-divided by Notch Type: U-Notch / V-Notch)**:
    - For each Notch Type: `Value 1`, `Value 2`, `Value 3` (Joules).
    - `Remarks`.
- **Buttons / Actions**:
  - `New Test` Button, `Save Impact Test` Button.
  - Standard Search, Row-level Approve/Reject, and Bulk Approve All Pending.

---

## 4. Reporting & Analytics (Admin / HOD)

### 4.1 Logging & Reports (`Reports.jsx`)
- **Workflow**: The central data retrieval, extraction, and reporting engine. Pulls records from all four modules simultaneously based on search criteria and generates styled, multi-sheet Excel files.
- **Use Case**: An auditor requests all records for Date Code "6D08". The Admin inputs "6D08" and clicks Search. The system pulls QC, Micro, Tensile, and Impact data into four table views. The Admin clicks "Download All" to generate an Excel file with a combined overview sheet plus four dedicated individual sheets.
- **Form Fields (Search Panel)**:
  - `Part Name` (Dropdown selection)
  - `Date Code` (Text input)
  - `Heat Code` (Text input)
- **Buttons / Actions**:
  - `Search` Button: Executes the query and populates the data tables.
  - `Download All` Button: Generates and downloads a `.xlsx` workbook containing all data (Combined + Individual sheets).
  - `Download Excel` Buttons (Per Table Section): Generates a `.xlsx` workbook containing *only* the specific table's data (e.g., just Impact Test data).

### 4.2 Employee Efficiency (`EmployeeEfficiency.jsx`)
- **Workflow**: Provides management with an overview of QC user activity, measuring throughput (total submissions) vs. accuracy (issue/rejection counts).
- **Use Case**: The HOD wants to see why a particular employee has many rejections. They click on the employee's row in the table, which expands a sub-table detailing the exact date, form type, and rejection remarks left by the reviewing HOF.
- **Data Columns**:
  - `Employee UID`, `Submissions (Total)`, `By Form` (Chips for each form), `HOF Approved`, `HOD Approved`, `Pending`, `Forms w/ Remarks`, `Last Activity`.
- **Buttons / Actions**:
  - `Search by UID or Name` Input: Filters the employee list.
  - `Sort Headers` (Clickable column titles): Sorts the data ascending/descending.
  - `Expand Row` (Clicking an employee row): Opens the **Remarks / Issues Log** sub-table detailing all rejected forms and specific reviewer feedback.

### 4.3 Performance Feedback (`PerformanceFeedback.jsx`)
- **Workflow**: A simple logbook for management to leave qualitative text notes regarding process deviations, employee coaching, or general operational observations.
- **Form Fields**:
  - `Feedback Note` (Multiline Textarea)
- **Buttons / Actions**:
  - `Submit Feedback`: Saves the feedback into the database, automatically tagged with the current user's name and a timestamp.

---
*Generated based on the final React frontend components, routing logic, and Spring Boot backend architecture of the SACL Production branch.*
