# 🛡️ Enterprise Software License & Subscription Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **A centralized, 3NF-normalized relational database and full-stack governance platform for enterprise software contracts, user/device seat allocations, automated contract renewals, and compliance auditing.**  
> *Developed as a DBMS Course Project at Woxsen University (School of Technology · CSE - AIML).*

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Database Schema & Invariants](#-database-schema--invariants)
- [SQL Implementation (DDL, DML, Queries)](#-sql-implementation)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Academic Report & Deliverables](#-academic-report--deliverables)
- [Academic Information & Contributors](#-academic-information--contributors)
- [License](#-license)

---

## 📖 Overview

Modern enterprises provision and manage hundreds of SaaS tools and workstation developer licenses across disparate departments. Without unified governance, companies suffer from:
1. **Silent Contract Expirations:** Critical developer tools suddenly lock out engineering teams.
2. **Seat Over-Allocation (Legal Risk):** Provisioning seats beyond purchased licenses leads to severe vendor audit fines and copyright infringement liabilities.
3. **Ghost Subscriptions & Shelfware:** Recurring software charges auto-renew indefinitely for inactive employees, wasting substantial IT budget.
4. **Decentralized Rogue IT:** Departments purchase duplicate licenses at retail rates instead of negotiating enterprise volume tiers.

**LicenseHub** solves these challenges by combining a strict **3NF MySQL schema** enforcing constraints at the database engine level with an interactive **Next.js & React 19** executive dashboard.

---

## ✨ Key Features

- **📊 Executive FinOps Dashboard:** Live burn-rate analytics, seat saturation meters, active vendor distribution, and upcoming contract renewal pipelines.
- **🔒 ACID-Compliant Seat Allocation:** Row-level pessimistic locking (`FOR UPDATE`) prevents concurrent over-allocation race conditions during rapid employee onboarding.
- **🛡️ Hard Database-Level Invariants:**
  - `CHECK (allocated_seats <= total_seats)` prevents over-licensing at the DBMS engine layer.
  - `CHECK (expiry_date >= purchase_date)` eliminates chronologically inverted contracts.
  - `CHECK (renewal_cost > 0)` guarantees financial ledger integrity.
  - `FOREIGN KEY ... ON DELETE CASCADE` ensures clean product-to-license lifecycles without orphan rows.
- **🚨 30-Day Automated Expiration Alerts:** Flags contracts expiring within 7, 15, and 30 days to facilitate proactive procurement negotiations.
- **⚡ Seat Saturation & Shelfware Detection:** Identifies tools operating at $\ge 90\%$ capacity (expansion needed) versus underutilized contracts $< 25\%$ (recommending contract downsize).
- **💼 Departmental Cost Center Accounting:** Aggregates annual software spend by cost center (Core Engineering, Cloud Infra, Product Design, SecOps) for corporate chargeback accounting.
- **🔄 Dual User & Device Asset Binding:** Maps software licenses to both corporate employee accounts and physical workstations (macOS laptops, Linux build hosts, virtual machines).
- **📝 Auditing & Governance Ledger:** Immutable audit trail tracking ISO 27001 and SOC2 compliance checks.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 + React 19                    │
│     Executive Dashboard · Inventory · Seat Allocations      │
└──────────────────────────────┬──────────────────────────────┘
                               │  Server Actions / REST APIs
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Prisma ORM                          │
│     Interactive Transactions · Type-Safe Query Engine       │
└──────────────────────────────┬──────────────────────────────┘
                               │  Connection Pool (mysql2)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MySQL 8.0 Database                      │
│   12 Normalized Tables · B-Tree Indexes · CHECK Constraints │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19**, **Tailwind CSS v4**, **Lucide React** | Glassmorphic design, real-time seat gauges, reactive filters |
| **Backend Framework** | **Next.js 16.4 (App Router)** | Server Actions, API route handlers, SSR, Turbopack |
| **Database ORM** | **Prisma ORM v6.4.1** | Type-safe queries, schema migrations, pooled transactions |
| **Database Engine** | **MySQL 8.0 Enterprise / Community** | 3NF relational storage, ACID compliance, table check invariants |
| **Runtime & Tooling** | **Bun** / **Node.js v22+**, **Prisma Studio** | Ultra-fast execution, live visual database browser |

---

## 🗄️ Database Schema & Invariants

The database models **12 normalized entities** structured in **Third Normal Form (3NF)**:

```
[ vendors ] ──(1:N)──> [ software_products ] ──(1:N)──> [ licenses ]
                             │                                 │
                             ▼                                 ├──(1:1)──> [ subscriptions ]
                       [ purchases ]                           ├──(1:N)──> [ renewal_logs ]
                                                               ├──(1:N)──> [ audit_records ]
                                                               └──(1:N)──> [ license_allocations ]
                                                                                   │
[ departments ] ──(1:N)──> [ users (employees) ] ─────────────────────────────────┤
       │                                                                           │
       └──────────(1:N)──> [ devices (workstations) ] ─────────────────────────────┘
```

### Entities Summary

1. **`vendors`**: Software publishers (JetBrains, Microsoft, Adobe, Atlassian, Figma, Docker, Datadog) with contract tiers (`STRATEGIC`, `PREFERRED`, `STANDARD`).
2. **`software_products`**: Applications catalog categorized by `DEV_TOOLS`, `PRODUCTIVITY`, `DESIGN`, `CLOUD_INFRA`, `SECURITY`.
3. **`license_types`**: Entitlement models (SaaS Named User, Floating Seat, Perpetual with Maintenance, OEM Device Bound, Trial).
4. **`purchases`**: Procurement orders and invoice payment records.
5. **`licenses`**: Core entitlement record tracking license keys, purchased vs allocated seats, validity dates, unit costs, and status.
6. **`subscriptions`**: SaaS recurring billing cycles, payment methods, and automated renewal triggers.
7. **`departments`**: Enterprise cost centers with allocated IT software budgets.
8. **`users`**: Corporate personnel and license recipients.
9. **`devices`**: Physical hardware workstations, laptops, and virtual machines.
10. **`license_allocations`**: Junction table resolving the M:N relationship between employees, devices, and licenses with status tracking (`ACTIVE`, `REVOKED`).
11. **`renewal_logs`**: Verifiable ledger of contract extensions, invoice numbers, and approved expenditures.
12. **`audit_records`**: Governance compliance audits, discrepancy findings, and remediation logs.

---

## 💻 SQL Implementation

The project includes standalone, production-grade `.sql` scripts located in the root and `presentation2/`:

- **`ddl.sql`**: Full schema definition with PKs, cascading FKs, UNIQUE keys, CHECK constraints, and performance B-Tree indexes.
- **`dml.sql`**: Enterprise seed dataset plus **ACID transactions**:
  - *Seat Allocation:* Pessimistic `SELECT ... FOR UPDATE` lock $
ightarrow$ headroom validation $
ightarrow$ `INSERT allocation` $
ightarrow$ `UPDATE licenses allocated_seats + 1` $
ightarrow$ `COMMIT`.
  - *Seat Reclamation:* Soft revoke with timestamp $
ightarrow$ `UPDATE licenses allocated_seats - 1` $
ightarrow$ `COMMIT`.
  - *Annual Renewal:* Log invoice $
ightarrow$ roll forward expiration $
ightarrow$ status normalization $
ightarrow$ `COMMIT`.
- **`queries.sql`**: 10 analytical business queries (30-day expiry alert, seat saturation $\ge 90\%$, department cost allocation, vendor spend concentration, shelfware detection).
- **`license_management_complete.sql`**: Single-command executable master script.

---

## 📁 Project Structure

```
├── web -> presentation3/web              # Symlink for easy terminal navigation
├── presentation1/
│   ├── presentation_part1_slides_1-4.html  # Part 1 Presentation Deck (Slides 1 - 4)
│   └── presentation_part1_slides_1-4.pdf   # High-resolution PDF export
├── presentation2/
│   ├── presentation_part2_slides_5-9.html  # Part 2 Technical Presentation (Slides 5 - 13)
│   ├── presentation_part2_slides_5-13.pdf  # Technical & SQL Presentation PDF
│   ├── ddl.sql                             # Production DDL schema
│   ├── dml.sql                             # Seed data & ACID transactions
│   ├── queries.sql                         # Business & analytical queries
│   └── license_management_complete.sql     # Master all-in-one SQL script
├── presentation3/
│   └── web/                                # Next.js 16 Web Application
│       ├── prisma/
│       │   ├── schema.prisma               # Prisma relational schema
│       │   └── seed.ts                     # Enterprise database seeder
│       ├── src/
│       │   ├── app/                        # Next.js App Router & API routes
│       │   │   ├── api/allocations/        # Seat allocation API endpoints
│       │   │   ├── api/licenses/           # License management API
│       │   │   ├── api/audits/             # Compliance audit endpoints
│       │   │   └── page.tsx                # Main application portal
│       │   ├── components/                 # React 19 UI components
│       │   │   ├── GovernanceDashboard.tsx # Executive FinOps dashboard
│       │   │   ├── LicenseInventoryView.tsx# Software & license catalog
│       │   │   ├── AllocationsManager.tsx  # Employee/device seat manager
│       │   │   ├── ComplianceInspector.tsx # Audit & risk inspector
│       │   │   ├── RenewalsManager.tsx     # Contract renewal tracker
│       │   │   └── VendorsCatalog.tsx      # Supplier directory
│       │   └── lib/prisma.ts               # Prisma client singleton
│       └── package.json
├── Project Report/
│   └── Software_License_Management_Project_Report-2.docx # Academic Report (DOCX) # Comprehensive 15-section project report
├── Software_License_Management_Complete_Presentation.pdf # 13-slide master presentation
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20+ recommended) or **Bun** (v1.1+)
- **MySQL Server** (v8.0+ running locally or in cloud)

### 1. Clone Repository

```bash
git clone https://github.com/Mihirkalway2005/DBMS-COURSE-PROJECT.git
cd DBMS-COURSE-PROJECT
```

### 2. Environment Configuration

Create a `.env` file in `presentation3/web/.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/license_management_db"
```

### 3. Install Dependencies

```bash
cd presentation3/web
bun install
# or: npm install
```

### 4. Push Schema & Seed Database

```bash
bun run prisma:push
bun run prisma:seed
```

### 5. Start Development Server

```bash
bun run dev
# or from root: bun run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 6. Launch Prisma Studio (Database GUI)

```bash
bun run prisma:studio
```

Access the database GUI at **[http://localhost:5555](http://localhost:5555)**.

---

## 📑 Academic Report & Deliverables

- **Academic Project Report:** [`Project Report/Software_License_Management_Project_Report-2.docx`](Project%20Report/Software_License_Management_Project_Report-2.docx)  
  *Complete 15-section academic report formatted per Woxsen University guidelines, including DESC schema tables, normalization analysis, DDL/DML, analytical queries with actual outputs, and system screenshots.*
- **Interactive Slide Decks:**
  - [`presentation1/presentation_part1_slides_1-4.html`](presentation1/presentation_part1_slides_1-4.html) *(Problem statement, personas, entity catalog)*
  - [`presentation2/presentation_part2_slides_5-9.html`](presentation2/presentation_part2_slides_5-9.html) *(Interactive ER Diagram, Relational Schema, DDL/DML, and Live Query Viewer)*
  - [`presentation_complete.html`](presentation_complete.html) *(Master 13-slide unified deck)*
- **Presentation PDFs:**
  - [`Software_License_Management_Complete_Presentation.pdf`](Software_License_Management_Complete_Presentation.pdf) *(13 slides, 1920×1080 resolution)*

---

## 🎓 Academic Information & Contributors

| Detail | Information |
| :--- | :--- |
| **Author / Student** | **Mihir Kalway** |
| **Roll Number** | **25WU0102157** |
| **Course** | **Database Management Systems (DBMS)** |
| **Department** | **School of Technology (SOT)** |
| **Branch & Year** | **B.Tech CSE - AIML (2025–2029)** |
| **Institution** | **Woxsen University**, Hyderabad, Telangana, India |
| **Faculty Guide** | **Dr. Kiran Mayee Adavala** |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) — free for educational and commercial use.
